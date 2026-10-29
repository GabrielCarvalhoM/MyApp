// QE probe M (claim 2, representation invariance): a program whose rows carry no `exposure` (stored before R7-A) must be read with the
// same meaning. M1: the same program with every row's exposure removed (program and prescription hashes recomputed, as a stored
// program would have them) gets the same review decision and next-week state. M2: a program generated and reviewed by the pre-R7A
// runtime for some weeks, then reviewed by the current runtime, versus the current runtime throughout (informational).
import {cur,pre,opts,intake,review,obs,rows,addDays,out,ROOT} from './qe-lib.mjs';
import path from 'node:path';import {pathToFileURL} from 'node:url';
const {hash}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/value.mjs')).href);
const strip=P=>{const q=structuredClone(P);for(const w of q.weeks)for(const s of w.sessions)if(s.sport==='STRENGTH'&&s.prescription){for(const e of s.prescription.exercises)delete e.exposure;s.plannedPrescriptionHash=hash(s.prescription);}delete q.hash;q.hash=cur.programHash(q);return q;};
const clean=x=>JSON.parse(JSON.stringify(x,(k,v)=>k==='exposure'||k==='plannedPrescriptionHash'||k==='hash'||k==='inputHash'||k==='sourceProgramHash'||k==='reviewHash'||k==='modelAfterHash'||k==='modelBeforeHash'||k==='referenceState'?undefined:v));
// The resulting plan (proposal, or the program kept), cleaned of exposure and hashes: a stored program re-gains exposure when re-projected.
const key=(r,P0)=>{const P=r.proposal??P0;return JSON.stringify(clean({status:r.status,gates:r.gates??null,weeks:P.weeks.map(w=>w.sessions.map(s=>[s.id,s.status,s.prescription??null])),state:P.stateTrace.map(x=>({...x.strength,planned:undefined})),questions:(r.loadQuestions??[]).map(q=>[q.exerciseId,q.reason])}));};
const scenarios={
 asPrescribed:{ia:{athlete:{exerciseRotationPreference:'FIXED'}},act:()=>'EXEC'},
 reestablishInConsolidation:{ia:{athlete:{exerciseRotationPreference:'FIXED'}},act:(w,s)=>s.sport==='STRENGTH'&&w>=3&&w<=7?'MISS':'EXEC'},
 budgetTrimmed:{ia:{athlete:{exerciseRotationPreference:'FIXED'},schedule:{strengthMinutes:30}},act:(w,s)=>s.sport==='STRENGTH'&&w>=3&&w<=7?'MISS':'EXEC'},
 splitWeekThreeDays:{ia:{athlete:{exerciseRotationPreference:'FIXED',goals:{run:'REGULAR',strength:'HYPERTROPHY'}},schedule:{strengthDays:[0,2,4],runDays:[1,5],longRunDay:5}},act:(w,s)=>s.sport==='STRENGTH'&&(w>=2&&w<=5||w===6&&s.day===0)?'MISS':'EXEC'},
 eventTaper:{ia:{athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',13*7+6)}},strength:'STRENGTH'},exerciseRotationPreference:'FIXED',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}},schedule:{runDays:[1,3,6],strengthDays:[0,3],longRunDay:6,runMinutes:60,longRunMinutes:100,strengthMinutes:60}},act:(w,s)=>s.sport==='STRENGTH'&&w>=7&&w<=11?'MISS':'EXEC',weeks:16}
};
const M1={};
for(const [name,sc] of Object.entries(scenarios)){
 let p=cur.generateProgram(intake({id:'qe-M-'+name,weeks:sc.weeks??12,...sc.ia}),opts).program,ledger=[];const diffs=[];let n=0;
 for(let w=0;w<p.weeks.length-1;w++){
  const list=p.weeks[w].sessions.filter(s=>s.prescription&&s.status!=='SKIPPED'&&sc.act(w,s)!=='MISS').map(s=>obs(p,s,{eventId:`m-${name}-${s.id}`}));
  const rv=review(p,w,{observations:list,actualLedger:ledger});
  const q=strip(p),a=cur.evaluateProgram(p,rv,opts),b=cur.evaluateProgram(q,rv,opts);n++;
  if(key(a,p)!==key(b,q)){const sa=(a.proposal??p).stateTrace?.[w+1]?.strength?.exercises??{},sb=(b.proposal??q).stateTrace?.[w+1]?.strength?.exercises??{};const ex=Object.keys({...sa,...sb}).filter(id=>JSON.stringify(sa[id])!==JSON.stringify(sb[id])).map(id=>({id,withExposure:sa[id],withoutExposure:sb[id]}));const rw=(P)=>rows(P,w+1).map(({s,e})=>`${s.id} ${e.id} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}${e.load.value!=null?' '+e.load.value:''}`);const ra=rw(a.proposal??p),rb=rw(b.proposal??q);diffs.push({week:w,a:`${a.status}/${a.action}`,b:`${b.status}/${b.action}`,gatesDiffer:JSON.stringify(a.gates)!==JSON.stringify(b.gates),nextWeekRowDiffs:ra.filter((x,i)=>x!==rb[i]).map((x,i)=>[x,rb[ra.indexOf(x)]]).slice(0,4),stateDiffs:ex.slice(0,3)});}
  ledger=a.actualLedger??ledger;if(a.proposal)p=a.proposal;
 }
 M1[name]={reviews:n,differingReviews:diffs.length,first:diffs.slice(0,2)};
}
// M2: hand-over of a pre-R7A program to the current runtime after week k.
const P=await pre(),M2={};
for(const [name,sc] of Object.entries(scenarios)){
 const ia={id:'qe-M2-'+name,weeks:sc.weeks??12,...sc.ia};
 const runFrom=(R0,R1,k)=>{let p=R0.generateProgram(intake(ia),opts).program,ledger=[];const log=[];for(let w=0;w<p.weeks.length-1;w++){const R=w<k?R0:R1;const list=p.weeks[w].sessions.filter(s=>s.prescription&&s.status!=='SKIPPED'&&sc.act(w,s)!=='MISS').map(s=>obs(p,s,{eventId:`m2-${name}-${s.id}`}));const r=R.evaluateProgram(p,review(p,w,{observations:list,actualLedger:ledger}),opts);log.push(`${w}:${r.status}/${r.action}`);ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;}return {p,log};};
 const k=Math.floor((sc.weeks??12)/2),handover=runFrom(P,cur,k),current=runFrom(cur,cur,0);
 const last=x=>rows(x.p,x.p.weeks.length-1).map(({e})=>`${e.id}:${e.sets}x${e.reps}@${e.rir}:${e.load.mode}:${e.load.value??''}`).join(',');
 M2[name]={handoverAfterWeek:k,handoverLog:handover.log.join(' '),currentLog:current.log.join(' '),finalWeekSame:last(handover)===last(current)};
}
out('M',{M1_stripExposureSameProgram:M1,M2_preR7AProgramHandedToCurrentRuntime:M2});
