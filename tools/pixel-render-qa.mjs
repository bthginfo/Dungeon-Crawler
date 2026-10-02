/** Browser smoke QA for the actual renderer. Muted by launch flag and UI prefs. */
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const out = resolve('artifacts');
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--mute-audio', '--enable-unsafe-swiftshader'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, hasTouch: true });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const url = process.argv[2] ?? 'http://127.0.0.1:4173/';
const screenshot = name => page.screenshot({ path: resolve(out, name + '.png') });
const observe = async () => page.evaluate(() => ({
  text: document.body.innerText.slice(0, 900),
  viewport: { width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth },
  canvas: [...document.querySelectorAll('canvas')].map(c => ({ width: c.width, height: c.height, rect: c.getBoundingClientRect().toJSON() })),
  player: window.__broadcast ? { x: window.__broadcast.world.player.x, y: window.__broadcast.world.player.y, enemies: window.__broadcast.world.enemies.length, input: { ...window.__broadcast.input }, phase: window.__broadcast.view.phase } : null,
}));
const report = {};
try {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Einstellungen', exact: true }).click();
  await page.getByRole('slider').nth(0).fill('0');
  await page.getByRole('slider').nth(1).fill('0');
  await page.getByRole('button', { name: 'Schließen', exact: true }).click();
  await screenshot('pixel-qa-title-desktop');
  report.title = await observe();
  console.log('Title and silent test preferences ready');

  await page.getByRole('button', { name: 'Neue Übertragung', exact: true }).click();
  await page.getByRole('textbox', { name: 'Dein Name', exact: true }).fill('Pixel QA');
  await page.getByRole('button', { name: 'Bereit für die Sendung', exact: true }).click();
  await page.getByRole('button', { name: 'Expedition', exact: true }).click();
  await page.getByRole('button', { name: 'Expedition starten', exact: true }).click();
  report.beforeMove = await observe();
  console.log('Expedition started', JSON.stringify(report.beforeMove.player));
  await page.keyboard.down('d');
  await page.waitForTimeout(4200);
  await page.keyboard.up('d');
  report.afterMove = await observe();
  await screenshot('pixel-qa-movement-desktop');
  console.log('Movement observed', JSON.stringify(report.afterMove.player), report.afterMove.text.slice(0, 150));
  await page.keyboard.down('Enter');
  await page.keyboard.press('q');
  await page.waitForTimeout(1900);
  await page.keyboard.up('Enter');
  await screenshot('pixel-qa-combat-desktop');
  report.combat = await observe();
  console.log('Combat observed', JSON.stringify(report.combat.player));

  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await screenshot('pixel-qa-mobile-portrait');
  report.mobilePortrait = await observe();
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(300);
  await screenshot('pixel-qa-mobile-landscape');
  report.mobileLandscape = await observe();
  console.log('Portrait and landscape screenshots captured');
} finally {
  report.errors = errors;
  await writeFile(resolve(out, 'pixel-render-qa.json'), JSON.stringify(report, null, 2));
  await browser.close();
  console.log('QA closed silently, page errors:', JSON.stringify(errors));
}
