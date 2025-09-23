import { test, expect } from '@playwright/test'

// Mock API responses for consistent testing
const mockExchangeRates = {
  'USD_EUR': '0.85',
  'USD_GBP': '0.75',
  'USD_AUD': '1.35',
  'USD_MXN': '20.50',
  'USD_JPY': '110.00',
}

const mockProducts = [
  {
    id: '1',
    title: 'Gaming Laptop',
    price: { amount: '999.99', currency: 'USD' },
    category: 'Electronics'
  },
  {
    id: '2',
    title: 'Wireless Headphones',
    price: { amount: '199.99', currency: 'USD' },
    category: 'Electronics'
  }
]

test.describe('Currency Selection and Conversion', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API endpoints
    await page.route('**/api/currencies', async route => {
      await route.fulfill({
        json: { currencies: ['USD', 'EUR', 'GBP', 'AUD', 'MXN', 'JPY'] }
      })
    })
    
    await page.route('**/api/currencies/rates*', async route => {
      await route.fulfill({
        json: {
          rates: mockExchangeRates,
          updated_at: new Date().toISOString()
        }
      })
    })
    
    await page.route('**/api/products*', async route => {
      const url = new URL(route.request().url())
      const currency = url.searchParams.get('currency') || 'USD'
      
      const convertedProducts = mockProducts.map(product => ({
        ...product,
        price: currency === 'USD' ? product.price : {
          amount: (parseFloat(product.price.amount) * parseFloat(mockExchangeRates.USD_EUR)).toFixed(2),
          currency: currency,
          originalAmount: product.price.amount,
          originalCurrency: 'USD'
        }
      }))
      
      await route.fulfill({
        json: { products: convertedProducts }
      })
    })
    
    await page.goto('/')
  })
  
  test('displays default USD currency on page load', async ({ page }) => {
    await expect(page.locator('[data-testid="currency-selector"]')).toHaveValue('USD')
    
    // Check that prices are displayed in USD
    await expect(page.locator('.product-price').first()).toContainText('$999.99')
  })
  
  test('changes currency and updates all prices', async ({ page }) => {
    // Change currency to EUR
    await page.selectOption('[data-testid="currency-selector"]', 'EUR')
    
    // Wait for prices to update
    await expect(page.locator('.product-price').first()).toContainText('€849.99')
    await expect(page.locator('.product-price').nth(1)).toContainText('€169.99')
  })
  
  test('persists currency selection across page navigation', async ({ page }) => {
    // Change to GBP
    await page.selectOption('[data-testid="currency-selector"]', 'GBP')
    
    // Navigate to cart page
    await page.click('[data-testid="cart-link"]')
    
    // Currency should still be GBP
    await expect(page.locator('[data-testid="currency-selector"]')).toHaveValue('GBP')
  })
  
  test('shows original price when hovering over converted price', async ({ page }) => {
    await page.selectOption('[data-testid="currency-selector"]', 'EUR')
    
    const productPrice = page.locator('.product-price').first()
    await expect(productPrice).toContainText('€849.99')
    
    // Hover to see original price
    await productPrice.hover()
    await expect(page.locator('.price-tooltip')).toContainText('$999.99 USD')
  })
  
  test('handles JPY currency with no decimal places', async ({ page }) => {
    await page.route('**/api/products*', async route => {
      const convertedProducts = mockProducts.map(product => ({
        ...product,
        price: {
          amount: (parseFloat(product.price.amount) * 110).toFixed(0), // JPY rate
          currency: 'JPY',
          originalAmount: product.price.amount,
          originalCurrency: 'USD'
        }
      }))
      
      await route.fulfill({
        json: { products: convertedProducts }
      })
    })
    
    await page.selectOption('[data-testid="currency-selector"]', 'JPY')
    
    // JPY prices should not have decimal places
    await expect(page.locator('.product-price').first()).toContainText('¥109,999')
    await expect(page.locator('.product-price').first()).not.toContainText('.')
  })
  
  test('updates URL with currency parameter', async ({ page }) => {
    await page.selectOption('[data-testid="currency-selector"]', 'EUR')
    
    await expect(page).toHaveURL(/currency=EUR/)
  })
  
  test('loads currency from URL parameter', async ({ page }) => {
    await page.goto('/?currency=GBP')
    
    await expect(page.locator('[data-testid="currency-selector"]')).toHaveValue('GBP')
    await expect(page.locator('.product-price').first()).toContainText('£749.99')
  })
})

