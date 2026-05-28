import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { api } from '@/api/apiClient'
import type { GameType } from '@/types'

const GAME_TYPES: GameType[] = ['DofusUnity', 'DofusRetro', 'Wakfu']

export function AccountPanel() {
  const { accounts, setAccounts } = useAppStore()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', characterName: '', gameType: 'DofusUnity' as GameType, server: '' })

  const handleAdd = async () => {
    if (!form.name) return
    const created = await api.accounts.create({ name: form.name, characterName: form.characterName, gameType: form.gameType, server: form.server })
    setAccounts([...accounts, created])
    setShowAdd(false)
    setForm({ name: '', characterName: '', gameType: 'DofusUnity', server: '' })
  }

  const handleDelete = async (id: string) => {
    await api.accounts.delete(id)
    setAccounts(accounts.filter(a => a.id !== id))
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Accounts</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
          <Plus size={12} /> Add
        </button>
      </div>
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass rounded-lg p-3 mb-4 space-y-2">
            <input placeholder="Account name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm focus:outline-none" />
            <input placeholder="Character name" value={form.characterName} onChange={e => setForm(f => ({ ...f, characterName: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm focus:outline-none" />
            <select value={form.gameType} onChange={e => setForm(f => ({ ...f, gameType: e.target.value as GameType }))} className="w-full bg-surface-800 border border-white/10 rounded px-2 py-1 text-sm">
              {GAME_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button onClick={handleAdd} className="btn-primary text-xs w-full py-1.5">Create</button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="space-y-2">
        {accounts.map(account => (
          <div key={account.id} className="flex items-center justify-between glass rounded-lg px-3 py-2">
            <div>
              <p className="text-sm font-medium">{account.characterName || account.name}</p>
              <p className="text-xs text-white/40">{account.gameType}</p>
            </div>
            <button onClick={() => handleDelete(account.id)} className="p-1 rounded hover:bg-white/5 text-white/30 hover:text-accent-danger"><Trash2 size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
