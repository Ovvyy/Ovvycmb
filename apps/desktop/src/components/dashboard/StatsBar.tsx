import { Users, Sword, ArrowLeftRight, Wifi } from "lucide-react";
import type { Account } from "@/types";

interface Props {
  accounts: Account[];
}

export function StatsBar({ accounts }: Props) {
  const total = accounts.length;
  const online = accounts.filter((a) => a.status !== "Offline" && a.status !== "Crashed" && a.status !== "Disconnected").length;
  const inCombat = accounts.filter((a) => a.status === "InCombat").length;
  const trading = accounts.filter((a) => a.status === "Trading").length;

  const stats = [
    { label: "Comptes", value: total, icon: Users, color: "text-blue-400" },
    { label: "En ligne", value: online, icon: Wifi, color: "text-green-400" },
    { label: "En combat", value: inCombat, icon: Sword, color: "text-red-400" },
    { label: "Échanges", value: trading, icon: ArrowLeftRight, color: "text-blue-300" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 flex-shrink-0">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="glass rounded-xl p-3 flex items-center gap-3">
            <div className={`${stat.color} bg-current/10 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-4 h-4" style={{ color: "inherit" }} />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
