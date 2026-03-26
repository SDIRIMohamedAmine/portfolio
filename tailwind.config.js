/** @type {import('tailwindcss').Config} */
export const content = ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"];
export const theme = {
  extend: {
    fontFamily: {
      display: ['Syne', 'sans-serif'],
      body: ['Outfit', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    colors: {
      bg: {
        primary: '#07070e',
        secondary: '#0e0e1a',
        tertiary: '#14141f',
        card: '#0f0f1c',
      },
      accent: {
        gold: '#e8b04b',
        'gold-dim': '#b8882e',
        'gold-bright': '#f5c96a',
        teal: '#4ecdc4',
        purple: '#8b5cf6',
        red: '#ef4444',
        green: '#22c55e',
      },
      text: {
        primary: '#f0eff8',
        secondary: '#a09db8',
        muted: '#5c5a72',
      },
      border: {
        DEFAULT: '#1e1d2e',
        bright: '#2e2c45',
      },
      admin: {
        sidebar: '#090912',
        card: '#0d0d1a',
        input: '#111120',
        hover: '#13132a',
      },
    },
    backgroundImage: {
      'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
    },
    animation: {
      'float': 'float 6s ease-in-out infinite',
      'pulse-slow': 'pulse 4s ease-in-out infinite',
      'spin-slow': 'spin 20s linear infinite',
      'marquee': 'marquee 30s linear infinite',
      'blink': 'blink 1s step-end infinite',
      'slide-in': 'slideIn 0.3s ease-out',
      'fade-up': 'fadeUp 0.4s ease-out',
    },
    keyframes: {
      float: {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-18px)' },
      },
      marquee: {
        '0%': { transform: 'translateX(0%)' },
        '100%': { transform: 'translateX(-50%)' },
      },
      blink: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0' },
      },
      slideIn: {
        '0%': { transform: 'translateX(100%)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' },
      },
      fadeUp: {
        '0%': { transform: 'translateY(16px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
    },
    boxShadow: {
      'gold': '0 0 30px rgba(232, 176, 75, 0.15)',
      'gold-lg': '0 0 60px rgba(232, 176, 75, 0.25)',
      'card': '0 4px 40px rgba(0, 0, 0, 0.6)',
      'card-hover': '0 8px 60px rgba(0, 0, 0, 0.8)',
    },
  },
};
export const plugins = [];
