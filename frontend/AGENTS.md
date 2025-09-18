# Frontend Agent Guide

## Overview
**Purpose:** React TypeScript frontend for e-commerce demo with strict TDD practices  
**Stack:** React 18, TypeScript, Vite, Chakra UI, React Testing Library, Playwright  
**Architecture:** Component-based with Context API for state management

## Essential Commands

**Development:**
- `npm run dev` - Start development server (localhost:3001)
- `npm install` - Install dependencies
- `npm run preview` - Preview production build

**Testing:**
- `npm test` - Run unit tests (Vitest)
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npx playwright test` - Run E2E tests
- `npx playwright test --ui` - Run E2E tests with UI mode

**Quality Checks:**
- `npm run lint` - ESLint checking
- `npm run lint:fix` - Fix linting issues
- `npm run type-check` - TypeScript type checking
- `npm run build` - Production build

**Playwright:**
- `npx playwright install` - Install browser dependencies
- `npx playwright codegen localhost:3001` - Generate test code

## Testing Process

### Frontend Testing Patterns

**Component Testing Example:**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ProductCard } from './ProductCard'

const getMockProduct = (overrides?: Partial<Product>): Product => ({
  id: 'prod_123',
  name: 'Gaming Laptop',
  price: 999.99,
  category: 'electronics',
  inStock: true,
  imageUrl: 'https://example.com/laptop.jpg',
  ...overrides,
})

describe('ProductCard', () => {
  it('displays product information', () => {
    const product = getMockProduct()
    
    render(<ProductCard product={product} onAddToCart={vi.fn()} />)
    
    expect(screen.getByText('Gaming Laptop')).toBeInTheDocument()
    expect(screen.getByText('$999.99')).toBeInTheDocument()
  })

  it('calls onAddToCart when add to cart button is clicked', async () => {
    const mockOnAddToCart = vi.fn()
    const product = getMockProduct()
    
    render(<ProductCard product={product} onAddToCart={mockOnAddToCart} />)
    
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))
    
    await waitFor(() => {
      expect(mockOnAddToCart).toHaveBeenCalledWith(product.id)
    })
  })
})
```

**Hook Testing Example:**
```typescript
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useCart } from './useCart'

describe('useCart', () => {
  it('adds item to cart', () => {
    const { result } = renderHook(() => useCart())
    const product = getMockProduct()
    
    act(() => {
      result.current.addToCart(product.id)
    })
    
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].productId).toBe(product.id)
  })
})
```

## TypeScript Standards

### Strict Configuration Required
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Type Definitions
```typescript
// Domain Types
export interface Product {
  readonly id: string
  readonly name: string
  readonly price: number
  readonly category: string
  readonly description?: string
  readonly imageUrl?: string
  readonly inStock: boolean
}

export interface User {
  readonly id: string
  readonly email: string
  readonly firstName: string
  readonly lastName: string
  readonly createdAt: string
}

// Component Props
export interface ProductCardProps {
  readonly product: Product
  readonly onAddToCart: (productId: string) => void
  readonly isLoading?: boolean
}

// API Response Types
export interface ApiResponse<T> {
  readonly data: T
  readonly message?: string
}

export interface ApiError {
  readonly error: string
  readonly code: string
}
```

### Component Patterns

**Functional Components Only:**
```typescript
import { FC } from 'react'

interface ProductListProps {
  readonly products: Product[]
  readonly onProductSelect: (product: Product) => void
}

export const ProductList: FC<ProductListProps> = ({ 
  products, 
  onProductSelect 
}) => {
  return (
    <div>
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={() => onProductSelect(product)}
        />
      ))}
    </div>
  )
}
```

**Custom Hooks:**
```typescript
import { useState, useEffect } from 'react'

interface UseProductsOptions {
  readonly category?: string
  readonly limit?: number
}

interface UseProductsResult {
  readonly products: Product[]
  readonly loading: boolean
  readonly error: string | null
  readonly refetch: () => void
}

export const useProducts = (options: UseProductsOptions = {}): UseProductsResult => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await api.getProducts(options)
      setProducts(response.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [options.category, options.limit])

  return { products, loading, error, refetch: fetchProducts }
}
```

## State Management

### Context API Pattern
```typescript
import { createContext, useContext, useReducer, FC, ReactNode } from 'react'

interface CartItem {
  readonly productId: string
  readonly quantity: number
}

interface CartState {
  readonly items: CartItem[]
  readonly totalItems: number
  readonly totalPrice: number
}

type CartAction = 
  | { type: 'ADD_ITEM'; payload: string }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }

const CartContext = createContext<{
  state: CartState
  dispatch: (action: CartAction) => void
} | null>(null)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export const CartProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  )
}
```

## UI Component Standards

