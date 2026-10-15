import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const hash=value=>createHash('sha256').update(value).digest('hex');
const expected=hash(await readFile('dist/chat.js','utf8'));
const release=(process.env.GITHUB_SHA||'latest').slice(0,12);
for(let attempt=1;attempt<=18;attempt++) {
  try {
    const options={headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(15000)};
    const [script,page]=await Promise.all([
      fetch(`https://jlsolutions.info/chat.js?release=${release}`,options),
      fetch(`https://jlsolutions.info/?release=${release}`,options)
    ]);
    if(script.ok&&page.ok&&hash(await script.text())===expected&&(await page.text()).includes('src="/chat.js"')) {
      console.log('Verifiziert: jlsolutions.info liefert die aktuelle Chat-Datei und bindet sie auf der Startseite ein.');
      process.exit(0);
    }
    console.log(`Live-Prüfung ${attempt}/18: Die erwartete Website-Version ist noch nicht bestätigt.`);
  } catch {console.log(`Live-Prüfung ${attempt}/18: Website derzeit nicht prüfbar.`);}
  if(attempt<18)await new Promise(resolve=>setTimeout(resolve,10000));
}
console.error('::error::Die aktuelle Version auf jlsolutions.info konnte nicht bestätigt werden. Prüfe den nativen Cloudflare Workers Build oder die GitHub-Veröffentlichung, die Projektzuordnung und eventuelle Zugriffssperren.');
process.exit(1);
