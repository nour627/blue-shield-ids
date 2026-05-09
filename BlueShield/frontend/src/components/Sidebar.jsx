import { useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { LogOut, ShieldAlert } from 'lucide-react'

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const sections = [
    {
      title: 'MONITORING',
      items: [
        { to: '/', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
        { to: '/live-traffic', label: 'Live Traffic', icon: 'M13 10V3L4 14h7v7l9-11h-7z', badge: 12 },
        { to: '/alerts', label: 'Alert Feed', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', badge: 5 },
      ]
    },
    {
      title: 'ANALYSIS',
      items: [
        { to: '/threat-hunter', label: 'Threat Hunter', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
        { to: '/ip-lookup', label: 'IP Lookup', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
        { to: '/pcap-upload', label: 'PCAP Upload', icon: 'M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2' },
      ]
    },
    {
      title: 'ML ENGINE',
      items: [
        { to: '/model-compare', label: 'Model Compare', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { to: '/retrain', label: 'Retrain', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
      ]
    },
    {
      title: 'REPORTS',
      items: [
        { to: '/export', label: 'Export PDF', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { to: '/diagnostics', label: 'Diagnostics', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
        { to: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
      ]
    }
  ]

  return (
    <aside className="h-full border-r border-[#e2e8f0] bg-[#fafafa] flex flex-col w-[260px]">
      <div className="py-4 px-6 border-b border-gray-200/60 bg-white">
        <span className="text-sm font-semibold tracking-tight text-slate-700">Blue team platform mockup</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {user?.role === 'Admin' && (
          <div>
            <p className="text-[11px] font-bold text-gray-400 tracking-wider mb-2 px-3">ADMINISTRATION</p>
            <div className="space-y-1.5">
              <NavLink
                to="/admin"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-purple-600 bg-purple-50 hover:bg-purple-100"
              >
                <ShieldAlert className="w-5 h-5" />
                Admin Panel
              </NavLink>
            </div>
          </div>
        )}

        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-[11px] font-bold text-gray-400 tracking-wider mb-2 px-3">
              {section.title}
            </p>
            <div className="space-y-1.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => {
                    if (isActive) {
                      return 'flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors bg-[#e8f0fe] text-[#1a73e8]';
                    }
                    return 'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900';
                  }}
                >
                  {({ isActive }) => {
                     return (
                      <div className="flex items-center gap-3">
                        <svg className={`w-5 h-5 ${isActive ? 'text-[#1a73e8]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2 : 1.5} d={item.icon} />
                        </svg>
                        {item.label}
                      </div>
                     )
                  }}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {user && (
        <div className="p-4 border-t border-gray-200/60 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800 leading-none">{user.username}</span>
                <span className="text-[11px] text-gray-500 mt-0.5">{user.role}</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
