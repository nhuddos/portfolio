/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        /* Colors are NOT hardcoded here — they're read live from the
           --x-rgb CSS variables defined in src/index.css, so that file
           is the single source of truth for the whole palette. The
           rgb(... / <alpha-value>) form is what makes opacity modifiers
           like bg-ink/40 or text-accent/70 work correctly. */
        paper: 'rgb(var(--paper-rgb) / <alpha-value>)',
        ink: 'rgb(var(--ink-rgb) / <alpha-value>)',
        accent: 'rgb(var(--accent-rgb) / <alpha-value>)',
        'accent-2': 'rgb(var(--accent-2-rgb) / <alpha-value>)',
        mint: 'rgb(var(--mint-rgb) / <alpha-value>)',
        lilac: 'rgb(var(--lilac-rgb) / <alpha-value>)',
        sky: 'rgb(var(--sky-rgb) / <alpha-value>)',
        muted: 'rgb(var(--muted-rgb) / <alpha-value>)',
        /* Text that sits on an accent fill (buttons, active chips). */
        'on-accent': 'rgb(var(--on-accent-rgb) / <alpha-value>)',
      },
      fontFamily: {
        /* Geist carries the interface, Geist Mono the metadata/labels,
           and Instrument Serif the expressive display moments. */
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
        display: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgb(var(--shadow-rgb) / 0.06), 0 4px 16px -4px rgb(var(--shadow-rgb) / 0.10)',
        float: '0 1px 2px rgb(var(--shadow-rgb) / 0.08), 0 12px 32px -8px rgb(var(--shadow-rgb) / 0.22), 0 32px 80px -24px rgb(var(--shadow-rgb) / 0.28)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
