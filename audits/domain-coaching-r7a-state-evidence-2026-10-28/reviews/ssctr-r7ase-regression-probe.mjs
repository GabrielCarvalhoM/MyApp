// SSCTR R7ASE-SSCTR-r1 regression probe (own; prints only). The same inputs as the author's regression (R6 fresh holdout 35, R5 corpus 24,
// R6 profiles 16, R6 simulations 14) through the byte-exact R7A-BOUNDARY-FINAL-FREEZE copy and the live tree (STATE-EVIDENCE-FREEZE-1), compared
// with a NARROWER ignore set than the author's: only hashes/digests, per-report input hashes and the authority bookkeeping records
// (startAuthority, startBeforeReturnAuthority, interruption.stateAt). Unlike the author's comparison, the return's ENTRY (interruption.entry),
// the break record's dates, `exposure`, `adaptations`, `startBeforeReturn`, `easedFor` and the re-establishment note are compared. For every
// differing case it lists the differing paths and, for each, whether it lies in the proposal weeks at or after the first REESTABLISH step's
// return week (the "return reach"). The boundary copy is assembled in the OS temp dir (scratch) as the author's regression does, then removed.
// Read-only runtime use; synthetic data; DEV_TEST_ONLY authority. Usage: node ssctr-r7ase-regression-probe.mjs > out.json
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {createHash} from 'node:crypto';import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'../../..'),sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const snap='audits/domain-coaching-r7a-state-evidence-2026-10-28/boundary-freeze-source',manifest=JSON.parse(fs.readFileSync(path.join(root,snap,'MANIFEST.json'),'utf8'));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ssctr-r7ase-bf-'));const put=(from,to)=>{fs.mkdirSync(path.dirname(path.join(tmp,to)),{recursive:true});fs.copyFileSync(from,path.join(tmp,to));};
const out={probe:'R7ASE-SSCTR-r1-REGRESSION',at:new Date().toISOString(),node:process.version};
try{
 for(const [rel,d] of Object.entries(manifest.files)){if(sha(path.join(root,snap,rel))!==d)throw Error('boundary copy drift '+rel);put(path.join(root,snap,rel),rel);}
 for(const p of ['CoachingCore/scripts/evaluate-holdout-r6.mjs','CoachingCore/scripts/simulate-r6.mjs','CoachingCore/r5/PROGRAM_POLICY_R5.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json','audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json'])if(!manifest.files[p]&&fs.existsSync(path.join(root,p)))put(path.join(root,p),p);
 const load=(base,rel)=>import(pathToFileURL(path.join(base,rel)).href),rt={};
 for(const [name,base] of [['boundary',tmp],['stateEvidence',root]]){
  const ev=await load(base,'CoachingCore/scripts/evaluate-holdout-r6.mjs'),sim=await load(base,'CoachingCore/scripts/simulate-r6.mjs'),idx=await load(base,'CoachingCore/src/r6-index.mjs'),dev=await load(base,'CoachingCore/r6/fixtures/dev-authority.mjs'),prof=await load(base,'CoachingCore/r6/fixtures/profiles.mjs');
  rt[name]={ev:ev.evaluateHoldoutCase,sim:sim.simulateAll,gen:idx.generateProgram,authority:dev.devAuthority(),profiles:{...prof.PROFILES,...prof.EDGE_PROFILES}};
 }
 const SKIP=new Set(['hash','digest','inputHashes','startAuthority','startBeforeReturnAuthority']);
 const norm=(x,key)=>Array.isArray(x)?x.map(v=>norm(v)):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).filter(([k])=>!SKIP.has(k)&&!/Hash$|Digest$/.test(k)&&!(key==='interruption'&&k==='stateAt')).map(([k,v])=>[k,norm(v,k)])):x;
 const diff=(a,b,at='',o=[])=>{if(o.length>=400)return o;if(JSON.stringify(a)===JSON.stringify(b))return o;if(a&&b&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b)){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],at+'/'+k,o);return o;}o.push({path:at,boundary:JSON.stringify(a)?.slice(0,200)??null,stateEvidence:JSON.stringify(b)?.slice(0,200)??null});return o;};
 const statusLine=r=>r.steps?.length?r.steps.map(s=>`${s.result.status}/${s.result.action}`).join(' '):r.generation?.status??null;
 // The return reach of a sequence: the first step whose action is REESTABLISH, and its return week (the interruption's first week after its end).
 const reachOf=r=>{const i=(r.steps??[]).findIndex(s=>s.result.action==='REESTABLISH');if(i<0)return null;const p=r.steps[i].result.proposal,itr=p?.interruption;
  const wk=p&&itr?p.weeks.findIndex(w=>w.sessions.some(s=>s.date>itr.endDate)):null;return {step:i,returnWeek:wk};};
 const classify=(d,reach)=>d.map(x=>{const m=x.path.match(/^\/steps\/(\d+)\/result\/(proposal|[^/]+)(?:\/weeks\/(\d+))?/);const step=m?+m[1]:null,week=m&&m[3]!==undefined?+m[3]:null;
  const inReach=!!reach&&step!==null&&(step>reach.step||step===reach.step&&(m[2]!=='proposal'||week===null||week>=reach.returnWeek-1));return {...x,inReturnReach:inReach};});
 const corpus=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8')).cases;
 const run=(r,c)=>r.ev(structuredClone(c),{authority:r.authority});
 const against=cases=>cases.map(c=>{const a=run(rt.boundary,c),b=run(rt.stateEvidence,c),x=norm(a),y=norm(b),same=JSON.stringify(x)===JSON.stringify(y),reach=reachOf(b);
  return {caseId:c.caseId,operation:c.operation,identical:same,statusBoundary:statusLine(a),statusStateEvidence:statusLine(b),...(same?{}:{returnReach:reach,differences:classify(diff(x,y),reach)})};});
 const h6=against(corpus('CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json')),h5=against(corpus('CoachingCore/r5/holdout/R5_INDEPENDENT_HOLDOUT.json'));
 const profiles=Object.keys(rt.stateEvidence.profiles).map(k=>{const a=norm(rt.boundary.gen(structuredClone(rt.boundary.profiles[k]),{authority:rt.boundary.authority})),b=norm(rt.stateEvidence.gen(structuredClone(rt.stateEvidence.profiles[k]),{authority:rt.stateEvidence.authority}));return {label:k,identical:JSON.stringify(a)===JSON.stringify(b),...(JSON.stringify(a)===JSON.stringify(b)?{}:{differences:diff(a,b)})};});
 const sa=rt.boundary.sim({authority:rt.boundary.authority}),sb=rt.stateEvidence.sim({authority:rt.stateEvidence.authority});
 const simulations=sb.map((t,i)=>{const a=norm(sa[i]),b=norm(t),same=JSON.stringify(a)===JSON.stringify(b);return {label:t.id,identical:same,...(same?{}:{differences:diff(a,b)})};});
 const sum=l=>({cases:l.length,identical:l.filter(x=>x.identical).length,different:l.filter(x=>!x.identical).map(x=>x.caseId??x.label),statusChanged:l.filter(x=>x.statusBoundary!==undefined&&x.statusBoundary!==x.statusStateEvidence).map(x=>x.caseId),
  differencesOutsideReturnReach:l.filter(x=>!x.identical).flatMap(x=>(x.differences??[]).filter(d=>d.inReturnReach===false||d.inReturnReach===undefined).map(d=>(x.caseId??x.label)+' '+d.path))});
 Object.assign(out,{ignored:[...SKIP,'*Hash/*Digest','interruption.stateAt'],summary:{r6FreshHoldout:sum(h6),r5Corpus:sum(h5),profiles:sum(profiles),simulations:sum(simulations)},
  differing:{r6FreshHoldout:h6.filter(x=>!x.identical),r5Corpus:h5.filter(x=>!x.identical),profiles:profiles.filter(x=>!x.identical),simulations:simulations.filter(x=>!x.identical)}});
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
console.log(JSON.stringify(out,null,1));
