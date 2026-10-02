# Implementierungsstand · 02.10.2026

Die Story- und Welterweiterung baut die veröffentlichte Kampagne um persönliche Herkunft, begehbare Städte, NPC-Auftragsketten und abwechslungsreichere Expeditionen aus. Dieser Bericht unterscheidet ausführbaren Inhalt, überprüfte Funktionen und weitergehende Produktionsziele aus dem ursprünglichen Plan.

## Ausführbarer Umfang

| System | Enthalten |
|---|---|
| Kampagne | 4 Akte, 12 Floors, gesicherte Floorübergänge, 3 auswählbare Enden |
| Klassen | 6 Klassen, 24 normale Fähigkeiten, 6 Ultimates, 12 Spezialisierungen, 60 Talente |
| Gegner | 96 normale Definitionen, 24 Eliten, 24 benannte Zwischenbosse, 12 ursprüngliche Hauptbosse und 24 alternative Bossdefinitionen |
| Begegnungen | 8 gemeinsame Gegnerrollen, wechselnde Haupt-/Wächter-/Jagdbesetzungen, Bossphasen, 5 zusätzliche Angriffsmuster und 8 Zufallsmodifikatoren |
| Räume | 18–23 Räume je Expedition, verzweigte Graphen mit Schleifen, wechselnde Formen/Deckung und Materialübergänge; 336 benannte Prefabs und 240 Encounter-Formationen |
| Städte | Kesselhafen, Laternenhain und Meridian; jeweils 4 begehbare Viertel mit Markt, Werkstatt, Archiv, Klinik, Reisetor und Stadtkontakten |
| Beute | 576 Gegenstandsdefinitionen: 360 Ausrüstungen einschließlich 72 Uniques und 48 Setteilen, 120 Relikte, 72 Verbrauchsgegenstände, 24 Storyschlüssel |
| Aufbau | 160 Affixe, 12 Ausrüstungssets, 36 Herstellungsrezepte, Händler, Lager, Favoriten, Ausrüstungsslots |
| Erzählung | 3 Herkunftsgeschichten mit persönlichem Ziel; 12 Kapitel mit 36 Ereignisszenen und 74 Szenenoptionen; 24 Stadtaufträge mit Voraussetzungen, Abgabe und Entscheidungen; zusätzlich 36 Haupt-, 48 Neben- und 18 Beziehungsquests und 143 bestehende NPC-Dialogzeilen |
| Entscheidungen | 4 Fraktionsrufwerte, gegensätzlicher Gewerkschaft-/Sponsoreneinfluss, veränderte Händler-/Werkstattpreise, gespeicherte Chronik und persönlicher Epilog |
| Sprache | DE/EN für Spieloberfläche und Content, jederzeitiger Wechsel |
| Eingaben | Maus/Tastatur, anpassbare Tasten, Gamepad, Touch-Joystick mit unabhängigen Aktionspointern |
| Speichern | 3 lokale Slots, transaktionale Backups, Export/Import, freiwillige Cloudkonten nur mit Benutzername/Passwort |
| Hosting | Öffentliche Vercel-Produktion und neue Neon-Datenbank im ausdrücklich gewählten kostenlosen Tarif |

Ein Floor erzeugt je nach Route 18–23 verbundene Räume. Seed, Graph, erzeugte Raumformen, Materialien, Objekte und Bossbesetzung werden im Snapshot gesichert. Eine Wiederaufnahme behält diese Welt; ein neuer Expeditionsstart kombiniert sie neu. Ausgewogene, gefährliche und erkundungsorientierte Routen beeinflussen Raumzahl, Druck, Versorgung und Beute. Hauptboss und Floorwächter müssen besiegt sein; erforderliche Hauptziele werden am Ausgang überprüft. Der Jagdboss bleibt freiwillig.

