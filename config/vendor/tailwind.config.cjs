module.exports = {
  presets: [
    require(__tailwindCSSTaxonPagesConfigPath)
  ],
  theme: {
    extend: {
      fontFamily: {
        main: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif']
      }
    }
  }
}
