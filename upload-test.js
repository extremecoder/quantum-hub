const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  // Launch the browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the login page first
    await page.goto('http://localhost:3000/auth/signin');

    console.log('Login page loaded');

    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');

    // Fill in the login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');

    console.log('Login form filled');

    // Take a screenshot of the login form
    await page.screenshot({ path: 'login-form.png' });

    // Click the login button
    await page.click('button:has-text("Sign in")');

    console.log('Clicked sign in button');

    // Wait for navigation to complete
    await page.waitForNavigation();

    // Navigate to the dashboard page
    await page.goto('http://localhost:3000/dashboard');

    console.log('Dashboard page loaded');

    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');

    // Take a screenshot of the dashboard
    await page.screenshot({ path: 'dashboard.png' });

    // Wait for the Upload Package button to be visible
    await page.waitForSelector('button:has-text("Upload Package")', { timeout: 20000 });

    // Click the "Upload Package" button
    await page.click('button:has-text("Upload Package")');

    console.log('Clicked on Upload Package button');

    // Wait for the upload modal to appear
    await page.waitForSelector('h3:has-text("Upload Quantum App Package")');

    console.log('Upload modal appeared');

    // Get the file path
    const filePath = path.join(__dirname, 'sample', 'one-2.0.0.zip');
    console.log('File path:', filePath);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.error('File does not exist:', filePath);
      throw new Error(`File does not exist: ${filePath}`);
    }

    console.log('File exists, proceeding with upload');

    // Set the file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    console.log('File selected');

    // Click the "Upload" button
    await page.getByRole('button', { name: 'Upload', exact: true }).click();

    console.log('Clicked on Upload button');

    // Wait for the upload to complete and the modal to close
    await page.waitForSelector('h3:has-text("Upload Quantum App Package")', { state: 'detached', timeout: 10000 })
      .catch(e => console.log('Modal did not close, but continuing test'));

    console.log('Upload completed or timed out');

    // Take a screenshot
    await page.screenshot({ path: 'upload-result.png', fullPage: true });

    console.log('Screenshot taken');

    // Wait for a moment to see the result
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  } finally {
    // Close the browser
    await browser.close();
  }
})();
