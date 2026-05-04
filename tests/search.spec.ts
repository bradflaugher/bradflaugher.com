import { test, expect, Page } from '@playwright/test';

/**
 * E2E tests for the semantic-routing search page.
 *
 * Each test that needs the model loaded uses `waitForModelReady` so we don't
 * race the (one-time) ONNX download. Once warmed, subsequent test cases
 * reuse the browser cache via Playwright's same-context loading and stay
 * fast.
 *
 * The page is loaded as `/search.html` directly. `serve.json` disables
 * cleanUrls so the URL (and its query string) is preserved. Cloudflare
 * Pages 308-redirects `/search.html` → `/search` *with* the query string,
 * so the production canonical URL is `/search`; both work.
 */

const PATH = '/search.html';
const MODEL_TIMEOUT = 60_000;

async function waitForModelReady(page: Page) {
  await expect(page.locator('#status')).toHaveAttribute(
    'data-state', 'ready', { timeout: MODEL_TIMEOUT },
  );
}

test.describe('search router — boot', () => {
  test('model loads and status dot reaches the ready state', async ({ page }) => {
    await page.goto(PATH);
    await waitForModelReady(page);
    await expect(page.locator('#status')).toHaveClass(/ready/);
    await expect(page.locator('#status')).toHaveAttribute('title', 'Embedding Model Ready');
    await expect(page.locator('#error-banner')).not.toHaveClass(/active/);
  });

  test('no console errors on a clean load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(PATH);
    await waitForModelReady(page);
    expect(errors, `unexpected console errors:\n${errors.join('\n')}`).toEqual([]);
  });
});

test.describe('search router — bang shortcuts', () => {
  // Bangs are pure rule-based (no model needed), so they're fast and
  // deterministic. We assert on the destination host (which proves the
  // engine was selected) plus on a query-string fragment that survives
  // both `+` and `%20` space-encoding (engines vary).
  const cases: {
    input: string;
    engine: string;
    host: RegExp;
    qParam: string;     // name of the query string parameter on the destination
    qFragment: string;  // a substring that must appear, encoding-agnostic
  }[] = [
    { input: '!yt lofi hip hop',   engine: 'youtube',     host: /(^|\.)youtube\.com$/,      qParam: 'search_query', qFragment: 'lofi' },
    { input: '!gh gemini-cli',     engine: 'github',      host: /(^|\.)github\.com$/,       qParam: 'q',            qFragment: 'gemini-cli' },
    { input: '!w integral of x',   engine: 'wolfram',     host: /(^|\.)wolframalpha\.com$/, qParam: 'i',            qFragment: 'integral' },
    { input: '!a usb cable',       engine: 'amazon',      host: /(^|\.)amazon\.com$/,       qParam: 'k',            qFragment: 'usb' },
    { input: '!m coffee shops',    engine: 'maps',        host: /(^|\.)google\.com$/,       qParam: 'q',            qFragment: 'coffee' },
    { input: '!i black hole',      engine: 'bing-images', host: /(^|\.)bing\.com$/,         qParam: 'q',            qFragment: 'black' },
    { input: '!p quantum gravity', engine: 'perplexity',  host: /(^|\.)perplexity\.ai$/,    qParam: 'q',            qFragment: 'quantum' },
  ];

  for (const c of cases) {
    test(`bang "${c.input.split(' ')[0]}" → ${c.engine}`, async ({ page }) => {
      await page.goto(PATH);
      // Bangs short-circuit the model entirely, so no need to wait for it.

      const search = page.locator('#search');
      await search.fill(c.input);
      await expect(page.locator('body')).toHaveAttribute('data-engine', c.engine);

      // Press Enter and wait for navigation off the test server.
      const navPromise = page.waitForURL(url => {
        const u = new URL(url.toString());
        if (!c.host.test(u.hostname)) return false;
        const qs = u.searchParams.get(c.qParam) ?? '';
        return decodeURIComponent(qs).includes(c.qFragment);
      }, { timeout: 15_000 });
      await search.press('Enter');
      await navPromise;
    });
  }
});

test.describe('search router — query parameter redirect', () => {
  test('?q=!yt+lofi auto-redirects to YouTube', async ({ page }) => {
    const navPromise = page.waitForURL(/youtube\.com/, { timeout: MODEL_TIMEOUT });
    await page.goto(`${PATH}?q=!yt+lofi`);
    // Loading overlay should be visible while the model is fetched.
    await expect(page.locator('#loading')).toHaveClass(/active/);
    await navPromise;
    expect(page.url()).toMatch(/youtube\.com\/results\?search_query=lofi/);
  });

  test('?q= (empty) does not redirect and shows the page', async ({ page }) => {
    await page.goto(`${PATH}?q=`);
    await waitForModelReady(page);
    await expect(page).toHaveURL(/\/search\.html\?q=$/);
    await expect(page.locator('#search')).toBeVisible();
  });
});

