const puppeteer = require('puppeteer');

// Test data with a simple alphanumeric username
const testUser = {
  username: 'testuser9913', // Use an existing user
  password: 'Password123!',
};

async function runTest() {
  console.log('Starting sign-out test...');
  console.log('Test user:', testUser);

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    args: ['--window-size=1280,800']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // Step 1: Sign in
    console.log('\n=== Step 1: Sign in ===');
    await page.goto('http://localhost:3001/auth/signin');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Fill in the form
    await page.type('#username', testUser.username);
    await page.type('#password', testUser.password);

    // Take a screenshot
    await page.screenshot({ path: 'signin-form-filled.png' });

    // Submit the form
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ timeout: 10000 }).catch(e => console.log('Navigation timeout:', e.message))
    ]);

    // Check if we're logged in
    const dashboardUrl = page.url();
    console.log('Current URL after login:', dashboardUrl);

    if (!dashboardUrl.includes('/dashboard')) {
      throw new Error('Login failed, not redirected to dashboard');
    }

    console.log('Successfully logged in!');
    await page.screenshot({ path: 'dashboard-after-login.png' });

    // Step 2: Check session state
    console.log('\n=== Step 2: Check session state ===');

    // Check localStorage
    const localStorage = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        items[key] = localStorage.getItem(key);
      }
      return items;
    });

    console.log('localStorage after login:', localStorage);

    // Check session cookies
    const cookies = await page.cookies();
    console.log('Cookies after login:', cookies);

    // Step 3: Sign out
    console.log('\n=== Step 3: Sign out ===');

    // Click on the user menu
    const userMenuButton = await page.$('.rounded-full') || await page.$('button[aria-expanded]');
    if (!userMenuButton) {
      throw new Error('User menu button not found');
    }

    await userMenuButton.click();
    console.log('Clicked user menu button');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Take a screenshot of the dropdown
    await page.screenshot({ path: 'user-menu-dropdown.png' });

    // Find and click the sign out button using text content
    const signOutButtonSelector = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const signOutButton = buttons.find(button =>
        button.textContent.includes('Sign out') ||
        button.textContent.includes('Sign Out') ||
        button.textContent.includes('Logout') ||
        button.textContent.includes('Log out')
      );

      if (signOutButton) {
        // Add a unique ID to the button for easy selection
        signOutButton.id = 'puppeteer-signout-button';
        return '#puppeteer-signout-button';
      }

      // Try to find by class if text search fails
      const redButtons = Array.from(document.querySelectorAll('button.text-red-600, button.text-red-400'));
      if (redButtons.length > 0) {
        redButtons[0].id = 'puppeteer-signout-button';
        return '#puppeteer-signout-button';
      }

      return null;
    });

    if (!signOutButtonSelector) {
      // Take a screenshot of the dropdown for debugging
      await page.screenshot({ path: 'dropdown-no-signout-button.png' });

      // Dump the HTML for debugging
      const html = await page.content();
      console.log('Dropdown HTML:', html.substring(0, 1000) + '...');

      throw new Error('Sign out button not found');
    }

    console.log('Found sign out button with selector:', signOutButtonSelector);

    // Click the sign out button
    await Promise.all([
      page.click(signOutButtonSelector),
      page.waitForNavigation({ timeout: 10000 }).catch(e => console.log('Navigation timeout:', e.message))
    ]);

    // Check the URL after sign out
    const afterSignOutUrl = page.url();
    console.log('URL after sign out:', afterSignOutUrl);

    // Step 4: Verify sign out
    console.log('\n=== Step 4: Verify sign out ===');

    // Check localStorage after sign out
    const localStorageAfterSignOut = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        items[key] = localStorage.getItem(key);
      }
      return items;
    });

    console.log('localStorage after sign out:', localStorageAfterSignOut);

    // Check cookies after sign out
    const cookiesAfterSignOut = await page.cookies();
    console.log('Cookies after sign out:', cookiesAfterSignOut);

    // Try to access a protected page
    console.log('\n=== Step 5: Try to access protected page ===');
    await page.goto('http://localhost:3001/dashboard');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take a screenshot
    await page.screenshot({ path: 'after-signout-dashboard-access.png' });

    // Check if we're redirected to login
    const finalUrl = page.url();
    console.log('URL after trying to access dashboard:', finalUrl);

    if (finalUrl.includes('/auth/signin')) {
      console.log('✅ Sign out successful! Redirected to login page when trying to access dashboard.');
    } else if (finalUrl.includes('/dashboard')) {
      console.log('❌ Sign out failed! Still able to access dashboard after sign out.');
    } else {
      console.log('⚠️ Unexpected URL after sign out:', finalUrl);
    }

    console.log('\nTest completed!');
  } catch (error) {
    console.error('Test failed with error:', error);
    await page.screenshot({ path: 'error-state.png' });
  } finally {
    // Close the browser
    await browser.close();
  }
}

// Run the test
runTest().catch(console.error);
