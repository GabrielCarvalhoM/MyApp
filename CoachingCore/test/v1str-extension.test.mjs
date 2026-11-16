// V1 Strength Extension: directed tests of the three selection rules, their authority and the composed entry point (SI-V1-SSCTR-SQ-1, SQ-2 and
// SQ-4; invariants V-EXT-01 to V-EXT-08 of the Strength Intelligence Foundation). What is expected is each SSCTR condition, named in the test.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {S,P,DEV,OFF,only,B,HOLDS,VALUES,ELIG,lifter,hybrid,familiar,timeline,report,rowsOf,idsOf,slots,mainsOf,planesOf,configurationOf,CONFIGURATIONS,hash,live,EQUIPMENT,FULL,devStrength,addDays} from './v1str-helpers.mjs';
import {STRENGTH_RULES,repertoireAuthority,selectionCompare,TEMPLATE_DEFS} from '../src/r7b-repertoire.mjs';
import {strengthAuthority,strengthRules,strengthValuesOf,allowsStrength,slotsInForce,STRENGTH_VALUES_SHA256,STRENGTH_VALUES_FILE_SHA256,STRENGTH_VALUES_URL,STRENGTH_EXTENSION_ID} from '../src/v1-strength.mjs';
import {substitutesFor} from '../src/r6-catalogue.mjs';

// ---------- the sweep: equipment x goal x strength days x experience, each plan built once per authority ----------
const GOALS=['GENERAL','HYPERTROPHY','STRENGTH','RUNNING_SUPPORT'],DAYS=[[1,4],[1,3,5],[0,2,4,6]],EXPERIENCE=['NONE','NOVICE','INTERMEDIATE','EXPERIENCED'];
const PROFILES=Object.keys(EQUIPMENT).flatMap(eq=>GOALS.flatMap(goal=>DAYS.flatMap(days=>EXPERIENCE.map(experience=>({eq,goal,days,experience,name:`${eq} ${goal} ${days.length}d ${experience}`})))));
const AUTH={OFF,DEV,HOLD:only('HOLD'),UPPER:only('UPPER'),PLANE:only('PLANE')},cache=new Map();
function plan(profile,auth){
 const key=profile.name+'|'+auth;
 if(!cache.has(key)){const r=S.generateProgram(lifter({goal:profile.goal,equipment:EQUIPMENT[profile.eq],days:profile.days,experience:profile.experience}),AUTH[auth]);assert.ok(r.program,`${profile.name} under ${auth}: ${r.status} ${r.reason}`);cache.set(key,r.program);}
 return cache.get(key);
}
const templatesOf=p=>[...(p.templates??[]),...(p.noviceTemplates??[])];
const without=(o,keys)=>Object.fromEntries(Object.entries(o).filter(([k])=>!keys.includes(k)));
const MINE=['strengthExtension','strengthExposure'];
const skillOf=id=>configurationOf(id).skill,loadingOf=id=>configurationOf(id).loading,planeOf=id=>configurationOf(id).subpattern;
/** A new plan asked three weeks into a plan, after a stated nonclinical pause: the intake again with today's facts, and the record as kept. */
const restartOf=(t,intake)=>{const asOf=addDays(t.p.startDate,22);return {intake:{...intake,asOf,startDate:addDays(t.p.startDate,28),athlete:{...intake.athlete,eligibility:ELIG(asOf),pause:{weeks:1,reasonCategory:'TRAVEL',nonclinical:true}}},record:t.ledger,referenceState:t.ref};};
const upperMains=p=>(p.templates??[]).flatMap(t=>t.rows.filter(r=>r.role==='MAIN'&&['PUSH','PULL'].includes(r.pattern)).map(r=>({type:t.type,slot:r.slot,pattern:r.pattern,id:r.entry.id,row:r})));

