// DOMAIN_COACHING_R7-B: strength repertoire bound to the runtime. Contextual roles (DR-134, B0-F03, B0-C05), load conventions and laterality
// (B0-F01, B0-F02, B0-C04, B0-F07), goal-context accessories and the calf rule (B0-C05), PULL coverage (B0-C09), skill admissibility (B0-C03),
// rotation under DR-134 (B0-C06, B0-F04), skill ladders and MAIN changes at block boundaries (B0-C07, B0-C06), reason-based substitution,
// novice density (B0-C08, B0-F08). Each test names its record; negative cases are included.
import test from 'node:test';
import assert from 'node:assert/strict';
import {program,reviewed,weekly,review,evaluateProgram,opts,FULL,K,rows,live,gen} from '../r7/b/fixtures/helpers.mjs';
import {configurationOf,TEMPLATE_DEFS,ladderNext,incrementFor} from '../src/r7b-repertoire.mjs';
import {validateR6Prescription,exerciseRow} from '../src/r6-prescription.mjs';
import {skeletonOf} from '../src/r6-program.mjs';

const allRows=p=>p.weeks.flatMap(w=>rows(p,w.index));
const ids=(p,w,pred=()=>true)=>rows(p,w).filter(({e})=>pred(e)).map(({e})=>e.id);

test('DR-134 / B0-F03: the role of a row is the role of its slot; a configuration has no universal role',()=>{
 const roleSeen=new Map();
 for(const strength of ['STRENGTH','HYPERTROPHY','GENERAL'])for(const days of [[0,2,4],[0,1,3,4]]){
  const p=program({id:`s-role-${strength}-${days.length}`,equipment:FULL,goals:{run:'PERFORMANCE',strength},schedule:{strengthDays:days}});
  for(const t of p.templates){const def=TEMPLATE_DEFS[t.type];for(const r of t.rows){assert.equal(r.role,r.downgradedFrom?'ACCESSORY':def.slots[r.slot].role,`${t.type} slot ${r.slot}`);assert.ok(r.entry.roles.includes(r.role));(roleSeen.get(r.entry.id)??roleSeen.set(r.entry.id,new Set()).get(r.entry.id)).add(r.role);}}
  for(const {e} of allRows(p)){const c=configurationOf(e.id);if(c.kind==='ISOLATION')assert.equal(e.role,'ACCESSORY',e.id);if(c.roles.length===1&&c.roles[0]==='PRACTICE')assert.equal(e.role,'PRACTICE',e.id);}
  // MAIN subpatterns: a PULL main is a horizontal or vertical pull, never a scapular isolation.
  for(const t of p.templates)for(const r of t.rows.filter(r=>r.role==='MAIN'&&r.pattern==='PULL'))assert.ok(['HORIZONTAL_PULL','VERTICAL_PULL'].includes(r.entry.subpattern));
 }
 assert.ok([...roleSeen.values()].some(s=>s.has('MAIN')&&s.has('ACCESSORY')),'some configuration serves MAIN in one slot and ACCESSORY in another');
 // A practice-only configuration in an accessory row is refused by validation.
 const bad=exerciseRow(configurationOf('sit-to-stand'),{role:'ACCESSORY',sets:1,reps:5,rir:3,mode:'BODYWEIGHT',restSeconds:60,preparationMinutes:1});
 assert.ok(validateR6Prescription({modality:'STRENGTH',family:'PRACTICE',durationMinutes:20,warmupMinutes:5,cooldownMinutes:3,secondsPerRep:4,equipment:[],exercises:[bad]}).includes('strength.roleNotAdmissible'));
});

