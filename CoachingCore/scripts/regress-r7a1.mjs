// DOMAIN_COACHING_R7-A.1 regression: the same inputs through the R6 closure runtime (audits/domain-coaching-r7a-2026-10-27/pre-r7a-source),
// the R7A-FREEZE-2 runtime (audits/domain-coaching-r7a1-2026-10-27/freeze2-source), both rebuilt in a temporary folder, and the current
// runtime, then a semantic comparison: current against FREEZE-2 (the R7-A regressions) and current against the R6 closure (the R6 ones).
// Inputs: the R6 fresh holdout (35) and the R5 corpus (24), both REGRESSION / challenge reuse and never generalization evidence; the R6
// development profiles; the R6 simulation trajectories. Ignored as byte-level only, as in R7-A: rows' `exposure`, hashes and digests, the
// re-establishment note's "as of the last review", the recorded entry-week flag and per-report input hashes; from R7-A.1, a week's recorded
// `adaptations` and `startBeforeReturn` and the program's `contextBefore` (bookkeeping whose effect shows in the compared rows and decisions).
// Writes CoachingCore/r7/a1/REGRESSION_R7A1.json only; never touches R5, R6 or R7-A evidence.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'../..');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const baseline=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root,'audits/domain-coaching-r7a1-2026-10-27/BASELINE.json'),'utf8')).entries.map(e=>[e.path,e.sha256]));
const support=['CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json','CoachingCore/r5/holdout/R5_INDEPENDENT_HOLDOUT.json','CoachingCore/scripts/evaluate-holdout-r6.mjs','CoachingCore/scripts/simulate-r6.mjs','CoachingCore/r5/PROGRAM_POLICY_R5.json','CoachingCore/r6/PROGRAM_POLICY_R6.json','CoachingCore/r6/fixtures/profiles.mjs','CoachingCore/r6/fixtures/trajectories.mjs','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'];
const inputs={};for(const p of support){const s=sha(path.join(root,p));if(baseline[p]&&s!==baseline[p])throw Error('Input changed since the R7-A.1 baseline: '+p);inputs[p]={sha256:s,boundByBaseline:!!baseline[p]};}
// The two earlier runtimes, rebuilt in temporary folders with the support files they read, after checking their snapshots.
const rebuild=(snap,label)=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,snap,'MANIFEST.json'),'utf8')),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7a1-'+label+'-'));
 const put=(from,to)=>{fs.mkdirSync(path.dirname(path.join(tmp,to)),{recursive:true});fs.copyFileSync(from,path.join(tmp,to));};
 for(const [rel,digest] of Object.entries(manifest.files)){if(sha(path.join(root,snap,rel))!==digest)throw Error(label+' snapshot drift: '+rel);put(path.join(root,snap,rel),rel);}
 for(const p of ['CoachingCore/scripts/evaluate-holdout-r6.mjs','CoachingCore/scripts/simulate-r6.mjs','CoachingCore/r5/PROGRAM_POLICY_R5.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'])if(!manifest.files[p])put(path.join(root,p),p);
 return {tmp,manifest};
};
const pre=rebuild('audits/domain-coaching-r7a-2026-10-27/pre-r7a-source','pre'),f2=rebuild('audits/domain-coaching-r7a1-2026-10-27/freeze2-source','freeze2');
const load=(base,rel)=>import(pathToFileURL(path.join(base,rel)).href);
const runtimes={};
try{
 for(const [name,base] of [['pre',pre.tmp],['freeze2',f2.tmp],['current',root]]){
  const ev=await load(base,'CoachingCore/scripts/evaluate-holdout-r6.mjs'),sim=await load(base,'CoachingCore/scripts/simulate-r6.mjs'),idx=await load(base,'CoachingCore/src/r6-index.mjs'),dev=await load(base,'CoachingCore/r6/fixtures/dev-authority.mjs'),prof=await load(base,'CoachingCore/r6/fixtures/profiles.mjs');
  runtimes[name]={evaluateHoldoutCase:ev.evaluateHoldoutCase,simulateAll:sim.simulateAll,generateProgram:idx.generateProgram,authority:dev.devAuthority(),profiles:{...prof.PROFILES,...prof.EDGE_PROFILES}};
 }
 const NOTE=/Not done for more than (\d+) days as of the last review:/g,SKIP=new Set(['exposure','hash','doseKey','entryWeek','inputHashes','digest','adaptations','contextBefore','startBeforeReturn']);
 const norm=x=>Array.isArray(x)?x.map(norm):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).filter(([k])=>!SKIP.has(k)&&!/Hash$|Digest$/.test(k)).map(([k,v])=>[k,norm(v)])):typeof x==='string'?x.replace(NOTE,'Not done for more than $1 days:'):x;
 const diff=(a,b,at='',out=[])=>{if(out.length>=24)return out;if(JSON.stringify(a)===JSON.stringify(b))return out;if(a&&b&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b)){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],at+'/'+k,out);return out;}out.push({path:at,before:JSON.stringify(a)?.slice(0,160)??null,current:JSON.stringify(b)?.slice(0,160)??null});return out;};
 const statusLine=r=>r.steps?.length?r.steps.map(s=>`${s.result.status}/${s.result.action}`).join(' '):r.generation?.status??null;
 const against=(ref,label,fn)=>{const a=norm(fn(runtimes[ref])),b=norm(fn(runtimes.current)),same=JSON.stringify(a)===JSON.stringify(b);return {label,identical:same,...(same?{}:{differences:diff(a,b)})};};
 const corpus=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8')).cases;
 const caseRun=(rt,c)=>rt.evaluateHoldoutCase(structuredClone(c),{authority:rt.authority});
 const corpusAgainst=(ref,cases)=>cases.map(c=>{const a=caseRun(runtimes[ref],c),b=caseRun(runtimes.current,c),x=norm(a),y=norm(b),same=JSON.stringify(x)===JSON.stringify(y);return {caseId:c.caseId,operation:c.operation,identical:same,before:statusLine(a),current:statusLine(b),...(same?{}:{differences:diff(x,y)})};});
 const count=list=>({cases:list.length,identical:list.filter(x=>x.identical).length,different:list.filter(x=>!x.identical).map(x=>x.caseId??x.label),statusChanged:list.filter(x=>x.before!==undefined&&x.before!==x.current).map(x=>`${x.caseId}: ${x.before} -> ${x.current}`)});
 const r6=corpus('CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json'),r5=corpus('CoachingCore/r5/holdout/R5_INDEPENDENT_HOLDOUT.json');
 const sections={};
 for(const ref of ['freeze2','pre']){
  const h6=corpusAgainst(ref,r6),h5=corpusAgainst(ref,r5),profiles=Object.keys(runtimes.current.profiles).map(k=>against(ref,k,rt=>rt.generateProgram(structuredClone(rt.profiles[k]),{authority:rt.authority})));
  const simsRef=runtimes[ref].simulateAll({authority:runtimes[ref].authority}),simsCur=runtimes.current.simulateAll({authority:runtimes.current.authority});
  const trajectories=simsCur.map((t,i)=>{const a=norm(simsRef[i]),b=norm(t),same=JSON.stringify(a)===JSON.stringify(b);return {label:t.id,identical:same,...(same?{}:{differences:diff(a,b)})};});
  sections[ref]={summary:{r6FreshHoldout:count(h6),r5Corpus:count(h5),profiles:count(profiles),simulations:count(trajectories)},r6FreshHoldout:h6,r5Corpus:h5,profiles,simulations:trajectories};
 }
 const out={revision:'R7A1-REGRESSION-1',generatedAt:new Date().toISOString(),classification:'REGRESSION / CHALLENGE REUSE; not generalization evidence',authority:'DEV_TEST_ONLY devAuthority() bound to the current policy hash',
  runtimes:{pre:{snapshot:'audits/domain-coaching-r7a-2026-10-27/pre-r7a-source',r6ProgramSha256:pre.manifest.r6ProgramSha256},freeze2:{snapshot:'audits/domain-coaching-r7a1-2026-10-27/freeze2-source',sourceDigest:f2.manifest.freeze.sourceDigest},current:{sources:Object.fromEntries(fs.readdirSync(path.join(root,'CoachingCore/src')).filter(f=>f.startsWith('r6-')).sort().map(f=>['CoachingCore/src/'+f,sha(path.join(root,'CoachingCore/src',f))]))}},
  inputs,ignoredAsByteLevel:[...SKIP,'*Hash, *Digest','re-establishment note wording "as of the last review"'],
  summary:{againstFreeze2:sections.freeze2.summary,againstR6Closure:sections.pre.summary},againstFreeze2:sections.freeze2,againstR6Closure:sections.pre};
 fs.mkdirSync(path.join(root,'CoachingCore/r7/a1'),{recursive:true});
 fs.writeFileSync(path.join(root,'CoachingCore/r7/a1/REGRESSION_R7A1.json'),JSON.stringify(out,null,1)+'\n');
 console.log(JSON.stringify(out.summary,null,1));
}finally{fs.rmSync(pre.tmp,{recursive:true,force:true});fs.rmSync(f2.tmp,{recursive:true,force:true});}
