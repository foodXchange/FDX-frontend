// E2E Test Example using Playwright
import { test, expect } from '@playwright/test';

test.describe('FDX Frontend E2E Tests', () => {
  test('should load home page successfully', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    await expect(page).toHaveTitle(/FoodXchange/);
    await expect(page.getByRole('banner')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL(/.*login/);
    
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
  });

  test('should handle form submission', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    
    await page.click('[data-testid="submit-button"]');
    
    // Should show loading state
    await expect(page.getByRole('button', { name: /loading/i })).toBeVisible();
  });
});
