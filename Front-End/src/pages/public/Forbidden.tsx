import { ShieldX, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Forbidden() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 text-center page-container">
      <ShieldX className="w-16 h-16 text-[#EF4444] mb-4" aria-hidden="true" />
      <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Access denied</h1>
      <p className="text-[#64748B] max-w-md mb-2">
        You don't have permission to view this page.
      </p>
      <p className="text-sm text-[#94A3B8] max-w-md mb-6">
        If you believe this is an error, please contact support or try logging in with a different account.
      </p>
      <Link to="/" className="sc-btn-primary inline-flex items-center gap-2">
        <Home className="w-4 h-4" />
        Go Home
      </Link>
    </div>
  )
}
