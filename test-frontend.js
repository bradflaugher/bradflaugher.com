const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the local bookmarks.html file
  const filePath = path.resolve(__dirname, 'bookmarks.html');
  await page.goto(`file://${filePath}`);

  // Take a screenshot
  await page.screenshot({ path: 'bookmarks-screenshot.png', fullPage: true });

  await browser.close();
})();
