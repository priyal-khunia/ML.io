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
          950: '#0a0c0e', // Pure deep obsidian canvas
          900: '#111418', // Sidebar & main card surface
          850: '#161a20', // Card surface
          800: '#1d222a', // Inputs & elevated items
          750: '#252b35', // Hover states
          700: '#2e3542', // Crisp borders
          600: '#444e60', // Subtle separators
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