Stadtaufträge zählen erst nach Annahme beim richtigen NPC und auf dem benannten Floor bzw. beim konkreten Gesprächsziel. Folgeaufträge setzen persönliche Abgabe voraus. Gesicherte Übergänge bestätigen Story, Beute, Schrott und Stadtauftragszähler. Ein Tod verliert ungesicherte Beute und setzt Stadtaufträge auf ihren zuletzt gesicherten Zähler zurück. Sichere Hub-Rückkehr aus einem Versorgungsraum ohne nahe Gegner behält eingesammelte Gegenstände, Schrott und Auftragsfortschritt, beginnt unbestätigte Floorziele beim nächsten Eintritt neu. Nach dem Ende lassen sich Städte und Expeditionen weiter besuchen, ohne die getroffene Endentscheidung zu verlieren.

Standard wurde gegenüber der Erstversion verstärkt: 40 % höherer eingehender Schaden, stärkere und schnellere Gegner, größere Gruppen, höhere Elitewahrscheinlichkeit, frühere Verfolgung und weniger Heilung durch Levelaufstieg. Die Gefahrenroute erhöht Druck und Schrottertrag weiter. Story und Herausforderung bleiben auswählbar; Modifikatoren verändern unter anderem Schwärme, Verfolgung, Angriffstakt, Nachbarbiom-Gegner und Versorgung.

Mastery wächst bei erstmalig bestätigten Floors und gibt dauerhaft 1,5 % Grundschaden sowie 2 maximale Lebenspunkte je Stufe über der ersten. Archivmarken bezahlen unter anderem das erneute Verteilen von Talenten. Taktische Verbrauchsgegenstände aktivieren ihre angegebenen Effekte für 45 Sekunden; Heilmittel werden nicht bei vollem Leben verbraucht.

## Verifiziert

- TypeScript und Produktionsbuild erfolgreich.
- 25 automatisierte Inhalts-, Simulations-, Auftrags-, Kompatibilitäts- und Sicherheitsprüfungen erfolgreich.
- Inhaltsvalidator prüft eindeutige IDs, Übersetzungen, Belohnungs- und Rezeptverweise, alte und neue Questgraphen, Stadt-NPC-Zugänglichkeit und Mengen. 288 erzeugte Welten mit 6.033 Interaktionszielen wurden auf Erreichbarkeit geprüft; die Dienste aller drei Städte ebenfalls.
- Weitere Property-Prüfungen variieren 300 Welten und kontrollieren Kollisionen. Eine zusätzliche 48-Seed-Serie prüft unterschiedliche Grundrisse, Raumfolgen, Verzweigungen, Schleifen und drei Hauptbossbesetzungen. Die Simulationsmatrix führt 360 Boss/Klassen-Kombinationen aus und prüft endliche Zustände sowie Grenzen für Geschosse, Effekte und Beschwörungen.
- JSON-Speicherung und Wiederaufnahme produzieren denselben weiteren Simulationszustand. Taktische Effekte behalten Ablaufzeiten über eine Wiederaufnahme.
- Der Kampagnenintegrationstest bestätigt alle zwölf Übergänge, 84 Haupt-/Nebenquests plus einen angenommenen und abgegebenen Stadtauftrag, alle 36 persönlichen Ereignisszenen, die Freischaltung und Besuche aller drei Städte, ein Ende und die persistierte Wiederaufnahme. Weiterspielen nach dem Epilog lädt anschließend korrekt die Zuflucht mit erhaltener Endentscheidung. Der Test setzt absichtlich tödliche Treffer ein; er ist kein Balancetest.
- 21 API-Prüfungen auf der tatsächlichen Vercel-Produktion erfolgreich: Anmeldung, erneuter Login, Cookie-Sitzung, Besitztrennung, Herkunft und Stadtrückkehr, gesicherte Stadtaufträge, aktive Weltzustände samt Bossbesetzung, Routen und Graphen, atomare Revisionen, idempotente Wiederholung, ungültige Daten und Originprüfung. Temporäre Konten wurden gelöscht.
- Reale Touch-Emulation auf 390 × 844 überprüft gleichzeitig Bewegung und Angriff, Joystickfreigabe, feste Startflächen, Sprachwechsel und Modal-Fokus. Getrennte browserseitige Menüdurchläufe haben keine JavaScript-Fehler erzeugt.
- Vier Browserprüfungen bestätigen Tastaturbewegung, DE/EN-Modalfokus, Speichern nach Neuladen, gleichzeitige Touch-Bewegung und Angriff, echten Stadtspaziergang bis zum NPC mit Annahme und gespeicherter Wiederaufnahme sowie den Grafikfehler mit erfolgreichem erneuten Laden. Browserprüfungen verwenden jeweils einen stummen Browser; es laufen keine Testbrowser parallel. Die Oberfläche wartet mit sichtbarem Ladefortschritt auf die fertige Grafik.
- Eine separate Designprüfung bestätigt Herkunft, Stadt, Auftragspanels, Chronik, Reisewege und Routenwahl in DE/EN auf Desktop, Tablet, Phone bis 320 px und Querformat. Radio-Auswahl, lesbare Stadtkontaktmarker/-legende, 48-px-Flächen, Modal-Fokus und sichtbare Annahmebestätigung wurden nachgebessert und nachgeprüft.
- Der veröffentlichte Service Worker erlaubt Offline-Neuladen und eine neue Gast-Expedition ohne JavaScript-Fehler. Seine 471 statischen Cacheeinträge enthalten keine API-Anfragen. Versionierte Iconanfragen verwenden denselben statischen Cache; neue Assetgenerationen werden bei der Installation frisch angefordert.

