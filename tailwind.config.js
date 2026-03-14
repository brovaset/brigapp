/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        car: {
          neon:      '#f97316', // orange-500  — primary accent
          electric:  '#ea580c', // orange-600  — secondary / hover
          speed:     '#dc2626', // red-600     — danger / cancel
          turbo:     '#111111', // near-black  — dark accent
          carbon:    '#0a0a0a',
          chrome:    '#e5e5e7',
          headlight: '#ffffff',
          taillight: '#f97316',
          dashboard: '#fafaf9',
          panel:     '#ffffff',
        },
      },
      animation: {
        'float':     'float 6s ease-in-out infinite',
        'glow':      'glow 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 8s linear infinite',
        'shimmer':   'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-16px)' },
        },
        glow: {
          '0%':   { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      boxShadow: {
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.25)',
        'glow-dark':   '0 0 20px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
