import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('editorial home has four linked photo cards, category overview and original demos',async()=>{for(const prefix of ['','en/','vi/']){const s=await readFile(new URL('../'+prefix+'index.html',import.meta.url),'utf8');assert.match(s,/class="structured-home editorial-home"/);assert.equal((s.match(/class="ed-tile"/g)||[]).length,4);assert.equal((s.match(/class="ed-service"/g)||[]).length,4);for(const p of ['gravur','events','photo-film','digital'])assert.ok(s.includes('class="ed-tile" href="/'+prefix+p+'"'));for(const id of ['leistungen','digital','ueber-uns','kontakt'])assert.ok(s.includes('id="'+id+'"'));assert.ok(s.includes('data-tabset'));}});
