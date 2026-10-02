import { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { ClassDef, ItemDef, Lang, NpcDef } from '../game/types';
import { Icon } from './icons';
import type { IconName } from './icons';
import { label, t } from './i18n';

export function Button({
  children,
  icon,
  tone = 'plain',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: IconName;
  tone?: 'plain' | 'primary' | 'danger' | 'quiet';
}) {
  return (
    <button {...props} className={`button button-${tone} ${className}`}>
      {icon && <Icon name={icon} />}
      <span>{children}</span>
    </button>
  );
}

export function IconButton({
  icon,
  label: title,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: IconName;
  label: string;
}) {
  return (
    <button
      {...props}
      className={`icon-button ${props.className ?? ''}`}
      aria-label={title}
      title={title}
    >
      <Icon name={icon} />
    </button>
  );
}

export function Portrait({
  cls,
  size = 'normal',
  active = false,
}: {
  cls: ClassDef;
  size?: 'small' | 'normal' | 'large';
  active?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className={`portrait portrait-${size} ${active ? 'portrait-active' : ''}`}
      style={{ '--class-color': cls.color } as CSSProperties}
    >
      {!failed && (
        <img src={`/assets/portraits/${cls.id}.png`} alt="" onError={() => setFailed(true)} />
      )}
      {failed && <Icon name={cls.ranged ? 'bolt' : 'sword'} size={size === 'large' ? 64 : 28} />}
      <span className="portrait-corner" />
    </span>
  );
}

export function NpcPortrait({ npc }: { npc: NpcDef }) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className="crew-monogram npc-portrait"
      style={{ '--class-color': npc.color } as CSSProperties}
    >
      {failed ? (
        npc.name.slice(0, 1)
      ) : (
        <img src={`/assets/portraits/npc-${npc.id}.png`} alt="" onError={() => setFailed(true)} />
      )}
    </span>
  );
}

export function ItemIcon({ item, size = 'normal' }: { item: ItemDef; size?: 'normal' | 'large' }) {
  const groups: Record<string, { start: number; count: number }> = {
    weapon: { start: 0, count: 24 },
    offhand: { start: 24, count: 8 },
    head: { start: 32, count: 8 },
    body: { start: 40, count: 12 },
    hands: { start: 52, count: 8 },
    feet: { start: 60, count: 8 },
    amulet: { start: 68, count: 8 },
    talisman: { start: 76, count: 8 },
    relic: { start: 84, count: 16 },
    consumable: { start: 100, count: 20 },
    key: { start: 120, count: 8 },
  };
  const group = groups[item.kind === 'gear' ? (item.slot ?? 'weapon') : item.kind];
  const index = group.start + (Math.abs(Math.floor(item.icon)) % group.count);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [index]);
  const fallback: IconName =
    item.kind === 'consumable'
      ? 'flask'
      : item.kind === 'relic'
        ? 'spark'
        : item.kind === 'key'
          ? 'lock'
          : item.slot === 'weapon'
            ? 'sword'
            : 'shield';
  return (
    <span className={`item-icon rarity-${item.rarity} item-icon-${size}`}>
      {!failed ? (
        <img src={`/assets/items/${index}.png?v=1`} alt="" onError={() => setFailed(true)} />
      ) : (
        <Icon name={fallback} size={size === 'large' ? 32 : 22} />
      )}
    </span>
  );
}

export function Meter({
  value,
  max,
  tone = 'life',
  label: title,
  showNumber = true,
}: {
  value: number;
  max: number;
  tone?: string;
  label: string;
  showNumber?: boolean;
}) {
  const ratio = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div
      className={`meter meter-${tone}`}
      role="progressbar"
      aria-label={title}
      aria-valuenow={Math.round(value)}
      aria-valuemax={Math.round(max)}
      aria-valuemin={0}
    >
      <span className="meter-fill" style={{ width: `${ratio}%` }} />
      {showNumber && (
        <span className="meter-text">
          {Math.round(value)} <span>/ {Math.round(max)}</span>
        </span>
      )}
    </div>
  );
}

export function Modal({
  title,
  subtitle,
  icon,
  lang,
  children,
  onClose,
  wide = false,
  className = '',
  footer,
}: {
  title: string;
  subtitle?: string;
  icon?: IconName;
  lang: Lang;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
  className?: string;
  footer?: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const node = root.current;
    const hidden: {
      element: HTMLElement;
      inert: boolean;
      ariaHidden: string | null;
    }[] = [];
    let ancestor = node?.parentElement ?? null;
    while (ancestor && ancestor !== document.body) {
      const parent: HTMLElement | null = ancestor.parentElement;
      if (!parent) break;
      for (const sibling of parent.children) {
        if (
          sibling === ancestor ||
          !(sibling instanceof HTMLElement) ||
          sibling.hasAttribute('aria-live') ||
          ['SCRIPT', 'STYLE', 'LINK'].includes(sibling.tagName)
        )
          continue;
        hidden.push({
          element: sibling,
          inert: sibling.inert,
          ariaHidden: sibling.getAttribute('aria-hidden'),
        });
        sibling.inert = true;
        sibling.setAttribute('aria-hidden', 'true');
      }
      ancestor = parent;
    }
    const timer = window.setTimeout(
      () =>
        node
          ?.querySelector<HTMLElement>('[autofocus], button, input, select, [tabindex="0"]')
          ?.focus(),
      10,
    );
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
      }
      if (event.key !== 'Tab' || !node) return;
      const focusable = [
        ...node.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], textarea:not(:disabled), [tabindex="0"]',
        ),
      ].filter((el) => el.offsetParent !== null);
      if (!focusable.length) {
        event.preventDefault();
        return;
      }
      const first = focusable[0],
        last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', keyHandler, true);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', keyHandler, true);
      for (const { element, inert, ariaHidden } of hidden) {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute('aria-hidden');
        else element.setAttribute('aria-hidden', ariaHidden);
      }
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <div
      className={`modal-backdrop ${className}`}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={root}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        className={`modal ${wide ? 'modal-wide' : ''}`}
      >
        <header className="modal-header">
          <div className="modal-heading">
            {icon && <Icon name={icon} size={26} />}
            <div>
              {subtitle && <p className="eyebrow">{subtitle}</p>}
              <h2 id={id}>{title}</h2>
            </div>
          </div>
          <IconButton icon="close" label={t(lang, 'close')} onClick={onClose} />
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-footer">{footer}</footer>}
        <div className="modal-edge" aria-hidden="true">
          <span>BTB / ARCHIVE TERMINAL</span>
          <span>●</span>
        </div>
      </div>
    </div>
  );
}

export function Empty({
  icon = 'radio',
  title,
  children,
}: {
  icon?: IconName;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <Icon name={icon} size={42} />
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}

export function TextBlock({ text, lang }: { text: { de: string; en: string }; lang: Lang }) {
  return <p className="prose">{label(text, lang)}</p>;
}
