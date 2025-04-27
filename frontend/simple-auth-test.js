const puppeteer = require('puppeteer');

async function runTest() {
  console.log('Starting simple auth test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    args: ['--window-size=1280,800']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    // Go to the signup page
    console.log('Navigating to signup page...');
    await page.goto('http://localhost:3000/auth/signup');
    
    // Take a screenshot
    await page.screenshot({ path: 'signup-page.png' });
    console.log('Screenshot saved as signup-page.png');
    
    // Wait for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Close the browser
    await browser.close();
    console.log('Test completed!');
  } catch (error) {
    console.error('Test failed:', error);
    await browser.close();
  }
}

runTest().catch(console.error);
