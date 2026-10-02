import { test, expect } from '@playwright/test';
import type { GameController } from '../../src/game/controller';
type GameWindow = Window & { __broadcast: GameController };
test('desktop campaign starts, pauses, translates and reloads its local save', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.waitForFunction(
    () => (window as unknown as GameWindow).__broadcast.getSnapshot().renderer.status === 'ready',
  );
  await page.evaluate(() =>
    (window as unknown as GameWindow).__broadcast.updateSettings({ music: 0 }),
  );
  await page.getByRole('button', { name: 'Neue Übertragung', exact: true }).click();
  await page.getByRole('button', { name: 'Bereit für die Sendung', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Expedition', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Expedition', exact: true }).click();
  await page.getByRole('button', { name: 'Expedition starten', exact: true }).click();
  const startX = await page.evaluate(
    () => (window as unknown as GameWindow).__broadcast.world.player.x,
  );
  await page.keyboard.down('d');
  await page.waitForFunction(
    (x) => (window as unknown as GameWindow).__broadcast.world.player.x > x + 3,
    startX,
  );
  await page.keyboard.up('d');
  await page.keyboard.press('Escape');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Einstellungen', exact: true })
    .click();
  await page
    .getByRole('dialog')
    .getByLabel(/Sprache/)
    .selectOption('en');
  await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(
      true,
    );
  }
  await page.waitForFunction(
    () =>
      (
        window as unknown as { __broadcast: { getSnapshot(): { saveStatus: string } } }
      ).__broadcast.getSnapshot().saveStatus === 'saved',
  );
  await page.reload();
  await expect(page.getByRole('heading', { name: /BELOW.*BROADCAST/i })).toBeVisible();
  expect(errors).toEqual([]);
});
test('phone controls accept simultaneous movement and attack', async ({ browser }) => {
  const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      locale: 'de-DE',
    }),
    page = await context.newPage();
  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForFunction(
      () => (window as unknown as GameWindow).__broadcast.getSnapshot().renderer.status === 'ready',
    );
    await page.evaluate(() =>
      (window as unknown as GameWindow).__broadcast.updateSettings({ music: 0 }),
    );
    await page.getByRole('button', { name: 'Neue Übertragung', exact: true }).click();
    await page
      .locator('.class-start-dock')
      .getByRole('button', { name: 'Sendung starten', exact: true })
      .click();
    await page.getByRole('button', { name: 'Expedition', exact: true }).click();
    const launch = page.getByRole('button', { name: 'Expedition starten', exact: true }),
      box = await launch.boundingBox();
    expect(box!.y + box!.height).toBeLessThanOrEqual(844);
    await launch.click();
    await expect(page.locator('.touch-joystick')).toBeVisible();
    await expect(page.locator('.ability-deck')).not.toBeVisible();
    for (const button of await page.locator('.touch-actions button').all()) {
      const b = await button.boundingBox();
      expect(b!.width).toBeGreaterThanOrEqual(48);
      expect(b!.height).toBeGreaterThanOrEqual(48);
    }
    const joystick = (await page.locator('.touch-joystick').boundingBox())!,
      attack = (await page.locator('.touch-attack').boundingBox())!,
      cdp = await context.newCDPSession(page);
    const startX = await page.evaluate(
      () => (window as unknown as GameWindow).__broadcast.world.player.x,
    );
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [
        { x: joystick.x + joystick.width / 2 + 25, y: joystick.y + joystick.height / 2, id: 1 },
        { x: attack.x + attack.width / 2, y: attack.y + attack.height / 2, id: 2 },
      ],
    });
    await page.waitForFunction(
      () =>
        !(document.querySelector('.joystick-center') as HTMLElement).style.transform.includes(
          '0px, 0px',
        ),
    );
    await page.waitForFunction((x) => {
      const game = (window as unknown as GameWindow).__broadcast;
      return game.input.attacking && game.world.player.x > x + 3;
    }, startX);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForFunction(
      () =>
        (document.querySelector('.joystick-center') as HTMLElement).style.transform ===
        'translate(0px, 0px)',
    );
  } finally {
    await context.close();
  }
});

test('failed graphics loading blocks play and can be retried', async ({ page }) => {
  await page.route('**/assets/world/tiles.png', (route) => route.abort());
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Die Verbindung stockt.', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.game-interface')).toHaveAttribute('inert', '');
  await expect(page.getByRole('alert')).toContainText(
    'Die Spielgrafik konnte nicht geladen werden',
  );
  await page.unroute('**/assets/world/tiles.png');
  await page.getByRole('button', { name: 'Erneut laden', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Neue Übertragung', exact: true })).toBeVisible();
  await expect(page.locator('.game-interface')).not.toHaveAttribute('inert');
});
