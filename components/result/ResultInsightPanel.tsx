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
    return '本次结果以七个维度的综合表现为基础，结合对画面问题的判断给出最终等级。'
  }

  if (breakdown.wasRedFlagCapped) {
    return `虽然部分维度表现不错（基础分 ${breakdown.rawWeightedScore}），但作品存在 ${breakdown.redFlagCount} 个会影响整体成立的核心问题（硬伤），因此最终等级被限制在对应上限（最终分 ${breakdown.afterCalibration}）。优先解决这些硬伤，比继续打磨细节更重要。`
  }

  if (breakdown.wasHighScoreCalibrated) {
    return `作品基础分 ${breakdown.rawWeightedScore} 属于不错的水准，但高等级作品需要多个维度同时稳定——尤其是视觉表达、概念清晰度、完成度不能有明显短板。当前还缺少一些条件，因此最终分数被调整到 ${breakdown.afterCalibration}。把短板补上比继续拉长板更有效。`
  }

  return `这次评审没有触发硬伤限制或高分门槛，最终分数基本等于七个维度的综合基础分（${breakdown.rawWeightedScore}）。`
}

export default function ResultInsightPanel({ result }: ResultInsightPanelProps) {
  const validDimensions = getValidDimensions(result.dimensions)
  const sortedByScore = [...validDimensions].sort((a, b) => a.score - b.score)
  const weakest = sortedByScore[0]
  const strongest = sortedByScore[sortedByScore.length - 1]
  const firstPriority =
    result.suggestions.find((suggestion) => suggestion.type === 'priority') ?? result.suggestions[0]

  return (
    <section className="report-panel p-6 md:p-7">
      <div className="flex flex-col gap-2 border-b border-[#F4EFE6]/10 pb-5">
        <p className="report-kicker">报告导读</p>
        <h2 className="report-title text-xl">先看这三件事</h2>
        <p className="max-w-2xl text-sm leading-6 text-[#F4EFE6]/48">
          这里把完整报告压缩成评分依据、最大短板和下一步动作，方便你先判断这份作品最该改哪里。
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#F4EFE6]/10 bg-[#11100E]/50 p-4">
          <p className="text-xs font-medium text-[#F4EFE6]/38">为什么是这个等级</p>
          <p className="mt-3 text-sm leading-6 text-[#F4EFE6]/62">{getScoreReason(result)}</p>
        </div>

        <div className="rounded-xl border border-[#D6A85A]/18 bg-[#D6A85A]/7 p-4">
          <p className="text-xs font-medium text-[#D6A85A]">最影响结果的短板</p>
          {weakest ? (
            <>
              <div className="mt-3 flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold text-[#F4EFE6]">{weakest.name}</p>
                <span className="font-mono text-lg font-semibold text-[#D6A85A]">{weakest.score}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#F4EFE6]/54">{weakest.description}</p>
            </>
          ) : (
            <p className="mt-3 text-sm leading-6 text-[#F4EFE6]/54">本次没有可计算的维度分。</p>
          )}
        </div>

        <div className="rounded-xl border border-[#7EB98E]/18 bg-[#7EB98E]/7 p-4">
          <p className="text-xs font-medium text-[#7EB98E]">可保留的优势</p>
          {strongest ? (
            <>
              <div className="mt-3 flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold text-[#F4EFE6]">{strongest.name}</p>
                <span className="font-mono text-lg font-semibold text-[#7EE0A0]">{strongest.score}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#F4EFE6]/54">{strongest.description}</p>
            </>
          ) : (
            <p className="mt-3 text-sm leading-6 text-[#F4EFE6]/54">本次没有可计算的维度分。</p>
          )}
        </div>
      </div>

      {firstPriority && (
        <div className="mt-4 rounded-xl border border-[#6B9CFF]/18 bg-[#6B9CFF]/7 p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-medium text-[#8EB4FF]">下一版先做</p>
              <p className="mt-2 text-sm leading-6 text-[#F4EFE6]/64">{firstPriority.content}</p>
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
