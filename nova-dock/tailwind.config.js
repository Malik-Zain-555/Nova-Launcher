/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Segoe UI Variable Display"', '"Segoe UI"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"Cascadia Code"', '"Consolas"', 'monospace']
      },
      colors: {
        nova: {
          surface: 'rgba(18, 18, 28, var(--nova-alpha, 0.78))',
          surfaceLight: 'rgba(255, 255, 255, var(--nova-alpha, 0.82))',
          card: 'rgba(255, 255, 255, 0.05)',
          cardHover: 'rgba(255, 255, 255, 0.09)',
          border: 'rgba(255, 255, 255, 0.09)',
          borderLight: 'rgba(0, 0, 0, 0.08)',
          text: '#f4f4f8',
          textMuted: '#9494a8',
          textDim: '#656578'
        },
        accent: {
          violet: '#7c5cff',
          cyan: '#22d3ee',
          rose: '#fb7185',
          green: '#34d399',
          amber: '#fbbf24',
          blue: '#3b82f6'
        }
      },
      borderRadius: {
        'island': '28px',
        'island-compact': '22px',
        'sub-card': '16px'
      },
      boxShadow: {
        'mica': '0 20px 48px -12px rgba(0, 0, 0, 0.65), 0 0 1px 1px rgba(255, 255, 255, 0.12) inset',
        'pill': '0 8px 24px -4px rgba(0, 0, 0, 0.45), 0 0 1px 1px rgba(255, 255, 255, 0.15) inset'
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite'
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.82' }
        },
        shimmer: {
          'from': { backgroundPosition: '0 0' },
          'to': { backgroundPosition: '-200% 0' }
        }
      }
    },
  },
  plugins: [],
}
