# FlohWorldControl

Paper-Plugin und Web-Dashboard zur Verwaltung von Farmen, Basen, Welten, Weichen, Teleportpunkten und ausgewählten Item-Statistikgruppen.

## Aktueller Stand

Die Website wurde visuell überarbeitet und enthält Funktionsbeschreibungen. Sie ist weiterhin eine Vorschau: Es gibt noch keine sichere Plugin-Web-API, keine echte Anmeldung und keine Live-Serverdaten. Die Farm-Grundlage ist noch nicht die vollständige gewünschte Implementierung. Ein fertiges oder getestetes JAR liegt noch nicht vor.

## Geplante Befehle

### Farmen (bestehende Grundfunktionen)
/base farm create <name>
/base farm trigger <name>
/base farm output <name>
/base farm interval <name> <minuten>
/base farm pulse <name> <ticks>
/base farm enable <name>
/base farm disable <name>
/base farm list

### Teleportpunkte und Commandblöcke
- `/Floh tp punkt <name>` – speichert die aktuelle Position, Welt und Blickrichtung.
- `/Floh tp block <name>` – gibt einen Commandblock aus, der beim Auslösen den nächstgelegenen Spieler zum gespeicherten Punkt teleportieren soll.
- `/Floh tp punkt list` – listet gespeicherte Punkte.

Der Commandblock benötigt aktivierte Commandblöcke. Die Funktion muss vor Veröffentlichung gegen die konkrete Paper-26.3-API getestet werden.

### Weichen und Kompass
- `/Floh weiche create+ <name>` – legt eine benannte Weiche an.
- `/Floh weiche kompassname [name]` – benennt den Kompass in der Hand und setzt passende Lore. Ohne Namen soll die Weiche unter der Spielerposition verwendet werden.
- `/Floh weiche kompass <name>` – ordnet den Kompass im Dropper der Weiche zu.
- `/Floh weiche kompass <name> ent` – entfernt den zugeordneten Kompass aus dem Dropper, nicht die Weiche.

Der Dropper-Kompass darf nicht durch Redstone ausgeworfen werden. Die eigentliche Schienenlogik muss mit den gewünschten Transportarten (Kisten, Dropper und Loren) getestet werden.

### Item-Statistik (keine globale Kistensuche)
- `/Floh item create <name>` – erstellt eine Statistikgruppe.
- `/Floh item + <name>` – fügt die gerade angesehene Kiste hinzu.
- `/Floh item del <name>` – entfernt die gerade angesehene Kiste.
- `/Floh item delete <name>` – löscht die ganze Gruppe.

Mehrere Kisten dürfen einer Gruppe zugeordnet werden. Die Website soll tatsächliche Kisteninhalte und deren Änderungen anzeigen. Eine globale Kistensuche ist ausdrücklich nicht vorgesehen.

## Sicherheit

Dieses Repository ist aktuell öffentlich. Speichere hier niemals Passwörter, API-Schlüssel, private Serveradressen oder private Koordinaten. Stelle es auf Private, bevor vertrauliche Daten oder echte Zugangsdaten hinzukommen. Eine spätere Web-API muss serverseitig authentifizieren und darf Geheimnisse niemals an den Browser ausliefern.

## Build

Im Ordner `plugin` mit Gradle bauen. Paper-API- und Java-Version müssen zum exakten Server-Release passen. Erst nach Build, Test auf Paper 26.3 und Prüfung der Befehle darf ein JAR als fertig bezeichnet werden.
