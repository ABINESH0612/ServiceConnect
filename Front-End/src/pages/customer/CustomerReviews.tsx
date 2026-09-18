import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Edit2, Trash2 } from 'lucide-react'
import { reviewApi } from '@/api/review'
import { bookingApi } from '@/api/booking'
import { useAuthStore } from '@/store/authStore'
import { StarRating } from '@/components/shared/StarRating'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/UxStates'
import { formatDate } from '@/utils/formatters'

export default function CustomerReviews() {
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const [searchParams] = useSearchParams()
  const bookingIdParam = searchParams.get('bookingId')
  const [page, setPage] = useState(0)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editRating, setEditRating] = useState(5)
  const [editComment, setEditComment] = useState('')
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')

  const { data: bookingData } = useQuery({
    queryKey: ['booking', bookingIdParam],
    queryFn: () => bookingApi.getById(Number(bookingIdParam)),
    select: (r) => r.data,
    enabled: !!bookingIdParam,
  })

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reviews', 'customer', user?.id, page],
    queryFn: () => reviewApi.getByCustomer(user!.id, { page, size: 10 }),
    select: (r) => r.data,
    enabled: !!user,
  })

  const createMutation = useMutation({
    mutationFn: () => reviewApi.create({
      bookingId: Number(bookingIdParam),
      providerId: bookingData?.providerId ?? 0,
      rating: newRating,
      comment: newComment || undefined
    }),
    onSuccess: () => { toast.success('Review submitted!'); qc.invalidateQueries({ queryKey: ['reviews'] }) },
    onError: () => toast.error('Failed to submit review. You may have already reviewed this booking.'),
  })

  const updateMutation = useMutation({
    mutationFn: (id: number) => reviewApi.update(id, { rating: editRating, comment: editComment || undefined }),
    onSuccess: () => { toast.success('Review updated'); setEditingId(null); qc.invalidateQueries({ queryKey: ['reviews'] }) },
    onError: () => toast.error('Failed to update review'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => reviewApi.delete(id),
    onSuccess: () => { toast.success('Review deleted'); qc.invalidateQueries({ queryKey: ['reviews'] }) },
    onError: () => toast.error('Failed to delete review'),
  })

  const reviews = data?.content ?? []

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-[#0F172A]">My Reviews</h1>

      {bookingIdParam && (
        <div className="sc-card p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#0F172A]">Write a Review for Booking #{bookingIdParam}</h2>
          <div>
            <label className="form-label">Rating</label>
            <StarRating value={newRating} onChange={setNewRating} size="lg" />
          </div>
          <div>
            <label htmlFor="comment" className="form-label">Comment (optional)</label>
            <textarea id="comment" value={newComment} onChange={(e) => setNewComment(e.target.value)} className="sc-input min-h-[80px]" placeholder="Share your experience…" />
          </div>
          <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !bookingData} className="sc-btn-primary text-sm">
            {createMutation.isPending ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      )}

      {isLoading ? <LoadingState message="Loading reviews…" /> : error ? (
        <ErrorState message="Failed to load reviews." action={{ label: 'Retry', onClick: () => refetch() }} />
      ) : reviews.length === 0 ? (
        <EmptyState title="No reviews yet" message="Complete a booking to leave your first review." />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="sc-card p-4">
              {editingId === r.id ? (
                <div className="space-y-3">
                  <StarRating value={editRating} onChange={setEditRating} />
                  <textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} className="sc-input min-h-[60px]" />
                  <div className="flex gap-2">
                    <button onClick={() => updateMutation.mutate(r.id)} className="sc-btn-primary text-xs">Save</button>
                    <button onClick={() => setEditingId(null)} className="sc-btn-outline text-xs">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StarRating value={r.rating} readonly size="sm" />
                      <span className="text-xs text-[#94A3B8]">{formatDate(r.createdAt)}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingId(r.id); setEditRating(r.rating); setEditComment(r.comment ?? '') }} className="sc-btn-ghost p-1.5" aria-label="Edit review">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { if (confirm('Delete this review?')) deleteMutation.mutate(r.id) }} className="sc-btn-ghost p-1.5 text-[#EF4444]" aria-label="Delete review">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-[#0F172A]">{r.comment}</p>}
                  <p className="text-xs text-[#94A3B8] mt-1">Booking #{r.bookingId}</p>
                </>
              )}
            </div>
          ))}
          <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
