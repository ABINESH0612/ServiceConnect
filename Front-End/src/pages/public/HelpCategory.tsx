import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, ArrowLeft, FileText } from 'lucide-react'
import { helpCenterApi } from '@/api/helpCenter'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/UxStates'

export default function HelpCategory() {
  const { category } = useParams<{ category: string }>()
  const decodedCategory = category ? decodeURIComponent(category) : ''

  const articlesQuery = useQuery({
    queryKey: ['help-articles', 'category', decodedCategory],
    queryFn: () =>
      helpCenterApi
        .getArticles({ category: decodedCategory, size: 50 })
        .then((r) => r.data),
    enabled: !!decodedCategory,
  })

  return (
    <div className="page-container py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-[#64748B] mb-6" aria-label="Breadcrumb">
        <Link to="/help" className="hover:text-[#2563EB] transition-colors">
          Help Center
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#0F172A] font-medium">{decodedCategory}</span>
      </nav>

      {/* Back link */}
      <Link
        to="/help"
        className="inline-flex items-center gap-1.5 text-sm text-[#2563EB] hover:text-[#1D4ED8] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Help Center
      </Link>

      {/* Category Header */}
      <h1 className="text-2xl font-bold text-[#0F172A] mb-6">{decodedCategory}</h1>

      {/* Articles */}
      {articlesQuery.isLoading && <LoadingState message="Loading articles…" />}
      {articlesQuery.isError && (
        <ErrorState
          message="Failed to load articles."
          action={{ label: 'Retry', onClick: () => articlesQuery.refetch() }}
        />
      )}
      {articlesQuery.data && articlesQuery.data.content.length === 0 && (
        <EmptyState
          title="No articles in this category"
          message="Check back later for new articles."
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
                <h3 className="font-medium text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                  {article.title}
                </h3>
              </div>
              <ChevronRight className="w-4 h-4 text-[#CBD5E1] flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
