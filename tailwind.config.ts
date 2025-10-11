import type { Config } from 'tailwindcss';

const config: Config = {
  // Use Gal UI preset for design tokens alignment
  presets: [
    require('@gal-ui/components/tailwind.preset')
  ],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    // Include Gal UI components for Tailwind class detection
    './node_modules/@gal-ui/components/dist/**/*.{js,mjs}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette mapped to CSS variables in RGB for opacity support
        'brand-primary': 'rgb(var(--brand-primary) / <alpha-value>)',
        'brand-primary-dark': 'rgb(var(--brand-primary-dark) / <alpha-value>)',
        'brand-gold': 'rgb(var(--brand-gold) / <alpha-value>)',
        'brand-clay': 'rgb(var(--brand-clay) / <alpha-value>)',

        cream: 'rgb(var(--bg-cream) / <alpha-value>)',
        'text-dark': 'rgb(var(--text-dark) / <alpha-value>)',
        white: 'rgb(var(--white) / <alpha-value>)',

        // Gray scale
        gray: {
          50: 'rgb(var(--gray-50) / <alpha-value>)',
          100: 'rgb(var(--gray-100) / <alpha-value>)',
          200: 'rgb(var(--gray-200) / <alpha-value>)',
          300: 'rgb(var(--gray-300) / <alpha-value>)',
          400: 'rgb(var(--gray-400) / <alpha-value>)',
          500: 'rgb(var(--gray-500) / <alpha-value>)',
          600: 'rgb(var(--gray-600) / <alpha-value>)',
          700: 'rgb(var(--gray-700) / <alpha-value>)',
          800: 'rgb(var(--gray-800) / <alpha-value>)',
          900: 'rgb(var(--gray-900) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
  // Important: Ensure Tailwind doesn't conflict with Ant Design
  corePlugins: {
    preflight: true,
  },
};

export default config;
