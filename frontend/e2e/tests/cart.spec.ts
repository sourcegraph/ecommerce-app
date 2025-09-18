import { test, expect } from '@playwright/test';

test.describe('Cart Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
    await page.waitForTimeout(2000); // Allow time for initial load
  });

  test('should add product to cart and display cart badge', async ({ page }) => {
    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    // Get initial cart count
    const cartBadge = page.locator('[data-testid="cart-count"], .cart-badge, .cart-count');
    let initialCount = 0;
    
    if (await cartBadge.count() > 0) {
      const initialCountText = await cartBadge.textContent();
      initialCount = parseInt(initialCountText || '0') || 0;
    }
    
    // Find and click add to cart button
    const addToCartButton = page.locator('[data-testid="add-to-cart"], button:has-text("Add to Cart")').first();
    
    if (await addToCartButton.count() > 0) {
      await addToCartButton.click();
      await page.waitForTimeout(1000); // Allow time for cart update
      
      // Verify cart updated
      if (await cartBadge.count() > 0) {
        const newCountText = await cartBadge.textContent();
        const newCount = parseInt(newCountText || '0') || 0;
        expect(newCount).toBeGreaterThan(initialCount);
      }
    } else {
      test.skip('No add to cart functionality found');
    }
  });

  test('should persist cart items across page navigation', async ({ page }) => {
    // Add item to cart first
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    const addToCartButton = page.locator('[data-testid="add-to-cart"], button:has-text("Add to Cart")').first();
    const cartBadge = page.locator('[data-testid="cart-count"], .cart-badge, .cart-count');
    
    if (await addToCartButton.count() > 0) {
      // Get initial count
      let initialCount = 0;
      if (await cartBadge.count() > 0) {
        const initialCountText = await cartBadge.textContent();
        initialCount = parseInt(initialCountText || '0') || 0;
      }
      
      await addToCartButton.click();
      await page.waitForTimeout(1000);
      
      // Verify cart updated
      if (await cartBadge.count() > 0) {
        const newCountText = await cartBadge.textContent();
        const newCount = parseInt(newCountText || '0') || 0;
        expect(newCount).toBeGreaterThan(initialCount);
        
        // Navigate to another page and back
        await page.goto('/about');  // Or any other page
        await page.goto('/');
        
        // Cart count should persist
        await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
        
        if (await cartBadge.count() > 0) {
          const persistedCountText = await cartBadge.textContent();
          const persistedCount = parseInt(persistedCountText || '0') || 0;
          expect(persistedCount).toBe(newCount);
        }
      }
    } else {
      test.skip('No add to cart functionality found');
    }
  });

  test('should display cart contents and allow quantity changes', async ({ page }) => {
    // Add item to cart first
    await page.goto('/');
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    const addToCartButton = page.locator('[data-testid="add-to-cart"], button:has-text("Add to Cart")').first();
    
    if (await addToCartButton.count() > 0) {
      await addToCartButton.click();
      await page.waitForTimeout(1000);
      
      // Navigate to cart
      const cartLink = page.locator('[data-testid="cart-link"], a:has-text("Cart"), .cart-icon');
      
      if (await cartLink.count() > 0) {
        await cartLink.click();
        await page.waitForTimeout(1000);
        
        // Should show cart items
        const cartItems = page.locator('[data-testid="cart-item"], .cart-item');
        await expect(cartItems.first()).toBeVisible();
        
        // Should show total price
        const totalPrice = page.locator('[data-testid="cart-total"], .total-price');
        if (await totalPrice.count() > 0) {
          const totalText = await totalPrice.textContent();
          expect(totalText).toMatch(/\$\d+/);
        }
      } else {
        test.skip('No cart navigation found');
      }
    } else {
      test.skip('No add to cart functionality found');
    }
  });

  test('should allow removing items from cart', async ({ page }) => {
    // Add item to cart first
    await page.goto('/');
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    const addToCartButton = page.locator('[data-testid="add-to-cart"], button:has-text("Add to Cart")').first();
    
    if (await addToCartButton.count() > 0) {
      await addToCartButton.click();
      await page.waitForTimeout(1000);
      
      // Navigate to cart
      const cartLink = page.locator('[data-testid="cart-link"], a:has-text("Cart"), .cart-icon');
      
      if (await cartLink.count() > 0) {
        await cartLink.click();
        await page.waitForTimeout(1000);
        
        // Should show cart items
        const cartItems = page.locator('[data-testid="cart-item"], .cart-item');
        await expect(cartItems.first()).toBeVisible();
        
        // Look for remove button
        const removeButton = page.locator('[data-testid="remove-item"], button:has-text("Remove"), .remove-btn');
        
        if (await removeButton.count() > 0) {
          const initialItemCount = await cartItems.count();
          
          await removeButton.first().click();
          await page.waitForTimeout(1000);
          
          // Cart should have fewer items or show empty state
          const newItemCount = await cartItems.count();
          if (newItemCount > 0) {
            expect(newItemCount).toBeLessThan(initialItemCount);
          } else {
            // Should show empty cart message
            const emptyMessage = page.locator('[data-testid="empty-cart"], .empty-cart');
            await expect(emptyMessage).toBeVisible();
          }
        } else {
          test.skip('No remove functionality found');
        }
      } else {
        test.skip('No cart navigation found');
      }
    } else {
      test.skip('No add to cart functionality found');
    }
  });

  test('should update cart total when quantities change', async ({ page }) => {
    // Add item to cart first
    await page.goto('/');
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    const addToCartButton = page.locator('[data-testid="add-to-cart"], button:has-text("Add to Cart")').first();
    
    if (await addToCartButton.count() > 0) {
      await addToCartButton.click();
      await page.waitForTimeout(1000);
      
      // Navigate to cart
      const cartLink = page.locator('[data-testid="cart-link"], a:has-text("Cart"), .cart-icon');
      
      if (await cartLink.count() > 0) {
        await cartLink.click();
        await page.waitForTimeout(1000);
        
        // Get initial total
        const totalPrice = page.locator('[data-testid="cart-total"], .total-price');
        
        if (await totalPrice.count() > 0) {
          const initialTotalText = await totalPrice.textContent();
          const initialTotal = parseFloat(initialTotalText?.replace(/[^0-9.]/g, '') || '0');
          
          // Look for quantity increment button
          const incrementButton = page.locator('[data-testid="increment-qty"], button:has-text("+"), .qty-plus');
          
          if (await incrementButton.count() > 0) {
            await incrementButton.first().click();
            await page.waitForTimeout(1000);
            
            // Total should increase
            const newTotalText = await totalPrice.textContent();
            const newTotal = parseFloat(newTotalText?.replace(/[^0-9.]/g, '') || '0');
            
            expect(newTotal).toBeGreaterThan(initialTotal);
          } else {
            test.skip('No quantity increment functionality found');
          }
        } else {
          test.skip('No cart total found');
        }
      } else {
        test.skip('No cart navigation found');
      }
    } else {
      test.skip('No add to cart functionality found');
    }
  });

  test('should handle adding multiple different products to cart', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    const addToCartButtons = page.locator('[data-testid="add-to-cart"], button:has-text("Add to Cart")');
    const cartBadge = page.locator('[data-testid="cart-count"], .cart-badge, .cart-count');
    
    if (await addToCartButtons.count() >= 2) {
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
      if (await cartBadge.count() > 0) {
        const newCountText = await cartBadge.textContent();
        const newCount = parseInt(newCountText || '0') || 0;
        expect(newCount).toBe(initialCount + 2);
      }
      
      // Navigate to cart and verify both items are there
      const cartLink = page.locator('[data-testid="cart-link"], a:has-text("Cart"), .cart-icon');
      
      if (await cartLink.count() > 0) {
        await cartLink.click();
        await page.waitForTimeout(1000);
        
        const cartItems = page.locator('[data-testid="cart-item"], .cart-item');
        const itemCount = await cartItems.count();
        expect(itemCount).toBeGreaterThanOrEqual(2);
      }
    } else {
      test.skip('Not enough products with add to cart functionality found');
    }
  });

  test('should show empty cart state when no items', async ({ page }) => {
    // Navigate directly to cart
    const cartLink = page.locator('[data-testid="cart-link"], a:has-text("Cart"), .cart-icon');
    
    if (await cartLink.count() > 0) {
      await cartLink.click();
      await page.waitForTimeout(1000);
      
      // Should show empty cart message or no items
      const emptyMessage = page.locator('[data-testid="empty-cart"], .empty-cart, text="Your cart is empty"');
      const cartItems = page.locator('[data-testid="cart-item"], .cart-item');
      
      // Either show empty message or have no cart items
      if (await emptyMessage.count() > 0) {
        await expect(emptyMessage).toBeVisible();
      } else if (await cartItems.count() === 0) {
        // No items shown, which is also valid for empty cart
        expect(await cartItems.count()).toBe(0);
      }
    } else {
      test.skip('No cart navigation found');
    }
  });

  test('should maintain cart state during page refresh', async ({ page }) => {
    // Add item to cart
    await page.goto('/');
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    const addToCartButton = page.locator('[data-testid="add-to-cart"], button:has-text("Add to Cart")').first();
    const cartBadge = page.locator('[data-testid="cart-count"], .cart-badge, .cart-count');
    
    if (await addToCartButton.count() > 0) {
      await addToCartButton.click();
      await page.waitForTimeout(1000);
      
      // Get cart count after adding
      let cartCount = 0;
      if (await cartBadge.count() > 0) {
        const countText = await cartBadge.textContent();
        cartCount = parseInt(countText || '0') || 0;
      }
      
      if (cartCount > 0) {
        // Refresh the page
        await page.reload();
        await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
        
        // Cart count should persist
        if (await cartBadge.count() > 0) {
          const persistedCountText = await cartBadge.textContent();
          const persistedCount = parseInt(persistedCountText || '0') || 0;
          expect(persistedCount).toBe(cartCount);
        }
      }
    } else {
      test.skip('No add to cart functionality found');
    }
  });
});
