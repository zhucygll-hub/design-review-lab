'use client'

import { useState, useCallback } from 'react'
import { AnalysisResult, DesignType } from '@/types'
import { parseApiResponse } from '@/lib/api-utils'
import { compressImageClient } from '@/lib/image-compress'

interface UploadState {
  file: File | null
  previewUrl: string | null
  isUploading: boolean
  isWaitingForApi: boolean
  progress: number
  currentDimension: string
  completedDimensions: string[]
  designType: DesignType
  error: string | null
}

const ANALYSIS_DIMENSIONS = [
  '创意与概念',
  '逻辑与叙事',
  '视觉表达',
  '用户体验',
  '专业完成度',
  '创新价值',
  '商业与现实价值',
]

export function useAnalysis() {
  const [upload, setUpload] = useState<UploadState>({
    file: null,
    previewUrl: null,
    isUploading: false,
    isWaitingForApi: false,
    progress: 0,
    currentDimension: '',
    completedDimensions: [],
    designType: 'commercial',
    error: null,
  })
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const handleFile = useCallback((file: File) => {
    const previewUrl = URL.createObjectURL(file)
    setUpload((prev) => ({
      file,
      previewUrl,
      isUploading: false,
      isWaitingForApi: false,
      progress: 0,
      currentDimension: '',
      completedDimensions: [],
      designType: prev.designType,
      error: null,
    }))
    setResult(null)
  }, [])

  const startAnalysis = useCallback(async () => {
    if (!upload.file || !upload.previewUrl) return

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
      // Compress image client-side to stay under Vercel 4.5MB body limit
      const compressed = await compressImageClient(upload.file, 1024, 0.72)
      const formData = new FormData()
      formData.append('file', compressed, upload.file.name)
      formData.append('designType', upload.designType)

      // Fire API call immediately
      const controller = new AbortController()
      const clientTimeout = setTimeout(() => controller.abort(), 100_000)
      const apiPromise = fetch('/api/analyze', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      }).finally(() => clearTimeout(clientTimeout))

      // Run dimension animation (capped at 90%)
      const maxAnimationProgress = 90
      for (let i = 0; i < ANALYSIS_DIMENSIONS.length; i++) {
        const dim = ANALYSIS_DIMENSIONS[i]
        setUpload((prev) => ({
          ...prev,
          currentDimension: dim,
          progress: Math.round(((i + 0.5) / ANALYSIS_DIMENSIONS.length) * maxAnimationProgress),
        }))

        await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 300))

        setUpload((prev) => ({
          ...prev,
          completedDimensions: [...prev.completedDimensions, dim],
          progress: Math.round(((i + 1) / ANALYSIS_DIMENSIONS.length) * maxAnimationProgress),
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
        imageUrl: upload.previewUrl,
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
        error: message,
      }))
    }
  }, [upload.designType, upload.file, upload.previewUrl])

  const setDesignType = useCallback((designType: DesignType) => {
    setUpload((prev) => ({ ...prev, designType }))
  }, [])

  const reset = useCallback(() => {
    if (upload.previewUrl) {
      URL.revokeObjectURL(upload.previewUrl)
    }
    setUpload({
      file: null,
      previewUrl: null,
      isUploading: false,
      isWaitingForApi: false,
      progress: 0,
      currentDimension: '',
      completedDimensions: [],
      designType: 'commercial',
      error: null,
    })
    setResult(null)
  }, [upload.previewUrl])

  return {
    upload,
    result,
    handleFile,
    startAnalysis,
    setDesignType,
    reset,
  }
}
