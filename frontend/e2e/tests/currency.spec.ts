import { test, expect } from '@playwright/test';
import { waitForProductsLoaded } from './utils/waits';

test.describe('Multi-Currency Functionality', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.removeItem('cart');
        localStorage.removeItem('cartItems');
        localStorage.removeItem('selectedCurrency');
      } catch (e) {
        // Ignore storage errors
      }
    });

    await page.route('**/fx/rates', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          base: 'USD',
          rates: { USD: 1, GBP: 0.79, EUR: 0.92, AUD: 1.52, MXN: 18.5, JPY: 157 },
          fetched_at: new Date().toISOString(),
          ttl_seconds: 21600,
          stale: false
        })
      });
    });
    
    await page.goto('/');
    await waitForProductsLoaded(page);
  });

  test('test_currency_selector_displays_in_header', async ({ page }) => {
    const currencySelector = page.locator('[data-testid="currency-selector-button"]');
    
    await expect(currencySelector).toBeVisible();
    
    const currencyText = await currencySelector.textContent();
    expect(currencyText).toContain('$');
  });

  test('test_switching_currency_updates_product_prices', async ({ page }) => {
    const firstProduct = page.locator('[data-testid^="product-"]').first();
    const priceLocator = firstProduct.locator('[data-testid="product-price"]');
    
    const initialPrice = await priceLocator.textContent();
    expect(initialPrice).toContain('$');
    
    const initialAmount = parseFloat(initialPrice?.replace(/[^0-9.]/g, '') || '0');
    
    const currencySelector = page.locator('[data-testid="currency-selector-button"]');
    await currencySelector.click();
    
    const gbpOption = page.locator('[data-testid="currency-option-GBP"]');
    await gbpOption.click();
    
    await page.waitForTimeout(500);
    
    const updatedPrice = await priceLocator.textContent();
    expect(updatedPrice).toContain('£');
    
    const updatedAmount = parseFloat(updatedPrice?.replace(/[^0-9.]/g, '') || '0');
    
    expect(updatedAmount).not.toBe(initialAmount);
    expect(updatedAmount).toBeGreaterThan(0);
    
    const expectedAmount = initialAmount * 0.79;
    expect(Math.abs(updatedAmount - expectedAmount)).toBeLessThan(1);
  });

  test('test_switching_currency_updates_cart_total', async ({ page }) => {
    const addToCartButton = page.locator('[data-testid="add-to-cart"]').first();
    await addToCartButton.click();
    
    await page.waitForTimeout(500);
    
    const cartLink = page.locator('[data-testid="cart-link"]');
    await cartLink.click();
    await page.waitForURL('**/cart');
    
    const cartTotal = page.locator('[data-testid="cart-total"]');
    const initialTotal = await cartTotal.textContent();
    expect(initialTotal).toContain('$');
    
    const initialAmount = parseFloat(initialTotal?.replace(/[^0-9.]/g, '') || '0');
    
    const currencySelector = page.locator('[data-testid="currency-selector-button"]');
    await currencySelector.click();
    
    const eurOption = page.locator('[data-testid="currency-option-EUR"]');
    await eurOption.click();
    
    await page.waitForTimeout(500);
    
    const updatedTotal = await cartTotal.textContent();
    expect(updatedTotal).toContain('€');
    
    const updatedAmount = parseFloat(updatedTotal?.replace(/[^0-9.]/g, '') || '0');
    
    expect(updatedAmount).not.toBe(initialAmount);
    expect(updatedAmount).toBeGreaterThan(0);
    
    const expectedAmount = initialAmount * 0.92;
    expect(Math.abs(updatedAmount - expectedAmount)).toBeLessThan(1);
  });

  test('test_currency_selection_persists_across_reload', async ({ page }) => {
    const currencySelector = page.locator('[data-testid="currency-selector-button"]');
    await currencySelector.click();
    
    const jpyOption = page.locator('[data-testid="currency-option-JPY"]');
    await jpyOption.click();
    
    await page.waitForTimeout(500);
    
    const firstProduct = page.locator('[data-testid^="product-"]').first();
    const priceLocator = firstProduct.locator('[data-testid="product-price"]');
    const priceBeforeReload = await priceLocator.textContent();
    expect(priceBeforeReload).toContain('¥');
    
    await page.reload();
    await waitForProductsLoaded(page);
    
    const currencySelectorAfterReload = page.locator('[data-testid="currency-selector-button"]');
    const currencyText = await currencySelectorAfterReload.textContent();
    expect(currencyText).toContain('¥');
    
    const priceAfterReload = await priceLocator.textContent();
    expect(priceAfterReload).toContain('¥');
  });

  test('test_all_supported_currencies_available', async ({ page }) => {
    const currencySelector = page.locator('[data-testid="currency-selector-button"]');
    await currencySelector.click();
    
    const currencies = ['USD', 'GBP', 'EUR', 'AUD', 'MXN', 'JPY'];
    
    for (const currency of currencies) {
      const currencyOption = page.locator(`[data-testid="currency-option-${currency}"]`);
      await expect(currencyOption).toBeVisible();
    }
    
    await page.keyboard.press('Escape');
  });

  test('test_currency_works_when_fx_api_fails', async ({ page }) => {
    await page.unroute('**/fx/rates');
    
    await page.route('**/fx/rates', async route => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    await page.reload();
    await waitForProductsLoaded(page);
    
    const firstProduct = page.locator('[data-testid^="product-"]').first();
    await expect(firstProduct).toBeVisible();
    
    const priceLocator = firstProduct.locator('[data-testid="product-price"]');
    const price = await priceLocator.textContent();
    expect(price).toBeTruthy();
    expect(price?.length).toBeGreaterThan(0);
    
    const currencySelector = page.locator('[data-testid="currency-selector-button"]');
    await expect(currencySelector).toBeVisible();
  });
});
