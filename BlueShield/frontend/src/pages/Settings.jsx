export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Platform Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure global platform thresholds and integrations.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">Auto-Blocking Thresholds</h2>
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <div>
              <p className="font-semibold text-gray-800 text-sm">Automatically block Critical IPs</p>
              <p className="text-xs text-gray-500">Any IP triggering a Risk Score &gt; 90 will be added to the firewall deny list instantly.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a73e8]"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <div>
              <p className="font-semibold text-gray-800 text-sm">Block malicious subnets automatically</p>
              <p className="text-xs text-gray-500">If 3 or more attacking IPs map to the same CIDR /24 subnet.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a73e8]"></div>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">Integrations</h2>
          <div className="flex gap-4">
            <div className="p-4 border border-gray-200 rounded-xl flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-800">Slack Alerts</h3>
                <p className="text-xs text-gray-500 mt-1">Send Critical alerts directly to #soc-channel.</p>
              </div>
              <button className="mt-4 px-4 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 w-fit">Configure</button>
            </div>
            <div className="p-4 border border-gray-200 rounded-xl flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-800">VirusTotal API</h3>
                <p className="text-xs text-gray-500 mt-1">API key successfully linked for IP Lookups.</p>
              </div>
              <span className="mt-4 px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold uppercase rounded w-fit">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
