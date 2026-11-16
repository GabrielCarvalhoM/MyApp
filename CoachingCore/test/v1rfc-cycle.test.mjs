// V1 Race Forecast + Pace Insights (phase B): the findings of the independent round on 400edb7, each reproduced as its judge stated it and
// closed by result (the one corrective cycle of 2026-11-16).
// - QRE-RFC-A-01: a week's forecast and insights changed inside the week when a second source or a correction arrived for an earlier session.
// - QRE-RFC-A-02: the calibration of a past week, read again after a correction, moves (check (a) of the handoff fails under a correction).
// - QRE-RFC-A-03: after a restart, rows of the previous plan credited the sessions of the new one (the ids of sessions are plan-relative).
// - SSCTR-RFC-A-01 (QRE-RFC-A-05): a declared break of 14 days or more did not withdraw the forecast and the insights at once.
// - SSCTR-RFC-A-02: a week a clinical hold stood in was not a zero-credit week.
// Synthetic athletes only. Every scenario is a conforming client of the composed entry point.
import test from 'node:test';
import assert from 'node:assert/strict';
import {READINESS_SIGNS} from '../src/v1-f08.mjs';
import {P,F,DEV,timeline,racePlan,runner,result,report,asPrescribed,hash,addDays,ELIG,START,live} from './v1rfc-helpers.mjs';
import {DEV as RWS_DEV} from './v1rws-helpers.mjs';

