// RepMile CoachingHost (front A), A handoff §4 item 18 (CHG-UI-2 2.3 and 2.10), over the REAL boundary through this package's facade:
//  - pendingWeek: the sessions of a proposal waiting for confirmation, strength included, in the view's own week format, never startable; after
//    `accept` they are the week of the plan in force (same ids, dates, prescriptions);
//  - LOCAL_FATIGUE (GAP-11): what the engine answers when the athlete's review is of that kind (a proof, not a new path: the shared ReviewRequest
//    has no such case; the copy must not promise an outcome the engine does not give);
//  - an exercise outside the prescription in a strength report (2.10): what the boundary admits and what the record keeps.
// Run: node --test ios/Packages/CoachingHost/facade/test/item18.test.mjs   (writes the evidence to audits/v1-ios-coachinghost-2026-11-24/results/)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {athleteA,ELIG,addDays,U,reportOf,at} from '../../../../../CoachingCore/test/v1int-helpers.mjs';
import {api as F} from '../entry.mjs';

const HERE=path.dirname(fileURLToPath(import.meta.url)),OUT=path.resolve(HERE,'../../../../../audits/v1-ios-coachinghost-2026-11-24/results/item18-evidence.json');
const docs=new Map();
globalThis.__chstore={load:id=>docs.get(id)??null,raw:id=>docs.get(id)??null,commit:(id,v,none,text)=>{const cur=docs.has(id)?JSON.parse(docs.get(id)).version:null;if(cur!==(none?null:v))return JSON.stringify({ok:false,conflict:true,version:cur});docs.set(id,text);return '{"ok":true}';},
 remove:id=>{docs.delete(id);},tombstone:()=>null,tombstoneOf:()=>null,setRaw:(id,t)=>{docs.set(id,t);}};
globalThis.__chTestMode=true;globalThis.__chIdSeq=0;
const evidence={};
function athlete(id){
 const o=JSON.parse(F.open(JSON.stringify({athleteId:id,keyRef:'item18-synthetic-key',store:'native',anchor:'none',ids:'shared'})));assert.equal(o.ok,true);
 const t={clock:Date.parse('2026-11-14T12:00:00-03:00')};let n=0;
 t.f=(fn,args)=>JSON.parse(args===undefined?F[fn](t.clock):F[fn](JSON.stringify(args),t.clock));
 t.version=()=>t.f('version').version;
 t.set=(d,h='12:00')=>{t.clock=Date.parse(at(d,h));};
 t.submit=review=>t.f('submit',{review,clientRequestId:`${id}-${++n}`,expectedVersion:t.version()});
 assert.equal(t.f('onboard',{intake:athleteA({weeks:8,id}),consents:{COACHING:true,HEALTH_SIGNALS:true,LEARNING:true},clientRequestId:`${id}-0`}).ok,true);
 t.doc=()=>JSON.parse(docs.get(id));
 t.env=()=>({program:t.doc().program,presentation:{runSessions:t.f('presentation').inForce??{}}});
 return t;
}
const viewKeys=s=>Object.keys(s).filter(k=>k!=='proposed').sort();

