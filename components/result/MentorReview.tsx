'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MentorReview as MentorReviewType, MentorRole } from '@/types'

const ROLE_TABS: { key: MentorRole; label: string; short: string }[] = [
  { key: 'graduation_tutor', label: '毕业导师', short: '课题' },
  { key: 'design_director', label: '设计总监', short: '审美' },
  { key: 'interviewer', label: '企业面试官', short: '表达' },
  { key: 'ux_researcher', label: '用户研究员', short: '场景' },
]

interface MentorReviewProps {
  reviews: MentorReviewType[]
}

export default function MentorReview({ reviews }: MentorReviewProps) {
  const [activeTab, setActiveTab] = useState<MentorRole>('graduation_tutor')
  const activeReview = reviews.find((review) => review.role === activeTab)

  return (
    <div>
      <div className="flex overflow-x-auto border-b border-[#F4EFE6]/10 scrollbar-none">
        {ROLE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-[#D6A85A] text-[#F4EFE6]'
                : 'border-transparent text-[#F4EFE6]/42 hover:text-[#F4EFE6]/72'
            }`}
          >
            <span className="rounded-full bg-[#F4EFE6]/5 px-2 py-0.5 text-[11px] text-[#F4EFE6]/48">
              {tab.short}
            </span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="py-6"
        >
          {activeReview && (
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_260px]">
              <p className="max-w-3xl text-[15px] leading-8 text-[#F4EFE6]/72">
                {activeReview.content}
              </p>
              <div className="flex flex-wrap content-start gap-2 md:justify-end">
                {activeReview.highlights.map((highlight, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-full bg-[#F4EFE6]/5 px-3 py-1 text-xs text-[#F4EFE6]/54"
                  >
                    {highlight}
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
