import { Link } from 'react-router-dom'
import { Users, Headphones, BookOpen, ClipboardList, ShieldCheck } from 'lucide-react'

export default function AdminDashboard() {
  const cards = [
    { to: '/admin/providers', icon: Users, label: 'Providers', desc: 'Manage provider approvals and accounts', color: 'bg-[#EFF6FF]', iconColor: 'text-[#2563EB]' },
    { to: '/admin/tickets', icon: Headphones, label: 'Support Tickets', desc: 'View and manage customer tickets', color: 'bg-[#FEF3C7]', iconColor: 'text-[#F59E0B]' },
    { to: '/admin/help-center', icon: BookOpen, label: 'Help Center', desc: 'Create and edit help articles', color: 'bg-[#DCFCE7]', iconColor: 'text-[#16A34A]' },
    { to: '/admin/audit-logs', icon: ClipboardList, label: 'Audit Logs', desc: 'View system activity logs', color: 'bg-[#EDE9FE]', iconColor: 'text-[#8B5CF6]' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-[#2563EB]" />
        <h1 className="text-2xl font-bold text-[#0F172A]">Admin Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="sc-card-hover p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-[8px] ${c.color} flex items-center justify-center flex-shrink-0`}>
              <c.icon className={`w-6 h-6 ${c.iconColor}`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">{c.label}</h3>
              <p className="text-xs text-[#64748B]">{c.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