// ---------- V-EXT-01: off, the answer is the entry point below ----------
test('V-EXT-01 with no boundary on, a first plan, its reviews and a new plan are the answers of the entry point below, plus two keys that say so', ()=>{
 for(const intake of [lifter({experience:'NONE',equipment:EQUIPMENT.BW,days:[1,3,5]}),lifter({goal:'HYPERTROPHY'}),hybrid({})]){
  const a=timeline(intake,{opts:OFF}),b=timeline(intake,{opts:OFF,entry:P});
  assert.equal(hash(without(a.g,MINE)),hash(b.g));
  assert.equal(a.g.strengthExtension.status,'DISABLED');assert.deepEqual(Object.values(a.g.strengthExtension.boundaries),[false,false,false,false]);assert.equal(a.g.strengthExposure.status,'DISABLED');
  assert.equal(a.p.repertoire.strengthExtension,undefined);
  for(let w=0;w<3;w++){const x=a.week(w),y=b.week(w);assert.equal(hash(without(x,MINE)),hash(y),`review of week ${w}`);}
  const again=restartOf(a,intake),r=S.restartProgram(again,OFF);
  assert.equal(r.status,'PROPOSED',r.reason);assert.equal(hash(without(r,MINE)),hash(P.restartProgram(again,OFF)));
 }
});
test('V-EXT-01 a boundary is on only with an independent enabling record bound to the pinned values, each boundary by its own record', ()=>{
 assert.equal(STRENGTH_VALUES_FILE_SHA256,STRENGTH_VALUES_SHA256,'the values file is the pinned bytes');
 const record=(boundaryId,x={})=>({boundaryId,extensionSha256:STRENGTH_VALUES_SHA256,independent:true,disposition:'APPROVE_WITH_CONDITIONS',evidenceStatus:'SUPPORTED_WITH_LIMITS',sourceIds:['SI-V1-SSCTR-SQ-1'],...x});
 const on=records=>{const a=strengthAuthority({strengthRecords:{records}});return Object.keys(B).filter(k=>allowsStrength(a,k));};
 assert.deepEqual(on([]),[]);
 assert.deepEqual(on([record(B.HOLD)]),['HOLD']);
 assert.deepEqual(on(Object.values(B).map(id=>record(id))),['HOLD','UPPER','PLANE','EXPOSURE']);
 for(const bad of [{extensionSha256:'0'.repeat(64)},{independent:false},{disposition:'REQUEST_REVISION'},{disposition:'REJECT'},{evidenceStatus:'PLAUSIBLE_BUT_UNCERTAIN'},{sourceIds:[]}])assert.deepEqual(on([record(B.PLANE,bad)]),[],JSON.stringify(bad));
 assert.deepEqual(on([record(B.PLANE),record(B.PLANE,{disposition:'REJECT'})]),[],'a record bound to the values that does not enable vetoes its boundary');
 // Other bytes are not the values, whatever they say.
 const bytes=fs.readFileSync(STRENGTH_VALUES_URL);
 assert.ok(strengthValuesOf(bytes));assert.equal(strengthValuesOf(Buffer.from(bytes.toString('utf8').replace('"side-plank"','"dead-bug"'))),null);assert.equal(strengthValuesOf(null),null);
 // No selection boundary on: no rules at all.
 assert.equal(strengthRules(devStrength([])),null);assert.equal(strengthRules(devStrength([B.EXPOSURE])),null);
});
test('V-EXT-01 only this entry point turns a rule on: rules a caller passes itself are taken off', ()=>{
 const intake=lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.BW}),rules=strengthRules(devStrength()),base=S.generateProgram(intake,OFF);
 const byKey=S.generateProgram(intake,{...OFF,[STRENGTH_RULES]:rules}),byAuthority=S.generateProgram(intake,{...OFF,repertoire:{...repertoireAuthority({asOf:intake.asOf}),strength:rules}});
 assert.equal(hash(byKey.program),hash(base.program));assert.equal(hash(byAuthority.program),hash(base.program));
 // The control: the same rules through this entry point's own authority do change this plan (its planks go).
 assert.notEqual(hash(S.generateProgram(intake,DEV).program.templates),hash(base.program.templates));
});
test('V-INT-01 the rules are read by the repertoire selection only: no other source file names them', ()=>{
 const dir=new URL('../src/',import.meta.url),names=/STRENGTH_RULES|upperLoadingFirst|planeAlternation|strengthExtension|(auth|rep|repertoire)\??\.strength\b|\bS\??\.(inForce|hold)\b/;
 const readers=fs.readdirSync(dir,{recursive:true}).filter(f=>String(f).endsWith('.mjs')&&names.test(fs.readFileSync(new URL(String(f).replace(/\\/g,'/'),dir),'utf8'))).map(String).sort();
 assert.deepEqual(readers,['r7b-repertoire.mjs','v1-strength-index.mjs','v1-strength.mjs']);
});

