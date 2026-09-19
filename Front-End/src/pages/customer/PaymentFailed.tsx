import { Link } from 'react-router-dom'
import { XCircle, RefreshCw, Headphones, ArrowLeft } from 'lucide-react'

export default function PaymentFailed() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      {/* Animated Error Icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-red-50 scale-125" />
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg shadow-red-100">
          <XCircle className="w-12 h-12 text-white" strokeWidth={1.5} />
        </div>
        {/* Decorative cross marks */}
        <div className="absolute -top-1 -right-3 w-3 h-3 rounded-full bg-rose-300 opacity-60" />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-red-200 opacity-50" />
      </div>

      {/* Text content */}
      <div className="text-center max-w-md mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
          Payment Failed
        </h1>
        <p className="text-slate-500 leading-relaxed">
          We couldn't process your payment. This could be due to insufficient funds, a card decline, or a temporary issue with our payment processor.
        </p>
      </div>

      {/* Error info card */}
      <div className="w-full max-w-sm bg-red-50 border border-red-100 rounded-2xl p-5 mb-8 text-sm">
        <p className="font-semibold text-red-900 mb-2">Common reasons for failure:</p>
        <ul className="text-red-700 space-y-1 text-xs leading-relaxed">
          <li>• Insufficient funds in your account</li>
          <li>• Card details entered incorrectly</li>
          <li>• Card expired or blocked for online transactions</li>
          <li>• Bank declined the transaction for security reasons</li>
        </ul>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Link
          to="/customer/bookings"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-full px-6 py-3 text-sm transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Link>
        <Link
          to="/customer/support"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-full px-6 py-3 text-sm transition-all"
        >
          <Headphones className="w-4 h-4" />
          Contact Support
        </Link>
      </div>

      <Link
        to="/customer/bookings"
        className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to My Bookings
      </Link>
    </div>
  )
}
