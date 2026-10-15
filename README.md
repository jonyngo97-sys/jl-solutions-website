# JL Laser & Cut Solutions Website

Premium company website for JL Laser & Cut Solutions, Berlin.

## Structure
- `index.html` – homepage and content
- `styles.css` – responsive black/gold design
- `script.js` – mobile navigation and scroll animations

## Deployment
This repository is intentionally static and can be deployed directly with Cloudflare Pages.

Recommended Cloudflare Pages settings:
- Framework preset: None
- Build command: leave empty
- Build output directory: `/`

After the deployment is live, connect the custom domain `jlsolutions.info` in Cloudflare.

## Deployment über GitHub Actions

Der Workflow `Validate and deploy website` prüft Pull Requests, erstellt ein
öffentliches Website-Paket und veröffentlicht nach einem Merge auf `main`.
Alternativ kann er über Actions → Run workflow gestartet werden.

In diesem Repository muss eine der folgenden Varianten unter Settings → Secrets
and variables → Actions hinterlegt sein:

- `CLOUDFLARE_DEPLOY_HOOK`: bestehender Cloudflare-Pages-Deploy-Hook für den
  Produktionsbranch dieses Website-Projekts.
- Oder `CLOUDFLARE_API_TOKEN` mit Pages-Schreibberechtigung für den vorhandenen
  Account plus `CLOUDFLARE_ACCOUNT_ID`.

Der API-Weg sucht ausschließlich ein bereits vorhandenes Pages-Projekt mit der
Domain `jlsolutions.info` oder `www.jlsolutions.info`. Bei mehreren Treffern kann
`CLOUDFLARE_PAGES_PROJECT` als Repository-Variable den Namen eingrenzen. Es wird
kein Projekt angelegt und keine Domain oder DNS-Einstellung verändert.

GitHub benötigt diese technische Berechtigung auch dann, wenn man den
Cloudflare-Browser-Login vermeiden möchte. Zugangsdaten niemals in Commits,
Issues oder Chatnachrichten schreiben. Der Workflow gibt fehlende Secret-Namen,
aber keine Werte aus.

Nur HTML, CSS, JavaScript, Bilder und Schriftdateien der öffentlichen Website
werden nach `dist/` kopiert. Git-Metadaten, Workflows und Hilfsskripte werden nicht
veröffentlicht. Nach dem Deployment prüft der Workflow die Chat-Einbindung und
den exakten Inhalt der ausgelieferten `chat.js`. Eine fehlgeschlagene Prüfung
bedeutet, dass die Live-Version noch nicht bestätigt ist.

