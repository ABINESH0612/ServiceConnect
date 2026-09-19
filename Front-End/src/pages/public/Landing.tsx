import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Search, MapPin, CalendarCheck, CheckCircle2, Shield, Star,
  ArrowRight, Wrench, Zap, Droplet, Wind, Sparkles, Paintbrush,
  Users, ChevronRight, Award, Clock
} from 'lucide-react'
import { providerDiscoveryApi } from '@/api/provider'
import { catalogApi } from '@/api/catalog'
import { StarRating } from '@/components/shared/StarRating'
import { Avatar } from '@/components/shared/Avatar'
import { formatPrice } from '@/utils/formatters'

const POPULAR_CATEGORIES = [
  { id: 'electrical', name: 'Electrical', icon: Zap, count: '45+ Pros', color: 'from-amber-500/10 to-orange-500/10 text-amber-600' },
  { id: 'plumbing', name: 'Plumbing', icon: Droplet, count: '60+ Pros', color: 'from-blue-500/10 to-cyan-500/10 text-blue-600' },
  { id: 'hvac', name: 'HVAC & AC', icon: Wind, count: '30+ Pros', color: 'from-sky-500/10 to-indigo-500/10 text-sky-600' },
  { id: 'cleaning', name: 'Cleaning', icon: Sparkles, count: '80+ Pros', color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600' },
  { id: 'painting', name: 'Painting', icon: Paintbrush, count: '25+ Pros', color: 'from-purple-500/10 to-pink-500/10 text-purple-600' },
  { id: 'repairs', name: 'Home Repairs', icon: Wrench, count: '50+ Pros', color: 'from-rose-500/10 to-red-500/10 text-rose-600' },
]

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'Homeowner, Indiranagar',
    content: 'Found a certified electrician in less than 10 minutes. He arrived on time, fixed our tripping circuit breaker, and the price was completely transparent.',
    rating: 5,
    service: 'Electrical Repair',
  },
  {
    name: 'Rahul Varma',
    role: 'Apartment Owner, Koramangala',
    content: 'The booking process was effortless. Having verified reviews and direct upfront pricing saved me hours of phone calls.',
    rating: 5,
    service: 'AC Servicing',
  },
  {
    name: 'Anita Desai',
    role: 'Resident, Whitefield',
    content: 'Deep cleaning service was exceptional. Professional team, eco-friendly supplies, and the payment through the app gave complete peace of mind.',
    rating: 5,
    service: 'Home Deep Cleaning',
  },
]

