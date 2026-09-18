import React, { Suspense, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore, selectIsAuthenticated, selectRole } from '@/store/authStore'
import type { Role } from '@/types'

// ---- Loading spinner for lazy routes ----
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading page">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-[#E2E8F0] border-t-[#2563EB] rounded-full animate-spin" />
        <p className="text-sm text-text-secondary">Loading…</p>
      </div>
    </div>
  )
}

// ---- Lazy route wrapper ----
export function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

// ---- Protected Route: checks auth + role ----
interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: Role | Role[]
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const role = useAuthStore(selectRole)
  const location = useLocation()

  if (!isAuthenticated) {
    // Determine which login page to redirect to based on the URL path
    const portal = location.pathname.split('/')[1] // customer, provider, admin, support
    const loginPath = portal === 'admin' || portal === 'support'
      ? '/admin/login'
      : portal === 'provider'
      ? '/provider/login'
      : '/customer/login'
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!role || !roles.includes(role)) {
      return <Navigate to="/403" replace />
    }
  }

  return <>{children}</>
}

// ---- Online/Offline detection ----
export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-[#EF4444] text-white text-center py-2 px-4 text-sm font-medium z-50"
      role="alert"
      aria-live="assertive"
    >
      You are offline. Some features may not be available.
    </div>
  )
}
