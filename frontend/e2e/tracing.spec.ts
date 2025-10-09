import { test, expect } from '@playwright/test'

test('API requests include trace headers', async ({ page }) => {
  let traceparentHeader: string | null = null
  let requestIdHeader: string | null = null

  page.on('response', async (response) => {
    if (response.url().includes('/api/')) {
      const headers = response.headers()
      traceparentHeader = headers['traceparent'] || null
      requestIdHeader = headers['x-request-id'] || null
    }
  })

  await page.goto('/')
  await page.waitForLoadState('networkidle')

  expect(traceparentHeader).toBeTruthy()
  expect(requestIdHeader).toBeTruthy()

  expect(traceparentHeader).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/)
  expect(requestIdHeader).toMatch(/^[0-9a-f]{32}$/)
})

test('trace context is propagated across requests', async ({ page }) => {
  const requestIds: string[] = []

  page.on('response', async (response) => {
    if (response.url().includes('/api/')) {
      const headers = response.headers()
      const requestId = headers['x-request-id']
      if (requestId) {
        requestIds.push(requestId)
      }
    }
  })

  await page.goto('/')
  await page.waitForLoadState('networkidle')

  expect(requestIds.length).toBeGreaterThan(0)
  
  for (const id of requestIds) {
    expect(id).toMatch(/^[0-9a-f]{32}$/)
  }
})
