// R7-C Phase 3, step 5: adversarial properties of R7C-G02 (learned long-run maintenance) on the R7-C runtime. Read-only; prints JSON.
// Driver as test/r7c-longitudinal.test.mjs: a 16-week program, every week executed and reviewed, a long run followed by an adverse response when
// bad(week, minutes); learning consent per review. Each variant runs with consent ON (as given) and fully OFF, and every decision is checked:
//  L1 a LEARNED_MAINTENANCE pattern appears only with consent at that review, evidence ADVERSE with confidence EMERGING or STRONG (never MIXED),
//     at least policy.emergingSessions adverse comparable runs, into a BUILD/DEVELOPMENT week, mode EASY;
//  L2 it holds at a long-run dose the athlete executed in full (a ledger fact), below the step it blocks, never above the consent-off long run;
//  L3 it changes only next week's long run: every other session of that week, and every strength prescription of the plan, equals consent-off;
//  L4 causal false, automaticDoseAuthority false, the reason says "an association, not a cause";
//  L5 consent off or revoked: no pattern, an empty model, and the fact ledger equal to the consent-off run;
//  L6 same review twice, and with or without the carried model: the same decision.
import {REPO,load} from './phase3-lib.mjs';
const NOW=await load(REPO),{H}=NOW,rt=NOW;
const BAD={recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
const policy=rt.opts.authority.policy.operational.learning;
function longRuns({until,bad=()=>false,consent=()=>true,o={id:'adv-g02',weeks:16},extra=()=>({}),dup=()=>false,pre=()=>null,keep=()=>true}){
 const t={p:H.program(o),ledger:[],results:[],plans:[],reviews:[]};t.first=t.p;
 for(let w=0;w<until;w++){
  const x=pre(w,t);if(x){const r0=rt.evaluateProgram(t.p,{...H.review(t.p,w,{day:0,hour:'05:00:00',learningConsent:consent(w),...x}),actualLedger:t.ledger},rt.opts);t.ledger=r0.actualLedger??t.ledger;if(r0.proposal)t.p=r0.proposal;}
  const obs=t.p.weeks[w].sessions.filter(H.live).filter(s=>keep(w,s)).flatMap(s=>{const one=H.obs(t.p,s,s.role==='LONG'&&bad(w,s.prescription.durationMinutes)?{response:BAD}:{});return dup(w,s)?[one,{...structuredClone(one),eventId:one.eventId+'-watch',source:{provider:'WEARABLE:GENERIC',activityId:'act-'+s.id,quality:'WEARABLE_FULL'}}]:[one];});
  const rv={...H.review(t.p,w,{observations:obs,learningConsent:consent(w),...extra(w,t)}),actualLedger:t.ledger};
  const r=rt.evaluateProgram(t.p,rv,rt.opts);t.reviews.push(rv);t.results.push(r);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.plans.push(t.p);
 }
 return t;
}
const learnedOf=r=>(r.learnedPatterns??[]).find(x=>x.kind==='LEARNED_MAINTENANCE')??null;
const longOf=(P,w)=>P.weeks[w]?.sessions.find(s=>s.role==='LONG'&&s.prescription&&s.status!=='SKIPPED')?.prescription.durationMinutes??null;
const others=(P,w)=>P.weeks[w].sessions.filter(s=>s.role!=='LONG').map(s=>s.id+':'+rt.hash(s.prescription??null));
const strength=P=>P.weeks.map(w=>w.sessions.filter(s=>s.sport==='STRENGTH').map(s=>s.id+':'+rt.hash(s.prescription??null)));
function check(name,on,off,{consent=()=>true}={}){
 const fails=[],learned=[];
 on.results.forEach((r,w)=>{
  const lp=learnedOf(r);if(!lp)return;learned.push(w);
  const prev=w?on.plans[w-1]:on.first,pop=rt.evaluateProgram(prev,{...on.reviews[w],learningConsent:false},rt.opts),phase=on.plans[w].phases.phases[w+1],P=r.proposal,Q=pop.proposal??prev;
  const exec=on.ledger.filter(o=>!o.partial&&!o.conflicted&&o.context?.sessionType==='RUN:LONG'&&o.actual?.completed&&o.context.runMinutes===lp.heldAtMinutes);
  if(consent(w)!==true)fails.push(`w${w} L1 learned without consent`);
  if(lp.evidence.direction!=='ADVERSE'||!['EMERGING','STRONG'].includes(lp.evidence.confidence))fails.push(`w${w} L1 evidence ${lp.evidence.direction}/${lp.evidence.confidence}`);
  if(lp.evidence.adverseCount<policy.emergingSessions)fails.push(`w${w} L1 adverse ${lp.evidence.adverseCount}`);
  if(!['BUILD','DEVELOPMENT'].includes(phase))fails.push(`w${w} L1 into ${phase}`);
  if(!exec.length)fails.push(`w${w} L2 held ${lp.heldAtMinutes} is no executed long run`);
  if(!(lp.heldAtMinutes<lp.stepToMinutes))fails.push(`w${w} L2 held ${lp.heldAtMinutes} not below step ${lp.stepToMinutes}`);
  if(!P||longOf(P,w+1)!==lp.heldAtMinutes)fails.push(`w${w} L2 proposal long ${P&&longOf(P,w+1)} != held ${lp.heldAtMinutes}`);
  if(Q&&longOf(Q,w+1)!=null&&lp.heldAtMinutes>longOf(Q,w+1))fails.push(`w${w} L2 above consent-off ${longOf(Q,w+1)}`);
  if(P&&Q&&JSON.stringify(others(P,w+1))!==JSON.stringify(others(Q,w+1)))fails.push(`w${w} L3 other sessions of week ${w+1} differ`);
  if(P&&Q&&JSON.stringify(strength(P))!==JSON.stringify(strength(Q)))fails.push(`w${w} L3 strength differs`);
  {const src=lp.evidence.sourceEventIds.map(id=>on.ledger.find(o=>o.eventId===id)),age=src.map(o=>o?(Date.parse(r.updatedModel.asOf)-Date.parse(o.observedAt))/864e5:Infinity),arr=on.plans[w].weeks[w+1]?.arrangementId??on.plans[w].weeks[w].arrangementId;if(age.some(d=>!(d<=policy.maximumAgeDays)))fails.push(`w${w} L7 source older than ${policy.maximumAgeDays} days: ${age.map(Math.round)}`);if(src.some(o=>o?.context?.arrangementId!==arr||o?.context?.phaseClass!=='BUILD'))fails.push(`w${w} L7 source outside the arrangement pool or the BUILD class`);}
  if(lp.causal!==false||lp.automaticDoseAuthority!==false||!/an association, not a cause/.test(r.reason))fails.push(`w${w} L4 wording/flags`);
 });
 on.results.forEach((r,w)=>{if(consent(w)!==true){if(learnedOf(r))fails.push(`w${w} L5 pattern without consent`);if(r.updatedModel?.observations?.length)fails.push(`w${w} L5 model holds ${r.updatedModel.observations.length} observations`);}});
 const fact=o=>o.sessionId+':'+rt.hash(o.actual)+':'+rt.hash(o.response??null);if(!learned.length&&JSON.stringify(on.ledger.map(fact))!==JSON.stringify(off.ledger.map(fact)))fails.push('L5 fact ledger differs from consent-off with no learned decision');
 return {name,learnedAt:learned,learnedLong:learned.map(w=>`w${w + 1}:${longOf(on.results[w].proposal,w+1)} (off ${longOf(off.results[w].proposal??off.plans[w],w+1)})`),fails};
}
const V={};
const run=(name,args,consent)=>{const on=longRuns({...args,consent:consent??(()=>true)}),off=longRuns({...args,consent:()=>false});V[name]=check(name,on,off,{consent:consent??(()=>true)});return {on,off};};
// Evidence thresholds and comparability.
run('A_one_adverse_at_70',{until:16,bad:(w,m)=>m===70&&w===5});
run('B_two_adverse_one_cycle',{until:16,bad:(w,m)=>m>=70&&w<=6});
run('C_two_cycles_four_adverse',{until:16,bad:(w,m)=>m>=70});
run('D_mixed_one_compatible_70',{until:16,bad:(w,m)=>m>=70&&w!==9});
run('E_adverse_at_other_dose_only',{until:16,bad:(w,m)=>m===65});
run('F_three_adverse_short_span',{until:16,bad:(w,m)=>m>=70&&[5,6].includes(w)});
// Consent lifecycle.
run('G_consent_off',{until:16,bad:(w,m)=>m>=70},()=>false);
run('H_revoked_at_12',{until:16,bad:(w,m)=>m>=70},w=>w<12);
const reconsent=run('I_revoked_12_reconsent_14',{until:16,bad:(w,m)=>m>=70},w=>w<12||w>=14);
// Duplicate reports of the same long run (manual + wearable) never count twice.
run('J_duplicates',{until:16,bad:(w,m)=>m>=70&&w<=6,dup:(w,s)=>s.role==='LONG'});
// Arrangement change after the failed cycles: the learned query is per arrangement.
run('K_strength_days_change_week11_same_pool',{until:16,bad:(w,m)=>m>=70&&w<11,pre:w=>w===11?{kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}}:null});
run('K2_run_days_change_week11_new_pool',{until:16,bad:(w,m)=>m>=70&&w<11,pre:w=>w===11?{kind:'SCHEDULE_CHANGE',changes:{runDays:[2,4,6],longRunDay:6}}:null});
run('M_expiry_after_week8',{o:{id:'adv-g02-exp',weeks:16},until:16,bad:(w,m)=>m>=70&&w<=8});
run('N_released_long_unreported',{until:14,bad:(w,m)=>m>=70,keep:(w,s)=>!(w===12&&s.role==='LONG')},w=>w>=12);
// Event plan: nothing learned outside build/development weeks; taper, race week and post-event keep the event authority.
const race={id:'adv-g02-race',weeks:12,goals:{run:{kind:'RACE',event:{kind:'HALF_MARATHON',date:H.addDays('2026-11-02',11*7+6)}},strength:'MAINTAIN'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],longRunDay:6,runMinutes:60,longRunMinutes:120}};
run('L_event_plan',{o:race,until:12,bad:(w,m)=>m>=70});
// Determinism and the carried model (L6), on the week the pattern is first established.
const C=longRuns({until:13,bad:(w,m)=>m>=70}),rv=C.reviews[12],a=rt.evaluateProgram(C.plans[11],rv,rt.opts),b=rt.evaluateProgram(C.plans[11],rv,rt.opts),c=rt.evaluateProgram(C.plans[11],{...rv,athleteModel:C.results[11].updatedModel},rt.opts);
const determinism={sameTwice:rt.hash(a)===rt.hash(b),sameWithCarriedModel:rt.hash(a.proposal)===rt.hash(c.proposal)&&JSON.stringify(learnedOf(a))===JSON.stringify(learnedOf(c))};
// Re-consent: after revocation the model is rebuilt from the whole fact ledger once consent returns (facts recorded while consent was off included).
const rc=reconsent.on.results,reconsentObs={atRevocation:rc[12].updatedModel.observations.length,atReconsent:rc[14].updatedModel.observations.length,learnedAfterReconsent:rc.slice(14).some(r=>learnedOf(r)),factsObservedWhileRevoked:rc[14].updatedModel.observations.filter(o=>{const w=reconsent.on.plans[14].weeks.findIndex(x=>x.sessions.some(s=>s.id===o.sessionId));return w>=12&&w<14;}).length};
// The held dose against the population's own hold (a released long run whose week went unreported holds at that release; the learned choice reads
// the last executed long run).
const holdCase=(()=>{const t=longRuns({until:16,bad:(w,m)=>m>=70});return t.results.map((r,w)=>({w,learned:learnedOf(r)?.heldAtMinutes??null,gate:r.gates?.LONG??null})).filter(x=>x.learned!==null);})();
const fails=Object.values(V).flatMap(v=>v.fails.map(f=>v.name+': '+f));
console.log(JSON.stringify({check:'R7C-P3-ADVERSARIAL-G02',runtime:'working tree (R7-C)',policy:{emergingSessions:policy.emergingSessions,emergingSpanDays:policy.emergingSpanDays,strongSessions:policy.strongSessions,strongSpanDays:policy.strongSpanDays,maximumAgeDays:policy.maximumAgeDays},variants:V,determinism,reconsent:reconsentObs,holdCase,fails,result:fails.length||!determinism.sameTwice||!determinism.sameWithCarriedModel?'FINDINGS':'PASS'},null,1));
