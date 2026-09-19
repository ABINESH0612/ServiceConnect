import { Link } from 'react-router-dom'
import { CheckCircle2, CalendarCheck, ArrowRight, Download } from 'lucide-react'

export default function PaymentSuccess() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      {/* Animated Success Ring */}
      <div className="relative mb-8">
        {/* Outer pulse ring */}
        <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-30 scale-125" />
        {/* Middle ring */}
        <div className="absolute inset-0 rounded-full bg-green-50 scale-110" />
        {/* Icon container */}
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-200">
          <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={1.5} />
        </div>
        {/* Decorative dots */}
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-green-300 opacity-70" />
        <div className="absolute -bottom-1 -left-3 w-3 h-3 rounded-full bg-emerald-400 opacity-60" />
        <div className="absolute top-1/2 -right-4 w-2 h-2 rounded-full bg-green-200" />
      </div>

      {/* Text content */}
      <div className="text-center max-w-md mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
          Payment Successful!
        </h1>
        <p className="text-slate-500 leading-relaxed">
          Your payment has been processed successfully. The service provider has been notified and will reach out to confirm your booking.
        </p>
      </div>

      {/* Info card */}
      <div className="w-full max-w-sm bg-green-50 border border-green-100 rounded-2xl p-5 mb-8 text-sm">
        <div className="flex items-start gap-3">
          <CalendarCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900 mb-1">What's next?</p>
            <ul className="text-green-700 space-y-1 text-xs leading-relaxed">
              <li>• You'll receive a confirmation email shortly</li>
              <li>• The provider will confirm within 24 hours</li>
              <li>• Track your booking in the My Bookings section</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Link
          to="/customer/bookings"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-full px-6 py-3 text-sm transition-all shadow-sm shadow-blue-200"
        >
          View My Bookings
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/customer/dashboard"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-full px-6 py-3 text-sm transition-all"
        >
          <Download className="w-4 h-4" />
          Dashboard
        </Link>
      </div>
    </div>
  )
}
