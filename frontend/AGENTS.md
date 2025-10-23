# Frontend Agent Guide - Linea Supply

## Overview

**Brand:** Linea Supply - Premium minimal e-commerce with monochrome design  
**Purpose:** React TypeScript frontend for e-commerce demo with strict TDD practices  
**Stack:** React 18, TypeScript, Vite, Chakra UI, Playwright  
**Design System:** Modular theme with semantic tokens (sand/ink/charcoal colors, Inter font)  
**Architecture:** Component-based with Context API for state management

## Essential Tools

Amp provides custom tools in `.amp/tools/` for common development tasks. Always use these tools instead of just commands or Bash directly:

**Run tests:** Use `run_tests` tool with action "e2e" for frontend E2E tests  
**Lint & check:** Use `lint_and_check` tool with target "frontend"  
**Format:** Use `format_code` tool with target "frontend" for code formatting  
**Build:** Use `build_app` tool to verify production builds

## Essential Commands

**Development:**

- `npm run dev` - Start development server (localhost:3001)
- `npm install` - Install dependencies
- `npm run preview` - Preview production build

**Testing:**

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
    await expect(this.page.locator(`[data-testid="product-${productName}"]`)).toBeVisible()
  }

  async expectCartItemCount(count: number) {
    await expect(this.page.locator('[data-testid="cart-count"]')).toHaveText(count.toString())
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
│   └── ProductCard/
│       └── ProductCard.tsx
├── pages/               # Page-level components
├── hooks/               # Custom React hooks
├── context/             # React Context providers
├── api/                 # API client and types
├── types/               # TypeScript type definitions
└── utils/               # Helper functions
```

## Performance Best Practices

- **Lazy Loading:** Use `React.lazy()` for code splitting
- **Memoization:** Use `React.memo()`, `useMemo()`, `useCallback()` judiciously
- **Bundle Analysis:** Run `npm run build` and analyze bundle size
- **Image Optimization:** Use WebP format with fallbacks
- **API Optimization:** Implement request caching and pagination
