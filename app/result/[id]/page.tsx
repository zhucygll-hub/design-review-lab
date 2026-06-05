'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import ScoreBadge from '@/components/result/ScoreBadge'
import RadarChart from '@/components/result/RadarChart'
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
    // In MVP, results are passed via sessionStorage
    // For a real app, fetch from Supabase by ID
    const stored = sessionStorage.getItem('lastAnalysis')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.id === params.id) {
          setResult(parsed)
        }
      } catch {
        // ignore
      }
    }
    setLoading(false)
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 rounded-full border-2 border-[#4F8CFF] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-white/40">未找到分析结果</p>
        <Link
          href="/analyze"
          className="text-sm text-[#4F8CFF] hover:underline"
        >
          去上传分析 →
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-12">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link
          href={result.mode === 'portfolio' ? '/portfolio' : '/analyze'}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          返回
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/5 text-white/30">
            {result.mode === 'portfolio' ? '作品集评审' : '作品评审'}
          </span>
          {result.designType && (
            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
              result.designType === 'concept'
                ? 'bg-[#7C3AED]/10 text-[#A78BFA]'
                : 'bg-[#4F8CFF]/10 text-[#4F8CFF]'
            }`}>
              {DESIGN_TYPE_LABELS[result.designType]}
            </span>
          )}
          {result.workForm && (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/5 text-white/35">
              {WORK_FORM_LABELS[result.workForm]}
            </span>
          )}
          {result.reviewPurpose && (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/5 text-white/35">
              {REVIEW_PURPOSE_LABELS[result.reviewPurpose]}
            </span>
          )}
          <ExportButton />
        </div>
      </div>

      {/* Score */}
      <section>
        <ScoreBadge
          score={result.score}
          scoreLabel={result.scoreLabel}
          scoreNumeric={result.scoreNumeric}
        />
      </section>

      {/* Radar chart */}
      <section className="glass rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white/60 mb-6 text-center">
          维度分析
        </h2>
        <RadarChart dimensions={result.dimensions} />
        {/* Dimension detail list */}
        <div className="mt-6 space-y-2">
          {result.dimensions.map((dim) => {
              const isNA = dim.score === null
              return (
            <div
              key={dim.name}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: isNA
                      ? '#6B7280'
                      : dim.score! >= 85
                        ? '#22C55E'
                        : dim.score! >= 70
                        ? '#4F8CFF'
                        : '#F59E0B',
                  }}
                />
                <span className={`text-sm ${isNA ? 'text-white/30' : 'text-white/70'}`}>
                  {dim.name}
                </span>
              </div>
              <span className="text-sm font-mono text-white/40">
                {isNA ? 'N/A' : dim.score}
                {dim.weight && <span className="text-white/15 ml-1">({dim.weight}%)</span>}
              </span>
            </div>
              )
          })}
        </div>
      </section>

      {/* Target info (portfolio mode only) */}
      {result.mode === 'portfolio' && (result.targetCompany || result.targetRole) && (
        <section className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white/60 mb-3">目标岗位</h2>
          <div className="space-y-2">
            {result.targetCompany && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white/30">公司：</span>
                <span className="text-white/70">{result.targetCompany}</span>
              </div>
            )}
            {result.targetRole && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white/30">岗位：</span>
                <span className="text-white/70">{result.targetRole}</span>
              </div>
            )}
            {result.jobDescription && (
              <div className="mt-2 p-3 rounded-lg bg-white/[0.02]">
                <p className="text-xs text-white/30 mb-1">JD 摘要</p>
                <p className="text-xs text-white/45 line-clamp-3">{result.jobDescription}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Mentor reviews */}
      <section>
        <h2 className="text-sm font-semibold text-white/60 mb-4">导师点评</h2>
        <MentorReview reviews={result.mentorReviews} />
      </section>

      {/* Pros and cons */}
      <section>
        <ProsConsSection pros={result.pros} cons={result.cons} />
      </section>

      {/* Suggestions */}
      <section>
        <h2 className="text-sm font-semibold text-white/60 mb-4">优化建议</h2>
        <SuggestionsSection suggestions={result.suggestions} />
      </section>
    </div>
  )
}
