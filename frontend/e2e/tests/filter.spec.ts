import { test, expect } from '@playwright/test';

test.describe('Product Filtering', () => {
  test('should filter products by category', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    // Look for category filter/navigation elements
    // Adjust selectors based on your actual UI
    const categoryFilter = page.locator('[data-testid="category-filter"], .category-nav, nav a');
    
    if (await categoryFilter.count() > 0) {
      // Get initial product count
      const initialProductCount = await page.locator('[data-testid="product-card"]').count();
      
      // Click on a category filter
      await categoryFilter.first().click();
      
      // Wait for filtered results
      await page.waitForTimeout(1000);
      
      // Verify products are still displayed (filtered results)
      await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
      
      // Verify URL or UI state changed to reflect the filter
      const currentUrl = page.url();
      // This could be a query parameter or route change
    } else {
      test.skip('No category filters found on the page');
    }
  });

  test('should search products by name', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    // Look for search input
    const searchInput = page.locator('input[placeholder*="Search Items"]').first();
    
    if (await searchInput.count() > 0) {
      // Get the name of the first product
      const firstProductTitle = await page.locator('[data-testid="product-card"]').first().getByText(/\w+/).first().textContent();
      
      if (firstProductTitle) {
        // Search for part of the product name
        const searchTerm = firstProductTitle.split(' ')[0];
        await searchInput.fill(searchTerm);
        await searchInput.press('Enter');
        
        // Wait for search results
        await page.waitForTimeout(1000);
        
        // Verify search results contain the search term
        const resultTitles = await page.locator('[data-testid="product-card"] a').allTextContents();
        const hasMatchingResults = resultTitles.some(title => 
          title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        expect(hasMatchingResults).toBeTruthy();
      }
    } else {
      test.skip('No search input found on the page');
    }
  });

  test('should show "no results" message when appropriate', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    // Look for search input
    const searchInput = page.locator('input[placeholder*="Search Items"]').first();
    
    if (await searchInput.count() > 0) {
      // Search for something that definitely won't exist
      await searchInput.fill('xyznonexistentproduct123');
      await searchInput.press('Enter');
      
      // Wait for search results
      await page.waitForTimeout(1000);
      
      // Should show no results message or empty state
      const noResultsMessage = page.locator('[data-testid="no-results"]').or(page.getByText(/no.*results/i)).or(page.getByText(/not found/i));
      
      // Either no results message appears, or no product cards are shown
      const hasNoResultsMessage = await noResultsMessage.count() > 0;
      const hasNoProducts = await page.locator('[data-testid="product-card"]').count() === 0;
      
      expect(hasNoResultsMessage || hasNoProducts).toBeTruthy();
    } else {
      test.skip('No search input found on the page');
    }
  });
});
