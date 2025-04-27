import { test, expect } from '@playwright/test';

// Test data
const testUser = {
  username: `testuser_${Date.now()}`,
  email: `testuser_${Date.now()}@example.com`,
  password: 'Password123!',
  fullName: 'Test User'
};

// API Key data
const apiKeyName = `Test Key ${Date.now()}`;

test.describe('Authentication Flow', () => {
  test('should register a new user', async ({ page }) => {
    // Navigate to the registration page
    await page.goto('/auth/register');
    
    // Fill in the registration form
    await page.fill('input[name="username"]', testUser.username);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForURL('/auth/signin');
    
    // Verify we're on the sign-in page
    expect(page.url()).toContain('/auth/signin');
  });

  test('should login with the registered user', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/auth/signin');
    
    // Fill in the login form
    await page.fill('input[name="username"]', testUser.username);
    await page.fill('input[name="password"]', testUser.password);
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForURL('/dashboard');
    
    // Verify we're on the dashboard page
    expect(page.url()).toContain('/dashboard');
    
    // Verify the user is logged in by checking for the username in the user menu
    await page.click('.user-menu-button');
    const usernameElement = await page.waitForSelector('.user-menu-dropdown');
    const text = await usernameElement.textContent();
    expect(text).toContain(testUser.username);
  });

  test('should update user profile', async ({ page }) => {
    // Login first
    await page.goto('/auth/signin');
    await page.fill('input[name="username"]', testUser.username);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Navigate to the profile page
    await page.click('.user-menu-button');
    await page.click('text=Profile');
    
    // Wait for the profile page to load
    await page.waitForURL('/dashboard/profile');
    
    // Click the edit button
    await page.click('button:has-text("Edit")');
    
    // Update the full name
    await page.fill('input[name="full_name"]', testUser.fullName);
    
    // Save the changes
    await page.click('button:has-text("Save")');
    
    // Verify the changes were saved
    await page.waitForSelector(`text=${testUser.fullName}`);
    const fullNameElement = await page.locator(`text=${testUser.fullName}`);
    expect(await fullNameElement.isVisible()).toBeTruthy();
  });

  test('should create and manage API keys', async ({ page }) => {
    // Login first
    await page.goto('/auth/signin');
    await page.fill('input[name="username"]', testUser.username);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Navigate to the API keys page
    await page.click('.user-menu-button');
    await page.click('text=API Keys');
    
    // Wait for the API keys page to load
    await page.waitForURL('/dashboard/api-keys');
    
    // Click the create new key button
    await page.click('button:has-text("Create New Key")');
    
    // Fill in the key name
    await page.fill('input[placeholder="e.g., Production Key"]', apiKeyName);
    
    // Select expiration
    await page.selectOption('select', { value: '90' });
    
    // Create the key
    await page.click('button:has-text("Create Key")');
    
    // Wait for the key to be created
    await page.waitForSelector('text=New API Key Created');
    
    // Copy the key
    await page.click('button[title="Copy to clipboard"]');
    
    // Close the notification
    await page.click('button:has-text("×")');
    
    // Verify the key is in the list
    const keyElement = await page.locator(`text=${apiKeyName}`);
    expect(await keyElement.isVisible()).toBeTruthy();
    
    // Revoke the key
    await page.click('button[title="Revoke API key"]');
    
    // Confirm revocation
    await page.click('button:has-text("Revoke Key")');
    
    // Verify the key is revoked
    await page.waitForSelector('text=Revoked');
    const revokedBadge = await page.locator('text=Revoked');
    expect(await revokedBadge.isVisible()).toBeTruthy();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/auth/signin');
    await page.fill('input[name="username"]', testUser.username);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Click on the user menu
    await page.click('.user-menu-button');
    
    // Click on the logout button
    await page.click('text=Sign Out');
    
    // Wait for navigation to complete
    await page.waitForURL('/');
    
    // Verify we're on the home page
    expect(page.url()).toBe('http://localhost:3000/');
    
    // Try to access the dashboard (should redirect to login)
    await page.goto('/dashboard');
    await page.waitForURL('/auth/signin');
    
    // Verify we're redirected to the login page
    expect(page.url()).toContain('/auth/signin');
  });
});
