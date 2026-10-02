import type { BossDef, Element } from '../game/types';
import { FLOORS } from './floors';
const t = (de: string, en: string) => ({ de, en });
type Variant = [string, string, string, Element, string, string, string[]];
// Alternate directors occupy the same floor, but demand different positioning and timing.
const cast: Variant[][] = [
  [
    [
      'Der Zensus',
      'The Census',
      'construct',
      'shock',
      'Er zählt Menschen als Inventar. Sein Kreuzfeuer lässt die diagonalen Gänge offen; nach dem dritten Impuls lädt er sichtbar nach.',
      'Counts people as inventory. Crossfire leaves diagonal lanes open; after the third pulse it visibly reloads.',
      ['cross', 'line', 'charge', 'cross', 'sweep'],
    ],
    [
      'Mutter Kupfer',
      'Mother Copper',
      'slime',
      'corrosion',
      'Die Leitungen haben eine Pflegerin gebaut, die niemanden entlassen will. Verlasse ihre Säureinseln, bevor die kleinen Pfleger eintreffen.',
      'The conduits built a nurse who will discharge nobody. Leave her acid islands before the little nurses arrive.',
      ['pool', 'summon', 'eruption', 'cleave', 'pool'],
    ],
  ],
  [
    [
      'Kanalrichter',
      'Channel Magistrate',
      'warrior',
      'bleed',
      'Sein Urteil reist in geraden Linien. Der breite Fächer verrät die Lücke, sein Sprung folgt deiner letzten Position.',
      'Its verdict travels in straight lines. The wide fan reveals a gap; its leap follows your last position.',
      ['line', 'sweep', 'charge', 'cleave', 'cross'],
    ],
    [
      'Die Salzbraut',
      'The Salt Bride',
      'slime',
      'frost',
      'Eine aus Abwasser geschaffene Königin hält jeden Abschied für Verrat. Wechsle nach den Frostspiralen die Seite des Beckens.',
      'A queen made of wastewater treats every farewell as betrayal. Cross the basin after each frost spiral.',
      ['orbit', 'pool', 'ring', 'snare', 'burst'],
    ],
  ],
  [
    [
      'Abt der Schrauben',
      'Abbot of Screws',
      'skeleton',
      'physical',
      'Die Basilika ordnet ihren Schrott in Kreuzgänge. Bleibe diagonal zum Abt und unterbrich seine Helfer, ehe das nächste Geläut beginnt.',
      'The basilica arranges its scrap into cloisters. Stay diagonal to the abbot and interrupt his helpers before the next toll.',
      ['cross', 'summon', 'cleave', 'sweep', 'ring'],
    ],
    [
      'Reliquie Neun',
      'Relic Nine',
      'construct',
      'shock',
      'Neun alte Dienstbefehle teilen sich einen Körper. Ihre Drehimpulse öffnen Wanderlücken; die Rückkehr in die Mitte ist gefährlich.',
      'Nine old service orders share one body. Rotating pulses open moving gaps; returning to the centre is dangerous.',
      ['orbit', 'charge', 'cross', 'eruption', 'line'],
    ],
  ],
  [
    [
      'Die Richtigstellung',
      'The Retraction',
      'wizard',
      'corrosion',
      'Sie korrigiert Berichte, indem sie die Zeugen überwuchert. Ihre Sporenzonen wachsen dort, wo du eben standest.',
      'Corrects reports by overgrowing the witnesses. Spore zones bloom where you stood a moment ago.',
      ['eruption', 'snare', 'summon', 'pool', 'burst'],
    ],
    [
      'Wurzelsprecher',
      'Root Speaker',
      'construct',
      'physical',
      'Die Redaktion hat alle Stimmen in einen Stamm gebunden. Enges Kreuzfeuer wechselt mit weiten Fächern; Abstand allein schützt nicht.',
      'The newsroom bound every voice into a trunk. Tight crossfire alternates with broad fans; distance alone will not protect you.',
      ['cross', 'sweep', 'cleave', 'line', 'summon'],
    ],
  ],
  [
    [
      'Gießerin Vesta',
      'Caster Vesta',
      'warrior',
      'fire',
      'Vesta rettete einst Arbeiter aus der Glut. Jetzt gießt sie ihre Namen in Bodenfallen. Lies die roten Flächen und bewege dich erst dann.',
      'Vesta once rescued workers from the embers. Now she casts their names into floor traps. Read the red areas, then move.',
      ['eruption', 'charge', 'pool', 'sweep', 'cleave'],
    ],
    [
      'Der Ofenchor',
      'The Furnace Choir',
      'wizard',
      'fire',
      'Die Öfen singen versetzt. Seine Spirale schiebt dich nach außen, ehe ein kreuzförmiger Feuerstoß den Rückweg schneidet.',
      'The furnaces sing out of time. Its spiral pushes you outward before a cross of flame cuts the way back.',
      ['orbit', 'cross', 'summon', 'burst', 'eruption'],
    ],
  ],
  [
    [
      'Die Auktionatorin',
      'The Auctioneer',
      'wizard',
      'exposed',
      'Sie versteigert deine nächsten drei Schritte. Jeder Fächer lässt einen freien Korridor; halte ihn offen statt am Rand zu kreisen.',
      'Auctions your next three steps. Every fan leaves a clear corridor; keep it open instead of circling the edge.',
      ['sweep', 'snare', 'line', 'cross', 'charge'],
    ],
    [
      'Lux Null',
      'Lux Zero',
      'knight',
      'shock',
      'Ein Markenidol ohne Publikum sammelt Licht in rotierenden Bahnen. Seine Pausen werden mit jeder verlorenen Panzerplatte kürzer.',
      'A brand idol without an audience collects light in rotating paths. Its pauses shorten with every lost armour plate.',
      ['orbit', 'ring', 'charge', 'sweep', 'cross'],
    ],
  ],
  [
    [
      'Wärterin Reif',
      'Warden Rime',
      'skeleton',
      'frost',
      'Sie schützt die einzigen ungeschnittenen Erinnerungen. Eisinseln bestrafen Stillstand, ihre geraden Schüsse bestrafen hektische Rückzüge.',
      'Protects the only unedited memories. Ice islands punish standing still; straight shots punish hurried retreats.',
      ['snare', 'line', 'eruption', 'cross', 'cleave'],
    ],
    [
      'Der Letzte Leser',
      'The Last Reader',
      'wizard',
      'frost',
      'Er liest dein Leben rückwärts. Weite Spiralen wechseln mit Helfern; räume die kleinen Leser aus dem Fluchtweg.',
      'Reads your life backwards. Broad spirals alternate with helpers; clear the little readers from your escape path.',
      ['orbit', 'summon', 'sweep', 'pool', 'ring'],
    ],
  ],
  [
    [
      'Die Pendelfrau',
      'The Pendulum Woman',
      'knight',
      'physical',
      'Jeder Takt gehört einem anderen Viertel. Ihre seitlichen Fächer zwingen dich zwischen Innenbahn und Außenbahn zu wechseln.',
      'Each beat belongs to a different district. Lateral fans force you to switch between inner and outer lanes.',
      ['sweep', 'charge', 'cross', 'cleave', 'orbit'],
    ],
    [
      'Bürgermeister Sekunde',
      'Mayor Second',
      'construct',
      'shock',
      'Seine Stadt bezahlt Zeit statt Steuern. Er markiert drei verspätete Positionen und zieht den nächsten Angriff durch die verbleibende Lücke.',
      'His city pays time instead of taxes. Marks three late positions and sends the next attack through the remaining gap.',
      ['eruption', 'line', 'snare', 'cross', 'burst'],
    ],
  ],
  [
    [
      'Doppelgänger Eins',
      'Double One',
      'warrior',
      'bleed',
      'Er imitiert deinen Rückzug statt deinen Angriff. Lass den Ansturm ins Leere laufen, bevor du die nächste Spirale durchquerst.',
      'Imitates your retreat rather than your attack. Make the charge miss before crossing the next spiral.',
      ['charge', 'orbit', 'sweep', 'cleave', 'line'],
    ],
    [
      'Die Leerstelle',
      'The Missing Reflection',
      'wizard',
      'exposed',
      'Ein Spiegelbild, aus dem alle Menschen herausgeschnitten wurden. Seine Fallen füllen leere Flächen; diagonal bleiben schmale Wege.',
      'A reflection with every person edited out. Its traps fill empty ground; narrow paths remain along the diagonals.',
      ['cross', 'eruption', 'snare', 'pool', 'orbit'],
    ],
  ],
  [
    [
      'Mutter Wirbel',
      'Mother Vertebra',
      'skeleton',
      'bleed',
      'Sie verbindet Knochen mit Verträgen. Zerstöre ihre Boten, dann weiche seitlich aus, wenn sie die Verbindung gerade zieht.',
      'Connects bones with contracts. Destroy her couriers, then sidestep when she pulls the connection straight.',
      ['summon', 'line', 'sweep', 'snare', 'cleave'],
    ],
    [
      'Der Fremdkörper',
      'The Foreign Body',
      'slime',
      'corrosion',
      'Ein Netzwerk ohne Eigentümer hat sich selbst ein Herz gebaut. Säurekreuze teilen die Arena; die Spirale öffnet einen Ausgang.',
      'An ownerless network built itself a heart. Acid crosses divide the arena; the spiral opens an exit.',
      ['cross', 'orbit', 'pool', 'eruption', 'charge'],
    ],
  ],
  [
    [
      'Regisseurin Echo',
      'Director Echo',
      'wizard',
      'shock',
      'Echo sendet jede ausgeschnittene Antwort gleichzeitig. Erkenne das Kreuz vor dem Signalsturm und bleibe nicht im Zentrum.',
      'Echo broadcasts every deleted answer at once. Read the cross before the signal storm and avoid the centre.',
      ['cross', 'burst', 'orbit', 'snare', 'sweep'],
    ],
    [
      'Der Schwarzschnitt',
      'The Black Cut',
      'knight',
      'exposed',
      'Zwischen zwei Bildern lebt ein Wächter. Er erscheint mit einem geraden Stoß; breite Fächer kündigen seine nächste Schnittkante an.',
      'A guard lives between two frames. Appears with a straight thrust; wide fans announce the next cut.',
      ['charge', 'sweep', 'line', 'eruption', 'cleave'],
    ],
  ],
  [
    [
      'Das Publikum',
      'The Audience',
      'construct',
      'shock',
      'Der Kern hat sich aus Zuschauerurteilen eine Stimme gebaut. Jede Phase bindet eine andere Angriffsform; die letzten Pausen bleiben kurz, aber sichtbar.',
      'The core built a voice from audience verdicts. Each phase binds a different attack form; the final pauses remain short but visible.',
      ['orbit', 'summon', 'cross', 'eruption', 'sweep', 'charge'],
    ],
    [
      'Die Erbin',
      'The Heir',
      'wizard',
      'fire',
      'Ein Ersatzkörper soll den Sender durch seinen eigenen Untergang retten. Sie beansprucht Raum mit Feuerinseln und zwingt dich dann durch ihre Lücken.',
      'A replacement body is meant to preserve the broadcaster through its own collapse. Claims ground with fire islands, then forces you through the gaps.',
      ['eruption', 'sweep', 'snare', 'cross', 'orbit', 'line'],
    ],
  ],
];
export const BOSS_VARIANTS: (BossDef & { floor: number })[] = cast.flatMap((rows, index) =>
  rows.map(([de, en, sprite, _tag, descriptionDe, descriptionEn, patterns], variant) => {
    const f = FLOORS[index];
    return {
      id: `boss-alt-${String(index + 1).padStart(2, '0')}-${variant + 1}`,
      floor: index + 1,
      name: t(de, en),
      description: t(descriptionDe, descriptionEn),
      sprite:
        (
          {
            wizard: variant ? 'necromancer' : 'sorceress',
            skeleton: variant ? 'skeleton-king' : 'skeleton-hunter',
            knight: variant ? 'warrior' : 'skeleton-king',
          } as Record<string, string>
        )[sprite] ?? sprite,
      element: _tag,
      patterns,
      hp: Math.round(f.boss.hp * (variant ? 0.9 : 1.05)),
      damage: f.boss.damage * (variant ? 1.08 : 0.95),
      color: f.colors.accent,
      unique: f.boss.unique,
    };
  }),
);
export const ALL_BOSSES: BossDef[] = [
  ...FLOORS.flatMap((f) => [f.boss, ...f.minibosses]),
  ...BOSS_VARIANTS,
];
export const floorBosses = (floor: number) => [
  FLOORS[floor - 1].boss,
  ...BOSS_VARIANTS.filter((b) => b.floor === floor),
];

