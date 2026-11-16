// V1 Pace Insights and the athlete-confirmed threshold revision (phase B): the worked examples PI-1 (r1) and PR-1 to PR-3 (r2) reproduced, and
// T10 and T11 of the handoff on the pure functions: each action, the exceptional rule with its 5% floor, the dismissal id; each condition of an
// offer, each ending, the 56-day lapse, the 3% total, one step per 28 days, and nothing outside the threshold band.
import test from 'node:test';
import assert from 'node:assert/strict';
import {insightOf,actionOf,paceInsightsOf,paceRevisionOf,effectiveBandOf,effectiveBand,classOf,REVISION_DOMAIN} from '../src/v1-pace-insights.mjs';
import {PV,RC,EX,R1,addDays,weekStart,near} from './v1rfc-helpers.mjs';

const exec=(date,pace,rpe,x={})=>({eventId:'e-'+date,sessionId:'s-'+date,date,recordedOn:date,secondsPerKm:pace,rpe,admitted:true,withheld:null,completed:true,comparable:true,compatible:true,effortHarder:false,longBouts:true,measurement:'TRACK',gpsGood:false,totalWorkMinutes:24,...x});
const fixed=(fast,slow)=>()=>({fastSecondsPerKm:fast,slowSecondsPerKm:slow});
const at=(domain,list,band,weekStartDay)=>insightOf(domain,list,{weekStart:weekStartDay,cutoff:weekStartDay,bandAt:band},PV,RC);
const Q8=(fraction,x={})=>({applies:true,fraction,withdrawn:false,...x});

test('T1 PI-1 (r1, kept by r2): IMPROVING on three of four faster sessions, the latest included; the action only explains while Q8 has room',()=>{
 const want=R1.workedExamples.paceInsights[0],i=at('THRESHOLD_CONTROLLED',want.executions.map(e=>exec(e.date,e.pace,e.rpe)),fixed(310,330),'2027-03-01');
 assert.equal(i.state,'IMPROVING');assert.deepEqual(i.sessions.map(s=>s.class),want.executions.map(e=>e.class));
 for(const [k,s] of i.sessions.entries())assert.ok(near(s.logDeviationFromBandMidpoint,want.executions[k].logDeviationFromBandMidpoint,6e-6));
 assert.ok(near(i.median,want.median,6e-6));assert.ok(near(i.MAD,want.MAD,6e-6));assert.equal(i.exceptionalThreshold,want.exceptionalThresholdRuled);assert.deepEqual(i.sessions.filter(s=>s.exceptional),want.exceptionalUnderRuledFloor);
 assert.equal(i.spanDays,21);
 assert.equal(actionOf(i,{q8:Q8(0.015),p3Offered:true,revisionOffered:true},PV,RC).action,'EXPLAIN_ONLY');
});

// PR-1: a half-marathon plan of 21 weeks; the calibration's threshold band 300-320 with its training factor at the cap from week 6.
const PR1=EX.paceRevision.find(e=>e.id==='PR-1'),RACE='2027-05-30';
const weeks=(through,x=()=>({}))=>Array.from({length:through+1},(_,i)=>({index:i,startDate:weekStart(i+1),phase:i===19?'TAPER':i===20?'RACE_WEEK':'BUILD',mode:'EASY',band:i>=5?{fastSecondsPerKm:300,slowSecondsPerKm:320,derived:true}:{fastSecondsPerKm:305,slowSecondsPerKm:325,derived:true},factor:i>=5?0.045:0.03,withdrawn:false,referenceId:'intake-0',withdrawal:null,...x(i)}));
const weekIndexOf=date=>Math.floor((Date.parse(date)-Date.parse(weekStart(1)))/(7*864e5));
const fromExample=e=>exec(e.date,e.pace,e.rpe,{week:weekIndexOf(e.date),measurement:e.measurement,gpsGood:e.gpsQuality==='GOOD',totalWorkMinutes:e.totalWorkMinutes});
const R1X=PR1.round1.executions.map(fromExample),R2X=PR1.round2.executions.map(fromExample),ENDX=exec('2027-04-21',PR1.end.execution.pace,PR1.end.execution.rpe,{week:15});
const revision=(now,x={})=>paceRevisionOf({now,weeks:weeks(now),executions:[],adverse:[],breaks:[],responses:[],raceDate:RACE,experience:'INTERMEDIATE',asOfDay:weekStart(now+1),screenRequired:false,p3Offered:false,...x},PV,RC);
const offerAt9=()=>revision(8,{executions:R1X}).offer;
const accepted1=()=>({offerId:offerAt9().offerId,response:'ACCEPT',date:'2027-03-02'});
const offerAt14=()=>revision(13,{executions:[...R1X,...R2X],responses:[accepted1()]}).offer;
const accepted2=()=>({offerId:offerAt14().offerId,response:'ACCEPT',date:'2027-04-06'});

