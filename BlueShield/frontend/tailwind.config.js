/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        severity: {
          high:       '#A32D2D',
          'high-bg':  '#FCEBEB',
          med:        '#854F0B',
          'med-bg':   '#FAEEDA',
          low:        '#185FA5',
          'low-bg':   '#E6F1FB',
          normal:     '#0F6E56',
          'normal-bg':'#E1F5EE',
        },
      },
    },
  },
  plugins: [],
}
