import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ headless: true, args: ['--mute-audio'] });
const context = await browser.newContext({ locale: 'de-DE' }),
  page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
try {
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.__broadcast.updateSettings({ music: 0 }));
  await page.getByRole('button', { name: 'Neue Übertragung', exact: true }).click();
  await page.getByRole('button', { name: 'Bereit für die Sendung', exact: true }).click();
  await page.getByRole('button', { name: 'Meine Geschichte beginnt hier', exact: true }).click();
  await page.getByRole('button', { name: /Den Kesselhafen erkunden$/ }).click();
  await page.evaluate(() => {
    const game = window.__broadcast;
    const giver = game.world.objects.find((o) => o.type === 'npc' && o.data === 'tam');
    game.world.player.x = giver.x;
    game.world.player.y = giver.y;
    game.acceptQuest('haven-last-boiler');
    game.leaveCity();
  });
  await page.waitForFunction(() => window.__broadcast?.getSnapshot().phase === 'hub');
  const result = await page.evaluate(async () => {
    const game = window.__broadcast;
    const completed = [];
    const bossCasts = [];
    const visitedCities = ['haven'];
    for (let floor = 1; floor <= 12; floor++) {
      game.enterFloor(floor);
      if (game.getSnapshot().dialog) game.chooseDialog('continue');
      const sim = game.simulation,
        world = game.world;
      bossCasts.push(world.bossIds);
      for (const room of world.rooms) {
        world.player.x = (room.x + room.w / 2) * 32;
        world.player.y = (room.y + room.h / 2) * 32;
        game.step(34);
        if (room.kind === 'hunt') {
          const shrine = world.objects.find((o) => o.room === room.id && o.data === 'hunt');
          world.player.x = shrine.x;
          world.player.y = shrine.y;
          game.interact();
        }
        for (const enemy of world.enemies.filter((e) => !e.dead)) sim.hit(enemy, 100000);
        for (const obj of world.objects.filter(
          (o) => o.room === room.id && o.active && ['terminal', 'chest'].includes(o.type),
        )) {
          world.player.x = obj.x;
          world.player.y = obj.y;
          game.interact();
          const dialog = game.getSnapshot().dialog;
          if (dialog) game.chooseDialog(dialog.choices[0].id);
        }
      }
      const exit = world.objects.find((o) => o.type === 'exit');
      world.player.x = exit.x;
      world.player.y = exit.y;
      game.interact();
      const snapshot = game.getSnapshot();
      if (!snapshot.dialog)
        throw new Error(`Floor ${floor} cannot complete: ${JSON.stringify(snapshot.quest?.name)}`);
      game.chooseDialog(floor === 12 ? 'liberate' : 'hub');
      const campaign = game.getSnapshot().campaign;
      if (!campaign.completedFloors.includes(floor))
        throw new Error(`Floor ${floor} missing checkpoint`);
      if (floor < 12 && campaign.floorUnlocked !== floor + 1)
        throw new Error(`Floor ${floor} failed to unlock successor`);
      completed.push(floor);
      if (floor === 1) {
        game.visitCity('haven');
        const giver = game.world.objects.find((o) => o.type === 'npc' && o.data === 'tam');
        game.world.player.x = giver.x;
        game.world.player.y = giver.y;
        if (game.cityQuestStatus('haven-last-boiler') !== 'ready')
          throw new Error('Accepted city contract did not progress in the dungeon');
        game.claimQuest('haven-last-boiler');
        const dialog = game.getSnapshot().dialog;
        if (dialog) game.chooseDialog(dialog.choices[0].id);
        if (game.cityQuestStatus('haven-last-boiler') !== 'completed')
          throw new Error('City contract reward was not confirmed');
        game.leaveCity();
      }
      const unlockedCity = floor === 3 ? 'lantern' : floor === 7 ? 'meridian' : null;
      if (unlockedCity) {
        game.visitCity(unlockedCity);
        if (game.getSnapshot().cityId !== unlockedCity)
          throw new Error(`${unlockedCity} did not unlock`);
        visitedCities.push(unlockedCity);
        game.leaveCity();
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    const snapshot = game.getSnapshot();
    return {
      completed,
      ending: snapshot.campaign.ending,
      phase: snapshot.phase,
      origin: snapshot.campaign.origin,
      lea: snapshot.campaign.choices.lea,
      storyChoices: Object.keys(snapshot.campaign.choices).filter((key) => key.startsWith('seen:'))
        .length,
      completedCityQuests: snapshot.campaign.completedCityQuests,
      visitedCities,
      bossCasts,
      confirmedQuests: Object.values(snapshot.campaign.questProgress).filter((q) => q.confirmed)
        .length,
      banked: snapshot.campaign.unbanked.length === 0 && snapshot.campaign.runScrap === 0,
      saveStatus: snapshot.saveStatus,
    };
  });
  await page.waitForFunction(
    () => window.__broadcast.getSnapshot().saveStatus === 'saved',
    {},
    { timeout: 15000 },
  );
  result.saveStatus = await page.evaluate(() => window.__broadcast.getSnapshot().saveStatus);
  assert.equal(result.completed.length, 12);
  assert.equal(result.ending, 'liberate');
  assert.equal(result.phase, 'ending');
  assert.equal(result.origin, 'maintenance');
  assert.equal(result.lea, 'rescued');
  assert.equal(result.storyChoices, 36);
  assert.deepEqual(result.visitedCities, ['haven', 'lantern', 'meridian']);
  assert.ok(result.completedCityQuests.includes('haven-last-boiler'));
  assert.equal(result.banked, true);
  assert.equal(result.saveStatus, 'saved');
  assert.deepEqual(errors, []);
  await page.reload({ waitUntil: 'networkidle' });
  const saved = await page.evaluate(async () => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('below-the-broadcast');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return await new Promise((resolve, reject) => {
      const request = db.transaction('saves').objectStore('saves').get(0);
      request.onsuccess = () => {
        db.close();
        resolve(request.result.campaign);
      };
      request.onerror = () => reject(request.error);
    });
  });
  assert.equal(saved.completedFloors.length, 12);
  assert.equal(saved.ending, 'liberate');
  assert.equal(saved.origin, 'maintenance');
  assert.equal(saved.choices.lea, 'rescued');
  assert.ok(saved.completedCityQuests.includes('haven-last-boiler'));
  // Ending history must survive choosing to continue exploring after the credits.
  await page.getByRole('button', { name: /^Fortsetzen/ }).click();
  await page.waitForFunction(() => window.__broadcast.getSnapshot().phase === 'ending');
  await page.evaluate(() => window.__broadcast.returnHub());
  await page.waitForFunction(() => window.__broadcast.getSnapshot().saveStatus === 'saved');
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /^Fortsetzen/ }).click();
  await page.waitForFunction(() => window.__broadcast.getSnapshot().phase === 'hub');
  assert.equal(
    await page.evaluate(() => window.__broadcast.getSnapshot().campaign.ending),
    'liberate',
  );
  console.log(
    JSON.stringify({
      result: 'passed',
      ...result,
      reload: 'persisted',
      method:
        'integration checks drive encounters and apply deterministic lethal hits; this does not measure combat balance',
    }),
  );
} finally {
  await context.close();
  await browser.close();
}
