import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#0A0E17] text-white flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-[#131B2B] border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            Aegis Admin
          </h1>
          <p className="text-xs text-gray-500 mt-1">SOC Command Center</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavLink 
            to="/admin" 
            end
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/admin/users" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}`
            }
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">User Management</span>
          </NavLink>
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <NavLink 
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Exit Admin</span>
          </NavLink>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-gray-800 bg-[#131B2B]/50 backdrop-blur flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-gray-200">System Overview</h2>
          <div className="flex items-center gap-4">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <span className="text-sm text-gray-400">System Online</span>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
