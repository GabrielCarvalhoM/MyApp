// QE engineering check R7-D Phase 3 (independent judge): DX-01 probes. Read-only on the runtime it is given.
//   node qe-dx01.mjs <root holding CoachingCore>
// Prints one JSON object. Run on the candidate and on R7C-FREEZE-4 (rebuilt outside the repository) to compare.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=path.resolve(process.argv[2]);
const imp=p=>import(pathToFileURL(path.join(root,'CoachingCore',p)).href);
const {normalizeObservations}=await imp('src/r6-provenance.mjs');
const H=await imp('r7/b/fixtures/helpers.mjs');
const {opts,program,review,obs,live,runs,addDays,evaluateProgram,intake,generateProgram}=H;
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const out={};
const base={athleteId:'a',sessionId:'s1',response:OK};

// A. A correction made the same day as a same-day day-precision report, sent at the next decision.
//    Report 09:00 on D, accepted by a decision at D 21:00 (stored observedAt = the decision clock, 21:00); correction made at D 12:00.
{
 const d1=normalizeObservations([{...base,eventId:'r1',occurrenceDate:'2026-11-08',reportedAt:'2026-11-08T09:00:00Z',actual:{completed:true,minutes:40}}],{athleteId:'a',asOf:'2026-11-08T21:00:00Z',recordArrival:true});
 const row=d1.accepted[0];
 const d2=normalizeObservations([{...base,eventId:'c1',correctionOf:'r1',occurrenceDate:'2026-11-08',correctedAt:'2026-11-08T12:00:00Z',actual:{completed:true,minutes:20},response:{...OK,recovery:'ADVERSE'}}],{athleteId:'a',asOf:'2026-11-15T21:00:00Z',prior:d1.accepted,recordArrival:true});
 out.A_sameDayCorrection={storedObservedAt:row?.observedAt,accepted:d2.accepted.map(o=>o.eventId),excluded:d2.excluded.map(e=>e.eventId+':'+e.reason)};
 // Control: the same correction made after the stored instant (D 22:00) is applied.
 const d3=normalizeObservations([{...base,eventId:'c1',correctionOf:'r1',occurrenceDate:'2026-11-08',correctedAt:'2026-11-08T22:00:00Z',actual:{completed:true,minutes:20}}],{athleteId:'a',asOf:'2026-11-15T21:00:00Z',prior:d1.accepted,recordArrival:true});
 out.A_control_correctionAfterStoredInstant={accepted:d3.accepted.map(o=>o.eventId),excluded:d3.excluded.map(e=>e.eventId+':'+e.reason)};
 // Variant: the report accepted by a decision on a later day (stored observedAt = end of local day D); correction made at D 20:00.
 const e1=normalizeObservations([{...base,eventId:'r2',occurrenceDate:'2026-11-08',reportedAt:'2026-11-08T19:00:00Z',actual:{completed:true,minutes:40}}],{athleteId:'a',asOf:'2026-11-09T07:00:00Z',recordArrival:true});
 const e2=normalizeObservations([{...base,eventId:'c2',correctionOf:'r2',occurrenceDate:'2026-11-08',correctedAt:'2026-11-08T20:00:00Z',actual:{completed:true,minutes:20}}],{athleteId:'a',asOf:'2026-11-15T21:00:00Z',prior:e1.accepted,recordArrival:true});
 out.A_variant_reportAcceptedNextDay={storedObservedAt:e1.accepted[0]?.observedAt,accepted:e2.accepted.map(o=>o.eventId),excluded:e2.excluded.map(e=>e.eventId+':'+e.reason)};
}
// A2. The report and its same-day correction delivered together at the decision that evening (nothing carried).
{
 const d=normalizeObservations([{...base,eventId:'r3',occurrenceDate:'2026-11-08',reportedAt:'2026-11-08T09:00:00Z',actual:{completed:true,minutes:40}},{...base,eventId:'c3',correctionOf:'r3',occurrenceDate:'2026-11-08',correctedAt:'2026-11-08T12:00:00Z',actual:{completed:true,minutes:20}}],{athleteId:'a',asOf:'2026-11-08T21:00:00Z',recordArrival:true});
 const x=normalizeObservations([{...base,eventId:'r4',observedAt:'2026-11-08T08:00:00Z',reportedAt:'2026-11-08T09:00:00Z',actual:{completed:true,minutes:40}},{...base,eventId:'c4',correctionOf:'r4',observedAt:'2026-11-08T08:00:00Z',correctedAt:'2026-11-08T12:00:00Z',actual:{completed:true,minutes:20}}],{athleteId:'a',asOf:'2026-11-08T21:00:00Z',recordArrival:true});
 out.A2_sameBatchCorrection={day:{accepted:d.accepted.map(o=>o.eventId),excluded:d.excluded.map(e=>e.eventId+':'+e.reason)},exactControl:{accepted:x.accepted.map(o=>o.eventId),excluded:x.excluded.map(e=>e.eventId+':'+e.reason)}};
}
// B. A carried day-precision row whose localDate no longer matches its stored instant (an edited record): is it detected or trusted?
{
 const d1=normalizeObservations([{...base,eventId:'r1',occurrenceDate:'2026-11-08',reportedAt:'2026-11-08T09:00:00Z',actual:{completed:true,minutes:40}}],{athleteId:'a',asOf:'2026-11-09T07:00:00Z',recordArrival:true});
 const edited={...d1.accepted[0],localDate:'2026-11-01'};
 const d2=normalizeObservations([],{athleteId:'a',asOf:'2026-11-15T21:00:00Z',prior:[edited]});
 out.B_editedLocalDate={observedAt:edited.observedAt,carriedLocalDate:d2.accepted[0]?.localDate??null,excluded:d2.excluded.map(e=>e.reason)};
 // An EXACT row relabelled DAY with an earlier localDate (precision is a carried field too).
 const x1=normalizeObservations([{...base,eventId:'x1',observedAt:'2026-11-08T08:00:00Z',reportedAt:'2026-11-08T09:00:00Z',actual:{completed:true,minutes:40}}],{athleteId:'a',asOf:'2026-11-08T21:00:00Z'});
 const relabel={...x1.accepted[0],localDate:'2026-11-07',provenance:{...x1.accepted[0].provenance,timePrecision:'DAY'}};
 const x2=normalizeObservations([],{athleteId:'a',asOf:'2026-11-15T21:00:00Z',prior:[relabel]});
 out.B_relabelledPrecision={carriedLocalDate:x2.accepted[0]?.localDate??null,precision:x2.accepted[0]?.provenance?.timePrecision??null};
}
// C. Non-UTC programs: a same-day day-precision report in a UTC-5 and a UTC+9 program survives the next decisions; and the decision on the
//    reported day itself (stored observedAt = the decision clock).
for(const tz of [-300,540]){
 const i={...intake({id:'qe-dx01-tz'+tz}),timezoneOffsetMinutes:tz},g=generateProgram(i,opts);
 if(!g.program){out['C_tz'+tz]={generation:g.status,reason:g.reason};continue;}
 let p=g.program,ledger=[];
 const long=runs(p,0).find(s=>s.role==='LONG'),others=p.weeks[0].sessions.filter(s=>live(s)&&s!==long).map(s=>obs(p,s));
 // Report made 2 hours after local 06:00 on the long-run day, the decision at local 20:00 the same day.
 const local=(day,hh)=>new Date(Date.parse(day+'T'+hh+':00:00Z')-tz*60000).toISOString().replace('.000Z','Z');
 const rep={eventId:'qe-tz-long',athleteId:p.athleteId,sessionId:long.id,occurrenceDate:long.date,reportedAt:local(long.date,'08'),actual:{completed:true,minutes:long.prescription.durationMinutes},response:OK};
 const asOf1=local(long.date,'20');
 const r1=evaluateProgram(p,{...review(p,0,{observations:[...others,rep]}),asOf:asOf1},opts);
 const acc=(r1.actualLedger??[]).find(o=>o.eventId==='qe-tz-long');
 ledger=r1.actualLedger??[];if(r1.proposal)p=r1.proposal;
 const r2=evaluateProgram(p,{...review(p,1,{observations:p.weeks[1].sessions.filter(live).map(s=>obs(p,s))}),asOf:local(addDays(p.weeks[1].startDate,6),'20'),actualLedger:ledger},opts);
 const kept=(r2.actualLedger??[]).find(o=>o.eventId==='qe-tz-long');
 out['C_tz'+tz]={r1:r1.status,accepted:!!acc,storedObservedAt:acc?.observedAt??null,localDate:acc?.localDate??null,longDate:long.date,r2:r2.status,keptAtNext:!!kept,same:!!kept&&kept.observedAt===acc.observedAt&&kept.localDate===acc.localDate,excludedAtNext:(r2.provenance?.excluded??[]).filter(e=>e.eventId==='qe-tz-long').map(e=>e.reason)};
}
// D. Learning model path (r6-learning normalizes its carried observations with the same function): a same-day day-precision row carried by
//    the athlete model across decisions.
{
 const t={p:program({id:'qe-dx01-learn'}),ledger:[],model:null};
 const long=runs(t.p,0).find(s=>s.role==='LONG');
 const rep={eventId:'qe-learn-long',athleteId:t.p.athleteId,sessionId:long.id,occurrenceDate:long.date,reportedAt:`${long.date}T09:00:00Z`,actual:{completed:true,minutes:long.prescription.durationMinutes},response:OK};
 const r1=evaluateProgram(t.p,review(t.p,0,{observations:[...t.p.weeks[0].sessions.filter(s=>live(s)&&s!==long).map(s=>obs(t.p,s)),rep]}),opts);
 t.ledger=r1.actualLedger;t.model=r1.updatedModel;if(r1.proposal)t.p=r1.proposal;
 const r2=evaluateProgram(t.p,{...review(t.p,1,{observations:t.p.weeks[1].sessions.filter(live).map(s=>obs(t.p,s))}),actualLedger:t.ledger,athleteModel:t.model},opts);
 out.D_learningModel={r1:r1.status,inModel1:!!r1.updatedModel?.observations?.some(o=>o.eventId==='qe-learn-long'),r2:r2.status,inModel2:!!r2.updatedModel?.observations?.some(o=>o.eventId==='qe-learn-long'),excludedByModel:(r2.updatedModel?.excluded??[]).filter(e=>e.eventId==='qe-learn-long').map(e=>e.reason)};
}
console.log(JSON.stringify(out,null,1));
