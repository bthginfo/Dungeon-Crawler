import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../dist/', import.meta.url));
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const path = join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(path)));
    else if (!e.name.endsWith('.map') && e.name !== 'sw.js') files.push(path);
  }
  return files;
}
const assetPath = (path) => '/' + relative(root, path).replaceAll('\\', '/');
const paths = (await walk(root)).sort((a, b) => (assetPath(a) < assetPath(b) ? -1 : 1)),
  hash = createHash('sha256');
hash.update(await readFile(fileURLToPath(import.meta.url)));
for (const p of paths)
  hash
    .update(assetPath(p))
    .update('\0')
    .update(await readFile(p));
const version = hash.digest('hex').slice(0, 12),
  assets = paths.map(assetPath);
// Static files are shared by every client. Vary: Origin must not make module
// requests miss responses that were precached without an Origin header.
const worker = `const CACHE='broadcast-${version}'; const ASSETS=${JSON.stringify(['/', ...assets])};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS.map(url=>new Request(new URL(url,self.location.origin),{cache:'reload'}))))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('broadcast-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;event.respondWith(caches.open(CACHE).then(async cache=>{const match=await cache.match(event.request,{ignoreSearch:true,ignoreVary:true});if(match)return match;try{const response=await fetch(event.request);return response;}catch{if(event.request.mode==='navigate')return cache.match('/index.html');throw new Error('Offline asset unavailable');}}));});
`;
await writeFile(join(root, 'sw.js'), worker);
console.log(`Offline package ${version}: ${assets.length} files.`);
