'use client'

import { useRouter } from 'next/navigation'
import UploadZone from '@/components/analyze/UploadZone'
import ImagePreview from '@/components/analyze/ImagePreview'
import ProgressBar from '@/components/analyze/ProgressBar'
import AIThinking from '@/components/analyze/AIThinking'
import DimensionList from '@/components/analyze/DimensionList'
import DesignTypeToggle from '@/components/analyze/DesignTypeToggle'
import Button from '@/components/shared/Button'
import { useAnalysis } from '@/hooks/useAnalysis'
import { useHistory } from '@/hooks/useHistory'

export default function AnalyzePage() {
  const router = useRouter()
  const { upload, result, handleFile, startAnalysis, setDesignType, reset } = useAnalysis()
  const { addItem } = useHistory()

  const handleStartAnalysis = async () => {
    const analysisResult = await startAnalysis()
    if (analysisResult) {
      addItem({
        id: analysisResult.id,
        imageUrl: analysisResult.imageUrl,
        fileName: analysisResult.fileName,
        score: analysisResult.score,
        scoreNumeric: analysisResult.scoreNumeric,
        createdAt: analysisResult.createdAt,
        mode: 'single',
        designType: analysisResult.designType,
      })
      // Store result for result page access
      sessionStorage.setItem('lastAnalysis', JSON.stringify(analysisResult))
      // Navigate to result page
      router.push(`/result/${analysisResult.id}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">作品评审</h1>
          <p className="text-sm text-white/40 mt-1">上传单张设计作品，获取 7 维度专业评审</p>
        </div>
        {upload.file && !upload.isUploading && (
          <Button variant="ghost" size="sm" onClick={reset}>
            重新上传
          </Button>
        )}
      </div>

      {/* Upload zone */}
      {!upload.file && <UploadZone onFile={handleFile} />}

      {/* Image preview */}
      {upload.previewUrl && upload.file && (
        <ImagePreview url={upload.previewUrl} fileName={upload.file.name} />
      )}

      {/* Design type toggle */}
      {upload.file && !upload.isUploading && (
        <DesignTypeToggle value={upload.designType} onChange={setDesignType} />
      )}

      {/* Progress and thinking state */}
      {upload.isUploading && (
        <div className="space-y-8">
          <ProgressBar progress={upload.progress} />
          <AIThinking currentDimension={upload.currentDimension} isWaitingForApi={upload.isWaitingForApi} />
          <DimensionList
            completedDimensions={upload.completedDimensions}
            currentDimension={upload.currentDimension}
          />
        </div>
      )}

      {/* Error state */}
      {upload.error && (
        <div className="glass rounded-2xl p-6 text-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F59E0B]/10 mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-sm text-white/60">{upload.error}</p>
          <Button variant="secondary" size="sm" onClick={reset}>
            重新上传
          </Button>
        </div>
      )}

      {/* Start analysis button */}
      {upload.file && !upload.isUploading && (
        <Button onClick={handleStartAnalysis} variant="primary" size="lg" className="w-full">
          开始 AI 分析
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </Button>
      )}
    </div>
  )
}
