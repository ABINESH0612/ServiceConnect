import { Link } from 'react-router-dom'
import { XCircle } from 'lucide-react'
export default function PaymentFailed() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <XCircle className="w-16 h-16 text-[#EF4444]" />
      <h1 className="text-2xl font-bold text-[#0F172A]">Payment Failed</h1>
      <p className="text-sm text-[#64748B] max-w-sm text-center">Your payment could not be processed. Please try again or contact support.</p>
      <div className="flex gap-3">
        <Link to="/customer/bookings" className="sc-btn-outline text-sm">Back to Bookings</Link>
        <Link to="/customer/support" className="sc-btn-primary text-sm">Contact Support</Link>
      </div>
    </div>
  )
}
