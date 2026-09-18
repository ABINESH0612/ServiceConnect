import { Link, Outlet } from 'react-router-dom'

/** Minimal layout for auth pages — centered card, no sidebar */
export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col">
      <header className="bg-white border-b border-[#E2E8F0]">
        <div className="page-container flex items-center h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2v20M2 12h20" /><circle cx="12" cy="12" r="2" fill="white" stroke="none" />
              </svg>
            </div>
            <span className="text-base font-semibold text-[#0F172A]">ServiceConnect</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
