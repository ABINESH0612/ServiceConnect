import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Search,
  BookOpen,
  FileCheck,
  FileEdit,
  ExternalLink,
  Layers
} from 'lucide-react'
import { adminApi } from '@/api/admin'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/UxStates'
import { formatDate } from '@/utils/formatters'

export default function AdminHelpCenter() {
  const qc = useQueryClient()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'help-articles', page],
    queryFn: () => adminApi.getAllArticles({ page, size: 20 }),
    select: (r) => r.data,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteArticle(id),
    onSuccess: () => {
      toast.success('Help article deleted successfully')
      qc.invalidateQueries({ queryKey: ['admin', 'help-articles'] })
    },
    onError: () => toast.error('Failed to delete article'),
  })

  const rawArticles = data?.content ?? []

  const stats = useMemo(() => {
    const total = data?.totalElements ?? rawArticles.length
    const published = rawArticles.filter((a) => a.published).length
    const drafts = rawArticles.filter((a) => !a.published).length
    const categories = new Set(rawArticles.map((a) => a.category)).size
    return { total, published, drafts, categories }
  }, [data, rawArticles])

  const filteredArticles = useMemo(() => {
    return rawArticles.filter((a) => {
      if (categoryFilter && a.category !== categoryFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return (
          a.title.toLowerCase().includes(q) ||
          a.slug.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [rawArticles, categoryFilter, search])

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(rawArticles.map((a) => a.category).filter(Boolean)))
  }, [rawArticles])

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Knowledge Base Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Author and publish customer help articles, troubleshooting guides, and platform policies.
          </p>
        </div>
        <Link
          to="/admin/help-center/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Total Articles</p>
            <p className="text-lg sm:text-xl font-black text-slate-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Live Published</p>
            <p className="text-lg sm:text-xl font-black text-emerald-600">{stats.published}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <FileEdit className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Drafts</p>
            <p className="text-lg sm:text-xl font-black text-amber-600">{stats.drafts}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Categories</p>
            <p className="text-lg sm:text-xl font-black text-purple-600">{stats.categories}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search article titles, slugs, or topics..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="py-2.5 px-3 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white cursor-pointer"
          aria-label="Filter by Category"
        >
          <option value="">All Categories</option>
          {uniqueCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Articles List */}
      {isLoading ? (
        <LoadingState message="Loading documentation articles..." />
      ) : error ? (
        <ErrorState
          message="Failed to retrieve help articles."
          action={{ label: 'Retry', onClick: () => refetch() }}
        />
      ) : filteredArticles.length === 0 ? (
        <EmptyState
          title="No articles match your query"
          message="Adjust your filters or create a new article to provide answers for users."
          action={{
            label: 'Create Article',
            onClick: () => window.location.assign('/admin/help-center/new'),
          }}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
          {filteredArticles.map((a) => (
            <div
              key={a.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      a.published
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                    }`}
                  >
                    {a.published ? (
                      <>
                        <Eye className="w-3 h-3 text-emerald-600" />
                        <span>Live</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 text-amber-600" />
                        <span>Draft</span>
                      </>
                    )}
                  </span>

                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold">
                    {a.category}
                  </span>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900">{a.title}</h3>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono flex-wrap">
                  <span>/{a.slug}</span>
                  <span>·</span>
                  <span>Created {formatDate(a.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {a.published && (
                  <Link
                    to={`/help-center/${a.category?.toLowerCase() || 'general'}/${a.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="View Live Page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
                <Link
                  to={`/admin/help-center/${a.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to permanently delete "${a.title}"?`)) {
                      deleteMutation.mutate(a.id!)
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                  title="Delete Article"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {data && data.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100">
              <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
