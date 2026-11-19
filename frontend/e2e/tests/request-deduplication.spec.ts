import { test, expect } from '@playwright/test'

test.describe('API Request Deduplication', () => {
  test('should not make duplicate concurrent requests on homepage', async ({ page }) => {
    const requests: { url: string; timestamp: number }[] = []

    // Track all API requests
    page.on('request', (request) => {
      const url = request.url()
      if (url.includes('/products') || url.includes('/categories')) {
        requests.push({
          url: url.replace(/^https?:\/\/[^/]+/, ''), // Remove base URL for easier comparison
          timestamp: Date.now(),
        })
      }
    })

    await page.goto('/')

    // Wait for page to fully load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({
      timeout: 10000,
    })

    // Wait a bit more for any delayed requests
    await page.waitForTimeout(2000)

    // Group requests by URL
    const requestsByUrl = requests.reduce(
      (acc, req) => {
        acc[req.url] = (acc[req.url] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    // Check for specific duplicate patterns from issue #80
    const productsWithSummary = Object.entries(requestsByUrl).filter(([url]) =>
      url.includes('/products?include_delivery_summary=true')
    )
    const categoriesRequests = Object.entries(requestsByUrl).filter(([url]) =>
      url.includes('/api/categories')
    )
    const productsSorted = Object.entries(requestsByUrl).filter(
      ([url]) => url.includes('/api/products?') && url.includes('sort=')
    )

    // Assert: Each unique endpoint should be called exactly once
    productsWithSummary.forEach(([url, count]) => {
      expect(count, `Expected 1 request to ${url}, but found ${count}`).toBe(1)
    })

    categoriesRequests.forEach(([url, count]) => {
      expect(count, `Expected 1 request to ${url}, but found ${count}`).toBe(1)
    })

    productsSorted.forEach(([url, count]) => {
      expect(count, `Expected 1 request to ${url}, but found ${count}`).toBe(1)
    })

    // Log all requests for debugging if test fails
    console.log('All API requests:', JSON.stringify(requestsByUrl, null, 2))
  })

  test('should not make duplicate concurrent requests on product detail page', async ({ page }) => {
    const requests: { url: string; timestamp: number }[] = []

    // Track all API requests
    page.on('request', (request) => {
      const url = request.url()
      if (url.includes('/products')) {
        requests.push({
          url: url.replace(/^https?:\/\/[^/]+/, ''),
          timestamp: Date.now(),
        })
      }
    })

    // Navigate to homepage first
    await page.goto('/')
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({
      timeout: 10000,
    })

    // Clear request tracking before navigating to detail page
    requests.length = 0

    // Click on first product to go to detail page
    await page.locator('[data-testid="product-card"]').first().click()
    await page.waitForURL(/\/products\/\d+/)

    // Wait for detail page to fully load
    await expect(page.locator('[data-testid="product-title"]')).toBeVisible()
    await page.waitForTimeout(2000)

    // Group requests by URL
    const requestsByUrl = requests.reduce(
      (acc, req) => {
        acc[req.url] = (acc[req.url] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    // Check for duplicate product detail requests (issue #80: GET /products/{id} called 2x)
    const productDetailRequests = Object.entries(requestsByUrl).filter(
      ([url]) => url.match(/\/products\/\d+$/) // Match /products/{id} without query params
    )

    // Assert: Product detail endpoint should be called exactly once
    productDetailRequests.forEach(([url, count]) => {
      expect(count, `Expected 1 request to ${url}, but found ${count}`).toBe(1)
    })

    // Log all requests for debugging if test fails
    console.log('Product detail page API requests:', JSON.stringify(requestsByUrl, null, 2))
  })

  test('should deduplicate rapid navigation requests', async ({ page }) => {
    const requests: Map<string, number[]> = new Map()

    // Track all API requests with timestamps
    page.on('request', (request) => {
      const url = request.url()
      if (url.includes('/products') || url.includes('/categories')) {
        const cleanUrl = url.replace(/^https?:\/\/[^/]+/, '')
        if (!requests.has(cleanUrl)) {
          requests.set(cleanUrl, [])
        }
        requests.get(cleanUrl)!.push(Date.now())
      }
    })

    // Trigger rapid navigation that might cause duplicate requests
    await page.goto('/')
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({
      timeout: 10000,
    })

    // Navigate to a product and back quickly
    await page.locator('[data-testid="product-card"]').first().click()
    await page.waitForURL(/\/products\/\d+/)
    await page.goBack()
    await page.waitForURL('/')
    await page.waitForTimeout(1000)

    // Check for concurrent duplicate requests (requests within 100ms of each other)
    requests.forEach((timestamps, url) => {
      const sortedTimestamps = [...timestamps].sort((a, b) => a - b)
      for (let i = 1; i < sortedTimestamps.length; i++) {
        const timeDiff = sortedTimestamps[i] - sortedTimestamps[i - 1]
        expect(
          timeDiff,
          `Found concurrent duplicate requests to ${url} (${timeDiff}ms apart). Deduplication should prevent this.`
        ).toBeGreaterThan(100)
      }
    })
  })
})
