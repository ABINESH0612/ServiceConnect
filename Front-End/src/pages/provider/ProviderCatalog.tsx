import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { catalogApi } from '@/api/catalog'
import { providerApi } from '@/api/provider'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/UxStates'
import { formatPrice } from '@/utils/formatters'

export default function ProviderCatalog() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')

  const { data: provider } = useQuery({ queryKey: ['provider', 'me'], queryFn: () => providerApi.getMe(), select: (r) => r.data })
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['catalog', 'provider', provider?.id],
    queryFn: () => catalogApi.getByProvider(provider!.id, { size: 50 }),
    select: (r) => r.data,
    enabled: !!provider,
  })

  const createMutation = useMutation({
    mutationFn: () => catalogApi.create({ name, description: description || undefined, category, price: Number(price), durationMinutes: duration ? Number(duration) : undefined }),
    onSuccess: () => { toast.success('Service added'); resetForm(); qc.invalidateQueries({ queryKey: ['catalog'] }) },
    onError: () => toast.error('Failed to add service'),
  })

  const updateMutation = useMutation({
    mutationFn: () => catalogApi.update(editId!, { name, description: description || undefined, category, price: Number(price), durationMinutes: duration ? Number(duration) : undefined }),
    onSuccess: () => { toast.success('Service updated'); resetForm(); qc.invalidateQueries({ queryKey: ['catalog'] }) },
    onError: () => toast.error('Failed to update'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => catalogApi.deactivate(id),
    onSuccess: () => { toast.success('Service removed'); qc.invalidateQueries({ queryKey: ['catalog'] }) },
    onError: () => toast.error('Failed to remove'),
  })

  function resetForm() { setShowForm(false); setEditId(null); setName(''); setDescription(''); setCategory(''); setPrice(''); setDuration('') }
  function startEdit(item: { id: number; name: string; description?: string; category: string; price: number; durationMinutes?: number }) {
    setEditId(item.id); setName(item.name); setDescription(item.description ?? ''); setCategory(item.category); setPrice(String(item.price)); setDuration(item.durationMinutes ? String(item.durationMinutes) : ''); setShowForm(true)
  }

  const items = (data?.content ?? []).filter((i) => i.active)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0F172A]">My Services</h1>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="sc-btn-primary text-sm gap-1"><Plus className="w-4 h-4" /> Add Service</button>
      </div>

      {showForm && (
        <div className="sc-card p-6 space-y-4">
          <h2 className="text-base font-semibold">{editId ? 'Edit Service' : 'New Service'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label htmlFor="service-name" className="form-label">Name</label><input id="service-name" value={name} onChange={(e) => setName(e.target.value)} className="sc-input" /></div>
            <div><label htmlFor="service-category" className="form-label">Category</label><input id="service-category" value={category} onChange={(e) => setCategory(e.target.value)} className="sc-input" placeholder="e.g. Electrical" /></div>
          </div>
          <div><label htmlFor="service-description" className="form-label">Description</label><textarea id="service-description" value={description} onChange={(e) => setDescription(e.target.value)} className="sc-input" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label htmlFor="service-price" className="form-label">Price (₹)</label><input id="service-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="sc-input" /></div>
            <div><label htmlFor="service-duration" className="form-label">Duration (min)</label><input id="service-duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="sc-input" /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => editId ? updateMutation.mutate() : createMutation.mutate()} className="sc-btn-primary text-sm">{editId ? 'Update' : 'Create'}</button>
            <button onClick={resetForm} className="sc-btn-outline text-sm">Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? <LoadingState /> : error ? <ErrorState action={{ label: 'Retry', onClick: () => refetch() }} /> : items.length === 0 ? (
        <EmptyState title="No services" message="Add your first service to start receiving bookings." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="sc-card p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#0F172A]">{item.name}</p>
                <div className="flex items-center gap-2 mt-1"><span className="tag-pill">{item.category}</span>{item.durationMinutes && <span className="text-xs text-[#94A3B8]">{item.durationMinutes} min</span>}</div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-bold">{formatPrice(item.price)}</p>
                <button onClick={() => startEdit(item)} className="sc-btn-ghost p-1.5"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => { if (confirm('Remove this service?')) deleteMutation.mutate(item.id) }} className="sc-btn-ghost p-1.5 text-[#EF4444]"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
