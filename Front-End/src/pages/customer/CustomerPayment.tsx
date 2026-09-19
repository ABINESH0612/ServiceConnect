import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  CreditCard, Loader2, AlertTriangle, ShieldCheck, CheckCircle2,
  Lock, ArrowLeft, ArrowRight
} from 'lucide-react'
import { bookingApi } from '@/api/booking'
import { paymentApi, PAYMENT_SERVICE_CONFIGURED } from '@/api/payment'
import { openRazorpayCheckout } from '@/lib/razorpay'
import { useAuthStore } from '@/store/authStore'
import { formatPrice, formatDate } from '@/utils/formatters'
import { LoadingState, ErrorState } from '@/components/shared/UxStates'

export default function CustomerPayment() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [paying, setPaying] = useState(false)

  // Fetch actual booking details to retrieve priceSnapshot
  const { data: booking, isLoading: loadingBooking, error: bookingError } = useQuery({
    queryKey: ['booking', 'payment', bookingId],
    queryFn: () => bookingApi.getById(Number(bookingId)),
    select: (r) => r.data,
    enabled: !!bookingId && !isNaN(Number(bookingId)),
  })

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const payableAmount = booking?.priceSnapshot ?? 500
      return paymentApi.createOrder({
        bookingId: bookingId!,
        amount: payableAmount,
        currency: 'INR',
      })
    },
    onSuccess: async (res) => {
      const { razorpayOrderId, amount, currency } = res.data
      try {
        setPaying(true)
        const response = await openRazorpayCheckout({
          amount: amount * 100, // Convert to paise
          currency: currency || 'INR',
          name: 'ServiceConnect Payments',
          description: `Settlement for Appointment #${bookingId}`,
          order_id: razorpayOrderId,
          prefill: { email: user?.email },
          handler: () => {},
        })

        // Verify Razorpay signature on payment-service
        await paymentApi.verify({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        })

        toast.success('Payment verified successfully!')
        navigate('/customer/payment/success')
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Payment could not be completed'
        if (msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('dismiss')) {
          toast.info('Checkout was cancelled')
        } else {
          toast.error(msg)
          navigate('/customer/payment/failed')
        }
      } finally {
        setPaying(false)
      }
    },
    onError: () => {
      toast.error('Unable to initiate payment transaction with gateway.')
      navigate('/customer/payment/failed')
    },
  })

  if (loadingBooking) {
    return (
      <div className="max-w-md mx-auto py-16">
        <LoadingState message="Loading payment details..." />
      </div>
    )
  }

  if (bookingError || !booking) {
    return (
      <div className="max-w-md mx-auto py-16">
        <ErrorState
          message="Could not find appointment for payment."
          action={{ label: 'Back to Bookings', onClick: () => navigate('/customer/bookings') }}
        />
      </div>
    )
  }

  if (!PAYMENT_SERVICE_CONFIGURED) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Payment Gateway Temporarily Offline</h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            The payment gateway is currently under scheduled maintenance. You may settle in cash with your provider or retry later.
          </p>
          <Link
            to="/customer/bookings"
            className="inline-block px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
          >
            Back to Bookings
          </Link>
        </div>
      </div>
    )
  }

  const amount = booking.priceSnapshot

  return (
    <div className="max-w-lg mx-auto py-6 space-y-6">
      <Link
        to={`/customer/bookings/${bookingId}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Booking Summary
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Secure Checkout
              </h1>
              <p className="text-xs text-slate-400">Appointment #{bookingId}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            <Lock className="w-3 h-3" /> 256-bit SSL
          </div>
        </div>

        {/* Invoice breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Order Invoice Breakdown
          </h3>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Appointment Date</span>
              <span className="font-semibold text-slate-900">{formatDate(booking.requestedStartAt)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Service Fee</span>
              <span className="font-semibold text-slate-900">{formatPrice(amount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Safety & Platform Charges</span>
              <span className="text-emerald-600 font-bold">₹0 (Included)</span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm">
              <span className="font-bold text-slate-900">Total Payable</span>
              <span className="text-xl font-black text-blue-600">{formatPrice(amount)}</span>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Money-Back Guarantee</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50">
            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>Razorpay Verified</span>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={() => createOrderMutation.mutate()}
          disabled={paying || createOrderMutation.isPending}
          className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          {paying || createOrderMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Initiating Razorpay Checkout...</span>
            </>
          ) : (
            <>
              <span>Pay {formatPrice(amount)}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-[11px] text-center text-slate-400">
          By clicking pay, you authorize ServiceConnect to process this transaction via Razorpay.
        </p>
      </div>
    </div>
  )
}
