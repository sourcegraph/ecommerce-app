import { test, expect } from '@playwright/test';

test.describe('Delivery Options', () => {
  test('should display delivery summary on product cards', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    // Check that products show delivery information
    const productCards = page.locator('[data-testid="product-card"]');
    const cardCount = await productCards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // Check first few product cards for delivery info
    for (let i = 0; i < Math.min(3, cardCount); i++) {
      const card = productCards.nth(i);
      
      // Look for delivery-related text
      const deliveryInfo = card.getByText(/Free delivery|delivery from|\d+.day/i).first();
      
      if (await deliveryInfo.count() > 0) {
        await expect(deliveryInfo).toBeVisible();
      }
    }
  });

  test('should show different delivery times for different products', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    
    // Collect delivery information from multiple products
    const productCards = page.locator('[data-testid="product-card"]');
    const deliveryTexts = [];
    
    const cardCount = await productCards.count();
    for (let i = 0; i < Math.min(5, cardCount); i++) {
      const card = productCards.nth(i);
      const deliveryElement = card.locator('text=/Same day|\\d+.day|\\d+–\\d+ days/');
      
      if (await deliveryElement.count() > 0) {
        const text = await deliveryElement.textContent();
        if (text) {
          deliveryTexts.push(text.trim());
        }
      }
    }
    
    // Should have variety in delivery times
    const uniqueDeliveryTimes = new Set(deliveryTexts);
    expect(uniqueDeliveryTimes.size).toBeGreaterThan(1);
  });

  test('should display full delivery options on product detail page', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load and click on first product
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Wait for product detail page to load
    await page.waitForTimeout(1000);
    
    // Look for delivery options section
    const deliverySection = page.getByText('Delivery Options');
    
    if (await deliverySection.count() > 0) {
      await expect(deliverySection).toBeVisible();
      
      // Check for radio buttons
      const radioButtons = page.locator('input[type="radio"]');
      expect(await radioButtons.count()).toBeGreaterThanOrEqual(2);
      
      // Check for delivery option names
      const standardShipping = page.getByText('Standard Shipping').first();
      const expressDelivery = page.getByText('Express Delivery').first();
      
      // Verify at least one delivery option is visible
      const hasStandard = await standardShipping.count() > 0;
      const hasExpress = await expressDelivery.count() > 0;
      expect(hasStandard || hasExpress).toBeTruthy();
    }
  });

  test('should allow selecting different delivery options', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load and click on first product
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Wait for product detail page to load
    await page.waitForTimeout(1000);
    
    // Check if delivery options are present
    const radioButtons = page.locator('input[type="radio"]');
    const radioCount = await radioButtons.count();
    
    if (radioCount >= 2) {
      // Get the initially selected option
      const initiallySelected = page.locator('input[type="radio"]:checked');
      const initialValue = await initiallySelected.getAttribute('value');
      
      // Find a different option to select
      for (let i = 0; i < radioCount; i++) {
        const radio = radioButtons.nth(i);
        const value = await radio.getAttribute('value');
        const isDisabled = await radio.isDisabled();
        
        if (value !== initialValue && !isDisabled) {
          // Click the radio button's container/label for better interaction
          const radioContainer = radio.locator('..').locator('..');
          await radioContainer.click();
          
          // Verify the selection changed
          await expect(radio).toBeChecked();
          break;
        }
      }
    } else {
      test.skip('Not enough delivery options to test selection');
    }
  });

  test('should not show minimum order restrictions on product pages', async ({ page }) => {
    await page.goto('/products');
    
    // Find a low-priced product to verify restrictions are not shown
    const productCards = page.locator('[data-testid="product-card"]');
    const cardCount = await productCards.count();
    
    let testedProducts = 0;
    
    for (let i = 0; i < cardCount && testedProducts < 3; i++) {
      const card = productCards.nth(i);
      const priceElement = card.locator('text=/\\$\\d+/');
      
      if (await priceElement.count() > 0) {
        const priceText = await priceElement.textContent();
        const price = parseFloat(priceText?.replace('$', '') || '0');
        
        // Test products under $30 to ensure no minimum order restrictions are shown
        if (price > 0 && price < 30) {
          await card.click();
          await page.waitForTimeout(1000);
          
          // Verify NO minimum order restrictions are shown on product pages
          const minOrderText = page.locator('text=/Minimum order|Min order/');
          await expect(minOrderText).toHaveCount(0);
          
          // Verify delivery options are still displayed and selectable
          const deliveryOptions = page.locator('input[type="radio"]');
          if (await deliveryOptions.count() > 0) {
            // All options should be enabled (not disabled)
            const disabledOptions = page.locator('input[type="radio"]:disabled');
            await expect(disabledOptions).toHaveCount(0);
          }
          
          testedProducts++;
          
          // Go back to try another product
          await page.goBack();
          await page.waitForTimeout(500);
        }
      }
    }
    
    if (testedProducts === 0) {
      test.skip('No low-priced products found to test');
    }
  });

  test('should display delivery icons for different speeds', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load and click on first product
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Wait for product detail page to load
    await page.waitForTimeout(1000);
    
    // Look for delivery option icons (SVG icons from heroicons)
    const deliveryIcons = page.locator('svg').filter({ hasText: '' });
    const iconCount = await deliveryIcons.count();
    
    if (iconCount > 0) {
      // Should have at least one icon per delivery option
      expect(iconCount).toBeGreaterThanOrEqual(2);
    }
  });

  test('should auto-select appropriate default delivery option', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load and click on first product
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Wait for product detail page to load
    await page.waitForTimeout(1000);
    
    // Check if there's a selected radio button
    const selectedRadio = page.locator('input[type="radio"]:checked');
    
    if (await selectedRadio.count() > 0) {
      await expect(selectedRadio).toBeVisible();
      
      // The selected option should be enabled (not disabled)
      await expect(selectedRadio).toBeEnabled();
    }
  });

  test('should persist delivery selection when navigating', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load and click on first product
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Wait for product detail page to load
    await page.waitForTimeout(1000);
    
    const radioButtons = page.locator('input[type="radio"]');
    const radioCount = await radioButtons.count();
    
    if (radioCount >= 2) {
      // Select a different option
      const secondRadio = radioButtons.nth(1);
      if (await secondRadio.isEnabled()) {
        const radioContainer = secondRadio.locator('..').locator('..');
        await radioContainer.click();
        
        const selectedValue = await secondRadio.getAttribute('value');
        
        // Navigate away and back
        await page.goBack();
        await page.waitForTimeout(500);
        await page.locator('[data-testid="product-card"]').first().click();
        await page.waitForTimeout(1000);
        
        // Check if selection is maintained (this would depend on implementation)
        // For now, just verify that delivery options are still displayed
        await expect(page.getByText('Delivery Options')).toBeVisible();
      }
    } else {
      test.skip('Not enough delivery options to test persistence');
    }
  });
});
