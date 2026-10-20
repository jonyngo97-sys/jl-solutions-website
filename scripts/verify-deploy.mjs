import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const hash=value=>createHash('sha256').update(value).digest('hex');
const release=(process.env.GITHUB_SHA||'latest').slice(0,12);
const pages=['','en/','vi/'].flatMap(prefix=>['index.html','gravur.html','smart-qr.html','growth-ai.html'].map(file=>prefix+file));
const expectedPages=await Promise.all(pages.map(async file=>{
  const html=await readFile('dist/'+file,'utf8');
  return {file,path:file.endsWith('index.html')?file.slice(0,-10):file,title:html.match(/<title>(.*?)<\/title>/)?.[0],canonical:html.match(/<link rel="canonical"[^>]+>/)?.[0]};
}));
const expectedAssets=await Promise.all(['chat.js','script.js','styles.css'].map(async file=>({file,hash:hash(await readFile('dist/'+file,'utf8'))})));
async function load(path){return fetch(`https://jlsolutions.info/${path}?release=${release}`,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(15000)});}
async function verify(){
  const results=await Promise.all([
    ...expectedPages.map(async page=>{const response=await load(page.path);if(!response.ok)return false;const html=await response.text();return Boolean(page.title&&page.canonical&&html.includes(page.title)&&html.includes(page.canonical)&&html.includes('src="/chat.js"')&&html.includes('data-enquiry='));}),
    ...expectedAssets.map(async asset=>{const response=await load(asset.file);return response.ok&&hash(await response.text())===asset.hash;})
  ]);
  return results.every(Boolean);
}
for(let attempt=1;attempt<=18;attempt++) {
  try {if(await verify()){console.log('Verifiziert: alle 12 Seiten, Navigation, Chat und Styles auf jlsolutions.info sind aktuell.');process.exit(0);}}
  catch {console.log('Die Veröffentlichung ist noch nicht vollständig erreichbar.');}
  console.log(`Live-Prüfung ${attempt}/18: Die erwartete Website-Version ist noch nicht bestätigt.`);
  if(attempt<18)await new Promise(resolve=>setTimeout(resolve,10000));
}
console.error('::error::Die Veröffentlichung aller Produktseiten konnte nicht bestätigt werden. Prüfe den Cloudflare-Produktionsbuild und seine Repository-Zuordnung.');
process.exit(1);
