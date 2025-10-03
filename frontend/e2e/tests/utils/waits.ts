import { Page, expect } from '@playwright/test';

export async function waitForProductsLoaded(page: Page) {
  // Wait for products API and first product card to be visible
  await Promise.all([
    page.waitForResponse(resp => 
      resp.url().includes('/products') && resp.ok(), 
      { timeout: 10000 }
    ),
    page.waitForSelector('[data-testid="product-card"]', { state: 'visible' })
  ]);
}

export async function openFirstProductDetail(page: Page) {
  // Click first product card and wait for navigation + product detail UI
  await Promise.all([
    page.locator('[data-testid="product-card"]').first().click(),
    page.waitForURL('**/products/**', { timeout: 10000 })
  ]);
  await page.locator('[data-testid="product-title"]').waitFor({ state: 'visible' });
}

export async function waitForCartCount(page: Page, expected: number) {
  const badge = page.locator('[data-testid="cart-count"]');
  await expect(badge).toHaveText(String(expected), { timeout: 10000 });
}

export async function openProductWithDeliveryOptions(
  page: Page, 
  options: { maxCardsToTry?: number } = {}
) {
  const { maxCardsToTry = 5 } = options;
  
  // Use the deterministic approach
  await openFirstProductWithDeliveryByClicking(page, maxCardsToTry);
}

export async function waitForCartItemsCount(page: Page, expected: number) {
  const items = page.locator('[data-testid="cart-item"]');
  await expect(items).toHaveCount(expected, { timeout: 10000 });
}

export async function addToCartAndWaitForUpdate(page: Page, initialCount: number) {
  const addToCartButton = page.locator('[data-testid="add-to-cart"]').first();
  
  // Click add to cart button
  await addToCartButton.click();
  
  // Wait for cart count to increase
  await waitForCartCount(page, initialCount + 1);
}

export async function removeFromCartAndWaitForUpdate(page: Page, expectedNewCount: number) {
  // Click remove button
  await page.locator('[data-testid="remove-item"]').first().click();

  if (expectedNewCount === 0) {
    // Wait for empty cart state
    await expect(page.getByTestId('empty-cart')).toBeVisible();
  } else {
    // Wait for updated item count
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(expectedNewCount);
  }

  // Wait for cart badge to update if it exists
  const cartBadge = page.locator('[data-testid="cart-count"]');
  if (await cartBadge.count() > 0 && expectedNewCount > 0) {
    await expect(cartBadge).toHaveText(String(expectedNewCount));
  }
}

export async function updateQuantityAndWaitForUpdate(page: Page, newQuantity: number) {
  const cartTotal = page.locator('[data-testid="cart-total"]');
  const initialTotalText = await cartTotal.textContent();

  // Update quantity control
  await updateQuantityControl(page, newQuantity);

  // Wait for total to update
  await expect(cartTotal).not.toHaveText(initialTotalText || '');
}

async function updateQuantityControl(page: Page, quantity: number) {
  const quantityDisplay = page.locator('[data-testid="quantity-display"]').first();
  
  // Check if NumberInput field is available (desktop)
  if (await quantityDisplay.count() > 0 && await quantityDisplay.getAttribute('type') === 'text') {
    // Desktop: use NumberInput field
    await quantityDisplay.clear();
    await quantityDisplay.fill(String(quantity));
    await quantityDisplay.blur();
  } else {
    // Mobile: use increment/decrement buttons
    const currentQty = await getCurrentQuantity(page);
    const increment = page.locator('[data-testid="increment-qty"]').first();
    const decrement = page.locator('[data-testid="decrement-qty"]').first();
    
    if (quantity > currentQty) {
      for (let i = currentQty; i < quantity; i++) {
        await increment.click();
      }
    } else if (quantity < currentQty) {
      for (let i = currentQty; i > quantity; i--) {
        await decrement.click();
      }
    }
  }
}

async function getCurrentQuantity(page: Page): Promise<number> {
  const qtyDisplay = page.locator('[data-testid="quantity-display"]').first();
  const qtyText = await qtyDisplay.textContent();
  return parseInt(qtyText || '1') || 1;
}

export async function navigateToProductById(page: Page, productId: string) {
  await page.goto(`/products/${productId}`);
  await page.waitForURL(`**/products/${productId}`);
  await page.locator('[data-testid="product-title"]').waitFor({ state: 'visible' });
}

// Utility: endpoint predicates used for delivery
const DELIVERY_ENDPOINTS = [
  /\/delivery-options/i,
  /\/shipping/i,
  /\/quotes?/i,
  /\/products\/\d+\/delivery/i,
];

