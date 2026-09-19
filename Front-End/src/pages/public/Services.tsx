import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Search, Clock, ArrowRight, Wrench, Zap, Droplet, Wind, Sparkles, Paintbrush, Filter
} from 'lucide-react'
import { catalogApi } from '@/api/catalog'
import { Pagination } from '@/components/shared/Pagination'
import { CardSkeleton } from '@/components/shared/Skeleton'
import { ErrorState, NoResultsState, EmptyState } from '@/components/shared/UxStates'
import { formatPrice } from '@/utils/formatters'
import { useDebounce } from '@/hooks/useDebounce'

const CATEGORIES = [
  { label: 'All Services', value: '' },
  { label: 'Electrical', value: 'Electrical', icon: Zap },
  { label: 'Plumbing', value: 'Plumbing', icon: Droplet },
  { label: 'HVAC & AC', value: 'HVAC', icon: Wind },
  { label: 'Cleaning', value: 'Cleaning', icon: Sparkles },
  { label: 'Painting', value: 'Painting', icon: Paintbrush },
  { label: 'Repairs', value: 'Repairs', icon: Wrench },
]

export default function Services() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(0)
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['catalog', 'public', debouncedSearch, category, page],
    queryFn: () =>
      catalogApi.search({
        search: debouncedSearch || undefined,
        category: category || undefined,
        page,
        size: 12,
      }),
    select: (res) => res.data,
  })

  const rawItems = data?.content ?? []

  // Sample backup services if database is currently empty
  const fallbackItems = useMemo(() => [
    { id: 101, providerId: 1, name: 'Circuit Breaker & Fuse Replacement', category: 'Electrical', price: 699, durationMinutes: 45, description: 'Fix frequent power trips, inspect wiring safety, and replace damaged MCBs with ISI-certified breakers.' },
    { id: 102, providerId: 2, name: 'Complete Bathroom Plumbing Checkup', category: 'Plumbing', price: 549, durationMinutes: 60, description: 'Inspection of taps, flush tanks, concealed pipes, shower valves, and water pressure optimization.' },
    { id: 103, providerId: 3, name: 'Split AC Deep Foam Jet Wash', category: 'HVAC', price: 1199, durationMinutes: 90, description: 'High-pressure foam cleaning of condenser, blower, indoor evaporator coils, and tray disinfection.' },
    { id: 104, providerId: 4, name: 'Kitchen Chimney & Degreasing Service', category: 'Cleaning', price: 899, durationMinutes: 75, description: 'Baffle filter removal, motor degreasing, exterior polish, and suction flow calibration.' },
    { id: 105, providerId: 1, name: 'Inverter & Battery Wiring Setup', category: 'Electrical', price: 999, durationMinutes: 60, description: 'Proper load division, battery electrolyte top-up, bypass switch installation, and terminal protection.' },
    { id: 106, providerId: 2, name: 'Overhead Water Tank Cleaning & Disinfection', category: 'Plumbing', price: 1499, durationMinutes: 120, description: 'Sludge extraction, high-pressure rotary scrub, anti-bacterial UV treatment, and piping flush.' },
    { id: 107, providerId: 4, name: 'Sofa & Upholstery Deep Shampooing', category: 'Cleaning', price: 1299, durationMinutes: 90, description: 'Dry vacuuming, fabric foam shampoo, stain removal, and moisture extraction for fresh scent.' },
    { id: 108, providerId: 5, name: 'Interior Wall Accent Painting', category: 'Painting', price: 3499, durationMinutes: 240, description: 'Surface sanding, primer coating, 2 coats of premium emulsion, and masking tape cleanup.' },
  ], [])

  const items = rawItems.length > 0 ? rawItems : (debouncedSearch || category ? fallbackItems.filter(i => (!category || i.category.toLowerCase() === category.toLowerCase()) && (!debouncedSearch || i.name.toLowerCase().includes(debouncedSearch.toLowerCase()))) : fallbackItems)

  const totalServices = data?.totalElements ?? items.length

  return (
    <div className="page-container py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-lg">
        <div className="max-w-2xl">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            Verified Services Catalog
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">
            Explore All Available Services
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
            Browse fixed-price home, electrical, and maintenance services performed by background-verified specialists.
          </p>
        </div>
      </div>

      {/* Search & Category Filter Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
              placeholder="Search services by keyword (e.g. AC wash, wiring, pipe leak)..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/80 bg-white text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-sm sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Total: <strong className="text-slate-800">{totalServices}</strong> services</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.value
            return (
              <button
                key={cat.value}
                onClick={() => {
                  setCategory(cat.value)
                  setPage(0)
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {cat.icon && <cat.icon className="w-3.5 h-3.5" />}
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          message="Failed to load catalog services."
          action={{ label: 'Try Again', onClick: () => refetch() }}
        />
      ) : items.length === 0 ? (
        debouncedSearch || category ? (
          <NoResultsState
            message={`No services matched "${debouncedSearch || category}".`}
            action={{
              label: 'Reset Filters',
              onClick: () => {
                setSearch('')
                setCategory('')
              },
            }}
          />
        ) : (
          <EmptyState
            title="Catalog is currently updating"
            message="Please check back shortly or explore providers directly."
            action={{ label: 'Find Providers', onClick: () => window.location.assign('/providers') }}
          />
        )
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:shadow-xl hover:shadow-slate-900/5 hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                      {item.category}
                    </span>
                    {item.durationMinutes && (
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        ~{item.durationMinutes} min
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{item.name}</h3>
                  {item.description && (
                    <p className="text-xs sm:text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Upfront Price</span>
                    <span className="text-xl font-extrabold text-slate-900">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                  <Link
                    to={`/customer/providers/${item.providerId}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <span>Book Pro</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {data && data.totalPages > 1 && (
            <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
          )}
        </div>
      )}
    </div>
  )
}
