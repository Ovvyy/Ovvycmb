import {
  LayoutGrid,
  Users,
  Monitor,
  Bot,
  Puzzle,
  Settings,
  Wifi,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/appStore";
import type { AppView } from "@/types";

interface NavItem {
  id: AppView;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", icon: LayoutGrid, label: "Dashboard" },
  { id: "accounts", icon: Users, label: "Comptes" },
  { id: "layout", icon: Monitor, label: "Layout" },
  { id: "agents", icon: Bot, label: "Agents IA" },
  { id: "plugins", icon: Puzzle, label: "Plugins" },
];

export function Sidebar() {
  const { activeView, setActiveView, accounts } = useAppStore();
  const onlineCount = accounts.filter(
    (a) => !["Offline", "Crashed", "Disconnected"].includes(a.status)
  ).length;

  return (
    <aside className="w-16 flex flex-col items-center py-3 gap-1 border-r border-border/50 bg-card/40 flex-shrink-0">
      {/* Nav items */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <SidebarButton
            key={item.id}
            item={item}
            isActive={activeView === item.id}
            onClick={() => setActiveView(item.id)}
          />
        ))}
      </nav>

      {/* Bottom: status + settings */}
      <div className="flex flex-col items-center gap-2">
        {/* Connection status */}
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            onlineCount > 0 ? "text-green-400" : "text-gray-600"
          )}
          title={`${onlineCount} compte(s) en ligne`}
        >
          {onlineCount > 0 ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
        </div>

        <SidebarButton
          item={{ id: "settings", icon: Settings, label: "Paramètres" }}
          isActive={activeView === "settings"}
          onClick={() => setActiveView("settings")}
        />
      </div>
    </aside>
  );
}

function SidebarButton({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      title={item.label}
      className={cn(
        "relative w-10 h-10 rounded-xl flex items-center justify-center",
        "transition-all duration-150",
        isActive
          ? "bg-primary/15 text-primary shadow-sm shadow-primary/20"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
      )}
    >
      <Icon className="w-4.5 h-4.5" />
      {item.badge !== undefined && item.badge > 0 && (
        <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
          {item.badge > 9 ? "9+" : item.badge}
        </span>
      )}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
      )}
    </button>
  );
}
