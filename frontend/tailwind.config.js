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
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316', // Primary accent
          600: '#EA580C', // Dark accent
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#FFF7ED',
          border: '#FFEDD5',
        },
        darktext: {
          DEFAULT: '#0F172A',
          muted: '#64748B',
        }
      },
    },
  },
  plugins: [],
}

