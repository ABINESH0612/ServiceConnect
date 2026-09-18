import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Search, MapPin, List, Map as MapIcon, Navigation, Star, Clock } from 'lucide-react'
import { providerDiscoveryApi } from '@/api/provider'
import { filterByRadius, formatDistance } from '@/lib/haversine'
import { useDebounce } from '@/hooks/useDebounce'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/UxStates'
import type { MapViewMode, Coordinates } from '@/types'

// Custom marker icon
const providerIcon = new L.DivIcon({
  className: 'sc-marker',
  html: '<div class="map-price-badge">Provider</div>',
  iconSize: [60, 24],
  iconAnchor: [30, 12],
})

const userIcon = new L.DivIcon({
  className: '',
  html: '<div style="width:16px;height:16px;background:#2563EB;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

function RecenterButton({ center }: { center: Coordinates }) {
  const map = useMap()
  return (
    <button
      onClick={() => map.flyTo([center.lat, center.lng], 13)}
      className="sc-btn-primary text-xs px-3 py-1.5 absolute top-3 right-3 z-[1000] gap-1"
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
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [radius, setRadius] = useState(10)
  const [viewMode, setViewMode] = useState<MapViewMode>('split')
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
  const [locationError, setLocationError] = useState('')
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null)
  const debouncedSearch = useDebounce(search, 300)

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocationError('Location access denied'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [])

  // Fetch providers
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['providers', 'discovery'],
    queryFn: () => providerDiscoveryApi.getAll({ size: 100, status: 'APPROVED' }),
    select: (res) => res.data,
  })

  // Client-side filtering with Haversine
  const filteredProviders = useMemo(() => {
    let providers = data?.content ?? []
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      providers = providers.filter((p) =>
        p.businessName.toLowerCase().includes(q) || p.city?.toLowerCase().includes(q),
      )
    }
    if (userLocation) {
      return filterByRadius(providers, userLocation.lat, userLocation.lng, radius)
    }
    return providers.map((p) => ({ ...p, distanceKm: undefined }))
  }, [data, debouncedSearch, userLocation, radius])

  const mapCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [12.9716, 77.5946] // Default: Bangalore

  return (
    <div className="page-container py-4">
      {/* Breadcrumb */}
      <nav className="text-xs text-[#64748B] mb-3" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-[#2563EB]">ServiceConnect</Link>
        <span className="mx-1">›</span>
        <span className="text-[#0F172A] font-medium">Discovery</span>
      </nav>

      {/* Search bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Electrical, HVAC, Plumbing" className="sc-input pl-10 text-sm" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="sc-input w-auto text-sm" aria-label="Category">
          <option value="">All Categories</option>
          <option value="Electrical">Electrical</option>
          <option value="Plumbing">Plumbing</option>
          <option value="HVAC">HVAC</option>
          <option value="Cleaning">Cleaning</option>
        </select>
        <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="sc-input w-auto text-sm" aria-label="Radius">
          <option value={5}>Radius 5 km</option>
          <option value={10}>Radius 10 km</option>
          <option value={25}>Radius 25 km</option>
          <option value={50}>Radius 50 km</option>
        </select>
        <div className="flex border border-[#E2E8F0] rounded-[8px] overflow-hidden">
          <button onClick={() => setViewMode('split')} className={`px-3 py-2 text-xs font-medium ${viewMode === 'split' ? 'bg-[#2563EB] text-white' : 'bg-white text-[#64748B]'}`}>Split</button>
          <button onClick={() => setViewMode('map-only')} className={`px-3 py-2 text-xs font-medium border-x border-[#E2E8F0] ${viewMode === 'map-only' ? 'bg-[#2563EB] text-white' : 'bg-white text-[#64748B]'}`} aria-label="Map only">
            <MapIcon className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setViewMode('list-only')} className={`px-3 py-2 text-xs font-medium ${viewMode === 'list-only' ? 'bg-[#2563EB] text-white' : 'bg-white text-[#64748B]'}`} aria-label="List only">
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {locationError && (
        <div className="flex items-center gap-2 text-xs text-[#F59E0B] bg-[#FEF3C7] px-3 py-2 rounded-[8px] mb-3">
          <MapPin className="w-3.5 h-3.5" /> {locationError}. Showing default location.
        </div>
      )}

      {/* Content */}
      <div className={`flex gap-4 ${viewMode === 'list-only' ? '' : ''}`} style={{ height: 'calc(100vh - 220px)' }}>
        {/* Provider list */}
        {viewMode !== 'map-only' && (
          <div className={`overflow-y-auto space-y-3 no-scrollbar ${viewMode === 'split' ? 'w-[45%] flex-shrink-0' : 'w-full'}`}>
            <p className="text-sm font-semibold text-[#0F172A]">
              {filteredProviders.length} Verified Provider{filteredProviders.length !== 1 ? 's' : ''}
            </p>
            {isLoading ? <LoadingState message="Loading providers…" /> : error ? (
              <ErrorState message="Failed to load providers." action={{ label: 'Retry', onClick: () => refetch() }} />
            ) : filteredProviders.length === 0 ? (
              <EmptyState title="No providers found" message="Try increasing the search radius or adjusting your filters." />
            ) : (
              filteredProviders.map((p) => (
                <div
                  key={p.id}
                  className={p.id === selectedProviderId ? 'provider-card-selected' : 'provider-card'}
                  onClick={() => setSelectedProviderId(p.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedProviderId(p.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#EFF6FF] flex items-center justify-center flex-shrink-0 text-[#2563EB] font-bold text-sm">
                      {p.businessName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-[#0F172A] truncate">{p.businessName}</h3>
                          {p.city && <p className="text-xs text-[#64748B]">{p.city}{p.state ? `, ${p.state}` : ''}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-[#64748B]">
                          <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" /> 4.5
                        </span>
                        {'distanceKm' in p && p.distanceKm != null && (
                          <span className="text-xs text-[#64748B]">· {formatDistance(p.distanceKm)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="flex items-center gap-1 text-xs text-[#16A34A]">
                          <Clock className="w-3 h-3" /> Available
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Link to={`/customer/providers/${p.id}`} className="sc-btn-primary flex-1 text-xs text-center" onClick={(e) => e.stopPropagation()}>
                      Quick Book
                    </Link>
                    <Link to={`/providers/${p.id}`} className="sc-btn-outline flex-1 text-xs text-center" onClick={(e) => e.stopPropagation()}>
                      Profile
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Map */}
        {viewMode !== 'list-only' && (
          <div className={`relative rounded-card overflow-hidden border border-[#E2E8F0] ${viewMode === 'split' ? 'flex-1' : 'w-full'}`}>
            <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapFocus
                selectedLocation={
                  (() => {
                    const sel = filteredProviders.find((p) => p.id === selectedProviderId)
                    return sel?.latitude && sel?.longitude ? { lat: sel.latitude, lng: sel.longitude } : null
                  })()
                }
              />
              {userLocation && (
                <>
                  <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                    <Popup>You (Current Location)</Popup>
                  </Marker>
                  <RecenterButton center={userLocation} />
                </>
              )}
              {filteredProviders.map((p) => {
                if (!p.latitude || !p.longitude) return null
                return (
                  <Marker
                    key={p.id}
                    position={[p.latitude, p.longitude]}
                    icon={providerIcon}
                    eventHandlers={{ click: () => setSelectedProviderId(p.id) }}
                  >
                    <Popup>
                      <div className="text-sm min-w-[180px]">
                        <p className="font-semibold">{p.businessName}</p>
                        {p.city && <p className="text-[#64748B] text-xs">{p.city}</p>}
                        <Link to={`/providers/${p.id}`} className="text-[#2563EB] text-xs font-medium hover:underline mt-1 block">
                          View Profile →
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
