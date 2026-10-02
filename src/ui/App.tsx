import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { CSSProperties } from 'react';
import { game } from '../game/controller';
import { CLASSES, ENDINGS, FLOORS, NPCS } from '../content';
import type { GameView, Lang, Panel } from '../game/types';
import { Icon } from './icons';
import { Button, IconButton, Meter, Modal, NpcPortrait, Portrait } from './common';
import { label, say, t } from './i18n';
import { Panels } from './Panels';
import { Hud } from './Hud';

const panelIcons = {
  inventory: 'bag',
  journal: 'book',
  map: 'map',
  character: 'person',
  settings: 'gear',
  codex: 'eye',
  shop: 'shop',
  craft: 'anvil',
  account: 'cloud',
  slots: 'grid',
  dialog: 'talk',
} as const;
const subscribe = (callback: () => void) => game.subscribe(callback);
const snapshot = () => game.getSnapshot();

function Language({ lang, compact = false }: { lang: Lang; compact?: boolean }) {
  return (
    <div
      className={`language-switch ${compact ? 'language-compact' : ''}`}
      aria-label={t(lang, 'language')}
    >
      <Icon name="globe" size={16} />
      {(['de', 'en'] as const).map((value) => (
        <button key={value} onClick={() => game.setLanguage(value)} aria-pressed={lang === value}>
          {value.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function SaveIndicator({ view }: { view: GameView }) {
  const status = view.account.username ? view.account.status : 'local';
  const localProblem = view.saveStatus === 'error';
  const statusLabel = localProblem
    ? say(view.lang, 'Speichern fehlgeschlagen', 'Save failed')
    : view.saveStatus === 'saving'
      ? say(view.lang, 'Wird lokal gespeichert', 'Saving locally')
      : t(view.lang, status);
  return (
    <button
      className={`save-indicator save-${localProblem ? 'error' : status}`}
      onClick={() => game.openPanel('account')}
      title={t(view.lang, 'account')}
    >
      <Icon name={view.account.username ? 'cloud' : 'check'} size={15} />
      <span>{statusLabel}</span>
      {view.account.username && <span className="account-name">· {view.account.username}</span>}
    </button>
  );
}

function RendererLoading({ view }: { view: GameView }) {
  const l = view.lang;
  const failed = view.renderer.status === 'error';
  const percentage = Math.round(Math.max(0, Math.min(1, view.renderer.progress)) * 100);
  return (
    <section
      className={`renderer-loading ${failed ? 'renderer-loading-error' : ''}`}
      aria-labelledby="renderer-loading-title"
    >
      <header className="renderer-loading-header">
        <span className="renderer-channel">
          <Icon name="radio" size={22} /> ARCHIVE NETWORK
        </span>
        <Language lang={l} />
      </header>
      <div className="renderer-loading-content">
        <span className="renderer-loading-emblem" aria-hidden="true">
          <Icon name={failed ? 'close' : 'radio'} size={38} />
        </span>
        <p className="eyebrow">{say(l, 'UNTER DER SENDUNG', 'BELOW THE BROADCAST')}</p>
        <h1 id="renderer-loading-title">
          {say(
            l,
            failed ? 'Die Verbindung stockt.' : 'Dein Kanal wird vorbereitet.',
            failed ? 'The connection stalled.' : 'Preparing your channel.',
          )}
        </h1>
        <p className="renderer-loading-description" role={failed ? 'alert' : 'status'}>
          {say(
            l,
            failed
              ? 'Die Spielgrafik konnte nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.'
              : 'Welt, Figuren und Ausrüstung werden geladen. Gleich beginnt deine Sendung.',
            failed
              ? 'The game graphics could not be loaded. Check your connection and try again.'
              : 'Loading the world, characters and equipment. Your broadcast begins shortly.',
          )}
        </p>
        {failed ? (
          <Button tone="primary" icon="radio" onClick={() => window.location.reload()}>
            {say(l, 'Erneut laden', 'Try loading again')}
          </Button>
        ) : (
          <div
            className="renderer-loading-progress"
            role="progressbar"
            aria-label={say(l, 'Spielgrafik wird geladen', 'Loading game graphics')}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
          >
            <div className="renderer-loading-progress-label">
              <span>{say(l, 'GRAFIK WIRD GELADEN', 'LOADING GRAPHICS')}</span>
              <strong>{percentage}%</strong>
            </div>
            <div className="renderer-loading-track">
              <span style={{ width: `${percentage}%` }} />
            </div>
          </div>
        )}
      </div>
      <footer className="renderer-loading-footer">
        <span className="status-dot" />
        {say(
          l,
          'Zwölf Floors. Dein nächster Schritt zählt.',
          'Twelve floors. Your next step matters.',
        )}
      </footer>
    </section>
  );
}

function Title({ view, onNew }: { view: GameView; onNew: (classId?: string) => void }) {
  const l = view.lang;
  const last = [...view.slots].sort((a, b) => b.updatedAt - a.updatedAt)[0];
  return (
    <main className="title-screen">
      <header className="title-top">
        <a
          className="studio-mark"
          href="#"
          onClick={(e) => e.preventDefault()}
          aria-label="Below the Broadcast"
        >
          <Icon name="radio" size={23} />
          <span>
            ARCHIVE
            <br />
            <b>NETWORK</b>
          </span>
        </a>
        <div className="live-tag">
          <span className="live-dot" />
          {say(l, 'SENDUNG 001', 'BROADCAST 001')}
          <span className="live-tag-divider">/</span>LIVE
        </div>
        <Language lang={l} />
      </header>
      <section className="title-copy">
        <p className="eyebrow title-kicker">
          <span className="rule" />
          {say(l, 'Deine Erinnerung. Ihr Entertainment.', 'Your memories. Their entertainment.')}
        </p>
        <h1>
          {l === 'de' ? (
            <>
              <span>UNTER DER</span>
              <strong>
                SENDUNG<span className="title-period">.</span>
              </strong>
            </>
          ) : (
            <>
              <span>BELOW THE</span>
              <strong>
                BROADCAST<span className="title-period">.</span>
              </strong>
            </>
          )}
        </h1>
        <p className="title-description">
          {say(
            l,
            'Zwölf Floors. Ein Sender ohne Gewissen. Und ein mechanischer Schakal, der mehr weiß, als er sagen kann.',
            'Twelve floors. A network without a conscience. And a mechanical jackal who knows more than he can say.',
          )}
        </p>
        <div className="title-actions">
          <Button tone="primary" icon="play" onClick={() => onNew()}>
            {t(l, 'newGame')}
            <Icon name="arrow" size={22} />
          </Button>
          {last && (
            <Button icon="arrow" onClick={() => game.loadSlot(last.slot)}>
              {t(l, 'continue')}
              <small>
                {last.name} · {t(l, 'floor')} {last.floor}
              </small>
            </Button>
          )}
          <div className="title-secondary">
            <button onClick={() => game.openPanel('slots')}>{t(l, 'slots')}</button>
            <span>/</span>
            <button onClick={() => game.openPanel('settings')}>{t(l, 'settings')}</button>
          </div>
        </div>
        <p className="title-local">
          <Icon name="check" size={14} />
          {say(
            l,
            'Direkt spielen. Dein Fortschritt wird automatisch gespeichert.',
            'Play immediately. Your progress is saved automatically.',
          )}
        </p>
      </section>
      <aside className="scene-caption">
        <span className="scene-coordinate">INTAKE HALL / 00:01</span>
        <h2>{say(l, 'Die Kameras laufen bereits.', 'The cameras are already rolling.')}</h2>
        <p>{say(l, 'Willkommen unter der Oberfläche.', 'Welcome beneath the surface.')}</p>
      </aside>
      <section
        className="class-lineup"
        aria-label={say(l, 'Wähle deine Klasse', 'Choose your class')}
      >
        <div className="lineup-intro">
          <span className="eyebrow">06 {say(l, 'KLASSEN', 'CLASSES')}</span>
          <p>{say(l, 'Wie wirst du überleben?', 'How will you survive?')}</p>
        </div>
        <div className="lineup-classes">
          {CLASSES.map((cls) => (
            <button
              key={cls.id}
              onClick={() => onNew(cls.id)}
              style={{ '--class-color': cls.color } as CSSProperties}
            >
              <Portrait cls={cls} size="small" />
              <span>{label(cls.name, l)}</span>
              <Icon name="arrow" size={14} />
            </button>
          ))}
        </div>
      </section>
      <footer className="title-footer">
        <span>
          BELOW THE BROADCAST <span className="muted">/</span> 01
        </span>
        <button onClick={() => game.openPanel('codex')}>{t(l, 'credits')}</button>
        <SaveIndicator view={view} />
      </footer>
    </main>
  );
}

function ClassSelect({
  view,
  initial,
  initialSlot,
  onBack,
}: {
  view: GameView;
  initial?: string;
  initialSlot?: number;
  onBack: () => void;
}) {
  const l = view.lang;
  const [selected, setSelected] = useState(initial ?? CLASSES[0]?.id ?? 'breaker');
  const [name, setName] = useState('');
  const [slot, setSlot] = useState(
    () => initialSlot ?? [0, 1, 2].find((id) => !view.slots.some((save) => save.slot === id)) ?? 0,
  );
  const [overwrite, setOverwrite] = useState(false);
  const identityForm = useRef<HTMLFormElement>(null);
  const cls = CLASSES.find((def) => def.id === selected) ?? CLASSES[0];
  if (!cls) return null;
  const start = () => {
    if (view.slots.some((save) => save.slot === slot) && !overwrite) {
      setOverwrite(true);
      window.setTimeout(
        () =>
          identityForm.current?.scrollIntoView({
            behavior: view.settings.reducedMotion ? 'auto' : 'smooth',
            block: 'end',
          }),
        30,
      );
      return;
    }
    game.newGame(cls.id, name.trim() || say(l, 'Wartungskraft', 'Maintenance'), slot);
    onBack();
  };
  return (
    <div className="class-screen">
      <header className="selection-header">
        <Button icon="back" tone="quiet" onClick={onBack}>
          {t(l, 'back')}
        </Button>
        <span className="eyebrow">
          {say(l, 'TEILNEHMERPROFIL / NEUE SENDUNG', 'CONTESTANT PROFILE / NEW BROADCAST')}
        </span>
        <Language lang={l} />
      </header>
      <main className="class-selection">
        <section className="selection-copy">
          <p className="eyebrow">{say(l, '01 / Deine Rolle', '01 / Your role')}</p>
          <h1>
            {say(l, 'Sie wählen die Arena.', 'They choose the arena.')}
            <br />
            <span>{say(l, 'Du wählst den Kampf.', 'You choose the fight.')}</span>
          </h1>
          <div className="class-picker">
            {CLASSES.map((def) => (
              <button
                key={def.id}
                onClick={() => setSelected(def.id)}
                aria-pressed={selected === def.id}
                className={selected === def.id ? 'selected' : ''}
                style={{ '--class-color': def.color } as CSSProperties}
              >
                <Portrait cls={def} size="small" />
                <span>{label(def.name, l)}</span>
                <Icon name="arrow" size={18} />
              </button>
            ))}
          </div>
        </section>
        <section className="class-dossier" style={{ '--class-color': cls.color } as CSSProperties}>
          <div className="dossier-top">
            <span className="eyebrow">
              {say(l, 'PERSONALAKTE', 'PERSONNEL FILE')} /{' '}
              {String(CLASSES.indexOf(cls) + 1).padStart(2, '0')}
            </span>
            <span className="badge">{say(l, 'Freigegeben', 'Cleared')}</span>
          </div>
          <div className="class-identity">
            <Portrait cls={cls} size="large" active />
            <div>
              <h2>{label(cls.name, l)}</h2>
              <p>{label(cls.description, l)}</p>
            </div>
          </div>
          <p className="class-lore">{label(cls.lore, l)}</p>
          <div className="class-stats">
            <span>
              <Icon name="heart" />
              {cls.hp} {t(l, 'life')}
            </span>
            <span>
              <Icon name="bolt" />
              {cls.resource} {t(l, 'resource')}
            </span>
            <span>
              <Icon name={cls.ranged ? 'target' : 'sword'} />
              {say(l, cls.ranged ? 'Fernkampf' : 'Nahkampf', cls.ranged ? 'Ranged' : 'Melee')}
            </span>
          </div>
          <h3 className="eyebrow">{say(l, 'Dein Arsenal', 'Your arsenal')}</h3>
          <div className="dossier-abilities">
            {cls.abilities.map((a) => (
              <div key={a.id}>
                <span className="ability-symbol" style={{ color: a.color }}>
                  <Icon
                    name={
                      a.kind === 'shield'
                        ? 'shield'
                        : a.kind === 'heal'
                          ? 'heart'
                          : a.kind === 'dash'
                            ? 'dodge'
                            : a.kind === 'projectile'
                              ? 'target'
                              : 'bolt'
                    }
                  />
                </span>
                <div>
                  <h4>{label(a.name, l)}</h4>
                  <p>{label(a.description, l)}</p>
                </div>
              </div>
            ))}
          </div>
          <form
            className="identity-form"
            ref={identityForm}
            onSubmit={(e) => {
              e.preventDefault();
              start();
            }}
          >
            <div className="identity-fields">
              <label>
                {t(l, 'name')}
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={24}
                  placeholder={say(l, 'Wartungskraft', 'Maintenance')}
                  autoComplete="off"
                />
              </label>
              <label>
                {t(l, 'slots')}
                <select
                  value={slot}
                  onChange={(e) => {
                    setSlot(Number(e.target.value));
                    setOverwrite(false);
                  }}
                >
                  {[0, 1, 2].map((id) => (
                    <option key={id} value={id}>
                      {String(id + 1).padStart(2, '0')} ·{' '}
                      {view.slots.find((save) => save.slot === id)?.name ?? t(l, 'emptySlot')}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {overwrite && (
              <p className="form-warning">
                {say(
                  l,
                  'Dieser Spielstand wird ersetzt. Exportiere ihn vorher im Spielstandmenü, falls du ihn behalten möchtest.',
                  'This save will be replaced. Export it from the save menu first if you want to keep it.',
                )}
              </p>
            )}
            <Button type="submit" tone={overwrite ? 'danger' : 'primary'} icon="play">
              {overwrite
                ? say(l, 'Spielstand ersetzen & starten', 'Replace save & start')
                : say(l, 'Bereit für die Sendung', 'Ready for broadcast')}
              <Icon name="arrow" />
            </Button>
          </form>
        </section>
      </main>
      <footer className="class-start-dock">
        <div>
          <span className="eyebrow">{label(cls.name, l)}</span>
          <strong>{name.trim() || say(l, 'Wartungskraft', 'Maintenance')}</strong>
        </div>
        <Button tone={overwrite ? 'danger' : 'primary'} icon="play" onClick={start}>
          {overwrite
            ? say(l, 'Ersetzen & starten', 'Replace & start')
            : say(l, 'Sendung starten', 'Start broadcast')}
          <Icon name="arrow" />
        </Button>
      </footer>
    </div>
  );
}

function Hub({ view }: { view: GameView }) {
  const l = view.lang,
    campaign = view.campaign;
  const [floorsOpen, setFloorsOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(campaign?.floorUnlocked ?? 1);
  const [crewOpen, setCrewOpen] = useState(false);
  const cls = CLASSES.find((c) => c.id === campaign?.classId) ?? CLASSES[0];
  if (!campaign || !cls) return null;
  const floor = FLOORS.find((f) => f.index === selectedFloor) ?? FLOORS[0];
  return (
    <main className="hub-screen">
      <header className="hub-header">
        <div className="studio-mark">
          <Icon name="radio" size={24} />
          <span>
            ARCHIVE
            <br />
            <b>NETWORK</b>
          </span>
        </div>
        <div className="hub-player">
          <Portrait cls={cls} size="small" />
          <div>
            <strong>{campaign.name}</strong>
            <span>
              {label(cls.name, l)} · {t(l, 'level')} {campaign.level}
            </span>
          </div>
        </div>
        <div className="wallet">
          <span>
            <Icon name="anvil" size={16} />
            {campaign.scrap.toLocaleString()}
          </span>
          <span>
            <Icon name="crown" size={16} />
            {campaign.marks}
          </span>
        </div>
        <Language lang={l} compact />
        <IconButton
          icon="gear"
          label={t(l, 'settings')}
          onClick={() => game.openPanel('settings')}
        />
      </header>
      <section className="hub-copy">
        <p className="eyebrow">
          <span className="status-dot" />
          {say(l, 'KEINE KAMERAS. FÜR DEN MOMENT.', 'NO CAMERAS. FOR THE MOMENT.')}
        </p>
        <h1>
          {t(l, 'hub')}
          <span className="title-period">.</span>
        </h1>
        <p>
          {say(
            l,
            'Hier wird aus Schrott ein Plan. Bereite deinen Build vor, sprich mit der Crew und geh tiefer.',
            'Here, scrap becomes a plan. Prepare your build, talk to the crew, and go deeper.',
          )}
        </p>
        <div className="hub-progress">
          <span>
            {t(l, 'act')} {campaign.actUnlocked} / 4
          </span>
          <span>
            {campaign.completedFloors.length} / 12 {say(l, 'Floors befreit', 'floors cleared')}
          </span>
        </div>
        <Button
          tone="primary"
          icon="play"
          onClick={() => {
            setSelectedFloor(Math.min(12, campaign.floorUnlocked));
            setFloorsOpen(true);
          }}
        >
          {t(l, 'expedition')}
          <Icon name="arrow" />
        </Button>
        <nav className="hub-services" aria-label={say(l, 'Zufluchtangebote', 'Refuge services')}>
          {(['inventory', 'character', 'shop', 'craft', 'journal', 'codex'] as const).map(
            (panel) => (
              <button key={panel} onClick={() => game.openPanel(panel)}>
                <Icon name={panelIcons[panel]} />
                <span>{t(l, panel)}</span>
                <Icon name="arrow" size={16} />
              </button>
            ),
          )}
          <button onClick={() => setCrewOpen(true)}>
            <Icon name="talk" />
            <span>{t(l, 'crew')}</span>
            <Icon name="arrow" size={16} />
          </button>
        </nav>
      </section>
      <aside className="hub-note">
        <span className="eyebrow">NIX / {say(l, 'LOKALER KANAL', 'LOCAL CHANNEL')}</span>
        <p>
          “
          {say(
            l,
            'Statistisch gesehen kannst du überleben. Ich habe die Statistik allerdings selbst geschrieben.',
            'Statistically, you can survive. Admittedly, I wrote the statistics myself.',
          )}
          ”
        </p>
        <button onClick={() => game.talk('nix')}>
          {say(l, 'Mit NIX sprechen', 'Talk to NIX')} <Icon name="arrow" size={16} />
        </button>
      </aside>
      <footer className="hub-footer">
        <SaveIndicator view={view} />
        <button onClick={() => game.openPanel('slots')}>{t(l, 'slots')}</button>
        <span>{say(l, 'WAS DU HIER SICHERST, BLEIBT.', 'WHAT YOU BANK HERE, STAYS.')}</span>
      </footer>
      {floorsOpen && (
        <Modal
          title={say(l, 'Wie tief gehst du?', 'How deep will you go?')}
          subtitle={t(l, 'expedition')}
          icon="map"
          lang={l}
          onClose={() => setFloorsOpen(false)}
          wide
          footer={
            <div className="expedition-footer">
              <div>
                <span className="eyebrow">
                  {t(l, 'floor')} {String(selectedFloor).padStart(2, '0')}
                </span>
                <strong>{label(floor?.name, l)}</strong>
              </div>
              <Button
                tone="primary"
                icon="play"
                onClick={() => {
                  setFloorsOpen(false);
                  game.enterFloor(selectedFloor);
                }}
              >
                {t(l, 'deploy')}
                <Icon name="arrow" />
              </Button>
            </div>
          }
        >
          <div className="expedition-layout">
            <div className="floor-selector">
              {FLOORS.map((def) => {
                const locked = def.index > campaign.floorUnlocked,
                  cleared = campaign.completedFloors.includes(def.index);
                return (
                  <button
                    key={def.id}
                    disabled={locked}
                    className={selectedFloor === def.index ? 'selected' : ''}
                    onClick={() => setSelectedFloor(def.index)}
                    style={{ '--floor-color': def.colors.accent } as CSSProperties}
                  >
                    <span className="floor-number">{String(def.index).padStart(2, '0')}</span>
                    <span>
                      <small>
                        {t(l, 'act')} {def.act}
                      </small>
                      <strong>{label(def.name, l)}</strong>
                    </span>
                    <Icon name={locked ? 'lock' : cleared ? 'check' : 'arrow'} size={18} />
                  </button>
                );
              })}
            </div>
            {floor && (
              <section
                className="floor-brief"
                style={{ '--floor-color': floor.colors.accent } as CSSProperties}
              >
                <span className="eyebrow">
                  {t(l, 'floor')} {String(floor.index).padStart(2, '0')} / {t(l, 'act')} {floor.act}
                </span>
                <h3>{label(floor.name, l)}</h3>
                <p>{label(floor.description, l)}</p>
                <div className="mission-warning">
                  <Icon name="eye" />
                  <p>{label(floor.story, l)}</p>
                </div>
                <dl className="mission-facts">
                  <div>
                    <dt>{t(l, 'enemies')}</dt>
                    <dd>
                      {floor.mobs.length} {say(l, 'Typen', 'types')} · {floor.elites.length}{' '}
                      {say(l, 'Eliten', 'elites')}
                    </dd>
                  </div>
                  <div>
                    <dt>{say(l, 'Zwischenbosse', 'Minibosses')}</dt>
                    <dd>{floor.minibosses.length}</dd>
                  </div>
                  <div>
                    <dt>{say(l, 'Hauptboss', 'Main boss')}</dt>
                    <dd>{label(floor.boss.name, l)}</dd>
                  </div>
                  <div>
                    <dt>{t(l, 'difficulty')}</dt>
                    <dd>{t(l, view.settings.difficulty)}</dd>
                  </div>
                </dl>
                <p className="fine-print">
                  {say(
                    l,
                    'Tod kostet ungesicherten Expeditionsloot. Deine Klasse, abgeschlossene Floors und gesicherte Ausrüstung bleiben erhalten.',
                    'Death costs unbanked expedition loot. Your class, cleared floors and banked equipment remain.',
                  )}
                </p>
              </section>
            )}
          </div>
        </Modal>
      )}
      {crewOpen && (
        <Modal
          title={t(l, 'crew')}
          subtitle={t(l, 'hub')}
          icon="talk"
          lang={l}
          onClose={() => setCrewOpen(false)}
          wide
        >
          <div className="crew-list">
            {NPCS.filter((npc) => game.npcAvailable(npc.id)).map((npc) => (
              <button
                key={npc.id}
                onClick={() => {
                  setCrewOpen(false);
                  game.talk(npc.id);
                }}
                style={{ '--class-color': npc.color } as CSSProperties}
              >
                <NpcPortrait npc={npc} />
                <span>
                  <strong>{npc.name}</strong>
                  <small>{label(npc.role, l)}</small>
                  <p>{label(npc.description, l)}</p>
                </span>
                <span className="crew-relationship">
                  <Icon name="heart" size={16} />
                  {campaign.relationships[npc.id] ?? 0}
                </span>
                <Icon name="arrow" />
              </button>
            ))}
          </div>
        </Modal>
      )}
    </main>
  );
}

function Death({ view }: { view: GameView }) {
  const l = view.lang;
  return (
    <div className="outcome-screen">
      <section className="outcome-panel">
        <span className="eyebrow">
          <span className="live-dot danger" />
          {say(l, 'SIGNAL VERLOREN', 'SIGNAL LOST')}
        </span>
        <Icon name="skull" size={56} />
        <h1>
          {say(l, 'Abspann?', 'The end?')}
          <br />
          <span>{say(l, 'Noch lange nicht.', 'Not even close.')}</span>
        </h1>
        <p>
          {say(
            l,
            'Der Sender hat eine Kopie behalten. Du behältst, was du rechtzeitig gesichert hast.',
            'The network kept a copy. You keep what you banked in time.',
          )}
        </p>
        <div className="outcome-stats">
          <span>
            <strong>{String(view.floor).padStart(2, '0')}</strong>
            {t(l, 'floor')}
          </span>
          <span>
            <strong>{game.world.kills}</strong>
            {say(l, 'Besiegte Gegner', 'Enemies defeated')}
          </span>
          <span>
            <strong>{view.campaign?.completedFloors.length ?? 0}</strong>
            {say(l, 'Gesicherte Floors', 'Banked floors')}
          </span>
        </div>
        <Button tone="primary" icon="play" onClick={() => game.retry()}>
          {t(l, 'restart')}
        </Button>
        <Button icon="back" onClick={() => game.returnHub()}>
          {t(l, 'returnHub')}
        </Button>
        <button className="text-link" onClick={() => game.openPanel('settings')}>
          {say(l, 'Schwierigkeit und Assistenz anpassen', 'Adjust difficulty and assistance')}
        </button>
      </section>
    </div>
  );
}

function Ending({ view }: { view: GameView }) {
  const l = view.lang,
    chosen = ENDINGS.find((ending) => ending.id === view.campaign?.ending);
  const endingIcon = (id: string) =>
    id === 'liberate'
      ? ('leaf' as const)
      : id === 'control'
        ? ('crown' as const)
        : ('talk' as const);
  return (
    <div className="ending-screen">
      <section>
        <p className="eyebrow">{say(l, '12 / SENDEKERN', '12 / BROADCAST CORE')}</p>
        <h1>
          {chosen
            ? say(l, 'Die letzte Sendung.', 'The final broadcast.')
            : say(l, 'Das Signal gehört dir.', 'The signal is yours.')}
        </h1>
        <p className="ending-intro">
          {chosen
            ? label(chosen.description, l)
            : say(
                l,
                'Veyls Stimme ist verstummt. Millionen Erinnerungen warten im Kern. NIX stellt sich neben dich. Zum ersten Mal gibt es kein vorgegebenes Skript.',
                'Veyl has fallen silent. Millions of memories wait in the core. NIX stands beside you. For the first time, there is no script.',
              )}
        </p>
        {chosen ? (
          <>
            <div className="ending-epilogue">
              <Icon name={endingIcon(chosen.id)} size={46} />
              <h2>{label(chosen.name, l)}</h2>
              <p>{label(chosen.epilogue, l)}</p>
            </div>
            <Button tone="primary" icon="back" onClick={() => game.returnHub()}>
              {say(l, 'Epilog beenden & weiter erkunden', 'Finish epilogue & keep exploring')}
            </Button>
          </>
        ) : (
          <div className="ending-choices">
            {ENDINGS.map((ending) => (
              <button key={ending.id} onClick={() => game.chooseEnding(ending.id)}>
                <Icon name={endingIcon(ending.id)} size={36} />
                <h2>{label(ending.name, l)}</h2>
                <p>{label(ending.description, l)}</p>
                <span>
                  {say(l, 'Diese Entscheidung treffen', 'Make this choice')}
                  <Icon name="arrow" />
                </span>
              </button>
            ))}
          </div>
        )}
        <p className="credits-line">
          {say(
            l,
            'Welt und Geschichte: BELOW THE BROADCAST · Pixelgrafik: Foozle / DCSS, CC0 · Schriften: Tiny5 & Inter, OFL',
            'World and story: BELOW THE BROADCAST · Pixel art: Foozle / DCSS, CC0 · Fonts: Tiny5 & Inter, OFL',
          )}
        </p>
      </section>
    </div>
  );
}

export default function App() {
  const view = useSyncExternalStore(subscribe, snapshot, snapshot);
  const [selecting, setSelecting] = useState(false);
  const [initialClass, setInitialClass] = useState<string>();
  const [initialSlot, setInitialSlot] = useState<number>();
  const [help, setHelp] = useState(false);
  const closePanel = useCallback(() => game.closePanel(), []);
  useEffect(() => {
    document.documentElement.lang = view.lang;
    document.documentElement.style.setProperty('--text-scale', String(view.settings.textScale));
  }, [view.lang, view.settings.textScale]);
  useEffect(() => {
    const visibility = () => {
      if (document.hidden && game.getSnapshot().phase === 'playing') game.pause(true);
    };
    const blur = () => {
      if (game.getSnapshot().phase === 'playing') game.pause(true);
    };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('blur', blur);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('blur', blur);
    };
  }, []);
  useEffect(() => {
    if (view.phase !== 'title' && view.phase !== 'classselect') setSelecting(false);
  }, [view.phase]);
  const onNew = (id?: string, slot?: number) => {
    setInitialClass(id);
    setInitialSlot(slot);
    setSelecting(true);
  };
  const isPanel = view.panel !== 'none';
  const rendererReady = view.renderer.status === 'ready';
  const overlayOpen = isPanel || help || (view.phase === 'playing' && view.paused);
  return (
    <div
      className={`app-shell phase-${view.phase} ${view.settings.highContrast ? 'high-contrast' : ''} ${view.settings.reducedMotion ? 'reduced-motion' : ''} ${view.settings.leftHanded ? 'left-handed' : ''}`}
    >
      <div
        id="game-canvas"
        className="game-canvas"
        aria-label={say(view.lang, 'Dungeon-Spielwelt', 'Dungeon game world')}
      />
      <div className="scene-vignette" aria-hidden="true" />
      <div
        className="game-interface"
        inert={!rendererReady}
        aria-hidden={!rendererReady || undefined}
      >
        {view.phase === 'title' && !selecting && <Title view={view} onNew={onNew} />}
        {(selecting || view.phase === 'classselect') && (
          <ClassSelect
            view={view}
            initial={initialClass}
            initialSlot={initialSlot}
            onBack={() => setSelecting(false)}
          />
        )}
        {view.phase === 'hub' && <Hub view={view} />}
        {view.phase === 'playing' && <Hud view={view} onHelp={() => setHelp(true)} />}
        {view.phase === 'dead' && <Death view={view} />}
        {view.phase === 'ending' && <Ending view={view} />}
        {view.phase === 'playing' && view.paused && !isPanel && (
          <Modal
            title={t(view.lang, 'pause')}
            subtitle={say(view.lang, 'DIE SENDUNG WARTET.', 'THE BROADCAST CAN WAIT.')}
            icon="pause"
            lang={view.lang}
            onClose={() => game.pause(false)}
          >
            <div className="pause-menu">
              <Button tone="primary" icon="play" onClick={() => game.pause(false)}>
                {t(view.lang, 'resume')}
              </Button>
              {(['inventory', 'character', 'journal', 'map', 'settings', 'account'] as const).map(
                (panel) => (
                  <Button
                    key={panel}
                    icon={panelIcons[panel]}
                    onClick={() => game.openPanel(panel)}
                  >
                    {t(view.lang, panel)}
                  </Button>
                ),
              )}
              <Button icon="back" onClick={() => game.returnHub()}>
                {t(view.lang, 'returnHub')}
              </Button>
              <p className="fine-print">
                {say(
                  view.lang,
                  'Eine Rückkehr sichert deine aktuelle Beute und deinen Schrott. Unbestätigte Floorziele beginnen bei der nächsten Expedition neu.',
                  'Returning banks your current loot and scrap. Unconfirmed floor objectives restart on your next expedition.',
                )}
              </p>
            </div>
          </Modal>
        )}
        {isPanel && (
          <Panels view={view} onClose={closePanel} onNewSlot={(slot) => onNew(undefined, slot)} />
        )}
        {help && (
          <Modal
            title={t(view.lang, 'controls')}
            icon="target"
            lang={view.lang}
            onClose={() => setHelp(false)}
          >
            <div className="controls-intro">
              <p>
                {say(
                  view.lang,
                  'Bewege dich mit WASD oder Pfeiltasten. Ziele mit dem Zeiger. Mit E interagierst du mit Objekten in deiner Nähe. Telegraphierten Angriffen weichst du mit Leertaste aus.',
                  'Move with WASD or the arrow keys. Aim with the pointer. Press E to interact with nearby objects. Dodge telegraphed attacks with Space.',
                )}
              </p>
              <p>
                {say(
                  view.lang,
                  'Auf Touchgeräten steuert der linke Stick deine Bewegung. Die Aktionsknöpfe rechts lassen sich gleichzeitig bedienen. Die kleine Karte zeigt besuchte Räume und die aktuelle Position.',
                  'On touch devices, the left stick controls movement. The action buttons on the right support simultaneous input. The minimap shows visited rooms and your position.',
                )}
              </p>
              <p>
                {say(
                  view.lang,
                  'Der Wächter öffnet den Weg zum Hauptboss. Die Jagd ist optional und bringt besondere Beute. Terminals erzählen die Geschichte und Brunnen heilen dich.',
                  'The guardian opens the way to the main boss. Hunts are optional and award special loot. Terminals reveal the story and fountains heal you.',
                )}
              </p>
              <Button
                tone="primary"
                onClick={() => {
                  setHelp(false);
                  game.pause(false);
                }}
              >
                {say(view.lang, 'Verstanden', 'Got it')}
              </Button>
            </div>
          </Modal>
        )}
        <div
          className={`toast-stack ${overlayOpen ? 'toast-with-modal' : ''}`}
          aria-live="polite"
          aria-atomic="false"
        >
          {view.toasts
            .slice(-4)
            .filter((toast) => !overlayOpen || toast.tone === 'error')
            .map((toast) => (
              <div key={toast.id} className={`toast toast-${toast.tone}`}>
                <Icon
                  name={toast.tone === 'error' ? 'close' : toast.tone === 'loot' ? 'bag' : 'check'}
                  size={18}
                />
                {label(toast.text, view.lang)}
              </div>
            ))}
        </div>
      </div>
      {!rendererReady && <RendererLoading view={view} />}
    </div>
  );
}
