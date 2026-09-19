import { ShieldX, Home, Headphones, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function Forbidden() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      {/* Giant 403 */}
      <div className="relative mb-6 select-none">
        <span
          className="text-[140px] sm:text-[180px] font-black leading-none tracking-tighter"
          style={{
            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 50%, #fde8d0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          403
        </span>
        {/* Floating icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center border border-slate-100 -mt-4">
            <ShieldX className="w-8 h-8 text-rose-400" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mb-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
          Access denied
        </h1>
        <p className="text-slate-500 leading-relaxed">
          You don't have permission to view this page. This might be because the page requires a different account role or you need to log in first.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-full px-6 py-3 text-sm transition-all shadow-sm"
        >
          <Home className="w-4 h-4" />
          Go Home
        </Link>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-full px-6 py-3 text-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
        <Link
          to="/customer/support"
          className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-full px-6 py-3 text-sm transition-all"
        >
          <Headphones className="w-4 h-4" />
          Contact Support
        </Link>
      </div>
    </div>
  )
}
