const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-opensans)', ...fontFamily.sans],
        mono: ['var(--font-cutivemono)', ...fontFamily.mono],
      }
    },
  },
  plugins: [],
}
