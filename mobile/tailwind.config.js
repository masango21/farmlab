/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        farm: {
          50: '#f3f9f5',
          100: '#e6f4e9',
          500: '#236b45',
          600: '#174b32',
          700: '#0e3d2a',
          900: '#0a2e1d',
        },
        soil: '#98734b',
        sky: '#e8b94f',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(23, 75, 50, 0.12)',
      },
    },
  },
  plugins: [],
};
