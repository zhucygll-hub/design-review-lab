'use client'

import { useRouter } from 'next/navigation'
import UploadZone from '@/components/analyze/UploadZone'
import ImagePreview from '@/components/analyze/ImagePreview'
import ProgressBar from '@/components/analyze/ProgressBar'
import AIThinking from '@/components/analyze/AIThinking'
import DimensionList from '@/components/analyze/DimensionList'
import DesignTypeToggle from '@/components/analyze/DesignTypeToggle'
import ScenarioSelector from '@/components/analyze/ScenarioSelector'
import Button from '@/components/shared/Button'
import { useAnalysis } from '@/hooks/useAnalysis'
import { useHistory } from '@/hooks/useHistory'

export default function AnalyzePage() {
  const router = useRouter()
  const {
    upload,
    handleFile,
    startAnalysis,
    setDesignType,
    setWorkForm,
    setReviewPurpose,
    reset,
  } = useAnalysis()
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
        workForm: analysisResult.workForm,
        reviewPurpose: analysisResult.reviewPurpose,
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
      <div className="report-shell rounded-2xl p-6 flex items-start justify-between gap-4">
        <div>
          <p className="report-kicker">提交评审材料</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#F4EFE6]">作品评审</h1>
          <p className="mt-2 text-sm leading-6 text-[#F4EFE6]/48">
            上传单张设计作品，补充评审背景后生成七维评分和导师意见。
          </p>
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
        <div className="space-y-6">
          <DesignTypeToggle value={upload.designType} onChange={setDesignType} />
          <ScenarioSelector
            workForm={upload.workForm}
            reviewPurpose={upload.reviewPurpose}
            onWorkFormChange={setWorkForm}
            onReviewPurposeChange={setReviewPurpose}
          />
        </div>
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
        <div className="report-panel p-6 text-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D6A85A]/10 mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D6A85A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-sm text-[#F4EFE6]/62">{upload.error}</p>
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
