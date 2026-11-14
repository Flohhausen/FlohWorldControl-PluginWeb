# FlohWorldControl – Gradle-Plugin (Windows)

## Voraussetzungen
- JDK 21 (kein reines JRE)
- Gradle 8.14.6 oder neuer, das mit Java 21 laeuft
- Internet beim ersten Build (Paper-API wird geladen)

## Bauen
1. Repository klonen oder als ZIP herunterladen.
2. Den Ordner `plugin` oeffnen.
3. `BUILD.bat` doppelklicken.
4. Bei Erfolg liegt die Plugin-Datei hier:
   `plugin/build/libs/FlohWorldControl-0.1.0.jar`

Die BAT verwendet zuerst Gradle aus dem PATH und danach den bei Flohhausen
bekannten lokalen Pfad `C:\Gradle\gradle-8.14.6-bin\gradle-8.14.6\bin\gradle.bat`.
Falls dein Gradle woanders liegt, Gradle zum PATH hinzufuegen.

## Dashboard und echte Daten\nDas Dashboard startet ohne Demo-Eintraege. Die Cloudflare-Verbindung liefert derzeit den Serverstatus, Spielerzahlen, Farm-Anzahl und Weltenzahl. Manuell im Dashboard angelegte Basen und Eintraege werden aktuell nur lokal im Browser gespeichert und noch nicht mit dem Server synchronisiert.\n\n## Auf Paper installieren
1. Paper-Server mit `stop` sauber beenden.
2. `FlohWorldControl-0.1.0.jar` in den Serverordner `plugins\` kopieren.
3. Server starten.
4. Einstellungen unter `plugins/FlohWorldControl/config.yml` bearbeiten.
5. Nach Aenderungen am Plugin oder der Config den Server neu starten.

## Befehle
Alle `/base farm`-Befehle benoetigen `flohworldcontrol.admin` (Standard: OP).

- `/base farm create <name>`
- `/base farm trigger <name>`
- `/base farm output <name>`
- `/base farm interval <name> <minuten>`
- `/base farm pulse <name> <ticks>`
- `/base farm enable <name>`
- `/base farm disable <name>`
- `/base farm list`
- `/Floh tp punkt <name>`
- `/Floh tp punkt list`
- `/Floh tp block <name>`

**Hinweis zur Farmfunktion:** Der Trigger-Ort wird derzeit gespeichert, aber noch nicht als Ausloeser ausgewertet. Die aktive Automatik prueft den Output-Ort auf einen Redstone-Block und pulst diesen.

## Cloudflare
Die HTTPS-Statusverbindung wird separat in [../CLOUDFLARE-VERBINDUNG.md](../CLOUDFLARE-VERBINDUNG.md) eingerichtet.

Wichtig: Die derzeitige Verbindung uebertraegt Serverstatus zur Website. Eine Steuerung von Farmen oder Serverbefehlen von der Website aus ist noch nicht implementiert.

## Build-Hinweis
Die Paper-API-Abhaengigkeit ist aktuell als
`io.papermc.paper:paper-api:26.3-R0.1-SNAPSHOT` eingetragen.
Falls PaperMC diese Snapshot-Version nicht bereitstellt, muss die Dependency
auf eine tatsaechlich verfuegbare API-Version angepasst werden. Der Build ist
erst dann bestaetigt, wenn `BUILD.bat` lokal erfolgreich durchlaeuft.
