import { mapApiError } from '@/lib/axios'

export { mapApiError }

/**
 * Extract a user-friendly message from any thrown error.
 * Never exposes stack traces, internal service names, or backend internals.
 */
export function getErrorMessage(error: unknown): string {
  const mapped = mapApiError(error)
  return mapped.message
}

/**
 * Check if an error is a specific HTTP status.
 */
export function isHttpStatus(error: unknown, status: number): boolean {
  const mapped = mapApiError(error)
  return mapped.status === status
}

export function isOfflineError(error: unknown): boolean {
  return mapApiError(error).isOffline
}

export function isSessionExpiredError(error: unknown): boolean {
  return mapApiError(error).isSessionExpired
}

export function isValidationError(error: unknown): boolean {
  return mapApiError(error).isValidation
}

export function getFieldErrors(error: unknown): Record<string, string> {
  return mapApiError(error).fieldErrors ?? {}
}
