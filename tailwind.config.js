/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./projects/seed-app/src/**/*.{html,ts}",
    "./projects/seed-common-lib/src/**/*.{html,ts}"
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms'),require('@tailwindcss/typography')],
};
