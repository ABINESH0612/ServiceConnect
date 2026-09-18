import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, User, Settings, Briefcase, Clock, CalendarCheck,
  Image, Menu, X, LogOut, AlertCircle,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const SIDEBAR_ITEMS = [
  { to: '/provider/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/provider/bookings', icon: CalendarCheck, label: 'Bookings' },
  { to: '/provider/catalog', icon: Briefcase, label: 'Services' },
  { to: '/provider/availability', icon: Clock, label: 'Availability' },
  { to: '/provider/profile', icon: User, label: 'Profile' },
  { to: '/provider/photos', icon: Image, label: 'Photos' },
  { to: '/provider/settings', icon: Settings, label: 'Settings' },
]

export default function ProviderLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const user = useAuthStore((s) => s.user)

  const handleLogout = () => {
    clearAuth()
    navigate('/provider/login')
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <a href="#main-content" className="skip-to-content">Skip to content</a>

      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-40">
        <div className="flex items-center justify-between h-14 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1.5 text-[#64748B]" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <NavLink to="/provider/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#2563EB] rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 2v20M2 12h20" /><circle cx="12" cy="12" r="2" fill="white" stroke="none" />
                </svg>
              </div>
              <span className="text-base font-semibold text-[#0F172A]">ServiceConnect</span>
              <span className="text-xs bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded-full font-medium">Provider</span>
            </NavLink>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#64748B] hidden sm:block">{user?.email}</span>
            <button onClick={handleLogout} className="sc-btn-ghost text-xs gap-1.5">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-[#E2E8F0] pt-16 lg:pt-0 transform transition-transform duration-200 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
          aria-label="Provider navigation"
        >
          {/* Onboarding link */}
          <div className="p-4 pb-0">
            <NavLink
              to="/provider/onboarding"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2 p-3 mb-2 rounded-[8px] bg-[#FEF3C7] text-[#92400E] text-xs font-medium hover:bg-[#FDE68A] transition-colors"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> Complete Onboarding
            </NavLink>
          </div>
          <nav className="p-4 pt-0 space-y-1">
            {SIDEBAR_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => isActive ? 'sidebar-item-active' : 'sidebar-item'}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <main id="main-content" className="flex-1 min-h-[calc(100vh-3.5rem)] p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
