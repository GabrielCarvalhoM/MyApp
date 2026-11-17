// Portable-host proof (ADR, minimal proof of concept): the same synthetic journey run twice in fresh processes, once on Node's own fs and
// crypto and once with the engine bound to the minimal host (bundled assets, host bytes, SHA-256 only), also once more interpreter-only.
// Passes when every answer and the final envelope are byte-identical and the engine asked the host for nothing else.
// Run: node audits/v1-app-integration-foundation-2026-11-16/harness/portable/proof.mjs  (writes results/portable.json)
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),SELF=fileURLToPath(import.meta.url),OUT=path.join(HERE,'..','..','results');

async function journey(){
 const {createClient,digestOf}=await import('../lib.mjs'),Sc=await import('../scenario.mjs');
 const c=createClient(),digests=[],g=c.onboard(Sc.athleteA());digests.push(digestOf(g));
 for(let w=0;w<3;w++){const f=Sc.weekFacts(c.envelope,w);digests.push(digestOf(c.review('WEEKLY_REVIEW',f.asOf,f.facts)));}
 const day=Sc.addDays(c.envelope.program.startDate,22);digests.push(digestOf(c.review('NOT_FEELING_100',Sc.at(day,'08:00'),Sc.notFeeling100WithSign(day))));
 return {digests,envelope:digestOf(c.envelope),host:globalThis.__AIF_HOST?{bundledAssets:globalThis.__AIF_HOST.files.length,bundledBytes:[...globalThis.__AIF_HOST.assets.values()].reduce((a,t)=>a+Buffer.byteLength(t),0),
  calls:globalThis.__AIF_HOST.calls,misses:globalThis.__AIF_HOST.misses,unsupported:globalThis.__AIF_HOST.unsupported,files:globalThis.__AIF_HOST.files}:null};
}
if(process.argv[2]==='--child'){console.log(JSON.stringify(await journey()));process.exit(0);}
const preload=pathToFileURL(path.join(HERE,'preload.mjs')).href;
const run=flags=>JSON.parse(execFileSync(process.execPath,[...flags,SELF,'--child'],{encoding:'utf8',maxBuffer:32*2**20}).trim().split('\n').at(-1));
const node=run([]),host=run(['--import',preload]),hostJitless=run(['--jitless','--import',preload]);
const same=(a,b)=>a.envelope===b.envelope&&a.digests.length===b.digests.length&&a.digests.every((d,i)=>d===b.digests[i]);
const out={shimsCalled:!!host.host&&host.host.calls.readFileSync>0&&host.host.calls.sha256>0,what:'engine bound to the minimal host vs Node fs/crypto; same synthetic journey (generate, three weekly reviews, a warning sign)',
 identical:{host:same(node,host),hostJitless:same(node,hostJitless)},answers:node.digests.length,host:host.host,hostJitlessCalls:hostJitless.host?.calls,
 hostInterface:['readFileSync(url) -> bytes {toString("utf8")} | readFileSync(url,"utf8") -> string (bundled assets only)','existsSync(url) -> boolean','createHash("sha256").update(text|bytes).digest("hex")']};
fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,'portable.json'),JSON.stringify(out,null,1)+'\n');
console.log(`portable host: identical=${out.identical.host}, interpreter-only identical=${out.identical.hostJitless}; assets ${host.host.bundledAssets} (${host.host.bundledBytes} B); calls ${JSON.stringify(host.host.calls)}; misses ${host.host.misses.length}; unsupported ${host.host.unsupported.length}`);
// QRE-AIF-04: identical answers prove nothing unless the shims were the ones called.
process.exit(out.identical.host&&out.identical.hostJitless&&out.shimsCalled&&hostJitless.host?.calls.sha256>0&&!host.host.misses.length&&!host.host.unsupported.length?0:1);
