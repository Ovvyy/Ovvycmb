import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#4F8EF7',
          600: '#3b82f6',
          700: '#2563eb',
          900: '#1e3a8a',
        },
        surface: {
          950: '#040812',
          900: '#0A0F1A',
          800: '#0f1629',
          700: '#1a2440',
          600: '#243058',
          500: '#2e3d70',
        },
        accent: {
          gold: '#FFD700',
          retro: '#C4872F',
          wakfu: '#00C8C8',
          danger: '#EF4444',
          success: '#22C55E',
          warning: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-in': 'slideIn 0.2s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(79, 142, 247, 0.4)' },
          '100%': { boxShadow: '0 0 20px rgba(79, 142, 247, 0.8), 0 0 40px rgba(79, 142, 247, 0.3)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
} satisfies Config
