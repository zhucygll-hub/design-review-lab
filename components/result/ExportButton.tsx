'use client'

import Button from '@/components/shared/Button'

export default function ExportButton() {
  const handleExport = () => {
    window.print()
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleExport}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      导出报告
    </Button>
  )
}
