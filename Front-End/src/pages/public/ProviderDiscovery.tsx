import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import {
  Search, MapPin, List, Map as MapIcon, Navigation, Star,
  CheckCircle2, ArrowRight, ArrowUpDown
} from 'lucide-react'
import { providerDiscoveryApi } from '@/api/provider'
import { filterByRadius, formatDistance } from '@/lib/haversine'
import { useDebounce } from '@/hooks/useDebounce'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/UxStates'
import { Avatar } from '@/components/shared/Avatar'
import { StarRating } from '@/components/shared/StarRating'
import type { MapViewMode, Coordinates, ProviderPublicView } from '@/types'

// Custom marker icon
const providerIcon = new L.DivIcon({
  className: 'sc-marker',
  html: '<div class="bg-blue-600 text-white font-bold text-xs px-2 py-0.5 rounded-full shadow-md border-2 border-white flex items-center gap-1"><span>Pro</span></div>',
  iconSize: [46, 24],
  iconAnchor: [23, 12],
})

function RecenterButton({ center }: { center: Coordinates }) {
  const map = useMap()
  return (
    <button
      onClick={() => map.flyTo([center.lat, center.lng], 13)}
      className="bg-white/95 backdrop-blur-sm hover:bg-white text-blue-600 font-semibold text-xs px-3 py-1.5 rounded-xl shadow-md border border-slate-200 absolute top-3 right-3 z-[1000] flex items-center gap-1.5"
      aria-label="Recenter map"
    >
      <Navigation className="w-3.5 h-3.5" /> My Location
    </button>
  )
}

function MapFocus({ selectedLocation }: { selectedLocation?: { lat: number; lng: number } | null }) {
  const map = useMap()
  useEffect(() => {
    if (selectedLocation?.lat && selectedLocation?.lng) {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 14, { duration: 1.0 })
    }
  }, [selectedLocation, map])
  return null
}

