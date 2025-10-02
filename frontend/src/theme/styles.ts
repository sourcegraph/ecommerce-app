const styles = {
  global: {
    //   My resets
    "*, *::before, *::after": {
      boxSizing: "border-box",
    },
    "*": {
      margin: "0",
      padding: "0",
      WebkitTapHighlightColor: "transparent",
    },
    // styles for the `html` and `body`
    "html,body": {
      minWidth: "fit-content",
      backgroundColor: "#add8e6",
    },
    // Shopping Cart Badge styles
    ".MuiBadge-root > span": {
      fontFamily: "'Quicksand', sans-serif",
      bg: "#fa5757",
      height: "17px",
      minWidth: "17px",
      fontSize: "0.65rem",
    },
    // Product card hover style only on screens with pointer
    "@media (hover: hover) and (pointer: fine)": {
      ".product-card:hover": {
        boxShadow: "lg",
        transform: "scale(1.01)",
      },
    },
    // Optimize image loading
    ".lazyloading": {
      display: "none",
    },
    ".lazyloaded": {
      display: "block",
    },
    ".lazyloaded ~ div": {
      display: "none",
    },
  },
};

export default styles;
