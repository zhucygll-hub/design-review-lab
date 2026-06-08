'use client'

import { useState, useCallback } from 'react'
import { AnalysisResult, DesignType, ReviewPurpose, WorkForm } from '@/types'
import { parseApiResponse } from '@/lib/api-utils'
import { compressImageClient } from '@/lib/image-compress'
import { buildSingleWorkProgressSteps } from '@/lib/analysis-progress'

interface UploadState {
  files: File[]
  previewUrls: string[]
  isUploading: boolean
  isWaitingForApi: boolean
  progress: number
  currentDimension: string
  completedDimensions: string[]
  designType: DesignType
  workForm: WorkForm
  reviewPurpose: ReviewPurpose
  error: string | null
}

export function useAnalysis() {
  const [upload, setUpload] = useState<UploadState>({
    files: [],
    previewUrls: [],
    isUploading: false,
    isWaitingForApi: false,
    progress: 0,
    currentDimension: '',
    completedDimensions: [],
    designType: 'commercial',
    workForm: 'board',
    reviewPurpose: 'course',
    error: null,
  })
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const handleFiles = useCallback((files: File[]) => {
    const previewUrls = files.map((f) => URL.createObjectURL(f))
    setUpload((prev) => ({
      files,
      previewUrls,
      isUploading: false,
      isWaitingForApi: false,
      progress: 0,
      currentDimension: '',
      completedDimensions: [],
      designType: prev.designType,
      workForm: prev.workForm,
      reviewPurpose: prev.reviewPurpose,
      error: null,
    }))
    setResult(null)
  }, [])

  const startAnalysis = useCallback(async () => {
    if (upload.files.length === 0) return

    setUpload((prev) => ({
      ...prev,
      isUploading: true,
      isWaitingForApi: false,
      progress: 0,
      currentDimension: '',
      completedDimensions: [],
      error: null,
    }))

    try {
      const formData = new FormData()

      // Process each file: PDF → single page image, otherwise compress
      for (let i = 0; i < upload.files.length; i++) {
        const file = upload.files[i]
        let imageFile: File | Blob = file
        const isPdf = file.type === 'application/pdf'

        if (isPdf) {
          setUpload((prev) => ({
            ...prev,
            currentDimension: '正在提取 PDF 第一页…',
          }))
          const { pdfFirstPageToImage } = await import('@/lib/pdf-to-image')
          const imageBlob = await pdfFirstPageToImage(file)
          if (!imageBlob) {
            setUpload((prev) => ({
              ...prev,
              isUploading: false,
              error: 'PDF 转换失败，请将 PDF 的第一页导出为 JPG/PNG 后上传，或使用「作品集评审」功能上传完整 PDF。',
            }))
            return
          }
          imageFile = new File(
            [imageBlob],
            file.name.replace(/\.pdf$/i, '.jpg'),
            { type: 'image/jpeg' }
          )
        }

        // Compress each image
        const compressed = await compressImageClient(
          imageFile instanceof File ? imageFile : new File([imageFile], `image-${i}.jpg`, { type: 'image/jpeg' }),
          1024,
          0.72
        )
        const fileName = file.name.replace(/\.pdf$/i, isPdf ? '.jpg' : file.name)
        formData.append('files', compressed, fileName)
      }

      formData.append('fileCount', String(upload.files.length))
      formData.append('designType', upload.designType)
      formData.append('workForm', upload.workForm)
      formData.append('reviewPurpose', upload.reviewPurpose)

      // Fire API call immediately
      const controller = new AbortController()
      const clientTimeout = setTimeout(() => controller.abort(), 100_000)
      const apiPromise = fetch('/api/analyze', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      }).finally(() => clearTimeout(clientTimeout))

      // Run scenario-aware progress animation (capped at 90%)
      const analysisSteps = buildSingleWorkProgressSteps(
        upload.designType,
        upload.workForm,
        upload.reviewPurpose
      )
      const maxAnimationProgress = 90
      for (let i = 0; i < analysisSteps.length; i++) {
        const step = analysisSteps[i]
        setUpload((prev) => ({
          ...prev,
          currentDimension: step.label,
          progress: Math.round(((i + 0.5) / analysisSteps.length) * maxAnimationProgress),
        }))

        await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 300))

        setUpload((prev) => ({
          ...prev,
          completedDimensions: [...prev.completedDimensions, step.label],
          progress: Math.round(((i + 1) / analysisSteps.length) * maxAnimationProgress),
        }))
      }

      // All dimensions checked, now waiting for API
      setUpload((prev) => ({
        ...prev,
        isWaitingForApi: true,
        currentDimension: '',
      }))

      // Wait for API response
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

      const analysisResult: AnalysisResult = {
        ...parsed.data,
        imageUrl: upload.previewUrls[0] ?? '',
        fileName: upload.files[0]?.name ?? '',
        imageUrls: upload.previewUrls,
        fileNames: upload.files.map((f) => f.name),
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
        error: message,
      }))
    }
  }, [upload.designType, upload.files, upload.previewUrls, upload.reviewPurpose, upload.workForm])

  const setDesignType = useCallback((designType: DesignType) => {
    setUpload((prev) => ({ ...prev, designType }))
  }, [])

  const setWorkForm = useCallback((workForm: WorkForm) => {
    setUpload((prev) => ({ ...prev, workForm }))
  }, [])

  const setReviewPurpose = useCallback((reviewPurpose: ReviewPurpose) => {
    setUpload((prev) => ({ ...prev, reviewPurpose }))
  }, [])

  const reset = useCallback(() => {
    for (const url of upload.previewUrls) {
      URL.revokeObjectURL(url)
    }
    setUpload({
      files: [],
      previewUrls: [],
      isUploading: false,
      isWaitingForApi: false,
      progress: 0,
      currentDimension: '',
      completedDimensions: [],
      designType: 'commercial',
      workForm: 'board',
      reviewPurpose: 'course',
      error: null,
    })
    setResult(null)
  }, [upload.previewUrls])

  return {
    upload,
    result,
    handleFiles,
    startAnalysis,
    setDesignType,
    setWorkForm,
    setReviewPurpose,
    reset,
  }
}
