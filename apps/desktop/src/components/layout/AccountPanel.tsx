import { useEffect, useState } from "react";
import { Plus, Trash2, Focus, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/stores/appStore";
import { cn, statusDot, statusColor, gameTypeLabel, gameTypeColor } from "@/lib/utils";
import type { Account, GameType } from "@/types";

export function AccountPanel() {
  const { accounts, fetchAccounts, addAccount, removeAccount, focusAccount } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newGameType, setNewGameType] = useState<GameType>("dofus_unity");

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addAccount(newName.trim(), newGameType);
    setNewName("");
    setShowAdd(false);
  };

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Comptes</h1>
          <p className="text-sm text-muted-foreground">{accounts.length} compte(s) enregistré(s)</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-xl p-4 space-y-3"
          >
            <h3 className="text-sm font-semibold">Nouveau compte</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Nom</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="Mon compte"
                  autoFocus
                  className="w-full bg-input border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Jeu</label>
                <select
                  value={newGameType}
                  onChange={(e) => setNewGameType(e.target.value as GameType)}
                  className="w-full bg-input border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="dofus_unity">DOFUS</option>
                  <option value="dofus_retro">DOFUS Retro</option>
                  <option value="wakfu">WAKFU</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowAdd(false)}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                Créer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Account list */}
      <div className="flex-1 overflow-y-auto space-y-2">
        <AnimatePresence>
          {accounts.map((account) => (
            <AccountRow
              key={account.id}
              account={account}
              onFocus={() => focusAccount(account.id)}
              onRemove={() => removeAccount(account.id)}
            />
          ))}
        </AnimatePresence>
        {accounts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-sm text-muted-foreground">Aucun compte — cliquez sur "Ajouter"</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AccountRow({
  account,
  onFocus,
  onRemove,
}: {
  account: Account;
  onFocus: () => void;
  onRemove: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="glass rounded-xl p-3 flex items-center gap-3 group hover:bg-card/60 transition-colors"
    >
      {/* Status dot */}
      <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", statusDot(account.status))} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold truncate">
            {account.character_name ?? account.name}
          </p>
          <span className={cn("text-xs font-medium", gameTypeColor(account.game_type))}>
            {gameTypeLabel(account.game_type)}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className={cn("text-xs", statusColor(account.status))}>{account.status}</span>
          {account.level && (
            <span className="text-xs text-muted-foreground">Niv. {account.level}</span>
          )}
          {account.server && (
            <span className="text-xs text-muted-foreground">{account.server}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onFocus}
          title="Focus"
          className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
        >
          <Focus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onRemove}
          title="Supprimer"
          className="w-7 h-7 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
