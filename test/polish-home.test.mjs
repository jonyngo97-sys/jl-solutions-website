import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('homepage keeps the framed Berlin portrait hero in all languages, with no background video',async()=>{
  for(const prefix of ['','en/','vi/']){
    const s=await read(prefix+'index.html');
    assert.equal((s.match(/class="ed-hero-image"/g)||[]).length,1);
    assert.ok(s.includes('src="/assets/stock-berlin.jpg"'));
    assert.doesNotMatch(s,/<video\b/);
    assert.doesNotMatch(s,/data-hero-video|ed-hero-video|hero-laser/);
    assert.ok(s.includes('src="/studio-motion.js"'));
  }
});
test('motion is progressive enhancement and respects reduced motion',async()=>{
  const js=await read('studio-motion.js');
  assert.match(js,/prefers-reduced-motion: reduce/);
  assert.match(js,/IntersectionObserver/);
  assert.doesNotMatch(js,/data-hero-video|hero-laser|<video/);
  const css=await read('studio.css');
  assert.doesNotMatch(css,/ed-hero-video|hero-laser/);
  // hidden reveal state only exists in the no-preference block and is added by JS (.rv), never by default
  assert.match(css,/@media\(prefers-reduced-motion:no-preference\)\{[\s\S]*\.editorial-home \.rv\{opacity:0/);
  assert.doesNotMatch(css.replace(/@media\(prefers-reduced-motion:no-preference\)\{[\s\S]*?\n\}\n/g,''),/\.rv\{opacity:0/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{[\s\S]*\.editorial-home \.rv\{opacity:1!important/);
});
test('homepage typography polish is applied in all languages',async()=>{
  for(const [file,lead] of [
    ['index.html','Persönlich abgestimmt – von der ersten Idee bis zum fertigen Ergebnis.'],
    ['en/index.html','Discussed with you personally – from the first idea to the finished result.'],
    ['vi/index.html','Trao đổi trực tiếp với bạn – từ ý tưởng đầu tiên đến kết quả hoàn thiện.']
  ]){
    const s=await read(file);
    assert.ok(s.includes(lead));
  }
  const css=await read('studio.css');
  assert.match(css,/\.editorial-home \.ed-section-head h2\{font-size:clamp\(/);
  assert.match(css,/\.editorial-home \.ed-service-points\{display:flex/);
});
