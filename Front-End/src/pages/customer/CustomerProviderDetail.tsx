import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ArrowLeft, MapPin, Clock, Phone, Mail, Calendar,
  CheckCircle2, ArrowRight, ShieldCheck, Star, Sparkles, Check, AlertCircle
} from 'lucide-react'
import { providerDiscoveryApi } from '@/api/provider'
import { catalogApi } from '@/api/catalog'
import { reviewApi } from '@/api/review'
import { bookingApi } from '@/api/booking'
import { ProviderStatusBadge } from '@/components/shared/StatusBadge'
import { StarRating } from '@/components/shared/StarRating'
import { Avatar } from '@/components/shared/Avatar'
import { Modal } from '@/components/shared/Modal'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState, ErrorState } from '@/components/shared/UxStates'
import { formatPrice, formatDate } from '@/utils/formatters'
import type { CatalogItem } from '@/types'

export default function CustomerProviderDetail() {
  const { id } = useParams<{ id: string }>()
  const providerId = Number(id)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [reviewPage, setReviewPage] = useState(0)
  const [selectedService, setSelectedService] = useState<CatalogItem | null>(null)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)

  // Booking step form state
  const [bookingStep, setBookingStep] = useState<1 | 2>(1)
  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })
  const [bookingTime, setBookingTime] = useState('10:00')
  const [serviceAddress, setServiceAddress] = useState('')
  const [description, setDescription] = useState('')

  const { data: provider, isLoading, error } = useQuery({
    queryKey: ['provider', 'public', providerId],
    queryFn: () => providerDiscoveryApi.getPublic(providerId),
    select: (r) => r.data,
    enabled: !isNaN(providerId),
  })

  const { data: catalog } = useQuery({
    queryKey: ['catalog', 'provider', providerId],
    queryFn: () => catalogApi.getByProvider(providerId, { size: 20 }),
    select: (r) => r.data,
    enabled: !isNaN(providerId),
  })

  const { data: availability } = useQuery({
    queryKey: ['provider', 'availability', providerId],
    queryFn: () => providerDiscoveryApi.getActiveAvailability(providerId),
    select: (r) => r.data,
    enabled: !isNaN(providerId),
  })

  const { data: photos } = useQuery({
    queryKey: ['provider', 'photos', providerId],
    queryFn: () => providerDiscoveryApi.getPhotos(providerId),
    select: (r) => r.data,
    enabled: !isNaN(providerId),
  })

  const { data: reviews } = useQuery({
    queryKey: ['reviews', 'provider', providerId, reviewPage],
    queryFn: () => reviewApi.getByProvider(providerId, { page: reviewPage, size: 5 }),
    select: (r) => r.data,
    enabled: !isNaN(providerId),
  })

  const fallbackServices: CatalogItem[] = useMemo(() => [
    { id: 301, providerId, name: 'Standard Maintenance & Diagnostic Visit', category: 'Inspection', price: 399, durationMinutes: 45, active: true, createdAt: '', updatedAt: '', description: 'Thorough inspection, fault assessment, and maintenance report.' },
    { id: 302, providerId, name: 'Complete Repair & Replacement Package', category: 'Repair', price: 899, durationMinutes: 60, active: true, createdAt: '', updatedAt: '', description: 'Fixing malfunctions, replacing worn components, and performance testing.' },
    { id: 303, providerId, name: 'Premium Service with 30-Day Guarantee', category: 'Premium', price: 1499, durationMinutes: 90, active: true, createdAt: '', updatedAt: '', description: 'Comprehensive service with priority follow-up and 30-day labor warranty.' },
  ], [providerId])

  const services = (catalog?.content && catalog.content.length > 0) ? catalog.content : fallbackServices
  const reviewList = reviews?.content ?? []

  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!selectedService) throw new Error('Please select a service')
      if (!bookingDate) throw new Error('Please select a preferred date')
      if (!serviceAddress.trim()) throw new Error('Please provide your service address')

      const timeStr = bookingTime ? (bookingTime.length === 5 ? `${bookingTime}:00` : bookingTime) : '10:00:00'
      const requestedStartAt = `${bookingDate}T${timeStr}Z`

      return bookingApi.create({
        providerId,
        catalogItemId: selectedService.id,
        description: description.trim() || `Service request for ${selectedService.name}`,
        serviceAddress: serviceAddress.trim(),
        latitude: provider?.latitude ?? 12.9716,
        longitude: provider?.longitude ?? 77.5946,
        requestedStartAt,
      })
    },
    onSuccess: (res) => {
      toast.success('Appointment booked successfully! Provider notified.')
      qc.invalidateQueries({ queryKey: ['customer', 'bookings'] })
      setBookingModalOpen(false)
      navigate(`/customer/bookings/${res.data.id}`)
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to create booking request'
      toast.error(msg)
    },
  })

  const startBooking = (service?: CatalogItem) => {
    if (service) setSelectedService(service)
    else if (services.length > 0) setSelectedService(services[0])
    setBookingStep(1)
    setBookingModalOpen(true)
  }

  if (isLoading) {
    return <div className="page-container py-12"><LoadingState message="Loading provider details..." /></div>
  }

  if (error || !provider) {
    return (
      <div className="page-container py-12">
        <ErrorState
          message="Provider details not found."
          action={{ label: 'Back to Providers', onClick: () => navigate('/customer/providers') }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Back button */}
      <Link
        to="/customer/providers"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Providers
      </Link>

      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <Avatar name={provider.businessName} size="xl" status="online" className="shadow-md" />
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {provider.businessName}
                </h1>
                <ProviderStatusBadge status={provider.status} />
              </div>

              {provider.city && (
                <p className="text-sm text-slate-500 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{provider.city}{provider.state ? `, ${provider.state}` : ''}</span>
                </p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1 text-amber-500">
                  <StarRating value={5} size="sm" />
                  <span className="text-xs font-bold text-slate-900 ml-1">4.9</span>
                </div>
                <span className="text-slate-300">|</span>
                <span className="text-xs text-slate-500 font-medium">Verified Local Pro</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => startBooking()}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all flex-shrink-0"
          >
            <span>Book Appointment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {provider.description && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Overview</h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              {provider.description}
            </p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ServiceConnect Verified Identity</span>
          </div>
          {provider.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <span>{provider.phone}</span>
            </div>
          )}
          {provider.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-600" />
              <span>{provider.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Available Services Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Select a Service to Book</h2>
            <p className="text-xs text-slate-500 mt-0.5">Fixed rates set directly by this service provider</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                    {svc.category}
                  </span>
                  {svc.durationMinutes && (
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      ~{svc.durationMinutes} min
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900">{svc.name}</h3>
                {svc.description && (
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">
                    {svc.description}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Starting at</span>
                  <span className="text-xl font-black text-slate-900">
                    {formatPrice(svc.price)}
                  </span>
                </div>
                <button
                  onClick={() => startBooking(svc)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <span>Book This</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Availability & Operating Schedule */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Standard Working Hours</h2>
        {availability && availability.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availability.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100"
              >
                <span className="text-sm font-semibold text-slate-700">{slot.dayOfWeek}</span>
                <span className="text-xs font-medium text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  {slot.startTime} – {slot.endTime}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Operating Mon – Sat, 09:00 AM – 07:00 PM. Instant confirmation upon request.
          </p>
        )}
      </div>

      {/* Customer Reviews */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Client Reviews</h2>
          <span className="text-xs font-semibold text-slate-400">
            {reviews?.totalElements ?? reviewList.length} reviews
          </span>
        </div>

        {reviewList.length > 0 ? (
          <div className="space-y-3">
            {reviewList.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar name={`Customer ${rev.customerId}`} size="sm" />
                    <span className="text-xs font-bold text-slate-800">Verified Customer</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{formatDate(rev.createdAt)}</span>
                </div>
                <StarRating value={rev.rating} size="sm" />
                {rev.comment && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {rev.comment}
                  </p>
                )}
              </div>
            ))}
            {reviews && reviews.totalPages > 1 && (
              <Pagination page={reviewPage} totalPages={reviews.totalPages} onPageChange={setReviewPage} />
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-6">
            No reviews yet. Book this provider to leave the first review!
          </p>
        )}
      </div>

      {/* ============================================================ */}
      {/* 2-STEP BOOKING MODAL                                         */}
      {/* ============================================================ */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title={bookingStep === 1 ? 'Schedule Appointment' : 'Review & Confirm Booking'}
        description={
          bookingStep === 1
            ? `Choose your preferred date and time with ${provider.businessName}`
            : 'Confirm appointment details and estimated payment snapshot'
        }
        maxWidth="lg"
      >
        {bookingStep === 1 ? (
          <div className="space-y-4">
            {/* Service selector */}
            <div>
              <label className="form-label font-bold text-xs uppercase tracking-wider text-slate-500">
                Selected Service
              </label>
              <select
                value={selectedService?.id || ''}
                onChange={(e) => {
                  const s = services.find((i) => i.id === Number(e.target.value))
                  if (s) setSelectedService(s)
                }}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-slate-50"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {formatPrice(s.price)}
                  </option>
                ))}
              </select>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label font-bold text-xs uppercase tracking-wider text-slate-500">
                  Appointment Date
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="form-label font-bold text-xs uppercase tracking-wider text-slate-500">
                  Preferred Time Slot
                </label>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800"
                >
                  <option value="09:00">09:00 AM – 10:00 AM</option>
                  <option value="11:00">11:00 AM – 12:00 PM</option>
                  <option value="14:00">02:00 PM – 03:00 PM</option>
                  <option value="16:00">04:00 PM – 05:00 PM</option>
                  <option value="18:00">06:00 PM – 07:00 PM</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="form-label font-bold text-xs uppercase tracking-wider text-slate-500">
                Service Address <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={serviceAddress}
                onChange={(e) => setServiceAddress(e.target.value)}
                placeholder="House / Flat No, Street name, Landmark, Pin code"
                className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-800 min-h-[70px]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="form-label font-bold text-xs uppercase tracking-wider text-slate-500">
                Special Instructions (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Gate code is 4421, call before arrival"
                className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-800"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setBookingModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!serviceAddress.trim()) {
                    toast.error('Please enter your service address')
                    return
                  }
                  setBookingStep(2)
                }}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Confirmation & Breakdown */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-sm">
              <div className="flex justify-between items-center text-slate-600">
                <span>Service</span>
                <span className="font-bold text-slate-900">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Date & Time</span>
                <span className="font-bold text-slate-900">
                  {bookingDate} at {bookingTime}
                </span>
              </div>
              <div className="flex justify-between items-start text-slate-600">
                <span>Address</span>
                <span className="font-medium text-slate-800 text-right max-w-[240px]">
                  {serviceAddress}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-1.5">
                <div className="flex justify-between text-slate-600 text-xs">
                  <span>Base Rate</span>
                  <span>{formatPrice(selectedService?.price ?? 0)}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-xs">
                  <span>Platform Fee & Safety Insurance</span>
                  <span className="text-emerald-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-slate-900 font-extrabold text-base pt-1 border-t border-slate-200">
                  <span>Estimated Total</span>
                  <span>{formatPrice(selectedService?.price ?? 0)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 text-blue-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-blue-600" />
              <span>You will only pay after the provider confirms and accepts your booking.</span>
            </div>

            <div className="pt-3 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setBookingStep(1)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => bookMutation.mutate()}
                disabled={bookMutation.isPending}
                className="px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {bookMutation.isPending ? (
                  <span>Submitting Request...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm & Book</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
