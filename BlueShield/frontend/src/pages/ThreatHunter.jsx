import { useState } from 'react'
import { api } from '../services/api'

export default function ThreatHunter() {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState(null)

  async function handleSearch(e) {
    e.preventDefault()
    if (!query) return
    setSearching(true)
    
    try {
      const data = await api.tools.search(query)
      setResults(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setResults([])
    } finally {
      setSearching(false)
    }
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
            placeholder="Search by IP, Attack Type, or Signature (e.g. 192.168.1.1 or DoS)"
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

      {results && results.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
          <p className="text-gray-500 text-sm">No results found. Try a different search query or upload a PCAP file first.</p>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-fade-up">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f8fafc] border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">ID</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Timestamp</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Source IP</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Dest IP</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Attack Type</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-mono text-gray-500">{r.id}</td>
                  <td className="px-6 py-4 text-gray-600">{r.timestamp || '—'}</td>
                  <td className="px-6 py-4 font-mono text-[#1a73e8]">{r.src_ip || '—'}</td>
                  <td className="px-6 py-4 font-mono text-gray-600">{r.dst_ip || '—'}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{r.attack_type || '—'}</td>
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
