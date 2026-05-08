import { useState, useEffect } from 'react'

export default function Retrain() {
  const [training, setTraining] = useState(false)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    if (training) {
      if (progress >= 100) {
        setTraining(false)
        setLogs(prev => [...prev, '[SYSTEM] Training completed successfully. New model accuracy: 98.4%. Automigrating to production.'])
        return
      }

      const timer = setTimeout(() => {
        const step = Math.floor(Math.random() * 15) + 5
        const currentProgress = Math.min(100, progress + step)
        setProgress(currentProgress)
        
        if (currentProgress < 30) setLogs(prev => [...prev, `[INIT] Loading CICIDS dataset batches... (${currentProgress}%)`])
        else if (currentProgress < 70) setLogs(prev => [...prev, `[TRAIN] Fitting Random Forest estimators... (${currentProgress}%)`])
        else if (currentProgress < 100) setLogs(prev => [...prev, `[EVAL] Cross-validating results... (${currentProgress}%)`])
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [training, progress])

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Retrain ML Engine</h1>
        <p className="text-sm text-gray-500 mt-1">Train the anomaly detection algorithms with new packet capture datasets.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
        <div className="mb-8">
          <div className="inline-flex w-20 h-20 bg-blue-100 text-blue-600 rounded-full items-center justify-center mb-4">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Current Dataset Config</h2>
          <p className="text-sm text-gray-500 mt-2">Active records: <span className="font-bold text-gray-700">2.8 Million</span> | Last trained: <span className="font-bold text-gray-700">14 Days ago</span></p>
        </div>

        {!training && progress !== 100 && (
          <button 
            onClick={() => { setTraining(true); setLogs(['[SYSTEM] Initiating retrain process...']); setProgress(0) }}
            className="bg-[#1a73e8] hover:bg-blue-700 text-white font-bold px-10 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            Start Retraining
          </button>
        )}

        {training && (
          <div className="w-full max-w-lg mx-auto mb-4">
            <div className="flex justify-between text-sm font-semibold text-gray-600 mb-2">
              <span>Training...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div className="bg-[#1a73e8] h-3 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}

        {progress === 100 && (
           <div className="text-green-600 font-bold bg-green-50 p-4 rounded-xl border border-green-200 inline-block">
             ✅ Training Completed Successfully
           </div>
        )}
      </div>

      <div className="bg-gray-900 rounded-2xl p-4 shadow-inner min-h-[200px] font-mono text-xs text-green-400 overflow-y-auto max-h-[300px]">
        <div className="text-gray-500 mb-2"># Console Output</div>
        {logs.map((log, idx) => (
          <div key={idx} className="mb-1 leading-relaxed">
            <span className="text-blue-400">[{new Date().toLocaleTimeString()}]</span> {log}
          </div>
        ))}
        {training && <div className="animate-pulse">_</div>}
      </div>
    </div>
  )
}
