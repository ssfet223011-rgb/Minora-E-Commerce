/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FFF8E8',
          50: '#FFFEFA',
          100: '#FFFDF7',
          200: '#FFF8E8',
          300: '#FDF1D0',
          400: '#F9E5AF',
        },
        ivory: '#FFFDF7',
        honey: {
          light: '#FDE48B',
          DEFAULT: '#F5C542',
          dark: '#E2B12F',
        },
        amber: {
          light: '#E6AF3A',
          DEFAULT: '#D99A16',
          dark: '#B8800E',
        },
        chocolate: {
          light: '#5C3518',
          DEFAULT: '#432510',
          dark: '#2D190B',
          deep: '#231207',
        },
        olive: {
          light: '#3E4112',
          DEFAULT: '#292B0B',
          dark: '#1B1D07',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'warm': '0 4px 20px -2px rgba(67, 37, 16, 0.08), 0 2px 6px -1px rgba(67, 37, 16, 0.04)',
        'warm-lg': '0 10px 25px -3px rgba(67, 37, 16, 0.12), 0 4px 10px -2px rgba(67, 37, 16, 0.06)',
      }
    },
  },
  plugins: [],
}
