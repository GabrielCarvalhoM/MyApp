// QRE probe P01: an offered change (MOVE) adopted by accept (no engine call). Is the unit of custody complete for the plan now in force?
// - the record of formats holds every format the presentation shows for the plan in force;
// - a report of the moved session, citing the format the app was shown, is recorded (not ASK UNKNOWN_RUN_FORMAT).
// Run from CoachingCore/: node ../audits/v1-integration-boundary-2026-11-23/reviews/qre/probes/p01-offer-accept.mjs
import {athlete,spy,ELIG,addDays} from '../../../../../CoachingCore/test/v1int-helpers.mjs';
import {EDGE_PROFILES} from '../../../../../CoachingCore/r6/fixtures/profiles.mjs';
import {live} from '../../../../v1-app-integration-foundation-2026-11-16/harness/scenario.mjs';

const sp=spy();
const t=athlete({id:'p01',engine:sp.engine,start:'2026-11-01T12:00:00-03:00'});
const intake={...EDGE_PROFILES.TEN_K_EIGHT_WEEKS};
const e=t.it.enroll({actor:t.actor,intake,consents:{COACHING:true,HEALTH_SIGNALS:true,LEARNING:false}});
console.log('enroll',e.ok,e.status,e.error?.code);
const p0=t.doc().program,start=p0.startDate;
const at=(w,d,hm='20:00')=>Date.parse(`${addDays(start,w*7+d)}T${hm}:00-03:00`);
const elig=()=>({...ELIG(new Date(t.clock-3*3600e3).toISOString().slice(0,10)),assessedAt:new Date(t.clock).toISOString()});
const reportOf=x=>({sessionId:x.id,occurredOn:x.date,completed:true,minutes:x.prescription.durationMinutes,
 ...(x.sport==='STRENGTH'?{exercises:x.prescription.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,...(Number.isFinite(e.rir)?{rir:e.rir}:{})}))}))}:{}),
 response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}});
for(const w of [0,1,2,3]){t.clock=at(w,6);const r=t.api.weeklyCheckIn({actor:t.actor,clientRequestId:t.rid(),expectedVersion:t.version(),eligibility:elig(),reports:t.doc().program.weeks[w].sessions.filter(x=>live(x)&&!x.optional).map(reportOf)});
 if(!r.ok)console.log('checkIn',w,r.error);}
const q=t.doc().program.weeks[4].sessions.find(x=>x.role==='QUALITY');
t.clock=at(4,q.day,'21:00');
const r=t.api.logRun({actor:t.actor,clientRequestId:t.rid(),expectedVersion:t.version(),eligibility:elig(),sessionId:q.id,occurredOn:q.date,completed:false});
console.log('missed',r.ok,r.error?.code,'offer',JSON.stringify(r.offer),'action',r.action);
if(!r.offer){console.log('NO OFFER: probe inconclusive');process.exit(0);}
const evals=sp.calls.filter(c=>c.op==='evaluate').slice(-2);
console.log('engine calls for that review:',evals.map(c=>c.out.action),'formats returned: with move',evals[0].out.runFormatRecord.length,'plain',evals[1].out.runFormatRecord.length);
const ok=t.api.accept({actor:t.actor,decisionId:r.decisionId,expectedVersion:t.version()});console.log('accept',ok.ok,ok.error?.code);
const doc=t.doc(),pres=t.it.presentation({actor:t.actor}),fr=t.carried().runFormatRecord;
const moved=doc.program.weeks[4].sessions.find(x=>x.moved?.from===q.id);console.log('moved session',moved?.id,moved?.date);
const held=new Set(fr.filter(x=>x.fact==='RUN_FORMAT_EMITTED').map(x=>`${x.sessionId}|${x.formatHash??x.format?.hash}`));
const sample=fr.find(x=>x.fact==='RUN_FORMAT_EMITTED');console.log('format fact keys',Object.keys(sample??{}));
const shown=Object.entries(pres.inForce??{}).flatMap(([k,v])=>Array.isArray(v)?v:[v]).filter(x=>x&&typeof x==='object');
console.log('presentation inForce keys',Object.keys(pres.inForce??{}).slice(0,8));
const missing=[];for(const [sid,v] of Object.entries(pres.inForce?.sessions??pres.inForce??{})){const h=v?.formatHash??v?.format?.hash;if(h&&!held.has(`${sid}|${h}`))missing.push(sid);}
console.log('sessions shown whose format the record does not hold:',missing);
// The report the app builds from what it was shown: the session's own formatHash (as v1rws-helpers nativeReport does).
if(moved){const shownRun=pres.inForce?.[moved.id];console.log('shown entry: expression',shownRun?.expression,'formatHash',shownRun?.formatHash?.slice(0,12));
 const inRecord=fr.some(x=>x.fact==='RUN_FORMAT_EMITTED'&&x.sessionId===moved.id&&x.formatHash===shownRun?.formatHash);console.log('that format in the stored record:',inRecord);
 const twin=t.doc().program.weeks[4].sessions.find(x=>x.id===moved.id);t.clock+=60e3;
 const form={sessionId:moved.id,occurrenceDate:moved.date,actual:{completed:true,minutes:twin.prescription.durationMinutes,rpe:4,formatHash:shownRun?.formatHash},response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}};
 const s3=t.submit({kind:'WEEKLY_REVIEW',eligibility:elig(),observations:[form]});
 console.log('report citing the shown format:',s3.ok,s3.error?.code,s3.status,'recorded',JSON.stringify(s3.recorded),'notRecorded',JSON.stringify(s3.notRecorded),'question',s3.decision?.question);}
