'use client'

import { useEffect, useRef, useState } from 'react'
import { DimensionScore } from '@/types'

interface RadarChartProps {
  dimensions: DimensionScore[]
}

export default function RadarChart({ dimensions }: RadarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [animated, setAnimated] = useState(false)

  const size = 300
  const center = size / 2
  const radius = 100
  const levels = 5
  const count = dimensions.length
  const angleSlice = (2 * Math.PI) / count

  // Get numeric score, treating null as 0 for animation
  const getScore = (score: number | null): number => score ?? 0

  const getCoord = (index: number, value: number): [number, number] => {
    const angle = angleSlice * index - Math.PI / 2
    const r = radius * (value / 100)
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)]
  }

  const getLevelCoord = (index: number, level: number): [number, number] => {
    const angle = angleSlice * index - Math.PI / 2
    const r = radius * (level / levels)
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)]
  }

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 500)
    return () => clearTimeout(timer)
  }, [])

  // Build data path from valid dimensions only
  const dataPath = dimensions
    .map((d, i) => {
      const score = getScore(d.score)
      const [x, y] = getCoord(i, animated ? score : 0)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ') + ' Z'

  const gridPaths = Array.from({ length: levels }, (_, level) =>
    dimensions
      .map((_, i) => {
        const [x, y] = getLevelCoord(i, level + 1)
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ') + ' Z'
  )

  const axisLines = dimensions
    .map((_, i) => {
      const [x, y] = getCoord(i, 100)
      return `M ${center} ${center} L ${x} ${y}`
    })
    .join(' ')

  return (
    <div className="flex justify-center">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[300px] h-auto"
      >
        {/* Grid levels */}
        {gridPaths.map((path, i) => (
          <path
            key={i}
            d={path}
            fill="none"
            stroke="rgba(244,239,230,0.08)"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        <path d={axisLines} stroke="rgba(244,239,230,0.10)" strokeWidth="1" />

        {/* Data area */}
        <path
          d={dataPath}
          fill="rgba(107,156,255,0.12)"
          stroke="#8EB4FF"
          strokeWidth="1.5"
          style={{
            transition: 'all 1s ease-out',
          }}
        />

        {/* Data points */}
        {dimensions.map((d, i) => {
          const score = getScore(d.score)
          const [x, y] = getCoord(i, animated ? score : 0)
          const isNA = d.score === null
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={isNA ? 0 : 4}
              fill={isNA ? 'transparent' : '#8EB4FF'}
              stroke={isNA ? 'transparent' : '#11100E'}
              strokeWidth="1.5"
              style={{ transition: 'all 1s ease-out' }}
            />
          )
        })}

        {/* Labels */}
        {dimensions.map((d, i) => {
          const [x, y] = getCoord(i, 125)
          const textAnchor =
            x < center - 10 ? 'end' : x > center + 10 ? 'start' : 'middle'
          const isNA = d.score === null
          const label = isNA ? `${d.name} (N/A)` : d.name
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              className="text-[10px]"
              fill={isNA ? 'rgba(244,239,230,0.28)' : 'rgba(244,239,230,0.58)'}
            >
              {label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
