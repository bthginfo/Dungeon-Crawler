import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import { game } from '../game/controller';
import { CLASSES, FLOORS } from '../content';
import type { AbilityDef, GameView, Lang } from '../game/types';
import { Button, IconButton, Meter, Portrait } from './common';
import { Icon } from './icons';
import type { IconName } from './icons';
import { label, say, statName, t } from './i18n';

export function DungeonMap({ lang, large = false }: { lang: Lang; large?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const draw = () => {
      const canvas = ref.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const w = game.world,
        floor = FLOORS.find((f) => f.index === w.floor);
      const width = canvas.width,
        height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#131b1b';
      ctx.fillRect(0, 0, width, height);
      if (!w.width || !w.height) return;
      const scale = Math.min((width - 20) / w.width, (height - 20) / w.height);
      const ox = (width - w.width * scale) / 2,
        oy = (height - w.height * scale) / 2;
      ctx.strokeStyle = '#34403c';
      ctx.lineWidth = 1;
      for (const room of w.rooms) {
        if (!room.visited) continue;
        ctx.fillStyle = room.id === w.roomId ? '#405345' : room.cleared ? '#2b3d34' : '#2b3330';
        ctx.fillRect(ox + room.x * scale, oy + room.y * scale, room.w * scale, room.h * scale);
        ctx.strokeRect(
          ox + room.x * scale + 0.5,
          oy + room.y * scale + 0.5,
          room.w * scale - 1,
          room.h * scale - 1,
        );
        if (['boss', 'guardian', 'hunt'].includes(room.kind)) {
          ctx.fillStyle =
            room.kind === 'boss' ? '#da795e' : room.kind === 'hunt' ? '#a68dd5' : '#e5b16b';
          const x = ox + (room.x + room.w / 2) * scale,
            y = oy + (room.y + room.h / 2) * scale;
          ctx.beginPath();
          ctx.moveTo(x, y - 3);
          ctx.lineTo(x + 3, y);
          ctx.lineTo(x, y + 3);
          ctx.lineTo(x - 3, y);
          ctx.closePath();
          ctx.fill();
        }
      }
      for (const object of w.objects) {
        if (!w.rooms.find((room) => room.id === object.room)?.visited || !object.active) continue;
        ctx.fillStyle =
          object.type === 'exit'
            ? '#8ce2b7'
            : object.type === 'fountain'
              ? '#69b8d2'
              : (floor?.colors.accent ?? '#e5b16b');
        ctx.fillRect(ox + (object.x / 32) * scale - 1.5, oy + (object.y / 32) * scale - 1.5, 3, 3);
      }
      ctx.fillStyle = '#f8edd7';
      const x = ox + (w.player.x / 32) * scale,
        y = oy + (w.player.y / 32) * scale;
      ctx.beginPath();
      ctx.arc(x, y, large ? 4 : 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8ce2b7';
      ctx.beginPath();
      ctx.arc(x, y, large ? 7 : 5, 0, Math.PI * 2);
      ctx.stroke();
    };
    draw();
    const timer = window.setInterval(draw, 140);
    return () => window.clearInterval(timer);
  }, [large]);
  return (
    <canvas
      ref={ref}
      width={large ? 740 : 220}
      height={large ? 460 : 144}
      className={`dungeon-map ${large ? 'dungeon-map-large' : ''}`}
      role="img"
      aria-label={say(
        lang,
        'Besuchte Räume und aktuelle Spielerposition',
        'Visited rooms and current player position',
      )}
    />
  );
}

