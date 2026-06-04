'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import GradientText from '@/components/shared/GradientText'
import Button from '@/components/shared/Button'

const TAGLINES = [
  '从设计学生到专业设计师的成长伙伴',
  'AI 驱动的多维设计评审实验室',
  '覆盖作品评审、作品集审阅与求职分析',
]

export default function HeroSection() {
  const [lineIndex, setLineIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setLineIndex((prev) => (prev + 1) % TAGLINES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="flex flex-col items-center justify-center text-center pt-12 pb-16 md:pt-20 md:pb-24">
      {/* Logo mark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mb-8"
      >
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#4F8CFF] to-[#7C3AED] text-2xl font-bold shadow-xl shadow-[#4F8CFF]/25">
          DR
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl"
      >
        <GradientText>AI设计评审实验室</GradientText>
      </motion.h1>

      {/* Animated tagline */}
      <motion.div
        key={lineIndex}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4 }}
        className="mt-6 h-8"
      >
        <p className="text-lg text-white/50 md:text-xl">{TAGLINES[lineIndex]}</p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-10"
      >
        <Button href="/analyze" variant="primary" size="lg">
          开始免费评审
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16"
      >
        {[
          { value: '2', label: '评审模式' },
          { value: '7', label: '分析维度' },
          { value: 'S~D', label: '评分体系' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl font-bold text-white md:text-3xl">{stat.value}</div>
            <div className="mt-1 text-sm text-white/40">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
