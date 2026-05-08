import { useState, useRef } from 'react'
import { api } from '../services/api'

export default function PcapUpload() {
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  
  const fileInputRef = useRef()

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
      setError(null)
    }
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const res = await api.pcap.upload(file)
      setResult(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  function handleDragOver(e) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.name.endsWith('.pcap') || droppedFile.name.endsWith('.cap') || droppedFile.name.endsWith('.pcapng')) {
        setFile(droppedFile)
        setResult(null)
        setError(null)
      } else {
        setError('Please upload a valid .pcap or .pcapng file')
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">PCAP Upload & Analysis</h1>
        <p className="text-sm text-slate-500 mt-0.5">Upload packet capture files for ML-driven evaluation.</p>
      </div>

      <div 
        className={`glass-card rounded-2xl p-10 border-2 border-dashed transition-all duration-200 text-center flex flex-col items-center justify-center ${
          isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        
        <h2 className="text-lg font-bold text-slate-700">Drag & Drop PCAP file here</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">or click to browse from your computer</p>
        
        <input 
          type="file" 
          accept=".pcap,.pcapng,.cap" 
          onChange={handleFileChange} 
          className="hidden" 
          ref={fileInputRef} 
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm"
        >
          Select File
        </button>

        {file && (
          <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm w-full max-w-sm flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <svg className="w-6 h-6 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="overflow-hidden text-left">
                <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500 p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {file && !result && !uploading && (
           <button 
            onClick={handleUpload}
            className="mt-6 px-10 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors shadow-lg"
          >
            Analyze PCAP
          </button>
        )}
        
        {uploading && (
          <div className="mt-8 flex flex-col items-center">
            <div className="spinner mb-3" />
            <p className="text-sm font-medium text-slate-600 animate-pulse">Processing packets and feeding to ML engine...</p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-medium">
          Error: {error}
        </div>
      )}

      {result && (
        <div className="glass-card rounded-2xl p-6 border border-white/60 animate-fade-up">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Analysis Results</h2>
              <p className="text-sm text-slate-500 mt-0.5">Report generated for {result.filename}</p>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 ${
                result.analysis.status === 'Safe' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
              {result.analysis.status === 'Safe' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              )}
              {result.analysis.status}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Total Packets</p>
              <p className="text-2xl font-bold text-slate-800">{result.analysis.total_packets_parsed.toLocaleString()}</p>
            </div>
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">File Size</p>
              <p className="text-2xl font-bold text-slate-800">{(result.size_bytes / 1024).toFixed(1)} KB</p>
            </div>
            <div className={`p-4 rounded-xl border ${result.analysis.anomalous_packets > 0 ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${result.analysis.anomalous_packets > 0 ? 'text-red-600' : 'text-slate-500'}`}>Anomalous</p>
              <p className="text-2xl font-bold text-slate-800">{result.analysis.anomalous_packets.toLocaleString()}</p>
            </div>
            <div className={`p-4 rounded-xl border ${result.analysis.risk_score > 0 ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${result.analysis.risk_score > 0 ? 'text-amber-600' : 'text-slate-500'}`}>Risk Score</p>
              <p className="text-2xl font-bold text-slate-800">{result.analysis.risk_score}/100</p>
            </div>
          </div>

          {result.analysis.threats_detected.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3">Threats Detected</h3>
              <div className="flex flex-wrap gap-2">
                {result.analysis.threats_detected.map((t, idx) => (
                  <span key={idx} className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm font-medium border border-red-200">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
