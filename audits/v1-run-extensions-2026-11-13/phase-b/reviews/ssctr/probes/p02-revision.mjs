// SSCTR-RFC review r1, probe 02: PR-1 of r2 through paceRevisionOf with my own week snapshots; every offer condition and each ending.
import fs from 'node:fs';
const ROOT='C:/Users/carva/Desktop/myApp/MyApp/.claude/worktrees/v1-run-extensions/';
const PI=await import('file:///'+ROOT+'CoachingCore/src/v1-pace-insights.mjs');
const RC=JSON.parse(fs.readFileSync(ROOT+'CoachingCore/v1/RUN_CALIBRATION_EXTENSION_V1.json','utf8'));
const V=JSON.parse(fs.readFileSync(ROOT+'CoachingCore/v1/RACE_FORECAST_EXTENSION_V1.json','utf8'));
const r2=JSON.parse(fs.readFileSync(ROOT+'audits/v1-race-forecast-2026-11-13/ssctr/SSCTR_RFC_DECISION_R2.json','utf8'));
const PV=V.paceInsights,PR=r2.workedExamples.paceRevision[0];
let fails=0,checks=0;const ok=(c,m)=>{checks++;if(!c){fails++;console.log('FAIL',m);}};
const day=(s,n)=>new Date(Date.parse(s+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
const START='2027-01-04',RACE='2027-05-30';
const weekIdx=d=>Math.floor((Date.parse(d)-Date.parse(START))/(7*86400000));
function weeks(now,over={}){const w=[];for(let i=0;i<=now;i++){const cap=i>=5;w.push({index:i,startDate:day(START,7*i),phase:i===19?'TAPER':i===20?'RACE_WEEK':'BUILD',mode:'EASY',band:cap?{fastSecondsPerKm:300,slowSecondsPerKm:320,derived:true}:{fastSecondsPerKm:310,slowSecondsPerKm:330,derived:true},factor:cap?0.045:0.015*Math.min(3,Math.max(0,i-2)),withdrawn:false,referenceId:'R1',withdrawal:null,...(over[i]??{})});}return w;}
let n=0;const ex=(date,pace,rpe,meas='TRACK',x={})=>({eventId:'e'+(++n)+'-'+date,sessionId:'s-'+date,date,recordedOn:date,week:weekIdx(date),secondsPerKm:pace,rpe,admitted:true,completed:true,comparable:true,compatible:true,longBouts:true,measurement:meas,gpsGood:meas==='GPS',totalWorkMinutes:meas==='GPS'?20:24,...x});
const execs1=PR.round1.executions.map(e=>ex(e.date,e.pace,e.rpe,e.measurement));
const execs2=PR.round2.executions.map(e=>ex(e.date,e.pace,e.rpe,e.measurement));
const endEx=ex('2027-04-21',281,8,'TRACK');
const run=(now,{execs=[...execs1,...execs2,endEx],responses=[],over={},extra={}}={})=>PI.paceRevisionOf({now,weeks:weeks(now,over),executions:execs,adverse:[],breaks:[],responses,raceDate:RACE,experience:'INTERMEDIATE',asOfDay:day(START,7*now),screenRequired:false,p3Offered:false,scope:'plan-1',...extra},PV,RC);
// Round 1: offer at week 9 (index 8)
const s8=run(8);
ok(s8.status==='OFFERED'&&s8.offer.stepFraction===0.02&&s8.offer.effectiveFrom==='2027-03-08','[PR-1 r1 offer] '+JSON.stringify(s8.offer&&{step:s8.offer.stepFraction,eff:s8.offer.effectiveFrom,med:s8.offer.medianMarginOverFastEdge}));
ok(Math.abs(s8.offer.medianMarginOverFastEdge-PR.round1.medianMarginOverFastEdgeAllVoting)<1e-4,'[PR-1 r1 median]');
ok(/Your race estimates do not change/.test(s8.offer.requiredText)&&/2% faster/.test(s8.offer.requiredText),'[PR-1 text] '+s8.offer.requiredText);
const acc1={offerId:s8.offer.offerId,response:'ACCEPT',date:'2027-03-02'};
// Before week 7 nothing is offered (state not improving, factor not at cap before week 6, too few executions)
ok(run(6).status!=='OFFERED','[PR-1] no offer at week 7');
// Effective from week 10
const s9=run(9,{responses:[acc1]});
ok(s9.status==='ACTIVE'&&s9.active.fraction===0.02&&s9.active.effectiveFrom==='2027-03-08','[PR-1 r1 active] '+JSON.stringify(s9.active&&{f:s9.active.fraction,e:s9.active.effectiveFrom}));
const b=PI.effectiveBandOf({fastSecondsPerKm:300,slowSecondsPerKm:320},0.02,RC);ok(b.fastSecondsPerKm===295&&b.slowSecondsPerKm===315,'[PR-1 r1 band] '+JSON.stringify(b));
// Week 9 is not yet effective (next week boundary only)
const s8b=run(8,{responses:[acc1]});ok(s8b.status==='ACTIVE'&&s8b.active.pending===true&&s8b.fractionOn('2027-03-03')===0&&s8b.fractionOn('2027-03-08')===0.02,'[PR-1] effective only from next boundary');
// No offer between weeks 10 and 13 (28 days)
for(const k of [9,10,11,12])ok(!run(k,{responses:[acc1]}).offer,'[PR-1] no second offer at week '+(k+1));
// Round 2 at week 14 (index 13): step 0.01
const s13=run(13,{responses:[acc1]});
ok(s13.offer&&s13.offer.stepFraction===0.01&&s13.offer.revisionTotalAfter===0.03&&s13.offer.effectiveFrom==='2027-04-12','[PR-1 r2 offer] '+JSON.stringify(s13.offer&&{s:s13.offer.stepFraction,t:s13.offer.revisionTotalAfter,why:s13.offer}));
ok(s13.offer&&Math.abs(s13.offer.medianMarginOverFastEdge-PR.round2.medianMarginOverFastEdgeAllVoting)<1e-4,'[PR-1 r2 median] '+s13.offer?.medianMarginOverFastEdge);
ok(s13.offer&&s13.offer.sessions.length===4,'[PR-1 r2] only executions on/after 2027-03-08 vote');
const acc2={offerId:s13.offer.offerId,response:'ACCEPT',date:'2027-04-06'};
const s14=run(14,{responses:[acc1,acc2]});
ok(s14.status==='ACTIVE'&&s14.active.fraction===0.03,'[PR-1 r2 active]');
const b3=PI.effectiveBandOf({fastSecondsPerKm:300,slowSecondsPerKm:320},0.03,RC);ok(b3.fastSecondsPerKm===295&&b3.slowSecondsPerKm===315,'[PR-1 r2 band rounding] '+JSON.stringify(b3));
// End: Wed 2027-04-21 RPE 8 comparable
const s15=run(15,{responses:[acc1,acc2]});
ok(s15.status==='ENDED'&&s15.ended.reason==='HARDER_THAN_CUE_EXECUTION'&&s15.ended.date==='2027-04-21','[PR-1 end] '+JSON.stringify(s15.ended)+' '+s15.status);
ok(s15.fractionOn('2027-04-22')===0,'[PR-1 end] band reverts');
// No further offer for the rest of the plan
for(const k of [16,17,18,19,20])ok(!run(k,{responses:[acc1,acc2]}).offer,'[PR-1] no offer after end, week '+(k+1));
// Never more than 3% in total; total never exceeds even with a third accepted offer (none can exist)
// ---------- offer conditions, one at a time, at week 9 ----------
const off=(over={},extra={},execs=execs1)=>run(8,{execs,over,extra});
ok(!off({8:{factor:0.03}}).offer,'[offer] factor not at cap');
ok(!off({8:{band:{fastSecondsPerKm:300,slowSecondsPerKm:320,derived:false}}}).offer,'[offer] observed P2 band (not derived)');
ok(!off({8:{mode:'RESTART'}}).offer,'[offer] mode not EASY');
ok(!off({8:{withdrawal:'V1RC_WITHHOLDS'}}).offer,'[offer] V1RC withdrawal');
ok(!off({},{screenRequired:true}).offer,'[offer] screen required');
ok(!off({},{experience:'NONE'}).offer,'[offer] experience NONE');
ok(!off({},{adverse:['2027-02-26']}).offer,'[offer] adverse within 7 days');
ok(!!off({},{adverse:['2027-02-20']}).offer,'[offer] adverse 9 days before does not block');
ok(!off({},{breaks:[{from:'2027-02-01',to:'2027-02-07',days:7}]}).offer,'[offer] break >= 7 days in window');
ok(!off({},{raceDate:'2027-03-14'}).offer,'[offer] within 14 days of race');
ok(!off({8:{phase:'TAPER'}}).offer,'[offer] taper');
ok(!off({},{},[...execs1.slice(0,2),{...execs1[2],measurement:'GPS',gpsGood:false}]).offer,'[offer] GPS not good');
ok(!off({},{},[...execs1.slice(0,2),{...execs1[2],totalWorkMinutes:12}]).offer,'[offer] total work < 15');
ok(!off({},{},[...execs1,{...ex('2027-02-20',290,8),comparable:false}]).offer,'[offer] harder-than-cue in window blocks (even non comparable)');
ok(!off({},{},[...execs1.slice(0,2),{...execs1[2],longBouts:false}]).offer,'[offer] short bouts do not vote -> too few');
ok(!off({},{},[...execs1.slice(0,2),{...execs1[2],admitted:false}]).offer,'[offer] withheld pace evidence does not vote');
ok(!off({},{},execs1.map(e=>({...e,rpe:5}))).offer,'[offer] effort below cue does not vote');
ok(!off({},{},[...execs1.slice(0,2),{...execs1[2],compatible:false}]).offer,'[offer] incompatible response does not vote');
// declining: same evidence not offered again
{const d={offerId:s8.offer.offerId,response:'DECLINE',date:'2027-03-02'};const s=run(9,{execs:execs1,responses:[d]});ok(!s.offer,'[decline] same evidence not offered again');ok(s.fractionOn('2027-03-09')===0,'[decline] nothing applied');}
// an answer naming another offer changes nothing
{const s=run(9,{execs:execs1,responses:[{offerId:'nope',response:'ACCEPT',date:'2027-03-02'}]});ok(s.status!=='ACTIVE','[accept] unknown offer ignored');}
// ---------- endings, from an active 2% revision (accepted at week 9, effective week 10) ----------
const act=(execs,extra={},over={},now=11)=>run(now,{execs:[...execs1,...execs],responses:[acc1],over,extra});
ok(act([]).status==='ACTIVE','[end] control stays active');
ok(act([],{},{10:{referenceId:'R2'}}).ended?.reason==='NEW_V1RC_REFERENCE','[end] new reference');
ok(act([],{},{10:{withdrawal:'V1RC_WITHHOLDS'}}).ended?.reason==='V1RC_WITHDRAWAL','[end] withdrawal');
ok(act([],{},{10:{factor:0.025}}).ended?.reason==='V1RC_TRAINING_FACTOR_DOWN','[end] q8 down');
ok(act([],{adverse:['2027-03-10']}).ended?.reason==='ADVERSE_RESPONSE','[end] adverse');
ok(act([ex('2027-03-10',296,8)]).ended?.reason==='HARDER_THAN_CUE_EXECUTION','[end] harder (rpe)');
ok(act([ex('2027-03-10',300,7,'TRACK',{effortHarder:true})]).ended?.reason==='HARDER_THAN_CUE_EXECUTION','[end] harder (said)');
ok(act([ex('2027-03-10',300,8,'TRACK',{admitted:false})]).ended?.reason==='HARDER_THAN_CUE_EXECUTION','[end] harder with pace withheld (L-13)');
ok(act([ex('2027-03-10',325,7),ex('2027-03-12',325,7)]).ended?.reason==='TWO_SLOWER_EXECUTIONS','[end] two slower');
ok(act([ex('2027-03-10',325,7),ex('2027-03-11',305,7),ex('2027-03-12',325,7)]).status==='ACTIVE','[end] slower-inside-slower not consecutive');
ok(act([ex('2027-03-10',325,7,'TRACK',{admitted:false}),ex('2027-03-12',325,7,'TRACK',{admitted:false})]).status==='ACTIVE','[end] withheld pace never reads slower');
{const s=run(11,{execs:execs1,responses:[acc1,{offerId:'x',response:'REVOKE',date:'2027-03-16'}]});ok(s.ended?.reason==='REVOKED_BY_THE_ATHLETE','[end] revoke');}
{const s=run(19,{execs:execs1,responses:[acc1],over:{}});ok(s.ended&&['TAPER_OR_RACE_WEEK_STARTS','LAPSED'].includes(s.ended.reason),'[end] taper or lapse by week 20: '+s.ended?.reason);ok(s.fractionOn('2027-05-17','TAPER')===0,'[end] none in taper');}
// lapse: no executions after the step -> INSUFFICIENT at 56 days
{const s=run(17,{execs:execs1,responses:[acc1]});ok(s.ended?.reason==='LAPSED'&&s.ended.date==='2027-05-03','[lapse] at first boundary >= 56 days: '+JSON.stringify(s.ended));}
// lapse continues when STABLE against the effective band
{const keep=[0,1,2,3,4,5,6,7].map(k=>ex(day('2027-03-10',7*k),300,7));const s=run(17,{execs:[...execs1,...keep],responses:[acc1]});ok(s.status==='ACTIVE','[lapse] STABLE keeps it: '+s.status+' '+JSON.stringify(s.ended));}
// insights SLOWER_THAN_BAND ends at the boundary
{const sl=[ex('2027-03-09',322,7),ex('2027-03-11',306,7),ex('2027-03-16',322,7),ex('2027-03-23',323,7)];const s=run(12,{execs:[...execs1,...sl],responses:[acc1]});ok(s.ended&&['TWO_SLOWER_EXECUTIONS','INSIGHTS_SLOWER_THAN_BAND'].includes(s.ended.reason),'[end] slower-than-band: '+s.ended?.reason);}
console.log(`p02: ${checks-fails}/${checks} checks hold`);
