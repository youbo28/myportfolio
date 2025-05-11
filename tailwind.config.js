/** @type {import('tailwindcss').Config} */
const rtl = require('tailwindcss-rtl');

module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [rtl],
}
