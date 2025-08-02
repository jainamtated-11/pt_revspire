/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        fraunces: ['Fraunces', 'serif'],
      },
      colors: {
        primary: '#d5abad',
        secondary: '#1c4075',
        background: '#f7f7f7',

        warning: '#C8E7FF',

        'primary-light': 'rgba(213, 171, 173, 0.3)',

        'custom': {
          'accent': '#d0acad',
          'accent-hover': '#c09799',
        },
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-thin': {
          '--scrollbar-thumb': '#9ca3af',
          '--scrollbar-track': '#f3f4f6',
          'scrollbar-width': 'thin',
          'scrollbar-color': 'var(--scrollbar-thumb) var(--scrollbar-track)',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            'background-color': 'var(--scrollbar-track)',
            'border-radius': '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            'background-color': 'var(--scrollbar-thumb)',
            'border-radius': '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            'background-color': '#6b7280',
          },
        },
      })
    }
  ],
};
