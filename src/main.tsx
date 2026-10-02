import React, { useEffect, useRef } from 'react';
import { createRoot, type Root as ReactRoot } from 'react-dom/client';
import App from './ui/App';
import './ui/styles.css';
import { createRenderer } from './game/renderer';
import { game } from './game/controller';
function Root() {
  const created = useRef(false);
  useEffect(() => {
    if (created.current) return;
    created.current = true;
    const host = document.getElementById('game-canvas');
    if (!host) throw new Error('The game canvas mount is missing.');
    const renderer = createRenderer(host);
    return () => {
      renderer.destroy();
      created.current = false;
    };
  }, []);
  return <App />;
}
const root =
  (import.meta.hot?.data.root as ReactRoot | undefined) ??
  createRoot(document.getElementById('root')!);
root.render(<Root />);
if (import.meta.hot)
  import.meta.hot.dispose((data) => {
    root.render(null);
    data.root = root;
  });
if (import.meta.env.DEV) Object.assign(window, { __broadcast: game });
if (import.meta.env.PROD && 'serviceWorker' in navigator)
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => {
      /* Local saves do not depend on worker installation. */
    });
  });
