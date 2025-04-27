const puppeteer = require('puppeteer');

async function runTest() {
  console.log('Starting simple Puppeteer test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
    args: ['--window-size=1280,800']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    // Navigate to the home page
    console.log('Navigating to home page...');
    await page.goto('http://localhost:3000');
    
    // Take a screenshot
    await page.screenshot({ path: 'home-page.png' });
    console.log('Screenshot saved as home-page.png');
    
    // Navigate to the login page
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3000/auth/signin');
    
    // Take a screenshot
    await page.screenshot({ path: 'login-page.png' });
    console.log('Screenshot saved as login-page.png');
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    // Close the browser
    await browser.close();
  }
}

// Run the test
runTest().catch(console.error);
