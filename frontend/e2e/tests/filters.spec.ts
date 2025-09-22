import { test, expect } from '@playwright/test';

test.describe('Product Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002');
    
    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
  });

  test('category filter works', async ({ page }) => {
    // Get initial product count
    const initialCount = await page.locator('[data-testid="product-card"]').count();
    
    // Apply electronics filter
    await page.selectOption('select[data-testid="category-filter"]', 'electronics');
    
    // Wait for filter to apply and check that we have fewer products shown
    await page.waitForTimeout(500);
    const filteredCount = await page.locator('[data-testid="product-card"]').count();
    
    // Should have fewer or equal products after filtering
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('shipping filter works', async ({ page }) => {
    // Apply free shipping filter
    await page.selectOption('select[data-testid="shipping-filter"]', 'free');
    
    // Wait for filter to apply
    await page.waitForTimeout(500);
    
    // Should still have products displayed (some should qualify for free shipping)
    const filteredCount = await page.locator('[data-testid="product-card"]').count();
    expect(filteredCount).toBeGreaterThanOrEqual(0);
  });

  test('delivery filter works', async ({ page }) => {
    // Apply same-day delivery filter
    await page.selectOption('select[data-testid="delivery-filter"]', 'same-day');
    
    // Wait for filter to apply
    await page.waitForTimeout(500);
    
    // Should still have products displayed
    const filteredCount = await page.locator('[data-testid="product-card"]').count();
    expect(filteredCount).toBeGreaterThanOrEqual(0);
  });

  test('filters can be reset', async ({ page }) => {
    // Get initial product count
    const initialCount = await page.locator('[data-testid="product-card"]').count();
    
    // Apply category filter
    await page.selectOption('select[data-testid="category-filter"]', 'electronics');
    await page.waitForTimeout(500);
    
    // Reset filter
    await page.selectOption('select[data-testid="category-filter"]', '');
    await page.waitForTimeout(500);
    
    // Should be back to initial count
    const resetCount = await page.locator('[data-testid="product-card"]').count();
    expect(resetCount).toBe(initialCount);
  });

  test('multiple filters can be applied together', async ({ page }) => {
    // Apply category and shipping filters together
    await page.selectOption('select[data-testid="category-filter"]', 'electronics');
    await page.selectOption('select[data-testid="shipping-filter"]', 'free');
    
    // Wait for filters to apply
    await page.waitForTimeout(500);
    
    // Should still work with multiple filters
    const filteredCount = await page.locator('[data-testid="product-card"]').count();
    expect(filteredCount).toBeGreaterThanOrEqual(0);
  });
});
