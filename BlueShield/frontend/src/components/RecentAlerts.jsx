/**
 * RecentAlerts — table of the latest security alerts
 *
 * Props:
 *   alerts  {Array}
 *   loading {boolean}
 *   error   {string|null}
 */

const SEVERITY_STYLE = {
  High:   { text: '#A32D2D', bg: '#FCEBEB' },
  Medium: { text: '#854F0B', bg: '#FAEEDA' },
  Low:    { text: '#185FA5', bg: '#E6F1FB' },
  Normal: { text: '#0F6E56', bg: '#E1F5EE' },
}

function SeverityBadge({ severity }) {
  const style = SEVERITY_STYLE[severity] ?? SEVERITY_STYLE.Normal
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ color: style.text, backgroundColor: style.bg }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: style.text }}
      />
      {severity}
    </span>
  )
}

function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function RecentAlerts({ alerts = [], loading, error }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="spinner" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-red-500">
        Failed to load alerts
      </div>
    )
  }

  if (!alerts.length) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-400">
        No recent alerts
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const style = SEVERITY_STYLE[alert.severity] ?? SEVERITY_STYLE.Normal
        return (
          <div
            key={alert.id}
            className={`p-4 bg-[#F8FAFC] border border-transparent hover:border-gray-200 rounded-xl transition-colors flex justify-between items-center ${alert.resolved ? 'opacity-60' : ''}`}
          >
            <div className="flex items-center gap-4">
               {/* Dot badge */}
               <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: style.text }}></div>
               <div>
                 <p className="text-sm font-bold text-gray-900 leading-snug">{alert.title}</p>
                 <p className="text-[11px] font-mono text-gray-500 mt-0.5">{alert.src_ip} &rarr; {alert.dst_ip || 'internal'}</p>
               </div>
            </div>
            
            <div className="flex items-center gap-6">
              <span className="text-xs text-gray-500 font-medium">{timeAgo(alert.timestamp)}</span>
              <span
                className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md"
                style={{ color: style.text, backgroundColor: style.bg }}
              >
                {alert.severity}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
