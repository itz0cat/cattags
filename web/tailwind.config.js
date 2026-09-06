/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ct: {
          primary: '#3B82F6',
          'primary-dark': '#1D4ED8',
          'primary-bright': '#60A5FA',
          background: '#080B12',
          surface: '#111827',
          'surface-elevated': '#172033',
          border: '#1F2937',
          text: '#F9FAFB',
          'text-secondary': '#D1D5DB',
          'text-muted': '#9CA3AF',
          'text-disabled': '#6B7280',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#38BDF8',
        }
      },
      fontFamily: {
        minecraft: ['"Minecraftia"', 'monospace', 'sans-serif']
      }
    },
  },
  plugins: [],
}
