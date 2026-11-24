import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('category pages are reachable and have contextual enquiries',async()=>{for(const p of ['','en/','vi/']){const home=await readFile(new URL('../'+p+'index.html',import.meta.url),'utf8');for(const slug of ['gravur','events','photo-film','digital'])assert.ok(home.includes('href="/'+p+slug+'"'));for(const slug of ['events','photo-film','digital']){const html=await readFile(new URL('../'+p+slug+'.html',import.meta.url),'utf8');assert.ok(html.includes('data-enquiry="'+slug+'"'));assert.ok(html.includes('data-product="'+slug+'"'));assert.ok(html.includes('src="/chat.js"'));}}});
