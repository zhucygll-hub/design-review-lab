'use client'

import { motion } from 'framer-motion'

interface ImagePreviewProps {
  url: string
  fileName: string
}

export default function ImagePreview({ url, fileName }: ImagePreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="report-panel overflow-hidden"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={fileName}
        className="w-full max-h-[400px] object-contain bg-[#11100E]/64"
      />
      <div className="px-4 py-3 flex items-center justify-between border-t border-[#F4EFE6]/8">
        <span className="text-sm text-[#F4EFE6]/62 truncate">{fileName}</span>
        <span className="text-xs text-[#D6A85A]">已提交</span>
      </div>
    </motion.div>
  )
}
