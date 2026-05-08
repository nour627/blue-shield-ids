import { useState } from 'react'

export default function ThreatHunter() {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState(null)

  function handleSearch(e) {
    e.preventDefault()
    if (!query) return
    setSearching(true)
    
    // Simulate search delay
    setTimeout(() => {
      setResults([
        { id: '10294', time: '14:22:11', ip: '192.168.1.45', event: 'Multiple failed logins', status: 'Blocked' },
        { id: '10293', time: '14:15:02', ip: query, event: 'Suspicious payload injected', status: 'Flagged' },
        { id: '10290', time: '13:01:44', ip: '10.0.0.5', event: 'Unusual port scan', status: 'Ignored' },
      ])
      setSearching(false)
    }, 1200)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-up">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Threat Hunter</h1>
        <p className="text-sm text-gray-500 mt-1">Deep search across all ingested event logs and network telemetry.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input 
            type="text" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by IP, MAC, Event ID, or Signature (e.g. 192.168.1.1)"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
          />
          <button 
            type="submit"
            disabled={searching}
            className="bg-[#1a73e8] hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {searching ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : null}
            {searching ? 'Hunting...' : 'Search'}
          </button>
        </form>
      </div>

      {results && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-fade-up">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f8fafc] border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Event ID</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Time</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Source IP</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Event Details</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-mono text-gray-500">{r.id}</td>
                  <td className="px-6 py-4 text-gray-600">{r.time}</td>
                  <td className="px-6 py-4 font-mono text-[#1a73e8]">{r.ip}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{r.event}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      r.status === 'Blocked' ? 'bg-red-100 text-red-700' : 
                      r.status === 'Flagged' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
