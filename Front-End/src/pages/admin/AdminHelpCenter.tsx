import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import { adminApi } from '@/api/admin'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/UxStates'
import { formatDate } from '@/utils/formatters'

export default function AdminHelpCenter() {
  const qc = useQueryClient()
  const [page, setPage] = useState(0)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'help-articles', page],
    queryFn: () => adminApi.getAllArticles({ page, size: 10 }),
    select: (r) => r.data,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteArticle(id),
    onSuccess: () => { toast.success('Article deleted'); qc.invalidateQueries({ queryKey: ['admin', 'help-articles'] }) },
    onError: () => toast.error('Failed to delete'),
  })

  const articles = data?.content ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0F172A]">Help Center</h1>
        <Link to="/admin/help-center/new" className="sc-btn-primary text-sm gap-1"><Plus className="w-4 h-4" /> New Article</Link>
      </div>
      {isLoading ? <LoadingState /> : error ? <ErrorState action={{ label: 'Retry', onClick: () => refetch() }} /> : !articles.length ? (
        <EmptyState title="No articles" message="Create your first help center article." action={{ label: 'Create Article', onClick: () => window.location.assign('/admin/help-center/new') }} />
      ) : (
        <>
          <div className="space-y-3">
            {articles.map((a) => (
              <div key={a.id} className="sc-card p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{a.title}</p>
                    {a.published ? <Eye className="w-3.5 h-3.5 text-[#16A34A]" /> : <EyeOff className="w-3.5 h-3.5 text-[#94A3B8]" />}
                  </div>
                  <p className="text-xs text-[#64748B]">{a.category} · {a.slug} · {formatDate(a.createdAt)}</p>
                </div>
                <div className="flex gap-1">
                  <Link to={`/admin/help-center/${a.id}`} className="sc-btn-ghost p-1.5"><Edit2 className="w-4 h-4" /></Link>
                  <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(a.id!) }} className="sc-btn-ghost p-1.5 text-[#EF4444]"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
