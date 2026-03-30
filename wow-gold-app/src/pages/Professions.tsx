import { useState } from 'react'
import { PageWrapper, Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Badge, RatingStars } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PROFESSIONS, PROFESSION_COLORS } from '@/data/professions'
import type { Profession } from '@/types'

const SYNERGIES: Record<string, string[]> = {
  Alchemy: ['Herbalism', 'Inscription'],
  Blacksmithing: ['Mining', 'Engineering'],
  Enchanting: ['Tailoring', 'Leatherworking'],
  Engineering: ['Mining', 'Blacksmithing'],
  Herbalism: ['Alchemy', 'Inscription'],
  Inscription: ['Herbalism'],
  Jewelcrafting: ['Mining'],
  Leatherworking: ['Skinning'],
  Mining: ['Blacksmithing', 'Jewelcrafting', 'Engineering'],
  Skinning: ['Leatherworking'],
  Tailoring: ['Enchanting'],
  Cooking: ['Fishing', 'Herbalism'],
  Fishing: ['Cooking'],
  Archaeology: [],
}

const GOLD_TIPS: Record<string, string> = {
  Alchemy: 'Meilleure période: avant les raids (mardi/mercredi). Stockez herbs en avance.',
  Blacksmithing: 'Focus sur les commandes de craft haute-ilvl. Le recraft est très lucratif.',
  Enchanting: 'Postez avant les soirs de raid. Les enchants sont re-achetés à chaque nouveau item.',
  Engineering: 'Niche mais certains items sont exclusifs. Servez votre guilde pour des tips.',
  Herbalism: 'Farmez tôt le matin pour moins de compétition. Vendez le mardi.',
  Inscription: 'Les missives sont indispensables. Stockez encre pendant les lulls de contenu.',
  Jewelcrafting: 'Boom au patch day. Identifiez les stats BiS dès la sortie des patch notes.',
  Leatherworking: 'Commandes de gear en tier 1 de la saison = gros profits.',
  Mining: 'Fondre les lingots peut donner +15-20% de valeur vs minerai brut.',
  Skinning: 'Combinez avec des routes de farming pour maximiser revenus/heure.',
  Tailoring: 'Les sacs: revenus permanents et stables, idéal pour débutants.',
  Cooking: 'Timing clé: vendez les festins la veille et le soir du reset.',
  Fishing: 'Poissons rares pour la cuisine haute-valeur. Patientez sur les prix.',
  Archaeology: 'Revenus rares mais élevés. Pour joueurs patients.',
}

function ProfessionDetail({ prof }: { prof: Profession }) {
  const color = PROFESSION_COLORS[prof.name]
  const synergies = SYNERGIES[prof.name] ?? []

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div
        className="rounded-xl p-5 border"
        style={{
          background: `linear-gradient(135deg, ${color}15 0%, transparent 60%)`,
          borderColor: `${color}30`,
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{prof.icon}</span>
          <div>
            <h2 className="text-2xl font-wow font-bold text-white">{prof.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={prof.type === 'crafting' ? 'blue' : prof.type === 'gathering' ? 'profit' : 'neutral'}>
                {prof.type === 'crafting' ? 'Artisanat' : prof.type === 'gathering' ? 'Collecte' : 'Secondaire'}
              </Badge>
              <RatingStars rating={prof.goldRating} />
              <span className="text-xs text-slate-500">{prof.goldRating}/5 ★ Or</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{prof.description}</p>
      </div>

      {/* Gold tip */}
      <Card className="border-wow-gold/20 bg-wow-gold/5">
        <p className="text-xs font-semibold text-wow-gold mb-1.5">💡 Conseil d'Or</p>
        <p className="text-sm text-slate-300">{GOLD_TIPS[prof.name]}</p>
      </Card>

      {/* Strategies */}
      <Card>
        <p className="text-xs font-semibold text-slate-400 uppercase mb-3">📋 Stratégies pour {prof.name}</p>
        <ul className="space-y-2.5">
          {prof.strategies.map((strat, i) => (
            <li key={i} className="flex gap-2.5 text-sm">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-wow-gold/15 text-wow-gold text-xs flex items-center justify-center font-bold">
                {i + 1}
              </span>
              <span className="text-slate-300 leading-snug">{strat}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Synergies */}
      {synergies.length > 0 && (
        <Card>
          <p className="text-xs font-semibold text-slate-400 uppercase mb-3">🔗 Synergies recommandées</p>
          <div className="flex flex-wrap gap-2">
            {synergies.map((syn) => {
              const synProf = PROFESSIONS.find((p) => p.name === syn)
              const synColor = PROFESSION_COLORS[syn]
              return (
                <div
                  key={syn}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm"
                  style={{
                    background: `${synColor}15`,
                    borderColor: `${synColor}30`,
                    color: synColor,
                  }}
                >
                  <span>{synProf?.icon}</span>
                  <span>{syn}</span>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

export function Professions() {
  const [selected, setSelected] = useState<Profession>(PROFESSIONS[0])
  const [typeFilter, setTypeFilter] = useState<'all' | 'crafting' | 'gathering' | 'secondary'>('all')

  const filtered = PROFESSIONS.filter((p) => typeFilter === 'all' || p.type === typeFilter)

  return (
    <PageWrapper>
      <Header
        title="Guide des Professions"
        subtitle="Stratégies et conseils pour maximiser l'or avec chaque profession"
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'all', label: '🌟 Toutes' },
          { id: 'crafting', label: '⚒️ Artisanat' },
          { id: 'gathering', label: '🌿 Collecte' },
          { id: 'secondary', label: '🎣 Secondaires' },
        ].map((t) => (
          <Button
            key={t.id}
            variant={typeFilter === t.id ? 'gold' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter(t.id as any)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Profession list */}
        <div className="w-full xl:w-64 flex-shrink-0">
          <div className="space-y-1 sticky top-6">
            {filtered.map((p) => {
              const color = PROFESSION_COLORS[p.name]
              const isSelected = selected.name === p.name
              return (
                <button
                  key={p.name}
                  onClick={() => setSelected(p)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left"
                  style={{
                    background: isSelected ? `${color}18` : undefined,
                    border: `1px solid ${isSelected ? `${color}40` : 'transparent'}`,
                  }}
                >
                  <span className="text-xl flex-shrink-0">{p.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {p.name}
                    </p>
                    <RatingStars rating={p.goldRating} />
                  </div>
                  {isSelected && <span className="text-xs" style={{ color }}>→</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1 min-w-0">
          <ProfessionDetail prof={selected} />
        </div>
      </div>
    </PageWrapper>
  )
}
