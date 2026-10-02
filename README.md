# UNTER DER SENDUNG / BELOW THE BROADCAST

Ein originales Browser-Roguelite über eine dystopische Spielshow, gestohlene Erinnerungen und einen mechanischen Schakal namens NIX. Die Inspiration liegt in der Mischung aus Dungeon, schwarzem Humor und übermächtiger Regie; Figuren, Handlung und Welt sind eigenständig.

[Im Browser spielen](https://dungeon-crawler-brown.vercel.app)

Die Kampagne umfasst zwölf Floors, sechs Klassen, Haupt- und Zwischenbosse, Ausrüstung, Relikte, Talentaufbau, Nebenquests und drei Enden. Oberfläche und Inhalte sind auf Deutsch und Englisch verfügbar. Maus/Tastatur, Gamepad sowie Touch-Steuerung in Hoch- und Querformat sind vorgesehen.

## Lokal starten

Entwickelt und geprüft mit Node.js 24 und npm. Alle Abhängigkeiten sind im Lockfile festgehalten.

```sh
npm ci
npm run dev
```

Die Anwendung läuft auf `http://127.0.0.1:5173`. Lokales Spielen benötigt kein Konto und keine Datenbank. Drei Spielstände liegen in IndexedDB; JSON-Export und -Import sind im Spiel verfügbar.

## Optionale Cloud-Spielstände

Kopiere `.env.example` nach `.env.local` und setze serverseitig `DATABASE_URL` und einen zufälligen `SESSION_SECRET` mit mindestens 32 Zeichen. Für Migrationen kann `DATABASE_URL_UNPOOLED` verwendet werden. Diese Variablen dürfen niemals `VITE_` als Präfix haben.

```sh
npm run db:migrate
npm run dev
```

Die Anmeldung fragt ausschließlich Benutzername und Passwort ab: 3–24 Zeichen für den Namen, mindestens 10 Zeichen für das Passwort. Passwörter werden mit scrypt und individuellem Salt gehasht. Der Browser erhält ein HttpOnly-Sessioncookie; Besitzprüfung, Originprüfung, Größenlimits und atomare Revisionen schützen die Cloud-Spielstände. Konten besitzen keinen E-Mail-Reset; bewahre Passwort und lokale Sicherung auf.

Die bereitgestellte Neon-Datenbank verwendet den kostenlosen Tarif. Spielgrafik und Audio werden als lokale statische Dateien ausgeliefert; Blob ist nicht erforderlich. Cloud-Ausfälle beeinträchtigen das lokale Spielen nicht. Kostenlos bedeutet ein begrenztes Kontingent; zusätzliche Dienste oder bezahlte Upgrades werden nicht automatisch eingerichtet.

## Steuerung

| Aktion | Standard |
|---|---|
| Bewegen | WASD / Pfeiltasten |
| Angreifen | Maus / Enter |
| Ausweichen | Leertaste |
| Fähigkeiten | Q / R |
| Ultimate | F |
| Interagieren | E |
| Heilgegenstand | C |
| Inventar / Journal / Karte / Charakter | I / J / M / K |
| Pause | Escape |

Tasten, Sprache, Ton, Musik, Kontrast, Bewegungsreduktion, Schwierigkeit und Angriffsassistenz sind einstellbar. Auf Touch-Geräten erscheinen Joystick und getrennte Aktionsflächen. Hub-Rückkehr sichert Beute und Schrott; unbestätigte Floorziele starten bei der nächsten Expedition neu. Ein Tod verliert ungesicherte Beute und Schrott, behält bestätigte Story und gesicherte Ausrüstung.

## Architektur und Prüfungen

Phaser rendert die Pixelwelt; eine davon unabhängige TypeScript-Simulation besitzt Kampf, Zustände und Kollisionen. React stellt HUD und zugängliche Menüs dar. Content wird über stabile IDs referenziert. Die Simulation verwendet einen festen 60-Hz-Schritt und einen gespeicherten Zufallszustand. Dexie übernimmt transaktionale lokale Sicherungen; Vercel Functions und Neon übernehmen Anmeldung und Cloud-Snapshots.

```sh
npm test
npm run validate
npm run build
npm run preview
npm run test:e2e
```

`node scripts/check-campaign.mjs` prüft die komplette Checkpointkette mit dem Entwicklungsserver. Dieser Test verwendet absichtlich deterministische tödliche Treffer und misst kein Kampfbalancegefühl. `npx tsx scripts/check-cloud.ts` prüft die konfigurierte API mit temporären Konten, die anschließend gelöscht werden. Ein anderes API-Ziel lässt sich als erstes Argument angeben.

Weitere Details: [Implementierungsstand](docs/IMPLEMENTATION.md), [Assetquellen und Lizenzen](docs/ASSETS.md), [Architektur](docs/ARCHITECTURE.md), [Datenspeicherung](docs/DATA.md) und [ursprünglicher Produktionsplan](IMPLEMENTIERUNGSPLAN.md).

## Vercel

Vite baut nach `dist`; `api/index.ts` stellt die API bereit. `vercel.json` enthält die Routen und Sicherheitsheader. Datenbank und Funktionen befinden sich in Frankfurt. Setze die Servervariablen auch im Vercel-Projekt. Preview-Deployments benötigen eine eigene konfigurierte Datenbank, wenn Cloud-Funktionen geprüft werden sollen.

```sh
npm run build
vercel --prod
```

Tokens und `.env.local` sind ausgeschlossen. Der Service Worker hält die veröffentlichte statische Version offline bereit und cached keine API-Antworten oder Kontodaten.
