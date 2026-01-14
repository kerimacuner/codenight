/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        turkcell: {
          yellow: '#ffc72c',
          blue: '#002855',
          dark: '#001a33',
          light: '#f5f5f5',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
