interface ProgressBarProps {
  value: number
  showLabel?: boolean
  className?: string
}

export function ProgressBar({ value, showLabel = false, className = '' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value))
  const color = pct === 100 ? 'bg-weg-green' : pct >= 50 ? 'bg-weg-blue' : 'bg-yellow-400'

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 bg-gray-200 dark:bg-slate-600 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-gray-500 dark:text-slate-400 w-8 text-right">{pct}%</span>
      )}
    </div>
  )
}
