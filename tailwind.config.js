
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // Custom dark mode colors for maximum contrast
        dark: {
          bg: '#000000',
          surface: '#111111',
          border: '#333333',
          text: '#ffffff',
          'text-secondary': '#cccccc',
          accent: '#3b82f6',
        }
      },
      backgroundColor: {
        'dark-primary': '#000000',
        'dark-secondary': '#111111',
        'dark-tertiary': '#1a1a1a',
      },
      textColor: {
        'dark-primary': '#ffffff',
        'dark-secondary': '#e5e5e5',
        'dark-tertiary': '#cccccc',
      },
      borderColor: {
        'dark-primary': '#333333',
        'dark-secondary': '#444444',
      }
    },
  },
  plugins: [],
}
