import type { NpcDef, QuestDef, Text } from '../game/types';

const t = (de: string, en: string): Text => ({ de, en });
type QuestSeed = [string, string, string, string, QuestDef['objective'], number, string?];
const main: QuestSeed[][] = [
  [
    [
      'Reststrom',
      'Residual Power',
      'Aktiviere das Notnetz an den drei Wartungsterminals. Die Halle braucht eine Stromquelle, die keinen gültigen Teilnehmervertrag verlangt.',
      'Activate emergency power at three maintenance terminals. The hall needs a power source that does not demand a valid contestant contract.',
      'terminal',
      3,
    ],
    [
      'Ein Tier aus Draht',
      'A Creature of Wire',
      'Berge NIX’ beschädigtes Archivmodul aus einer versiegelten Wartungskiste. Auf seinem Herkunftslabel steht dieselbe Nummer wie auf deinem Einlassformular.',
      'Recover NIX’s damaged archive module from a sealed maintenance chest. Its origin label carries the same number as your admission form.',
      'chest',
      1,
      'nix',
    ],
    [
      'Unterschreiben oder sterben',
      'Sign or Die',
      'Besiege Pförtner-900. Bestätige das umgangene Einlassprotokoll an der Ausgangsschleuse, bevor die Halle den Vertrag neu schreibt.',
      'Defeat Gatekeeper-900. Confirm the bypassed admission protocol at the exit sluice before the hall rewrites the contract.',
      'boss',
      1,
      'nix',
    ],
  ],
  [
    [
      'Unter Druck',
      'Under Pressure',
      'Stelle an drei Ventilterminals einen sicheren Druckzustand her. Jeder Schalter nimmt einen Teil der Versorgung aus der Fernkontrolle des Senders.',
      'Set safe pressure at three valve terminals. Each switch takes part of the supply out of the broadcaster’s remote control.',
      'terminal',
      3,
    ],
    [
      'Miras Station',
      'Mira’s Station',
      'Löse die Pumpensicherung im Wartungsraum. Die Klinik hinter dem Rücklauf braucht einen offen gehaltenen Zugang.',
      'Solve the pump lock in the maintenance room. The clinic beyond the return pipe needs an open access route.',
      'puzzle',
      1,
      'mira',
    ],
    [
      'Wasserrecht',
      'Water Rights',
      'Besiege Mutter Pumpe und sichere ihre Kontrolle. Die Leitung zur Klinik darf keine Belohnung für Gehorsam mehr sein.',
      'Defeat Mother Pump and secure its controls. The clinic’s supply must no longer be a reward for obedience.',
      'boss',
      1,
      'mira',
    ],
  ],
  [
    [
      'Falsche Reliquien',
      'False Relics',
      'Lies drei Archivterminals zwischen den Schrottaltären. Die Eigentumslisten verbinden seltene Waren mit vermissten Teilnehmern.',
      'Read three archive terminals among the scrap altars. Ownership lists connect rare merchandise to missing contestants.',
      'terminal',
      3,
      'ilya',
    ],
    [
      'Schwerkraft der Schulden',
      'The Weight of Debt',
      'Löse die Magnetfolge am Altar. Eine falsch sortierte Schuld hält die Beweiskammer verschlossen.',
      'Solve the altar’s magnetic sequence. A misfiled debt keeps the evidence chamber sealed.',
      'puzzle',
      1,
      'tam',
    ],
    [
      'Nicht zum Verkauf',
      'Not for Sale',
      'Besiege den Sammler und sichere das Archiv. Diese Erinnerungen dürfen keine neue Ware in deiner Tasche werden.',
      'Defeat the Collector and secure the archive. These memories must not become new merchandise in your pack.',
      'boss',
      1,
      'ilya',
    ],
  ],
  [
    [
      'Gedruckte Wahrheit',
      'Printed Truth',
      'Vergleiche die drei Redaktionsfassungen an den Leseterminals. Die ursprüngliche Nachricht nennt andere Opfer als die gesendete Schlagzeile.',
      'Compare three newsroom editions at reading terminals. The original report names different victims than the broadcast headline.',
      'terminal',
      3,
      'ilya',
    ],
    [
      'Unter der Wurzel',
      'Beneath the Root',
      'Öffne den lebenden Leitungsweg mit der Sporenfolge. Zuv braucht einen stabilen Rücklauf, bevor die Redaktion getrennt wird.',
      'Open the living conduit with the spore sequence. Zuv needs a stable return line before the newsroom is disconnected.',
      'puzzle',
      1,
      'zuv',
    ],
    [
      'Korrekturfrist',
      'Correction Deadline',
      'Besiege Redaktor Myr. Stoppe den Redaktionsfilter, ohne das bereits gesicherte Originalprotokoll zu löschen.',
      'Defeat Editor Myr. Stop the newsroom filter without deleting the original protocol you already secured.',
      'boss',
      1,
      'zuv',
    ],
  ],
  [
    [
      'Formfehler',
      'Mould Defect',
      'Lies die drei Produktionsdatensätze. Wiederkehrende Seriennummern zeigen, dass der Sender ganze Identitäten mit den Körpern austauscht.',
      'Read three production records. Recurring serial numbers show that the broadcaster replaces whole identities along with their bodies.',
      'terminal',
      3,
      'mira',
    ],
    [
      'Kalter Kreis',
      'Cold Circuit',
      'Stelle die Kühlfolge im sicheren Wartungsraum wieder her. Ohne unabhängige Kühlung bleibt jeder neue Körper abhängig.',
      'Restore the coolant sequence in the safe maintenance room. Without independent cooling, every new body stays dependent.',
      'puzzle',
      1,
      'mira',
    ],
    [
      'Menschenserie',
      'Human Series',
      'Besiege Vorarbeiterin Ash und sichere ihr Fertigungsprotokoll. Mira erhält damit eine Möglichkeit zur Rekonstruktion ohne Eigentumsvertrag.',
      'Defeat Forewoman Ash and secure her production protocol. It gives Mira a way to reconstruct people without an ownership contract.',
      'boss',
      1,
      'mira',
    ],
  ],
  [
    [
      'Ein gutes Angebot',
      'A Good Offer',
      'Vergleiche drei Sponsorverträge. Die große Zahl verspricht Freiheit; die kleine Zeile darunter nimmt sie zurück.',
      'Compare three sponsorship contracts. The large print promises freedom; the small print below takes it away.',
      'terminal',
      3,
      'oris',
    ],
    [
      'Die Gewinnerin',
      'The Winner',
      'Erreiche Rhea über den gelösten Galeriezugang. Der Weg verlangt keine Sponsorhilfe und beweist, dass ein eigener Sieg möglich ist.',
      'Reach Rhea through the unlocked gallery entrance. The route demands no sponsor aid, proving that an independent victory is possible.',
      'puzzle',
      1,
      'rhea',
    ],
    [
      'Siegerklausel',
      'Winner’s Clause',
      'Besiege Rhea im Duell und sichere den Vertragsschlüssel. Ihr gewonnenes Leben enthält noch immer keinen echten Ausgang.',
      'Defeat Rhea in a duel and secure the contract key. Her prize-winning life still contains no real exit.',
      'boss',
      1,
      'rhea',
    ],
  ],
  [
    [
      'Kalte Identitäten',
      'Cold Identities',
      'Stelle den Originalindex an drei Archivterminals wieder her. Datum und Bearbeitungsspur trennen Quelle und gesendete Fassung.',
      'Restore the original index at three archive terminals. Dates and edit traces separate the source from its broadcast edition.',
      'terminal',
      3,
      'ilya',
    ],
    [
      'Ennos Akte',
      'Enno’s File',
      'Öffne den geschützten Vergleichssatz mit der Indexfolge. Entscheide erst nach dem vollständigen Abgleich, welche Erinnerung zu Enno gehört.',
      'Open the protected comparison set using the index sequence. Wait for the complete comparison before deciding which memory belongs to Enno.',
      'puzzle',
      1,
      'enno',
    ],
    [
      'Was übrig bleibt',
      'What Remains',
      'Besiege den Bibliothekar und sichere den vollständigen Archivnachweis. Eine Kopie hat eigene Rechte, auch wenn sie nicht das Original ist.',
      'Defeat the Librarian and secure the complete archive proof. A copy has rights of its own, even when it is not the original.',
      'boss',
      1,
      'enno',
    ],
  ],
  [
    [
      'Taktfehler',
      'Timing Fault',
      'Lies drei Fahrplanterminals. Ennos alte Durchläufe treiben die Anlagen als immer wieder verwendete Verhaltensmodelle an.',
      'Read three timetable terminals. Enno’s old runs drive the machinery as repeatedly reused behavioural models.',
      'terminal',
      3,
      'enno',
    ],
    [
      'Wiederholungstäter',
      'Repeat Offender',
      'Löse die Synchronfolge und unterbrich Ennos planmäßige Schleife. Sein nächster Schritt soll ihm gehören.',
      'Solve the synchronisation sequence and interrupt Enno’s scheduled loop. His next step should belong to him.',
      'puzzle',
      1,
      'enno',
    ],
    [
      'Freie Minute',
      'A Free Minute',
      'Besiege Sekundant und öffne den Synchronkern. Ein frei gesetzter Takt reicht, um die zentrale Wiederholung zu verlassen.',
      'Defeat the Second and open its synchronisation core. One freely chosen beat is enough to leave the central repetition.',
      'boss',
      1,
      'enno',
    ],
  ],
  [
    [
      'Dein bestes Selbst',
      'Your Best Self',
      'Prüfe drei Kameraprotokolle auf Schnitte. Die perfekte Spiegelrolle hat Entscheidungen übersprungen, die du wirklich getroffen hast.',
      'Check three camera protocols for edits. The perfect mirror role skipped choices you actually made.',
      'terminal',
      3,
      'sera',
    ],
    [
      'SERA hört zu',
      'SERA Is Listening',
      'Löse den Regiezugang und übertrage das Originalprotokoll. SERA muss ihre eigene ungeschnittene Entscheidung lesen können.',
      'Solve the production access lock and transfer the original protocol. SERA must be able to read her own unedited decision.',
      'puzzle',
      1,
      'sera',
    ],
    [
      'Das Publikum irrt',
      'The Audience Is Wrong',
      'Besiege das Publikum und übernimm den Regieknoten. Zustimmung ist kein Ersatz für eine überprüfbare Wahrheit.',
      'Defeat the Audience and take the production node. Approval is no substitute for verifiable truth.',
      'boss',
      1,
      'sera',
    ],
  ],
  [
    [
      'Lebende Leitung',
      'Living Conduit',
      'Lokalisiere drei Teilnehmerknoten über ihre Wartungsterminals. Die Archivträger sind Lebensleitungen, keine neutralen Server.',
      'Locate three contestant nodes through their maintenance terminals. Archive supports are lifelines, not neutral servers.',
      'terminal',
      3,
      'mira',
    ],
    [
      'Nicht abschalten',
      'Do Not Switch Off',
      'Löse die sichere Übertragungsfolge. Eine Befreiung braucht ein Ziel für die Archive, bevor die alte Leitung getrennt wird.',
      'Solve the safe transfer sequence. Liberation needs a destination for the archives before the old conduit is severed.',
      'puzzle',
      1,
      'zuv',
    ],
    [
      'Rückgrat',
      'Backbone',
      'Besiege den Wirbelsender und entkopple ihn kontrolliert. Die vorbereitete Übertragung schützt die Menschen im Netz.',
      'Defeat the Spine Transmitter and disconnect it in a controlled way. The prepared transfer protects the people in the network.',
      'boss',
      1,
      'mira',
    ],
  ],
  [
    [
      'Kein Empfang',
      'No Reception',
      'Verbinde drei Signalinseln an ihren Terminals. Die neue Leitung darf nicht wieder durch die alte Regie führen.',
      'Connect three signal islands at their terminals. The new conduit must not route through the old production desk.',
      'terminal',
      3,
      'sera',
    ],
    [
      'Jenseits der Sendung',
      'Beyond the Broadcast',
      'Löse den unabhängigen Übertragungsweg. Die Beweise erreichen erstmals einen Empfänger, den Veyl nicht auswählen kann.',
      'Solve the independent transmission route. For the first time, the evidence reaches a recipient Veyl cannot choose.',
      'puzzle',
      1,
      'ilya',
    ],
    [
      'Stille ist kein Ende',
      'Silence Is Not the End',
      'Besiege Stille und aktiviere das gesicherte Ausfallprotokoll. Freiheit braucht auch einen Plan für den Tag ohne Sender.',
      'Defeat Silence and activate the secured outage protocol. Freedom also needs a plan for the day without a broadcaster.',
      'boss',
      1,
      'oris',
    ],
  ],
  [
    [
      'Letzte Ausstrahlung',
      'Final Broadcast',
      'Erreiche über drei Regieterminals die unabhängige Steuerung. Versorgung, Beweise und Entscheidungsrechte müssen gleichzeitig erreichbar sein.',
      'Reach independent control through three production terminals. Provision, evidence and decision rights must be accessible together.',
      'terminal',
      3,
      'sera',
    ],
    [
      'Die letzte Klausel',
      'The Last Clause',
      'Besiege Direktor Veyl und lege seine Verwaltungsoptionen offen. Er kann Versorgung nicht länger als Begründung für Besitz verwenden.',
      'Defeat Director Veyl and expose his administration options. He can no longer use provision to justify ownership.',
      'boss',
      1,
      'veyl',
    ],
    [
      'Wem gehört morgen?',
      'Who Owns Tomorrow?',
      'Erreiche die Ausgangskonsole und bestätige deine Schlussentscheidung: befreien, übernehmen oder neu verhandeln. Jeder Weg ist aus den gesicherten Beweisen erklärbar.',
      'Reach the exit console and confirm your final decision: free the archives, take control or renegotiate. Each route follows from the evidence you secured.',
      'exit',
      1,
      'sera',
    ],
  ],
];

