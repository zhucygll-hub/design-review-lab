'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/shared/GlassCard'
import Button from '@/components/shared/Button'

interface TargetInputCardProps {
  onSubmit: (data: { company: string; role: string; jd: string }) => void
  onSkip: () => void
}

export default function TargetInputCard({ onSubmit, onSkip }: TargetInputCardProps) {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [jd, setJd] = useState('')

  const handleSubmit = () => {
    onSubmit({ company: company.trim(), role: role.trim(), jd: jd.trim() })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <GlassCard className="p-6 space-y-5">
        <div className="text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED]/20 to-[#4F8CFF]/20 mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="5" />
              <path d="M20 21a8 8 0 1 0-16 0" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">在继续之前...</h3>
          <p className="text-sm text-white/40 mt-1">
            为了给你更精准的岗位匹配分析，请告诉我们你的目标
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">
              目标公司
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="如：字节跳动、小米、大疆..."
              className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#7C3AED]/40 focus:bg-white/[0.05] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">
              目标岗位
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="如：UI/UX设计师、工业设计师..."
              className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#7C3AED]/40 focus:bg-white/[0.05] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">
              岗位描述 JD <span className="text-white/20">（选填，分析更精准）</span>
            </label>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="粘贴目标岗位的 JD 描述..."
              rows={3}
              className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#7C3AED]/40 focus:bg-white/[0.05] transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onSkip} className="flex-1">
            跳过
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} className="flex-1">
            开始分析匹配度
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  )
}
