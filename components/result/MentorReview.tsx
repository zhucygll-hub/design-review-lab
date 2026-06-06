'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MentorReview as MentorReviewType, MentorRole } from '@/types'

const ROLE_TABS: { key: MentorRole; label: string; icon: string }[] = [
  { key: 'graduation_tutor', label: '毕业导师', icon: '🎓' },
  { key: 'design_director', label: '设计总监', icon: '💼' },
  { key: 'interviewer', label: '企业面试官', icon: '🤝' },
  { key: 'ux_researcher', label: '用户研究员', icon: '🔍' },
]

interface MentorReviewProps {
  reviews: MentorReviewType[]
}

export default function MentorReview({ reviews }: MentorReviewProps) {
  const [activeTab, setActiveTab] = useState<MentorRole>('graduation_tutor')
  const activeReview = reviews.find((r) => r.role === activeTab)

  return (
    <div className="report-panel overflow-hidden">
      <div className="flex overflow-x-auto border-b border-[#F4EFE6]/8 scrollbar-none bg-[#11100E]/38">
        {ROLE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-[#D6A85A] text-[#F4EFE6]'
                : 'border-transparent text-[#F4EFE6]/42 hover:text-[#F4EFE6]/72'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Review content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="p-6"
        >
          {activeReview && (
            <div className="space-y-4">
              <p className="text-sm text-[#F4EFE6]/68 leading-7">{activeReview.content}</p>
              <div className="flex flex-wrap gap-2">
                {activeReview.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full border border-[#F4EFE6]/8 bg-[#F4EFE6]/5 px-3 py-1 text-xs text-[#F4EFE6]/50"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
