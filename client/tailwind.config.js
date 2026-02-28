/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['"Syne"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#baddfd',
          300: '#7ec1fc',
          400: '#3aa0f8',
          500: '#1082eb',
          600: '#0565c9',
          700: '#0550a3',
          800: '#094386',
          900: '#0d3a6f',
          950: '#091f40',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#0f1623',
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 4px 25px -5px rgba(0, 0, 0, 0.06)',
        'brand': '0 4px 24px -4px rgba(16, 130, 235, 0.35)',
        'brand-lg': '0 8px 40px -6px rgba(16, 130, 235, 0.45)',
        'inner-soft': 'inset 0 1px 3px rgba(0,0,0,0.06)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'sidebar-gradient': 'linear-gradient(180deg, #0d3a6f 0%, #0550a3 40%, #0565c9 100%)',
      },
      animation: {
        'counter': 'counter 1s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-soft': 'pulse-soft 2s infinite',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'pulse-soft': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.7 } },
        'slide-up': { '0%': { transform: 'translateY(10px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
      }
    },
  },
  plugins: [],
}
