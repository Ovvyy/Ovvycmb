import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from './stores/appStore'
import { useSignalR } from './hooks/useSignalR'
import { api } from './api/apiClient'
import { Sidebar } from './components/layout/Sidebar'
import { TitleBar } from './components/layout/TitleBar'
import { Dashboard } from './components/dashboard/Dashboard'
import { LayoutManager } from './components/layout/LayoutManager'
import { AgentsPanel } from './components/layout/AgentsPanel'
import { PluginsPanel } from './components/layout/PluginsPanel'
import { Settings } from './components/settings/Settings'

export default function App() {
  const { activeView, setAccounts, setLayouts, setAgentReports } = useAppStore()
  useSignalR()

  useEffect(() => {
    const loadData = async () => {
      try {
        const [accounts, layouts] = await Promise.all([
          api.accounts.list(),
          api.layouts.list(),
        ])
        setAccounts(accounts)
        setLayouts(layouts)
      } catch (err) {
        console.error('Failed to load initial data:', err)
      }
    }
    loadData()
  }, [])

  const views: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    layout: <LayoutManager />,
    agents: <AgentsPanel />,
    plugins: <PluginsPanel />,
    settings: <Settings />,
  }

  return (
    <div className="flex flex-col h-full bg-surface-900 text-white overflow-hidden">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="h-full overflow-y-auto"
            >
              {views[activeView]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
