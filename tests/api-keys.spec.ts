import { test, expect } from '@playwright/test';

// Test data
const testUser = {
  username: `apiuser_${Date.now()}`,
  email: `apiuser_${Date.now()}@example.com`,
  password: 'Password123!',
};

test.describe('API Key Management', () => {
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
  
  test('should create a development API key', async ({ page }) => {
    // Navigate to API keys page
    await page.click('.user-menu-button');
    await page.click('text=API Keys');
    await page.waitForURL('/dashboard/api-keys');
    
    // Create a new development key
    await page.click('button:has-text("Create New Key")');
    await page.fill('input[placeholder="e.g., Production Key"]', 'Development Key');
    await page.selectOption('select', { value: '30' });
    await page.click('button:has-text("Create Key")');
    
    // Verify key was created
    await page.waitForSelector('text=New API Key Created');
    
    // Copy the key and close notification
    await page.click('button[title="Copy to clipboard"]');
    await page.click('button:has-text("×")');
    
    // Verify key appears in the list
    const keyElement = await page.locator('text=Development Key');
    expect(await keyElement.isVisible()).toBeTruthy();
  });
  
  test('should create a production API key', async ({ page }) => {
    // Navigate to API keys page
    await page.click('.user-menu-button');
    await page.click('text=API Keys');
    await page.waitForURL('/dashboard/api-keys');
    
    // Create a new production key
    await page.click('button:has-text("Create New Key")');
    await page.fill('input[placeholder="e.g., Production Key"]', 'Production Key');
    await page.selectOption('select', { value: '365' });
    await page.click('button:has-text("Create Key")');
    
    // Verify key was created
    await page.waitForSelector('text=New API Key Created');
    
    // Copy the key and close notification
    await page.click('button[title="Copy to clipboard"]');
    await page.click('button:has-text("×")');
    
    // Verify key appears in the list
    const keyElement = await page.locator('text=Production Key');
    expect(await keyElement.isVisible()).toBeTruthy();
  });
  
  test('should revoke an API key', async ({ page }) => {
    // Navigate to API keys page
    await page.click('.user-menu-button');
    await page.click('text=API Keys');
    await page.waitForURL('/dashboard/api-keys');
    
    // Create a key to revoke
    await page.click('button:has-text("Create New Key")');
    await page.fill('input[placeholder="e.g., Production Key"]', 'Key To Revoke');
    await page.selectOption('select', { value: '30' });
    await page.click('button:has-text("Create Key")');
    
    // Close the notification
    await page.click('button:has-text("×")');
    
    // Find and revoke the key
    const keyRow = await page.locator('li:has-text("Key To Revoke")');
    await keyRow.locator('button[title="Revoke API key"]').click();
    
    // Confirm revocation
    await page.click('button:has-text("Revoke Key")');
    
    // Verify the key is revoked
    await page.waitForSelector('text=Revoked');
    
    // Find the revoked badge within the key row
    const revokedBadge = await keyRow.locator('text=Revoked');
    expect(await revokedBadge.isVisible()).toBeTruthy();
  });
  
  test('should display API usage stats', async ({ page }) => {
    // Navigate to API keys page
    await page.click('.user-menu-button');
    await page.click('text=API Keys');
    await page.waitForURL('/dashboard/api-keys');
    
    // Verify API usage stats are displayed
    await page.waitForSelector('text=API Usage');
    
    // Check for requests and compute time sections
    const requestsSection = await page.locator('text=Requests');
    const computeTimeSection = await page.locator('text=Compute Time');
    
    expect(await requestsSection.isVisible()).toBeTruthy();
    expect(await computeTimeSection.isVisible()).toBeTruthy();
  });
});
