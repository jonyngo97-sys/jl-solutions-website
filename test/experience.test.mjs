import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../experience.js',import.meta.url),'utf8');

function control(text=''){
  return {textContent:text,attrs:{},dataset:{},listeners:{},setAttribute(k,v){this.attrs[k]=v;},getAttribute(k){return this.attrs[k];},addEventListener(k,fn){this.listeners[k]=fn;},focus(){this.focused=true;}};
}
function fixture(){
  const panels=new Map();
  const sets=Array.from({length:3},(_,set)=>{
    const tabs=Array.from({length:3},(_,i)=>{
      const tab=control();tab.attrs['aria-controls']=set+'-'+i;panels.set(set+'-'+i,{});return tab;
    });
    return {tabs,dataset:{},querySelector(){return {querySelectorAll:()=>tabs};}};
  });
  const image={},label={},materials=['wood','slate','metal'].map((name,i)=>{
    const button=control(['Holz','Schiefer','Metall'][i]);button.dataset.material=name;return button;
  });
  const document={
    querySelectorAll:s=>s==='[data-tabset]'?sets:materials,
    querySelector:s=>s==='[data-material-image]'?image:label,
    getElementById:id=>panels.get(id)
  };
  new vm.Script(source).runInNewContext({document});
  return {sets,panels,image,label,materials};
}

test('goal switching shows only the requested solution and preserves nested demo selection',()=>{
  const f=fixture();
  assert.equal(f.panels.get('0-0').hidden,false);
  assert.equal(f.panels.get('0-1').hidden,true);
  f.sets[0].tabs[1].listeners.click();
  assert.equal(f.panels.get('0-0').hidden,true);
  assert.equal(f.panels.get('0-1').hidden,false);
  f.sets[1].tabs[2].listeners.click();
  f.sets[0].tabs[2].listeners.click();f.sets[0].tabs[1].listeners.click();
  assert.equal(f.panels.get('1-2').hidden,false);
  assert.equal(f.sets[1].tabs[2].attrs['aria-selected'],'true');
});
test('keyboard navigation wraps, supports Home/End and focuses the selected tab',()=>{
  const f=fixture(),tabs=f.sets[0].tabs;
  let prevented=false;
  tabs[0].listeners.keydown({key:'ArrowLeft',preventDefault(){prevented=true;}});
  assert.equal(prevented,true);assert.equal(tabs[2].focused,true);
  assert.equal(tabs[2].tabIndex,0);assert.equal(tabs[0].tabIndex,-1);
  tabs[2].listeners.keydown({key:'Home',preventDefault(){}});
  assert.equal(f.panels.get('0-0').hidden,false);
  tabs[0].listeners.keydown({key:'End',preventDefault(){}});
  assert.equal(f.panels.get('0-2').hidden,false);
});
test('material choice updates the actual sample, caption and pressed state',()=>{
  const f=fixture();f.materials[1].listeners.click();
  assert.equal(f.image.src,'/assets/material-slate.webp');
  assert.equal(f.image.alt,'Schiefer');assert.equal(f.label.textContent,'Schiefer');
  assert.equal(f.materials[0].attrs['aria-pressed'],'false');
  assert.equal(f.materials[1].attrs['aria-pressed'],'true');
});
test('all languages include working product/contact fallbacks and label the simulated workflow',async()=>{
  for(const prefix of ['','en/','vi/']){
    const html=await readFile(new URL('../'+prefix+'index.html',import.meta.url),'utf8');
    for(const service of ['gravur','smart-qr','growth-ai']){
      assert.ok(html.includes('href="/'+prefix+service+'"'));
      assert.ok(html.includes('data-enquiry="'+service+'"'));
    }
    assert.ok(html.includes('src="/experience.js"'));
    assert.ok(html.includes('data-tabset'));
    assert.ok(!/role="tabpanel"[^>]*\shidden/.test(html),'content is available without JavaScript');
    const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
    assert.equal(new Set(ids).size,ids.length,'all tab/control ids are unique');
  }
});
