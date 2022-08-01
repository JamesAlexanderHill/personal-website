const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./src/**/*.{html,js}",
  ],
  theme: {
    fontFamily: {
      heading: ['Montserrat', 'sans-serif'],
      body: ['Inconsolata', 'serif'],
    },
    extend: {
      colors: {
        accent: colors.orange,
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-in-out backwards',
        'fade-in-right': 'fadeInRight 0.8s ease-in-out backwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0px)', opacity: 100 },
        },
        fadeInRight: {
          '0%': { transform: 'translatex(20px)', opacity: 0 },
          '100%': { transform: 'translatex(0px)', opacity: 100 },
        }
      }
    },
  },
  plugins: [
    require("tailwindcss-animation-delay"),
  ],
}
