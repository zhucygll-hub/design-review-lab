'use client'

import { useState } from 'react'
import RadarChart from '@/components/result/RadarChart'
import { DimensionScore } from '@/types'

interface DimensionSummaryProps {
  dimensions: DimensionScore[]
}

function getValidDimensions(dimensions: DimensionScore[]) {
  return dimensions.filter((dimension) => typeof dimension.score === 'number') as Array<
    DimensionScore & { score: number }
  >
}

export default function DimensionSummary({ dimensions }: DimensionSummaryProps) {
  const [showAll, setShowAll] = useState(false)
  const validDimensions = getValidDimensions(dimensions)
  const sorted = [...validDimensions].sort((a, b) => a.score - b.score)
  const lowDimensions = sorted.slice(0, 2)
  const highDimension = [...validDimensions].sort((a, b) => b.score - a.score)[0]

  return (
    <section className="report-section">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="report-title text-lg mb-1">维度分析</h2>
          <p className="text-sm leading-6 text-[#F4EFE6]/45">
            默认只列出最低、第二短板和最高维度，完整分数可展开查看。
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          className="self-start rounded-full border border-[#F4EFE6]/12 px-3 py-1.5 text-xs font-medium text-[#F4EFE6]/58 transition-colors hover:border-[#F4EFE6]/24 hover:text-[#F4EFE6]"
        >
          {showAll ? '收起全部维度' : '展开全部维度'}
        </button>
      </div>

      <div className="mt-6">
        <RadarChart dimensions={dimensions} />
      </div>

      <div className="mt-6 grid gap-0 overflow-hidden border-y border-[#F4EFE6]/8 md:grid-cols-3">
        {lowDimensions.map((dimension, index) => (
          <div key={dimension.name} className="border-b border-[#F4EFE6]/8 py-4 md:border-b-0 md:border-r md:px-4">
            <p className="text-xs font-medium text-[#D6A85A]">
              {index === 0 ? '最低维度' : '第二短板'}
            </p>
            <div className="mt-2 flex items-baseline justify-between gap-3">
              <p className="text-sm font-semibold text-[#F4EFE6]">{dimension.name}</p>
              <span className="font-mono text-lg font-semibold text-[#D6A85A]">{dimension.score}</span>
            </div>
          </div>
        ))}

        {highDimension && (
          <div className="py-4 md:px-4">
            <p className="text-xs font-medium text-[#7EE0A0]">最高维度</p>
            <div className="mt-2 flex items-baseline justify-between gap-3">
              <p className="text-sm font-semibold text-[#F4EFE6]">{highDimension.name}</p>
              <span className="font-mono text-lg font-semibold text-[#7EE0A0]">{highDimension.score}</span>
            </div>
          </div>
        )}
      </div>

      {showAll && (
        <div className="mt-5 space-y-2 border-t border-[#F4EFE6]/10 pt-5">
          {dimensions.map((dimension) => {
            const isNA = dimension.score === null
            return (
              <div
                key={dimension.name}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#F4EFE6]/4 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: isNA
                        ? '#6B7280'
                        : dimension.score! >= 85
                          ? '#7EB98E'
                          : dimension.score! >= 70
                            ? '#6B9CFF'
                            : '#D6A85A',
                    }}
                  />
                  <span className={`text-sm ${isNA ? 'text-[#F4EFE6]/30' : 'text-[#F4EFE6]/68'}`}>
                    {dimension.name}
                  </span>
                </div>
                <span className="text-sm font-mono text-[#F4EFE6]/46">
                  {isNA ? 'N/A' : dimension.score}
                  {dimension.weight && <span className="text-[#F4EFE6]/22 ml-1">({dimension.weight}%)</span>}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
