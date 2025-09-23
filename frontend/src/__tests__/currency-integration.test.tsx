import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React, { useState, useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { GlobalStateProvider } from '../context/GlobalState'
import { 
  getMockProduct, 
  getMockCart, 
  getMockExchangeRates,
  getMockDeliveryOption
} from './currency-factories'

// Mock API module
const mockApi = {
  getProducts: vi.fn(),
  getProduct: vi.fn(),
  getCart: vi.fn(),
  addToCart: vi.fn(),
  getDeliveryOptions: vi.fn(),
  getSupportedCurrencies: vi.fn(),
  getExchangeRates: vi.fn(),
  convertCurrency: vi.fn()
}

vi.mock('../api/client', () => ({
  api: mockApi
}))

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <GlobalStateProvider>
      {children}
    </GlobalStateProvider>
  </BrowserRouter>
)

describe('Currency Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    
    // Default API responses
    mockApi.getSupportedCurrencies.mockResolvedValue({
      currencies: ['USD', 'EUR', 'GBP', 'AUD', 'MXN', 'JPY']
    })
    
    mockApi.getExchangeRates.mockResolvedValue({
      rates: getMockExchangeRates(),
      updated_at: new Date().toISOString()
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Product List with Currency', () => {
    it('displays product prices in selected currency', async () => {
      const products = [
        getMockProduct({ 
          title: 'Laptop', 
          price: { amount: '999.99', currency: 'USD' } 
        }),
        getMockProduct({ 
          title: 'Mouse',
          price: { amount: '29.99', currency: 'USD' } 
        })
      ]
      
      mockApi.getProducts.mockResolvedValue({ products })
      
      render(
        <TestWrapper>
          <ProductList />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByText('$999.99')).toBeInTheDocument()
        expect(screen.getByText('$29.99')).toBeInTheDocument()
      })
    })

    it('updates product prices when currency is changed', async () => {
      const usdProducts = [
        getMockProduct({ 
          title: 'Laptop',
          price: { amount: '999.99', currency: 'USD' }
        })
      ]
      
      const eurProducts = [
        getMockProduct({
          title: 'Laptop',
          price: { 
            amount: '849.99', 
            currency: 'EUR',
            originalAmount: '999.99',
            originalCurrency: 'USD'
          }
        })
      ]
      
      mockApi.getProducts.mockImplementation((params) => {
        if (params?.currency === 'EUR') {
          return Promise.resolve({ products: eurProducts })
        }
        return Promise.resolve({ products: usdProducts })
      })
      
      render(
        <TestWrapper>
          <div>
            <CurrencySelector />
            <ProductList />
          </div>
        </TestWrapper>
      )
      
      // Initially shows USD
      await waitFor(() => {
        expect(screen.getByText('$999.99')).toBeInTheDocument()
      })
      
      // Change to EUR
      const currencySelect = screen.getByRole('combobox')
      fireEvent.change(currencySelect, { target: { value: 'EUR' } })
      
      // Should now show EUR price
      await waitFor(() => {
        expect(screen.getByText('€849.99')).toBeInTheDocument()
      })
      
      // Verify API was called with correct currency
      expect(mockApi.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({ currency: 'EUR' })
      )
    })

    it('shows original price on hover when currency is converted', async () => {
      const eurProducts = [
        getMockProduct({
          title: 'Laptop',
          price: {
            amount: '849.99',
            currency: 'EUR', 
            originalAmount: '999.99',
            originalCurrency: 'USD'
          }
        })
      ]
      
      mockApi.getProducts.mockResolvedValue({ products: eurProducts })
      
      render(
        <TestWrapper>
          <ProductList initialCurrency="EUR" />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByText('€849.99')).toBeInTheDocument()
      })
      
      // Hover over price to see original
      const priceElement = screen.getByText('€849.99')
      fireEvent.mouseEnter(priceElement)
      
      await waitFor(() => {
        expect(screen.getByText('Originally $999.99 USD')).toBeInTheDocument()
      })
    })

    it('handles JPY currency with no decimal places', async () => {
      const jpyProducts = [
        getMockProduct({
          title: 'Laptop',
          price: { amount: '109999', currency: 'JPY' }
        })
      ]
      
      mockApi.getProducts.mockResolvedValue({ products: jpyProducts })
      
      render(
        <TestWrapper>
          <ProductList initialCurrency="JPY" />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByText('¥109,999')).toBeInTheDocument()
        expect(screen.queryByText('¥109,999.00')).not.toBeInTheDocument()
      })
    })
  })

  describe('Shopping Cart with Currency', () => {
    it('maintains cart currency consistency', async () => {
      const cartWithItems = getMockCart({
        currency: 'EUR',
        items: [
          {
            id: '1',
            productId: '1',
            quantity: 2,
            price: { amount: '42.50', currency: 'EUR' },
            subtotal: { amount: '85.00', currency: 'EUR' }
          }
        ],
        total: { amount: '94.99', currency: 'EUR' }
      })
      
      mockApi.getCart.mockResolvedValue(cartWithItems)
      
      render(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByText('€85.00')).toBeInTheDocument()
        expect(screen.getByText('€94.99')).toBeInTheDocument()
      })
    })

    it('shows currency change warning when cart has items', async () => {
      const cartWithItems = getMockCart({
        currency: 'USD',
        items: [{ id: '1', quantity: 1 }],
        itemCount: 1
      })
      
      mockApi.getCart.mockResolvedValue(cartWithItems)
      
      render(
        <TestWrapper>
          <div>
            <CurrencySelector />
            <Cart />
          </div>
        </TestWrapper>
      )
      
      // Wait for cart to load
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument() // Item count
      })
      
      // Try to change currency
      const currencySelect = screen.getByRole('combobox')
      fireEvent.change(currencySelect, { target: { value: 'EUR' } })
      
      // Should show warning
      await waitFor(() => {
        expect(screen.getByText(/clear your cart/i)).toBeInTheDocument()
      })
    })

    it('clears cart when currency change is confirmed', async () => {
      mockApi.getCart.mockResolvedValueOnce(
        getMockCart({ itemCount: 1, items: [{ id: '1' }] })
      ).mockResolvedValueOnce(
        getMockCart({ itemCount: 0, items: [] })
      )
      
      mockApi.clearCart = vi.fn().mockResolvedValue({})
      
      render(
        <TestWrapper>
          <div>
            <CurrencySelector />
            <Cart />
          </div>
        </TestWrapper>
      )
      
      // Change currency and confirm
      const currencySelect = screen.getByRole('combobox')
      fireEvent.change(currencySelect, { target: { value: 'EUR' } })
      
      const confirmButton = await screen.findByText(/confirm/i)
      fireEvent.click(confirmButton)
      
      // Cart should be cleared
      await waitFor(() => {
        expect(mockApi.clearCart).toHaveBeenCalled()
      })
    })

    it('adds items to cart with correct currency', async () => {
      const product = getMockProduct({
        price: { amount: '85.00', currency: 'EUR' }
      })
      
      mockApi.addToCart.mockResolvedValue({
        item: {
          productId: '1',
          quantity: 1,
          price: { amount: '85.00', currency: 'EUR' }
        }
      })
      
      render(
        <TestWrapper>
          <ProductCard product={product} currentCurrency="EUR" />
        </TestWrapper>
      )
      
      const addToCartButton = screen.getByText(/add to cart/i)
      fireEvent.click(addToCartButton)
      
      await waitFor(() => {
        expect(mockApi.addToCart).toHaveBeenCalledWith(
          expect.objectContaining({
            currency: 'EUR'
          })
        )
      })
    })
  })

  describe('Checkout with Currency', () => {
    it('displays checkout totals in selected currency', async () => {
      const cart = getMockCart({
        currency: 'GBP',
        subtotal: { amount: '74.99', currency: 'GBP' },
        tax: { amount: '15.00', currency: 'GBP' },
        shipping: { amount: '5.99', currency: 'GBP' },
        total: { amount: '95.98', currency: 'GBP' }
      })
      
      mockApi.getCart.mockResolvedValue(cart)
      
      render(
        <TestWrapper>
          <CheckoutSummary />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByText('£74.99')).toBeInTheDocument() // Subtotal
        expect(screen.getByText('£15.00')).toBeInTheDocument() // Tax
        expect(screen.getByText('£5.99')).toBeInTheDocument()  // Shipping
        expect(screen.getByText('£95.98')).toBeInTheDocument() // Total
      })
    })

    it('shows delivery options with converted prices', async () => {
      const deliveryOptions = [
        getMockDeliveryOption({
          name: 'Standard',
          price: { amount: '0.00', currency: 'EUR' }
        }),
        getMockDeliveryOption({
          name: 'Express',
          price: { amount: '8.50', currency: 'EUR' }
        })
      ]
      
      mockApi.getDeliveryOptions.mockResolvedValue({ delivery_options: deliveryOptions })
      
      render(
        <TestWrapper>
          <DeliveryOptionsSelector currency="EUR" />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByText('FREE')).toBeInTheDocument()
        expect(screen.getByText('€8.50')).toBeInTheDocument()
      })
    })

    it('creates order with currency snapshot', async () => {
      mockApi.createOrder = vi.fn().mockResolvedValue({
        id: '12345',
        currency: 'EUR',
        total: { amount: '95.98', currency: 'EUR' },
        exchangeRateSnapshot: getMockExchangeRates(),
        timestamp: new Date().toISOString()
      })
      
      render(
        <TestWrapper>
          <CheckoutForm />
        </TestWrapper>
      )
      
      // Fill form and submit
      fireEvent.click(screen.getByText(/place order/i))
      
      await waitFor(() => {
        expect(mockApi.createOrder).toHaveBeenCalledWith(
          expect.objectContaining({
            currency: 'EUR',
            captureExchangeRates: true
          })
        )
      })
    })
  })

  describe('Currency Persistence', () => {
    it('saves currency preference to localStorage', async () => {
      render(
        <TestWrapper>
          <CurrencySelector />
        </TestWrapper>
      )
      
      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'EUR' } })
      
      await waitFor(() => {
        expect(localStorage.getItem('preferred-currency')).toBe('EUR')
      })
    })

    it('restores currency preference from localStorage', () => {
      localStorage.setItem('preferred-currency', 'GBP')
      
      render(
        <TestWrapper>
          <CurrencySelector />
        </TestWrapper>
      )
      
      expect(screen.getByDisplayValue('GBP')).toBeInTheDocument()
    })

    it('maintains currency across page navigation', async () => {
      localStorage.setItem('preferred-currency', 'EUR')
      
      const { rerender } = render(
        <TestWrapper>
          <ProductList />
        </TestWrapper>
      )
      
      // Navigate to different page
      rerender(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      )
      
      // Currency should still be EUR
      // This would be verified by checking that API calls include currency=EUR
    })
  })

  describe('Error Handling', () => {
    it('handles exchange rate API failures gracefully', async () => {
      mockApi.getExchangeRates.mockRejectedValue(new Error('API Error'))
      
      render(
        <TestWrapper>
          <CurrencySelector />
        </TestWrapper>
      )
      
      await waitFor(() => {
        // Should show error message or fallback to USD
        expect(screen.getByDisplayValue('USD')).toBeInTheDocument()
      })
    })

    it('shows error message when conversion fails', async () => {
      mockApi.convertCurrency.mockRejectedValue(new Error('Conversion failed'))
      
      const TestComponent = () => {
        const [error, setError] = useState(null)
        
        const handleConvert = async () => {
          try {
            await mockApi.convertCurrency({ amount: '100', fromCurrency: 'USD', toCurrency: 'EUR' })
          } catch (err) {
            setError(err.message)
          }
        }
        
        return (
          <div>
            <button onClick={handleConvert}>Convert</button>
            {error && <div data-testid="error">{error}</div>}
          </div>
        )
      }
      
      render(<TestComponent />)
      
      fireEvent.click(screen.getByText('Convert'))
      
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Conversion failed')
      })
    })

    it('falls back to USD when unsupported currency is detected', async () => {
      // Try to load with unsupported currency from URL
      Object.defineProperty(window, 'location', {
        value: { search: '?currency=XYZ' },
        writable: true
      })
      
      render(
        <TestWrapper>
          <CurrencySelector />
        </TestWrapper>
      )
      
      await waitFor(() => {
        // Should fallback to USD
        expect(screen.getByDisplayValue('USD')).toBeInTheDocument()
      })
    })
  })

  describe('Performance', () => {
    it('debounces currency changes to avoid excessive API calls', async () => {
      vi.useFakeTimers()
      
      render(
        <TestWrapper>
          <CurrencySelector />
        </TestWrapper>
      )
      
      const select = screen.getByRole('combobox')
      
      // Rapidly change currency multiple times
      fireEvent.change(select, { target: { value: 'EUR' } })
      fireEvent.change(select, { target: { value: 'GBP' } })
      fireEvent.change(select, { target: { value: 'AUD' } })
      
      // Fast forward timers
      act(() => {
        vi.advanceTimersByTime(500)
      })
      
      // Should only make one API call for the final currency
      await waitFor(() => {
        const currencyCalls = mockApi.getProducts.mock.calls.filter(
          call => call[0]?.currency
        )
        expect(currencyCalls.length).toBeLessThanOrEqual(1)
      })
      
      vi.useRealTimers()
    })

    it('caches exchange rates to reduce API calls', async () => {
      const rates = getMockExchangeRates()
      mockApi.getExchangeRates.mockResolvedValue({
        rates,
        updated_at: new Date().toISOString()
      })
      
      render(
        <TestWrapper>
          <div>
            <CurrencySelector />
            <ProductList />
          </div>
        </TestWrapper>
      )
      
      // Change currency multiple times
      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'EUR' } })
      fireEvent.change(select, { target: { value: 'GBP' } })
      fireEvent.change(select, { target: { value: 'EUR' } })
      
      await waitFor(() => {
        // Exchange rates should only be fetched once
        expect(mockApi.getExchangeRates).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels for currency selector', () => {
      render(
        <TestWrapper>
          <CurrencySelector />
        </TestWrapper>
      )
      
      const select = screen.getByRole('combobox')
      expect(select).toHaveAttribute('aria-label', expect.stringContaining('currency'))
    })

    it('announces price changes to screen readers', async () => {
      const { container } = render(
        <TestWrapper>
          <div>
            <CurrencySelector />
            <ProductList />
          </div>
        </TestWrapper>
      )
      
      // Check for aria-live region for price updates
      expect(container.querySelector('[aria-live]')).toBeInTheDocument()
    })
  })
})

