import { Wrench } from 'lucide-react'

export default function Maintenance() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 text-center page-container">
      <Wrench className="w-16 h-16 text-[#F59E0B] mb-4 animate-pulse" aria-hidden="true" />
      <h1 className="text-2xl font-bold text-[#0F172A] mb-2">We'll be back soon</h1>
      <p className="text-[#64748B] max-w-md mb-2">
        ServiceConnect is currently undergoing scheduled maintenance to improve your experience.
      </p>
      <p className="text-sm text-[#94A3B8] max-w-sm">
        We expect to be back shortly. Thank you for your patience.
      </p>
    </div>
  )
}
