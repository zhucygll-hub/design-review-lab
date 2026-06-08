'use client'

import { AnalysisResult } from '@/types'
import { getScoreLabel, numericToScore } from '@/lib/score-utils'

interface ScoreEvidenceProps {
  result: AnalysisResult
}

export default function ScoreEvidence({ result }: ScoreEvidenceProps) {
  const breakdown = result.scoreBreakdown
  if (!breakdown) return null

  return (
    <div className="space-y-4 border-t border-[#F4EFE6]/10 p-6 md:p-8">
      <div>
        <h2 className="text-base font-semibold text-[#F4EFE6]">评分依据</h2>
        <p className="mt-1 text-sm leading-6 text-[#F4EFE6]/48">
          先看基础分，再看是否存在会限制等级的硬伤，最后判断是否达到高分门槛。
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-[#F4EFE6]/10 bg-[#11100E]/45 p-4">
          <p className="text-xs text-[#F4EFE6]/38">基础分</p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <span className="font-mono text-2xl font-semibold text-[#F4EFE6]">
              {breakdown.rawWeightedScore}
            </span>
            <span className="rounded-full bg-[#F4EFE6]/6 px-2 py-0.5 text-[11px] text-[#F4EFE6]/44">
              {getScoreLabel(numericToScore(breakdown.rawWeightedScore))}
            </span>
          </div>
          <p className="mt-3 text-xs leading-5 text-[#F4EFE6]/42">
            系统先根据七个维度计算作品的综合表现。
          </p>
        </div>

        <div className={`rounded-xl border p-4 ${
          breakdown.wasRedFlagCapped
            ? 'border-[#E45A4F]/20 bg-[#E45A4F]/7'
            : 'border-[#7EB98E]/18 bg-[#7EB98E]/7'
        }`}>
          <p className={`text-xs ${breakdown.wasRedFlagCapped ? 'text-[#F87171]' : 'text-[#7EE0A0]'}`}>
            硬伤检查
          </p>
          <p className="mt-2 text-sm font-semibold text-[#F4EFE6]">
            {breakdown.wasRedFlagCapped ? `触发 ${breakdown.redFlagCount} 项` : '未触发'}
          </p>
          <p className="mt-3 text-xs leading-5 text-[#F4EFE6]/44">
            硬伤是会影响作品整体成立的问题，例如主题不清、信息无法阅读、主视觉混乱或完成度明显不足。
          </p>
        </div>

        <div className={`rounded-xl border p-4 ${
          breakdown.wasHighScoreCalibrated
            ? 'border-[#6B9CFF]/20 bg-[#6B9CFF]/7'
            : 'border-[#F4EFE6]/10 bg-[#11100E]/45'
        }`}>
          <p className={`text-xs ${breakdown.wasHighScoreCalibrated ? 'text-[#8EB4FF]' : 'text-[#F4EFE6]/38'}`}>
            高分门槛
          </p>
          <p className="mt-2 text-sm font-semibold text-[#F4EFE6]">
            {breakdown.wasHighScoreCalibrated ? '已校准' : '未触发'}
          </p>
          <p className="mt-3 text-xs leading-5 text-[#F4EFE6]/44">
            高等级作品不能只靠一项拉分，需要多个维度同时稳定，尤其是视觉表达、概念清晰度和完成度。
          </p>
        </div>
      </div>

      {breakdown.wasRedFlagCapped && (
        <div className="rounded-xl border border-[#E45A4F]/18 bg-[#E45A4F]/6 p-4">
          <p className="text-sm font-semibold text-[#F87171]">为什么最终等级被限制</p>
          <p className="mt-2 text-sm leading-6 text-[#F4EFE6]/56">
            虽然部分维度表现不错，但作品存在会影响整体成立的核心问题。优先处理这些硬伤，比继续打磨细节更重要。
          </p>
          {result.redFlags.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {result.redFlags.map((flag, index) => (
                <li key={index} className="flex items-start gap-2 text-xs leading-5 text-[#F4EFE6]/58">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E45A4F]/70" />
                  {flag}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {breakdown.wasHighScoreCalibrated && !breakdown.wasRedFlagCapped && (
        <div className="rounded-xl border border-[#6B9CFF]/18 bg-[#6B9CFF]/7 p-4">
          <p className="text-sm font-semibold text-[#8EB4FF]">为什么没有进入更高档位</p>
          <p className="mt-2 text-sm leading-6 text-[#F4EFE6]/56">
            作品整体不错，但还没有达到高等级作品应有的稳定性。把短板补上，比继续强化已经不错的部分更有效。
          </p>
        </div>
      )}

      {!breakdown.wasRedFlagCapped && !breakdown.wasHighScoreCalibrated && (
        <div className="flex items-start gap-2 rounded-xl border border-[#7EB98E]/16 bg-[#7EB98E]/7 p-4 text-sm leading-6 text-[#F4EFE6]/56">
          <span className="mt-1 text-[#7EE0A0]">✓</span>
          这次没有发现会限制等级上限的硬伤，也没有触发高分门槛校准，所以最终分数基本等于基础分。
        </div>
      )}

      {breakdown.boundaryProximity && (
        <div className="rounded-xl border border-[#D6A85A]/18 bg-[#D6A85A]/7 p-4">
          <p className="text-sm font-semibold text-[#D6A85A]">
            该分数接近 {breakdown.boundaryProximity} 等级边界
          </p>
          <p className="mt-2 text-xs leading-5 text-[#F4EFE6]/44">
            {breakdown.stabilityZoneApplied
              ? '已自动进行稳定性校准。当前作品在各项指标上没有足够证据支撑更高档位，因此做了保守判定。建议重点看具体短板和修改建议，不要只看字母等级。'
              : '类似作品在不同评审中可能落在相邻档位。建议重点看具体短板和修改建议，不要只看字母等级。'}
          </p>
        </div>
      )}

      {result.calibrationNote && (
        <div className="rounded-xl border border-[#F4EFE6]/8 bg-[#11100E]/45 p-4">
          <p className="text-xs text-[#F4EFE6]/34">评审备注</p>
          <p className="mt-1 text-xs leading-5 text-[#F4EFE6]/48">{result.calibrationNote}</p>
        </div>
      )}
    </div>
  )
}
