import { SearchX, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 text-center page-container">
      <SearchX className="w-16 h-16 text-[#CBD5E1] mb-4" aria-hidden="true" />
      <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Page not found</h1>
      <p className="text-[#64748B] max-w-md mb-6">
        The page you're looking for doesn't exist or has been moved. Check the URL or head back to the homepage.
      </p>
      <Link to="/" className="sc-btn-primary inline-flex items-center gap-2">
        <Home className="w-4 h-4" />
        Go Home
      </Link>
    </div>
  )
}
