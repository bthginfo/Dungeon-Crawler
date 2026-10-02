import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { game } from '../game/controller';
import {
  AFFIXES,
  CLASSES,
  FLOORS,
  ITEMS,
  NPCS,
  QUESTS,
  RECIPES,
  RUN_MODIFIERS,
  SETS,
} from '../content';
import type {
  AbilityDef,
  Campaign,
  GameView,
  ItemDef,
  ItemInstance,
  Lang,
  Settings,
} from '../game/types';
import { Button, Empty, IconButton, ItemIcon, Modal, NpcPortrait, Portrait } from './common';
import { DungeonMap, getCityMapContacts } from './Hud';
import { CitiesPanel, ContractsPanel, StoryPanel } from './Narrative';
import { Icon } from './icons';
import { dateText, label, rarityName, say, statName, statValue, t } from './i18n';

type Props = { view: GameView };
const itemById = new Map(ITEMS.map((item) => [item.id, item]));
const panels = {
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
  cities: 'map',
  contracts: 'book',
  story: 'eye',
} as const;
const gearSlots = [
  'weapon',
  'offhand',
  'head',
  'body',
  'hands',
  'feet',
  'amulet',
  'talisman',
] as const;

function ItemDetails({
  item,
  instance,
  campaign,
  lang,
  children,
}: {
  item: ItemDef;
  instance?: ItemInstance;
  campaign?: Campaign | null;
  lang: Lang;
  children?: React.ReactNode;
}) {
  const currentUid = item.slot && campaign?.equipment[item.slot];
  const currentInstance = [...(campaign?.inventory ?? []), ...(campaign?.stash ?? [])].find(
    (i) => i.uid === currentUid,
  );
  const current = currentInstance && itemById.get(currentInstance.defId);
  const set = SETS.find((def) => def.id === item.set);
  return (
    <section className={`item-detail rarity-${item.rarity}`}>
      <div className="item-detail-top">
        <ItemIcon item={item} size="large" />
        <div>
          <span className="item-rarity">
            {rarityName(item.rarity, lang)} ·{' '}
            {item.slot ? statName(item.slot, lang) : t(lang, item.kind)}
          </span>
          <h3>{label(item.name, lang)}</h3>
          <small>
            {t(lang, 'itemLevel')} {instance?.level ?? item.floor}
          </small>
        </div>
      </div>
      <p className="item-description">{label(item.description, lang)}</p>
      <div className="item-primary-stat">
        <strong>{statValue(item.stat, item.value)}</strong>
        <span>{statName(item.stat, lang)}</span>
      </div>
      {instance?.affixes.map((id) => {
        const affix = AFFIXES.find((def) => def.id === id);
        return (
          affix && (
            <div className="affix-line" key={id}>
              <Icon name="plus" size={13} />
              <span>{label(affix.name, lang)}</span>
              <strong>
                {statValue(affix.stat, affix.value)} {statName(affix.stat, lang)}
              </strong>
            </div>
          )
        );
      })}
      {set && (
        <div className="set-description">
          <h4>
            <Icon name="grid" size={16} />
            {label(set.name, lang)}
          </h4>
          <p>
            <b>2:</b> {label(set.two, lang)}
          </p>
          <p>
            <b>4:</b> {label(set.four, lang)}
          </p>
        </div>
      )}
      {current && current.id !== item.id && (
        <div className="item-comparison">
          <span className="eyebrow">{say(lang, 'AKTUELL AUSGERÜSTET', 'CURRENTLY EQUIPPED')}</span>
          <strong>{label(current.name, lang)}</strong>
          <span>
            {statValue(current.stat, current.value)} {statName(current.stat, lang)}
          </span>
        </div>
      )}
      {children}
    </section>
  );
}

