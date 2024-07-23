/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    fontFamily: {
        "geist-black": ["Geist Black" , "sans serif"],
        "geist-medium": ["Geist Medium" , "sans serif"],
        "geist-light": ["Geist Light" , "sans serif"],
        "pixel": ["Pixel" , "sans serif"],
    }
  },
  darkMode: ['selector' , '[data-theme="dark"]'],
  plugins: [],
}