import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, User, Settings, Shield, Search, MapPin,
  CalendarCheck, Star, Headphones, Menu, X, LogOut,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const SIDEBAR_ITEMS = [
  { to: '/customer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customer/services', icon: Search, label: 'Services' },
  { to: '/customer/providers', icon: MapPin, label: 'Find Providers' },
  { to: '/customer/bookings', icon: CalendarCheck, label: 'My Bookings' },
  { to: '/customer/reviews', icon: Star, label: 'Reviews' },
  { to: '/customer/support', icon: Headphones, label: 'Support' },
  { to: '/customer/profile', icon: User, label: 'Profile' },
  { to: '/customer/settings', icon: Settings, label: 'Settings' },
  { to: '/customer/security', icon: Shield, label: 'Security' },
]

export default function CustomerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const user = useAuthStore((s) => s.user)

  const handleLogout = () => {
    clearAuth()
    navigate('/customer/login')
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* Skip to content */}
      <a href="#main-content" className="skip-to-content">Skip to content</a>

      {/* ---- Top bar (mobile + desktop) ---- */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-40">
        <div className="flex items-center justify-between h-14 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 text-[#64748B] hover:text-[#0F172A]"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <NavLink to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#2563EB] rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 2v20M2 12h20" /><circle cx="12" cy="12" r="2" fill="white" stroke="none" />
                </svg>
              </div>
              <span className="text-base font-semibold text-[#0F172A]">ServiceConnect</span>
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
        {/* ---- Sidebar (desktop always visible, mobile overlay) ---- */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-[#E2E8F0] pt-16 lg:pt-0 transform transition-transform duration-200 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
          aria-label="Customer navigation"
        >
          <nav className="p-4 space-y-1">
            {SIDEBAR_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  isActive ? 'sidebar-item-active' : 'sidebar-item'
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ---- Main content ---- */}
        <main id="main-content" className="flex-1 min-h-[calc(100vh-3.5rem)] p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
