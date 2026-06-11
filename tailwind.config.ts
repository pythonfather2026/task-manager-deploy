import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: 'var(--bg)', 2: 'var(--bg-2)', 3: 'var(--bg-3)' },
        fg: { DEFAULT: 'var(--fg)', 2: 'var(--fg-2)', dim: 'var(--fg-dim)' },
        accent: {
          DEFAULT: 'var(--accent)',
          bright: 'var(--accent-bright)',
          deep: 'var(--accent-deep)',
          wash: 'var(--accent-wash)',
          line: 'var(--accent-line)',
        },
        'on-accent': 'var(--on-accent)',
        rule: { DEFAULT: 'var(--rule)', 2: 'var(--rule-2)' },
      },
      borderRadius: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '22px',
        xl: '30px',
        pill: '999px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(20,32,64,.05)',
        sm: '0 2px 10px rgba(20,32,64,.06)',
        md: '0 10px 34px rgba(20,32,64,.10)',
        lg: '0 28px 70px rgba(20,32,64,.16)',
        accent: '0 16px 44px rgba(58,90,158,.24)',
      },
    },
  },
  plugins: [],
};

export default config;
