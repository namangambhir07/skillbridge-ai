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
          navy: '#0a192f',
          royal: '#1d4ed8',
          teal: '#0d9488',
          cyan: '#06b6d4',
          surface: '#f8fafc',
          border: '#e2e8f0',
          charcoal: '#0f172a',
          muted: '#64748b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
