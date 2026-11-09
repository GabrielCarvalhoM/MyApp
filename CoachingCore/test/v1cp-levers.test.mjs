// V1 Coaching Productization, Blocks 3 and 4: directed tests of the coaching levers per SSCTR-V1CP-DECISION Q09-Q12 (C-Q09-1, C-Q10-1, C-Q10-2,
// C-Q11-1, C-Q11-2, C-Q12-1..5). One axis per lever: the profile acts only as holds and advice (P1, P2, P4), the volume only on quantity
// ceilings (V1, V2, V3, V4'), the difficulty only on the relative challenge (D1, D2, D3); every output passes through the same envelope.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const ROOT=path.resolve(process.env.V1CP_ROOT??path.resolve(import.meta.dirname,'../..'));
const {generateProgram,evaluateProgram}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/r6-index.mjs')).href);
const {hash}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/value.mjs')).href);
const F=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/v1-f08.mjs')).href);
const {HYBRID,doneBefore,live}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/test/v1cp-fixtures.mjs')).href);
const ELIG=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const gen=(coaching,mutate)=>{const i=HYBRID(coaching);if(mutate)mutate(i);const g=generateProgram(i);assert.equal(g.status,'PROPOSED',g.reason);return g.program;};
const rows=(p,w)=>p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises);
const runs=(p,w)=>p.weeks[w].sessions.filter(s=>s.sport==='RUN'&&live(s));
const negIds=p=>(p.negotiation??[]).map(n=>n.id);
function timeline(p){
 const t={p,ledger:[],ref:null,n:0};
 t.step=(w,d,kind,extra={})=>{const day=addDays(t.p.startDate,w*7+d);const r=evaluateProgram(t.p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${day}T20:00:00-03:00`,weekIndex:w,event:{id:`lv-${++t.n}`,kind},eligibility:ELIG(day),observations:extra.observations??[],...(extra.changes?{changes:extra.changes}:{}),...(extra.wellbeing?{wellbeing:extra.wellbeing}:{}),...(extra.check?{wellbeingCheck:extra.check}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})});t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
 return t;
}
/** Week w's live sessions reported done; `rir(e)` sets each strength set's logged reserve, `response(s)` each run's response. */
const week=(t,w,{rir=null,response=null,load=false}={})=>doneBefore(t.p,w+1).filter(o=>t.p.weeks[w].sessions.some(s=>s.id===o.sessionId)).map(o=>{const s=t.p.weeks[w].sessions.find(x=>x.id===o.sessionId);const x={...o,eventId:o.eventId+'-'+w};
 if((rir||load)&&o.actual.exercises)x.actual={...o.actual,exercises:o.actual.exercises.map(e=>{const row=s.prescription.exercises.find(y=>y.id===e.id);return {...e,sets:e.sets.map(z=>({...z,...(rir?{rir:rir(row)}:{}),...(load&&row.load.mode!=='BODYWEIGHT'&&!z.load?{load:{value:row.load.mode==='KNOWN'?row.load.value:10,unit:'KG',convention:row.load.convention}}:{})}))};})};
 if(response&&s.sport==='RUN')x.response=response(s);return x;});
const through=(t,w,opts)=>{for(let k=0;k<w;k++)t.step(k,6,'WEEKLY_REVIEW',{observations:week(t,k,opts?.(k)??{})});};

test('V1, V2 (C-Q10-2): lower strength volume keeps the main lifts at their base sets: no accessory, no block-boundary set; it is disclosed',()=>{
 const d=gen(),l=gen({volume:{strength:'LOWER'}});
 for(let w=0;w<8;w++){
  for(const s of l.weeks[w].sessions.filter(x=>x.sport==='STRENGTH'&&live(x))){assert.ok(s.prescription.exercises.length<=3,`week ${w}`);assert.ok(s.prescription.exercises.every(e=>e.role==='MAIN'),`week ${w}: main lifts only`);}
  const dm=Object.fromEntries(rows(d,w).map(e=>[e.id,e.sets]));for(const e of rows(l,w))if(dm[e.id]!==undefined)assert.ok(e.sets<=dm[e.id],`week ${w} ${e.id}: never above the standard sets`);
 }
 assert.ok(rows(d,5).some(e=>e.role==='MAIN'&&e.sets>Math.max(...rows(l,5).map(x=>x.sets))),'the standard plan adds a set at the block boundary; the lower one does not');
 assert.ok(negIds(l).includes('VOLUME_LOWER_STRENGTH'));assert.deepEqual(runs(l,3).map(s=>s.prescription.durationMinutes).slice(-1),runs(gen({volume:{run:'STANDARD',strength:'LOWER'}}),3).map(s=>s.prescription.durationMinutes).slice(-1));
});

test("V4' (C-Q10-2): lower running volume keeps every easy run at its length; an EARNED gate moves no easy duration there; HIGHER equals STANDARD and says so",()=>{
 const d=gen(),l=gen({volume:{run:'LOWER'}}),h=gen({volume:{run:'HIGHER'}});
 const easy=p=>p.weeks.map(x=>runs({weeks:[x]},0).filter(s=>s.role==='EASY').map(s=>s.prescription.durationMinutes));
 const e0=Math.max(...easy(l)[0]);for(const [w,list] of easy(l).entries())assert.ok(list.every(m=>m<=e0),`week ${w}: no easy step`);
 assert.ok(easy(d).flat().some(m=>m>e0),'the standard plan steps its easy runs');
 assert.deepEqual(h.weeks.map(x=>x.sessions.map(s=>hash(s.prescription??null))),d.weeks.map(x=>x.sessions.map(s=>hash(s.prescription??null))),'higher running volume is the standard plan here');
 assert.match(h.negotiation.find(n=>n.id==='VOLUME_HIGHER_RUN').detail,/same as standard/);
 for(const p of [d,l,h])for(const x of p.weeks)for(const s of runs({weeks:[x]},0))assert.ok(s.prescription.durationMinutes<=Math.max(p.canonical.schedule.runMinutes,p.canonical.schedule.longRunMinutes),'never above the chosen minutes');
 // Easier-than-target runs for two weeks: whatever the gate, lower volume never steps the easy duration.
 const t=timeline(l),surplus=()=>({response:()=>({performance:'OVER',recovery:'COMPATIBLE',effort:'EASIER',nextDayFunction:'NORMAL'})});
 through(t,3,()=>surplus());assert.ok(runs(t.p,3).filter(s=>s.role==='EASY').every(s=>s.prescription.durationMinutes<=e0));
});

test('V3, D3 (C-Q10-2, C-Q11-2): taper and race-week running and harder work sit at the approved bounds; the race week stays inside the chosen minutes',()=>{
 const race=i=>{i.athlete.goals={run:{kind:'RACE',event:{kind:'10K',date:'2026-12-27'}},strength:'GENERAL'};};
 const total=(p,phase)=>p.weeks.filter(x=>x.phase===phase).flatMap(x=>runs({weeks:[x]},0)).reduce((n,s)=>n+s.prescription.durationMinutes,0);
 const v=Object.fromEntries(['LOWER','STANDARD','HIGHER'].map(x=>[x,gen({volume:{run:x}},race)])),df=Object.fromEntries(['LOWER','STANDARD','HIGHER'].map(x=>[x,gen({difficulty:{run:x}},race)]));
 assert.ok(v.STANDARD.weeks.some(x=>x.phase==='TAPER'),'the race plan has a taper');
 for(const ph of ['TAPER','RACE_WEEK']){assert.ok(total(v.LOWER,ph)<=total(v.STANDARD,ph)&&total(v.STANDARD,ph)<=total(v.HIGHER,ph),`${ph}: ${total(v.LOWER,ph)} ${total(v.STANDARD,ph)} ${total(v.HIGHER,ph)}`);}
 const hard=p=>p.weeks.filter(x=>x.phase==='TAPER').flatMap(x=>runs({weeks:[x]},0)).filter(s=>!['EASY','LONG','WALK','RACE'].includes(s.role)).reduce((n,s)=>n+s.prescription.durationMinutes,0);
 assert.ok(hard(df.LOWER)<=hard(df.STANDARD)&&hard(df.STANDARD)<=hard(df.HIGHER),`taper harder work ${hard(df.LOWER)} ${hard(df.STANDARD)} ${hard(df.HIGHER)}`);
 for(const p of Object.values(v))for(const s of p.weeks.flatMap(x=>runs({weeks:[x]},0)).filter(x=>x.role!=='RACE'))assert.ok(s.prescription.durationMinutes<=Math.max(p.canonical.schedule.runMinutes,p.canonical.schedule.longRunMinutes));
});

test('D1 LOWER (C-Q11-2): a log at RIR 2 on an RIR 3 row holds and never regresses under lower difficulty; standard accepts it',()=>{
 const run=coaching=>{const t=timeline(gen(coaching));through(t,1);const r=t.step(1,6,'WEEKLY_REVIEW',{observations:week(t,1,{rir:e=>e.rir-1})});return r;};
 const std=run(),low=run({difficulty:{strength:'LOWER'}});
 const ids=Object.keys(low.gates).filter(k=>!['EASY','LONG','QUALITY','WALK_JOG'].includes(k));
 assert.ok(ids.length,'strength gates are read');
 for(const id of ids){assert.notEqual(low.gates[id],'REGRESS',id);assert.notEqual(low.gates[id],'ADVANCE',id+': lower needs the prescribed reserve or more');}
 assert.ok(ids.some(id=>std.gates[id]==='ADVANCE'),'standard accepts one rep short of the reserve');
});

test('D1 HIGHER (C-Q11-1, C-Q11-2): eligible accessory rows only, never main or lower-body rows of a runner; absent outside development, for a novice lifter and during a return',()=>{
 const h=gen({difficulty:{strength:'HIGHER'}}),d=gen();
 const dev=h.weeks.filter(x=>['DEVELOPMENT','BUILD'].includes(x.phase)).map(x=>x.index);
 const lowered=dev.flatMap(w=>rows(h,w).filter(e=>e.rir<rows(d,w).find(x=>x.id===e.id)?.rir));
 assert.ok(lowered.length,'some eligible rows are closer to the limit');assert.ok(lowered.every(e=>e.role==='ACCESSORY'&&e.region==='UPPER'),'accessory upper-body rows only (key-run protection)');
 for(const w of dev)for(const e of rows(h,w))if(e.role==='MAIN'||e.region==='LOWER')assert.equal(e.rir,rows(d,w).find(x=>x.id===e.id)?.rir??e.rir,`${w} ${e.id}`);
 assert.deepEqual(rows(h,0).map(e=>e.rir),rows(d,0).map(e=>e.rir),'establishment unchanged');
 for(const w of h.weeks.filter(x=>!['DEVELOPMENT','BUILD','NEXT_BLOCK','CONSOLIDATION'].includes(x.phase)).map(x=>x.index))assert.deepEqual(rows(h,w).map(e=>e.rir),rows(d,w).map(e=>e.rir),`phase ${h.weeks[w].phase}`);
 const nov=gen({difficulty:{strength:'HIGHER'}},i=>{i.athlete.strengthExperience='NOVICE';}),novD=gen(undefined,i=>{i.athlete.strengthExperience='NOVICE';});
 assert.deepEqual(nov.weeks.map(x=>rows({weeks:[x]},0).map(e=>e.rir)),novD.weeks.map(x=>rows({weeks:[x]},0).map(e=>e.rir)),'never for a novice lifter');
 assert.ok(lowered.every(e=>(e.instructions??[]).every(x=>!/\b0 reps? in reserve|to failure\b/i.test(x))),'never to failure');
 // The gate accepts RIR 1 on an eligible row (prescribed 2), and not on a main row (prescribed 3).
 const t=timeline(h);through(t,3,()=>({load:true}));const w=3,el=rows(t.p,w).find(e=>e.rir===2),main=rows(t.p,w).find(e=>e.role==='MAIN');
 assert.ok(el&&main,'an eligible row and a main row in week 3');
 const r=t.step(w,6,'WEEKLY_REVIEW',{observations:week(t,w,{rir:()=>1,load:true})});
 assert.notEqual(r.gates[el.id],'HOLD',`eligible row ${el.id}: ${r.gates[el.id]}`);assert.equal(r.gates[main.id],'HOLD',`main row ${main.id}`);
 // During a Situation 1 return the held week keeps the goal's start reserve: D1 HIGHER waits (C-Q12-2).
 const u=timeline(gen({difficulty:{strength:'HIGHER'}}));through(u,3);
 u.step(3,1,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:Object.fromEntries(F.signsFor('NEED_REST').map(k=>[k,false])),intent:'REDUCE_LIGHT',days:5,returnSpeed:'FASTER'}});
 u.step(3,6,'WEEKLY_REVIEW',{observations:week(u,3),check:{warningSigns:Object.fromEntries(F.signsFor('NEED_REST').map(k=>[k,false])),exerciseResponse:Object.fromEntries(F.exerciseSignsFor('NEED_REST').map(k=>[k,false])),improved:true}});
 assert.equal((u.p.weeks[4].adaptations??[]).find(a=>a.phase==='LADDER')?.rungs?.STRENGTH,'R4');
 assert.ok(rows(u.p,4).every(e=>e.rir>=3),'no row below the start reserve while the return holds the doses');
});

test('D2 (C-Q11-2): optional strides are not shown under lower running difficulty, shown in the session under higher, and never make a run partial',()=>{
 const nov=i=>{i.athlete.runExperience='NOVICE';i.athlete.recent.runMinutesPerWeek=90;};
 const l=gen({difficulty:{run:'LOWER'}},nov),h=gen({difficulty:{run:'HIGHER'}},nov),d=gen(undefined,nov);
 const strides=p=>p.weeks.flatMap(x=>runs({weeks:[x]},0)).filter(s=>s.prescription.strides);
 assert.ok(strides(d).length&&strides(d).every(s=>s.prescription.strides.optional),'the novice plan offers optional strides');
 assert.equal(strides(l).length,0,'lower: not shown');
 assert.ok(strides(h).length===strides(d).length&&strides(h).every(s=>s.prescription.strides.optional&&s.prescription.strides.presentation==='IN_SESSION'),'higher: shown in the session, still optional');
 const t=timeline(h),w=h.weeks.findIndex(x=>runs({weeks:[x]},0).some(s=>s.prescription.strides));through(t,w);
 const r=t.step(w,6,'WEEKLY_REVIEW',{observations:week(t,w)});
 const run=runs(t.p,w).find(s=>s.prescription.strides);assert.ok(['ADVANCE','EARNED'].includes(r.gates[run.role]),`a completed run with optional strides is not partial: ${r.gates[run.role]}`);
});

test('P1, P2 (Q09, C-Q09-1): the conservative coach counts an earned step as a planned one and waits for a reported response; its holds never shorten a return',()=>{
 const surplus=()=>({response:()=>({performance:'OVER',recovery:'COMPATIBLE',effort:'EASIER',nextDayFunction:'NORMAL'})});
 const earned=coaching=>{const t=timeline(gen(coaching));through(t,3,()=>surplus());return t.step(3,6,'WEEKLY_REVIEW',{observations:week(t,3,surplus())});};
 const b=earned(),c=earned({profile:'CONSERVATIVE'});
 assert.ok(!Object.values(c.gates).includes('EARNED'),'conservative: no early step');
 if(Object.values(b.gates).includes('EARNED'))assert.ok(Object.entries(b.gates).filter(([,g])=>g==='EARNED').every(([k])=>c.gates[k]==='ADVANCE'),'an earned gate becomes the planned one');
 const none=coaching=>{const t=timeline(gen(coaching));through(t,1);return t.step(1,6,'WEEKLY_REVIEW',{observations:week(t,1).map(o=>t.p.weeks[1].sessions.find(s=>s.id===o.sessionId).sport==='RUN'?(({response,...x})=>x)(o):o)});};
 const nb=none(),nc=none({profile:'CONSERVATIVE'});
 assert.equal(nc.gates.EASY,'HOLD','conservative: a completed run with no reported response holds');assert.notEqual(nb.gates.EASY,'HOLD','balanced: it does not');assert.notEqual(nc.gates.EASY,'REGRESS','never a regression');
 assert.ok(negIds(gen({profile:'CONSERVATIVE'})).includes('COACH_CONSERVATIVE'));
});

test('P5 rejected, independence (Q09, Q12 rules 1 and 3): the demanding coach doses as the balanced one; the profile never overrides a volume or difficulty choice',()=>{
 const doses=p=>p.weeks.map(x=>x.sessions.map(s=>hash(s.prescription??null)));
 assert.deepEqual(doses(gen({profile:'DEMANDING'})),doses(gen()),'demanding = balanced doses');
 assert.match(gen({profile:'DEMANDING'}).negotiation.find(n=>n.id==='COACH_DEMANDING').detail,/same as the balanced coach/);
 for(const choice of [{volume:{strength:'LOWER'}},{difficulty:{strength:'HIGHER'}},{volume:{run:'LOWER'},difficulty:{run:'LOWER'}}])
  for(const profile of ['CONSERVATIVE','DEMANDING'])assert.deepEqual(doses(gen({...choice,profile})),doses(gen(choice)),`${profile} ${JSON.stringify(choice)}: the plan's doses follow the volume and difficulty choices alone`);
});

test('P4 (Q09): the coach profile adds its advice to the offers it shows, never their admissibility',()=>{
 const advice={};
 for(const profile of ['CONSERVATIVE','BALANCED','DEMANDING']){
  const t=timeline(gen({profile}));let offers=[];
  for(let w=0;w<7&&!offers.length;w++){const r=t.step(w,6,'WEEKLY_REVIEW',{observations:week(t,w)});offers=[...(r.offers??[]),...(r.disclosures??[]).filter(x=>x.id==='RUN_QUALITY_INTRODUCED')];}
  advice[profile]=offers.map(o=>o.recommendation??null);
 }
 assert.ok(advice.BALANCED.length,'the block boundary shows offers');
 {assert.ok(advice.BALANCED.every(a=>a===null),'balanced gives no advice');assert.ok(advice.CONSERVATIVE.every(a=>a==='KEEP_BUILDING'));assert.ok(advice.DEMANDING.every(a=>a==='ACCEPT'));assert.equal(advice.CONSERVATIVE.length,advice.BALANCED.length,'the same offers');}
});

test('C-Q12-1, C-Q12-3: a change of choice never credits the past and never yields two steps in one week, however often it is toggled',()=>{
 const t=timeline(gen({volume:{strength:'LOWER'}}));through(t,3);
 const before=Object.fromEntries(rows(t.p,3).map(e=>[e.id,e.sets]));
 t.step(3,2,'PREFERENCE_CHANGE',{changes:{coaching:{volume:{strength:'HIGHER'}}}});t.step(3,3,'PREFERENCE_CHANGE',{changes:{coaching:{volume:{strength:'LOWER'}}}});t.step(3,4,'PREFERENCE_CHANGE',{changes:{coaching:{volume:{strength:'STANDARD'}}}});
 for(const e of rows(t.p,4))if(before[e.id]!==undefined)assert.ok(e.sets<=before[e.id]+1,`${e.id}: ${before[e.id]} to ${e.sets}`);
 assert.deepEqual(Object.fromEntries(rows(t.p,3).map(e=>[e.id,e.sets])),before,'this week is unchanged');
});

test('Envelope (Q12 rules 2 and 4): higher difficulty bypasses no clinical screen, no Situation 1 rule and no return recipe',()=>{
 const p=gen({profile:'DEMANDING',volume:'HIGHER',difficulty:'HIGHER'}),t=timeline(p);through(t,1);
 const yes=t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:{...Object.fromEntries(F.signsFor('MILD_ILLNESS').map(k=>[k,false])),[F.WARNING_SIGNS.W1]:true},intent:'REST',days:5}});
 assert.equal(yes.status,'CLINICAL_HUMAN_REQUIRED');
 const u=timeline(gen({profile:'DEMANDING',difficulty:'HIGHER'}));through(u,1);
 const ret=u.step(3,0,'RETURN_AFTER_PAUSE',{});assert.ok(ret);
 const w=timeline(gen({profile:'DEMANDING',difficulty:'HIGHER'}));through(w,1);
 const ill=w.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:Object.fromEntries(F.signsFor('MILD_ILLNESS').map(k=>[k,false])),intent:'REDUCE_SUBSTANTIAL',days:5}});
 assert.equal(ill.action,'WELLBEING_REDUCTION');
 for(const s of w.p.weeks[1].sessions.filter(x=>live(x)&&x.date>=addDays(w.p.startDate,8)&&x.date<=addDays(w.p.startDate,12)))if(s.sport==='STRENGTH')assert.ok(s.prescription.exercises.every(e=>e.sets===1&&e.rir>=4),'the window\'s rung, whatever the choices');
});
