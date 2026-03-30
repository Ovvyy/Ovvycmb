import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'
import { formatGold } from '@/utils/gold'

interface PricePoint {
  date: string
  price: number
  minPrice: number
  quantity?: number
}

interface PriceChartProps {
  data: PricePoint[]
  height?: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-wow-card border border-wow-border rounded-lg p-3 text-xs shadow-card">
      <p className="text-slate-400 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name === 'price' ? 'Marché' : p.name === 'minPrice' ? 'Min' : 'Quantité'}</span>
          <span className="text-wow-gold font-mono">
            {p.name === 'quantity' ? p.value.toLocaleString() : formatGold(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function PriceChart({ data, height = 200 }: PriceChartProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center text-slate-600 text-sm" style={{ height }}>
        Aucune donnée disponible
      </div>
    )
  }

  const avgPrice = data.reduce((s, d) => s + d.price, 0) / data.length

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#f0b429" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#f0b429" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="minGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#00aaff" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#00aaff" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a32" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#4a4a5a', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v.slice(5)} // MM-DD
        />
        <YAxis
          tick={{ fill: '#4a4a5a', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => formatGold(v, true)}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={avgPrice} stroke="#f0b429" strokeDasharray="4 4" strokeOpacity={0.4} />
        <Area
          type="monotone"
          dataKey="minPrice"
          stroke="#00aaff"
          strokeWidth={1.5}
          fill="url(#minGrad)"
          strokeOpacity={0.7}
          dot={false}
          name="minPrice"
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke="#f0b429"
          strokeWidth={2}
          fill="url(#priceGrad)"
          dot={false}
          name="price"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
