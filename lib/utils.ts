export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getScoreColor(score: string): string {
  switch (score) {
    case 'S':
      return '#F59E0B' // gold — superlative
    case 'A+':
      return '#10B981' // emerald — outstanding (between S and A)
    case 'A':
      return '#22C55E' // green — excellent
    case 'B+':
    case 'B':
      return '#4F8CFF' // blue — good
    case 'C':
      return '#F59E0B' // amber — average
    case 'D':
      return '#F97316' // orange — needs work
    case 'E':
      return '#EF4444' // red — inadequate
    default:
      return '#6B7280' // gray
  }
}

export function getScoreLabel(score: string): string {
  switch (score) {
    case 'S':
      return '卓越 / Superlative'
    case 'A+':
      return '优异 / Outstanding'
    case 'A':
      return '优秀 / Excellent'
    case 'B+':
      return '良好 / Great'
    case 'B':
      return '良好 / Good'
    case 'C':
      return '一般 / Average'
    case 'D':
      return '需改进 / Needs Improvement'
    case 'E':
      return '不足 / Inadequate'
    default:
      return ''
  }
}
