import { useLocation, Link } from 'react-router-dom'
import { FileText, ChevronRight, AlertTriangle } from 'lucide-react'

// ============================================================
// LegalPage — Generic legal/policy page template
//
// Reads the current route path to determine which legal page to show.
// All 14 slugs from the router are handled. Displays a DRAFT banner
// since actual legal content requires legal review.
// ============================================================

const LEGAL_PAGES: Record<string, { title: string; description: string }> = {
  privacy: {
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your personal information.',
  },
  terms: {
    title: 'Terms of Service',
    description: 'The terms and conditions governing your use of ServiceConnect.',
  },
  cookies: {
    title: 'Cookie Policy',
    description: 'How ServiceConnect uses cookies and similar tracking technologies.',
  },
  refunds: {
    title: 'Refund Policy',
    description: 'Our refund process and eligibility criteria for service bookings.',
  },
  cancellation: {
    title: 'Cancellation Policy',
    description: 'How to cancel bookings and applicable cancellation fees.',
  },
  shipping: {
    title: 'Shipping & Delivery Policy',
    description: 'Information about service delivery timelines and logistics.',
  },
  returns: {
    title: 'Returns Policy',
    description: 'Conditions under which service credits or refunds may be issued.',
  },
  disclaimer: {
    title: 'Disclaimer',
    description: 'Important disclaimers regarding our platform and services.',
  },
  accessibility: {
    title: 'Accessibility Statement',
    description: 'Our commitment to making ServiceConnect accessible to everyone.',
  },
  dpa: {
    title: 'Data Processing Agreement',
    description: 'Terms governing data processing activities between ServiceConnect and its users.',
  },
  'acceptable-use': {
    title: 'Acceptable Use Policy',
    description: 'Guidelines for appropriate use of the ServiceConnect platform.',
  },
  security: {
    title: 'Security Policy',
    description: 'How ServiceConnect protects your data and platform security.',
  },
  'responsible-disclosure': {
    title: 'Responsible Disclosure Policy',
    description: 'How to report security vulnerabilities to ServiceConnect.',
  },
  'community-guidelines': {
    title: 'Community Guidelines',
    description: 'Standards of conduct for ServiceConnect users and providers.',
  },
}

export default function LegalPage() {
  const location = useLocation()
  const slug = location.pathname.replace(/^\//, '')
  const page = LEGAL_PAGES[slug]

  if (!page) {
    return (
      <div className="page-container py-12 text-center">
        <p className="text-[#64748B]">Legal page not found.</p>
        <Link to="/" className="sc-btn-primary mt-4 inline-flex">
          Go Home
        </Link>
      </div>
    )
  }

  return (
    <div className="page-container py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-[#64748B] mb-6" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-[#2563EB] transition-colors">
          ServiceConnect
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#0F172A] font-medium">{page.title}</span>
      </nav>

      {/* DRAFT Banner */}
      <div
        className="flex items-center gap-3 bg-[#FEF3C7] border border-[#F59E0B] rounded-[8px] px-4 py-3 mb-8"
        role="alert"
      >
        <AlertTriangle className="w-5 h-5 text-[#F59E0B] flex-shrink-0" />
        <p className="text-sm font-medium text-[#92400E]">
          DRAFT — PENDING LEGAL REVIEW. This document is a placeholder and does not constitute legal advice.
        </p>
      </div>

      {/* Content Card */}
      <div className="sc-card p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-[12px] bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-[#2563EB]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">{page.title}</h1>
            <p className="text-[#64748B] mt-1">{page.description}</p>
          </div>
        </div>

        <hr className="border-[#E2E8F0] my-6" />

        {/* Placeholder Content */}
        <div className="prose prose-sm max-w-none text-[#0F172A]">
          <p className="text-[#64748B] leading-relaxed">
            This is a placeholder for the <strong>{page.title}</strong>. The full legal document
            is currently being drafted and reviewed by our legal team.
          </p>

          <h2 className="text-lg font-semibold text-[#0F172A] mt-6 mb-3">1. Introduction</h2>
          <p className="text-[#64748B] leading-relaxed">
            ServiceConnect (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the ServiceConnect platform,
            a home-services marketplace connecting customers with trusted local service providers.
            This {page.title} outlines the terms governing your use of our services.
          </p>

          <h2 className="text-lg font-semibold text-[#0F172A] mt-6 mb-3">2. Scope</h2>
          <p className="text-[#64748B] leading-relaxed">
            This policy applies to all users of the ServiceConnect platform, including customers,
            service providers, and administrators. By using our platform, you agree to the terms
            outlined in this document.
          </p>

          <h2 className="text-lg font-semibold text-[#0F172A] mt-6 mb-3">3. Contact Us</h2>
          <p className="text-[#64748B] leading-relaxed">
            If you have any questions about this {page.title}, please contact us through our{' '}
            <Link to="/help" className="text-[#2563EB] hover:underline">
              Help Center
            </Link>{' '}
            or email us at legal@serviceconnect.com.
          </p>
        </div>

        <hr className="border-[#E2E8F0] my-6" />

        <p className="text-xs text-[#94A3B8]">
          Last updated: September 2026. This document is subject to change without notice.
        </p>
      </div>
    </div>
  )
}
