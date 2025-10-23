export const Tabs = {
  variants: {
    line: {
      tab: {
        color: 'text.secondary',
        _selected: {
          color: 'text.primary',
          borderColor: 'button.secondary.bg',
        },
        _focusVisible: {
          boxShadow: '0 0 0 3px var(--chakra-colors-focus-ring)',
        },
      },
    },
  },
}
