'use client'

import { motion } from 'framer-motion'
import { WorkForm } from '@/types'

interface PreviewFile {
  url: string
  fileName: string
}

interface ImagePreviewProps {
  files: PreviewFile[]
  workForm?: WorkForm
}

function getImageLabel(index: number, total: number, workForm?: WorkForm): string {
  const numberLabel = `图${index + 1}`
  if (total === 1) return ''

  switch (workForm) {
    case 'physical_model':
      if (index === 0) return `${numberLabel} — 主视图`
      if (index === 1) return `${numberLabel} — 侧面`
      return `${numberLabel} — 细节`
    case 'board':
      if (index === 0) return `${numberLabel} — 整体`
      return `${numberLabel} — 局部`
    case 'ui':
      return `${numberLabel} — 页面`
    case 'packaging_brand':
      if (index === 0) return `${numberLabel} — 正面`
      if (index === 1) return `${numberLabel} — 侧面`
      return `${numberLabel} — 应用场景`
    default:
      return `${numberLabel}`
  }
}

/** Grid columns class based on image count */
function gridClass(count: number): string {
  if (count === 1) return 'grid-cols-1'
  if (count === 2) return 'grid-cols-2'
  return 'grid-cols-2' // 3 images: 2 top + 1 bottom
}

export default function ImagePreview({ files, workForm }: ImagePreviewProps) {
  if (files.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="report-panel overflow-hidden"
    >
      {/* Image grid */}
      <div className={`grid ${gridClass(files.length)} gap-px bg-[#F4EFE6]/8`}>
        {files.map((file, index) => {
          const isPdf = file.fileName.toLowerCase().endsWith('.pdf')
          const label = getImageLabel(index, files.length, workForm)
          // For 3 images, the 3rd spans full width
          const isThirdOfThree = files.length === 3 && index === 2

          return (
            <div
              key={file.url}
              className={`bg-[#11100E] ${isThirdOfThree ? 'col-span-2' : ''}`}
            >
              {isPdf ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#F4EFE6]/10 bg-[#1E1C19] mx-auto">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D6A85A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8Z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                    </div>
                    {label && <p className="text-xs text-[#F4EFE6]/32">{label}</p>}
                    <p className="text-xs text-[#F4EFE6]/40">
                      PDF 已接收，分析时将自动提取第一页
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={file.url}
                    alt={file.fileName}
                    className={`w-full object-contain bg-[#11100E]/64 ${files.length === 1 ? 'max-h-[400px]' : 'max-h-[280px]'}`}
                  />
                  {label && (
                    <span className="absolute top-2 left-2 rounded-md bg-[#11100E]/80 px-2 py-0.5 text-[11px] font-medium text-[#F4EFE6]/62 backdrop-blur-sm border border-[#F4EFE6]/8">
                      {label}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-[#F4EFE6]/8">
        <span className="text-sm text-[#F4EFE6]/62 truncate">
          {files.length === 1
            ? files[0].fileName
            : `${files.length} 张图片`}
        </span>
        <span className="text-xs text-[#D6A85A]">已提交</span>
      </div>
    </motion.div>
  )
}
