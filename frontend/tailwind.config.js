// THE COLOR + FONT SETTINGS FOR THE WHOLE SITE live here.
// Change a hex value and every page updates.
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF7F2',          // page background (cream)
        rule: '#E6DFD0',           // thin lines / borders
        ink: { DEFAULT: '#1E293B', soft: '#5B6577' }, // text (navy ink)
        brand: {                   // deep green: buttons, banner, active states
          50: '#EEF5F1', 100: '#D6E8DE', 200: '#AFD1BF', 500: '#2D7A5F',
          600: '#1C634C', 700: '#0F4C3A', 800: '#0B3A2C', 900: '#072A20',
        },
        gold: { 400: '#D9B84A', 500: '#C9A227', 600: '#A98515' }, // accent
        clay: { 50: '#FBEFEB', 500: '#C2543B', 600: '#A3432D' },  // alerts / absent
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
