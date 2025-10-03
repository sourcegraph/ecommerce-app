export const Badge = {
  baseStyle: {
    borderRadius: "sm",
    textTransform: "none",
    fontWeight: 600,
  },
};

export const Tag = {
  baseStyle: {
    container: {
      borderRadius: "md",
    },
  },
};

export const Alert = {
  baseStyle: {
    container: {
      bg: "ink.900",
      color: "white",
      borderRadius: "md",
      px: 4,
      py: 3,
    },
    title: {
      fontWeight: "500",
      color: "white",
    },
    description: {
      color: "rgba(255, 255, 255, 0.9)",
    },
    icon: {
      color: "white",
    },
  },
  variants: {
    solid: {
      container: {
        bg: "ink.900",
        color: "white",
      },
    },
    subtle: {
      container: {
        bg: "ink.900",
        color: "white",
      },
    },
    "left-accent": {
      container: {
        bg: "ink.900",
        color: "white",
        borderLeft: "4px solid",
        borderColor: "ink.600",
      },
    },
  },
};

export const Skeleton = {
  baseStyle: {
    startColor: "sand.100",
    endColor: "sand.200",
  },
};

export const Tooltip = {
  baseStyle: {
    bg: "ink.900",
    color: "white",
    borderRadius: "md",
  },
};
