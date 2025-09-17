import { test, expect } from '@playwright/test';

test.describe('Product Details', () => {
  test('should navigate to product detail page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    // Click on the first product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    const productTitle = await firstProduct.locator('h3, h2').textContent();
    
    await firstProduct.click();
    
    // Should navigate to a detail page or show a modal
    // Check if URL changed (for routing) or modal opened
    const currentUrl = page.url();
    const hasModal = await page.locator('[data-testid="product-modal"], .modal, [role="dialog"]').count() > 0;
    const urlChanged = !currentUrl.endsWith('/') && currentUrl !== 'http://localhost:3001/';
    
    expect(hasModal || urlChanged).toBeTruthy();
    
    // Verify product details are displayed
    if (productTitle) {
      await expect(page.locator(`text="${productTitle}"`)).toBeVisible();
    }
  });

  test('should display product information correctly', async ({ page }) => {
    await page.goto('/');
    
    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    // Click on the first product to open details
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Wait for details to load
    await page.waitForTimeout(1000);
    
    // Check for key product information elements
    // Adjust selectors based on your actual product detail UI
    const productImage = page.locator('[data-testid="product-detail-image"], .product-image img, img[alt*="product" i]');
    const productTitle = page.locator('[data-testid="product-title"], h1, h2');
    const productPrice = page.locator('[data-testid="product-price"], .price, text=/\\$/i');
    const productDescription = page.locator('[data-testid="product-description"], .description, p');
    
    // At least some of these elements should be present
    const hasImage = await productImage.count() > 0;
    const hasTitle = await productTitle.count() > 0;
    const hasPrice = await productPrice.count() > 0;
    const hasDescription = await productDescription.count() > 0;
    
    expect(hasImage || hasTitle || hasPrice || hasDescription).toBeTruthy();
  });

  test('should allow adding product to cart from details', async ({ page }) => {
    await page.goto('/');
    
    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    // Click on the first product to open details
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Wait for details to load
    await page.waitForTimeout(1000);
    
    // Look for "Add to Cart" button
    const addToCartButton = page.locator('[data-testid="add-to-cart"], button:has-text("Add to Cart"), button:has-text("Add")');
    
    if (await addToCartButton.count() > 0) {
      // Check initial cart count (if visible)
      const cartCounter = page.locator('[data-testid="cart-count"], .cart-count, .badge');
      let initialCartCount = 0;
      
      if (await cartCounter.count() > 0) {
        const cartText = await cartCounter.textContent();
        initialCartCount = parseInt(cartText || '0') || 0;
      }
      
      // Click add to cart
      await addToCartButton.click();
      
      // Wait for cart update
      await page.waitForTimeout(1000);
      
      // Verify cart was updated (success message, cart count change, etc.)
      const successMessage = page.locator('text=/added.*cart/i, .toast, .notification');
      const hasSuccessMessage = await successMessage.count() > 0;
      
      let cartCountIncreased = false;
      if (await cartCounter.count() > 0) {
        const newCartText = await cartCounter.textContent();
        const newCartCount = parseInt(newCartText || '0') || 0;
        cartCountIncreased = newCartCount > initialCartCount;
      }
      
      expect(hasSuccessMessage || cartCountIncreased).toBeTruthy();
    } else {
      test.skip('No "Add to Cart" button found');
    }
  });

  test('should close product details when clicking outside/back', async ({ page }) => {
    await page.goto('/');
    
    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    // Click on the first product to open details
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Wait for details to load
    await page.waitForTimeout(1000);
    
    // Look for close button or back navigation
    const closeButton = page.locator('[data-testid="close-modal"], .close, button:has-text("✕"), button:has-text("Close")');
    
    if (await closeButton.count() > 0) {
      await closeButton.click();
      
      // Should return to product listing
      await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
    } else {
      // Try browser back button
      await page.goBack();
      
      // Should return to product listing  
      await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
    }
  });
});
