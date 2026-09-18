import { useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, HelpCircle, ChevronRight, FileText, BookOpen } from 'lucide-react'
import { helpCenterApi } from '@/api/helpCenter'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/UxStates'

export default function HelpCenter() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch categories
  const categoriesQuery = useQuery({
    queryKey: ['help-categories'],
    queryFn: () => helpCenterApi.getCategories().then((r) => r.data),
  })

  // Fetch articles (search or popular)
  const articlesQuery = useQuery({
    queryKey: ['help-articles', debouncedSearch],
    queryFn: () =>
      helpCenterApi
        .getArticles({ search: debouncedSearch || undefined, size: 10 })
        .then((r) => r.data),
  })

  const handleSearchClear = useCallback(() => {
    setSearch('')
  }, [])

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-[#EFF6FF] flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8 text-[#2563EB]" />
        </div>
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Help Center</h1>
        <p className="text-[#64748B] max-w-lg mx-auto">
          Find answers to common questions, browse guides, and get the help you need.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles…"
            className="sc-input pl-12 pr-4 py-3 text-base"
            aria-label="Search help articles"
          />
          {search && (
            <button
              onClick={handleSearchClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] text-sm"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      {!debouncedSearch && (
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Browse by Category</h2>
          {categoriesQuery.isLoading && <LoadingState message="Loading categories…" />}
          {categoriesQuery.isError && (
            <ErrorState
              message="Failed to load categories."
              action={{ label: 'Retry', onClick: () => categoriesQuery.refetch() }}
            />
          )}
          {categoriesQuery.data && categoriesQuery.data.length === 0 && (
            <EmptyState title="No categories yet" message="Help articles are being prepared." />
          )}
          {categoriesQuery.data && categoriesQuery.data.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoriesQuery.data.map((cat) => {
                const name = typeof cat === 'string' ? cat : cat.name
                const articleCount = typeof cat === 'object' && cat ? cat.articleCount : null
                return (
                  <Link
                    key={name}
                    to={`/help/category/${encodeURIComponent(name)}`}
                    className="sc-card p-5 hover:shadow-card-hover transition-shadow duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[8px] bg-[#EFF6FF] flex items-center justify-center flex-shrink-0 group-hover:bg-[#DBEAFE] transition-colors">
                        <BookOpen className="w-5 h-5 text-[#2563EB]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                          {name}
                        </h3>
                        {articleCount != null && (
                          <p className="text-xs text-[#94A3B8]">
                            {articleCount} article{articleCount !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#2563EB] transition-colors flex-shrink-0" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* Articles List */}
      <section>
        <h2 className="text-lg font-semibold text-[#0F172A] mb-4">
          {debouncedSearch ? 'Search Results' : 'Popular Articles'}
        </h2>
        {articlesQuery.isLoading && <LoadingState message="Loading articles…" />}
        {articlesQuery.isError && (
          <ErrorState
            message="Failed to load articles."
            action={{ label: 'Retry', onClick: () => articlesQuery.refetch() }}
          />
        )}
        {articlesQuery.data && articlesQuery.data.content.length === 0 && (
          <EmptyState
            title={debouncedSearch ? 'No articles found' : 'No articles yet'}
            message={debouncedSearch ? 'Try a different search term.' : 'Help articles will be available soon.'}
            action={debouncedSearch ? { label: 'Clear Search', onClick: handleSearchClear } : undefined}
          />
        )}
        {articlesQuery.data && articlesQuery.data.content.length > 0 && (
          <div className="space-y-3">
            {articlesQuery.data.content.map((article) => (
              <Link
                key={article.slug}
                to={`/help/article/${article.slug}`}
                className="sc-card p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow duration-200 group"
              >
                <FileText className="w-5 h-5 text-[#64748B] flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-[#0F172A] group-hover:text-[#2563EB] transition-colors truncate">
                    {article.title}
                  </h3>
                  <p className="text-xs text-[#94A3B8]">{article.category}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#CBD5E1] flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
