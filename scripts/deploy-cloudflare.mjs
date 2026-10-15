import { spawnSync } from 'node:child_process';

const hook=process.env.CLOUDFLARE_DEPLOY_HOOK;
const token=process.env.CLOUDFLARE_API_TOKEN;
const account=process.env.CLOUDFLARE_ACCOUNT_ID;
const requestedProject=process.env.CLOUDFLARE_PAGES_PROJECT;
const api='https://api.cloudflare.com/client/v4';

if(hook) {
  let target;
  try {target=new URL(hook);} catch {throw new Error('CLOUDFLARE_DEPLOY_HOOK ist keine gültige URL.');}
  if(target.origin!=='https://api.cloudflare.com' || !/^\/client\/v4\/pages\/webhooks\/deploy_hooks\/[^/]+$/.test(target.pathname)) throw new Error('Der Deploy-Hook muss ein offizieller Cloudflare-Pages-Deploy-Hook sein.');
  const response=await fetch(target,{method:'POST',signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw new Error(`Cloudflare hat den Deploy-Hook abgelehnt (HTTP ${response.status}).`);
  const result=await response.json();
  if(result.success!==true)throw new Error('Cloudflare hat den Deployment-Auftrag nicht bestätigt.');
  console.log('Cloudflare hat den Deployment-Auftrag über den hinterlegten Hook angenommen.');
} else {
  const missing=[];
  if(!token)missing.push('CLOUDFLARE_API_TOKEN');
  if(!account)missing.push('CLOUDFLARE_ACCOUNT_ID');
  if(missing.length) {
    console.error('::error::Website-Deployment nicht möglich. Hinterlege in diesem GitHub-Repository entweder CLOUDFLARE_DEPLOY_HOOK oder beide Secrets CLOUDFLARE_API_TOKEN und CLOUDFLARE_ACCOUNT_ID. Fehlend: '+missing.join(', '));
    process.exit(1);
  }
  if(!/^[a-f0-9]{32}$/i.test(account))throw new Error('CLOUDFLARE_ACCOUNT_ID muss eine gültige Account-ID sein.');
  // Find the existing Pages project for this domain; never create or guess one.
  const projects=[];
  for(let page=1;page<=100;page++) {
    const response=await fetch(`${api}/accounts/${account}/pages/projects?per_page=100&page=${page}`,{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(30000)});
    if(!response.ok)throw new Error(`Pages-Projekte konnten nicht gelesen werden (HTTP ${response.status}). Prüfe den Account und Pages-Berechtigungen des Tokens.`);
    const data=await response.json();
    if(!data.success||!Array.isArray(data.result))throw new Error('Cloudflare hat keine gültige Projektliste geliefert.');
    projects.push(...data.result);
    if(!data.result_info?.total_pages || page>=data.result_info.total_pages)break;
  }
  const matches=projects.filter(p=>(!requestedProject||p.name===requestedProject)&&p.domains?.some(domain=>domain==='jlsolutions.info'||domain==='www.jlsolutions.info'));
  if(matches.length!==1)throw new Error('Es wurde kein eindeutig passendes Pages-Projekt für jlsolutions.info gefunden. Bei mehreren Treffern CLOUDFLARE_PAGES_PROJECT als Repository-Variable setzen. Es wurde nichts veröffentlicht.');
  const project=matches[0];
  const result=spawnSync('npx',['--yes','wrangler@4.119.0','pages','deploy','dist','--project-name',project.name,'--branch',project.production_branch||'main','--commit-hash',process.env.GITHUB_SHA||'','--commit-dirty=true'],{stdio:'inherit',env:process.env});
  if(result.status!==0)process.exit(result.status||1);
}
