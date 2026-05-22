/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#0A1628',
          800: '#0E2240',
          700: '#1A3456',
          500: '#1D6FA4',
          400: '#2E8BC0',
          300: '#5AB1D8',
          50:  '#E8F4FB',
        },
        status: {
          available:   '#16A34A',
          reserved:    '#2563EB',
          charging:    '#7C3AED',
          maintenance: '#EA580C',
          unavailable: '#6B7280',
          faulted:     '#DC2626',
          authFailed:  '#DC2626',
          authPending: '#D97706',
        },
        severity: {
          info:     '#3B82F6',
          warning:  '#F59E0B',
          critical: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'card':  '12px',
        'btn':   '8px',
        'input': '6px',
        'badge': '999px',
        'toast': '10px',
        'modal': '16px',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        badgePulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.7' },
        },
      },
      animation: {
        shimmer:    'shimmer 1.5s infinite linear',
        badgePulse: 'badgePulse 2s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}
