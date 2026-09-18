import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CreditCard, Loader2, AlertTriangle } from 'lucide-react'
import { paymentApi, PAYMENT_SERVICE_CONFIGURED } from '@/api/payment'
import { openRazorpayCheckout } from '@/lib/razorpay'
import { useAuthStore } from '@/store/authStore'

export default function CustomerPayment() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [paying, setPaying] = useState(false)

  const createOrderMutation = useMutation({
    mutationFn: () => paymentApi.createOrder({ bookingId: bookingId!, amount: 0, currency: 'INR' }),
    onSuccess: async (res) => {
      const { razorpayOrderId, amount, currency } = res.data
      try {
        setPaying(true)
        const response = await openRazorpayCheckout({
          amount: amount * 100, // Convert to paise
          currency,
          name: 'ServiceConnect',
          description: `Payment for Booking #${bookingId}`,
          order_id: razorpayOrderId,
          prefill: { email: user?.email },
          handler: () => {}, // handled by promise
        })
        // Verify payment
        await paymentApi.verify({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        })
        toast.success('Payment successful!')
        navigate('/customer/payment/success')
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Payment failed'
        if (msg.includes('cancelled')) {
          toast.info('Payment cancelled')
        } else {
          toast.error(msg)
          navigate('/customer/payment/failed')
        }
      } finally {
        setPaying(false)
      }
    },
    onError: () => {
      toast.error('Failed to create payment order.')
      navigate('/customer/payment/failed')
    },
  })

  if (!PAYMENT_SERVICE_CONFIGURED) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <div className="sc-card p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-[#F59E0B] mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-[#0F172A] mb-2">Payment Unavailable</h2>
          <p className="text-sm text-[#64748B]">The payment service is currently not configured. Please try again later or contact support.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="sc-card p-8 text-center">
        <CreditCard className="w-12 h-12 text-[#2563EB] mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-[#0F172A] mb-2">Payment for Booking #{bookingId}</h2>
        <p className="text-sm text-[#64748B] mb-6">Click below to proceed with secure payment via Razorpay.</p>
        <button
          onClick={() => createOrderMutation.mutate()}
          disabled={paying || createOrderMutation.isPending}
          className="sc-btn-primary w-full text-sm"
        >
          {paying || createOrderMutation.isPending ? (
            <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Processing…</span>
          ) : 'Pay Now'}
        </button>
      </div>
    </div>
  )
}
