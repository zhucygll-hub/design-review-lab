'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/shared/GlassCard'
import { PortfolioPurpose } from '@/types'

export interface PortfolioContextInput {
  purpose: PortfolioPurpose
  company: string
  role: string
  jd: string
  school: string
  major: string
  requirement: string
  goal: string
}

interface TargetInputCardProps {
  onChange: (data: PortfolioContextInput) => void
}

const PURPOSE_OPTIONS: Array<{
  value: PortfolioPurpose
  label: string
  description: string
}> = [
  { value: 'job', label: '求职', description: '岗位匹配、项目排序、面试表达' },
  { value: 'graduate', label: '考研/升学', description: '研究潜力、方向一致性、申请说服力' },
  { value: 'course', label: '课程作业', description: '课题完整度、方法掌握、阶段成果' },
  { value: 'competition', label: '比赛投稿', description: '主题冲击力、评委可读性、差异化' },
  { value: 'showcase', label: '视觉展示', description: '风格统一、图像质量、系列表达' },
  { value: 'unsure', label: '暂不确定', description: '先做通用诊断，再提示适合用途' },
]

export default function TargetInputCard({ onChange }: TargetInputCardProps) {
  const [purpose, setPurpose] = useState<PortfolioPurpose>('unsure')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [jd, setJd] = useState('')
  const [school, setSchool] = useState('')
  const [major, setMajor] = useState('')
  const [requirement, setRequirement] = useState('')
  const [goal, setGoal] = useState('')

  useEffect(() => {
    onChange({
      purpose,
      company: company.trim(),
      role: role.trim(),
      jd: jd.trim(),
      school: school.trim(),
      major: major.trim(),
      requirement: requirement.trim(),
      goal: goal.trim(),
    })
  }, [company, goal, jd, major, onChange, purpose, requirement, role, school])

  const isJob = purpose === 'job'
  const isGraduate = purpose === 'graduate'
  const isGeneral = !isJob && !isGraduate

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <GlassCard className="p-6 space-y-5">
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#F4EFE6]/10 bg-[#11100E]/64 mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D6A85A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5H20" />
              <path d="M6 9H14" />
              <path d="M6 13H12" />
              <path d="M15 18L17 20L21 15" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#F4EFE6]">补充评审背景</h3>
          <p className="text-sm text-[#F4EFE6]/45 mt-1">
            先告诉系统这份作品集准备拿去做什么。下面所有内容都可以不填，填了会更贴近真实评审场景。
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-[#F4EFE6]/45">作品集用途</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {PURPOSE_OPTIONS.map((option) => {
              const active = purpose === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPurpose(option.value)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    active
                      ? 'border-[#D6A85A]/50 bg-[#D6A85A]/10 text-[#F4EFE6]'
                      : 'border-[#F4EFE6]/10 bg-[#11100E]/46 text-[#F4EFE6]/58 hover:border-[#F4EFE6]/20'
                  }`}
                >
                  <span className="block text-sm font-semibold">{option.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-[#F4EFE6]/40">
                    {option.description}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {isJob && (
          <div className="space-y-4">
            <InputField
              label="目标岗位（选填）"
              value={role}
              onChange={setRole}
              placeholder="如：UI/UX 设计师、工业设计师、视觉设计实习生"
            />
            <InputField
              label="目标公司（选填）"
              value={company}
              onChange={setCompany}
              placeholder="如：字节跳动、小米、大疆，也可以留空"
            />
            <TextAreaField
              label="岗位描述 JD（选填）"
              value={jd}
              onChange={setJd}
              placeholder="粘贴目标岗位的 JD，或写下面试官最看重的能力..."
            />
          </div>
        )}

        {isGraduate && (
          <div className="space-y-4">
            <InputField
              label="目标院校（选填）"
              value={school}
              onChange={setSchool}
              placeholder="如：某某大学、某某学院，也可以留空"
            />
            <InputField
              label="申请方向/专业（选填）"
              value={major}
              onChange={setMajor}
              placeholder="如：工业设计、视觉传达、交互设计、数字媒体"
            />
            <TextAreaField
              label="申请要求或个人目标（选填）"
              value={requirement}
              onChange={setRequirement}
              placeholder="写下院校要求、导师方向，或你希望作品集证明的能力..."
            />
          </div>
        )}

        {isGeneral && (
          <TextAreaField
            label="评审目标（选填）"
            value={goal}
            onChange={setGoal}
            placeholder="例如：想知道能不能交课程作业、是否适合比赛、视觉风格是否统一..."
          />
        )}
      </GlassCard>
    </motion.div>
  )
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#F4EFE6]/45 mb-1.5">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-[#11100E]/60 border border-[#F4EFE6]/10 px-4 py-3 text-sm text-[#F4EFE6] placeholder:text-[#F4EFE6]/24 focus:outline-none focus:border-[#D6A85A]/50 focus:bg-[#11100E]/80 transition-all"
      />
    </div>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#F4EFE6]/45 mb-1.5">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-xl bg-[#11100E]/60 border border-[#F4EFE6]/10 px-4 py-3 text-sm text-[#F4EFE6] placeholder:text-[#F4EFE6]/24 focus:outline-none focus:border-[#D6A85A]/50 focus:bg-[#11100E]/80 transition-all resize-none"
      />
    </div>
  )
}
