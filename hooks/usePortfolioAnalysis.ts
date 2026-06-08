'use client'

import { useState, useCallback, useRef } from 'react'
import { AnalysisResult } from '@/types'
import { parseApiResponse } from '@/lib/api-utils'
import { assessPdfSize, pdfPagesToImages } from '@/lib/pdf-to-images'
import { buildPortfolioProgressSteps } from '@/lib/analysis-progress'

interface PortfolioUploadState {
  file: File | null
  isUploading: boolean
  isWaitingForApi: boolean
  isAwaitingTargetInput: boolean
  /** Client-side PDF processing phase */
  processingPhase: 'idle' | 'assessing' | 'rendering' | 'done'
  /** Progress message during processing */
  processingMessage: string
  progress: number
  currentDimension: string
  completedDimensions: string[]
  error: string | null
}

const PORTFOLIO_STEPS = buildPortfolioProgressSteps()

/** Timeout for client-side PDF rendering (30s) */
const PDF_PROCESSING_TIMEOUT_MS = 30_000

export function usePortfolioAnalysis() {
  const [upload, setUpload] = useState<PortfolioUploadState>({
    file: null,
    isUploading: false,
    isWaitingForApi: false,
    isAwaitingTargetInput: false,
    processingPhase: 'idle',
    processingMessage: '',
    progress: 0,
    currentDimension: '',
    completedDimensions: [],
    error: null,
  })
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const targetInfoRef = useRef<{ company: string; role: string; jd: string } | null>(null)
  const resolveTargetRef = useRef<(() => void) | null>(null)
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
      isAwaitingTargetInput: false,
      processingPhase: assessment?.action === 'reject' ? 'idle' : 'idle',
      processingMessage: assessment?.reason ?? '',
      progress: 0,
      currentDimension: '',
      completedDimensions: [],
      error: assessment?.action === 'reject' ? assessment.reason : null,
    })
    setResult(null)
    targetInfoRef.current = null
    processedImagesRef.current = null
    processedPageInfoRef.current = null
  }, [])

  const setTargetInfo = useCallback((company: string, role: string, jd: string) => {
    targetInfoRef.current = { company, role, jd }
    // Resume from pause
    if (resolveTargetRef.current) {
      resolveTargetRef.current()
      resolveTargetRef.current = null
    }
  }, [])

  const skipTargetInfo = useCallback(() => {
    targetInfoRef.current = null
    if (resolveTargetRef.current) {
      resolveTargetRef.current()
      resolveTargetRef.current = null
    }
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
      isAwaitingTargetInput: false,
      processingPhase: assessment?.action === 'compress' ? 'assessing' : 'idle',
      processingMessage: '',
      progress: 0,
      currentDimension: '',
      completedDimensions: [],
      error: null,
    }))

    try {
      let formData: FormData

      // ── Large PDF: render pages as JPEGs client-side ──
      if (assessment?.action === 'compress') {
        // Reuse cached images if available (from a retry)
        if (processedImagesRef.current && processedPageInfoRef.current) {
          formData = buildImageFormData(
            processedImagesRef.current,
            processedPageInfoRef.current.rendered,
            processedPageInfoRef.current.total,
            processedPageInfoRef.current.selectedPages,
            processedPageInfoRef.current.strategyNote
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
              renderResult.strategyNote
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
      }

      // Fire API call immediately
      const controller = new AbortController()
      const clientTimeout = setTimeout(() => controller.abort(), 110_000)
      const apiPromise = fetch('/api/analyze-portfolio', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      }).finally(() => clearTimeout(clientTimeout))

      // Animate review steps 1-6 (~6s)
      const maxAnimationProgress = 90
      for (let i = 0; i < PORTFOLIO_STEPS.length - 1; i++) {
        const step = PORTFOLIO_STEPS[i]
        setUpload((prev) => ({
          ...prev,
          currentDimension: step.label,
          progress: Math.round(((i + 0.5) / PORTFOLIO_STEPS.length) * maxAnimationProgress),
        }))

        await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 300))

        setUpload((prev) => ({
          ...prev,
          completedDimensions: [...prev.completedDimensions, step.label],
          progress: Math.round(((i + 1) / PORTFOLIO_STEPS.length) * maxAnimationProgress),
        }))
      }

      // Pause: wait for target input
      setUpload((prev) => ({
        ...prev,
        isAwaitingTargetInput: true,
        currentDimension: '',
      }))

      // Wait for user to submit or skip
      await new Promise<void>((resolve) => {
        resolveTargetRef.current = resolve
      })

      setUpload((prev) => ({
        ...prev,
        isAwaitingTargetInput: false,
        currentDimension: PORTFOLIO_STEPS[6].label,
      }))

      // Animate dimension 7
      await new Promise((resolve) => setTimeout(resolve, 600))
      setUpload((prev) => ({
        ...prev,
        completedDimensions: [...prev.completedDimensions, PORTFOLIO_STEPS[6].label],
        progress: maxAnimationProgress,
      }))

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
          isAwaitingTargetInput: false,
          error: parsed.error || '分析失败，请重试',
        }))
        return
      }

      let analysisResult: AnalysisResult = parsed.data

      // If user provided target info, attempt dim 7 re-evaluation
      if (targetInfoRef.current?.company || targetInfoRef.current?.role) {
        try {
          // Use same format as initial call (images for large PDFs, file for small)
          let reFormData: FormData
          if (processedImagesRef.current && processedPageInfoRef.current) {
            reFormData = buildImageFormData(
              processedImagesRef.current,
              processedPageInfoRef.current.rendered,
              processedPageInfoRef.current.total,
              processedPageInfoRef.current.selectedPages,
              processedPageInfoRef.current.strategyNote
            )
          } else {
            reFormData = new FormData()
            reFormData.append('file', upload.file)
          }
          reFormData.append('targetCompany', targetInfoRef.current.company || '')
          reFormData.append('targetRole', targetInfoRef.current.role || '')
          reFormData.append('jobDescription', targetInfoRef.current.jd || '')

          const reResponse = await fetch('/api/analyze-portfolio', {
            method: 'POST',
            body: reFormData,
          })
          const reParsed = await parseApiResponse<AnalysisResult>(reResponse)
          if (reParsed.ok) {
            analysisResult = reParsed.data
          }
        } catch {
          // Keep original result if re-evaluation fails
        }
      }

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
        isAwaitingTargetInput: false,
        processingPhase: 'idle',
        error: message,
      }))
    }
  }, [upload.file])

  const reset = useCallback(() => {
    targetInfoRef.current = null
    resolveTargetRef.current = null
    processedImagesRef.current = null
    processedPageInfoRef.current = null
    setUpload({
      file: null,
      isUploading: false,
      isWaitingForApi: false,
      isAwaitingTargetInput: false,
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
    skipTargetInfo,
    reset,
  }
}

/** Build FormData for image-based portfolio analysis (large PDF path). */
function buildImageFormData(
  images: File[],
  rendered: number,
  totalPdfPages: number,
  selectedPages: number[] = [],
  strategyNote = ''
): FormData {
  const fd = new FormData()
  for (const img of images) {
    fd.append('images', img)
  }
  fd.append('renderedPages', String(rendered))
  fd.append('totalPdfPages', String(totalPdfPages))
  fd.append('selectedPages', selectedPages.join(','))
  fd.append('reviewScopeNote', strategyNote)
  return fd
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
