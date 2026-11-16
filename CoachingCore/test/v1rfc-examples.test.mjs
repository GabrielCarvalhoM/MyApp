// V1 Race Forecast (phase B): T1 of the handoff, the worked examples of SSCTR-RFC-DECISION-r2 reproduced to the second, with status, display and
// flags exact. The expected values are read from the decision record; the inputs are each example's own description (v1rfc-helpers.mjs).
// A divergence here is a finding, never an adjustment (preflight S7).
import test from 'node:test';
import assert from 'node:assert/strict';
import {forecastOf,raceWeekOf,goalRelationOf,availableFromOf,sessionCredit,weekAdherence,fOf,onDate} from '../src/v1-race-forecast.mjs';
import {FV,EX,INPUTS,H_AT_15,weeksOf,near} from './v1rfc-helpers.mjs';

const expected=id=>EX.forecast.find(e=>e.id===id),seconds=t=>t.split(':').map(Number).reduce((n,v)=>n*60+v,0);
const TIER_TEXT='current estimate tier, at most MODERATE';

for(const id of Object.keys(INPUTS))test(`T1 forecast example ${id}: forecastSeconds, status, display and flags as the decision gives them`,()=>{
 const want=expected(id).output,input=INPUTS[id](),got=forecastOf(input,FV);
 // The input is the example's: the current estimate the calibration's conversion gives is the one the decision started from.
 for(const [k,v] of Object.entries(want.currentEstimate.unrounded))assert.ok(near(input.estimate[k],v,0.001),`current estimate ${k}: ${input.estimate[k]} against ${v}`);
 assert.equal(got.display,want.display);
 assert.deepEqual(got.flags,want.common.flags);
 assert.equal(got.confidence,want.confidence===TIER_TEXT?(input.estimate.tier==='LOW'?'LOW':'MODERATE'):want.confidence);
 for(const kind of ['planScenario','observedForecast']){
  const w=want[kind],g=got[kind];
  assert.equal(g.kind,w.kind);assert.equal(g.status,w.status,kind+' status');
  if(w.status==='UNAVAILABLE'){assert.equal(g.reason,w.reason);assert.equal(g.completedCountedWeeks,w.completedCountedWeeks);assert.equal(g.needed,w.needed);continue;}
  assert.deepEqual(g.forecastSeconds,w.forecastSeconds,kind+' forecastSeconds');
  assert.deepEqual(g.interval,w.interval);assert.equal(g.wMax,w.wMax);
  // The intermediate values, to the decimals the decision prints them with.
  assert.ok(near(g.width,w.width,6e-6),`${kind} width ${g.width}`);assert.ok(near(g.g_applied,w.g_applied,6e-7),`${kind} g ${g.g_applied}`);assert.ok(near(g.F_future,w.F_future,6e-7));
  assert.ok(near(g.H_eff_raceWeekStart,w.H_eff_raceWeekStart,1e-9));assert.ok(near(g.fFuture,w.fFuture,6e-5));assert.ok(near(g.futureAdherence,w.futureAdherence,1e-9));
  for(const k of ['low','central','high'])assert.ok(near(g.unrounded[k],w.unrounded[k],0.001),`${kind} unrounded ${k}`);
  if(w.weeksInMean!==undefined)assert.equal(g.weeksInMean,w.weeksInMean);
 }
 const c=want.common;
 assert.equal(got.common.completedCountedWeeks,c.completedCountedWeeks);assert.equal(got.common.futureCountedWeeks,c.futureCountedWeeks);
 assert.ok(near(got.common.H_eff_reference,c.H_eff_reference,1e-9));assert.ok(near(got.common.H_eff_now,c.H_eff_now,1e-9));
 assert.ok(near(got.common.gamma_reference,c.gamma_reference,6e-7));assert.ok(near(got.common.gamma_now,c.gamma_now,6e-7));assert.ok(near(got.common.U_unobserved,c.U_unobserved,6e-7));
 assert.ok(near(got.common.R_c,c.R_c,6e-6));assert.ok(near(got.common.sd,c.sd,6e-6));assert.ok(near(got.common.R_hi,c.R_hi,6e-6));assert.equal(got.common.R_slowEdge,0);
 if(c.pair){const p=got.common.pair;assert.ok(near(p.H_A,c.pair.H_A,1e-9));assert.ok(near(p.H_B,c.pair.H_B,1e-9));assert.ok(near(p.T10_A,c.pair.T10_A,0.001));assert.ok(near(p.T10_B,c.pair.T10_B,0.001));assert.ok(near(p.dGamma,c.pair.dGamma,6e-7));assert.ok(near(p.slowerByFraction,c.pair.slowerByFraction,6e-6));
  if(c.pair.Robs!==undefined){assert.ok(near(p.Robs,c.pair.Robs,6e-6));assert.ok(near(p.sdObs,c.pair.sdObs,6e-6));}else assert.equal(p.used,false);}
 else assert.equal(got.common.pair,null);
 // The status of the whole: the marathon that fails is withheld; anything else follows its ranges.
 if(want.status)assert.equal(got.status,want.status);
});

