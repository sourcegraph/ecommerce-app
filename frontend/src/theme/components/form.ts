import { defineStyleConfig } from "@chakra-ui/react";

export const Select = defineStyleConfig({
  baseStyle: {
    field: {
      borderRadius: "md",
      _focusVisible: {
        borderColor: "focus.ring",
        boxShadow: "0 0 0 1px var(--chakra-colors-focus-ring)",
      },
    },
  },
  variants: {
    outline: {
      field: {
        borderColor: "border.subtle",
        _hover: {
          borderColor: "border.default",
        },
        _invalid: {
          borderColor: "ink.600",
        },
      },
    },
    filled: {
      field: {
        bg: "bg.surface",
        border: "1px solid",
        borderColor: "border.subtle",
        _hover: {
          borderColor: "border.default",
          bg: "bg.surface",
        },
        _invalid: {
          borderColor: "ink.600",
        },
      },
    },
  },
});

export const Textarea = defineStyleConfig({
  baseStyle: {
    borderRadius: "md",
    _focusVisible: {
      borderColor: "focus.ring",
      boxShadow: "0 0 0 1px var(--chakra-colors-focus-ring)",
    },
  },
  variants: {
    outline: {
      borderColor: "border.subtle",
      _hover: {
        borderColor: "border.default",
      },
      _invalid: {
        borderColor: "ink.600",
      },
    },
    filled: {
      bg: "bg.surface",
      border: "1px solid",
      borderColor: "border.subtle",
      _hover: {
        borderColor: "border.default",
        bg: "bg.surface",
      },
      _invalid: {
        borderColor: "ink.600",
      },
    },
  },
});

export const Checkbox = {
  baseStyle: {
    control: {
      borderColor: "border.default",
      _checked: {
        bg: "button.secondary.bg",
        borderColor: "button.secondary.bg",
        _hover: {
          bg: "button.secondary.hover",
          borderColor: "button.secondary.hover",
        },
      },
      _focusVisible: {
        boxShadow: "0 0 0 3px var(--chakra-colors-focus-ring)",
      },
    },
  },
};

export const Radio = {
  baseStyle: {
    control: {
      borderColor: "border.default",
      _checked: {
        bg: "button.secondary.bg",
        borderColor: "button.secondary.bg",
        _hover: {
          bg: "button.secondary.hover",
          borderColor: "button.secondary.hover",
        },
      },
      _focusVisible: {
        boxShadow: "0 0 0 3px var(--chakra-colors-focus-ring)",
      },
    },
  },
};

export const Switch = {
  baseStyle: {
    track: {
      _checked: {
        bg: "button.secondary.bg",
      },
      _focusVisible: {
        boxShadow: "0 0 0 3px var(--chakra-colors-focus-ring)",
      },
    },
  },
};