test('T1 PR-1 round 1: the offer at week 9 is 2%, from the median margin over the fast edge; confirmed, it is 295-315 from week 10',()=>{
 const r1=PR1.round1,before=revision(7,{executions:R1X}),r=revision(8,{executions:R1X});
 assert.equal(before.status,'NONE');assert.equal(before.offer,null);
 assert.equal(r.status,'OFFERED');assert.equal(r.offer.stepFraction,r1.step);assert.ok(near(r.offer.medianMarginOverFastEdge,r1.medianMarginOverFastEdgeAllVoting,6e-6));assert.equal(r.offer.effectiveFrom,'2027-03-08');assert.equal(r.offer.sessions.length,3);
 assert.match(r.offer.requiredText,/^Your last 3 threshold sessions at the target effort were faster than your band\. Set your threshold band 2% faster from 2027-03-08\?/);
 // Confirmed on 2027-03-02: nothing moves inside week 9; from week 10 the band is the effective one.
 const same=revision(8,{executions:R1X,responses:[accepted1()],asOfDay:'2027-03-03'}),next=revision(9,{executions:R1X,responses:[accepted1()]});
 assert.equal(same.status,'ACTIVE');assert.equal(same.active.pending,true);assert.equal(same.active.inForceToday,0);assert.equal(same.fractionOn('2027-03-05'),0);assert.equal(same.fractionOn('2027-03-08'),0.02);
 assert.equal(next.status,'ACTIVE');assert.equal(next.active.fraction,r1.revisionTotal);assert.equal(next.active.effectiveFrom,'2027-03-08');
 assert.deepEqual(effectiveBandOf({fastSecondsPerKm:300,slowSecondsPerKm:320},next.active.fraction,RC),r1.effectiveBand);
});
test('T1 PR-1 round 2: 28 days later the second step is the 1% left under the 3% total, and rounding leaves the band where it was',()=>{
 const r2=PR1.round2,early=revision(12,{executions:[...R1X,...R2X],responses:[accepted1()]}),r=revision(13,{executions:[...R1X,...R2X],responses:[accepted1()]});
 assert.equal(early.offer,null);                                         // week 13: 21 days since the first step
 assert.equal(r.offer.stepFraction,r2.step);assert.ok(near(r.offer.medianMarginOverFastEdge,r2.medianMarginOverFastEdgeAllVoting,6e-6));assert.equal(r.offer.sessions.length,4);assert.equal(r.offer.effectiveFrom,'2027-04-12');
 // Every execution of the second round is read against the effective band of its own week, and none of the first round supports it.
 const read=insightOf(REVISION_DOMAIN,[...R1X,...R2X],{weekStart:'2027-04-05',cutoff:'2027-04-05',bandAt:r.bandAt,since:'2027-03-08'},PV,RC);
 assert.deepEqual(read.sessions.map(s=>s.band),r2.executions.map(()=>r2.bandUsedForEveryExecution));assert.ok(near(read.median,r2.median,6e-5));assert.ok(near(read.MAD,r2.MAD,6e-5));
 for(const [k,s] of read.sessions.entries())assert.ok(near(s.marginOverFastEdge,r2.executions[k].marginOverFastEdge,6e-6));
 const after=revision(14,{executions:[...R1X,...R2X],responses:[accepted1(),accepted2()]});
 assert.equal(after.active.fraction,r2.revisionTotal);assert.deepEqual(effectiveBandOf({fastSecondsPerKm:300,slowSecondsPerKm:320},after.active.fraction,RC),r2.effectiveBand);
});
test('T1 PR-1 end: one session at RPE 8 ends the revision at once; the band is the calibration\'s again and no further offer comes in this plan',()=>{
 const all={executions:[...R1X,...R2X,ENDX],responses:[accepted1(),accepted2()]},r=revision(15,{...all,asOfDay:'2027-04-21'});
 assert.equal(r.status,'ENDED');assert.deepEqual(r.ended,{date:'2027-04-21',reason:'HARDER_THAN_CUE_EXECUTION'});assert.equal(r.fractionOn('2027-04-22'),0);assert.equal(r.active,null);
 for(let w=16;w<=20;w++){const later=revision(w,all);assert.equal(later.status,'ENDED');assert.equal(later.offer,null,'week '+(w+1));}
});
test('T1 PR-2, PR-3: the race-pace domains are never revised; repetitions under 5 minutes do not vote',()=>{
 const fast=['2027-02-03','2027-02-10','2027-02-17','2027-02-24'].map(d=>exec(d,270,7)),short=fast.map(e=>({...e,longBouts:false}));
 const pr2=at('TEN_K_EFFORT',short,fixed(285,300),'2027-03-01');
 assert.equal(pr2.state,'INSUFFICIENT_DATA');assert.equal(pr2.shortBouts,4);assert.equal(actionOf(pr2,{q8:{applies:false},p3Offered:false},PV,RC).action,'INFORMATIVE_ONLY');
 for(const domain of ['FIVE_K_EFFORT','TEN_K_EFFORT','HALF_MARATHON_EFFORT','MARATHON_EFFORT']){
  const i=at(domain,fast.map(e=>({...e,rpe:RC.effortCues[RC.domains[domain].cue].rpe[0]})),fixed(285,300),'2027-03-01'),q8=Q8(0.045,{applies:RC.recalibration.training.domains.includes(domain)});
  assert.equal(i.state,'IMPROVING',domain);
  assert.deepEqual(actionOf(i,{q8,p3Offered:true,revisionOffered:true},PV,RC),{action:'OFFER_V1RC_FIELD_TEST'},domain);
  assert.deepEqual(actionOf(i,{q8,p3Offered:false,revisionOffered:true},PV,RC),{action:'SUGGEST_REPORTING_A_RACE'},domain);
 }
});

