import { test, expect } from '@playwright/test';

test.describe('Cart Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should add product to cart and display cart badge', async ({ page }) => {
    // Get initial cart count
    const cartBadge = page.locator('[data-testid="cart-count"]');
    let initialCount = 0;
    
    if (await cartBadge.count() > 0) {
      const initialCountText = await cartBadge.textContent();
      initialCount = parseInt(initialCountText || '0') || 0;
    }
    
    // Find and click add to cart button
    const addToCartButton = page.locator('[data-testid="add-to-cart"]').first();
    await addToCartButton.click();
    
    // Wait for cart update and verify
    await expect(cartBadge).toBeVisible();
    const newCountText = await cartBadge.textContent();
    const newCount = parseInt(newCountText || '0') || 0;
    expect(newCount).toBeGreaterThan(initialCount);
  });

  test('should persist cart items across page navigation', async ({ page }) => {
    // Add item to cart first
    const addToCartButton = page.locator('[data-testid="add-to-cart"]').first();
    const cartBadge = page.locator('[data-testid="cart-count"]');
    
    // Get initial count
    let initialCount = 0;
    if (await cartBadge.count() > 0) {
      const initialCountText = await cartBadge.textContent();
      initialCount = parseInt(initialCountText || '0') || 0;
    }
    
    await addToCartButton.click();
    
    // Verify cart updated
    await expect(cartBadge).toBeVisible();
    const newCountText = await cartBadge.textContent();
    const newCount = parseInt(newCountText || '0') || 0;
    expect(newCount).toBeGreaterThan(initialCount);
    
    // Navigate to cart page and back to home
    await page.click('[data-testid="cart-link"]');
    await page.goto('/');
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    // Cart count should persist
    await expect(cartBadge).toBeVisible();
    const persistedCountText = await cartBadge.textContent();
    const persistedCount = parseInt(persistedCountText || '0') || 0;
    expect(persistedCount).toBe(newCount);
  });

  test('should display cart contents and allow quantity changes', async ({ page }) => {
    // Add item to cart first
    const addToCartButton = page.locator('[data-testid="add-to-cart"]').first();
    await addToCartButton.click();
    
    // Navigate to cart
    await page.click('[data-testid="cart-link"]');
    
    // Should show cart items
    await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible();
    
    // Should show total price
    await expect(page.locator('[data-testid="cart-total"]')).toBeVisible();
    const totalText = await page.locator('[data-testid="cart-total"]').textContent();
    expect(totalText).toMatch(/\$\d+/);
    
    // Test quantity change using select (desktop)
    const quantitySelect = page.locator('[data-testid="quantity-select"]').first();
    if (await quantitySelect.count() > 0) {
      const initialTotal = parseFloat(totalText?.replace(/[^0-9.]/g, '') || '0');
      await quantitySelect.selectOption('2');
      
      // Wait for total to update
      await page.waitForTimeout(500);
      const newTotalText = await page.locator('[data-testid="cart-total"]').textContent();
      const newTotal = parseFloat(newTotalText?.replace(/[^0-9.]/g, '') || '0');
      expect(newTotal).toBeGreaterThan(initialTotal);
    } else {
      // Test increment button (mobile)
      const incrementButton = page.locator('[data-testid="increment-qty"]').first();
      if (await incrementButton.count() > 0) {
        const initialTotal = parseFloat(totalText?.replace(/[^0-9.]/g, '') || '0');
        await incrementButton.click();
        
        await page.waitForTimeout(500);
        const newTotalText = await page.locator('[data-testid="cart-total"]').textContent();
        const newTotal = parseFloat(newTotalText?.replace(/[^0-9.]/g, '') || '0');
        expect(newTotal).toBeGreaterThan(initialTotal);
      }
    }
  });

  test('should allow removing items from cart', async ({ page }) => {
    // Add item to cart first
    const addToCartButton = page.locator('[data-testid="add-to-cart"]').first();
    await addToCartButton.click();
    
    // Navigate to cart
    await page.click('[data-testid="cart-link"]');
    
    // Should show cart items
    await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible();
    const initialItemCount = await page.locator('[data-testid="cart-item"]').count();
    
    // Remove first item
    await page.click('[data-testid="remove-item"]');
    
    // Wait for removal animation
    await page.waitForTimeout(1000);
    
    // Cart should have fewer items or show empty state
    const newItemCount = await page.locator('[data-testid="cart-item"]').count();
    if (newItemCount > 0) {
      expect(newItemCount).toBeLessThan(initialItemCount);
    } else {
      // Should show empty cart message
      await expect(page.locator('[data-testid="empty-cart"]')).toBeVisible();
    }
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
    
    // Add first product
    await addToCartButtons.nth(0).click();
    await page.waitForTimeout(500);
    
    // Add second product  
    await addToCartButtons.nth(1).click();
    await page.waitForTimeout(500);
    
    // Verify cart count increased by 2
    await expect(cartBadge).toBeVisible();
    const newCountText = await cartBadge.textContent();
    const newCount = parseInt(newCountText || '0') || 0;
    expect(newCount).toBe(initialCount + 2);
    
    // Navigate to cart and verify both items are there
    await page.click('[data-testid="cart-link"]');
    await page.waitForURL('**/cart');
    
    const cartItems = page.locator('[data-testid="cart-item"]');
    
    // Wait for cart items to appear
    await expect(cartItems.first()).toBeVisible({ timeout: 10000 });
    
    // Verify we have at least 2 items in cart
    const itemCount = await cartItems.count();
    expect(itemCount).toBeGreaterThanOrEqual(2);
  });

  test('should show empty cart state when no items', async ({ page }) => {
    // Navigate directly to cart
    await page.click('[data-testid="cart-link"]');
    
    // Should show empty cart message or no items
    const emptyMessage = page.locator('[data-testid="empty-cart"]');
    const cartItems = page.locator('[data-testid="cart-item"]');
    
    // Either show empty message or have no cart items
    if (await emptyMessage.count() > 0) {
      await expect(emptyMessage).toBeVisible();
    } else {
      // No items shown, which is also valid for empty cart
      expect(await cartItems.count()).toBe(0);
    }
  });

  test('should maintain cart state during page refresh', async ({ page }) => {
    // Add item to cart
    const addToCartButton = page.locator('[data-testid="add-to-cart"]').first();
    const cartBadge = page.locator('[data-testid="cart-count"]');
    
    await addToCartButton.click();
    
    // Get cart count after adding
    await expect(cartBadge).toBeVisible();
    const countText = await cartBadge.textContent();
    const cartCount = parseInt(countText || '0') || 0;
    
    expect(cartCount).toBeGreaterThan(0);
    
    // Refresh the page
    await page.reload();
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    // Cart count should persist
    await expect(cartBadge).toBeVisible();
    const persistedCountText = await cartBadge.textContent();
    const persistedCount = parseInt(persistedCountText || '0') || 0;
    expect(persistedCount).toBe(cartCount);
  });

  test('should allow adding product to cart with delivery option selected', async ({ page }) => {
    // Wait for products to load and click on first product
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Wait for product detail page to load
    await page.waitForTimeout(1000);
    
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
      
      // Add to cart
      const addToCartButton = page.locator('[data-testid="add-to-cart"]');
      await addToCartButton.click();
      
      // Verify cart was updated
      await expect(cartBadge).toBeVisible();
      const newCountText = await cartBadge.textContent();
      const newCount = parseInt(newCountText || '0') || 0;
      expect(newCount).toBeGreaterThan(initialCount);
      
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
      
      const addToCartButton = page.locator('[data-testid="add-to-cart"]');
      await addToCartButton.click();
      
      await expect(cartBadge).toBeVisible();
      const newCountText = await cartBadge.textContent();
      const newCount = parseInt(newCountText || '0') || 0;
      expect(newCount).toBeGreaterThan(initialCount);
    }
  });
});
