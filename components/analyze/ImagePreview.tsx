'use client'

import { motion } from 'framer-motion'

interface ImagePreviewProps {
  url: string
  fileName: string
}

export default function ImagePreview({ url, fileName }: ImagePreviewProps) {
  const isPdf = fileName.toLowerCase().endsWith('.pdf') || url.includes('application/pdf')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="report-panel overflow-hidden"
    >
      {isPdf ? (
        <div className="w-full bg-[#11100E]/64 flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#F4EFE6]/10 bg-[#1E1C19] mx-auto">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D6A85A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8Z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <p className="text-sm text-[#F4EFE6]/48">PDF 已接收，分析时将自动提取第一页作为评审图片</p>
            <p className="text-xs text-[#F4EFE6]/30">如需完整作品集评审，请使用「作品集评审」功能</p>
          </div>
        </div>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={url}
          alt={fileName}
          className="w-full max-h-[400px] object-contain bg-[#11100E]/64"
        />
      )}
      <div className="px-4 py-3 flex items-center justify-between border-t border-[#F4EFE6]/8">
        <span className="text-sm text-[#F4EFE6]/62 truncate">{fileName}</span>
        <span className="text-xs text-[#D6A85A]">已提交</span>
      </div>
    </motion.div>
  )
}