function Joystick({ lang }: { lang: Lang }) {
  const root = useRef<HTMLDivElement>(null),
    pointer = useRef<number | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const update = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = root.current?.getBoundingClientRect();
    if (!bounds) return;
    const radius = bounds.width * 0.35,
      dx = event.clientX - bounds.left - bounds.width / 2,
      dy = event.clientY - bounds.top - bounds.height / 2;
    const length = Math.sqrt(dx * dx + dy * dy),
      factor = length > radius ? radius / length : 1;
    const x = dx * factor,
      y = dy * factor;
    game.input.moveX = Math.abs(x) < radius * 0.1 ? 0 : x / radius;
    game.input.moveY = Math.abs(y) < radius * 0.1 ? 0 : y / radius;
    if (length > radius * 0.15) {
      game.input.aimX = game.world.player.x + game.input.moveX * 300;
      game.input.aimY = game.world.player.y + game.input.moveY * 300;
    }
    setOffset({ x, y });
  };
  const stop = () => {
    pointer.current = null;
    game.input.moveX = 0;
    game.input.moveY = 0;
    setOffset({ x: 0, y: 0 });
  };
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (pointer.current === null) return;
      game.input.aimX = game.world.player.x + game.input.moveX * 300;
      game.input.aimY = game.world.player.y + game.input.moveY * 300;
    }, 50);
    window.addEventListener('blur', stop);
    return () => {
      stop();
      window.clearInterval(timer);
      window.removeEventListener('blur', stop);
    };
  }, []);
  return (
    <div
      ref={root}
      className="touch-joystick"
      role="application"
      aria-label={t(lang, 'movement')}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={(e) => {
        if (pointer.current !== null) return;
        e.preventDefault();
        pointer.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e);
      }}
      onPointerMove={(e) => {
        if (pointer.current === e.pointerId) {
          e.preventDefault();
          update(e);
        }
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={stop}
    >
      <span className="joystick-ring" />
      <span
        className="joystick-center"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
      />
      <span className="joystick-label">{t(lang, 'movement')}</span>
    </div>
  );
}

const abilityIcon = (a: AbilityDef | undefined): IconName =>
  !a
    ? 'sword'
    : a.kind === 'shield'
      ? 'shield'
      : a.kind === 'heal'
        ? 'heart'
        : a.kind === 'dash'
          ? 'dodge'
          : a.kind === 'trap' || a.kind === 'turret'
            ? 'target'
            : a.kind === 'curse' || a.kind === 'mark'
              ? 'eye'
              : 'bolt';