test('T10 each state and its action; a session harder than the cue is stated and never voted',()=>{
 const days=['2027-02-01','2027-02-08','2027-02-15','2027-02-22'],band=fixed(310,330),on=paces=>at('THRESHOLD_CONTROLLED',days.map((d,k)=>exec(d,paces[k],7)),band,'2027-03-01');
 assert.equal(on([340,338,341,339]).state,'SLOWER_THAN_BAND');assert.equal(actionOf(on([340,338,341,339]),{q8:Q8(0),p3Offered:true},PV,RC).action,'EFFORT_GOVERNS_SLOW_TO_CUE');
 assert.equal(on([315,320,325,318]).state,'STABLE');assert.equal(actionOf(on([315,320,325,318]),{q8:Q8(0),p3Offered:true},PV,RC).action,'NONE');
 assert.equal(on([300,340,300,320]).state,'MIXED');
 // Three of four faster, but the latest is not: not IMPROVING.
 assert.notEqual(on([303,303,303,312]).state,'IMPROVING');assert.equal(on([303,303,303,312]).votes,4);
 // A latest session far from the others is exceptional: it is shown and does not vote, so the three before it read alone.
 assert.equal(on([300,300,300,320]).sessions.at(-1).exceptional,true);assert.equal(on([300,300,300,320]).votes,3);
 // Fewer than three, or less than 14 days apart: no reading.
 assert.equal(at('THRESHOLD_CONTROLLED',[exec('2027-02-15',300,7),exec('2027-02-22',300,7)],band,'2027-03-01').state,'INSUFFICIENT_DATA');
 assert.equal(at('THRESHOLD_CONTROLLED',['2027-02-18','2027-02-22','2027-02-25'].map(d=>exec(d,300,7)),band,'2027-03-01').state,'INSUFFICIENT_DATA');
 // Outside the 42-day window, or on record only from this week on: not read.
 assert.equal(at('THRESHOLD_CONTROLLED',[exec('2027-01-15',300,7),exec('2027-02-15',300,7),exec('2027-02-22',300,7)],band,'2027-03-01').votes,2);
 assert.equal(at('THRESHOLD_CONTROLLED',[exec('2027-02-01',300,7),exec('2027-02-15',300,7),exec('2027-02-22',300,7,{recordedOn:'2027-03-01'})],band,'2027-03-01').votes,2);
 const hard=at('THRESHOLD_CONTROLLED',[...days.slice(0,3).map(d=>exec(d,300,7)),exec(days[3],300,8)],band,'2027-03-01');
 assert.equal(hard.harderThanCue,1);assert.equal(hard.votes,3);assert.deepEqual(hard.excluded.map(x=>x.reason),['HARDER_THAN_CUE']);
 // Threshold with the training factor at its cap: the test first when it is offered, the revision when its conditions hold, else a race report.
 const up=on([300,300,300,300]),cap=Q8(0.045);
 assert.deepEqual(actionOf(up,{q8:cap,p3Offered:true,revisionOffered:true},PV,RC),{action:'OFFER_V1RC_FIELD_TEST',alternative:'ATHLETE_CONFIRMED_PACE_REVISION'});
 assert.deepEqual(actionOf(up,{q8:cap,p3Offered:false,revisionOffered:true},PV,RC),{action:'ATHLETE_CONFIRMED_PACE_REVISION'});
 assert.deepEqual(actionOf(up,{q8:cap,p3Offered:false,revisionOffered:false},PV,RC),{action:'SUGGEST_REPORTING_A_RACE'});
});
test('T10 why an execution does not vote: withheld pace evidence first, whatever else it carries',()=>{
 const band=fixed(310,330),read=e=>at('THRESHOLD_CONTROLLED',[e],band,'2027-03-01').excluded[0]?.reason??null,e=x=>exec('2027-02-22',300,7,x);
 assert.equal(read(e()),null);
 assert.equal(read(e({admitted:false,withheld:'REPORT_NOT_CARRIED'})),'PACE_EVIDENCE_WITHHELD');
 assert.equal(read(e({admitted:false,completed:false,secondsPerKm:null})),'PACE_EVIDENCE_WITHHELD');
 assert.equal(read(e({completed:false})),'NOT_COMPLETED');assert.equal(read(e({secondsPerKm:null})),'NO_WORK_PACE');assert.equal(read(e({comparable:false})),'NOT_COMPARABLE');
 assert.equal(read(e({longBouts:false})),'WORK_BOUTS_SHORTER_THAN_5_MIN');assert.equal(read(e({rpe:null})),'EFFORT_NOT_REPORTED');assert.equal(read(e({rpe:5})),'EFFORT_BELOW_CUE');
 assert.equal(read(e({effortHarder:true})),'HARDER_THAN_CUE');assert.equal(read(e({compatible:false})),'RESPONSE_NOT_COMPATIBLE');
 assert.equal(at('THRESHOLD_CONTROLLED',[e()],()=>null,'2027-03-01').excluded[0].reason,'NO_BAND_IN_ITS_WEEK');
 assert.equal(at('THRESHOLD_CONTROLLED',[e({admitted:false,withheld:'CORRECTED_MEASUREMENT'})],band,'2027-03-01').excluded[0].withheld,'CORRECTED_MEASUREMENT');
});
test('T10 the exceptional rule: three median deviations, never less than 5%; an exceptional session is shown and not voted',()=>{
 const band=fixed(310,330),days=['2027-02-01','2027-02-08','2027-02-15','2027-02-22'];
 // 4.5% from the median: an ordinary session under the ruled 5% floor (the proposed 3% floor would have dropped it).
 const ordinary=at('THRESHOLD_CONTROLLED',[305,318,303,302].map((p,k)=>exec(days[k],p,7)),band,'2027-03-01');assert.equal(ordinary.sessions.filter(s=>s.exceptional).length,0);
 const odd=at('THRESHOLD_CONTROLLED',[305,360,303,302].map((p,k)=>exec(days[k],p,7)),band,'2027-03-01'),out=odd.sessions.filter(s=>s.exceptional);
 assert.deepEqual(out.map(s=>s.date),['2027-02-08']);assert.equal(odd.votes,3);assert.equal(odd.state,'IMPROVING');assert.equal(odd.sessions.length,4);
});
test('T10 the insights of a week: every domain, an id that changes with the state and the sessions, and nothing that changes anything',()=>{
 const days=['2027-02-01','2027-02-08','2027-02-15','2027-02-22'],make=paces=>paceInsightsOf({week:8,weekStart:'2027-03-01',cutoff:'2027-03-01',domains:{THRESHOLD_CONTROLLED:{executions:days.map((d,k)=>exec(d,paces[k],7)),q8:Q8(0.015)}},bandAt:()=>({fastSecondsPerKm:310,slowSecondsPerKm:330}),p3Offered:false},PV,RC);
 const a=make([305,318,303,302]),b=make([305,318,303,302]),c=make([305,318,303,318]);
 assert.deepEqual(Object.keys(a.domains),PV.domains);assert.equal(a.domains.THRESHOLD_CONTROLLED.action,'EXPLAIN_ONLY');assert.equal(a.domains.TEN_K_EFFORT.state,'INSUFFICIENT_DATA');assert.equal(a.domains.TEN_K_EFFORT.action,'INFORMATIVE_ONLY');
 assert.equal(a.domains.THRESHOLD_CONTROLLED.id,b.domains.THRESHOLD_CONTROLLED.id);assert.notEqual(a.domains.THRESHOLD_CONTROLLED.id,c.domains.THRESHOLD_CONTROLLED.id);
 assert.equal(a.changesCapacity,false);assert.equal(a.changesEstimateOrForecast,false);assert.equal(a.heartRateInput,false);
 assert.equal(classOf(305,{fastSecondsPerKm:310,slowSecondsPerKm:330},RC),'FASTER');assert.equal(classOf(306,{fastSecondsPerKm:310,slowSecondsPerKm:330},RC),'INSIDE');
});

