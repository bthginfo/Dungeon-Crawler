import type { CSSProperties } from 'react';

const paths = {
  sword: 'm5 19 14-14 1-4-4 1L2 16m1-2 7 7m-4-4-4 4',
  shield: 'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6Z M8 11l3 3 5-6',
  heart: 'M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-5 5 2 10 8 15 6-5 13-10 8-15Z',
  bolt: 'm13 2-9 12h7l-1 8 10-13h-7Z',
  book: 'M3 3h7l2 2 2-2h7v16h-7l-2 2-2-2H3Z M12 5v16 M6 7h3 M15 7h3 M6 11h3 M15 11h3',
  map: 'm2 5 7-3 6 3 7-3v17l-7 3-6-3-7 3Z M9 2v17 M15 5v17',
  bag: 'M5 7h14l2 14H3Z M8 7V5a4 4 0 0 1 8 0v2 M8 12h8',
  gear: 'm9 2-1 3-3 1-3 3 2 3-2 3 3 3 3 1 1 3h6l1-3 3-1 3-3-2-3 2-3-3-3-3-1-1-3Z M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0',
  close: 'm6 6 12 12 M18 6 6 18',
  arrow: 'M3 12h18 m-7-7 7 7-7 7',
  back: 'M21 12H3 m7-7-7 7 7 7',
  check: 'm4 12 5 5L20 6',
  person: 'M8 6a4 4 0 1 0 8 0 4 4 0 1 0-8 0 M4 22v-3a8 8 0 0 1 16 0v3Z',
  cloud: 'M6 19h13a4 4 0 0 0 0-8 7 7 0 0 0-14-1 5 5 0 0 0 1 9 M9 15l3-3 3 3 M12 12v9',
  download: 'M12 2v14 m-5-5 5 5 5-5 M3 18v4h18v-4',
  upload: 'M12 17V3 m-5 5 5-5 5 5 M3 18v4h18v-4',
  play: 'm7 3 15 9L7 21Z',
  pause: 'M6 3h4v18H6Z M14 3h4v18h-4Z',
  flask: 'M9 2h6 M10 2v7L4 19v3h16v-3L14 9V2 M7 15h10',
  skull: 'M4 10a8 8 0 0 1 16 0v6l-4 2v4H8v-4l-4-2Z M7 10v3h3v-3Z M14 10v3h3v-3Z M12 16v6',
  crown: 'm2 6 5 4 5-7 5 7 5-4-3 14H5Z M5 16h14',
  target:
    'M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0 M7 12a5 5 0 1 0 10 0 5 5 0 1 0-10 0 M12 10v4 M10 12h4',
  shop: 'M3 9h18l-3-7H6Z M4 9v13h16V9 M8 22v-8h8v8',
  anvil: 'M2 5h20l-5 5h-3v6l5 4v2H5v-2l5-4v-6H5Z',
  talk: 'M2 3h20v14H9l-6 5v-5H2Z M6 8h12 M6 12h8',
  radio: 'M2 8h20v14H2Z M5 12h7v6H5Z M16 12h3 M16 16h3 M6 8l12-6',
  eye: 'M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8Z M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0',
  lock: 'M5 10h14v12H5Z M8 10V6a4 4 0 0 1 8 0v4 M12 14v4',
  globe: 'M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0 M12 2c-6 6-6 14 0 20 6-6 6-14 0-20 M2 12h20',
  spark: 'm12 1 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z',
  dodge: 'm16 2-5 4 2 5-6 4-3 6 M11 6l-5-1-4 4 M13 11l6 2 3 7 M19 3l-1 2',
  plus: 'M12 3v18 M3 12h18',
  grid: 'M3 3h7v7H3Z M14 3h7v7h-7Z M3 14h7v7H3Z M14 14h7v7h-7Z',
  leaf: 'M3 21 18 6 M3 17C2 5 9 2 22 2c0 14-4 20-16 18 M10 14v-6 M10 14h7',
} as const;
export type IconName = keyof typeof paths;
export function Icon({
  name,
  size = 20,
  className = '',
  style,
}: {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={`icon ${className}`}
      style={style}
    >
      <path d={paths[name]} />
    </svg>
  );
}
