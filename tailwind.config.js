/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        hermit: {
          bg: '#0f0f0f',
          surface: '#161616',
          card: '#1c1c1c',
          border: '#2a2a2a',
          hover: '#242424',
          accent: '#6366f1',
          'accent-dim': '#4f46e5',
        },
      },
    },
  },
  plugins: [],
}
