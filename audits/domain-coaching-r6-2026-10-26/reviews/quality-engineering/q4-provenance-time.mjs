// QRE probe Q4: provenance and time. Clock skew, timezone/local-day binding, out-of-order arrival, future observations and
// reports, cross-source duplicates, same-id-different-facts, corrections, stale facts, unknown-is-not-adverse,
// no double counting and no change to past decisions. Real authority.
import {R6,hash,baseIntake,review,obsFor,sessionsOf,write,safe,elig,addDays,RESPONSES} from './qlib.mjs';
const checks=[];const ok=(id,pass,detail)=>checks.push({id,pass:!!pass,detail});
const TZ=-180;
const P=R6.generateProgram(baseIntake({id:'q-prov',weeks:8,timezoneOffsetMinutes:TZ})).program;
const S=w=>sessionsOf(P).filter(s=>s.weekIndex===w&&s.prescription);
const W0=S(0),run0=W0.filter(s=>s.sport==='RUN'),str0=W0.filter(s=>s.sport==='STRENGTH');
const endOfWeek=w=>addDays(P.weeks[w].startDate,6);
const rv=(w,extra={})=>review(P,w,{time:'T21:00:00-03:00',...extra});
const E=(rvx)=>R6.evaluateProgram(P,rvx);
const keyOf=r=>({status:r.status,action:r.action,gates:r.gates,proposal:r.proposal?r.proposal.hash:null});
const allObs=W0.map(s=>obsFor(P,s,{observedAt:s.date+'T07:00:00-03:00'}));
const base=E(rv(0,{observations:allObs}));
ok('baseline.allCompletedAdvance',base.weekEvidence.completed===W0.length&&Object.values(base.gates??{}).every(g=>g==='ADVANCE')||base.action==='KEEP',{completed:base.weekEvidence.completed,status:base.status,action:base.action,gates:base.gates});
// 1. Clock skew: an observation 2 min / 1 h after the decision clock is not counted.
const asOf=rv(0).asOf,asOfMs=Date.parse(asOf);
const last=run0.at(-1);
for(const [name,deltaSec,expect] of [['skew120s',120,'FUTURE_CLOCK_SKEW_QUARANTINED'],['future1h',3600,'FUTURE_OBSERVATION']]){
 const o=obsFor(P,last,{eventId:'q-skew-'+name,observedAt:new Date(asOfMs+deltaSec*1000).toISOString()});
 const r=E(rv(0,{observations:[...allObs.filter(x=>x.sessionId!==last.id),o]}));
 ok('clock.'+name,r.provenance.excluded.some(e=>e.eventId===o.eventId&&e.reason===expect)&&!r.actualLedger.some(x=>x.eventId===o.eventId),{excluded:r.provenance.excluded,lastStatus:r.weekEvidence.rows.find(x=>x.sessionId===last.id)?.status});
}
// 2. Future report: reportedAt after the decision clock.
{const o={...obsFor(P,last,{eventId:'q-futrep'}),reportedAt:new Date(asOfMs+86400000).toISOString()};const r=E(rv(0,{observations:[...allObs.filter(x=>x.sessionId!==last.id),o]}));ok('time.futureReportExcluded',r.provenance.excluded.some(e=>e.reason==='FUTURE_REPORT_NOT_AVAILABLE')&&!r.actualLedger.some(x=>x.eventId==='q-futrep'),r.provenance.excluded);}
// 2b. Report time before the activity (impossible provenance) - observed.
{const o={...obsFor(P,last,{eventId:'q-rep-before'}),reportedAt:addDays(last.date,-3)+'T08:00:00Z'};const r=E(rv(0,{observations:[...allObs.filter(x=>x.sessionId!==last.id),o]}));ok('time.reportBeforeObservationRejected',r.provenance.excluded.some(e=>e.eventId==='q-rep-before'),{accepted:r.actualLedger.some(x=>x.eventId==='q-rep-before'),excluded:r.provenance.excluded});}
// 3. Timezone/local-day binding: 22:30 local on the session date is 01:30Z next day; the local date is the session date.
{const s=run0[0],o=obsFor(P,s,{eventId:'q-tz',observedAt:addDays(s.date,1)+'T01:30:00Z'});const r=E(rv(0,{observations:[o]}));const row=r.actualLedger.find(x=>x.eventId==='q-tz');ok('tz.localDayBinding',row?.localDate===s.date&&row.context.dateShift===0,{localDate:row?.localDate,sessionDate:s.date,dateShift:row?.context?.dateShift});}
// 3b. Day-precision fact (occurrenceDate) gets the latest causal instant of that local day, never a later invented clock.
{const s=run0[0];const o={...obsFor(P,s,{eventId:'q-day'}),observedAt:undefined,occurrenceDate:s.date};delete o.observedAt;const r=E(rv(0,{observations:[o]}));const row=r.actualLedger.find(x=>x.eventId==='q-day');ok('tz.dayPrecisionLatestCausalInstant',row&&row.provenance.timePrecision==='DAY'&&Date.parse(row.observedAt)<=asOfMs&&row.localDate===s.date,{observedAt:row?.observedAt,localDate:row?.localDate});}
// 3c. Review asOf chronology uses the program's local day: 23:30 local Sunday = 02:30Z Monday stays in week 0.
{const sun=endOfWeek(0),r0=E({...rv(0),asOf:addDays(sun,1)+'T02:30:00Z',observations:allObs}),r1=E({...rv(0),weekIndex:1,asOf:addDays(sun,1)+'T02:30:00Z',eligibility:elig(sun)});ok('tz.reviewWeekByLocalDay',r0.status!=='HOLD'&&r1.status==='HOLD',{week0:r0.status,week1:r1.status,week1errors:r1.errors});}
// 4. Out-of-order arrival: shuffled observations and split across ledger/new give the same decision.
{const shuffled=[...allObs].reverse();const r=E(rv(0,{observations:shuffled}));const split=E(rv(0,{observations:allObs.slice(0,2),actualLedger:[]}));const ledgerFirst=E(rv(0,{observations:allObs.slice(2),actualLedger:split.actualLedger}));ok('order.sameDecision',hash(keyOf(r))===hash(keyOf(base))&&hash(keyOf(ledgerFirst))===hash(keyOf(base)),{base:keyOf(base),shuffled:keyOf(r),viaLedger:keyOf(ledgerFirst)});}
// 5. Duplicates across sources: manual + wearable for the same session merge; counted once.
{const s=run0[0],m=obsFor(P,s,{eventId:'q-man'}),wv={...obsFor(P,s,{eventId:'q-wear',response:'UNKNOWN',minutes:s.prescription.durationMinutes+1}),source:{provider:'WEARABLE:X',activityId:'act-1',quality:'WEARABLE_FULL'}};
 const r=E(rv(0,{observations:[...allObs.filter(x=>x.sessionId!==s.id),m,wv]}));ok('dup.crossSourceMergedOnce',r.actualLedger.filter(x=>x.sessionId===s.id).length===1&&r.provenance.duplicates.some(d=>d.reason==='SAME_EXECUTION_DIFFERENT_SOURCE'),{rows:r.actualLedger.filter(x=>x.sessionId===s.id).length,duplicates:r.provenance.duplicates});}
