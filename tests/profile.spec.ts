import { test, expect } from '@playwright/test';

// Test data
const testUser = {
  username: `profileuser_${Date.now()}`,
  email: `profileuser_${Date.now()}@example.com`,
  password: 'Password123!',
  fullName: 'Profile Test User',
  updatedFullName: 'Updated Profile User'
};

test.describe('User Profile Management', () => {
  // Before all tests, register a new user
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    
    // Register a new user
    await page.goto('/auth/register');
    await page.fill('input[name="username"]', testUser.username);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/auth/signin');
    
    await page.close();
  });
  
  // Before each test, login
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input[name="username"]', testUser.username);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });
  
  test('should display user profile information', async ({ page }) => {
    // Navigate to profile page
    await page.click('.user-menu-button');
    await page.click('text=Profile');
    await page.waitForURL('/dashboard/profile');
    
    // Verify profile information is displayed
    await page.waitForSelector('text=User Profile');
    
    // Check for username and email
    const usernameSection = await page.locator(`text=${testUser.username}`);
    const emailSection = await page.locator(`text=${testUser.email}`);
    
    expect(await usernameSection.isVisible()).toBeTruthy();
    expect(await emailSection.isVisible()).toBeTruthy();
  });
  
  test('should update full name', async ({ page }) => {
    // Navigate to profile page
    await page.click('.user-menu-button');
    await page.click('text=Profile');
    await page.waitForURL('/dashboard/profile');
    
    // Click edit button
    await page.click('button:has-text("Edit")');
    
    // Update full name
    await page.fill('input[name="full_name"]', testUser.fullName);
    
    // Save changes
    await page.click('button:has-text("Save")');
    
    // Verify changes were saved
    await page.waitForSelector(`text=${testUser.fullName}`);
    const fullNameElement = await page.locator(`text=${testUser.fullName}`);
    expect(await fullNameElement.isVisible()).toBeTruthy();
  });
  
  test('should toggle provider status', async ({ page }) => {
    // Navigate to profile page
    await page.click('.user-menu-button');
    await page.click('text=Profile');
    await page.waitForURL('/dashboard/profile');
    
    // Check initial account type
    const initialAccountType = await page.locator('text=Consumer');
    expect(await initialAccountType.isVisible()).toBeTruthy();
    
    // Click edit button
    await page.click('button:has-text("Edit")');
    
    // Toggle provider checkbox
    await page.check('input[name="is_provider"]');
    
    // Save changes
    await page.click('button:has-text("Save")');
    
    // Verify account type changed to Provider
    await page.waitForSelector('text=Provider');
    const updatedAccountType = await page.locator('text=Provider');
    expect(await updatedAccountType.isVisible()).toBeTruthy();
    
    // Toggle back
    await page.click('button:has-text("Edit")');
    await page.uncheck('input[name="is_provider"]');
    await page.click('button:has-text("Save")');
    
    // Verify account type changed back to Consumer
    await page.waitForSelector('text=Consumer');
    const revertedAccountType = await page.locator('text=Consumer');
    expect(await revertedAccountType.isVisible()).toBeTruthy();
  });
  
  test('should update full name and provider status together', async ({ page }) => {
    // Navigate to profile page
    await page.click('.user-menu-button');
    await page.click('text=Profile');
    await page.waitForURL('/dashboard/profile');
    
    // Click edit button
    await page.click('button:has-text("Edit")');
    
    // Update full name and toggle provider status
    await page.fill('input[name="full_name"]', testUser.updatedFullName);
    await page.check('input[name="is_provider"]');
    
    // Save changes
    await page.click('button:has-text("Save")');
    
    // Verify both changes were saved
    await page.waitForSelector(`text=${testUser.updatedFullName}`);
    const fullNameElement = await page.locator(`text=${testUser.updatedFullName}`);
    const accountTypeElement = await page.locator('text=Provider');
    
    expect(await fullNameElement.isVisible()).toBeTruthy();
    expect(await accountTypeElement.isVisible()).toBeTruthy();
  });
  
  test('should cancel edits without saving', async ({ page }) => {
    // Navigate to profile page
    await page.click('.user-menu-button');
    await page.click('text=Profile');
    await page.waitForURL('/dashboard/profile');
    
    // Get current full name
    const currentFullName = await page.locator('text=Full Name').locator('xpath=..').locator('p').nth(1).textContent();
    
    // Click edit button
    await page.click('button:has-text("Edit")');
    
    // Change full name
    await page.fill('input[name="full_name"]', 'This Should Not Be Saved');
    
    // Click cancel
    await page.click('button:has-text("Cancel")');
    
    // Verify name was not changed
    const unchangedFullName = await page.locator('text=Full Name').locator('xpath=..').locator('p').nth(1).textContent();
    expect(unchangedFullName).toEqual(currentFullName);
  });
});
