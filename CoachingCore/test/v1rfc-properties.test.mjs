// V1 Race Forecast (phase B): the properties of the handoff that are about every input, not one example: T5 (nothing dated or recorded from the
// week's first day on moves the week's forecast), T6 (the temporal accounting), T7 (monotonicity), T8 (the window) and T9 (a slower result).
// The pure function is exercised over seeded inputs; T5 is exercised through the composed entry point on a synthetic athlete, 500 cases.
import test from 'node:test';
import assert from 'node:assert/strict';
import {forecastOf,windowOf,fOf,gammaOf} from '../src/v1-race-forecast.mjs';
import {FV,EX,INPUTS,weeksOf,weekStart,ref,estimateFrom,UNIT,timeline,racePlan,report,asPrescribed,live,near} from './v1rfc-helpers.mjs';

/** A small seeded generator: the same cases on every run. */
const rng=seed=>()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};
const ten=(a,x={})=>({event:'10K',experience:'INTERMEDIATE',unitSeconds:UNIT['10K'],estimate:estimateFrom({km:10,seconds:3000,margin:0.025},'10K'),weeks:weeksOf(16,14,a),completedWeeks:a.length,raceWeekIndex:15,reference:ref(10,3000,'2027-01-01',0.025),pairA:null,previous:null,q8Down:false,...x});
const full=n=>Array(n).fill(1);