// ---------- N1, SQ-1: holds ----------
test('SQ-1 c1 the hold dose unit applies to exactly front-plank and side-plank, and no time dose exists', ()=>{
 assert.deepEqual([...HOLDS].sort(),['front-plank','side-plank']);assert.equal(VALUES.holdDose.doseUnit,'HOLD_SECONDS');assert.equal(VALUES.holdDose.timeDose,null);
});
test('SQ-1 c2, V-EXT-06 no hold configuration is in a slot, an alternative, a practice row or any week of any profile', ()=>{
 let holdsWithout=0;
 for(const profile of PROFILES){
  const p=plan(profile,'DEV');
  for(const t of templatesOf(p))for(const r of t.rows){assert.ok(!HOLDS.includes(r.entry.id),`${profile.name}: ${r.entry.id} in ${t.type}`);assert.ok(!r.alternatives.some(id=>HOLDS.includes(id)),`${profile.name}: a hold alternative in ${t.type}`);}
  assert.ok(!idsOf(p).some(id=>HOLDS.includes(id)),profile.name);
  if(idsOf(plan(profile,'OFF')).some(id=>HOLDS.includes(id))||templatesOf(plan(profile,'OFF')).some(t=>t.rows.some(r=>r.alternatives.some(id=>HOLDS.includes(id)))))holdsWithout++;
 }
 assert.ok(holdsWithout>100,`the control: without the rule ${holdsWithout} of these ${PROFILES.length} plans hold a plank or keep one as an alternative`);
});
test('SQ-1 c2 declared familiarity or a rotation preference does not make a hold selectable', ()=>{
 const intake=lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.BW,days:[0,1,2,4,6],known:HOLDS.map(familiar),rotation:'EVERY_2_WEEKS'});
 assert.ok(idsOf(S.generateProgram(intake,OFF).program).some(id=>HOLDS.includes(id)),'the control: without the rule the familiar plank is prescribed');
 const p=S.generateProgram(intake,DEV).program;
 assert.ok(!idsOf(p).some(id=>HOLDS.includes(id)));assert.ok(!templatesOf(p).some(t=>t.rows.some(r=>HOLDS.includes(r.entry.id)||r.alternatives.some(id=>HOLDS.includes(id)))));
});
test('SQ-1 c2 a hold is no substitution target, named or chosen, and no ladder offer', ()=>{
 const auth=repertoireAuthority({[STRENGTH_RULES]:strengthRules(devStrength())});
 assert.ok(substitutesFor('dead-bug',{equipment:[],experience:'INTERMEDIATE'}).some(e=>HOLDS.includes(e.id)),'the control: the frozen ranking offers a plank for dead-bug');
 assert.ok(!substitutesFor('dead-bug',{equipment:['BANDS'],experience:'INTERMEDIATE',auth}).some(e=>HOLDS.includes(e.id)));
 const intake=lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.BW}),sub=x=>({substitution:{exerciseId:'dead-bug',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true,...x}});
 const t=timeline(intake);t.week(0);
 const named=t.step(1,0,'EXERCISE_SUBSTITUTION',sub({to:'front-plank'}),'06:00');assert.equal(named.status,'ASK');assert.equal(named.proposal??null,null);
 const free=t.step(1,0,'EXERCISE_SUBSTITUTION',sub({}),'06:10');assert.equal(free.status,'MODIFY');assert.ok(free.substitutions.length&&free.substitutions.every(x=>!HOLDS.includes(x.selected)&&configurationOf(x.selected).pattern==='TRUNK'));
 const u=timeline(intake,{opts:OFF});u.week(0);assert.ok(u.step(1,0,'EXERCISE_SUBSTITUTION',sub({}),'06:10').substitutions.some(x=>HOLDS.includes(x.selected)),'the control: without the rule the substitute is a plank');
 // The dead-bug -> front-plank ladder offer at the first block boundary.
 const offersAt=opts=>{const x=timeline(lifter({experience:'NOVICE',equipment:EQUIPMENT.BW}),{opts}),end=x.p.blocks.find(b=>b.family==='DEVELOPMENT').endWeekExclusive-1;x.weeks(0,end-1);return (x.week(end).offers??[]).map(o=>o.from+'>'+o.to);};
 const off=offersAt(OFF),on=offersAt(DEV);
 assert.ok(off.includes('dead-bug>front-plank'),'the control: the frozen boundary review offers it');
 assert.deepEqual(on,off.filter(o=>!HOLDS.includes(o.split('>')[1])),'every other offer is the same');
});
test('SQ-1 c3 every trunk slot is filled by another trunk configuration in every profile, bodyweight only included', ()=>{
 for(const profile of PROFILES){
  const p=plan(profile,'DEV'),q=plan(profile,'OFF');
  for(const t of templatesOf(p))assert.ok(!t.missingPatterns.includes('TRUNK'),`${profile.name}: a trunk slot of ${t.type} is unfilled`);
  // Trunk work never leaves a week it was in.
  for(let w=0;w<p.weeks.length;w++)assert.equal(rowsOf(p,w).filter(x=>x.e.pattern==='TRUNK').length,rowsOf(q,w).filter(x=>x.e.pattern==='TRUNK').length,`${profile.name} week ${w}`);
 }
});
test('SQ-1 c4 no duration or seconds value is prescribed for any row: a row is sets, repetitions and reserve, and rest is its only time', ()=>{
 for(const profile of PROFILES.filter((_,i)=>i%5===0)){const p=plan(profile,'DEV');
  for(let w=0;w<p.weeks.length;w++)for(const {e} of rowsOf(p,w)){assert.deepEqual(Object.keys(e).filter(k=>/second|hold|duration|time/i.test(k)),['restSeconds']);assert.ok(Number.isInteger(e.sets)&&Number.isInteger(e.reps)&&e.reps>0);assert.ok(!/\bsec(ond)?s?\b|hold for/i.test(JSON.stringify(e.instructions??'')));}}
});
test('SQ-1 c5 the loss of anti-lateral-flexion coverage is stated as a known limitation, and nothing is claimed equivalent', ()=>{
 const r=S.generateProgram(lifter({}),DEV);
 assert.deepEqual(r.strengthExtension.knownLimitations.map(x=>x.id),['NO_ANTI_LATERAL_FLEXION_ROW']);assert.match(r.strengthExtension.knownLimitations[0].detail,/not claimed to be equivalent/);
 assert.ok(!CONFIGURATIONS.some(e=>e.pattern==='TRUNK'&&e.subpattern==='ANTI_LATERAL_FLEXION'&&!HOLDS.includes(e.id)),'side-plank is the catalog\'s only anti-lateral-flexion configuration');
 assert.equal(S.generateProgram(lifter({}),only('UPPER','PLANE')).strengthExtension.knownLimitations,undefined);
});
test('SQ-1 c6 with only this rule, only trunk accessory rows that held a hold change: no MAIN row and no other row, in any week', ()=>{
 let changed=0;
 for(const profile of PROFILES){
  const a=plan(profile,'OFF'),b=plan(profile,'HOLD'),x=slots(a),y=slots(b);
  assert.deepEqual(Object.keys(y),Object.keys(x),profile.name);
  for(const [k,id] of Object.entries(x)){if(!HOLDS.includes(id)){assert.equal(y[k],id,`${profile.name} ${k}`);continue;}changed++;assert.equal(configurationOf(y[k]).pattern,'TRUNK');assert.ok(!HOLDS.includes(y[k]));}
  for(const t of templatesOf(b))for(const r of t.rows)if(HOLDS.includes(slots(a)[(t.densityCapped?t.type+'@novice':t.type)+':'+r.slot]))assert.equal(r.role,'ACCESSORY');
  assert.equal(hash(mainsOf(b)),hash(mainsOf(a)));
  for(let w=0;w<a.weeks.length;w++)assert.equal(hash(rowsOf(b,w).filter(r=>r.e.pattern!=='TRUNK').map(r=>r.e)),hash(rowsOf(a,w).filter(r=>r.e.pattern!=='TRUNK').map(r=>r.e)),`${profile.name} week ${w}: a row that is not trunk work changed`);
 }
 assert.ok(changed>0);
});

