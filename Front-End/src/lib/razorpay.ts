// ============================================================
// Razorpay JS SDK — Lazy Loader
//
// Razorpay checkout.js is loaded on-demand only when a payment
// is being initiated. It is never loaded on page load.
//
// Key ID: VITE_RAZORPAY_KEY_ID (public — safe to expose)
// Secret: NEVER exposed to frontend. Verification happens on
//         backend via payment-service.
// ============================================================

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

export interface RazorpayOptions {
  key: string
  amount: number // in paise (INR smallest unit)
  currency: string
  name: string
  description?: string
  order_id: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  theme?: {
    color?: string
  }
  modal?: {
    ondismiss?: () => void
  }
  handler: (response: RazorpayPaymentResponse) => void
}

export interface RazorpayPaymentResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

interface RazorpayInstance {
  open(): void
  on(event: string, handler: () => void): void
}

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'
let razorpayLoaded = false
let razorpayLoading: Promise<void> | null = null

/**
 * Lazy-load the Razorpay checkout script.
 * Safe to call multiple times — loads only once.
 */
export function loadRazorpay(): Promise<void> {
  if (razorpayLoaded) return Promise.resolve()
  if (razorpayLoading) return razorpayLoading

  razorpayLoading = new Promise<void>((resolve, reject) => {
    if (window.Razorpay) {
      razorpayLoaded = true
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT_URL
    script.async = true
    script.onload = () => {
      razorpayLoaded = true
      razorpayLoading = null
      resolve()
    }
    script.onerror = () => {
      razorpayLoading = null
      reject(new Error('Failed to load Razorpay checkout. Please refresh and try again.'))
    }
    document.head.appendChild(script)
  })

  return razorpayLoading
}

/**
 * Open Razorpay checkout popup.
 * Returns a promise that resolves with the payment response on success.
 * Rejects if the user dismisses or payment fails.
 */
export async function openRazorpayCheckout(
  options: Omit<RazorpayOptions, 'key'>,
): Promise<RazorpayPaymentResponse> {
  await loadRazorpay()

  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID
  if (!keyId || keyId === 'rzp_test_placeholder') {
    throw new Error('Razorpay Key ID is not configured. Set VITE_RAZORPAY_KEY_ID in .env')
  }

  return new Promise<RazorpayPaymentResponse>((resolve, reject) => {
    const rzp = new window.Razorpay({
      ...options,
      key: keyId,
      handler: (response) => {
        resolve(response)
      },
      modal: {
        ondismiss: () => {
          reject(new Error('Payment cancelled by user.'))
        },
      },
      theme: {
        color: '#2563EB', // ServiceConnect primary blue
      },
    })
    rzp.open()
  })
}
