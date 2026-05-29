import { statusColor } from '../../lib/utils'

interface BadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(status)} ${className}`}>
      {status}
    </span>
  )
}

interface PrioridadeBadgeProps {
  prioridade: string
}

export function PrioridadeBadge({ prioridade }: PrioridadeBadgeProps) {
  const label = prioridade.replace('1. ', '').replace('2. ', '').replace('3. ', '')
  const colors =
    prioridade.startsWith('1') ? 'bg-red-50 text-red-700' :
    prioridade.startsWith('2') ? 'bg-yellow-50 text-yellow-700' :
    'bg-gray-50 text-gray-600'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors}`}>
      {label}
    </span>
  )
}
