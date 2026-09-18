import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: unknown) => {
        // Do not retry auth/permission/validation failures
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as { status: number }).status
          if ([401, 403, 404, 409, 422].includes(status)) return false
        }
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false, // Never auto-retry mutations
    },
  },
})
