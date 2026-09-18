import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Trash2, Clock } from 'lucide-react'
import { providerApi } from '@/api/provider'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/UxStates'
import { formatTime } from '@/utils/formatters'
import type { DayOfWeek } from '@/types'

const DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

export default function ProviderAvailability() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [day, setDay] = useState<DayOfWeek>('MONDAY')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')

  const { data: provider } = useQuery({ queryKey: ['provider', 'me'], queryFn: () => providerApi.getMe(), select: (r) => r.data })
  const { data: slots, isLoading, error, refetch } = useQuery({
    queryKey: ['provider', 'availability', provider?.id],
    queryFn: () => providerApi.getMyAvailability(provider!.id),
    select: (r) => r.data,
    enabled: !!provider,
  })

  const createMutation = useMutation({
    mutationFn: () => providerApi.createAvailability(provider!.id, { dayOfWeek: day, startTime, endTime }),
    onSuccess: () => { toast.success('Availability added'); setShowForm(false); qc.invalidateQueries({ queryKey: ['provider', 'availability'] }) },
    onError: () => toast.error('Failed to add availability'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ slotId, active }: { slotId: number; active: boolean }) => providerApi.toggleAvailability(provider!.id, slotId, active),
    onSuccess: () => { toast.success('Updated'); qc.invalidateQueries({ queryKey: ['provider', 'availability'] }) },
    onError: () => toast.error('Failed to update'),
  })

  const deleteMutation = useMutation({
    mutationFn: (slotId: number) => providerApi.deleteAvailability(provider!.id, slotId),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['provider', 'availability'] }) },
    onError: () => toast.error('Failed to delete'),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0F172A]">Availability</h1>
        <button onClick={() => setShowForm(true)} className="sc-btn-primary text-sm gap-1"><Plus className="w-4 h-4" /> Add Slot</button>
      </div>

      {showForm && (
        <div className="sc-card p-6 space-y-4">
          <h2 className="text-base font-semibold">New Availability Slot</h2>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="form-label">Day</label><select value={day} onChange={(e) => setDay(e.target.value as DayOfWeek)} className="sc-input">{DAYS.map((d) => <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>)}</select></div>
            <div><label className="form-label">Start</label><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="sc-input" /></div>
            <div><label className="form-label">End</label><input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="sc-input" /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="sc-btn-primary text-sm">Add</button>
            <button onClick={() => setShowForm(false)} className="sc-btn-outline text-sm">Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? <LoadingState /> : error ? <ErrorState action={{ label: 'Retry', onClick: () => refetch() }} /> : !slots?.length ? (
        <EmptyState title="No availability set" message="Add your weekly availability so customers can book you." />
      ) : (
        <div className="space-y-2">
          {DAYS.map((dayName) => {
            const daySlots = slots.filter((s) => s.dayOfWeek === dayName)
            if (!daySlots.length) return null
            return (
              <div key={dayName} className="sc-card p-4">
                <p className="text-sm font-semibold text-[#0F172A] mb-2">{dayName.charAt(0) + dayName.slice(1).toLowerCase()}</p>
                <div className="space-y-2">
                  {daySlots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#64748B]" />
                        <span className="text-sm">{formatTime(slot.startTime)} – {formatTime(slot.endTime)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${slot.active ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#F1F5F9] text-[#64748B]'}`}>{slot.active ? 'Active' : 'Inactive'}</span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => toggleMutation.mutate({ slotId: slot.id, active: !slot.active })} className="sc-btn-ghost text-xs">{slot.active ? 'Disable' : 'Enable'}</button>
                        <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(slot.id) }} className="sc-btn-ghost text-xs text-[#EF4444]"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
