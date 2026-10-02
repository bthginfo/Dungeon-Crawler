import { useState } from 'react';
import { game } from '../game/controller';
import { CITIES, CITY_QUESTS, ORIGINS, STORY_CHAPTERS } from '../content/narrative';
import { CLASSES, FLOORS, NPCS } from '../content';
import type { GameView, Lang } from '../game/types';
import { Button, Empty, IconButton, NpcPortrait, Portrait } from './common';
import { DungeonMap, Joystick } from './Hud';
import { Icon } from './icons';
import { label, say, t } from './i18n';

const cityColors: Record<string, string> = {
  haven: '#e5b16b',
  lantern: '#8ce2b7',
  meridian: '#a8c6e1',
};
const factionNames = (l: Lang) => ({
  union: say(l, 'Gewerkschaft der Tiefe', 'Deep Workers Union'),
  residents: say(l, 'Freie Bewohner', 'Free Residents'),
  archive: say(l, 'Unabhängiges Archiv', 'Independent Archive'),
  sponsors: say(l, 'Gebundene Sponsoren', 'Accountable Sponsors'),
});
const motivations = (l: Lang) => [
  {
    id: 'family' as const,
    name: say(l, 'Lea nach Hause bringen', 'Bring Lea home'),
    description: say(
      l,
      'Die Menschen zuerst. Eine Geschichte darf niemanden ersetzen.',
      'People first. A story must not replace anybody.',
    ),
  },
  {
    id: 'truth' as const,
    name: say(l, 'Das Original finden', 'Find the original'),
    description: say(
      l,
      'Beweise sichern. Niemand soll das Geschehen noch einmal umschreiben.',
      'Preserve the evidence. Nobody should rewrite what happened again.',
    ),
  },
  {
    id: 'revenge' as const,
    name: say(l, 'Die Direktion zur Verantwortung ziehen', 'Hold the Directorate accountable'),
    description: say(
      l,
      'Die Täter benennen. Macht braucht Grenzen, auch nach deinem Sieg.',
      'Name those responsible. Power needs limits, even after your victory.',
    ),
  },
];