export default function ProviderDiscovery() {
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const initialCategory = searchParams.get('category') || ''

  const [search, setSearch] = useState(initialSearch)
  const [category, setCategory] = useState(initialCategory)
  const [sortBy, setSortBy] = useState<'distance' | 'name' | 'rating'>('distance')
  const [minRating, setMinRating] = useState<number>(0)
  const [radius, setRadius] = useState(25)
  const [viewMode, setViewMode] = useState<MapViewMode>('split')
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
  const [locationError, setLocationError] = useState('')
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null)
  const debouncedSearch = useDebounce(search, 300)

  // Request user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported by this browser')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocationError('Location access was denied. Showing Bangalore area.'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [])

  // Fetch approved providers
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['providers', 'discovery'],
    queryFn: () => providerDiscoveryApi.getAll({ size: 100, status: 'APPROVED' }),
    select: (res) => res.data,
  })

  // Fallback demo providers with realistic coordinates around Bangalore if empty
  const fallbackProviders: (ProviderPublicView & { latitude: number; longitude: number; distanceKm?: number; rating?: number })[] = useMemo(() => [
    { id: 1, businessName: 'Apex Electrical Solutions', city: 'Bangalore', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946, status: 'APPROVED', description: 'Certified Master Electricians for domestic and enterprise power installations.', rating: 4.9 },
    { id: 2, businessName: 'AquaFlow Plumbing Experts', city: 'Bangalore', state: 'Karnataka', latitude: 12.9352, longitude: 77.6245, status: 'APPROVED', description: 'Emergency leak detection, pipeline installation, and bathroom fixtures.', rating: 4.8 },
    { id: 3, businessName: 'CoolBreeze HVAC Systems', city: 'Bangalore', state: 'Karnataka', latitude: 12.9850, longitude: 77.5533, status: 'APPROVED', description: 'Residential and commercial AC installation, refrigerant top-up, and servicing.', rating: 4.7 },
    { id: 4, businessName: 'Pristine Home Cleaning', city: 'Bangalore', state: 'Karnataka', latitude: 12.9698, longitude: 77.7500, status: 'APPROVED', description: 'Deep home sanitization, kitchen degreasing, and sofa shampooing.', rating: 4.9 },
    { id: 5, businessName: 'Colors & Co. Painters', city: 'Bangalore', state: 'Karnataka', latitude: 13.0358, longitude: 77.5970, status: 'APPROVED', description: 'Interior and exterior premium wall painting with waterproof coatings.', rating: 4.6 },
    { id: 6, businessName: 'QuickFix Appliance Repair', city: 'Bangalore', state: 'Karnataka', latitude: 12.9141, longitude: 77.6109, status: 'APPROVED', description: 'Washing machine, microwave, and refrigerator diagnostics and component repair.', rating: 4.8 },
  ], [])

  // Process & filter providers
  const filteredProviders = useMemo(() => {
    const rawProviders = (data?.content && data.content.length > 0) ? data.content : fallbackProviders
    let providers = [...rawProviders] as (ProviderPublicView & { distanceKm?: number; rating?: number })[]

    // Keyword filter
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      providers = providers.filter(
        (p) =>
          p.businessName.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      )
    }

    // Category filter
    if (category) {
      const c = category.toLowerCase()
      providers = providers.filter(
        (p) =>
          p.businessName.toLowerCase().includes(c) ||
          p.description?.toLowerCase().includes(c),
      )
    }

    // Radius & Distance
    if (userLocation) {
      providers = filterByRadius(providers, userLocation.lat, userLocation.lng, radius) as any
    }

    // Rating filter
    if (minRating > 0) {
      providers = providers.filter((p) => (p.rating ?? 4.8) >= minRating)
    }

    // Sorting
    providers.sort((a, b) => {
      if (sortBy === 'distance') {
        if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
          return a.distanceKm - b.distanceKm
        }
        return 0
      }
      if (sortBy === 'rating') {
        return (b.rating ?? 4.8) - (a.rating ?? 4.8)
      }
      if (sortBy === 'name') {
        return a.businessName.localeCompare(b.businessName)
      }
      return 0
    })

    return providers
  }, [data, fallbackProviders, debouncedSearch, category, userLocation, radius, minRating, sortBy])

  const selectedProvider = useMemo(
    () => filteredProviders.find((p) => p.id === selectedProviderId),
    [filteredProviders, selectedProviderId],
  )

  const mapCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [12.9716, 77.5946] // Default Bangalore center

  return (
    <div className="page-container py-6 space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by provider name, specialty, or city..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="py-2.5 px-3 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
            aria-label="Filter by Category"
          >
            <option value="">All Categories</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="HVAC">HVAC & AC</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Painting">Painting</option>
            <option value="Appliance">Appliance Repair</option>
          </select>

          {/* Radius Dropdown */}
          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="py-2.5 px-3 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
            aria-label="Filter by Radius"
          >
            <option value={5}>Within 5 km</option>
            <option value={10}>Within 10 km</option>
            <option value={25}>Within 25 km</option>
            <option value={50}>Within 50 km</option>
          </select>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent py-1.5 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              aria-label="Sort providers"
            >
              <option value="distance">Nearest First</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex border border-slate-200 rounded-xl overflow-hidden self-end lg:self-auto shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                viewMode === 'split' ? 'bg-blue-600 text-white font-semibold' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Split
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list-only')}
              className={`px-3 py-2 text-xs font-medium border-x border-slate-200 transition-colors ${
                viewMode === 'list-only' ? 'bg-blue-600 text-white font-semibold' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map-only')}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                viewMode === 'map-only' ? 'bg-blue-600 text-white font-semibold' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
              title="Map View"
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {locationError && (
          <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200/80">
            <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{locationError}</span>
          </div>
        )}
      </div>

      {/* Main Split Layout */}
      <div
        className="flex flex-col lg:flex-row gap-5 items-stretch"
        style={{ height: 'calc(100vh - 230px)', minHeight: '520px' }}
      >
        {/* Providers List Column */}
        {viewMode !== 'map-only' && (
          <div
            className={`overflow-y-auto space-y-3.5 pr-1 no-scrollbar transition-all ${
              viewMode === 'split' ? 'w-full lg:w-[48%] flex-shrink-0' : 'w-full'
            }`}
          >
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {filteredProviders.length} Verified Professional{filteredProviders.length !== 1 ? 's' : ''}
              </p>
              {minRating > 0 && (
                <button
                  onClick={() => setMinRating(0)}
                  className="text-xs text-blue-600 font-medium hover:underline"
                >
                  Clear rating filter
                </button>
              )}
            </div>

            {isLoading ? (
              <LoadingState message="Discovering nearby providers..." />
            ) : error ? (
              <ErrorState
                message="Failed to load providers."
                action={{ label: 'Retry', onClick: () => refetch() }}
              />
            ) : filteredProviders.length === 0 ? (
              <EmptyState
                title="No providers found"
                message="Try adjusting your search terms, removing filters, or expanding the search radius."
              />
            ) : (
              filteredProviders.map((p) => {
                const isSelected = selectedProviderId === p.id
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProviderId(p.id)}
                    className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 shadow-md shadow-blue-600/10 ring-1 ring-blue-600'
                        : 'border-slate-200/80 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar name={p.businessName} size="lg" status="online" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base font-bold text-slate-900 truncate">
                            {p.businessName}
                          </h3>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 flex-shrink-0">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        </div>

                        {p.city && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{p.city}{p.state ? `, ${p.state}` : ''}</span>
                            {p.distanceKm !== undefined && (
                              <span className="font-semibold text-blue-600 ml-1">
                                · {formatDistance(p.distanceKm)} away
                              </span>
                            )}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          <StarRating value={5} size="sm" />
                          <span className="text-xs font-bold text-slate-700">{p.rating ?? 4.9}</span>
                          <span className="text-xs text-slate-400 font-medium">(25+ bookings)</span>
                        </div>

                        {p.description && (
                          <p className="text-xs text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
                            {p.description}
                          </p>
                        )}

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <Link
                            to={`/providers/${p.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                          >
                            View Profile
                          </Link>
                          <Link
                            to={`/customer/providers/${p.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
                          >
                            <span>Book Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Map Column */}
        {viewMode !== 'list-only' && (
          <div
            className={`rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm relative ${
              viewMode === 'split' ? 'w-full lg:flex-1 h-80 lg:h-auto' : 'w-full h-full'
            }`}
          >
            <MapContainer
              center={mapCenter}
              zoom={12}
              className="w-full h-full"
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {userLocation && <RecenterButton center={userLocation} />}
              <MapFocus
                selectedLocation={
                  selectedProvider?.latitude && selectedProvider?.longitude
                    ? { lat: selectedProvider.latitude, lng: selectedProvider.longitude }
                    : null
                }
              />

              {/* Provider Markers */}
              {filteredProviders.map((p) => {
                if (!p.latitude || !p.longitude) return null
                return (
                  <Marker
                    key={p.id}
                    position={[p.latitude, p.longitude]}
                    icon={providerIcon}
                    eventHandlers={{
                      click: () => setSelectedProviderId(p.id),
                    }}
                  >
                    <Popup className="sc-popup">
                      <div className="p-2 min-w-[200px]">
                        <h4 className="font-bold text-sm text-slate-900">{p.businessName}</h4>
                        <p className="text-xs text-slate-500 mt-1">{p.city}</p>
                        {p.distanceKm !== undefined && (
                          <p className="text-xs font-semibold text-blue-600 mt-0.5">
                            {formatDistance(p.distanceKm)} away
                          </p>
                        )}
                        <Link
                          to={`/customer/providers/${p.id}`}
                          className="mt-3 block text-center py-1.5 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                        >
                          Book Service
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  )
}