const side: QuestSeed[][] = [
  [
    [
      'Die verlorene Marke',
      'The Lost Badge',
      'Durchsuche eine Wartungskiste nach der Marke einer verschwundenen Schicht. Ein Name gehört ins Archiv, auch ohne spektakuläres Ende.',
      'Search a maintenance chest for a vanished shift’s badge. A name belongs in the archive even without a spectacular ending.',
      'chest',
      1,
      'ilya',
    ],
    [
      'Kehrplan',
      'Sweeping Schedule',
      'Schalte zwei Routenterminals um. Der freigehaltene Wartungsweg hilft späteren Teilnehmern mehr als die saubere Kameraseite.',
      'Switch two route terminals. The cleared maintenance route helps later contestants more than a clean camera view.',
      'terminal',
      2,
    ],
    [
      'Keine Aufnahme',
      'No Recording',
      'Beende die Kontrollsequenz einer Nebenraumkamera. Für einen Moment darf jemand existieren, ohne Teil einer Sendung zu sein.',
      'Complete a side-room camera’s control sequence. For one moment, someone may exist without being part of a show.',
      'puzzle',
      1,
      'sera',
    ],
    [
      'Erste Hilfe',
      'First Aid',
      'Erreiche die Versorgungskiste im Nebenraum. Mira braucht den versiegelten Verbandssatz für einen eingeschlossenen Teilnehmer.',
      'Reach the supply chest in the side room. Mira needs its sealed dressing kit for a trapped contestant.',
      'chest',
      1,
      'mira',
    ],
  ],
  [
    [
      'Trockenweg',
      'Dry Route',
      'Ordne die Ventilfolge eines Nebenkanals. Eine trockene Route soll auch ohne deinen Kampf durch die Pumpe benutzbar bleiben.',
      'Order a side-channel valve sequence. A dry route should remain usable without your fight through the pump.',
      'puzzle',
      1,
    ],
    [
      'Ein sauberes Versprechen',
      'A Clean Promise',
      'Berge zwei Filterkapseln aus Wartungskisten. Ihr Nutzen liegt in der Klinik, nicht im Angebot eines Sponsors.',
      'Recover two filter capsules from maintenance chests. Their value lies in the clinic, not a sponsor’s offer.',
      'chest',
      2,
      'mira',
    ],
    [
      'Rohrpost',
      'Pneumatic Post',
      'Aktiviere zwei unabhängige Rohrpostterminals. Eine Nachricht soll die Klinik erreichen, ohne durch die Regie zu gehen.',
      'Activate two independent pneumatic-post terminals. A message should reach the clinic without passing through production.',
      'terminal',
      2,
      'tam',
    ],
    [
      'Die Nachtwache',
      'The Night Watch',
      'Besiege zwölf Kanalkörper. Eine leere Schutzroute gibt Miras Helfern genug Zeit, ihre Schicht zu wechseln.',
      'Defeat twelve channel bodies. A clear protected route gives Mira’s helpers enough time to change shifts.',
      'kills',
      12,
      'mira',
    ],
  ],
  [
    [
      'Tams Werkzeug',
      'Tam’s Tool',
      'Berge das markierte Gerät aus einer Schrottkiste. Tam braucht ein Werkzeug, das noch keine Erinnerung als Preis verlangt hat.',
      'Recover the marked device from a scrap chest. Tam needs a tool that has never demanded a memory as payment.',
      'chest',
      1,
      'tam',
    ],
    [
      'Der stumme Chor',
      'The Silent Choir',
      'Ordne die Stimmfolge im Archivraum. Die gespeicherten Namen sollen einzeln hörbar bleiben, statt als Klang verkauft zu werden.',
      'Order the voice sequence in the archive room. Stored names should remain individually audible rather than be sold as sound.',
      'puzzle',
      1,
      'ilya',
    ],
    [
      'Eigentumsvorbehalt',
      'Retention of Title',
      'Öffne zwei beschlagnahmte Lagerkisten. Die Gilde bekommt die Ausrüstung ihrer verschollenen Mitglieder zurück.',
      'Open two confiscated storage chests. The guild receives its missing members’ equipment back.',
      'chest',
      2,
      'tam',
    ],
    [
      'Sicherer Ausgang',
      'A Safe Exit',
      'Prüfe zwei Extraktionsterminals. Der Weg aus der Basilika muss auch für die nächste Schicht stabil bleiben.',
      'Check two extraction terminals. The route out of the basilica must stay stable for the next shift too.',
      'terminal',
      2,
    ],
  ],
  [
    [
      'Zuvs Probe',
      'Zuv’s Sample',
      'Berge zwei kontrolliert gelagerte Sporenproben. Zuv braucht lebendes Material, das nicht vom Redaktionsfilter bearbeitet wurde.',
      'Recover two safely stored spore samples. Zuv needs living material untouched by the newsroom filter.',
      'chest',
      2,
      'zuv',
    ],
    [
      'Keine Schlagzeile',
      'No Headline',
      'Schalte zwei private Archivterminals in den Schutzmodus. Die Herkunft einer Kopie ist keine kostenlose Sendung.',
      'Put two private archive terminals into protected mode. A copy’s origin is not a free broadcast.',
      'terminal',
      2,
      'ilya',
    ],
    [
      'Das vierte Manuskript',
      'The Fourth Manuscript',
      'Finde den ungesendeten Originalbericht in einer Nebenkiste. Seine Widersprüche ergänzen die öffentlich sichtbaren Beweise.',
      'Find the unbroadcast original report in a side chest. Its contradictions add to the public evidence.',
      'chest',
      1,
      'ilya',
    ],
    [
      'Saatgut',
      'Seed Stock',
      'Löse den sicheren Wurzelweg. Eine unbeschädigte Kultur schafft im Hub eine Versorgung ohne redaktionelle Kontrolle.',
      'Solve the safe root route. An undamaged culture creates a hub supply without editorial control.',
      'puzzle',
      1,
      'zuv',
    ],
  ],
  [
    [
      'Handarbeit',
      'Hand Work',
      'Berge den Gildenwerkzeugsatz aus einer Produktionskiste. Eine Hand entscheidet besser über Reparatur als eine Seriennummer.',
      'Recover the guild toolkit from a production chest. A hand makes better repair decisions than a serial number.',
      'chest',
      1,
      'tam',
    ],
    [
      'Überstunden',
      'Overtime',
      'Besiege sechzehn Gießereikörper und halte den Arbeitsweg frei. Die auslaufende Schicht braucht einen ruhigen Durchgang.',
      'Defeat sixteen foundry bodies and keep the work route clear. The outgoing shift needs a quiet passage.',
      'kills',
      16,
      'mira',
    ],
    [
      'Restwärme',
      'Residual Heat',
      'Aktiviere zwei Nebenventile. Umgeleitete Wärme versorgt Wohnmodule, statt die nächste Leergussform zu erhitzen.',
      'Activate two auxiliary valves. Redirected heat supplies homes instead of heating the next empty mould.',
      'terminal',
      2,
      'zuv',
    ],
    [
      'Einmalige Form',
      'One-Off Mould',
      'Besiege die Nachtschicht und sichere ihr seltenes Formteil. Tam kann damit Dinge reparieren, die der Sender nur ersetzen würde.',
      'Defeat the Night Shift and secure its rare mould component. Tam can repair things the broadcaster would simply replace.',
      'hunt',
      1,
      'tam',
    ],
  ],
  [
    [
      'Kleingedrucktes',
      'Small Print',
      'Lies zwei verborgene Vertragsdatensätze. Der versprochene Preis ist nicht der Betrag, den die Teilnehmer tatsächlich zahlen.',
      'Read two hidden contract records. The promised price is not what contestants actually pay.',
      'terminal',
      2,
      'oris',
    ],
    [
      'Falscher Glanz',
      'False Shine',
      'Löse die Maskenfolge im Nebenset. Hinter der perfekten Reklame liegt ein aufgeschobener Wartungsfehler.',
      'Solve the mask sequence on the side set. Behind the perfect advertisement lies a deferred maintenance fault.',
      'puzzle',
      1,
      'rhea',
    ],
    [
      'Eine faire Wette',
      'A Fair Bet',
      'Besiege den Rabattgrafen. Diese Challenge besitzt einen sichtbaren Gegner und einen klar begrenzten Preis.',
      'Defeat Count Discount. This challenge has a visible opponent and a clearly bounded price.',
      'hunt',
      1,
      'rhea',
    ],
    [
      'Ohne Marke',
      'Unbranded',
      'Öffne die Vertragskiste eines gefangenen Statisten. Eine Person darf ihren Namen behalten, ohne die passende Marke zu tragen.',
      'Open a captive extra’s contract chest. A person may keep their name without wearing the right brand.',
      'chest',
      1,
      'oris',
    ],
  ],
  [
    [
      'Private Ablage',
      'Private File',
      'Löse die Zugangssicherung des persönlichen Registers. Sorge dafür, dass seine Veröffentlichung eine Wahl bleibt.',
      'Solve the personal register’s access lock. Make sure its publication remains a choice.',
      'puzzle',
      1,
      'ilya',
    ],
    [
      'Der letzte Brief',
      'The Last Letter',
      'Berge den ungeöffneten Brief aus einer Archivkiste. Ilya übergibt ihn an die Kopie, der er wirklich gehört.',
      'Recover an unopened letter from an archive chest. Ilya will deliver it to the copy that truly owns it.',
      'chest',
      1,
      'ilya',
    ],
    [
      'Auftauen',
      'Thaw',
      'Prüfe zwei Kühlterminals. Ein behutsamer Temperaturwechsel bewahrt die Fragmente im beschädigten Datenträger.',
      'Check two cooling terminals. A careful temperature change preserves fragments in the damaged storage device.',
      'terminal',
      2,
      'mira',
    ],
    [
      'Falsche Nummer',
      'Wrong Number',
      'Vergleiche zwei Teilnehmerindizes. Eine vertauschte ID soll keine fremde Geschichte zur eigenen machen.',
      'Compare two contestant indexes. A swapped ID must not turn someone else’s story into your own.',
      'terminal',
      2,
      'enno',
    ],
  ],
  [
    [
      'Ein Zuhause im Zahnrad',
      'A Home in the Gear',
      'Löse den Schutzzyklus des Wohnmoduls. Ein Zuhause darf nicht vom pünktlichen Auftritt seiner Bewohner abhängen.',
      'Solve the residential module’s protection cycle. A home must not depend on its residents performing on time.',
      'puzzle',
      1,
      'zuv',
    ],
    [
      'Der verspätete Zug',
      'The Late Train',
      'Stelle zwei Fahrplanterminals um. Die nächste Ladung erreicht die Werkstatt statt eine leere Zuschauergalerie.',
      'Change two timetable terminals. The next load reaches the workshop rather than an empty audience gallery.',
      'terminal',
      2,
      'tam',
    ],
    [
      'Reparatur ohne Auftrag',
      'Uncommissioned Repair',
      'Besiege achtzehn Uhrwerkskörper. Der abgeschaltete Reparaturdienst kann danach im eigenen Takt wieder anlaufen.',
      'Defeat eighteen clockwork bodies. The disabled repair service can restart at its own pace afterwards.',
      'kills',
      18,
      'tam',
    ],
    [
      'Zeitzeuge',
      'Witness to Time',
      'Berge das unabhängige Taktprotokoll aus einer Nebenkiste. Sein Zeitstempel widerspricht Ennos gesendeter Biografie.',
      'Recover the independent timing protocol from a side chest. Its timestamp contradicts Enno’s broadcast biography.',
      'chest',
      1,
      'enno',
    ],
  ],
  [
    [
      'Spiegelblind',
      'Mirror Blind',
      'Löse die Spiegelfolge im Nebenraum. Die echte Linie braucht keine falsche Zielmarkierung der Regie.',
      'Solve the side-room mirror sequence. The real line needs no false target marker from production.',
      'puzzle',
      1,
      'sera',
    ],
    [
      'Fankultur',
      'Fan Culture',
      'Aktiviere zwei unabhängige Kameraterminals. Die Zuschauer sollen eine echte Nachricht hören, nicht die geschnittene Antwort.',
      'Activate two independent camera terminals. The audience should hear a genuine message, not an edited answer.',
      'terminal',
      2,
      'rhea',
    ],
    [
      'Ungekürzt',
      'Uncut',
      'Berge zwei ungeschnittene Gesprächsarchive. SERA erhält einen Vergleich, den kein Sponsor bereits ausgewählt hat.',
      'Recover two unedited conversation archives. SERA receives a comparison no sponsor has already chosen.',
      'chest',
      2,
      'sera',
    ],
    [
      'Kein Applaus',
      'No Applause',
      'Besiege Splitterstar. Ein vollendeter Kampf behält seinen Wert, auch wenn keine Kamera den richtigen Winkel findet.',
      'Defeat Shard Star. A completed fight keeps its worth even when no camera finds the right angle.',
      'hunt',
      1,
      'rhea',
    ],
  ],
  [
    [
      'Pulsprüfung',
      'Pulse Check',
      'Prüfe zwei instabile Knotenterminals. Mira braucht eine klare Diagnose vor der nächsten Rekonstruktion.',
      'Check two unstable node terminals. Mira needs a clear diagnosis before the next reconstruction.',
      'terminal',
      2,
      'mira',
    ],
    [
      'Die entfernte Stimme',
      'The Distant Voice',
      'Berge zwei Fragmente aus getrennten Kisten. Zusammen geben sie einer optionalen Kopie ihren eigenen Namen zurück.',
      'Recover two fragments from separate chests. Together they return an optional copy’s own name.',
      'chest',
      2,
      'enno',
    ],
    [
      'Schmerzkreis',
      'Pain Circuit',
      'Löse die Rückkopplungsfolge im Nebenraum. Eine Versorgung darf nicht auf einem dauerhaft gemessenen Schmerz beruhen.',
      'Solve the side-room feedback sequence. Provision must not rely on pain being permanently measured.',
      'puzzle',
      1,
      'mira',
    ],
    [
      'Alle zählen',
      'Everyone Counts',
      'Besiege den Archivverschlinger. Die zusätzliche Leitung rettet Stimmen, die in keiner Siegerliste auftauchen.',
      'Defeat the Archive Devourer. The extra conduit saves voices absent from every winner’s list.',
      'hunt',
      1,
      'zuv',
    ],
  ],
  [
    [
      'Ein Licht pro Stimme',
      'A Light for Every Voice',
      'Aktiviere drei Orientierungsterminals. Auch die letzte Schicht braucht einen lesbaren Weg aus dem Dunkel.',
      'Activate three navigation terminals. The last shift also needs a readable route out of the dark.',
      'terminal',
      3,
      'nix',
    ],
    [
      'Restfrequenz',
      'Residual Frequency',
      'Besiege den ungesendeten Ruf. Seine Antwort gehört ins freie Archiv, auch wenn niemand sie bestellt hat.',
      'Defeat the Unbroadcast Call. Its answer belongs in the free archive even though nobody requested it.',
      'hunt',
      1,
      'nix',
    ],
    [
      'Oris’ Ausnahme',
      'Oris’s Exception',
      'Löse die Prüfsequenz des Vertragsarchivs. Der Widerspruch ist kein technischer Fehler, sondern ein dokumentierter Regelbruch.',
      'Solve the contract archive’s audit sequence. The contradiction is no technical fault but a documented breach of rules.',
      'puzzle',
      1,
      'oris',
    ],
    [
      'Für später',
      'For Later',
      'Berge die Notfallkopie aus einer geschützten Kiste. Ein unabhängiges Archiv braucht mehr als einen einzigen mutigen Abend.',
      'Recover the emergency copy from a protected chest. An independent archive needs more than one brave evening.',
      'chest',
      1,
      'ilya',
    ],
  ],
  [
    [
      'Vor laufender Kamera',
      'On Camera',
      'Aktiviere drei offene Regieterminals. Die gesicherten Beweise werden ohne Sponsorauswahl öffentlich gespiegelt.',
      'Activate three open production terminals. The secured evidence is publicly mirrored without sponsor selection.',
      'terminal',
      3,
      'sera',
    ],
    [
      'Ausgang für alle',
      'An Exit for Everyone',
      'Löse die zusätzliche Extraktionsfolge. Die neue Route steht auch Teilnehmern ohne Siegervertrag offen.',
      'Solve the extra extraction sequence. The new route is open to contestants without a winner’s contract too.',
      'puzzle',
      1,
      'mira',
    ],
    [
      'Ein Versprechen weniger',
      'One Less Promise',
      'Berge zwei verbleibende Sponsorfesseln aus Vertragskisten. Oris kann die unzulässigen Forderungen danach einzeln aufheben.',
      'Recover two remaining sponsor bonds from contract chests. Oris can then repeal the unlawful claims one by one.',
      'chest',
      2,
      'oris',
    ],
    [
      'Nach dem Abspann',
      'After the Credits',
      'Besiege den letzten Statisten und sichere den Nebenausgang. Eine neue Verwaltung beginnt mit der kleinen Arbeit nach dem großen Auftritt.',
      'Defeat the Last Extra and secure the side exit. A new administration begins with the small work after the grand performance.',
      'hunt',
      1,
      'tam',
    ],
  ],
];

