import { useAppStore } from '@/stores/appStore'
import { api } from '@/api/apiClient'
import { Layers, Play, Wand2, Trash2 } from 'lucide-react'
import { useState } from 'react'

export function LayoutManager() {
  const { layouts, setLayouts } = useAppStore()
  const [loading, setLoading] = useState<string | null>(null)

  const applyLayout = async (id: string) => {
    setLoading(id)
    try {
      await api.layouts.apply(id)
    } finally {
      setLoading(null)
    }
  }

  const deleteLayout = async (id: string) => {
    await api.layouts.delete(id)
    setLayouts(layouts.filter(l => l.id !== id))
  }

  const autoGenerate = async () => {
    setLoading('auto')
    try {
      const profile = await api.layouts.autoGenerate(0)
      setLayouts([...layouts, profile])
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Layout Manager</h1>
          <p className="text-sm text-white/40 mt-0.5">Arrange DOFUS windows across your monitors</p>
        </div>
        <button onClick={autoGenerate} disabled={loading === 'auto'} className="btn-primary flex items-center gap-2 text-sm">
          <Wand2 size={14} />
          Auto-Generate
        </button>
      </div>

      {layouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-white/30">
          <Layers size={40} className="mb-3 opacity-50" />
          <p>No layouts saved yet</p>
          <p className="text-sm mt-1">Use Auto-Generate to create a grid layout</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {layouts.map(layout => (
            <div key={layout.id} className="glass rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium">{layout.name}</p>
                  {layout.description && <p className="text-xs text-white/40 mt-0.5">{layout.description}</p>}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => applyLayout(layout.id)}
                    disabled={loading === layout.id}
                    className="p-2 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 text-brand-400 transition-colors"
                    title="Apply layout"
                  >
                    <Play size={14} />
                  </button>
                  <button
                    onClick={() => deleteLayout(layout.id)}
                    className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-accent-danger transition-colors"
                    title="Delete layout"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex gap-2 text-xs text-white/40">
                <span>{layout.layouts.length} windows</span>
                <span>·</span>
                <span>{layout.monitorCount} monitor{layout.monitorCount !== 1 ? 's' : ''}</span>
                {layout.hotkey && (
                  <>
                    <span>·</span>
                    <kbd className="px-1.5 py-0.5 bg-white/5 rounded font-mono">{layout.hotkey}</kbd>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
