import { test, expect } from '@playwright/test'

test.describe('Request Deduplication', () => {
  test('should deduplicate concurrent GET /products?include_delivery_summary=true on home page', async ({
    page,
  }) => {
    const requests: string[] = []

    // Track all network requests
    page.on('request', (request) => {
      const url = request.url()
      if (url.includes('/products?include_delivery_summary=true')) {
        requests.push(url)
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Should only have ONE request, not multiple
    expect(requests.length).toBe(1)
  })

  test('should deduplicate concurrent GET /api/categories on home page', async ({ page }) => {
    const requests: string[] = []

    page.on('request', (request) => {
      const url = request.url()
      if (url.includes('/api/categories')) {
        requests.push(url)
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Should only have ONE request
    expect(requests.length).toBe(1)
  })

  test('should deduplicate concurrent GET /api/products requests on home page', async ({
    page,
  }) => {
    const requests: string[] = []

    page.on('request', (request) => {
      const url = request.url()
      if (url.includes('/api/products') && !url.includes('include_delivery_summary')) {
        requests.push(url)
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Should only have ONE request per unique query string
    const uniqueRequests = new Set(requests)
    expect(requests.length).toBe(uniqueRequests.size)
  })

  test('should deduplicate concurrent GET /products/{id} on product detail page', async ({
    page,
  }) => {
    const requests: string[] = []

    // First load home to get a product
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Get the first product ID to navigate to
    const firstProduct = page.locator('[data-testid="product-card"]').first()

    // Start tracking requests BEFORE clicking
    page.on('request', (request) => {
      const url = request.url()
      // Match /products/{id} exactly (not /products?...)
      if (url.includes('/products/') && !url.includes('?') && !url.includes('/image')) {
        requests.push(url)
      }
    })

    // Click on a product to navigate to detail page
    await firstProduct.click()

    // Wait for navigation and network
    await page.waitForURL(/\/products\/\d+/)
    await page.waitForLoadState('networkidle')

    // Should only have ONE request for the product detail
    expect(requests.length).toBe(1)
  })

  test('should allow multiple requests to same endpoint after deduplication window', async ({
    page,
  }) => {
    const requests: string[] = []

    page.on('request', (request) => {
      const url = request.url()
      if (url.includes('/products?include_delivery_summary=true')) {
        requests.push(url)
      }
    })

    // First navigation
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const firstRequestCount = requests.length

    // Navigate away
    await page.goto('/cart')
    await page.waitForLoadState('networkidle')

    // Wait for deduplication window to expire (2s + buffer)
    await page.waitForTimeout(2500)

    // Navigate back to home
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Should have made another request (after dedup window)
    expect(requests.length).toBeGreaterThan(firstRequestCount)
  })
})
