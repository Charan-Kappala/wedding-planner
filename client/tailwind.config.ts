import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        blush: {
          50: '#fdf2f6',
          100: '#fce7f0',
          200: '#fad0e4',
          300: '#E8A0BF', // primary
          400: '#e07aab',
          500: '#d4558d',
          600: '#bc3a74',
          700: '#9d2c5d',
          800: '#83274e',
          900: '#6d2343',
        },
        champagne: {
          300: '#e8d48f',
          400: '#D4AF37', // accent
          500: '#b8960d',
          600: '#9a7d0a',
        },
        cream: '#FAF7F2',
        charcoal: '#2C2C2C',
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['Lato', 'sans-serif'],
      },
      boxShadow: {
        warm: '0 4px 16px 0 rgba(212, 175, 55, 0.12), 0 1px 4px 0 rgba(44, 44, 44, 0.08)',
        'warm-lg': '0 8px 32px 0 rgba(212, 175, 55, 0.16), 0 2px 8px 0 rgba(44, 44, 44, 0.10)',
      },
    },
  },
  plugins: [],
} satisfies Config;
