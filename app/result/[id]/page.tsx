'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import ScoreBadge from '@/components/result/ScoreBadge'
import ScoreEvidence from '@/components/result/ScoreEvidence'
import ResultInsightPanel from '@/components/result/ResultInsightPanel'
import DimensionSummary from '@/components/result/DimensionSummary'
import MentorReview from '@/components/result/MentorReview'
import ProsConsSection from '@/components/result/ProsConsSection'
import SuggestionsSection from '@/components/result/SuggestionsSection'
import ExportButton from '@/components/result/ExportButton'
import { AnalysisResult } from '@/types'
import {
  DESIGN_TYPE_LABELS,
  REVIEW_PURPOSE_LABELS,
  WORK_FORM_LABELS,
} from '@/lib/single-work-scenario'

export default function ResultPage() {
  const params = useParams()
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem('lastAnalysis')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.id === params.id) {
          setResult(parsed)
        }
      } catch {
        // ignore invalid session data
      }
    }
    setLoading(false)
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 rounded-full border-2 border-[#6B9CFF] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-[#F4EFE6]/45">未找到分析结果</p>
        <Link href="/analyze" className="text-sm text-[#6B9CFF] hover:underline">
          去上传分析 →
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <div className="report-shell rounded-2xl p-5 md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="report-kicker">AI 设计评审报告</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#F4EFE6]">
              {result.fileName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#F4EFE6]/48">
              先看 3 个关键问题和优先修改项，再查看完整维度、导师点评和评分依据。
            </p>
          </div>
          <ExportButton />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#F4EFE6]/10 bg-[#F4EFE6]/5 px-3 py-1 text-xs font-medium text-[#F4EFE6]/52">
            {result.mode === 'portfolio' ? '作品集评审' : '作品评审'}
          </span>
          {result.designType && (
            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${
              result.designType === 'concept'
                ? 'border-[#D6A85A]/25 bg-[#D6A85A]/8 text-[#D6A85A]'
                : 'border-[#6B9CFF]/25 bg-[#6B9CFF]/8 text-[#8EB4FF]'
            }`}>
              {DESIGN_TYPE_LABELS[result.designType]}
            </span>
          )}
          {result.workForm && (
            <span className="rounded-full border border-[#F4EFE6]/10 bg-[#F4EFE6]/5 px-3 py-1 text-xs font-medium text-[#F4EFE6]/48">
              {WORK_FORM_LABELS[result.workForm]}
            </span>
          )}
          {result.reviewPurpose && (
            <span className="rounded-full border border-[#F4EFE6]/10 bg-[#F4EFE6]/5 px-3 py-1 text-xs font-medium text-[#F4EFE6]/48">
              {REVIEW_PURPOSE_LABELS[result.reviewPurpose]}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link
          href={result.mode === 'portfolio' ? '/portfolio' : '/analyze'}
          className="flex items-center gap-2 text-sm text-[#F4EFE6]/44 hover:text-[#F4EFE6] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          返回
        </Link>
      </div>

      <section>
        <ScoreBadge
          score={result.score}
          scoreLabel={result.scoreLabel}
          scoreNumeric={result.scoreNumeric}
          evidence={result.scoreBreakdown ? <ScoreEvidence result={result} /> : undefined}
        />
      </section>

      <ResultInsightPanel result={result} />

      <DimensionSummary dimensions={result.dimensions} />

      {result.mode === 'portfolio' && (result.targetCompany || result.targetRole) && (
        <section className="report-panel p-6">
          <h2 className="report-title text-lg mb-3">目标岗位</h2>
          <div className="space-y-2">
            {result.targetCompany && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#F4EFE6]/38">公司：</span>
                <span className="text-[#F4EFE6]/70">{result.targetCompany}</span>
              </div>
            )}
            {result.targetRole && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#F4EFE6]/38">岗位：</span>
                <span className="text-[#F4EFE6]/70">{result.targetRole}</span>
              </div>
            )}
            {result.jobDescription && (
              <div className="mt-2 p-3 rounded-lg bg-[#11100E]/48">
                <p className="text-xs text-[#F4EFE6]/34 mb-1">JD 摘要</p>
                <p className="text-xs text-[#F4EFE6]/48 line-clamp-3">{result.jobDescription}</p>
              </div>
            )}
          </div>
        </section>
      )}

      <section>
        <h2 className="report-title text-lg mb-4">导师点评</h2>
        <MentorReview reviews={result.mentorReviews} />
      </section>

      <section>
        <ProsConsSection pros={result.pros} cons={result.cons} />
      </section>

      <section>
        <SuggestionsSection suggestions={result.suggestions} />
      </section>
    </div>
  )
}
