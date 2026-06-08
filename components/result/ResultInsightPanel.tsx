'use client'

import { AnalysisResult, DimensionScore } from '@/types'

interface ResultInsightPanelProps {
  result: AnalysisResult
}

type PriorityProblem = {
  title: string
  detail: string
  score?: number
  tone: 'risk' | 'action' | 'warning'
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

function buildPriorityProblems(result: AnalysisResult): PriorityProblem[] {
  const validDimensions = getValidDimensions(result.dimensions)
  const lowDimensions = [...validDimensions].sort((a, b) => a.score - b.score).slice(0, 2)
  const firstPriority =
    result.suggestions.find((suggestion) => suggestion.type === 'priority') ?? result.suggestions[0]
  const firstRedFlag = result.redFlags[0]

  const problems: PriorityProblem[] = lowDimensions.map((dimension, index) => ({
    title: index === 0 ? dimension.name : `第二短板：${dimension.name}`,
    detail: dimension.description,
    score: dimension.score,
    tone: index === 0 ? 'risk' : 'warning',
  }))

  if (firstRedFlag) {
    problems.push({
      title: '需要先排除的硬伤',
      detail: firstRedFlag,
      tone: 'risk',
    })
  } else if (firstPriority) {
    problems.push({
      title: '下一版先改这里',
      detail: firstPriority.content,
      tone: 'action',
    })
  }

  return problems.slice(0, 3)
}

export default function ResultInsightPanel({ result }: ResultInsightPanelProps) {
  const validDimensions = getValidDimensions(result.dimensions)
  const strongest = [...validDimensions].sort((a, b) => b.score - a.score)[0]
  const priorityProblems = buildPriorityProblems(result)

  return (
    <section className="report-panel overflow-hidden">
      <div className="border-b border-[#F4EFE6]/10 p-6 md:p-7">
        <p className="report-kicker">报告导读</p>
        <div className="mt-3 grid gap-5 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.025em] text-[#F4EFE6] md:text-3xl">
              先看这 3 个问题
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#F4EFE6]/50">
              这里先把影响总评和修改方向的关键问题列出来，再进入完整维度和导师点评。
            </p>
          </div>
          <p className="rounded-xl border border-[#F4EFE6]/10 bg-[#11100E]/38 p-4 text-sm leading-6 text-[#F4EFE6]/58">
            {getScoreReason(result)}
          </p>
        </div>
      </div>

      <div className="divide-y divide-[#F4EFE6]/8">
        {priorityProblems.map((problem, index) => {
          const color =
            problem.tone === 'action'
              ? '#8EB4FF'
              : problem.tone === 'warning'
                ? '#D6A85A'
                : '#F87171'

          return (
            <div
              key={`${problem.title}-${index}`}
              className="grid gap-4 p-5 md:grid-cols-[64px_1fr_80px] md:items-start"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold"
                style={{ backgroundColor: `${color}18`, color }}
              >
                {index + 1}
              </span>
              <div>
                <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#F4EFE6]">
                  {problem.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#F4EFE6]/58">{problem.detail}</p>
              </div>
              {typeof problem.score === 'number' && (
                <span
                  className="justify-self-start rounded-full border px-3 py-1 font-mono text-sm font-semibold md:justify-self-end"
                  style={{ borderColor: `${color}40`, backgroundColor: `${color}14`, color }}
                >
                  {problem.score}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {strongest && (
        <div className="border-t border-[#7EB98E]/18 bg-[#7EB98E]/6 p-6 md:p-7">
          <p className="text-xs font-medium text-[#7EE0A0]">可以保留的优势</p>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-xl font-semibold tracking-[-0.02em] text-[#F4EFE6]">
                {strongest.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#F4EFE6]/54">{strongest.description}</p>
            </div>
            <span className="shrink-0 rounded-full border border-[#7EB98E]/24 bg-[#7EB98E]/10 px-3 py-1 font-mono text-lg font-semibold text-[#7EE0A0]">
              {strongest.score}
            </span>
          </div>
        </div>
      )}
    </section>
  )
}