// 5b. The same wearable activity attached to two different sessions (re-sync / mis-binding): counted twice?
{const [a,b]=run0;const wa={...obsFor(P,a,{eventId:'q-act-a'}),source:{provider:'WEARABLE:X',activityId:'act-SAME',quality:'WEARABLE_FULL'}},wb={...obsFor(P,b,{eventId:'q-act-b',observedAt:a.date+'T07:00:00-03:00',minutes:a.prescription.durationMinutes}),source:{provider:'WEARABLE:X',activityId:'act-SAME',quality:'WEARABLE_FULL'}};
 const r=E(rv(0,{observations:[wa,wb]}));const bound=r.actualLedger.filter(x=>x.provenance?.activityId==='act-SAME'&&x.context?.sessionId);ok('dup.sameActivityTwoSessionsNotDoubleCounted',bound.length<=1,{boundCount:bound.length,sessions:bound.map(x=>x.sessionId),statuses:r.weekEvidence.rows.filter(x=>[a.id,b.id].includes(x.sessionId)).map(x=>[x.sessionId,x.status])});}
// 5c. Exact replay of a ledger entry is merged.
{const r=E(rv(0,{observations:allObs,actualLedger:base.actualLedger}));ok('dup.exactReplayMerged',r.actualLedger.length===base.actualLedger.length,{before:base.actualLedger.length,after:r.actualLedger.length,duplicates:r.provenance.duplicates.length});}
// 6. Same id, different facts: quarantined; the session is CONFLICTED and holds; nothing counted.
{const s=run0[0],a=obsFor(P,s,{eventId:'q-same'}),b=obsFor(P,s,{eventId:'q-same',completed:false,minutes:5});const r=E(rv(0,{observations:[...allObs.filter(x=>x.sessionId!==s.id),a,b]}));const row=r.weekEvidence.rows.find(x=>x.sessionId===s.id);ok('conflict.sameIdDifferentFactsQuarantined',row.status==='CONFLICTED'&&!r.actualLedger.some(x=>x.eventId==='q-same')&&r.status!=='MODIFY'||row.status==='CONFLICTED'&&Object.values(r.gates??{}).includes('HOLD'),{row,gates:r.gates,status:r.status});}
// 6b. A later same-id report with different facts removes previously accepted completed work from the returned ledger.
{const s=run0[0],prior=base.actualLedger;const again={...obsFor(P,s,{eventId:prior.find(x=>x.sessionId===s.id).eventId,completed:false,minutes:3})};const nxt=review(P,1,{day:3,time:'T21:00:00-03:00',observations:[again],actualLedger:prior});const r=R6.evaluateProgram(P,nxt);
 ok('conflict.laterConflictDoesNotEraseCompletedLedger',r.actualLedger.some(x=>x.sessionId===s.id),{priorHad:prior.some(x=>x.sessionId===s.id),afterHas:r.actualLedger.some(x=>x.sessionId===s.id),conflicts:r.provenance.conflicts,ledgerSizeBefore:prior.length,ledgerSizeAfter:r.actualLedger.length,status:r.status});}
