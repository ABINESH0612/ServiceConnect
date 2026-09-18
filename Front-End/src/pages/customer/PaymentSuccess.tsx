import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
export default function PaymentSuccess() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <CheckCircle2 className="w-16 h-16 text-[#16A34A]" />
      <h1 className="text-2xl font-bold text-[#0F172A]">Payment Successful!</h1>
      <p className="text-sm text-[#64748B] max-w-sm text-center">Your payment has been processed successfully. The provider will be notified.</p>
      <Link to="/customer/bookings" className="sc-btn-primary text-sm mt-2">View My Bookings</Link>
    </div>
  )
}
