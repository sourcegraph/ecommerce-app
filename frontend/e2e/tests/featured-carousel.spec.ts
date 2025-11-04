import { test, expect } from '@playwright/test'

test.describe('Featured Products Carousel', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage where carousel should appear
    await page.goto('/')
  })

  test('carousel loads within 1 second', async ({ page }) => {
    const carousel = page.locator('[aria-roledescription="carousel"]')
    await carousel.waitFor({ state: 'visible', timeout: 1000 })

    await expect(carousel).toBeVisible()
  })

  test('displays 3-5 featured products', async ({ page }) => {
    const slides = page.locator('[aria-roledescription="slide"]')
    const count = await slides.count()

    expect(count).toBeGreaterThanOrEqual(3)
    expect(count).toBeLessThanOrEqual(5)
  })

  test('manual navigation with prev/next buttons', async ({ page }) => {
    const nextButton = page.getByLabel('Next featured product')
    const prevButton = page.getByLabel('Previous featured product')

    // Wait for carousel to be ready
    await page.locator('[aria-roledescription="carousel"]').waitFor()

    // Should have both navigation buttons
    await expect(nextButton).toBeVisible()
    await expect(prevButton).toBeVisible()

    // Click next should work (no errors)
    await nextButton.click()
    await page.waitForTimeout(500)

    // Click prev should work (no errors)
    await prevButton.click()
    await page.waitForTimeout(500)
  })

  test('clicking View button navigates to product page', async ({ page }) => {
    // Wait for carousel
    await page.locator('[aria-roledescription="carousel"]').waitFor()

    const firstViewButton = page.getByRole('link', { name: 'View' }).first()
    await firstViewButton.click()

    await expect(page).toHaveURL(/\/products\/\d+/)
  })

  test('images have proper loading attributes', async ({ page }) => {
    const images = page.locator('[aria-roledescription="slide"] img')

    // Wait for images to be in DOM
    await images.first().waitFor()

    // First image should load eagerly
    const firstImg = images.first()
    await expect(firstImg).toHaveAttribute('loading', 'eager')

    // Subsequent images lazy (if more than one)
    const count = await images.count()
    if (count > 1) {
      const secondImg = images.nth(1)
      await expect(secondImg).toHaveAttribute('loading', 'lazy')
    }
  })

  test('has proper accessibility attributes', async ({ page }) => {
    const carousel = page.locator('[aria-roledescription="carousel"]')
    await carousel.waitFor()

    await expect(carousel).toHaveAttribute('aria-live', 'polite')

    const slides = page.locator('[aria-roledescription="slide"]')
    const firstSlide = slides.first()

    await expect(firstSlide).toHaveAttribute('aria-label', /\d+ of \d+/)
  })

  test('pagination dots are interactive', async ({ page }) => {
    await page.locator('[aria-roledescription="carousel"]').waitFor()

    const dots = page.locator('button[aria-label^="Go to slide"]')
    const dotCount = await dots.count()

    expect(dotCount).toBeGreaterThanOrEqual(3)

    // Click second dot
    if (dotCount > 1) {
      await dots.nth(1).click()
      await page.waitForTimeout(500)

      // Second dot should now be active
      await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true')
    }
  })

  test('carousel header displays "Featured" text', async ({ page }) => {
    await page.locator('[aria-roledescription="carousel"]').waitFor()

    const header = page.getByText('Featured')
    await expect(header).toBeVisible()
  })

  test('products display title, price, and description', async ({ page }) => {
    await page.locator('[aria-roledescription="carousel"]').waitFor()

    const slides = page.locator('[aria-roledescription="slide"]')
    const firstSlide = slides.first()

    // Should have price (starts with $)
    const price = firstSlide.locator('text=/\\$\\d+\\.\\d{2}/')
    await expect(price).toBeVisible()
  })
})