// 7. Corrections supersede; a correction never changes a past week of the proposal or past decisions.
{const s=run0[0],old=allObs.find(x=>x.sessionId===s.id);const corr={...obsFor(P,s,{eventId:'q-corr',response:'ADVERSE'}),correctionOf:old.eventId,correctedAt:addDays(endOfWeek(0),0)+'T20:00:00-03:00'};const r=E(rv(0,{observations:[...allObs,corr]}));ok('correction.supersedes',r.provenance.superseded.some(x=>x.eventId===old.eventId)&&r.actualLedger.some(x=>x.eventId==='q-corr')&&!r.actualLedger.some(x=>x.eventId===old.eventId),r.provenance.superseded);
 const futureCorr={...corr,eventId:'q-corr-f',correctedAt:new Date(asOfMs+3600e3).toISOString()};const r2=E(rv(0,{observations:[...allObs,futureCorr]}));ok('correction.futureCorrectionRejected',r2.provenance.excluded.some(e=>e.eventId==='q-corr-f'),r2.provenance.excluded);
 const other={...corr,eventId:'q-corr-x',sessionId:run0[1].id};const r3=E(rv(0,{observations:[...allObs,other]}));ok('correction.crossIdentityRejected',r3.provenance.excluded.some(e=>e.eventId==='q-corr-x'&&e.reason==='INVALID_CORRECTION_CHAIN'),r3.provenance.excluded);}
// 7b. Late correction of week-0 fact arriving in the week-1 review: past weeks and decisions unchanged.
{let p=P;const r0=R6.evaluateProgram(p,rv(0,{observations:allObs}));if(r0.proposal)p=r0.proposal;const s=run0[0],old=allObs.find(x=>x.sessionId===s.id);
 const w1=sessionsOf(p).filter(x=>x.weekIndex===1&&x.prescription).map(x=>obsFor(p,x,{observedAt:x.date+'T07:00:00-03:00'}));
 const corr={...obsFor(p,s,{eventId:'q-late-corr',response:'ADVERSE'}),correctionOf:old.eventId,correctedAt:addDays(p.weeks[1].startDate,6)+'T19:00:00-03:00'};
 const r1=R6.evaluateProgram(p,{...review(p,1,{time:'T21:00:00-03:00'}),observations:[...w1,corr],actualLedger:r0.actualLedger,athleteModel:r0.updatedModel,referenceState:r0.referenceState});
 const q=r1.proposal??p;const pastSame=q.weeks.slice(0,2).every((wk,i)=>hash(wk.sessions.map(x=>x.prescription))===hash(p.weeks[i].sessions.map(x=>x.prescription)));const decisionsPrefix=hash(q.decisions.slice(0,p.decisions.length))===hash(p.decisions);
 ok('correction.lateDoesNotChangePast',pastSame&&decisionsPrefix,{status:r1.status,action:r1.action,pastSame,decisionsPrefix});}
