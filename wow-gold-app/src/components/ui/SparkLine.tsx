/**
 * SparkLine — Tiny inline chart for showing price trends
 */

interface SparkLineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  showDot?: boolean
}

export function SparkLine({ data, width = 80, height = 24, color, showDot = true }: SparkLineProps) {
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  // Determine color from trend if not specified
  const trend = data[data.length - 1] - data[0]
  const lineColor = color ?? (trend > 0 ? '#34d399' : trend < 0 ? '#f87171' : '#fbbf24')

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')

  const lastX = width
  const lastY = height - ((data[data.length - 1] - min) / range) * (height - 4) - 2

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={lineColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showDot && (
        <circle cx={lastX} cy={lastY} r={2} fill={lineColor} />
      )}
    </svg>
  )
}
