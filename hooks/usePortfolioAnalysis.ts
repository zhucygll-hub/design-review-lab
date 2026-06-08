'use client'

import { useState, useCallback, useRef } from 'react'
import { AnalysisResult, PortfolioPurpose } from '@/types'
import { parseApiResponse } from '@/lib/api-utils'
import { assessPdfSize, pdfPagesToImages } from '@/lib/pdf-to-images'
import { buildPortfolioProgressSteps } from '@/lib/analysis-progress'

interface PortfolioUploadState {
  file: File | null
  isUploading: boolean
  isWaitingForApi: boolean
  /** Client-side PDF processing phase */
  processingPhase: 'idle' | 'assessing' | 'rendering' | 'done'
  /** Progress message during processing */
  processingMessage: string
  progress: number
  currentDimension: string
  completedDimensions: string[]
  error: string | null
}

/** Timeout for client-side PDF rendering (30s) */
const PDF_PROCESSING_TIMEOUT_MS = 30_000

interface PortfolioTargetInfo {
  purpose: PortfolioPurpose
  company: string
  role: string
  jd: string
  school: string
  major: string
  requirement: string
  goal: string
}

const DEFAULT_TARGET_INFO: PortfolioTargetInfo = {
  purpose: 'unsure',
  company: '',
  role: '',
  jd: '',
  school: '',
  major: '',
  requirement: '',
  goal: '',
}

export function usePortfolioAnalysis() {
  const [upload, setUpload] = useState<PortfolioUploadState>({
    file: null,
    isUploading: false,
    isWaitingForApi: false,
    processingPhase: 'idle',
    processingMessage: '',
    progress: 0,
    currentDimension: '',
    completedDimensions: [],
    error: null,
  })
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const targetInfoRef = useRef<PortfolioTargetInfo>(DEFAULT_TARGET_INFO)
  /** Cached processed images for large PDFs — avoid re-rendering on retry */
  const processedImagesRef = useRef<File[] | null>(null)
  const processedPageInfoRef = useRef<{
    rendered: number
    total: number
    selectedPages: number[]
    strategyNote: string
  } | null>(null)

  const handleFile = useCallback((file: File) => {
    // Check PDF size and show early guidance
    const assessment = file.type === 'application/pdf' ? assessPdfSize(file) : null

    setUpload({
      file,
      isUploading: false,
      isWaitingForApi: false,
      processingPhase: assessment?.action === 'reject' ? 'idle' : 'idle',
      processingMessage: assessment?.reason ?? '',
      progress: 0,
      currentDimension: '',
      completedDimensions: [],
      error: assessment?.action === 'reject' ? assessment.reason : null,
    })
    setResult(null)
    targetInfoRef.current = DEFAULT_TARGET_INFO
    processedImagesRef.current = null
    processedPageInfoRef.current = null
  }, [])

  const setTargetInfo = useCallback((info: PortfolioTargetInfo) => {
    targetInfoRef.current = info
  }, [])

  const startAnalysis = useCallback(async () => {
    if (!upload.file) return

    const file = upload.file
    const isPdf = file.type === 'application/pdf'
    const assessment = isPdf ? assessPdfSize(file) : null

    // Reject files >30MB immediately
    if (assessment?.action === 'reject') {
      setUpload((prev) => ({
        ...prev,
        error: assessment.reason,
      }))
      return
    }

    setUpload((prev) => ({
      ...prev,
      isUploading: true,
      isWaitingForApi: false,
      processingPhase: assessment?.action === 'compress' ? 'assessing' : 'idle',
      processingMessage: '',
      progress: 0,
      currentDimension: '',
      completedDimensions: [],
      error: null,
    }))

    try {
      let formData: FormData
      const targetInfo = targetInfoRef.current
      const portfolioSteps = buildPortfolioProgressSteps(targetInfo.purpose)

      // ── Large PDF: render pages as JPEGs client-side ──
      if (assessment?.action === 'compress') {
        // Reuse cached images if available (from a retry)
        if (processedImagesRef.current && processedPageInfoRef.current) {
          formData = buildImageFormData(
            processedImagesRef.current,
            processedPageInfoRef.current.rendered,
            processedPageInfoRef.current.total,
            processedPageInfoRef.current.selectedPages,
            processedPageInfoRef.current.strategyNote,
            targetInfo
          )
        } else {
          setUpload((prev) => ({
            ...prev,
            processingPhase: 'rendering',
            processingMessage: '正在智能抽样 PDF 代表页…',
          }))

          const maxPages = assessment.maxPages
          let lastProgress = 0

          try {
            const renderResult = await withTimeout(
              pdfPagesToImages(file, {
                maxPages,
                maxWidth: 1200,
                quality: 0.72,
                onProgress: (current, total) => {
                  const pct = Math.round((current / total) * 100)
                  if (pct - lastProgress >= 10) {
                    lastProgress = pct
                    setUpload((prev) => ({
                      ...prev,
                      processingMessage: `正在处理第 ${current}/${total} 张代表页…`,
                      progress: Math.round((current / total) * 15), // first 15% of total
                    }))
                  }
                },
              }),
              PDF_PROCESSING_TIMEOUT_MS
            )
            const pageImages = renderResult.images

            // Convert blobs to File objects for FormData
            const imageFiles = pageImages.map(
              (img) =>
                new File([img.blob], `page-${img.pageNumber}.jpg`, { type: 'image/jpeg' })
            )
            processedImagesRef.current = imageFiles
            processedPageInfoRef.current = {
              rendered: pageImages.length,
              total: renderResult.totalPages,
              selectedPages: renderResult.selectedPages,
              strategyNote: renderResult.strategyNote,
            }

            formData = buildImageFormData(
              imageFiles,
              pageImages.length,
              renderResult.totalPages,
              renderResult.selectedPages,
              renderResult.strategyNote,
              targetInfo
            )
          } catch (err) {
            const msg =
              err instanceof Error && err.message === 'PDF processing timed out'
                ? 'PDF 页面提取超时（30 秒），请减少 PDF 页数或导出较低分辨率版本后重试。'
                : `PDF 自动处理失败：${err instanceof Error ? err.message : '未知错误'}。请手动压缩 PDF（推荐 Adobe Acrobat / Smallpdf / ilovepdf）至 12MB 以内后重试。`
            setUpload((prev) => ({
              ...prev,
              isUploading: false,
              processingPhase: 'idle',
              error: msg,
            }))
            return
          }
        }

        setUpload((prev) => ({
          ...prev,
          processingPhase: 'done',
          processingMessage: '',
        }))
      } else {
        // ── Small PDF or direct upload: send as-is ──
        formData = new FormData()
        formData.append('file', file)
        appendPortfolioContext(formData, targetInfo)
      }

      // Fire API call immediately
      const controller = new AbortController()
      const clientTimeout = setTimeout(() => controller.abort(), 110_000)
      const apiPromise = fetch('/api/analyze-portfolio', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      }).finally(() => clearTimeout(clientTimeout))

      // Animate review steps while the API is working.
      const maxAnimationProgress = 90
      for (let i = 0; i < portfolioSteps.length; i++) {
        const step = portfolioSteps[i]
        setUpload((prev) => ({
          ...prev,
          currentDimension: step.label,
          progress: Math.round(((i + 0.5) / portfolioSteps.length) * maxAnimationProgress),
        }))

        await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 300))

        setUpload((prev) => ({
          ...prev,
          completedDimensions: [...prev.completedDimensions, step.label],
          progress: Math.round(((i + 1) / portfolioSteps.length) * maxAnimationProgress),
        }))
      }

      // Show waiting state
      setUpload((prev) => ({
        ...prev,
        isWaitingForApi: true,
        currentDimension: '',
      }))

      // Wait for original API response
      const response = await apiPromise
      const parsed = await parseApiResponse<AnalysisResult>(response)

      if (!parsed.ok) {
        setUpload((prev) => ({
          ...prev,
          isUploading: false,
          isWaitingForApi: false,
          error: parsed.error || '分析失败，请重试',
        }))
        return
      }

      let analysisResult: AnalysisResult = parsed.data

      analysisResult = {
        ...analysisResult,
        imageUrl: '',
        fileName: upload.file.name,
      }

      setResult(analysisResult)
      setUpload((prev) => ({
        ...prev,
        isUploading: false,
        isWaitingForApi: false,
        progress: 100,
      }))

      return analysisResult
    } catch (err) {
      let message = '网络错误，请检查连接后重试'
      if (err instanceof Error && err.name === 'AbortError') {
        message = 'AI 分析等待时间过长，请稍后重试'
      } else if (err instanceof TypeError && err.message === 'Failed to fetch') {
        message = '与 EdgeOne 函数的连接被中断。请确认最新部署已成功，并查看函数日志。'
      } else if (err instanceof Error) {
        message = err.message
      }
      setUpload((prev) => ({
        ...prev,
        isUploading: false,
        isWaitingForApi: false,
        processingPhase: 'idle',
        error: message,
      }))
    }
  }, [upload.file])

  const reset = useCallback(() => {
    targetInfoRef.current = DEFAULT_TARGET_INFO
    processedImagesRef.current = null
    processedPageInfoRef.current = null
    setUpload({
      file: null,
      isUploading: false,
      isWaitingForApi: false,
      processingPhase: 'idle',
      processingMessage: '',
      progress: 0,
      currentDimension: '',
      completedDimensions: [],
      error: null,
    })
    setResult(null)
  }, [])

  return {
    upload,
    result,
    handleFile,
    startAnalysis,
    setTargetInfo,
    reset,
  }
}

