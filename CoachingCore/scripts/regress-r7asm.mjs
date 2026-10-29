// COACHING CORE — STATE MODEL CLOSURE regression: the same inputs through the STATE-EVIDENCE-FREEZE-1 runtime (audits/domain-coaching-
// r7a-state-model-2026-10-28/state-evidence-freeze-source, rebuilt in a temporary folder) and the current runtime, then a semantic comparison. Inputs:
// the R6 fresh holdout (35) and the R5 corpus (24), both REGRESSION / challenge reuse and never generalization evidence; the R6 development
// profiles; the R6 simulation trajectories. Ignored as byte-level only, as in R7-A to the R7-A boundary closure: rows' `exposure`, hashes and
// digests, the re-establishment note's "as of the last review", the recorded entry-week flag, per-report input hashes, a week's recorded
// `adaptations` and `startBeforeReturn`, the program's `contextBefore`, the break record a return keeps, the eased slot's break and the
// authority each week records for its start (`startAuthority`, `startBeforeReturnAuthority`, now with per-exercise premises and the values a
// review rebased): bookkeeping whose effect shows in the compared rows, states and decisions. Writes CoachingCore/r7/state-model/
// REGRESSION_R7ASM.json only; never touches earlier evidence.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'../..');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const baseline=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root,'audits/domain-coaching-r7a-state-model-2026-10-28/BASELINE.json'),'utf8')).entries.map(e=>[e.path,e.sha256]));
const support=['CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json','CoachingCore/r5/holdout/R5_INDEPENDENT_HOLDOUT.json','CoachingCore/scripts/evaluate-holdout-r6.mjs','CoachingCore/scripts/simulate-r6.mjs','CoachingCore/r5/PROGRAM_POLICY_R5.json','CoachingCore/r6/PROGRAM_POLICY_R6.json','CoachingCore/r6/fixtures/profiles.mjs','CoachingCore/r6/fixtures/trajectories.mjs','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'];
const inputs={};for(const p of support){const s=sha(path.join(root,p));if(baseline[p]&&s!==baseline[p])throw Error('Input changed since the state evidence baseline: '+p);inputs[p]={sha256:s,boundByBaseline:!!baseline[p]};}
const snap='audits/domain-coaching-r7a-state-model-2026-10-28/state-evidence-freeze-source',manifest=JSON.parse(fs.readFileSync(path.join(root,snap,'MANIFEST.json'),'utf8')),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7asm-prior-'));
const put=(from,to)=>{fs.mkdirSync(path.dirname(path.join(tmp,to)),{recursive:true});fs.copyFileSync(from,path.join(tmp,to));};
try{
 for(const [rel,digest] of Object.entries(manifest.files)){if(sha(path.join(root,snap,rel))!==digest)throw Error('STATE-EVIDENCE-FREEZE-1 snapshot drift: '+rel);put(path.join(root,snap,rel),rel);}
 for(const p of ['CoachingCore/scripts/evaluate-holdout-r6.mjs','CoachingCore/scripts/simulate-r6.mjs','CoachingCore/r5/PROGRAM_POLICY_R5.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'])if(!manifest.files[p])put(path.join(root,p),p);
 const load=(base,rel)=>import(pathToFileURL(path.join(base,rel)).href),runtimes={};
 for(const [name,base] of [['priorFreeze',tmp],['current',root]]){
  const ev=await load(base,'CoachingCore/scripts/evaluate-holdout-r6.mjs'),sim=await load(base,'CoachingCore/scripts/simulate-r6.mjs'),idx=await load(base,'CoachingCore/src/r6-index.mjs'),dev=await load(base,'CoachingCore/r6/fixtures/dev-authority.mjs'),prof=await load(base,'CoachingCore/r6/fixtures/profiles.mjs');
  runtimes[name]={evaluateHoldoutCase:ev.evaluateHoldoutCase,simulateAll:sim.simulateAll,generateProgram:idx.generateProgram,authority:dev.devAuthority(),profiles:{...prof.PROFILES,...prof.EDGE_PROFILES}};
 }
 const NOTE=/Not done for more than (\d+) days as of the last review:/g,SKIP=new Set(['facts','exposure','hash','doseKey','entryWeek','inputHashes','digest','adaptations','contextBefore','startBeforeReturn','easedFor','startAuthority','startBeforeReturnAuthority']);
 const BREAK_RECORD=['startDate','endDate','startedAt','episode','relation','supersedes','basis','revision','inputHash','stateAt','entry'];
 const norm=(x,key)=>Array.isArray(x)?x.map(v=>norm(v)):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).filter(([k])=>!SKIP.has(k)&&!/Hash$|Digest$/.test(k)&&!(key==='interruption'&&BREAK_RECORD.includes(k))).map(([k,v])=>[k,norm(v,k)])):typeof x==='string'?x.replace(NOTE,'Not done for more than $1 days:'):x;
 const diff=(a,b,at='',out=[])=>{if(out.length>=24)return out;if(JSON.stringify(a)===JSON.stringify(b))return out;if(a&&b&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b)){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],at+'/'+k,out);return out;}out.push({path:at,before:JSON.stringify(a)?.slice(0,160)??null,current:JSON.stringify(b)?.slice(0,160)??null});return out;};
 const statusLine=r=>r.steps?.length?r.steps.map(s=>`${s.result.status}/${s.result.action}`).join(' '):r.generation?.status??null;
 const against=(label,fn)=>{const a=norm(fn(runtimes.priorFreeze)),b=norm(fn(runtimes.current)),same=JSON.stringify(a)===JSON.stringify(b);return {label,identical:same,...(same?{}:{differences:diff(a,b)})};};
 const corpus=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8')).cases;
 const caseRun=(rt,c)=>rt.evaluateHoldoutCase(structuredClone(c),{authority:rt.authority});
 const corpusAgainst=cases=>cases.map(c=>{const a=caseRun(runtimes.priorFreeze,c),b=caseRun(runtimes.current,c),x=norm(a),y=norm(b),same=JSON.stringify(x)===JSON.stringify(y);return {caseId:c.caseId,operation:c.operation,identical:same,before:statusLine(a),current:statusLine(b),...(same?{}:{differences:diff(x,y)})};});
 const count=list=>({cases:list.length,identical:list.filter(x=>x.identical).length,different:list.filter(x=>!x.identical).map(x=>x.caseId??x.label),statusChanged:list.filter(x=>x.before!==undefined&&x.before!==x.current).map(x=>`${x.caseId}: ${x.before} -> ${x.current}`)});
 const h6=corpusAgainst(corpus('CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json')),h5=corpusAgainst(corpus('CoachingCore/r5/holdout/R5_INDEPENDENT_HOLDOUT.json'));
 const profiles=Object.keys(runtimes.current.profiles).map(k=>against(k,rt=>rt.generateProgram(structuredClone(rt.profiles[k]),{authority:rt.authority})));
 const simsRef=runtimes.priorFreeze.simulateAll({authority:runtimes.priorFreeze.authority}),simsCur=runtimes.current.simulateAll({authority:runtimes.current.authority});
 const simulations=simsCur.map((t,i)=>{const a=norm(simsRef[i]),b=norm(t),same=JSON.stringify(a)===JSON.stringify(b);return {label:t.id,identical:same,...(same?{}:{differences:diff(a,b)})};});
 const out={revision:'R7ASM-REGRESSION-1',generatedAt:new Date().toISOString(),classification:'REGRESSION / CHALLENGE REUSE; not generalization evidence',authority:'DEV_TEST_ONLY devAuthority() bound to the current policy hash',
  runtimes:{priorFreeze:{snapshot:snap,sourceDigest:manifest.freeze.sourceDigest},current:{sources:Object.fromEntries(fs.readdirSync(path.join(root,'CoachingCore/src')).filter(f=>f.startsWith('r6-')).sort().map(f=>['CoachingCore/src/'+f,sha(path.join(root,'CoachingCore/src',f))]))}},
  inputs,ignoredAsByteLevel:[...SKIP,'*Hash, *Digest','re-establishment note wording "as of the last review"','interruption.'+BREAK_RECORD.join('|')],
  summary:{r6FreshHoldout:count(h6),r5Corpus:count(h5),profiles:count(profiles),simulations:count(simulations)},r6FreshHoldout:h6,r5Corpus:h5,profiles,simulations};
 fs.mkdirSync(path.join(root,'CoachingCore/r7/state-evidence'),{recursive:true});
 fs.writeFileSync(path.join(root,'CoachingCore/r7/state-model/REGRESSION_R7ASM.json'),JSON.stringify(out,null,1)+'\n');
 console.log(JSON.stringify(out.summary,null,1));
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
