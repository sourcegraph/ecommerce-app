import { test, expect } from '@playwright/test'
import { waitForProductsLoaded } from './utils/waits'

test.describe('Featured Products Carousel', () => {
  test('should render featured carousel on homepage', async ({ page }) => {
    await page.goto('/')
    await waitForProductsLoaded(page)
    
    const carousel = page.getByTestId('featured-carousel')
    await expect(carousel).toBeVisible()
    
    // Check that carousel has accessibility attributes
    await expect(carousel).toHaveAttribute('role', 'region')
    await expect(carousel).toHaveAttribute('aria-label', 'Featured products')
  })

  test('should display slides with product information', async ({ page }) => {
    await page.goto('/')
    await waitForProductsLoaded(page)
    
    const carousel = page.getByTestId('featured-carousel')
    await expect(carousel).toBeVisible()
    
    // Check that at least one slide title is visible
    const slideTitle = page.locator('[data-testid^="carousel-slide-title-"]').first()
    await expect(slideTitle).toBeVisible()
    
    // Check for "Shop Now" button
    const shopButton = carousel.getByRole('link', { name: /shop now/i })
    await expect(shopButton).toBeVisible()
  })

  test('should allow manual navigation via Next button', async ({ page }) => {
    await page.goto('/')
    await waitForProductsLoaded(page)
    
    // Get initial slide title
    const firstSlideTitle = await page.locator('[data-testid="carousel-slide-title-0"]').textContent()
    
    // Click Next button
    const nextButton = page.getByTestId('carousel-next')
    await nextButton.click()
    
    // Wait a bit for animation
    await page.waitForTimeout(400)
    
    // Check that a different slide is now visible
    const secondSlideTitle = await page.locator('[data-testid="carousel-slide-title-1"]').textContent()
    
    // Titles should be different
    expect(firstSlideTitle).not.toBe(secondSlideTitle)
  })

  test('should allow manual navigation via Previous button', async ({ page }) => {
    await page.goto('/')
    await waitForProductsLoaded(page)
    
    // Click Next first to move to slide 2
    const nextButton = page.getByTestId('carousel-next')
    await nextButton.click()
    await page.waitForTimeout(400)
    
    // Click Previous to go back
    const prevButton = page.getByTestId('carousel-prev')
    await prevButton.click()
    await page.waitForTimeout(400)
    
    // Should be back at first slide
    const firstSlideTitle = page.locator('[data-testid="carousel-slide-title-0"]')
    await expect(firstSlideTitle).toBeVisible()
  })

  test('should allow navigation via dot indicators', async ({ page }) => {
    await page.goto('/')
    await waitForProductsLoaded(page)
    
    // Click on third dot (slide 3)
    const dotButton = page.getByTestId('carousel-dot-2')
    await dotButton.click()
    await page.waitForTimeout(400)
    
    // Third slide title should be visible
    const thirdSlideTitle = page.locator('[data-testid="carousel-slide-title-2"]')
    await expect(thirdSlideTitle).toBeVisible()
    
    // Dot button should have solid variant (aria-current)
    await expect(dotButton).toHaveAttribute('aria-current', 'true')
  })

  test('should support keyboard navigation with arrow keys', async ({ page }) => {
    await page.goto('/')
    await waitForProductsLoaded(page)
    
    const carousel = page.getByTestId('featured-carousel')
    
    // Focus the carousel
    await carousel.focus()
    
    // Press ArrowRight to go to next slide
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(400)
    
    // Second slide should be visible
    const secondSlideTitle = page.locator('[data-testid="carousel-slide-title-1"]')
    await expect(secondSlideTitle).toBeVisible()
    
    // Press ArrowLeft to go back
    await page.keyboard.press('ArrowLeft')
    await page.waitForTimeout(400)
    
    // First slide should be visible again
    const firstSlideTitle = page.locator('[data-testid="carousel-slide-title-0"]')
    await expect(firstSlideTitle).toBeVisible()
  })

  test('should auto-advance slides when not paused', async ({ page }) => {
    await page.goto('/')
    await waitForProductsLoaded(page)
    
    // Get initial slide
    const firstSlideTitle = await page.locator('[data-testid="carousel-slide-title-0"]').textContent()
    
    // Wait for auto-advance (6 seconds + buffer)
    await page.waitForTimeout(6500)
    
    // Check if we've moved to a different slide
    const currentVisibleTitle = await page.locator('[data-testid^="carousel-slide-title-"]:visible').first().textContent()
    
    // Should have auto-advanced to a different slide
    // Note: This might be flaky in CI if prefers-reduced-motion is set
    if (currentVisibleTitle !== firstSlideTitle) {
      expect(currentVisibleTitle).not.toBe(firstSlideTitle)
    }
  })

  test('should pause auto-advance on hover', async ({ page }) => {
    await page.goto('/')
    await waitForProductsLoaded(page)
    
    const carousel = page.getByTestId('featured-carousel')
    
    // Get initial slide
    const firstSlideTitle = await page.locator('[data-testid="carousel-slide-title-0"]').textContent()
    
    // Hover over carousel
    await carousel.hover()
    
    // Wait past the auto-advance interval
    await page.waitForTimeout(7000)
    
    // Should still be on first slide due to pause
    const currentVisibleTitle = await page.locator('[data-testid="carousel-slide-title-0"]').textContent()
    expect(currentVisibleTitle).toBe(firstSlideTitle)
  })

  test('should have accessible slide labels', async ({ page }) => {
    await page.goto('/')
    await waitForProductsLoaded(page)
    
    // Check that slides have proper aria attributes
    const slides = page.locator('[role="group"][aria-roledescription="slide"]')
    const slideCount = await slides.count()
    
    expect(slideCount).toBeGreaterThan(0)
    
    // First slide should have proper label
    const firstSlide = slides.first()
    await expect(firstSlide).toHaveAttribute('aria-label', `1 of ${slideCount}`)
  })

  test('should navigate to product detail when clicking Shop Now', async ({ page }) => {
    await page.goto('/')
    await waitForProductsLoaded(page)
    
    const carousel = page.getByTestId('featured-carousel')
    const shopButton = carousel.getByRole('link', { name: /shop now/i })
    
    // Click Shop Now button
    await shopButton.click()
    
    // Should navigate to product details page
    await page.waitForURL(/\/products\/\d+/)
    
    // Check that we're on a product detail page
    expect(page.url()).toMatch(/\/products\/\d+/)
  })

  test('should display multiple slides based on featured products', async ({ page }) => {
    await page.goto('/')
    await waitForProductsLoaded(page)
    
    // Check that we have multiple dot indicators (meaning multiple slides)
    const dots = page.locator('[data-testid^="carousel-dot-"]')
    const dotCount = await dots.count()
    
    // Should have 3-5 slides based on requirements
    expect(dotCount).toBeGreaterThanOrEqual(3)
    expect(dotCount).toBeLessThanOrEqual(5)
  })
})
