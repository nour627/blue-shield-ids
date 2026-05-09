import { useState } from 'react'
import { api } from '../services/api'

export default function Diagnostics() {
  const [host, setHost] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  async function handlePing(e) {
    e.preventDefault()
    if (!host) return
    setLoading(true)
    setResult(null)
    
    try {
      const res = await api.tools.ping(host)
      setResult(res)
    } catch (err) {
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Network Diagnostics</h1>
        <p className="text-sm text-gray-500 mt-1">Diagnostic tools for network connectivity testing.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">ICMP Echo Request (Ping)</h2>
        <form onSubmit={handlePing} className="flex gap-4">
          <input 
            type="text" 
            value={host}
            onChange={e => setHost(e.target.value)}
            placeholder="Enter hostname or IP (e.g. 127.0.0.1)"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
          />
          <button 
            type="submit"
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-8 py-3 rounded-xl transition-colors disabled:opacity-70"
          >
            {loading ? 'Testing...' : 'Run Test'}
          </button>
        </form>
      </div>

      {result && (
        <div className="bg-[#0f172a] rounded-2xl p-6 shadow-2xl overflow-hidden border border-slate-800">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Terminal Output</span>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
            </div>
          </div>
          <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
            {result.error ? (
              <span className="text-red-400">Error: {result.error}</span>
            ) : (
              <>
                <span className="text-green-400 font-bold">$ {result.command}</span>
                {"\n"}
                {result.stdout || result.stderr || "No output returned."}
              </>
            )}
          </pre>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900">Education Notice</h4>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              This tool is for internal network diagnostics only. Input is passed directly to the system shell for performance. 
              Ensure only authorized administrators have access to this page.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
