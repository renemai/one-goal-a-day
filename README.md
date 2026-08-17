# ⚽ One Goal a Day — Final Web Prototype

Eine vollständige, mobile-first Webversion des Konzepts.

## Enthalten
- realistischer 2D-Stadion-Look auf Canvas
- Free-Kick-Szene
- Mauer + Torwart
- Swipe/Drag-Schuss
- Schusskraft, Richtung und Flugkurve
- Torwartreaktion
- tägliche Challenge mit deterministischen Tagesdaten
- Score / Accuracy / Power / Speed
- lokaler Bestscore
- Welt-/Land-/Freunde-Rangliste als Demo
- Streak
- Score teilen
- responsive Smartphone-UI
- als PWA vorbereitete Manifest-Datei
- keine externen Libraries erforderlich

## Auf GitHub Pages veröffentlichen
Die Dateien ins Root des `main`-Branches laden:
- `index.html`
- `style.css`
- `app.js`
- `manifest.webmanifest`
- `README.md`

Danach GitHub Pages auf `main` + `/ (root)` stellen.

## Was für eine echte Online-Version noch fehlt
Die Rangliste ist absichtlich lokal/demo. Für echte Nutzer braucht man ein Backend:
- Accounts/Auth
- Datenbank
- serverseitige Daily Challenge
- globale Leaderboards
- Freunde
- Anti-Cheat
- Push Notifications
- echte Monetarisierung/In-App-Käufe

Für eine App-Store-Version kann diese Webversion anschließend als PWA/Wrapper oder als Basis für eine native/3D-Version verwendet werden.
