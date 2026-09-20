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
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0284c7',
          600: '#0265d2',
          700: '#034ea2',
          800: '#073c7e',
          900: '#0c3265',
        },
        diy: {
          orange: '#ff6600',
          dark: '#1e293b',
        }
      }
    },
  },
  plugins: [],
}