test('B0-C04 / B0-F01 / B0-F02: single implements, bands, assistance and the pull-up carry their own convention; one-sided work is per side',()=>{
 const kb=program({id:'s-conv-kb',equipment:['KETTLEBELL'],goals:{run:'PERFORMANCE',strength:'GENERAL'},strengthExperience:'INTERMEDIATE'});
 const kbRows=allRows(kb).map(x=>x.e);
 for(const id of ['kb-goblet-squat','kb-deadlift'])assert.ok(kbRows.filter(e=>e.id===id).every(e=>e.load.convention==='SINGLE_IMPLEMENT'),id);
 assert.ok(kbRows.some(e=>e.id==='kb-row'&&e.laterality==='UNILATERAL'&&e.instructions.some(t=>/per side/.test(t))),'kb-row is one-sided, per side (B0-C09 c5)');
 const bands=program({id:'s-conv-bands',equipment:['BANDS','PULL_UP_BAR'],goals:{run:'PERFORMANCE',strength:'GENERAL'},strengthExperience:'INTERMEDIATE',schedule:{strengthDays:[0,2,4]}});
 for(const {e} of allRows(bands)){const c=configurationOf(e.id);if(['BAND','ASSISTED'].includes(c.loading)){assert.equal(e.load.mode,'BODYWEIGHT');assert.equal(e.load.unit,'LEVEL');assert.equal(e.load.value,undefined);assert.ok(['BAND_TENSION','ASSISTED_BODYWEIGHT'].includes(e.load.convention));assert.ok(e.instructions.some(t=>/never turned into kilograms/.test(t)),e.id);}
  if(e.id==='pull-up'||e.id==='chin-up')assert.equal(e.load.mode,'BODYWEIGHT','the pull-up is bodyweight, never an external kilogram load');}
 assert.ok(allRows(bands).some(({e})=>configurationOf(e.id).loading==='BAND'),'band configurations are in use');
 for(const id of ['side-plank','pallof-press'])assert.equal(configurationOf(id).laterality,'UNILATERAL',id);
 // B0-F07: a single implement steps by the per-implement step; bands and assistance never step a load.
 const S=opts.authority.policy.operational.strength;assert.equal(incrementFor(S,'SINGLE_IMPLEMENT'),S.smallestIncrement.PER_HAND);assert.equal(incrementFor(S,'BAND_TENSION'),0);
 // A kilogram value reported for a band exercise is never a dose.
 const k=program({id:'s-conv-band-known',equipment:['BANDS'],knownExercises:[{id:'band-row',sets:3,reps:12,load:{value:15,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'}]});
 assert.equal(k.capability.strength.known.length,0);assert.ok(allRows(k).filter(x=>x.e.id==='band-row').every(x=>x.e.load.value===undefined));
});

test('B0-F07: a known single-implement load progresses by the per-implement step after the gate allows it, never a fabricated load',()=>{
 const t=reviewed({id:'s-single-step',equipment:['DUMBBELLS'],goals:{run:'PERFORMANCE',strength:'STRENGTH'},knownExercises:[K('goblet-squat',3,5,16,'SINGLE_IMPLEMENT')],rotation:'FIXED'},0);
 const loadsOf=w=>rows(t.p,w).filter(({e})=>e.id==='goblet-squat').map(({e})=>e.load);
 assert.ok(loadsOf(0).every(l=>l.mode==='KNOWN'&&l.value===16&&l.convention==='SINGLE_IMPLEMENT'));
 for(let w=0;w<4;w++)weekly(t,w);
 const later=[1,2,3,4].flatMap(loadsOf).map(l=>l.value);
 assert.ok(later.every(v=>[16,18,20].includes(v)),'only whole per-implement steps of 2 kg: '+later);assert.ok(later.includes(18),'the step is taken');
});

test('B0-C05: goal-context accessories replace, never add, are spread across the listed patterns, keep trunk work and the straight-knee calf default',()=>{
 const hy=program({id:'s-goal-hy',equipment:['MACHINES','DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},schedule:{strengthDays:[0,1,3,4]}});
 for(const t of hy.templates)assert.equal(t.rows.length+t.missingPatterns.length,TEMPLATE_DEFS[t.type].slots.length,'one row per slot: alternatives replace');
 const chosen=hy.templates.flatMap(t=>t.rows.filter(r=>r.goalContextPattern).map(r=>r.goalContextPattern));
 assert.ok(chosen.length>=4,'hypertrophy accessories in use: '+chosen);assert.equal(new Set(chosen).size,chosen.length,'no listed pattern repeats while another is unused: '+chosen);
 assert.ok(hy.templates.some(t=>t.rows.some(r=>r.pattern==='TRUNK')),'trunk work stays in the week');
 // Running support, four days: two calf exposures, at most half bent-knee, the first straight-knee.
 const rs=program({id:'s-goal-rs',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'RUNNING_SUPPORT'},schedule:{strengthDays:[0,1,3,4]}});
 const calf=rs.templates.flatMap(t=>t.rows.filter(r=>r.slotPattern==='CALF'));
 assert.equal(calf.length,2);assert.equal(calf.filter(r=>r.entry.subpattern==='BENT_KNEE').length,1);assert.equal(calf[0].entry.subpattern,'STRAIGHT_KNEE');
 assert.ok(allRows(rs).filter(({e})=>e.subpattern==='BENT_KNEE').every(({e})=>e.instructions.some(t=>/soleus emphasis; a variation, not a better exercise/.test(t))));
 // Two days: a single calf exposure stays straight-knee.
 const two=program({id:'s-goal-rs2',equipment:['DUMBBELLS'],goals:{run:'PERFORMANCE',strength:'RUNNING_SUPPORT'}});
 assert.ok(two.templates.flatMap(t=>t.rows).filter(r=>r.slotPattern==='CALF').every(r=>r.entry.subpattern==='STRAIGHT_KNEE'));
});

test('B0-C09: PULL coverage is computed from the selected rows; scapular work is disclosed as a lower, different stimulus, never PULL unavailable',()=>{
 const bw=gen({id:'s-pull-bw',equipment:[],strengthExperience:'NOVICE'});
 const pulls=bw.program.templates.flatMap(t=>t.rows).filter(r=>r.slotPattern==='PULL');
 assert.ok(pulls.length&&pulls.every(r=>r.role==='ACCESSORY'&&r.downgradedFrom==='MAIN'),'the MAIN pull slot takes an ACCESSORY-admissible pull as an accessory row');
 const d=bw.negotiation.find(n=>n.id==='PULL_LIMITED_FOR_EQUIPMENT');assert.ok(d&&/not an equivalent/.test(d.detail));assert.deepEqual(d.options,['Add a band','Accept limited pull work']);
 assert.ok(!bw.negotiation.some(n=>n.id==='MOVEMENT_PATTERN_UNAVAILABLE'&&n.patterns.includes('PULL')));
 const bar=gen({id:'s-pull-bar',equipment:['PULL_UP_BAR'],strengthExperience:'NOVICE'});
 assert.ok(allRows(bar.program).some(({e})=>e.id==='scapular-pull-up'&&e.instructions.some(t=>/cannot hang/.test(t))),'scapular pull-up needs a hang');
 const banded=gen({id:'s-pull-bands',equipment:['BANDS'],strengthExperience:'NOVICE'});
 assert.ok(!banded.negotiation.some(n=>n.id==='PULL_LIMITED_FOR_EQUIPMENT'),'a band row is a loaded-equivalent pull: no disclosure');
 // B0-C03 c6 / B0-C09 c4: bodyweight main rows under a load-mode goal are disclosed as a lower stimulus.
 assert.ok(gen({id:'s-lower-stim',equipment:[],goals:{run:'PERFORMANCE',strength:'STRENGTH'}}).negotiation.some(n=>n.id==='BODYWEIGHT_LOWER_STIMULUS'));
});

test('B0-C03 / skill admissibility: HIGH skill only when familiar or reached through a ladder; equipment never implies competence',()=>{
 const HIGH=['back-squat','front-squat','deadlift','barbell-rdl','bench-press','barbell-overhead-press','barbell-row','pull-up','chin-up'];
 const p=program({id:'s-skill',equipment:FULL,strengthExperience:'INTERMEDIATE',goals:{run:'PERFORMANCE',strength:'STRENGTH'},schedule:{strengthDays:[0,2,4]}});
 assert.ok(!allRows(p).some(({e})=>HIGH.includes(e.id)),'no HIGH-skill configuration without familiarity');
 const f=program({id:'s-skill-known',equipment:FULL,knownExercises:[K('back-squat',3,5,80)],goals:{run:'PERFORMANCE',strength:'STRENGTH'}});
 assert.ok(allRows(f).some(({e})=>e.id==='back-squat'),'a familiar back squat is used');
 const n=program({id:'s-skill-novice',equipment:FULL,strengthExperience:'NOVICE'});assert.ok(allRows(n).every(({e})=>configurationOf(e.id).skill==='LOW'),'novices: LOW skill only');
});

test('DR-134 / B0-C06 rotation: MAIN and PRACTICE never rotate on the calendar; an accessory turns every two weeks under EVERY_2_WEEKS, and under COACH_DECIDES only at the first block boundary on or after six weeks; FIXED never',()=>{
 const cfg=rot=>program({id:'s-rot-'+rot,equipment:FULL,goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},rotation:rot,weeks:16,schedule:{strengthDays:[0,2,4]}});
 const acc=(p,w)=>ids(p,w,e=>e.role==='ACCESSORY').join(','),main=(p,w)=>ids(p,w,e=>e.role==='MAIN').join(',');
 const two=cfg('EVERY_2_WEEKS'),coach=cfg('COACH_DECIDES'),fixed=cfg('FIXED');
 for(const p of [two,coach,fixed])for(let w=2;w<16;w++)if(p.weeks[w].phase!=='CONSOLIDATION'&&p.weeks[w-1].phase!=='CONSOLIDATION')assert.equal(main(p,w),main(p,w-1),'MAIN never changes on the calendar (week '+w+')');
 // A turn is a change of the rotation's choice for some slot between consecutive weeks (read from the skeleton, immune to time-fit drops).
 const turns=p=>{const sk=skeletonOf(p,opts.authority),map=w=>JSON.stringify(p.templates.map(t=>sk.rotation(w,t)));return [...Array(15).keys()].map(i=>i+1).filter(w=>map(w)!==map(w-1));};
 assert.ok(turns(two).length>=3&&turns(two).every(w=>w%2===0),'EVERY_2_WEEKS: turns on even weeks only '+turns(two));
 assert.deepEqual(turns(coach),[9],'COACH_DECIDES: the first block boundary on or after week 6 (blocks start at 5, 9, 13)');
 assert.deepEqual(turns(fixed),[],'FIXED: no calendar rotation');
 // A turn never raises a lower-body or eccentric class (the week's arrangement cost is never worse).
 for(let w=1;w<16;w++)for(const t of two.templates){const sk=skeletonOf(two,{...opts.authority,repertoire:undefined});const r=sk.rotation(w,t);for(const [slot,id] of Object.entries(r)){const base=t.rows.find(x=>x.slot===Number(slot)).entry,e=configurationOf(id);assert.ok(['NONE','LIGHT','MODERATE','HEAVY'].indexOf(e.lowerDemand)<=['NONE','LIGHT','MODERATE','HEAVY'].indexOf(base.lowerDemand));assert.ok(e.eccentric!=='HIGH'||base.eccentric==='HIGH');}}
 // A rotated configuration's first exposure is an effort-guided establishment, never a transferred load.
 const w1=turns(two)[0];const fresh=rows(two,w1).filter(({e})=>e.role==='ACCESSORY'&&!rows(two,w1-1).some(x=>x.e.id===e.id)&&!['BODYWEIGHT'].includes(e.load.mode));
 for(const {e} of fresh)assert.equal(e.load.mode,'ESTABLISH',e.id);
});

test('B0-C06 c3: no rotation in SPECIFIC, TAPER, race week or post-event, nor during a return',()=>{
 const p=program({id:'s-rot-event',goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-01-31'},rotation:'EVERY_2_WEEKS',weeks:16,recent:{runDaysPerWeek:4,runMinutesPerWeek:180,longestRunMinutes:60,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6]},equipment:FULL});
 const ph=p.phases.phases,first=ph.indexOf('SPECIFIC');assert.ok(first>0);
 const acc=w=>ids(p,w,e=>e.role==='ACCESSORY'||e.role==='MAIN').join(',');
 for(let w=first+1;w<ph.length&&['SPECIFIC','TAPER'].includes(ph[w]);w++)assert.equal(acc(w),acc(first),`week ${w} (${ph[w]}) keeps the exercises in use`);
});

test('B0-C07: ladder steps are offered (never applied) at a block boundary after progressing final exposures, one step, opt-in; accepted, the new configuration is established from the lightest load',()=>{
 const t=reviewed({id:'s-ladder',equipment:FULL,goals:{run:'PERFORMANCE',strength:'STRENGTH'},rotation:'COACH_DECIDES',weeks:16},0);
 for(let w=0;w<4;w++){const r=weekly(t,w);assert.ok(!(r.offers??[]).length,`no offer before the block boundary (week ${w})`);}
 const at=evaluateProgram(t.p,{...review(t.p,4,{observations:t.p.weeks[4].sessions.filter(live).map(s=>({...obsOf(t,s)}))}),actualLedger:t.ledger},opts);
 const offer=at.offers.find(o=>o.from==='goblet-squat'&&o.to==='back-squat');assert.ok(offer,'goblet-squat → back-squat offered');assert.ok(at.offers.every(o=>ladderNext(o.from).includes(o.to)),'one step on its chain, nothing skipped');
 assert.ok(!rows(at.proposal??t.p,5).some(({e})=>e.id==='back-squat'),'an offer changes nothing by itself');
 // Accepting it: back-squat from next week, established by effort from the empty bar; the goblet squat's history stays.
 const acc=evaluateProgram(t.p,{...review(t.p,4,{observations:t.p.weeks[4].sessions.filter(live).map(s=>obsOf(t,s)),choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'back-squat'}]}),actualLedger:t.ledger},opts);
 assert.equal(acc.status,'MODIFY');const next=rows(acc.proposal,5).filter(({e})=>e.id==='back-squat');assert.ok(next.length);
 for(const {e} of next){assert.equal(e.load.mode,'ESTABLISH');assert.ok(e.instructions.some(x=>/empty bar/.test(x)));}
 assert.ok(acc.proposal.canonical.athlete.ladderReached.includes('back-squat'));assert.ok(acc.proposal.stateTrace[5].strength.exercises['goblet-squat']);
 // Two steps from one exercise, a skipped step and a step off the boundary are asked about, never applied.
 for(const choices of [[{type:'LADDER_STEP',from:'goblet-squat',to:'back-squat'},{type:'LADDER_STEP',from:'goblet-squat',to:'front-squat'}],[{type:'LADDER_STEP',from:'db-bench-press',to:'push-up'}]]){
  const r=evaluateProgram(t.p,{...review(t.p,4,{observations:t.p.weeks[4].sessions.filter(live).map(s=>obsOf(t,s)),choices}),actualLedger:t.ledger},opts);assert.equal(r.status,'ASK',JSON.stringify(choices));}
 const off=evaluateProgram(t.p,{...review(t.p,3,{observations:[],choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'back-squat'}]}),actualLedger:t.ledger},opts);assert.equal(off.status,'ASK');
 // FIXED: nothing offered; the athlete may still opt in.
 const f=reviewed({id:'s-ladder-fixed',equipment:FULL,goals:{run:'PERFORMANCE',strength:'STRENGTH'},rotation:'FIXED',weeks:16},4);
 const fr=evaluateProgram(f.p,{...review(f.p,4,{observations:f.p.weeks[4].sessions.filter(live).map(s=>obsOf(f,s))}),actualLedger:f.ledger},opts);assert.deepEqual(fr.offers,[]);
});
import {obs} from '../r7/b/fixtures/helpers.mjs';
const obsOf=(t,s)=>obs(t.p,s);

test('B0-C06: a MAIN changes only at a block boundary with a recorded reason; a deliberate transition states its purpose; strength goals are told the load restarts',()=>{
 const t=reviewed({id:'s-main',equipment:FULL,goals:{run:'PERFORMANCE',strength:'STRENGTH'},rotation:'COACH_DECIDES',weeks:16},4);
 const at=(choices)=>evaluateProgram(t.p,{...review(t.p,4,{observations:t.p.weeks[4].sessions.filter(live).map(s=>obsOf(t,s)),choices}),actualLedger:t.ledger},opts);
 assert.equal(at([{type:'MAIN_CHANGE',from:'goblet-squat',to:'leg-press',reason:'DELIBERATE_BLOCK_TRANSITION'}]).status,'ASK','no purpose, no change');
 assert.equal(at([{type:'MAIN_CHANGE',from:'goblet-squat',to:'leg-press',reason:'VARIETY'}]).status,'ASK','variety alone is no reason');
 assert.equal(at([{type:'MAIN_CHANGE',from:'goblet-squat',to:'db-rdl',reason:'ATHLETE_PREFERENCE'}]).status,'ASK','another slot pattern is no MAIN change');
 const ok=at([{type:'MAIN_CHANGE',from:'goblet-squat',to:'leg-press',reason:'DELIBERATE_BLOCK_TRANSITION',purpose:'EQUIPMENT'}]);
 assert.equal(ok.status,'MODIFY');assert.ok(rows(ok.proposal,5).some(({e})=>e.id==='leg-press'&&e.role==='MAIN'&&e.load.mode==='ESTABLISH'));assert.ok(!rows(ok.proposal,5).some(({e})=>e.id==='goblet-squat'));
 assert.ok(ok.disclosures.some(d=>d.id==='MAIN_CHANGE_LOAD_RESTARTS'));
});

test('DR-134 reason-based substitution: the clinical screen first; a confirmed nonclinical preference or a skill mismatch overrides FIXED; the exercise set aside never comes back',()=>{
 const t=reviewed({id:'s-sub',equipment:['DUMBBELLS','BENCH','KETTLEBELL'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},2);
 const sub=(substitution,w=2)=>evaluateProgram(t.p,{...review(t.p,w,{day:1,kind:'EXERCISE_SUBSTITUTION',substitution}),actualLedger:t.ledger},opts);
 assert.equal(sub({exerciseId:'db-rdl',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',text:'it hurts my lower back'}).status,'CLINICAL_HUMAN_REQUIRED','pain routes to a human, no safe-exercise swap');
 assert.equal(sub({exerciseId:'db-rdl',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE'}).status,'ASK','a nonclinical reason must be confirmed');
 assert.equal(sub({exerciseId:'db-rdl'}).status,'ASK','no reason, no change');
 const pref=sub({exerciseId:'db-rdl',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true});assert.equal(pref.status,'MODIFY',pref.reason);
 for(let w=3;w<12;w++)assert.ok(!rows(pref.proposal,w).some(({e})=>e.id==='db-rdl'),'set aside for good (week '+w+')');
 const mis=sub({exerciseId:'db-rdl',reason:'SKILL_MISMATCH'});assert.equal(mis.status,'MODIFY');assert.equal(mis.substitutions[0].selected,'kb-deadlift','the previous step on its skill ladder');
});

test('B0-C08 / B0-F08: strength class NONE keeps two full templates until the first block boundary and is released only on executed evidence',()=>{
 const o={id:'s-novice',strengthExperience:'NONE',goals:{run:'REGULAR',strength:'GENERAL'},equipment:['DUMBBELLS','BENCH'],schedule:{strengthDays:[0,2,4,5]},weeks:12};
 const g=gen(o),p=g.program;assert.ok(g.negotiation.some(n=>n.id==='STRENGTH_DAYS_ABOVE_CURRENT_PRACTICE'&&n.options.includes('Choose fewer strength days')));
 const types=w=>p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).map(s=>s.templateType).sort().join(',');
 for(let w=0;w<5;w++)assert.equal(types(w),'CORE,CORE,FULL_A,FULL_B',`week ${w} capped`);
 assert.equal(types(5),'LOWER,LOWER_B,UPPER,UPPER_B','the conditional plan shows the release after the first block');
 const core0=p.weeks[0].sessions.filter(s=>s.templateType==='CORE');assert.ok(core0.every(s=>s.lighterByDesign&&s.prescription.exercises.every(e=>e.role==='PRACTICE'||e.exposure?.kind==='PRACTICE')),'CORE days of the establishment week at practice dose');
 assert.ok(p.weeks.slice(0,5).flatMap(w=>w.sessions.filter(s=>s.templateType==='CORE')).every(s=>!s.prescription||s.prescription.exercises.every(e=>e.role!=='MAIN')),'no lower-body MAIN on CORE days');
 // Familiar athletes are not capped.
 assert.equal(program({...o,id:'s-novice-familiar',strengthExperience:'INTERMEDIATE'}).noviceTemplates,undefined);
 // Executed evidence: every week executed and logged (an agreeing second log adopts the load): released at the boundary.
 const t={p,ledger:[]};for(let w=0;w<5;w++)weekly(t,w);
 assert.equal(t.p.stateTrace[5].strength.density.capped,false);assert.equal(t.p.weeks[5].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).map(s=>s.templateType).sort().join(','),'LOWER,LOWER_B,UPPER,UPPER_B');
 // Missing strength in the boundary week: the cap holds and is re-assessed at the next boundary.
 const h={p,ledger:[]};for(let w=0;w<4;w++)weekly(h,w);weekly(h,4,{keep:s=>s.sport!=='STRENGTH'});
 assert.equal(h.p.stateTrace[5].strength.density.capped,true,'not released without executed evidence');assert.ok(h.p.weeks[5].sessions.some(s=>s.templateType==='CORE'));
});
