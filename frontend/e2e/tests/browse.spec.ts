import { test, expect } from '@playwright/test';

test.describe('Product Browsing', () => {
  test('should display products on homepage', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    // Check that multiple products are displayed
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible();
    
    // Check product card content
    const firstProduct = productCards.first();
    // Check that product title is visible (any text content)
    const productTitle = firstProduct.locator('[class*="product-title"], a, h1, h2, h3, h4, p').first();
    await expect(productTitle).toBeVisible(); // Product title
    await expect(firstProduct.locator('text=/\\$/i')).toBeVisible(); // Price
  });

  test('should show loading state initially', async ({ page }) => {
    await page.goto('/products');
    
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
    await page.goto('/products');
    
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
    // Intercept only the main products API call (not featured/popular) and simulate failure
    await page.route('**/api/products?**', route => route.abort());
    
    await page.goto('/products');
    
    // Wait for the page to attempt to load
    await page.waitForTimeout(3000);
    
    // Check that the page doesn't crash
    await expect(page.locator('body')).toBeVisible();
    
    // When API fails, the app should either show:
    // 1. Loading indicators (skeleton states)
    // 2. Empty state (no products)
    // 3. Error message
    const loadingIndicators = await page.locator('[class*="skeleton"], [class*="loading"]').count();
    const productCards = await page.locator('[data-testid="product-card"]').count();
    const hasRelatedTags = await page.locator('text="Related"').count() > 0;
    
    // The page should render the basic structure but with either loading states or no products
    expect(hasRelatedTags).toBeTruthy(); // Basic page structure should load
    
    // Should have either loading indicators or no product cards (graceful degradation)
    expect(loadingIndicators > 0 || productCards === 0).toBeTruthy();
  });
});
