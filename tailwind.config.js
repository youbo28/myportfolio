/** @type {import('tailwindcss').Config} */
const rtl = require('tailwindcss-rtl');

module.exports = {
    darkMode: 'class', 

  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [rtl],
}
