import { cn } from '@/utils/cn'
import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: ReactNode
  error?: string
  suffix?: ReactNode
}

export function Input({ label, icon, error, suffix, className, ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-slate-400">{label}</label>}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 text-slate-500 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          {...rest}
          className={cn(
            'w-full bg-wow-surface border border-wow-border rounded-lg px-3 py-2 text-sm text-white',
            'placeholder:text-slate-600',
            'focus:outline-none focus:border-wow-gold/50 focus:bg-wow-surface',
            'transition-colors duration-150',
            icon && 'pl-9',
            suffix && 'pr-16',
            error && 'border-red-500/50',
            className
          )}
        />
        {suffix && (
          <span className="absolute right-3 text-slate-500 text-xs">{suffix}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Select({
  label, options, className, ...rest
}: { label?: string; options: { value: string; label: string }[]; className?: string } & InputHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-slate-400">{label}</label>}
      <select
        {...rest}
        className={cn(
          'w-full bg-wow-surface border border-wow-border rounded-lg px-3 py-2 text-sm text-white',
          'focus:outline-none focus:border-wow-gold/50',
          'transition-colors duration-150 cursor-pointer',
          className
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
