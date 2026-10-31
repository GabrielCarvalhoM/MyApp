// R7B1-QUALITY q08: the q01 failures (all under rotation EVERY_2_WEEKS) reproduced on a given tree, so R7-B.1 can be compared with FREEZE-2.
// Usage: node q08-rotation-residual.mjs [<root containing CoachingCore>] [label]   (default: this repository, R7B1)
// Witnesses: a reason-based substitution in the TAPER week of an exercise in use; the taper session of that exercise afterwards.
//  W1 10K/12w FULL GENERAL 3 days: push-up (preference) -> db-bench-press; W2 10K/16w FULL GENERAL 3 days: inverted-row (preference) -> db-row;
//  W3 10K/16w BANDS_AND_BAR GENERAL 3 days: glute-bridge (preference). Reported per witness: the decision, its disclosures, every exercise of the
//  taper sessions that is new in the event weeks of the plan and never performed in this program, and whether X's slot holds the selected exercise.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),root=process.argv[2]??path.resolve(HERE,'../../../../..'),label=process.argv[3]??'R7B1';
const imp=rel=>import(pathToFileURL(path.join(root,'CoachingCore',rel)).href);
const H=await imp('r7/b/fixtures/helpers.mjs'),P=await imp('src/r6-program.mjs'),AU=await imp('src/r6-authority.mjs');
const {reviewed,weekly,review,evaluateProgram,opts,live,FULL}=H,auth=AU.r6Authority(opts),EVENT=['TAPER','RACE_WEEK','POST_EVENT'];
const W=[
 {id:'W1',event:{kind:'10K',date:'2027-01-17'},weeks:12,equipment:FULL,sg:'GENERAL',X:'push-up'},
 {id:'W2',event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:FULL,sg:'GENERAL',X:'inverted-row'},
 {id:'W3',event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:['BANDS','PULL_UP_BAR'],sg:'GENERAL',X:'glute-bridge'},
 {id:'W4',event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:FULL,sg:'RUNNING_SUPPORT',X:'kb-row'},
];
const out={label,root,witnesses:[]};
for(const x of W){
 const t=reviewed({id:'q08',goals:{run:'RACE',strength:x.sg},event:x.event,weeks:x.weeks,equipment:x.equipment,recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6],strengthDays:[0,2,4],longRunMinutes:90},rotation:'EVERY_2_WEEKS'},0);
 const ph=t.p.phases.phases,taper=ph.indexOf('TAPER');for(let w=0;w<taper;w++)weekly(t,w);
 const performed=new Set(t.ledger.filter(o=>!o.superseded&&o.actual?.completed).flatMap(o=>(o.actual.exercises??[]).map(e=>e.id)));
 const ev=p=>{const sk=P.skeletonOf(p,auth);return p.weeks.slice(taper).flatMap(k=>k.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&EVENT.includes(P.dayPhaseOf(sk.at(k.index)??sk,k.index,s.day))));};
 const before=ev(t.p),evIds0=new Set(before.flatMap(s=>s.prescription.exercises.map(e=>e.id)));
 const r=evaluateProgram(t.p,{...review(t.p,taper,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:x.X,reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}}),actualLedger:t.ledger},opts);
 const row={id:x.id,X:x.X,status:r.status,selected:r.substitutions?.[0]?.selected??null,reason:r.reason,disclosures:(r.disclosures??[]).map(d=>d.id)};
 if(r.proposal){const after=ev(r.proposal);
  row.newNeverPerformedInEventWeeks=after.flatMap(s=>s.prescription.exercises.filter(e=>!evIds0.has(e.id)&&!performed.has(e.id)).map(e=>({session:s.id,id:e.id,role:e.role,note:(e.instructions??[]).find(i=>/stands in/.test(i))??null,taperInstruction:(s.prescription.instructions??[]).join(' ')||null})));
  row.sessionsThatHeldX=before.filter(s=>s.prescription.exercises.some(e=>e.id===x.X)).map(s=>{const a=after.find(y=>y.id===s.id);return {session:s.id,before:s.prescription.exercises.map(e=>e.id+':'+e.role),after:a?a.prescription.exercises.map(e=>e.id+':'+e.role):null,eventStandIns:a?.eventStandIns??null};});
 }
 out.witnesses.push(row);
}
fs.mkdirSync(path.join(HERE,'out'),{recursive:true});
fs.writeFileSync(path.join(HERE,'out',`q08-rotation-residual-${label}.json`),JSON.stringify(out,null,1));
console.log(JSON.stringify(out,null,1));