### Chakra UI Integration
```typescript
import { 
  Box, 
  Button, 
  Text, 
  VStack, 
  HStack, 
  Image, 
  useToast 
} from '@chakra-ui/react'

export const ProductCard: FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const toast = useToast()

  const handleAddToCart = () => {
    onAddToCart(product.id)
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart`,
      status: 'success',
      duration: 3000,
    })
  }

  return (
    <Box p={4} borderWidth={1} borderRadius="md" shadow="sm">
      <VStack spacing={3} align="stretch">
        <Image src={product.imageUrl} alt={product.name} />
        <Text fontSize="lg" fontWeight="bold">
          {product.name}
        </Text>
        <HStack justify="space-between">
          <Text fontSize="xl" color="blue.600">
            ${product.price}
          </Text>
          <Button 
            colorScheme="blue" 
            onClick={handleAddToCart}
            isDisabled={!product.inStock}
          >
            Add to Cart
          </Button>
        </HStack>
      </VStack>
    </Box>
  )
}
```

## Form Handling

### Formik + Yup Integration
```typescript
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { FormControl, FormLabel, Input, Button } from '@chakra-ui/react'

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
})

interface LoginFormValues {
  email: string
  password: string
}

export const LoginForm: FC<{ onSubmit: (values: LoginFormValues) => Promise<void> }> = ({ 
  onSubmit 
}) => {
  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        <Form>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Field as={Input} name="email" type="email" />
            <ErrorMessage name="email" />
          </FormControl>

          <FormControl>
            <FormLabel>Password</FormLabel>
            <Field as={Input} name="password" type="password" />
            <ErrorMessage name="password" />
          </FormControl>

          <Button type="submit" isLoading={isSubmitting}>
            Login
          </Button>
        </Form>
      )}
    </Formik>
  )
}
```

## API Integration

### HTTP Client Pattern
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const error: ApiError = await response.json()
      throw new Error(error.error)
    }

    return response.json()
  }

  async getProducts(params: { category?: string; limit?: number } = {}) {
    const searchParams = new URLSearchParams()
    if (params.category) searchParams.set('category', params.category)
    if (params.limit) searchParams.set('limit', params.limit.toString())
    
    return this.request<Product[]>(`/products?${searchParams}`)
  }

  async createProduct(product: Omit<Product, 'id'>) {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    })
  }
}

export const api = new ApiClient()
```

## Test Data Factories

### Factory Functions for Components
```typescript
export const getMockProduct = (overrides?: Partial<Product>): Product => ({
  id: 'prod_123',
  name: 'Test Product',
  price: 29.99,
  category: 'electronics',
  description: 'A test product for unit tests',
  imageUrl: 'https://example.com/product.jpg',
  inStock: true,
  ...overrides,
})

export const getMockUser = (overrides?: Partial<User>): User => ({
  id: 'user_123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  createdAt: new Date().toISOString(),
  ...overrides,
})
```

## E2E Testing with Playwright

### Page Object Pattern
```typescript
// pages/ProductPage.ts
import { Page, expect } from '@playwright/test'

export class ProductPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/products')
  }

  async addProductToCart(productName: string) {
    const productCard = this.page.locator(`[data-testid="product-${productName}"]`)
    await productCard.locator('button:has-text("Add to Cart")').click()
  }

  async expectProductVisible(productName: string) {
    await expect(
      this.page.locator(`[data-testid="product-${productName}"]`)
    ).toBeVisible()
  }

  async expectCartItemCount(count: number) {
    await expect(
      this.page.locator('[data-testid="cart-count"]')
    ).toHaveText(count.toString())
  }
}
```

### E2E Test Example
```typescript
// e2e/shopping.spec.ts
import { test } from '@playwright/test'
import { ProductPage } from '../pages/ProductPage'

test('user can add products to cart', async ({ page }) => {
  const productPage = new ProductPage(page)
  
  await productPage.goto()
  await productPage.expectProductVisible('Gaming Laptop')
  
  await productPage.addProductToCart('Gaming Laptop')
  await productPage.expectCartItemCount(1)
})
```

## Directory Structure

```
frontend/src/
├── components/          # Reusable UI components
│   ├── ProductCard/
│   │   ├── ProductCard.tsx
│   │   └── ProductCard.test.tsx
├── pages/               # Page-level components
├── hooks/               # Custom React hooks
├── context/             # React Context providers
├── api/                 # API client and types
├── types/               # TypeScript type definitions
├── utils/               # Helper functions
└── __tests__/           # Test utilities and global mocks
```

## Performance Best Practices

- **Lazy Loading:** Use `React.lazy()` for code splitting
- **Memoization:** Use `React.memo()`, `useMemo()`, `useCallback()` judiciously
- **Bundle Analysis:** Run `npm run build` and analyze bundle size
- **Image Optimization:** Use WebP format with fallbacks
- **API Optimization:** Implement request caching and pagination

