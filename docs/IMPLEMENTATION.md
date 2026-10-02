# Implementierungsstand · 02.10.2026

Die Erstveröffentlichung stellt eine durchgehende spielbare Kampagne bereit. Dieser Bericht unterscheidet ausführbaren Inhalt, überprüfte Funktionen und weitergehende Produktionsziele aus dem ursprünglichen Plan.

## Ausführbarer Umfang

| System | Enthalten |
|---|---|
| Kampagne | 4 Akte, 12 Floors, gesicherte Floorübergänge, 3 auswählbare Enden |
| Klassen | 6 Klassen, 24 normale Fähigkeiten, 6 Ultimates, 12 Spezialisierungen, 60 Talente |
| Gegner | 96 normale Definitionen, 24 Eliten, 24 benannte Zwischenbosse, 12 Hauptbosse |
| Begegnungen | 8 gemeinsame Gegnerrollen, Bossphasen und 36 unterschiedliche Boss-Angriffsfolgen |
| Räume | 336 benannte Prefabs mit 28 prozeduralen Layoutvarianten je Floor; 240 Encounter-Formationen |
| Beute | 576 Gegenstandsdefinitionen: 360 Ausrüstungen einschließlich 72 Uniques und 48 Setteilen, 120 Relikte, 72 Verbrauchsgegenstände, 24 Storyschlüssel |
| Aufbau | 160 Affixe, 12 Ausrüstungssets, 36 Herstellungsrezepte, Händler, Lager, Favoriten, Ausrüstungsslots |
| Erzählung | 36 Haupt-, 48 Neben- und 18 Beziehungsquests; 10 NPCs mit 143 DE/EN-Dialogzeilen |
| Sprache | DE/EN für Spieloberfläche und Content, jederzeitiger Wechsel |
| Eingaben | Maus/Tastatur, anpassbare Tasten, Gamepad, Touch-Joystick mit unabhängigen Aktionspointern |
| Speichern | 3 lokale Slots, transaktionale Backups, Export/Import, freiwillige Cloudkonten nur mit Benutzername/Passwort |
| Hosting | Öffentliche Vercel-Produktion und neue Neon-Datenbank im ausdrücklich gewählten kostenlosen Tarif |

Ein Floor erzeugt 14 verbundene Räume. Hauptboss und Floorwächter müssen besiegt sein; erforderliche Hauptziele werden am Ausgang überprüft. Der Jagdboss bleibt freiwillig. Gesicherte Übergänge bestätigen Story, Beute und Schrott. Ein Tod verliert ungesicherte Beute. Sichere Rückkehr zum Hub behält eingesammelte Gegenstände und Schrott, beginnt unbestätigte Floorziele beim nächsten Eintritt neu.

Mastery wächst bei erstmalig bestätigten Floors und gibt dauerhaft 1,5 % Grundschaden sowie 2 maximale Lebenspunkte je Stufe über der ersten. Archivmarken bezahlen unter anderem das erneute Verteilen von Talenten. Taktische Verbrauchsgegenstände aktivieren ihre angegebenen Effekte für 45 Sekunden; Heilmittel werden nicht bei vollem Leben verbraucht.

## Verifiziert

- TypeScript und Produktionsbuild erfolgreich.
- 16 automatisierte Inhalts-, Simulations- und Sicherheitsprüfungen erfolgreich.
- Inhaltsvalidator prüft eindeutige IDs, Übersetzungen, Belohnungs- und Rezeptverweise, Questgraph und Mengen. 288 erzeugte Welten mit 5.184 Interaktionszielen wurden auf Erreichbarkeit geprüft.
- Weitere Property-Prüfungen variieren 300 Welten und kontrollieren Kollisionen. Die Simulationsmatrix führt 216 Boss/Klassen-Kombinationen aus und prüft endliche Zustände sowie Grenzen für Geschosse, Effekte und Beschwörungen.
- JSON-Speicherung und Wiederaufnahme produzieren denselben weiteren Simulationszustand. Taktische Effekte behalten Ablaufzeiten über eine Wiederaufnahme.
- Der Kampagnenintegrationstest bestätigt alle zwölf Übergänge, 84 Haupt-/Nebenquests, ein Ende und die persistierte Wiederaufnahme. Er setzt absichtlich tödliche Testtreffer ein; er ist kein Balancetest.
- 19 API-Prüfungen auf der tatsächlichen Vercel-Produktion erfolgreich: Anmeldung, erneuter Login, Cookie-Sitzung, Besitztrennung, aktive Weltzustände, atomare Revisionen, idempotente Wiederholung, ungültige Daten und Originprüfung. Temporäre Konten wurden gelöscht.
- Reale Touch-Emulation auf 390 × 844 überprüft gleichzeitig Bewegung und Angriff, Joystickfreigabe, feste Startflächen, Sprachwechsel und Modal-Fokus. Getrennte browserseitige Menüdurchläufe haben keine JavaScript-Fehler erzeugt.
- Drei sequenzielle Browserprüfungen bestätigen Tastaturbewegung, DE/EN-Modalfokus, Speichern nach Neuladen, gleichzeitige Touch-Bewegung und Angriff sowie den Grafikfehler mit erfolgreichem erneuten Laden. Ein einzelner Browser führt diese Prüfungen stumm aus. Die Oberfläche wartet mit sichtbarem Ladefortschritt auf die fertige Grafik.

## Grenzen des Qualitätsnachweises

Die Zahl der Definitionen ist keine Aussage über die Zahl vollständig separat animierter Figuren oder handgezeichneter Karten. Die Grafik verwendet sechs vollständig animierte CC0-Familien, weitere individuell ausgewählte Silhouetten mit einfachen Bewegungen, eigene Pixelrequisiten und zwölf Material-/Farbstimmungen. Genauer Umfang und Herkunft stehen in ASSETS.md. Die 336 Prefabs nutzen gemeinsame prozedurale Geometrie; sie sind keine 336 einzeln von einem Leveldesigner ausgestalteten Karten.

Gegner besitzen unterschiedliche Werte, Elemente, Rollen und Begegnungskontexte; die 96 Definitionen verwenden acht gemeinsame Rollenverfahren. Bossangriffe bestehen aus wiederverwendeten Mustern mit individuellen Reihenfolgen und Phasen. Die Geschichte und Dialoge sind geschrieben, ohne Sprachausgabe. Audio ist eine eigene prozedurale Musik-/Effekterzeugung.

Automatisierte Durchläufe belegen technische Spielbarkeit, keine vollständige Langzeitbalance oder hervorragende Leistung auf jeder realen Smartphone-GPU. Physische iOS-/Android-Geräte, Screenreader, mehrstündige Spieltests und unterschiedliche Controller wurden nicht vollständig getestet. Der umfangreichere ursprüngliche Produktionsplan bleibt für solche Abnahmen maßgeblich; ein pauschal vollständig abgenommener kommerzieller Release wird nicht behauptet.

Schema 1 besitzt noch keine Migration aus einer früheren veröffentlichten Spielversion. Die Erstversion lädt alle kompakten statischen Assets gemeinsam; dynamisches Nachladen einzelner Akte und langfristige Unterstützung alter Assetgenerationen sind weitergehende Produktionsarbeiten. Kostenloser Datenbankbetrieb bleibt von den tatsächlichen Dienstkontingenten abhängig.
