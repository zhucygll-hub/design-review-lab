'use client'

import { motion } from 'framer-motion'
import { DesignType } from '@/types'

interface DesignTypeToggleProps {
  value: DesignType
  onChange: (type: DesignType) => void
}

const options: { value: DesignType; label: string; icon: string; description: string }[] = [
  {
    value: 'commercial',
    label: '商业/落地',
    icon: '落',
    description: '海报/UI/包装/品牌等实用设计作品',
  },
  {
    value: 'concept',
    label: '概念/实验',
    icon: '概',
    description: '实验字体/思辨设计/未来概念/艺术装置等',
  },
]

export default function DesignTypeToggle({ value, onChange }: DesignTypeToggleProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-[#F4EFE6]/52">设计类型</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = value === opt.value
          return (
            <motion.button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`relative flex flex-col items-center gap-2 rounded-xl border px-4 py-4 text-center transition-colors duration-200 ${
                isSelected
                  ? 'border-[#D6A85A]/45 bg-[#D6A85A]/8'
                  : 'border-[#F4EFE6]/10 bg-[#181715] hover:border-[#F4EFE6]/20 hover:bg-[#1E1C19]'
              }`}
              whileTap={{ scale: 0.97 }}
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold ${
                isSelected ? 'bg-[#D6A85A] text-[#11100E]' : 'bg-[#11100E]/70 text-[#F4EFE6]/52'
              }`}>
                {opt.icon}
              </span>
              <span
                className={`text-sm font-semibold ${
                  isSelected ? 'text-[#F4EFE6]' : 'text-[#F4EFE6]/62'
                }`}
              >
                {opt.label}
              </span>
              <span className="text-[11px] leading-tight text-[#F4EFE6]/36">{opt.description}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
