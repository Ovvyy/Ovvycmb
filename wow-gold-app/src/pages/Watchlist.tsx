/**
 * Watchlist & Alerts Page — Manage tracked items, alert rules, Discord config
 */
import { useState } from 'react'
import { PageWrapper, Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAlertStore, conditionLabel, type AlertCondition } from '@/alerts/alert-store'
import { cn } from '@/utils/cn'
import { TRACKED_ITEMS } from '@/data/items'

type Tab = 'watchlist' | 'rules' | 'notifications' | 'discord'

export function Watchlist() {
  const [tab, setTab] = useState<Tab>('watchlist')
  const store = useAlertStore()

  const tabs: { key: Tab; label: string; icon: string; count?: number }[] = [
    { key: 'watchlist', label: 'Watchlist', icon: '👁️', count: store.watchlist.length },
    { key: 'rules', label: 'Règles', icon: '🔔', count: store.rules.length },
    { key: 'notifications', label: 'Notifications', icon: '📬', count: store.unreadCount() },
    { key: 'discord', label: 'Discord', icon: '💬' },
  ]

  return (
    <PageWrapper>
      <Header
        title="Watchlist & Alertes"
        subtitle="Suivez vos items favoris et recevez des alertes automatiques"
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-wow-surface rounded-xl p-1 border border-wow-border">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === t.key ? 'bg-wow-gold/15 text-wow-gold border border-wow-gold/25' : 'text-slate-400 hover:text-white'
            )}
          >
            <span>{t.icon}</span>
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-wow-gold/20 text-wow-gold text-[10px] font-bold">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'watchlist' && <WatchlistTab />}
      {tab === 'rules' && <RulesTab />}
      {tab === 'notifications' && <NotificationsTab />}
      {tab === 'discord' && <DiscordTab />}
    </PageWrapper>
  )
}

