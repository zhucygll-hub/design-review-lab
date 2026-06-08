'use client'

import { useState, useCallback } from 'react'
import { HistoryItem } from '@/types'

const NEW_STORAGE_KEY = 'design-review-lab-history'
const OLD_STORAGE_KEY = 'ai-portfolio-tutor-history'

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>(() => {
    if (typeof window === 'undefined') return []

    try {
      let stored = localStorage.getItem(NEW_STORAGE_KEY)

      // Migration: try old key if new is empty
      if (!stored) {
        const oldStored = localStorage.getItem(OLD_STORAGE_KEY)
        if (oldStored) {
          // Migrate to new key
          localStorage.setItem(NEW_STORAGE_KEY, oldStored)
          stored = oldStored
        }
      }

      if (stored) {
        const parsed = JSON.parse(stored)
        // Normalize old items: add mode field if missing
        return parsed.map((item: Record<string, unknown>) => ({
            ...item,
            mode: item.mode || 'single',
          })) as HistoryItem[]
      }
    } catch {
      localStorage.removeItem(NEW_STORAGE_KEY)
    }
    return []
  })

  const persist = useCallback((newItems: HistoryItem[]) => {
    setItems(newItems)
    localStorage.setItem(NEW_STORAGE_KEY, JSON.stringify(newItems.slice(0, 50)))
  }, [])

  const addItem = useCallback(
    (item: HistoryItem) => {
      const newItems = [item, ...items]
      persist(newItems)
    },
    [items, persist]
  )

  const removeItem = useCallback(
    (id: string) => {
      const newItems = items.filter((i) => i.id !== id)
      persist(newItems)
    },
    [items, persist]
  )

  const clearAll = useCallback(() => {
    persist([])
  }, [persist])

  return { items, addItem, removeItem, clearAll }
}
