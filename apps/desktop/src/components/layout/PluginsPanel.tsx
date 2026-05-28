import { Puzzle, ToggleLeft, ToggleRight } from 'lucide-react'

export function PluginsPanel() {
  const officialPlugins = [
    { name: 'DOFUS Unity', version: '1.0.0', description: 'Official DOFUS Unity integration', enabled: true, official: true, game: 'DofusUnity' },
    { name: 'DOFUS Retro', version: '1.0.0', description: 'Official DOFUS Retro integration', enabled: true, official: true, game: 'DofusRetro' },
    { name: 'WAKFU', version: '1.0.0', description: 'Official WAKFU integration', enabled: false, official: true, game: 'Wakfu' },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Puzzle size={20} className="text-brand-400" />
        <div>
          <h1 className="text-xl font-semibold">Plugins</h1>
          <p className="text-sm text-white/40 mt-0.5">Extend Ovvycmb with game integrations</p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Official Plugins</p>
        {officialPlugins.map(plugin => (
          <div key={plugin.name} className="glass rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center text-lg">
              {plugin.game === 'DofusUnity' ? '⚔' : plugin.game === 'DofusRetro' ? '🗡' : '🌊'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{plugin.name}</p>
                {plugin.official && (
                  <span className="text-xs px-1.5 py-0.5 bg-brand-500/20 text-brand-400 rounded">Official</span>
                )}
                <span className="text-xs text-white/30">v{plugin.version}</span>
              </div>
              <p className="text-xs text-white/40 mt-0.5">{plugin.description}</p>
            </div>
            <button className="text-white/30 hover:text-white/70">
              {plugin.enabled ? <ToggleRight size={20} className="text-brand-400" /> : <ToggleLeft size={20} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
