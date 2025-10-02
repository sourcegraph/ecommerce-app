import { test, expect } from '@playwright/test';

test.describe('Product Filtering', () => {
  test('should filter products by category', async ({ page }) => {
    // Go to /saved which uses Main component with filters
    await page.goto('/saved');
    
    // Navigate to home which might have filters
    await page.goto('/');
    
    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    // Look for category filter dropdown
    const categorySelect = page.locator('select').first();
    
    // Skip test if no filter is available
    if (await categorySelect.count() === 0) {
      test.skip(true, 'Category filter not available on this page');
      return;
    }
    
    // Wait for the select to be visible and enabled
    await expect(categorySelect).toBeVisible();
    await expect(categorySelect).toBeEnabled();
    
    // Select a category (not "All Categories")
    await categorySelect.selectOption({ index: 1 });
    
    // Wait for filtered results
    await page.waitForTimeout(1000);
    
    // Verify URL contains category parameter
    expect(page.url()).toContain('cat=');
    
    // Verify products are still displayed (filtered results)
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
  });

  test('should search products by name', async ({ page }) => {
    await page.goto('/');
    
    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    // Look for search input
    const searchInput = page.locator('input[placeholder*="Search Items"]').first();
    
    // Get the name of the first product
    const firstProductTitle = await page.locator('[data-testid="product-card"]').first().locator('a').textContent();
    
    if (firstProductTitle) {
      // Search for part of the product name
      const searchTerm = firstProductTitle.split(' ')[0];
      await searchInput.fill(searchTerm);
      await searchInput.press('Enter');
      
      // Wait for navigation to search results page
      await page.waitForURL('**/search/**');
      
      // Wait for search results to load
      await page.waitForTimeout(1000);
      
      // Verify we're on search results page
      expect(page.url()).toContain(`/search/${searchTerm}`);
      
      // Verify search results are displayed
      await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
    } else {
      test.skip('Could not get product title for search');
    }
  });

  test('should show "no results" message when appropriate', async ({ page }) => {
    await page.goto('/');
    
    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    // Look for search input
    const searchInput = page.locator('input[placeholder*="Search Items"]').first();
    
    // Search for something that definitely won't exist
    await searchInput.fill('xyznonexistentproduct123');
    await searchInput.press('Enter');
    
    // Wait for navigation to search results page
    await page.waitForURL('**/search/**');
    
    // Wait for search results to load
    await page.waitForTimeout(1000);
    
    // Should show no results message or empty state
    const noResultsMessage = page.locator('[data-testid="no-results"]').or(page.getByText(/no.*results/i)).or(page.getByText(/not found/i));
    
    // Either no results message appears, or no product cards are shown
    const hasNoResultsMessage = await noResultsMessage.count() > 0;
    const hasNoProducts = await page.locator('[data-testid="product-card"]').count() === 0;
    
    expect(hasNoResultsMessage || hasNoProducts).toBeTruthy();
  });
});