/** Build FormData for image-based portfolio analysis (large PDF path). */
function buildImageFormData(
  images: File[],
  rendered: number,
  totalPdfPages: number,
  selectedPages: number[] = [],
  strategyNote = '',
  targetInfo: PortfolioTargetInfo = DEFAULT_TARGET_INFO
): FormData {
  const fd = new FormData()
  for (const img of images) {
    fd.append('images', img)
  }
  fd.append('renderedPages', String(rendered))
  fd.append('totalPdfPages', String(totalPdfPages))
  fd.append('selectedPages', selectedPages.join(','))
  fd.append('reviewScopeNote', strategyNote)
  appendPortfolioContext(fd, targetInfo)
  return fd
}

function appendPortfolioContext(fd: FormData, targetInfo: PortfolioTargetInfo): void {
  fd.append('portfolioPurpose', targetInfo.purpose)
  fd.append('targetCompany', targetInfo.company)
  fd.append('targetRole', targetInfo.role)
  fd.append('jobDescription', targetInfo.jd)
  fd.append('targetSchool', targetInfo.school)
  fd.append('targetMajor', targetInfo.major)
  fd.append('applicationRequirement', targetInfo.requirement)
  fd.append('portfolioGoal', targetInfo.goal)
}

/** Wrap a promise with a timeout. Throws on timeout. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('PDF processing timed out')), ms)
    promise.then(
      (v) => {
        clearTimeout(timer)
        resolve(v)
      },
      (e) => {
        clearTimeout(timer)
        reject(e)
      }
    )
  })
}