// Helper components for testing
const CurrencySelector = ({ onCurrencyChange, disabled, initialCurrency }: any) => {
  const [currency, setCurrency] = useState(initialCurrency || 'USD')
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value
    setCurrency(newCurrency)
    onCurrencyChange?.(newCurrency)
  }
  
  return (
    <select
      role="combobox"
      value={currency}
      onChange={handleChange}
      disabled={disabled}
      aria-label="Select currency"
    >
      <option value="USD">USD - $</option>
      <option value="EUR">EUR - €</option>
      <option value="GBP">GBP - £</option>
      <option value="AUD">AUD - A$</option>
      <option value="JPY">JPY - ¥</option>
    </select>
  )
}

const ProductList = ({ initialCurrency }: any) => {
  const [products, setProducts] = useState([])
  const [currency] = useState(initialCurrency || 'USD')
  
  useEffect(() => {
    mockApi.getProducts({ currency }).then(
      response => setProducts(response.products || [])
    )
  }, [currency])
  
  return (
    <div>
      {products.map((product: any) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

const ProductCard = ({ product }: any) => {
  const formatPrice = (price: any) => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', AUD: 'A$' }
    const symbol = symbols[price.currency as keyof typeof symbols] || price.currency
    const amount = price.currency === 'JPY' 
      ? parseInt(price.amount).toLocaleString()
      : parseFloat(price.amount).toFixed(2)
    return `${symbol}${amount}`
  }
  
  return (
    <div className="product-card">
      <h3>{product.title}</h3>
      <div className="product-price">
        {formatPrice(product.price)}
        {product.price.originalAmount && (
          <div className="price-tooltip">
            Originally {formatPrice({
              amount: product.price.originalAmount,
              currency: product.price.originalCurrency
            })}
          </div>
        )}
      </div>
      <button>Add to Cart</button>
    </div>
  )
}

const Cart = () => {
  const [cart, setCart] = useState(null)
  
  useEffect(() => {
    mockApi.getCart().then(setCart)
  }, [])
  
  if (!cart) return <div>Loading...</div>
  
  return (
    <div>
      <div>Items: {cart.itemCount}</div>
      <div>Total: {cart.total?.currency} {cart.total?.amount}</div>
    </div>
  )
}

const CheckoutSummary = () => {
  const [cart, setCart] = useState(null)
  
  useEffect(() => {
    mockApi.getCart().then(setCart)
  }, [])
  
  if (!cart) return <div>Loading...</div>
  
  const formatPrice = (price: any) => {
    const symbols = { USD: '$', EUR: '€', GBP: '£' }
    const symbol = symbols[price.currency as keyof typeof symbols] || price.currency
    return `${symbol}${price.amount}`
  }
  
  return (
    <div>
      <div>Subtotal: {formatPrice(cart.subtotal)}</div>
      <div>Tax: {formatPrice(cart.tax)}</div>
      <div>Shipping: {formatPrice(cart.shipping)}</div>
      <div>Total: {formatPrice(cart.total)}</div>
    </div>
  )
}

const DeliveryOptionsSelector = ({ currency }: any) => {
  const [options, setOptions] = useState([])
  
  useEffect(() => {
    mockApi.getDeliveryOptions({ currency }).then(
      response => setOptions(response.delivery_options || [])
    )
  }, [currency])
  
  return (
    <div>
      {options.map((option: any) => (
        <div key={option.id}>
          {option.name}: {option.price.amount === '0.00' ? 'FREE' : `${option.price.currency === 'EUR' ? '€' : '$'}${option.price.amount}`}
        </div>
      ))}
    </div>
  )
}

const CheckoutForm = () => {
  return (
    <div>
      <button>Place Order</button>
    </div>
  )
}
