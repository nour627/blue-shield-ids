import { useState, useEffect } from 'react'
import { api } from '../services/api'

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

function LiveIcon() {
  return (
    <span className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
    </span>
  )
}

/**
 * Task 2 — Live Traffic
 * Polls the backend every 2 seconds for simulating real-time traffic
 */
export default function LiveTraffic() {
  const [events, setEvents] = useState([])
  const [isLive, setIsLive] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let intervalId = null

    async function fetchStream() {
      try {
        const freshEvents = await api.liveTraffic.getStream(12)
        // Prepend new events, keep max 50 in state to prevent lag
        setEvents((prev) => {
          const combined = [...freshEvents, ...prev]
          // unique by id
          const uniqueMap = new Map()
          combined.forEach(evt => !uniqueMap.has(evt.id) && uniqueMap.set(evt.id, evt))
          return Array.from(uniqueMap.values()).slice(0, 60)
        })
        setError(null)
      } catch (err) {
        setError(err.message)
      }
    }

    if (isLive) {
      // initial fetch
      fetchStream()
      // continuous 2s polling
      intervalId = setInterval(fetchStream, 2000)
    }

    return () => clearInterval(intervalId)
  }, [isLive])

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            Live Traffic
            {isLive ? <LiveIcon /> : <span className="w-3 h-3 rounded-full bg-slate-400" />}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Streaming real-time network packets and ML threat analysis.
          </p>
        </div>
        
        <button
          onClick={() => setIsLive(!isLive)}
          className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-all duration-150 shadow-sm ${
            isLive 
              ? 'bg-white border-red-200 text-red-600 hover:bg-red-50 border border-solid' 
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 border border-solid'
          }`}
        >
          {isLive ? 'Pause Stream' : 'Resume Stream'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
          Error loading stream: {error}
        </div>
      )}

      {/* ── Table ── */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-sm border border-white/60">
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8fafc]/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Time</th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Source</th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Destination</th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider hidden sm:table-cell">Proto</th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider hidden lg:table-cell">Bytes</th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 relative">
              {events.length === 0 && !error && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="spinner mx-auto mb-3 border-slate-200 border-t-slate-400 w-8 h-8"/>
                    Waiting for network packets...
                  </td>
                </tr>
              )}
              {events.map((evt) => (
                <tr 
                  key={evt.id} 
                  className={`hover:bg-blue-50/40 transition-colors animate-fade-up`} 
                  style={{ animationDuration: '400ms' }}
                >
                  <td className="py-3 px-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                    {new Date(evt.timestamp).toLocaleTimeString(undefined, { 
                      hour12: false, 
                      hour: "2-digit", 
                      minute: "2-digit", 
                      second: "2-digit" 
                    })}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600">
                    {evt.src_ip} <span className="text-slate-400">:{evt.src_port}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600">
                    {evt.dst_ip} <span className="text-slate-400">:{evt.dst_port}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 hidden sm:table-cell">{evt.protocol}</td>
                  <td className="py-3 px-4 text-slate-500 hidden lg:table-cell">{evt.bytes_total?.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                       <SeverityBadge severity={evt.severity} />
                       {evt.attack_type !== 'Normal' && (
                         <span className="text-xs font-semibold text-slate-600">{evt.attack_type}</span>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
