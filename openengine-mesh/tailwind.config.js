/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        petri: {
          dark: '#070707',
          card: '#0a0a0a',
          border: '#1c1c1c',
          accent: '#8e8e8e',
          success: '#238636',
          warning: '#d29922',
          danger: '#da3633',
        },
        mesh: {
          dark: '#070707',
          card: '#0a0a0a',
          border: '#1c1c1c',
          accent: '#8e8e8e',
          success: '#238636',
          warning: '#d29922',
          danger: '#da3633',
        },
      },
    },
  },
  plugins: [],
};
