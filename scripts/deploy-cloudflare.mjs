import { spawnSync } from 'node:child_process';

const hook=process.env.CLOUDFLARE_DEPLOY_HOOK;
const token=process.env.CLOUDFLARE_API_TOKEN;
const account=process.env.CLOUDFLARE_ACCOUNT_ID;

if(hook) {
  let target;
  try {target=new URL(hook);} catch {throw new Error('CLOUDFLARE_DEPLOY_HOOK ist keine gültige URL.');}
  const officialHook=/^\/client\/v4\/(?:workers\/builds|pages\/webhooks)\/deploy_hooks\/[^/]+$/;
  if(target.origin!=='https://api.cloudflare.com' || !officialHook.test(target.pathname)) throw new Error('Der Deploy-Hook muss eine offizielle Cloudflare-Workers- oder Pages-Deploy-Hook-URL sein.');
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
  // This website is an existing assets-only Worker, not a Pages project.
  // The explicit Wrangler config names that Worker; domains remain untouched.
  const result=spawnSync('npx',['--yes','wrangler@4.119.0','deploy','--config','wrangler.jsonc'],{stdio:'inherit',env:process.env});
  if(result.status!==0)process.exit(result.status||1);
}
