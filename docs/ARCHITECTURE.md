# Architektur

`src/content` definiert Klassen, Gegner, Floors, Gegenstände, Questgraph, Dialoge und Räume. Definitionen enthalten Übersetzungen; Spielstände enthalten IDs und erzeugte Instanzzustände. Inhalt und Renderer verändern die Simulationsregeln nicht nebenbei.

`src/game/world.ts` erzeugt eine verbundene, deterministische Karte mit Kämpfen, Versorgung, Schaltleitungen, Beute, Floorwächter, optionalem Jagdboss und Hauptboss. Raumgeometrie hält Navigationsachsen frei; Interaktionsziele haben begehbare Zugänge. `engine.ts` implementiert Kollisionen, gemeinsame Navigationsfelder, Gegnerrollen, Angriffsvorbereitung, Bossphasen, Geschosse, Elementzustände, Begleiter und Gegenstandseffekte. Zufall und Effekt-IDs werden gespeichert. `controller.ts` verbindet Kampagnenregeln, Checkpoints, Beute, Menüs und Persistenz. Ein Frame hat höchstens sechs Simulationsschritte; versteckte Dokumente pausieren.

`renderer.ts` übersetzt denselben Weltzustand in Phaser-Sprites, Tilemaps, Licht, Warnflächen und Effekte. Auflösung, Kameraführung und Eingaben sind seine Zuständigkeit; er berechnet keinen zweiten Kampfzustand. Ein kompakter gemeinsamer Animationsatlas vermeidet viele gleichzeitige Texturrequests.

`src/ui` besitzt React-Menüs und HUD mit eigenem Fokus, Sprachwechsel und Touch-Pointern. Panels pausieren eine aktive Expedition. Die Simulation publiziert UI-Snapshots ungefähr zehnmal pro Sekunde; Rendering und Kampfschritte benötigen keine 60 React-Renders pro Sekunde.

Der Renderer meldet Ladefortschritt, Bereitschaft und Assetfehler an den Controller. Die bestehende Oberfläche bleibt bis zur Bereitschaft inert; ein eigener DE/EN-Ladebildschirm zeigt Fortschritt oder einen erneuten Ladeversuch. Auch die Simulation wartet auf die Bereitschaft, damit ein schneller Start keine Eingaben verliert.

`save.ts` speichert drei Slots und je drei vorherige lokale Versionen transaktional in IndexedDB. Ein konkurrierender Tab darf keinen unerwartet geänderten Slot überschreiben. `shared/validation.ts` begrenzt das vollständige Snapshotformat. Schema 1 ist die erste veröffentlichte Speicherversion; Änderungen daran benötigen eine explizite Migration.

`server/handler.ts` besitzt die HTTPS-API. Alle SQL-Anfragen verwenden den Neon-HTTP-Treiber mit Parametern. Der Server akzeptiert keine frei übermittelte Benutzer-ID: Der Inhaber stammt aus einer gültigen Sitzung. Ein bedingtes SQL-Statement speichert Snapshot, vorherige Version, Revision und Mutationsbeleg atomar. Wiederholte Mutationen liefern ihre ursprüngliche Revision; veraltete Mutationen erzeugen einen sichtbaren Konflikt.

Neue Inhaltsversionen müssen Speichermigrationen, stabile IDs und Offline-Caches zusammen testen. Diese Erstversion liefert alle relativ kleinen statischen Assets zusammen aus; aktweises Nachladen aus dem ursprünglichen Produktionsplan wird nicht behauptet. Es gibt keinen Live-Multiplayer und keinen serverseitigen Kampfprozess.
