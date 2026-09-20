/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        },
        saffron: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
        sacred: {
          dark: '#0a0d18',
          card: 'rgba(15, 23, 42, 0.75)',
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'floatSlow 4s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': {
            boxShadow: '0 0 15px rgba(249, 115, 22, 0.6), 0 0 30px rgba(236, 72, 153, 0.4)',
            transform: 'scale(1)',
          },
          '50%': {
            boxShadow: '0 0 25px rgba(249, 115, 22, 0.9), 0 0 45px rgba(236, 72, 153, 0.7)',
            transform: 'scale(1.03)',
          },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
