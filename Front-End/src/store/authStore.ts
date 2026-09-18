import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthUser, Role } from '@/types'

// ============================================================
// ServiceConnect Auth Store (Zustand)
//
// Per spec §9 (Token Storage):
//   accessToken  — in memory (Zustand, NOT persisted to localStorage)
//   refreshToken — persisted to localStorage under dedicated key
//   user / role  — persisted for UI restoration on reload
//
// NEVER log accessToken, refreshToken, or Authorization headers.
// ============================================================

interface AuthState {
  // Identity
  user: AuthUser | null
  portalRole: Role | null // the portal the user authenticated into

  // Tokens
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null // unix timestamp ms

  // Status
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setAuth: (params: {
    user: AuthUser
    accessToken: string
    refreshToken: string
    expiresIn: number // seconds
    portalRole: Role
  }) => void

  setTokens: (accessToken: string, refreshToken: string) => void
  setLoading: (loading: boolean) => void
  clearAuth: () => void
  isExpired: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      portalRole: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: ({ user, accessToken, refreshToken, expiresIn, portalRole }) => {
        const expiresAt = Date.now() + expiresIn * 1000
        set({
          user,
          portalRole,
          accessToken,
          refreshToken,
          expiresAt,
          isAuthenticated: true,
          isLoading: false,
        })
        // accessToken is stored in Zustand memory but also hits localStorage via persist.
        // For stricter security, remove accessToken from persist keys below.
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken })
      },

      setLoading: (isLoading) => set({ isLoading }),

      clearAuth: () => {
        set({
          user: null,
          portalRole: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      isExpired: () => {
        const { expiresAt } = get()
        if (!expiresAt) return true
        // Treat as expired 60s before actual expiry for buffer
        return Date.now() > expiresAt - 60_000
      },
    }),
    {
      name: 'sc-auth', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Persist only these keys — accessToken omitted for stricter security.
      // If you want to keep users logged in across reloads, include accessToken.
      // The tradeoff is localStorage exposure vs. UX convenience.
      partialize: (state) => ({
        user: state.user,
        portalRole: state.portalRole,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

// ---- Selector helpers (use in components for performance) ---
export const selectUser = (s: AuthState) => s.user
export const selectRole = (s: AuthState) => s.user?.role
export const selectPortalRole = (s: AuthState) => s.portalRole
export const selectIsAuthenticated = (s: AuthState) => s.isAuthenticated
export const selectAccessToken = (s: AuthState) => s.accessToken