export function OriginScreen({ view }: { view: GameView }) {
  const l = view.lang;
  const [originId, setOriginId] = useState(ORIGINS[0].id);
  const [motivation, setMotivation] = useState<'family' | 'truth' | 'revenge'>('family');
  const origin = ORIGINS.find((o) => o.id === originId) ?? ORIGINS[0];
  const cls = CLASSES.find((c) => c.id === view.campaign?.classId);
  return (
    <main className="origin-screen">
      <header className="narrative-header">
        <span className="eyebrow">
          {say(l, 'VOR DER AUFNAHME / DEINE GESCHICHTE', 'BEFORE INTAKE / YOUR STORY')}
        </span>
        <div className="language-switch">
          {(['de', 'en'] as const).map((lang) => (
            <button key={lang} aria-pressed={l === lang} onClick={() => game.setLanguage(lang)}>
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </header>
      <div className="origin-layout">
        <aside className="origin-identity">
          {cls && (
            <div className="origin-class">
              <Portrait cls={cls} />
              <div>
                <span className="eyebrow">{label(cls.name, l)}</span>
                <strong>{view.campaign?.name}</strong>
              </div>
            </div>
          )}
          <h1>{say(l, 'Du hattest ein Leben.', 'You had a life.')}</h1>
          <p>
            {say(
              l,
              'Bevor deine Stadt zur Sendung wurde, war sie ein Zuhause. Welche Erinnerung hat den Schnitt überstanden?',
              'Before your city became a broadcast, it was home. Which memory survived the edit?',
            )}
          </p>
          <nav
            className="origin-picker"
            aria-label={say(l, 'Herkunft wählen', 'Choose your origin')}
          >
            {ORIGINS.map((o) => (
              <button key={o.id} aria-pressed={o.id === originId} onClick={() => setOriginId(o.id)}>
                <span className="eyebrow">{label(o.profession, l)}</span>
                <strong>{label(o.name, l)}</strong>
                <span>{label(o.description, l)}</span>
              </button>
            ))}
          </nav>
        </aside>
        <article className="origin-memory" key={origin.id}>
          <span className="eyebrow">{say(l, 'UNGESCHNITTENES FRAGMENT', 'UNEDITED FRAGMENT')}</span>
          <h2>{label(origin.name, l)}</h2>
          <div className="narrative-prose">
            {origin.opening.map((p, i) => (
              <p key={i}>{label(p, l)}</p>
            ))}
          </div>
          <div className="keepsake">
            <Icon name="leaf" />
            <div>
              <h3>{say(l, 'Was du behalten hast', 'What you kept')}</h3>
              <p>{label(origin.keepsake, l)}</p>
            </div>
          </div>
          <p className="origin-goal">{label(origin.personalGoal, l)}</p>
          <fieldset className="motivation-picker">
            <legend>{say(l, 'Was dich weitergehen lässt', 'What keeps you moving')}</legend>
            {motivations(l).map((m) => (
              <label key={m.id} className={motivation === m.id ? 'selected' : ''}>
                <input
                  type="radio"
                  name="motivation"
                  checked={motivation === m.id}
                  onChange={() => setMotivation(m.id)}
                />
                <span>
                  <strong>{m.name}</strong>
                  <small>{m.description}</small>
                </span>
              </label>
            ))}
          </fieldset>
          <Button
            tone="primary"
            icon="arrow"
            onClick={() => game.finishOrigin(origin.id, motivation)}
          >
            {say(l, 'Meine Geschichte beginnt hier', 'My story begins here')}
          </Button>
          <p className="fine-print">
            {say(
              l,
              'Herkunft und Motivation bleiben in deiner Chronik. Deine Entscheidungen können sich im Laufe der Reise verändern.',
              'Your origin and motivation remain in your chronicle. Your decisions may evolve along the journey.',
            )}
          </p>
        </article>
      </div>
    </main>
  );
}

export function CitiesPanel({ view }: { view: GameView }) {
  const l = view.lang;
  if (!view.campaign)
    return (
      <Empty
        title={say(l, 'Ein Leben beginnt mit einem Profil.', 'A life begins with a profile.')}
      />
    );
  return (
    <div className="cities-panel">
      <p className="section-intro">
        {say(
          l,
          'Begehbare Städte zwischen den Expeditionen. Finde die Menschen hinter den Aufträgen, sprich mit ihnen und hole Belohnungen persönlich ab.',
          'Walkable cities between expeditions. Find the people behind the contracts, speak to them and collect rewards in person.',
        )}
      </p>
      {CITIES.map((city) => {
        const unlocked = city.unlockFloor <= view.campaign!.floorUnlocked;
        const complete = CITY_QUESTS.filter(
          (q) => q.cityId === city.id && game.cityQuestStatus(q.id) === 'completed',
        ).length;
        return (
          <article
            className="city-destination"
            key={city.id}
            style={{ '--city-color': cityColors[city.id] } as React.CSSProperties}
          >
            <div className="city-destination-title">
              <span className="city-seal">
                <Icon
                  name={city.id === 'haven' ? 'radio' : city.id === 'lantern' ? 'leaf' : 'gear'}
                  size={36}
                />
              </span>
              <div>
                <span className="eyebrow">{label(city.tagline, l)}</span>
                <h3>{label(city.name, l)}</h3>
              </div>
              <span className="badge">
                {unlocked
                  ? `${complete}/8 ${say(l, 'Aufträge', 'contracts')}`
                  : `${say(l, 'Ab Floor', 'From floor')} ${city.unlockFloor}`}
              </span>
            </div>
            <p>{label(city.description, l)}</p>
            <div className="city-districts">
              {city.districts.map((d) => (
                <span key={d.kind}>
                  <Icon
                    name={
                      d.kind === 'market'
                        ? 'shop'
                        : d.kind === 'archive'
                          ? 'book'
                          : d.kind === 'gate'
                            ? 'arrow'
                            : 'person'
                    }
                    size={16}
                  />
                  {label(d.name, l)}
                </span>
              ))}
            </div>
            <div className="city-residents">
              {city.npcIds.map((id) => {
                const npc = NPCS.find((n) => n.id === id);
                return npc ? (
                  <span key={id}>
                    <NpcPortrait npc={npc} />
                    <span>{npc.name}</span>
                  </span>
                ) : null;
              })}
            </div>
            <Button
              tone={unlocked ? 'primary' : 'plain'}
              icon={unlocked ? 'arrow' : 'lock'}
              disabled={!unlocked}
              onClick={() => game.visitCity(city.id)}
            >
              {say(
                l,
                unlocked ? 'Stadt betreten' : 'Noch kein sicherer Reiseweg',
                unlocked ? 'Enter city' : 'No safe route yet',
              )}
            </Button>
          </article>
        );
      })}
    </div>
  );
}

export function TownHud({ view }: { view: GameView }) {
  const l = view.lang;
  const city = CITIES.find((c) => c.id === view.cityId) ?? CITIES[0];
  const room = game.world.rooms.find((r) => r.id === game.world.roomId);
  const ready = CITY_QUESTS.filter((q) => game.cityQuestStatus(q.id) === 'ready').length;
  return (
    <div className="game-hud city-hud">
      <section className="city-location">
        <span className="eyebrow">
          {say(l, 'BEWOHNTE TIEFE / SICHERER ORT', 'INHABITED DEPTH / SAFE PLACE')}
        </span>
        <h1>{label(city.name, l)}</h1>
        <p>{room ? label(room.name, l) : label(city.tagline, l)}</p>
      </section>
      <nav className="city-utilities" aria-label={say(l, 'Stadtmenüs', 'City menus')}>
        <IconButton icon="map" label={t(l, 'map')} onClick={() => game.openPanel('map')} />
        <IconButton
          icon="book"
          label={say(l, 'Stadtaufträge', 'City contracts')}
          onClick={() => game.openQuestBoard()}
        />
        <IconButton
          icon="bag"
          label={t(l, 'inventory')}
          onClick={() => game.openPanel('inventory')}
        />
        <IconButton
          icon="eye"
          label={say(l, 'Geschichte & Entscheidungen', 'Story & decisions')}
          onClick={() => game.openPanel('story')}
        />
        <IconButton
          icon="gear"
          label={t(l, 'settings')}
          onClick={() => game.openPanel('settings')}
        />
        <IconButton
          icon="back"
          label={say(l, 'Zur Vorbereitung in die Zuflucht', 'Return to the refuge to prepare')}
          onClick={() => game.leaveCity()}
        />
      </nav>
      <aside className="city-activity">
        <span>
          <Icon name="talk" size={16} />
          {say(l, 'Sprich die Menschen vor Ort an.', 'Speak to the people here.')}
        </span>
        {ready > 0 && (
          <strong>
            {ready} {say(l, 'Aufträge zur Abgabe bereit', 'contracts ready to turn in')}
          </strong>
        )}
        <button onClick={() => game.openPanel('cities')}>
          {say(l, 'Andere Städte & Reisewege', 'Other cities & routes')}{' '}
          <Icon name="arrow" size={15} />
        </button>
      </aside>
      <aside className="city-mini-map">
        <DungeonMap lang={l} />
      </aside>
      {view.interaction && (
        <Button className="interaction-prompt" icon="talk" onClick={() => game.interact()}>
          <kbd>E</kbd>
          {label(view.interaction, l)}
        </Button>
      )}
      {!view.paused && view.panel === 'none' && (
        <div className="touch-controls city-touch-controls">
          <Joystick lang={l} />
        </div>
      )}
      <p className="city-walk-hint">
        {say(
          l,
          'WASD / Pfeile / Stick · E oder Tippen zum Ansprechen',
          'WASD / arrows / stick · E or tap to interact',
        )}
      </p>
    </div>
  );
}

type ContractTab = 'offered' | 'active' | 'completed';
const contractStatus = (status: string, l: Lang) =>
  ({
    locked: say(l, 'Noch nicht verfügbar', 'Not yet available'),
    available: say(l, 'Angeboten', 'Offered'),
    active: say(l, 'Angenommen', 'Accepted'),
    ready: say(l, 'Zur Abgabe bereit', 'Ready to turn in'),
    completed: say(l, 'Abgeschlossen', 'Completed'),
  })[status] ?? status;

export function ContractsPanel({ view }: { view: GameView }) {
  const l = view.lang;
  const [tab, setTab] = useState<ContractTab>('offered');
  const [selected, setSelected] = useState('');
  if (!view.campaign)
    return (
      <Empty
        icon="book"
        title={say(l, 'Noch keine eigene Geschichte.', 'No story of your own yet.')}
      />
    );
  const campaign = view.campaign;
  const scoped = CITY_QUESTS.filter(
    (q) => !view.questGiver || (q.giver === view.questGiver && q.cityId === view.cityId),
  );
  const quests = scoped.filter((q) => {
    const status = game.cityQuestStatus(q.id);
    return tab === 'offered'
      ? ['available', 'locked'].includes(status)
      : tab === 'active'
        ? ['active', 'ready'].includes(status)
        : status === 'completed';
  });
  const quest = quests.find((q) => q.id === selected) ?? quests[0];
  const status = quest ? game.cityQuestStatus(quest.id) : 'locked';
  const giver = NPCS.find((n) => n.id === quest?.giver);
  const city = CITIES.find((c) => c.id === quest?.cityId);
  const atGiver =
    quest &&
    view.phase === 'town' &&
    view.cityId === quest.cityId &&
    view.questGiver === quest.giver;
  const chosen = quest?.choices?.find((c) => c.id === campaign.choices[quest.id]);
  const progress = quest
    ? (campaign.questProgress[quest.id]?.count ?? campaign.cityQuestBank?.[quest.id] ?? 0)
    : 0;
  return (
    <>
      <div className="contract-intro">
        <p>
          {view.questGiver
            ? say(
                l,
                'Aufträge dieses Kontakts. Lies die Bedingungen, bevor du zusagst.',
                'Contracts from this contact. Read the terms before accepting.',
              )
            : say(
                l,
                'Stadtaufträge werden ausdrücklich angenommen. Ziele zählen danach; eine sichere Rückkehr schützt deinen Fortschritt. Gib erledigte Aufträge beim Kontakt ab.',
                'City contracts require explicit acceptance. Objectives count afterward; a safe return protects progress. Turn completed work in with its contact.',
              )}
        </p>
        <Button tone="quiet" icon="book" onClick={() => game.openPanel('journal')}>
          {say(l, 'Floorziele', 'Floor objectives')}
        </Button>
      </div>
      <div className="tabs panel-tabs">
        {(['offered', 'active', 'completed'] as const).map((value) => (
          <button
            key={value}
            className={tab === value ? 'selected' : ''}
            onClick={() => {
              setTab(value);
              setSelected('');
            }}
          >
            {say(
              l,
              value === 'offered'
                ? 'Angeboten'
                : value === 'active'
                  ? 'Angenommen & bereit'
                  : 'Abgeschlossen',
              value === 'offered'
                ? 'Offered'
                : value === 'active'
                  ? 'Accepted & ready'
                  : 'Completed',
            )}
          </button>
        ))}
      </div>
      <div className="journal-layout contracts-layout">
        <nav className="quest-list" aria-label={say(l, 'Stadtaufträge', 'City contracts')}>
          {quests.map((q) => {
            const state = game.cityQuestStatus(q.id);
            return (
              <button
                key={q.id}
                className={quest?.id === q.id ? 'selected' : ''}
                onClick={() => setSelected(q.id)}
              >
                <Icon
                  name={state === 'completed' ? 'check' : state === 'locked' ? 'lock' : 'target'}
                />
                <span>
                  <small>
                    {label(CITIES.find((c) => c.id === q.cityId)?.name, l)} ·{' '}
                    {NPCS.find((n) => n.id === q.giver)?.name}
                  </small>
                  <strong>{label(q.name, l)}</strong>
                  <small>{contractStatus(state, l)}</small>
                </span>
                <Icon name="arrow" size={16} />
              </button>
            );
          })}
          {!quests.length && (
            <Empty
              icon="book"
              title={say(l, 'Hier ist gerade kein Auftrag.', 'No contracts here right now.')}
            >
              <span>
                {say(
                  l,
                  'Sprich mit neuen Kontakten oder prüfe die anderen Kategorien.',
                  'Speak with new contacts or check the other categories.',
                )}
              </span>
            </Empty>
          )}
        </nav>
        {quest && (
          <article className="quest-detail city-contract-detail">
            <span className="eyebrow">
              {label(city?.name, l)} / {contractStatus(status, l)}
            </span>
            <h3>{label(quest.name, l)}</h3>
            {giver && (
              <div className="contract-giver">
                <NpcPortrait npc={giver} />
                <div>
                  <strong>{giver.name}</strong>
                  <span>{label(giver.role, l)}</span>
                </div>
              </div>
            )}
            <div className="narrative-prose">
              {quest.briefing.map((p, i) => (
                <p key={i}>{label(p, l)}</p>
              ))}
            </div>
            <div className="objective-card">
              <Icon name="target" />
              <div>
                <strong>{label(quest.description, l)}</strong>
                <small>
                  {Math.min(progress, quest.target)} / {quest.target} ·{' '}
                  {quest.objective === 'talk'
                    ? say(l, 'Gespräch in der Stadt', 'Conversation in the city')
                    : `${t(l, 'floor')} ${quest.floor}`}
                </small>
              </div>
            </div>
            {quest.requires?.length ? (
              <div className="contract-requirements">
                <h4>{say(l, 'Vorher persönlich abschließen', 'Turn in first')}</h4>
                {quest.requires.map((id) => (
                  <span key={id}>
                    <Icon
                      name={campaign.completedCityQuests?.includes(id) ? 'check' : 'lock'}
                      size={15}
                    />
                    {label(CITY_QUESTS.find((q) => q.id === id)?.name, l)}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="contract-rewards">
              <span>
                <Icon name="anvil" />
                {quest.reward.scrap} {t(l, 'scrap')}
              </span>
              <span>
                <Icon name="crown" />
                {quest.reward.marks} {t(l, 'marks')}
              </span>
            </div>
            {status === 'completed' ? (
              <>
                <div className="narrative-prose contract-conclusion">
                  {quest.conclusion.map((p, i) => (
                    <p key={i}>{label(p, l)}</p>
                  ))}
                </div>
                {chosen && (
                  <div className="recorded-choice">
                    <Icon name="check" />
                    <div>
                      <strong>{label(chosen.label, l)}</strong>
                      <p>{label(chosen.consequence, l)}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {status === 'ready' && (
                  <div className="narrative-prose contract-conclusion">
                    {quest.conclusion.map((p, i) => (
                      <p key={i}>{label(p, l)}</p>
                    ))}
                  </div>
                )}
                {status === 'ready' && quest.choices?.length ? (
                  <div className="narrative-decisions">
                    {quest.choices.map((decision) => (
                      <button
                        key={decision.id}
                        disabled={!atGiver}
                        onClick={() => game.claimQuest(quest.id, decision.id)}
                      >
                        <strong>{label(decision.label, l)}</strong>
                        <span>{label(decision.consequence, l)}</span>
                        <small>
                          {factionNames(l)[decision.faction]} +{decision.reputation}
                          {decision.faction === 'union' || decision.faction === 'sponsors'
                            ? ` · ${factionNames(l)[decision.faction === 'union' ? 'sponsors' : 'union']} −${Math.ceil(decision.reputation / 2)}`
                            : ''}
                        </small>
                      </button>
                    ))}
                  </div>
                ) : (
                  <Button
                    tone="primary"
                    icon={['ready', 'active'].includes(status) ? 'check' : 'talk'}
                    disabled={!atGiver || !['ready', 'available'].includes(status)}
                    onClick={() => {
                      if (status === 'ready') game.claimQuest(quest.id);
                      else {
                        game.acceptQuest(quest.id);
                        if (['active', 'ready'].includes(game.cityQuestStatus(quest.id))) {
                          setSelected(quest.id);
                          setTab('active');
                        }
                      }
                    }}
                  >
                    {say(
                      l,
                      status === 'ready'
                        ? 'Auftrag abgeben & Belohnung erhalten'
                        : status === 'active'
                          ? 'Bereits angenommen'
                          : 'Diesen Auftrag annehmen',
                      status === 'ready'
                        ? 'Turn in contract & receive reward'
                        : status === 'active'
                          ? 'Already accepted'
                          : 'Accept this contract',
                    )}
                  </Button>
                )}
                {!atGiver && (
                  <p className="fine-print">
                    {say(
                      l,
                      `Sprich mit ${giver?.name ?? quest.giver} in ${label(city?.name, l)}, um diesen Auftrag anzunehmen oder abzugeben.`,
                      `Speak with ${giver?.name ?? quest.giver} in ${label(city?.name, l)} to accept or turn in this contract.`,
                    )}
                  </p>
                )}
                {quest.choices?.length && status !== 'ready' && (
                  <p className="fine-print">
                    {say(
                      l,
                      'Beim Abschluss entscheidest du über die Verwendung deiner Arbeit. Jede Entscheidung verändert dein Ansehen bei einer Fraktion.',
                      'At completion, you decide how your work is used. Each decision changes your reputation with a faction.',
                    )}
                  </p>
                )}
              </>
            )}
          </article>
        )}
      </div>
    </>
  );
}

export function StoryPanel({ view }: { view: GameView }) {
  const l = view.lang;
  const c = view.campaign;
  const [selected, setSelected] = useState(Math.min(c?.floorUnlocked ?? 1, 12));
  if (!c)
    return (
      <Empty
        icon="book"
        title={say(l, 'Noch kein eigenes Kapitel.', 'No chapter of your own yet.')}
      />
    );
  const origin = ORIGINS.find((o) => o.id === c.origin) ?? ORIGINS[0];
  const chapter = STORY_CHAPTERS.find((ch) => ch.floor === selected) ?? STORY_CHAPTERS[0];
  const scenes = chapter.scenes.filter(
    (scene) =>
      c.choices[scene.id] ||
      c.choices[`seen:${scene.id}`] === 'read' ||
      c.discovered.includes(scene.id),
  );
  return (
    <div className="story-panel">
      {origin && (
        <details className="origin-record">
          <summary>
            {label(origin.name, l)} <span>{say(l, 'Deine Herkunft', 'Your origin')}</span>
          </summary>
          <div className="narrative-prose">
            {origin.opening.map((p, i) => (
              <p key={i}>{label(p, l)}</p>
            ))}
            <p>
              <strong>{label(origin.personalGoal, l)}</strong>
            </p>
            <p>{label(origin.keepsake, l)}</p>
            <p>
              {say(l, 'Deine Motivation', 'Your motivation')}:{' '}
              {motivations(l).find((m) => m.id === (c.choices.motivation ?? 'family'))?.name}
            </p>
          </div>
        </details>
      )}
      <div className="faction-strip">
        {(['residents', 'union', 'archive', 'sponsors'] as const).map((faction) => {
          const value = c.relationships[`faction-${faction}`] ?? 50;
          return (
            <div key={faction}>
              <span>{factionNames(l)[faction]}</span>
              <strong>{value}</strong>
              <div className="faction-track">
                <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="fine-print">
        {say(
          l,
          'Ansehen entsteht durch Entscheidungen und abgeschlossene Stadtaufträge. Wer Gewerkschaft oder Sponsoren stärkt, verliert bei der jeweiligen Gegenfraktion die Hälfte des Rufgewinns, aufgerundet. Ansehen beeinflusst Markt- und Werkstattpreise. Die Chronik bewahrt deine Aussagen; erneutes Lesen erteilt keine Belohnungen.',
          'Reputation grows through decisions and completed city contracts. Supporting the union or sponsors reduces reputation with the opposing faction by half the gain, rounded up. Reputation affects market and workshop prices. The chronicle preserves your choices; rereading grants no rewards.',
        )}
      </p>
      <div className="story-layout">
        <nav className="chapter-list" aria-label={say(l, 'Kapitel', 'Chapters')}>
          {STORY_CHAPTERS.map((ch) => (
            <button
              key={ch.floor}
              disabled={ch.floor > c.floorUnlocked}
              className={ch.floor === selected ? 'selected' : ''}
              onClick={() => setSelected(ch.floor)}
            >
              <span>{String(ch.floor).padStart(2, '0')}</span>
              <strong>{label(ch.title, l)}</strong>
              <Icon
                name={
                  c.completedFloors.includes(ch.floor)
                    ? 'check'
                    : ch.floor > c.floorUnlocked
                      ? 'lock'
                      : 'arrow'
                }
                size={16}
              />
            </button>
          ))}
        </nav>
        <article className="chapter-reading">
          <span className="eyebrow">
            {t(l, 'floor')} {chapter.floor} /{' '}
            {label(FLOORS.find((f) => f.index === chapter.floor)?.name, l)}
          </span>
          <h3>{label(chapter.title, l)}</h3>
          <div className="narrative-prose">
            {chapter.arrival.map((p, i) => (
              <p key={i}>{label(p, l)}</p>
            ))}
          </div>
          {scenes.map((scene) => {
            const chosen = scene.choices.find((choice) => choice.id === c.choices[scene.id]);
            return (
              <section className="remembered-scene" key={scene.id}>
                <span className="eyebrow">
                  {NPCS.find((n) => n.id === scene.speaker)?.name ?? scene.speaker}
                </span>
                <h4>{label(scene.title, l)}</h4>
                <div className="narrative-prose">
                  {scene.lines.map((p, i) => (
                    <p key={i}>{label(p, l)}</p>
                  ))}
                </div>
                {chosen && (
                  <div className="recorded-choice">
                    <Icon name="check" />
                    <div>
                      <strong>{label(chosen.label, l)}</strong>
                      <p>{label(chosen.consequence, l)}</p>
                    </div>
                  </div>
                )}
              </section>
            );
          })}
          {!scenes.length && (
            <p className="story-discovery-note">
              {say(
                l,
                'Persönliche Szenen entstehen in erkundeten Ereignisräumen. Dort sprichst du mit den Beteiligten und triffst deine Entscheidungen.',
                'Personal scenes unfold in explored event rooms. Speak with the people there and make your decisions.',
              )}
            </p>
          )}
          {c.completedFloors.includes(chapter.floor) && (
            <div className="chapter-aftermath">
              <h4>{say(l, 'Was danach bleibt', 'What remains afterward')}</h4>
              <div className="narrative-prose">
                {chapter.aftermath.map((p, i) => (
                  <p key={i}>{label(p, l)}</p>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}

export function RouteChoice({ view }: { view: GameView }) {
  const l = view.lang;
  const routes = [
    {
      id: 'balanced' as const,
      name: say(l, 'Ausgewogen', 'Balanced'),
      text: say(
        l,
        'Unbekannte Wege, wechselnde Begegnungen. Standard verlangt aktive Verteidigung und einen vorbereiteten Build.',
        'Unknown routes and changing encounters. Standard requires active defence and a prepared build.',
      ),
    },
    {
      id: 'dangerous' as const,
      name: say(l, 'Gefahrenroute', 'Dangerous route'),
      text: say(
        l,
        'Mehr Kampfdruck und riskante Begegnungen. Wähle diese Route mit guter Ausrüstung und ausreichend Heilung.',
        'More combat pressure and risky encounters. Bring good equipment and enough healing.',
      ),
    },
    {
      id: 'exploration' as const,
      name: say(l, 'Erkundungsroute', 'Exploration route'),
      text: say(
        l,
        'Mehr Raum für Entdeckungen und Ereignisse. Gegner, Räume und Bosse bleiben bei jedem Start neu kombiniert.',
        'More room for discoveries and events. Enemies, rooms and bosses are freshly combined every time.',
      ),
    },
  ];
  return (
    <fieldset className="route-choice">
      <legend>{say(l, 'Wie du in die Tiefe gehst', 'How you enter the depths')}</legend>
      {routes.map((route) => (
        <label
          key={route.id}
          className={(view.campaign?.choices.route ?? 'balanced') === route.id ? 'selected' : ''}
        >
          <input
            type="radio"
            name="route"
            checked={(view.campaign?.choices.route ?? 'balanced') === route.id}
            onChange={() => game.setRoute(route.id)}
          />
          <span>
            <strong>{route.name}</strong>
            <small>{route.text}</small>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
