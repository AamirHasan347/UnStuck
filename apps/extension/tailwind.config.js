/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./**/*.{tsx,html}"],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', backdropFilter: 'blur(0px)' },
          '100%': { opacity: '1', backdropFilter: 'blur(12px)' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
      }
    },
  },
  plugins: [],
}