/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    backgroundImage:{
      'chatBack': "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('./assets/download.jpg')",
    },
  },
  plugins: [],
}