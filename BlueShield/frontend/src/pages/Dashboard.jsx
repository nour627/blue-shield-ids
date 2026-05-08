import { useEffect, useState, useCallback } from 'react'
import { api } from '../services/api'
import StatCard from '../components/StatCard'
import AttackDistributionChart from '../components/AttackDistributionChart'
import TrafficTimelineChart from '../components/TrafficTimelineChart'
import RecentAlerts from '../components/RecentAlerts'

// ── Icons ─────────────────────────────────────────────────────
function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}
function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
function BrainIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  )
}
function BlockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  )
}
function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}
function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  )
}

// ── Custom hook — fetch with loading/error state ──────────────
function useFetch(fetchFn) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load() }, [load])

  return { data, loading, error, reload: load }
}

// ── Helper to format % change ─────────────────────────────────
function fmtPct(pct) {
  if (pct == null) return ''
  const sign = pct >= 0 ? '↑' : '↓'
  return `${sign} ${Math.abs(pct)}% vs yesterday`
}

// ── Dashboard Page ────────────────────────────────────────────
export default function Dashboard() {
  const stats    = useFetch(api.dashboard.getStats)
  const distrib  = useFetch(api.dashboard.getAttackDistribution)
  const alerts   = useFetch(api.dashboard.getRecentAlerts)
  const timeline = useFetch(api.dashboard.getTrafficTimeline)

  const [lastUpdated, setLastUpdated] = useState(new Date())

  function reloadAll() {
    stats.reload()
    distrib.reload()
    alerts.reload()
    timeline.reload()
    setLastUpdated(new Date())
  }

  const s = stats.data

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="animate-fade-up border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Security Overview</h1>
        <p className="text-sm text-gray-500 mt-1 pb-1">
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} — Last sync: {lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          id="stat-total-events"
          title="Total Events Today"
          value={s?.total_events?.toLocaleString()}
          subtitle={fmtPct(s?.pct_change)}
          delay={0}
        />
        <StatCard
          id="stat-active-threats"
          title="Active Threats"
          value={s?.active_threats?.toLocaleString()}
          subtitle={`${s?.need_action ?? '—'} need action`}
          valueColor="text-[#A32D2D]"
          delay={1}
        />
        <StatCard
          id="stat-model-accuracy"
          title="Model Accuracy"
          value={s ? `${s.model_accuracy}%` : undefined}
          subtitle={s?.model_name ?? ''}
          valueColor="text-[#0F6E56]"
          delay={2}
        />
        <StatCard
          id="stat-blocked-ips"
          title="Blocked IPs"
          value={s?.blocked_ips?.toLocaleString()}
          subtitle="Auto-blocked"
          delay={3}
        />
      </div>

      {/* ── Content row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* Attack Distribution */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-gray-900">Attack distribution — today</h2>
            <button className="text-blue-600 text-sm font-semibold hover:text-blue-700 flex items-center gap-1">
              view all &rarr;
            </button>
          </div>
          <AttackDistributionChart
            data={distrib.data ?? []}
            loading={distrib.loading}
            error={distrib.error}
          />
        </div>

        {/* Recent Alerts */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-gray-900">Recent alerts</h2>
            <button className="text-blue-600 text-sm font-semibold hover:text-blue-700 flex items-center gap-1">
              view all &rarr;
            </button>
          </div>
          <RecentAlerts
            alerts={alerts.data ?? []}
            loading={alerts.loading}
            error={alerts.error}
          />
        </div>

      </div>
    </div>
  )
}
