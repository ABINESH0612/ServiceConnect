/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ServiceConnect Design System — extracted from Figma
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        accent: {
          green: '#16A34A',
          'green-light': '#DCFCE7',
          amber: '#F59E0B',
          'amber-light': '#FEF3C7',
          red: '#EF4444',
          'red-light': '#FEE2E2',
          purple: '#8B5CF6',
          'purple-light': '#EDE9FE',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F1F5F9',
          tertiary: '#F8FAFC',
        },
        'text-primary': '#0F172A',
        'text-secondary': '#64748B',
        'text-tertiary': '#94A3B8',
        border: {
          DEFAULT: '#E2E8F0',
          light: '#F1F5F9',
          strong: '#CBD5E1',
        },
        status: {
          pending: '#F59E0B',
          'pending-bg': '#FEF3C7',
          accepted: '#16A34A',
          'accepted-bg': '#DCFCE7',
          rejected: '#EF4444',
          'rejected-bg': '#FEE2E2',
          completed: '#8B5CF6',
          'completed-bg': '#EDE9FE',
          cancelled: '#94A3B8',
          'cancelled-bg': '#F1F5F9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        pill: '9999px',
        input: '8px',
        lg: '12px',
        md: '8px',
        sm: '6px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.15)',
        popup: '0 4px 20px rgba(0,0,0,0.18)',
        dropdown: '0 4px 12px rgba(0,0,0,0.12)',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-dot': 'pulseDot 2s infinite',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
