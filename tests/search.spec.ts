import { test, expect } from '@playwright/test';

test.describe('Search E2E Tests', () => {
  test('model should load and status dot should become ready', async ({ page }) => {
    await page.goto('http://localhost:3000/search.html');
    
    // Status dot should initially be non-ready
    const statusDot = page.locator('#status');
    
    // Wait for the status dot to have the 'ready' class
    await expect(statusDot).toHaveClass(/ready/, { timeout: 30000 });
    await expect(statusDot).toHaveAttribute('title', 'Embedding Model Ready');
  });

  test('query parameters should trigger a redirect', async ({ page }) => {
    // '!yt' is a bang that should definitely redirect to YouTube.
    // We listen for the navigation to confirm it happens.
    
    // We expect a navigation to happen after the model loads
    const navigationPromise = page.waitForURL(/youtube\.com/, { timeout: 60000 });
    
    await page.goto('http://localhost:3000/search.html?q=!yt+lofi');
    
    // The loading overlay should be visible while it's processing
    const loadingOverlay = page.locator('#loading');
    await expect(loadingOverlay).toHaveClass(/active/);

    await navigationPromise;
    expect(page.url()).toContain('youtube.com');
  });

  test('semantic search should show hint and scores', async ({ page }) => {
    await page.goto('http://localhost:3000/search.html');
    
    // Wait for model to be ready
    const statusDot = page.locator('#status');
    await expect(statusDot).toHaveClass(/ready/, { timeout: 30000 });
    
    const searchInput = page.locator('#search');
    await searchInput.fill('how to fix a car');
    
    // Hint should eventually show 'YouTube' or something similar
    const hint = page.locator('#hint');
    await expect(hint).toHaveClass(/active/);
    await expect(hint).not.toHaveText('DuckDuckGo'); // It defaults to DDG, but 'how to' should hit YouTube
    
    // Scores panel should be active
    const scores = page.locator('#scores');
    await expect(scores).toHaveClass(/active/);
  });
});
