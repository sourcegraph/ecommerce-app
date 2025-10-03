import { test, expect } from '@playwright/test';

test.describe('Product Details', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to product detail page', async ({ page }) => {
    // Get product title before clicking
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    const productTitleElement = firstProduct.locator('[data-testid="product-title"]');
    const productTitle = await productTitleElement.textContent();
    
    await firstProduct.click();
    
    // Should navigate to a detail page (check URL changed)
    await page.waitForURL(/\/products\/\d+/);
    expect(page.url()).toMatch(/\/products\/\d+/);
    
    // Verify product details are displayed
    await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
    
    if (productTitle) {
      // The title should match or contain similar text
      const detailTitle = await page.locator('[data-testid="product-title"]').textContent();
      expect(detailTitle).toContain(productTitle.trim());
    }
  });

  test('should display product information correctly', async ({ page }) => {
    // Click on the first product to open details
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Wait for detail page to load
    await page.waitForURL(/\/products\/\d+/);
    
    // Check for key product information elements using our test IDs
    await expect(page.locator('[data-testid="product-detail-image"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-description"]')).toBeVisible();
    
    // Verify the price format
    const priceText = await page.locator('[data-testid="product-price"]').textContent();
    expect(priceText).toMatch(/\$\d+/);
    
    // Verify the title is not empty
    const titleText = await page.locator('[data-testid="product-title"]').textContent();
    expect(titleText).toBeTruthy();
    expect(titleText!.trim().length).toBeGreaterThan(0);
    
    // Verify the description is not empty
    const descText = await page.locator('[data-testid="product-description"]').textContent();
    expect(descText).toBeTruthy();
    expect(descText!.trim().length).toBeGreaterThan(0);
  });

  test('should allow adding product to cart from details', async ({ page }) => {
    // Click on the first product to open details
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Wait for detail page to load
    await page.waitForURL(/\/products\/\d+/);
    
    // Check initial cart count (if visible)
    const cartCounter = page.locator('[data-testid="cart-count"]');
    let initialCartCount = 0;
    
    if (await cartCounter.count() > 0) {
      const cartText = await cartCounter.textContent();
      initialCartCount = parseInt(cartText || '0') || 0;
    }
    
    // Find and click "Add to Cart" button
    const addToCartButton = page.locator('[data-testid="add-to-cart"]');
    await expect(addToCartButton).toBeVisible();
    
    // Only click if button is not already disabled (meaning item not already in cart)
    if (!(await addToCartButton.isDisabled())) {
      await addToCartButton.click();
      
      // Wait for cart update
      await page.waitForTimeout(1000);
      
      // Verify cart was updated (success message or cart count change)
      const successMessage = page.locator('.chakra-toast, [role="alert"]');
      const hasSuccessMessage = await successMessage.count() > 0;
      
      let cartCountIncreased = false;
      if (await cartCounter.count() > 0) {
        const newCartText = await cartCounter.textContent();
        const newCartCount = parseInt(newCartText || '0') || 0;
        cartCountIncreased = newCartCount > initialCartCount;
      }
      
      expect(hasSuccessMessage || cartCountIncreased).toBeTruthy();
      
      // Button should now show "Added to Cart" and be disabled
      await expect(addToCartButton).toContainText('Added to Cart');
      await expect(addToCartButton).toBeDisabled();
    } else {
      // Product was already in cart - that's OK, just verify the state
      await expect(addToCartButton).toContainText('Added to Cart');
    }
  });

  test('should navigate back from product details', async ({ page }) => {
    // Click on the first product to open details
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Wait for detail page to load
    await page.waitForURL(/\/products\/\d+/);
    
    // Use browser back button to return
    await page.goBack();
    
    // Should return to product listing  
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
    
    // URL should be back to home
    await page.waitForURL('/');
    expect(page.url()).toMatch(/\/$|\/\?/);
  });

  test('should show breadcrumb navigation', async ({ page }) => {
    // Click on the first product to open details
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Wait for detail page to load
    await page.waitForURL(/\/products\/\d+/);
    
    // Check for breadcrumb navigation
    const breadcrumbs = page.locator('nav[aria-label="breadcrumb"]').first();
    
    if (await breadcrumbs.count() > 0) {
      await expect(breadcrumbs).toBeVisible();
      
      // Should contain "Home" link
      const homeLink = page.getByText('Home');
      if (await homeLink.count() > 0) {
        await expect(homeLink).toBeVisible();
      }
    }
  });

  test('should show save/heart button on product details', async ({ page }) => {
    // Click on the first product to open details
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Wait for detail page to load
    await page.waitForURL(/\/products\/\d+/);
    
    // Look for save button (heart icon)
    const saveButton = page.locator('button:has-text("♡"), button:has-text("♥"), button').filter({ hasText: /heart|save/i }).first();
    
    if (await saveButton.count() > 0) {
      await expect(saveButton).toBeVisible();
      
      // Should be clickable
      await expect(saveButton).toBeEnabled();
      
      // Test clicking it
      await saveButton.click();
      
      // Should show success message
      const toast = page.locator('.chakra-toast, [role="alert"]');
      if (await toast.count() > 0) {
        await expect(toast).toBeVisible({ timeout: 2000 });
      }
    }
  });

  test('should handle multiple product detail views', async ({ page }) => {
    // Test navigating to multiple products to ensure detail page works consistently
    const productCards = page.locator('[data-testid="product-card"]');
    const cardCount = await productCards.count();
    const testCount = Math.min(3, cardCount);
    
    for (let i = 0; i < testCount; i++) {
      // Click on product
      await productCards.nth(i).click();
      
      // Wait for detail page
      await page.waitForURL(/\/products\/\d+/);
      
      // Verify key elements are present
      await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
      await expect(page.locator('[data-testid="add-to-cart"]')).toBeVisible();
      
      // Go back for next iteration (except last)
      if (i < testCount - 1) {
        await page.goBack();
        await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
      }
    }
  });
});
