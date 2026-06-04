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
      className="rounded-2xl overflow-hidden glass"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={fileName}
        className="w-full max-h-[400px] object-contain bg-black/20"
      />
      <div className="px-4 py-3 flex items-center justify-between border-t border-white/5">
        <span className="text-sm text-white/60 truncate">{fileName}</span>
        <span className="text-xs text-white/30">已上传</span>
      </div>
    </motion.div>
  )
}
