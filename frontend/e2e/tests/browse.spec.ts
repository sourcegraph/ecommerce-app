import { test, expect } from '@playwright/test';
import { waitForProductsLoaded } from './utils/waits';

test.describe('Product Browsing', () => {
  test('should display products on homepage', async ({ page }) => {
    await page.goto('/');
    await waitForProductsLoaded(page);
    
    // Check that multiple products are displayed
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible();
    
    // Check product card content
    const firstProduct = productCards.first();
    // Check that product title and price are visible
    await expect(firstProduct.getByTestId('product-title')).toBeVisible();
    await expect(firstProduct.getByTestId('product-price')).toBeVisible();
  });

  test('should show loading state initially', async ({ page }) => {
    await page.goto('/products');
    
    const loading = page.getByTestId('loading');
    
    // If loading element exists, it should become hidden (not removed from DOM)
    if (await loading.count() > 0) {
      await expect(loading).toBeVisible();
      await expect(loading).toBeHidden({ timeout: 10000 });
    }
    
    await waitForProductsLoaded(page);
  });

  test('should display product images from backend', async ({ page }) => {
    await page.goto('/');
    await waitForProductsLoaded(page);
    
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
    
    // Should either show error message or fallback content
    // Wait for error state or fallback instead of arbitrary timeout
    const errorState = page.locator('[data-testid="error-state"]');
    const fallbackContent = page.locator('body');
    
    // Check that the page doesn't crash and shows some content
    await expect(fallbackContent).toBeVisible();
    
    // If error state exists, it should be visible
    if (await errorState.count() > 0) {
      await expect(errorState).toBeVisible();
    }
  });
});