const UNKNOWN={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'},THRESHOLD='THRESHOLD_CONTROLLED';
const RFC_KEYS=['runForecast','paceInsights','paceRevision','paceRevisionRecord'],rest=r=>Object.fromEntries(Object.entries(r).filter(([k])=>!RFC_KEYS.includes(k)));
const plain=(t,s)=>{const o=s.sport==='RUN'?asPrescribed(t,s):{};return o?.eventId?o:report(t.p,s,o??{});};
const device=(t,s,actual)=>({eventId:'dev-'+s.id,athleteId:t.p.athleteId,sessionId:s.id,occurrenceDate:s.date,canonicalActivityId:'hk-'+s.id,source:{provider:'HEALTHKIT',activityId:'hk-'+s.id,quality:'WEARABLE_FULL'},actual:{completed:true,minutes:s.prescription.durationMinutes,...actual},response:UNKNOWN});
/** The athlete's correction of the report on record for a session: the same report with what changes, naming the row it corrects. */
const correction=(t,s,patch,at)=>{const row=t.row(s.id);return {eventId:row.eventId+'-v2',athleteId:t.p.athleteId,sessionId:s.id,occurrenceDate:row.localDate,actual:{...row.actual,...patch},response:row.response,correctionOf:row.eventId,correctedAt:at};};
const shown=f=>[f.status,f.display??null,f.observedForecast?.forecastSeconds??null,f.planScenario?.forecastSeconds??null,f.adherence?.mean??null];
const numbers=f=>[f.observedForecast,f.planScenario,f.current,f.adherence].filter(x=>x!==undefined&&x!==null);
/** A 10 km race plan after `weeks` weeks as prescribed. */
const after=(weeks,x={})=>{const t=timeline(racePlan({goalMinutes:48,...x}));for(let w=0;w<weeks;w++)t.week(w,s=>plain(t,s));return t;};

test('QRE-RFC-A-01 closed: a report that arrives inside the week for an earlier session that already had one withdraws the week; no number changes; the next week reads the record again',()=>{
 // The judge's probe: device reports of the twelve runs of weeks 2 to 5, recorded on the Wednesday of week 6, contradict the athlete's.
 const t=after(5),monday=t.look(5),runs=[1,2,3,4].flatMap(w=>t.runsOf(w));
 assert.deepEqual(shown(monday.runForecast),['SHOWN','ONE_RANGE_OBSERVED_FORECAST_COINCIDES_WITH_PLAN_SCENARIO',[2820,2940,3075],[2820,2940,3075],1]);
 const sent=t.step(5,2,'WEEKLY_REVIEW',{observations:runs.map(s=>device(t,s,{minutes:12}))},'08:00'),thursday=t.look(5,3);
 assert.equal(t.row(runs[0].id).conflicted,true,'the frozen engine marks the row in conflict: the week cannot be read again as it was');
 for(const r of [sent,thursday]){
  assert.deepEqual([r.runForecast.status,r.runForecast.reason,r.runForecast.withdrawn,r.paceInsights.status,r.paceInsights.reason],['UNAVAILABLE','REPORTS_CHANGED_SINCE_THE_WEEK_STARTED',true,'UNAVAILABLE','REPORTS_CHANGED_SINCE_THE_WEEK_STARTED']);
  assert.deepEqual(numbers(r.runForecast),[],'a withdrawal shows no range, no estimate and no adherence');assert.deepEqual(r.paceInsights.domains,{});
 }
 // From the next week boundary the record is read again, as it now is: the contradicted sessions are no execution anyone can read.
 const next=(t.week(5,s=>plain(t,s)),t.look(6)).runForecast;
 assert.notEqual(next.reason,'REPORTS_CHANGED_SINCE_THE_WEEK_STARTED');assert.ok(['SHOWN','TOO_UNCERTAIN_TO_SHOW'].includes(next.status));
 assert.deepEqual(next.adherence.weeks.filter(k=>k.week>=1&&k.week<=4).flatMap(k=>k.credits.map(c=>c.rule)),Array(12).fill('UNKNOWN_EXECUTION'));
 // An athlete's own correction of an earlier report, and a second source that agrees with it: the same withdrawal, for the week it arrives in.
 const u=after(5),first=u.look(5).runForecast,easy=u.runsOf(2,s=>s.role==='EASY')[0];
 const corrected=u.step(5,2,'WEEKLY_REVIEW',{observations:[correction(u,easy,{minutes:10,completed:false},`${u.day(5,2)}T07:00:00-03:00`)]},'08:00').runForecast;
 assert.equal(first.status,'SHOWN');assert.deepEqual([corrected.status,corrected.reason,numbers(corrected)],['UNAVAILABLE','REPORTS_CHANGED_SINCE_THE_WEEK_STARTED',[]]);
 const v=after(5),agrees=v.step(5,2,'WEEKLY_REVIEW',{observations:[device(v,v.runsOf(3)[0],{})]},'08:00').runForecast;
 assert.deepEqual([agrees.status,agrees.reason],['UNAVAILABLE','REPORTS_CHANGED_SINCE_THE_WEEK_STARTED']);
 // What is not a change: a session of this week reported, twice, by two sources; and an earlier session reported for the first time.
 const w=after(5),own=w.runsOf(5)[0],both=w.step(5,3,'WEEKLY_REVIEW',{observations:[plain(w,own),device(w,own,{})]},'08:00').runForecast;
 assert.deepEqual(shown(both),shown(monday.runForecast));
 // A break declared inside the week, of any length: the week is withdrawn (a break of 14 days or more has its own, lasting, withdrawal).
 const b=after(5),short=b.step(5,2,'WEEKLY_REVIEW',{interruption:{startDate:b.day(4,1),endDate:b.day(4,5),days:5,reasonCategory:'TRAVEL'}},'08:00');
 if(short.runFormat.status==='ACTIVE')assert.deepEqual([short.runForecast.status,short.runForecast.reason,short.paceInsights.reason],['UNAVAILABLE','BREAK_DECLARED_SINCE_THE_WEEK_STARTED','BREAK_DECLARED_SINCE_THE_WEEK_STARTED']);
});

/** A plan with a threshold session every week (no race), each reported on a track at the work pace given, effort 7. `monday[w]`: the look of that Monday. */
function thresholds(through,work){
 const intake=runner({id:'rf-cyc',asOf:'2027-01-02',start:START,weeks:16,runExperience:'EXPERIENCED',goal:'PERFORMANCE',anchors:[result('10K',3000,'2027-01-01')],recent:{runDaysPerWeek:4,runMinutesPerWeek:240,longestRunMinutes:90,strengthDaysPerWeek:1},schedule:{runDays:[0,1,3,6],strengthDays:[2],runMinutes:75,longRunMinutes:130,longRunDay:6}});
 const t=timeline(intake),monday=[];
 for(let w=0;w<through;w++){monday.push(t.look(w));t.week(w,s=>s.role==='QUALITY'?{pace:330,rpe:7,workPace:work,actual:{measurement:'TRACK'}}:{pace:s.role==='LONG'?365:345,rpe:4});}
 return {t,monday};
}
const edges=b=>b?.status==='AVAILABLE'?[b.fastSecondsPerKm,b.slowSecondsPerKm]:null;
test('QRE-RFC-A-02 closed: a correction moves the calibration of past weeks when it is read again, so phase B never reads it; an insight reads the band each session was delivered with',()=>{
 // Threshold sessions inside the band for nine weeks; then, on the Wednesday of week 10, the athlete corrects the work pace of four of them.
 const {t,monday}=thresholds(9,325),mon=t.look(9),asOf=`${t.day(9,3)}T08:00:00-03:00`;
 const past=k=>edges(P.runCalibrationOf({program:t.p,ledger:t.ledger,evidenceRecord:t.ev,asOf,weekIndex:k,engineStatus:'KEEP',eligibility:null,runFormatRecord:t.fmt},DEV).paceBands[THRESHOLD]);
 const before=[6,7,8].map(past),asShown=[6,7,8].map(k=>edges(monday[k].runCalibration.paceBands[THRESHOLD]));
 assert.deepEqual(before,asShown,'with no correction, a past week read again is the week as it was shown');
 const quality=[5,6,7,8].map(w=>t.runsOf(w,s=>s.role==='QUALITY')[0]);
 t.step(9,2,'WEEKLY_REVIEW',{observations:quality.map(q=>correction(t,q,{work:{paceSecondsPerKm:268}},`${t.day(9,2)}T07:00:00-03:00`))},'08:00');
 // The fact (check (a) of the handoff, extended by the preflight's R3): the calibration of weeks 8 and 9, read again, is no longer what
 // those weeks showed. The cause is the frozen calibration, which reads a correction under the first-recorded instant of its chain.
 const moved=[6,7,8].map(past);assert.notDeepEqual(moved,asShown);assert.deepEqual(moved[0],asShown[0]);
 // In the week the corrections arrive, the insights are withdrawn (QRE-RFC-A-01); they were STABLE on the Monday.
 assert.equal(mon.paceInsights.domains[THRESHOLD].state,'STABLE');
 const inWeek=t.look(9,3).paceInsights;assert.deepEqual([inWeek.status,inWeek.reason],['UNAVAILABLE','REPORTS_CHANGED_SINCE_THE_WEEK_STARTED']);
 // From the next week the record is read as it now is, and every session against the band it was delivered with in its own week: the one its
 // week showed, never the one the calibration now gives for that week.
 t.week(9,s=>s.role==='QUALITY'?{pace:330,rpe:7,workPace:325,actual:{measurement:'TRACK'}}:{pace:s.role==='LONG'?365:345,rpe:4});
 const next=t.look(10).paceInsights.domains[THRESHOLD],read=new Map(next.sessions.map(s=>[s.sessionId,[s.band.fastSecondsPerKm,s.band.slowSecondsPerKm]]));
 assert.ok(next.sessions.length>=4);
 for(const k of [6,7,8]){const id=t.p.weeks[k].sessions.find(s=>s.sport==='RUN'&&s.role==='QUALITY').id;assert.deepEqual(read.get(id),asShown[k-6],'week index '+k);}
 assert.notDeepEqual(read.get(quality[3].id),moved[2],'the session of week 9 is not read against the band worked out again for week 9');
 // The forecast asks the calibration of no other week (outside race week, which has its own guard): the pair is read from the answer's own record of changes.
 const race=after(9,{}).look(9).runForecast;assert.equal(race.status,'TOO_UNCERTAIN_TO_SHOW');
});
test('the pair of the response is read from the record of changes of the answer itself: an earlier reference at the highest confidence, of the same kind; any earlier one serves the slowdown rule',()=>{
 const run=(first,second)=>{const t=timeline(racePlan({anchors:[first]}));for(let w=0;w<8;w++)t.week(w,s=>plain(t,s),w===7?{runEvidence:[second]}:{});return t.look(8).runForecast;};
 // Both official races: the pair is used.
 const used=run(result('10K',3000,'2027-01-01'),result('10K',2940,'2027-02-28',{id:'b'}));
 assert.deepEqual([used.response.source,used.response.pair.used,used.response.notes],['PRIOR_UPDATED_BY_ONE_PAIR',true,[]]);
 // The earlier one measured by GPS (one tier down): no pair, the prior stands; but a later result 5% slower still assumes no gain.
 const gps=run(result('10K',3000,'2027-01-01',{measurement:'GPS'}),result('10K',2940,'2027-02-28',{id:'b'}));
 assert.deepEqual([gps.response.source,gps.response.pair,gps.response.notes],['PRIOR',null,['NO_ELIGIBLE_EARLIER_REFERENCE']]);
 const slower=run(result('10K',3000,'2027-01-01',{measurement:'GPS'}),result('10K',3150,'2027-02-28',{id:'b'}));
 assert.deepEqual([slower.flags,slower.decomposition.g.planScenario],[['NO_GAIN_LATEST_RESULT_SLOWER'],0]);
 // A race and a field test are not one kind: no pair and no slowdown reading between them.
 const mixed=run(result('10K',3000,'2027-01-01'),{kind:'FIELD_TEST',distance:'5K',seconds:1500,date:'2027-02-28',measurement:'TRACK',rpe:9,tolerated:true,id:'b'});
 if(mixed.response)assert.equal(mixed.response.pair,null);
});

test('QRE-RFC-A-03 closed: after a restart, a row of the previous plan is no execution of the new plan\'s session of the same id',()=>{
 const t=after(6),s=JSON.parse(JSON.stringify({ledger:t.ledger,ref:t.ref,ev:t.ev,fmt:t.fmt,hist:t.hist}));
 const fresh=runner({id:'rf-race',asOf:'2027-02-20',start:'2027-02-22',weeks:8,goal:{kind:'RACE',event:{kind:'10K',date:'2027-04-18'}},anchors:[result('10K',3000,'2027-01-01')],athlete:{pause:{weeks:0,reasonCategory:'TRAVEL',nonclinical:true}}});
 const a=P.restartProgram({intake:fresh,record:s.ledger,referenceState:s.ref,asOf:'2027-02-20T10:00:00-03:00',athleteId:t.p.athleteId,runEvidenceRecord:s.ev,runFormatRecord:s.fmt,runHistoryRecord:s.hist},DEV);
 const p=a.proposal??a.program,ledger=a.carriedRecord??s.ledger;assert.ok(p,'the restart gives a plan: '+a.status);
 const ids=p.weeks[0].sessions.filter(x=>x.sport==='RUN').map(x=>x.id),old=new Set(s.ledger.filter(o=>!o.fact).map(o=>o.sessionId));
 assert.ok(ids.length>0&&ids.every(id=>old.has(id)),'the ids of the new plan\'s sessions are ids of the old plan\'s');
 // Two weeks into the new plan, nothing reported in it.
 const day=addDays(p.startDate,14),review={version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${day}T08:00:00-03:00`,weekIndex:2,event:{id:'rs-2',kind:'WEEKLY_REVIEW'},eligibility:ELIG(day),observations:[],actualLedger:ledger,...(a.referenceState?{referenceState:a.referenceState}:{}),
  runEvidenceRecord:a.runEvidenceRecord,runFormatRecord:a.runFormatRecord,runHistoryRecord:a.runHistoryRecord,paceRevisionRecord:[]};
 const r=P.evaluateProgram(p,review,DEV),f=r.runForecast;
 assert.equal(r.runFormat.status,'ACTIVE');assert.ok(f.adherence,'the forecast is read: '+f.status+' '+f.reason);
 // The run formats still bind the old execution to the new session (their own condition, recorded for the Founder); phase B does not read it.
 assert.ok(ids.some(id=>r.runSessions?.[id]?.execution),'the layer below hands an old execution under the new id');
 assert.deepEqual(f.adherence.weeks.map(k=>[k.week,k.a,k.credits.map(c=>c.rule)]),[0,1].map(w=>[w,0,p.weeks[w].sessions.filter(x=>x.sport==='RUN'&&x.prescription&&x.status!=='SKIPPED'&&x.optional!==true).map(()=>'MISSING_REPORT')]));
 assert.equal(f.adherence.mean,0);if(f.observedForecast.status!=='UNAVAILABLE')assert.equal(f.observedForecast.fFuture,0);
 // The same as with the old rows under other ids, where nothing can collide.
 const renamed=P.evaluateProgram(p,{...review,actualLedger:ledger.map(o=>o&&!o.fact&&typeof o.sessionId==='string'?{...o,sessionId:'old-'+o.sessionId}:o)},DEV).runForecast;
 if(renamed.adherence)assert.deepEqual([f.status,f.adherence.mean,f.observedForecast.forecastSeconds??null],[renamed.status,renamed.adherence.mean,renamed.observedForecast.forecastSeconds??null]);
 // No session of the old plan votes in an insight of the new one.
 if(r.paceInsights.status==='ACTIVE')for(const d of Object.values(r.paceInsights.domains))assert.deepEqual([d.sessions,d.excluded],[[],[]]);
});

test('SSCTR-RFC-A-01 (QRE-RFC-A-05) closed: a declared break of 14 days or more, in progress or still to come, withdraws the forecast and the insights at once',()=>{
 const said=r=>[r.runForecast.status,r.runForecast.reason,r.paceInsights.status,r.paceInsights.reason],WITHDRAWN=['UNAVAILABLE','DECLARED_BREAK_OF_14_DAYS_OR_MORE','UNAVAILABLE','DECLARED_BREAK_OF_14_DAYS_OR_MORE'];
 // Declared on the Tuesday of week 4, from that day, for 14 days: withdrawn in the answer that records it, and on every later day of the break.
 const t=after(3);assert.equal(t.look(3).runForecast.status,'SHOWN');
 const declared=t.step(3,1,'WEEKLY_REVIEW',{interruption:{startDate:t.day(3,1),endDate:t.day(5,0),days:14,reasonCategory:'TRAVEL'}},'08:00');
 assert.equal(declared.runFormat.status,'ACTIVE');assert.deepEqual(said(declared),WITHDRAWN);assert.deepEqual(numbers(declared.runForecast),[]);
 for(const [w,d] of [[3,3],[4,0],[4,4]])assert.deepEqual(said(t.look(w,d)),WITHDRAWN,`week index ${w}, day ${d}`);
 // A break said to start next week: the frozen engine does not record it (it asks for the declaration again), so no break is on record to
 // read. The rule reads every break on record that is not over yet (`to` on or after today), whenever it starts.
 const u=after(3),ahead=u.step(3,1,'WEEKLY_REVIEW',{interruption:{startDate:u.day(4,0),endDate:u.day(5,6),days:14,reasonCategory:'TRAVEL'}},'08:00');
 assert.equal(ahead.status,'ASK');assert.ok(!u.ledger.some(o=>o.fact==='INTERRUPTION_DECLARED'));assert.equal(ahead.runForecast.status,'SHOWN');
 // 13 days is not that withdrawal (the week it is declared in is withdrawn as any week a break is declared in).
 const v=after(3),shorter=v.step(3,1,'WEEKLY_REVIEW',{interruption:{startDate:v.day(3,1),endDate:v.day(4,6),days:13,reasonCategory:'TRAVEL'}},'08:00');
 assert.notEqual(shorter.runForecast.reason,'DECLARED_BREAK_OF_14_DAYS_OR_MORE');
 // Once it is over, the paths that were already there apply: the calibration withdraws the estimate and the plan returns by effort.
 const back=t.look(5,2).runForecast;assert.equal(back.status,'UNAVAILABLE');assert.notEqual(back.reason,'DECLARED_BREAK_OF_14_DAYS_OR_MORE');
});

test('SSCTR-RFC-A-02 closed: a week a clinical hold stood in earns nothing and is left out of the mean, whatever was reported in it',()=>{
 const t=after(2),ready={declaredRecovered:true,warningSigns:Object.fromEntries(READINESS_SIGNS.map(k=>[k,false])),sports:{RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}}};
 // A hold opens on the Tuesday of week 3; the week's sessions are reported all the same; readiness is declared on the Tuesday of week 4.
 assert.equal(t.step(2,1,'WEEKLY_REVIEW',{eligibility:ELIG(t.day(2,1),{pain:true})}).status,'CLINICAL_HUMAN_REQUIRED');
 const during=t.week(2,s=>plain(t,s));assert.deepEqual([during.runForecast.status,during.runForecast.reason],['UNAVAILABLE','HOLD']);
 t.step(3,1,'READINESS_DECLARATION',{readiness:ready});
 assert.ok(t.ledger.some(o=>o.fact==='CLINICAL_HOLD')&&t.ledger.some(o=>o.fact==='READINESS_DECLARED'));
 // The plan returns by effort for three weeks; a 10 km race after the return is the new reference.
 for(let w=3;w<9;w++)t.week(w,s=>plain(t,s),w===7?{runEvidence:[result('10K',2940,t.day(7,6),{id:'after-the-hold'})]}:{});
 const f=t.look(9).runForecast;assert.ok(['SHOWN','TOO_UNCERTAIN_TO_SHOW'].includes(f.status),f.status+' '+f.reason);assert.equal(f.current.reference,'after-the-hold');
 const weeks=new Map(f.adherence.weeks.map(k=>[k.week,k]));
 // Week 3 (index 2): every run reported complete, and the hold stood in it: not counted. The weeks of the return: not counted either.
 assert.deepEqual([weeks.get(2).a,weeks.get(2).counted],[1,false]);assert.ok(weeks.get(2).credits.every(c=>c.rule==='COMPLETED'));
 for(const k of [3,4,5])assert.equal(weeks.get(k).counted,false,'week index '+k);
 for(const k of [0,1,6,7,8])assert.equal(weeks.get(k).counted,true,'week index '+k);
 assert.equal(f.adherence.weeksInMean,4);
});

test('a caller cannot hand a band, on a week with harder sessions either; and the extension\'s keys on an intake never reach the layers below',()=>{
 const t=after(4),review=t.review(4,0,'WEEKLY_REVIEW',{},'08:00'),{paceRevisionRecord:_r,...theirs}=review,plainAnswer=F.evaluateProgram(t.p,theirs,RWS_DEV);
 // A hook that would make every band a minute faster, of the right domain: taken off before anything below reads the options.
 const hooked=P.evaluateProgram(t.p,review,{...DEV,[P.BAND_OF]:({band})=>({...band,fastSecondsPerKm:band.fastSecondsPerKm-60,slowSecondsPerKm:band.slowSecondsPerKm-60})});
 assert.equal(hash(rest(hooked)),hash(plainAnswer));
 const direct=F.evaluateProgram(t.p,theirs,{...RWS_DEV,[F.BAND_OF]:({band})=>({...band,fastSecondsPerKm:band.fastSecondsPerKm-60,slowSecondsPerKm:band.slowSecondsPerKm-60})});
 assert.notEqual(hash(direct.runSessions),hash(plainAnswer.runSessions),'the hook is real in the layer below: taking it off is what protects');
 const intake=racePlan({goalMinutes:48});
 assert.equal(hash(rest(P.generateProgram({...intake,paceRevisionRecord:[{x:1}],paceRevisionResponse:{offerId:'x',response:'ACCEPT'}},DEV))),hash(F.generateProgram(intake,RWS_DEV)));
});