## Grenzen des Qualitätsnachweises

Die Zahl der Definitionen ist keine Aussage über die Zahl vollständig separat animierter Figuren oder handgezeichneter Karten. Die Grafik verwendet sechs vollständig animierte CC0-Familien, weitere individuell ausgewählte Silhouetten mit einfachen Bewegungen, eigene Pixelrequisiten und zwölf Material-/Farbstimmungen. Genauer Umfang und Herkunft stehen in ASSETS.md. Die 336 Prefabs nutzen gemeinsame prozedurale Geometrie; sie sind keine 336 einzeln von einem Leveldesigner ausgestalteten Karten.

Gegner besitzen unterschiedliche Werte, Elemente, Rollen und Begegnungskontexte; die 96 Definitionen verwenden acht gemeinsame Rollenverfahren. Bossangriffe bestehen aus wiederverwendeten Mustern mit individuellen Reihenfolgen und Phasen. Die Geschichte und Dialoge sind geschrieben, ohne Sprachausgabe. Audio ist eine eigene prozedurale Musik-/Effekterzeugung.

Automatisierte Durchläufe belegen technische Spielbarkeit, keine vollständige Langzeitbalance oder hervorragende Leistung auf jeder realen Smartphone-GPU. Physische iOS-/Android-Geräte, Screenreader, mehrstündige Spieltests und unterschiedliche Controller wurden nicht vollständig getestet. Der umfangreichere ursprüngliche Produktionsplan bleibt für solche Abnahmen maßgeblich; ein pauschal vollständig abgenommener kommerzieller Release wird nicht behauptet.

Die Erweiterung bleibt mit veröffentlichten Schema-1-Spielständen kompatibel: zusätzliche Felder sind optional; fehlende Herkunft wird in der Chronik als Wartungsherkunft dargestellt. Neue Karten und Bossbesetzungen entstehen bei einem neuen Expeditionsstart. Eine vollständig erhaltene alte Expedition wird bei Wiederaufnahme nicht verändert. Herkunft und Motivation werden beim neuen Spiel ausgewählt; vorhandene Ausrüstung, Konten und gesicherter Fortschritt bleiben nutzbar. SQL-Tabellen benötigen keine Änderung.

Die Anwendung lädt alle kompakten statischen Assets gemeinsam; dynamisches Nachladen einzelner Akte und langfristige Unterstützung alter Assetgenerationen sind weitergehende Produktionsarbeiten. Kostenloser Datenbankbetrieb bleibt von den tatsächlichen Dienstkontingenten abhängig.
