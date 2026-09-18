/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GATEWAY_URL?: string
  readonly VITE_USER_SERVICE_URL?: string
  readonly VITE_PROVIDER_SERVICE_URL?: string
  readonly VITE_ADMIN_SERVICE_URL?: string
  readonly VITE_PAYMENT_SERVICE_URL?: string
  readonly VITE_RAZORPAY_KEY_ID?: string
  readonly VITE_APP_URL?: string
  readonly VITE_APP_ENV?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