test.describe('Shopping Cart with Currency', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mocks
    await page.route('**/api/currencies', async route => {
      await route.fulfill({
        json: { currencies: ['USD', 'EUR', 'GBP', 'AUD', 'MXN', 'JPY'] }
      })
    })
    
    await page.route('**/api/currencies/rates*', async route => {
      await route.fulfill({
        json: { rates: mockExchangeRates, updated_at: new Date().toISOString() }
      })
    })
    
    await page.route('**/api/products*', async route => {
      await route.fulfill({
        json: { products: mockProducts }
      })
    })
    
    await page.route('**/api/cart*', async route => {
      const method = route.request().method()
      if (method === 'GET') {
        await route.fulfill({
          json: {
            items: [],
            subtotal: { amount: '0.00', currency: 'USD' },
            total: { amount: '0.00', currency: 'USD' },
            itemCount: 0
          }
        })
      } else if (method === 'POST') {
        await route.fulfill({
          json: {
            item: {
              id: '1',
              productId: '1',
              quantity: 1,
              price: { amount: '999.99', currency: 'USD' },
              subtotal: { amount: '999.99', currency: 'USD' }
            }
          }
        })
      }
    })
    
    await page.goto('/')
  })
  
  test('adds items to cart in selected currency', async ({ page }) => {
    // Change to EUR first
    await page.selectOption('[data-testid="currency-selector"]', 'EUR')
    
    // Add product to cart
    await page.click('.product-card .add-to-cart-button', { force: true })
    
    // Check cart shows EUR prices
    await page.click('[data-testid="cart-link"]')
    await expect(page.locator('.cart-item-price')).toContainText('€')
  })
  
  test('prevents mixing currencies in cart', async ({ page }) => {
    // Add item in USD
    await page.click('.product-card .add-to-cart-button', { force: true })
    
    // Try to change currency with items in cart
    await page.selectOption('[data-testid="currency-selector"]', 'EUR')
    
    // Should show warning dialog
    await expect(page.locator('.currency-change-warning')).toBeVisible()
    await expect(page.locator('.currency-change-warning')).toContainText('clear your cart')
  })
  
  test('allows currency change after clearing cart', async ({ page }) => {
    // Add item to cart
    await page.click('.product-card .add-to-cart-button', { force: true })
    
    // Try to change currency
    await page.selectOption('[data-testid="currency-selector"]', 'EUR')
    
    // Accept clearing cart
    await page.click('.currency-change-warning .accept-button')
    
    // Currency should change and cart should be empty
    await expect(page.locator('[data-testid="currency-selector"]')).toHaveValue('EUR')
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('0')
  })
  
  test('calculates cart total correctly in selected currency', async ({ page }) => {
    await page.selectOption('[data-testid="currency-selector"]', 'EUR')
    
    // Mock cart with multiple items
    await page.route('**/api/cart*', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          json: {
            items: [
              {
                id: '1',
                productId: '1',
                quantity: 2,
                price: { amount: '849.99', currency: 'EUR' },
                subtotal: { amount: '1699.98', currency: 'EUR' }
              }
            ],
            subtotal: { amount: '1699.98', currency: 'EUR' },
            tax: { amount: '136.00', currency: 'EUR' },
            shipping: { amount: '0.00', currency: 'EUR' },
            total: { amount: '1835.98', currency: 'EUR' },
            itemCount: 2
          }
        })
      }
    })
    
    await page.click('.product-card .add-to-cart-button', { force: true })
    await page.click('[data-testid="cart-link"]')
    
    await expect(page.locator('.cart-total')).toContainText('€1,835.98')
  })
})

