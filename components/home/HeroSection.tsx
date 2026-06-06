'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Button from '@/components/shared/Button'

const TAGLINES = [
  '像导师一样指出问题，像报告一样说明依据',
  '覆盖作品评审、作品集审阅与求职准备',
  '让每一次修改都有明确方向',
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
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-[#F4EFE6]/14 bg-[#F4EFE6] text-2xl font-bold text-[#11100E]">
          DR
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-[#F4EFE6] md:text-6xl lg:text-7xl"
      >
        AI设计评审实验室
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="mt-5 max-w-2xl text-base leading-7 text-[#F4EFE6]/54 md:text-lg"
      >
        上传作品后，系统会用七维评分、红牌校准和导师视角解释它为什么好、为什么不够好，以及下一版先改哪里。
      </motion.p>

      {/* Animated tagline */}
      <motion.div
        key={lineIndex}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4 }}
        className="mt-6 h-8"
      >
        <p className="text-sm font-medium text-[#D6A85A] md:text-base">{TAGLINES[lineIndex]}</p>
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
        className="mt-16 grid w-full max-w-2xl grid-cols-3 border-y border-[#F4EFE6]/10"
      >
        {[
          { value: '2', label: '评审模式' },
          { value: '7', label: '分析维度' },
          { value: 'S~E', label: '评分体系' },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className={`py-5 text-center ${index > 0 ? 'border-l border-[#F4EFE6]/10' : ''}`}
          >
            <div className="text-2xl font-semibold text-[#F4EFE6] md:text-3xl">{stat.value}</div>
            <div className="mt-1 text-sm text-[#F4EFE6]/42">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
