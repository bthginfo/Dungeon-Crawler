import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export async function checkOffline(browser, origin = 'http://127.0.0.1:4173') {
  const context = await browser.newContext({ locale: 'de-DE' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto(origin, { waitUntil: 'networkidle', timeout: 30000 });
    await page.getByRole('button', { name: 'Neue Übertragung', exact: true }).waitFor();
    await page.waitForFunction(
      async () => {
        const registration = await navigator.serviceWorker.getRegistration();
        return registration?.active?.state === 'activated';
      },
      {},
      { timeout: 30000 },
    );
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await page.getByRole('button', { name: 'Einstellungen', exact: true }).click();
    const music = page.getByRole('slider', { name: /Musik/ });
    await music.press('Home');
    assert.equal(await music.inputValue(), '0');
    await page.keyboard.press('Escape');
    const cache = await page.evaluate(async () => {
      const requests = (
        await Promise.all((await caches.keys()).map(async (key) => (await caches.open(key)).keys()))
      ).flat();
      return {
        count: requests.length,
        api: requests.filter((request) => new URL(request.url).pathname.startsWith('/api/')).length,
      };
    });
    assert.equal(cache.api, 0);
    await context.setOffline(true);
    await page.reload({ waitUntil: 'load' });
    await page.getByRole('button', { name: 'Neue Übertragung', exact: true }).waitFor();
    const icon = await page.evaluate(async () => {
      const response = await fetch('/assets/items/0.png?v=1');
      return {
        ok: response.ok,
        type: response.headers.get('content-type'),
        bytes: (await response.arrayBuffer()).byteLength,
      };
    });
    assert.equal(icon.ok, true);
    assert.ok(icon.type?.includes('image/png'));
    assert.ok(icon.bytes > 0);
    await page.getByRole('button', { name: 'Neue Übertragung', exact: true }).click();
    await page.getByRole('button', { name: 'Bereit für die Sendung', exact: true }).click();
    await page.getByRole('button', { name: 'Meine Geschichte beginnt hier', exact: true }).click();
    await page.getByRole('button', { name: /Den Kesselhafen erkunden$/ }).click();
    await page
      .getByRole('button', { name: 'Zur Vorbereitung in die Zuflucht', exact: true })
      .click();
    await page.getByRole('button', { name: 'Expedition', exact: true }).click();
    await page.getByRole('button', { name: 'Expedition starten', exact: true }).click();
    await page.getByRole('button', { name: /Die Spur aufnehmen$/ }).click();
    await page.getByRole('button', { name: 'Inventar [I]', exact: true }).waitFor();
    await page.keyboard.press('i');
    await page.getByRole('dialog').waitFor();
    await page.waitForFunction(() => {
      const icons = [...document.querySelectorAll('[role="dialog"] img[src*="/assets/items/"]')];
      return icons.length > 0 && icons.every((image) => image.complete && image.naturalWidth > 0);
    });
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify({
        result: 'passed',
        offlineGuestExpedition: true,
        pixelInventoryIcons: true,
        queryIconBytes: icon.bytes,
        staticCacheEntries: cache.count,
        apiCacheEntries: cache.api,
        pageErrors: errors.length,
      }),
    );
  } finally {
    await context.close();
  }
}

if (
  typeof process !== 'undefined' &&
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const { chromium } = createRequire(import.meta.url)('@playwright/test');
  const browser = await chromium.launch({ headless: true, args: ['--mute-audio'] });
  try {
    await checkOffline(browser, process.argv[2]);
  } finally {
    await browser.close();
  }
}
