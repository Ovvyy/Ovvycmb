import { useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Scan, Zap } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { AccountCard } from "./AccountCard";
import { StatsBar } from "./StatsBar";
import { EventFeed } from "./EventFeed";
import { cn } from "@/lib/utils";

export function Dashboard() {
  const { accounts, fetchAccounts, scanWindows } = useAppStore();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const onlineAccounts = accounts.filter(
    (a) => !["Offline", "Crashed", "Disconnected"].includes(a.status)
  );

  return (
    <div className="h-full flex flex-col p-4 gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {onlineAccounts.length} / {accounts.length} comptes actifs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={scanWindows}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
              "bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            )}
          >
            <Scan className="w-3.5 h-3.5" />
            Scanner fenêtres
          </button>
          <button
            onClick={fetchAccounts}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              "text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            )}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsBar accounts={accounts} />

      {/* Main content */}
      <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
        {/* Account grid */}
        <div className="flex-1 overflow-y-auto">
          {accounts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
              {accounts.map((account, i) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                >
                  <AccountCard account={account} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Event feed */}
        <div className="w-64 flex-shrink-0">
          <EventFeed />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  const { setActiveView } = useAppStore();

  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
        <Zap className="w-8 h-8 text-muted-foreground" />
      </div>
      <div>
        <p className="font-medium text-foreground">Aucun compte</p>
        <p className="text-sm text-muted-foreground mt-1">
          Ajoutez vos comptes DOFUS pour commencer
        </p>
      </div>
      <button
        onClick={() => setActiveView("accounts")}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Ajouter un compte
      </button>
    </div>
  );
}
