import { test, expect } from '@playwright/test';

test.describe('Product Browsing', () => {
  test('should display products on homepage', async ({ page }) => {
    await page.goto('/');
    
    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    // Check that multiple products are displayed
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards).toHaveCount({ min: 1 });
    
    // Check product card content
    const firstProduct = productCards.first();
    await expect(firstProduct.locator('img')).toBeVisible();
    await expect(firstProduct.locator('h3, h2')).toBeVisible(); // Product title
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
    
    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    // Check that images are loading from the backend
    const productImages = page.locator('[data-testid="product-card"] img');
    const firstImage = productImages.first();
    
    // Wait for image to load
    await expect(firstImage).toBeVisible();
    
    // Check that image source contains the backend URL
    const imageSrc = await firstImage.getAttribute('src');
    expect(imageSrc).toMatch(/localhost:8001.*\/products\/\d+\/image/);
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
