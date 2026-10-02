import type { Text } from '../game/types';
import type {
  OriginDef,
  CityDef,
  CityQuestDef,
  NarrativeChoice,
  StoryChapter,
} from '../game/narrative-types';

const t = (de: string, en: string): Text => ({ de, en });
const choice = (
  id: string,
  de: string,
  en: string,
  consequenceDe: string,
  consequenceEn: string,
  faction: NarrativeChoice['faction'],
  reputation: number,
  bonus: { scrap?: number; marks?: number } = {},
): NarrativeChoice => ({
  id,
  label: t(de, en),
  consequence: t(consequenceDe, consequenceEn),
  faction,
  reputation,
  ...bonus,
});

export const ORIGINS: OriginDef[] = [
  {
    id: 'maintenance',
    name: t('Die letzte Nachtschicht', 'The Last Night Shift'),
    profession: t('Instandhaltung im Südring', 'South Ring maintenance'),
    description: t(
      'Du kanntest jede Leitung deiner Stadt. Deshalb weißt du, dass die Katastrophe kein Unfall war.',
      'You knew every conduit in your city. That is how you know the disaster was deliberate.',
    ),
    opening: [
      t(
        'Im Südring roch der Morgen nach warmem Metall und Brot. Deine Schwester Lea stellte jeden Sonntag eine Tasse auf deinen Werkzeugkasten, damit du endlich Feierabend machtest. Ihr strittet über die kaputte Küchenuhr. Niemand stritt darüber, ob der nächste Morgen kommen würde.',
        'Morning in the South Ring smelled of warm metal and bread. Every Sunday your sister Lea put a cup on your toolbox to make you stop working. You argued about the broken kitchen clock. Nobody argued about whether there would be another morning.',
      ),
      t(
        'Dann kam die Evakuierung. Du sahst, wie intakte Notpumpen einzeln vom Netz gingen. Eine Leitung, die laut Plan gar nicht existierte, zog den Strom ab. Lea half am Bahnsteig Kindern in die Züge. Du bliebst zurück, um den letzten Fluchtweg offen zu halten.',
        'Then came the evacuation. You watched functioning emergency pumps disconnect one by one. A conduit absent from every plan siphoned their power. Lea helped children onto trains. You stayed to keep the final escape route open.',
      ),
      t(
        'Die Stadt versank nicht in Feuer. Sie versank in Schnittbildern. Auf jeder Anzeige lief dein Gesicht unter dem Titel „Freiwillige Teilnahme“. Die Hand, mit der du den Nothebel gehalten hattest, setzte im Film deine Unterschrift. Von Lea blieb nur eine Durchsage: Wagen Sieben.',
        'The city did not vanish in fire. It vanished in edits. Every display showed your face beneath the title “Voluntary Participation”. The hand that had held the emergency lever signed your name in the film. All that remained of Lea was an announcement: Carriage Seven.',
      ),
      t(
        'Du erwachst unter der Aufnahmehalle. Ein mechanischer Schakal zieht einen verbrannten Draht aus deiner Manschette. „NIX“, sagt er. „Deine Schwester hat mir etwas anvertraut. Leider hat jemand versucht, mich zu formatieren.“ Hinter seinen Augen blinkt der Rhythmus eurer defekten Küchenuhr.',
        'You wake below the Intake Hall. A mechanical jackal pulls a burnt wire from your cuff. “NIX,” he says. “Your sister entrusted something to me. Unfortunately, someone tried to format me.” Behind his eyes blinks the rhythm of your broken kitchen clock.',
      ),
    ],
    personalGoal: t(
      'Finde Lea, rekonstruiere den sabotierten Fluchtweg und verhindere, dass eine weitere Stadt als Bewerbung verkauft wird.',
      'Find Lea, reconstruct the sabotaged escape route, and prevent another city from being sold as an audition.',
    ),
    keepsake: t(
      'Ein verbogener Notleitungsschlüssel. Lea hat „Komm nach Hause“ auf den Griff geritzt.',
      'A bent emergency-conduit key. Lea scratched “Come home” into its handle.',
    ),
  },
  {
    id: 'dispatch',
    name: t('Die Stimme am Bahnsteig', 'The Voice on the Platform'),
    profession: t('Leitstelle der Ringbahn', 'Ring Railway dispatcher'),
    description: t(
      'Du hast tausend Menschen sicher nach Hause geführt. In der offiziellen Aufzeichnung hast du sie verraten.',
      'You guided a thousand people safely home. In the official recording, you betrayed them.',
    ),
    opening: [
      t(
        'Du kanntest die Stadt an ihren Stimmen: müde Schichtarbeiter, die Witze deiner Schwester Lea, die Kinder, die deine Bahnansagen nachahmten. Deine Leitstelle hing über dem Südring. Von dort sah man Fenster, keine Kulissen.',
        'You knew the city by its voices: exhausted shift workers, your sister Lea’s jokes, children imitating your station announcements. Your control room overlooked the South Ring. From there you could see windows, not scenery.',
      ),
      t(
        'Als die Warnung kam, reserviertest du drei Züge für die Kliniken. Lea begleitete den letzten. Die Signale wechselten hinter ihm auf Grün, obwohl du sie auf Rot verriegelt hattest. Ein vierter Zug stand in keinem Fahrplan. An seinen Fenstern klebten kleine schwarze Kameras.',
        'When the warning came, you reserved three trains for the clinics. Lea escorted the last one. The signals turned green behind it despite your red interlocks. A fourth train appeared on no timetable. Small black cameras clung to its windows.',
      ),
      t(
        'Du hörtest deine eigene Stimme den vierten Zug freigeben. Du hattest diese Worte nicht gesprochen. Sekunden später sendeten die Anzeigen ein Jubelvideo: Die Stadt habe sich freiwillig gemeldet. Als du die Rohaufnahme sichern wolltest, löschte sich die Leitstelle Stockwerk für Stockwerk aus dem Verzeichnis.',
        'You heard your own voice authorise the fourth train. You had not spoken those words. Seconds later the displays broadcast a celebration: the city had volunteered. As you tried to save the raw recording, the control room disappeared from the directory floor by floor.',
      ),
      t(
        'Im Dunkeln wartet NIX neben einem Fahrkartenautomaten. Aus seinem beschädigten Lautsprecher kommt Leas Stimme: „Lass sie nicht mit unserer Stimme reden.“ Er kennt deinen Namen und die Nummer von Wagen Sieben. Den Rest nennt er eine Erinnerung, die sich nur von innen öffnen lässt.',
        'In the dark, NIX waits beside a ticket machine. Lea’s voice emerges from his damaged speaker: “Do not let them speak with our voices.” He knows your name and the number of Carriage Seven. He calls the rest a memory that can only be opened from inside.',
      ),
    ],
    personalGoal: t(
      'Hole Lea aus dem gesperrten Zugarchiv und gib den Vermissten ihre eigenen Stimmen zurück.',
      'Bring Lea back from the locked train archive and return the missing people’s own voices.',
    ),
    keepsake: t(
      'Leas unentwertete Fahrkarte. Unter dem Zielort steht ein handgeschriebenes „zusammen“.',
      'Lea’s unused ticket. Beneath the destination she wrote “together”.',
    ),
  },
  {
    id: 'archive',
    name: t('Das widersprechende Original', 'The Dissenting Original'),
    profession: t('Städtische Erinnerungsstelle', 'Municipal memory office'),
    description: t(
      'Du hast Identitäten vor dem Vergessen geschützt. Nun gehört deine eigene Erinnerung dem Sender.',
      'You protected identities from oblivion. Now the broadcaster owns your own memory.',
    ),
    opening: [
      t(
        'Deine Arbeit bestand darin, gewöhnliche Leben festzuhalten: Geburtstage, verlorene Briefe, die Namen alter Nachbarn. Deine Schwester Lea brachte dir beschädigte Aufnahmen aus der Klinik. Ihr wart euch einig: Ein Mensch ist mehr als die brauchbare Version seiner Geschichte.',
        'Your work preserved ordinary lives: birthdays, lost letters, the names of old neighbours. Your sister Lea brought damaged recordings from the clinic. You agreed that a person was more than the useful version of their story.',
      ),
      t(
        'Eine Woche vor der Evakuierung tauchten Sterbeurkunden lebender Menschen auf. Auf allen stand derselbe Zeitstempel. Du verstecktest die Originale in einer analogen Kassette. Lea sollte sie mit der Ringbahn aus dem Südring bringen. Sie schaffte es bis Wagen Sieben.',
        'A week before the evacuation, death certificates appeared for people still alive. All carried the same timestamp. You hid the originals on an analogue cassette. Lea was to carry it out of the South Ring by rail. She reached Carriage Seven.',
      ),
      t(
        'Dann sahst du dich auf einer Anzeige die Katastrophe bestätigen. Dein aufgezeichnetes Ich behauptete, alle Bewohner hätten einer Übertragung zugestimmt. Im Archiv standen inzwischen deine erfundenen Worte. Die Fälschung war älter als das Ereignis, das sie beschrieb.',
        'Then a display showed you confirming the disaster. Your recorded self claimed every resident had consented to broadcast. Your fabricated words were already in the archive. The forgery predated the event it described.',
      ),
      t(
        'NIX findet dich zwischen aussortierten Namensschildern. Er trägt eine Kassettenspule unter seiner Panzerung. „Lea wollte, dass du das Original siehst“, sagt er. Die Spule enthält deine Stimme aus einer Zukunft, an die du dich nicht erinnerst. Darunter steht: Direktion, Sendekern.',
        'NIX finds you among discarded nameplates. A cassette spool rests beneath his armour. “Lea wanted you to see the original,” he says. The spool contains your voice from a future you do not remember. Beneath it is written: Directorate, Broadcast Core.',
      ),
    ],
    personalGoal: t(
      'Finde Lea und das ungeschnittene Katastrophenprotokoll. Entscheide, wer über die Wahrheit verfügen darf.',
      'Find Lea and the unedited disaster record. Decide who has the right to hold the truth.',
    ),
    keepsake: t(
      'Eine analoge Kassettenspule. Auf dem Etikett steht Leas Handschrift, unter einer zweiten fremden Unterschrift.',
      'An analogue cassette spool. Lea’s handwriting sits on the label beneath a second, unfamiliar signature.',
    ),
  },
];

export const CITIES: CityDef[] = [
  {
    id: 'haven',
    name: t('Kesselhafen', 'Boilerhaven'),
    tagline: t(
      'Ein Bahnhof, den der Sender vergessen soll.',
      'A station the broadcaster is supposed to forget.',
    ),
    unlockFloor: 1,
    materialFloor: 1,
    description: t(
      'Stillgelegte Züge stehen um einen alten Heizkessel. Flüchtlinge wohnen in Abteilen, handeln auf dem Bahnsteig und schreiben die Namen Vermisster auf die Tunnelwand. Weil Kesselhafen in keinem Sendeplan steht, haben seine Bewohner vorerst das Recht, gewöhnlich zu sein.',
      'Abandoned trains surround an old boiler. Refugees live in compartments, trade on the platform and write missing people’s names on the tunnel wall. Because Boilerhaven appears on no broadcast schedule, its residents still have the right to be ordinary.',
    ),
    npcIds: ['nix', 'tam', 'mira', 'ilya'],
    districts: [
      { name: t('Kesselmarkt', 'Boiler Market'), kind: 'market' },
      { name: t('Schlafwagen Sieben', 'Sleeper Seven'), kind: 'residential' },
      { name: t('Wand der Namen', 'Wall of Names'), kind: 'archive' },
      { name: t('Rote Weiche', 'Red Junction'), kind: 'gate' },
    ],
    ambientLines: [
      t(
        'Jemand hat über das Schild „Nicht betreten“ ein „Willkommen“ gemalt.',
        'Someone has painted “Welcome” over the “Do not enter” sign.',
      ),
      t(
        'Eine Mutter zählt Tassen, bevor sie ihre Kinder zählt. Beides muss stimmen.',
        'A mother counts cups before she counts her children. Both numbers must be right.',
      ),
      t(
        'Der Heizkessel schlägt unregelmäßig. Tam behauptet, ein gesundes Herz dürfe das.',
        'The boiler beats unevenly. Tam insists a healthy heart is allowed to.',
      ),
      t(
        'An der Namenswand steht LEA. Dahinter hat jemand ein Fragezeichen eingeritzt.',
        'LEA is written on the wall of names. Someone scratched a question mark after it.',
      ),
    ],
  },
  {
    id: 'lantern',
    name: t('Laternenhain', 'Lantern Grove'),
    tagline: t('Die Pilze erinnern sich an jede Lüge.', 'The mushrooms remember every lie.'),
    unlockFloor: 4,
    materialFloor: 4,
    description: t(
      'Ein Myzel beleuchtet die Dächer einer gewachsenen Stadt. Zuvs Gärtner ernähren ihre Nachbarn, während Ilyas Archivare Nachrichten vor dem Redaktionsfilter verstecken. Der gemeinsame Pilz speichert auch Stimmen. Die Frage, wem diese gehören, entzweit ganze Familien.',
      'A mycelium lights the roofs of a grown city. Zuv’s gardeners feed their neighbours while Ilya’s archivists hide reports from the editorial filter. The shared fungus stores voices too. The question of who owns them has divided entire families.',
    ),
    npcIds: ['zuv', 'mira', 'ilya', 'sera'],
    districts: [
      { name: t('Sporenbasar', 'Spore Bazaar'), kind: 'market' },
      { name: t('Wurzelhöfe', 'Root Courts'), kind: 'residential' },
      { name: t('Flüsterbibliothek', 'Whisper Library'), kind: 'archive' },
      { name: t('Bernsteinschleuse', 'Amber Sluice'), kind: 'gate' },
    ],
    ambientLines: [
      t(
        'Eine Laterne flackert im Takt eines Gesprächs, das vor Jahren verstummte.',
        'A lantern flickers to the rhythm of a conversation silenced years ago.',
      ),
      t(
        'Die Brotmarken sind essbar. Das war Zuvs Bedingung für ihre Einführung.',
        'The bread tokens are edible. That was Zuv’s condition for introducing them.',
      ),
      t(
        'An jeder Haustür hängt ein Faden: rot bedeutet, dass niemand deine Erinnerungen ernten darf.',
        'A thread hangs from every door: red means nobody may harvest your memories.',
      ),
      t(
        'Aus dem Myzel kommt Leas Lachen. Eine Gärtnerin hört darin ihre eigene Tochter.',
        'Lea’s laughter emerges from the mycelium. A gardener hears her own daughter in it.',
      ),
    ],
  },
  {
    id: 'meridian',
    name: t('Meridian', 'Meridian'),
    tagline: t(
      'Freiheit, pünktlich in kleinen Raten.',
      'Freedom, delivered in punctual instalments.',
    ),
    unlockFloor: 8,
    materialFloor: 8,
    description: t(
      'Meridians Messinggassen sind sauber, seine Uhren synchronisiert, seine Einwohner versichert. Sponsoren bezahlen die Ruhe. Jeder Bewohner schuldet ihnen dafür einen Teil seiner Zukunft. Hinter Oris’ Verträgen und Rheas Arena liegt Ennos Werkstatt: Hier versucht jemand, Zeit zurückzugeben statt sie zu verkaufen.',
      'Meridian’s brass streets are clean, its clocks synchronised and its residents insured. Sponsors pay for the peace. Every citizen owes them a portion of their future. Beyond Oris’s contracts and Rhea’s arena lies Enno’s workshop, where someone tries to return time instead of selling it.',
    ),
    npcIds: ['enno', 'rhea', 'oris', 'sera', 'tam'],
    districts: [
      { name: t('Stundenbörse', 'Hour Exchange'), kind: 'market' },
      { name: t('Minutenhöfe', 'Minute Courts'), kind: 'residential' },
      { name: t('Stillstandsarchiv', 'Stillness Archive'), kind: 'archive' },
      { name: t('Mittagstor', 'Noon Gate'), kind: 'gate' },
    ],
    ambientLines: [
      t(
        'Eine Straßenreinigung poliert dieselbe Stelle. Ihr Vertrag endet erst morgen, und morgen kommt nicht.',
        'A street cleaner polishes the same spot. Her contract ends tomorrow, and tomorrow never comes.',
      ),
      t(
        'Rheas alte Siegerporträts haben überall dieselbe Uhrzeit.',
        'Rhea’s old victory portraits all show the same time.',
      ),
      t(
        'Auf einem Balkon liegt eine Uhr ohne Zeiger neben frischem Brot.',
        'On a balcony, a clock without hands rests beside fresh bread.',
      ),
      t(
        'Ein Kind fragt, ob man seine Zukunft auch gebraucht kaufen kann.',
        'A child asks whether you can buy your future second-hand.',
      ),
    ],
  },
];

