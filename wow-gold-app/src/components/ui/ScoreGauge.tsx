/**
 * Circular score gauge — 0 to 100 with color gradient
 */
import { cn } from '@/utils/cn'

function scoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-400'
  if (score >= 50) return 'text-yellow-400'
  if (score >= 25) return 'text-orange-400'
  return 'text-red-400'
}

function strokeColor(score: number): string {
  if (score >= 75) return 'stroke-emerald-400'
  if (score >= 50) return 'stroke-yellow-400'
  if (score >= 25) return 'stroke-orange-400'
  return 'stroke-red-400'
}

export function ScoreGauge({ score, label, size = 64 }: { score: number; label?: string; size?: number }) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.max(0, Math.min(100, score))
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" strokeWidth={4}
            className="stroke-slate-700/50"
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn('transition-all duration-700', strokeColor(score))}
          />
        </svg>
        <span className={cn(
          'absolute inset-0 flex items-center justify-center font-bold font-mono',
          scoreColor(score),
          size >= 64 ? 'text-lg' : 'text-sm'
        )}>
          {Math.round(score)}
        </span>
      </div>
      {label && <span className="text-[10px] text-slate-500 text-center leading-tight">{label}</span>}
    </div>
  )
}

export function ScoreBar({ score, label, className }: { score: number; label?: string; className?: string }) {
  const progress = Math.max(0, Math.min(100, score))
  const bgColor = score >= 75 ? 'bg-emerald-400' : score >= 50 ? 'bg-yellow-400' : score >= 25 ? 'bg-orange-400' : 'bg-red-400'

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">{label}</span>
          <span className={cn('font-mono font-medium', scoreColor(score))}>{Math.round(score)}</span>
        </div>
      )}
      <div className="h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', bgColor)}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
