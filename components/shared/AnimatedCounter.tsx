'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  from?: number
  to: number
  duration?: number
  suffix?: string
  className?: string
}

export default function AnimatedCounter({
  from = 0,
  to,
  duration = 1.5,
  suffix = '',
  className = '',
}: AnimatedCounterProps) {
  const [value, setValue] = useState(from)
  const startTime = useRef<number | null>(null)
  const raf = useRef<number>(0)

  useEffect(() => {
    startTime.current = null
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp
      const elapsed = timestamp - startTime.current
      const progress = Math.min(elapsed / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(from + (to - from) * eased))
      if (progress < 1) {
        raf.current = requestAnimationFrame(animate)
      }
    }
    raf.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf.current)
  }, [from, to, duration])

  return (
    <span className={className}>
      {value}
      {suffix}
    </span>
  )
}
