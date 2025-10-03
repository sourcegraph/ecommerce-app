import { test, expect } from '@playwright/test';

test.describe('Product Carousel', () => {
  test('should display carousel on homepage', async ({ page }) => {
    await page.goto('/');
    
    const carousel = page.locator('[data-testid="product-carousel"]');
    await expect(carousel).toBeVisible({ timeout: 10000 });
  });

  test('should show featured products in carousel', async ({ page }) => {
    await page.goto('/');
    
    const carousel = page.locator('[data-testid="product-carousel"]');
    await expect(carousel).toBeVisible({ timeout: 10000 });
    
    const slides = carousel.locator('.swiper-slide');
    const count = await slides.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(5);
  });

  test('should have navigation controls', async ({ page }) => {
    await page.goto('/');
    
    const carousel = page.locator('[data-testid="product-carousel"]');
    await expect(carousel).toBeVisible({ timeout: 10000 });
    
    await expect(carousel.locator('.swiper-button-next')).toBeVisible();
    await expect(carousel.locator('.swiper-button-prev')).toBeVisible();
  });

  test('should navigate to next slide when clicking next button', async ({ page }) => {
    await page.goto('/');
    
    const carousel = page.locator('[data-testid="product-carousel"]');
    await expect(carousel).toBeVisible({ timeout: 10000 });
    
    const slides = carousel.locator('.swiper-slide');
    const count = await slides.count();
    
    if (count > 1) {
      await carousel.evaluate(el => {
        const nextBtn = el.querySelector('.swiper-button-next') as HTMLElement;
        if (nextBtn) nextBtn.click();
      });
      
      await page.waitForTimeout(500);
      
      const activeSlide = carousel.locator('.swiper-slide-active');
      await expect(activeSlide).toBeVisible();
    }
  });

  test('should have pagination dots', async ({ page }) => {
    await page.goto('/');
    
    const carousel = page.locator('[data-testid="product-carousel"]');
    await expect(carousel).toBeVisible({ timeout: 10000 });
    
    const pagination = carousel.locator('.swiper-pagination');
    await expect(pagination).toBeVisible();
  });

  test('should show Shop Now button for each product', async ({ page }) => {
    await page.goto('/');
    
    const carousel = page.locator('[data-testid="product-carousel"]');
    await expect(carousel).toBeVisible({ timeout: 10000 });
    
    const shopNowButton = carousel.locator('a[href^="/products/"]').first();
    await expect(shopNowButton).toBeVisible();
    await expect(shopNowButton).toContainText('Shop Now');
  });

  test('should navigate to product detail when clicking Shop Now', async ({ page }) => {
    await page.goto('/');
    
    const carousel = page.locator('[data-testid="product-carousel"]');
    await expect(carousel).toBeVisible({ timeout: 10000 });
    
    const shopNowButton = carousel.locator('a[href^="/products/"]').first();
    const href = await shopNowButton.getAttribute('href');
    
    await shopNowButton.click();
    
    await expect(page).toHaveURL(new RegExp(href || ''));
  });

  test('should display product title and price', async ({ page }) => {
    await page.goto('/');
    
    const carousel = page.locator('[data-testid="product-carousel"]');
    await expect(carousel).toBeVisible({ timeout: 10000 });
    
    const activeSlide = carousel.locator('.swiper-slide-active');
    
    await expect(activeSlide).toContainText(/\w+/);
    
    const price = activeSlide.getByText(/\$\d+\.\d{2}/);
    await expect(price).toBeVisible();
  });

  test('should show FEATURED PRODUCT label', async ({ page }) => {
    await page.goto('/');
    
    const carousel = page.locator('[data-testid="product-carousel"]');
    await expect(carousel).toBeVisible({ timeout: 10000 });
    
    const activeSlide = carousel.locator('.swiper-slide-active');
    await expect(activeSlide.getByText('FEATURED PRODUCT')).toBeVisible();
  });
});
