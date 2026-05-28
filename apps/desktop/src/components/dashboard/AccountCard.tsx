import { Focus, MoreVertical, Sword, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { cn, statusDot, statusColor, gameTypeLabel, gameTypeColor, hpColor } from "@/lib/utils";
import { useAppStore } from "@/stores/appStore";
import type { Account } from "@/types";

interface Props {
  account: Account;
}

export function AccountCard({ account }: Props) {
  const { focusAccount, removeAccount } = useAppStore();

  const hpPercent =
    account.hp_current && account.hp_max
      ? Math.round((account.hp_current / account.hp_max) * 100)
      : null;

  const isInCombat = account.status === "InCombat";
  const isCritical = hpPercent !== null && hpPercent <= 25;

  return (
    <div
      className={cn(
        "glass rounded-xl p-3 border transition-all duration-200 cursor-pointer group",
        "hover:border-border hover:bg-card/60",
        isInCombat && "border-red-500/30 bg-red-500/5 turn-active",
        isCritical && "hp-bar-critical"
      )}
      style={{ borderLeftColor: account.color_tag ?? undefined, borderLeftWidth: account.color_tag ? 3 : 1 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("w-2 h-2 rounded-full flex-shrink-0", statusDot(account.status))} />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate leading-tight">
              {account.character_name ?? account.name}
            </p>
            {account.character_name && (
              <p className="text-xs text-muted-foreground truncate">{account.name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1">
          <button
            onClick={(e) => { e.stopPropagation(); focusAccount(account.id); }}
            title="Focus"
            className="w-6 h-6 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <Focus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Game type + level */}
      <div className="flex items-center justify-between mb-2">
        <span className={cn("text-xs font-medium", gameTypeColor(account.game_type))}>
          {gameTypeLabel(account.game_type)}
        </span>
        {account.level && (
          <span className="text-xs text-muted-foreground">Niv. {account.level}</span>
        )}
      </div>

      {/* HP bar */}
      {hpPercent !== null && (
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">HP</span>
            <span className={cn(
              "text-xs font-mono font-medium",
              isCritical ? "text-red-400" : "text-foreground/70"
            )}>
              {account.hp_current} / {account.hp_max}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full", hpColor(hpPercent))}
              initial={{ width: 0 }}
              animate={{ width: `${hpPercent}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Status + combat indicator */}
      <div className="flex items-center justify-between">
        <span className={cn("text-xs font-medium", statusColor(account.status))}>
          {account.status}
        </span>
        {isInCombat && (
          <span className="flex items-center gap-1 text-xs text-red-400">
            <Sword className="w-3 h-3" />
            Combat
          </span>
        )}
        {account.server && (
          <span className="text-xs text-muted-foreground">{account.server}</span>
        )}
      </div>
    </div>
  );
}
