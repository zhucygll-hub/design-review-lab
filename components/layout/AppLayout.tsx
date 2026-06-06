'use client'

import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import TopNav from './TopNav'
import BottomNav from './BottomNav'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#11100E] text-[#F4EFE6]">
      <TopNav />
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mx-auto max-w-5xl px-4 pb-24 pt-20 md:pb-12 md:pt-24"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <BottomNav />
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-x-0 top-0 h-px bg-[#F4EFE6]/10" />
        <div className="absolute left-1/2 top-0 h-[32rem] w-[48rem] -translate-x-1/2 rounded-full bg-[#6B9CFF]/6 blur-[140px]" />
      </div>
    </div>
  )
}
