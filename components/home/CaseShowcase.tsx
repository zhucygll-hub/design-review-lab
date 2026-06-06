'use client'

import { motion } from 'framer-motion'

const CASES = [
  {
    type: '课程展板',
    title: '概念够完整，但版式没有主次',
    score: 'C',
    tone: 'border-[#D6A85A]/24 bg-[#D6A85A]/10 text-[#D6A85A]',
    diagnosis: '信息密度过高，标题、图纸和渲染图在争抢同一个视觉中心。',
    action: '先删减说明文字，再把一个核心效果图放大到主视觉位置。',
  },
  {
    type: '比赛海报',
    title: '视觉记忆点强，落地信息还不够',
    score: 'B',
    tone: 'border-[#6B9CFF]/28 bg-[#6B9CFF]/10 text-[#8EB4FF]',
    diagnosis: '色彩和图形有识别度，但比赛主题与传播对象还没有被明确说出来。',
    action: '补充场景、目标人群和一句可传播的核心主张。',
  },
  {
    type: '求职作品集',
    title: '项目表达完整，岗位匹配度较清楚',
    score: 'A',
    tone: 'border-[#7EB98E]/28 bg-[#7EB98E]/10 text-[#7EE0A0]',
    diagnosis: '项目选择、过程说明和最终效果基本成立，能让面试官看到稳定的设计执行力。',
    action: '继续强化两个核心项目的决策依据，把“为什么这样做”讲得更锋利。',
  },
]

export default function CaseShowcase() {
  return (
    <section className="py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-12 max-w-2xl text-center"
      >
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#F4EFE6] md:text-3xl">
          评审样例
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#F4EFE6]/48 md:text-base">
          首页不展示虚假的优秀案例，而展示 AI 如何区分不同完成度，并指出真正影响分数的问题。
        </p>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        {CASES.map((item, index) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
            className="report-panel-soft p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="rounded-full border border-[#F4EFE6]/10 px-3 py-1 text-xs text-[#F4EFE6]/50">
                {item.type}
              </span>
              <span className={`flex h-10 w-10 items-center justify-center rounded-full border text-lg font-semibold ${item.tone}`}>
                {item.score}
              </span>
            </div>
            <h3 className="mt-6 text-xl font-semibold leading-snug tracking-[-0.02em] text-[#F4EFE6]">
              {item.title}
            </h3>
            <div className="mt-5 space-y-4 border-t border-[#F4EFE6]/10 pt-5">
              <div>
                <p className="text-xs font-medium text-[#F4EFE6]/38">诊断</p>
                <p className="mt-2 text-sm leading-6 text-[#F4EFE6]/56">{item.diagnosis}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#F4EFE6]/38">优先修改</p>
                <p className="mt-2 text-sm leading-6 text-[#F4EFE6]/56">{item.action}</p>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
