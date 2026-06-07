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
    maxSize: 30 * 1024 * 1024, // 30MB — files >12MB will be auto-compressed client-side before upload
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
        className={`relative flex flex-col items-center justify-center rounded-2xl border border-dashed p-16 transition-all duration-300 cursor-pointer
          ${
            isDragActive
              ? 'border-[#D6A85A] bg-[#D6A85A]/7 scale-[1.01]'
              : 'border-[#F4EFE6]/14 bg-[#181715] hover:border-[#F4EFE6]/24 hover:bg-[#1E1C19]'
          }
          ${disabled ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />

        <motion.div
          animate={{ y: isDragActive ? -8 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#F4EFE6]/10 bg-[#11100E]/64"
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isDragActive ? '#D6A85A' : 'rgba(244,239,230,0.46)'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors duration-300"
          >
            <rect x="4" y="3" width="13" height="18" rx="2" />
            <path d="M8 7H13" />
            <path d="M8 11H14" />
            <path d="M8 15H12" />
            <path d="M18 8H20V19A2 2 0 0 1 18 21H9" />
          </svg>
        </motion.div>

        <p className="text-lg font-semibold text-[#F4EFE6]">
          {isDragActive ? '松开以上传作品集' : '拖拽或点击上传作品集 PDF'}
        </p>
        <p className="mt-2 text-sm text-[#F4EFE6]/45">提交完整作品集，系统会生成综合评审报告</p>
        <p className="mt-1 text-xs text-[#F4EFE6]/30">
          支持 PDF 格式，12MB 以内直接上传，12-30MB 自动压缩后分析，超过 30MB 请减少页数或导出较低分辨率
        </p>
      </div>
    </motion.div>
  )
}
