'use client'

import { motion } from 'framer-motion'

interface AIThinkingProps {
  currentDimension: string
  isWaitingForApi?: boolean
}

export default function AIThinking({ currentDimension, isWaitingForApi = false }: AIThinkingProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {/* Pulsing brain icon */}
      <motion.div
        className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#F4EFE6]/10 bg-[#181715]"
        animate={isWaitingForApi
          ? { scale: [1, 1.08, 1], rotate: [0, 0, 0] }
          : { scale: [1, 1.05, 1] }
        }
        transition={isWaitingForApi
          ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <motion.div
          className="absolute inset-0 rounded-2xl bg-[#D6A85A]/8"
          animate={{ opacity: [0, 0.6, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {isWaitingForApi ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D6A85A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D6A85A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5V6" />
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5V6" />
            <path d="M12 6V8" />
            <line x1="8" y1="10" x2="16" y2="10" />
            <line x1="8" y1="14" x2="13" y2="14" />
          </svg>
        )}
      </motion.div>

      {/* Current action */}
      <motion.div
        key={isWaitingForApi ? 'waiting' : currentDimension}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        {isWaitingForApi ? (
          <p className="text-sm text-[#F4EFE6]/52">
            正在整理评审结论
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="ml-0.5"
            >
              ...
            </motion.span>
          </p>
        ) : (
          <p className="text-sm text-[#F4EFE6]/52">
            正在审阅
            <span className="text-[#F4EFE6] font-medium ml-1">{currentDimension}</span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="ml-0.5"
            >
              ...
            </motion.span>
          </p>
        )}
      </motion.div>
    </div>
  )
}
