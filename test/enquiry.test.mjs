import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
const source=await readFile(new URL('../chat.js',import.meta.url),'utf8');

// Exercise the complete shipped client with a minimal DOM and an isolated API.
// No browser session, personal data or production requests are used.
function client({product='',saved=null,lang='de'}={}){
  const nodes=new Map(),events=new Map(),calls=[];
  function node(){return {hidden:false,value:'',textContent:'',children:[],attrs:{},listeners:{},setAttribute(k,v){this.attrs[k]=v;},focus(){},append(...items){this.children.push(...items);},replaceChildren(){this.children=[];},addEventListener(k,fn){this.listeners[k]=fn;}};}
  function form(first){const f=node();f.fields={message:node(),...(first?{name:node(),email:node(),website:node()}:{})};f.button=node();f.querySelector=s=>s==='button'?f.button:s==='textarea, input'&&first?f.fields.name:f.fields.message;f.reportValidity=()=>Boolean(f.fields.message.value.trim()&&(!first||(f.fields.name.value.length>=2&&/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.fields.email.value))));f.reset=()=>Object.values(f.fields).forEach(v=>v.value='');return f;}
  const start=form(true),reply=form(false),hint=node(),span=node();hint.querySelector=()=>span;
  nodes.set('#start',start);nodes.set('#reply',reply);nodes.set('.service-hint',hint);
  const root=node();root.querySelector=s=>{if(!nodes.has(s))nodes.set(s,node());return nodes.get(s);};
  const document={documentElement:{lang},body:{dataset:{product},append(){}},hidden:false,createElement(){const n=node();n.attachShadow=()=>root;return n;},addEventListener(k,fn){events.set(k,fn);}};
  const storage={getItem(){return saved?JSON.stringify(saved):null;},setItem(){},removeItem(){}};
  class FormData{constructor(f){this.values=Object.entries(f.fields).map(([key,n])=>[key,n.value]);}*[Symbol.iterator](){yield* this.values;}}
  const fetch=async(url,options)=>{calls.push({url,options});return {ok:true,status:200,json:async()=>({ok:true,messages:[]})};};
  new vm.Script(source).runInNewContext({document,localStorage:storage,crypto:webcrypto,FormData,fetch,window:{addEventListener(){}},setInterval(){},setTimeout(){},confirm:()=>true});
  return {start,reply,hint,span,calls,root,choose(service){events.get('jl:enquiry')({detail:{service}});},clear(){nodes.get('.service-clear').onclick();},submit(f){return f.listeners.submit({preventDefault(){},currentTarget:f});}};
}

test('product CTA opens a labelled draft without sending or replacing existing text',()=>{
  const c=client();c.start.fields.message.value='Meine Maße sind 20 × 30 cm.';c.choose('gravur');
  assert.equal(c.start.fields.message.value,'Meine Maße sind 20 × 30 cm.');
  assert.equal(c.span.textContent,'Ihre Anfrage: Lasergravur');
  assert.equal(c.hint.hidden,false);assert.equal(c.root.querySelector('#panel').hidden,false);
  assert.equal(c.calls.length,0);
  c.clear();assert.equal(c.hint.hidden,true);assert.equal(c.start.fields.message.maxLength,4000);
});

test('required identity blocks submission; chosen service reaches the submitted message',async()=>{
  assert.match(source,/<input name="name"[^>]*required/);
  assert.match(source,/<input name="email"[^>]*type="email"[^>]*required/);
  const c=client({product:'smart-qr'});c.choose('smart-qr');
  await c.submit(c.start);assert.equal(c.calls.length,0);
  c.start.fields.name.value='Testkunde';c.start.fields.email.value='invalid';
  await c.submit(c.start);assert.equal(c.calls.length,0);
  c.start.fields.email.value='test@example.com';c.start.fields.message.value='Bitte zeigen Sie mir die Speisekarte.';
  await c.submit(c.start);
  const post=c.calls.find(call=>call.options.method==='POST');assert.ok(post);
  const payload=JSON.parse(post.options.body);
  assert.equal(payload.message,'[Smart QR]\nBitte zeigen Sie mir die Speisekarte.');
  assert.equal(payload.name,'Testkunde');assert.equal(payload.email,'test@example.com');
  assert.equal(post.url,'https://portal.jlsolutions.info/api/website-chat/conversations');
});

test('an existing conversation keeps its access and sends the selected context as a reply',async()=>{
  const token='a'.repeat(64),c=client({saved:{token,started:true}});
  c.reply.fields.message.value='Ich möchte außerdem mehr zum Kalender wissen.';c.choose('growth-ai');
  await c.submit(c.reply);
  const post=c.calls.find(call=>call.options.method==='POST');assert.ok(post);
  assert.equal(post.url,'https://portal.jlsolutions.info/api/website-chat/conversations/current');
  assert.equal(post.options.headers.Authorization,'Bearer '+token);
  assert.equal(JSON.parse(post.options.body).message,'[Growth AI]\nIch möchte außerdem mehr zum Kalender wissen.');
});

test('unknown service values are not placed in the message',async()=>{
  const c=client();c.choose('<script>bad</script>');assert.equal(c.hint.hidden,true);
  assert.equal(c.start.fields.message.value,'');assert.equal(c.calls.length,0);
});
