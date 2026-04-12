/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#16130c",
        "surface-container-low": "#1e1b14",
        "surface-container-lowest": "#110e08",
        "surface-container-high": "#2d2a22",
        "surface-container-highest": "#38342c",
        "surface-variant": "#38342c",
        "on-surface": "#e9e1d6",
        "on-surface-variant": "#d3c3c0",
        background: "#16130c",
        "on-background": "#e9e1d6",
        primary: "#e9c349",
        "on-primary": "#3c2f00",
        outline: "#9c8d8b",
        "outline-variant": "#504442",
      },
      fontFamily: {
        headline: ["Newsreader", "serif"],
        body: ["Work Sans", "sans-serif"],
        label: ["Work Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};