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
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        car: {
          electric: '#34c759',
          neon: '#007aff',
          speed: '#ff3b30',
          turbo: '#5856d6',
          carbon: '#1a1a1a',
          chrome: '#e5e5e7',
          headlight: '#ffffff',
          taillight: '#ff3b30',
          dashboard: '#f5f5f7',
          panel: '#ffffff',
        },
        neon: {
          cyan: '#00f0ff',
          pink: '#ff00f5',
          purple: '#a855f7',
          blue: '#3b82f6',
          green: '#00ff88',
          orange: '#ff6b35',
          yellow: '#ffd60a',
        },
        electric: {
          blue: '#00d9ff',
          purple: '#b026ff',
          pink: '#ff00d4',
          green: '#00ff88',
        },
        dashboard: {
          dark: '#0a0a0a',
          panel: '#1a1a1a',
          accent: '#00ff88',
          warning: '#ff6b35',
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'gradient': 'gradient 8s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
        '3d-rotate': '3d-rotate 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor' },
          '100%': { boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor, 0 0 40px currentColor' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.05)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        '3d-rotate': {
          '0%': { transform: 'rotateY(0deg) rotateX(0deg)' },
          '100%': { transform: 'rotateY(360deg) rotateX(360deg)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-futuristic': 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
        'gradient-neon': 'linear-gradient(135deg, #00f0ff 0%, #ff00f5 50%, #a855f7 100%)',
      },
      boxShadow: {
        'glow-neon': '0 0 20px rgba(0, 122, 255, 0.2)',
        'glow-electric': '0 0 20px rgba(52, 199, 89, 0.2)',
      },
    },
  },
  plugins: [],
}