// ---------- N2, SQ-2: external loading before purpose in upper slots under RUNNING_SUPPORT ----------
test('SQ-2 c2 the order is familiar, established, external loading, purpose, then the rest unchanged; without the rule purpose comes first', ()=>{
 const e=(id,x)=>({id,purposes:[],subpattern:'H',loading:'BODYWEIGHT',skill:'LOW',origin:'R6',...x});
 const tagged=e('tagged',{purposes:['RUNNING_SUPPORT']}),loaded=e('loaded',{loading:'EXTERNAL'}),known=e('known'),inUse=e('in-use');
 const ctx=x=>({familiar:new Set(['known']),established:new Set(['in-use']),purposes:new Set(['RUNNING_SUPPORT']),...x}),sorted=c=>[tagged,loaded,inUse,known].sort(selectionCompare(c,'H')).map(x=>x.id);
 assert.deepEqual(sorted(ctx({loadingFirst:true})),['known','in-use','loaded','tagged']);
 assert.deepEqual(sorted(ctx({})),['known','in-use','tagged','loaded']);
});
test('SQ-2, V-EXT-03 under RUNNING_SUPPORT with equipment, the upper MAIN rows are externally loaded; lower, calf and trunk selection is unchanged', ()=>{
 let moved=0;
 for(const profile of PROFILES.filter(p=>p.goal==='RUNNING_SUPPORT')){
  const a=plan(profile,'OFF'),b=plan(profile,'UPPER'),x=slots(a),y=slots(b);
  for(const [k,id] of Object.entries(x)){if(y[k]===id)continue;moved++;
   assert.equal(configurationOf(id).region,'UPPER',`${profile.name} ${k}: only an upper slot changes`);assert.equal(configurationOf(y[k]).region,'UPPER');}
  // A MAIN row that changes goes from bodyweight or a band to external loading. An accessory of the same session then takes the next
  // configuration (one is used once per session): no template holds fewer externally loaded upper rows than before.
  for(const m of upperMains(b)){const before=upperMains(a).find(z=>z.type===m.type&&z.slot===m.slot);if(before.id===m.id)continue;assert.equal(loadingOf(m.id),'EXTERNAL',`${profile.name}: ${before.id} -> ${m.id}`);assert.notEqual(loadingOf(before.id),'EXTERNAL');}
  const external=p=>templatesOf(p).map(t=>t.rows.filter(r=>r.entry.region==='UPPER'&&r.entry.loading==='EXTERNAL').length);
  external(b).forEach((n,i)=>assert.ok(n>=external(a)[i],`${profile.name}: template ${i}`));
  // With an external option for the slot, the MAIN is external.
  const available=new Set([...EQUIPMENT[profile.eq],'BODYWEIGHT']),maxSkill=['NONE','NOVICE'].includes(profile.experience)?0:1,rank={LOW:0,MODERATE:1,HIGH:2};
  for(const m of upperMains(b)){const option=CONFIGURATIONS.some(e=>e.pattern===m.pattern&&e.roles.includes('MAIN')&&e.loading==='EXTERNAL'&&e.equipment.every(q=>available.has(q))&&rank[e.skill]<=maxSkill&&TEMPLATE_DEFS[m.type].slots[m.slot].subpatterns.includes(e.subpattern));
   if(option)assert.equal(loadingOf(m.id),'EXTERNAL',`${profile.name} ${m.type}:${m.slot} ${m.id}`);}
 }
 assert.ok(moved>0);
});
test('SQ-2 c3 admissibility is unchanged: no HIGH-skill lift without familiarity, LOW skill only for NONE and NOVICE', ()=>{
 for(const profile of PROFILES)for(const auth of ['UPPER','DEV']){
  const p=plan(profile,auth);
  for(const t of templatesOf(p))for(const r of t.rows){assert.notEqual(skillOf(r.entry.id),'HIGH',`${profile.name}: ${r.entry.id}`);if(['NONE','NOVICE'].includes(profile.experience))assert.equal(skillOf(r.entry.id),'LOW',`${profile.name}: ${r.entry.id}`);}
 }
 const p=S.generateProgram(hybrid({equipment:FULL}),only('UPPER')).program;
 assert.ok(!idsOf(p).some(id=>['barbell-row','bench-press','barbell-overhead-press'].includes(id)));
});
test('SQ-2 c1, c5 outside its scope, and where no external upper option exists, the selection is the same', ()=>{
 for(const profile of PROFILES){
  const a=plan(profile,'OFF'),b=plan(profile,'UPPER'),same=hash(a.templates)===hash(b.templates)&&hash(a.noviceTemplates??null)===hash(b.noviceTemplates??null)&&hash(a.weeks)===hash(b.weeks);
  if(profile.goal!=='RUNNING_SUPPORT')assert.ok(same,`${profile.name}: another goal with no event`);
  if(['BW','BANDS'].includes(profile.eq))assert.ok(same,`${profile.name}: no external upper option`);
 }
});
test('SQ-2 c1 with an event programmed, the rule reaches the upper accessory slots of another strength goal and no MAIN row', ()=>{
 const intake=hybrid({goal:'GENERAL',days:[0,2,4],equipment:EQUIPMENT.DB_BANDS}),a=S.generateProgram(intake,OFF).program,b=S.generateProgram(intake,only('UPPER')).program;
 assert.equal(hash(mainsOf(b)),hash(mainsOf(a)));
 const x=slots(a),y=slots(b),moved=Object.keys(x).filter(k=>x[k]!==y[k]);
 for(const k of moved){assert.equal(configurationOf(y[k]).region,'UPPER');assert.equal(loadingOf(y[k]),'EXTERNAL');assert.notEqual(loadingOf(x[k]),'EXTERNAL');}
});
test('SQ-2 c4 the new loaded row keeps the goal dose and starts by effort-guided establishment: nothing is converted from the row it replaces', ()=>{
 const intake=hybrid({equipment:FULL}),a=S.generateProgram(intake,OFF).program,b=S.generateProgram(intake,only('UPPER')).program,first=b.weeks.findIndex((_,w)=>rowsOf(b,w).some(x=>x.e.role==='MAIN'&&x.e.region==='UPPER'));
 const rows=rowsOf(b,first).filter(x=>x.e.role==='MAIN'&&x.e.region==='UPPER'),was=rowsOf(a,first).filter(x=>x.e.role==='MAIN'&&x.e.region==='UPPER');
 assert.ok(rows.length&&rows.length===was.length);
 for(const [i,{e}] of rows.entries()){assert.equal(e.load.mode,'ESTABLISH');assert.ok(!Number.isFinite(e.load.value));assert.equal(e.sets,was[i].e.sets);assert.equal(e.rir,was[i].e.rir);assert.ok(e.reps>=6&&e.reps<=10);}
});

