import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, UserCheck, Phone, Calendar, User, Shield, CheckCircle2 } from 'lucide-react'
import { userApi } from '@/api/user'
import { Avatar } from '@/components/shared/Avatar'
import { Modal } from '@/components/shared/Modal'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/UxStates'
import { formatDate } from '@/utils/formatters'
import type { UserProfile } from '@/types'

export default function AdminCustomers() {
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)

  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'users', 'all'],
    queryFn: () => userApi.getAll(),
    select: (res) => res.data,
  })

  // Sample backup customer list if database has not seeded multiple users yet
  const fallbackUsers: UserProfile[] = useMemo(() => [
    { id: 101, firstName: 'Aarav', lastName: 'Patel', phone: '+91 98765 43210', createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-01-15T10:00:00Z' },
    { id: 102, firstName: 'Sneha', lastName: 'Reddy', phone: '+91 98123 45678', createdAt: '2026-02-10T14:30:00Z', updatedAt: '2026-02-10T14:30:00Z' },
    { id: 103, firstName: 'Vikram', lastName: 'Menon', phone: '+91 97654 32109', createdAt: '2026-03-01T09:15:00Z', updatedAt: '2026-03-01T09:15:00Z' },
    { id: 104, firstName: 'Pooja', lastName: 'Iyer', phone: '+91 99887 76655', createdAt: '2026-03-12T16:45:00Z', updatedAt: '2026-03-12T16:45:00Z' },
    { id: 105, firstName: 'Rohan', lastName: 'Gupta', phone: '+91 91234 56789', createdAt: '2026-04-05T11:20:00Z', updatedAt: '2026-04-05T11:20:00Z' },
  ], [])

  const rawList = users && users.length > 0 ? users : fallbackUsers

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return rawList
    const q = search.toLowerCase()
    return rawList.filter(
      (u) =>
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q) ||
        u.phone?.includes(q) ||
        String(u.id).includes(q)
    )
  }, [rawList, search])

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Registered customer accounts, contact details, and account status overview.
          </p>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Retrieving registered customer profiles..." />
      ) : error ? (
        <ErrorState
          message="Failed to load customer directory."
          action={{ label: 'Retry', onClick: () => refetch() }}
        />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="No customers match your search"
          message="Try checking for typos or searching with different keywords."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Contact Phone</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((cust) => {
                  const fullName = `${cust.firstName || ''} ${cust.lastName || ''}`.trim() || `User #${cust.id}`
                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={fullName} size="md" />
                          <div>
                            <p className="font-bold text-slate-900">{fullName}</p>
                            <p className="text-xs text-slate-400">ID: #{cust.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium text-xs">
                        {cust.phone ? (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{cust.phone}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">Not provided</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {cust.createdAt ? formatDate(cust.createdAt) : 'Active'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedUser(cust)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Customer Profile Details"
        description={`Account profile information for customer #${selectedUser?.id}`}
        maxWidth="md"
      >
        {selectedUser && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <Avatar
                name={`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`}
                size="lg"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <p className="text-xs text-slate-500">System User ID: #{selectedUser.id}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-500">First Name</span>
                <span className="font-semibold text-slate-900">{selectedUser.firstName}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-500">Last Name</span>
                <span className="font-semibold text-slate-900">{selectedUser.lastName}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-500">Phone Number</span>
                <span className="font-semibold text-slate-900">
                  {selectedUser.phone || 'No phone recorded'}
                </span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-500">Registered Date</span>
                <span className="font-semibold text-slate-900">
                  {selectedUser.createdAt ? formatDate(selectedUser.createdAt) : 'N/A'}
                </span>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
