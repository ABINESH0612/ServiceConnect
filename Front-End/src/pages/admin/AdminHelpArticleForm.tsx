import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { adminApi } from '@/api/admin'
import { helpArticleSchema, type HelpArticleFormValues } from '@/utils/validators'
import { LoadingState } from '@/components/shared/UxStates'

export default function AdminHelpArticleForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isEdit = !!id

  const { data: article, isLoading } = useQuery({
    queryKey: ['admin', 'help-article', Number(id)],
    queryFn: () => adminApi.getArticleById(Number(id)),
    select: (r) => r.data,
    enabled: isEdit,
  })

  const { register, handleSubmit, formState: { errors } } = useForm<HelpArticleFormValues>({
    resolver: zodResolver(helpArticleSchema),
    values: article ? { slug: article.slug, title: article.title, category: article.category, content: article.content, published: article.published, displayOrder: article.displayOrder } : undefined,
  })

  const createMutation = useMutation({
    mutationFn: (data: HelpArticleFormValues) => adminApi.createArticle(data),
    onSuccess: () => { toast.success('Article created'); qc.invalidateQueries({ queryKey: ['admin', 'help-articles'] }); navigate('/admin/help-center') },
    onError: () => toast.error('Failed to create'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: HelpArticleFormValues) => adminApi.updateArticle(Number(id), data),
    onSuccess: () => { toast.success('Article updated'); qc.invalidateQueries({ queryKey: ['admin', 'help-articles'] }); navigate('/admin/help-center') },
    onError: () => toast.error('Failed to update'),
  })

  if (isEdit && isLoading) return <LoadingState />

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#0F172A] mb-6">{isEdit ? 'Edit Article' : 'New Article'}</h1>
      <form onSubmit={handleSubmit((d) => isEdit ? updateMutation.mutate(d) : createMutation.mutate(d))} className="sc-card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="form-label">Title</label><input {...register('title')} className="sc-input" />{errors.title && <p className="form-error">{errors.title.message}</p>}</div>
          <div><label className="form-label">Slug</label><input {...register('slug')} className="sc-input" placeholder="getting-started" />{errors.slug && <p className="form-error">{errors.slug.message}</p>}</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="form-label">Category</label><input {...register('category')} className="sc-input" />{errors.category && <p className="form-error">{errors.category.message}</p>}</div>
          <div><label className="form-label">Display Order</label><input type="number" {...register('displayOrder', { valueAsNumber: true })} className="sc-input" /></div>
        </div>
        <div><label className="form-label">Content (HTML)</label><textarea {...register('content')} className="sc-input min-h-[200px] font-mono text-xs" />{errors.content && <p className="form-error">{errors.content.message}</p>}</div>
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...register('published')} className="w-4 h-4 rounded border-[#E2E8F0]" /><span className="text-sm">Published</span></label>
        <div className="flex gap-3">
          <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="sc-btn-primary text-sm">{isEdit ? 'Update' : 'Create'}</button>
          <button type="button" onClick={() => navigate('/admin/help-center')} className="sc-btn-outline text-sm">Cancel</button>
        </div>
      </form>
    </div>
  )
}
