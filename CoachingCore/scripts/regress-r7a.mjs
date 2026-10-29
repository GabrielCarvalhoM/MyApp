// DOMAIN_COACHING_R7-A regression: the same inputs through the R6 closure runtime (audits/domain-coaching-r7a-2026-10-27/pre-r7a-source,
// rebuilt in a temporary folder) and through the current runtime, then a semantic comparison. Inputs: the R6 fresh holdout (35 cases)
// and the R5 corpus (24 cases), both REGRESSION / challenge reuse and never generalization evidence; the R6 development profiles; the
// R6 simulation trajectories. Ignored as byte-level only: the rows' new `exposure` field, hashes and digests, and the re-establishment
// note's added "as of the last review"; from the second cycle, the week's recorded entry-week flag and the per-report input hashes of a
// carried fact (both bookkeeping whose effect shows in the compared rows and decisions). Writes CoachingCore/r7/REGRESSION_R7A.json; never touches R6 or R5 evidence.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'../..'),snap=path.join(root,'audits/domain-coaching-r7a-2026-10-27/pre-r7a-source');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const baseline=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root,'audits/domain-coaching-r7a-2026-10-27/BASELINE.json'),'utf8')).entries.map(e=>[e.path,e.sha256]));
// Inputs and support files must be the bytes the baseline bound before R7-A.
const unchanged=['CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json','CoachingCore/r5/holdout/R5_INDEPENDENT_HOLDOUT.json','CoachingCore/scripts/evaluate-holdout-r6.mjs','CoachingCore/scripts/simulate-r6.mjs','CoachingCore/r5/PROGRAM_POLICY_R5.json','CoachingCore/r6/PROGRAM_POLICY_R6.json','CoachingCore/r6/fixtures/profiles.mjs','CoachingCore/r6/fixtures/trajectories.mjs','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'];
const inputs={};for(const p of unchanged){const s=sha(path.join(root,p));if(baseline[p]&&s!==baseline[p])throw Error('Input changed since the R7-A baseline: '+p);inputs[p]={sha256:s,boundByBaseline:!!baseline[p]};}
// The pre-R7A runtime, rebuilt in a temporary folder with the support files it reads.
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7a-pre-'));
const put=(from,to)=>{fs.mkdirSync(path.dirname(path.join(tmp,to)),{recursive:true});fs.copyFileSync(from,path.join(tmp,to));};
const manifest=JSON.parse(fs.readFileSync(path.join(snap,'MANIFEST.json'),'utf8'));
for(const [rel,digest] of Object.entries(manifest.files)){if(sha(path.join(snap,rel))!==digest)throw Error('Snapshot drift: '+rel);put(path.join(snap,rel),rel);}
for(const p of ['CoachingCore/scripts/evaluate-holdout-r6.mjs','CoachingCore/scripts/simulate-r6.mjs','CoachingCore/r5/PROGRAM_POLICY_R5.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'])put(path.join(root,p),p);
const load=(base,rel)=>import(pathToFileURL(path.join(base,rel)).href);
const runtimes={};
try{
 for(const [name,base] of [['pre',tmp],['current',root]]){
  const ev=await load(base,'CoachingCore/scripts/evaluate-holdout-r6.mjs'),sim=await load(base,'CoachingCore/scripts/simulate-r6.mjs'),idx=await load(base,'CoachingCore/src/r6-index.mjs'),dev=await load(base,'CoachingCore/r6/fixtures/dev-authority.mjs'),prof=await load(base,'CoachingCore/r6/fixtures/profiles.mjs');
  runtimes[name]={evaluateHoldoutCase:ev.evaluateHoldoutCase,simulateAll:sim.simulateAll,generateProgram:idx.generateProgram,authority:dev.devAuthority(),profiles:{...prof.PROFILES,...prof.EDGE_PROFILES}};
 }
 // Byte-level differences that carry no meaning of their own.
 const NOTE=/Not done for more than (\d+) days as of the last review:/g;
 const norm=x=>Array.isArray(x)?x.map(norm):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).filter(([k])=>k!=='exposure'&&k!=='hash'&&k!=='doseKey'&&k!=='entryWeek'&&k!=='inputHashes'&&!/Hash$|Digest$/.test(k)&&k!=='digest').map(([k,v])=>[k,norm(v)])):typeof x==='string'?x.replace(NOTE,'Not done for more than $1 days:'):x;
 const diff=(a,b,at='',out=[])=>{if(out.length>=24)return out;if(JSON.stringify(a)===JSON.stringify(b))return out;if(a&&b&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b)){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],at+'/'+k,out);return out;}out.push({path:at,pre:JSON.stringify(a)?.slice(0,160)??null,current:JSON.stringify(b)?.slice(0,160)??null});return out;};
 const compare=(label,fn)=>{const a=norm(fn(runtimes.pre)),b=norm(fn(runtimes.current)),same=JSON.stringify(a)===JSON.stringify(b);return {label,identical:same,...(same?{}:{differences:diff(a,b)})};};
 const statusLine=r=>r.steps?.length?r.steps.map(s=>`${s.result.status}/${s.result.action}`).join(' '):r.generation?.status??null;
 const corpus=(file,prefix)=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8')).cases.map(c=>{
  const run=rt=>rt.evaluateHoldoutCase(structuredClone(c),{authority:rt.authority});
  const pre=run(runtimes.pre),cur=run(runtimes.current),a=norm(pre),b=norm(cur),same=JSON.stringify(a)===JSON.stringify(b);
  return {caseId:c.caseId,operation:c.operation,identical:same,pre:statusLine(pre),current:statusLine(cur),...(same?{}:{differences:diff(a,b)})};
 });
 const r6=corpus('CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json'),r5=corpus('CoachingCore/r5/holdout/R5_INDEPENDENT_HOLDOUT.json');
 const profiles=Object.keys(runtimes.current.profiles).map(k=>compare(k,rt=>rt.generateProgram(structuredClone(rt.profiles[k]),{authority:rt.authority})));
 const sims=compare('SIMULATIONS',rt=>rt.simulateAll({authority:rt.authority}));
 const count=list=>({cases:list.length,identical:list.filter(x=>x.identical).length,different:list.filter(x=>!x.identical).map(x=>x.caseId??x.label),statusChanged:list.filter(x=>x.pre!==undefined&&x.pre!==x.current).map(x=>`${x.caseId}: ${x.pre} -> ${x.current}`)});
 const out={revision:'R7A-REGRESSION-1',generatedAt:new Date().toISOString(),classification:'REGRESSION / CHALLENGE REUSE; not generalization evidence',authority:'DEV_TEST_ONLY devAuthority() bound to the current policy hash',preRuntime:{snapshot:'audits/domain-coaching-r7a-2026-10-27/pre-r7a-source',r6ProgramSha256:manifest.r6ProgramSha256},currentSources:Object.fromEntries(fs.readdirSync(path.join(root,'CoachingCore/src')).filter(f=>f.startsWith('r6-')).sort().map(f=>['CoachingCore/src/'+f,sha(path.join(root,'CoachingCore/src',f))])),inputs,ignoredAsByteLevel:['exercise row field exposure','*Hash, *Digest, hash, digest, doseKey (a strength doseKey is the prescription hash)','re-establishment note wording "as of the last review"'],
  summary:{r6FreshHoldout:count(r6),r5Corpus:count(r5),profiles:count(profiles),simulations:{identical:sims.identical}},r6FreshHoldout:r6,r5Corpus:r5,profiles,simulations:sims};
 fs.mkdirSync(path.join(root,'CoachingCore/r7'),{recursive:true});
 fs.writeFileSync(path.join(root,'CoachingCore/r7/REGRESSION_R7A.json'),JSON.stringify(out,null,1)+'\n');
 console.log(JSON.stringify(out.summary,null,1));
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
