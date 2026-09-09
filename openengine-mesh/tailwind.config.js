/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mesh: {
          dark: '#0d1117',
          card: '#161b22',
          border: '#30363d',
          accent: '#58a6ff',
          success: '#238636',
          warning: '#d29922',
          danger: '#da3633',
        },
      },
    },
  },
  plugins: [],
};
