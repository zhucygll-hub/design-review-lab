'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'

interface PortfolioUploadZoneProps {
  onFile: (file: File) => void
  disabled?: boolean
}

export default function PortfolioUploadZone({ onFile, disabled = false }: PortfolioUploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFile(acceptedFiles[0])
      }
    },
    [onFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': [],
    },
    maxFiles: 1,
    maxSize: 30 * 1024 * 1024, // 30MB
    disabled,
  })

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div
        {...getRootProps()}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-16 transition-all duration-300 cursor-pointer
          ${
            isDragActive
              ? 'border-[#7C3AED] bg-[#7C3AED]/5 scale-[1.02]'
              : 'border-white/10 glass hover:border-white/20 hover:bg-white/[0.04]'
          }
          ${disabled ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />

        <motion.div
          animate={{ y: isDragActive ? -8 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED]/20 to-[#4F8CFF]/20"
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isDragActive ? '#7C3AED' : 'rgba(255,255,255,0.4)'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors duration-300"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            <line x1="12" y1="11" x2="12" y2="17" />
            <line x1="9" y1="14" x2="15" y2="14" />
          </svg>
        </motion.div>

        <p className="text-lg font-semibold text-white/80">
          {isDragActive ? '松开以上传作品集' : '拖拽或点击上传作品集 PDF'}
        </p>
        <p className="mt-2 text-sm text-white/40">支持 PDF 格式（最大 30MB）</p>
      </div>
    </motion.div>
  )
}
