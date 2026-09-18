import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
export default function PaymentPending() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <Clock className="w-16 h-16 text-[#F59E0B]" />
      <h1 className="text-2xl font-bold text-[#0F172A]">Payment Pending</h1>
      <p className="text-sm text-[#64748B] max-w-sm text-center">Your payment is being processed. This may take a few minutes. We'll notify you once confirmed.</p>
      <Link to="/customer/bookings" className="sc-btn-primary text-sm mt-2">View My Bookings</Link>
    </div>
  )
}
