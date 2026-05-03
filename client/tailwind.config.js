/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy:       '#0B1120',
        slate:      '#1E2D4A',
        'slate-mid':'#2A3D5C',
        gold:       '#C9A96E',
        'gold-light':'#E8D5AA',
        surface:    '#F7F6F2',
        'surface-2':'#EEECEA',
        border:     '#E2DFD8',
        't1':       '#1A1A2E',
        't2':       '#3D4454',
        't3':       '#6B7490',
        't4':       '#9AA3BA',
      },
      boxShadow: {
        'card':  '0 1px 3px rgba(11,17,32,0.06), 0 4px 16px rgba(11,17,32,0.04)',
        'card-hover': '0 4px 24px rgba(11,17,32,0.10), 0 1px 4px rgba(11,17,32,0.06)',
        'panel': '0 8px 40px rgba(11,17,32,0.12)',
        'gold':  '0 0 0 3px rgba(201,169,110,0.25)',
      },
      borderRadius: {
        'xl2': '1rem',
        'xl3': '1.25rem',
      },
    },
  },
  plugins: [],
};