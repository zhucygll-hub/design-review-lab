'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { WorkForm } from '@/types'

interface UploadZoneProps {
  onFiles: (files: File[]) => void
  disabled?: boolean
  workForm?: WorkForm
}

function getUploadHint(workForm?: WorkForm): string {
  switch (workForm) {
    case 'physical_model':
      return '建议提交正面/侧面/细节共 1-3 张照片'
    case 'board':
      return '建议提交整体展板/局部细节共 1-3 张'
    case 'ui':
      return '建议提交关键页面截图 1-3 张'
    case 'packaging_brand':
      return '建议提交正面/侧面/应用场景共 1-3 张'
    case 'poster':
      return '可提交 1-3 张图片（如整体和局部细节）'
    default:
      return '可提交 1-3 张图片（如同一件作品的不同角度或页面）'
  }
}

export default function UploadZone({ onFiles, disabled = false, workForm }: UploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFiles(acceptedFiles.slice(0, 3))
      }
    },
    [onFiles]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'application/pdf': [],
    },
    maxFiles: 3,
    disabled,
  })

  const hint = getUploadHint(workForm)

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

        {/* Upload icon */}
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
            <path d="M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </motion.div>

        <p className="text-lg font-semibold text-[#F4EFE6]">
          {isDragActive ? '松开以上传作品' : '拖拽或点击上传作品'}
        </p>
        <p className="mt-2 text-sm text-[#F4EFE6]/45">
          可提交 1-3 张作品图片（如同一件作品的不同角度或页面），系统会生成一份评审报告
        </p>
        <p className="mt-1.5 text-xs text-[#8EB4FF]/60">{hint}</p>
        <p className="mt-1 text-xs text-[#F4EFE6]/30">
          支持 JPG、PNG、PDF 格式（PDF 自动提取第一页作为评审图片）
        </p>
      </div>
    </motion.div>
  )
}
