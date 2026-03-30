import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        wow: {
          bg:        '#0d0d0f',
          surface:   '#151518',
          card:      '#1a1a1f',
          border:    '#2a2a32',
          borderHover: '#3d3d4a',
          gold:      '#f0b429',
          goldLight: '#ffd700',
          goldDark:  '#c8960c',
          blue:      '#00aaff',
          green:     '#00e676',
          red:       '#ff4757',
          purple:    '#b44be1',
          orange:    '#ff7c1a',
          teal:      '#00d4aa',
        },
      },
      fontFamily: {
        wow: ['Cinzel', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #f0b429, #ffd700, #c8960c)',
        'dark-gradient': 'linear-gradient(180deg, #151518 0%, #0d0d0f 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(240,180,41,0.05) 0%, transparent 60%)',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(240,180,41,0.3)',
        'gold-sm': '0 0 8px rgba(240,180,41,0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'inner-gold': 'inset 0 1px 0 rgba(240,180,41,0.15)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(240,180,41,0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(240,180,41,0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
