# FlohWorldControl – Cloudflare-Verbindung

Diese Anleitung richtet die Worker/API-Verbindung ein. Das Dashboard startet ohne vorgefuellte Demo-Basen oder Demo-Farmen. Der Server
sendet alle 30 Sekunden einen Status-Snapshot per HTTPS an Cloudflare. Die
Website liest diesen Status ueber `/api/state`.

**Derzeit nur Monitoring:** Website-Befehle zum Aktivieren/Deaktivieren von
Farmen, Ausfuehren von Befehlen oder Starten/Stoppen des Minecraft-Servers
sind noch nicht implementiert.

## 1. Cloudflare vorbereiten
1. Cloudflare Dashboard oeffnen: https://dash.cloudflare.com/
2. Workers & Pages oeffnen.
3. Sicherstellen, dass der Worker `flohworldcontrol` mit dem GitHub-Repository
   `Flohhausen/FlohWorldControl-PluginWeb` verbunden ist, oder lokal mit Wrangler
   aus dem Repository-Root deployen.
4. Die Datei `wrangler.toml` muss im Repository-Root liegen. Sie bindet die
   statischen Dateien aus `web/` sowie den Durable Object `FlohState` ein.

## 2. Zwei geheime Tokens erzeugen
Erzeuge zwei unterschiedliche, lange zufaellige Werte (jeweils mindestens
32 zufaellige Bytes). Nicht denselben Wert wiederverwenden.

- `SERVER_TOKEN`: nur fuer das Minecraft-Plugin zum Senden von Heartbeats.
- `ADMIN_TOKEN`: fuer den Dashboard-Aufruf von `/api/state`.

Die Tokens niemals in GitHub-Dateien, Commits, Screenshots oder Chatnachrichten
schreiben. Nicht in `wrangler.toml` eintragen.

## 3. Secrets beim Worker hinterlegen
Im Repository-Root ein Terminal oeffnen. Wrangler muss verfuegbar sein.
Mit npx kann es ohne globale Installation aufgerufen werden:

```powershell
npx wrangler login
npx wrangler secret put SERVER_TOKEN
npx wrangler secret put ADMIN_TOKEN
```

Bei jeder `secret put`-Abfrage den jeweiligen geheimen Wert direkt im Terminal
eingeben. Nicht hier im Chat posten.

## 4. Worker deployen
Im Repository-Root:

```powershell
npx wrangler deploy
```

Die ausgegebene Worker-Adresse im Cloudflare-Dashboard notieren. Verwende
keine alte oder angenommene Adresse. Nach dem Deploy pruefen, dass die Website
unter genau dieser Adresse geladen wird.

## 5. Paper-Plugin konfigurieren
Paper-Server einmal starten, damit die Plugin-Konfiguration angelegt wird,
und anschliessend sauber stoppen.

Datei:
`plugins/FlohWorldControl/config.yml`

Dort eintragen:

```yaml
connection:
  worker-url: "https://DEINE-AKTUELLE-WORKER-ADRESSE.workers.dev"
  server-token: "HIER_DEN_SERVER_TOKEN_EINTRAGEN"
```

- `worker-url`: nur die Basisadresse, ohne `/api/heartbeat`.
- `server-token`: exakt derselbe Wert wie das Cloudflare-Secret `SERVER_TOKEN`.
- `ADMIN_TOKEN` gehoert **nicht** in die Plugin-Konfiguration.

Server wieder starten. Das Plugin sendet nach kurzer Startverzoegerung alle
30 Sekunden den Status.

## 6. Dashboard verbinden
1. Website oeffnen.
2. Im Serverstatus-Bereich auf Token eingeben/Verbinden klicken.
3. Den Wert von `ADMIN_TOKEN` eingeben.
4. Status aktualisieren. Das Dashboard fragt `/api/state` alle 30 Sekunden ab.

Der Admin-Token wird im aktuellen Frontend nur fuer die Browser-Sitzung
gespeichert (sessionStorage). Auf einem gemeinsam genutzten Geraet danach
Abmelden/Trennen verwenden.

## 7. Verbindung testen
- Ohne Token muss `/api/state` mit HTTP 401 antworten.
- Mit falschem `SERVER_TOKEN` muss der Heartbeat HTTP 401 liefern.
- Mit richtigem Server-Token sollte nach dem ersten Heartbeat `connected`
  im API-Ergebnis true sein.
- Das Plugin meldet HTTP-Fehler in der Paper-Konsole.

## Sicherheit
- Tokens nur lokal und als Cloudflare Secrets speichern.
- Repository vor privaten Serverdaten auf **Private** stellen.
- Keine Ports am Router fuer diese HTTPS-Statusverbindung oeffnen; das Plugin
  baut die Verbindung nach aussen auf.
- Falls dein Minecraft-Server `online-mode=false` nutzt, ihn nicht ungeschuetzt
  aus dem Internet erreichbar machen.
- Bei Verdacht auf Token-Leak beide Secrets in Cloudflare neu setzen und die
  Plugin-Konfiguration aktualisieren.
