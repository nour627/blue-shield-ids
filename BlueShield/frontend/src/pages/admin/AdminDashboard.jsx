import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Activity, ShieldAlert, Lock, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSessions: 0,
    openAlerts: 0,
    failedLogins: 0
  });
  
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, logsRes, alertsRes] = await Promise.all([
          axios.get('http://localhost:8000/api/admin/stats'),
          axios.get('http://localhost:8000/api/admin/logs/login'),
          axios.get('http://localhost:8000/api/admin/alerts')
        ]);
        
        setStats(statsRes.data);
        setLogs(logsRes.data);
        setAlerts(alertsRes.data);
      } catch (err) {
        console.error("Failed to fetch admin dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-gray-400 flex justify-center py-10">Loading system metrics...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Analysts" value={stats.totalUsers} icon={<Users className="w-6 h-6 text-blue-400" />} bg="bg-blue-500/10" border="border-blue-500/20" />
        <StatCard title="Active Sessions" value={stats.activeSessions} icon={<Activity className="w-6 h-6 text-green-400" />} bg="bg-green-500/10" border="border-green-500/20" />
        <StatCard title="Security Alerts" value={stats.openAlerts} icon={<ShieldAlert className="w-6 h-6 text-orange-400" />} bg="bg-orange-500/10" border="border-orange-500/20" />
        <StatCard title="Failed Logins" value={stats.failedLogins} icon={<Lock className="w-6 h-6 text-red-400" />} bg="bg-red-500/10" border="border-red-500/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#131B2B] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-400" />
            Recent Login Activity
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
              <thead className="text-xs uppercase bg-gray-800/50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">User</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-tr-lg">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 8).map((log, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                    <td className="px-4 py-3 font-medium text-gray-300">{log.username}</td>
                    <td className="px-4 py-3 font-mono text-xs">{log.ip}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${log.status === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan="4" className="px-4 py-4 text-center text-gray-500">No login activity</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#131B2B] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            Security Alerts
          </h3>
          <div className="space-y-4">
            {alerts.slice(0, 6).map((alert, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-[#0F1522] border border-gray-800">
                <div className="mt-1">
                  {alert.severity === 'High' ? (
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  ) : alert.severity === 'Medium' ? (
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-200">{alert.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{alert.description}</p>
                  <p className="text-[10px] text-gray-600 mt-2 font-mono">{new Date(alert.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-center py-6 text-gray-500">No security alerts</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, bg, border }) {
  return (
    <div className={`bg-[#131B2B] border ${border} rounded-2xl p-6 relative overflow-hidden group`}>
      <div className={`absolute top-0 right-0 w-32 h-32 ${bg} rounded-full blur-[50px] -mr-10 -mt-10 transition-transform group-hover:scale-110`}></div>
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-400 font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${bg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
