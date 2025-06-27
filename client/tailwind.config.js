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
        secondary: '#AFF4A1',    // contoh: biru tua elegan
        accent: '#95B3D52E',       // abu-abu muda untuk latar
        dark: '#1a1a1a',
      },
    },
  },
  plugins: [],
}
