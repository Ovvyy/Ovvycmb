import { useState } from 'react'
import { Settings as SettingsIcon, Key, Monitor, Palette } from 'lucide-react'

export function Settings() {
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    await fetch('/api/system/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claudeApiKey: apiKey }),
    }).catch(() => {})
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon size={20} className="text-brand-400" />
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* AI Configuration */}
        <section className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Key size={15} className="text-brand-400" />
            <h2 className="font-medium">AI Agents</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-white/50 block mb-1.5">Claude API Key</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-500/50"
                />
                <button
                  onClick={handleSave}
                  className="btn-primary text-sm px-4"
                >
                  {saved ? '✓ Saved' : 'Save'}
                </button>
              </div>
              <p className="text-xs text-white/30 mt-1.5">Required for AI agents. Your key stays local.</p>
            </div>
          </div>
        </section>

        {/* General */}
        <section className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Monitor size={15} className="text-brand-400" />
            <h2 className="font-medium">Window Management</h2>
          </div>
          <div className="space-y-3">
            <ToggleSetting label="Enable GPU overlay" description="Show HP bars and alerts over game windows" defaultChecked />
            <ToggleSetting label="Start minimized" description="Start Ovvycmb in the system tray" />
            <ToggleSetting label="Start with Windows" description="Launch automatically on startup" />
          </div>
        </section>

        {/* App info */}
        <section className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Palette size={15} className="text-brand-400" />
            <h2 className="font-medium">About</h2>
          </div>
          <div className="text-xs text-white/40 space-y-1">
            <p>Ovvycmb v1.0.0 — Premium DOFUS Multi-Account Organizer</p>
            <p>Built with C# .NET 8 · WPF · WebView2 · ASP.NET Core · React</p>
            <p className="text-white/20 mt-2">IPC Server: localhost:7337 · Metrics: /metrics · API Docs: /swagger</p>
          </div>
        </section>
      </div>
    </div>
  )
}

function ToggleSetting({ label, description, defaultChecked = false }: {
  label: string; description: string; defaultChecked?: boolean
}) {
  const [enabled, setEnabled] = useState(defaultChecked)
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm">{label}</p>
        <p className="text-xs text-white/40 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`w-10 h-6 rounded-full transition-colors ${enabled ? 'bg-brand-500' : 'bg-white/10'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full mx-1 transition-transform ${enabled ? 'translate-x-4' : ''}`} />
      </button>
    </div>
  )
}