function WatchlistTab() {
  const { watchlist, addToWatchlist, removeFromWatchlist } = useAlertStore()
  const [showAdd, setShowAdd] = useState(false)

  const unwatched = TRACKED_ITEMS.filter(t => !watchlist.some(w => w.itemId === t.id))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{watchlist.length} item(s) suivis</p>
        <Button variant="success" size="sm" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? '✕ Fermer' : '+ Ajouter un item'}
        </Button>
      </div>

      {showAdd && (
        <Card>
          <CardHeader>
            <CardTitle icon="➕">Ajouter à la watchlist</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
            {unwatched.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  addToWatchlist({ itemId: item.id, itemName: item.name, addedAt: new Date().toISOString() })
                }}
                className="flex items-center gap-2 p-2 rounded-lg bg-wow-surface/50 border border-wow-border/30 hover:border-wow-gold/30 transition-colors text-left"
              >
                <span className="text-xs text-slate-400">+</span>
                <div>
                  <p className="text-xs text-white truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-600">{item.expansion}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {watchlist.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-2xl mb-2">👁️</p>
          <p className="text-slate-400 text-sm">Votre watchlist est vide</p>
          <p className="text-slate-600 text-xs mt-1">Ajoutez des items pour suivre leurs prix et recevoir des alertes</p>
        </Card>
      ) : (
        watchlist.map(w => (
          <Card key={w.itemId} className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-wow-gold/10 flex items-center justify-center text-lg">📌</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{w.itemName}</p>
              <p className="text-[10px] text-slate-500">Ajouté le {new Date(w.addedAt).toLocaleDateString('fr-FR')}</p>
              {w.notes && <p className="text-xs text-slate-400 mt-1 italic">{w.notes}</p>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {w.targetBuyPrice && (
                <Badge variant="profit">Achat: {(w.targetBuyPrice / 10000).toFixed(0)}g</Badge>
              )}
              {w.targetSellPrice && (
                <Badge variant="loss">Vente: {(w.targetSellPrice / 10000).toFixed(0)}g</Badge>
              )}
              <Button variant="danger" size="sm" onClick={() => removeFromWatchlist(w.itemId)}>
                ✕
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}

function RulesTab() {
  const { rules, addRule, removeRule, toggleRule } = useAlertStore()
  const [showAdd, setShowAdd] = useState(false)
  const [newRule, setNewRule] = useState({ itemId: 0, condition: 'price_below' as AlertCondition, threshold: 0 })

  const conditions: AlertCondition[] = ['price_below', 'price_above', 'roi_above', 'signal_buy', 'signal_sell', 'volatility_high', 'pattern_detected']

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{rules.length} règle(s) configurée(s)</p>
        <Button variant="success" size="sm" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? '✕ Fermer' : '+ Nouvelle règle'}
        </Button>
      </div>

      {showAdd && (
        <Card>
          <CardHeader>
            <CardTitle icon="🔔">Nouvelle règle d'alerte</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Item</label>
              <select
                className="w-full bg-wow-surface border border-wow-border rounded-lg px-3 py-2 text-sm text-white"
                value={newRule.itemId}
                onChange={e => setNewRule(r => ({ ...r, itemId: Number(e.target.value) }))}
              >
                <option value={0}>Sélectionner un item...</option>
                {TRACKED_ITEMS.map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Condition</label>
              <select
                className="w-full bg-wow-surface border border-wow-border rounded-lg px-3 py-2 text-sm text-white"
                value={newRule.condition}
                onChange={e => setNewRule(r => ({ ...r, condition: e.target.value as AlertCondition }))}
              >
                {conditions.map(c => (
                  <option key={c} value={c}>{conditionLabel(c)}</option>
                ))}
              </select>
            </div>
            {!['signal_buy', 'signal_sell', 'volatility_high', 'pattern_detected'].includes(newRule.condition) && (
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Seuil (en copper)</label>
                <Input
                  type="number"
                  value={newRule.threshold}
                  onChange={e => setNewRule(r => ({ ...r, threshold: Number(e.target.value) }))}
                  placeholder="Ex: 50000"
                />
              </div>
            )}
            <Button
              variant="gold"
              size="sm"
              disabled={!newRule.itemId}
              onClick={() => {
                const item = TRACKED_ITEMS.find(i => i.id === newRule.itemId)
                if (!item) return
                addRule({
                  itemId: item.id,
                  itemName: item.name,
                  condition: newRule.condition,
                  threshold: newRule.threshold,
                  enabled: true,
                })
                setShowAdd(false)
              }}
            >
              Créer la règle
            </Button>
          </div>
        </Card>
      )}

      {rules.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-2xl mb-2">🔔</p>
          <p className="text-slate-400 text-sm">Aucune règle d'alerte</p>
          <p className="text-slate-600 text-xs mt-1">Créez des règles pour être alerté des mouvements de prix</p>
        </Card>
      ) : (
        rules.map(r => (
          <Card key={r.id} className={cn('flex items-center gap-4', !r.enabled && 'opacity-50')}>
            <button
              onClick={() => toggleRule(r.id)}
              className={cn(
                'w-10 h-6 rounded-full transition-colors flex-shrink-0 relative',
                r.enabled ? 'bg-emerald-500' : 'bg-slate-600'
              )}
            >
              <span className={cn(
                'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                r.enabled ? 'left-[18px]' : 'left-0.5'
              )} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{r.itemName}</p>
              <p className="text-xs text-slate-400">
                {conditionLabel(r.condition)}
                {r.threshold > 0 && ` · ${(r.threshold / 10000).toFixed(0)}g`}
              </p>
              <p className="text-[10px] text-slate-600">
                Déclenché {r.triggerCount}x · Créé le {new Date(r.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <Button variant="danger" size="sm" onClick={() => removeRule(r.id)}>✕</Button>
          </Card>
        ))
      )}
    </div>
  )
}

function NotificationsTab() {
  const { notifications, markRead, markAllRead, dismissNotification, clearNotifications, unreadCount } = useAlertStore()
  const visible = notifications.filter(n => !n.dismissed)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{unreadCount()} non lue(s) · {visible.length} total</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllRead}>Tout marquer lu</Button>
          <Button variant="danger" size="sm" onClick={clearNotifications}>Vider</Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-2xl mb-2">📬</p>
          <p className="text-slate-400 text-sm">Aucune notification</p>
          <p className="text-slate-600 text-xs mt-1">Les alertes apparaîtront ici quand vos règles seront déclenchées</p>
        </Card>
      ) : (
        visible.map(n => (
          <Card key={n.id} className={cn('flex items-start gap-3', !n.read && 'border-wow-gold/30 bg-wow-gold/3')}>
            <span className="text-xl mt-0.5">
              {n.type === 'opportunity' ? '💰' : n.type === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={n.priority === 'high' ? 'loss' : n.priority === 'medium' ? 'gold' : 'neutral'}>
                  {n.priority}
                </Badge>
                <span className="text-[10px] text-slate-500">
                  {new Date(n.timestamp).toLocaleString('fr-FR')}
                </span>
              </div>
              <p className="text-sm text-white">{n.message}</p>
              <p className="text-xs text-slate-500 mt-0.5">{n.itemName}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {!n.read && (
                <Button variant="ghost" size="sm" onClick={() => markRead(n.id)}>✓</Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => dismissNotification(n.id)}>✕</Button>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}

function DiscordTab() {
  const { discord, updateDiscord } = useAlertStore()

  return (
    <div className="max-w-xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle icon="💬">Configuration Discord Webhook</CardTitle>
          <button
            onClick={() => updateDiscord({ enabled: !discord.enabled })}
            className={cn(
              'w-10 h-6 rounded-full transition-colors relative',
              discord.enabled ? 'bg-emerald-500' : 'bg-slate-600'
            )}
          >
            <span className={cn(
              'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform',
              discord.enabled ? 'left-[18px]' : 'left-0.5'
            )} />
          </button>
        </CardHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Webhook URL</label>
            <Input
              type="text"
              value={discord.url}
              onChange={e => updateDiscord({ url: e.target.value })}
              placeholder="https://discord.com/api/webhooks/..."
            />
            <p className="text-[10px] text-slate-600 mt-1">Créez un webhook dans les paramètres de votre channel Discord</p>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">Priorité minimum</label>
            <select
              className="w-full bg-wow-surface border border-wow-border rounded-lg px-3 py-2 text-sm text-white"
              value={discord.minPriority}
              onChange={e => updateDiscord({ minPriority: e.target.value as 'high' | 'medium' | 'low' })}
            >
              <option value="high">Haute seulement</option>
              <option value="medium">Moyenne et haute</option>
              <option value="low">Toutes les alertes</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">Mention rôle (optionnel)</label>
            <Input
              type="text"
              value={discord.mentionRole ?? ''}
              onChange={e => updateDiscord({ mentionRole: e.target.value || undefined })}
              placeholder="ID du rôle Discord"
            />
          </div>
        </div>
      </Card>

      <Card className="bg-wow-gold/5 border-wow-gold/15">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="text-sm font-medium text-wow-gold">Comment configurer?</p>
            <ol className="text-xs text-slate-400 mt-2 space-y-1 list-decimal list-inside">
              <li>Ouvrez les paramètres du channel Discord</li>
              <li>Allez dans Intégrations → Webhooks</li>
              <li>Créez un nouveau webhook et copiez l'URL</li>
              <li>Collez l'URL ci-dessus et activez les notifications</li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  )
}