export const RUN_MODIFIERS = [
  {
    id: 'swarm',
    name: t('Überfüllte Aufnahme', 'Crowded intake'),
    description: t(
      'Mehr Gegner in jedem Kampf; mehr Beute.',
      'More enemies in every fight; more loot.',
    ),
  },
  {
    id: 'stalkers',
    name: t('Jagdkommando', 'Pursuit detail'),
    description: t(
      'Gegner bewegen sich schneller und verfolgen dich weiter.',
      'Enemies move faster and pursue you farther.',
    ),
  },
  {
    id: 'veterans',
    name: t('Veteranenbesetzung', 'Veteran cast'),
    description: t(
      'Häufigere Elitegegner mit zusätzlichen Belohnungen.',
      'More frequent elite enemies with additional rewards.',
    ),
  },
  {
    id: 'fury',
    name: t('Sendezeitdruck', 'Airtime pressure'),
    description: t(
      'Kürzere Pausen zwischen gegnerischen Angriffen.',
      'Shorter pauses between enemy attacks.',
    ),
  },
  {
    id: 'warded',
    name: t('Versiegelte Panzer', 'Sealed armour'),
    description: t(
      'Gegner haben mehr Leben; Bossbeute ist ergiebiger.',
      'Enemies have more health; boss loot is richer.',
    ),
  },
  {
    id: 'unstable',
    name: t('Störsignal', 'Interference'),
    description: t(
      'Größere Umweltzonen in Kampfräumen.',
      'Larger environmental zones in combat rooms.',
    ),
  },
  {
    id: 'invasion',
    name: t('Fremde Besetzung', 'Foreign cast'),
    description: t(
      'Kreaturen des benachbarten Floors mischen die Gegnerrollen.',
      'Creatures from a neighbouring floor mix up enemy roles.',
    ),
  },
  {
    id: 'scarcity',
    name: t('Rationierte Sendung', 'Rationed broadcast'),
    description: t(
      'Reparaturstationen heilen nur zur Hälfte; Kisten enthalten mehr Schrott.',
      'Repair stations heal only halfway; caches hold more scrap.',
    ),
  },
] as const;
