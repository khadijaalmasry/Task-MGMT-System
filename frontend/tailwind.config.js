/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,css,html}",
  ],
  darkMode: 'class', // This enables class-based dark mode
  theme: {
    extend: {
      colors: {
        // Add your custom colors that will work in both themes
        primary: {
          light: '#2563eb', // blue-600
          dark: '#3b82f6',  // blue-500
        },
        background: {
          light: '#ffffff',
          dark: '#1e1e1e',
        },
        card: {
          light: '#f3f4f6', // gray-100
          dark: '#292929',
        },
        text: {
          light: '#111827', // gray-900
          dark: '#f9fafb',  // gray-50
        },
      },
    },
  },
  plugins: [],
}