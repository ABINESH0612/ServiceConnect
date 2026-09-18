import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
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
    <div className="min-h-screen flex flex-col bg-[#F1F5F9]">
      {/* Skip to content — accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      {/* ---- Header / Top Navigation ---- */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-40">
        <div className="page-container flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" aria-label="ServiceConnect Home">
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M12 2v20M2 12h20M5.64 5.64l12.73 12.73M18.36 5.64L5.64 18.36" />
                <circle cx="12" cy="12" r="2" fill="white" stroke="none" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
              ServiceConnect
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-[8px] text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#EFF6FF] text-[#2563EB]'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
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
              <button
                onClick={() => navigate(getDashboardPath())}
                className="sc-btn-primary text-sm"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/customer/login')}
                  className="text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors px-3 py-2"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/customer/register')}
                  className="sc-btn-primary text-sm"
                >
                  Book a Service
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-[#64748B] hover:text-[#0F172A]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-[#E2E8F0] bg-white px-4 py-3 space-y-1" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-[8px] text-sm font-medium transition-colors ${
                    isActive ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#64748B] hover:bg-[#F1F5F9]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-[#E2E8F0] space-y-2">
              {isAuthenticated ? (
                <button onClick={() => { navigate(getDashboardPath()); setMobileOpen(false) }} className="sc-btn-primary w-full text-sm">
                  Dashboard
                </button>
              ) : (
                <>
                  <button onClick={() => { navigate('/customer/login'); setMobileOpen(false) }} className="sc-btn-outline w-full text-sm">
                    Sign In
                  </button>
                  <button onClick={() => { navigate('/customer/register'); setMobileOpen(false) }} className="sc-btn-primary w-full text-sm">
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

      {/* ---- Footer ---- */}
      <footer className="bg-white border-t border-[#E2E8F0] mt-auto">
        <div className="page-container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Company */}
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] mb-3">ServiceConnect</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-sm text-[#64748B] hover:text-[#2563EB]">Home</Link></li>
                <li><Link to="/services" className="text-sm text-[#64748B] hover:text-[#2563EB]">Services</Link></li>
                <li><Link to="/providers" className="text-sm text-[#64748B] hover:text-[#2563EB]">Find Providers</Link></li>
              </ul>
            </div>
            {/* Support */}
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-sm text-[#64748B] hover:text-[#2563EB]">Help Center</Link></li>
                <li><Link to="/customer/support" className="text-sm text-[#64748B] hover:text-[#2563EB]">Contact Support</Link></li>
                <li><Link to="/community-guidelines" className="text-sm text-[#64748B] hover:text-[#2563EB]">Community Guidelines</Link></li>
              </ul>
            </div>
            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-sm text-[#64748B] hover:text-[#2563EB]">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-sm text-[#64748B] hover:text-[#2563EB]">Terms of Service</Link></li>
                <li><Link to="/cookies" className="text-sm text-[#64748B] hover:text-[#2563EB]">Cookie Policy</Link></li>
                <li><Link to="/refunds" className="text-sm text-[#64748B] hover:text-[#2563EB]">Refund Policy</Link></li>
              </ul>
            </div>
            {/* More Legal */}
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] mb-3">More</h3>
              <ul className="space-y-2">
                <li><Link to="/accessibility" className="text-sm text-[#64748B] hover:text-[#2563EB]">Accessibility</Link></li>
                <li><Link to="/security" className="text-sm text-[#64748B] hover:text-[#2563EB]">Security</Link></li>
                <li><Link to="/dpa" className="text-sm text-[#64748B] hover:text-[#2563EB]">DPA</Link></li>
                <li><Link to="/responsible-disclosure" className="text-sm text-[#64748B] hover:text-[#2563EB]">Responsible Disclosure</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#94A3B8]">© {new Date().getFullYear()} ServiceConnect. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/cookie-preferences" className="text-sm text-[#64748B] hover:text-[#2563EB]">Cookie Preferences</Link>
              <Link to="/disclaimer" className="text-sm text-[#64748B] hover:text-[#2563EB]">Disclaimer</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
