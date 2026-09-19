import { Wrench, Clock, Zap } from 'lucide-react'

export default function Maintenance() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      {/* Icon with animated effect */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-amber-50 scale-150 opacity-50" />
        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-100 rotate-12">
          <Wrench className="w-12 h-12 text-white -rotate-12" strokeWidth={1.5} />
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-3 -right-4 w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
          <Zap className="w-4 h-4 text-blue-400" />
        </div>
        <div className="absolute -bottom-2 -left-5 w-7 h-7 rounded-xl bg-purple-100 flex items-center justify-center">
          <Clock className="w-3.5 h-3.5 text-purple-400" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mb-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
          We'll be back soon
        </h1>
        <p className="text-slate-500 leading-relaxed mb-4">
          ServiceConnect is undergoing scheduled maintenance to improve your experience. We're working hard to get everything back up and running.
        </p>
        <p className="text-sm text-slate-400">
          Estimated downtime: <span className="font-semibold text-slate-600">~30 minutes</span>
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm mb-10">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>Maintenance progress</span>
          <span className="text-amber-600 font-medium">~75%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
            style={{ width: '75%' }}
          />
        </div>
      </div>

      {/* What we're doing */}
      <div className="w-full max-w-sm bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          What we're working on
        </p>
        <div className="space-y-2.5">
          {[
            { label: 'Database optimization', done: true },
            { label: 'Security patches', done: true },
            { label: 'Performance improvements', done: true },
            { label: 'Final system checks', done: false },
          ].map(({ label, done }) => (
            <div key={label} className="flex items-center gap-2.5 text-sm">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-100' : 'bg-amber-100'}`}>
                {done ? (
                  <svg className="w-2.5 h-2.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                )}
              </div>
              <span className={done ? 'text-slate-500 line-through' : 'text-slate-800 font-medium'}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
