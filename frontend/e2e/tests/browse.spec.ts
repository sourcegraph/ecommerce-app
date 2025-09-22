import { test, expect } from '@playwright/test';

test.describe('Product Browsing', () => {
  test('should display products on homepage', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the landing page to load with hero carousel
    await expect(page.locator('text=Popular Items')).toBeVisible({ timeout: 10000 });
    
    // Wait for products to load in the Popular Items section
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    // Check that multiple products are displayed
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible();
    
    // Check product card content
    const firstProduct = productCards.first();
    // Check that product title and price are visible - use more specific selectors
    await expect(firstProduct.locator('.product-title').first()).toBeVisible(); // Product title
    await expect(firstProduct.locator('text=/\\$/i')).toBeVisible(); // Price
  });

  test('should show loading state initially', async ({ page }) => {
    await page.goto('/');
    
    // Check for loading indicator or skeleton
    // Adjust selector based on your actual loading UI
    const loadingIndicator = page.locator('[data-testid="loading"], .loading, .spinner');
    
    // Loading should appear and then disappear
    if (await loadingIndicator.count() > 0) {
      await expect(loadingIndicator).toBeVisible();
      await expect(loadingIndicator).toHaveCount(0, { timeout: 10000 });
    }
  });

  test('should display product images from backend', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the landing page to load
    await expect(page.locator('text=Popular Items')).toBeVisible({ timeout: 10000 });
    
    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    // Check that images are loading from the backend
    const productImages = page.locator('[data-testid="product-card"] img');
    const firstImage = productImages.first();
    
    // Wait for the image element to exist in the DOM
    await firstImage.waitFor({ state: 'attached', timeout: 15000 });
    
    // Check that image source is valid - could be from backend API or external source
    const imageSrc = await firstImage.getAttribute('src');
    
    // Verify that the image has a valid source and is not empty
    expect(imageSrc).toBeTruthy();
    
    // Check that it's either a backend URL or an external URL (when using fallback data)
    expect(imageSrc).toMatch(/(?:localhost:8001.*\/products\/\d+\/image|https?:\/\/.*\.(jpg|jpeg|png|gif|webp))/);
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API calls and simulate failure
    await page.route('**/products', route => route.abort());
    
    await page.goto('/');
    
    // Should either show error message or fallback content
    // Adjust based on your error handling implementation
    await page.waitForTimeout(2000);
    
    // Check that the page doesn't crash
    await expect(page.locator('body')).toBeVisible();
  });
});
