import { useState } from 'react'
import { PageWrapper, Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useSettingsStore } from '@/store/settingsStore'
import { POPULAR_REALMS } from '@/data/items'

export function Settings() {
  const { settings, updateSettings, resetSettings } = useSettingsStore()
  const [saved, setSaved] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const REGIONS = [
    { value: 'eu', label: '🇪🇺 Europe' },
    { value: 'us', label: '🇺🇸 Amérique' },
    { value: 'kr', label: '🇰🇷 Corée' },
    { value: 'tw', label: '🇹🇼 Taïwan' },
  ]

  const FACTIONS = [
    { value: 'alliance', label: '🔵 Alliance' },
    { value: 'horde',    label: '🔴 Horde' },
  ]

  const EXPANSIONS = [
    { value: 'war-within',  label: 'The War Within (actuel)' },
    { value: 'midnight',    label: '🌑 Midnight (prochain)' },
    { value: 'dragonflight', label: 'Dragonflight (précédent)' },
  ]

  return (
    <PageWrapper>
      <Header
        title="Paramètres"
        subtitle="Configurez votre royaume, faction et clés API"
      />

      <div className="max-w-2xl space-y-6">
        {/* Realm & Faction */}
        <Card>
          <CardHeader>
            <CardTitle icon="🌍">Royaume & Faction</CardTitle>
          </CardHeader>

          <div className="space-y-4">
            <Select
              label="Région"
              value={settings.region}
              onChange={(e) => updateSettings({ region: e.target.value as any })}
              options={REGIONS}
            />

            <Select
              label="Faction"
              value={settings.faction}
              onChange={(e) => updateSettings({ faction: e.target.value as any })}
              options={FACTIONS}
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-400">Royaume</label>
              <input
                list="realm-list"
                value={settings.realm}
                onChange={(e) => updateSettings({ realm: e.target.value })}
                className="w-full bg-wow-surface border border-wow-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-wow-gold/50"
                placeholder="Nom du royaume"
              />
              <datalist id="realm-list">
                {POPULAR_REALMS
                  .filter((r) => r.region === settings.region && r.faction === settings.faction)
                  .map((r) => (
                    <option key={r.slug} value={r.name} />
                  ))}
              </datalist>
              <p className="text-xs text-slate-600">
                Royaumes populaires ({settings.region.toUpperCase()}):
                {' '}
                {POPULAR_REALMS
                  .filter((r) => r.region === settings.region)
                  .slice(0, 3)
                  .map((r) => r.name)
                  .join(', ')}
              </p>
            </div>

            <Select
              label="Extension WoW"
              value={settings.expansion}
              onChange={(e) => updateSettings({ expansion: e.target.value as any })}
              options={EXPANSIONS}
            />
          </div>
        </Card>

        {/* Blizzard API */}
        <Card>
          <CardHeader>
            <CardTitle icon="🔑">API Blizzard Battle.net</CardTitle>
            <Badge variant="neutral">Optionnel</Badge>
          </CardHeader>

          <div className="space-y-4">
            <div className="rounded-lg bg-blue-500/8 border border-blue-500/20 p-3 text-xs text-blue-300">
              <p className="font-semibold mb-1">Comment obtenir les clés API?</p>
              <ol className="space-y-1 text-slate-400 list-decimal list-inside">
                <li>Allez sur <strong className="text-blue-300">develop.battle.net</strong></li>
                <li>Connectez-vous avec votre compte Battle.net</li>
                <li>Créez une nouvelle application</li>
                <li>Copiez le Client ID et Client Secret ci-dessous</li>
              </ol>
            </div>

            <Input
              label="Client ID"
              value={settings.blizzardClientId}
              onChange={(e) => updateSettings({ blizzardClientId: e.target.value })}
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              icon={<span className="text-xs">🔑</span>}
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-400">Client Secret</label>
              <div className="relative flex items-center">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={settings.blizzardClientSecret}
                  onChange={(e) => updateSettings({ blizzardClientSecret: e.target.value })}
                  placeholder="••••••••••••••••••••••••••••••••"
                  className="w-full bg-wow-surface border border-wow-border rounded-lg px-3 py-2 pr-12 text-sm text-white focus:outline-none focus:border-wow-gold/50"
                />
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 text-slate-500 hover:text-slate-300 text-xs"
                >
                  {showSecret ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                🔌 Tester la connexion
              </Button>
              {settings.blizzardClientId && (
                <Badge variant="profit">✓ Clés configurées</Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle icon="⚙️">Filtres par défaut</CardTitle>
          </CardHeader>

          <div className="space-y-4">
            <Input
              label="Profit minimum (en cuivre)"
              type="number"
              value={settings.minProfit}
              onChange={(e) => updateSettings({ minProfit: Number(e.target.value) })}
              suffix="c"
              icon={<span className="text-xs">💰</span>}
            />
            <p className="text-xs text-slate-600 -mt-2">
              1 or = 10,000 cuivre · 1 argent = 100 cuivre · Valeur actuelle: {(settings.minProfit / 10000).toFixed(2)}g
            </p>

            <Input
              label="ROI minimum (%)"
              type="number"
              min={0}
              max={500}
              value={settings.minRoi}
              onChange={(e) => updateSettings({ minRoi: Number(e.target.value) })}
              suffix="%"
              icon={<span className="text-xs">📊</span>}
            />
          </div>
        </Card>

        {/* About */}
        <Card className="border-wow-gold/20">
          <CardHeader>
            <CardTitle icon="ℹ️">À propos de GoldMaster</CardTitle>
          </CardHeader>
          <div className="space-y-3 text-sm text-slate-400">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-500">Version</p>
                <p className="text-white font-mono">1.0.0</p>
              </div>
              <div>
                <p className="text-slate-500">Extension cible</p>
                <p className="text-white">The War Within / Midnight</p>
              </div>
              <div>
                <p className="text-slate-500">Sources de données</p>
                <p className="text-white">Nexushub · TUJ · Blizzard API</p>
              </div>
              <div>
                <p className="text-slate-500">Mode</p>
                <p className="text-white">Web + Desktop (Electron)</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 pt-2 border-t border-wow-border/50">
              GoldMaster est un outil non-officiel. Les données de marché sont fournies par des services tiers.
              World of Warcraft est une marque déposée de Blizzard Entertainment.
            </p>
          </div>
        </Card>

        {/* Save */}
        <div className="flex items-center gap-3">
          <Button variant="gold" size="lg" onClick={handleSave}>
            {saved ? '✅ Sauvegardé!' : '💾 Sauvegarder les paramètres'}
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={() => { if (confirm('Réinitialiser tous les paramètres ?')) resetSettings() }}
          >
            🔄 Réinitialiser
          </Button>
        </div>
      </div>
    </PageWrapper>
  )
}