test('T1 marathon (e1, e2): the current estimate only, never under either range kind; above 6:00:00 it is withheld (A7, R-11)',()=>{
 const e1=forecastOf(INPUTS.e1(),FV),e2=forecastOf(INPUTS.e2(),FV);
 assert.equal(e1.status,'SHOWN');assert.deepEqual(e1.shown,[]);assert.equal(e1.planScenario.g_applied,0);assert.deepEqual(e1.planScenario.forecastSeconds,[13560,14460,15600]);
 assert.equal(e2.status,'WITHHELD_R11_CENTRAL_ABOVE_6H');assert.deepEqual(e2.shown,[]);assert.equal(e2.planScenario.centralSeconds,21660);
});
test('T1 A1-1: the rule of r1, which leaves the reference week uncredited, is not what is implemented (central 1:53:00, not 1:52:00)',()=>{
 const got=forecastOf(INPUTS['A1-1'](),FV),contrast=expected('A1-1').contrastUnderR1Rule;
 assert.equal(contrast.implement,false);assert.equal(got.common.H_eff_reference,6);assert.notEqual(got.common.H_eff_reference,contrast.H_eff_reference);
 assert.equal(got.planScenario.centralSeconds,6780);assert.notEqual(got.planScenario.centralSeconds,contrast.forecastSeconds[1]);
});
test('T1 A4-1, A4-2, A4-3: race week shows the frozen observed forecast of the week before, or nothing',()=>{
 const last=forecastOf(INPUTS['A4-1'](),FV),want=expected('A4-1').raceWeekDisplay,same={referenceId:'r',tier:'HIGH',q8Down:false};
 const at=(day,x={})=>raceWeekOf({asOfDay:day,raceDate:'2027-04-25',raceWeekStart:'2027-04-19',lastWeekStart:'2027-04-12',last,marathon:false,completion:false,withdrawal:null,now:same,then:same,changedSince:null,...x},FV);
 const shown=at('2027-04-19');
 assert.equal(shown.status,want.status);assert.equal(shown.from,want.from);assert.equal(shown.through,want.through);assert.equal(shown.label,want.label);assert.equal(shown.goalRelation,want.goalRelation);assert.equal(shown.pacingSource,false);
 assert.equal(shown.frozenRange.lowSeconds,want.frozenRange.lowSeconds);assert.equal(shown.frozenRange.highSeconds,want.frozenRange.highSeconds);assert.equal(shown.frozenRange.centralShown,false);assert.ok(!('centralSeconds' in shown.frozenRange));
 assert.equal(at('2027-04-24').status,'SHOWN_FROZEN');
 // Never on race day, nor after it.
 assert.deepEqual([at('2027-04-25').status,at('2027-04-25').reason],['NOT_SHOWN','RACE_DAY']);assert.equal(at('2027-04-26').reason,'AFTER_THE_RACE_DATE');
 // A4-2: a new reference in the taper.
 const a42=expected('A4-2').output,changed=at('2027-04-19',{now:{...same,referenceId:'new'}});assert.equal(changed.status,a42.status);assert.equal(changed.reason,a42.reason);
 // A4-3: the last forecast was too uncertain to show.
 const a43=expected('A4-3').output,h15=forecastOf(H_AT_15(),FV);assert.equal(h15.status,'TOO_UNCERTAIN_TO_SHOW');
 const none=at('2027-04-19',{last:h15});assert.equal(none.status,a43.status);assert.equal(none.reason,a43.reason);
});
test('T1 (i): a race beyond the window names the first week start on or after race date - 112 days',()=>{
 const want=expected('i').output;
 assert.equal(availableFromOf(weeksOf(26,24),'2027-06-27',FV),want.availableFrom);assert.equal(onDate('2027-06-27',-112),'2027-03-07');
});
for(const g of EX.goalRelation.filter(x=>x.range||x.observedForecast))test(`T1 goal relation ${g.id}: against the rounded low and high, inclusive, never the central`,()=>{
 const of=r=>({lowSeconds:seconds(r.low),highSeconds:seconds(r.high)});
 if(g.range)assert.equal(goalRelationOf(g.goalSeconds,of(g.range)),g.relation);
 else for(const kind of ['observedForecast','planScenario'])assert.equal(goalRelationOf(g.goalSeconds,of(g[kind].range)),g[kind].relation,kind);
 // The ranges compared are the ones the forecast of that example gives.
 const got=forecastOf(INPUTS[g.example](),FV);for(const kind of ['observedForecast','planScenario'])if(g[kind]){assert.equal(got[kind].lowSeconds,seconds(g[kind].range.low));assert.equal(got[kind].highSeconds,seconds(g[kind].range.high));}
});
for(const s of EX.adherence.sessions)test(`T1 adherence credit ${s.id}: ${s.credit.rule}`,()=>{
 const steps=s.steps?s.steps.map(x=>({kind:x.kind,w:x.w,targetMet:x.targetMet,repOfRepeatedBlock:x.repOfRepeatedBlock===true,target:x.target,measured:x.measured})):null;
 const got=sessionCredit({planned:s.planned,reported:s.reported,completed:s.completed===true,actualMin:s.actualMin,steps,targetKm:s.targetKm,actualKm:s.actualKm});
 assert.equal(got.rule,s.credit.rule);assert.ok(near(got.c,s.credit.c,6e-6),String(got.c));
});
test('T1 AD-1: the week reads a 0.8172 and f 0.79301; a 16 km run stopped at 12 km is not credited whole',()=>{
 const by=new Map(EX.adherence.sessions.map(s=>[s.id,s])),W=EX.adherence.week;
 const week=weekAdherence(W.sessions.map(id=>{const s=by.get(id);return {sessionId:id,planned:s.planned,reported:s.reported,completed:s.completed===true,actualMin:s.actualMin,steps:s.steps,targetKm:s.targetKm,actualKm:s.actualKm};}));
 assert.equal(week.plannedMinutes,W.plannedMinutes);assert.ok(near(week.creditedMinutes,W.creditedMinutes,1e-9));assert.ok(near(week.a,W.a,6e-5));assert.ok(near(fOf(week.a,FV),W.f,6e-6));
 assert.ok(week.a<W.r1Reading.a);
});