test.describe('Checkout with Currency', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mocks for checkout flow
    await page.route('**/api/currencies**', async route => {
      await route.fulfill({
        json: { currencies: ['USD', 'EUR', 'GBP', 'AUD', 'MXN', 'JPY'] }
      })
    })
    
    await page.route('**/api/currencies/rates*', async route => {
      await route.fulfill({
        json: { rates: mockExchangeRates, updated_at: new Date().toISOString() }
      })
    })
    
    await page.route('**/api/cart*', async route => {
      await route.fulfill({
        json: {
          items: [{
            id: '1',
            productId: '1',
            product: mockProducts[0],
            quantity: 1,
            price: { amount: '849.99', currency: 'EUR' },
            subtotal: { amount: '849.99', currency: 'EUR' }
          }],
          subtotal: { amount: '849.99', currency: 'EUR' },
          tax: { amount: '68.00', currency: 'EUR' },
          shipping: { amount: '0.00', currency: 'EUR' },
          total: { amount: '917.99', currency: 'EUR' },
          currency: 'EUR',
          itemCount: 1
        }
      })
    })
    
    await page.route('**/api/delivery-options*', async route => {
      await route.fulfill({
        json: {
          delivery_options: [
            {
              id: '1',
              name: 'Standard Shipping',
              price: { amount: '0.00', currency: 'EUR' },
              estimatedDays: '3-5'
            },
            {
              id: '2', 
              name: 'Express Delivery',
              price: { amount: '8.50', currency: 'EUR' },
              estimatedDays: '1-2'
            }
          ]
        }
      })
    })
    
    await page.goto('/')
    await page.selectOption('[data-testid="currency-selector"]', 'EUR')
  })
  
  test('displays checkout prices in selected currency', async ({ page }) => {
    await page.goto('/checkout')
    
    // All prices should be in EUR
    await expect(page.locator('.checkout-subtotal')).toContainText('€849.99')
    await expect(page.locator('.checkout-tax')).toContainText('€68.00')
    await expect(page.locator('.checkout-total')).toContainText('€917.99')
  })
  
  test('shows delivery options in correct currency', async ({ page }) => {
    await page.goto('/checkout')
    
    await expect(page.locator('.delivery-option').first()).toContainText('Free')
    await expect(page.locator('.delivery-option').nth(1)).toContainText('€8.50')
  })
  
  test('creates order with currency snapshot', async ({ page }) => {
    let orderData: any = null
    
    await page.route('**/api/orders', async route => {
      orderData = await route.request().postDataJSON()
      await route.fulfill({
        json: {
          id: '1',
          status: 'pending',
          total: { amount: '917.99', currency: 'EUR' },
          currency: 'EUR',
          exchangeRateSnapshot: mockExchangeRates,
          created_at: new Date().toISOString()
        }
      })
    })
    
    await page.goto('/checkout')
    
    // Fill out shipping form
    await page.fill('[data-testid="shipping-name"]', 'John Doe')
    await page.fill('[data-testid="shipping-address"]', '123 Main St')
    await page.fill('[data-testid="shipping-city"]', 'Paris')
    await page.fill('[data-testid="shipping-postal"]', '75001')
    await page.selectOption('[data-testid="shipping-country"]', 'France')
    
    // Complete order
    await page.click('.place-order-button')
    
    // Verify order was created with currency info
    expect(orderData.currency).toBe('EUR')
    expect(orderData.exchangeRateSnapshot).toBeDefined()
  })
  
  test('displays order confirmation in correct currency', async ({ page }) => {
    await page.route('**/api/orders', async route => {
      await route.fulfill({
        json: {
          id: '12345',
          status: 'confirmed',
          total: { amount: '917.99', currency: 'EUR' },
          currency: 'EUR',
          items: [{
            product: mockProducts[0],
            quantity: 1,
            price: { amount: '849.99', currency: 'EUR' }
          }],
          created_at: new Date().toISOString()
        }
      })
    })
    
    await page.goto('/checkout')
    
    // Fill form and submit (abbreviated for test)
    await page.fill('[data-testid="shipping-name"]', 'John Doe')
    await page.click('.place-order-button')
    
    // Should redirect to confirmation page
    await expect(page).toHaveURL(/\/orders\/12345/)
    await expect(page.locator('.order-total')).toContainText('€917.99')
  })
})

