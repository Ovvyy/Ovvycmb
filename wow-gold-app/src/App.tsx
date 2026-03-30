import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Sidebar } from '@/components/layout/Sidebar'
import { Dashboard } from '@/pages/Dashboard'
import { ItemBrowser } from '@/pages/ItemBrowser'
import { CraftingCalculator } from '@/pages/CraftingCalculator'
import { Strategies } from '@/pages/Strategies'
import { Professions } from '@/pages/Professions'
import { MarketFlipper } from '@/pages/MarketFlipper'
import { Settings } from '@/pages/Settings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex min-h-screen bg-wow-bg">
          <Sidebar />
          <main className="flex-1">
            <Routes>
              <Route path="/"            element={<Dashboard />} />
              <Route path="/items"       element={<ItemBrowser />} />
              <Route path="/crafting"    element={<CraftingCalculator />} />
              <Route path="/strategies"  element={<Strategies />} />
              <Route path="/professions" element={<Professions />} />
              <Route path="/flipper"     element={<MarketFlipper />} />
              <Route path="/settings"    element={<Settings />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
