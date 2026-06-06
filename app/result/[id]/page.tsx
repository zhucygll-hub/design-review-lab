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
import { numericToScore, getScoreLabel } from '@/lib/score-utils'

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
        <div className="h-8 w-8 rounded-full border-2 border-[#6B9CFF] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-[#F4EFE6]/45">未找到分析结果</p>
        <Link
          href="/analyze"
          className="text-sm text-[#6B9CFF] hover:underline"
        >
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
              这份报告会先说明最终等级，再解释分数如何被计算和校准，最后给出导师视角与修改建议。
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

      {/* Score */}
      <section>
        <ScoreBadge
          score={result.score}
          scoreLabel={result.scoreLabel}
          scoreNumeric={result.scoreNumeric}
        />
      </section>

      {/* Score calibration explanation */}
      {result.scoreBreakdown && (
        <section className="report-panel p-6">
          <h2 className="report-title text-lg">评分依据</h2>
          <p className="mt-1 text-sm text-[#F4EFE6]/45">
            这里解释为什么最终分数可能低于七维加权分。
          </p>

          {/* Raw weighted score */}
          <div className="mt-5 flex items-center justify-between rounded-xl bg-[#11100E]/60 px-4 py-3">
            <span className="text-sm text-[#F4EFE6]/54">七维加权原始分</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-[#F4EFE6]/76">
                {result.scoreBreakdown.rawWeightedScore} 分
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F4EFE6]/6 text-[#F4EFE6]/42">
                {getScoreLabel(numericToScore(result.scoreBreakdown.rawWeightedScore))}
              </span>
            </div>
          </div>

          {/* Red flag cap */}
          {result.scoreBreakdown.wasRedFlagCapped && (
            <div className="mt-4 space-y-3 rounded-xl border border-[#E45A4F]/18 bg-[#E45A4F]/6 p-4">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E45A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span className="text-sm font-semibold text-[#E45A4F]">
                  触发红牌封顶规则
                </span>
                <span className="text-[11px] text-[#E45A4F]/65 ml-auto">
                  {result.scoreBreakdown.redFlagCount} 条
                </span>
              </div>

              <ul className="space-y-1.5">
                {result.redFlags.map((flag, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#F4EFE6]/58">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[#E45A4F]/65 shrink-0" />
                    {flag}
                  </li>
                ))}
              </ul>

              <div className="pt-2 border-t border-[#E45A4F]/12">
                <p className="text-xs text-[#F4EFE6]/46 leading-relaxed">
                  {result.scoreBreakdown.redFlagCount >= 3
                    ? '≥3 条红牌 → 总分上限强制封顶至 59 分（E 级），无论维度分数如何。'
                    : result.scoreBreakdown.redFlagCount >= 2
                      ? '≥2 条红牌 → 总分上限强制封顶至 69 分（D 级），无论维度分数如何。'
                      : '≥1 条红牌 → 总分上限强制封顶至 79 分（C 级），无论维度分数如何。'}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 text-center py-2 rounded-lg bg-[#11100E]/48">
                  <div className="text-[11px] text-[#F4EFE6]/30 mb-0.5">原始加权</div>
                  <div className="text-sm font-mono text-[#F4EFE6]/52">
                    {result.scoreBreakdown.rawWeightedScore}
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E45A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
                <div className="flex-1 text-center py-2 rounded-lg bg-[#E45A4F]/8 border border-[#E45A4F]/14">
                  <div className="text-[11px] text-[#E45A4F]/65 mb-0.5">封顶后（最终）</div>
                  <div className="text-sm font-mono font-semibold text-[#E45A4F]">
                    {result.scoreBreakdown.afterRedFlagCap}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* High score calibration (no red flag cap) */}
          {result.scoreBreakdown.wasHighScoreCalibrated && !result.scoreBreakdown.wasRedFlagCapped && (
            <div className="mt-4 p-4 rounded-xl bg-[#6B9CFF]/6 border border-[#6B9CFF]/18">
              <div className="flex items-center gap-2 mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B9CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span className="text-sm font-semibold text-[#8EB4FF]">高分校准已触发</span>
              </div>
              <p className="text-xs text-[#F4EFE6]/48 leading-relaxed">
                根据评分体系严格校准规则（视觉表达门槛、强维度数量、弱维度限制等），
                系统进行了二次校准以确保评分一致性。
              </p>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#6B9CFF]/12">
                <div className="flex-1 text-center py-2 rounded-lg bg-[#11100E]/48">
                  <div className="text-[11px] text-[#F4EFE6]/30 mb-0.5">加权原始</div>
                  <div className="text-sm font-mono text-[#F4EFE6]/52">
                    {result.scoreBreakdown.rawWeightedScore}
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B9CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
                <div className="flex-1 text-center py-2 rounded-lg bg-[#6B9CFF]/8 border border-[#6B9CFF]/14">
                  <div className="text-[11px] text-[#8EB4FF]/65 mb-0.5">校准后</div>
                  <div className="text-sm font-mono font-semibold text-[#8EB4FF]">
                    {result.scoreBreakdown.afterCalibration}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No calibration — brief confirmation */}
          {!result.scoreBreakdown.wasRedFlagCapped && !result.scoreBreakdown.wasHighScoreCalibrated && (
            <div className="mt-3 flex items-center gap-2 text-xs text-[#F4EFE6]/38">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              未触发红牌封顶或高分校准，最终得分为七维加权计算结果
            </div>
          )}

          {/* Boundary proximity warning */}
          {result.scoreBreakdown.boundaryProximity && (
            <div className="mt-4 p-3 rounded-xl bg-[#D6A85A]/7 border border-[#D6A85A]/18 flex items-start gap-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D6A85A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <span className="text-xs font-semibold text-[#D6A85A]">
                  该分数接近 {result.scoreBreakdown.boundaryProximity} 等级边界
                </span>
                <p className="text-xs text-[#F4EFE6]/42 mt-0.5 leading-relaxed">
                  由于 AI 视觉模型即使在固定种子下也存在 ±2-4 分的正常评分波动，
                  同一作品在不同次分析中可能在相邻档位间变化。这不是系统计算错误。
                </p>
              </div>
            </div>
          )}

          {/* AI calibration note */}
          {result.calibrationNote && (
            <div className="mt-4 p-3 rounded-lg bg-[#11100E]/48 border border-[#F4EFE6]/7">
              <p className="text-[11px] text-[#F4EFE6]/32 mb-1">AI 评审备注</p>
              <p className="text-xs text-[#F4EFE6]/48 leading-relaxed">{result.calibrationNote}</p>
            </div>
          )}
        </section>
      )}

      {/* Radar chart */}
      <section className="report-panel p-6">
        <h2 className="report-title text-lg mb-1">
          维度分析
        </h2>
        <p className="mb-6 text-sm text-[#F4EFE6]/45">
          七个维度按权重计算，雷达图用于观察优势与短板分布。
        </p>
        <RadarChart dimensions={result.dimensions} />
        {/* Dimension detail list */}
        <div className="mt-6 space-y-2">
          {result.dimensions.map((dim) => {
              const isNA = dim.score === null
              return (
            <div
              key={dim.name}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#F4EFE6]/4 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: isNA
                      ? '#6B7280'
                      : dim.score! >= 85
                        ? '#7EB98E'
                        : dim.score! >= 70
                        ? '#6B9CFF'
                        : '#D6A85A',
                  }}
                />
                <span className={`text-sm ${isNA ? 'text-[#F4EFE6]/30' : 'text-[#F4EFE6]/68'}`}>
                  {dim.name}
                </span>
              </div>
              <span className="text-sm font-mono text-[#F4EFE6]/46">
                {isNA ? 'N/A' : dim.score}
                {dim.weight && <span className="text-[#F4EFE6]/22 ml-1">({dim.weight}%)</span>}
              </span>
            </div>
              )
          })}
        </div>
      </section>

      {/* Target info (portfolio mode only) */}
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

      {/* Mentor reviews */}
      <section>
        <h2 className="report-title text-lg mb-4">导师点评</h2>
        <MentorReview reviews={result.mentorReviews} />
      </section>

      {/* Pros and cons */}
      <section>
        <ProsConsSection pros={result.pros} cons={result.cons} />
      </section>

      {/* Suggestions */}
      <section>
        <h2 className="report-title text-lg mb-4">优化建议</h2>
        <SuggestionsSection suggestions={result.suggestions} />
      </section>
    </div>
  )
}
