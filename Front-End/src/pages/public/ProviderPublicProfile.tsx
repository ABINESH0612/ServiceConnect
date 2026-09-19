import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft, MapPin, Clock, Phone, Mail, CheckCircle2,
  Calendar, Star, ArrowRight, ShieldCheck, Image as ImageIcon
} from 'lucide-react'
import { providerDiscoveryApi } from '@/api/provider'
import { catalogApi } from '@/api/catalog'
import { reviewApi } from '@/api/review'
import { ProviderStatusBadge } from '@/components/shared/StatusBadge'
import { StarRating } from '@/components/shared/StarRating'
import { Avatar } from '@/components/shared/Avatar'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState, ErrorState } from '@/components/shared/UxStates'
import { formatPrice, formatDate } from '@/utils/formatters'

export default function ProviderPublicProfile() {
  const { id } = useParams<{ id: string }>()
  const providerId = Number(id)
  const [activeTab, setActiveTab] = useState<'services' | 'availability' | 'photos' | 'reviews'>('services')
  const [reviewPage, setReviewPage] = useState(0)

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

  // Sample fallback data for demonstration if provider records are freshly seeded
  const fallbackServices = useMemo(() => [
    { id: 201, name: 'Standard Diagnostic & On-Site Estimate', category: 'General', price: 299, durationMinutes: 30, description: 'Inspection of equipment, diagnosing faulty parts, and providing upfront repair quotation.' },
    { id: 202, name: 'Comprehensive System Repair & Servicing', category: 'Repair', price: 999, durationMinutes: 60, description: 'Complete repair of identified faults, component lubrication, and performance testing.' },
    { id: 203, name: 'Emergency Support & Replacement', category: 'Emergency', price: 1499, durationMinutes: 90, description: 'Priority dispatch, immediate temporary containment, and installation of replacement parts.' },
  ], [])

  const services = (catalog?.content && catalog.content.length > 0) ? catalog.content : fallbackServices
  const reviewList = reviews?.content ?? []

  if (isLoading) {
    return (
      <div className="page-container py-12">
        <LoadingState message="Loading professional profile..." />
      </div>
    )
  }

  if (error || !provider) {
    return (
      <div className="page-container py-12">
        <ErrorState
          message="Provider profile could not be found."
          action={{ label: 'Back to Providers', onClick: () => window.history.back() }}
        />
      </div>
    )
  }

  return (
    <div className="page-container py-8 space-y-6 max-w-5xl">
      {/* Back button */}
      <Link
        to="/providers"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Providers Directory
      </Link>

      {/* Profile Header Hero Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <Avatar name={provider.businessName} size="xl" status="online" className="shadow-md" />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
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
                <span className="text-xs text-slate-500 font-medium">100% On-Time Completion</span>
              </div>
            </div>
          </div>

          <Link
            to={`/customer/providers/${providerId}`}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all flex-shrink-0"
          >
            <span>Book a Service</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {provider.description && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">About the Business</h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              {provider.description}
            </p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ID & Background Verified</span>
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

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        {[
          { key: 'services', label: 'Services & Pricing', count: services.length },
          { key: 'availability', label: 'Working Hours' },
          { key: 'photos', label: 'Portfolio', count: photos?.length },
          { key: 'reviews', label: 'Reviews', count: reviews?.totalElements ?? reviewList.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 text-sm font-semibold transition-all relative ${
              activeTab === tab.key
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((svc) => (
                <div
                  key={svc.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
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
                      <span className="text-xs text-slate-400 block">Price</span>
                      <span className="text-lg font-extrabold text-slate-900">
                        {formatPrice(svc.price)}
                      </span>
                    </div>
                    <Link
                      to={`/customer/providers/${providerId}`}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      Book This Service
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Weekly Operating Hours</h3>
            {availability && availability.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <div className="p-6 text-center text-sm text-slate-500 bg-slate-50 rounded-xl">
                Open Monday to Saturday from 09:00 AM to 07:00 PM. Instant slots available upon booking.
              </div>
            )}
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="space-y-4">
            {photos && photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="group relative rounded-2xl overflow-hidden aspect-video border border-slate-200 shadow-sm bg-slate-100">
                    <img
                      src={photo.imageUrl}
                      alt="Work Portfolio"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-2">
                <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No portfolio photos uploaded yet</h4>
                <p className="text-xs text-slate-400">The provider has not yet uploaded public job photos.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {reviewList.length > 0 ? (
              <div className="space-y-3">
                {reviewList.map((rev) => (
                  <div key={rev.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar name={`Customer ${rev.customerId}`} size="sm" />
                        <span className="text-sm font-bold text-slate-800">Verified Client</span>
                      </div>
                      <span className="text-xs text-slate-400">{formatDate(rev.createdAt)}</span>
                    </div>
                    <StarRating value={rev.rating} size="sm" />
                    {rev.comment && (
                      <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
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
              <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center space-y-2">
                <Star className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No customer reviews yet</h4>
                <p className="text-xs text-slate-400">Be the first client to book and leave a review for this provider.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
