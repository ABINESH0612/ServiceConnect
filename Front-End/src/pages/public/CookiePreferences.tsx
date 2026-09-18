import { useState, useEffect, useCallback } from 'react'
import { Cookie, Shield, BarChart3, Megaphone, Save, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

// ============================================================
// CookiePreferences — Functional cookie consent management
//
// Stores preferences in localStorage under 'sc-cookie-prefs'.
// Essential cookies are always enabled and cannot be toggled off.
// ============================================================

interface CookiePrefs {
  essential: boolean // always true
  analytics: boolean
  marketing: boolean
}

const STORAGE_KEY = 'sc-cookie-prefs'

const DEFAULT_PREFS: CookiePrefs = {
  essential: true,
  analytics: false,
  marketing: false,
}

function loadPrefs(): CookiePrefs {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<CookiePrefs>
      return {
        essential: true, // always on
        analytics: parsed.analytics ?? false,
        marketing: parsed.marketing ?? false,
      }
    }
  } catch {
    // Ignore corrupted data
  }
  return DEFAULT_PREFS
}

interface ToggleSwitchProps {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label: string
}

function ToggleSwitch({ id, checked, onChange, disabled = false, label }: ToggleSwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2
        ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
        ${checked ? 'bg-[#16A34A]' : 'bg-[#CBD5E1]'}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
          transition duration-200 ease-in-out
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  )
}

export default function CookiePreferences() {
  const [prefs, setPrefs] = useState<CookiePrefs>(DEFAULT_PREFS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setPrefs(loadPrefs())
  }, [])

  const handleSave = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }, [prefs])

  const categories = [
    {
      key: 'essential' as const,
      icon: Shield,
      title: 'Essential Cookies',
      description:
        'Required for the website to function properly. These cookies enable core functionality such as security, account authentication, and session management. They cannot be disabled.',
      alwaysOn: true,
    },
    {
      key: 'analytics' as const,
      icon: BarChart3,
      title: 'Analytics Cookies',
      description:
        'Help us understand how visitors interact with ServiceConnect. We use this data to improve our platform, features, and user experience. No personally identifiable information is collected.',
      alwaysOn: false,
    },
    {
      key: 'marketing' as const,
      icon: Megaphone,
      title: 'Marketing Cookies',
      description:
        'Used to deliver relevant advertisements and track the effectiveness of our marketing campaigns. These cookies may be set by third-party advertising partners.',
      alwaysOn: false,
    },
  ]

  return (
    <div className="page-container py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-[12px] bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
          <Cookie className="w-6 h-6 text-[#2563EB]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Cookie Preferences</h1>
          <p className="text-[#64748B] mt-1">
            Manage how ServiceConnect uses cookies on your browser. Your preferences are saved
            locally and can be changed at any time.
          </p>
        </div>
      </div>

      {/* Cookie Categories */}
      <div className="space-y-4 mb-8">
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <div key={cat.key} className="sc-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <Icon className="w-5 h-5 text-[#2563EB] mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#0F172A]">{cat.title}</h3>
                      {cat.alwaysOn && (
                        <span className="text-xs font-medium text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                          Always On
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#64748B] mt-1">{cat.description}</p>
                  </div>
                </div>
                <ToggleSwitch
                  id={`cookie-${cat.key}`}
                  checked={prefs[cat.key]}
                  onChange={(checked) =>
                    setPrefs((prev) => ({ ...prev, [cat.key]: checked }))
                  }
                  disabled={cat.alwaysOn}
                  label={`Toggle ${cat.title}`}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link to="/cookies" className="text-sm text-[#2563EB] hover:underline">
          View Cookie Policy
        </Link>
        <button
          onClick={handleSave}
          className="sc-btn-primary inline-flex items-center gap-2"
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Preferences Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  )
}