test('T6 the temporal accounting: g = U + F; the reference week is credited at the reference; what the reference measured is never added',()=>{
 const next=rng(11);
 for(let k=0;k<400;k++){
  const n=Math.floor(next()*15),a=Array.from({length:n},()=>Math.round(next()*100)/100),at=Math.floor(next()*(n+1));
  // A reference dated before the plan (at = 0), or on the first day of week `at`: that whole week is credited at the reference.
  const got=forecastOf(ten(a,{reference:ref(10,3000,at===0?'2027-01-01':weekStart(at),0.025)}),FV);
  for(const kind of ['planScenario','observedForecast']){const r=got[kind];if(r.status==='UNAVAILABLE')continue;assert.ok(near(got.common.U_unobserved+r.F_future,r.g_applied,1e-12));assert.ok(r.g_applied>=-1e-15);assert.ok(r.F_future>=-1e-15);}
  assert.ok(near(got.common.H_eff_reference,a.slice(0,at).reduce((s,v)=>s+fOf(v,FV),0),1e-12));assert.ok(got.common.U_unobserved>=-1e-15);
 }
 // The handoff's table (intermediate, full adherence): the same g whenever it is computed; a later reference leaves less to add.
 const g=x=>forecastOf(x,FV).planScenario.g_applied,u=x=>forecastOf(x,FV).common.U_unobserved,later=d=>({reference:ref(10,3000,d,0.025)});
 assert.ok(near(g(ten(full(4))),0.03767,6e-6));
 assert.ok(near(g(ten(full(6),later('2027-02-14'))),0.01511,6e-6));assert.ok(near(g(ten(full(9),later('2027-02-14'))),0.01511,6e-6));
 assert.ok(near(g(ten(full(6),later('2027-02-10'))),0.01511,6e-6),'a reference on the Wednesday of week 6 credits week 6 (not 0.01800)');
 assert.ok(near(u(ten(full(9),later('2027-02-14'))),0.00711,6e-6));assert.equal(u(ten(full(6),later('2027-02-14'))),0);
 // O, the gain between the two ends of the pair, calibrates the response and is in no g: another first result changes R, never H.
 const pair=t=>forecastOf(ten(full(6),{...later('2027-02-14'),pairA:ref(10,t,'2027-01-01',0.025)}),FV);
 assert.equal(pair(3060).common.H_eff_reference,pair(3200).common.H_eff_reference);assert.ok(pair(3200).common.R_c>pair(3060).common.R_c);assert.ok(near(pair(3060).decomposition.O,Math.log(3060/3000),1e-12));
 // A reference dated inside a week that is not finished is outside what the decision reviewed: nothing is computed.
 const inside=forecastOf(ten(full(4),later('2027-02-03')),FV);assert.deepEqual([inside.status,inside.reason],['UNAVAILABLE','REFERENCE_INSIDE_AN_UNFINISHED_WEEK']);
});
test('T7 monotonicity: more adherence never slows the central; the slow edge is the estimate; R_c in [0, 1]; the scenario never slower than the observed forecast',()=>{
 const next=rng(29),events=[['5K',10,8],['10K',16,14],['HALF_MARATHON',16,14]];
 for(let k=0;k<600;k++){
  const [event,total,counted]=events[k%3],n=2+Math.floor(next()*(counted-2)),a=Array.from({length:n},()=>Math.round(next()*100)/100),more=a.map(v=>Math.min(1,v+next()*0.3));
  const margin=[0.025,0.04,0.06][Math.floor(next()*3)],seconds=1500+Math.floor(next()*2400),u=UNIT[event];
  const base={event,experience:['NOVICE','INTERMEDIATE','EXPERIENCED',null][Math.floor(next()*4)],unitSeconds:u,estimate:estimateFrom({km:10,seconds,margin},event),completedWeeks:n,raceWeekIndex:total-1,
   reference:ref(10,seconds,'2027-01-01',margin),pairA:next()<0.5?{date:'2026-12-10',t10:seconds*(0.9+next()*0.2),sigma:margin/FV.response.z}:null,previous:null,q8Down:false};
  const lo=forecastOf({...base,weeks:weeksOf(total,counted,a)},FV),hi=forecastOf({...base,weeks:weeksOf(total,counted,more)},FV);
  assert.ok(lo.common.R_c>=0&&lo.common.R_c<=1&&lo.common.R_hi<=1&&lo.common.R_hi>=lo.common.R_c);
  for(const x of [lo,hi])for(const kind of ['planScenario','observedForecast']){const r=x[kind];
   assert.equal(r.highSeconds,Math.ceil(base.estimate.upper/u-1e-9)*u,'the slow edge is the current estimate');assert.ok(r.unrounded.low<=base.estimate.lower+1e-9&&r.unrounded.central<=base.estimate.central+1e-9);assert.ok(r.lowSeconds<=r.centralSeconds&&r.centralSeconds<=r.highSeconds);}
  assert.ok(hi.observedForecast.unrounded.central<=lo.observedForecast.unrounded.central+1e-9,'more adherence, a central no slower');assert.ok(hi.planScenario.unrounded.central<=lo.planScenario.unrounded.central+1e-9);
  for(const x of [lo,hi]){
   assert.ok(x.planScenario.unrounded.central<=x.observedForecast.unrounded.central+1e-9);assert.ok(x.planScenario.unrounded.low<=x.observedForecast.unrounded.low+1e-9);assert.ok(x.planScenario.lowSeconds<=x.observedForecast.lowSeconds);
   // What is shown is whole or not at all, and the observed forecast is first.
   for(const kind of x.shown)assert.equal(x[kind==='PLAN_SCENARIO'?'planScenario':'observedForecast'].status,'SHOWN');
   if(x.shown.length===2)assert.deepEqual(x.shown,['OBSERVED_FORECAST','PLAN_SCENARIO']);
  }
 }
 assert.equal(gammaOf(0,0.05,10),0);assert.ok(gammaOf(1e6,0.05,10)<=0.05);
});
test('T9 a slower result: under 3% it lowers the response; from 3%, or with a downward training factor in force, no gain is assumed and the forecast is the estimate',()=>{
 const d=forecastOf(INPUTS.d(),FV),d2=forecastOf(INPUTS.d2(),FV);
 assert.ok(d.common.R_c<0.5&&d.common.pair.used);assert.ok(d.planScenario.g_applied>0);
 assert.deepEqual([d2.flags,d2.gZeroReason,d2.planScenario.g_applied,d2.observedForecast.g_applied,d2.common.pair.used],[['NO_GAIN_LATEST_RESULT_SLOWER'],'NO_GAIN_LATEST_RESULT_SLOWER',0,0,false]);
 const u=UNIT.HALF_MARATHON,e=INPUTS.d2().estimate;assert.deepEqual(d2.planScenario.forecastSeconds,[Math.floor(e.lower/u+1e-9)*u,Math.round(e.central/u)*u,Math.ceil(e.upper/u-1e-9)*u]);
 // Exactly at the threshold: 3% slower assumes no gain; just under it, the gain stands.
 const at=s=>forecastOf({...INPUTS.d(),reference:ref(10,s,'2027-02-14',0.025),estimate:estimateFrom({km:10,seconds:s,margin:0.025},'HALF_MARATHON')},FV).flags;
 assert.deepEqual(at(3090),['NO_GAIN_LATEST_RESULT_SLOWER']);assert.deepEqual(at(3089),[]);
 // A downward training factor in force, in any domain: the same, whatever the adherence.
 const down=forecastOf({...INPUTS.a(),q8Down:true},FV);
 assert.deepEqual([down.flags,down.planScenario.g_applied,down.display,down.confidence],[['NO_GAIN_RECENT_SESSIONS_SLOWER'],0,'ONE_RANGE_OBSERVED_FORECAST_COINCIDES_WITH_PLAN_SCENARIO','MODERATE']);
 assert.deepEqual(down.planScenario.forecastSeconds,[2925,3000,3075]);
 // The slowdown is read against the most recent eligible earlier reference, when it is not the pair's first end.
 assert.deepEqual(forecastOf({...INPUTS.d(),previous:{t10:2950}},FV).flags,['NO_GAIN_LATEST_RESULT_SLOWER']);
});
test('T8 the window (example i): beyond 112 days nothing is shown yet, and the day a forecast appears is the first week start inside it',()=>{
 const weeks=weeksOf(26,24),want=EX.forecast.find(e=>e.id==='i').output,out=windowOf(weekStart(1),'2027-06-27',weeks,FV);
 assert.deepEqual([out.status,out.reason,out.availableFrom],[want.status,want.reason,want.availableFrom]);
 assert.equal(windowOf(weekStart(9),'2027-06-27',weeks,FV).status,'NOT_YET_IN_WINDOW');assert.equal(windowOf(weekStart(10),'2027-06-27',weeks,FV),null,'week 10: 111 days to the race');
 assert.equal(windowOf(weekStart(1),'2027-04-25',weeksOf(16,14),FV),null,'a 16-week plan is inside the window from its first day');
});

