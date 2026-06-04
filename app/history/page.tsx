'use client'

import { useHistory } from '@/hooks/useHistory'
import HistoryList from '@/components/history/HistoryList'
import EmptyState from '@/components/history/EmptyState'
import Button from '@/components/shared/Button'

export default function HistoryPage() {
  const { items, clearAll } = useHistory()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">历史记录</h1>
          <p className="text-sm text-white/40 mt-1">
            {items.length > 0 ? `共 ${items.length} 条分析记录` : '暂无记录'}
          </p>
        </div>
        {items.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            清空记录
          </Button>
        )}
      </div>

      {items.length === 0 ? <EmptyState /> : <HistoryList items={items} />}
    </div>
  )
}
