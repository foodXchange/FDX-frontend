/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mocha: {
          DEFAULT: '#B08D57',
          dark: '#8B6F47',
          light: '#D4B896'
        },
        trust: {
          DEFAULT: '#1E4C8A',
          dark: '#16365F',
          light: '#2E6BB8'
        },
        fresh: {
          DEFAULT: '#52B788',
          dark: '#2D7A5F',
          light: '#7ECBA1'
        },
        appetite: {
          DEFAULT: '#FF6B35',
          dark: '#E55100',
          light: '#FF8F6B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif']
      },
      backdropBlur: {
        xs: '2px'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    }
  },
  plugins: [require('@tailwindcss/aspect-ratio')]
};