// ---------- N4, SQ-4: plane alternation ----------
test('SQ-4 c2 an intermediate athlete with a full gym who is familiar with the bench gets bench-press in the first push slot and db-overhead-press in the second', ()=>{
 const p=S.generateProgram(lifter({experience:'INTERMEDIATE',equipment:FULL,known:[familiar('bench-press')]}),only('PLANE')).program,m=mainsOf(p);
 assert.equal(m['FULL_A:1'],'bench-press');assert.equal(m['FULL_B:2'],'db-overhead-press');
 assert.equal(mainsOf(S.generateProgram(lifter({experience:'INTERMEDIATE',equipment:FULL,known:[familiar('bench-press')]}),OFF).program)['FULL_B:2'],'bench-press','the control: without the rule the familiar bench takes both slots');
});
test('SQ-4 c1, V-EXT-05 two MAIN slots of a pattern: the second in template order asks for the vertical plane, at most half ask, a single slot asks for nothing', ()=>{
 for(const profile of PROFILES)for(const p of [plan(profile,'PLANE'),plan(profile,'DEV')])for(const set of [p.templates,p.noviceTemplates??[]])for(const pattern of ['PUSH','PULL']){
  const main=set.flatMap((t,ti)=>TEMPLATE_DEFS[t.type].slots.map((s,si)=>({ti,si,s,t})).filter(x=>x.s.pattern===pattern&&x.s.role==='MAIN')),asking=set.flatMap((t,ti)=>t.rows.filter(r=>r.planeAlternation&&r.slotPattern===pattern).map(r=>ti+':'+r.slot));
  assert.ok(main.length<=2);assert.ok(asking.length<=Math.floor(main.length/2),profile.name);
  for(const key of asking)assert.equal(key,main[1].ti+':'+main[1].si,`${profile.name}: the asking slot is the second`);
 }
 // One strength day: one slot of each pattern, nothing asked, the plan as without the rule.
 for(const eq of Object.keys(EQUIPMENT)){const intake=lifter({equipment:EQUIPMENT[eq],days:[3],experience:'INTERMEDIATE'}),a=S.generateProgram(intake,OFF).program,b=S.generateProgram(intake,only('PLANE')).program;
  assert.equal(hash(b.templates),hash(a.templates));assert.equal(hash(b.weeks),hash(a.weeks));}
});
test('SQ-4 c3, V-EXT-07 the loading guard: vertical never takes a slot from external loading down to bodyweight, assistance or a band', ()=>{
 for(const profile of PROFILES){
  const a=plan(profile,'OFF'),b=plan(profile,'PLANE');
  for(const m of upperMains(b)){const before=upperMains(a).find(x=>x.type===m.type&&x.slot===m.slot);if(!before||before.id===m.id)continue;
   assert.ok(m.row.planeAlternation,`${profile.name}: only an asking slot changes`);assert.equal(planeOf(m.id),m.row.planeAlternation.asks);
   if(loadingOf(before.id)==='EXTERNAL')assert.equal(loadingOf(m.id),'EXTERNAL',`${profile.name} ${m.type}:${m.slot}: ${before.id} -> ${m.id}`);}
 }
 // Dumbbells and bands: the pull slot keeps db-row rather than band-pulldown.
 const db=S.generateProgram(lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.DB_BANDS}),only('PLANE')).program;
 assert.equal(mainsOf(db)['FULL_B:1'],'db-row');assert.ok(!idsOf(db).includes('band-pulldown'));assert.equal(mainsOf(db)['FULL_B:2'],'db-overhead-press');
 // No option with external load: the preference applies.
 assert.equal(mainsOf(S.generateProgram(lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.BANDS}),only('PLANE')).program)['FULL_B:1'],'band-pulldown');
 const bw=mainsOf(S.generateProgram(lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.BW}),only('PLANE')).program);assert.equal(bw['FULL_A:1'],'push-up');assert.equal(bw['FULL_B:2'],'pike-push-up');
});
test('SQ-4 c4 admissibility is unchanged: no vertical push for NONE and NOVICE, they do get a pulldown; a HIGH vertical lift needs familiarity', ()=>{
 for(const profile of PROFILES.filter(p=>['NONE','NOVICE'].includes(p.experience))){const p=plan(profile,'PLANE');
  assert.ok(!idsOf(p).some(id=>planeOf(id)==='VERTICAL_PUSH'),profile.name);
  if(['MACHINES','MACH_DB','FULL'].includes(profile.eq))assert.ok(templatesOf(p).some(t=>t.rows.some(r=>r.entry.id==='lat-pulldown')),profile.name);
  if(profile.eq==='BANDS')assert.ok(templatesOf(p).some(t=>t.rows.some(r=>r.entry.id==='band-pulldown')),profile.name);}
 for(const profile of PROFILES)assert.ok(!idsOf(plan(profile,'PLANE')).some(id=>['barbell-overhead-press','pull-up','chin-up'].includes(id)),profile.name);
 const p=S.generateProgram(lifter({experience:'EXPERIENCED',equipment:EQUIPMENT.BAR,known:[familiar('bench-press'),familiar('barbell-overhead-press')]}),only('PLANE')).program;
 assert.equal(mainsOf(p)['FULL_B:2'],'barbell-overhead-press');
});
test('SQ-4 c4 practice rows are unchanged', ()=>{
 for(const profile of PROFILES.filter(p=>p.experience==='NONE')){const a=plan(profile,'OFF'),b=plan(profile,'PLANE');
  for(let w=0;w<a.weeks.length;w++)assert.equal(hash(rowsOf(b,w).filter(x=>x.e.role==='PRACTICE').map(x=>[x.s.id,x.e])),hash(rowsOf(a,w).filter(x=>x.e.role==='PRACTICE').map(x=>[x.s.id,x.e])),`${profile.name} week ${w}`);}
});
test('SQ-4 c9 the sweep: vertical pull where machines or bands give an equal-or-better loaded option, vertical push for intermediate and experienced dumbbell profiles, dumbbell-only pull unchanged', ()=>{
 for(const profile of PROFILES){
  const p=plan(profile,'PLANE'),planes=planesOf(p),label=profile.name;
  if(['FULL','MACH_DB','MACHINES','BANDS'].includes(profile.eq))assert.ok(planes.includes('VERTICAL_PULL'),label);
  if(['INTERMEDIATE','EXPERIENCED'].includes(profile.experience)&&['FULL','MACH_DB','DB_BENCH','DB','DB_BANDS'].includes(profile.eq))assert.ok(planes.includes('VERTICAL_PUSH'),label);
  if(['DB','DB_BENCH'].includes(profile.eq)){const a=plan(profile,'OFF');assert.equal(hash(upperMains(p).filter(m=>m.pattern==='PULL').map(m=>[m.type,m.slot,m.id])),hash(upperMains(a).filter(m=>m.pattern==='PULL').map(m=>[m.type,m.slot,m.id])),label);assert.ok(!planes.includes('VERTICAL_PULL'),label);}
  assert.ok(planes.includes('HORIZONTAL_PUSH')||!planes.some(x=>x.endsWith('PUSH')),label+': the default plane stays');
 }
});
test('SQ-4 c5 the configuration is fixed per slot: weekly reviews, an equipment gain and a substitution leave every other slot as it was built', ()=>{
 // Weekly reviews across a block boundary.
 const t=timeline(lifter({experience:'INTERMEDIATE',goal:'HYPERTROPHY',known:[familiar('bench-press')]})),start=slots(t.p),built=slotsInForce(t.p);
 assert.deepEqual(built,{'FULL_B:1':'lat-pulldown','FULL_B:2':'db-overhead-press'});
 for(let w=0;w<7;w++){const r=t.week(w);assert.ok(['KEEP','MODIFY'].includes(r.status),`week ${w}: ${r.status}`);assert.deepEqual(slots(t.p),start,`week ${w}`);assert.deepEqual(slotsInForce(t.p),built);assert.equal(r.strengthExtension.status,'ACTIVE');}
 // An equipment gain that would admit a vertical pull: a running plan keeps the slot it was built with.
 const u=timeline(lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.DB}));assert.equal(mainsOf(u.p)['FULL_B:1'],'db-row');u.weeks(0,1);
 const before=slots(u.p),gain=u.step(2,0,'EQUIPMENT_CHANGE',{changes:{equipment:[...EQUIPMENT.DB,'MACHINES']}},'06:00');
 assert.equal(gain.action,'KEEP');assert.deepEqual(slots(u.p),before);assert.deepEqual(u.p.canonical.athlete.equipment,['DUMBBELLS','MACHINES']);
 u.weeks(2,3);assert.deepEqual(slots(u.p),before);
 // A reason-based substitution of the vertical MAIN: it takes precedence, is kept with its reason, and is replayed at every later review.
 const v=timeline(lifter({experience:'INTERMEDIATE'}));v.weeks(0,1);
 const sub=v.step(2,0,'EXERCISE_SUBSTITUTION',{substitution:{exerciseId:'db-overhead-press',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}},'06:00'),to=sub.substitutions[0].selected;
 const row=()=>v.p.templates.flatMap(x=>x.rows).find(r=>r.planeAlternation?.asks==='VERTICAL_PUSH');
 assert.equal(row().entry.id,to);assert.equal(row().directive.from,'db-overhead-press');assert.equal(row().planeAlternation.built,'db-overhead-press');
 v.weeks(2,4);assert.equal(row().entry.id,to);assert.equal(row().directive.from,'db-overhead-press');assert.ok(!idsOf({weeks:v.p.weeks.slice(3)}).includes('db-overhead-press'));
});
test('SQ-4 c6 no exercise enters in the taper, the race week or the post-event week because of the plane rule', ()=>{
 const t=timeline(hybrid({equipment:EQUIPMENT.DB,weeks:8})),phases=t.p.phases.phases,taper=phases.indexOf('TAPER');assert.ok(taper>0);
 assert.equal(mainsOf(t.p)['FULL_B:1'],'db-row');
 t.weeks(0,taper-1);
 const earlier=new Set(idsOf({weeks:t.p.weeks.slice(0,taper)})),gain=t.step(taper,0,'EQUIPMENT_CHANGE',{changes:{equipment:[...EQUIPMENT.DB,'MACHINES','BANDS']}},'06:00');
 assert.ok(['KEEP','MODIFY'].includes(gain.status));
 for(let w=taper;w<phases.length;w++)for(const {e} of rowsOf(t.p,w))assert.ok(earlier.has(e.id),`${e.id} is new in ${phases[w]}`);
 assert.equal(mainsOf(t.p)['FULL_B:1'],'db-row');
 // The plan as built: its event weeks hold only exercises done before them.
 const p=S.generateProgram(hybrid({}),DEV).program,k=p.phases.phases.indexOf('TAPER'),done=new Set(idsOf({weeks:p.weeks.slice(0,k)}));
 for(let w=k;w<p.weeks.length;w++)for(const {e} of rowsOf(p,w))assert.ok(done.has(e.id));
});
test('SQ-2 c8, SQ-4 c2 the joint order: vertical inside its guard, then familiar, established, external loading, purpose', ()=>{
 const m=mainsOf(S.generateProgram(hybrid({equipment:FULL}),DEV).program);
 assert.deepEqual([m['FULL_A:1'],m['FULL_A:2'],m['FULL_B:1'],m['FULL_B:2']],['db-bench-press','db-row','lat-pulldown','db-overhead-press']);
 // Bands only under RUNNING_SUPPORT: no external option, so the first slots are as without the rules and the second pull asks for the plane.
 const b=mainsOf(S.generateProgram(hybrid({equipment:EQUIPMENT.BANDS}),DEV).program),off=mainsOf(S.generateProgram(hybrid({equipment:EQUIPMENT.BANDS}),OFF).program);
 assert.equal(b['FULL_A:1'],off['FULL_A:1']);assert.equal(b['FULL_A:2'],off['FULL_A:2']);assert.equal(b['FULL_B:1'],'band-pulldown');
 // A familiar bench under RUNNING_SUPPORT keeps the first slot; the second is the loaded vertical.
 const f=mainsOf(S.generateProgram(hybrid({equipment:FULL,known:[familiar('bench-press')]}),DEV).program);assert.equal(f['FULL_A:1'],'bench-press');assert.equal(f['FULL_B:2'],'db-overhead-press');
});

