// REPMILE CoachingCore V1 final physical validation (Founder mission of 2026-11-24): SEC-BC-R2-01, the only internal correction of the mission.
// An erasure is never read as recovery or readiness: after an earlier operation ran with the clock set ahead, erasing the report of a standing hold
// dates the erasure marker at the record's latest instant (cycle 1, SEC-BC-01), which is ahead of the athlete's corrected clock. The plan view read
// F08 facts "as of now" and dropped that marker, so it showed RETURNING with sessions executable while the hold stood (reproduced on 89796df with
// Security's q5 v6). The view now reads an erasure marker as in force whatever its instant; nothing else it reads moves.
import test from 'node:test';
import assert from 'node:assert/strict';
import {athlete,notFeeling100WithSign,readiness,addDays} from './v1int-helpers.mjs';
import {planView} from '../src/boundary/views.mjs';
import {readableF08,standingHolds,isF08Fact,ERASED_F08} from '../src/v1-f08.mjs';

const code=r=>r.ok?'OK':r.error.code;
/** The plan view's hold reading before this correction, kept here as the reference the differential compares with. */
const holdsBefore=(doc,nowMs)=>standingHolds(readableF08(doc.rows.filter(r=>r!==null).filter(isF08Fact),{athleteId:doc.athleteId,at:nowMs})).holds;
function scenario({ahead=true,erase=true}={}){
 const t=athlete({id:`r201-${ahead}-${erase}`});t.enroll();const d0=t.sessions(0)[0].date,d=k=>addDays(d0,k);
 const nf=(k,rid)=>{t.set(d(k),'09:00');return t.api.notFeeling100({actor:t.actor,clientRequestId:rid,expectedVersion:t.version(),...notFeeling100WithSign(d(k))});};
 t.set(d(0));nf(0,'nf1');t.set(d(1),'09:00');t.api.declareReadiness({actor:t.actor,clientRequestId:'rd1',expectedVersion:t.version(),...readiness(d(1))});
 const target=nf(3,'nf2');
 if(ahead){t.set(d(20),'09:00');assert.equal(code(t.weekly(d(3),[])),'OK','one operation with the clock 20 days ahead');}
 t.set(d(3),'10:00');
 const e=erase?t.it.eraseHealthFacts({actor:t.actor,eventIds:[target.eventId],expectedVersion:t.version()}):null;
 t.set(d(3),'11:00');
 return {t,d,e};
}

test('SEC-BC-R2-01: after a clock set ahead, erasing the report of a standing hold keeps the plan view BLOCKED, with nothing executable and no prescription',()=>{
 const {t,e}=scenario();assert.equal(code(e),'OK');
 const v=t.api.plan({actor:t.actor}).view;
 assert.equal(v.state,'BLOCKED');assert.equal(v.hold?.clinical,true);assert.equal(v.hold.exit,'READINESS_DECLARATION');
 assert.deepEqual(Object.values(v.sports).map(s=>s.state),['BLOCKED','BLOCKED']);
 assert.equal(v.week.sessions.filter(s=>s.executable).length,0);assert.ok(v.week.sessions.every(s=>s.prescription===null&&s.explanation===null));
 // Every week through the other reads of the frozen api.mjs, and the status read.
 assert.ok(t.api.sessions({actor:t.actor}).weeks.every(w=>w.sessions.every(s=>!s.executable&&s.prescription===null)));
 assert.equal(t.api.status({actor:t.actor}).state,'BLOCKED');
 // Writes stay locked meanwhile, as before (D1 class), and once the clock passes the marker the engine reads the hold too.
 assert.equal(code(t.weekly(addDays(t.doc().program.startDate,3),[])),'CLOCK_BEHIND_RECORD');
});

test('SEC-BC-R2-01: once the clock catches up the view and the engine agree (BLOCKED, CLINICAL_HUMAN_REQUIRED); the same erasure with a right clock is unchanged',()=>{
 const {t,d}=scenario();t.set(d(21),'09:00');
 assert.equal(t.api.plan({actor:t.actor}).view.state,'BLOCKED');
 const w=t.weekly(d(21),[]);assert.deepEqual([code(w),w.status],['OK','CLINICAL_HUMAN_REQUIRED']);
 const c=scenario({ahead:false});assert.equal(code(c.e),'OK');assert.equal(c.t.api.plan({actor:c.t.actor}).view.state,'BLOCKED');
});

test('SEC-BC-R2-01: the correction only adds a hold for an erasure marker dated ahead of the clock; every other state reads exactly as before',()=>{
 let compared=0,added=0;
 for(const ahead of [false,true])for(const erase of [false,true]){
  const {t,d}=scenario({ahead,erase}),doc=t.doc();
  for(let k=-2;k<=24;k++)for(const time of ['00:00','09:00','23:59']){
   t.set(d(k),time);const nowMs=t.clock,before=holdsBefore(doc,nowMs),after=standingHolds(readableF08(doc.rows.filter(isF08Fact),{athleteId:doc.athleteId,at:Infinity})).holds;
   const v=planView(doc,{nowMs}),futureMarker=doc.rows.some(r=>r?.fact===ERASED_F08&&Date.parse(r.declaredAt)>nowMs);
   compared++;
   if(!futureMarker){assert.equal(v.hold?.clinical===true||v.state==='BLOCKED',before.length>0||doc.reference?.pending?.status==='CLINICAL_HUMAN_REQUIRED',`${ahead}/${erase} ${d(k)} ${time}`);continue;}
   added++;assert.equal(v.state,'BLOCKED');assert.ok(after.length>0);
  }
 }
 assert.ok(compared>300&&added>0,`${compared} states compared, ${added} with a marker dated ahead`);
});

test('SEC-BC-R2-01 (QRE-FPV-01): only erasure markers are read ahead of the clock: a readiness declared under a clock set ahead does not release the view before its instant',()=>{
 const t=athlete({id:'r201-ready-ahead'});t.enroll();const d0=t.sessions(0)[0].date,d=k=>addDays(d0,k);
 t.set(d(0),'09:00');assert.equal(code(t.api.notFeeling100({actor:t.actor,clientRequestId:'nf',expectedVersion:t.version(),...notFeeling100WithSign(d(0))})),'OK');
 t.set(d(20),'09:00');assert.equal(code(t.api.declareReadiness({actor:t.actor,clientRequestId:'rd',expectedVersion:t.version(),...readiness(d(20))})),'OK');
 t.set(d(1),'10:00');const v=t.api.plan({actor:t.actor}).view;
 assert.equal(v.state,'BLOCKED','the declaration is not read before its own instant');assert.equal(v.week.sessions.filter(s=>s.executable).length,0);
 t.set(d(20),'10:00');assert.notEqual(t.api.plan({actor:t.actor}).view.state,'BLOCKED','read at its instant, the declaration answers the hold');
});
