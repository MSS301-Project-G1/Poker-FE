// Tailwind only maps class names to the CSS variables in src/styles/tokens.css.
// Do not write raw values here: add the token to tokens.css, then register its name below.

const colorNames = [
  'background', 'on-background',
  'surface', 'surface-dim', 'surface-bright', 'surface-container-lowest', 'surface-container-low',
  'surface-container', 'surface-container-high', 'surface-container-highest', 'surface-variant', 'surface-tint',
  'on-surface', 'on-surface-variant', 'inverse-surface', 'inverse-on-surface',
  'outline', 'outline-variant',
  'primary', 'on-primary', 'primary-container', 'on-primary-container', 'inverse-primary',
  'primary-fixed', 'primary-fixed-dim', 'on-primary-fixed', 'on-primary-fixed-variant',
  'secondary', 'on-secondary', 'secondary-container', 'on-secondary-container',
  'secondary-fixed', 'secondary-fixed-dim', 'on-secondary-fixed', 'on-secondary-fixed-variant',
  'tertiary', 'on-tertiary', 'tertiary-container', 'on-tertiary-container',
  'tertiary-fixed', 'tertiary-fixed-dim', 'on-tertiary-fixed', 'on-tertiary-fixed-variant',
  'error', 'on-error', 'error-container', 'on-error-container',
]

const displayText = ['display-hero', 'display-hero-mobile', 'headline-xl', 'headline-xl-mobile', 'headline-lg',
  'headline-md', 'headline-sm', 'label-numeric-lg', 'label-numeric-md', 'label-action']
const bodyText = ['body-lg', 'body-md', 'body-sm', 'label-micro']

const map = (names, toValue) => Object.fromEntries(names.map(name => [name, toValue(name)]))
const textStyle = name => [`var(--text-${name}-size)`, {
  lineHeight: `var(--text-${name}-leading)`,
  fontWeight: `var(--text-${name}-weight)`,
}]

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: map(colorNames, name => `rgb(var(--color-${name}) / <alpha-value>)`),
      fontFamily: {
        ...map(displayText, () => 'var(--font-display)'),
        ...map(bodyText, () => 'var(--font-body)'),
      },
      fontSize: map([...displayText, ...bodyText], textStyle),
      spacing: {
        'space-xs': 'var(--space-xs)',
        'space-sm': 'var(--space-sm)',
        'space-md': 'var(--space-md)',
        'space-lg': 'var(--space-lg)',
        'space-xl': 'var(--space-xl)',
        gutter: 'var(--space-gutter)',
        'gutter-mobile': 'var(--space-gutter-mobile)',
        margin: 'var(--space-margin)',
        'margin-mobile': 'var(--space-margin-mobile)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius-default)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      zIndex: {
        dropdown: 'var(--z-dropdown)',
        header: 'var(--z-header)',
        modal: 'var(--z-modal)',
        toast: 'var(--z-toast)',
      },
    },
  },
}
