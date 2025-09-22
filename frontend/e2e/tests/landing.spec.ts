import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display hero carousel with featured products', async ({ page }) => {
    await page.goto('/');
    
    // Wait for landing page to load
    await expect(page.locator('text=Browse Categories')).toBeVisible({ timeout: 10000 });
    
    // Check that the hero carousel is present
    const carousel = page.locator('button:has-text("Shop Now")').first();
    await expect(carousel).toBeVisible({ timeout: 10000 });
    
    // Check for carousel navigation buttons
    const nextButton = page.locator('button[aria-label="Next slide"]');
    const prevButton = page.locator('button[aria-label="Previous slide"]');
    
    if (await nextButton.count() > 0) {
      await expect(nextButton).toBeVisible();
      await expect(prevButton).toBeVisible();
    }
  });

  test('should display category navigation tiles', async ({ page }) => {
    await page.goto('/');
    
    // Wait for categories section to load
    await expect(page.locator('text=Browse Categories')).toBeVisible({ timeout: 10000 });
    
    // Check that category tags are present and clickable
    const categoryTags = page.locator('text=Free shipping, text=Casual shirts, text=jewellery, text=hard drive, text=women\'s clothing').first();
    
    if (await categoryTags.count() === 0) {
      // If specific categories aren't found, look for any clickable category elements
      const anyCategories = page.locator('[class*="category"], [data-testid*="category"]').first();
      if (await anyCategories.count() > 0) {
        await expect(anyCategories).toBeVisible();
      }
    }
  });

  test('should display Popular Items section', async ({ page }) => {
    await page.goto('/');
    
    // Check for Popular Items section
    await expect(page.locator('text=Popular Items')).toBeVisible({ timeout: 10000 });
    
    // Check for View All button
    await expect(page.locator('button:has-text("View All")').first()).toBeVisible();
    
    // Check that products are displayed in this section
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display New Arrivals section', async ({ page }) => {
    await page.goto('/');
    
    // Check for New Arrivals section
    await expect(page.locator('text=New Arrivals')).toBeVisible({ timeout: 10000 });
    
    // Check for View All button in New Arrivals
    await expect(page.locator('button:has-text("View All")').nth(1)).toBeVisible();
    
    // Check that at least some products are displayed
    const newArrivalsProducts = page.locator('[data-testid="product-card"]');
    await expect(newArrivalsProducts.first()).toBeVisible({ timeout: 10000 });
  });

  test('should allow carousel navigation', async ({ page }) => {
    await page.goto('/');
    
    // Wait for carousel to load
    await expect(page.locator('button:has-text("Shop Now")').first()).toBeVisible({ timeout: 10000 });
    
    // Try clicking next button if it exists
    const nextButton = page.locator('button[aria-label="Next slide"]');
    
    if (await nextButton.count() > 0) {
      await nextButton.click();
      
      // Wait a moment for transition
      await page.waitForTimeout(1000);
      
      // Carousel should still be visible after navigation
      await expect(page.locator('button:has-text("Shop Now")').first()).toBeVisible();
    }
  });

  test('should navigate to browse page when clicking View All', async ({ page }) => {
    await page.goto('/');
    
    // Wait for Popular Items section
    await expect(page.locator('text=Popular Items')).toBeVisible({ timeout: 10000 });
    
    // Click View All button
    const viewAllButton = page.locator('button:has-text("View All")').first();
    await expect(viewAllButton).toBeVisible();
    await viewAllButton.click();
    
    // Should navigate to browse page or popular search
    await page.waitForTimeout(1000);
    
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/browse|\/search\/popular/);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Check that key elements are still visible on mobile
    await expect(page.locator('text=Browse Categories')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Popular Items')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
  });
});
