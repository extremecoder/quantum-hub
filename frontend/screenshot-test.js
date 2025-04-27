const puppeteer = require('puppeteer');

async function takeScreenshots() {
  console.log('Starting screenshot test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
    args: ['--window-size=1280,800']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    // Home page
    console.log('Taking screenshot of home page...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'home-page.png' });
    
    // Register page
    console.log('Taking screenshot of register page...');
    await page.goto('http://localhost:3000/auth/register');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'register-page.png' });
    
    // Login page
    console.log('Taking screenshot of login page...');
    await page.goto('http://localhost:3000/auth/signin');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'login-page.png' });
    
    // API documentation page
    console.log('Taking screenshot of API documentation page...');
    await page.goto('http://localhost:8001/api/v1/docs');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'api-docs-page.png' });
    
    console.log('All screenshots taken successfully!');
  } catch (error) {
    console.error('Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshots().catch(console.error);
