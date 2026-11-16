// V1 Strength Extension: directed tests of the three selection rules, their authority and the composed entry point (SI-V1-SSCTR-SQ-1, SQ-2 and
// SQ-4; invariants V-EXT-01 to V-EXT-08 of the Strength Intelligence Foundation). What is expected is each SSCTR condition, named in the test.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {S,P,DEV,OFF,only,B,HOLDS,VALUES,ELIG,lifter,hybrid,familiar,timeline,report,rowsOf,idsOf,slots,mainsOf,planesOf,configurationOf,CONFIGURATIONS,hash,live,EQUIPMENT,FULL,devStrength,addDays} from './v1str-helpers.mjs';
import {STRENGTH_RULES,repertoireAuthority,selectionCompare,buildTemplates,TEMPLATE_DEFS} from '../src/r7b-repertoire.mjs';
import {strengthAuthority,strengthRules,strengthValuesOf,allowsStrength,slotsInForce,STRENGTH_VALUES_SHA256,STRENGTH_VALUES_FILE_SHA256,STRENGTH_VALUES_URL,STRENGTH_EXTENSION_ID} from '../src/v1-strength.mjs';
import {substitutesFor} from '../src/r6-catalogue.mjs';
import {r6Authority} from '../src/r6-authority.mjs';

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
 for(const bad of [{extensionSha256:'0'.repeat(64)},{independent:false},{independent:undefined},{independent:'true'},{independent:1},{disposition:'REQUEST_REVISION'},{disposition:'REJECT'},{evidenceStatus:'PLAUSIBLE_BUT_UNCERTAIN'},{sourceIds:[]},{sourceIds:'SI-V1-SSCTR-SQ-4'}])assert.deepEqual(on([record(B.PLANE,bad)]),[],JSON.stringify(bad));
 assert.deepEqual(on([record(B.PLANE),record(B.PLANE,{disposition:'REJECT'})]),[],'a record bound to the values that does not enable vetoes its boundary');
 // Other bytes are not the values, whatever they say.
 const bytes=fs.readFileSync(STRENGTH_VALUES_URL);
 assert.ok(strengthValuesOf(bytes));assert.equal(strengthValuesOf(Buffer.from(bytes.toString('utf8').replace('"side-plank"','"dead-bug"'))),null);assert.equal(strengthValuesOf(null),null);
 // No selection boundary on: no rules at all.
 assert.equal(strengthRules(devStrength([])),null);assert.equal(strengthRules(devStrength([B.EXPOSURE])),null);
});
test('V-EXT-01 only this entry point turns a rule on: rules a caller passes itself are taken off, wherever it puts them', ()=>{
 const intake=lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.BW}),rules=strengthRules(devStrength()),plain=repertoireAuthority({asOf:intake.asOf}),A0=r6Authority(OFF);
 const hidden=Object.defineProperty({...plain},STRENGTH_RULES,{value:rules,enumerable:false}),inherited=Object.assign(Object.create({[STRENGTH_RULES]:rules}),plain);
 // Each carrier: the caller's options without rules, and the same options with rules of its own.
 const tries={optionKey:[{},{[STRENGTH_RULES]:rules}],repertoire:[{repertoire:plain},{repertoire:{...plain,[STRENGTH_RULES]:rules}}],hiddenOnRepertoire:[{repertoire:plain},{repertoire:hidden}],inheritedByRepertoire:[{repertoire:plain},{repertoire:inherited}],
  authorityRepertoire:[{authority:{...A0,repertoire:plain}},{authority:{...A0,repertoire:{...plain,[STRENGTH_RULES]:rules}}}],inheritedByAuthorityRepertoire:[{authority:{...A0,repertoire:plain}},{authority:{...A0,repertoire:inherited}}],jsonField:[{repertoire:plain},{repertoire:{...plain,strength:rules}}]};
 for(const [name,[clean,carrying]] of Object.entries(tries)){const a=S.generateProgram(intake,{...OFF,...clean}),r=S.generateProgram(intake,{...OFF,...carrying});
  assert.ok(a.program&&idsOf(a.program).some(id=>HOLDS.includes(id)),name+': the plan without rules holds a plank');
  assert.equal(hash(r.program),hash(a.program),name);assert.equal(r.program.repertoire.strengthExtension,undefined,name);assert.equal(r.strengthExtension.status,'DISABLED',name);}
 // The control: each carrier does turn the rules on when it reaches the engine untouched, through the entry point below (a development
 // authority, never an integration): there the planks go.
 for(const name of ['optionKey','repertoire','hiddenOnRepertoire','inheritedByRepertoire','authorityRepertoire'])assert.ok(!idsOf(P.generateProgram(intake,{...OFF,...tries[name][1]}).program).some(id=>HOLDS.includes(id)),name);
 // A field a JSON value can carry is inert at every entry point, as it was before this extension.
 assert.equal(hash(P.generateProgram(intake,{...OFF,...tries.jsonField[1]}).program),hash(P.generateProgram(intake,{...OFF,...tries.jsonField[0]}).program));
});
test('the rules reach the selection whichever way the caller supplies its authority, and the answer says what the plan was built under', ()=>{
 const intake=lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.BW}),plain=repertoireAuthority({asOf:intake.asOf}),want=hash(S.generateProgram(intake,DEV).program.templates);
 for(const [name,extra] of Object.entries({repertoire:{repertoire:plain},authority:{authority:{...r6Authority(DEV),repertoire:plain}}})){
  const r=S.generateProgram(intake,{...DEV,...extra});assert.equal(hash(r.program.templates),want,name);assert.ok(!idsOf(r.program).some(id=>HOLDS.includes(id)),name);
  assert.deepEqual(r.program.repertoire.strengthExtension.boundaries,[B.HOLD,B.PLANE,B.UPPER],name);assert.equal(r.strengthExtension.status,'ACTIVE',name);}
});
test('an error inside this extension never fails the engine: the authority fails closed and the exposure is unavailable', ()=>{
 const intake=lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.BW}),base=P.generateProgram(intake,OFF);
 // The records cannot be read: every boundary off, and the answer is the entry point below's.
 const broken=S.generateProgram(intake,{...OFF,strengthExtension:undefined,strengthRecords:{get records(){throw new Error('unreadable');}}});
 assert.equal(hash(without(broken,MINE)),hash(base));assert.deepEqual(Object.values(broken.strengthExtension.boundaries),[false,false,false,false]);assert.equal(broken.strengthExposure.status,'DISABLED');
 // The exposure throws: the plan and the decision are whole, the exposure says it is unavailable.
 const ext=devStrength(),failing={...ext,values:Object.defineProperty({...ext.values},'exposure',{get(){throw new Error('unreadable');},enumerable:true})};
 const good=S.generateProgram(intake,DEV),bad=S.generateProgram(intake,{...DEV,strengthExtension:failing});
 assert.equal(hash(without(bad,MINE)),hash(without(good,MINE)));assert.deepEqual(without(bad.strengthExposure,['version']),{status:'UNAVAILABLE',reason:'EXPOSURE_ERROR'});assert.equal(bad.strengthExtension.status,'ACTIVE');
});
test('V-INT-01 the rules are read by the repertoire selection only: no other source file names them', ()=>{
 const dir=new URL('../src/',import.meta.url),names=/STRENGTH_RULES|upperLoadingFirst|planeAlternation|strengthExtension|\bS\??\.(inForce|hold)\b/;
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
 assert.deepEqual(r.strengthExtension.knownLimitations.map(x=>x.id),['NO_ANTI_LATERAL_FLEXION_ROW','TRUNK_ROW_LEFT_OUT_UNDER_A_TIGHT_SESSION_TIME']);assert.match(r.strengthExtension.knownLimitations[0].detail,/not claimed to be equivalent/);
 assert.match(r.strengthExtension.knownLimitations[1].detail,/fewer trunk rows/);assert.match(r.strengthExtension.knownLimitations[1].detail,/No dose is changed/);
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
  if(['BW','BANDS','BANDS_PULLUP','PULLUP'].includes(profile.eq))assert.ok(same,`${profile.name}: no external upper option`);
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
test('SQ-4 c4 admissibility is unchanged: no vertical push at LOW skill, a pulldown for a novice past movement practice; a HIGH vertical lift needs familiarity', ()=>{
 for(const profile of PROFILES.filter(p=>['NONE','NOVICE'].includes(p.experience)))assert.ok(!idsOf(plan(profile,'PLANE')).some(id=>planeOf(id)==='VERTICAL_PUSH'),profile.name);
 // A novice who names an exercise is past movement practice (strength class FAMILIAR_UNKNOWN_LOAD): the second pull slot takes the pulldown the
 // equipment allows, and the push slots stay horizontal.
 const novice=eq=>S.generateProgram(lifter({experience:'NOVICE',equipment:EQUIPMENT[eq],known:[familiar('glute-bridge')]}),only('PLANE')).program;
 for(const [eq,id] of [['MACHINES','lat-pulldown'],['MACH_DB','lat-pulldown'],['FULL','lat-pulldown'],['BANDS','band-pulldown']]){const p=novice(eq);assert.equal(p.capability.strength.class,'FAMILIAR_UNKNOWN_LOAD');assert.equal(mainsOf(p)['FULL_B:1'],id,eq);assert.ok(!idsOf(p).some(x=>planeOf(x)==='VERTICAL_PUSH'),eq);}
 for(const profile of PROFILES)assert.ok(!idsOf(plan(profile,'PLANE')).some(id=>['barbell-overhead-press','pull-up','chin-up'].includes(id)),profile.name);
 const p=S.generateProgram(lifter({experience:'EXPERIENCED',equipment:EQUIPMENT.BAR,known:[familiar('bench-press'),familiar('barbell-overhead-press')]}),only('PLANE')).program;
 assert.equal(mainsOf(p)['FULL_B:2'],'barbell-overhead-press');
});
test('SQ-4 c4 practice rows are unchanged', ()=>{
 for(const profile of PROFILES.filter(p=>p.experience==='NONE')){const a=plan(profile,'OFF'),b=plan(profile,'PLANE');
  for(let w=0;w<a.weeks.length;w++)assert.equal(hash(rowsOf(b,w).filter(x=>x.e.role==='PRACTICE').map(x=>[x.s.id,x.e])),hash(rowsOf(a,w).filter(x=>x.e.role==='PRACTICE').map(x=>[x.s.id,x.e])),`${profile.name} week ${w}`);}
});
test('SQ-4 (SSCTR-STR-A-04a) a new plan that opens with movement practice (strength class NONE) asks nothing of the plane rule: it is the plan without the rule', ()=>{
 let n=0;
 for(const profile of PROFILES.filter(p=>['NONE','NOVICE'].includes(p.experience))){const a=plan(profile,'OFF'),b=plan(profile,'PLANE');n++;
  assert.equal(a.capability.strength.class,'NONE',profile.name);
  assert.equal(hash(b.templates),hash(a.templates),profile.name);assert.equal(hash(b.noviceTemplates??null),hash(a.noviceTemplates??null),profile.name);assert.equal(hash(b.weeks),hash(a.weeks),profile.name);
  assert.ok(!templatesOf(b).some(t=>t.rows.some(r=>r.planeAlternation)),profile.name);}
 assert.ok(n>100);
});
test('SQ-4 c9 the sweep: vertical pull where machines or bands give an equal-or-better loaded option, vertical push for intermediate and experienced dumbbell profiles, dumbbell-only pull unchanged', ()=>{
 for(const profile of PROFILES.filter(p=>['INTERMEDIATE','EXPERIENCED'].includes(p.experience))){
  const p=plan(profile,'PLANE'),planes=planesOf(p),label=profile.name;
  if(['FULL','MACH_DB','MACHINES','BANDS','BANDS_PULLUP'].includes(profile.eq))assert.ok(planes.includes('VERTICAL_PULL'),label);
  if(['FULL','MACH_DB','DB_BENCH','DB','DB_BANDS'].includes(profile.eq))assert.ok(planes.includes('VERTICAL_PUSH'),label);
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

// ---------- the corrective cycle (SSCTR-STR-A-01, A-02, A-06) ----------
test('SQ-4 c6 (SSCTR-STR-A-01) the plane rule gives no MAIN row another row\'s dose: an asking slot never takes a configuration an earlier session holds in another role, and no loaded MAIN leaves its goal range that stays inside it without the rule', ()=>{
 const DOSES=JSON.parse(fs.readFileSync(new URL('../r6/PROGRAM_POLICY_R6.json',import.meta.url),'utf8')).operational.strength.goalDoses;
 const NAMED={none:[],barbell:['back-squat','bench-press','deadlift','barbell-overhead-press','barbell-row'].map(familiar),press:[familiar('db-overhead-press')],pulldown:[familiar('lat-pulldown')]};
 /** The configurations of a plan with an externally loaded MAIN row outside the goal's repetition range in some week. */
 const outside=(p,goal)=>{const out=new Set(),[lo,hi]=DOSES[goal].repRange;for(let w=0;w<p.weeks.length;w++)for(const {e} of rowsOf(p,w))if(e.role==='MAIN'&&loadingOf(e.id)==='EXTERNAL'&&(e.reps<lo||e.reps>hi))out.add(e.id);return out;};
 let plans=0,asking=0,control=0;
 for(const goal of ['STRENGTH','HYPERTROPHY'])for(const eq of ['FULL','MACHINES','MACH_DB','DB','DB_BANDS','BAR'])for(const days of [[1,3,5],[0,2,4,6],[0,1,2,4,6]])for(const experience of ['INTERMEDIATE','EXPERIENCED'])for(const [name,known] of Object.entries(NAMED)){
  const intake=lifter({goal,experience,equipment:EQUIPMENT[eq],days,known}),off=S.generateProgram(intake,OFF).program,was=outside(off,goal),label=`${goal} ${eq} ${days.length}d ${experience} named=${name}`;plans++;control+=was.size;
  for(const auth of ['PLANE','DEV']){
   const p=S.generateProgram(intake,AUTH[auth]).program,rows=p.templates.flatMap(t=>t.rows.map(r=>({t,r})));
   for(const id of outside(p,goal))assert.ok(was.has(id),`${label} under ${auth}: ${id} is prescribed outside ${DOSES[goal].repRange} as a MAIN row, and is not without the rule`);
   for(const {t,r} of rows.filter(x=>x.r.planeAlternation)){asking++;
    const before=off.templates.find(x=>x.type===t.type).rows.find(x=>x.slot===r.slot)?.entry.id;if(r.entry.id===before)continue;
    assert.ok(!rows.some(x=>x.r.entry.id===r.entry.id&&x.r.role!=='MAIN'),`${label} under ${auth}: ${r.entry.id} is the MAIN of ${t.type} and an accessory elsewhere`);}
  }
 }
 assert.equal(plans,288);assert.ok(asking>500);
 assert.ok(control>0,'the control: the frozen engine already prescribes such rows for other configurations (pre-existing, SSCTR-STR-A-11); they are not added to');
 // The case the judge named: a strength athlete with a barbell set and named barbell lifts, three days.
 const p=S.generateProgram(lifter({goal:'STRENGTH',experience:'EXPERIENCED',equipment:EQUIPMENT.BAR,days:[1,3,5],known:NAMED.barbell}),only('PLANE')).program,press=p.templates.flatMap(t=>t.rows).filter(r=>r.entry.id==='barbell-overhead-press');
 assert.ok(press.length>0&&new Set(press.map(r=>r.role)).size===1,JSON.stringify(press.map(r=>r.role)));
});
test('SSCTR-STR-A-02 a change of the rules never stands before the clinical answer: for a plan built under other rules, a warning sign, pain with an exercise and a hold on the record are answered as the entry point below answers them', ()=>{
 const intake=lifter({experience:'INTERMEDIATE'}),foreign={...DEV,strengthExtension:{...devStrength(),sha256:'f'.repeat(64)}};
 const sign=(day,flag)=>({status:'NONCLINICAL_CONFIRMED',assessedAt:day,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false,[flag]:true});
 for(const [name,opts] of [['no rule on',OFF],['the hold rule alone',only('HOLD')],['other bytes',foreign],['the exposure alone',only('EXPOSURE')]]){
  const t=timeline(intake);t.week(0);
  const answers=rv=>({mine:S.evaluateProgram(t.p,rv,opts),below:P.evaluateProgram(t.p,rv,opts)});
  // Each warning sign of the eligibility screen, fresh in this review.
  for(const flag of ['pain','persistentPain','injury','illness','functionalLimitation','clinicalConcern']){
   const {mine,below}=answers(t.review(1,0,'WEEKLY_REVIEW',{eligibility:sign(t.day(1,0),flag)},'06:00'));
   assert.equal(below.status,'CLINICAL_HUMAN_REQUIRED',`${name}, ${flag}: the control`);assert.equal(mine.status,'CLINICAL_HUMAN_REQUIRED',`${name}, ${flag}`);assert.equal(mine.proposal??null,null);
   assert.equal(hash(without(mine,MINE)),hash(below),`${name}, ${flag}: the answer of the entry point below, as it is`);assert.equal(mine.strengthExtension.status,'PLAN_BUILT_UNDER_OTHER_RULES');assert.notEqual(mine.strengthExposure.status,'ACTIVE');
  }
  // Pain with an exercise.
  const target=rowsOf(t.p,1).find(x=>x.e.role==='MAIN').e.id,pain=answers(t.review(1,0,'EXERCISE_SUBSTITUTION',{substitution:{exerciseId:target,reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',pain:true}},'06:00'));
  assert.equal(pain.mine.status,'CLINICAL_HUMAN_REQUIRED',name);assert.equal(pain.mine.proposal??null,null);assert.equal(hash(without(pain.mine,MINE)),hash(pain.below));
  // Everything else is still refused: no plan is adapted under rules it was not built under.
  for(const [kind,extra] of [['WEEKLY_REVIEW',{observations:t.p.weeks[1].sessions.filter(live).map(s=>report(t.p,s))}],['SYSTEMIC_FATIGUE',{}],['EXERCISE_SUBSTITUTION',{substitution:{exerciseId:target,reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}}]]){
   const r=S.evaluateProgram(t.p,t.review(1,6,kind,extra),opts);assert.equal(r.status,'UNSUPPORTED',`${name}, ${kind}`);assert.equal(r.proposal??null,null);}
  // A hold already on the record answers first as well.
  const held=t.step(1,0,'WEEKLY_REVIEW',{eligibility:sign(t.day(1,0),'injury')},'06:00');assert.equal(held.status,'CLINICAL_HUMAN_REQUIRED');
  const later=answers(t.review(1,6,'WEEKLY_REVIEW',{observations:[]}));
  assert.equal(later.mine.status,'CLINICAL_HUMAN_REQUIRED',name);assert.equal(later.mine.proposal??null,null);assert.equal(hash(without(later.mine,MINE)),hash(later.below));
 }
});
test('SQ-2 c8 (SSCTR-STR-A-06) the joint order on four strength days: the first upper session loaded and horizontal, the second vertical', ()=>{
 const p=S.generateProgram(hybrid({equipment:FULL,days:[0,2,4,6],months:24}),DEV).program,m=mainsOf(p);
 assert.deepEqual([m['UPPER:0'],m['UPPER:1'],m['UPPER_B:0'],m['UPPER_B:1']],['db-bench-press','db-row','lat-pulldown','db-overhead-press']);
 for(const id of [m['UPPER:0'],m['UPPER:1'],m['UPPER_B:0'],m['UPPER_B:1']]){assert.equal(loadingOf(id),'EXTERNAL');assert.notEqual(skillOf(id),'HIGH');}
 const off=mainsOf(S.generateProgram(hybrid({equipment:FULL,days:[0,2,4,6],months:24}),OFF).program);
 assert.deepEqual(Object.keys(m).filter(k=>configurationOf(m[k]).region!=='UPPER').map(k=>m[k]),Object.keys(off).filter(k=>configurationOf(off[k]).region!=='UPPER').map(k=>off[k]),'the lower-body MAIN rows are as without the rules');
});
// ---------- the focused fix-forward of the plane rule (SSCTR-STR-B-01 = QRE-STR-B-01): in a plan in force the rule only keeps ----------
const GOAL_DOSES=JSON.parse(fs.readFileSync(new URL('../r6/PROGRAM_POLICY_R6.json',import.meta.url),'utf8')).operational.strength.goalDoses;
const NAMED_BARBELL=['back-squat','bench-press','deadlift','barbell-overhead-press','barbell-row'].map(familiar),STRENGTH_DAYS={1:[3],2:[1,4],3:[1,3,5],4:[0,2,4,6],5:[0,1,2,4,6]};
const NO_PLANE=only('HOLD','UPPER');
const changeDays=(t,w,days)=>t.step(w,0,'SCHEDULE_CHANGE',{changes:{strengthDays:STRENGTH_DAYS[days]}},'06:00');
/** The roles in which the templates of a plan hold each configuration. */
const rolesOf=p=>{const m=new Map();for(const t of templatesOf(p))for(const r of t.rows)m.set(r.entry.id,(m.get(r.entry.id)??new Set()).add(r.role));return m;};
/** The configurations with an externally loaded MAIN row outside the goal's repetition range, in the weeks from `from` on. */
const outsideFrom=(p,goal,from)=>{const out=new Set(),[lo,hi]=GOAL_DOSES[goal].repRange;for(let w=from;w<p.weeks.length;w++)for(const {e} of rowsOf(p,w))if(e.role==='MAIN'&&loadingOf(e.id)==='EXTERNAL'&&(e.reps<lo||e.reps>hi))out.add(e.id);return out;};
/** What a plan holds: the slots that ask, and its selection and every prescribed row. */
const held=p=>({asking:templatesOf(p).flatMap(t=>t.rows).filter(r=>r.planeAlternation).length,hash:hash([p.templates,p.noviceTemplates??null,p.weeks.map((_,w)=>rowsOf(p,w).map(x=>[x.s.id,x.e]))])});
test('SQ-4 c5 (SSCTR-STR-B-01, criterion 1) a plan in force is never given an asking slot it was not built with: a plan built with none is, through a change of strength days, the plan without the plane rule', ()=>{
 let n=0;
 const sixty=['NONE','NOVICE'].flatMap(experience=>['MACHINES','FULL'].flatMap(eq=>['GENERAL','STRENGTH'].flatMap(goal=>[[3,2],[5,2],[4,3]].map(([a,b])=>({experience,eq,goal,a,b,minutes:60})))));
 // And under a tight session time, where the time fit decides which rows a session keeps.
 for(const {experience,eq,goal,a,b,minutes} of [...sixty,{experience:'NONE',eq:'MACHINES',goal:'STRENGTH',a:5,b:2,minutes:30},{experience:'NOVICE',eq:'FULL',goal:'GENERAL',a:4,b:3,minutes:45}]){
  const label=`${experience} ${eq} ${goal} ${a} to ${b} days, ${minutes} min`;
  const run=opts=>{const t=timeline(lifter({experience,goal,equipment:EQUIPMENT[eq],days:STRENGTH_DAYS[a],minutes}),{opts});assert.equal(held(t.p).asking,0,label+': built with no asking slot');t.weeks(0,1);
   assert.equal(changeDays(t,2,b).status,'MODIFY',label);const changed=held(t.p);t.week(2);return {t,changed};};
  const on=run(DEV),off=run(NO_PLANE);n++;
  for(const [when,x,y] of [['at the change',on.changed,off.changed],['a review later',held(on.t.p),held(off.t.p)]]){assert.equal(x.asking,0,`${label}, ${when}: a slot asks`);assert.equal(x.hash,y.hash,`${label}, ${when}: not the plan without the plane rule`);}
  assert.deepEqual(slotsInForce(on.t.p),{},label);
 }
 assert.equal(n,26);
});
test('SQ-4 c5, c6 (SSCTR-STR-B-01, criteria 2 and 3; QRE-STR-B-01) after a change of strength days an asking slot is one the plan was built with, no MAIN row is given by the rule a configuration the plan held only in another role, and no loaded MAIN leaves its goal range that stays inside it without the rule', ()=>{
 // Strength, hypertrophy, general and running-support plans; named barbell lifts; a novice past movement practice; a hybrid race plan.
 const of=(goal,eq,experience,known=[])=>[goal,eq,days=>lifter({goal,experience,equipment:EQUIPMENT[eq],days,known})];
 const CASES=[of('STRENGTH','FULL','INTERMEDIATE',NAMED_BARBELL),of('STRENGTH','BAR','EXPERIENCED',NAMED_BARBELL),of('STRENGTH','MACHINES','INTERMEDIATE'),of('HYPERTROPHY','MACHINES','INTERMEDIATE'),of('HYPERTROPHY','BANDS','INTERMEDIATE'),of('GENERAL','FULL','INTERMEDIATE'),
  of('GENERAL','MACH_DB','NOVICE',[familiar('goblet-squat')]),['RUNNING_SUPPORT','DB_BANDS',days=>hybrid({equipment:EQUIPMENT.DB_BANDS,days})]];
 let changes=0,kept=0,dropped=0;const mains={};
 for(const [goal,eq,intake] of CASES)for(const [a,b] of [[4,2],[5,2],[4,3],[3,4],[2,4],[2,3],[3,2]]){
  const label=`${goal} ${eq} ${a} to ${b} days`,res={};
  for(const [k,opts] of [['on',DEV],['noPlane',NO_PLANE]]){
   const t=timeline(intake(STRENGTH_DAYS[a]),{opts});t.week(0);
   const built=slotsInForce(t.p),before=rolesOf(t.p);assert.equal(changeDays(t,1,b).status,'MODIFY',label);
   res[k]={t,built,before,mains:upperMains(t.p),out:outsideFrom(t.p,goal,1)};
  }
  changes++;mains[label]=mainsOf(res.on.t.p);
  const {t,built,before}=res.on,after=slotsInForce(t.p),sameTemplate=a<=3&&b<=3;
  assert.ok(Object.keys(built).length>0,label+': the control, the plan was built with asking slots');
  // The slots that ask after the change: the ones the plan was built with where their template is still in the week (two and three days share
  // FULL_B), each on the configuration it was built with; none where the templates changed.
  if(sameTemplate){assert.deepEqual(after,built,label);for(const m of res.on.mains.filter(m=>m.row.planeAlternation)){assert.equal(m.id,built[m.type+':'+m.slot],label);kept++;}}
  else{assert.deepEqual(after,{},label+': a slot asks that the plan was not built with');dropped++;}
  // A MAIN row on a configuration the plan held before only in another role: never an asking slot (the SSCTR measure), and never one the same
  // slot does not hold without the plane rule (the QRE measure).
  for(const m of res.on.mains){const was=before.get(m.id);if(!was||was.has('MAIN'))continue;
   assert.ok(!m.row.planeAlternation,`${label}: the asking slot ${m.type}:${m.slot} took ${m.id}, held before as ${[...was]}`);
   assert.equal(res.noPlane.mains.find(x=>x.type===m.type&&x.slot===m.slot)?.id,m.id,`${label}: ${m.type}:${m.slot} took ${m.id}, held before as ${[...was]}, and does not without the plane rule`);}
  for(const id of res.on.out)assert.ok(res.noPlane.out.has(id),`${label}: ${id} is a MAIN row outside ${GOAL_DOSES[goal].repRange} after the change, and is not without the plane rule`);
 }
 assert.equal(changes,56);assert.equal(kept,32);assert.equal(dropped,40);
 // The cases the judges traced: each slot is the one the plan has without the plane rule.
 assert.equal(mains['STRENGTH FULL 4 to 2 days']['FULL_B:2'],'bench-press');assert.equal(mains['STRENGTH BAR 5 to 2 days']['FULL_B:2'],'bench-press');
 assert.equal(mains['HYPERTROPHY MACHINES 4 to 2 days']['FULL_B:1'],'seated-cable-row');assert.equal(mains['STRENGTH MACHINES 4 to 2 days']['FULL_B:1'],'seated-cable-row');
 assert.equal(mains['HYPERTROPHY BANDS 4 to 2 days']['FULL_B:2'],'push-up');
 // One day to two: the plan was built with no asking slot and is given none; the new second slots bring no vertical lift in.
 const t=timeline(lifter({experience:'INTERMEDIATE',equipment:FULL,days:STRENGTH_DAYS[1]}));t.weeks(0,1);const before=new Set(idsOf(t.p));
 assert.equal(changeDays(t,2,2).status,'MODIFY');assert.deepEqual(slotsInForce(t.p),{});
 const upper=Object.values(mainsOf(t.p)).filter(id=>configurationOf(id).region==='UPPER');assert.equal(upper.length,4);
 assert.ok(upper.every(id=>before.has(id)&&!/^VERTICAL_/.test(planeOf(id))),JSON.stringify(upper));
});
test('SQ-4 c5, c6 what does not change the templates of a plan in force leaves its asking slots as built: the same number of strength days on other weekdays, a substitution for skill, a change of days in the taper', ()=>{
 // The same number of days on other weekdays: the sessions are rearranged, every slot and every anchor stays.
 for(const [days,other] of [[[1,4],[2,5]],[[0,2,4,6],[0,1,3,5]]]){
  const t=timeline(lifter({experience:'INTERMEDIATE',equipment:FULL,days}));t.weeks(0,1);const start=slots(t.p),built=slotsInForce(t.p);assert.equal(Object.keys(built).length,2);
  assert.equal(t.step(2,0,'SCHEDULE_CHANGE',{changes:{strengthDays:other}},'06:00').status,'MODIFY');assert.deepEqual(slots(t.p),start,`${days} to ${other}`);assert.deepEqual(slotsInForce(t.p),built);
 }
 // A substitution for skill of the vertical MAIN: the athlete's decision takes the slot, with its reason; the anchor and every other slot stay.
 const v=timeline(lifter({experience:'INTERMEDIATE',equipment:FULL}));v.weeks(0,1);const start=slots(v.p),built=slotsInForce(v.p);
 const sub=v.step(2,0,'EXERCISE_SUBSTITUTION',{substitution:{exerciseId:'db-overhead-press',reason:'SKILL_MISMATCH',nonclinicalConfirmed:true}},'06:00'),to=sub.substitutions[0].selected;
 assert.equal(sub.status,'MODIFY');assert.notEqual(skillOf(to),'HIGH');
 const check=()=>{const now=slots(v.p),row=v.p.templates.flatMap(x=>x.rows).find(r=>r.planeAlternation?.asks==='VERTICAL_PUSH');
  assert.deepEqual(Object.keys(start).filter(k=>start[k]!==now[k]),['FULL_B:2']);assert.equal(row.entry.id,to);assert.equal(row.directive.reason,'SKILL_MISMATCH');assert.deepEqual(slotsInForce(v.p),built);};
 check();v.weeks(2,3);check();
 // A change of days inside the taper of a race plan: where the template of the asking slots stays (two to three days) they stay as built, where
 // it does not (two to four) no slot asks, and in neither case is an exercise new in the taper, the race week or the week after.
 for(const [days,keeps] of [[3,true],[4,false]]){
  const t=timeline(hybrid({equipment:FULL,weeks:8})),phases=t.p.phases.phases,taper=phases.indexOf('TAPER'),anchors=slotsInForce(t.p);assert.ok(taper>0);assert.equal(Object.keys(anchors).length,2);
  t.weeks(0,taper-1);const earlier=new Set(idsOf({weeks:t.p.weeks.slice(0,taper)}));
  assert.equal(changeDays(t,taper,days).status,'MODIFY');assert.deepEqual(slotsInForce(t.p),keeps?anchors:{},`two to ${days} days in the taper`);
  for(let w=taper;w<phases.length;w++)for(const {e} of rowsOf(t.p,w))assert.ok(earlier.has(e.id),`${e.id} is new in ${phases[w]}`);
 }
});
test('SQ-4 c5 (SSCTR-STR-B-01, criterion 2) in a plan in force a slot with no anchor is selected as if the plane rule were absent, whatever the plan already uses; an anchored slot whose own configuration does not fit takes the ordinary order and keeps its anchor', ()=>{
 const goal={strength:{kind:'STRENGTH'}},uses=['bench-press','barbell-row','barbell-overhead-press','db-row','lat-pulldown','db-overhead-press','pike-push-up','band-assisted-pull-up'];
 const auth=rules=>repertoireAuthority({[STRENGTH_RULES]:rules}),absent=auth(strengthRules(devStrength([B.HOLD,B.UPPER]))),under=inForce=>auth(strengthRules(devStrength(),{inForce}));
 const build=(a,types,equipment=FULL)=>buildTemplates({types,equipment,experience:'INTERMEDIATE',knownExercises:NAMED_BARBELL,established:uses,goal,auth:a});
 const SETS=[['FULL_A','FULL_B'],['LOWER','UPPER','FULL_B'],['LOWER','UPPER','LOWER_B','UPPER_B']],asking=ts=>ts.flatMap(t=>t.rows.filter(r=>r.planeAlternation).map(r=>t.type+':'+r.slot));
 // The control: a new plan of each set asks twice, so what follows is not vacuous.
 for(const types of SETS)assert.equal(asking(build(auth(strengthRules(devStrength())),types)).length,2,types.join());
 // No anchor at all (a plan built with no asking slot) and the anchors of another week (the days changed): the selection without the plane rule.
 for(const types of SETS)for(const inForce of [{},{'UPPER_B:0':'lat-pulldown','UPPER_B:1':'db-overhead-press'},{'FULL_B:1':'lat-pulldown','FULL_B:2':'db-overhead-press'}]){
  const got=build(under(inForce),types),keys=asking(got),label=`${types.join()} with the anchors ${JSON.stringify(inForce)}`;
  assert.deepEqual(keys,Object.keys(inForce).filter(k=>types.includes(k.split(':')[0])),label);
  if(!keys.length)assert.equal(hash(got),hash(build(absent,types)),label+': not the selection without the plane rule');
  else for(const t of got)for(const r of t.rows.filter(r=>r.planeAlternation)){assert.equal(r.entry.id,inForce[t.type+':'+r.slot],label);assert.equal(r.planeAlternation.built,r.entry.id,label);}
 }
 // An anchored slot whose own configuration does not fit (the dumbbells and the machines went): what the slot takes without the plane rule,
 // never the vertical lift the plan uses in another row; the anchor is still the configuration the plan was built with.
 const anchors={'FULL_B:1':'lat-pulldown','FULL_B:2':'db-overhead-press'},lost=build(under(anchors),['FULL_A','FULL_B'],EQUIPMENT.BAR),plain=build(absent,['FULL_A','FULL_B'],EQUIPMENT.BAR);
 const row=(ts,key)=>ts.find(t=>t.type===key.split(':')[0]).rows.find(r=>r.slot===Number(key.split(':')[1]));
 for(const key of Object.keys(anchors)){assert.equal(row(lost,key).entry.id,row(plain,key).entry.id,key);assert.equal(row(lost,key).planeAlternation.built,anchors[key],key);}
 assert.equal(row(lost,'FULL_B:2').entry.id,'bench-press','the familiar overhead press the plan uses is not moved into the MAIN row');
});

// ---------- the corrective cycle (QRE-STR-A-01, A-02, A-08) ----------
test('SQ-4 c5 (QRE-STR-A-01) the slot a plan was built with is its anchor through a loss and a regain of equipment: what stands in meanwhile never becomes the anchor, and no vertical exercise new to the plan is brought in', ()=>{
 const change=(t,w,d,equipment)=>t.step(w,d,'EQUIPMENT_CHANGE',{changes:{equipment}},'06:00');
 const asking=p=>Object.fromEntries(p.templates.flatMap(x=>x.rows.filter(r=>r.planeAlternation).map(r=>[x.type+':'+r.slot,r])));
 for(const [name,meanwhile,stoodIn] of [['bands only',EQUIPMENT.BANDS,{'FULL_B:1':'band-row','FULL_B:2':'push-up'}],['no equipment',EQUIPMENT.BW,{'FULL_B:2':'push-up'}],['machines only',EQUIPMENT.MACHINES,{'FULL_B:1':'lat-pulldown','FULL_B:2':'machine-chest-press'}]]){
  const t=timeline(lifter({experience:'INTERMEDIATE',equipment:FULL})),built=slotsInForce(t.p),start=slots(t.p);
  assert.deepEqual(built,{'FULL_B:1':'lat-pulldown','FULL_B:2':'db-overhead-press'},name);t.weeks(0,1);
  const used=new Set(idsOf(t.p));
  assert.ok(['MODIFY','KEEP'].includes(change(t,2,0,meanwhile).status),name);
  // While the equipment is gone: the slot takes what the ordinary order gives it. The plane is not preferred for an exercise the plan never used.
  for(const [key,id] of Object.entries(stoodIn))assert.equal(asking(t.p)[key]?.entry.id,id,`${name}: ${key} meanwhile`);
  for(const r of Object.values(asking(t.p)))if(r.entry.id!==r.planeAlternation.built)assert.ok(!/^VERTICAL_/.test(r.entry.subpattern)||used.has(r.entry.id),`${name}: ${r.entry.id} is a vertical exercise new to the plan`);
  assert.deepEqual(slotsInForce(t.p),built,`${name}: the anchor is still the configuration the plan was built with`);
  t.week(2);assert.deepEqual(slotsInForce(t.p),built,name);
  // The equipment is back: every slot is the one the plan was built with.
  assert.ok(['MODIFY','KEEP'].includes(change(t,3,0,FULL).status),name);
  assert.deepEqual(slots(t.p),start,`${name}: after the regain`);assert.deepEqual(slotsInForce(t.p),built,name);
  t.weeks(3,4);assert.deepEqual(slots(t.p),start,name);
 }
});
test('SQ-1 c3 (QRE-STR-A-02) a trunk slot left unfilled after an athlete set a trunk exercise aside is declared in the answer, never left silent', ()=>{
 const intake=lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.BW,days:[0,1,2,4,6]}),aside={substitution:{exerciseId:'dead-bug',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}};
 const t=timeline(intake);assert.equal(t.g.strengthExtension.disclosures,undefined,'the plan as built has every trunk slot filled');
 const trunk=p=>p.templates.find(x=>x.type==='CORE').rows.filter(r=>r.pattern==='TRUNK').length;assert.equal(trunk(t.p),2);t.week(0);
 const r=t.step(1,0,'EXERCISE_SUBSTITUTION',aside,'06:00');assert.equal(r.status,'MODIFY');
 assert.equal(trunk(t.p),1,'bodyweight only, dead-bug set aside, the holds out: one trunk configuration is left for two slots');
 assert.deepEqual(r.strengthExtension.disclosures.map(d=>[d.id,d.pattern,d.templates,d.blocking]),[['TRUNK_SLOT_UNFILLED','TRUNK',['CORE'],false]]);assert.match(r.strengthExtension.disclosures[0].detail,/nothing is claimed equivalent/);
 assert.ok(!idsOf(t.p).some(id=>HOLDS.includes(id)));
 // It stays declared while it stands, and no answer of a plan with every trunk slot filled carries it.
 assert.equal(t.week(1).strengthExtension.disclosures?.[0]?.id,'TRUNK_SLOT_UNFILLED');
 const u=timeline(intake,{opts:OFF});u.week(0);u.step(1,0,'EXERCISE_SUBSTITUTION',aside,'06:00');assert.equal(trunk(u.p),2,'the control: without the rule a plank fills the slot');
 for(const profile of PROFILES.filter((_,i)=>i%7===0))assert.ok(!plan(profile,'DEV').templates.some(x=>x.missingPatterns.includes('TRUNK')),profile.name);
});
test('the known limitations are stated for a plan built under the hold rule, and for no other plan', ()=>{
 const intake=lifter({experience:'INTERMEDIATE'}),review=t=>t.review(0,6,'WEEKLY_REVIEW',{observations:t.p.weeks[0].sessions.filter(live).map(s=>report(t.p,s))});
 const under=timeline(intake),without=timeline(intake,{opts:OFF});
 assert.equal(S.evaluateProgram(under.p,review(under),DEV).strengthExtension.knownLimitations.length,2);
 assert.equal(S.evaluateProgram(without.p,review(without),DEV).strengthExtension.knownLimitations,undefined,'a plan built without the rules');
 assert.equal(S.evaluateProgram(under.p,review(under),only('HOLD')).strengthExtension.knownLimitations,undefined,'a plan built under other rules');
});
test('a plan that opens with movement practice: an equipment gain changes exactly the slots it changes without the rules, in both of its template sets, and no MAIN row', ()=>{
 const run=opts=>{const t=timeline(lifter({experience:'NONE',equipment:EQUIPMENT.MACHINES,days:[0,1,2,4,6]}),{opts});assert.ok(t.p.noviceTemplates?.length);
  const start=slots(t.p),mains=mainsOf(t.p);t.weeks(0,1);
  assert.ok(['KEEP','MODIFY'].includes(t.step(2,0,'EQUIPMENT_CHANGE',{changes:{equipment:[...EQUIPMENT.MACHINES,'DUMBBELLS','BANDS']}},'06:00').status));
  const after=slots(t.p),moved=Object.fromEntries(Object.keys(start).filter(k=>start[k]!==after[k]).map(k=>[k,[start[k],after[k]]]));
  assert.deepEqual(mainsOf(t.p),mains);t.weeks(2,5);assert.deepEqual(slots(t.p),after);assert.deepEqual(mainsOf(t.p),mains);
  return {t,moved};};
 const off=run(OFF),on=run(only('UPPER','PLANE'));
 // The frozen engine re-picks two accessory slots that are not yet in use; the upper-body rules add nothing to that and take nothing from it.
 assert.deepEqual(on.moved,off.moved);assert.ok(Object.keys(off.moved).length>0);
 assert.ok(!idsOf(on.t.p).some(id=>planeOf(id)==='VERTICAL_PUSH'));
 assert.ok(!idsOf(run(DEV).t.p).some(id=>HOLDS.includes(id)));
});
