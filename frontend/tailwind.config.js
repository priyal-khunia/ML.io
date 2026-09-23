/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#F7F8FC', // Soft off-white canvas
          900: '#FFFFFF', // Pure white card & sidebar surface
          850: '#F9FAFB', // Secondary card surface
          800: '#F3F4F6', // Inputs & elevated items
          750: '#E5E7EB', // Hover states
          700: '#E5E7EB', // Crisp borders
          600: '#D1D5DB', // Subtle separators
          500: '#9CA3AF',
          400: '#6B7280', // Secondary text
          300: '#4B5563', // Muted text
          200: '#374151', // Dark graphite
          100: '#252936', // Primary graphite text
        },
        brand: {
          violet: '#6C63FF',
          lavender: '#8B85FF',
          blue: '#5B9CF6',
          teal: '#35B99A',
          amber: '#E7A83B',
          coral: '#E76F6F',
          dark: '#252936',
          gray: '#6B7280',
          border: '#E5E7EB',
          bg: '#F7F8FC',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
