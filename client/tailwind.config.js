/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8CEF78',
        secondary: '#AFF4A1',
        homegreen: '#D8FFD0',   
        accent: '#95B3D52E',     
        dark: '#1a1a1a',
        footer: '#9EF5BF',
      },
    },
  },
  plugins: [],
}
