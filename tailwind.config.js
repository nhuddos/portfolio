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
      },
      fontFamily: {
        sans: ['VT323', 'monospace'],
        vt323: ['VT323', 'monospace'],
        handjet: ['Handjet', 'cursive'],
        /* Used for long-form body copy (bios, project summaries, etc.)
           so paragraphs stay readable while headings/labels/buttons
           keep the pixel/mono retro look via font-mono / font-mono. */
        body: ['Instrument Sans', 'sans-serif'],
      },
      borderWidth: {
        3: '3px',
      },
    },
  },
  plugins: [],
}