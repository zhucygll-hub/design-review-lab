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
    icon: '🏢',
    description: '海报/UI/包装/品牌等实用设计作品',
  },
  {
    value: 'concept',
    label: '概念/实验',
    icon: '💡',
    description: '实验字体/思辨设计/未来概念/艺术装置等',
  },
]

export default function DesignTypeToggle({ value, onChange }: DesignTypeToggleProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-white/50">设计类型</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = value === opt.value
          return (
            <motion.button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`relative flex flex-col items-center gap-2 rounded-2xl border px-4 py-4 text-center transition-colors duration-200 ${
                isSelected
                  ? 'border-[#4F8CFF] bg-[#4F8CFF]/10'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
              }`}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-xl">{opt.icon}</span>
              <span
                className={`text-sm font-semibold ${
                  isSelected ? 'text-[#4F8CFF]' : 'text-white/60'
                }`}
              >
                {opt.label}
              </span>
              <span className="text-[11px] leading-tight text-white/30">{opt.description}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
