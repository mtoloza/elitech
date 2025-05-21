// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: '#2e3164',   // azul oscuro corporativo
        accent: '#3C4BC1',    // azul claro
        soft: '#EBEDFF',      // fondo suave
        warning: '#F59E0B',   // amarillo suave
        danger: '#DC2626',    // rojo
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
      transitionProperty: {
        spacing: 'margin, padding',
      },
    },
  },
  plugins: [],
}