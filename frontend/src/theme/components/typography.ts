export const Heading = {
  baseStyle: {
    color: "text.primary",
  },
  sizes: {
    xl: { textStyle: "h1" },
    lg: { textStyle: "h2" },
    md: { textStyle: "h3" },
  },
};

export const Text = {
  baseStyle: {
    color: "text.primary",
  },
  sizes: {
    md: { textStyle: "body" },
    sm: { textStyle: "small" },
  },
};

export const Link = {
  baseStyle: {
    color: "text.primary",
    _hover: {
      color: "button.secondary.bg",
      textDecoration: "underline",
    },
    _focusVisible: {
      boxShadow: "0 0 0 3px var(--chakra-colors-focus-ring)",
      outline: "none",
      borderRadius: "sm",
    },
  },
  variants: {
    nav: {
      textDecoration: "none",
      _hover: {
        textDecoration: "none",
        color: "button.secondary.bg",
      },
    },
  },
};
