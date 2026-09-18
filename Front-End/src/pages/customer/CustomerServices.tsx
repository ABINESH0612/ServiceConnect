import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { catalogApi } from '@/api/catalog'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState, ErrorState, NoResultsState, EmptyState } from '@/components/shared/UxStates'
import { formatPrice } from '@/utils/formatters'
import { useDebounce } from '@/hooks/useDebounce'

export default function CustomerServices() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(0)
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['catalog', 'search', debouncedSearch, category, page],
    queryFn: () => catalogApi.search({ search: debouncedSearch || undefined, category: category || undefined, page, size: 12 }),
    select: (res) => res.data,
  })

  const items = data?.content ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F172A]">Browse Services</h1>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            placeholder="Search services…"
            className="sc-input pl-10"
          />
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(0) }}
          className="sc-input w-auto min-w-[160px]"
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          <option value="Electrical">Electrical</option>
          <option value="Plumbing">Plumbing</option>
          <option value="HVAC">HVAC</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Painting">Painting</option>
          <option value="Landscaping">Landscaping</option>
        </select>
      </div>

      {/* Results */}
      {isLoading ? (
        <LoadingState message="Loading services…" />
      ) : error ? (
        <ErrorState message="Failed to load services." action={{ label: 'Retry', onClick: () => refetch() }} />
      ) : items.length === 0 ? (
        debouncedSearch || category ? (
          <NoResultsState message={`No services found for "${debouncedSearch}".`} action={{ label: 'Clear Filters', onClick: () => { setSearch(''); setCategory('') } }} />
        ) : (
          <EmptyState title="No services available" message="Check back later for new services." />
        )
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="sc-card-hover p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#0F172A]">{item.name}</h3>
                    <span className="tag-pill mt-1">{item.category}</span>
                  </div>
                  <p className="text-base font-bold text-[#0F172A]">{formatPrice(item.price)}</p>
                </div>
                {item.description && (
                  <p className="text-xs text-[#64748B] line-clamp-2 mb-3">{item.description}</p>
                )}
                {item.durationMinutes && (
                  <p className="text-xs text-[#94A3B8]">Duration: {item.durationMinutes} min</p>
                )}
                <Link
                  to={`/customer/providers/${item.providerId}`}
                  className="sc-btn-primary w-full mt-4 text-sm text-center"
                >
                  View Provider
                </Link>
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
