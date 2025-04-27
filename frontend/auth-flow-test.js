const puppeteer = require('puppeteer');

// Test data
const testUser = {
  username: `testuser_${Date.now()}`,
  email: `testuser_${Date.now()}@example.com`,
  password: 'Password123!',
  fullName: 'Test User'
};

// API Key data
const apiKeyName = `Test Key ${Date.now()}`;

async function runTests() {
  console.log('Starting authentication flow tests...');
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for headless mode
    slowMo: 50, // Slow down operations by 50ms
    args: ['--window-size=1280,800']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    // Test 1: Register a new user
    console.log('Test 1: Registering a new user...');
    await page.goto('http://localhost:3000/auth/register');
    
    // Fill in the registration form
    await page.type('input[name="username"]', testUser.username);
    await page.type('input[name="email"]', testUser.email);
    await page.type('input[name="password"]', testUser.password);
    await page.type('input[name="confirmPassword"]', testUser.password);
    
    // Submit the form
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation()
    ]);
    
    // Verify we're on the sign-in page
    const signInUrl = page.url();
    console.log(`Navigated to: ${signInUrl}`);
    if (signInUrl.includes('/auth/signin')) {
      console.log('✅ Test 1 passed: Successfully registered and redirected to sign-in page');
    } else {
      console.log('❌ Test 1 failed: Not redirected to sign-in page');
    }
    
    // Test 2: Login with the registered user
    console.log('\nTest 2: Logging in with the registered user...');
    
    // Fill in the login form
    await page.type('input[name="username"]', testUser.username);
    await page.type('input[name="password"]', testUser.password);
    
    // Submit the form
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation()
    ]);
    
    // Verify we're on the dashboard page
    const dashboardUrl = page.url();
    console.log(`Navigated to: ${dashboardUrl}`);
    if (dashboardUrl.includes('/dashboard')) {
      console.log('✅ Test 2 passed: Successfully logged in and redirected to dashboard');
    } else {
      console.log('❌ Test 2 failed: Not redirected to dashboard');
    }
    
    // Test 3: Update user profile
    console.log('\nTest 3: Updating user profile...');
    
    // Navigate to the profile page
    await page.click('.user-menu-button');
    await page.waitForSelector('a[href="/dashboard/profile"]');
    await Promise.all([
      page.click('a[href="/dashboard/profile"]'),
      page.waitForNavigation()
    ]);
    
    // Verify we're on the profile page
    const profileUrl = page.url();
    console.log(`Navigated to: ${profileUrl}`);
    
    // Click the edit button
    await page.waitForSelector('button:has-text("Edit")');
    await page.click('button:has-text("Edit")');
    
    // Update the full name
    await page.waitForSelector('input[name="full_name"]');
    await page.type('input[name="full_name"]', testUser.fullName);
    
    // Save the changes
    await page.click('button:has-text("Save")');
    
    // Wait for the save to complete
    await page.waitForFunction(
      (fullName) => document.body.textContent.includes(fullName),
      {},
      testUser.fullName
    );
    
    console.log('✅ Test 3 passed: Successfully updated user profile');
    
    // Test 4: Create and manage API keys
    console.log('\nTest 4: Creating and managing API keys...');
    
    // Navigate to the API keys page
    await page.click('.user-menu-button');
    await page.waitForSelector('a[href="/dashboard/api-keys"]');
    await Promise.all([
      page.click('a[href="/dashboard/api-keys"]'),
      page.waitForNavigation()
    ]);
    
    // Verify we're on the API keys page
    const apiKeysUrl = page.url();
    console.log(`Navigated to: ${apiKeysUrl}`);
    
    // Click the create new key button
    await page.waitForSelector('button:has-text("Create New Key")');
    await page.click('button:has-text("Create New Key")');
    
    // Fill in the key name
    await page.waitForSelector('input[placeholder="e.g., Production Key"]');
    await page.type('input[placeholder="e.g., Production Key"]', apiKeyName);
    
    // Select expiration
    await page.select('select', '90');
    
    // Create the key
    await page.click('button:has-text("Create Key")');
    
    // Wait for the key to be created
    await page.waitForSelector('text=New API Key Created');
    
    // Copy the key
    await page.click('button[title="Copy to clipboard"]');
    
    // Close the notification
    await page.click('button:has-text("×")');
    
    // Verify the key is in the list
    await page.waitForFunction(
      (keyName) => document.body.textContent.includes(keyName),
      {},
      apiKeyName
    );
    
    console.log('✅ Test 4 passed: Successfully created an API key');
    
    // Test 5: Logout
    console.log('\nTest 5: Logging out...');
    
    // Click on the user menu
    await page.click('.user-menu-button');
    
    // Click on the logout button
    await page.waitForSelector('text=Sign Out');
    await Promise.all([
      page.click('text=Sign Out'),
      page.waitForNavigation()
    ]);
    
    // Verify we're on the home page
    const homeUrl = page.url();
    console.log(`Navigated to: ${homeUrl}`);
    if (homeUrl === 'http://localhost:3000/') {
      console.log('✅ Test 5 passed: Successfully logged out and redirected to home page');
    } else {
      console.log('❌ Test 5 failed: Not redirected to home page');
    }
    
    console.log('\nAll tests completed successfully!');
    
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    // Close the browser
    await browser.close();
  }
}

// Run the tests
runTests().catch(console.error);
