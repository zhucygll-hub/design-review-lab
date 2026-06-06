'use client'

import { motion } from 'framer-motion'
import { ReviewPurpose, WorkForm } from '@/types'

interface ScenarioSelectorProps {
  workForm: WorkForm
  reviewPurpose: ReviewPurpose
  onWorkFormChange: (value: WorkForm) => void
  onReviewPurposeChange: (value: ReviewPurpose) => void
}

const workFormOptions: Array<{
  value: WorkForm
  label: string
  description: string
}> = [
  { value: 'board', label: '展板', description: '信息组织、版式、图文表达' },
  { value: 'physical_model', label: '模型实物', description: '造型、结构、工艺、材料' },
  { value: 'ui', label: 'UI界面', description: '界面、流程、交互体验' },
  { value: 'poster', label: '海报视觉', description: '传播、冲击力、记忆点' },
  { value: 'packaging_brand', label: '包装品牌', description: '品牌系统、货架与识别' },
  { value: 'other', label: '其他', description: '按作品自身语境评审' },
]

const purposeOptions: Array<{
  value: ReviewPurpose
  label: string
  description: string
}> = [
  { value: 'course', label: '课程作业', description: '方法掌握与学习目标' },
  { value: 'competition', label: '比赛投稿', description: '主题冲击与评审说服力' },
  { value: 'job', label: '求职展示', description: '岗位能力与面试表达' },
  { value: 'practice', label: '个人练习', description: '能力成长与改进空间' },
]

function OptionButton({
  selected,
  label,
  description,
  onClick,
}: {
  selected: boolean
  label: string
  description: string
  onClick: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-left transition-colors duration-200 ${
        selected
          ? 'border-[#D6A85A]/45 bg-[#D6A85A]/8'
          : 'border-[#F4EFE6]/10 bg-[#181715] hover:border-[#F4EFE6]/20 hover:bg-[#1E1C19]'
      }`}
      whileTap={{ scale: 0.98 }}
    >
      <span className={`text-sm font-semibold ${selected ? 'text-[#F4EFE6]' : 'text-[#F4EFE6]/64'}`}>
        {label}
      </span>
      <span className="mt-1 block text-[11px] leading-tight text-[#F4EFE6]/36">{description}</span>
    </motion.button>
  )
}

export default function ScenarioSelector({
  workForm,
  reviewPurpose,
  onWorkFormChange,
  onReviewPurposeChange,
}: ScenarioSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-medium text-[#F4EFE6]/52">作品形态</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {workFormOptions.map((option) => (
            <OptionButton
              key={option.value}
              selected={workForm === option.value}
              label={option.label}
              description={option.description}
              onClick={() => onWorkFormChange(option.value)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-[#F4EFE6]/52">评审目的</p>
        <div className="grid grid-cols-2 gap-3">
          {purposeOptions.map((option) => (
            <OptionButton
              key={option.value}
              selected={reviewPurpose === option.value}
              label={option.label}
              description={option.description}
              onClick={() => onReviewPurposeChange(option.value)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
