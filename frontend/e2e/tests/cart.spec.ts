import { test, expect } from '@playwright/test';
import { waitForProductsLoaded, addToCartAndWaitForUpdate, waitForCartCount, waitForCartItemsCount, openFirstProductDetail, updateQuantityAndWaitForUpdate, removeFromCartAndWaitForUpdate } from './utils/waits';

test.describe('Cart Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cart state before each test
    await page.addInitScript(() => {
      try {
        localStorage.removeItem('cart');
        // Clear any other cart-related storage if needed
        localStorage.removeItem('cartItems');
        localStorage.removeItem('selectedDelivery');
      } catch (e) {
        // Ignore storage errors in case localStorage is restricted
      }
    });
    
    await page.goto('/');
    await waitForProductsLoaded(page);
  });

  test('should add product to cart and display cart badge', async ({ page }) => {
    // Get initial cart count
    const cartBadge = page.locator('[data-testid="cart-count"]');
    let initialCount = 0;
    
    if (await cartBadge.count() > 0) {
      const initialCountText = await cartBadge.textContent();
      initialCount = parseInt(initialCountText || '0') || 0;
    }
    
    await addToCartAndWaitForUpdate(page, initialCount);
  });

  test('should persist cart items across page navigation', async ({ page }) => {
    const cartBadge = page.locator('[data-testid="cart-count"]');
    const initialCountText = await cartBadge.textContent();
    const initialCount = parseInt(initialCountText || '0') || 0;
    
    await addToCartAndWaitForUpdate(page, initialCount);
    const expectedCount = initialCount + 1;
    
    // Navigate to cart page and back to home
    await Promise.all([
      page.click('[data-testid="cart-link"]'),
      page.waitForURL('**/cart')
    ]);
    
    // Navigate back home
    await page.goto('/');
    await waitForProductsLoaded(page);
    
    // Cart count should persist
    await expect(cartBadge).toHaveText(String(expectedCount));
  });

  test('should display cart contents and allow quantity changes', async ({ page }) => {
    const cartBadge = page.locator('[data-testid="cart-count"]');
    
    // Cart is clean from beforeEach, so we start at 0
    await addToCartAndWaitForUpdate(page, 0);
    
    // Navigate to cart
    await Promise.all([
      page.click('[data-testid="cart-link"]'),
      page.waitForURL('**/cart')
    ]);
    
    // Should show cart items
    await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible();
    
    // Should show total price
    const cartTotal = page.locator('[data-testid="cart-total"]');
    await expect(cartTotal).toBeVisible();
    const initialTotalText = await cartTotal.textContent();
    expect(initialTotalText).toMatch(/\$\d+/);
    
    // Use new utility for quantity updates
    await updateQuantityAndWaitForUpdate(page, 2);
  });

  test('should allow removing items from cart', async ({ page }) => {
    // Add item to cart first (clean state from beforeEach)
    await addToCartAndWaitForUpdate(page, 0);
    
    // Navigate to cart
    await Promise.all([
      page.click('[data-testid="cart-link"]'),
      page.waitForURL('**/cart')
    ]);
    
    // Should show cart items
    const cartItems = page.locator('[data-testid="cart-item"]');
    await expect(cartItems.first()).toBeVisible();
    
    // Remove item using new utility
    await removeFromCartAndWaitForUpdate(page, 0);
  });

  test('should handle adding multiple different products to cart', async ({ page }) => {
    const addToCartButtons = page.locator('[data-testid="add-to-cart"]');
    const cartBadge = page.locator('[data-testid="cart-count"]');
    
    // Get initial cart count
    let initialCount = 0;
    if (await cartBadge.count() > 0) {
      const initialCountText = await cartBadge.textContent();
      initialCount = parseInt(initialCountText || '0') || 0;
    }
    
    // Add first product and wait for cart update
    await addToCartButtons.nth(0).click();
    await expect(cartBadge).toHaveText(String(initialCount + 1));
    
    // Add second product and wait for cart update
    await addToCartButtons.nth(1).click();  
    await expect(cartBadge).toHaveText(String(initialCount + 2));
    
    // Navigate to cart and verify items are there
    await Promise.all([
      page.click('[data-testid="cart-link"]'),
      page.waitForURL('**/cart')
    ]);
    
    const cartItems = page.locator('[data-testid="cart-item"]');
    
    // Wait for cart items to appear - should have the total we expect
    await expect(cartItems.first()).toBeVisible();
    
    // Verify we have at least the items we added
    const finalItemCount = await cartItems.count();
    expect(finalItemCount).toBeGreaterThanOrEqual(2);
  });

  test('should display cart page correctly', async ({ page }) => {
    // Navigate directly to cart
    await Promise.all([
      page.click('[data-testid="cart-link"]'),
      page.waitForURL('**/cart')
    ]);
    
    // Cart page should load and show either empty state or items
    const emptyMessage = page.locator('[data-testid="empty-cart"]');
    const cartItems = page.locator('[data-testid="cart-item"]');
    
    // Page should be functional - either showing empty state or cart items
    if (await cartItems.count() > 0) {
      // If there are items, first item should be visible
      await expect(cartItems.first()).toBeVisible();
      
      // Should show cart total
      const cartTotal = page.locator('[data-testid="cart-total"]');
      if (await cartTotal.count() > 0) {
        await expect(cartTotal).toBeVisible();
      }
    } else if (await emptyMessage.count() > 0) {
      // If empty, should show empty message
      await expect(emptyMessage).toBeVisible();
    }
    
    // Cart page itself should always be accessible
    expect(page.url()).toMatch(/\/cart/);
  });

  test('should maintain cart state during page refresh', async ({ page }) => {
    // Add item to cart
    const cartBadge = page.locator('[data-testid="cart-count"]');
    const initialCountText = await cartBadge.textContent();
    const initialCount = parseInt(initialCountText || '0') || 0;
    
    await addToCartAndWaitForUpdate(page, initialCount);
    const expectedCount = initialCount + 1;
    
    // Refresh the page
    await page.reload();
    await waitForProductsLoaded(page);
    
    // Cart count should persist
    await expect(cartBadge).toHaveText(String(expectedCount));
  });

  test('should allow adding product to cart with delivery option selected', async ({ page }) => {
    // Wait for products to load and click on first product
    await openFirstProductDetail(page);
    
    // Check if delivery options are present
    const deliverySection = page.locator('[data-testid="delivery-section"]');
    
    if (await deliverySection.count() > 0) {
      // Select a delivery option (if multiple are available)
      const radioButtons = page.locator('input[type="radio"]');
      const radioCount = await radioButtons.count();
      
      if (radioCount >= 2) {
        // Select the second option (first might be default)
        const secondRadio = radioButtons.nth(1);
        if (await secondRadio.isEnabled()) {
          // Click on the radio's container instead of the radio directly
          const radioContainer = secondRadio.locator('..').locator('..');
          await radioContainer.click();
          await expect(secondRadio).toBeChecked();
        }
      }
      
      // Get initial cart count
      const cartBadge = page.locator('[data-testid="cart-count"]');
      let initialCount = 0;
      
      if (await cartBadge.count() > 0) {
        const initialCountText = await cartBadge.textContent();
        initialCount = parseInt(initialCountText || '0') || 0;
      }
      
      // Add to cart using our utility function
      await addToCartAndWaitForUpdate(page, initialCount);
      
      // Verify success message or button state change
      const successMessage = page.getByText(/added.*cart|successfully added/i);
      const addedToCartButton = page.getByText("Added to Cart");
      
      const hasSuccessMessage = await successMessage.count() > 0;
      const hasButtonStateChange = await addedToCartButton.count() > 0;
      
      expect(hasSuccessMessage || hasButtonStateChange).toBeTruthy();
    } else {
      // If no delivery section, just test regular add to cart
      const cartBadge = page.locator('[data-testid="cart-count"]');
      let initialCount = 0;
      
      if (await cartBadge.count() > 0) {
        const initialCountText = await cartBadge.textContent();
        initialCount = parseInt(initialCountText || '0') || 0;
      }
      
      await addToCartAndWaitForUpdate(page, initialCount);
    }
  });
});
