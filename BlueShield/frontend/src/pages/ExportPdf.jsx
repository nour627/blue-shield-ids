import { useState } from 'react'

export default function ExportPdf() {
  const [downloading, setDownloading] = useState(false)

  function handleDownload() {
    setDownloading(true)
    setTimeout(() => {
      setDownloading(false)
      alert("Executive_Report.pdf downloaded!")
      // Normally, backend returns a blob and we trigger a phantom <a> click.
    }, 2000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Export PDF Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Generate comprehensive security summaries for management and compliance.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        <div className="bg-[#f8fafc] w-full md:w-1/3 p-6 border-r border-gray-200 flex flex-col gap-4">
          <h3 className="font-bold text-gray-700 text-sm uppercase mb-2">Report Type</h3>
          
          <label className="flex items-center gap-3 p-3 bg-white border-2 border-[#1a73e8] rounded-xl cursor-pointer">
            <input type="radio" name="report" className="w-4 h-4 text-blue-600 focus:ring-blue-500" defaultChecked />
            <span className="font-semibold text-gray-900 text-sm">Monthly Executive Summary</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-white border-2 border-transparent hover:border-gray-200 rounded-xl cursor-pointer">
            <input type="radio" name="report" className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
            <span className="font-semibold text-gray-600 text-sm">Threat Intelligence Dump</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-white border-2 border-transparent hover:border-gray-200 rounded-xl cursor-pointer">
            <input type="radio" name="report" className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
            <span className="font-semibold text-gray-600 text-sm">Compliance Audit (ISO27001)</span>
          </label>
        </div>

        <div className="p-8 flex-1 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Report Configurations</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 text-sm font-semibold mb-1">Date Range</label>
                <select className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                  <option>Last 30 Days</option>
                  <option>Last 7 Days</option>
                  <option>Year to Date</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-600 text-sm font-semibold mb-1">Include Anomalies Only</label>
                <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" defaultChecked />
                <span className="text-xs text-gray-500 ml-2">Filtering out Normal traffic logs.</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <button 
              onClick={handleDownload}
              disabled={downloading}
              className="w-full bg-[#1a73e8] hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex justify-center items-center gap-3"
            >
              {downloading ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              {downloading ? 'Generating PDF...' : 'Download Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
