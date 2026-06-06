'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Button from '@/components/shared/Button'

const TAGLINES = [
  '像导师一样指出问题，像报告一样说明依据',
  '覆盖作品评审、作品集审阅与求职准备',
  '让每一次修改都有明确方向',
]

const SUMMARY_ROWS = [
  { label: '原始加权分', value: '72', note: '视觉完成度拉高了平均值' },
  { label: '红牌校准后', value: '64', note: '概念表达与版式秩序不足' },
  { label: '最大短板', value: '视觉表达', note: '主次关系和留白需要重排' },
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
    <section className="pt-10 pb-16 md:pt-18 md:pb-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mx-auto mb-7 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-[#F4EFE6]/16 bg-[#F4EFE6] text-xl font-bold text-[#11100E] lg:mx-0"
          >
            DR
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="max-w-3xl text-4xl font-semibold tracking-[-0.035em] text-[#F4EFE6] md:text-6xl"
          >
            AI设计评审实验室
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#F4EFE6]/58 md:text-lg lg:mx-0"
          >
            上传作品后，系统会用七维评分、红牌校准和导师视角解释它为什么好、为什么不够好，以及下一版先改哪里。
          </motion.p>

          <motion.div
            key={lineIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-6 min-h-7"
          >
            <p className="text-sm font-medium text-[#D6A85A] md:text-base">{TAGLINES[lineIndex]}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.42 }}
            className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start"
          >
            <Button href="/analyze" variant="primary" size="lg">
              开始免费评审
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Button>
            <span className="text-sm text-[#F4EFE6]/42">适合课程作业、比赛投稿和作品集准备</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="report-panel p-5 md:p-6"
        >
          <div className="flex items-start justify-between gap-4 border-b border-[#F4EFE6]/10 pb-5">
            <div>
              <p className="text-sm font-medium text-[#D6A85A]">评审摘要样例</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#F4EFE6]">
                不是只给分，而是解释扣分依据
              </h2>
            </div>
            <div className="rounded-full border border-[#EF4444]/25 bg-[#EF4444]/10 px-3 py-1 text-sm font-semibold text-[#F87171]">
              C
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {SUMMARY_ROWS.map((row) => (
              <div key={row.label} className="grid grid-cols-[88px_52px_1fr] items-center gap-3 rounded-xl border border-[#F4EFE6]/8 bg-[#11100E]/50 p-3">
                <span className="text-sm text-[#F4EFE6]/46">{row.label}</span>
                <span className="text-xl font-semibold text-[#F4EFE6]">{row.value}</span>
                <span className="text-sm leading-5 text-[#F4EFE6]/56">{row.note}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-[#D6A85A]/22 bg-[#D6A85A]/8 p-4">
            <p className="text-sm font-semibold text-[#F4EFE6]">下一版优先动作</p>
            <p className="mt-2 text-sm leading-6 text-[#F4EFE6]/58">
              先重排信息层级，保留一个主视觉焦点，再补充概念推导。不要继续增加装饰元素。
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.72 }}
        className="mt-14 grid border-y border-[#F4EFE6]/10 md:grid-cols-3"
      >
        {[
          { value: '2', label: '评审模式' },
          { value: '7', label: '分析维度' },
          { value: 'S~E', label: '评分体系' },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className={`py-5 text-center ${index > 0 ? 'border-t border-[#F4EFE6]/10 md:border-l md:border-t-0' : ''}`}
          >
            <div className="text-2xl font-semibold text-[#F4EFE6] md:text-3xl">{stat.value}</div>
            <div className="mt-1 text-sm text-[#F4EFE6]/42">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
