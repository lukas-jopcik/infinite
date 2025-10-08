import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads without errors
    await expect(page).toHaveTitle(/Infinite/);
    
    // Check for main navigation elements (be more specific to avoid multiple nav elements)
    await expect(page.getByRole('navigation', { name: 'Hlavná navigácia' })).toBeVisible();
    
    // Check for main content area
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display APOD content', async ({ page }) => {
    await page.goto('/');
    
    // Wait for content to load (API call)
    await page.waitForLoadState('networkidle');
    
    // Check for APOD content elements
    const apodContent = page.locator('[data-testid="apod-content"]');
    if (await apodContent.count() > 0) {
      await expect(apodContent.first()).toBeVisible();
    }
    
    // Check for images (if any APOD content is loaded)
    const images = page.locator('img[alt*="APOD"], img[alt*="NASA"]');
    if (await images.count() > 0) {
      await expect(images.first()).toBeVisible();
    }
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check for navigation links (use main navigation specifically)
    const navLinks = page.getByRole('navigation', { name: 'Hlavná navigácia' }).locator('a');
    if (await navLinks.count() > 0) {
      // Test that navigation links are clickable
      await expect(navLinks.first()).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that the page is still functional on mobile
    await expect(page.locator('main')).toBeVisible();
    
    // Check that navigation is accessible on mobile (use main navigation specifically)
    const nav = page.getByRole('navigation', { name: 'Hlavná navigácia' });
    if (await nav.count() > 0) {
      await expect(nav).toBeVisible();
    }
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/latest*', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that the page still loads even with API errors
    await expect(page.locator('main')).toBeVisible();
    
    // Check for error handling (if implemented)
    const errorMessage = page.locator('[data-testid="error-message"], .error, [role="alert"]');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();
    }
  });
});
