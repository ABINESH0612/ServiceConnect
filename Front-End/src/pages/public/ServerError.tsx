import { ServerCrash, RotateCcw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ServerError() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4" role="alert">
      {/* Giant 500 */}
      <div className="relative mb-6 select-none">
        <span
          className="text-[140px] sm:text-[180px] font-black leading-none tracking-tighter"
          style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          500
        </span>
        {/* Floating icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center border border-slate-100 -mt-4">
            <ServerCrash className="w-8 h-8 text-amber-500" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mb-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
          Something went wrong
        </h1>
        <p className="text-slate-500 leading-relaxed">
          Our servers are experiencing difficulties. Our team has been automatically notified and we're working on a fix. Please try again in a few minutes.
        </p>
      </div>

      {/* Status info */}
      <div className="w-full max-w-sm bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-8 text-left">
        <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">System status</p>
        <div className="space-y-2">
          {[
            { service: 'API Gateway', ok: false },
            { service: 'Database', ok: true },
            { service: 'Auth Service', ok: true },
          ].map(({ service, ok }) => (
            <div key={service} className="flex items-center justify-between text-xs">
              <span className="text-amber-700">{service}</span>
              <span className={`inline-flex items-center gap-1 font-medium ${ok ? 'text-green-600' : 'text-red-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                {ok ? 'Operational' : 'Degraded'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-full px-6 py-3 text-sm transition-all shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-full px-6 py-3 text-sm transition-all"
        >
          <Home className="w-4 h-4" />
          Go Home
        </Link>
      </div>
    </div>
  )
}
