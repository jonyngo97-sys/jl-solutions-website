import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
export const photos={
  "laser": [
    17260646,
    "close-up-of-an-engraving-machine"
  ],
  "events": [
    16120245,
    "table-decorated-with-flowers"
  ],
  "photo-film": [
    10978726,
    "a-photographer-taking-pictures"
  ],
  "digital": [
    7947638,
    "a-person-using-laptop"
  ],
  "wood": [
    7599715,
    "brown-wooden-surface"
  ],
  "slate": [
    383559,
    "grey-stone-lot"
  ],
  "bamboo": [
    19776783,
    "close-up-of-bamboo-wall"
  ],
  "metal": [
    29157286,
    "industrial-metal-texture-with-orange-accent"
  ],
  "cork": [
    5988421,
    "a-close-up-shot-of-a-cork-board"
  ],
  "qr": [
    10032377,
    "a-high-angle-shot-of-prepared-wooden-table-in-restaurant"
  ]
};
export async function prepareStockPhotos(target='dist/assets') {
 await mkdir(target,{recursive:true});
 await Promise.all(Object.entries(photos).map(async ([name,[id]])=>{
  const path=join(target,'stock-'+name+'.jpg');
  // Prefer a checked-in copy if a future maintainer archives the licensed photo.
  try {const existing=await readFile(join('assets','stock-'+name+'.jpg')); if(existing[0]===255&&existing[1]===216){await writeFile(path,existing);return;}} catch {}
  const url='https://images.pexels.com/photos/'+id+'/pexels-photo-'+id+'.jpeg?auto=compress&cs=tinysrgb&w=1200';
  let error;
  for(let attempt=0;attempt<3;attempt++) {try {const r=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{Accept:'image/jpeg'}});if(!r.ok)throw new Error('HTTP '+r.status);const bytes=Buffer.from(await r.arrayBuffer());if(bytes.length<1000||bytes.length>5000000||bytes[0]!==255||bytes[1]!==216)throw new Error('Not a valid JPEG');await writeFile(path,bytes);return;}catch(e){error=e;}}
  throw new Error('Stock photo '+name+' could not be retrieved: '+error);
 }));
}
