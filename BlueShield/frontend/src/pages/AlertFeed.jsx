import { useState, useEffect } from 'react'
import { api } from '../services/api'

const SEVERITY_STYLE = {
  High:   { text: '#A32D2D', bg: '#FCEBEB', border: '#fca5a5' },
  Medium: { text: '#854F0B', bg: '#FAEEDA', border: '#fcd34d' },
  Low:    { text: '#185FA5', bg: '#E6F1FB', border: '#93c5fd' },
  Normal: { text: '#0F6E56', bg: '#E1F5EE', border: '#6ee7b7' },
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

export default function AlertFeed() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAlert, setSelectedAlert] = useState(null)
  
  // Action state
  const [actionLoading, setActionLoading] = useState(false)

  async function fetchAlerts() {
    setLoading(true)
    try {
      const data = await api.alerts.getAll()
      setAlerts(data)
      if (data.length && !selectedAlert) {
        setSelectedAlert(data[0])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, []) // eslint-disable-line

  async function handleResolve(id) {
    setActionLoading(true)
    try {
      await api.alerts.resolve(id)
      setAlerts(alerts.map(a => a.id === id ? { ...a, resolved: true } : a))
      if (selectedAlert?.id === id) {
        setSelectedAlert({ ...selectedAlert, resolved: true })
      }
    } catch (err) {
      alert(`Failed to resolve: ${err.message}`)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleBlock(id) {
    setActionLoading(true)
    try {
      await api.alerts.block(id)
      setAlerts(alerts.map(a => a.id === id ? { ...a, resolved: true } : a))
      if (selectedAlert?.id === id) {
        setSelectedAlert({ ...selectedAlert, resolved: true })
      }
    } catch (err) {
      alert(`Failed to block IP: ${err.message}`)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading && !alerts.length) {
    return <div className="spinner mx-auto mt-20" />
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-fade-up">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-800">Alert Feed</h1>
        <p className="text-sm text-slate-500 mt-0.5">Triaging and incident response.</p>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left Column: Alert List */}
        <div className="w-1/3 glass-card rounded-2xl flex flex-col overflow-hidden border border-white/60">
          <div className="p-4 border-b border-slate-100 bg-[#f8fafc]/50">
            <h2 className="text-sm font-semibold text-slate-700">Inbox ({alerts.filter(a => !a.resolved).length} unresolved)</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {alerts.length === 0 && <p className="text-sm text-slate-400 p-4">No alerts found</p>}
            {alerts.map(alert => {
              const isSelected = selectedAlert?.id === alert.id
              const style = SEVERITY_STYLE[alert.severity] || SEVERITY_STYLE.Normal
              return (
                <button
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-150 border-l-4 ${
                    isSelected ? 'bg-white shadow-sm' : 'hover:bg-slate-50'
                  } ${alert.resolved ? 'opacity-60' : ''}`}
                  style={{ borderLeftColor: isSelected ? style.text : 'transparent' }}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="font-semibold text-sm text-slate-800 truncate pr-2">{alert.title}</span>
                    <span className="text-[10px] whitespace-nowrap text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                      {new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <SeverityBadge severity={alert.severity} />
                    <span className="text-xs text-slate-500 font-mono truncate">{alert.src_ip}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Column: Detail Panel */}
        <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden border border-white/60">
          {selectedAlert ? (
            <>
              <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-white/40">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <SeverityBadge severity={selectedAlert.severity} />
                    {selectedAlert.resolved && (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        Resolved
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">{selectedAlert.title}</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Detected at {new Date(selectedAlert.timestamp).toLocaleString()}
                  </p>
                </div>
                
                {!selectedAlert.resolved && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolve(selectedAlert.id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => handleBlock(selectedAlert.id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 flex items-center gap-2 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-red-500/20 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                      Block IP
                    </button>
                  </div>
                )}
              </div>
              
              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    {selectedAlert.description || "No description provided by the analysis engine."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Threat Intelligence</h3>
                    <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-xs text-slate-500">Attack Type</span>
                        <p className="text-sm font-semibold text-slate-800">{selectedAlert.attack_type}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500">Confidence Score</span>
                        <p className="text-sm font-semibold text-slate-800">98.4% (XGBoost)</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Network Context</h3>
                    <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-xs text-slate-500">Source IP</span>
                        <p className="text-sm font-mono font-semibold text-blue-600">{selectedAlert.src_ip}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500">Destination target</span>
                        <p className="text-sm font-mono font-semibold text-slate-800">{selectedAlert.dst_ip}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              Select an alert from the inbox
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
