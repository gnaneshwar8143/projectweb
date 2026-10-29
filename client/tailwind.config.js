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
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5bbfc',
          400: '#8196f8',
          500: '#6370f1',
          600: '#5254e5',
          700: '#4540ca',
          800: '#3935a3',
          900: '#323081',
          950: '#1e1c4c',
        },
        surface: {
          0:   '#ffffff',
          50:  '#f8f9fb',
          100: '#f1f3f7',
          200: '#e4e7ef',
          300: '#d1d5e0',
          400: '#9ba3b8',
          500: '#6b7491',
          600: '#4b5470',
          700: '#333c58',
          800: '#1e2438',
          900: '#111827',
          950: '#080c18',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'slide-in-right': 'slideInRight 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { from: { opacity: '0', transform: 'translateX(-8px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
}
