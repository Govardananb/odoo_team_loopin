/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'matte-black': 'var(--color-matte-black)',
        'charcoal': 'var(--color-charcoal)',
        'dark-gray': 'var(--color-dark-gray)',
        'fog': 'var(--color-fog)',
        'off-white': 'var(--color-off-white)',
        'soft-blue': 'var(--color-soft-blue)',
        'warm-beige': 'var(--color-warm-beige)',
        'border-subtle': 'var(--border-subtle)',
        'border-hover': 'var(--border-hover)',
        'glass-bg': 'var(--glass-bg)',
        'glass-bg-light': 'rgba(30,34,41,0.6)',
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        display: ['"Inter Tight"', '"Satoshi"', '"General Sans"', 'sans-serif'],
      },
      fontSize: {
        'hero': ['32px', '40px'],
        'screen-heading': ['24px', '32px'],
        'section-title': ['18px', '24px'],
        'body-text': ['15px', '22px'],
        'caption': ['12px', '16px'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-cinematic': 'linear-gradient(180deg, rgba(15,17,21,0) 0%, rgba(15,17,21,0.8) 60%, #0F1115 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(32,36,43,0.8) 0%, rgba(23,26,32,0.9) 100%)',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(184,189,199,0.08)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.15), 0 0 0 1px rgba(110,168,254,0.2)',
        'glow-blue': '0 0 24px rgba(110,168,254,0.15)',
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      borderRadius: {
        'button': '12px',
        'card': '16px',
        'modal': '20px',
        'input': '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease forwards',
        'blur-in': 'blurIn 0.7s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        blurIn: {
          from: { opacity: '0', filter: 'blur(12px)' },
          to: { opacity: '1', filter: 'blur(0px)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
