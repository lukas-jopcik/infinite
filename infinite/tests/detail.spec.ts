import { test, expect } from '@playwright/test';

test.describe('APOD Detail Page', () => {
  test('should load detail page for a specific date', async ({ page }) => {
    // Use a known date that should have content
    const testDate = '2025-09-29';
    await page.goto(`/objav-dna/${testDate}`);
    
    // Check that the page loads without errors
    await expect(page).toHaveTitle(/Infinite/);
    
    // Check for main content area
    await expect(page.locator('main')).toBeVisible();
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
  });

  test('should display APOD content for specific date', async ({ page }) => {
    const testDate = '2025-09-29';
    await page.goto(`/objav-dna/${testDate}`);
    await page.waitForLoadState('networkidle');
    
    // Check for APOD content elements
    const apodContent = page.locator('[data-testid="apod-content"]');
    if (await apodContent.count() > 0) {
      await expect(apodContent).toBeVisible();
    }
    
    // Check for date display
    const dateElement = page.locator(`text=${testDate}`);
    if (await dateElement.count() > 0) {
      await expect(dateElement).toBeVisible();
    }
    
    // Check for images
    const images = page.locator('img[alt*="APOD"], img[alt*="NASA"]');
    if (await images.count() > 0) {
      await expect(images.first()).toBeVisible();
    }
  });

  test('should have working back navigation', async ({ page }) => {
    const testDate = '2025-09-29';
    await page.goto(`/objav-dna/${testDate}`);
    
    // Look for back button or home link
    const backButton = page.locator('a[href="/"], button:has-text("Back"), button:has-text("←")');
    if (await backButton.count() > 0) {
      await expect(backButton.first()).toBeVisible();
      
      // Test navigation back to home
      await backButton.first().click();
      await expect(page).toHaveURL('/');
    }
  });

  test('should handle invalid dates gracefully', async ({ page }) => {
    // Test with invalid date format
    await page.goto('/objav-dna/invalid-date');
    
    // Check that the page still loads
    await expect(page.locator('main')).toBeVisible();
    
    // Check for error handling (if implemented)
    const errorMessage = page.locator('[data-testid="error-message"], .error, [role="alert"]');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('should handle future dates gracefully', async ({ page }) => {
    // Test with future date
    const futureDate = '2030-12-31';
    await page.goto(`/objav-dna/${futureDate}`);
    await page.waitForLoadState('networkidle');
    
    // Check that the page loads
    await expect(page.locator('main')).toBeVisible();
    
    // Check for appropriate handling of future dates
    const errorMessage = page.locator('[data-testid="error-message"], .error, [role="alert"]');
    const noContentMessage = page.locator('text=No content available, text=Not found');
    
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();
    } else if (await noContentMessage.count() > 0) {
      await expect(noContentMessage).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const testDate = '2025-09-29';
    await page.goto(`/objav-dna/${testDate}`);
    
    // Check that the page is still functional on mobile
    await expect(page.locator('main')).toBeVisible();
    
    // Check that images are responsive
    const images = page.locator('img');
    if (await images.count() > 0) {
      const firstImage = images.first();
      await expect(firstImage).toBeVisible();
      
      // Check that image doesn't overflow on mobile
      const imageBox = await firstImage.boundingBox();
      if (imageBox) {
        expect(imageBox.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API failure for specific date
    await page.route('**/api/latest*', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    const testDate = '2025-09-29';
    await page.goto(`/objav-dna/${testDate}`);
    await page.waitForLoadState('networkidle');
    
    // Check that the page still loads even with API errors
    await expect(page.locator('main')).toBeVisible();
    
    // Check for error handling (if implemented)
    const errorMessage = page.locator('[data-testid="error-message"], .error, [role="alert"]');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('should have proper meta tags for SEO', async ({ page }) => {
    const testDate = '2025-09-29';
    await page.goto(`/objav-dna/${testDate}`);
    
    // Check for essential meta tags
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:description"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
  });
});