test.describe('Currency Persistence and Edge Cases', () => {
  test('restores currency preference on page reload', async ({ page }) => {
    await page.goto('/')
    
    // Set currency to GBP
    await page.selectOption('[data-testid="currency-selector"]', 'GBP')
    
    // Reload page
    await page.reload()
    
    // Currency should be restored
    await expect(page.locator('[data-testid="currency-selector"]')).toHaveValue('GBP')
  })
  
  test('handles network errors gracefully', async ({ page }) => {
    // Mock network failure for exchange rates
    await page.route('**/api/currencies/rates*', async route => {
      await route.abort()
    })
    
    await page.goto('/')
    
    // Should show error message
    await expect(page.locator('.currency-error')).toBeVisible()
    await expect(page.locator('.currency-error')).toContainText('Unable to load exchange rates')
    
    // Should fallback to USD
    await expect(page.locator('[data-testid="currency-selector"]')).toHaveValue('USD')
  })
  
  test('shows loading state while fetching rates', async ({ page }) => {
    // Delay the rates response
    await page.route('**/api/currencies/rates*', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.fulfill({
        json: { rates: mockExchangeRates, updated_at: new Date().toISOString() }
      })
    })
    
    await page.goto('/')
    
    // Should show loading spinner
    await expect(page.locator('.currency-loading')).toBeVisible()
    
    // Should eventually load
    await expect(page.locator('.currency-loading')).not.toBeVisible()
  })
  
  test('handles unsupported currency gracefully', async ({ page }) => {
    await page.goto('/?currency=XYZ')
    
    // Should fallback to USD
    await expect(page.locator('[data-testid="currency-selector"]')).toHaveValue('USD')
    
    // Should show warning message
    await expect(page.locator('.currency-warning')).toContainText('Unsupported currency')
  })
  
  test('updates exchange rates periodically', async ({ page }) => {
    let requestCount = 0
    
    await page.route('**/api/currencies/rates*', async route => {
      requestCount++
      await route.fulfill({
        json: { 
          rates: mockExchangeRates, 
          updated_at: new Date().toISOString(),
          requestNumber: requestCount 
        }
      })
    })
    
    await page.goto('/')
    
    // Initial load
    expect(requestCount).toBe(1)
    
    // Wait for auto-refresh (mock timer)
    await page.waitForTimeout(5100) // Assuming 5s refresh interval
    
    // Should have made another request
    expect(requestCount).toBeGreaterThan(1)
  })
})

test.describe('Order History with Currency', () => {
  test('displays historical orders in original currency', async ({ page }) => {
    await page.route('**/api/orders*', async route => {
      await route.fulfill({
        json: {
          orders: [
            {
              id: '1',
              status: 'completed',
              total: { amount: '149.99', currency: 'USD' },
              currency: 'USD',
              created_at: '2024-01-15T10:30:00Z'
            },
            {
              id: '2', 
              status: 'completed',
              total: { amount: '127.49', currency: 'EUR' },
              currency: 'EUR',
              created_at: '2024-01-20T14:45:00Z'
            }
          ]
        }
      })
    })
    
    // Set current currency to GBP
    await page.goto('/')
    await page.selectOption('[data-testid="currency-selector"]', 'GBP')
    
    // Go to order history
    await page.goto('/orders')
    
    // Orders should display in their original currencies
    await expect(page.locator('.order-card').first().locator('.order-total')).toContainText('$149.99')
    await expect(page.locator('.order-card').nth(1).locator('.order-total')).toContainText('€127.49')
  })
  
  test('shows converted amounts as secondary display', async ({ page }) => {
    await page.route('**/api/currencies/rates*', async route => {
      await route.fulfill({
        json: { rates: mockExchangeRates, updated_at: new Date().toISOString() }
      })
    })
    
    await page.route('**/api/orders*', async route => {
      await route.fulfill({
        json: {
          orders: [{
            id: '1',
            status: 'completed',
            total: { amount: '149.99', currency: 'USD' },
            currency: 'USD',
            created_at: '2024-01-15T10:30:00Z'
          }]
        }
      })
    })
    
    await page.goto('/')
    await page.selectOption('[data-testid="currency-selector"]', 'EUR')
    await page.goto('/orders')
    
    // Should show original amount
    await expect(page.locator('.order-total-original')).toContainText('$149.99')
    
    // Should show converted amount as secondary
    await expect(page.locator('.order-total-converted')).toContainText('€127.49')
  })
})
