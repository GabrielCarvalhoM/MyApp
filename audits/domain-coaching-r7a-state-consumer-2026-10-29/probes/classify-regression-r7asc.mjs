// Author probe (prints only): the regression's differences against HISTORICAL-PROJECTION-FREEZE-1, in full. Re-runs every regression input on the
// predecessor copy and the live tree (as scripts/regress-r7asc.mjs does), removes the bookkeeping this mission adds to the stored plan (the
// re-entry dose summary planned.{returnStep,restart,walkStep}) and lists, per differing case, every prescription that changed: session, exercise
// or run, the field, before and now, and whether the dose rose or fell (sets, reps, load, minutes). Decision statuses are compared too.
// Usage: node classify-regression-r7asc.mjs [priorSnapshot]  (default: this mission's state-model-freeze-source).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'../../..'),sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const snap=process.argv[2]??'audits/domain-coaching-r7a-state-consumer-2026-10-29/state-model-freeze-source',manifest=JSON.parse(fs.readFileSync(path.join(root,snap,'MANIFEST.json'),'utf8'));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7asc-cls-')),put=(from,to)=>{fs.mkdirSync(path.dirname(path.join(tmp,to)),{recursive:true});fs.copyFileSync(from,path.join(tmp,to));};
try{
 for(const [rel,d] of Object.entries(manifest.files)){if(sha(path.join(root,snap,rel))!==d)throw Error('drift '+rel);put(path.join(root,snap,rel),rel);}
 for(const p of ['CoachingCore/scripts/evaluate-holdout-r6.mjs','CoachingCore/scripts/simulate-r6.mjs','CoachingCore/r5/PROGRAM_POLICY_R5.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'])if(!manifest.files[p])put(path.join(root,p),p);
 const load=(base,rel)=>import(pathToFileURL(path.join(base,rel)).href),rt={};
 for(const [name,base] of [['prior',tmp],['current',root]]){const ev=await load(base,'CoachingCore/scripts/evaluate-holdout-r6.mjs'),sim=await load(base,'CoachingCore/src/r6-simulator.mjs'),traj=await load(base,'CoachingCore/r6/fixtures/trajectories.mjs'),idx=await load(base,'CoachingCore/src/r6-index.mjs'),dev=await load(base,'CoachingCore/r6/fixtures/dev-authority.mjs'),prof=await load(base,'CoachingCore/r6/fixtures/profiles.mjs');rt[name]={ev:ev.evaluateHoldoutCase,sim:o=>traj.TRAJECTORIES.map(t=>({id:t.id,...sim.simulateProgram(t.input,t.script,o)})),gen:idx.generateProgram,authority:dev.devAuthority(),profiles:{...prof.PROFILES,...prof.EDGE_PROFILES}};}
 const BOOK=['returnStep','restart','walkStep'];
 // The programs a run produced: the generated program and every proposal adopted, in order (the shape evaluate-holdout-r6 and simulate-r6 return).
 const programsOf=r=>{const out=[];const walk=x=>{if(!x||typeof x!=='object')return;if(x.version==='R6-PROGRAM-1'&&Array.isArray(x.weeks))out.push(x);for(const v of Object.values(x))if(v&&typeof v==='object')walk(v);};walk(r);return out;};
 const rowsOf=p=>Object.fromEntries(p.weeks.flatMap(w=>w.sessions.filter(s=>s.prescription).flatMap(s=>s.sport==='STRENGTH'?s.prescription.exercises.map(e=>[`${s.id}:${e.id}`,{sets:e.sets,reps:e.reps,rir:e.rir,mode:e.load.mode,load:e.load.value??null,kind:e.exposure?.kind??null}]):[[s.id,{role:s.role,minutes:s.prescription.durationMinutes,family:s.prescription.family}]])));
 const strip=x=>Array.isArray(x)?x.map(strip):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).filter(([k])=>!['programBefore','programAfter','programBeforeRef','facts','exposure','hash','inputHashes','digest','adaptations','contextBefore','startBeforeReturn','easedFor','startAuthority','startBeforeReturnAuthority','doseKey'].includes(k)&&!/Hash$|Digest$/.test(k)).map(([k,v])=>[k,k==='planned'&&v&&typeof v==='object'?Object.fromEntries(Object.entries(v).filter(([q])=>!BOOK.includes(q))):strip(v)])):x;
 const statusLine=r=>r.steps?.length?r.steps.map(s=>`${s.result.status}/${s.result.action}`).join(' '):Array.isArray(r.decisions)?r.decisions.map(d=>`${d.status}/${d.action}`).join(' '):r.generation?.status??null;
 const compareRuns=(a,b)=>{
  const same=JSON.stringify(strip(a))===JSON.stringify(strip(b)),pa=programsOf(a),pb=programsOf(b),rows=[],rose=[],fell=[];
  const final=x=>x.at(-1);if(a.finalProgram&&b.finalProgram){pa.push(a.finalProgram);pb.push(b.finalProgram);}
  if(pa.length&&pb.length){const ra=rowsOf(final(pa)),rb=rowsOf(final(pb));for(const k of new Set([...Object.keys(ra),...Object.keys(rb)])){const x=ra[k],y=rb[k];if(JSON.stringify(x)===JSON.stringify(y))continue;rows.push({row:k,before:x??null,now:y??null});
   if(x&&y)for(const f of ['sets','reps','load','minutes'])if(Number.isFinite(x[f])&&Number.isFinite(y[f])&&x[f]!==y[f])(y[f]>x[f]?rose:fell).push({row:k,field:f,before:x[f],now:y[f],beforeKind:x.kind??x.role,nowKind:y.kind??y.role});}}
  return {identicalAfterBookkeeping:same,status:{before:statusLine(a),now:statusLine(b)},rowsChanged:rows.length,rows:rows.slice(0,60),risen:rose,fallen:fell};
 };
 const out={probe:'classify-regression-r7asc',prior:{snapshot:snap,sourceDigest:manifest.freeze.sourceDigest},cases:{}};
 const holdout=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8')).cases;
 for(const [set,file] of [['r6',  'CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json'],['r5','CoachingCore/r5/holdout/R5_INDEPENDENT_HOLDOUT.json']])for(const c of holdout(file)){const a=rt.prior.ev(structuredClone(c),{authority:rt.prior.authority}),b=rt.current.ev(structuredClone(c),{authority:rt.current.authority});const x=compareRuns(a,b);if(!x.identicalAfterBookkeeping||x.rowsChanged)out.cases[c.caseId]=x;else out.cases[c.caseId]={identicalAfterBookkeeping:true};}
 for(const k of Object.keys(rt.current.profiles)){const a=rt.prior.gen(structuredClone(rt.prior.profiles[k]),{authority:rt.prior.authority}),b=rt.current.gen(structuredClone(rt.current.profiles[k]),{authority:rt.current.authority});const x=compareRuns(a,b);out.cases['profile:'+k]=x.identicalAfterBookkeeping&&!x.rowsChanged?{identicalAfterBookkeeping:true}:x;}
 const sa=rt.prior.sim({authority:rt.prior.authority}),sb=rt.current.sim({authority:rt.current.authority});
 sb.forEach((t,i)=>{const x=compareRuns(sa[i],t);out.cases['sim:'+t.id]=x.identicalAfterBookkeeping&&!x.rowsChanged?{identicalAfterBookkeeping:true}:x;});
 const all=Object.entries(out.cases);
 out.summary={cases:all.length,identicalAfterBookkeeping:all.filter(([,x])=>x.identicalAfterBookkeeping).length,differing:all.filter(([,x])=>!x.identicalAfterBookkeeping).map(([k])=>k),statusChanged:all.filter(([,x])=>x.status&&x.status.before!==x.status.now).map(([k,x])=>`${k}: ${x.status.before} -> ${x.status.now}`),doseFieldsRisen:all.reduce((n,[,x])=>n+(x.risen?.length??0),0),doseFieldsFallen:all.reduce((n,[,x])=>n+(x.fallen?.length??0),0)};
 console.log(JSON.stringify(out,null,1));
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
