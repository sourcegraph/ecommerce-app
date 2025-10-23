import { defineStyleConfig } from '@chakra-ui/react'

export const Button = defineStyleConfig({
  baseStyle: {
    borderRadius: 'md',
    fontWeight: 600,
    transition: 'all 150ms cubic-bezier(0.2, 0.8, 0.2, 1)',
    _focusVisible: {
      boxShadow: '0 0 0 3px var(--chakra-colors-focus-ring)',
      outline: 'none',
    },
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
  variants: {
    solid: {
      bg: 'button.primary.bg',
      color: 'white',
      _hover: {
        bg: 'button.primary.hover',
        _disabled: {
          bg: 'button.primary.bg',
        },
      },
      _active: {
        bg: 'button.primary.active',
      },
    },
    outline: {
      borderColor: 'border.subtle',
      color: 'text.primary',
      _hover: {
        bg: 'blackAlpha.50',
      },
    },
    ghost: {
      color: 'text.primary',
      _hover: {
        bg: 'blackAlpha.50',
      },
    },
    accent: {
      bg: 'button.secondary.bg',
      color: 'white',
      _hover: {
        bg: 'button.secondary.hover',
        _disabled: {
          bg: 'button.secondary.bg',
        },
      },
      _active: {
        bg: 'button.secondary.active',
      },
    },
  },
  defaultProps: {
    variant: 'solid',
  },
})
