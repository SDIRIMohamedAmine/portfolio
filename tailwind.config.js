/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: {
          primary:    'var(--color-bg-primary)',
          secondary:  'var(--color-bg-secondary)',
          tertiary:   'var(--color-bg-tertiary)',
          card:       'var(--color-bg-card)',
        },
        accent: {
          gold:          'var(--color-accent)',
          'gold-dim':    'var(--color-accent-dim)',
          'gold-bright': 'var(--color-accent-bright)',
          teal:          '#4ecdc4',
          purple:        '#8b5cf6',
          red:           '#ef4444',
          green:         '#22c55e',
        },
        text: {
          primary:   'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted:     'var(--color-text-muted)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          bright:  'var(--color-border-bright)',
        },
        admin: {
          sidebar: '#030d06',
          card:    'var(--color-bg-card)',
          input:   'var(--color-bg-secondary)',
          hover:   'var(--color-bg-tertiary)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'float':      'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'spin-slow':  'spin 20s linear infinite',
        'marquee':    'marquee 30s linear infinite',
        'blink':      'blink 1s step-end infinite',
      },
      keyframes: {
        float:   { '0%,100%': { transform:'translateY(0px)' }, '50%': { transform:'translateY(-18px)' } },
        marquee: { '0%': { transform:'translateX(0%)' }, '100%': { transform:'translateX(-50%)' } },
        blink:   { '0%,100%': { opacity:'1' }, '50%': { opacity:'0' } },
      },
      boxShadow: {
        'gold':       '0 0 30px rgba(var(--shadow-accent, 232 176 75) / 0.12)',
        'gold-lg':    '0 0 60px rgba(var(--shadow-accent, 232 176 75) / 0.22)',
        'card':       '0 4px 40px rgba(0,0,0,0.7)',
        'card-hover': '0 8px 60px rgba(0,0,0,0.85)',
      },
    },
  },
  plugins: [],
};
