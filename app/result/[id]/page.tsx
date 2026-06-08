'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import ScoreBadge from '@/components/result/ScoreBadge'
import ScoreEvidence from '@/components/result/ScoreEvidence'
import ResultInsightPanel from '@/components/result/ResultInsightPanel'
import DimensionSummary from '@/components/result/DimensionSummary'
import MentorReview from '@/components/result/MentorReview'
import ProsConsSection from '@/components/result/ProsConsSection'
import SuggestionsSection from '@/components/result/SuggestionsSection'
import PortfolioReviewScope from '@/components/result/PortfolioReviewScope'
import ExportButton from '@/components/result/ExportButton'
import { AnalysisResult, PortfolioPurpose } from '@/types'
import {
  DESIGN_TYPE_LABELS,
  REVIEW_PURPOSE_LABELS,
  WORK_FORM_LABELS,
} from '@/lib/single-work-scenario'

const PORTFOLIO_PURPOSE_LABELS: Record<PortfolioPurpose, string> = {
  job: '求职作品集',
  graduate: '考研/升学',
  course: '课程作业',
  competition: '比赛投稿',
  showcase: '视觉展示',
  unsure: '用途待判断',
}

function buildContextItems(result: AnalysisResult) {
  const items: Array<{ label: string; value: string }> = []

  if (result.mode === 'portfolio') {
    items.push({
      label: '用途',
      value: PORTFOLIO_PURPOSE_LABELS[result.portfolioPurpose ?? 'unsure'],
    })
    if (result.targetRole) items.push({ label: '岗位', value: result.targetRole })
    if (result.targetCompany) items.push({ label: '公司', value: result.targetCompany })
    if (result.targetSchool) items.push({ label: '院校', value: result.targetSchool })
    if (result.targetMajor) items.push({ label: '方向', value: result.targetMajor })
    if (result.portfolioGoal) items.push({ label: '目标', value: result.portfolioGoal })
  }

  return items
}

export default function ResultPage() {
  const params = useParams()
  const resultId = Array.isArray(params.id) ? params.id[0] : params.id
  const [result] = useState<AnalysisResult | null>(() => {
    if (typeof window === 'undefined') return null

    const stored = sessionStorage.getItem('lastAnalysis')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.id === resultId) return parsed
      } catch {
        // ignore invalid session data
      }
    }
    return null
  })
  const contextItems = result ? buildContextItems(result) : []

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
    <div className="mx-auto max-w-5xl pb-14">
      <div className="report-shell rounded-2xl p-5 md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="report-kicker">AI 设计评审报告</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#F4EFE6]">
              {result.fileName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#F4EFE6]/48">
              先看总分旁边的 3 个关键问题，再查看完整维度、导师点评和评分依据。
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
          {result.mode === 'portfolio' && result.portfolioPurpose && (
            <span className="rounded-full border border-[#D6A85A]/22 bg-[#D6A85A]/8 px-3 py-1 text-xs font-medium text-[#D6A85A]">
              {PORTFOLIO_PURPOSE_LABELS[result.portfolioPurpose]}
            </span>
          )}
        </div>

        {contextItems.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#F4EFE6]/8 pt-4">
            {contextItems.slice(0, 5).map((item) => (
              <div key={`${item.label}-${item.value}`} className="flex items-center gap-2 text-xs">
                <span className="text-[#F4EFE6]/34">{item.label}</span>
                <span className="max-w-[220px] truncate text-[#F4EFE6]/66">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
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

      <div className="mt-8 space-y-10">
        <section className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
          <ScoreBadge
            score={result.score}
            scoreLabel={result.scoreLabel}
            scoreNumeric={result.scoreNumeric}
            evidence={result.scoreBreakdown ? <ScoreEvidence result={result} /> : undefined}
            compact
          />
          <ResultInsightPanel result={result} />
        </section>

        {result.mode === 'portfolio' && result.portfolioReviewScope && (
          <PortfolioReviewScope scope={result.portfolioReviewScope} />
        )}

        <DimensionSummary dimensions={result.dimensions} />

        <section className="report-section">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="report-kicker">四个视角</p>
              <h2 className="report-title mt-1 text-xl">导师点评</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[#F4EFE6]/42">
              不同角色会从课题、审美、表达和场景切入，帮你判断作品该怎么被解释。
            </p>
          </div>
          <MentorReview reviews={result.mentorReviews} />
        </section>

        <section className="report-section">
          <ProsConsSection pros={result.pros} cons={result.cons} />
        </section>

        <section className="report-section">
          <SuggestionsSection suggestions={result.suggestions} />
        </section>
      </div>
    </div>
  )
}
