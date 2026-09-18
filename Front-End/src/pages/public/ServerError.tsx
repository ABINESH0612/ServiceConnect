import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function ServerError() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 text-center page-container" role="alert">
      <AlertTriangle className="w-16 h-16 text-[#EF4444] mb-4" aria-hidden="true" />
      <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Something went wrong</h1>
      <p className="text-[#64748B] max-w-md mb-6">
        Our servers are having trouble right now. Please try again in a moment.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="sc-btn-primary inline-flex items-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        Retry
      </button>
    </div>
  )
}