test('T5 no leak, 500 cases: a report dated or first recorded from the first day of the week on never moves that week\'s forecast or insights',()=>{
 // The athlete after five weeks, the long run of weeks 2 and 4 never reported. Then, inside week 6, anything may be reported: sessions of
 // week 6 itself, and those long runs, late. The forecast and the insights of week 6 are the ones of its Monday.
 const t0=timeline(racePlan({goalMinutes:48})),own=(t,s)=>{const o=s.sport==='RUN'?asPrescribed(t,s):{};return o?.eventId?o:report(t.p,s,o??{});};
 for(let w=0;w<5;w++)t0.step(w,6,'WEEKLY_REVIEW',{observations:t0.p.weeks[w].sessions.filter(live).filter(s=>!(s.role==='LONG'&&w%2)).map(s=>own(t0,s))});
 const monday=t0.look(5),state=JSON.stringify({p:t0.p,ledger:t0.ledger,ref:t0.ref,ev:t0.ev,fmt:t0.fmt,hist:t0.hist,rev:t0.rev,runs:t0.runs,n:t0.n}),next=rng(5);
 assert.equal(monday.runForecast.status,'SHOWN');assert.equal(monday.runForecast.display,'BOTH_RANGES');
 const view=r=>JSON.stringify([r.runForecast.inputDigest,r.runForecast.status,r.runForecast.observedForecast.forecastSeconds,r.runForecast.planScenario.forecastSeconds,r.runForecast.adherence.mean,Object.values(r.paceInsights.domains).map(d=>[d.state,d.votes,d.id])]),want=view(monday);
 const late=[1,3].map(w=>t0.p.weeks[w].sessions.find(s=>s.role==='LONG')),thisWeek=t0.p.weeks[5].sessions.filter(live);
 let read=0;
 for(let k=0;k<500;k++){
  const t=timeline(racePlan({goalMinutes:48}));Object.assign(t,JSON.parse(state));
  const day=1+Math.floor(next()*6),pool=[...late,...thisWeek.filter(s=>s.date<=t.day(5,day))],picked=pool.filter(()=>next()<0.5);
  const how=s=>next()<0.25?{completed:false}:s.sport==='RUN'?{pace:300+Math.floor(next()*120),rpe:2+Math.floor(next()*7),...(s.role==='QUALITY'?{workPace:250+Math.floor(next()*100)}:{})}:{};
  const r=t.step(5,day,'WEEKLY_REVIEW',{observations:picked.map(s=>report(t.p,s,how(s)))},'21:00');
  // An answer the engine or the run formats hold (a symptom route, a question) shows nothing; every other answer shows the Monday's.
  if(r.runForecast.status!=='SHOWN'){assert.equal(r.runForecast.status,'UNAVAILABLE','case '+k);continue;}
  read++;assert.equal(view(r),want,'case '+k+': '+picked.map(s=>s.id).join());
 }
 assert.ok(read>400,'cases read: '+read);
});
