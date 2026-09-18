import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { providerApi } from '@/api/provider'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/UxStates'

export default function ProviderPhotos() {
  const qc = useQueryClient()
  const [url, setUrl] = useState('')
  const { data: provider } = useQuery({ queryKey: ['provider', 'me'], queryFn: () => providerApi.getMe(), select: (r) => r.data })
  const { data: photos, isLoading, error } = useQuery({
    queryKey: ['provider', 'photos', provider?.id],
    queryFn: () => providerApi.getMyPhotos(provider!.id),
    select: (r) => r.data,
    enabled: !!provider,
  })

  const addMutation = useMutation({
    mutationFn: () => providerApi.addPhoto(provider!.id, { imageUrl: url, displayOrder: (photos?.length ?? 0) + 1 }),
    onSuccess: () => { toast.success('Photo added'); setUrl(''); qc.invalidateQueries({ queryKey: ['provider', 'photos'] }) },
    onError: () => toast.error('Failed to add photo'),
  })

  const deleteMutation = useMutation({
    mutationFn: (photoId: number) => providerApi.deletePhoto(provider!.id, photoId),
    onSuccess: () => { toast.success('Photo removed'); qc.invalidateQueries({ queryKey: ['provider', 'photos'] }) },
    onError: () => toast.error('Failed to remove'),
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F172A]">Portfolio Photos</h1>
      <div className="sc-card p-4 flex gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Image URL" className="sc-input flex-1" />
        <button onClick={() => addMutation.mutate()} disabled={!url.trim() || addMutation.isPending} className="sc-btn-primary text-sm gap-1"><Plus className="w-4 h-4" /> Add</button>
      </div>
      {isLoading ? <LoadingState /> : error ? <ErrorState /> : !photos?.length ? (
        <EmptyState title="No photos" message="Add photos to showcase your work." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((p) => (
            <div key={p.id} className="relative group">
              <img src={p.imageUrl} alt="Portfolio" className="w-full h-40 object-cover rounded-[12px]" loading="lazy" />
              <button onClick={() => { if (confirm('Remove?')) deleteMutation.mutate(p.id) }} className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[#EF4444]">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
