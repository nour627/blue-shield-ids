import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

// Colors per attack type — mapped to the severity color system
const TYPE_COLORS = {
  Normal:        '#0F6E56',
  DoS:           '#A32D2D',
  PortScan:      '#185FA5',
  'Brute Force': '#854F0B',
  'Web Attack':  '#7C3AED',
  Bot:           '#0369A1',
  Infiltration:  '#9F1239',
}

const RADIAN = Math.PI / 180

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.04) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-2.5 text-sm">
      <p className="font-semibold text-slate-800">{name}</p>
      <p className="text-slate-500">{value.toLocaleString()} events</p>
    </div>
  )
}

/**
 * AttackDistributionChart
 * Props:
 *   data {Array<{attack_type, count}>}
 *   loading {boolean}
 *   error {string|null}
 */
export default function AttackDistributionChart({ data = [], loading, error }) {
  if (loading) return <div className="h-48 flex items-center justify-center"><div className="spinner" /></div>
  if (error) return <div className="h-48 flex items-center justify-center text-sm text-red-500">Error loading data</div>

  // Match the exact columns from the mockup: Normal, DoS, Port Scan, Brute Force, Web Attack, R2L (or Infiltration)
  const mockupOrder = ['Normal', 'DoS', 'PortScan', 'Brute Force', 'Web Attack', 'Infiltration']
  
  const displayData = mockupOrder.map(type => {
    const found = data.find(d => d.attack_type === type)
    let count = found ? found.count : 0
    let label = type === 'PortScan' ? 'Port Scan' : (type === 'Infiltration' ? 'R2L' : type)
    let shortCount = count > 999 ? (count / 1000).toFixed(1) + 'k' : count
    
    return { label, count: shortCount }
  })

  return (
    <div className="h-56 flex flex-col justify-end pt-12 pb-2 px-2">
      <div className="flex justify-between items-end border-b border-gray-100 pb-3">
        {displayData.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 w-1/6">
            <span className="text-sm font-semibold text-gray-800">{d.count}</span>
            {/* The mockup shows a tiny visual cue underneath the number, we can just omit or use a tiny bar */}
            <div className={`w-1 rounded-full ${i === 0 ? 'bg-gray-300 h-6' : 'bg-blue-400 h-3'} mt-1 mb-1`} />
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 text-center">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