export default function Landing() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [userType, setUserType] = useState<'customer' | 'provider'>('customer')
  const navigate = useNavigate()

  // Fetch real approved providers for featured section
  const { data: providersData } = useQuery({
    queryKey: ['providers', 'landing-featured'],
    queryFn: () => providerDiscoveryApi.getAll({ size: 4, status: 'APPROVED' }),
    select: (res) => res.data?.content ?? [],
  })

  // Fetch real catalog services for popular services section
  const { data: servicesData } = useQuery({
    queryKey: ['catalog', 'landing-popular'],
    queryFn: () => catalogApi.search({ size: 6 }),
    select: (res) => res.data?.content ?? [],
  })

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (selectedCategory) params.set('category', selectedCategory)
    navigate(`/providers?${params.toString()}`)
  }

  // Fallback demo providers if backend has no approved providers yet
  const displayProviders = providersData && providersData.length > 0 ? providersData : [
    { id: 1, businessName: 'Apex Electrical Solutions', city: 'Bangalore', state: 'Karnataka', description: 'Certified Master Electricians for residential & commercial upgrades.', status: 'APPROVED' },
    { id: 2, businessName: 'AquaFlow Plumbing Experts', city: 'Bangalore', state: 'Karnataka', description: 'Emergency leak detection, pipe fitting, and bathroom installation.', status: 'APPROVED' },
    { id: 3, businessName: 'CoolBreeze HVAC Systems', city: 'Bangalore', state: 'Karnataka', description: 'Comprehensive AC installation, deep coil cleaning, and annual maintenance.', status: 'APPROVED' },
    { id: 4, businessName: 'Pristine Home Cleaning', city: 'Bangalore', state: 'Karnataka', description: 'Hospital-grade sanitization, kitchen deep clean, and sofa shampooing.', status: 'APPROVED' },
  ]

  // Fallback demo services if backend catalog is empty
  const displayServices = servicesData && servicesData.length > 0 ? servicesData : [
    { id: 1, providerId: 1, name: 'Complete Home Electrical Inspection', category: 'Electrical', price: 799, durationMinutes: 60, description: 'Comprehensive safety check of all wiring, MCBs, earthing, and appliances.' },
    { id: 2, providerId: 2, name: 'Emergency Plumbing & Leak Fix', category: 'Plumbing', price: 499, durationMinutes: 45, description: 'Quick on-site fix for pipe leaks, tap washers, and drain clogs.' },
    { id: 3, providerId: 3, name: 'Split AC Deep Cleaning & Gas Check', category: 'HVAC', price: 1299, durationMinutes: 90, description: 'Filter wash, blower sanitization, coolant pressure check, and performance test.' },
    { id: 4, providerId: 4, name: 'Full House Deep Cleaning', category: 'Cleaning', price: 2499, durationMinutes: 180, description: 'Thorough cleaning of floors, windows, tiles, bathroom, and kitchen surfaces.' },
    { id: 5, providerId: 1, name: 'Ceiling Fan & Chandelier Installation', category: 'Electrical', price: 349, durationMinutes: 30, description: 'Secure mounting, wiring, and balance testing for all ceiling fixtures.' },
    { id: 6, providerId: 2, name: 'Water Purifier Installation & Service', category: 'Plumbing', price: 599, durationMinutes: 45, description: 'Inlet/outlet valve setup, filter flushing, and TDS calibration.' },
  ]

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* ============================================================ */}
      {/* 1. HERO SECTION                                              */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50/50 pt-12 pb-20 border-b border-slate-200/60">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="page-container relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100/80 text-blue-700 text-xs font-semibold mb-6 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            Verified & Background-Checked Local Professionals
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Find trusted professionals <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              near you, right now.
            </span>
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Connect with top-rated electricians, plumbers, cleaners, and technicians. Real-time availability, upfront pricing, and guaranteed service satisfaction.
          </p>

          {/* Search Card */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 sm:mt-10 p-2 sm:p-2.5 bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-200/80 max-w-3xl mx-auto flex flex-col sm:flex-row items-stretch gap-2"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="What service do you need? (e.g., AC repair, wiring)"
                className="w-full pl-11 pr-4 py-3.5 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
              />
            </div>

            <div className="h-px sm:h-auto sm:w-px bg-slate-200" />

            <div className="relative min-w-[170px] flex items-center">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-3.5 px-3.5 text-sm sm:text-base text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                aria-label="Select Category"
              >
                <option value="">All Categories</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="HVAC">HVAC & AC</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Painting">Painting</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-xl text-sm sm:text-base transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <span>Search</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Category Chips */}
          <div className="mt-5 flex items-center justify-center flex-wrap gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-700">Popular:</span>
            {['Electrician', 'Plumber', 'AC Servicing', 'Deep Cleaning', 'Painting'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchTerm(tag)
                  navigate(`/providers?search=${encodeURIComponent(tag)}`)
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100/80 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Social Proof Strip */}
          <div className="mt-12 pt-8 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">5,000+</p>
              <p className="text-xs text-slate-500 mt-0.5">Verified Pros</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">45,000+</p>
              <p className="text-xs text-slate-500 mt-0.5">Jobs Completed</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">4.9 / 5</p>
              <p className="text-xs text-slate-500 mt-0.5">Average Rating</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">100%</p>
              <p className="text-xs text-slate-500 mt-0.5">Satisfaction Guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. POPULAR SERVICE CATEGORIES                                */}
      {/* ============================================================ */}
      <section className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Explore Popular Categories
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-1">
              Find licensed specialists for every home and office requirement.
            </p>
          </div>
          <Link
            to="/services"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group"
          >
            <span>All Services</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {POPULAR_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/providers?category=${encodeURIComponent(cat.name)}`}
              className="group bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-900/5 transition-all flex flex-col items-center text-center"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <cat.icon className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">{cat.count}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. POPULAR SERVICES                                          */}
      {/* ============================================================ */}
      <section className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Most Booked Services
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-1">
              Transparent upfront pricing with zero hidden charges.
            </p>
          </div>
          <Link
            to="/services"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group"
          >
            <span>Browse Full Catalog</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayServices.map((svc) => (
            <div
              key={svc.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                    {svc.category}
                  </span>
                  {svc.durationMinutes && (
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      ~{svc.durationMinutes} min
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 line-clamp-1">{svc.name}</h3>
                {svc.description && (
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {svc.description}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Starting from</span>
                  <span className="text-lg font-extrabold text-slate-900">
                    {formatPrice(svc.price)}
                  </span>
                </div>
                <Link
                  to={`/customer/providers/${svc.providerId}`}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  Book Service
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. FEATURED PROVIDERS                                        */}
      {/* ============================================================ */}
      <section className="bg-slate-50 py-16 border-y border-slate-200/60">
        <div className="page-container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
                <Award className="w-4 h-4" /> Top Verified Talent
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Featured Service Providers
              </h2>
              <p className="text-sm sm:text-base text-slate-500 mt-1">
                Experienced professionals with verified credentials and top customer ratings.
              </p>
            </div>
            <Link
              to="/providers"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group"
            >
              <span>View All Providers</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProviders.map((pro) => (
              <div
                key={pro.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:shadow-xl hover:shadow-slate-900/5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <Avatar name={pro.businessName} size="lg" status="online" />
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">{pro.businessName}</h3>
                  {pro.city && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {pro.city}{pro.state ? `, ${pro.state}` : ''}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    <StarRating value={5} size="sm" />
                    <span className="text-xs font-bold text-slate-700">4.9</span>
                    <span className="text-xs text-slate-400">(40+ reviews)</span>
                  </div>

                  {pro.description && (
                    <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                      {pro.description}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                  <Link
                    to={`/providers/${pro.id}`}
                    className="flex-1 py-2 text-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                  >
                    View Profile
                  </Link>
                  <Link
                    to={`/customer/providers/${pro.id}`}
                    className="flex-1 py-2 text-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm"
                  >
                    Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. HOW IT WORKS (Switchable)                                 */}
      {/* ============================================================ */}
      <section className="page-container text-center">
        <div className="max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How ServiceConnect Works
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2">
            Simple, transparent, and built for both service seekers and skilled professionals.
          </p>

          <div className="mt-6 inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setUserType('customer')}
              className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                userType === 'customer'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              For Customers
            </button>
            <button
              onClick={() => setUserType('provider')}
              className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                userType === 'provider'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              For Service Providers
            </button>
          </div>
        </div>

        {userType === 'customer' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-sm relative">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-bold text-lg flex items-center justify-center mb-5">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Search & Compare</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Browse verified local professionals by category, ratings, live distance, and transparent upfront pricing.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-sm relative">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-bold text-lg flex items-center justify-center mb-5">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Instant Booking</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Select your preferred service slot that matches the provider's real-time working schedule.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-sm relative">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-bold text-lg flex items-center justify-center mb-5">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Job Done & Review</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Service delivered at your doorstep. Pay securely online through Razorpay and rate your pro.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-sm relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-lg flex items-center justify-center mb-5">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Create Your Business Profile</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Register, showcase your service catalog, define working hours, and upload work portfolio photos.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-sm relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-lg flex items-center justify-center mb-5">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Receive Direct Booking Requests</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Accept or reject client appointments in your area with zero middleman commissions.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-sm relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-lg flex items-center justify-center mb-5">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Grow Your Earnings</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Receive on-time payments, build verified reviews, and scale your business effortlessly.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* 6. TESTIMONIALS                                              */}
      {/* ============================================================ */}
      <section className="page-container">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Loved by Thousands of Customers
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2">
            Read real experiences from people who book through ServiceConnect every day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 italic leading-relaxed">
                  "{t.content}"
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
                <span className="text-[11px] font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600">
                  {t.service}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. CTA BANNER                                                */}
      {/* ============================================================ */}
      <section className="page-container">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-8 sm:p-14 text-center shadow-xl">
          <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to experience hassle-free home services?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Book a verified professional in under 2 minutes or join our rapidly growing provider network.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/customer/register"
                className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-md"
              >
                Book a Service Now
              </Link>
              <Link
                to="/provider/register"
                className="w-full sm:w-auto bg-blue-500/30 hover:bg-blue-500/40 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all"
              >
                Become a Service Provider
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
