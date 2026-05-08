import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-2.5 text-sm">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

/**
 * TrafficTimelineChart — area chart of hourly traffic
 * Props: data, loading, error
 */
export default function TrafficTimelineChart({ data = [], loading, error }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-52">
        <div className="spinner" />
      </div>
    )
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-52 text-sm text-red-500">
        Failed to load timeline
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
        <defs>
          <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradThreats" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(v) => <span className="text-xs text-slate-500 font-medium capitalize">{v}</span>}
          iconType="circle" iconSize={7}
        />
        <Area type="monotone" dataKey="total"   name="Total"   stroke="#3b82f6" strokeWidth={2} fill="url(#gradTotal)"   dot={false} />
        <Area type="monotone" dataKey="threats" name="Threats" stroke="#ef4444" strokeWidth={2} fill="url(#gradThreats)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
