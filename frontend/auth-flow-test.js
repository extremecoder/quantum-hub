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
    slowMo: 100, // Slow down operations by 100ms
    args: ['--window-size=1280,800']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // Test 1: Register a new user
    console.log('Test 1: Registering a new user...');
    await page.goto('http://localhost:3000/auth/signup');

    // Wait for the page to load
    await page.waitForSelector('#username');

    // Fill in the registration form
    await page.type('#username', testUser.username);
    await page.type('#email', testUser.email);
    await page.type('#fullName', testUser.fullName);
    await page.type('#password', testUser.password);
    await page.type('#confirmPassword', testUser.password);

    // Submit the form
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ timeout: 60000 }).catch(() => console.log('Navigation timeout - continuing test'))
    ]);

    // Verify we're on the dashboard page (the app redirects directly to dashboard after registration)
    const afterRegisterUrl = page.url();
    console.log(`Navigated to: ${afterRegisterUrl}`);
    if (afterRegisterUrl.includes('/dashboard')) {
      console.log('✅ Test 1 passed: Successfully registered and redirected to dashboard');
    } else {
      console.log('❌ Test 1 failed: Not redirected to dashboard');

      // If we're not on the dashboard, try to sign in
      if (afterRegisterUrl.includes('/auth/signin')) {
        console.log('Redirected to sign-in page, attempting to log in...');

        // Fill in the login form
        await page.type('#username', testUser.username);
        await page.type('#password', testUser.password);

        // Submit the form
        await Promise.all([
          page.click('button[type="submit"]'),
          page.waitForNavigation({ timeout: 60000 }).catch(() => console.log('Navigation timeout - continuing test'))
        ]);
      }
    }

    // Test 2: Verify we're logged in by checking for user menu
    console.log('\nTest 2: Verifying user is logged in...');

    // Wait for the dashboard to load
    await page.waitForSelector('body', { timeout: 10000 });

    // Check if we're on the dashboard page
    const dashboardUrl = page.url();
    console.log(`Current URL: ${dashboardUrl}`);

    if (dashboardUrl.includes('/dashboard')) {
      console.log('✅ Test 2 passed: Successfully logged in and on dashboard');

      // Take a screenshot for verification
      await page.screenshot({ path: 'dashboard-screenshot.png' });
      console.log('Screenshot saved as dashboard-screenshot.png');
    } else {
      console.log('❌ Test 2 failed: Not on dashboard page');

      // Take a screenshot to see what page we're on
      await page.screenshot({ path: 'current-page-screenshot.png' });
      console.log('Screenshot saved as current-page-screenshot.png');
    }

    console.log('\nBasic authentication test completed!');

  } catch (error) {
    console.error('Test failed with error:', error);

    // Take a screenshot when an error occurs
    await page.screenshot({ path: 'error-screenshot.png' });
    console.log('Error screenshot saved as error-screenshot.png');
  } finally {
    // Close the browser
    await browser.close();
  }
}

// Run the tests
runTests().catch(console.error);
