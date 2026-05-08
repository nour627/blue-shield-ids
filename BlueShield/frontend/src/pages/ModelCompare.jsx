import { useState, useEffect } from 'react'
import { api } from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts'

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

  // Format chart data: values multiplied by 100 for percentage
  const chartData = data.metrics.map(m => ({
    name: m.name,
    Accuracy: m.accuracy * 100,
    Precision: m.precision * 100,
    Recall: m.recall * 100,
    F1: m.f1 * 100,
  }))

  const confMatrix = data.confusion_matrix

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Model Comparison</h1>
        <p className="text-sm text-slate-500 mt-0.5">Evaluate ML engine performance on the CICIDS2017 dataset.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Performance Metrics Chart */}
        <div className="glass-card rounded-2xl p-5 border border-white/60">
          <h2 className="text-base font-bold text-slate-700 mb-6">Algorithm Performance (%)</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis domain={[80, 100]} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Bar dataKey="Accuracy" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="F1" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix */}
        <div className="glass-card rounded-2xl p-5 border border-white/60">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-slate-700">Confusion Matrix</h2>
            <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-semibold">Active: XGBoost</span>
          </div>
          
          <div className="overflow-x-auto">
            <div className="min-w-[400px]">
              {/* Header Row */}
              <div className="flex pl-16 mb-2">
                {confMatrix.classes.map((cls, i) => (
                  <div key={i} className="flex-1 text-center text-xs font-semibold text-slate-500 uppercase">{cls}</div>
                ))}
              </div>
              
              {/* Matrix Rows */}
              <div className="space-y-1">
                {confMatrix.matrix.map((row, i) => {
                  const trueClass = confMatrix.classes[i]
                  return (
                    <div key={i} className="flex h-12">
                      <div className="w-16 flex items-center justify-end pr-3 text-xs font-semibold text-slate-500 uppercase">
                        {trueClass}
                      </div>
                      <div className="flex-1 flex gap-1">
                        {row.map((val, j) => {
                          const isDiagonal = i === j
                          // Calculate intense color shade inside diagonal
                          const intensity = isDiagonal ? Math.min(100, Math.max(10, (val / 8500) * 100)) : 0
                          const bgClass = isDiagonal 
                            ? (intensity > 50 ? 'bg-blue-600 text-white' : 'bg-blue-300 text-blue-900') 
                            : (val > 0 ? 'bg-red-100 text-red-700 font-bold' : 'bg-slate-50 text-slate-400')
                            
                          return (
                            <div 
                              key={j} 
                              className={`flex-1 flex items-center justify-center text-sm rounded ${bgClass} transition-all hover:opacity-80`}
                              title={`True: ${trueClass}, Predicted: ${confMatrix.classes[j]}`}
                            >
                              {val}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="text-center text-xs text-slate-400 mt-4 italic">Rows: Actual True Class &middot; Columns: Predicted Class</div>
            </div>
          </div>
        </div>

      </div>

      {/* Model Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {data.metrics.map(m => (
          <div key={m.name} className={`p-4 rounded-2xl border ${m.active ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30' : 'bg-white border-slate-200 text-slate-700'}`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className={`font-semibold text-sm ${m.active ? 'text-white' : 'text-slate-800'}`}>{m.name}</h3>
              {m.active && <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Deployed</span>}
            </div>
            <div className="space-y-1 mt-auto">
              <div className="flex justify-between text-xs">
                <span className={m.active ? 'text-blue-100' : 'text-slate-500'}>Accuracy</span>
                <span className="font-mono font-medium">{(m.accuracy * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className={m.active ? 'text-blue-100' : 'text-slate-500'}>Avg Time</span>
                <span className="font-mono font-medium">{m.training_time_sec}s</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
