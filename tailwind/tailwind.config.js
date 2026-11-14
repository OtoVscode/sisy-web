/** Configuración de Tailwind para Studio Glow (antes estaba inline en index.html). */
/** Recompilar: ver tailwind/README.md */
module.exports = {
  content: ['../index.html'],
  theme: {
    extend: {
      colors: {
        noir: '#12100E',
        cream: '#F9F6F0',
        champagne: '#C6A87C',
        'champagne-light': '#DCC6A2'
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif']
      },
      letterSpacing: {
        luxe: '0.32em'
      }
    }
  }
};
