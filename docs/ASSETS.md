# Pixel art and asset provenance

The game ships selected local files only. It never hotlinks an artist's server or
downloads entire third-party packs while a player is playing. No paid assets,
noncommercial packs, copied book characters, or unverified screenshot rips are
included. The original world, story, classes and broadcast props belong to this
project. The imported artwork below is published under CC0-1.0.

## Imported sources

All Lucifer Collection packs were acquired through the author's normal public
**zero-price “Download now” flow** on 2026-10-02. The source pages explicitly
permit modifications and commercial projects under CC0. The artist is **David /
chroma_dave**, commissioned and distributed by **Foozle**.

| Source | Integrated material |
|---|---|
| [Lucifer Dungeon](https://foozlecc.itch.io/lucifer-dungeon-tileset) | 32px floor and brick-wall material, banners, statues, pillars, rug, doors and grates |
| [Lucifer Exterior](https://foozlecc.itch.io/lucifer-exterior-tileset) | Grass and rock-wall material for the Mycelium Newsroom |
| [Lucifer Desert](https://foozlecc.itch.io/lucifer-desert-tileset) | Wooden material for the gallery/clockwork floors and campfire animation |
| [Lucifer Lava Dungeon](https://foozlecc.itch.io/lucifer-lava-dungeon-tileset) | Forge-floor bricks, forge walls and torch animation |
| [Lucifer Warrior](https://foozlecc.itch.io/lucifer-warrior) | Four-direction idle, walk, attack, hurt and death animations; class portrait |
| [Lucifer Sorceress](https://foozlecc.itch.io/lucifer-sorceress) | Four-direction idle, run, attack, hurt and death animations; class portrait |
| [Lucifer Necromancer](https://foozlecc.itch.io/lucifer-necromancer) | Four-direction idle, run, attack, hurt and death animations; class portrait |
| [Lucifer Skeleton Hunter](https://foozlecc.itch.io/lucifer-skeleton-hunter-enemy) | Four-direction animated ranged enemy and Trail Hunter base |
| [Lucifer Skeleton King](https://foozlecc.itch.io/lucifer-skeleton-king-boss) | Four-direction animated large enemy/boss base |
| [Lucifer Goblin Beast](https://foozlecc.itch.io/lucifer-goblin-beast-boss) | Four-direction animated large creature/boss base |
| [Lucifer Equipment](https://foozlecc.itch.io/lucifer-equipment) | Inventory equipment icons |
| [Lucifer RPG UI](https://foozlecc.itch.io/lucifer-rpg-ui) | Individual skill icons; authored menus use the game's own responsive React layout |
| [Lucifer Effects](https://foozlecc.itch.io/lucifer-effects) | Animated impact effect |
| [Dungeon Crawl 32×32 Tiles](https://opengameart.org/content/dungeon-crawl-32x32-tiles) | Selected item icons and matching animal, fungus, spirit and machinery silhouettes |

The Dungeon Crawl Stone Soup collection is a collaborative work. Its full CC0
legal text and original contributor list are preserved in
`public/assets/licenses/crawl-CC0.txt` and `crawl-CREDITS.txt`. Its README expressly
documents the contributor rights clearance. It contains no Dungeon Crawler Carl
assets.

Self-hosted Tiny5 and Inter fonts are maintained separately in
`public/assets/fonts/`, together with their OFL license files.

## Original pixel art and modifications

`tools/build-assets.py` reproducibly draws the project's mechanical jackal NIX,
small creature set, broadcasting cameras, terminals, pipes, crates, repair
fountains, airlocks, antennas, mushrooms, furnaces, bookshelves, clocks, mirrors,
bone piles, reactor cores and shrines as local RGBA pixel bitmaps. It also draws
industrial grates, circuits, metal plates, carpet and hazard surfaces. These are
new project art. Selected class portraits are cropped, enlarged with nearest
neighbour resampling and palette-adjusted from the licensed source frames.

Dungeon Crawl creature adaptations retain the real original silhouettes in
48px padded frames with a two-frame breathing motion. They are **not** presented
as newly commissioned full-direction animation sets. Full-direction action
animation is supplied by the six Lucifer creature families. Named content can
reuse a shared animation base, at different readable sizes and floor palettes;
content count and independent animation-family count are separate quantities.
Nine distinct NPC bases are also adapted from the cleared DCSS collection; the
mechanical companion NIX is original art. Their precise source filenames are
recorded in `manifest.json` and character portraits are available under
`public/assets/portraits/npc-<id>.png`.

Each floor uses its own material, prop family and accent lighting. Decorative
objects remain against room walls so their silhouettes do not confuse a combat
collision surface. Hazard tile types are the simulation's authoritative values;
rendering never changes movement rules.

## Runtime organization

- `public/assets/world/`: 32px tile atlas, pixel props, flame sheets and small light textures.
- `public/assets/sprites/actors.png` / `actors.json`: one deduplicated animation
  atlas for all loaded creature frames, with a 1024px width for mobile GPUs.
- `public/assets/portraits/`: transparent 64px class portraits.
- `public/assets/items/0.png` through `127.png`: transparent 32px item icons,
  cropped and fitted to a consistent 24px visual box with nearest-neighbour
  sampling. Semantic ranges are weapon 0–23, offhand 24–31, head 32–39,
  body 40–51, hands 52–59, feet 60–67, amulet 68–75, talisman 76–83,
  relic 84–99, consumable 100–119, and key 120–127. `itemGroups` records
  each start/count, and `itemSources` preserves every source filename.
- `public/assets/skills/`: the selected author's 16px skill icons.
- `public/assets/manifest.json`: exact sources, archive SHA-256 hashes, frame
  dimensions, frame counts and creature source-file mappings.
- `public/assets/licenses/`: preserved CC0 evidence, contributors and author credits.

The renderer requests the animation atlas once instead of requesting every
animation strip separately. Individual source-strip PNGs are retained locally
for inspection and UI integration but are not all loaded into the renderer.
Frames use nearest-neighbour sampling, no mipmap smoothing and integer sprite
positions. The CPU simulation owns all positions and combat; no Phaser physics
body becomes a second authority.

## Reproducing the import

With Python 3 and Pillow installed:

```powershell
python tools/import-assets.py
python tools/import-crawl.py
python tools/build-assets.py
```

The importer checks the author page for its explicit CC0 permission before
downloading. It uses public cookies/CSRF and the standard free-download endpoint,
requires no user account or credential and validates every extracted path stays
inside its source directory. Raw archives and editable source packs remain in
ignored `assets-source/` paths; they are never needed for the deployed game.

Do not infer that all art on itch.io, OpenGameArt or a GitHub code repository is
CC0. Any future addition needs its own matching source, license evidence and
hash. General game-reference repositories are references, not blanket permission
to copy their example textures.
