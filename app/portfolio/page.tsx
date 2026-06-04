'use client'

import { useRouter } from 'next/navigation'
import PortfolioUploadZone from '@/components/portfolio/PortfolioUploadZone'
import TargetInputCard from '@/components/portfolio/TargetInputCard'
import ProgressBar from '@/components/analyze/ProgressBar'
import AIThinking from '@/components/analyze/AIThinking'
import DimensionList from '@/components/analyze/DimensionList'
import Button from '@/components/shared/Button'
import { usePortfolioAnalysis } from '@/hooks/usePortfolioAnalysis'
import { useHistory } from '@/hooks/useHistory'

const PORTFOLIO_DIMENSIONS = [
  '项目质量',
  '项目完整度',
  '设计思维',
  '专业能力',
  '视觉表达能力',
  '差异化竞争力',
  '岗位匹配度',
]

export default function PortfolioAnalyzePage() {
  const router = useRouter()
  const { upload, result, handleFile, startAnalysis, setTargetInfo, skipTargetInfo, reset } =
    usePortfolioAnalysis()
  const { addItem } = useHistory()

  const handleStartAnalysis = async () => {
    const analysisResult = await startAnalysis()
    if (analysisResult) {
      addItem({
        id: analysisResult.id,
        imageUrl: analysisResult.imageUrl || '',
        fileName: analysisResult.fileName,
        score: analysisResult.score,
        scoreNumeric: analysisResult.scoreNumeric,
        createdAt: analysisResult.createdAt,
        mode: 'portfolio',
      })
      sessionStorage.setItem('lastAnalysis', JSON.stringify(analysisResult))
      router.push(`/result/${analysisResult.id}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">作品集评审</h1>
          <p className="text-sm text-white/40 mt-1">上传完整作品集 PDF，获取 7 维度加权专业评审</p>
        </div>
        {upload.file && !upload.isUploading && (
          <Button variant="ghost" size="sm" onClick={reset}>
            重新上传
          </Button>
        )}
      </div>

      {/* Upload zone */}
      {!upload.file && <PortfolioUploadZone onFile={handleFile} />}

      {/* File preview info */}
      {upload.file && !upload.isUploading && (
        <div className="glass rounded-2xl p-6 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7C3AED]/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8Z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white/80 truncate">{upload.file.name}</p>
            <p className="text-xs text-white/40 mt-0.5">
              {(upload.file.size / (1024 * 1024)).toFixed(1)} MB · PDF
            </p>
          </div>
        </div>
      )}

      {/* Target input card (shown during pause in analysis) */}
      {upload.isAwaitingTargetInput && (
        <TargetInputCard
          onSubmit={(data) => setTargetInfo(data.company, data.role, data.jd)}
          onSkip={skipTargetInfo}
        />
      )}

      {/* Progress and thinking state */}
      {upload.isUploading && !upload.isAwaitingTargetInput && (
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
