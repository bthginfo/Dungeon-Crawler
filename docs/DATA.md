# Datenspeicherung

Ohne Anmeldung speichert das Spiel Kampagne, drei Slots, begrenzte lokale Sicherungen und Einstellungen ausschließlich im Browser. Das Löschen der Website-Daten entfernt diese lokalen Daten. JSON-Export erzeugt eine Sicherung, die der Spieler selbst aufbewahren kann.

Mit freiwilliger Anmeldung verarbeitet die API Benutzername, Passwort-Hash, Sessiontoken-Hash und bis zu drei Kampagnensnapshots mit einer vorherigen Version. Das Passwort selbst wird nie in der Datenbank abgelegt. Die Sitzung läuft nach 30 Tagen ab und kann durch Abmelden beendet werden. Die Datenbank liegt in der Region Frankfurt. Hosting und Datenbank werden von Vercel beziehungsweise Neon bereitgestellt.

Cloud-Spielstände enthalten die im Spiel gewählte Charakterbezeichnung, Klasse, Fortschritt, Inventar, Entscheidungen und erzeugte Welt. Es gibt keine Werbeintegration oder Analytics-Bibliothek. Die API verwendet vorübergehende HMAC-Schlüssel aus IP-Adresse beziehungsweise Benutzername zur Begrenzung von Authentifizierungsversuchen; sie legt dafür keine rohe IP-Adresse ab. Infrastrukturbetreiber können ihre eigenen Betriebsprotokolle führen.

`DELETE /api/account` entfernt das angemeldete Konto, Sitzungen und zugehörige Cloud-Spielstände durch Fremdschlüssel-Kaskaden. Lokale Sicherungen bleiben unabhängig und lassen sich über die Spielstandverwaltung oder die Browserdatenverwaltung entfernen. Ein Cloud-Konflikt wird niemals still zusammengeführt. Die Oberfläche bietet Auswahl oder Aufbewahrung beider Varianten in getrennten Slots an.

Der Service Worker speichert ausschließlich öffentliche statische Spielassets, keine API-Antworten. Sitzungscookies sind HttpOnly und werden nicht in IndexedDB oder JSON-Exports geschrieben. Exporte enthalten keine Passwörter oder Zugangstokens.
