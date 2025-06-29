/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'fx-orange': '#ea580c',
        'fx-orange-light': '#fb923c',
        'fx-orange-dark': '#c2410c',
        'fx-teal': '#0d9488',
        'fx-teal-light': '#14b8a6',
        'fx-teal-dark': '#0f766e',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
