import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, ArrowLeft, Calendar } from 'lucide-react'
import DOMPurify from 'dompurify'
import { helpCenterApi } from '@/api/helpCenter'
import { LoadingState, ErrorState } from '@/components/shared/UxStates'
import { formatDate } from '@/utils/formatters'

// ============================================================
// HelpArticle — Single help article page
//
// IMPORTANT: Article content is HTML from the backend.
// Always sanitize with DOMPurify before rendering innerHTML.
// Never render raw article.content directly.
// ============================================================

export default function HelpArticle() {
  const { slug } = useParams<{ slug: string }>()

  const articleQuery = useQuery({
    queryKey: ['help-article', slug],
    queryFn: () => helpCenterApi.getArticleBySlug(slug!).then((r) => r.data),
    enabled: !!slug,
  })

  const article = articleQuery.data

  if (articleQuery.isLoading) {
    return (
      <div className="page-container py-8">
        <LoadingState message="Loading article…" />
      </div>
    )
  }

  if (articleQuery.isError) {
    return (
      <div className="page-container py-8">
        <ErrorState
          title="Article not found"
          message="The article you're looking for doesn't exist or has been removed."
          action={{ label: 'Back to Help Center', onClick: () => window.history.back() }}
        />
      </div>
    )
  }

  if (!article) return null

  // Sanitize HTML content — NEVER skip this step
  const sanitizedContent = DOMPurify.sanitize(article.content, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr',
      'ul', 'ol', 'li', 'a', 'strong', 'em', 'code', 'pre',
      'blockquote', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'span', 'div', 'sub', 'sup',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'id'],
  })

  return (
    <div className="page-container py-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-[#64748B] mb-6 flex-wrap" aria-label="Breadcrumb">
        <Link to="/help" className="hover:text-[#2563EB] transition-colors">
          Help Center
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          to={`/help/category/${encodeURIComponent(article.category)}`}
          className="hover:text-[#2563EB] transition-colors"
        >
          {article.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#0F172A] font-medium truncate max-w-[200px]">{article.title}</span>
      </nav>

      {/* Back link */}
      <Link
        to="/help"
        className="inline-flex items-center gap-1.5 text-sm text-[#2563EB] hover:text-[#1D4ED8] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Help Center
      </Link>

      {/* Article Card */}
      <article className="sc-card p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0F172A] mb-3">{article.title}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="tag-pill">{article.category}</span>
            {article.updatedAt && (
              <span className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                <Calendar className="w-3.5 h-3.5" />
                Updated {formatDate(article.updatedAt)}
              </span>
            )}
          </div>
        </div>

        <hr className="border-[#E2E8F0] my-6" />

        {/* Content — sanitized HTML */}
        <div
          className="prose prose-sm max-w-none text-[#0F172A]
            prose-headings:text-[#0F172A] prose-headings:font-semibold
            prose-p:text-[#475569] prose-p:leading-relaxed
            prose-a:text-[#2563EB] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-[#0F172A]
            prose-code:bg-[#F1F5F9] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-[4px] prose-code:text-sm
            prose-pre:bg-[#0F172A] prose-pre:text-[#E2E8F0] prose-pre:rounded-[8px]
            prose-blockquote:border-l-[#2563EB] prose-blockquote:bg-[#F8FAFC] prose-blockquote:py-2 prose-blockquote:rounded-r-[8px]
            prose-li:text-[#475569]
            prose-img:rounded-[8px]
            prose-table:border-collapse
            prose-th:bg-[#F1F5F9] prose-th:px-3 prose-th:py-2 prose-th:text-left
            prose-td:px-3 prose-td:py-2 prose-td:border-t prose-td:border-[#E2E8F0]"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </article>
    </div>
  )
}
