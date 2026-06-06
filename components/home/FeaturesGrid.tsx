'use client'

import { motion } from 'framer-motion'

const STEPS = [
  {
    title: '提交作品语境',
    description: '先说明作品类型、用途和当前阶段，避免 AI 用同一套标准评价所有图片。',
    meta: '海报 / 展板 / 模型 / 作品集',
  },
  {
    title: '读取画面证据',
    description: '从构图、层级、色彩、叙事和完成度中提取可被解释的判断依据。',
    meta: '不是凭感觉打分',
  },
  {
    title: '七维评分校准',
    description: '维度分、总分和红牌规则会互相校准，防止“局部好看但整体不成立”。',
    meta: 'S~E 等级体系',
  },
  {
    title: '输出修改顺序',
    description: '最后给出导师视角点评和下一版优先动作，让用户知道先改什么。',
    meta: '可执行建议',
  },
]

export default function FeaturesGrid() {
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
          一次评审会经历什么
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#F4EFE6]/48 md:text-base">
          它不是上传图片后直接吐出几句评价，而是先理解语境，再把判断拆成证据、分数和修改动作。
        </p>
      </motion.div>

      <div className="report-panel overflow-hidden p-0">
        <div className="grid md:grid-cols-4">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className={`relative p-6 ${index > 0 ? 'border-t border-[#F4EFE6]/10 md:border-l md:border-t-0' : ''}`}
            >
              <div className="mb-7 flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D6A85A]/28 bg-[#D6A85A]/10 text-sm font-semibold text-[#D6A85A]">
                  {index + 1}
                </span>
                <span className="text-xs text-[#F4EFE6]/36">{step.meta}</span>
              </div>
              <h3 className="text-lg font-semibold text-[#F4EFE6]">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#F4EFE6]/52">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
