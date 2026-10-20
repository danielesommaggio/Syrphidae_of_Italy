function withOpacity(variableName) {
  return ({ opacityValue }) =>
    opacityValue !== undefined
      ? `rgba(var(${variableName}), ${opacityValue})`
      : `rgb(var(${variableName}))`
}

module.exports = {
  presets: [
    require(__tailwindCSSTaxonPagesConfigPath)
  ],
  theme: {
    extend: {
      // The custom panels (ported from WID) use `bg-secondary`, `text-secondary`,
      // `ring-secondary`… Map them to a theme-aware UI accent (see theme.css).
      colors: {
        secondary: {
          DEFAULT: withOpacity('--color-ui-accent')
        }
      },
      fontFamily: {
        main: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif']
      }
    }
  }
}
