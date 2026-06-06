'use client'

import { motion } from 'framer-motion'

const OBSERVATIONS = [
  {
    author: '张同学',
    role: '工业设计专业，大四',
    context: '课程展板修改前',
    content: '我原本只觉得图太满，评审把问题拆成主视觉、信息层级和说明文字三块，我才知道第一步该删什么。',
  },
  {
    author: '陈同学',
    role: '视觉传达专业，研二',
    context: '作品集投递前',
    content: '它没有一直夸完成度，而是指出我每个项目都缺少过程证据。这个判断比单纯给高分更有用。',
  },
  {
    author: '李同学',
    role: 'UI/UX 设计师，已入职',
    context: '面试准备期',
    content: '作品集评审让我提前整理了设计决策依据。后来面试官问到类似问题时，我能回答得更清楚。',
  },
]

export default function Testimonials() {
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
          使用者观察
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#F4EFE6]/48 md:text-base">
          对设计学生来说，最重要的不是被鼓励，而是知道下一版怎么改得更像一个成熟作品。
        </p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        {OBSERVATIONS.map((item, index) => (
          <motion.figure
            key={item.author}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
            className="report-panel-soft flex min-h-[260px] flex-col p-6"
          >
            <div className="mb-8 flex items-center justify-between gap-4">
              <span className="text-xs text-[#D6A85A]">{item.context}</span>
              <span className="h-px flex-1 bg-[#F4EFE6]/10" />
            </div>
            <blockquote className="flex-1 text-base leading-7 text-[#F4EFE6]/66">
              “{item.content}”
            </blockquote>
            <figcaption className="mt-8 border-t border-[#F4EFE6]/10 pt-4">
              <p className="text-sm font-semibold text-[#F4EFE6]">{item.author}</p>
              <p className="mt-1 text-xs text-[#F4EFE6]/40">{item.role}</p>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  )
}
