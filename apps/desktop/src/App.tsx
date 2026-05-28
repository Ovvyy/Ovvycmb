import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TitleBar } from "@/components/layout/TitleBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { AccountPanel } from "@/components/layout/AccountPanel";
import { LayoutManager } from "@/components/layout/LayoutManager";
import { Settings } from "@/components/settings/Settings";
import { AgentsPanel } from "@/components/layout/AgentsPanel";
import { PluginsPanel } from "@/components/layout/PluginsPanel";
import { useAppStore } from "@/stores/appStore";
import { useEventBus } from "@/hooks/useEventBus";

export default function App() {
  const { activeView } = useAppStore();
  useEventBus();

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="h-full"
            >
              {activeView === "dashboard" && <Dashboard />}
              {activeView === "accounts" && <AccountPanel />}
              {activeView === "layout" && <LayoutManager />}
              {activeView === "agents" && <AgentsPanel />}
              {activeView === "plugins" && <PluginsPanel />}
              {activeView === "settings" && <Settings />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
