/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    ".public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        "custom-light": "#CCCBFA",
        "custom-dark": "#9998C7", // Darker shade of #CCCBFA
      }
    },
  },
  plugins: [],
  darkMode: 'class',  // This enables dark mode with a class
}

