import { cp, mkdir, readdir, rm, access, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const allowed = new Set(['.html','.css','.js','.png','.jpg','.jpeg','.webp','.svg','.ico','.avif','.woff','.woff2']);
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
async function copyPublic(source,target) {
  await mkdir(target,{recursive:true});
  for(const entry of await readdir(source,{withFileTypes:true})) {
    if(entry.isFile() && allowed.has(extname(entry.name))) await cp(join(source,entry.name),join(target,entry.name));
    // Only explicit public subdirectories are published. No Git metadata,
    // workflows, environment files, scripts or documentation enter dist.
    if(source==='.' && entry.isDirectory() && ['assets','en','vi'].includes(entry.name)) await copyPublic(entry.name,join(target,entry.name));
  }
}
await copyPublic('.','dist');
for(const file of ['index.html','en/index.html','vi/index.html','chat.js','script.js','styles.css','datenschutz.html']) await access(join('dist',file));
for(const page of ['index.html','en/index.html','vi/index.html']) {
  if(!(await readFile(join('dist',page),'utf8')).includes('src="/chat.js"')) throw new Error(`${page}: Chat-Einbindung fehlt.`);
}
for(const file of ['chat.js','script.js']) {
  const result=spawnSync(process.execPath,['--check',join('dist',file)],{stdio:'inherit'});
  if(result.status!==0)process.exit(result.status||1);
}
console.log('Statische Website inklusive Chat für die Veröffentlichung vorbereitet.');