test('pendingWeek: the proposed week, strength included, in the view format, never startable; after accept it is the week in force',()=>{
 const t=athlete('item18-pending');
 const start=t.doc().program.startDate;t.set(start,'08:00');
 const run=t.f('sessions').weeks[0].sessions.find(s=>s.sport==='RUN'&&s.role!=='EASY')??t.f('sessions').weeks[0].sessions[2];
 const r=t.submit({kind:'UNAVAILABLE_DAY',eligibility:ELIG(start),changes:{unavailableDates:[run.date]}});
 assert.equal(r.ok,true);assert.ok(r.view?.pending,'a proposal waits');
 const p=t.f('pendingWeek',{});
 assert.equal(p.ok,true);assert.equal(p.pending.decisionId,r.view.pending.decisionId);
 const sessions=p.pending.week.sessions;
 assert.ok(sessions.some(s=>s.sport==='STRENGTH'),'strength rows of the proposal (GAP-CORE-03)');
 assert.ok(sessions.every(s=>s.executable===false&&s.proposed===true),'never startable');
 const inForce=t.f('plan',{}).view.week.sessions;
 assert.deepEqual(viewKeys(sessions[0]),Object.keys(inForce[0]).sort(),'the view week format, plus `proposed`');
 const acc=t.f('accept',{decisionId:r.view.pending.decisionId,expectedVersion:t.version()});assert.equal(acc.ok,true);
 const adopted=t.f('plan',{week:p.pending.weekIndex}).view.week.sessions;
 const strip=s=>({id:s.id,date:s.date,sport:s.sport,role:s.role,prescription:s.prescription});
 assert.deepEqual(sessions.map(strip),adopted.map(strip),'after accept: the same sessions');
 assert.equal(t.f('pendingWeek',{}).pending,null,'nothing waits any more');
 evidence.pendingWeek={decisionId:p.pending.decisionId,change:p.pending.change,sessions:sessions.length,strength:sessions.filter(s=>s.sport==='STRENGTH').length,
  executable:sessions.filter(s=>s.executable).length,equalAfterAccept:true};
});

test('LOCAL_FATIGUE (GAP-11): what the engine answers; no session changes without the engine',()=>{
 const t=athlete('item18-local');
 const start=t.doc().program.startDate,d=addDays(start,1);t.set(d,'07:00');
 const before=JSON.stringify(t.f('plan',{}).view.week.sessions.map(s=>[s.id,s.prescription]));
 const r=t.submit({kind:'LOCAL_FATIGUE',eligibility:ELIG(d),observations:[]});
 const after=t.f('plan',{}).view;
 const changed=JSON.stringify(after.week.sessions.map(s=>[s.id,s.prescription]))!==before;
 evidence.localFatigue={ok:r.ok,code:r.error?.code??null,status:r.status??null,action:r.action??null,reason:r.reason??null,missingInputs:r.decision?.missingInputs??r.missingInputs??null,
  state:after.state,pending:after.pending?.change??null,sessionsChanged:changed};
 // The acceptance of GAP-11: nothing changes unless the engine's answer says so (a MODIFY or a pending change); the host invents nothing.
 if(changed)assert.ok(r.ok&&(r.status==='MODIFY'||after.pending),'a change only by the engine\'s decision');
 assert.ok(r.ok===true||typeof r.error?.code==='string','an engine/boundary answer, never a host one');
});

test('an exercise outside the prescription in a strength report (2.10): what is admitted and kept',()=>{
 const t=athlete('item18-extra');
 const s=t.f('sessions').weeks[0].sessions.find(x=>x.sport==='STRENGTH');t.set(s.date,'19:00');
 const r=reportOf(t.env(),s);
 const extra={id:'not-in-the-prescription-curl',sets:[{reps:10,load:{value:8,unit:'KG',convention:'SINGLE_IMPLEMENT'},rir:2}]};
 const obs={sessionId:r.sessionId,occurrenceDate:r.occurrenceDate,observedAt:`${s.date}T18:50:00-03:00`,actual:{completed:true,minutes:r.actual.minutes,exercises:[...r.actual.exercises,extra]},response:{...U}};
 const a=t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(s.date),observations:[obs]});
 const e=t.f('loggedEntries').entries.find(x=>x.sessionId===s.id);
 evidence.exerciseOutsidePrescription={ok:a.ok,code:a.error?.code??null,status:a.status??null,recorded:a.recorded?.length??0,kept:a.kept?.length??0,
  extraKeptInTheRecord:!!e?.exercises?.some(x=>x.id===extra.id),prescribedExercises:s.prescription?.exercises?.length??null};
 assert.ok(a.ok===true||typeof a.error?.code==='string');
 fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.writeFileSync(OUT,JSON.stringify(evidence,null,1)+'\n');
});
