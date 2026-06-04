export default function GradientText({
  children,
  className = '',
}: {
  children: string
  className?: string
}) {
  return <span className={`text-gradient ${className}`}>{children}</span>
}