test.describe('search router — direct URL detection', () => {
  test('"github.com" classifies as Direct Link (rule-based, no model needed)', async ({ page }) => {
    await page.goto(PATH);
    await page.locator('#search').fill('github.com');
    await expect(page.locator('body')).toHaveAttribute('data-engine', 'direct');
    await expect(page.locator('#hint')).toHaveText('Direct Link');
  });

  test('"localhost:3000" classifies as Direct Link', async ({ page }) => {
    await page.goto(PATH);
    await page.locator('#search').fill('localhost:3000');
    await expect(page.locator('body')).toHaveAttribute('data-engine', 'direct');
  });

  test('"github.com cool repos" (with space) does NOT classify as Direct Link', async ({ page }) => {
    await page.goto(PATH);
    await waitForModelReady(page);
    await page.locator('#search').fill('github.com cool repos');
    // Should land somewhere semantic — but never "direct"
    await expect(page.locator('body')).not.toHaveAttribute('data-engine', 'direct');
  });
});

test.describe('search router — semantic routing', () => {
  test('"how to fix a flat tire" routes to a non-default engine and shows scores', async ({ page }) => {
    await page.goto(PATH);
    await waitForModelReady(page);

    await page.locator('#search').fill('how to fix a flat tire');

    // Hint and scores both light up.
    await expect(page.locator('#hint')).toHaveClass(/active/);
    await expect(page.locator('#scores')).toHaveClass(/active/);

    // 9 score rows (one per route in the embeddings file).
    await expect(page.locator('#scores .score-row')).toHaveCount(9);

    // Exactly one row is marked best.
    await expect(page.locator('#scores .score-fill.best')).toHaveCount(1);

    // The body data-engine should match the engine named in the hint.
    const engine = await page.locator('body').getAttribute('data-engine');
    expect(engine).not.toBeNull();
    const expectedName = await page.locator(`#scores .score-row[data-engine="${engine}"] .score-label`).textContent();
    await expect(page.locator('#hint')).toHaveText(expectedName!.trim());
  });

  test('clearing input hides the hint and scores', async ({ page }) => {
    await page.goto(PATH);
    await waitForModelReady(page);

    const search = page.locator('#search');
    await search.fill('pizza near me');
    await expect(page.locator('#hint')).toHaveClass(/active/);

    await search.fill('');
    await expect(page.locator('#hint')).not.toHaveClass(/active/);
    await expect(page.locator('#scores')).not.toHaveClass(/active/);
    await expect(page.locator('body')).not.toHaveAttribute('data-engine', /.+/);
  });

  test('changing the query updates the engine (no stale UI)', async ({ page }) => {
    await page.goto(PATH);
    await waitForModelReady(page);

    const search = page.locator('#search');
    await search.fill('pizza near me');
    await expect(page.locator('body')).toHaveAttribute('data-engine', /.+/, { timeout: 10_000 });
    const first = await page.locator('body').getAttribute('data-engine');

    await search.fill('!gh transformers.js');
    await expect(page.locator('body')).toHaveAttribute('data-engine', 'github');
    expect(first).not.toBe('github');
  });
});

test.describe('search router — cancel button', () => {
  test('cancel stops the redirect and refocuses the input', async ({ page }) => {
    await page.goto(PATH);

    // Patch out the redirect so a slow Playwright click can't lose the race
    // with the 1.5s timer. We're testing the cancel UX, not navigation.
    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).location.replace = () => {};
    });

    const search = page.locator('#search');
    await search.fill('!yt lofi');
    await search.press('Enter');

    // Auto-waits for the cancel button to be visible (overlay shown).
    await page.locator('#cancel').click();

    await expect(page.locator('#overlay')).toBeHidden();
    expect(page.url()).toMatch(/\/search\.html$/);
    await expect(search).toHaveValue('!yt lofi');
    await expect(search).toBeFocused();

    // Give the now-stubbed timer a moment to "fire" — the test should
    // remain on the search page.
    await page.waitForTimeout(2_000);
    expect(page.url()).toMatch(/\/search\.html$/);
  });
});
