# FlohWorldControl

Paper-Plugin und Web-Dashboard zur Verwaltung mehrerer Minecraft-Basen und automatisierter Farmen.

## Sicherheit
Dieses Repository ist aktuell öffentlich. Jeder kann den Quellcode sehen. Speichere hier niemals Passwörter, API-Schlüssel, private Serveradressen oder private Koordinaten. Stelle es unter Settings -> Danger Zone -> Change repository visibility auf Private, wenn der Quellcode verborgen bleiben soll.

## Stand
Phase 1: Plugin-Grundgerüst für Farm-Befehle und Zeitsteuerung sowie Dashboard mit Beispieldaten. Die Website führt noch keine echten Serveraktionen aus.

## Befehle
- /base farm create <name>
- /base farm trigger <name>
- /base farm output <name>
- /base farm interval <name> <minuten>
- /base farm pulse <name> <ticks>
- /base farm enable <name>
- /base farm disable <name>
- /base farm list

Positionsbefehle speichern den Block an deiner aktuellen Position. Output muss ein Redstone-Block sein. Die Farm muss selbst durch einen kurzen Redstone-Impuls auslösbar gebaut sein.

## Build
Im Ordner plugin mit Gradle bauen. Paper-API- und Java-Version müssen zum exakten Server-Release passen.

## Grenzen
Unbeladene Chunks werden nicht automatisch geladen oder durchsucht. Eine sichere Web-API mit Login und serverseitiger Schlüsselverwaltung folgt in Phase 2.