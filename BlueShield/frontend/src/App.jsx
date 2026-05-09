import { BrowserRouter, Routes, Route, NavLink, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LiveTraffic from './pages/LiveTraffic';
import AlertFeed from './pages/AlertFeed';
import ModelCompare from './pages/ModelCompare';
import PcapUpload from './pages/PcapUpload';
import ThreatHunter from './pages/ThreatHunter';
import IpLookup from './pages/IpLookup';
import Retrain from './pages/Retrain';
import ExportPdf from './pages/ExportPdf';
import Settings from './pages/Settings';
import Diagnostics from './pages/Diagnostics';

// Auth & Admin imports
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';

// Main layout wrapper for the IDS dashboard
const MainLayout = () => {
  return (
    <div className="min-h-screen flex" style={{ background: '#FAF9F6' }}>
      <div className="fixed inset-y-0 left-0 z-30" style={{ width: 'var(--sidebar-w)', background: '#ffffff' }}>
        <Sidebar />
      </div>
      <main className="flex-1 overflow-y-auto" style={{ marginLeft: 'var(--sidebar-w)' }}>
        <header className="flex items-center justify-between border-b border-gray-200 bg-white/50 backdrop-blur-sm px-8 py-4">
          <div className="flex items-center gap-8 text-[15px] font-medium text-[#64748b]">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'text-black bg-[#f1f5f9] px-5 py-2.5 rounded-xl font-bold' : 'hover:text-black cursor-pointer'}>Dashboard</NavLink>
            <NavLink to="/alerts" className={({ isActive }) => isActive ? 'text-black bg-[#f1f5f9] px-5 py-2.5 rounded-xl font-bold' : 'hover:text-black cursor-pointer'}>Alerts</NavLink>
            <NavLink to="/threat-hunter" className={({ isActive }) => isActive ? 'text-black bg-[#f1f5f9] px-5 py-2.5 rounded-xl font-bold' : 'hover:text-black cursor-pointer'}>Analysis</NavLink>
            <NavLink to="/model-compare" className={({ isActive }) => isActive ? 'text-black bg-[#f1f5f9] px-5 py-2.5 rounded-xl font-bold' : 'hover:text-black cursor-pointer'}>Models</NavLink>
            <NavLink to="/export" className={({ isActive }) => isActive ? 'text-black bg-[#f1f5f9] px-5 py-2.5 rounded-xl font-bold' : 'hover:text-black cursor-pointer'}>Reports</NavLink>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              Live
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200"></div>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Admin Routes (Dark Theme) */}
          <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
          </Route>

          {/* Protected IDS Dashboard Routes (Light Theme) */}
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="live-traffic" element={<LiveTraffic />} />
            <Route path="alerts" element={<AlertFeed />} />
            <Route path="model-compare" element={<ModelCompare />} />
            <Route path="pcap-upload" element={<PcapUpload />} />
            <Route path="threat-hunter" element={<ThreatHunter />} />
            <Route path="ip-lookup" element={<IpLookup />} />
            <Route path="retrain" element={<Retrain />} />
            <Route path="export" element={<ExportPdf />} />
            <Route path="settings" element={<Settings />} />
            <Route path="diagnostics" element={<Diagnostics />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
