import { SearchX, Home, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      {/* Giant 404 */}
      <div className="relative mb-6 select-none">
        <span
          className="text-[140px] sm:text-[180px] font-black leading-none tracking-tighter"
          style={{
            background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #ede9fe 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </span>
        {/* Floating icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center border border-slate-100 -mt-4">
            <SearchX className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mb-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
          Page not found
        </h1>
        <p className="text-slate-500 leading-relaxed">
          The page you're looking for doesn't exist or may have been moved. 
          Check the URL or use the navigation below to find your way back.
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
      </div>

      {/* Quick links */}
      <div className="mt-10 pt-8 border-t border-slate-100 w-full max-w-md">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Popular destinations
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { to: '/services', label: 'Browse Services' },
            { to: '/providers', label: 'Find Providers' },
            { to: '/help', label: 'Help Center' },
            { to: '/customer/login', label: 'Customer Login' },
          ].map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
