/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    backgroundImage:{
      'custom-gradient': 'linear-gradient(to right, #3b82f6, #9333ea)',
      'whitish' : 'linear-gradient(to right, #ffffff, #ffffff)',
    },
  },
  plugins: [],
}