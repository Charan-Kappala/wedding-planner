import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#fff8f0',
        surface: '#fff8f0',
        'surface-bright': '#fff8f0',
        'surface-dim': '#e5d9bf',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#fbf3e5',
        'surface-container': '#f6eddc',
        'surface-container-high': '#f1e7d4',
        'surface-container-highest': '#ede1cb',
        'on-surface': '#383222',
        'on-surface-variant': '#665e4d',
        primary: '#735c00',
        'on-primary': '#fff7ea',
        'primary-container': '#ffe088',
        'primary-fixed-dim': '#f8d056',
        secondary: '#5f5f5f',
        'on-secondary': '#fbf8f8',
        'secondary-container': '#e4e2e1',
        outline: '#827a67',
        'outline-variant': '#bbb19c',
        error: '#9e422c',
        'on-error': '#fff7f6',
        'on-background': '#383222',
        
        // Aliasing the old blush, champagne, cream, charcoal colors so existing components won't completely break,
        // but they will map to the new theme's palette smoothly.
        blush: {
          50: '#fbf3e5', // surface-container-low
          100: '#f6eddc', // surface-container
          200: '#f1e7d4', // surface-container-high
          300: '#735c00', // primary (was primary blush)
          400: '#655000', // primary_dim
          500: '#5c1202',
          600: '#742410',
          700: '#9e422c',
          800: '#fe8b70',
          900: '#fff7f6',
        },
        champagne: {
          300: '#ffe088',
          400: '#f8d056', // champagne accent -> gold gradient accent
          500: '#735c00',
          600: '#655000',
        },
        cream: '#fff8f0',
        charcoal: '#383222', // on-surface
      },
      fontFamily: {
        heading: ['"Newsreader"', 'Georgia', 'serif'],
        headline: ['"Newsreader"', 'Georgia', 'serif'],
        body: ['"Manrope"', 'sans-serif'],
        label: ['"Manrope"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        sm: '0.125rem',
        md: '0.25rem',
        lg: '0.25rem',
        xl: '0.5rem',
        '2xl': '0.75rem',
        full: '0.75rem',
      },
      boxShadow: {
        ambient: '0 8px 32px 0 rgba(56, 50, 34, 0.04)',
        warm: '0 8px 32px 0 rgba(56, 50, 34, 0.04)', // overriding old warm shadow to ambient
        'warm-lg': '0 24px 48px 0 rgba(56, 50, 34, 0.04)',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(45deg, #735c00, #f8d056)',
      }
    },
  },
  plugins: [],
} satisfies Config;
