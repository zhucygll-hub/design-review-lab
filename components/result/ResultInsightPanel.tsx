'use client'

import { AnalysisResult, DimensionScore } from '@/types'

interface ResultInsightPanelProps {
  result: AnalysisResult
}

function getValidDimensions(dimensions: DimensionScore[]) {
  return dimensions.filter((dimension) => typeof dimension.score === 'number') as Array<
    DimensionScore & { score: number }
  >
}

function getScoreReason(result: AnalysisResult) {
  const breakdown = result.scoreBreakdown

  if (!breakdown) {
    return '本次结果基于七个维度的综合表现，并结合画面可见问题给出最终等级。'
  }

  if (breakdown.wasRedFlagCapped) {
    return `基础分是 ${breakdown.rawWeightedScore}，但作品出现 ${breakdown.redFlagCount} 项会限制等级的硬伤，所以最终分数被压到 ${breakdown.afterCalibration}。`
  }

  if (breakdown.wasHighScoreCalibrated) {
    return `基础分是 ${breakdown.rawWeightedScore}，但高等级作品需要多个维度同时稳定，所以最终分数被校准到 ${breakdown.afterCalibration}。`
  }

  return `这次没有触发硬伤检查或高分门槛，最终分数基本等于七个维度综合后的基础分：${breakdown.rawWeightedScore}。`
}

export default function ResultInsightPanel({ result }: ResultInsightPanelProps) {
  const validDimensions = getValidDimensions(result.dimensions)
  const sortedByScore = [...validDimensions].sort((a, b) => a.score - b.score)
  const weakest = sortedByScore[0]
  const strongest = sortedByScore[sortedByScore.length - 1]
  const firstPriority =
    result.suggestions.find((suggestion) => suggestion.type === 'priority') ?? result.suggestions[0]

  return (
    <section className="report-panel overflow-hidden">
      <div className="border-b border-[#F4EFE6]/10 p-6 md:p-7">
        <p className="report-kicker">报告导读</p>
        <div className="mt-3 grid gap-5 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.025em] text-[#F4EFE6] md:text-3xl">
              先看最大问题，再看完整维度
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#F4EFE6]/50">
              用户最需要先知道的不是算法细节，而是这份作品为什么没到更高档，以及下一版应该先改哪里。
            </p>
          </div>
          <p className="rounded-xl border border-[#F4EFE6]/10 bg-[#11100E]/38 p-4 text-sm leading-6 text-[#F4EFE6]/58">
            {getScoreReason(result)}
          </p>
        </div>
      </div>

      <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
        <div className="border-b border-[#F4EFE6]/10 p-6 md:border-b-0 md:border-r md:p-7">
          <p className="text-xs font-medium text-[#D6A85A]">最影响结果的问题</p>
          {weakest ? (
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold tracking-[-0.02em] text-[#F4EFE6]">
                  {weakest.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#F4EFE6]/56">{weakest.description}</p>
              </div>
              <span className="rounded-full border border-[#D6A85A]/24 bg-[#D6A85A]/10 px-3 py-1 font-mono text-lg font-semibold text-[#D6A85A]">
                {weakest.score}
              </span>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-[#F4EFE6]/54">本次没有可计算的维度分。</p>
          )}
        </div>

        <div className="p-6 md:p-7">
          <p className="text-xs font-medium text-[#7EB98E]">可保留的优势</p>
          {strongest ? (
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold tracking-[-0.02em] text-[#F4EFE6]">
                  {strongest.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#F4EFE6]/54">{strongest.description}</p>
              </div>
              <span className="rounded-full border border-[#7EB98E]/24 bg-[#7EB98E]/10 px-3 py-1 font-mono text-lg font-semibold text-[#7EE0A0]">
                {strongest.score}
              </span>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-[#F4EFE6]/54">本次没有可计算的维度分。</p>
          )}
        </div>
      </div>

      {firstPriority && (
        <div className="border-t border-[#6B9CFF]/18 bg-[#6B9CFF]/7 p-6 md:p-7">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-medium text-[#8EB4FF]">下一版先改这里</p>
              <p className="mt-2 text-lg font-semibold leading-8 text-[#F4EFE6]">
                {firstPriority.content}
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-[#6B9CFF]/20 px-3 py-1 text-xs text-[#8EB4FF]">
              优先动作
            </span>
          </div>
        </div>
      )}
    </section>
  )
}
