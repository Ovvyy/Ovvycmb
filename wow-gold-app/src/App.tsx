import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { Dashboard } from '@/pages/Dashboard'
import { ItemBrowser } from '@/pages/ItemBrowser'
import { CraftingCalculator } from '@/pages/CraftingCalculator'
import { Strategies } from '@/pages/Strategies'
import { Professions } from '@/pages/Professions'
import { MarketFlipper } from '@/pages/MarketFlipper'
import { MarketIntel } from '@/pages/MarketIntel'
import { Watchlist } from '@/pages/Watchlist'
import { AIInsights } from '@/pages/AIInsights'
import { Settings } from '@/pages/Settings'
import { Prospecting } from '@/pages/Prospecting'
import { EnchantingShuffle } from '@/pages/EnchantingShuffle'
import { TreasureMap } from '@/pages/TreasureMap'
import { KnowledgePoints } from '@/pages/KnowledgePoints'
import { ProfessionEquipment } from '@/pages/ProfessionEquipment'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 2 },
  },
})

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter:   { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' as const } },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.15, ease: 'easeIn' as const } },
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        className="flex-1"
      >
        <Routes location={location}>
          <Route path="/"             element={<Dashboard />} />
          <Route path="/market-intel" element={<MarketIntel />} />
          <Route path="/ai-insights"  element={<AIInsights />} />
          <Route path="/items"        element={<ItemBrowser />} />
          <Route path="/crafting"     element={<CraftingCalculator />} />
          <Route path="/strategies"   element={<Strategies />} />
          <Route path="/professions"  element={<Professions />} />
          <Route path="/flipper"      element={<MarketFlipper />} />
          <Route path="/watchlist"    element={<Watchlist />} />
          <Route path="/prospecting"  element={<Prospecting />} />
          <Route path="/enchanting"   element={<EnchantingShuffle />} />
          <Route path="/treasures"    element={<TreasureMap />} />
          <Route path="/knowledge"    element={<KnowledgePoints />} />
          <Route path="/equipment"    element={<ProfessionEquipment />} />
          <Route path="/settings"     element={<Settings />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex min-h-screen bg-wow-bg">
          <Sidebar />
          <AnimatedRoutes />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