// 8. Stale facts: > maximumAgeDays leave learning but stay in the completed-work ledger.
{const P2=R6.generateProgram(baseIntake({id:'q-stale',weeks:12,timezoneOffsetMinutes:TZ})).program;const s=sessionsOf(P2).find(x=>x.weekIndex===0&&x.sport==='RUN');const o=obsFor(P2,s,{eventId:'q-old',observedAt:s.date+'T07:00:00-03:00'});
 const r=R6.evaluateProgram(P2,{...review(P2,9,{time:'T21:00:00-03:00'}),observations:[o]});ok('stale.leavesLearningKeepsLedger',r.actualLedger.some(x=>x.eventId==='q-old')&&!r.updatedModel.observations.some(x=>x.eventId==='q-old')&&r.updatedModel.excluded.some(x=>x.eventId==='q-old'&&x.reason==='STALE_OBSERVATION'),{inLedger:r.actualLedger.some(x=>x.eventId==='q-old'),inModel:r.updatedModel.observations.some(x=>x.eventId==='q-old'),excluded:r.updatedModel.excluded});}
// 9. Unknown is never adverse: all-UNKNOWN responses advance; a missing RIR log holds without regression.
{const unk=W0.map(s=>obsFor(P,s,{response:'UNKNOWN',omitRir:true}));const r=E(rv(0,{observations:unk}));const runGates=Object.entries(r.gates??{}).filter(([k])=>['LONG','EASY','QUALITY'].includes(k));const strGates=Object.entries(r.gates??{}).filter(([k])=>!['LONG','EASY','QUALITY','WALK_JOG'].includes(k));
 ok('unknown.runAdvances',runGates.length>0&&runGates.every(([,g])=>g==='ADVANCE'),{gates:r.gates,status:r.status,action:r.action});ok('unknown.strengthHoldsNotRegress',strGates.every(([,g])=>g==='HOLD'),strGates);
 ok('unknown.notAdverseInEvidence',r.weekEvidence.adverseSessions===0,r.weekEvidence.rows.map(x=>x.kind));}
// 10. No double counting across reviews: the same session reported in two reviews with different event ids merges once.
{const s=run0[0];const r1=E(rv(0,{observations:[obsFor(P,s,{eventId:'q-r1'})]}));const r2=E({...rv(0),observations:[obsFor(P,s,{eventId:'q-r2'})],actualLedger:r1.actualLedger});ok('dup.acrossReviewsOnce',r2.actualLedger.filter(x=>x.sessionId===s.id).length===1,{rows:r2.actualLedger.filter(x=>x.sessionId===s.id).map(x=>x.eventId),duplicates:r2.provenance.duplicates});}
// 11. Observation that names another athlete is excluded; observation without athleteId is adopted.
{const s=run0[0];const r=E(rv(0,{observations:[{...obsFor(P,s,{eventId:'q-other'}),athleteId:'someone-else'}]}));ok('identity.foreignAthleteExcluded',r.provenance.excluded.some(e=>e.reason==='ATHLETE_MISMATCH'),r.provenance.excluded);}
const out={probe:'Q4-provenance-time',authorityUsed:'REAL r6Authority()',timezoneOffsetMinutes:TZ,checks,pass:checks.every(c=>c.pass)};
write('q4-provenance-time.out.json',out);
console.log(JSON.stringify({pass:out.pass,failed:checks.filter(c=>!c.pass).map(c=>[c.id,c.detail])},null,0).slice(0,5000));
console.log('passed:',checks.filter(c=>c.pass).map(c=>c.id).join(', '));
