/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        maintix: {
          surface: 'var(--app-surface)',
          surfaceLight: 'var(--app-surface-2)',
          primary: '#38BDF8',
          secondary: '#22C55E',
          accent: '#F97316'
        }
      }
    }
  },
  plugins: []
};
