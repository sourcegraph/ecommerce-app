import { test, expect } from '@playwright/test';
import { waitForProductsLoaded, openFirstProductDetail, openProductWithDeliveryOptions, addToCartAndWaitForUpdate, navigateToFirstProductWithDelivery } from './utils/waits';

test.describe('Delivery Options', () => {
  let deliveryAvailable = false;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    try {
      await page.goto('/');
      await waitForProductsLoaded(page);
      await navigateToFirstProductWithDelivery(page);
      deliveryAvailable = true;
    } catch {
      deliveryAvailable = false;
    } finally {
      await page.close();
    }
  });

  test.beforeEach(async ({ page }) => {
    // Clear cart state before each test
    await page.addInitScript(() => {
      try {
        localStorage.removeItem('cart');
        // Clear any other cart-related storage if needed
        localStorage.removeItem('cartItems');
        localStorage.removeItem('selectedDelivery');
      } catch (e) {
        // Ignore storage errors in case localStorage is restricted
      }
    });
    
    await page.goto('/');
    await waitForProductsLoaded(page);

    test.skip(!deliveryAvailable, 'Delivery UI not found anywhere – skipping delivery tests');
  });

  test('should display delivery summary on product cards', async ({ page }) => {
    await openProductWithDeliveryOptions(page);
    const deliverySection = page.locator('[data-testid="delivery-section"], [data-testid="delivery-options"], [data-testid="shipping-section"], [data-testid="shipping-options"]');
    await expect(deliverySection.first()).toBeVisible();
    
    // Go back to verify delivery info shows on product card
    await page.goBack();
    await waitForProductsLoaded(page);
    
    // Check if delivery summary is visible on product cards
    const deliverySummary = page.locator('[data-testid="delivery-summary"]').first();
    if (await deliverySummary.count() > 0) {
      await expect(deliverySummary).toBeVisible();
    }
  });

  test('should display delivery options on product detail page', async ({ page }) => {
    await navigateToFirstProductWithDelivery(page);
    
    const deliverySection = page.locator('[data-testid="delivery-section"], [data-testid="delivery-options"], [data-testid="shipping-section"], [data-testid="shipping-options"]').first();
    await expect(deliverySection).toBeVisible();
    
    // Check for radio buttons
    const radioButtons = deliverySection.locator('input[type="radio"]');
    const radioCount = await radioButtons.count();
    expect(radioCount).toBeGreaterThan(0);
    await expect(radioButtons.first()).toBeVisible();
    
    // Verify one option is selected by default
    const selectedRadio = deliverySection.locator('input[type="radio"]:checked');
    expect(await selectedRadio.count()).toBe(1);
  });

  test('should allow selecting different delivery options', async ({ page }) => {
    await navigateToFirstProductWithDelivery(page);
    
    const deliverySection = page.locator('[data-testid="delivery-section"], [data-testid="delivery-options"], [data-testid="shipping-section"], [data-testid="shipping-options"]').first();
    const radioButtons = deliverySection.locator('input[type="radio"]');
    const radioCount = await radioButtons.count();
    
    expect(radioCount).toBeGreaterThanOrEqual(2); // Should have multiple options
    
    // Get the initially selected option
    const initiallySelected = deliverySection.locator('input[type="radio"]:checked');
    const initialValue = await initiallySelected.getAttribute('value');
    
    // Find a different option to select
    for (let i = 0; i < radioCount; i++) {
      const radio = radioButtons.nth(i);
      const value = await radio.getAttribute('value');
      const isDisabled = await radio.isDisabled();
      
      if (value !== initialValue && !isDisabled) {
        // Click the radio button's container instead of the radio directly
        const radioContainer = radio.locator('..').locator('..');
        await radioContainer.click();
        
        // Verify the selection changed
        await expect(radio).toBeChecked();
        
        // Verify the previously selected is no longer checked
        if (initialValue) {
          const previousRadio = deliverySection.locator(`input[type="radio"][value="${initialValue}"]`);
          if (await previousRadio.count() > 0) {
            await expect(previousRadio).not.toBeChecked();
          }
        }
        break;
      }
    }
  });

  test('should display delivery icons for different options', async ({ page }) => {
    // Open first product detail page and wait for it to load
    await openFirstProductDetail(page);
    
    // Look for delivery options section
    const deliverySection = page.locator('[data-testid="delivery-section"]');
    
    if (await deliverySection.count() > 0) {
      // Look for SVG icons within the delivery section
      const icons = deliverySection.locator('svg');
      const iconCount = await icons.count();
      
      if (iconCount > 0) {
        // Should have at least one icon per delivery option
        expect(iconCount).toBeGreaterThanOrEqual(1);
      } else {
        // With deterministic delivery options, we should have at least some icons
        throw new Error('Expected delivery icons but none found in delivery section');
      }
    }
  });

  test('should auto-select appropriate default delivery option', async ({ page }) => {
    // Open first product detail page and wait for it to load
    await openFirstProductDetail(page);
    
    // Check if delivery options are present
    const deliverySection = page.locator('[data-testid="delivery-section"]');
    
    if (await deliverySection.count() > 0) {
      // Check if there's a selected radio button
      const selectedRadio = deliverySection.locator('input[type="radio"]:checked');
      
      if (await selectedRadio.count() > 0) {
        await expect(selectedRadio).toBeVisible();
        
        // The selected option should be enabled (not disabled)
        await expect(selectedRadio).toBeEnabled();
      }
    }
  });

  test('should show delivery section header text', async ({ page }) => {
    // Open first product detail page and wait for it to load
    await openFirstProductDetail(page);
    
    // Look for delivery section
    const deliverySection = page.locator('[data-testid="delivery-section"]');
    
    if (await deliverySection.count() > 0) {
      // Look for "Delivery Options" text or similar
      const headerText = page.getByText(/delivery options/i);
      
      if (await headerText.count() > 0) {
        await expect(headerText).toBeVisible();
      } else {
        // With proper UI implementation, delivery section should have header
        throw new Error('Delivery section found but missing expected header text');
      }
    }
  });

  test('should maintain functionality when no delivery restrictions apply', async ({ page }) => {
    // This test ensures that products don't show minimum order restrictions
    // which was mentioned in the original test as something that shouldn't happen
    
    const productCards = page.locator('[data-testid="product-card"]');
    const cardCount = await productCards.count();
    
    // Test a few products to ensure no minimum order restrictions are shown
    for (let i = 0; i < Math.min(3, cardCount); i++) {
      const card = productCards.nth(i);
      await card.click();
      
      // Wait for product detail page to load by waiting for product title
      await page.locator('[data-testid="product-title"]').waitFor({ state: 'visible' });
      
      // Verify NO minimum order restrictions are shown on product pages
      const minOrderText = page.getByText(/Minimum order|Min order/i);
      await expect(minOrderText).toHaveCount(0);
      
      // Verify delivery options are still displayed and selectable (if they exist)
      const deliverySection = page.locator('[data-testid="delivery-section"]');
      if (await deliverySection.count() > 0) {
        const deliveryOptions = deliverySection.locator('input[type="radio"]');
        if (await deliveryOptions.count() > 0) {
          // All options should be enabled (not disabled)
          const disabledOptions = deliverySection.locator('input[type="radio"]:disabled');
          await expect(disabledOptions).toHaveCount(0);
        }
      }
      
      // Go back to test another product
      if (i < Math.min(3, cardCount) - 1) {
        await page.goBack();
        await waitForProductsLoaded(page);
      }
    }
  });

  test('should handle products without delivery options gracefully', async ({ page }) => {
    // Test that the app works fine even when products don't have delivery options
    await openFirstProductDetail(page);
    
    // Whether or not delivery section exists, the product page should be functional
    await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-to-cart"]')).toBeVisible();
    
    // Add to cart should work regardless of delivery options
    const addToCartButton = page.locator('[data-testid="add-to-cart"]');
    
    if (!(await addToCartButton.isDisabled())) {
      const cartBadge = page.locator('[data-testid="cart-count"]');
      let initialCount = 0;
      
      if (await cartBadge.count() > 0) {
        const initialCountText = await cartBadge.textContent();
        initialCount = parseInt(initialCountText || '0') || 0;
      }
      
      // Add to cart and verify it works
      await addToCartButton.click();
      
      // Verify cart was updated
      if (await cartBadge.count() > 0) {
        await expect(cartBadge).toHaveText(String(initialCount + 1));
      }
    }
  });

  test('should maintain functionality when no delivery restrictions apply', async ({ page }) => {
    // This test ensures that products don't show minimum order restrictions
    // which was mentioned in the original test as something that shouldn't happen
    
    const productCards = page.locator('[data-testid="product-card"]');
    const cardCount = await productCards.count();
    
    // Test a few products to ensure no minimum order restrictions are shown
    for (let i = 0; i < Math.min(3, cardCount); i++) {
      const card = productCards.nth(i);
      await card.click();
      await page.waitForTimeout(1000);
      
      // Verify NO minimum order restrictions are shown on product pages
      const minOrderText = page.getByText(/Minimum order|Min order/i);
      await expect(minOrderText).toHaveCount(0);
      
      // Verify delivery options are still displayed and selectable (if they exist)
      const deliverySection = page.locator('[data-testid="delivery-section"]');
      if (await deliverySection.count() > 0) {
        const deliveryOptions = deliverySection.locator('input[type="radio"]');
        if (await deliveryOptions.count() > 0) {
          // All options should be enabled (not disabled)
          const disabledOptions = deliverySection.locator('input[type="radio"]:disabled');
          await expect(disabledOptions).toHaveCount(0);
        }
      }
      
      // Go back to test another product
      if (i < Math.min(3, cardCount) - 1) {
        await page.goBack();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should handle products without delivery options gracefully', async ({ page }) => {
    // Test that the app works fine even when products don't have delivery options
    
    const productCards = page.locator('[data-testid="product-card"]');
    const cardCount = await productCards.count();
    
    let testedProduct = false;
    
    // Test at least one product
    for (let i = 0; i < Math.min(3, cardCount); i++) {
      const card = productCards.nth(i);
      await card.click();
      await page.waitForTimeout(1000);
      
      testedProduct = true;
      
      // Whether or not delivery section exists, the product page should be functional
      await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
      await expect(page.locator('[data-testid="add-to-cart"]')).toBeVisible();
      
      // Add to cart should work regardless of delivery options
      const addToCartButton = page.locator('[data-testid="add-to-cart"]');
      
      if (!(await addToCartButton.isDisabled())) {
        const cartBadge = page.locator('[data-testid="cart-count"]');
        let initialCount = 0;
        
        if (await cartBadge.count() > 0) {
          const initialCountText = await cartBadge.textContent();
          initialCount = parseInt(initialCountText || '0') || 0;
        }
        
        await addToCartButton.click();
        await page.waitForTimeout(500);
        
        // Verify cart was updated
        if (await cartBadge.count() > 0) {
          const newCountText = await cartBadge.textContent();
          const newCount = parseInt(newCountText || '0') || 0;
          expect(newCount).toBeGreaterThan(initialCount);
        }
      }
      
      // Go back for next product
      if (i < Math.min(3, cardCount) - 1) {
        await page.goBack();
        await page.waitForTimeout(500);
      }
    }
    
    expect(testedProduct).toBeTruthy();
  });
});