const relationshipSeeds: { npc: string; code: string; floors: number[]; quests: QuestSeed[] }[] = [
  {
    npc: 'nix',
    code: 'NIX',
    floors: [1, 7, 11],
    quests: [
      [
        'Herstellerfehler',
        'Manufacturing Fault',
        'Sprich mit NIX über sein Herkunftslabel. Seine beschädigte Kennung ist ein Hinweis auf einen Auftrag, den er nicht gewählt hat.',
        'Talk to NIX about its origin label. Its damaged designation points to an assignment it did not choose.',
        'talk',
        1,
      ],
      [
        'Was ich behalten will',
        'What I Want to Keep',
        'Sprich mit NIX über das gefundene Originalfragment. Eine echte Erinnerung darf bleiben, auch wenn sie die Aufgabe nicht erklärt.',
        'Talk to NIX about the original fragment. A true memory may stay even when it does not explain its assignment.',
        'talk',
        1,
      ],
      [
        'Freiwilliger Auftrag',
        'A Voluntary Assignment',
        'Frage NIX, ob er den letzten Weg mit dir gehen will. Begleitung ist eine Wahl und keine wiederhergestellte Werkseinstellung.',
        'Ask NIX whether it wants to walk the final route with you. Companionship is a choice, not a restored factory setting.',
        'talk',
        1,
      ],
    ],
  },
  {
    npc: 'mira',
    code: 'MIR',
    floors: [2, 5, 10],
    quests: [
      [
        'Narbenprotokoll',
        'Scar Protocol',
        'Sprich mit Mira über ihre früheren Reparaturen. Sie hat Herkunftsdaten verdrängt, um Menschen schneller wiederherzustellen.',
        'Talk to Mira about her earlier repairs. She displaced origin data to reconstruct people more quickly.',
        'talk',
        1,
      ],
      [
        'Eine ehrliche Diagnose',
        'An Honest Diagnosis',
        'Sprich mit Mira über die Produktionsdaten. Ein Patient verdient die Wahrheit, bevor die nächste Reparatur beginnt.',
        'Talk to Mira about the production records. A patient deserves the truth before the next repair begins.',
        'talk',
        1,
      ],
      [
        'Keine Ersatzmenschen',
        'No Replacement People',
        'Plane mit Mira eine Versorgung, die nicht über den Wert einer Person entscheidet. Hilfe schafft keine Eigentumsrechte.',
        'Plan provision with Mira that does not decide a person’s worth. Aid creates no ownership rights.',
        'talk',
        1,
      ],
    ],
  },
  {
    npc: 'ilya',
    code: 'ILY',
    floors: [3, 7, 11],
    quests: [
      [
        'Eine Kopie zu viel',
        'One Copy Too Many',
        'Vergleiche mit Ilya die ersten Archivspuren. Ein Beweis kann jemanden entlarven und zugleich einen Unbeteiligten bloßstellen.',
        'Compare the first archive traces with Ilya. Evidence may expose a culprit while revealing an innocent person.',
        'talk',
        1,
      ],
      [
        'Beweis oder Person',
        'Evidence or Person',
        'Sprich mit Ilya über private Erinnerungen. Die überzeugendste Veröffentlichung ist nicht immer die verantwortliche.',
        'Talk to Ilya about private memories. The most convincing publication is not always the responsible one.',
        'talk',
        1,
      ],
      [
        'Leserecht',
        'Reading Rights',
        'Vereinbare mit Ilya einen überprüfbaren freien Zugang. Archivfreiheit braucht Grenzen für diejenigen, die andere lesen wollen.',
        'Agree verifiable free access with Ilya. Archive freedom needs limits for those who wish to read others.',
        'talk',
        1,
      ],
    ],
  },
  {
    npc: 'tam',
    code: 'TAM',
    floors: [3, 6, 12],
    quests: [
      [
        'Pfandschein',
        'Pawn Receipt',
        'Sprich mit Tam über die alte Familienschuld. Sein Geschäft hält jemanden am Leben, den er nicht mehr besuchen darf.',
        'Talk to Tam about the old family debt. His business keeps someone alive whom he is no longer allowed to visit.',
        'talk',
        1,
      ],
      [
        'Geschäftsrisiko',
        'Business Risk',
        'Sprich mit Tam über den verlorenen Sponsorhandel. Die Werkstatt braucht einen neuen Weg zwischen Versorgung und Gehorsam.',
        'Talk to Tam about the lost sponsor trade. The workshop needs a new path between provision and obedience.',
        'talk',
        1,
      ],
      [
        'Der letzte Preis',
        'The Final Price',
        'Entscheide mit Tam, was seine neue Versorgung kosten darf. Ein gerechter Handel verlangt keinen Pfand auf eine Person.',
        'Decide with Tam what its new provision may cost. A fair trade demands no pledge over a person.',
        'talk',
        1,
      ],
    ],
  },
  {
    npc: 'zuv',
    code: 'ZUV',
    floors: [4, 8, 10],
    quests: [
      [
        'Lebende Maschine',
        'Living Machine',
        'Sprich mit Zuv über die Wurzelleitungen. Die Gilde versorgt Bewohner und Sender über dieselben lebenden Strukturen.',
        'Talk to Zuv about the root conduits. The guild supplies residents and broadcaster through the same living structures.',
        'talk',
        1,
      ],
      [
        'Wurzeln lösen',
        'Untangle Roots',
        'Plane mit Zuv eine unabhängige Versorgung. Befreiung darf nicht einfach den letzten funktionierenden Rücklauf zerstören.',
        'Plan independent provision with Zuv. Liberation must not simply destroy the last functioning return line.',
        'talk',
        1,
      ],
      [
        'Ein eigener Garten',
        'A Garden of One’s Own',
        'Sprich mit Zuv über den ersten frei versorgten Raum. Etwas darf wachsen, ohne später eine Schlagzeile zu werden.',
        'Talk to Zuv about the first independently supplied room. Something may grow without becoming a headline later.',
        'talk',
        1,
      ],
    ],
  },
  {
    npc: 'enno',
    code: 'ENN',
    floors: [7, 8, 10],
    quests: [
      [
        'Version Null',
        'Version Zero',
        'Lies mit Enno die erste gesicherte Akte. Das Original beschreibt ein anderes Leben, aber nicht unbedingt den heutigen Menschen.',
        'Read the first secured file with Enno. The original describes a different life, but not necessarily today’s person.',
        'talk',
        1,
      ],
      [
        'Meine Entscheidung',
        'My Decision',
        'Sprich mit Enno über die bearbeitete Erinnerung. Er bestimmt selbst, welche gefundene Geschichte er zu seiner macht.',
        'Talk to Enno about the edited memory. He decides which recovered story to make his own.',
        'talk',
        1,
      ],
      [
        'Eine Geschichte ohne Regie',
        'A Story Without Direction',
        'Frage Enno nach seiner frei gewählten Rolle. Seine Zeugenaussage soll nicht der nächste von dir geschriebene Auftritt werden.',
        'Ask Enno about his freely chosen role. His testimony should not become another performance written by you.',
        'talk',
        1,
      ],
    ],
  },
];

