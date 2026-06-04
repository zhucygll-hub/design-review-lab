'use client'

import { motion } from 'framer-motion'
import GlassCard from '@/components/shared/GlassCard'
import { testimonials } from '@/lib/mock-data'

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <h2 className="text-2xl font-bold md:text-3xl">用户评价</h2>
        <p className="mt-3 text-white/40">来自设计专业学生的真实反馈</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.author}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
          >
            <GlassCard className="flex flex-col gap-4 h-full" hover={false}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#4F8CFF" opacity="0.3">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-sm text-white/60 leading-relaxed flex-1">{t.content}</p>
              <div className="border-t border-white/5 pt-4">
                <p className="text-sm font-semibold">{t.author}</p>
                <p className="text-xs text-white/40 mt-0.5">{t.role}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
