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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#F4EFE6]/10 bg-[#11100E]/64 mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D6A85A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5H20" />
              <path d="M6 9H14" />
              <path d="M6 13H12" />
              <path d="M15 18L17 20L21 15" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#F4EFE6]">补充评审背景</h3>
          <p className="text-sm text-[#F4EFE6]/45 mt-1">
            目标信息会帮助系统判断作品集是否适合对应岗位
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#F4EFE6]/45 mb-1.5">
              目标公司
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="如：字节跳动、小米、大疆..."
              className="w-full rounded-xl bg-[#11100E]/60 border border-[#F4EFE6]/10 px-4 py-3 text-sm text-[#F4EFE6] placeholder:text-[#F4EFE6]/24 focus:outline-none focus:border-[#D6A85A]/50 focus:bg-[#11100E]/80 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#F4EFE6]/45 mb-1.5">
              目标岗位
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="如：UI/UX设计师、工业设计师..."
              className="w-full rounded-xl bg-[#11100E]/60 border border-[#F4EFE6]/10 px-4 py-3 text-sm text-[#F4EFE6] placeholder:text-[#F4EFE6]/24 focus:outline-none focus:border-[#D6A85A]/50 focus:bg-[#11100E]/80 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#F4EFE6]/45 mb-1.5">
              岗位描述 JD <span className="text-[#F4EFE6]/25">（选填，分析更精准）</span>
            </label>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="粘贴目标岗位的 JD 描述..."
              rows={3}
              className="w-full rounded-xl bg-[#11100E]/60 border border-[#F4EFE6]/10 px-4 py-3 text-sm text-[#F4EFE6] placeholder:text-[#F4EFE6]/24 focus:outline-none focus:border-[#D6A85A]/50 focus:bg-[#11100E]/80 transition-all resize-none"
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
