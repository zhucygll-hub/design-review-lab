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

export default function PortfolioAnalyzePage() {
  const router = useRouter()
  const { upload, handleFile, startAnalysis, setTargetInfo, skipTargetInfo, reset } =
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
      <div className="report-shell rounded-2xl p-6 flex items-start justify-between gap-4">
        <div>
          <p className="report-kicker">提交评审材料</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#F4EFE6]">作品集评审</h1>
          <p className="mt-2 text-sm leading-6 text-[#F4EFE6]/48">
            上传完整作品集 PDF，系统会从项目质量、设计思维、视觉表达和岗位匹配度生成综合报告。
          </p>
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
        <div className="space-y-4">
          <div className="report-panel p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#F4EFE6]/10 bg-[#11100E]/64">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D6A85A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8Z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#F4EFE6]/78 truncate">{upload.file.name}</p>
              <p className="text-xs text-[#F4EFE6]/42 mt-0.5">
                {(upload.file.size / (1024 * 1024)).toFixed(1)} MB · PDF
              </p>
            </div>
          </div>

          {/* Large PDF notice */}
          {upload.file.size > 12 * 1024 * 1024 && upload.file.size <= 30 * 1024 * 1024 && (
            <div className="flex items-start gap-2.5 rounded-xl border border-[#6B9CFF]/18 bg-[#6B9CFF]/7 p-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B9CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <div>
                <p className="text-xs font-medium text-[#8EB4FF]">大型 PDF 自动优化</p>
                <p className="text-xs text-[#F4EFE6]/46 mt-0.5 leading-relaxed">
                  文件较大（{(upload.file.size / (1024 * 1024)).toFixed(1)} MB），开始分析时将自动提取前若干页为图片后送入 AI 评审。处理可能需要 10-30 秒，请耐心等待。
                </p>
              </div>
            </div>
          )}
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
          {/* PDF processing progress (before AI call) */}
          {upload.processingPhase === 'rendering' && (
            <div className="report-panel p-5 flex items-center gap-4">
              <div className="h-5 w-5 rounded-full border-2 border-[#6B9CFF] border-t-transparent animate-spin shrink-0" />
              <div>
                <p className="text-sm font-medium text-[#8EB4FF]">{upload.processingMessage || '正在处理 PDF…'}</p>
                <p className="text-xs text-[#F4EFE6]/38 mt-0.5">大型 PDF 正在提取页面并压缩，可能需要 10-30 秒</p>
              </div>
            </div>
          )}
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