function deliverySectionLocator(page: Page) {
  // Prefer a single canonical selector in the app.
  // Fallback: union of existing selectors (still deterministic, no arbitrary timeout).
  return page.locator(
    [
      '[data-testid="delivery-section"]',
      '[data-testid="delivery-options"]',
      '[data-testid="shipping-section"]',
      '[data-testid="shipping-options"]',
    ].join(', ')
  ).first();
}

export async function waitForDeliveryNetwork(page: Page, opts: { productId?: string } = {}) {
  const currentProductId = opts.productId ?? page.url().split('/').pop();

  // Wait for the delivery-related network response that corresponds to this product.
  try {
    const resp = await page.waitForResponse(r => {
      const isDelivery = DELIVERY_ENDPOINTS.some(re => re.test(r.url()));
      if (!isDelivery || !r.ok()) return false;

      // Optional: tie to productId if available (GET or POST bodies)
      try {
        const req = r.request();
        if (req.method() === 'GET') {
          return currentProductId ? r.url().includes(currentProductId) : true;
        }
        const data = req.postDataJSON?.();
        return currentProductId ? JSON.stringify(data || {}).includes(currentProductId) : true;
      } catch {
        return true; // fallback if request body isn't JSON
      }
    }, { timeout: 10000 });

    return resp;
  } catch {
    // No network request found - delivery might be embedded in product response
    return null;
  }
}

export async function waitForDeliveryUI(page: Page) {
  const section = deliverySectionLocator(page);
  await section.waitFor({ state: 'attached' }); // deterministic: waits until present

  // Check if section has aria-busy attribute for loading state
  const hasBusyAttr = await section.getAttribute('aria-busy');
  if (hasBusyAttr !== null) {
    await expect(section).toHaveAttribute('aria-busy', 'false');
    return;
  }

  // Otherwise, wait for one of the terminal, observable UI states
  const options = page.locator('input[type="radio"]');
  const emptyState = page.getByText(/no delivery options|delivery not available/i);
  const errorState = page.getByText(/delivery error|unable to load/i);

  // Wait for either delivery options to appear or an empty/error state
  await Promise.race([
    options.first().waitFor({ state: 'visible' }), // loaded with options
    emptyState.waitFor({ state: 'visible' }),       // no options
    errorState.waitFor({ state: 'visible' }),       // error state
  ]);
}

export async function waitForDeliveryLoaded(page: Page, opts: { productId?: string } = {}) {
  // Run both in parallel to avoid races: request + UI
  await Promise.all([
    waitForDeliveryNetwork(page, opts),
    waitForDeliveryUI(page),
  ]);
}

export async function openFirstProductWithDeliveryByClicking(page: Page, maxCardsToTry = 5) {
  const cards = page.locator('[data-testid="product-card"]');
  const total = Math.min(await cards.count(), maxCardsToTry);

  for (let i = 0; i < total; i++) {
    await Promise.all([
      page.waitForURL('**/products/**'),
      cards.nth(i).click(),
    ]);
    await page.getByTestId('product-title').waitFor({ state: 'visible' });

    // Deterministic wait: network + UI instead of fixed timeout
    try {
      // Derive productId from URL
      const productId = page.url().split('/').pop();
      await waitForDeliveryLoaded(page, { productId });
      return;
    } catch {
      // Not loaded or empty/error for this product; try next
      await page.goBack();
      await waitForProductsLoaded(page);
    }
  }

  throw new Error(`No product found with delivery options after checking ${total} products`);
}

export async function navigateToKnownProductWithDelivery(page: Page) {
  // Since seed is deterministic and all products get delivery options,
  // we can navigate directly to the first product
  await page.goto('/');
  await waitForProductsLoaded(page);
  
  // Click first product (which is guaranteed to have delivery options)
  const firstProductCard = page.locator('[data-testid="product-card"]').first();
  await Promise.all([
    page.waitForURL('**/products/**'),
    firstProductCard.click(),
  ]);
  
  await page.getByTestId('product-title').waitFor({ state: 'visible' });
  
  // Wait for delivery options to load using deterministic approach
  const productId = page.url().split('/').pop();
  await waitForDeliveryLoaded(page, { productId });
}

export async function navigateToFirstProductWithDelivery(page: Page) {
  // Use the most deterministic approach first (known to work from seed)
  try {
    await navigateToKnownProductWithDelivery(page);
  } catch {
    // Fallback to the clicking approach if needed
    await page.goto('/');
    await waitForProductsLoaded(page);
    await openFirstProductWithDeliveryByClicking(page);
  }
}
