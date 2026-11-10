/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        csoam: {
          dark: "#006B35",
          primary: "#008C45",
          light: "#8BCF27",
          soft: "#EAF5E9",
          blue: "#1769D2",
          bg: "#F5F7F6",
          muted: "#68746D",
        },
      },
    },
  },
  plugins: [],
};