// ---------- the plan's binding: a review runs under the rules the plan was built under ----------
test('a plan records the rules it was built under; a plan built without them is reviewed without them and never adopts one', ()=>{
 const intake=lifter({experience:'NOVICE',equipment:EQUIPMENT.BW,rotation:'EVERY_2_WEEKS'});
 assert.deepEqual(S.generateProgram(intake,DEV).program.repertoire.strengthExtension,{id:STRENGTH_EXTENSION_ID,sha256:STRENGTH_VALUES_FILE_SHA256,boundaries:[B.HOLD,B.PLANE,B.UPPER]});
 assert.deepEqual(S.generateProgram(intake,only('PLANE')).program.repertoire.strengthExtension.boundaries,[B.PLANE]);
 const a=timeline(intake,{opts:OFF}),b=timeline(intake,{opts:OFF,entry:P});
 for(let w=0;w<5;w++){const x=a.step(w,6,'WEEKLY_REVIEW',{observations:a.p.weeks[w].sessions.filter(live).map(s=>report(a.p,s))},'20:00',DEV),y=b.week(w);
  assert.equal(hash(without(x,MINE)),hash(y),`week ${w}`);assert.equal(x.strengthExtension.status,'PLAN_BUILT_WITHOUT_THE_RULES');}
 assert.ok(idsOf(a.p).some(id=>HOLDS.includes(id)),'its planks stay: this candidate has no migration of a plan built before the rules');
});
test('a plan built under rules that are not the rules in force is not reviewed: the engine answers UNSUPPORTED and proposes nothing', ()=>{
 const t=timeline(lifter({experience:'INTERMEDIATE'})),review=()=>t.review(0,6,'WEEKLY_REVIEW',{observations:t.p.weeks[0].sessions.filter(live).map(s=>report(t.p,s))});
 for(const opts of [only('HOLD'),only('HOLD','UPPER'),OFF]){const r=S.evaluateProgram(t.p,review(),opts);assert.equal(r.status,'UNSUPPORTED');assert.equal(r.proposal??null,null);assert.equal(r.strengthExtension.status,'PLAN_BUILT_UNDER_OTHER_RULES');assert.equal(r.strengthExposure.status==='ACTIVE',false);}
 assert.equal(S.evaluateProgram(t.p,review(),DEV).status,'KEEP');
 // Other bytes of the values: the same refusal.
 const other={...DEV,strengthExtension:{...devStrength(),sha256:'f'.repeat(64)}};assert.equal(S.evaluateProgram(t.p,review(),other).status,'UNSUPPORTED');
});
test('a new plan from the record is built under the rules in force', ()=>{
 const intake=lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.MACH_DB}),t=timeline(intake);t.weeks(0,1);
 const r=S.restartProgram(restartOf(t,intake),DEV);
 assert.ok(r.program,r.status+' '+r.reason);assert.deepEqual(r.program.repertoire.strengthExtension.boundaries,[B.HOLD,B.PLANE,B.UPPER]);assert.ok(planesOf(r.program).includes('VERTICAL_PULL'));assert.ok(!idsOf(r.program).some(id=>HOLDS.includes(id)));
});
