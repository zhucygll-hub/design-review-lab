'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'

interface UploadZoneProps {
  onFile: (file: File) => void
  disabled?: boolean
}

export default function UploadZone({ onFile, disabled = false }: UploadZoneProps) {
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
      'image/jpeg': [],
      'image/png': [],
    },
    maxFiles: 1,
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
              ? 'border-[#4F8CFF] bg-[#4F8CFF]/5 scale-[1.02]'
              : 'border-white/10 glass hover:border-white/20 hover:bg-white/[0.04]'
          }
          ${disabled ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />

        {/* Upload icon */}
        <motion.div
          animate={{ y: isDragActive ? -8 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4F8CFF]/20 to-[#7C3AED]/20"
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isDragActive ? '#4F8CFF' : 'rgba(255,255,255,0.4)'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors duration-300"
          >
            <path d="M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </motion.div>

        <p className="text-lg font-semibold text-white/80">
          {isDragActive ? '松开以上传作品' : '拖拽或点击上传作品'}
        </p>
        <p className="mt-2 text-sm text-white/40">支持 JPG、PNG 格式</p>
      </div>
    </motion.div>
  )
}
