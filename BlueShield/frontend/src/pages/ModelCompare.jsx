import { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function ModelCompare() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchModels() {
      try {
        const result = await api.models.compare()
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchModels()
  }, [])

  if (loading && !data) {
    return <div className="spinner mx-auto mt-20" />
  }

  if (error) {
    return <div className="text-red-500 font-medium p-4 bg-red-50 rounded-xl">Error: {error}</div>
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Model Comparison</h1>
        <p className="text-sm text-slate-500 mt-0.5">Real ML models loaded on the server for CICIDS2017 classification.</p>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {data.metrics.map(m => (
          <div key={m.name} className={`p-5 rounded-2xl border ${m.active ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30' : 'bg-white border-slate-200 text-slate-700'}`}>
            <div className="flex justify-between items-start mb-3">
              <h3 className={`font-bold text-sm capitalize ${m.active ? 'text-white' : 'text-slate-800'}`}>{m.name.replace('_', ' ')}</h3>
              {m.active && <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Active</span>}
            </div>
            <div className={`text-xs ${m.active ? 'text-blue-100' : 'text-slate-500'}`}>
              {m.loaded ? '✅ Loaded' : '❌ Not loaded'}
            </div>
          </div>
        ))}
      </div>

      {/* Features Info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-700 mb-4">Model Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Selected Features ({data.n_features})</p>
            <div className="flex flex-wrap gap-1.5 max-h-[200px] overflow-y-auto">
              {data.selected_features.map((f, i) => (
                <span key={i} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium border border-blue-100">{f}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Attack Classes ({data.n_classes})</p>
            <div className="flex flex-wrap gap-2">
              {data.classes.map((c, i) => (
                <span key={i} className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${
                  c === 'BENIGN' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

