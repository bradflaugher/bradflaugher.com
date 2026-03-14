const { chromium, devices } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36'
  });
  const page = await context.newPage();

  // Navigate to the local bookmarks.html file
  const filePath = path.resolve(__dirname, 'bookmarks.html');
  await page.goto(`file://${filePath}`);

  // Take a screenshot
  await page.screenshot({ path: 'bookmarks-android-screenshot.png', fullPage: true });

  await browser.close();
})();