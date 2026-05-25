import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: number
  trendLabel?: string
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray'
  className?: string
}

const colorMap = {
  blue: { icon: 'bg-blue-100 text-blue-600', border: 'border-blue-100' },
  green: { icon: 'bg-green-100 text-green-600', border: 'border-green-100' },
  orange: { icon: 'bg-orange-100 text-orange-600', border: 'border-orange-100' },
  red: { icon: 'bg-red-100 text-red-600', border: 'border-red-100' },
  purple: { icon: 'bg-purple-100 text-purple-600', border: 'border-purple-100' },
  gray: { icon: 'bg-gray-100 text-gray-600', border: 'border-gray-100' },
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = 'blue',
  className,
}: StatCardProps) {
  const colors = colorMap[color]

  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-500 leading-tight">{title}</p>
          <p className="mt-1 text-xl sm:text-2xl font-bold text-gray-900 break-words">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>
          )}
        </div>
        <div className={cn('flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg', colors.icon)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1">
          <span
            className={cn(
              'text-xs font-medium',
              trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
            )}
          >
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
          </span>
          {trendLabel && (
            <span className="text-xs text-gray-400">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}
