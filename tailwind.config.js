/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#fdf7f0',
          100: '#f7e6d3',
          200: '#efcca5',
          300: '#e4a853',
          400: '#d2691e',
          500: '#c7621a',
          600: '#a0511a',
          700: '#8b4513',
          800: '#72391a',
          900: '#3e2723'
        },
        cream: {
          50: '#fffef7',
          100: '#fff7ed',
          200: '#ffecd1',
        }
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'body': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}