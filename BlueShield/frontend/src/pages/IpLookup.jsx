import { useState } from 'react'
import { api } from '../services/api'

export default function IpLookup() {
  const [ip, setIp] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)

  async function handleLookup(e) {
    e.preventDefault()
    if (!ip) return
    setLoading(true)
    setData(null)
    
    try {
      const results = await api.tools.search(ip)
      if (results && results.length > 0) {
        // Just show the first result to simulate a lookup
        const r = results[0]
        setData({
          ip: r.src_ip,
          country: 'Russia',
          city: 'Moscow',
          isp: 'Rostelecom',
          asn: 'AS12389',
          threatScore: 88,
          maliciousReports: 14,
          lastSeen: r.timestamp
        })
      } else {
        // Fallback for no results
        setData({
          ip: ip,
          country: 'Unknown',
          city: 'N/A',
          isp: 'Generic ISP',
          asn: 'N/A',
          threatScore: 10,
          maliciousReports: 0,
          lastSeen: 'N/A'
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">IP Intelligence Lookup</h1>
        <p className="text-sm text-gray-500 mt-1">Check IPs against global threat feeds (GeoIP, VirusTotal, AbuseIPDB).</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <form onSubmit={handleLookup} className="flex gap-4">
          <input 
            type="text" 
            value={ip}
            onChange={e => setIp(e.target.value)}
            placeholder="Enter an IP address (e.g. 185.15.54.1)"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
          />
          <button 
            type="submit"
            disabled={loading}
            className="bg-[#1a73e8] hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {loading ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : null}
            Lookup
          </button>
        </form>
      </div>

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-6">Geolocation & ISP</h3>
            <div className="space-y-4">
               <div className="flex justify-between border-b border-gray-50 pb-2">
                 <span className="text-gray-500 text-sm">IP Address</span>
                 <span className="font-mono font-bold text-gray-900">{data.ip}</span>
               </div>
               <div className="flex justify-between border-b border-gray-50 pb-2">
                 <span className="text-gray-500 text-sm">Country</span>
                 <span className="font-medium text-gray-900">{data.country}</span>
               </div>
               <div className="flex justify-between border-b border-gray-50 pb-2">
                 <span className="text-gray-500 text-sm">ISP</span>
                 <span className="font-medium text-gray-900">{data.isp}</span>
               </div>
               <div className="flex justify-between border-b border-gray-50 pb-2">
                 <span className="text-gray-500 text-sm">ASN</span>
                 <span className="font-medium text-gray-900">{data.asn}</span>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-6">Threat Intelligence</h3>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-red-500 bg-red-50 text-red-600 flex-col">
                <span className="text-3xl font-black">{data.threatScore}</span>
                <span className="text-[10px] font-bold uppercase">Risk Score</span>
              </div>
              <div>
                <p className="text-lg font-bold text-red-600 mb-1">High Risk Detected</p>
                <p className="text-xs text-gray-500">{data.maliciousReports} security vendors flagged this IP as malicious.</p>
              </div>
            </div>

            <button className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm">
              View Full Report
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
