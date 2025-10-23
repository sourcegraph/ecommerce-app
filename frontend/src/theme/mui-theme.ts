import { createTheme } from '@mui/material/styles'

export const muiTheme = createTheme({
  components: {
    MuiBadge: {
      styleOverrides: {
        badge: {
          backgroundColor: 'var(--chakra-colors-focus-ring)',
          color: 'white',
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
          height: 17,
          minWidth: 17,
          fontSize: '0.65rem',
        },
      },
    },
    MuiRating: {
      styleOverrides: {
        iconFilled: {
          color: 'var(--chakra-colors-ink-600)',
        },
      },
    },
  },
})
