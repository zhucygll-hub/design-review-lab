'use client'

import { useState, useCallback, useRef } from 'react'
import { AnalysisResult } from '@/types'
import { parseApiResponse } from '@/lib/api-utils'

interface PortfolioUploadState {
  file: File | null
  isUploading: boolean
  isWaitingForApi: boolean
  isAwaitingTargetInput: boolean
  progress: number
  currentDimension: string
  completedDimensions: string[]
  error: string | null
}

const PORTFOLIO_DIMENSIONS = [
  '项目质量',
  '项目完整度',
  '设计思维',
  '专业能力',
  '视觉表达能力',
  '差异化竞争力',
  '岗位匹配度',
]

export function usePortfolioAnalysis() {
  const [upload, setUpload] = useState<PortfolioUploadState>({
    file: null,
    isUploading: false,
    isWaitingForApi: false,
    isAwaitingTargetInput: false,
    progress: 0,
    currentDimension: '',
    completedDimensions: [],
    error: null,
  })
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const targetInfoRef = useRef<{ company: string; role: string; jd: string } | null>(null)
  const resolveTargetRef = useRef<(() => void) | null>(null)

  const handleFile = useCallback((file: File) => {
    setUpload({
      file,
      isUploading: false,
      isWaitingForApi: false,
      isAwaitingTargetInput: false,
      progress: 0,
      currentDimension: '',
      completedDimensions: [],
      error: null,
    })
    setResult(null)
    targetInfoRef.current = null
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

    setUpload((prev) => ({
      ...prev,
      isUploading: true,
      isWaitingForApi: false,
      isAwaitingTargetInput: false,
      progress: 0,
      currentDimension: '',
      completedDimensions: [],
      error: null,
    }))

    try {
      const formData = new FormData()
      formData.append('file', upload.file)
      // No target info yet — user hasn't provided it

      // Fire API call immediately
      const apiPromise = fetch('/api/analyze-portfolio', {
        method: 'POST',
        body: formData,
      })

      // Animate dimensions 1-6 (~6s)
      const maxAnimationProgress = 90
      for (let i = 0; i < PORTFOLIO_DIMENSIONS.length - 1; i++) {
        const dim = PORTFOLIO_DIMENSIONS[i]
        setUpload((prev) => ({
          ...prev,
          currentDimension: dim,
          progress: Math.round(((i + 0.5) / PORTFOLIO_DIMENSIONS.length) * maxAnimationProgress),
        }))

        await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 300))

        setUpload((prev) => ({
          ...prev,
          completedDimensions: [...prev.completedDimensions, dim],
          progress: Math.round(((i + 1) / PORTFOLIO_DIMENSIONS.length) * maxAnimationProgress),
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
        currentDimension: PORTFOLIO_DIMENSIONS[6],
      }))

      // Animate dimension 7
      await new Promise((resolve) => setTimeout(resolve, 600))
      setUpload((prev) => ({
        ...prev,
        completedDimensions: [...prev.completedDimensions, PORTFOLIO_DIMENSIONS[6]],
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
      const parsed = await parseApiResponse(response)

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
          const reFormData = new FormData()
          reFormData.append('file', upload.file)
          reFormData.append('targetCompany', targetInfoRef.current.company || '')
          reFormData.append('targetRole', targetInfoRef.current.role || '')
          reFormData.append('jobDescription', targetInfoRef.current.jd || '')

          const reResponse = await fetch('/api/analyze-portfolio', {
            method: 'POST',
            body: reFormData,
          })
          const reParsed = await parseApiResponse(reResponse)
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
      const message = err instanceof Error ? err.message : '网络错误，请检查连接后重试'
      setUpload((prev) => ({
        ...prev,
        isUploading: false,
        isWaitingForApi: false,
        isAwaitingTargetInput: false,
        error: message,
      }))
    }
  }, [upload.file])

  const reset = useCallback(() => {
    targetInfoRef.current = null
    resolveTargetRef.current = null
    setUpload({
      file: null,
      isUploading: false,
      isWaitingForApi: false,
      isAwaitingTargetInput: false,
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
