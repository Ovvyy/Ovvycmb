import { useAppStore } from '@/stores/appStore'

export function TitleBar() {
  const { isConnected } = useAppStore()

  return (
    <div
      className="flex items-center justify-between px-4 bg-surface-950 border-b border-white/5"
      style={{ height: 40, WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-brand-500 flex items-center justify-center text-xs font-bold">O</div>
          <span className="text-sm font-semibold tracking-wider text-white/90">OVVYCMB</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-accent-success' : 'bg-white/20'}`} />
          <span className="text-xs text-white/40">{isConnected ? 'Connected' : 'Connecting...'}</span>
        </div>
      </div>
      <div className="text-xs text-white/20 font-mono">v1.0.0</div>
    </div>
  )
}