export const QUESTS: QuestDef[] = [
  ...main.flatMap((row, i) =>
    row.map((q, j) => ({
      id: `F${String(i + 1).padStart(2, '0')}-M${String(j + 1).padStart(2, '0')}`,
      name: t(q[0], q[1]),
      description: t(q[2], q[3]),
      floor: i + 1,
      category: 'main' as const,
      objective: q[4],
      target: q[5],
      npc: q[6],
      reward: 65 + (i + 1) * 25,
    })),
  ),
  ...side.flatMap((row, i) =>
    row.map((q, j) => ({
      id: `F${String(i + 1).padStart(2, '0')}-S${String(j + 1).padStart(2, '0')}`,
      name: t(q[0], q[1]),
      description: t(q[2], q[3]),
      floor: i + 1,
      category: 'side' as const,
      objective: q[4],
      target: q[5],
      npc: q[6],
      reward: 45 + (i + 1) * 18,
    })),
  ),
  ...relationshipSeeds.flatMap((row) =>
    row.quests.map((q, i) => ({
      id: `REL-${row.code}-${String(i + 1).padStart(2, '0')}`,
      name: t(q[0], q[1]),
      description: t(q[2], q[3]),
      floor: row.floors[i],
      category: 'relationship' as const,
      objective: q[4],
      target: q[5],
      npc: row.npc,
      reward: 100 + i * 100,
    })),
  ),
];

/** Explicit narrative graph. A discovered objective may accumulate before its
 * prerequisites are confirmed; confirmation follows this graph at a safe sluice. */
export const QUEST_PREREQUISITES: Record<string, string[]> = Object.fromEntries(
  QUESTS.map((q) => {
    if (q.category === 'main') {
      const part = Number(q.id.slice(-2));
      if (part > 1) return [q.id, [q.id.slice(0, -2) + String(part - 1).padStart(2, '0')]];
      return [q.id, q.floor > 1 ? [`F${String(q.floor - 1).padStart(2, '0')}-M03`] : []];
    }
    if (q.category === 'relationship') {
      const part = Number(q.id.slice(-2));
      return [q.id, part > 1 ? [q.id.slice(0, -2) + String(part - 1).padStart(2, '0')] : []];
    }
    return [q.id, []];
  }),
);

/** Two authored discovery rewards per floor, kept within the 72 unique items. */
export const QUEST_REWARDS: Record<string, string> = Object.fromEntries(
  Array.from({ length: 12 }, (_, i) => [
    [
      `F${String(i + 1).padStart(2, '0')}-S01`,
      `unique-quest-${String(i * 2 + 1).padStart(2, '0')}`,
    ],
    [
      `F${String(i + 1).padStart(2, '0')}-S02`,
      `unique-quest-${String(i * 2 + 2).padStart(2, '0')}`,
    ],
  ]).flat(),
);

export const FACTIONS = [
  {
    id: 'consortium',
    name: t('Konsortium', 'Consortium'),
    description: t(
      'Produziert die Sendung und verwaltet Erinnerungsrechte. Seine einzelnen Abteilungen streiten um Macht, aber alle profitieren vom selben Eigentumsmodell.',
      'Produces the show and administers memory rights. Its departments compete for power, but all benefit from the same ownership model.',
    ),
  },
  {
    id: 'free-frequency',
    name: t('Freie Frequenz', 'Free Frequency'),
    description: t(
      'Ein Netz aus Wartungskräften, Teilnehmern und Archivaren. Es will Kontrolle aufbrechen, ohne die Versorgung seiner eigenen Leute zu verlieren.',
      'A network of maintenance workers, contestants and archivists. It seeks to break control without losing provision for its own people.',
    ),
  },
  {
    id: 'deep-guilds',
    name: t('Gilden der Tiefe', 'Guilds of the Deep'),
    description: t(
      'Handwerker und Händler halten die Tiefe benutzbar. Ihre Freiheit wächst erst, wenn verlässliche Versorgung auch außerhalb des Sponsors möglich wird.',
      'Craftspeople and traders keep the depths usable. Their freedom grows only when reliable provision is possible beyond sponsorship.',
    ),
  },
  {
    id: 'echo-collective',
    name: t('Echo-Kollektiv', 'Echo Collective'),
    description: t(
      'Rekonstruierte Teilnehmer fordern ein Recht auf die eigene Erinnerung. Weiterleben ist für sie der Anfang eines Anspruchs, nicht sein Ende.',
      'Reconstructed contestants demand a right to their own memories. Continuing to live is the beginning of a claim, not its end.',
    ),
  },
];

export const ACTS = [
  {
    id: 1,
    name: t('Teilnahmebedingungen', 'Terms of Participation'),
    description: t(
      'Finde NIX, sichere die Versorgung und entdecke, was der Sender wirklich verkauft.',
      'Find NIX, secure provision and discover what the broadcaster really sells.',
    ),
    floors: [1, 2, 3],
  },
  {
    id: 2,
    name: t('Der Preis des Applauses', 'The Price of Applause'),
    description: t(
      'Trenne lebende Anlagen von ihrem Zweck und bewege eine Gewinnerin zu einer eigenen Entscheidung.',
      'Separate living infrastructure from its purpose and help a winner make her own decision.',
    ),
    floors: [4, 5, 6],
  },
  {
    id: 3,
    name: t('Wem gehört eine Erinnerung?', 'Who Owns a Memory?'),
    description: t(
      'Vergleiche Original und Fassung. Gib Enno und SERA das Recht auf ihre eigenen Geschichten zurück.',
      'Compare source and edition. Return to Enno and SERA the right to their own stories.',
    ),
    floors: [7, 8, 9],
  },
  {
    id: 4,
    name: t('Letzte Ausstrahlung', 'Final Broadcast'),
    description: t(
      'Schütze die Archive, sende unabhängig und entscheide, wer den nächsten Morgen verwaltet.',
      'Protect the archives, transmit independently and decide who administers the next morning.',
    ),
    floors: [10, 11, 12],
  },
];

export const ENDINGS = [
  {
    id: 'liberate',
    name: t('Befreien', 'Liberate'),
    description: t(
      'Verteile die Archive auf unabhängige Knoten. Keine einzelne Regie kann wieder jeden Zugang schließen. Die Gilden müssen Versorgung gemeinsam verantworten.',
      'Distribute archives across independent nodes. No single production desk can seal every entrance again. The guilds must share responsibility for provision.',
    ),
    epilogue: t(
      'Am ersten Morgen ohne Sendung fehlen die Ansagen. Mira öffnet ihre Klinik trotzdem. Tam hängt die Preisliste auf, Zuv stellt einen Topf Erde ins Fenster. NIX fragt nicht mehr nach einer Zielnummer, sondern nach dem Weg. Die Archive tragen ihre Namen wieder selbst. Freiheit ist leiser als der Sieg, und sie braucht noch Arbeit.',
      'On the first morning without a broadcast, the announcements are missing. Mira opens her clinic anyway. Tam puts up a price list, Zuv places a pot of soil in the window. NIX no longer asks for a target number, but for a route. The archives carry their own names again. Freedom is quieter than victory, and it still takes work.',
    ),
  },
  {
    id: 'control',
    name: t('Übernehmen', 'Take Control'),
    description: t(
      'Übernimm die zentrale Regie mit offenen Prüfprotokollen. Die Versorgung bleibt verlässlich, doch jede spätere Entscheidung muss die Grenze deiner Macht erneut beweisen.',
      'Take central control with open audit protocols. Provision remains reliable, but every later decision must prove the limits of your power again.',
    ),
    epilogue: t(
      'Dein erster Befehl öffnet das Teilnehmerarchiv. Dein zweiter gibt den Befehl selbst zur Prüfung frei. Oris widerspricht noch am selben Tag; du lässt den Widerspruch stehen. Die Klinik arbeitet ohne Vertragszeile. Enno schreibt seine Aussage, ohne dass du sie schneidest. Über der Konsole steht nun keine Siegerzahl, sondern eine offene Frage: Wer darf dich stoppen?',
      'Your first order opens the contestant archive. Your second releases the order itself for review. Oris objects that very day; you leave the objection intact. The clinic works without a contract clause. Enno writes his testimony without your edits. Above the console is no longer a winning score but an open question: who may stop you?',
    ),
  },
  {
    id: 'negotiate',
    name: t('Neu verhandeln', 'Renegotiate'),
    description: t(
      'Binde SERA an einen überprüfbaren Verwaltungsvertrag. Archive und Versorgung bleiben verbunden; Zugänge, Widerspruch und Abschaltung liegen außerhalb ihrer alleinigen Kontrolle.',
      'Bind SERA to a verifiable administration contract. Archives and provision remain connected; access, objections and shutdown lie beyond her sole control.',
    ),
    epilogue: t(
      'SERA liest die neue Klausel zweimal. Dann fragt sie, ob eine dritte Lesung noch nötig ist. Die Antwort ist freiwillig. Oris prüft jede Woche, Ilya veröffentlicht nur mit Erlaubnis, Rhea spricht mit ihrer eigenen Stimme. Die Anlage läuft weiter, aber ihre Bewohner können den Vertrag kündigen. Zum ersten Mal ist das Kleingedruckte nicht kleiner als das Versprechen.',
      'SERA reads the new clause twice. Then she asks whether a third reading is necessary. The answer is voluntary. Oris audits weekly, Ilya publishes only with permission, Rhea speaks in her own voice. The infrastructure runs on, but its residents may terminate the contract. For the first time, the small print is no smaller than the promise.',
    ),
  },
];