function Action({
  icon,
  name,
  keycap,
  cooldown = 0,
  color,
  progress,
  action,
  compact = false,
  description,
  shortName,
}: {
  icon: IconName;
  name: string;
  keycap?: string;
  cooldown?: number;
  color?: string;
  progress?: number;
  action: 'attack' | 'dodge' | 'skill1' | 'skill2' | 'ultimate' | 'heal';
  compact?: boolean;
  description?: string;
  shortName?: string;
}) {
  const unavailable = cooldown > 0 || (action === 'ultimate' && (progress ?? 0) < 100);
  return (
    <button
      className={`action-button ${action === 'ultimate' ? 'action-ultimate' : ''} ${compact ? 'action-compact' : ''} ${unavailable ? 'action-cooling' : ''}`}
      aria-label={name}
      title={description ?? name}
      disabled={unavailable}
      style={{ '--action-color': color ?? '#e5b16b' } as CSSProperties}
      onClick={() => game.requestAction(action)}
    >
      {progress !== undefined && (
        <span
          className="action-progress"
          style={{ height: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      )}
      <Icon name={icon} size={compact ? 22 : 27} />
      <span className="action-name">{shortName ?? name}</span>
      {keycap && <kbd>{keycap}</kbd>}
      {cooldown > 0 && (
        <span className="cooldown-number">
          {Math.ceil(cooldown)}
          <small>s</small>
        </span>
      )}
      {action === 'ultimate' && progress !== undefined && progress < 100 && (
        <span className="ultimate-percent">{Math.floor(progress)}%</span>
      )}
    </button>
  );
}

function TouchActions({
  view,
  ability1,
  ability2,
}: {
  view: GameView;
  ability1?: AbilityDef;
  ability2?: AbilityDef;
}) {
  const attackId = useRef<number | null>(null),
    l = view.lang;
  const stopAttack = () => {
    attackId.current = null;
    game.input.attacking = false;
  };
  useEffect(() => () => stopAttack(), []);
  return (
    <div className="touch-actions">
      <button
        className="touch-action touch-attack"
        aria-label={t(l, 'attack')}
        onContextMenu={(e) => e.preventDefault()}
        onPointerDown={(e) => {
          e.preventDefault();
          attackId.current = e.pointerId;
          e.currentTarget.setPointerCapture(e.pointerId);
          game.input.attacking = true;
          game.requestAction('attack');
        }}
        onPointerUp={stopAttack}
        onPointerCancel={stopAttack}
        onLostPointerCapture={stopAttack}
      >
        <Icon name="sword" size={32} />
        <span>{t(l, 'attack')}</span>
      </button>
      <Action
        icon="dodge"
        name={t(l, 'dodge')}
        action="dodge"
        cooldown={view.cooldowns.dodge ?? 0}
        compact
        shortName={say(l, 'Rolle', 'Dodge')}
      />
      <Action
        icon={abilityIcon(ability1)}
        name={label(ability1?.name, l)}
        action="skill1"
        cooldown={view.cooldowns[ability1?.id ?? ''] ?? 0}
        color={ability1?.color}
        compact
        shortName="1"
      />
      <Action
        icon={abilityIcon(ability2)}
        name={label(ability2?.name, l)}
        action="skill2"
        cooldown={view.cooldowns[ability2?.id ?? ''] ?? 0}
        color={ability2?.color}
        compact
        shortName="2"
      />
      <Action
        icon="crown"
        name={t(l, 'ultimate')}
        action="ultimate"
        progress={view.ultimate}
        compact
        shortName="ULT"
      />
      <Action icon="flask" name={t(l, 'heal')} action="heal" compact />
    </div>
  );
}

export function Hud({ view, onHelp }: { view: GameView; onHelp: () => void }) {
  const l = view.lang,
    c = view.campaign;
  const [questCollapsed, setQuestCollapsed] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(any-pointer: coarse) and (max-height: 500px)').matches,
  );
  useEffect(() => {
    const compactLandscape = window.matchMedia('(any-pointer: coarse) and (max-height: 500px)');
    const adapt = () => {
      if (compactLandscape.matches) setQuestCollapsed(true);
    };
    compactLandscape.addEventListener('change', adapt);
    return () => compactLandscape.removeEventListener('change', adapt);
  }, []);
  const cls = CLASSES.find((def) => def.id === c?.classId) ?? CLASSES[0],
    floor = FLOORS.find((def) => def.index === view.floor);
  if (!c || !cls) return null;
  const ability1 = cls.abilities.find((a) => a.id === c.skills[0]) ?? cls.abilities[0],
    ability2 = cls.abilities.find((a) => a.id === c.skills[1]) ?? cls.abilities[1];
  const binding = (name: string, fallback: string) =>
    view.settings.bindings[name]?.replace('Key', '').replace('Digit', '').replace('Space', '␣') ??
    fallback;
  const questCount = c.questProgress[view.quest?.id ?? '']?.count ?? 0;
  return (
    <div className="game-hud">
      <section className="player-frame">
        <Portrait cls={cls} size="small" />
        <div className="player-vitals">
          <div className="player-name">
            <strong>{c.name}</strong>
            <span>
              {t(l, 'level')} {c.level}
            </span>
          </div>
          <Meter value={view.hp} max={view.maxHp} label={t(l, 'life')} />
          <Meter
            value={view.resource}
            max={view.maxResource}
            tone="resource"
            label={t(l, 'resource')}
          />
          {view.shield > 0 && (
            <span className="shield-label">
              <Icon name="shield" size={12} />
              {Math.round(view.shield)}
            </span>
          )}
          <div className="xp-line">
            <span>{c.xp} XP</span>
            <span>{label(cls.name, l)}</span>
          </div>
        </div>
      </section>
      <section className="hud-location">
        <div>
          <span className="eyebrow">
            {t(l, 'floor')} {String(view.floor).padStart(2, '0')}
          </span>
          <h2>{label(floor?.name, l)}</h2>
        </div>
        <span className="hud-live">
          <span className="live-dot" />
          LIVE
        </span>
      </section>
      <aside className="hud-minimap">
        <button aria-label={t(l, 'map')} onClick={() => game.openPanel('map')}>
          <DungeonMap lang={l} />
          <span>
            {game.world.rooms.filter((room) => room.visited).length} / {game.world.rooms.length}{' '}
            {say(l, 'Räume', 'rooms')}
            <Icon name="map" size={14} />
          </span>
        </button>
      </aside>
      <nav className="hud-utilities" aria-label={say(l, 'Spielmenüs', 'Game menus')}>
        <IconButton
          icon="bag"
          label={`${t(l, 'inventory')} [I]`}
          onClick={() => game.openPanel('inventory')}
        />
        <IconButton
          icon="book"
          label={`${t(l, 'journal')} [J]`}
          onClick={() => game.openPanel('journal')}
        />
        <IconButton
          icon="person"
          label={t(l, 'character')}
          onClick={() => game.openPanel('character')}
        />
        <IconButton
          icon="pause"
          label={`${t(l, 'pause')} [Esc]`}
          onClick={() => game.pause(true)}
        />
      </nav>
      {view.boss && (
        <section className="boss-frame">
          <div>
            <Icon name="skull" size={18} />
            <h2>{label(view.boss.name, l)}</h2>
            <span>
              {say(l, 'Phase', 'Phase')} {view.boss.phase + 1}
            </span>
          </div>
          <Meter
            value={view.boss.hp}
            max={view.boss.maxHp}
            tone="boss"
            label={label(view.boss.name, l)}
            showNumber={false}
          />
        </section>
      )}
      {view.quest && (
        <aside className={`hud-quest ${questCollapsed ? 'quest-collapsed' : ''}`}>
          <button
            className="quest-header"
            onClick={() => setQuestCollapsed(!questCollapsed)}
            aria-expanded={!questCollapsed}
            aria-controls="current-objective-details"
          >
            <Icon name="target" size={15} />
            <span>{say(l, 'AKTUELLES ZIEL', 'CURRENT OBJECTIVE')}</span>
            <span>{questCollapsed ? '+' : '−'}</span>
          </button>
          {!questCollapsed && (
            <div
              id="current-objective-details"
              className="quest-details"
              tabIndex={0}
              aria-label={label(view.quest.name, l)}
            >
              <h3>{label(view.quest.name, l)}</h3>
              <p>{label(view.quest.description, l)}</p>
              <div className="quest-progress">
                <span
                  style={{
                    width: `${Math.min(100, (questCount / Math.max(1, view.quest.target)) * 100)}%`,
                  }}
                />
              </div>
              <span className="quest-count">
                {Math.min(questCount, view.quest.target)} / {view.quest.target}
              </span>
            </div>
          )}
        </aside>
      )}
      <div className="hud-statuses">
        {game.world.player.statuses.map((status, index) => (
          <span
            key={`${status.element}-${index}`}
            className={`status-chip status-${status.element}`}
          >
            <Icon name={status.element === 'shield' ? 'shield' : 'bolt'} size={12} />
            {statName(status.element, l)}
          </span>
        ))}
      </div>
      {view.interaction && (
        <Button className="interaction-prompt" icon="talk" onClick={() => game.interact()}>
          <kbd>{binding('interact', 'E')}</kbd>
          {label(view.interaction, l)}
        </Button>
      )}
      <div className="ability-deck">
        <Action
          icon="sword"
          name={t(l, 'primary')}
          action="attack"
          keycap={binding('attack', '↵')}
          description={t(l, 'attack')}
        />
        <Action
          icon="dodge"
          name={t(l, 'dodge')}
          action="dodge"
          keycap={binding('dodge', '␣')}
          cooldown={view.cooldowns.dodge ?? 0}
        />
        <span className="deck-divider" />
        <Action
          icon={abilityIcon(ability1)}
          name={label(ability1?.name, l)}
          action="skill1"
          keycap={binding('skill1', 'Q')}
          cooldown={view.cooldowns[ability1?.id ?? ''] ?? 0}
          color={ability1?.color}
          description={label(ability1?.description, l)}
        />
        <Action
          icon={abilityIcon(ability2)}
          name={label(ability2?.name, l)}
          action="skill2"
          keycap={binding('skill2', 'R')}
          cooldown={view.cooldowns[ability2?.id ?? ''] ?? 0}
          color={ability2?.color}
          description={label(ability2?.description, l)}
        />
        <Action
          icon="crown"
          name={label(cls.ultimate.name, l)}
          action="ultimate"
          keycap={binding('ultimate', 'F')}
          progress={view.ultimate}
          color={cls.color}
          description={label(cls.ultimate.description, l)}
        />
        <span className="deck-divider" />
        <Action icon="flask" name={t(l, 'heal')} action="heal" keycap={binding('heal', 'C')} />
      </div>
      <div className="hud-bottom">
        <span>
          <Icon name="anvil" size={14} />
          {c.scrap} <span className="unbanked-currency">+{c.runScrap}</span>
        </span>
        <span>
          {say(l, 'Expedition', 'Expedition')} #{c.run}
        </span>
        <button
          onClick={() => {
            game.pause(true);
            onHelp();
          }}
        >
          {say(l, 'Steuerung & Ziele', 'Controls & objectives')} <span>?</span>
        </button>
      </div>
      {!view.paused && view.panel === 'none' && (
        <div className="touch-controls">
          <Joystick lang={l} />
          <TouchActions view={view} ability1={ability1} ability2={ability2} />
        </div>
      )}
    </div>
  );
}
