import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, Shield, ArrowRight, Compass } from 'lucide-react'
import { useAuthStore, selectIsAuthenticated, selectRole } from '@/store/authStore'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/providers', label: 'Find Providers' },
  { to: '/help', label: 'Help Center' },
  { to: '/customer/support', label: 'Support' },
]

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const role = useAuthStore(selectRole)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const getDashboardPath = () => {
    switch (role) {
      case 'PROVIDER':
        return '/provider/dashboard'
      case 'ADMIN':
        return '/admin/dashboard'
      case 'SUPPORT_AGENT':
        return '/support/tickets'
      case 'CUSTOMER':
      default:
        return '/customer/dashboard'
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Skip to content — accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      {/* ---- Header / Top Navigation ---- */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 transition-all">
        <div className="page-container flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="ServiceConnect Home">
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight leading-none">
                ServiceConnect
              </span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
                Local Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-500 hidden lg:block">
                  {user?.email}
                </span>
                <button
                  onClick={() => navigate(getDashboardPath())}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate('/customer/login')}
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/customer/register')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm shadow-blue-600/20 transition-all"
                >
                  Book a Service
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-slate-200/80 bg-white px-4 py-4 space-y-1.5 animate-in slide-in-from-top-2 duration-200 shadow-xl" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    navigate(getDashboardPath())
                    setMobileOpen(false)
                  }}
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl text-sm shadow-sm"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      navigate('/customer/login')
                      setMobileOpen(false)
                    }}
                    className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      navigate('/customer/register')
                      setMobileOpen(false)
                    }}
                    className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-sm shadow-sm"
                  >
                    Book a Service
                  </button>
                </>
              )}
            </div>
          </nav>
        )}
      </header>

      {/* ---- Main content ---- */}
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      {/* ---- Modern Footer ---- */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto">
        <div className="page-container py-12 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand column */}
            <div className="col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="text-xl font-extrabold text-white tracking-tight">
                  ServiceConnect
                </span>
              </Link>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                India's premier verified service marketplace connecting home & business owners with licensed technicians, electricians, plumbers, and cleaning professionals.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>100% Background-Verified Service Specialists</span>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Popular Services</h3>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/providers?category=Electrical" className="hover:text-white transition-colors">Electrical Repairs</Link></li>
                <li><Link to="/providers?category=Plumbing" className="hover:text-white transition-colors">Plumbing Solutions</Link></li>
                <li><Link to="/providers?category=HVAC" className="hover:text-white transition-colors">AC & HVAC Care</Link></li>
                <li><Link to="/providers?category=Cleaning" className="hover:text-white transition-colors">Home Deep Cleaning</Link></li>
                <li><Link to="/services" className="text-blue-400 hover:text-blue-300 font-semibold">View All Services →</Link></li>
              </ul>
            </div>

            {/* Portals */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Portals</h3>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/customer/login" className="hover:text-white transition-colors">Customer Portal</Link></li>
                <li><Link to="/provider/login" className="hover:text-white transition-colors">Provider Dashboard</Link></li>
                <li><Link to="/provider/register" className="hover:text-white transition-colors">Join as a Partner</Link></li>
                <li><Link to="/admin/login" className="hover:text-white transition-colors">Admin Console</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Legal & Safety</h3>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/refunds" className="hover:text-white transition-colors">Refund Guarantee</Link></li>
                <li><Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                <li><Link to="/security" className="hover:text-white transition-colors">Security Standards</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p className="text-slate-500">
              © {new Date().getFullYear()} ServiceConnect Technologies Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-slate-400">
              <Link to="/cookie-preferences" className="hover:text-white transition-colors">Cookie Settings</Link>
              <Link to="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
              <Link to="/community-guidelines" className="hover:text-white transition-colors">Community Standards</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
