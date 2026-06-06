'use client'

import { motion } from 'framer-motion'

const CASES = [
  {
    type: '课程展板',
    title: '概念够完整，但版式没有主次',
    score: 'C',
    diagnosis: '信息密度过高，标题、图纸和渲染图在争抢同一个视觉中心。',
    action: '先删减说明文字，再把一个核心效果图放大到主视觉位置。',
  },
  {
    type: '比赛海报',
    title: '视觉记忆点强，落地信息不足',
    score: 'B',
    diagnosis: '色彩和图形有识别度，但参赛主题与传播对象没有被明确说出来。',
    action: '补充场景、目标人群和一句可传播的核心主张。',
  },
  {
    type: '求职作品集',
    title: '项目数量够，但岗位匹配度不清',
    score: 'B',
    diagnosis: '作品看起来完成度不错，但缺少过程证据，面试官难判断你的设计决策能力。',
    action: '每个项目增加问题定义、方案取舍和最终验证。',
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
          首页不展示虚假的优秀案例，而展示 AI 会怎样指出作品中真正影响分数的问题。
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
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D6A85A]/24 bg-[#D6A85A]/10 text-lg font-semibold text-[#D6A85A]">
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