test('T11 each condition of an offer: one that fails gives no offer',()=>{
 const base={executions:R1X},no=(x,w=8)=>assert.equal(revision(w,{...base,...x}).offer,null,JSON.stringify(Object.keys(x)));
 assert.ok(revision(8,base).offer);
 const withWeeks=f=>({weeks:weeks(8,f)});
 no(withWeeks(i=>i===8?{factor:0.03}:{}));                                                    // the training factor is not at its cap
 no(withWeeks(i=>i===8?{withdrawn:true}:{}));                                                 // its band is withdrawn
 no(withWeeks(i=>i===8?{band:{fastSecondsPerKm:300,slowSecondsPerKm:320,derived:false}}:{})); // an observed band, never a derived one
 no(withWeeks(i=>i===8?{mode:'RETURN'}:{}));no(withWeeks(i=>i===8?{withdrawal:'HOLD'}:{}));no(withWeeks(i=>i===8?{phase:'TAPER'}:{}));
 no({executions:R1X.map((e,k)=>k===1?{...e,measurement:'GPS',gpsGood:false}:e)});              // GPS that is merely not poor
 no({executions:R1X.map((e,k)=>k===0?{...e,totalWorkMinutes:10}:e)});                          // less than 15 minutes of work
 no({executions:[...R1X,exec('2027-02-20',300,8,{week:6})]});                                  // a session harder than the cue in the window
 no({executions:[...R1X,exec('2027-02-20',null,8,{week:6,admitted:false,withheld:'REPORT_NOT_CARRIED'})]}); // read even where its pace is withheld
 no({adverse:['2027-02-26']});no({breaks:[{from:'2027-02-01',to:'2027-02-08',days:8}]});no({screenRequired:true});no({experience:'NONE'});
 no({raceDate:'2027-03-15'});                                                                  // within 14 days of the race
 no({executions:R1X.map(e=>({...e,admitted:false,withheld:'REPORT_NOT_CARRIED'}))});          // no admitted pace evidence, no offer
 // Declined: the same evidence is not offered again; a new session is new evidence.
 const declined={offerId:offerAt9().offerId,response:'DECLINE',date:'2027-03-02'};
 assert.equal(revision(8,{...base,responses:[declined],asOfDay:'2027-03-03'}).status,'NONE');
 assert.equal(revision(9,{...base,responses:[declined]}).offer,null);
 assert.ok(revision(9,{executions:[...R1X,exec('2027-03-03',281,7,{week:8})],responses:[declined]}).offer);
 // An acceptance of anything but this week's offer changes nothing.
 const stray=revision(9,{...base,responses:[{offerId:'not-an-offer',response:'ACCEPT',date:'2027-03-02'}]});assert.notEqual(stray.status,'ACTIVE');assert.equal(stray.history.ignored.length,1);
 // The test comes first when the calibration offers one now; the revision is then the alternative.
 assert.equal(revision(8,{...base,p3Offered:true}).offer.testFirst,true);
});
test('T11 each ending, at once; and the lapse after 56 days without support',()=>{
 const live=(now,x={})=>revision(now,{executions:R1X,responses:[accepted1()],...x}),ended=(r,reason)=>{assert.equal(r.status,'ENDED',reason);assert.equal(r.ended.reason,reason);assert.equal(r.fractionOn(addDays(r.ended.date,1)),0);};
 assert.equal(live(10).status,'ACTIVE');
 ended(live(10,{responses:[accepted1(),{offerId:offerAt9().offerId,response:'REVOKE',date:'2027-03-16'}]}),'REVOKED_BY_THE_ATHLETE');
 ended(live(10,{adverse:['2027-03-17']}),'ADVERSE_RESPONSE');
 ended(live(10,{executions:[...R1X,exec('2027-03-10',290,8,{week:9})]}),'HARDER_THAN_CUE_EXECUTION');
 ended(live(10,{executions:[...R1X,exec('2027-03-10',null,8,{week:9,admitted:false,withheld:'REPORT_NOT_CARRIED'})]}),'HARDER_THAN_CUE_EXECUTION');
 ended(live(11,{executions:[...R1X,exec('2027-03-10',325,7,{week:9}),exec('2027-03-17',326,7,{week:10})]}),'TWO_SLOWER_EXECUTIONS');
 assert.equal(live(10,{executions:[...R1X,exec('2027-03-10',325,7,{week:9})]}).status,'ACTIVE');          // one slower session alone ends nothing
 ended(live(10,{weeks:weeks(10,i=>i===10?{referenceId:'new'}:{})}),'NEW_V1RC_REFERENCE');
 ended(live(10,{weeks:weeks(10,i=>i===10?{withdrawal:'HOLD'}:{})}),'V1RC_WITHDRAWAL');
 ended(live(10,{weeks:weeks(10,i=>i===10?{factor:0.025}:{})}),'V1RC_TRAINING_FACTOR_DOWN');
 ended(live(10,{weeks:weeks(10,i=>i===10?{phase:'TAPER'}:{})}),'TAPER_OR_RACE_WEEK_STARTS');
 ended(live(13,{executions:[...R1X,...['2027-03-10','2027-03-17','2027-03-24','2027-03-31'].map((d,k)=>exec(d,330,6,{week:9+k,rpe:k%2?6:7,secondsPerKm:k%2?321:330}))]}),'TWO_SLOWER_EXECUTIONS');
 // 56 days after the step with no session to support it: lapsed; with sessions stable against the effective band: kept.
 ended(live(17),'LAPSED');assert.equal(live(17).ended.date,'2027-05-03');
 const stable=['2027-04-07','2027-04-14','2027-04-21','2027-04-28'].map((d,k)=>exec(d,300,7,{week:13+k}));assert.equal(live(17,{executions:[...R1X,...stable]}).status,'ACTIVE');
 // A revision confirmed for next week is ended too by what happens before it starts.
 ended(revision(8,{executions:[...R1X,exec('2027-03-04',300,8,{week:8})],responses:[accepted1()],asOfDay:'2027-03-04'}),'HARDER_THAN_CUE_EXECUTION');
});
test('T11 the revision changes the threshold band alone: its size, its rounding, and no other domain',()=>{
 const band={status:'AVAILABLE',domain:'THRESHOLD_CONTROLLED',fastSecondsPerKm:300,slowSecondsPerKm:320,basis:'DERIVED_FROM_CAPACITY'},e=effectiveBand(band,0.02,RC);
 assert.equal(e.fastSecondsPerKm,295);assert.equal(e.slowSecondsPerKm,315);assert.equal(e.label,'ATHLETE_CONFIRMED_REVISION');assert.deepEqual(e.revision.ofTheV1rcBand,{fastSecondsPerKm:300,slowSecondsPerKm:320});
 assert.equal(effectiveBand(band,0,RC),band);assert.equal(effectiveBand({status:'UNAVAILABLE',reason:'x'},0.02,RC).status,'UNAVAILABLE');
 // Rounding never makes an edge faster than the revised speed, and the slow edge keeps the calibration's minimum width.
 for(const f of [0.005,0.01,0.02,0.03])for(const fast of [240,275,300,335]){const b=effectiveBandOf({fastSecondsPerKm:fast,slowSecondsPerKm:fast+20},f,RC);assert.ok(b.fastSecondsPerKm>=fast/(1+f)-1e-9);assert.ok(b.fastSecondsPerKm<=fast);assert.ok(b.slowSecondsPerKm>=b.fastSecondsPerKm+10);assert.equal(b.fastSecondsPerKm%5,0);}
 // The total never passes 3%, whatever the athlete's margin; a step never passes 2%.
 const r=revision(13,{executions:[...R1X,...R2X],responses:[accepted1()]});assert.ok(r.offer.stepFraction<=0.02);assert.ok(r.offer.revisionTotalAfter<=PV.athleteConfirmedRevision.totalMax+1e-9);
 const full=revision(18,{executions:[...R1X,...R2X,...['2027-04-14','2027-04-21','2027-04-28','2027-05-05'].map((d,k)=>exec(d,278,7,{week:14+k}))],responses:[accepted1(),accepted2()]});
 assert.equal(full.active.fraction,0.03);assert.equal(full.offer,null);
});
