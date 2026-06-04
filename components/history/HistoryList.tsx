'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { HistoryItem } from '@/types'
import Badge from '@/components/shared/Badge'
import { formatDate } from '@/lib/utils'

interface HistoryListProps {
  items: HistoryItem[]
}

export default function HistoryList({ items }: HistoryListProps) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <Link
            href={`/result/${item.id}`}
            className="glass rounded-2xl p-4 flex items-center gap-4 hover:glass-hover transition-colors duration-300 block"
          >
            {/* Thumbnail */}
            <div className="shrink-0 h-16 w-16 rounded-xl bg-white/5 overflow-hidden flex items-center justify-center">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.fileName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white/80 truncate">
                  {item.fileName}
                </p>
                <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/5 text-white/25">
                  {item.mode === 'portfolio' ? '作品集' : '作品'}
                </span>
                {item.designType && (
                  <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    item.designType === 'concept'
                      ? 'bg-[#7C3AED]/10 text-[#A78BFA]'
                      : 'bg-[#4F8CFF]/10 text-[#4F8CFF]'
                  }`}>
                    {item.designType === 'concept' ? '概念' : '商业'}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/30 mt-1">
                {formatDate(item.createdAt)}
              </p>
            </div>

            {/* Score and arrow */}
            <div className="flex items-center gap-3">
              <Badge score={item.score} />
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
