import { Link } from 'react-router-dom'
import { Clock, Bell, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function PaymentPending() {
  const [dots, setDots] = useState('.')

  // Animated loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.')
    }, 600)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      {/* Animated Pending Icon */}
      <div className="relative mb-8">
        {/* Spinning ring */}
        <div className="absolute inset-0 rounded-full border-4 border-amber-200 animate-spin border-t-amber-500 scale-125" />
        {/* Icon container */}
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-lg shadow-amber-100">
          <Clock className="w-12 h-12 text-white" strokeWidth={1.5} />
        </div>
        <div className="absolute -top-1 -right-2 w-3 h-3 rounded-full bg-amber-300 opacity-70" />
        <div className="absolute -bottom-2 -left-1 w-4 h-4 rounded-full bg-orange-200 opacity-60" />
      </div>

      {/* Text content */}
      <div className="text-center max-w-md mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
          Payment Processing{dots}
        </h1>
        <p className="text-slate-500 leading-relaxed">
          Your payment is being verified. This usually takes a few minutes. Please don't close or refresh this page.
        </p>
      </div>

      {/* Status card */}
      <div className="w-full max-w-sm bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-8">
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 mb-1 text-sm">You'll be notified</p>
            <p className="text-amber-700 text-xs leading-relaxed">
              Once the payment is confirmed, you'll receive an email and can track your booking in real time. This process typically completes within 5 minutes.
            </p>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="w-full max-w-sm mb-8">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>Processing payment</span>
          <span className="text-amber-600 font-medium">In progress</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
            style={{
              width: '60%',
              animation: 'progress-bar 2s ease-in-out infinite alternate'
            }}
          />
        </div>
        <style>{`
          @keyframes progress-bar {
            from { width: 40%; }
            to { width: 80%; }
          }
        `}</style>
      </div>

      {/* Action buttons */}
      <Link
        to="/customer/bookings"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-full px-8 py-3 text-sm transition-all shadow-sm"
      >
        View My Bookings
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}