function Inventory({ view }: Props) {
  const l = view.lang,
    c = view.campaign;
  const [kind, setKind] = useState('all'),
    [search, setSearch] = useState(''),
    [sort, setSort] = useState('rarity');
  const [selected, setSelected] = useState(c?.inventory[0]?.uid ?? ''),
    [salvageConfirm, setSalvageConfirm] = useState(false),
    [source, setSource] = useState<'inventory' | 'stash'>('inventory');
  const inventory = source === 'inventory' ? (c?.inventory ?? []) : (c?.stash ?? []);
  const filtered = inventory
    .filter((instance) => {
      const item = itemById.get(instance.defId);
      return (
        item &&
        (kind === 'all' || kind === item.kind) &&
        label(item.name, l).toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort((a, b) => {
      const first = itemById.get(a.defId)!,
        second = itemById.get(b.defId)!;
      return sort === 'name'
        ? label(first.name, l).localeCompare(label(second.name, l))
        : sort === 'level'
          ? b.level - a.level
          : second.rarity - first.rarity;
    });
  const instance = inventory.find((i) => i.uid === selected) ?? filtered[0];
  const item = instance && itemById.get(instance.defId);
  if (!c)
    return (
      <Empty title={say(l, 'Noch keine Ausrüstung', 'No equipment yet')}>
        {say(l, 'Starte eine neue Übertragung.', 'Start a new broadcast.')}
      </Empty>
    );
  const equipped =
    instance &&
    (Object.values(c.equipment).includes(instance.uid) || c.relics.includes(instance.uid));
  return (
    <>
      <div className="panel-toolbar">
        <div className="tabs">
          <button
            className={source === 'inventory' ? 'selected' : ''}
            onClick={() => setSource('inventory')}
          >
            {t(l, 'inventory')} <span>{c.inventory.length}</span>
          </button>
          <button
            className={source === 'stash' ? 'selected' : ''}
            onClick={() => setSource('stash')}
          >
            {say(l, 'Depot', 'Stash')} <span>{c.stash.length}</span>
          </button>
        </div>
        <span className="wallet-inline">
          <Icon name="anvil" size={16} />
          {c.scrap}
        </span>
      </div>
      <div className="inventory-layout">
        <section className="inventory-browser">
          <div className="search-row">
            <input
              type="search"
              aria-label={say(l, 'Gegenstände suchen', 'Search items')}
              placeholder={say(l, 'Im Gepäck suchen…', 'Search your pack…')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              aria-label={say(l, 'Sortierung', 'Sort order')}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="rarity">{t(l, 'rarity')}</option>
              <option value="level">{t(l, 'itemLevel')}</option>
              <option value="name">{say(l, 'Name', 'Name')}</option>
            </select>
          </div>
          <div className="filter-row">
            {(['all', 'gear', 'relic', 'consumable', 'key'] as const).map((value) => (
              <button
                className={kind === value ? 'selected' : ''}
                key={value}
                onClick={() => setKind(value)}
              >
                {t(l, value)}
              </button>
            ))}
          </div>
          {filtered.length ? (
            <div className="inventory-grid">
              {filtered.map((entry) => {
                const def = itemById.get(entry.defId)!;
                const worn =
                  Object.values(c.equipment).includes(entry.uid) || c.relics.includes(entry.uid);
                return (
                  <button
                    key={entry.uid}
                    className={`inventory-item rarity-${def.rarity} ${instance?.uid === entry.uid ? 'selected' : ''}`}
                    aria-label={`${label(def.name, l)}${worn ? ` · ${say(l, 'ausgerüstet', 'equipped')}` : ''}`}
                    aria-pressed={instance?.uid === entry.uid}
                    onClick={() => {
                      setSelected(entry.uid);
                      setSalvageConfirm(false);
                    }}
                  >
                    <ItemIcon item={def} />
                    <span>{label(def.name, l)}</span>
                    <small>{entry.quantity > 1 ? `×${entry.quantity}` : `Lv.${entry.level}`}</small>
                    {worn && (
                      <span className="equipped-marker">
                        <Icon name="check" size={12} />
                      </span>
                    )}
                    {entry.favorite && <span className="favorite-marker">★</span>}
                  </button>
                );
              })}
            </div>
          ) : (
            <Empty icon="bag" title={say(l, 'Hier ist noch Platz.', 'Room for more.')}>
              {search
                ? say(l, 'Keine passenden Gegenstände gefunden.', 'No matching items found.')
                : say(
                    l,
                    'Truhen, Gegner und Bosse liefern neue Beute.',
                    'Chests, enemies and bosses drop new loot.',
                  )}
            </Empty>
          )}
          <p className="inventory-capacity">
            {source === 'inventory'
              ? `${c.inventory.length} / 24 ${say(l, 'Plätze', 'slots')}`
              : say(l, 'Gesichertes Depot', 'Banked stash')}
            <span>
              {say(l, 'Beute anklicken, um Werte zu vergleichen.', 'Select loot to compare stats.')}
            </span>
          </p>
        </section>
        {item && instance ? (
          <ItemDetails item={item} instance={instance} campaign={c} lang={l}>
            <div className="item-actions">
              {equipped && (
                <span className="badge">
                  <Icon name="check" size={13} />
                  {say(l, 'Ausgerüstet', 'Equipped')}
                </span>
              )}
              {item.kind === 'gear' || item.kind === 'relic' ? (
                <Button tone="primary" icon="shield" onClick={() => game.equip(instance.uid)}>
                  {equipped ? say(l, 'Ablegen', 'Unequip') : t(l, 'equip')}
                </Button>
              ) : item.kind === 'consumable' ? (
                <Button
                  tone="primary"
                  icon="flask"
                  disabled={source === 'stash'}
                  onClick={() => game.useItem(instance.uid)}
                >
                  {t(l, 'use')}
                </Button>
              ) : (
                <p className="fine-print">
                  {say(
                    l,
                    'Dieser Gegenstand wird bei seiner Storyinteraktion verwendet.',
                    'This item is used by its story interaction.',
                  )}
                </p>
              )}
              <Button icon="spark" tone="quiet" onClick={() => game.toggleFavorite(instance.uid)}>
                {instance.favorite
                  ? say(l, 'Favorit entfernen', 'Remove favorite')
                  : say(l, 'Als Favorit schützen', 'Protect as favorite')}
              </Button>
              {['hub', 'town'].includes(view.phase) && item.kind !== 'key' && (
                <Button
                  icon={source === 'stash' ? 'bag' : 'grid'}
                  disabled={source === 'inventory' && !!equipped}
                  onClick={() => {
                    game.moveStash(instance.uid, source === 'stash' ? 'inventory' : 'stash');
                    setSelected('');
                  }}
                >
                  {source === 'stash'
                    ? say(l, 'In den Rucksack', 'Move to backpack')
                    : say(l, 'Im Depot lagern', 'Move to stash')}
                </Button>
              )}
              {item.kind !== 'key' && !equipped && (
                <Button
                  tone={salvageConfirm ? 'danger' : 'quiet'}
                  icon="anvil"
                  disabled={instance.favorite}
                  onClick={() => {
                    if (!salvageConfirm && item.rarity >= 3) {
                      setSalvageConfirm(true);
                      return;
                    }
                    game.salvage(instance.uid);
                    setSalvageConfirm(false);
                    setSelected('');
                  }}
                >
                  {salvageConfirm
                    ? say(l, 'Verwertung bestätigen', 'Confirm salvage')
                    : t(l, 'salvage')}
                </Button>
              )}
            </div>
          </ItemDetails>
        ) : (
          <div className="item-detail">
            <Empty
              icon="bag"
              title={say(l, 'Dein nächster Fund wartet.', 'Your next find awaits.')}
            />
          </div>
        )}
      </div>
    </>
  );
}

function Journal({ view }: Props) {
  const l = view.lang,
    c = view.campaign;
  const [category, setCategory] = useState<'main' | 'side' | 'relationship'>('main'),
    [showComplete, setShowComplete] = useState(false),
    [selected, setSelected] = useState(view.quest?.id ?? '');
  const quests = QUESTS.filter(
    (q) =>
      q.category === category &&
      q.floor <= (c?.floorUnlocked ?? 1) &&
      (showComplete || !c?.questProgress[q.id]?.confirmed),
  );
  const quest = quests.find((q) => q.id === selected) ?? quests[0];
  const progress = quest && c?.questProgress[quest.id];
  const count = progress?.count ?? 0;
  return (
    <>
      <div className="journal-narrative-links">
        <Button icon="talk" onClick={() => game.openQuestBoard()}>
          {say(l, 'Angenommene & angebotene Stadtaufträge', 'Accepted & offered city contracts')}
        </Button>
        <Button icon="eye" onClick={() => game.openPanel('story')}>
          {say(l, 'Chronik & Entscheidungen', 'Chronicle & decisions')}
        </Button>
      </div>
      <div className="panel-toolbar">
        <div className="tabs">
          {(['main', 'side', 'relationship'] as const).map((value) => (
            <button
              key={value}
              className={category === value ? 'selected' : ''}
              onClick={() => setCategory(value)}
            >
              {t(l, value)}
            </button>
          ))}
        </div>
        <label className="compact-check">
          <input
            type="checkbox"
            checked={showComplete}
            onChange={(e) => setShowComplete(e.target.checked)}
          />
          {say(l, 'Abgeschlossene zeigen', 'Show completed')}
        </label>
      </div>
      <div className="journal-layout">
        <nav className="quest-list" aria-label={t(l, 'journal')}>
          {quests.length ? (
            quests.map((q) => {
              const state = c?.questProgress[q.id];
              return (
                <button
                  key={q.id}
                  className={`${quest?.id === q.id ? 'selected' : ''} ${state?.confirmed ? 'quest-complete' : ''}`}
                  onClick={() => setSelected(q.id)}
                >
                  <Icon name={state?.confirmed ? 'check' : 'target'} size={18} />
                  <span>
                    <small>
                      {t(l, 'floor')} {String(q.floor).padStart(2, '0')}
                    </small>
                    <strong>{label(q.name, l)}</strong>
                    <small>
                      {state?.confirmed
                        ? t(l, 'complete')
                        : `${Math.min(state?.count ?? 0, q.target)} / ${q.target}`}
                    </small>
                  </span>
                  <Icon name="arrow" size={16} />
                </button>
              );
            })
          ) : (
            <Empty
              icon="check"
              title={say(l, 'Alle aktuellen Ziele erledigt.', 'Current objectives complete.')}
            >
              {say(
                l,
                'Neue Floors und Gespräche öffnen weitere Geschichten.',
                'New floors and conversations unlock more stories.',
              )}
            </Empty>
          )}
        </nav>
        {quest && (
          <section className="quest-detail">
            <span className="eyebrow">
              {quest.id.toUpperCase()} / {t(l, quest.category)}
            </span>
            <h3>{label(quest.name, l)}</h3>
            <p>{label(quest.description, l)}</p>
            <div className="objective-card">
              <Icon name={progress?.confirmed ? 'check' : 'target'} />
              <div>
                <span className="eyebrow">{t(l, 'objective')}</span>
                <strong>
                  {progress?.confirmed
                    ? t(l, 'complete')
                    : `${Math.min(count, quest.target)} / ${quest.target}`}
                </strong>
                <div className="quest-progress">
                  <span
                    style={{
                      width: `${Math.min(100, (count / quest.target) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <dl className="mission-facts">
              <div>
                <dt>{t(l, 'floor')}</dt>
                <dd>{label(FLOORS.find((f) => f.index === quest.floor)?.name, l)}</dd>
              </div>
              <div>
                <dt>{t(l, 'reward')}</dt>
                <dd>
                  <Icon name="crown" size={15} />
                  {quest.reward} {t(l, 'marks')}
                </dd>
              </div>
              {quest.npc && (
                <div>
                  <dt>{say(l, 'Kontakt', 'Contact')}</dt>
                  <dd>{NPCS.find((npc) => npc.id === quest.npc)?.name ?? quest.npc}</dd>
                </div>
              )}
            </dl>
            <p className="fine-print">
              {say(
                l,
                'Fortschritt entsteht durch deine Handlungen im Dungeon. Storyziele und Belohnungen werden automatisch bestätigt; Beziehungsquests setzen Gespräche in der Zuflucht fort.',
                'Your actions in the dungeon advance objectives. Story objectives and rewards are confirmed automatically; continue relationship quests by talking in the refuge.',
              )}
            </p>
            {quest.npc && ['hub', 'town'].includes(view.phase) && (
              <Button icon="talk" onClick={() => game.talk(quest.npc!)}>
                {say(l, 'Gespräch beginnen', 'Start conversation')}
              </Button>
            )}
          </section>
        )}
      </div>
    </>
  );
}

function AbilityTile({
  ability,
  lang,
  children,
}: {
  ability: AbilityDef;
  lang: Lang;
  children?: React.ReactNode;
}) {
  return (
    <article className="ability-tile" style={{ '--class-color': ability.color } as CSSProperties}>
      <div>
        <span className="ability-symbol">
          <Icon
            name={
              ability.kind === 'shield'
                ? 'shield'
                : ability.kind === 'heal'
                  ? 'heart'
                  : ability.kind === 'dash'
                    ? 'dodge'
                    : ability.kind === 'projectile'
                      ? 'target'
                      : 'bolt'
            }
            size={24}
          />
        </span>
        <div>
          <h4>{label(ability.name, lang)}</h4>
          <small>
            {statName(ability.element, lang)} · {t(lang, 'cooldown')} {ability.cooldown}s ·{' '}
            {t(lang, 'cost')} {ability.cost}
          </small>
        </div>
      </div>
      <p>{label(ability.description, lang)}</p>
      {children}
    </article>
  );
}

function Character({ view }: Props) {
  const l = view.lang,
    c = view.campaign,
    cls = CLASSES.find((def) => def.id === c?.classId) ?? CLASSES[0];
  const [tab, setTab] = useState<'equipment' | 'abilities' | 'talents' | 'specialization'>(
    'equipment',
  );
  const [respecRequested, setRespecRequested] = useState(false);
  if (!c || !cls)
    return <Empty title={say(l, 'Noch kein Teilnehmerprofil', 'No contestant profile yet')} />;
  const availablePoints = Math.max(0, Math.min(10, c.level - 1) - c.talents.length);
  return (
    <>
      <div className="character-summary">
        <Portrait cls={cls} active />
        <div>
          <span className="eyebrow">{label(cls.name, l)}</span>
          <h3>{c.name}</h3>
          <span>
            {t(l, 'level')} {c.level} ·{' '}
            <span
              title={say(
                l,
                'Jeder erstmals abgeschlossene Floor gewährt dauerhaft +1,5 % Grundschaden und +2 maximales Leben.',
                'Each floor completed for the first time permanently grants +1.5% base damage and +2 maximum health.',
              )}
            >
              {say(l, 'Meisterschaft', 'Mastery')} {c.mastery}
            </span>{' '}
            · {c.xp} XP
          </span>
        </div>
        <div className="wallet">
          <span>
            <Icon name="anvil" />
            {c.scrap}
          </span>
          <span>
            <Icon name="crown" />
            {c.marks}
          </span>
        </div>
      </div>
      <div className="tabs panel-tabs">
        {(['equipment', 'abilities', 'talents', 'specialization'] as const).map((value) => (
          <button
            key={value}
            className={tab === value ? 'selected' : ''}
            onClick={() => setTab(value)}
          >
            {t(l, value)}
          </button>
        ))}
      </div>
      {tab === 'equipment' && (
        <div className="equipment-layout">
          <div className="gear-slots">
            {gearSlots.map((slot) => {
              const instance = [...c.inventory, ...c.stash].find(
                  (i) => i.uid === c.equipment[slot],
                ),
                def = instance && itemById.get(instance.defId);
              return (
                <div className="gear-slot" key={slot}>
                  {def ? (
                    <ItemIcon item={def} />
                  ) : (
                    <span className="empty-gear-icon">
                      <Icon name={slot === 'weapon' ? 'sword' : 'shield'} />
                    </span>
                  )}
                  <div>
                    <small>{statName(slot, l)}</small>
                    <strong>{def ? label(def.name, l) : say(l, 'Nicht belegt', 'Empty')}</strong>
                    {def && (
                      <span>
                        {statValue(def.stat, def.value)} {statName(def.stat, l)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="relic-slots">
              <h4>{t(l, 'relic')} / 2</h4>
              {[0, 1].map((index) => {
                const instance = [...c.inventory, ...c.stash].find(
                    (i) => i.uid === c.relics[index],
                  ),
                  def = instance && itemById.get(instance.defId);
                return (
                  <div key={index} className="gear-slot">
                    {def ? <ItemIcon item={def} /> : <Icon name="spark" />}
                    <span>
                      {def ? label(def.name, l) : say(l, 'Freier Reliktplatz', 'Empty relic slot')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <section className="character-stat-panel">
            <h3>{t(l, 'stats')}</h3>
            <dl>
              {[
                ['damage', view.stats.damage],
                ['armor', view.stats.armor],
                ['crit', Math.round(view.stats.crit * 100)],
                ['speed', Math.round(view.stats.speed)],
              ].map(([name, value]) => (
                <div key={name}>
                  <dt>{statName(String(name), l)}</dt>
                  <dd>
                    {value}
                    {name === 'crit' ? '%' : ''}
                  </dd>
                </div>
              ))}
              <div>
                <dt>{t(l, 'life')}</dt>
                <dd>{Math.round(view.maxHp)}</dd>
              </div>
              <div>
                <dt>{t(l, 'resource')}</dt>
                <dd>{Math.round(view.maxResource)}</dd>
              </div>
            </dl>
            <Button icon="bag" onClick={() => game.openPanel('inventory')}>
              {t(l, 'inventory')}
            </Button>
            <p className="fine-print">
              {say(
                l,
                'Klassen können jede Ausrüstung tragen. Ein starker Build verbindet Fähigkeiten, Talente und Relikte.',
                'Every class can wear all gear. A strong build connects abilities, talents and relics.',
              )}
            </p>
            <p className="fine-print">
              {say(
                l,
                `Meisterschaft: +${(Math.max(0, c.mastery - 1) * 1.5).toLocaleString('de-DE')} % Grundschaden und +${Math.max(0, c.mastery - 1) * 2} maximales Leben. Jeder erstmals abgeschlossene Floor gewährt +1,5 % und +2.`,
                `Mastery: +${(Math.max(0, c.mastery - 1) * 1.5).toLocaleString('en-US')}% base damage and +${Math.max(0, c.mastery - 1) * 2} maximum health. Each first floor completion grants +1.5% and +2.`,
              )}
            </p>
          </section>
        </div>
      )}
      {tab === 'abilities' && (
        <>
          <p className="section-intro">
            {say(
              l,
              'Wähle zwei Klassenfähigkeiten für deine Aktionsleiste. Grundangriff, Ausweichen und Ultimate bleiben immer verfügbar.',
              'Choose two class abilities for your action bar. Your primary attack, dodge and ultimate are always available.',
            )}
          </p>
          <div className="abilities-grid">
            {cls.abilities.map((a) => (
              <AbilityTile key={a.id} ability={a} lang={l}>
                <div className="ability-slot-options">
                  {[0, 1].map((index) => (
                    <button
                      key={index}
                      className={c.skills[index] === a.id ? 'selected' : ''}
                      onClick={() => game.chooseSkill(index, a.id)}
                    >
                      <kbd>{index === 0 ? 'Q' : 'R'}</kbd>
                      {c.skills[index] === a.id
                        ? say(l, 'Ausgerüstet', 'Equipped')
                        : say(l, `Platz ${index + 1}`, `Slot ${index + 1}`)}
                      {c.skills[index] === a.id && <Icon name="check" size={14} />}
                    </button>
                  ))}
                </div>
              </AbilityTile>
            ))}
            <AbilityTile ability={cls.ultimate} lang={l}>
              <span className="badge">
                <Icon name="crown" size={14} />
                {say(l, 'Ultimate · immer ausgerüstet', 'Ultimate · always equipped')}
              </span>
            </AbilityTile>
          </div>
        </>
      )}
      {tab === 'talents' && (
        <>
          <div className="section-intro">
            <p>
              {say(
                l,
                'Mit neuen Stufen erhältst du bis zu zehn Talentpunkte. Wähle, was deinen Spielstil stärkt. Erlernte Talente bleiben nach einer Niederlage erhalten.',
                'New levels award up to ten talent points. Choose what strengthens your playstyle. Learned talents remain after a defeat.',
              )}
            </p>
            <span className="wallet-inline">
              <Icon name="spark" />
              {availablePoints} {say(l, 'Talentpunkte', 'talent points')}
            </span>
          </div>
          <div className="talent-tree">
            {cls.talents.map((talent, index) => {
              const learned = c.talents.includes(talent.id);
              return (
                <article
                  key={talent.id}
                  className={`talent-node ${learned ? 'talent-learned' : ''}`}
                >
                  <span className="talent-index">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h4>{label(talent.name, l)}</h4>
                    <p>{label(talent.description, l)}</p>
                    <small>
                      {statValue(talent.stat, talent.value)} {statName(talent.stat, l)}
                    </small>
                  </div>
                  <Button
                    icon={learned ? 'check' : 'plus'}
                    tone={learned ? 'quiet' : 'plain'}
                    disabled={learned || availablePoints <= 0}
                    onClick={() => game.learnTalent(talent.id)}
                  >
                    {learned ? t(l, 'learned') : t(l, 'learn')}
                  </Button>
                </article>
              );
            })}
          </div>
          <div className="talent-respec">
            {respecRequested ? (
              <>
                <p className="fine-print">
                  {say(
                    l,
                    'Alle erlernten Talente zurücksetzen und 25 Archivmarken ausgeben? Deine Talentpunkte werden wieder frei.',
                    'Reset every learned talent and spend 25 archive marks? Your talent points will become available again.',
                  )}
                </p>
                <div className="account-delete-actions">
                  <Button onClick={() => setRespecRequested(false)}>
                    {say(l, 'Abbrechen', 'Cancel')}
                  </Button>
                  <Button
                    icon="crown"
                    disabled={
                      !['hub', 'town'].includes(view.phase) || c.marks < 25 || !c.talents.length
                    }
                    onClick={() => {
                      game.respec();
                      setRespecRequested(false);
                    }}
                  >
                    {say(l, 'Für 25 Archivmarken zurücksetzen', 'Reset for 25 archive marks')}
                  </Button>
                </div>
              </>
            ) : (
              <Button
                icon="crown"
                tone="quiet"
                disabled={
                  !['hub', 'town'].includes(view.phase) || c.marks < 25 || !c.talents.length
                }
                onClick={() => setRespecRequested(true)}
              >
                {say(
                  l,
                  'Talente neu verteilen · 25 Archivmarken',
                  'Reassign talents · 25 archive marks',
                )}
              </Button>
            )}
            {!['hub', 'town'].includes(view.phase) && (
              <p className="fine-print">
                {say(
                  l,
                  'Talente kannst du in der Zuflucht oder einer Stadt neu verteilen.',
                  'Reassign talents in the refuge or a city.',
                )}
              </p>
            )}
          </div>
        </>
      )}
      {tab === 'specialization' && (
        <>
          <p className="section-intro">
            {say(
              l,
              'Ab Stufe 5 wählst du deinen Schwerpunkt. In der Zuflucht oder einer Stadt kannst du ihn wechseln.',
              'Choose your specialization from level 5. Change it in the refuge or a city.',
            )}
          </p>
          <div className="specialization-choices">
            {cls.specs.map((spec, index) => (
              <button
                key={index}
                className={c.specialization === index ? 'selected' : ''}
                disabled={c.level < 5}
                onClick={() => game.setSpecialization(index)}
              >
                <Icon name={index ? 'bolt' : 'shield'} size={42} />
                <h3>{label(spec.name, l)}</h3>
                <p>{label(spec.description, l)}</p>
                <span>
                  {statValue(spec.stat, spec.value)} {statName(spec.stat, l)}
                </span>
                <strong>
                  {c.level < 5 ? (
                    <>
                      <Icon name="lock" />
                      {say(l, 'Ab Stufe 5', 'From level 5')}
                    </>
                  ) : c.specialization === index ? (
                    <>
                      <Icon name="check" />
                      {t(l, 'active')}
                    </>
                  ) : (
                    <>
                      {say(l, 'Schwerpunkt wählen', 'Choose focus')}
                      <Icon name="arrow" />
                    </>
                  )}
                </strong>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function Market({ view, crafting }: Props & { crafting?: boolean }) {
  const l = view.lang,
    c = view.campaign;
  const [selected, setSelected] = useState('');
  if (!c)
    return (
      <Empty
        title={say(l, 'Der Markt wartet in der Zuflucht.', 'The market awaits in the refuge.')}
      />
    );
  const rows = crafting
    ? RECIPES.filter((recipe) => recipe.floor <= c.floorUnlocked).map((recipe) => ({
        id: recipe.id,
        item: itemById.get(recipe.item),
        price: game.craftPrice(recipe.id),
        title: label(recipe.name, l),
      }))
    : view.shop.map((id) => ({
        id,
        item: itemById.get(id),
        price: game.shopPrice(id),
        title: label(itemById.get(id)?.name, l),
      }));
  const row = rows.find((r) => r.id === selected) ?? rows[0];
  return (
    <>
      <div className="market-intro">
        <div>
          <span className="eyebrow">{crafting ? 'TAM / WORKSHOP' : 'ZUV / BLACK MARKET'}</span>
          <p>
            {crafting
              ? say(
                  l,
                  'Kein Würfelwurf. Wähle dein Ergebnis und gib dem Schrott eine zweite Chance.',
                  'No dice roll. Choose your result and give scrap a second chance.',
                )
              : say(
                  l,
                  'Zuv verkauft alles außer seine Quellen. Das Sortiment wächst mit deinem Fortschritt.',
                  'Zuv sells everything except his sources. Stock grows with your progress.',
                )}
          </p>
        </div>
        <span className="wallet-inline">
          <Icon name="anvil" />
          {c.scrap} {t(l, 'scrap')}
        </span>
      </div>
      <div className="market-layout">
        <div className="market-list">
          {rows.length ? (
            rows.map(
              (entry) =>
                entry.item && (
                  <button
                    key={entry.id}
                    className={row?.id === entry.id ? 'selected' : ''}
                    onClick={() => setSelected(entry.id)}
                  >
                    <ItemIcon item={entry.item} />
                    <span>
                      <strong>{entry.title}</strong>
                      <small>
                        {rarityName(entry.item.rarity, l)} ·{' '}
                        {entry.item.slot ? statName(entry.item.slot, l) : t(l, entry.item.kind)}
                      </small>
                    </span>
                    <span className={`price ${c.scrap < entry.price ? 'price-unaffordable' : ''}`}>
                      <Icon name="anvil" size={14} />
                      {entry.price}
                    </span>
                  </button>
                ),
            )
          ) : (
            <Empty
              icon={crafting ? 'anvil' : 'shop'}
              title={say(l, 'Noch kein Angebot verfügbar.', 'No stock available yet.')}
            >
              {say(l, 'Schließe die erste Expedition ab.', 'Complete your first expedition.')}
            </Empty>
          )}
        </div>
        {row?.item && (
          <ItemDetails item={row.item} campaign={c} lang={l}>
            <div className="item-actions">
              <Button
                tone="primary"
                icon={crafting ? 'anvil' : 'shop'}
                disabled={c.scrap < row.price || !['hub', 'town'].includes(view.phase)}
                onClick={() => (crafting ? game.craft(row.id) : game.buy(row.item!.id))}
              >
                {crafting ? t(l, 'make') : t(l, 'buy')} · {row.price} {t(l, 'scrap')}
              </Button>
              {!['hub', 'town'].includes(view.phase) && (
                <p className="fine-print">
                  {say(
                    l,
                    'Handel und Herstellung sind in der Zuflucht und in bewohnten Städten möglich.',
                    'Trade and crafting are available in the refuge and inhabited cities.',
                  )}
                </p>
              )}
              {c.scrap < row.price && (
                <p className="form-warning">
                  {say(l, 'Du brauchst mehr Schrott.', 'You need more scrap.')}
                </p>
              )}
            </div>
          </ItemDetails>
        )}
      </div>
    </>
  );
}

function CloudConflict({ view }: Props) {
  const conflict = view.account.conflict,
    l = view.lang;
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  if (!conflict) return null;
  const resolve = async (choice: 'local' | 'cloud' | 'copy') => {
    setBusy(true);
    setError('');
    try {
      await game.resolveConflict(choice);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : say(l, 'Konflikt konnte nicht gelöst werden.', 'Could not resolve conflict.'),
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="conflict-panel">
      <span className="eyebrow">
        {say(l, 'FORTSCHRITT AUF ZWEI GERÄTEN', 'PROGRESS ON TWO DEVICES')}
      </span>
      <h3>{say(l, 'Welchen Weg setzt du fort?', 'Which path will you continue?')}</h3>
      <p>
        {say(
          l,
          'Beide Versionen haben sich verändert. Wähle einen vollständigen Stand oder behalte beide in getrennten Slots. Ausrüstung und Storyentscheidungen bleiben zusammen.',
          'Both versions have changed. Choose a complete save or keep both in separate slots. Equipment and story choices stay together.',
        )}
      </p>
      <div className="conflict-versions">
        {[
          { save: conflict.local, local: true },
          { save: conflict.cloud, local: false },
        ].map(({ save, local }) => (
          <div key={String(local)}>
            <Icon name={local ? 'download' : 'cloud'} size={30} />
            <span className="eyebrow">
              {local ? say(l, 'DIESES GERÄT', 'THIS DEVICE') : 'CLOUD'}
            </span>
            <h4>{save.name}</h4>
            <p>
              {t(l, 'floor')} {save.floorUnlocked} · {t(l, 'level')} {save.level}
            </p>
            <small>{dateText(save.updatedAt, l)}</small>
            <Button
              disabled={busy}
              tone={local ? 'primary' : 'plain'}
              onClick={() => resolve(local ? 'local' : 'cloud')}
            >
              {say(l, 'Diesen Spielstand verwenden', 'Use this save')}
            </Button>
          </div>
        ))}
      </div>
      <Button icon="grid" disabled={busy} onClick={() => resolve('copy')}>
        {say(
          l,
          'Beide Versionen behalten · freier Slot nötig',
          'Keep both versions · empty slot required',
        )}
      </Button>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </div>
  );
}

function Account({ view }: Props) {
  const l = view.lang;
  const [mode, setMode] = useState<'login' | 'register'>('register'),
    [username, setUsername] = useState(''),
    [password, setPassword] = useState(''),
    [visible, setVisible] = useState(false),
    [busy, setBusy] = useState(false),
    [deleteRequested, setDeleteRequested] = useState(false),
    [error, setError] = useState('');
  const file = useRef<HTMLInputElement>(null);
  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await game.auth(username.trim(), password, mode);
      setPassword('');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : say(l, 'Anmeldung fehlgeschlagen.', 'Sign in failed.'),
      );
    } finally {
      setBusy(false);
    }
  };
  const sync = async () => {
    setBusy(true);
    setError('');
    try {
      await game.sync();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : say(l, 'Synchronisation fehlgeschlagen.', 'Sync failed.'),
      );
    } finally {
      setBusy(false);
    }
  };
  const importFile = async (input: HTMLInputElement) => {
    if (!input.files?.[0]) return;
    try {
      await game.importSave(input.files[0]);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : say(l, 'Ungültiger Spielstand.', 'Invalid save.'),
      );
    }
    input.value = '';
  };
  const deleteAccount = async () => {
    setBusy(true);
    setError('');
    try {
      await game.deleteAccount();
      setDeleteRequested(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : say(l, 'Das Konto konnte nicht gelöscht werden.', 'The account could not be deleted.'),
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className="account-intro">
        <Icon name="cloud" size={40} />
        <div>
          <h3>{say(l, 'Dein Fortschritt. Auch woanders.', 'Your progress. Anywhere.')}</h3>
          <p>
            {say(
              l,
              'Ein Benutzername und ein Passwort reichen. Ohne Konto speichert dieses Gerät deinen Fortschritt automatisch.',
              'A username and password are all you need. Without an account, this device saves your progress automatically.',
            )}
          </p>
        </div>
      </div>
      {view.account.conflict ? (
        <CloudConflict view={view} />
      ) : view.account.username ? (
        <section className="signed-in">
          <div>
            <span className="account-avatar">
              {view.account.username.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <span className="eyebrow">{say(l, 'ANGEMELDET ALS', 'SIGNED IN AS')}</span>
              <h3>{view.account.username}</h3>
              <span className={`cloud-status status-${view.account.status}`}>
                <span className="status-dot" />
                {t(l, view.account.status)}
              </span>
            </div>
          </div>
          {view.account.message && <p className="fine-print">{view.account.message}</p>}
          <div className="account-actions">
            <Button
              tone="primary"
              icon="cloud"
              disabled={busy || view.account.status === 'syncing'}
              onClick={sync}
            >
              {busy || view.account.status === 'syncing' ? t(l, 'syncing') : t(l, 'sync')}
            </Button>
            <Button
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError('');
                try {
                  await game.logout();
                  setDeleteRequested(false);
                } catch (error) {
                  setError(
                    error instanceof Error
                      ? error.message
                      : say(l, 'Abmeldung fehlgeschlagen.', 'Sign out failed.'),
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              {t(l, 'logout')}
            </Button>
          </div>
          <div className="account-deletion">
            {deleteRequested ? (
              <div
                className="account-delete-confirm"
                role="group"
                aria-labelledby="account-delete-title"
              >
                <h4 id="account-delete-title">
                  {say(l, 'Konto endgültig löschen?', 'Permanently delete your account?')}
                </h4>
                <p>
                  {say(
                    l,
                    'Dein Konto und alle dazugehörigen Cloud-Spielstände werden unwiderruflich gelöscht. Die lokalen Spielstände auf diesem Gerät bleiben erhalten.',
                    'Your account and all its cloud saves will be permanently deleted. Local saves on this device are retained.',
                  )}
                </p>
                <div className="account-delete-actions">
                  <Button disabled={busy} onClick={() => setDeleteRequested(false)}>
                    {say(l, 'Abbrechen', 'Cancel')}
                  </Button>
                  <Button tone="danger" disabled={busy} onClick={() => void deleteAccount()}>
                    {busy
                      ? say(l, 'Wird gelöscht…', 'Deleting…')
                      : say(
                          l,
                          'Konto und Cloud-Spielstände löschen',
                          'Delete account and cloud saves',
                        )}
                  </Button>
                </div>
              </div>
            ) : (
              <button
                className="text-link danger-text"
                disabled={busy}
                onClick={() => setDeleteRequested(true)}
              >
                {say(l, 'Konto löschen', 'Delete account')}
              </button>
            )}
          </div>
        </section>
      ) : (
        <section className="auth-section">
          <div className="tabs">
            <button
              className={mode === 'register' ? 'selected' : ''}
              onClick={() => {
                setMode('register');
                setError('');
              }}
            >
              {t(l, 'register')}
            </button>
            <button
              className={mode === 'login' ? 'selected' : ''}
              onClick={() => {
                setMode('login');
                setError('');
              }}
            >
              {t(l, 'login')}
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <label>
              {t(l, 'username')}
              <input
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                pattern="[A-Za-z0-9_-]{3,24}"
                minLength={3}
                maxLength={24}
                required
                placeholder={say(l, 'Dein Benutzername', 'Your username')}
              />
              <small>
                {say(
                  l,
                  '3–24 Zeichen: Buchstaben, Zahlen, _ und -.',
                  '3–24 characters: letters, numbers, _ and -.',
                )}
              </small>
            </label>
            <label>
              {t(l, 'password')}
              <span className="password-field">
                <input
                  type={visible ? 'text' : 'password'}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={10}
                  maxLength={128}
                  required
                  placeholder={say(l, 'Mindestens 10 Zeichen', 'At least 10 characters')}
                />
                <IconButton
                  type="button"
                  icon="eye"
                  label={say(
                    l,
                    visible ? 'Passwort verbergen' : 'Passwort anzeigen',
                    visible ? 'Hide password' : 'Show password',
                  )}
                  onClick={() => setVisible(!visible)}
                />
              </span>
            </label>
            <Button
              type="submit"
              tone="primary"
              icon="cloud"
              disabled={busy || !view.account.available}
            >
              {busy ? say(l, 'Einen Moment…', 'One moment…') : t(l, mode)}
              <Icon name="arrow" />
            </Button>
            {!view.account.available && (
              <p className="form-warning">
                {say(
                  l,
                  'Cloudspeicherung ist auf dieser Installation noch nicht eingerichtet. Lokal spielen und Spielstände exportieren funktioniert bereits.',
                  'Cloud saving has not been configured on this installation. Local play and save export already work.',
                )}
              </p>
            )}
            <p className="fine-print">
              {say(
                l,
                'Bewahre dein Passwort sicher auf. Das Konto verwendet keine E-Mail-Adresse.',
                'Keep your password safe. This account does not use an email address.',
              )}
            </p>
          </form>
        </section>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <section className="backup-section">
        <div>
          <h4>{say(l, 'Eine Kopie für dich', 'A copy for you')}</h4>
          <p>
            {say(
              l,
              'Exportiere einen Spielstand als Datei oder importiere eine vorhandene Kopie.',
              'Export a save as a file or import an existing copy.',
            )}
          </p>
        </div>
        <div>
          <Button icon="download" disabled={!view.campaign} onClick={() => game.exportSave()}>
            {t(l, 'export')}
          </Button>
          <Button icon="upload" onClick={() => file.current?.click()}>
            {t(l, 'import')}
          </Button>
          <input
            ref={file}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => void importFile(e.currentTarget)}
          />
        </div>
      </section>
    </>
  );
}

function Slots({ view, onNew }: Props & { onNew: (slot: number) => void }) {
  const l = view.lang;
  const [deleting, setDeleting] = useState<number | null>(null),
    [error, setError] = useState('');
  const file = useRef<HTMLInputElement>(null);
  return (
    <>
      <p className="section-intro">
        {say(
          l,
          'Drei Wege durch denselben Wahnsinn. Jeder Spielstand besitzt seine eigene Klasse, Beute und Geschichte.',
          'Three paths through the same madness. Each save has its own class, loot and story.',
        )}
      </p>
      <div className="save-slot-list">
        {[0, 1, 2].map((slot) => {
          const save = view.slots.find((s) => s.slot === slot),
            cls = CLASSES.find((c) => c.id === save?.classId);
          return (
            <section key={slot} className={`save-slot ${save ? '' : 'save-slot-empty'}`}>
              <span className="slot-number">{String(slot + 1).padStart(2, '0')}</span>
              {save && cls ? (
                <>
                  <Portrait cls={cls} />
                  <div className="slot-info">
                    <span className="eyebrow">{label(cls.name, l)}</span>
                    <h3>{save.name}</h3>
                    <p>
                      {t(l, 'floor')} {save.floor} · {t(l, 'level')} {save.level}
                    </p>
                    <small>{dateText(save.updatedAt, l)}</small>
                  </div>
                  <div className="slot-actions">
                    <Button
                      tone="primary"
                      icon="play"
                      onClick={() => {
                        game.closePanel();
                        game.loadSlot(slot);
                      }}
                    >
                      {t(l, 'continue')}
                    </Button>
                    <button
                      className={`text-link ${deleting === slot ? 'danger-text' : ''}`}
                      onClick={() => {
                        if (deleting !== slot) {
                          setDeleting(slot);
                          return;
                        }
                        game.deleteSlot(slot);
                        setDeleting(null);
                      }}
                    >
                      {deleting === slot
                        ? say(l, 'Endgültig löschen', 'Permanently delete')
                        : t(l, 'delete')}
                    </button>
                    {deleting === slot && (
                      <button className="text-link" onClick={() => setDeleting(null)}>
                        {t(l, 'cancel')}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="empty-slot-symbol">
                    <Icon name="plus" size={30} />
                  </div>
                  <div className="slot-info">
                    <h3>{t(l, 'emptySlot')}</h3>
                    <p>{say(l, 'Eine neue Geschichte wartet.', 'A new story awaits.')}</p>
                  </div>
                  <Button icon="plus" onClick={() => onNew(slot)}>
                    {t(l, 'newGame')}
                  </Button>
                </>
              )}
            </section>
          );
        })}
      </div>
      <div className="slot-file-actions">
        <Button icon="download" disabled={!view.campaign} onClick={() => game.exportSave()}>
          {t(l, 'export')}
        </Button>
        <Button icon="upload" onClick={() => file.current?.click()}>
          {t(l, 'import')}
        </Button>
        <input
          ref={file}
          type="file"
          className="sr-only"
          accept="application/json,.json"
          onChange={async (e) => {
            const input = e.currentTarget;
            if (input.files?.[0]) {
              try {
                await game.importSave(input.files[0]);
              } catch (error) {
                setError(
                  error instanceof Error
                    ? error.message
                    : say(l, 'Import fehlgeschlagen.', 'Import failed.'),
                );
              }
              input.value = '';
            }
          }}
        />
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}

function SettingsPanel({ view }: Props) {
  const l = view.lang,
    s = view.settings;
  const [tab, setTab] = useState<'general' | 'accessibility' | 'controls'>('general'),
    [binding, setBinding] = useState<string | null>(null);
  const update = (patch: Partial<Settings>) => game.updateSettings(patch);
  useEffect(() => {
    if (!binding) return;
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key !== 'Escape')
        game.updateSettings({
          bindings: {
            ...game.getSnapshot().settings.bindings,
            [binding]: e.code,
          },
        });
      setBinding(null);
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [binding]);
  const checkbox = (
    id: 'shake' | 'reducedMotion' | 'highContrast' | 'autoAttack' | 'leftHanded',
    de: string,
    en: string,
    deHelp: string,
    enHelp: string,
  ) => (
    <label className="setting-row" key={id}>
      <span>
        <strong>{say(l, de, en)}</strong>
        <small>{say(l, deHelp, enHelp)}</small>
      </span>
      <span className="toggle">
        <input
          type="checkbox"
          checked={s[id]}
          onChange={(e) => update({ [id]: e.target.checked })}
        />
        <span />
      </span>
    </label>
  );
  return (
    <>
      <div className="tabs panel-tabs">
        <button className={tab === 'general' ? 'selected' : ''} onClick={() => setTab('general')}>
          {say(l, 'Allgemein', 'General')}
        </button>
        <button
          className={tab === 'accessibility' ? 'selected' : ''}
          onClick={() => setTab('accessibility')}
        >
          {t(l, 'accessibility')}
        </button>
        <button className={tab === 'controls' ? 'selected' : ''} onClick={() => setTab('controls')}>
          {t(l, 'controls')}
        </button>
      </div>
      <div className="settings-list">
        {tab === 'general' && (
          <>
            <label className="setting-row">
              <span>
                <strong>{t(l, 'language')}</strong>
                <small>{say(l, 'Du kannst jederzeit wechseln.', 'Switch at any time.')}</small>
              </span>
              <select value={l} onChange={(e) => game.setLanguage(e.target.value as Lang)}>
                <option value="de">Deutsch</option>
                <option value="en">English</option>
              </select>
            </label>
            <label className="setting-row">
              <span>
                <strong>{t(l, 'difficulty')}</strong>
                <small>
                  {say(
                    l,
                    'Story erlaubt mehr Fehler. Standard verlangt aktives Ausweichen und Vorbereitung. Herausforderung erhöht den Kampfdruck. Alle Profile enthalten die ganze Geschichte.',
                    'Story permits more mistakes. Standard requires active dodging and preparation. Challenge increases combat pressure. Every profile includes the full story.',
                  )}
                </small>
              </span>
              <select
                value={s.difficulty}
                onChange={(e) =>
                  update({
                    difficulty: e.target.value as Settings['difficulty'],
                  })
                }
              >
                {(['story', 'standard', 'challenge'] as const).map((value) => (
                  <option key={value} value={value}>
                    {t(l, value)}
                  </option>
                ))}
              </select>
            </label>
            {(['music', 'sound'] as const).map((id) => (
              <label className="setting-row" key={id}>
                <strong>{t(l, id)}</strong>
                <span className="range-control">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={s[id]}
                    onChange={(e) => update({ [id]: Number(e.target.value) })}
                  />
                  <output>{Math.round(s[id] * 100)}%</output>
                </span>
              </label>
            ))}
            <label className="setting-row">
              <span>
                <strong>{t(l, 'quality')}</strong>
                <small>
                  {say(
                    l,
                    'Sparsam reduziert Effekte, ohne Kampfregeln zu verändern.',
                    'Low reduces effects without changing combat rules.',
                  )}
                </small>
              </span>
              <select
                value={s.quality}
                onChange={(e) => update({ quality: e.target.value as Settings['quality'] })}
              >
                {(['auto', 'high', 'low'] as const).map((value) => (
                  <option key={value} value={value}>
                    {t(l, value)}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        {tab === 'accessibility' && (
          <>
            <label className="setting-row">
              <span>
                <strong>{t(l, 'textSize')}</strong>
                <small>
                  {say(
                    l,
                    'Für Dialoge, Beschreibungen und Menüs.',
                    'For dialogue, descriptions and menus.',
                  )}
                </small>
              </span>
              <span className="range-control">
                <input
                  type="range"
                  min="1"
                  max="1.5"
                  step="0.05"
                  value={s.textScale}
                  onChange={(e) => update({ textScale: Number(e.target.value) })}
                />
                <output>{Math.round(s.textScale * 100)}%</output>
              </span>
            </label>
            {checkbox(
              'reducedMotion',
              'Bewegung reduzieren',
              'Reduce motion',
              'Ruhigere Übergänge und weniger dekorative Bewegung.',
              'Calmer transitions and less decorative motion.',
            )}
            {checkbox(
              'highContrast',
              'Kontrast erhöhen',
              'Increase contrast',
              'Deutlichere Rahmen und hellere Texte.',
              'Clearer borders and brighter text.',
            )}
            {checkbox(
              'shake',
              'Kameraerschütterung',
              'Camera shake',
              'Kurze Erschütterungen bei starken Treffern.',
              'Brief shakes on powerful impacts.',
            )}
            {checkbox(
              'autoAttack',
              'Automatischer Grundangriff',
              'Auto attack',
              'Greift erreichbare Gegner automatisch an.',
              'Automatically attacks enemies in range.',
            )}
            {checkbox(
              'leftHanded',
              'Linkshändige Touchsteuerung',
              'Left-handed touch controls',
              'Vertauscht Bewegungsstick und Aktionsknöpfe.',
              'Swaps the movement stick and action buttons.',
            )}
          </>
        )}
        {tab === 'controls' && (
          <>
            <p className="section-intro">
              {say(
                l,
                'WASD und Pfeiltasten bewegen die Figur. Die Maus bestimmt die Zielrichtung. Auf Touchgeräten kannst du mehrere Knöpfe gleichzeitig bedienen. Gamepads werden automatisch erkannt.',
                'WASD and arrow keys move your character. The pointer sets aim direction. Touch devices support simultaneous buttons. Gamepads are detected automatically.',
              )}
            </p>
            {[
              ['attack', 'attack', 'Enter'],
              ['dodge', 'dodge', 'Space'],
              ['skill1', 'abilities', 'KeyQ'],
              ['skill2', 'abilities', 'KeyR'],
              ['ultimate', 'ultimate', 'KeyF'],
              ['interact', 'interact', 'KeyE'],
              ['heal', 'heal', 'KeyC'],
              ['inventory', 'inventory', 'KeyI'],
              ['journal', 'journal', 'KeyJ'],
              ['map', 'map', 'KeyM'],
              ['character', 'character', 'KeyK'],
            ].map(([id, word, fallback]) => (
              <div className="setting-row" key={id}>
                <strong>
                  {t(l, word as keyof typeof import('./i18n').words)}
                  {id === 'skill1' ? ' 1' : id === 'skill2' ? ' 2' : ''}
                </strong>
                <button
                  className={`binding-button ${binding === id ? 'binding-waiting' : ''}`}
                  onClick={() => setBinding(id)}
                >
                  {binding === id
                    ? say(l, 'Taste drücken…', 'Press a key…')
                    : (s.bindings[id] ?? fallback)
                        .replace('Key', '')
                        .replace('Digit', '')
                        .replace('Space', say(l, 'Leertaste', 'Space'))}
                </button>
              </div>
            ))}
            <p className="fine-print">
              {say(
                l,
                'Escape pausiert. Escape während einer Neubelegung bricht die Auswahl ab.',
                'Escape pauses. Press Escape while rebinding to cancel.',
              )}
            </p>
          </>
        )}
      </div>
    </>
  );
}

function Codex({ view }: Props) {
  const l = view.lang;
  const [tab, setTab] = useState<'enemies' | 'bosses' | 'items' | 'characters' | 'credits'>(
      'enemies',
    ),
    [search, setSearch] = useState(''),
    [page, setPage] = useState(0);
  const unlocked = view.campaign?.floorUnlocked ?? 1;
  const entries = useMemo(() => {
    if (tab === 'characters')
      return NPCS.filter((npc) =>
        npc.id === 'veyl' ? unlocked >= 12 : game.npcAvailable(npc.id),
      ).map((n) => ({
        id: n.id,
        name: n.name,
        description: label(n.description, l),
        floor: 0,
        hint: label(n.role, l),
        icon: 'talk' as const,
        item: undefined as ItemDef | undefined,
      }));
    if (tab === 'items')
      return ITEMS.filter((i) => i.floor <= unlocked).map((i) => ({
        id: i.id,
        name: label(i.name, l),
        description: label(i.description, l),
        floor: i.floor,
        hint: rarityName(i.rarity, l),
        icon: 'bag' as const,
        item: i,
      }));
    return FLOORS.filter((f) => f.index <= unlocked).flatMap((f) =>
      (tab === 'bosses' ? [...f.minibosses, f.boss] : [...f.mobs, ...f.elites]).map((m) => ({
        id: m.id,
        name: label(m.name, l),
        description: label(m.description, l),
        floor: f.index,
        hint:
          'role' in m
            ? `${statName(m.role, l)} · ${statName(m.element, l)}`
            : say(
                l,
                f.boss.id === m.id ? 'Hauptboss' : 'Zwischenboss',
                f.boss.id === m.id ? 'Main boss' : 'Miniboss',
              ),
        icon: 'role' in m ? ('target' as const) : ('skull' as const),
        item: undefined as ItemDef | undefined,
      })),
    );
  }, [tab, l, unlocked]);
  const filtered = entries.filter((entry) =>
    `${entry.name} ${entry.description}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="tabs panel-tabs codex-tabs">
        {(['enemies', 'bosses', 'items', 'characters', 'credits'] as const).map((value) => (
          <button
            key={value}
            className={tab === value ? 'selected' : ''}
            onClick={() => {
              setTab(value);
              setPage(0);
              setSearch('');
            }}
          >
            {t(l, value)}
          </button>
        ))}
      </div>
      {tab === 'credits' ? (
        <div className="credits-panel">
          <span className="eyebrow">BELOW THE BROADCAST</span>
          <h3>{say(l, 'Unter der Sendung.', 'Below the Broadcast.')}</h3>
          <p>
            {say(
              l,
              'Eine eigenständige Geschichte über Erinnerungen, Macht und die Entscheidung, Mensch zu bleiben. Inspiriert vom Genre des satirischen Dungeon-Abenteuers.',
              'An original story about memories, power and choosing to remain human. Inspired by the satirical dungeon-adventure genre.',
            )}
          </p>
          <dl>
            <div>
              <dt>{say(l, 'Pixelgrafik', 'Pixel art')}</dt>
              <dd>
                Foozle · Lucifer / CC0
                <br />
                DCSS Tiles / CC0
              </dd>
            </div>
            <div>
              <dt>{say(l, 'Schriften', 'Fonts')}</dt>
              <dd>
                Tiny5 · Gissio / SIL OFL 1.1
                <br />
                Inter · Rasmus Andersson / SIL OFL 1.1
              </dd>
            </div>
            <div>
              <dt>Engine</dt>
              <dd>Phaser / MIT</dd>
            </div>
            <div>
              <dt>{say(l, 'Oberfläche', 'Interface')}</dt>
              <dd>React / MIT</dd>
            </div>
          </dl>
          <div className="credit-links">
            <a href="/assets/licenses/foozle-CC0.txt" target="_blank" rel="noreferrer">
              CC0 {say(l, 'Lizenz', 'license')} ↗
            </a>
            <a href="/assets/licenses/crawl-CC0.txt" target="_blank" rel="noreferrer">
              DCSS CC0 ?
            </a>
            <a href="/assets/fonts/Tiny5-OFL.txt" target="_blank" rel="noreferrer">
              Tiny5 OFL ↗
            </a>
            <a href="/assets/fonts/Inter-OFL.txt" target="_blank" rel="noreferrer">
              Inter OFL ↗
            </a>
            <a href="https://github.com/bthginfo/Dungeon-Crawler" target="_blank" rel="noreferrer">
              GitHub ↗
            </a>
          </div>
        </div>
      ) : (
        <>
          <div className="search-row">
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              aria-label={say(l, 'Archiv durchsuchen', 'Search archive')}
              placeholder={say(l, 'Das Archiv durchsuchen…', 'Search the archive…')}
            />
            <span className="archive-count">
              {filtered.length} {say(l, 'Einträge', 'entries')}
            </span>
          </div>
          <div className="codex-list">
            {filtered.slice(page * 24, page * 24 + 24).map((entry) => (
              <article key={entry.id}>
                {entry.item ? (
                  <ItemIcon item={entry.item} />
                ) : (
                  <span className="codex-symbol">
                    <Icon name={entry.icon} size={26} />
                  </span>
                )}
                <div>
                  <span className="eyebrow">
                    {entry.floor
                      ? `${t(l, 'floor')} ${String(entry.floor).padStart(2, '0')} / `
                      : ''}
                    {entry.hint}
                  </span>
                  <h3>{entry.name}</h3>
                  <p>{entry.description}</p>
                </div>
                {view.campaign?.discovered.includes(entry.id) && (
                  <span className="discovered-tag" title={t(l, 'discovered')}>
                    <Icon name="check" size={16} />
                  </span>
                )}
              </article>
            ))}
          </div>
          {!filtered.length && (
            <Empty icon="eye" title={say(l, 'Keine Spur gefunden.', 'No trace found.')} />
          )}
          {filtered.length > 24 && (
            <div className="pagination">
              <Button icon="back" disabled={page === 0} onClick={() => setPage(page - 1)}>
                {t(l, 'back')}
              </Button>
              <span>
                {page + 1} / {Math.ceil(filtered.length / 24)}
              </span>
              <Button
                icon="arrow"
                disabled={(page + 1) * 24 >= filtered.length}
                onClick={() => setPage(page + 1)}
              >
                {say(l, 'Weiter', 'Next')}
              </Button>
            </div>
          )}
          <p className="fine-print">
            {say(
              l,
              'Mit neuen Floors wächst das Archiv.',
              'The archive grows as you unlock new floors.',
            )}
          </p>
        </>
      )}
    </>
  );
}

function DialogPanel({ view }: Props) {
  const dialog = view.dialog,
    l = view.lang;
  if (!dialog)
    return <Empty icon="talk" title={say(l, 'Der Kanal ist ruhig.', 'The channel is quiet.')} />;
  const npc = NPCS.find((def) => def.id === dialog.speaker || def.name === dialog.speaker);
  return (
    <section className="dialog-panel">
      <div
        className="dialog-speaker"
        style={{ '--class-color': npc?.color ?? '#e5b16b' } as CSSProperties}
      >
        <>
          {npc ? (
            <NpcPortrait npc={npc} />
          ) : (
            <span className="crew-monogram">{dialog.speaker.slice(0, 1)}</span>
          )}
        </>
        <div>
          <span className="eyebrow">
            {npc ? label(npc.role, l) : say(l, 'LOKALER KANAL', 'LOCAL CHANNEL')}
          </span>
          <h3>{npc?.name ?? dialog.speaker}</h3>
        </div>
        <Icon name="radio" />
      </div>
      <div className="dialog-lines">
        {dialog.lines.map((line, index) => (
          <p key={index}>{label(line, l)}</p>
        ))}
      </div>
      <div className="dialog-choices">
        {dialog.choices.map((choice, index) => (
          <button key={choice.id} onClick={() => game.chooseDialog(choice.id)}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{label(choice.label, l)}</strong>
            <Icon name="arrow" />
          </button>
        ))}
      </div>
    </section>
  );
}

export function Panels({
  view,
  onClose,
  onNewSlot,
}: Props & { onClose: () => void; onNewSlot?: (slot: number) => void }) {
  const l = view.lang,
    panel = view.panel;
  if (panel === 'none') return null;
  return (
    <Modal
      title={panel === 'dialog' && view.dialog ? label(view.dialog.title, l) : t(l, panel)}
      subtitle={
        panel === 'account'
          ? say(l, 'LOKALE KOPIE + OPTIONALE CLOUD', 'LOCAL COPY + OPTIONAL CLOUD')
          : say(l, 'DEIN KANAL. DEINE ENTSCHEIDUNG.', 'YOUR CHANNEL. YOUR CALL.')
      }
      icon={panels[panel]}
      lang={l}
      onClose={onClose}
      wide={[
        'inventory',
        'journal',
        'character',
        'shop',
        'craft',
        'codex',
        'map',
        'slots',
        'cities',
        'contracts',
        'story',
      ].includes(panel)}
      className={`panel-${panel}`}
    >
      {panel === 'inventory' && <Inventory view={view} />}
      {panel === 'journal' && <Journal view={view} />}
      {panel === 'character' && <Character view={view} />}
      {panel === 'shop' && <Market view={view} />}
      {panel === 'craft' && <Market view={view} crafting />}
      {panel === 'settings' && <SettingsPanel view={view} />}
      {panel === 'account' && <Account view={view} />}
      {panel === 'slots' && (
        <Slots
          view={view}
          onNew={(slot) => {
            onClose();
            onNewSlot?.(slot);
          }}
        />
      )}
      {panel === 'codex' && <Codex view={view} />}
      {panel === 'dialog' && <DialogPanel view={view} />}
      {panel === 'cities' && <CitiesPanel view={view} />}
      {panel === 'contracts' && <ContractsPanel view={view} />}
      {panel === 'story' && <StoryPanel view={view} />}
      {panel === 'map' && (
        <div className="map-panel">
          <DungeonMap lang={l} large />
          <div className="map-legend">
            <span>
              <i className="legend-player" />
              {say(l, 'Du', 'You')}
            </span>
            {view.phase === 'town' ? (
              <>
                <span>
                  <i className="legend-npc" />
                  {say(l, 'Bewohner & Auftraggeber', 'Residents & quest givers')}
                </span>
                <span>
                  <i className="legend-services" />
                  {say(l, 'Markt & Werkstatt', 'Market & workshop')}
                </span>
              </>
            ) : (
              <>
                <span>
                  <i className="legend-boss" />
                  {say(l, 'Boss', 'Boss')}
                </span>
                <span>
                  <i className="legend-guardian" />
                  {say(l, 'Wächter', 'Guardian')}
                </span>
                <span>
                  <i className="legend-hunt" />
                  {say(l, 'Jagd', 'Hunt')}
                </span>
              </>
            )}
            <span>
              <i className="legend-exit" />
              {view.phase === 'town'
                ? say(l, 'Reisetor', 'Travel gate')
                : say(l, 'Ausgang', 'Exit')}
            </span>
            <span>
              <i className="legend-fountain" />
              {view.phase === 'town' ? say(l, 'Klinik', 'Clinic') : say(l, 'Brunnen', 'Fountain')}
            </span>
          </div>
          <p className="fine-print">
            {view.phase === 'town'
              ? say(
                  l,
                  'Die Nummern führen zu den Bewohnern unten. Erkunde die Viertel zu Fuß und sprich mit Auftraggebern vor Ort, um Aufträge anzunehmen oder abzugeben. Das Reisetor führt zur Expeditionsvorbereitung.',
                  'The numbers locate the residents listed below. Explore on foot and speak to quest givers in person to accept or turn in contracts. The travel gate leads to expedition preparation.',
                )
              : say(
                  l,
                  'Nur erkundete Räume werden angezeigt. Der Wächter öffnet den Weg zum Hauptboss. Der Ausgang wird nach dessen Niederlage aktiv.',
                  'Only explored rooms are shown. The guardian opens the way to the main boss. The exit activates after its defeat.',
                )}
          </p>
          {view.phase === 'town' && (
            <section className="city-map-directory">
              <h3>{say(l, 'Menschen & Anlaufstellen', 'People & places')}</h3>
              <ol className="city-map-contacts">
                {getCityMapContacts().map(({ object, npc, room }, index) => (
                  <li key={object.id}>
                    <span className="contact-map-number">{index + 1}</span>
                    <div>
                      <strong>{npc.name}</strong>
                      <span>
                        {npc.id === 'nix'
                          ? say(l, 'Folgt dir', 'Follows you')
                          : room.district
                            ? label(room.name, l)
                            : say(l, 'Zentralplatz', 'Central square')}
                      </span>
                      <small>{label(npc.role, l)}</small>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
          {view.phase === 'playing' && (game.world.modifiers?.length ?? 0) > 0 && (
            <section className="run-conditions">
              <h3>{say(l, 'Bedingungen dieser Expedition', 'Conditions of this expedition')}</h3>
              {RUN_MODIFIERS.filter((modifier) => game.world.modifiers?.includes(modifier.id)).map(
                (modifier) => (
                  <div key={modifier.id}>
                    <Icon name="radio" size={18} />
                    <div>
                      <strong>{label(modifier.name, l)}</strong>
                      <p>{label(modifier.description, l)}</p>
                    </div>
                  </div>
                ),
              )}
            </section>
          )}
        </div>
      )}
    </Modal>
  );
}
