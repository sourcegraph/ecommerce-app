import { defineStyleConfig } from '@chakra-ui/react'

export const Input = defineStyleConfig({
  baseStyle: {
    field: {
      borderRadius: 'md',
      _focusVisible: {
        borderColor: 'focus.ring',
        boxShadow: '0 0 0 1px var(--chakra-colors-focus-ring)',
      },
    },
  },
  variants: {
    outline: {
      field: {
        borderColor: 'border.subtle',
        _hover: {
          borderColor: 'border.default',
        },
        _invalid: {
          borderColor: 'ink.600',
          boxShadow: '0 0 0 1px var(--chakra-colors-ink-600)',
        },
      },
    },
    filled: {
      field: {
        bg: 'bg.surface',
        border: '1px solid',
        borderColor: 'border.subtle',
        _hover: {
          borderColor: 'border.default',
          bg: 'bg.surface',
        },
        _focus: {
          borderColor: 'focus.ring',
          bg: 'bg.surface',
        },
        _invalid: {
          borderColor: 'ink.600',
          boxShadow: '0 0 0 1px var(--chakra-colors-ink-600)',
        },
      },
    },
  },
  defaultProps: {
    variant: 'outline',
  },
})
