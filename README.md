# JL Laser & Cut Solutions Website

Statische Unternehmenswebsite mit Website-Chat. Die Produktion läuft im bestehenden
Cloudflare Worker `jl-solutions-website`. `wrangler.jsonc` benennt diesen Worker
und veröffentlicht ausschließlich die mit `node scripts/prepare-deploy.mjs`
erzeugten Dateien aus `dist/`. Die vorhandenen Domainzuordnungen bleiben bestehen.

## Veröffentlichung über GitHub

Der Workflow `Validate and deploy website` prüft Pull Requests und veröffentlicht
nach einem Merge auf `main`. Er kann außerdem in Actions manuell gestartet werden.
Workers Builds kann denselben Branch nativ bauen; `wrangler deploy` führt die
Paketierung aus der Build-Konfiguration automatisch aus.

### Empfohlen: Worker-Deploy-Hook

1. Cloudflare → Workers & Pages → jl-solutions-website → Settings → Builds.
2. Unter Deploy Hooks auf Add klicken.
3. Name `github-deploy`, Branch `main`, anschließend Create.
4. Die erzeugte URL ausschließlich in GitHub unter Settings → Secrets and
   variables → Actions als Repository-Secret `CLOUDFLARE_DEPLOY_HOOK` speichern.

Ein Worker-Hook hat den Pfad
`/client/v4/workers/builds/deploy_hooks/<HOOK-ID>`.
Der Workflow unterstützt außerdem offizielle Pages-Hook-URLs. Die vollständige
Hook-URL ist ein Zugangsschlüssel und gehört nicht in Commits, Issues oder Chats.

### Alternative: Worker-API-Zugang

Statt des Hooks können `CLOUDFLARE_API_TOKEN` mit Worker-Deployment-Berechtigung
und `CLOUDFLARE_ACCOUNT_ID` als GitHub-Repository-Secrets hinterlegt werden.
Damit veröffentlicht Wrangler den explizit konfigurierten Worker.
Cloudflare-Build-Variablen sind keine GitHub-Actions-Secrets.

## Prüfung

Nur öffentliche HTML-, CSS-, JavaScript-, Bild- und Schriftdateien werden
paketiert. Git-Metadaten, Workflows und Hilfsskripte werden nicht veröffentlicht.
Nach der Veröffentlichung prüft GitHub die Einbindung auf jlsolutions.info und den
exakten Inhalt der ausgelieferten chat.js. Bis zu einer erfolgreichen Live-Prüfung
wird das Deployment nicht als bestätigt gemeldet.
