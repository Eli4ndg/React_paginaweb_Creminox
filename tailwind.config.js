// tailwind.config.js
const {heroui} = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/components/(button|navbar|ripple|spinner).js"
],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()],
<<<<<<< HEAD
};

module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
=======
};
>>>>>>> 7d8b124279c4fa3be3e6d8505bc037e75ae924dd