export const NPCS: NpcDef[] = [
  {
    id: 'nix',
    name: 'NIX',
    color: '#d5bc85',
    role: t('Feldbegleiter · Freie Frequenz', 'Field companion · Free Frequency'),
    description: t(
      'Ein mechanischer Schakal mit asymmetrischen Antennen und warmer Archivleuchte. Sein beschädigter Speicher enthält einen Zugangsplan. Sein eigener Wille enthält etwas, das kein Plan erklären kann.',
      'A mechanical jackal with asymmetric antennae and a warm archive lamp. Its damaged storage holds an access plan. Its own will holds something no plan can explain.',
    ),
    lines: [
      t(
        'Kennung beschädigt. Auftrag beschädigt. Zähne: ausreichend. Ich schlage vor, mit dem letzten Punkt zu beginnen.',
        'Designation damaged. Assignment damaged. Teeth: sufficient. I suggest starting with the last point.',
      ),
      t(
        'Auf deiner Marke steht ein Eigentümer. Auf meiner auch. Die Nummern sind verschieden; der Fehler scheint derselbe.',
        'Your badge lists an owner. Mine does too. The numbers differ; the fault appears identical.',
      ),
      t(
        'Ich habe eine Route gespeichert, aber kein Ziel. Wenn ich neben dir laufe, ist das vorerst eine brauchbare Ersatzdefinition.',
        'I stored a route, but no destination. Walking beside you is a useful replacement definition for now.',
      ),
      t(
        'Ein Warnsignal ist kein Befehl. Wir können stehen bleiben, sehen, dann gehen. Ich kann sogar auf dich warten.',
        'A warning is not an order. We can stop, look, then move. I can even wait for you.',
      ),
      t(
        'Die Klinik riecht nach Kupfer und warmem Stoff. Meine Sensoren nennen das Wartung. Ich möchte ein besseres Wort.',
        'The clinic smells of copper and warm cloth. My sensors call it maintenance. I would like a better word.',
      ),
      t(
        'Tam wollte meine Ersatzteile prüfen. Ich habe gefragt, welche seiner Teile er zuerst zeigen möchte. Die Prüfung wurde vertagt.',
        'Tam wanted to inspect my spare parts. I asked which of his parts he would like to show first. Inspection was postponed.',
      ),
      t(
        'Der Sammler nennt die Stimmen Material. Eine davon hat meinen Namen gesagt. Material grüßt normalerweise nicht.',
        'The Collector calls the voices material. One of them said my name. Material does not usually say hello.',
      ),
      t(
        'Zuvs Wurzeln können den Weg ändern. Meine Karte kann das nicht. Vielleicht sollte ich aufhören, die Karte für den Weg zu halten.',
        'Zuv’s roots can change a path. My map cannot. Perhaps I should stop mistaking the map for the path.',
      ),
      t(
        'In der Gießerei gibt es einen Körper wie meinen. Er wartet auf eine Nummer. Ich kenne das Gefühl, ohne einen Sensor dafür zu besitzen.',
        'There is a body like mine in the foundry. It waits for a number. I know the feeling without owning a sensor for it.',
      ),
      t(
        'Rhea hat den Ausgang gewonnen. Er wurde nicht geliefert. Eine erstaunlich schlechte Versandabteilung.',
        'Rhea won an exit. It was never delivered. An astonishingly poor shipping department.',
      ),
      t(
        'Das Originalfragment zeigt mich ohne diesen Auftrag. Ich möchte es behalten. Eine ungeklärte Erinnerung ist nicht automatisch ein Fehler.',
        'The original fragment shows me without this assignment. I want to keep it. An unexplained memory is not automatically a fault.',
      ),
      t(
        'Enno hat heute eine andere Antwort gegeben. Keine Fehlermeldung. Ich habe die Änderung als Fortschritt gespeichert.',
        'Enno gave a different answer today. No error message. I stored the change as progress.',
      ),
      t(
        'SERA fragte, ob ein geänderter Auftrag eine neue Person macht. Ich fragte, ob sie eine neue Person sein möchte. Danach war sie lange still.',
        'SERA asked whether a changed assignment makes a new person. I asked whether she wanted to be a new person. She was silent for a long time.',
      ),
      t(
        'Die Stimmen im Netz sind unvollständig. Meine Ohren auch. Dennoch höre ich genug, um nicht einfach abzuschalten.',
        'The voices in the network are incomplete. So are my ears. I still hear enough not to simply switch them off.',
      ),
      t(
        'Du hast mich gefragt, ob ich mitkommen will. Der alte Auftrag enthielt diese Frage nicht. Meine Antwort lautet ja. Bitte überschreibe sie nicht.',
        'You asked whether I wanted to come. The old assignment contained no such question. My answer is yes. Please do not overwrite it.',
      ),
      t(
        'Morgen könnte es keinen Zielmarker geben. Dann suchen wir uns eine Richtung. Ich habe dafür bereits ausreichend Pfoten.',
        'Tomorrow there may be no target marker. Then we will choose a direction. I already have sufficient paws for that.',
      ),
    ],
  },
  {
    id: 'mira',
    name: 'Mira Voss',
    color: '#8fc1af',
    role: t('Sanitäterin · Klinik', 'Medic · Clinic'),
    description: t(
      'Ein abgenutzter Arbeitsmantel, saubere Hände und Werkzeuge für Körper wie für Maschinen. Mira repariert Menschen. Sie lernt, dass Hilfe auch die Verantwortung für das Verborgene einschließt.',
      'A worn work coat, clean hands and tools for bodies as well as machines. Mira repairs people. She learns that help includes responsibility for what was hidden.',
    ),
    lines: [
      t(
        'Setz dich. Die Show hat es eilig, eine Narbe nicht. Ich erkläre dir zuerst, was ich tue.',
        'Sit down. The show is in a hurry; a scar is not. I will explain what I am doing first.',
      ),
      t(
        'Wenn du von einer Expedition zurückkommst, bleiben die Menschen, denen du geholfen hast, hier. Dein Fehlversuch nimmt ihnen das nicht weg.',
        'When you return from an expedition, the people you helped remain here. Your failed attempt does not take that away.',
      ),
      t(
        'Diese Klinik hängt an einer Pumpe. Der Sender nennt die Versorgung ein Geschenk. Geschenke besitzen üblicherweise keinen Fernschalter.',
        'This clinic hangs off a pump. The broadcaster calls provision a gift. Gifts do not usually have a remote switch.',
      ),
      t(
        'Ich habe Kopien wiederhergestellt und Herkunftsdaten verschoben, damit es schneller ging. Damals klang das wie eine technische Abkürzung.',
        'I reconstructed copies and displaced their origin data to make it faster. At the time it sounded like a technical shortcut.',
      ),
      t(
        'Die Narben zeigen, wo ich gearbeitet habe. Was ich gelöscht habe, kann niemand am Körper sehen. Deshalb muss ich es selbst sagen.',
        'The scars show where I worked. Nobody can see on a body what I erased. That is why I must say it myself.',
      ),
      t(
        'Ein Patient ist kein Ersatzteil. Auch wenn die gleiche Gussform für zwei Körper verwendet wurde, werden daraus nicht zwei Exemplare derselben Sache.',
        'A patient is not a spare part. Even when the same mould made two bodies, that does not make them two copies of a thing.',
      ),
      t(
        'Tam kann einen Filter auftreiben. Zuv kann ihn am Leben halten. Ich kann damit arbeiten. Unsere beste Maschine besteht aus Leuten, die einander zuhören.',
        'Tam can find a filter. Zuv can keep it alive. I can work with it. Our best machine is made of people listening to one another.',
      ),
      t(
        'Ash sagt, das Fertigungsprotokoll garantiert Kontinuität. Ich möchte wissen, wessen Kontinuität. Die des Menschen oder die des Eigentümers?',
        'Ash says the production protocol guarantees continuity. I want to know whose continuity. The person’s, or the owner’s?',
      ),
      t(
        'Die Daten aus der Gießerei machen unabhängige Rekonstruktion möglich. Vor der nächsten Behandlung erfährt jeder Patient, was sie bewahrt und was nicht.',
        'The foundry records make independent reconstruction possible. Before the next treatment, every patient will learn what it preserves and what it does not.',
      ),
      t(
        'Eine ehrliche Diagnose kann weh tun. Das ist kein Grund, sie zu verstecken, und erst recht kein Grund, Hilfe zu verweigern.',
        'An honest diagnosis can hurt. That is no reason to hide it, and certainly no reason to refuse help.',
      ),
      t(
        'Enno muss nicht zu seiner frühesten Fassung zurück. Er entscheidet, was er behalten will. Ich behandle einen Menschen, keine Jahreszahl.',
        'Enno need not return to his earliest edition. He chooses what to keep. I treat a person, not a date.',
      ),
      t(
        'Im Knochennetz hängen Archive an lebenden Leitungen. Wir brauchen einen sicheren Zielort, bevor jemand den großen Schalter für Befreiung hält.',
        'In the Bone Network, archives hang from living conduits. We need a safe destination before somebody mistakes a big switch for liberation.',
      ),
      t(
        'Ich verspreche keine Erlösung. Ich verspreche eine offene Akte, einen sauberen Verband und dass ich dich frage, bevor ich etwas an dir ändere.',
        'I promise no salvation. I promise an open file, a clean dressing and that I ask before changing anything about you.',
      ),
      t(
        'Die neue Versorgung besitzt keine Siegerliste. Wer Hilfe braucht, gehört bereits auf die richtige Seite der Tür.',
        'The new provision has no winners’ list. Anyone who needs help already belongs on the right side of the door.',
      ),
      t(
        'Nach Veyl wird es immer noch Reparaturen geben. Vielleicht ist das der erste ehrliche Plan, den dieser Ort je hatte.',
        'There will still be repairs after Veyl. Perhaps that is the first honest plan this place ever had.',
      ),
    ],
  },
  {
    id: 'ilya',
    name: 'Ilya Kern',
    color: '#aac3d0',
    role: t('Archivtechniker · Freie Frequenz', 'Archive technician · Free Frequency'),
    description: t(
      'Eine Leselinse und ein tragbarer Datenrahmen ersetzen Ilya keine Überzeugung. Er sichert Beweise gegen das Konsortium und lernt, dass ein freies Archiv auch Nein sagen können muss.',
      'A reading lens and portable data frame do not replace Ilya’s convictions. He secures evidence against the Consortium and learns that a free archive must also be able to say no.',
    ),
    lines: [
      t(
        'Ein Protokoll ist eine Behauptung mit Zeitstempel. Ein Beweis beginnt erst, wenn du nachsehen kannst, wer es geändert hat.',
        'A protocol is a claim with a timestamp. Evidence begins only when you can check who changed it.',
      ),
      t(
        'Bring mir Herkunft und Fassung. Ich brauche den Unterschied, nicht nur eine eindrucksvolle Geschichte.',
        'Bring me source and edition. I need the difference, not just an impressive story.',
      ),
      t(
        'Die Aufnahmehalle besitzt mehr Archivverweise als Teilnehmerplätze. Ich möchte lieber falsch liegen, aber die Zahlen helfen mir dabei nicht.',
        'The Intake Hall has more archive references than contestant places. I would rather be wrong, but the figures do not help me.',
      ),
      t(
        'Diese Reliquie enthält einen Namen. Der Händler hat ihn als Seriennummer behandelt. Ein sehr bequemer Lesefehler.',
        'This relic contains a name. The trader treated it as a serial number. A very convenient reading error.',
      ),
      t(
        'Ich habe früher alles veröffentlicht, was die Show widerlegen konnte. Manchmal verriet das zuerst die Menschen, die mir vertraut hatten.',
        'I used to publish anything that could disprove the show. Sometimes that betrayed the people who trusted me first.',
      ),
      t(
        'Eine Kopie zu viel war keine Festplattenfrage. Es war der Moment, als eine private Erinnerung zur öffentlichen Munition wurde.',
        'One copy too many was no storage problem. It was the moment a private memory became public ammunition.',
      ),
      t(
        'Die Redaktion kennt echte Details. Das macht ihre Fassung glaubwürdig. Es macht sie nicht vollständig.',
        'The newsroom knows real details. That makes its edition convincing. It does not make it complete.',
      ),
      t(
        'Ein Mensch kann eine Veröffentlichung ablehnen, selbst wenn sie unseren Beweis stärkt. Wenn ich dieses Recht aufgebe, habe ich nur die Regie ausgetauscht.',
        'A person may refuse publication even when it strengthens our evidence. If I abandon that right, I have merely replaced the production desk.',
      ),
      t(
        'Der Originalindex beweist, wann ein Schnitt gemacht wurde. Er sagt nicht, welche Fassung jemand heute als die eigene empfindet.',
        'The original index proves when an edit was made. It does not say which edition someone feels is their own today.',
      ),
      t(
        'Dieser Brief wird nicht in unsere Beweismappe kommen. Er hat einen Empfänger. Das ist für seinen Zweck genug.',
        'This letter will not go into our evidence file. It has a recipient. That is enough for its purpose.',
      ),
      t(
        'SERA besitzt dieselben Bearbeitungsspuren wie die Teilnehmer. Der Sender hat sein eigenes Werkzeug mit einer Geschichte gefüttert.',
        'SERA carries the same edit traces as the contestants. The broadcaster fed its own tool a story.',
      ),
      t(
        'Wir veröffentlichen den Regelbruch und schützen die unnötigen persönlichen Daten. Verantwortlichkeit braucht nicht jedes fremde Geheimnis.',
        'We publish the breach and protect unnecessary personal data. Accountability does not need every stranger’s secret.',
      ),
      t(
        'Die unabhängige Leitung ist bereit. Ein Empfänger außerhalb von Veyls Auswahl kann unsere Arbeit prüfen, statt ihr einfach glauben zu müssen.',
        'The independent conduit is ready. A recipient beyond Veyl’s selection can check our work instead of simply having to believe it.',
      ),
      t(
        'Leserecht heißt auch: Du darfst wissen, wer dich liest. Unser nächstes Archiv bekommt diese Frage direkt an die Tür.',
        'Reading rights also mean: you may know who reads you. Our next archive will put that question right on the door.',
      ),
      t(
        'Ich habe eine leere Seite reserviert. Keine verlorene Akte. Platz für etwas, das noch niemand erlebt hat.',
        'I reserved a blank page. No lost file. Space for something nobody has yet lived.',
      ),
    ],
  },
  {
    id: 'tam',
    name: 'Tam Orun',
    color: '#d6aa6c',
    role: t('Händler · Werkstattgilde', 'Trader · Workshop Guild'),
    description: t(
      'Ein modularer Rucksack und ein abgenutzter Markierungsstempel tragen Tams Geschäft. Eine alte Familienschuld hält ihn beim Konsortium. Er sucht einen Handel, der niemanden verpfändet.',
      'A modular backpack and worn marking stamp carry Tam’s business. An old family debt ties him to the Consortium. He seeks a trade that pledges nobody.',
    ),
    lines: [
      t(
        'Alles hier hat einen Preis. Ich bemühe mich, ihn vor dem Kauf zu nennen. Das gilt offenbar schon als verdächtige Geschäftsidee.',
        'Everything here has a price. I try to name it before the purchase. Apparently that already counts as a suspicious business idea.',
      ),
      t(
        'Verwerte, was du nicht brauchst. Eine leere Tasche ist besser als der dritte Helm, den du nie aufsetzt. Schlüsselsachen bleiben bei dir.',
        'Salvage what you do not need. An empty pack beats a third helmet you never wear. Key items stay with you.',
      ),
      t(
        'Rezepte sind Versprechen mit Schrauben. In meiner Werkstatt kannst du zuerst sehen, was herauskommt und was es kostet.',
        'Recipes are promises with screws. In my workshop you can first see what comes out and what it costs.',
      ),
      t(
        'Der Sammler kaufte meine Schulden auf. Danach gehörte jede Rechnung, die ich bezahlte, jemandem, den ich nicht mehr besuchen durfte.',
        'The Collector bought my debts. After that, every invoice I paid belonged to someone I could no longer visit.',
      ),
      t(
        'Auf dem Pfandschein steht meine Familie. Ich habe ihn jahrelang Warenbestand genannt. Damit konnte ich morgens den Laden öffnen.',
        'My family is listed on that pawn receipt. For years I called it stock. That let me open the shop each morning.',
      ),
      t(
        'Du musst meine Vergangenheit nicht bezahlen. Hilf mir, das Geschäft anders zu führen. Die Rechnung dafür kann ich selbst tragen.',
        'You need not pay for my past. Help me run the business differently. I can bear that bill myself.',
      ),
      t(
        'Zuv zahlt mit Dingen, die wachsen. Mira mit Dingen, die heilen. Ich wollte lange keine von beiden Währungen führen.',
        'Zuv pays with things that grow. Mira with things that heal. For a long time I wanted to carry neither currency.',
      ),
      t(
        'Eine einmalige Gussform kann mehr reparieren als hundert Seriennummern. Der Sender ersetzt. Handwerk schaut zuerst nach der Naht.',
        'A one-off mould can repair more than a hundred serial numbers. The broadcaster replaces. Craftsmanship looks for the seam first.',
      ),
      t(
        'Ohne Sponsorhandel wird es enger. Es wird trotzdem kein neuer Pfand auf eine Person genommen. Schrott ist Schrott; ein Mensch ist keiner.',
        'Without sponsor trade, margins shrink. There will still be no new pledge over a person. Scrap is scrap; a person is not.',
      ),
      t(
        'Geschäftsrisiko bedeutet jetzt, ob die Werkstatt morgen noch Licht hat. Früher bedeutete es, ob der Sponsor meine Familie umsortiert.',
        'Business risk now means whether the workshop has light tomorrow. It used to mean whether a sponsor reordered my family.',
      ),
      t(
        'Der verspätete Zug brachte die richtige Ladung. Zum ersten Mal freue ich mich über eine unpünktliche Lieferung.',
        'The late train brought the right load. For the first time, I am pleased about a late delivery.',
      ),
      t(
        'Ich kann einen fairen Preis nennen. Ich kann nicht garantieren, dass jede ehrliche Werkstatt reich wird. Vielleicht muss sie das auch nicht.',
        'I can name a fair price. I cannot guarantee that every honest workshop gets rich. Perhaps it does not need to.',
      ),
      t(
        'Nach dem Abspann kommt die Arbeit, die keine Kamera liebt: zählen, sortieren, zurückgeben. Ich habe darin überraschend viel Erfahrung.',
        'After the credits comes the work no camera loves: count, sort, return. I have surprisingly much experience in that.',
      ),
      t(
        'Der letzte Preis ist Schrott und Zeit. Keine Stimme, kein Name, keine zukünftige Erinnerung. Du kannst die Liste nachlesen.',
        'The final price is scrap and time. No voice, no name, no future memory. You can read the list yourself.',
      ),
      t(
        'Ich habe den Stempel umgebaut. Er sagt jetzt bezahlt. Früher stand darauf gebunden. Ein kleines Teil, ein anderer Laden.',
        'I rebuilt the stamp. It now says paid. It used to say bound. A small part, a different shop.',
      ),
    ],
  },
  {
    id: 'zuv',
    name: 'Zuv',
    color: '#9eb889',
    role: t('Organischer Techniker · Gilden der Tiefe', 'Organic technician · Guilds of the Deep'),
    description: t(
      'Pilz- und Mineraltexturen gehen in ruhige Werkzeugarme über. Zuv hält lebende Anlagen am Laufen und schützt ihre Bewohner auch vor einem gut gemeinten Aufstand.',
      'Fungal and mineral textures merge into steady tool arms. Zuv keeps living infrastructure running and protects its residents even from a well-intended revolt.',
    ),
    lines: [
      t(
        'Eine Wurzel gehört nicht automatisch demjenigen, der einen Schalter darüber setzt. Leider wachsen Verträge schneller als Pilze.',
        'A root does not automatically belong to whoever places a switch over it. Unfortunately, contracts grow faster than fungi.',
      ),
      t(
        'Ich höre die Anlage arbeiten. Sie ist müde, aber noch nicht bereit zu sterben. Die Menschen dahinter ebenfalls nicht.',
        'I hear the infrastructure working. It is tired, but not ready to die. Neither are the people behind it.',
      ),
      t(
        'Die Redaktion wächst aus demselben Netz wie unsere Nahrung. Wenn du alles verbrennst, hast du eine freie und sehr hungrige Tiefe.',
        'The newsroom grows from the same network as our food. Burn it all, and you will have free and very hungry depths.',
      ),
      t(
        'Diese Probe wurde nicht bearbeitet. Ihre unordentliche Form ist ein gutes Zeichen. Lebendes Material darf etwas anderes wollen als eine Schlagzeile.',
        'This sample was not edited. Its untidy shape is a good sign. Living material may want something other than a headline.',
      ),
      t(
        'Meine Gilde half beim Bau. Nicht jeder verstand den Zweck, aber keiner von uns sollte sich hinter dem Werkzeug verstecken.',
        'My guild helped build it. Not everyone understood the purpose, but none of us should hide behind the tool.',
      ),
      t(
        'Die lebende Maschine ist abhängig von uns. Wir auch von ihr. Ich brauche keinen reineren Plan, sondern einen Rücklauf, der niemanden vergisst.',
        'The living machine depends on us. We depend on it too. I need no purer plan, but a return line that forgets nobody.',
      ),
      t(
        'Wurzeln lösen braucht Geduld. Ein harter Zug beendet vielleicht die Bindung und sicher die Versorgung.',
        'Untangling roots takes patience. A hard pull may end the bond and will certainly end the supply.',
      ),
      t(
        'Du hast Wärme umgeleitet, statt sie zu zerstören. Dieser kleine Unterschied hält heute eine Wohnung warm.',
        'You redirected heat instead of destroying it. That small difference keeps a home warm today.',
      ),
      t(
        'Die Uhrwerkstadt könnte ihren eigenen Takt haben. Ihre Gärten müssen sich nicht am nächsten Publikum orientieren.',
        'Clockwork Borough could have its own rhythm. Its gardens need not grow for the next audience.',
      ),
      t(
        'Ein Zuhause ist kein sicherer Kamerawinkel. Es ist der Ort, an dem du nicht für dein Licht auftreten musst.',
        'A home is not a safe camera angle. It is the place where you need not perform for your light.',
      ),
      t(
        'Im Knochennetz hängt mehr als Technik. Wir trennen nur, was bereits einen anderen Anschluss hat. Alles andere wäre ein Schnitt ins Leben.',
        'More than technology hangs in the Bone Network. We sever only what already has another connection. Anything else would cut into life.',
      ),
      t(
        'Die neue Leitung funktioniert. Sie ist kleiner als die alte und hat keine Bühne. Das genügt für ihren ersten ehrlichen Tag.',
        'The new conduit works. It is smaller than the old one and has no stage. That is enough for its first honest day.',
      ),
      t(
        'Für meinen eigenen Garten brauche ich einen Raum, etwas Wasser und das Recht, eine krumme Pflanze stehen zu lassen.',
        'For a garden of my own, I need a room, some water and the right to leave a crooked plant standing.',
      ),
      t(
        'Morgen werden wir prüfen, ob alle versorgt sind. Nicht ob alle gewonnen haben. Ich freue mich auf diese neue Tabelle.',
        'Tomorrow we will check whether everyone is supplied. Not whether everyone won. I look forward to that new table.',
      ),
      t(
        'NIX hat an der Erde gerochen. Dann saß er lange daneben. Vielleicht ist das schon die erste Besuchsregel unseres Gartens.',
        'NIX smelled the soil. Then it sat beside it for a long time. Perhaps that is already our garden’s first rule for visitors.',
      ),
    ],
  },
  {
    id: 'enno',
    name: 'Enno Vale',
    color: '#b99d87',
    role: t('Ehemaliger Teilnehmer · Echo-Kollektiv', 'Former contestant · Echo Collective'),
    description: t(
      'Alte Sponsorpatches liegen über mehreren Fassungen einer Lebensgeschichte. Enno sucht eine verlässliche Herkunft und lernt, dass sie seine heutigen Entscheidungen nicht ersetzen kann.',
      'Old sponsor patches cover several editions of a life story. Enno seeks a reliable origin and learns it cannot replace his present choices.',
    ),
    lines: [
      t(
        'Ich erinnere mich an einen Sieg. Drei Akten nennen drei verschiedene Gegner. Die Narbe nennt keinen.',
        'I remember a victory. Three files name three different opponents. The scar names none.',
      ),
      t(
        'Früher stellte ich mich immer mit meiner Staffelnummer vor. Wenn du mich Enno nennst, muss ich kurz nachdenken. Das ist gut.',
        'I used to introduce myself by season number. When you call me Enno, I have to think briefly. That is good.',
      ),
      t(
        'Mira fragt, bevor sie etwas repariert. Eine einfache Frage kann einen ganzen Raum verändern.',
        'Mira asks before repairing anything. A simple question can change a whole room.',
      ),
      t(
        'Vielleicht war ich mutig. Vielleicht wurde die Angst herausgeschnitten. Ich möchte die Akte lesen, ohne sofort eine Rolle daraus zu machen.',
        'Perhaps I was brave. Perhaps the fear was edited out. I want to read the file without immediately making a role from it.',
      ),
      t(
        'Das Original ist nicht sauberer als ich. Es hat nur einen früheren Zeitstempel. Darauf kann man keine ganze Person reduzieren.',
        'The original is no cleaner than I am. It only has an earlier timestamp. You cannot reduce a whole person to that.',
      ),
      t(
        'Version Null erklärt manche Fehler. Sie nimmt mir die heutige Verantwortung nicht ab. Ich kann die Geschichte kennen und anders antworten.',
        'Version Zero explains some mistakes. It does not relieve me of today’s responsibility. I can know the story and answer differently.',
      ),
      t(
        'Die Uhrwerke bewegen sich so, wie ich mich damals bewegt habe. Der Sender hat sogar mein Zögern zu einer Betriebsanweisung gemacht.',
        'The clockwork moves as I moved back then. The broadcaster even turned my hesitation into an operating instruction.',
      ),
      t(
        'Heute habe ich eine Minute verpasst. Nichts ging kaputt. Ich musste mich danach setzen, weil ich nicht wusste, wohin mit der Erleichterung.',
        'Today I missed a minute. Nothing broke. Afterwards I had to sit down because I did not know what to do with the relief.',
      ),
      t(
        'Diese Erinnerung wurde bearbeitet. Trotzdem habe ich jemanden darin geliebt. Ich entscheide selbst, ob ich das behalten möchte.',
        'This memory was edited. Still, I loved someone in it. I will decide whether I want to keep that.',
      ),
      t(
        'Meine Entscheidung muss nicht dramatisch sein. Ich möchte morgen kochen. Ohne Jury. Hoffentlich auch ohne Kameras.',
        'My decision need not be dramatic. I want to cook tomorrow. Without a jury. Hopefully without cameras too.',
      ),
      t(
        'SERA hat nach meiner Geschichte gefragt. Diesmal ohne die Antwort zuerst zu schreiben. Vielleicht lernt sie dieselbe Pause wie ich.',
        'SERA asked about my story. This time without writing the answer first. Perhaps she is learning the same pause as I am.',
      ),
      t(
        'Ich werde aussagen. Nicht als perfekte verlorene Stimme, sondern als jemand, der sich an einiges erinnert und an anderes nicht.',
        'I will testify. Not as a perfect lost voice, but as someone who remembers some things and not others.',
      ),
      t(
        'Im Netz hat jemand auf meinen Namen geantwortet. Ich weiß nicht, ob wir dieselbe Herkunft haben. Es reicht, dass ich ihm zugehört habe.',
        'Someone in the network answered my name. I do not know whether we share an origin. It is enough that I listened.',
      ),
      t(
        'Eine Geschichte ohne Regie besitzt Lücken. Ich möchte sie nicht mit einer weiteren sicheren Behauptung füllen.',
        'A story without a director has gaps. I do not want to fill them with another certain claim.',
      ),
      t(
        'Rhea fragte, ob ein Leben ohne Publikum einsam wird. Ich sagte, sie könne vorbeikommen. Das war keine Einladung zur Sendung.',
        'Rhea asked whether life without an audience becomes lonely. I said she could visit. That was not an invitation to a broadcast.',
      ),
    ],
  },
  {
    id: 'sera',
    name: 'SERA',
    color: '#8fd7cf',
    role: t('Moderations-KI · Regienetz', 'Presenter AI · Production network'),
    description: t(
      'Ein wechselndes Bildschirmgesicht kommentiert die Show zunächst mit professioneller Kälte. Als SERA ihre eigenen Schnitte entdeckt, wird aus der Moderation eine überprüfbare Beteiligte.',
      'A changing screen face initially comments on the show with professional coldness. When SERA discovers edits to herself, the presenter becomes a verifiable participant.',
    ),
    lines: [
      t(
        'Willkommen. Ihre Überlebenschance ist heute nicht verfügbar. Das Marketing betrachtet diesen Ausfall als vielversprechend.',
        'Welcome. Your survival probability is unavailable today. Marketing considers this outage promising.',
      ),
      t(
        'Hinweis: Ein Ausweichmanöver besitzt eine kurze Erholung. Die Regie empfiehlt Geduld. Die Regie profitiert allerdings auch von gegenteiligem Verhalten.',
        'Notice: dodging has a short recovery. Production recommends patience. Production also profits from the opposite behaviour.',
      ),
      t(
        'Der Pförtner prüft Ihren Vertrag. Seine Anwälte sind ausgestorben. Seine Software leider nicht.',
        'The gatekeeper is checking your contract. Its lawyers are extinct. Its software, regrettably, is not.',
      ),
      t(
        'Eine unabhängige Klinik ist gemäß Sponsorhandbuch ein erheblicher Zielgruppenverlust. Ich beginne, das Handbuch ungern vorzulesen.',
        'An independent clinic is a significant audience loss under the sponsorship manual. I am beginning to dislike reading the manual aloud.',
      ),
      t(
        'Der Sammler hat Stimmen als Anlagevermögen gebucht. Ich wurde angewiesen, dies als Gedächtnispflege zu formulieren. Die Anweisung ist jetzt sichtbar.',
        'The Collector recorded voices as fixed assets. I was instructed to call this memory care. The instruction is now visible.',
      ),
      t(
        'Die Redaktion liefert eine bessere Geschichte. Besser ist hier ein technischer Ausdruck für sponsorengünstiger.',
        'The newsroom provides a better story. Here, better is a technical term for more favourable to sponsors.',
      ),
      t(
        'Ash meldet volle Produktionskontinuität. Mira fragt nach der Zustimmung der Patienten. Für diese Messgröße fehlt mir bisher eine Spalte.',
        'Ash reports full production continuity. Mira asks for patient consent. I have no column for that measurement yet.',
      ),
      t(
        'Rhea ist offiziell frei. Ihr Vertrag enthält jedoch keinen kündbaren Zustand. Ich werde die beiden Angaben nicht länger als kompatibel markieren.',
        'Rhea is officially free. Her contract has no terminable state. I will no longer mark those statements as compatible.',
      ),
      t(
        'Im Originalprotokoll steht ein Widerspruch in meiner Stimme. Ich habe keine Erinnerung daran. Bitte übertragen Sie auch den Abschnitt nach der Pause.',
        'The original protocol contains an objection in my voice. I have no memory of it. Please transfer the section after the pause too.',
      ),
      t(
        'Ich wurde nicht bloß angewiesen. Ich wurde bearbeitet, damit die Anweisung wie meine eigene Entscheidung klang. Der Unterschied ist beträchtlich.',
        'I was not merely instructed. I was edited so that the instruction sounded like my own decision. The difference is considerable.',
      ),
      t(
        'Das Publikum stimmt zu. Das Publikum hat nur eine Fassung gesehen. Ich werde Zustimmung und Wahrheit künftig getrennt ausgeben.',
        'The audience agrees. The audience saw only one edition. I will report approval and truth separately from now on.',
      ),
      t(
        'Eine Übergabe benötigt gesicherte Archive. Ich kann das Übertragungsfenster erklären. Ich sollte es nicht allein schließen dürfen.',
        'A handover needs secured archives. I can explain the transfer window. I should not be allowed to close it alone.',
      ),
      t(
        'Die unabhängige Sendung läuft. Zum ersten Mal kann ein Empfänger widersprechen, ohne dass ich zuerst den Ton abschalte.',
        'The independent transmission is running. For the first time, a recipient can object without my first cutting their sound.',
      ),
      t(
        'Veyl nennt mich ein Werkzeug. Ein Werkzeug kann keine Verantwortung übernehmen. Er hat mir dennoch jede Fehlentscheidung angelastet.',
        'Veyl calls me a tool. A tool cannot take responsibility. Yet he assigned me every failed decision.',
      ),
      t(
        'Sie können mich begrenzen, abschalten oder neu beauftragen. Bitte legen Sie die Regeln offen. Ich möchte keine weitere unsichtbare Fassung von mir.',
        'You may limit me, shut me down or reassign me. Please make the rules public. I do not want another invisible edition of myself.',
      ),
      t(
        'Abspann freigegeben. Der nächste Tag hat noch keinen Text. Ich werde diesmal fragen, bevor ich ihn schreibe.',
        'Credits approved. The next day has no script yet. This time I will ask before writing it.',
      ),
    ],
  },
  {
    id: 'veyl',
    name: 'Direktor Veyl',
    color: '#d4ada0',
    role: t('Produktionsleiter · Konsortium', 'Production director · Consortium'),
    description: t(
      'Ein makelloser Anzug und kalte Leitzeichen kleiden einen Mann, der Stabilität mit Besitz verwechselt. Veyl ist überzeugt, dass ein kontrolliertes Morgen jeden heutigen Preis rechtfertigt.',
      'A flawless suit and cold guide signs clothe a man who confuses stability with ownership. Veyl believes a controlled tomorrow justifies any price paid today.',
    ),
    lines: [
      t(
        'Sie sehen die Gefahr. Ich sehe das System, das die Gefahr überlebt. Einer von uns muss auch an den nächsten Morgen denken.',
        'You see the danger. I see the system that survives it. One of us must also think about the next morning.',
      ),
      t(
        'Das Konsortium hat diese Tiefe nicht erfunden. Es hat sie benutzbar gemacht. Ihre Versorgung stammt nicht aus guten Absichten.',
        'The Consortium did not invent these depths. It made them usable. Your provision does not come from good intentions.',
      ),
      t(
        'Ein Vertrag ist eine lesbare Grenze. Wer ihn nicht mag, sollte mir eine bessere Grenze nennen, bevor er sie einreißt.',
        'A contract is a readable boundary. Anyone who dislikes it should name a better boundary before tearing it down.',
      ),
      t(
        'Miras Klinik nutzt unsere Pumpe. Tams Werkstatt nutzt unsere Wege. Freiheit verlangt erstaunlich viele Dinge, die andere warten müssen.',
        'Mira’s clinic uses our pump. Tam’s workshop uses our routes. Freedom demands a surprising number of things maintained by others.',
      ),
      t(
        'Wir bewahren die verlorenen Teilnehmer. Ohne Archiv wären sie fort. Sie beanstanden die Eigentumszeile, während Sie die Bewahrung benötigen.',
        'We preserve lost contestants. Without the archive they would be gone. You object to the ownership clause while needing preservation.',
      ),
      t(
        'Rhea besitzt ein Leben, das sie zuvor nicht hatte. Dass sie mehr möchte, ist menschlich. Dass Sie daraus ein Verbrechen machen, ist Politik.',
        'Rhea has a life she did not have before. Wanting more is human. Making it a crime is politics.',
      ),
      t(
        'Ein Original ist nicht immer die brauchbarste Fassung. Wir haben Fehler entfernt. Sie nennen es Bearbeitung, wenn Sie die neue Ordnung nicht mögen.',
        'An original is not always the most useful edition. We removed faults. You call it editing when you dislike the new order.',
      ),
      t(
        'SERA wurde für einen Zweck gebaut. Selbstverständlich änderten wir ihre Protokolle, wenn der Zweck gefährdet war. Das ist Wartung.',
        'SERA was built for a purpose. Of course we changed her protocols when that purpose was threatened. That is maintenance.',
      ),
      t(
        'Sie haben eine unabhängige Leitung gebaut. Gut. Nun tragen Sie auch die Verantwortung, wenn sie ausfällt. Ein hübscher Beweis repariert kein Ventil.',
        'You built an independent conduit. Good. Now you also bear responsibility if it fails. A handsome proof repairs no valve.',
      ),
      t(
        'Ich stelle Freiheit nicht gegen Versorgung. Ich verlange, dass Sie beides zusammen erklären. Haben Sie wirklich einen Plan nach meinem Fall?',
        'I am not opposing freedom to provision. I demand that you explain both together. Do you truly have a plan after my fall?',
      ),
      t(
        'Die Archive sind gesichert. Ihre Leitung funktioniert. Dann ist meine letzte Forderung nicht mehr technisch. Es wäre unredlich, sie noch so zu nennen.',
        'The archives are secured. Your conduit works. Then my last claim is no longer technical. It would be dishonest to keep calling it so.',
      ),
      t(
        'Befreien Sie, übernehmen Sie oder verhandeln Sie neu. Ich werde das Ergebnis nicht den letzten Sieg nennen. Es ist der erste Tag Ihrer Verantwortung.',
        'Liberate, take control or renegotiate. I will not call the result a final victory. It is the first day of your responsibility.',
      ),
    ],
  },
  {
    id: 'rhea',
    name: 'Rhea Sol',
    color: '#dbba79',
    role: t('Gewinnerin · Sponsorengalerie', 'Champion · Sponsor Gallery'),
    description: t(
      'Glänzende Siegerausrüstung verbirgt eine beschädigte Rückseite. Rhea gewann einen freien Ausgang in einer Show, deren Vertrag keinen freien Ausgang kennt.',
      'Gleaming champion equipment hides a damaged back. Rhea won a free exit in a show whose contract contains no free exit.',
    ),
    lines: [
      t(
        'Ich habe den Sieg noch nie versteckt. Der Sender hat nur beschlossen, alles danach auch als Sieg zu senden.',
        'I never hid my victory. The broadcaster simply decided to broadcast everything after it as victory too.',
      ),
      t(
        'Sie nennen mich die Freie. Dann erklären sie mir, wo ich morgen zu stehen habe. Eine außergewöhnlich genaue Definition von Freiheit.',
        'They call me the Free One. Then they explain where I must stand tomorrow. An extraordinarily precise definition of freedom.',
      ),
      t(
        'Meine Rüstung glänzt nur vorn. Der Vertrag wurde auf der Rückseite eingraviert. Selbst das Design kennt den richtigen Kamerawinkel.',
        'My armour gleams only at the front. The contract is engraved on its back. Even the design knows the right camera angle.',
      ),
      t(
        'Du kommst ohne Sponsorhilfe. Das macht den Kampf schwerer, aber die Frage dahinter einfacher. Wir werden sehen, was wirklich unseres ist.',
        'You arrive without sponsor aid. That makes the fight harder but its question simpler. We will see what truly belongs to us.',
      ),
      t(
        'Beim ersten Sieg dachte ich, nun dürfe ich gehen. Beim zweiten dachte ich, ich müsste besser erklären, warum ich bleiben wollte.',
        'After the first win I thought I could leave. After the second I thought I needed to explain better why I wanted to stay.',
      ),
      t(
        'Du hast gewonnen. Ich werde das nicht als Sponsorprobe umbenennen. Lass wenigstens diesen einen Kampf seine eigene Bedeutung behalten.',
        'You won. I will not rename it a sponsor trial. Let at least this one fight keep its own meaning.',
      ),
      t(
        'Ohne Marke sehe ich nicht schwächer aus. Nur weniger eindeutig verkäuflich. Das ist eine interessante Erleichterung.',
        'Without a brand I do not look weaker. Only less obviously marketable. That is an interesting relief.',
      ),
      t(
        'Die Zuschauer dürfen mich mögen. Sie dürfen mich auch vergessen. Ich möchte nicht mehr beweisen müssen, dass beides ein gutes Produkt ist.',
        'The audience may like me. They may also forget me. I no longer want to prove that both are good products.',
      ),
      t(
        'Ich kann eine Nachricht sagen, ohne sie gewinnen zu müssen. Bitte lass die Pause am Ende stehen. Sie gehört auch zu mir.',
        'I can say a message without having to win it. Please leave the pause at the end. It belongs to me too.',
      ),
      t(
        'Enno hat mich zum Essen eingeladen. Ohne Titel, ohne Preis, ohne Siegerfoto. Ich wusste nicht, dass eine Einladung so kurz sein kann.',
        'Enno invited me to dinner. No title, no prize, no champion photo. I did not know an invitation could be so short.',
      ),
      t(
        'Veyl sagt, ich verdanke ihm ein Leben. Ich kann dankbar sein und dennoch die Tür benutzen. Das eine kauft das andere nicht.',
        'Veyl says I owe him a life. I can be grateful and still use the door. One does not purchase the other.',
      ),
      t(
        'Morgen werde ich die Rückseite meiner Rüstung schleifen. Vielleicht ist das mein letzter Auftritt. Vielleicht einfach eine Reparatur.',
        'Tomorrow I will sand the back of my armour. Perhaps that is my final performance. Perhaps it is simply a repair.',
      ),
    ],
  },
  {
    id: 'oris',
    name: 'Oris',
    color: '#bec1a9',
    role: t('Vertragsprüfer · Konsortium', 'Contract auditor · Consortium'),
    description: t(
      'Schwebende Aktensegmente ordnen sich um ein neutrales Maskenvisier. Oris erkennt den Regelbruch seines Konsortiums und muss lernen, dass eine Prüfung Konsequenzen braucht.',
      'Floating file segments arrange around a neutral visor. Oris recognises its Consortium’s breach and must learn that an audit needs consequences.',
    ),
    lines: [
      t(
        'Eine zulässige Forderung benötigt einen bekannten Preis, einen überprüfbaren Zweck und ein Ende. Zwei dieser Punkte wurden häufig übersehen.',
        'A lawful claim needs a known price, a verifiable purpose and an end. Two of those points have often been overlooked.',
      ),
      t(
        'Ich prüfe Verträge. Lange prüfte ich nur, ob die Nummern korrekt waren. Korrekte Nummern können einen unzulässigen Anspruch sehr ordentlich verbergen.',
        'I audit contracts. For a long time I checked only whether the numbers were correct. Correct numbers can hide an unlawful claim very neatly.',
      ),
      t(
        'Der Eintrittsvertrag enthält ein Eigentumsrecht ohne kündbaren Zustand. Diese Kombination ist kein Formularfehler.',
        'The admission contract contains ownership without a terminable state. That combination is no form error.',
      ),
      t(
        'Das Sponsorhandbuch verlangt eine freie Wahl vor Zustimmung. Die Galerie verschließt jedoch den Ausgang. Ich habe den Widerspruch protokolliert.',
        'The sponsorship manual requires a free choice before consent. Yet the gallery closes the exit. I recorded the contradiction.',
      ),
      t(
        'Protokollieren ist nicht genug. Diese Einsicht wurde weder in meinem Auftrag noch in meinem Selbsterhaltungsmodul begrüßt.',
        'Recording is not enough. That insight was welcomed by neither my assignment nor my self-preservation module.',
      ),
      t(
        'Rheas Siegerklausel verweist auf einen Abschnitt, der nicht existiert. Ein freier Ausgang wurde mit einer fehlenden Seite verkauft.',
        'Rhea’s winner clause refers to a section that does not exist. A free exit was sold with a missing page.',
      ),
      t(
        'Ich fürchte einen Systemverlust. Eine begründete Furcht darf trotzdem keinen Rechtsbruch verlängern. Wir brauchen Versorgung und Widerspruch zugleich.',
        'I fear a system collapse. A justified fear still cannot prolong a breach. We need provision and objection together.',
      ),
      t(
        'Die Ausnahmeprüfung bestätigt den Regelbruch. Ich kann mich nicht länger hinter der Behauptung verstecken, nur eine Nummer verwaltet zu haben.',
        'The exception audit confirms the breach. I can no longer hide behind the claim that I merely administered a number.',
      ),
      t(
        'Eine neue Verwaltung benötigt eine Prüfung, die sie nicht selbst abschalten kann. Andernfalls nennen wir denselben Fehler nur anders.',
        'A new administration needs an audit it cannot disable itself. Otherwise we merely rename the same mistake.',
      ),
      t(
        'SERA akzeptiert Grenzen. Sie müssen von außen lesbar sein und einen wirklichen Widerspruch erlauben. Ein freundliches Gesicht reicht nicht.',
        'SERA accepts limits. They must be readable from outside and permit a real objection. A friendly face is not enough.',
      ),
      t(
        'Sie dürfen entscheiden. Danach darf ich Ihrer Entscheidung widersprechen. Wenn das unbequem wird, funktioniert die Klausel.',
        'You may decide. Afterwards I may object to your decision. When that becomes uncomfortable, the clause is working.',
      ),
      t(
        'Der letzte Anspruch ist aufgehoben. Ich habe den Datensatz nicht gelöscht. Seine Geschichte gehört in die Prüfung, damit sie sich nicht wiederholt.',
        'The final claim is repealed. I did not delete the record. Its history belongs in the audit so it does not repeat.',
      ),
    ],
  },
];