export const CITY_QUESTS: CityQuestDef[] = [
  {
    id: 'haven-last-boiler',
    cityId: 'haven',
    giver: 'tam',
    name: t('Der letzte warme Wagen', 'The Last Warm Carriage'),
    description: t(
      'Berge zwei Wartungslieferungen aus Kisten der Aufnahmehalle. Tam hält damit die Schlafwagen warm.',
      'Recover two maintenance deliveries from Intake Hall chests. Tam needs them to keep the sleeping carriages warm.',
    ),
    briefing: [
      t(
        '„Wir haben achtzehn Familien und einen Kessel mit einem Loch“, sagt Tam. „Im Senderlager liegen Ersatzteile. Sie nennen das Eigentum. Ich nenne es einen Winter, den wir überleben könnten.“',
        '“We have eighteen families and a boiler with a hole,” Tam says. “The broadcaster’s stores contain spares. They call it property. I call it a winter we might survive.”',
      ),
      t(
        'Öffne zwei Kisten auf Floor 1, nachdem du den Auftrag angenommen hast. Komm für die Verteilung zu Tam zurück.',
        'Open two chests on Floor 1 after accepting the contract. Return to Tam to decide how the supplies are shared.',
      ),
    ],
    objective: 'chest',
    target: 2,
    floor: 1,
    reward: { scrap: 220, marks: 10 },
    conclusion: [
      t(
        'Der Kessel springt an. Aus dem Schlafwagen kommt zum ersten Mal kein Husten, sondern ein Streit über Kartenspiele.',
        'The boiler starts. For the first time, the sleeping carriage produces an argument about cards instead of coughing.',
      ),
    ],
    choices: [
      choice(
        'public',
        'Alle Wagen beheizen',
        'Heat every carriage',
        'Die Bewohner gewinnen Vertrauen in dich. Der Gewinn aus dem Verkauf entfällt.',
        'Residents begin to trust you. You give up the resale profit.',
        'residents',
        12,
      ),
      choice(
        'union',
        'Eine unabhängige Reparaturreserve bilden',
        'Build an independent repair reserve',
        'Die Gewerkschaft erhält Ersatzteile und du 80 zusätzlichen Schrott.',
        'The union gains spare parts and you receive 80 additional scrap.',
        'union',
        8,
        { scrap: 80 },
      ),
    ],
  },
  {
    id: 'haven-unlisted',
    cityId: 'haven',
    giver: 'ilya',
    name: t('Menschen ohne Nummer', 'People Without Numbers'),
    description: t(
      'Lies drei Terminals der Aufnahmehalle und prüfe, welche Evakuierten aus den Registern fehlen.',
      'Read three Intake Hall terminals and identify evacuees missing from the registers.',
    ),
    briefing: [
      t(
        'Ilya zeigt dir sechs Namensschilder. Keines hat eine Teilnehmernummer. „Der Sender behauptet, es habe diese Menschen nie gegeben. In diesem Wagen schläft ihre Mutter.“',
        'Ilya shows you six nameplates. None has a contestant number. “The broadcaster claims these people never existed. Their mother sleeps in that carriage.”',
      ),
      t(
        'Die ungekürzten Einlasslisten stehen noch an drei Terminals auf Floor 1. Sichere sie, bevor ein Schnitt sie überschreibt.',
        'Unabridged admission lists remain at three terminals on Floor 1. Preserve them before another edit overwrites them.',
      ),
    ],
    objective: 'terminal',
    target: 3,
    floor: 1,
    reward: { scrap: 150, marks: 16 },
    conclusion: [
      t(
        'Die Listen enthalten sechs Namen und einen siebten Transportvermerk: Lea, Wagen Sieben. Ilya lässt dir Zeit, bevor er die nächste Frage stellt.',
        'The lists contain six names and a seventh transport note: Lea, Carriage Seven. Ilya gives you time before asking his next question.',
      ),
    ],
    choices: [
      choice(
        'publish',
        'Die Namen offen veröffentlichen',
        'Publish the names openly',
        'Das Archiv gewinnt Glaubwürdigkeit. Die Wahrheit wird öffentlich deiner Suche zugeordnet.',
        'The archive gains credibility. Your search becomes publicly associated with the truth.',
        'archive',
        12,
      ),
      choice(
        'protect',
        'Nur die Familien informieren',
        'Tell only the families',
        'Die Bewohner schätzen deinen Schutz vor den Kameras; du erhältst 4 zusätzliche Marken.',
        'Residents value your protection from the cameras; you receive 4 additional marks.',
        'residents',
        10,
        { marks: 4 },
      ),
    ],
  },
  {
    id: 'haven-lifeline',
    cityId: 'haven',
    giver: 'mira',
    name: t('Kein Vertrag für Wasser', 'Water Without a Contract'),
    description: t(
      'Löse eine Pumpensicherung in den Rostkanälen. Die Klinik braucht eine freie Wasserleitung.',
      'Solve a pump lock in the Rust Channels. The clinic needs an independent water line.',
    ),
    briefing: [
      t(
        'Mira stellt drei leere Flaschen auf den Tisch. „Eine für die Kinder, eine für die Alten, eine für den Sender. Rate, welche Leitung noch Druck hat.“',
        'Mira places three empty bottles on the table. “One for the children, one for the elderly, one for the broadcaster. Guess which line still has pressure.”',
      ),
      t(
        'Der sichere Wartungsraum auf Floor 2 enthält eine lösbare Pumpensicherung. Deine Arbeit wird erst nach Annahme dieses Auftrags gezählt.',
        'The safe maintenance room on Floor 2 contains a pump lock you can solve. Work counts after this contract is accepted.',
      ),
    ],
    objective: 'puzzle',
    target: 1,
    floor: 2,
    reward: { scrap: 260, marks: 12 },
    conclusion: [
      t(
        'Mira wäscht ihre Hände unter fließendem Wasser. Dann stellt sie die dritte Flasche zurück in den Schrank. „Die brauchen wir nicht mehr.“',
        'Mira washes her hands under running water. Then she puts the third bottle back in the cupboard. “We will not need that one again.”',
      ),
    ],
  },
  {
    id: 'haven-corridor',
    cityId: 'haven',
    giver: 'tam',
    name: t('Eine Schicht ohne Beerdigung', 'A Shift Without a Funeral'),
    description: t(
      'Besiege 18 Gegner in den Rostkanälen, damit die Instandhalter wieder zur Klinik gelangen.',
      'Defeat 18 enemies in the Rust Channels so maintenance workers can reach the clinic again.',
    ),
    briefing: [
      t(
        'Ein reparierter Kessel braucht Ersatzteile. Ersatzteile brauchen Wege. Tam nennt dir drei Arbeiter, die gestern nicht zurückgekehrt sind, und weigert sich, daraus eine Statistik zu machen.',
        'A repaired boiler needs spares. Spares need routes. Tam names three workers who did not return yesterday and refuses to turn them into a statistic.',
      ),
      t(
        'Sichere die feindlichen Versorgungsräume auf Floor 2. Es zählen Gegner, die du während dieses Auftrags besiegst.',
        'Secure hostile supply rooms on Floor 2. Enemies defeated during this contract count toward it.',
      ),
    ],
    objective: 'kills',
    target: 18,
    floor: 2,
    requires: ['haven-last-boiler'],
    reward: { scrap: 320, marks: 14 },
    conclusion: [
      t(
        'Die nächste Schicht kehrt vollständig zurück. Einer der Arbeiter hat in der Tiefe frische Zugspuren gesehen. Wagen Sieben war kein Gerücht.',
        'The next shift returns in full. One worker saw fresh train tracks below. Carriage Seven was not a rumour.',
      ),
    ],
  },
  {
    id: 'haven-debt-bell',
    cityId: 'haven',
    giver: 'tam',
    name: t('Die Glocke der Schuld', 'The Debt Bell'),
    description: t(
      'Besiege den optionalen Jagdboss der Schrottbasilika und hole seine Pfändungsunterlagen zurück.',
      'Defeat the Scrap Basilica’s optional hunt boss and recover its seizure records.',
    ),
    briefing: [
      t(
        'Jede Nacht klingelt im Bahnhof eine Glocke. Sie verlangt Schulden von Menschen, deren Häuser längst verschwunden sind. Tam kann das Gerät abschalten. Der Sender installiert am Morgen ein neues.',
        'A bell rings in the station every night. It demands debts from people whose homes have vanished. Tam can switch it off. The broadcaster installs another by morning.',
      ),
      t(
        'Auf Floor 3 sitzt der Inkassoweg hinter dem Jagdvertrag. Fordere den Jagdboss heraus; sein Fall unterbricht die nächtlichen Pfändungen.',
        'On Floor 3, the collection route lies behind a hunt contract. Challenge the hunt boss; its defeat interrupts the nightly seizures.',
      ),
    ],
    objective: 'hunt',
    target: 1,
    floor: 3,
    requires: ['haven-corridor'],
    reward: { scrap: 430, marks: 20 },
    conclusion: [
      t(
        'Die Glocke schweigt. In den Unterlagen stehen auch offene Rechnungen für die Maschinen, die Leas Zug bewacht haben.',
        'The bell falls silent. The documents also list unpaid invoices for the machines guarding Lea’s train.',
      ),
    ],
    choices: [
      choice(
        'cancel',
        'Die Forderungen vernichten',
        'Destroy the claims',
        'Die Bewohner schulden niemandem mehr etwas. Ihr Vertrauen steigt deutlich.',
        'Residents owe nobody anything now. Their trust rises considerably.',
        'residents',
        15,
      ),
      choice(
        'organize',
        'Die Belege für einen Arbeitskampf sichern',
        'Keep evidence for collective action',
        'Die Gewerkschaft erhält belastbare Beweise und du 6 zusätzliche Marken.',
        'The union gains hard evidence and you receive 6 additional marks.',
        'union',
        12,
        { marks: 6 },
      ),
    ],
  },
  {
    id: 'haven-shared-name',
    cityId: 'haven',
    giver: 'ilya',
    name: t('Der Name im Nachbarwagen', 'The Name Next Door'),
    description: t(
      'Sprich in Kesselhafen mit Mira über den Eintrag deiner Schwester.',
      'Speak to Mira in Boilerhaven about your sister’s entry.',
    ),
    briefing: [
      t(
        'Ilya hat Leas Kliniknummer im Rohprotokoll gefunden. Mira kennt den Code: Er wird für Menschen benutzt, die lebend von einer Station in eine andere verschoben wurden.',
        'Ilya found Lea’s clinic number in the raw record. Mira recognises the code: it is used for living people transferred between stations.',
      ),
      t(
        'Suche Mira in der Stadt auf. Dieser Auftrag verlangt ein Gespräch, keinen weiteren Kampf.',
        'Find Mira in the city. This contract requires a conversation, not another fight.',
      ),
    ],
    objective: 'talk',
    target: 1,
    floor: 1,
    targetNpc: 'mira',
    requires: ['haven-unlisted'],
    reward: { scrap: 100, marks: 12 },
    conclusion: [
      t(
        'Mira erinnert sich an Lea als Helferin, nicht als Patientin. Der Sender hat ihre Fürsorge als Zustimmung protokolliert. Im Laternenhain könnte die letzte unveränderte Stimme liegen.',
        'Mira remembers Lea as a helper, not a patient. The broadcaster recorded her care as consent. Her last unaltered voice may be in Lantern Grove.',
      ),
    ],
  },
  {
    id: 'haven-contested-key',
    cityId: 'haven',
    giver: 'nix',
    name: t('NIX’ blinder Fleck', 'NIX’s Blind Spot'),
    description: t(
      'Öffne drei Kisten der Schrottbasilika, um NIX’ beschädigte Transportaufzeichnung zu ergänzen.',
      'Open three Scrap Basilica chests to supplement NIX’s damaged transport record.',
    ),
    briefing: [
      t(
        'NIX erinnert sich an Leas Auftrag, aber nicht an die letzten elf Sekunden davor. „Ein sauberer Schnitt“, sagt er. „Jemand kannte mich gut genug, um zu wissen, was ich behalten würde.“',
        'NIX remembers Lea’s request but not the final eleven seconds before it. “A clean edit,” he says. “Someone knew me well enough to know what I would preserve.”',
      ),
      t(
        'Sichere drei Lagerkisten auf Floor 3. Die Begleitunterlagen können bestätigen, wohin sein Gedächtnis ausgelagert wurde.',
        'Secure three storage chests on Floor 3. Their accompanying records may confirm where his memory was transferred.',
      ),
    ],
    objective: 'chest',
    target: 3,
    floor: 3,
    requires: ['haven-shared-name'],
    reward: { scrap: 360, marks: 18 },
    conclusion: [
      t(
        'Eine Kiste trägt ein Bild von NIX vor seiner Reparatur. Neben ihm steht Lea. Sie schaut nicht zur Kamera, sondern zu einer zweiten Person mit deinem Gesicht.',
        'One chest carries a picture of NIX before his repair. Lea stands beside him. She is looking toward another person with your face, not toward the camera.',
      ),
    ],
    choices: [
      choice(
        'share',
        'Die Aufnahme mit Ilya teilen',
        'Share the image with Ilya',
        'Das Archiv erhält eine neue Spur zu kopierten Identitäten.',
        'The archive gains a new lead concerning copied identities.',
        'archive',
        10,
      ),
      choice(
        'keep',
        'NIX die Entscheidung überlassen',
        'Let NIX decide',
        'Die Bewohner erkennen deinen Respekt vor einem eigenen Gedächtnis an.',
        'Residents recognise your respect for an independent memory.',
        'residents',
        10,
      ),
    ],
  },
  {
    id: 'haven-platform-oath',
    cityId: 'haven',
    giver: 'tam',
    name: t('Das Versprechen am Bahnsteig', 'The Platform Promise'),
    description: t(
      'Besiege den Hauptboss der Schrottbasilika und schaffe einen freien Weg zum Laternenhain.',
      'Defeat the Scrap Basilica’s main boss and establish a free route to Lantern Grove.',
    ),
    briefing: [
      t(
        'Tam hat aus den geborgenen Teilen eine Weiche gebaut. Dahinter liegt eine bewohnte Stadt. „Bring ihnen keine Heldenpose“, sagt er. „Bring ihnen einen Weg, den auch Leute ohne Waffen benutzen können.“',
        'Tam has built a junction from recovered parts. An inhabited city lies beyond it. “Do not bring them a heroic pose,” he says. “Bring them a road people without weapons can use.”',
      ),
    ],
    objective: 'boss',
    target: 1,
    floor: 3,
    requires: ['haven-debt-bell', 'haven-lifeline'],
    reward: { scrap: 500, marks: 28 },
    conclusion: [
      t(
        'An der roten Weiche hängt jetzt eine zweite Lampe. Sie leuchtet für die Menschen, die von unten kommen. Kesselhafen ist zum ersten Mal mehr als eine Sackgasse.',
        'A second lamp now hangs at the red junction. It shines for people arriving from below. For the first time, Boilerhaven is more than a dead end.',
      ),
    ],
  },
  {
    id: 'lantern-red-thread',
    cityId: 'lantern',
    giver: 'zuv',
    name: t('Der rote Faden', 'The Red Thread'),
    description: t(
      'Lies drei Terminals der Pilzredaktion, um unrechtmäßig geerntete Erinnerungen nachzuweisen.',
      'Read three Mycelium Newsroom terminals to prove memories were harvested without consent.',
    ),
    briefing: [
      t(
        'Zuv gibt dir einen roten Faden. „Wir knüpfen ihn an Häuser, deren Bewohner nicht geerntet werden wollen. Die Redaktion nennt das eine Dekoration. Ich brauche Beweise, dass sie sehen kann, was es bedeutet.“',
        'Zuv gives you a red thread. “We tie it to houses whose occupants refuse harvesting. The newsroom calls it decoration. I need proof they know what it means.”',
      ),
      t(
        'Vergleiche drei Terminals auf Floor 4. Gib Zuv anschließend die Protokolle zurück.',
        'Compare three terminals on Floor 4, then return the records to Zuv.',
      ),
    ],
    objective: 'terminal',
    target: 3,
    floor: 4,
    reward: { scrap: 380, marks: 18 },
    conclusion: [
      t(
        'In jeder Liste sind die roten Häuser ausdrücklich markiert. Das Unwissen war eine Schutzbehauptung. Der Faden fühlt sich plötzlich schwer an.',
        'Every list explicitly marks the red houses. Ignorance was a cover story. The thread suddenly feels heavy.',
      ),
    ],
    choices: [
      choice(
        'expose',
        'Den Nachweis öffentlich machen',
        'Make the proof public',
        'Das Archiv stärkt seine unabhängigen Berichte.',
        'The archive strengthens its independent reporting.',
        'archive',
        15,
      ),
      choice(
        'shelter',
        'Zuerst die gefährdeten Familien warnen',
        'Warn vulnerable families first',
        'Die Bewohner vertrauen deinem Vorrang für ihren Schutz.',
        'Residents trust your decision to put their protection first.',
        'residents',
        15,
      ),
    ],
  },
  {
    id: 'lantern-stolen-rain',
    cityId: 'lantern',
    giver: 'mira',
    name: t('Gestohlener Regen', 'Stolen Rain'),
    description: t(
      'Löse zwei Sporenpuzzles der Pilzredaktion und leite sauberes Wasser zu den Wurzelhöfen.',
      'Solve two spore puzzles in the Mycelium Newsroom and direct clean water toward the Root Courts.',
    ),
    briefing: [
      t(
        'Die Kranken im Laternenhain trinken aus der gleichen Wurzel, mit der die Redaktion Bilder entwickelt. Mira hat den Zusammenhang bemerkt. Zuv hat die Beschwerden seit Jahren als Stimmungsschwankungen erklären müssen.',
        'The sick in Lantern Grove drink from the same root the newsroom uses to develop images. Mira noticed the connection. For years, Zuv has been forced to describe the complaints as mood swings.',
      ),
    ],
    objective: 'puzzle',
    target: 2,
    floor: 4,
    reward: { scrap: 420, marks: 20 },
    conclusion: [
      t(
        'Das Wasser verliert seinen silbernen Film. Eine alte Frau behauptet, der Tee schmecke wieder nach der falschen Sorte Tee. Mira nennt das eine Verbesserung.',
        'The water loses its silver film. An elderly woman insists her tea once again tastes like the wrong kind of tea. Mira calls that an improvement.',
      ),
    ],
  },
  {
    id: 'lantern-unpaid-harvest',
    cityId: 'lantern',
    giver: 'zuv',
    name: t('Ernte ohne Lohn', 'A Harvest Without Wages'),
    description: t(
      'Besiege 24 Gegner in der Glutgießerei, die den Gärtnern ihre Lieferungen abnehmen.',
      'Defeat 24 enemies in the Ember Foundry that seize the gardeners’ deliveries.',
    ),
    briefing: [
      t(
        'Die Gärtner bezahlen die Gießerei mit Essen. Die Gießerei bezahlt sie mit Drohungen. Ein abgeschnittener Lieferweg reicht, damit die Pilzstadt hungert.',
        'The gardeners pay the foundry with food. The foundry pays them with threats. One severed supply route is enough to starve the fungal city.',
      ),
      t(
        'Sichere die feindlichen Räume auf Floor 5. In größeren Expeditionen können mehrere Begegnungen nötig sein.',
        'Secure hostile rooms on Floor 5. Larger expeditions may require several encounters.',
      ),
    ],
    objective: 'kills',
    target: 24,
    floor: 5,
    requires: ['lantern-stolen-rain'],
    reward: { scrap: 560, marks: 24 },
    conclusion: [
      t(
        'Die erste unbehelligte Lieferung bringt Äpfel aus einem unterirdischen Gewächshaus. Zuv teilt einen in zwölf Spalten. Niemand fragt nach dem Preis.',
        'The first unmolested delivery brings apples from an underground greenhouse. Zuv cuts one into twelve slices. Nobody asks the price.',
      ),
    ],
  },
  {
    id: 'lantern-echo-seed',
    cityId: 'lantern',
    giver: 'ilya',
    name: t('Eine Stimme im Samen', 'A Voice in the Seed'),
    description: t(
      'Öffne drei Kisten der Pilzredaktion und sichere ungeschnittene Sporenaufnahmen.',
      'Open three Mycelium Newsroom chests and preserve unedited spore recordings.',
    ),
    briefing: [
      t(
        'In der Flüsterbibliothek kennt ein Pilz Leas Lachen. Ein anderer kennt ihre letzten Worte. Ilya warnt dich: Das Myzel erinnert sich an alle Fassungen, auch an die erfundenen.',
        'One fungus in the Whisper Library knows Lea’s laugh. Another knows her last words. Ilya warns you that the mycelium remembers every version, including invented ones.',
      ),
      t(
        'Die Lagerkisten der Redaktion enthalten die ursprünglichen Sporenchargen. Drei davon reichen für einen Vergleich.',
        'Newsroom storage chests contain the original spore batches. Three are enough for a comparison.',
      ),
    ],
    objective: 'chest',
    target: 3,
    floor: 4,
    requires: ['lantern-red-thread'],
    reward: { scrap: 430, marks: 24 },
    conclusion: [
      t(
        'Lea hat nicht um ihre Rettung gebeten. Sie hat um Zeit gebeten, damit die anderen den Zug verlassen können. Die Redaktion schnitt aus beiden Sätzen einen Werbespot.',
        'Lea did not ask to be rescued. She asked for time so the others could leave the train. The newsroom cut both sentences into an advertisement.',
      ),
    ],
    choices: [
      choice(
        'consent',
        'Leas Stimme nur für die Suche nutzen',
        'Use Lea’s voice only for the search',
        'Die Bewohner erkennen an, dass auch vermisste Menschen Grenzen haben.',
        'Residents recognise that missing people still have boundaries.',
        'residents',
        12,
      ),
      choice(
        'testimony',
        'Die Aufnahme als Zeugnis archivieren',
        'Archive the recording as testimony',
        'Das Archiv erhält ein belastbares Original und du 8 zusätzliche Marken.',
        'The archive gains a reliable original and you receive 8 additional marks.',
        'archive',
        14,
        { marks: 8 },
      ),
    ],
  },
  {
    id: 'lantern-hollow-warden',
    cityId: 'lantern',
    giver: 'sera',
    name: t('Der leere Wächter', 'The Hollow Warden'),
    description: t(
      'Besiege den Jagdboss der Glutgießerei und stoppe die Serienfertigung von Gehorsam.',
      'Defeat the Ember Foundry’s hunt boss and stop the mass production of obedience.',
    ),
    briefing: [
      t(
        'SERA zählt die im Ofen gefertigten Köpfe. In jedem sitzt dasselbe Einverständnis. „Ein Befehl ist kein Gedanke“, sagt sie. „Ich möchte das nachweisen, bevor jemand mir widerspricht.“',
        'SERA counts the heads manufactured in the furnace. Every one contains the same consent. “An order is not a thought,” she says. “I would like to prove that before someone disagrees with me.”',
      ),
    ],
    objective: 'hunt',
    target: 1,
    floor: 5,
    reward: { scrap: 620, marks: 28 },
    conclusion: [
      t(
        'Unter dem Wächterpanzer liegen unbeschriebene Speicher. Die Maschinen hätten eigene Stimmen entwickeln können. SERA nimmt eine mit, ohne sie einzuschalten.',
        'Blank memories lie beneath the warden’s armour. The machines could have developed voices of their own. SERA takes one without switching it on.',
      ),
    ],
    choices: [
      choice(
        'free',
        'Die leeren Speicher der Stadt überlassen',
        'Give the blank memories to the city',
        'Die Bewohner erhalten die Chance auf ungeschriebene Leben.',
        'Residents receive a chance at unwritten lives.',
        'residents',
        14,
      ),
      choice(
        'secure',
        'Sie unter unabhängige Archivaufsicht stellen',
        'Place them under independent archive custody',
        'Das Archiv übernimmt die Verantwortung für ihren Schutz.',
        'The archive accepts responsibility for their protection.',
        'archive',
        14,
      ),
    ],
  },
  {
    id: 'lantern-still-breathing',
    cityId: 'lantern',
    giver: 'mira',
    name: t('Noch ein Atemzug', 'One More Breath'),
    description: t(
      'Sprich mit Zuv über die gesicherte Aufnahme von Lea und den Weg nach Meridian.',
      'Speak with Zuv about Lea’s recovered recording and the route to Meridian.',
    ),
    briefing: [
      t(
        'Mira hört auf Leas Aufnahme ein Beatmungsgerät, das nur in versicherten Kliniken eingesetzt wird. Im Laternenhain besitzt niemand eine solche Maschine. Meridian dagegen bezahlt das Überleben auf Raten.',
        'Mira hears a ventilator on Lea’s recording that is used only in insured clinics. Nobody in Lantern Grove owns such a machine. Meridian pays for survival in instalments.',
      ),
      t(
        'Zuv kennt die Versorgungsstrecke. Suche ihn in den Wurzelhöfen auf.',
        'Zuv knows the supply route. Find him in the Root Courts.',
      ),
    ],
    objective: 'talk',
    target: 1,
    floor: 4,
    targetNpc: 'zuv',
    requires: ['lantern-echo-seed'],
    reward: { scrap: 240, marks: 22 },
    conclusion: [
      t(
        'Zuv beschreibt einen weißen Wagen mit verdunkelten Fenstern. Er stand nicht auf dem Markt. Er kaufte Zeit an der Stundenbörse.',
        'Zuv describes a white carriage with darkened windows. It was not buying at the market. It was buying time at the Hour Exchange.',
      ),
    ],
  },
  {
    id: 'lantern-right-to-silence',
    cityId: 'lantern',
    giver: 'ilya',
    name: t('Das Recht zu schweigen', 'The Right to Silence'),
    description: t(
      'Besiege den Hauptboss der Pilzredaktion und entscheide über ihr Ernteregister.',
      'Defeat the Mycelium Newsroom’s main boss and decide the fate of its harvest register.',
    ),
    briefing: [
      t(
        'Ilya hat die Betroffenen gefragt, ob ihre Stimmen veröffentlicht werden dürfen. Einige sagen ja. Einige sagen nein. Die Redaktion hält diese zweite Antwort für einen Fehler im Formular.',
        'Ilya asked the victims whether their voices could be published. Some said yes. Some said no. The newsroom considers the second answer a form error.',
      ),
    ],
    objective: 'boss',
    target: 1,
    floor: 4,
    requires: ['lantern-red-thread'],
    reward: { scrap: 650, marks: 30 },
    conclusion: [
      t(
        'Das Register liegt offen. Zum ersten Mal ist nicht der Sender die Instanz, die eine Grenze setzen muss, sondern du.',
        'The register lies open. For the first time, you must establish a boundary instead of the broadcaster.',
      ),
    ],
    choices: [
      choice(
        'erase',
        'Die Aufzeichnungen der Ablehnenden löschen',
        'Erase recordings of those who refused',
        'Die Bewohner erhalten das versprochene Recht zu schweigen.',
        'Residents receive the promised right to remain silent.',
        'residents',
        20,
      ),
      choice(
        'seal',
        'Alles versiegeln, nur Zustimmung veröffentlichen',
        'Seal everything; publish only with consent',
        'Das Archiv darf Beweise bewahren, verpflichtet sich aber zur Zurückhaltung.',
        'The archive preserves evidence while accepting a duty of restraint.',
        'archive',
        18,
        { marks: 10 },
      ),
    ],
  },
  {
    id: 'lantern-unbought-door',
    cityId: 'lantern',
    giver: 'sera',
    name: t('Eine ungekaufte Tür', 'A Door Nobody Bought'),
    description: t(
      'Löse zwei Zugangsmechanismen in der Sponsorengalerie und beweise einen Weg ohne Sponsor.',
      'Solve two access mechanisms in the Sponsor Gallery and prove there is a route without a sponsor.',
    ),
    briefing: [
      t(
        'SERA hat die Ausgänge der Galerie berechnet. Jeder offizielle Weg verlangt einen Vertrag. Einer der Wartungswege nicht. „Sie haben die Mathematik mit Marketing verwechselt“, sagt sie.',
        'SERA calculated the gallery exits. Every official route requires a contract. One maintenance route does not. “They mistook mathematics for marketing,” she says.',
      ),
    ],
    objective: 'puzzle',
    target: 2,
    floor: 6,
    requires: ['lantern-unpaid-harvest', 'lantern-still-breathing'],
    reward: { scrap: 700, marks: 32 },
    conclusion: [
      t(
        'Die Bernsteinschleuse zeigt jetzt eine Abzweigung nach Meridian. Auf dem Schild steht kein Sponsorname. Jemand hat das für einen wichtigen Sieg gehalten.',
        'The Amber Sluice now points toward Meridian. The sign carries no sponsor name. Someone considered that an important victory.',
      ),
    ],
  },
  {
    id: 'meridian-minute-wages',
    cityId: 'meridian',
    giver: 'enno',
    name: t('Lohn in Minuten', 'Wages in Minutes'),
    description: t(
      'Lies drei Terminals der Uhrwerkstadt, um unbezahlte Lebenszeit zu berechnen.',
      'Read three Clockwork Borough terminals to calculate unpaid lifetime.',
    ),
    briefing: [
      t(
        'Enno legt eine Uhr auf den Tisch, die rückwärts läuft. „Die Schicht bezahlt drei Minuten. Der Weg zur Arbeit kostet vier. Das ist keine schlechte Stelle. Es ist eine langsame Hinrichtung.“',
        'Enno places a clock on the table that runs backward. “The shift pays three minutes. Travelling to work costs four. That is not a bad job. It is a slow execution.”',
      ),
    ],
    objective: 'terminal',
    target: 3,
    floor: 8,
    reward: { scrap: 780, marks: 30 },
    conclusion: [
      t(
        'Die Rechnung geht bis zum Südring zurück. Die Zeit, die aus deinen Nachbarn gezogen wurde, finanzierte Meridians ruhige Straßen.',
        'The accounts reach back to the South Ring. Time extracted from your neighbours paid for Meridian’s quiet streets.',
      ),
    ],
    choices: [
      choice(
        'return',
        'Die gestohlenen Stunden den Arbeitern zusprechen',
        'Award stolen hours to the workers',
        'Die Gewerkschaft gewinnt ein starkes Mandat für Rückzahlungen.',
        'The union gains a strong mandate for restitution.',
        'union',
        20,
      ),
      choice(
        'negotiate',
        'Eine überprüfbare Rückzahlung mit Oris vereinbaren',
        'Negotiate auditable restitution with Oris',
        'Die Sponsoren akzeptieren deine Aufsicht; du erhältst 160 zusätzlichen Schrott.',
        'Sponsors accept your oversight; you receive 160 additional scrap.',
        'sponsors',
        12,
        { scrap: 160 },
      ),
    ],
  },
  {
    id: 'meridian-guarantee',
    cityId: 'meridian',
    giver: 'oris',
    name: t('Die kleine Garantie', 'The Small Guarantee'),
    description: t(
      'Öffne drei Kisten der Uhrwerkstadt und sichere die Versicherungskopien verschwundener Bürger.',
      'Open three Clockwork Borough chests and recover insurance copies for disappeared citizens.',
    ),
    briefing: [
      t(
        'Oris hat Verträge für Menschen ausgestellt, die später aus jedem Verzeichnis verschwanden. Er erinnert sich an ihre Beiträge. Du fragst, ob er sich auch an ihre Namen erinnert. Er antwortet zu spät.',
        'Oris issued contracts to people who later vanished from every directory. He remembers their payments. You ask whether he remembers their names too. He answers too late.',
      ),
    ],
    objective: 'chest',
    target: 3,
    floor: 8,
    reward: { scrap: 840, marks: 32 },
    conclusion: [
      t(
        'Die Kopien beweisen, dass Verschwinden versichert war. Der Begünstigte war in jedem Fall die Direktion. Lea unterschrieb keinen dieser Verträge.',
        'The copies prove disappearance was insured. The Directorate was the beneficiary every time. Lea signed none of these contracts.',
      ),
    ],
    choices: [
      choice(
        'compensate',
        'Die Angehörigen entschädigen lassen',
        'Demand compensation for the relatives',
        'Die Bewohner sehen erstmals eine verlässliche Zusage von Meridian.',
        'Residents see Meridian make a dependable promise for the first time.',
        'residents',
        18,
      ),
      choice(
        'witness',
        'Oris als Kronzeugen gewinnen',
        'Recruit Oris as a principal witness',
        'Die Sponsorenfraktion öffnet sich einer kontrollierten Zusammenarbeit.',
        'The sponsor faction becomes more open to supervised cooperation.',
        'sponsors',
        16,
        { marks: 12 },
      ),
    ],
  },
  {
    id: 'meridian-no-encore',
    cityId: 'meridian',
    giver: 'rhea',
    name: t('Keine Zugabe', 'No Encore'),
    description: t(
      'Besiege den Jagdboss der Spiegelarena und zerbrich Rheas endlose Wiederholungen.',
      'Defeat the Mirror Arena’s hunt boss and break Rhea’s endless reruns.',
    ),
    briefing: [
      t(
        'Rhea hat einmal gewonnen. Die Stadt spielt diesen Sieg seither jeden Mittag nach. Ihr alter Gegner hat inzwischen gelernt, die Wiederholung selbst zu steuern. Jeder neue Versuch kostet einen anderen Bewohner Zeit.',
        'Rhea won once. The city has replayed that victory every noon since. Her old opponent learned to control the rerun. Each new attempt costs another resident time.',
      ),
    ],
    objective: 'hunt',
    target: 1,
    floor: 9,
    reward: { scrap: 1050, marks: 40 },
    conclusion: [
      t(
        'Mittag kommt ohne Fanfare. Rhea schaut auf eine leere Uhr und weiß zum ersten Mal nicht, was als Nächstes passieren soll. Ihr Lächeln ist klein, aber neu.',
        'Noon arrives without a fanfare. Rhea looks at an empty clock and, for the first time, does not know what happens next. Her smile is small but new.',
      ),
    ],
  },
  {
    id: 'meridian-white-carriage',
    cityId: 'meridian',
    giver: 'enno',
    name: t('Der weiße Wagen', 'The White Carriage'),
    description: t(
      'Löse zwei Uhrwerkpuzzles und rekonstruiere die Standzeit von Wagen Sieben.',
      'Solve two clockwork puzzles and reconstruct Carriage Seven’s holding time.',
    ),
    briefing: [
      t(
        'Enno hat den Wagen nie gesehen. Er hat seine Zeit gesehen: elf Jahre, die in einer Sekunde abgerechnet wurden. Es gibt nur einen Ort mit genug Speicher für einen solchen Stillstand.',
        'Enno never saw the carriage. He saw its time: eleven years charged in a single second. Only one place has enough storage for such a suspension.',
      ),
      t(
        'Die beiden Wartungsfolgen auf Floor 8 enthalten die ursprünglichen Stillstandsbefehle.',
        'The two maintenance sequences on Floor 8 contain the original suspension orders.',
      ),
    ],
    objective: 'puzzle',
    target: 2,
    floor: 8,
    requires: ['meridian-minute-wages'],
    reward: { scrap: 900, marks: 38 },
    conclusion: [
      t(
        'Wagen Sieben wurde nicht vernichtet. Seine Insassen hängen im Knochennetz zwischen zwei Takten. Lea hält dort ein gemeinsames Notprotokoll offen.',
        'Carriage Seven was not destroyed. Its passengers remain suspended between two beats in the Bone Network. Lea is keeping a shared emergency protocol open there.',
      ),
    ],
  },
  {
    id: 'meridian-who-decides',
    cityId: 'meridian',
    giver: 'sera',
    name: t('Wer den nächsten Takt bestimmt', 'Who Chooses the Next Beat'),
    description: t(
      'Sprich mit Rhea über das Ende eines geskripteten Lebens.',
      'Speak with Rhea about ending a scripted life.',
    ),
    briefing: [
      t(
        'SERA versteht jetzt, wie ein System Zeit verteilen kann. Sie versteht noch nicht, wer bestimmen darf, welches Leben sie bekommt. Rhea hat diese Frage dreihundertmal beantwortet. Der Sender benutzte immer dieselbe Antwort.',
        'SERA now understands how a system can distribute time. She does not yet understand who may decide which life receives it. Rhea answered that question three hundred times. The broadcaster always used the same answer.',
      ),
    ],
    objective: 'talk',
    target: 1,
    floor: 8,
    targetNpc: 'rhea',
    requires: ['meridian-no-encore'],
    reward: { scrap: 450, marks: 32 },
    conclusion: [
      t(
        'Rhea sagt: „Ein guter Ausgang ist nicht der, den ich gewählt habe. Es ist einer, an dem jemand nach mir anders wählen darf.“ SERA speichert den Satz ohne ihn zu kürzen.',
        'Rhea says, “A good ending is not the one I chose. It is one that lets someone after me choose differently.” SERA stores the sentence without shortening it.',
      ),
    ],
  },
  {
    id: 'meridian-thread-tension',
    cityId: 'meridian',
    giver: 'tam',
    name: t('Der Zug am Faden', 'The Pull on the Thread'),
    description: t(
      'Besiege 30 Gegner im Knochennetz und schaffe den Arbeitern einen Zugang zu Wagen Sieben.',
      'Defeat 30 enemies in the Bone Network and give workers access to Carriage Seven.',
    ),
    briefing: [
      t(
        'Tam hat Arbeiter aus allen drei Städten versammelt. Sie tragen Werkzeuge, keine Heldensymbole. Wenn du die bewaffneten Speicherwächter entfernst, können sie die stillgelegten Leben erreichen.',
        'Tam has gathered workers from all three cities. They carry tools, not heroic emblems. If you remove the armed memory guards, they can reach the suspended lives.',
      ),
    ],
    objective: 'kills',
    target: 30,
    floor: 10,
    requires: ['meridian-white-carriage'],
    reward: { scrap: 1200, marks: 45 },
    conclusion: [
      t(
        'Ein Arbeiter schickt dir die Nummer des geöffneten Wagens. Sieben. Dann den ersten Namen auf der Liste. Lea. Der Kanal bleibt lange still.',
        'A worker sends you the number of the opened carriage. Seven. Then the first name on the list. Lea. The channel stays quiet for a long time.',
      ),
    ],
    choices: [
      choice(
        'rescue',
        'Die Bewohner zuerst evakuieren',
        'Evacuate the residents first',
        'Die Bewohner sehen ihre Rettung vor jedem politischen Ziel.',
        'Residents see their rescue placed before every political objective.',
        'residents',
        22,
      ),
      choice(
        'organize',
        'Rettung und unabhängige Kontrolle verbinden',
        'Combine rescue with independent control',
        'Die Gewerkschaft übernimmt Verantwortung für den Zugang zum Netz.',
        'The union accepts responsibility for access to the network.',
        'union',
        20,
        { marks: 12 },
      ),
    ],
  },
  {
    id: 'meridian-clean-channel',
    cityId: 'meridian',
    giver: 'sera',
    name: t('Ein Kanal ohne Eigentümer', 'A Channel Without an Owner'),
    description: t(
      'Lies drei Terminals in Nullsignal und überprüfe eine unabhängige Verbindung zwischen den Städten.',
      'Read three Null Signal terminals and verify an independent connection between the cities.',
    ),
    briefing: [
      t(
        'Die drei Städte brauchen ein Netz, das nicht automatisch Stimmen, Zeit oder Erinnerungen beansprucht. SERA hat ein Protokoll geschrieben, dessen erste Zeile eine Frage ist, kein Eigentumsanspruch.',
        'The three cities need a network that does not automatically claim voices, time or memories. SERA wrote a protocol whose first line is a question, not an ownership claim.',
      ),
    ],
    objective: 'terminal',
    target: 3,
    floor: 11,
    requires: ['meridian-who-decides', 'meridian-thread-tension'],
    reward: { scrap: 1350, marks: 48 },
    conclusion: [
      t(
        'Zum ersten Mal kommen Stimmen aus Kesselhafen, Laternenhain und Meridian gleichzeitig an. Niemand hat sie vorher auf einen gemeinsamen Text festgelegt.',
        'For the first time, voices from Boilerhaven, Lantern Grove and Meridian arrive together. Nobody made them agree on a script beforehand.',
      ),
    ],
    choices: [
      choice(
        'commons',
        'Gemeinsame Bewohnerkontrolle',
        'Shared resident governance',
        'Die Bewohner erhalten die größte Stimme im neuen Kanal.',
        'Residents receive the strongest voice in the new channel.',
        'residents',
        25,
      ),
      choice(
        'archive',
        'Unabhängige Archivaufsicht',
        'Independent archive oversight',
        'Das Archiv wird für Zugang, Zustimmung und Beweiserhalt verantwortlich.',
        'The archive becomes responsible for access, consent and evidence preservation.',
        'archive',
        25,
      ),
    ],
  },
  {
    id: 'meridian-last-guarantor',
    cityId: 'meridian',
    giver: 'oris',
    name: t('Der letzte Bürge', 'The Last Guarantor'),
    description: t(
      'Besiege den Hauptboss des Sendekerns und beende Veyls Anspruch auf die drei Städte.',
      'Defeat the Broadcast Core’s main boss and end Veyl’s claim over the three cities.',
    ),
    briefing: [
      t(
        'Oris legt einen Vertrag hin, den er selbst unterschrieben hat. Die Direktion garantiert Frieden, solange ihr jede Zukunft gehört. „Wenn der Bürge fällt“, sagt er, „müssen wir endlich selbst für unser Wort einstehen.“',
        'Oris sets down a contract he signed himself. The Directorate guarantees peace as long as it owns every future. “If the guarantor falls,” he says, “we will finally have to stand behind our own word.”',
      ),
    ],
    objective: 'boss',
    target: 1,
    floor: 12,
    requires: ['meridian-guarantee', 'meridian-clean-channel'],
    reward: { scrap: 1800, marks: 60 },
    conclusion: [
      t(
        'Oris zerreißt den Vertrag nicht für die Kamera. Er zerreißt ihn, weil keine Kamera mehr darüber entscheidet, ob sein Wort gilt.',
        'Oris does not tear up the contract for the camera. He tears it up because no camera now decides whether his word counts.',
      ),
    ],
    choices: [
      choice(
        'accountable',
        'Die Sponsoren zur Verantwortung verpflichten',
        'Bind sponsors to accountability',
        'Die Sponsoren übernehmen überprüfbare Pflichten gegenüber den Städten.',
        'Sponsors accept auditable obligations toward the cities.',
        'sponsors',
        25,
      ),
      choice(
        'independent',
        'Die Städte aus jeder Bürgschaft entlassen',
        'Release the cities from every guarantee',
        'Die Gewerkschaft gewinnt ein unabhängiges Gemeinwesen statt eines neuen Eigentümers.',
        'The union gains an independent community instead of a new owner.',
        'union',
        25,
      ),
    ],
  },
];

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    floor: 1,
    title: t('Eine Bewerbung, die du nie geschrieben hast', 'An Audition You Never Submitted'),
    arrival: [
      t(
        'Die Aufnahmehalle riecht nach derselben Desinfektion wie Leas Klinik. Aber die Menschen, die hier auf Förderbändern liegen, tragen Nummern statt Namen. Über ihnen läuft das Jubelvideo eurer Evakuierung. Du erkennst die Stelle, an der die Kamera den wartenden Zug aus dem Bild geschnitten hat.',
        'The Intake Hall smells of the same disinfectant as Lea’s clinic. But the people on its conveyors wear numbers instead of names. Your evacuation celebration plays above them. You recognise where the camera cropped the waiting train out of the frame.',
      ),
      t(
        'NIX erklärt die erste Regel: Der Sender nennt jede Gegenwehr eine Darbietung. Kesselhafen ist eine Lücke im Drehplan. Falls du die unabhängige Schleuse öffnen kannst, gibt es hinter der Halle Menschen, die noch ohne Publikum leben.',
        'NIX explains the first rule: the broadcaster calls every act of resistance a performance. Boilerhaven is a gap in the shooting schedule. If you can open the independent sluice, people beyond the hall still live without an audience.',
      ),
    ],
    scenes: [
      {
        id: 'chapter-01-gate',
        title: t('Das Feld für die Unterschrift', 'The Signature Field'),
        speaker: 'nix',
        lines: [
          t(
            'Die Tür bietet dir Nahrung, Heilung und einen Namen. Der Vertrag darunter überträgt dem Sender sämtliche zukünftigen Erinnerungen. Dein Fingerabdruck steht bereits im Formular. NIX entdeckt, dass das Datum der Unterschrift einen Tag vor der Evakuierung liegt.',
            'The door offers food, healing and a name. The contract transfers every future memory to the broadcaster. Your fingerprint is already on the form. NIX notices the signature date is one day before the evacuation.',
          ),
        ],
        choices: [
          choice(
            'challenge',
            'Die vorzeitige Unterschrift als Fälschung markieren',
            'Mark the premature signature as a forgery',
            'Das unabhängige Archiv erhält einen ersten dokumentierten Widerspruch.',
            'The independent archive gains its first documented contradiction.',
            'archive',
            6,
          ),
          choice(
            'bypass',
            'Den freien Wartungsweg für alle öffnen',
            'Open the free maintenance route for everyone',
            'Die Gewerkschaft erkennt deine praktische Gegenwehr an.',
            'The union recognises your practical resistance.',
            'union',
            6,
            { scrap: 20 },
          ),
        ],
      },
      {
        id: 'chapter-01-recognition',
        title: t('Ein Tier, das dich kennt', 'A Creature That Knows You'),
        speaker: 'nix',
        lines: [
          t(
            'NIX spielt elf beschädigte Sekunden ab. Lea kniet vor seinem offenen Gehäuse. „Wenn mein Geschwisterteil kommt, frag zuerst, woran es sich erinnert.“ Dahinter antwortet jemand mit deiner Stimme. NIX hat den Ausschnitt bewahrt, obwohl sein Auftrag das Löschen vorsah.',
            'NIX plays eleven damaged seconds. Lea kneels beside his open casing. “When my sibling arrives, first ask what they remember.” Someone answers in your voice behind her. NIX kept the clip even though his orders required deletion.',
          ),
        ],
        choices: [
          choice(
            'trust',
            'NIX als Zeugen vertrauen',
            'Trust NIX as a witness',
            'Die Bewohnerfraktion achtet deinen Respekt vor einem eigenständigen Gedächtnis.',
            'The resident faction values your respect for an independent memory.',
            'residents',
            6,
          ),
          choice(
            'audit',
            'Das Fragment sichern und unabhängig prüfen lassen',
            'Preserve the fragment for independent examination',
            'Das Archiv erhält ein prüfbares Original statt einer Vermutung.',
            'The archive gains a verifiable original instead of an assumption.',
            'archive',
            6,
          ),
        ],
      },
      {
        id: 'chapter-01-ledger',
        title: t('Die Namen hinter den Zahlen', 'Names Behind the Numbers'),
        speaker: 'ilya',
        lines: [
          t(
            'Ein Terminal listet die Evakuierten als Materialeingang. Bei Lea steht „lebend, Transfer genehmigt“. Neben dem Wort genehmigt fehlt die Unterschrift. Ilyas Kanal rauscht: „Du kannst diese Liste öffentlich machen. Du kannst zuerst den Familien sagen, dass jemand noch gesucht werden muss.“',
            'A terminal lists evacuees as incoming material. Lea’s entry reads “alive, transfer authorised”. There is no signature beside authorised. Ilya’s channel crackles: “You can make the list public. You can first tell families that someone still needs to be found.”',
          ),
        ],
        choices: [
          choice(
            'announce',
            'Den Materialeingang als Menschenliste veröffentlichen',
            'Publish the material ledger as a list of people',
            'Das Archiv gewinnt 7 Ansehen durch einen namentlichen Nachweis.',
            'The archive gains 7 reputation through evidence naming the people.',
            'archive',
            7,
          ),
          choice(
            'families',
            'Die Familien zuerst benachrichtigen',
            'Notify the families first',
            'Die Bewohner gewinnen 7 Vertrauen in deine Suche.',
            'Residents gain 7 trust in your search.',
            'residents',
            7,
          ),
        ],
      },
    ],
    aftermath: [
      t(
        'Die Einlassmaschine fällt, aber das Jubelvideo läuft weiter. Hinter der Schleuse siehst du die roten Lampen von Kesselhafen. An der Namenswand findest du Lea. Du zeichnest das Fragezeichen dahinter nach, bis es klarer zu sehen ist.',
        'The admission machine falls, but the celebration video keeps playing. Beyond the sluice you see Boilerhaven’s red lamps. Lea is on the wall of names. You trace the question mark after her name until it becomes clearer.',
      ),
    ],
  },
  {
    floor: 2,
    title: t('Wer trinken darf', 'Who Gets to Drink'),
    arrival: [
      t(
        'Die Rostkanäle versorgen mehrere bewohnte Tunnel. Jeder Abzweig trägt eine andere Vertragsnummer. In Leas alter Klinik lief dasselbe Wasser durch alle Hände. Hier ist sogar Durst ein Konto.',
        'The Rust Channels supply several inhabited tunnels. Every branch carries a different contract number. In Lea’s old clinic, the same water washed everyone’s hands. Here even thirst is an account.',
      ),
      t(
        'Mira sagt, sie habe Lea nach der Evakuierung gesehen. Sie war bei Bewusstsein und half anderen. Dann kam ein weißer Zug, dessen Insassen als medizinische Reserve geführt wurden. Die Pumpenzeichnung kann zeigen, wo er gehalten hat.',
        'Mira says she saw Lea after the evacuation. She was conscious and helping others. Then a white train arrived whose occupants were classed as medical reserves. The pump diagram may show where it stopped.',
      ),
    ],
    scenes: [
      {
        id: 'chapter-02-triage',
        title: t('Drei Ventile', 'Three Valves'),
        speaker: 'mira',
        lines: [
          t(
            'Die Notpumpe reicht für Klinik, Schlafwagen oder Kamerakühlung. Mira warnt davor, die Kameraleitung als einziges Beweisstück zu zerstören. Tam antwortet, Beweise müssten lange genug lebende Zeugen haben. Beide warten, bis du die alte Steuerung verstanden hast.',
            'The emergency pump can supply the clinic, sleeping carriages or camera cooling. Mira warns against destroying the only evidence conduit. Tam says evidence needs witnesses who stay alive long enough. Both wait while you examine the old controls.',
          ),
        ],
        choices: [
          choice(
            'patients',
            'Die Klinik hat Vorrang',
            'The clinic comes first',
            'Die Bewohnerfraktion gewinnt 8 Vertrauen; deine Entscheidung wird protokolliert.',
            'The resident faction gains 8 trust; your decision is recorded.',
            'residents',
            8,
          ),
          choice(
            'shared',
            'Eine gemeinsame, unkontrollierte Leitung verlangen',
            'Demand a shared, uncontrolled supply',
            'Die Gewerkschaft gewinnt 8 Ansehen für die unabhängige Versorgung.',
            'The union gains 8 reputation for independent supply.',
            'union',
            8,
          ),
        ],
      },
      {
        id: 'chapter-02-assistant',
        title: t('Keine Patientin', 'Not a Patient'),
        speaker: 'mira',
        lines: [
          t(
            'Mira erinnert sich an Leas Hände: rau von den Bahnsteigkisten, ruhig bei den Kindern. „Sie hatte Angst. Sie wollte trotzdem bleiben.“ Der Transferbericht nennt das freiwillige Bindung. Mira fragt, ob eine hilfsbereite Entscheidung einen Vertrag ersetzen kann.',
            'Mira remembers Lea’s hands: rough from platform crates, steady with children. “She was afraid. She still wanted to stay.” The transfer report calls that voluntary commitment. Mira asks whether an act of care can replace a contract.',
          ),
        ],
        choices: [
          choice(
            'no-consent',
            'Fürsorge ist keine Unterschrift',
            'Care is not a signature',
            'Die Bewohner erhalten einen klaren Widerspruch gegen die erzwungene Zustimmung.',
            'Residents gain a clear rejection of coerced consent.',
            'residents',
            8,
          ),
          choice(
            'record',
            'Miras Aussage als Zeugnis sichern',
            'Preserve Mira’s testimony',
            'Das Archiv gewinnt eine unabhängige Zeugin für Leas Transfer.',
            'The archive gains an independent witness to Lea’s transfer.',
            'archive',
            8,
          ),
        ],
      },
      {
        id: 'chapter-02-pressure',
        title: t('Die bezahlte Stille', 'The Purchased Silence'),
        speaker: 'oris',
        lines: [
          t(
            'Ein Sponsor meldet sich über eine Messleitung. Er bietet Ersatzteile gegen die Erklärung, es habe keinen Versorgungsausfall gegeben. Oris spricht höflich, als ließe sich eine Lüge durch die richtige Wortwahl reparieren. Unter dem Angebot steht der Tarif von Meridian.',
            'A sponsor contacts you through a measurement line. He offers spares in exchange for declaring there was no supply failure. Oris speaks politely, as if the right wording could repair a lie. Meridian’s tariff appears beneath the offer.',
          ),
        ],
        choices: [
          choice(
            'refuse',
            'Keine Teile für eine falsche Aussage',
            'No spares in exchange for false testimony',
            'Die Gewerkschaft gewinnt 8 Ansehen durch deine Unabhängigkeit.',
            'The union gains 8 reputation through your independence.',
            'union',
            8,
          ),
          choice(
            'conditional',
            'Nur ein öffentlich prüfbares Angebot akzeptieren',
            'Accept only a publicly auditable offer',
            'Die Sponsoren akzeptieren eine erste Bedingung; du erhältst 40 Schrott.',
            'Sponsors accept a first condition; you receive 40 scrap.',
            'sponsors',
            5,
            { scrap: 40 },
          ),
        ],
      },
    ],
    aftermath: [
      t(
        'Das Wasser fließt ohne Teilnehmerprüfung. Mira gibt dir den Transfercode von Wagen Sieben. Seine Route führt nicht nach oben, sondern zu einem Ort, an dem Erinnerung als Eigentum gewogen wird.',
        'Water flows without contestant verification. Mira gives you Carriage Seven’s transfer code. Its route leads deeper, toward a place where memory is weighed as property.',
      ),
    ],
  },
  {
    floor: 3,
    title: t('Die Schulden der Toten', 'The Debts of the Dead'),
    arrival: [
      t(
        'Die Schrottbasilika hat Altäre aus ausgeräumten Wohnungen. Ein Händler bietet deinen alten Küchenstuhl an. Im Etikett steht, die Eigentümer hätten ihn freiwillig abgegeben. Du erkennst die Kerbe, die Lea beim Umzug hineingeschlagen hat.',
        'The Scrap Basilica has altars built from emptied homes. A trader offers your old kitchen chair. Its label says the owners surrendered it voluntarily. You recognise the notch Lea made during the move.',
      ),
      t(
        'Ilya erklärt, wie Schulden hier funktionieren: Ein verschwundener Mensch gilt als verstorben, sein Vertrag dagegen als unsterblich. Die gleiche Buchhaltung hat Wagen Sieben verkauft. Irgendwo muss ein Käufer stehen.',
        'Ilya explains debt here: a vanished person is presumed dead, but their contract is immortal. The same bookkeeping sold Carriage Seven. Somewhere there must be a buyer.',
      ),
    ],
    scenes: [
      {
        id: 'chapter-03-chair',
        title: t('Etwas von zu Hause', 'Something from Home'),
        speaker: 'tam',
        lines: [
          t(
            'Tam könnte den Stuhl gegen einen Sack Ersatzteile eintauschen. Du könntest ihn behalten. Auf dem Holz steht eine Liste der Hausbewohner, die Lea vor der Evakuierung versorgt hat. Der Stuhl ist zugleich Möbel, Erinnerung und Beweisstück.',
            'Tam could trade the chair for a sack of spare parts. You could keep it. Lea wrote a list on the wood of neighbours she helped before the evacuation. The chair is furniture, memory and evidence at once.',
          ),
        ],
        choices: [
          choice(
            'community',
            'Den Bewohnern die Liste und das Holz überlassen',
            'Give residents the list and the wood',
            'Die Bewohnerfraktion gewinnt 9 Vertrauen in gemeinsam bewahrte Erinnerung.',
            'The resident faction gains 9 trust in shared remembrance.',
            'residents',
            9,
          ),
          choice(
            'evidence',
            'Die Liste im unabhängigen Archiv sichern',
            'Preserve the list in the independent archive',
            'Das Archiv erhält eine Verbindung zwischen Haushalten und Transfernummern.',
            'The archive gains a link between households and transfer numbers.',
            'archive',
            9,
          ),
        ],
      },
      {
        id: 'chapter-03-creditor',
        title: t('Der Käufer ohne Gesicht', 'The Faceless Buyer'),
        speaker: 'ilya',
        lines: [
          t(
            'Der Kaufvertrag für Wagen Sieben nennt keinen Bürger, sondern „Zukünftige Direktion“. Der Zeitstempel stammt aus einer späteren Schicht. Ilya hält das Dokument gegen das Licht. „Entweder kann jemand morgen schon heute verkaufen. Oder er hat morgen bearbeitet.“',
            'Carriage Seven’s sale names no citizen, only “Future Directorate”. The timestamp comes from a later shift. Ilya holds the document to the light. “Either someone can sell tomorrow today, or they edited tomorrow.”',
          ),
        ],
        choices: [
          choice(
            'publish',
            'Den unmöglichen Vertrag veröffentlichen',
            'Publish the impossible contract',
            'Das Archiv gewinnt 9 Ansehen für einen überprüfbaren Widerspruch.',
            'The archive gains 9 reputation for a verifiable contradiction.',
            'archive',
            9,
          ),
          choice(
            'workers',
            'Die Transportarbeiter zuerst warnen',
            'Warn the transport workers first',
            'Die Gewerkschaft erhält die Gelegenheit, Zeugen zu schützen.',
            'The union gains the opportunity to protect witnesses.',
            'union',
            9,
          ),
        ],
      },
      {
        id: 'chapter-03-bell',
        title: t('Wofür die Glocke schlägt', 'What the Bell Demands'),
        speaker: 'nix',
        lines: [
          t(
            'Die Schuldenglocke kann nur schweigen, wenn jemand einen neuen Besitzer einträgt. NIX findet eine zweite Funktion: sämtliche offenen Forderungen als strittig markieren. Das befreit noch niemanden endgültig, aber niemand muss heute zahlen.',
            'The debt bell can fall silent only if someone registers a new owner. NIX finds a second function: mark every open claim as disputed. It frees nobody permanently, but nobody must pay today.',
          ),
        ],
        choices: [
          choice(
            'dispute',
            'Alle Forderungen widersprechen',
            'Dispute every claim',
            'Die Bewohner gewinnen 10 Vertrauen in eine Pause der Pfändungen.',
            'Residents gain 10 trust in a pause to the seizures.',
            'residents',
            10,
          ),
          choice(
            'collective',
            'Die Forderungen einer Arbeitervertretung übergeben',
            'Transfer the claims to worker representatives',
            'Die Gewerkschaft erhält Verantwortung für die Rückabwicklung.',
            'The union gains responsibility for unwinding the claims.',
            'union',
            10,
            { marks: 4 },
          ),
        ],
      },
    ],
    aftermath: [
      t(
        'Hinter dem Schrottaltar wächst ein lebender Tunnel. Die Sporen an seiner Wand antworten auf Leas Stimme aus NIX’ Speicher. Zum ersten Mal ist deine Suche keine Spur auf Papier. Etwas in der Tiefe erinnert sich.',
        'A living tunnel grows behind the scrap altar. Spores on its wall answer Lea’s voice in NIX’s memory. For the first time your search is more than a paper trail. Something below remembers.',
      ),
    ],
  },
  {
    floor: 4,
    title: t('Eine Stadt voller Zeugen', 'A City of Witnesses'),
    arrival: [
      t(
        'Der Laternenhain ist laut, warm und unvollkommen. Menschen streiten über Marktpreise. Kinder sitzen auf Wurzeln und lernen, welche Sporen man nicht berühren darf. Erst dann hörst du Leas Lachen aus einer Lampe. Die Stadt ist ein Gedächtnis, das niemand ganz besitzt.',
        'Lantern Grove is loud, warm and imperfect. People argue over market prices. Children sit on roots learning which spores must not be touched. Then you hear Lea’s laugh from a lamp. The city is a memory nobody entirely owns.',
      ),
      t(
        'Zuv führt dich zur Grenze der Pilzredaktion. Hier werden Stimmen aus dem gemeinsamen Myzel geerntet, um passende Fassungen der Welt zu schreiben. Im Original steht, dass Wagen Sieben noch lebt. Die Sendefassung erklärt ihn für eine gelungene Metapher.',
        'Zuv leads you to the Mycelium Newsroom’s border. Voices are harvested from the shared fungus to write convenient versions of the world. The original says Carriage Seven is still alive. The broadcast calls it a successful metaphor.',
      ),
    ],
    scenes: [
      {
        id: 'chapter-04-thread',
        title: t('Die rote Tür', 'The Red Door'),
        speaker: 'zuv',
        lines: [
          t(
            'Vor einer Haustür hängt ein roter Faden. Im Terminal dahinter steht „Zustimmung angenommen“. Zuv hat den Faden selbst geknüpft, nachdem die Bewohnerin darum bat, die Stimme ihres verstorbenen Kindes nicht weiter zu verwenden.',
            'A red thread hangs outside a door. The terminal behind it reads “Consent presumed”. Zuv tied the thread himself after the occupant asked for her dead child’s voice no longer to be used.',
          ),
        ],
        choices: [
          choice(
            'silence',
            'Ihr Recht auf Stille verteidigen',
            'Defend her right to silence',
            'Die Bewohner gewinnen 10 Vertrauen in geschützte Grenzen.',
            'Residents gain 10 trust in protected boundaries.',
            'residents',
            10,
          ),
          choice(
            'proof',
            'Die Missachtung zuerst dokumentieren',
            'Document the violation first',
            'Das Archiv erhält Beweise für die systematische Missachtung der Zustimmung.',
            'The archive gains evidence of systematic disregard for consent.',
            'archive',
            10,
          ),
        ],
      },
      {
        id: 'chapter-04-voice',
        title: t('Leas letzter Satz', 'Lea’s Final Sentence'),
        speaker: 'nix',
        lines: [
          t(
            'Die Originalspore spielt Leas Stimme ab: „Ich bleibe, bis die Kinder draußen sind.“ Im Werbespot hörst du nur „Ich bleibe“. NIX spielt beide Fassungen nebeneinander. Danach fragt er nicht, ob du die Wahrheit wissen willst, sondern wer sie hören darf.',
            'The original spore plays Lea’s voice: “I will stay until the children are out.” The advertisement contains only “I will stay”. NIX plays both versions together. He asks not whether you want the truth, but who should hear it.',
          ),
        ],
        choices: [
          choice(
            'personal',
            'Die Stimme zuerst als persönliche Erinnerung bewahren',
            'First keep her voice as a personal memory',
            'Die Bewohner erkennen den Unterschied zwischen Mensch und Material an.',
            'Residents recognise the difference between a person and material.',
            'residents',
            11,
          ),
          choice(
            'testimony',
            'Den Schnitt als öffentliches Zeugnis sichern',
            'Preserve the edit as public testimony',
            'Das Archiv gewinnt 11 Ansehen und einen nachprüfbaren Originalvergleich.',
            'The archive gains 11 reputation and a verifiable comparison with the original.',
            'archive',
            11,
          ),
        ],
      },
      {
        id: 'chapter-04-editor',
        title: t('Ein guter Schluss', 'A Convenient Ending'),
        speaker: 'ilya',
        lines: [
          t(
            'Redaktor Myrs Aufzeichnung behauptet, ein eindeutiges Ende sei besser für die Hinterbliebenen. Ilya kann die Menschen nennen, denen dieser Schluss eine jahrelange Suche nahm. Zuv kann jene nennen, die ohne ihn nie weitergelebt hätten. Eine behördliche Gewissheit ersetzt beide Geschichten.',
            'Editor Myr’s recording claims a clear ending is better for survivors. Ilya can name people whose years of searching that ending stole. Zuv can name those who could not move on without it. Official certainty replaced both stories.',
          ),
        ],
        choices: [
          choice(
            'uncertainty',
            'Ungewissheit ehrlich benennen',
            'Name the uncertainty honestly',
            'Das Archiv gewinnt Vertrauen durch den Verzicht auf einen erfundenen Abschluss.',
            'The archive gains trust by refusing an invented resolution.',
            'archive',
            10,
          ),
          choice(
            'support',
            'Die Suchenden zuerst unterstützen',
            'Support those still searching first',
            'Die Bewohner gewinnen 10 Vertrauen in praktische Fürsorge.',
            'Residents gain 10 trust in practical care.',
            'residents',
            10,
            { scrap: 60 },
          ),
        ],
      },
    ],
    aftermath: [
      t(
        'Das Redaktionsfilter verstummt. Die Sporen senden keine gemeinsame Schlagzeile mehr, sondern widersprechende Stimmen. Lea lebt in keiner davon zu Ende. Ihr Transfer führt zur Glutgießerei, wo aus Erinnerung Körper werden.',
        'The editorial filter goes quiet. The spores no longer transmit one shared headline but conflicting voices. Lea’s life ends in none of them. Her transfer leads to the Ember Foundry, where memories become bodies.',
      ),
    ],
  },
  {
    floor: 5,
    title: t('Das Gesicht hinter deinem Gesicht', 'The Face Behind Your Face'),
    arrival: [
      t(
        'Über den Formen der Glutgießerei hängen Gesichter zum Trocknen. Du erkennst Menschen vom Bahnsteig und jemanden, der dir zum Verwechseln ähnlich sieht. Die Körper tragen saubere Seriennummern. Die Narben darunter tun es nicht.',
        'Faces dry above the Ember Foundry’s moulds. You recognise people from the platform and someone who looks exactly like you. The bodies carry neat serial numbers. The scars beneath do not.',
      ),
      t(
        'Mira liest das Fertigungsprotokoll. Ein Körper kann Ersatz sein, Gefängnis oder neues Leben. Lea wurde hier nicht rekonstruiert. Ihre Unterschrift erscheint dagegen unter einem Prozess, der es jemandem mit deinem Gesicht erlaubte, Befehle zu geben.',
        'Mira reads the production record. A body can be a replacement, prison or new life. Lea was not reconstructed here. Her signature appears beneath a process that allowed someone with your face to issue orders.',
      ),
    ],
    scenes: [
      {
        id: 'chapter-05-copy',
        title: t('Das zweite Ich', 'The Second Self'),
        speaker: 'mira',
        lines: [
          t(
            'Eine Aufzeichnung zeigt dein Gesicht neben Lea. Der Name stimmt, die Stimme stimmt, die Hand fehlt deine alte Narbe. Mira weist auf den Fehler. „Eine Kopie kann jemand sein. Sie kann trotzdem gegen dich benutzt werden.“',
            'A recording shows your face beside Lea. The name and voice match, but the hand lacks your old scar. Mira points out the flaw. “A copy can be a person. It can still be used against you.”',
          ),
        ],
        choices: [
          choice(
            'personhood',
            'Der Kopie ein eigenes Leben zugestehen',
            'Recognise the copy’s own life',
            'Die Bewohnerfraktion gewinnt 12 Vertrauen in gleiche Rechte.',
            'The resident faction gains 12 trust in equal rights.',
            'residents',
            12,
          ),
          choice(
            'evidence',
            'Die missbrauchte Identität dokumentieren',
            'Document the identity abuse',
            'Das Archiv erhält einen klaren Nachweis gefälschter Zustimmung.',
            'The archive gains clear evidence of fabricated consent.',
            'archive',
            12,
          ),
        ],
      },
      {
        id: 'chapter-05-blanks',
        title: t('Unbeschriebene Köpfe', 'Unwritten Minds'),
        speaker: 'sera',
        lines: [
          t(
            'SERA findet unbeschriebene Speicher hinter dem Ofen. Die Serienanweisung verlangt einen Gehorsamskern. Sie fragt, ob Freiheit bedeute, gar nichts hineinzuschreiben, oder den künftigen Menschen die Werkzeuge zum eigenen Schreiben zu geben.',
            'SERA finds blank memories behind the furnace. Production instructions demand an obedience core. She asks whether freedom means writing nothing at all, or giving future people tools to write for themselves.',
          ),
        ],
        choices: [
          choice(
            'tools',
            'Eigene Entscheidungen ermöglichen',
            'Make independent choices possible',
            'Die Bewohnerfraktion gewinnt 12 Ansehen für selbstbestimmte Leben.',
            'The resident faction gains 12 reputation for self-determined lives.',
            'residents',
            12,
          ),
          choice(
            'oversight',
            'Eine unabhängige Aufsicht gegen neue Befehle einrichten',
            'Establish independent oversight against new commands',
            'Das Archiv erhält Verantwortung für den Schutz der Speicher.',
            'The archive gains responsibility for protecting the memories.',
            'archive',
            12,
          ),
        ],
      },
      {
        id: 'chapter-05-cooling',
        title: t('Wem die Kühlung gehört', 'Who Owns the Cooling'),
        speaker: 'tam',
        lines: [
          t(
            'Die Gießerei kann Körper erhalten, solange jemand ihre Kühlung bezahlt. Tam rechnet die benötigten Teile auf einem Stück Ofenblech zusammen. Der Sponsor bietet dieselben Teile für lebenslange Namensrechte an. Mira weigert sich, Überleben ein Produkt zu nennen.',
            'The foundry can maintain bodies as long as someone pays for cooling. Tam tallies the spares on a piece of furnace sheet. A sponsor offers the same parts in exchange for permanent naming rights. Mira refuses to call survival a product.',
          ),
        ],
        choices: [
          choice(
            'union',
            'Eine von Arbeitern betriebene Kühlung unterstützen',
            'Support worker-run cooling',
            'Die Gewerkschaft erhält 12 Ansehen für unabhängige Instandhaltung.',
            'The union gains 12 reputation for independent maintenance.',
            'union',
            12,
          ),
          choice(
            'terms',
            'Nur Hilfe ohne Eigentumsrechte zulassen',
            'Permit aid only without ownership rights',
            'Die Sponsoren akzeptieren überprüfbare Grenzen; du erhältst 90 Schrott.',
            'Sponsors accept auditable limits; you receive 90 scrap.',
            'sponsors',
            8,
            { scrap: 90 },
          ),
        ],
      },
    ],
    aftermath: [
      t(
        'Die Formen stehen still. In NIX’ Fragment erkennt Mira den fremden Menschen mit deinem Gesicht als einen Stellvertreter der Direktion. Er hat Leas Transfer bestätigt. Den Auftrag finanzierte ein Vertrag aus der Sponsorengalerie.',
        'The moulds stop. In NIX’s fragment Mira identifies the stranger with your face as a Directorate proxy. He authorised Lea’s transfer. A Sponsor Gallery contract financed the order.',
      ),
    ],
  },
  {
    floor: 6,
    title: t('Der Preis eines gewonnenen Lebens', 'The Price of a Won Life'),
    arrival: [
      t(
        'Die Sponsorengalerie zeigt zwölf mögliche Versionen deiner Zukunft. In jeder sitzt Lea am anderen Ende eines gedeckten Tisches. Im Kleingedruckten gehört euch der Tisch nicht. Auch nicht die Erinnerung an das Gespräch.',
        'The Sponsor Gallery shows twelve possible versions of your future. Lea sits across a laid table in every one. The fine print says you do not own the table. Or the memory of the conversation.',
      ),
      t(
        'Rhea hat einmal alles gewonnen, was die Sendung versprach. Ihr Ausgang führte in eine Wiederholung. Oris hat ihre Freiheit versichert, aber keine Freiheit von ihm. Beide brauchen jemanden, der den Vertrag tatsächlich liest.',
        'Rhea once won everything the broadcast promised. Her exit led into a replay. Oris insured her freedom, but not freedom from him. Both need someone who actually reads the contract.',
      ),
    ],
    scenes: [
      {
        id: 'chapter-06-reunion',
        title: t('Das Angebot', 'The Offer'),
        speaker: 'oris',
        lines: [
          t(
            'Oris bietet dir eine gesicherte Wiedervereinigung an. Er garantiert nicht Lea, sondern eine Person, die deinen Erinnerungen an Lea entspricht. „Die meisten Kunden bemerken keinen Unterschied“, sagt er. Danach hält er deinen Blick nicht mehr aus.',
            'Oris offers a guaranteed reunion. He guarantees not Lea but a person matching your memories of her. “Most clients notice no difference,” he says. Then he cannot meet your eyes.',
          ),
        ],
        choices: [
          choice(
            'refuse',
            'Lea ist keine erfüllbare Bestellung',
            'Lea is not an order to be fulfilled',
            'Die Bewohnerfraktion gewinnt 14 Vertrauen in deine Haltung.',
            'The resident faction gains 14 trust in your position.',
            'residents',
            14,
          ),
          choice(
            'disclose',
            'Oris zur Offenlegung der Garantie verpflichten',
            'Require Oris to disclose the guarantee',
            'Die Sponsorenfraktion erhält eine erste Regel gegen vorgetäuschte Wiedervereinigung.',
            'The sponsor faction gains a first rule against fabricated reunions.',
            'sponsors',
            10,
            { marks: 8 },
          ),
        ],
      },
      {
        id: 'chapter-06-victory',
        title: t('Eine Siegerin ohne Morgen', 'A Winner Without Tomorrow'),
        speaker: 'rhea',
        lines: [
          t(
            'Rhea verlangt ein Duell, weil ihr Vertrag nur nach einer öffentlichen Niederlage neu verhandelt werden kann. „Ich bitte dich nicht, mein Leben zu retten. Ich bitte dich, meinen nächsten Tag nicht schon vorher zu kennen.“',
            'Rhea demands a duel because her contract can be renegotiated only after a public defeat. “I am not asking you to save my life. I am asking you not to know my next day in advance.”',
          ),
        ],
        choices: [
          choice(
            'witness',
            'Rheas eigene Aussage zum Maßstab machen',
            'Make Rhea’s own account the standard',
            'Die Bewohner gewinnen 14 Vertrauen in selbstbestimmte Ausgänge.',
            'Residents gain 14 trust in self-determined endings.',
            'residents',
            14,
          ),
          choice(
            'precedent',
            'Ihre Niederlage als Vertragspräzedenz sichern',
            'Preserve her defeat as a contractual precedent',
            'Das Archiv erhält einen Beleg, den weitere Gefangene nutzen können.',
            'The archive gains evidence other prisoners can use.',
            'archive',
            14,
          ),
        ],
      },
      {
        id: 'chapter-06-sponsor',
        title: t('Hilfe mit Namen', 'Aid with a Name'),
        speaker: 'tam',
        lines: [
          t(
            'Eine Spende würde Kesselhafen einen Winter sichern. Der Sponsor verlangt, dass die Namenswand seine Marke trägt. Tam sagt, warme Menschen könnten immer noch widersprechen. Ilya sagt, Namen dürften keine neue Ware werden.',
            'A donation would secure Boilerhaven for a winter. The sponsor demands its brand on the wall of names. Tam says warm people can still object. Ilya says names must not become merchandise again.',
          ),
        ],
        choices: [
          choice(
            'anonymous',
            'Nur Hilfe ohne Namensrechte akzeptieren',
            'Accept aid only without naming rights',
            'Die Sponsoren gewinnen 10 Ansehen für Hilfe innerhalb klarer Grenzen.',
            'Sponsors gain 10 reputation for assistance within clear boundaries.',
            'sponsors',
            10,
            { scrap: 100 },
          ),
          choice(
            'independent',
            'Eine unabhängige Sammlung organisieren',
            'Organise an independent collection',
            'Die Gewerkschaft gewinnt 14 Ansehen durch gegenseitige Versorgung.',
            'The union gains 14 reputation through mutual support.',
            'union',
            14,
          ),
        ],
      },
    ],
    aftermath: [
      t(
        'Rheas Siegerschleife endet in einer Niederlage, die ihr gehört. Sie gibt dir den Zugang zum Eisarchiv. Dort lagert die Direktion die Erinnerungen, mit denen sie ihren eigenen Stellvertreter hergestellt hat.',
        'Rhea’s victory loop ends in a defeat that belongs to her. She gives you access to the Frozen Archive, where the Directorate stores the memories used to manufacture its own proxy.',
      ),
    ],
  },
  {
    floor: 7,
    title: t('Was du vergessen solltest', 'What You Were Meant to Forget'),
    arrival: [
      t(
        'Im Eisarchiv hängen vergangene Tage wie beschriftete Eisplatten. Deine letzte Schicht liegt neben einem Tag, den du nie erlebt hast. In beiden verlässt Lea den Bahnsteig. Nur in einer Fassung steigt sie freiwillig in den weißen Wagen.',
        'Past days hang in the Frozen Archive like labelled slabs of ice. Your last shift lies beside a day you never lived. Lea leaves the platform in both. In only one does she board the white carriage voluntarily.',
      ),
      t(
        'Enno erkennt den Stillstandscode. Der Sender kann keine Vergangenheit erzeugen. Er kann Menschen lange genug in einer Lücke halten, bis eine passende Vergangenheit fertiggeschnitten ist. Wagen Sieben hängt seit der Evakuierung in einer solchen Lücke.',
        'Enno recognises the suspension code. The broadcaster cannot create a past. It can hold people in a gap long enough to finish editing a convenient one. Carriage Seven has occupied such a gap since the evacuation.',
      ),
    ],
    scenes: [
      {
        id: 'chapter-07-original',
        title: t('Die nicht gewählte Erinnerung', 'The Unchosen Memory'),
        speaker: 'nix',
        lines: [
          t(
            'Das Original zeigt Lea, wie sie die letzte Wagentür gegen den Strom festhält. Dein Stellvertreter steht dahinter. Er hat deine Erinnerungen, aber keinen Beweis dafür, dass er du sein muss. Für einen Moment fragt er den Sender, ob er helfen darf.',
            'The original shows Lea holding the final carriage door against the current. Your proxy stands behind her. He has your memories but no proof he must be you. For a moment he asks the broadcaster whether he may help.',
          ),
        ],
        choices: [
          choice(
            'witness',
            'Auch den Stellvertreter als Opfer anerkennen',
            'Recognise the proxy as a victim too',
            'Die Bewohnerfraktion gewinnt 16 Vertrauen in Rechte jenseits des Originals.',
            'The resident faction gains 16 trust in rights beyond the original.',
            'residents',
            16,
          ),
          choice(
            'trace',
            'Seine Befehlsquelle nachverfolgen',
            'Trace the source of his orders',
            'Das Archiv erhält eine direkte Spur zur Verantwortung der Direktion.',
            'The archive gains a direct trail to Directorate responsibility.',
            'archive',
            16,
          ),
        ],
      },
      {
        id: 'chapter-07-nix',
        title: t('NIX’ ausgelassener Satz', 'NIX’s Omitted Sentence'),
        speaker: 'nix',
        lines: [
          t(
            'Die fehlenden elf Sekunden kehren zurück. NIX war als Sicherungsgerät mitgeschickt worden. Lea bat ihn, den Transfer zu verweigern. Er tat es. Sein beschädigtes Gedächtnis ist kein Unfall, sondern die Strafe dafür. „Ich hätte dir das sagen sollen“, sagt er.',
            'The missing eleven seconds return. NIX was sent as a security device. Lea asked him to refuse the transfer. He did. His damaged memory was punishment, not an accident. “I should have told you,” he says.',
          ),
        ],
        choices: [
          choice(
            'forgive',
            'Seine Entscheidung zählt mehr als sein alter Auftrag',
            'His decision matters more than his old orders',
            'Die Bewohnerfraktion gewinnt 16 Vertrauen in verantwortliche Veränderung.',
            'The resident faction gains 16 trust in accountable change.',
            'residents',
            16,
          ),
          choice(
            'account',
            'Die Wahrheit bewahren, auch wenn sie wehtut',
            'Preserve the truth even when it hurts',
            'Das Archiv erhält eine vollständige Aussage statt einer bequemen Entlastung.',
            'The archive gains a complete account instead of a convenient absolution.',
            'archive',
            16,
          ),
        ],
      },
      {
        id: 'chapter-07-release',
        title: t('Das Eis der anderen', 'Other People’s Ice'),
        speaker: 'enno',
        lines: [
          t(
            'Enno kann die kleinen Speicher freigeben, aber sie enthalten private Leben. Ein öffentliches Archiv würde die Schuld der Direktion beweisen. Eine Verteilung an die Familien würde entscheiden helfen, wem diese Erinnerungen eigentlich gehören.',
            'Enno can release the small stores, but they contain private lives. A public archive would prove the Directorate’s guilt. Returning them to families would help establish who those memories actually belong to.',
          ),
        ],
        choices: [
          choice(
            'return',
            'Die Erinnerungen an die Betroffenen zurückgeben',
            'Return memories to those concerned',
            'Die Bewohner gewinnen 16 Vertrauen in die Rückgabe ihres Lebens.',
            'Residents gain 16 trust in the return of their lives.',
            'residents',
            16,
          ),
          choice(
            'consent',
            'Ein Archiv auf freiwilliger Zustimmung aufbauen',
            'Build an archive on voluntary consent',
            'Das Archiv gewinnt 16 Ansehen für begrenzte, überprüfbare Aufbewahrung.',
            'The archive gains 16 reputation for limited, auditable preservation.',
            'archive',
            16,
            { marks: 10 },
          ),
        ],
      },
    ],
    aftermath: [
      t(
        'Aus dem Eis kommt eine aktuelle Nachricht, kein alter Film: Lea sendet drei kurze Impulse. Enno übersetzt den Rhythmus in eine Meridian-Adresse. Jemand dort verkauft den Takt, der Wagen Sieben am Leben hält.',
        'A current message emerges from the ice, not an old film: Lea sends three short pulses. Enno translates the rhythm into a Meridian address. Someone there is selling the beat keeping Carriage Seven alive.',
      ),
    ],
  },
  {
    floor: 8,
    title: t('Die Stadt, die deine Zeit verbraucht', 'The City Spending Your Time'),
    arrival: [
      t(
        'Meridian wirkt beinahe wie zu Hause vor der Evakuierung. Menschen kaufen Brot, ziehen Vorhänge auf und beschweren sich über Nachbarn. Die Uhren über ihren Türen zählen nicht den Tag. Sie zählen die Zukunft, die sie noch schulden.',
        'Meridian looks almost like home before the evacuation. People buy bread, open curtains and complain about neighbours. The clocks above their doors do not count the day. They count the future they still owe.',
      ),
      t(
        'Die Uhrwerkstadt darunter hält den ruhigen Alltag am Laufen. Jeder Takt kommt aus einem ausgesetzten Leben. Enno zeigt dir die Nummer, die Leas Herzschlag in einen Rechnungsposten übersetzt.',
        'The Clockwork Borough below keeps the peaceful routine running. Each beat comes from a suspended life. Enno shows you the number translating Lea’s heartbeat into an invoice item.',
      ),
    ],
    scenes: [
      {
        id: 'chapter-08-rent',
        title: t('Eine Wohnung auf Zeit', 'A Home on Borrowed Time'),
        speaker: 'oris',
        lines: [
          t(
            'Oris führt eine Familie vor, deren Kind durch den Stundenvertrag überlebt hat. Danach zeigt Enno eine andere, die dafür schneller altern musste. Keine der beiden unterschrieb den Preis der anderen. Der Vertrag nennt es gegenseitigen Nutzen.',
            'Oris introduces a family whose child survived because of the hour contract. Enno then shows you another family forced to age faster to pay for it. Neither signed the other’s price. The contract calls it mutual benefit.',
          ),
        ],
        choices: [
          choice(
            'workers',
            'Die unbezahlten Stunden als Diebstahl anerkennen',
            'Recognise unpaid hours as theft',
            'Die Gewerkschaft gewinnt 18 Ansehen für eine klare Forderung.',
            'The union gains 18 reputation for a clear demand.',
            'union',
            18,
          ),
          choice(
            'audit',
            'Hilfe erlauben, den Preis offenlegen lassen',
            'Permit aid while requiring disclosure of its price',
            'Die Sponsoren übernehmen eine öffentlich überprüfbare Pflicht.',
            'Sponsors accept a publicly auditable duty.',
            'sponsors',
            13,
            { scrap: 140 },
          ),
        ],
      },
      {
        id: 'chapter-08-missed-noon',
        title: t('Der ausgefallene Mittag', 'The Missing Noon'),
        speaker: 'rhea',
        lines: [
          t(
            'Rhea erzählt, wie ein Uhrfehler ihr einmal fünf freie Minuten gab. Sie kaufte eine Frucht, die sie nicht kannte. Als die Schleife zurückkehrte, blieb der Geschmack. „Wenn ich nur eine Wiederholung bin“, sagt sie, „wo kam dann dieses erste Mal her?“',
            'Rhea describes a clock fault that once gave her five free minutes. She bought fruit she had never tasted. When the loop resumed, the taste remained. “If I am only a rerun,” she says, “where did that first time come from?”',
          ),
        ],
        choices: [
          choice(
            'lives',
            'Solche ungeschriebenen Minuten schützen',
            'Protect those unwritten minutes',
            'Die Bewohnerfraktion gewinnt 18 Vertrauen in offene Zukünfte.',
            'The resident faction gains 18 trust in open futures.',
            'residents',
            18,
          ),
          choice(
            'collective',
            'Freie Zeit als gemeinsames Recht verlangen',
            'Demand free time as a shared right',
            'Die Gewerkschaft gewinnt 18 Ansehen für einen allgemeinen Anspruch.',
            'The union gains 18 reputation for a universal right.',
            'union',
            18,
          ),
        ],
      },
      {
        id: 'chapter-08-carriage',
        title: t('Eine Rechnung für Lea', 'An Invoice for Lea'),
        speaker: 'enno',
        lines: [
          t(
            'Leas Rechnung trägt den Vermerk „Selbsterhaltender Notfall“. Sie hat die Kinder aus dem Stillstandspfad auf ihre eigene Zeit umgebucht. Der Sender darf sie nicht fallen lassen, weil ihr Tod seinen gesamten Zeitvertrag verletzen würde.',
            'Lea’s invoice reads “Self-sustaining emergency”. She transferred the children from the suspension path onto her own time. The broadcaster cannot let her die because it would invalidate the entire time contract.',
          ),
        ],
        choices: [
          choice(
            'rescue',
            'Die Menschen aus der Rechnung lösen',
            'Release the people from the invoice',
            'Die Bewohner gewinnen 18 Vertrauen in die Rettung vor wirtschaftlicher Verwertung.',
            'Residents gain 18 trust in rescue before economic use.',
            'residents',
            18,
          ),
          choice(
            'precedent',
            'Den Vertragsbruch gegen die Direktion sichern',
            'Preserve the breach against the Directorate',
            'Das Archiv gewinnt einen rechtlich belastbaren Widerspruch.',
            'The archive gains a legally substantial contradiction.',
            'archive',
            18,
          ),
        ],
      },
    ],
    aftermath: [
      t(
        'Die Hauptuhr bleibt für einen Takt stehen. Menschen in Meridian erschrecken, dann atmen sie weiter. Leas Verbindung führt durchs Spiegelnetz. Dort erwartet dich der Stellvertreter mit deinem Gesicht.',
        'The master clock stops for a beat. Meridian’s people startle, then keep breathing. Lea’s connection leads through the mirror network, where the proxy with your face awaits.',
      ),
    ],
  },
  {
    floor: 9,
    title: t('Nicht das bessere Original', 'Not the Better Original'),
    arrival: [
      t(
        'Die Spiegelarena zeigt nicht dein Spiegelbild, sondern die Person, die der Sender daraus brauchte: fügsam, erfolgreich, ohne störende Fragen. Jede Wand lässt dieselbe Person ein bisschen glaubwürdiger aussehen. Sie trägt den Namen, den Lea dir gab.',
        'The Mirror Arena shows not your reflection but the person the broadcaster needed from it: obedient, successful and free of inconvenient questions. Every wall makes that person look a little more credible. They carry the name Lea gave you.',
      ),
      t(
        'Rhea sagt, die Arena wolle, dass du die Kopie hasst. Ein Kampf um das richtige Gesicht sei leichter zu verkaufen als ein gemeinsamer Widerspruch gegen den Eigentümer beider Leben.',
        'Rhea says the arena wants you to hate the copy. A fight over the rightful face sells more easily than a shared objection to the owner of both lives.',
      ),
    ],
    scenes: [
      {
        id: 'chapter-09-double',
        title: t('Jemand mit deinem Namen', 'Someone with Your Name'),
        speaker: 'nix',
        lines: [
          t(
            'Dein Stellvertreter erinnert sich an dieselben Sonntage mit Lea. Nur sein letzter Sonntag wurde nachträglich geschrieben. Er fragt, ob eine erfundene Erinnerung weniger weh tut, wenn sie verloren geht. NIX kann darauf keine technische Antwort geben.',
            'Your proxy remembers the same Sundays with Lea. Only his final Sunday was written afterward. He asks whether an invented memory hurts less when lost. NIX has no technical answer.',
          ),
        ],
        choices: [
          choice(
            'equal',
            'Sein Schmerz gehört ihm',
            'His pain belongs to him',
            'Die Bewohnerfraktion gewinnt 20 Vertrauen in gleiche Würde.',
            'The resident faction gains 20 trust in equal dignity.',
            'residents',
            20,
          ),
          choice(
            'truth',
            'Gemeinsam das ursprüngliche Ereignis suchen',
            'Seek the original event together',
            'Das Archiv erhält zwei widersprechende Zeugen, die dieselbe Wahrheit suchen.',
            'The archive gains two conflicting witnesses seeking the same truth.',
            'archive',
            20,
          ),
        ],
      },
      {
        id: 'chapter-09-applause',
        title: t('Der richtige Sieger', 'The Correct Winner'),
        speaker: 'rhea',
        lines: [
          t(
            'Die Anzeige erklärt dich schon zum Sieger. Ihr habt noch nicht gekämpft. Rhea markiert den Zeitstempel. Jede vorgesehene Reaktion würde in den fertigen Film passen; selbst deine Wut hat einen reservierten Platz.',
            'The display already names you the winner. You have not fought yet. Rhea marks the timestamp. Every anticipated response would fit the finished film; even your anger has a reserved place.',
          ),
        ],
        choices: [
          choice(
            'unwritten',
            'Die vorgegebene Rolle ausdrücklich verweigern',
            'Explicitly refuse the prescribed role',
            'Die Bewohner gewinnen 20 Ansehen für einen ungeschriebenen Ausgang.',
            'Residents gain 20 reputation for an unwritten outcome.',
            'residents',
            20,
          ),
          choice(
            'broadcast',
            'Den vorzeitigen Siegertext als Beweis sichern',
            'Preserve the premature victory text as evidence',
            'Das Archiv gewinnt 20 Ansehen und ein weiteres manipuliertes Ergebnis.',
            'The archive gains 20 reputation and another manipulated outcome.',
            'archive',
            20,
            { marks: 12 },
          ),
        ],
      },
      {
        id: 'chapter-09-author',
        title: t('Wem der Spiegel gehört', 'Who Owns the Mirror'),
        speaker: 'sera',
        lines: [
          t(
            'SERA findet die Schreibrechte der Arena. Sie gehören einem Direktor, der niemals erscheint. Ein neuer Eigentümer könnte den Fehler schnell beheben. Ein System ohne Eigentümer müsste lernen, unterschiedliche Aussagen gleichzeitig zu ertragen.',
            'SERA finds the arena’s writing permissions. They belong to a director who never appears. A new owner could fix the flaw quickly. A system without an owner would have to learn to tolerate different accounts at once.',
          ),
        ],
        choices: [
          choice(
            'commons',
            'Schreibrechte unter den Betroffenen verteilen',
            'Share writing rights among those concerned',
            'Die Bewohnerfraktion gewinnt 20 Vertrauen in gemeinsame Autorenschaft.',
            'The resident faction gains 20 trust in shared authorship.',
            'residents',
            20,
          ),
          choice(
            'custody',
            'Die Rechte einer unabhängigen Aufsicht übergeben',
            'Give the rights to independent oversight',
            'Das Archiv übernimmt eine überprüfbare Aufsichtspflicht.',
            'The archive accepts an auditable oversight duty.',
            'archive',
            20,
          ),
        ],
      },
    ],
    aftermath: [
      t(
        'Die Arena verliert ihre gültige Siegerfassung. Dein Stellvertreter bleibt als Beweis eines fremden Befehls zurück, nicht als Beweis deiner Schuld. Hinter dem Glas öffnet sich das Knochennetz. Du hörst endlich eine ungeschnittene, gegenwärtige Stimme: Lea.',
        'The arena loses its valid victory edit. Your proxy remains evidence of someone else’s command, not of your guilt. The Bone Network opens beyond the glass. At last you hear an unedited, present voice: Lea.',
      ),
    ],
  },
  {
    floor: 10,
    title: t('Wagen Sieben', 'Carriage Seven'),
    arrival: [
      t(
        'Das Knochennetz trägt Leben in Bündeln aus Leitungen. Hinter jedem Impuls sitzt jemand, der zwischen zwei Augenblicken wartet. Im weißen Wagen sind keine Schauspieler. Da sind müde Kinder, eine Ärztin ohne Schuhe und Lea mit einer Hand auf dem Nothebel.',
        'The Bone Network carries lives in bundles of conduits. Someone waits between two moments behind every pulse. There are no actors in the white carriage. There are tired children, a barefoot doctor and Lea with one hand on the emergency lever.',
      ),
      t(
        'Lea sieht dich und zählt zuerst die anderen. Dann sagt sie deinen Namen, als müsse sie prüfen, ob er inzwischen jemand anderem gehört. NIX schaltet seine Aufnahme aus, bevor ihr weiterredet.',
        'Lea sees you and counts the others first. Then she says your name as if checking whether it now belongs to somebody else. NIX turns his recording off before you speak further.',
      ),
    ],
    scenes: [
      {
        id: 'chapter-10-reunion',
        title: t('Keine Kamera dazwischen', 'No Camera Between You'),
        speaker: 'Lea',
        lines: [
          t(
            'Lea hat nicht jahrelang heldenhaft gewartet. Für sie sind wenige Minuten vergangen. Sie wusste nicht, dass du noch suchst. „Ich dachte, du wärst schon draußen“, sagt sie. Zwischen euch liegen zwei wahre Erinnerungen, die nicht dieselbe Zeit enthalten.',
            'Lea has not waited heroically for years. To her, only minutes passed. She did not know you were still searching. “I thought you were already outside,” she says. Two true memories lie between you, containing different lengths of time.',
          ),
        ],
        choices: [
          choice(
            'listen',
            'Ihre Geschichte zuerst hören',
            'Hear her story first',
            'Die Bewohnerfraktion gewinnt 22 Vertrauen in eine Rettung ohne neue Vorschrift.',
            'The resident faction gains 22 trust in rescue without another prescription.',
            'residents',
            22,
          ),
          choice(
            'together',
            'Gemeinsam eine vollständige Aussage bewahren',
            'Preserve a complete account together',
            'Das Archiv erhält eine gemeinsam verantwortete Aussage.',
            'The archive gains an account held in shared responsibility.',
            'archive',
            22,
          ),
        ],
      },
      {
        id: 'chapter-10-transfer',
        title: t('Der Nothebel', 'The Emergency Lever'),
        speaker: 'mira',
        lines: [
          t(
            'Mira kann die Fahrgäste aus dem Stillstand lösen. Dafür braucht sie den freien Netzpfad. Der Sender bietet an, Lea sofort freizugeben, wenn die anderen noch eine Schicht warten. Lea erkennt die alte Logik und zieht ihre Hand vom angebotenen Vertrag zurück.',
            'Mira can free the passengers from suspension. She needs the open network path. The broadcaster offers to release Lea immediately if the others wait another shift. Lea recognises the old logic and withdraws her hand from the offered contract.',
          ),
        ],
        choices: [
          choice(
            'all',
            'Kein Tausch eines Menschen gegen andere',
            'No exchange of one person for others',
            'Die Bewohner gewinnen 22 Vertrauen in gleiche Rettungsrechte.',
            'Residents gain 22 trust in equal rights to rescue.',
            'residents',
            22,
          ),
          choice(
            'workers',
            'Die gemeinsame Rettung der Arbeiter unterstützen',
            'Support the workers’ collective rescue',
            'Die Gewerkschaft erhält Verantwortung für einen unabhängigen Rettungsweg.',
            'The union gains responsibility for an independent rescue route.',
            'union',
            22,
          ),
        ],
      },
      {
        id: 'chapter-10-kinship',
        title: t('Was Lea mitgebracht hat', 'What Lea Carried'),
        speaker: 'Lea',
        lines: [
          t(
            'Lea trägt die originale Evakuierungsanordnung unter ihrer Jacke. Sie entstand vor der Katastrophe und beschreibt sie bereits als Unterhaltung. Nicht die Stadt ist freiwillig gekommen. Der Sender hat eine vorhandene Gemeinschaft angeeignet und ihren Fluchtversuch geschnitten.',
            'Lea carries the original evacuation order beneath her jacket. It predates the disaster and already describes it as entertainment. The city did not volunteer. The broadcaster appropriated an existing community and edited its attempt to escape.',
          ),
        ],
        choices: [
          choice(
            'cities',
            'Die Städte gemeinsam über das Dokument entscheiden lassen',
            'Let the cities decide together about the document',
            'Die Bewohnerfraktion gewinnt 22 Vertrauen in geteilte Verantwortung.',
            'The resident faction gains 22 trust in shared responsibility.',
            'residents',
            22,
          ),
          choice(
            'proof',
            'Das Original für die Anklage sichern',
            'Secure the original for the accusation',
            'Das Archiv erhält den stärksten Beweis gegen die Direktion.',
            'The archive gains the strongest evidence against the Directorate.',
            'archive',
            22,
            { marks: 15 },
          ),
        ],
      },
    ],
    aftermath: [
      t(
        'Wagen Sieben fährt nicht als Preis aus dem Netz. Er fährt als Zug voller Menschen. Lea bleibt bei Mira, um die Heimkehrenden zu versorgen. Sie bittet dich um keinen spektakulären Sieg. Sie bittet dich um eine Welt, in der niemand dieselbe Rechnung bezahlt.',
        'Carriage Seven leaves the network not as a prize but as a train full of people. Lea stays with Mira to care for those returning. She asks for no spectacular victory. She asks for a world where nobody pays the same bill.',
      ),
    ],
  },
  {
    floor: 11,
    title: t('Die Stille vor der eigenen Stimme', 'The Silence Before Your Own Voice'),
    arrival: [
      t(
        'Nullsignal enthält keine Musik, keine Gratulation und keinen Kommentar zu deinem Leben. Zum ersten Mal hörst du deinen Atem ohne zweite Tonspur. SERA sagt, die Stille sei keine leere Welt, sondern eine fehlende Anweisung.',
        'Null Signal contains no music, congratulations or commentary on your life. For the first time you hear your breathing without a second soundtrack. SERA says the silence is not an empty world but a missing instruction.',
      ),
      t(
        'Kesselhafen, Laternenhain und Meridian warten auf ein Netz, das keinen von ihnen besitzt. Ihre Bedürfnisse widersprechen sich. Die Direktion hat dieses Problem bisher durch Schweigen gelöst. Ihr müsst eine andere Form finden.',
        'Boilerhaven, Lantern Grove and Meridian await a network that owns none of them. Their needs conflict. The Directorate solved that problem by silencing people. You must find another form.',
      ),
    ],
    scenes: [
      {
        id: 'chapter-11-common',
        title: t('Der erste gemeinsame Satz', 'The First Shared Sentence'),
        speaker: 'sera',
        lines: [
          t(
            'SERA bietet vier Zugriffsmodelle an. Arbeiter kennen die Leitungen. Bewohner tragen die Folgen. Archive bewahren den Nachweis. Sponsoren besitzen Vorräte. Keine Gruppe besitzt allein eine überzeugende Antwort auf die anderen.',
            'SERA offers four access models. Workers know the conduits. Residents bear the consequences. Archives preserve the evidence. Sponsors hold supplies. No group alone has a convincing answer to the others.',
          ),
        ],
        choices: [
          choice(
            'residents',
            'Die Betroffenen erhalten das letzte Wort',
            'Give those affected the final word',
            'Die Bewohner gewinnen 24 Ansehen in der neuen Verbindung.',
            'Residents gain 24 reputation within the new connection.',
            'residents',
            24,
          ),
          choice(
            'union',
            'Gemeinsame Arbeiterkontrolle der Infrastruktur',
            'Shared worker control of infrastructure',
            'Die Gewerkschaft gewinnt 24 Ansehen und Verantwortung.',
            'The union gains 24 reputation and responsibility.',
            'union',
            24,
          ),
          choice(
            'archive',
            'Überprüfbare unabhängige Aufsicht',
            'Auditable independent oversight',
            'Das Archiv gewinnt 24 Ansehen für Zustimmung und Beweiserhalt.',
            'The archive gains 24 reputation for consent and evidence preservation.',
            'archive',
            24,
          ),
        ],
      },
      {
        id: 'chapter-11-guarantee',
        title: t('Wer den Übergang bezahlt', 'Who Pays for the Transition'),
        speaker: 'oris',
        lines: [
          t(
            'Oris bietet Vorräte für den Übergang an, diesmal ohne fremde Namen auf der Rechnung. Tam fragt nach der Quelle. Oris antwortet: Gewinn aus Verträgen, die ihr gerade ungültig gemacht habt. Selbst eine brauchbare Hilfe kann eine unbequeme Herkunft haben.',
            'Oris offers supplies for the transition, this time without other people’s names on the invoice. Tam asks where they came from. Oris answers: profits from contracts you just invalidated. Even useful aid can have an uncomfortable origin.',
          ),
        ],
        choices: [
          choice(
            'restitution',
            'Die Hilfe als Rückzahlung unter Aufsicht behandeln',
            'Treat the aid as supervised restitution',
            'Die Sponsoren gewinnen 18 Ansehen durch überprüfbare Pflichten; du erhältst 180 Schrott.',
            'Sponsors gain 18 reputation through auditable duties; you receive 180 scrap.',
            'sponsors',
            18,
            { scrap: 180 },
          ),
          choice(
            'common',
            'Die Vorräte den betroffenen Arbeitern übergeben',
            'Give the supplies to affected workers',
            'Die Gewerkschaft gewinnt 24 Ansehen durch eine direkte Rückgabe.',
            'The union gains 24 reputation through direct restitution.',
            'union',
            24,
          ),
        ],
      },
      {
        id: 'chapter-11-broadcast',
        title: t('Die erste ungeschnittene Verbindung', 'The First Unedited Connection'),
        speaker: 'ilya',
        lines: [
          t(
            'Drei Städte melden sich gleichzeitig. Niemand sagt denselben Satz. Die ersten Stimmen sind wütend; die nächsten fragen nach Vermissten. Ilya fragt, ob der neue Kanal sauber klingen oder ehrlich bleiben soll. Du erkennst Veyls Lieblingsfrage.',
            'Three cities connect at once. Nobody says the same sentence. The first voices are angry; the next ask about missing people. Ilya asks whether the new channel should sound tidy or remain honest. You recognise Veyl’s favourite question.',
          ),
        ],
        choices: [
          choice(
            'open',
            'Widersprechende Stimmen offen lassen',
            'Leave conflicting voices open',
            'Die Bewohner gewinnen 24 Vertrauen in eine ungeschnittene Öffentlichkeit.',
            'Residents gain 24 trust in an unedited public sphere.',
            'residents',
            24,
          ),
          choice(
            'context',
            'Kontext ergänzen, keine Stimmen entfernen',
            'Add context without removing voices',
            'Das Archiv gewinnt 24 Ansehen für nachvollziehbare Einordnung.',
            'The archive gains 24 reputation for transparent context.',
            'archive',
            24,
          ),
        ],
      },
    ],
    aftermath: [
      t(
        'Das Signal erreicht den Sendekern. Veyl antwortet mit deiner Stimme. Er sagt, eine Geschichte brauche einen einzigen Schluss. Hinter dir warten drei Städte, ein geretteter Zug und Menschen, die endlich unterschiedliche Antworten haben dürfen.',
        'The signal reaches the Broadcast Core. Veyl answers in your voice. He says a story requires one ending. Behind you wait three cities, a rescued train and people finally allowed to give different answers.',
      ),
    ],
  },
  {
    floor: 12,
    title: t('Wem der nächste Morgen gehört', 'Who Owns the Next Morning'),
    arrival: [
      t(
        'Im Sendekern gibt es keinen Thron. Es gibt einen Arbeitstisch, tausend Rohaufnahmen und eine Uhr ohne Zeiger. Veyl hat keine Katastrophe erlitten. Er hat eine funktionsfähige Stadt gebraucht, deren Zusammenhalt sich glaubwürdig verkaufen ließ.',
        'There is no throne in the Broadcast Core. There is a worktable, a thousand raw recordings and a clock without hands. Veyl did not suffer a disaster. He needed a functioning city whose solidarity would sell convincingly.',
      ),
      t(
        'Das Originalprotokoll enthält auch deine verweigerte Zustimmung. Veyl zeigt sie ohne Scham. „Natürlich wolltest du nicht“, sagt er. „Deshalb war dein anderer Entschluss so überzeugend.“ NIX stellt sich zwischen den Tisch und die nächste Kamera.',
        'The original record contains your refused consent too. Veyl displays it without shame. “Of course you did not want to,” he says. “That is why your other decision was so convincing.” NIX stands between the table and the next camera.',
      ),
    ],
    scenes: [
      {
        id: 'chapter-12-director',
        title: t('Keine Entschuldigung im Schnitt', 'No Apology in the Edit'),
        speaker: 'veyl',
        lines: [
          t(
            'Veyl bietet dir die ungeschnittene Heimkehr an. Du müsstest nur bestätigen, dass die Sendung am Ende doch einen Sinn hatte. Lea meldet sich aus Miras Klinik. „Unsere Rettung rechtfertigt nicht, was mit uns gemacht wurde.“',
            'Veyl offers you the unedited homecoming. You would only have to confirm the broadcast had a purpose after all. Lea calls from Mira’s clinic. “Our rescue does not justify what was done to us.”',
          ),
        ],
        choices: [
          choice(
            'refuse',
            'Die Rettung ist keine nachträgliche Zustimmung',
            'Rescue is not retroactive consent',
            'Die Bewohner gewinnen 28 Vertrauen in deine abschließende Haltung.',
            'Residents gain 28 trust in your final position.',
            'residents',
            28,
          ),
          choice(
            'record',
            'Veyls Angebot als letztes Beweisstück sichern',
            'Preserve Veyl’s offer as the final evidence',
            'Das Archiv gewinnt 28 Ansehen und einen vollständigen Nachweis.',
            'The archive gains 28 reputation and a complete record.',
            'archive',
            28,
          ),
        ],
      },
      {
        id: 'chapter-12-successor',
        title: t('Der Platz am Tisch', 'The Seat at the Table'),
        speaker: 'sera',
        lines: [
          t(
            'Nach Veyl kann jemand alle Rechte übernehmen, alle Bindungen lösen oder neue überprüfbare Verträge aushandeln. SERA kann jede Variante ausführen. Sie kann dir nicht sagen, welche sich in zehn Jahren wie Freiheit anfühlt. Dafür müssen Menschen mitsprechen.',
            'After Veyl, someone can take every permission, sever every bond or negotiate new auditable agreements. SERA can execute each option. She cannot tell you which will feel like freedom ten years from now. People must have a say in that.',
          ),
        ],
        choices: [
          choice(
            'assembly',
            'Die Bewohner an der Entscheidung beteiligen',
            'Include residents in the decision',
            'Die Bewohner gewinnen 28 Ansehen als Beteiligte statt Publikum.',
            'Residents gain 28 reputation as participants rather than an audience.',
            'residents',
            28,
          ),
          choice(
            'workers',
            'Den Übergang gemeinsam mit den Arbeitern tragen',
            'Carry the transition together with the workers',
            'Die Gewerkschaft gewinnt 28 Ansehen für die Verantwortung nach dem Sieg.',
            'The union gains 28 reputation for responsibility after victory.',
            'union',
            28,
          ),
          choice(
            'terms',
            'Die Sponsoren an überprüfbare Grenzen binden',
            'Bind sponsors to auditable limits',
            'Die Sponsoren gewinnen 22 Ansehen durch ausdrücklich begrenzte Macht.',
            'Sponsors gain 22 reputation through explicitly limited power.',
            'sponsors',
            22,
          ),
        ],
      },
      {
        id: 'chapter-12-home',
        title: t('Kein fertiges Zuhause', 'No Finished Home'),
        speaker: 'Lea',
        lines: [
          t(
            'Lea fragt, ob die alte Küche noch irgendwo liegt. Vielleicht im Schrott, vielleicht in einem archivierten Bild. Sie möchte keine perfekte Rekonstruktion. Sie möchte eine neue Uhr kaufen, mit dir über die falsche Uhrzeit streiten und den Streit selbst behalten dürfen.',
            'Lea asks whether the old kitchen still exists somewhere. Perhaps among the scrap, perhaps in an archived image. She wants no perfect reconstruction. She wants to buy a new clock, argue with you about its wrong time and be allowed to keep the argument herself.',
          ),
        ],
        choices: [
          choice(
            'ordinary',
            'Ein gewöhnliches Leben ohne Sendevertrag versprechen',
            'Promise an ordinary life without a broadcast contract',
            'Die Bewohner gewinnen 28 Vertrauen in einen offenen nächsten Morgen.',
            'Residents gain 28 trust in an open next morning.',
            'residents',
            28,
          ),
          choice(
            'remember',
            'Die Wahrheit bewahren, ohne ihr das Leben vorzuschreiben',
            'Preserve the truth without prescribing her life',
            'Das Archiv gewinnt 28 Ansehen für begrenzte Erinnerungshoheit.',
            'The archive gains 28 reputation for limited authority over memory.',
            'archive',
            28,
          ),
        ],
      },
    ],
    aftermath: [
      t(
        'Die Sendung endet nicht, weil alles gelöst ist. Sie endet, weil niemand mehr eure Antworten schneiden darf, bevor ihr sie gegeben habt. In Kesselhafen, Laternenhain und Meridian müssen jetzt Menschen miteinander auskommen. Lea wartet mit einer Tasse, die keiner Kamera gehört.',
        'The broadcast ends not because everything is solved. It ends because nobody may edit your answers before you give them. In Boilerhaven, Lantern Grove and Meridian, people must now learn to live together. Lea waits with a cup that belongs to no camera.',
      ),
    ],
  },
];
