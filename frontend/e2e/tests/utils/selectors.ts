export const SELECTORS = {
  // Product browsing
  PRODUCT_CARD: '[data-testid="product-card"]',
  PRODUCT_TITLE: '[data-testid="product-title"]',
  PRODUCT_PRICE: '[data-testid="product-price"]',
  
  // Cart
  CART_LINK: '[data-testid="cart-link"]',
  CART_COUNT: '[data-testid="cart-count"]', 
  CART_ITEM: '[data-testid="cart-item"]',
  CART_TOTAL: '[data-testid="cart-total"]',
  EMPTY_CART: '[data-testid="empty-cart"]',
  ADD_TO_CART: '[data-testid="add-to-cart"]',
  REMOVE_ITEM: '[data-testid="remove-item"]',
  
  // Delivery
  DELIVERY_SECTION: '[data-testid="delivery-section"]',
  
  // States
  LOADING: '[data-testid="loading"]',
  ERROR_STATE: '[data-testid="error-state"]'
} as const;
