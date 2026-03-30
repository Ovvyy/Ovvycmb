import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        wow: {
          // Deep Midnight backgrounds — Quel'Thalas night sky
          bg:          '#07090E',
          surface:     '#0D1117',
          card:        '#0F1623',
          cardHover:   '#141D2E',
          elevated:    '#192133',
          // Borders
          border:      '#1C2333',
          borderHover: '#2D3E57',
          borderGold:  'rgba(232,184,109,0.3)',
          // Gold — Sin'dorei architecture
          gold:        '#E8B86D',
          goldLight:   '#FFD880',
          goldDark:    '#B8862A',
          // Arcane — Blood Elf magic
          arcane:      '#7C3AED',
          arcaneLight: '#A78BFA',
          // Status
          green:       '#10B981',
          red:         '#EF4444',
          blue:        '#3B82F6',
          orange:      '#F59E0B',
          teal:        '#14B8A6',
          purple:      '#8B5CF6',
        },
      },
      fontFamily: {
        wow:  ['Cinzel', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'gold':       '0 0 24px rgba(232,184,109,0.22)',
        'gold-sm':    '0 0 10px rgba(232,184,109,0.16)',
        'gold-inner': 'inset 0 1px 0 rgba(232,184,109,0.1)',
        'arcane':     '0 0 20px rgba(124,58,237,0.28)',
        'card':       '0 4px 32px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'gold-gradient':   'linear-gradient(135deg, #B8862A, #FFD880, #E8B86D)',
        'arcane-gradient': 'linear-gradient(135deg, #4C1D95, #7C3AED)',
        'dark-gradient':   'linear-gradient(180deg, #0D1117 0%, #07090E 100%)',
        'card-gradient':   'linear-gradient(135deg, rgba(232,184,109,0.04) 0%, transparent 60%)',
      },
      animation: {
        'shimmer':    'shimmer 3s linear infinite',
        'pulse-gold': 'pulse-gold 2.5s ease-in-out infinite',
        'float':      'float 4s ease-in-out infinite',
        'glow':       'glow-pulse 2s ease-in-out infinite',
        'entrance':   'entrance 0.35s ease forwards',
        'spin-slow':  'spin 4s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(232,184,109,0.14)' },
          '50%':       { boxShadow: '0 0 22px rgba(232,184,109,0.38)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-6px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%':       { opacity: '1' },
        },
        entrance: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
