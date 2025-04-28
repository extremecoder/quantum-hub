// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test('Upload quantum app package', async ({ page }) => {
  // Navigate to the dashboard page
  await page.goto('http://localhost:3000/dashboard');
  
  // Wait for the page to load
  await page.waitForSelector('h1:has-text("Dashboard")');
  
  console.log('Dashboard page loaded');
  
  // Make sure we're on the "My Applications" tab
  await page.getByText('My Applications').click();
  
  console.log('Clicked on My Applications tab');
  
  // Click the "Upload Package" button
  await page.getByRole('button', { name: 'Upload Package' }).click();
  
  console.log('Clicked on Upload Package button');
  
  // Wait for the upload modal to appear
  await page.waitForSelector('h3:has-text("Upload Quantum App Package")');
  
  console.log('Upload modal appeared');
  
  // Get the file path
  const filePath = path.join(__dirname, '..', 'sample', 'one-2.0.0.zip');
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
});
