/**
 * Design tokens for use in components
 * 
 * Use these constants instead of hardcoding color values.
 * This ensures consistency and makes refactoring easier.
 * 
 * @example
 * // Good ✓
 * import { COLORS } from '@/theme/tokens';
 * <Box bg={COLORS.bg.page} color={COLORS.text.primary} />
 * 
 * // Also Good ✓
 * <Box bg="bg.page" color="text.primary" />
 * 
 * // Bad ✗
 * <Box bg="sand.50" color="ink.900" />
 */

export const COLORS = {
  bg: {
    page: "bg.page",
    surface: "bg.surface",
    card: "bg.card",
    subtle: "bg.subtle",
  },
  text: {
    primary: "text.primary",
    secondary: "text.secondary",
    muted: "text.muted",
  },
  border: {
    subtle: "border.subtle",
    default: "border.default",
  },
  button: {
    primary: {
      bg: "button.primary.bg",
      hover: "button.primary.hover",
      active: "button.primary.active",
    },
    secondary: {
      bg: "button.secondary.bg",
      hover: "button.secondary.hover",
      active: "button.secondary.active",
    },
  },
  focus: {
    ring: "focus.ring",
  },
} as const;

export const SHADOWS = {
  card: "card",
  cardHover: "cardHover",
  header: "header",
  dropdown: "dropdown",
  modal: "modal",
} as const;

export const RADII = {
  sm: "sm",
  md: "md",
  lg: "lg",
} as const;

export const BREAKPOINTS = {
  sm: "30em",
  md: "48em",
  lg: "62em",
  xl: "80em",
} as const;
