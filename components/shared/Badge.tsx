import { getScoreColor } from '@/lib/utils'

interface BadgeProps {
  score: string
  className?: string
}

export default function Badge({ score, className = '' }: BadgeProps) {
  const color = getScoreColor(score)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${className}`}
      style={{
        color,
        borderColor: color + '40',
        backgroundColor: color + '10',
      }}
    >
      {score}
    </span>
  )
}
