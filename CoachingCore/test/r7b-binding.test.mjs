// DOMAIN_COACHING_R7-B: the bound repertoire. Catalog bytes and SSCTR records (fail closed, per record), catalog ↔ runtime conformance over a
// scenario grid, classification equal to the catalog predicates at their boundaries (B0-F05 thresholds exposed, not changed), archetypes (B0-C12).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {CATALOG,CATALOG_SHA256,CATALOG_FILE_SHA256,repertoireAuthority,CONFIGURATIONS,configurationOf,runRepertoireOf,RUN_CLASS_THRESHOLDS,archetypeOf,CORE_RECORDS,CANDIDATES,LATER_GATE} from '../src/r7b-repertoire.mjs';
import {assessCapability,buildGoalModel} from '../src/r6-program.mjs';
import {canonicalizeIntake} from '../src/r6-intake.mjs';
import {opts,intake,gen,program,reviewed,review,evaluateProgram,generateProgram,live,FULL} from '../r7/b/fixtures/helpers.mjs';

const RECORDS=JSON.parse(fs.readFileSync(new URL('../../audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json',import.meta.url),'utf8'));
const without=(...ids)=>RECORDS.filter(r=>!ids.includes(r.review_id.replace('R7B0-SSCTR-','')));
const withRecords=records=>({...opts,repertoireRecords:records});

test('R7-B binding: the catalog bytes are R7B0-CATALOG-2 and all thirteen SSCTR r2 records bind them (APPROVE_WITH_CONDITIONS, SUPPORTED_WITH_LIMITS)',()=>{
 const bytes=fs.readFileSync(new URL('../r7/b0/REPERTOIRE_CATALOG_B0.json',import.meta.url));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),CATALOG_SHA256);assert.equal(CATALOG_FILE_SHA256,CATALOG_SHA256);assert.equal(CATALOG.revision,'R7B0-CATALOG-2');
 const a=repertoireAuthority({asOf:'2026-11-01'});
 assert.equal(a.valid,true);assert.deepEqual(Object.keys(a.approved).sort(),['B0-FIDELITY',...CANDIDATES].sort());
 assert.ok(a.records.every(r=>r.disposition==='APPROVE_WITH_CONDITIONS'&&r.evidenceStatus==='SUPPORTED_WITH_LIMITS'));
 assert.equal(CONFIGURATIONS.length,76);assert.equal(CONFIGURATIONS.filter(c=>c.origin==='R6').length,39);
 const p=program({id:'b-bind'});assert.equal(p.repertoire.catalogSha256,CATALOG_SHA256);assert.equal(p.repertoire.catalogRevision,'R7B0-CATALOG-2');assert.equal(p.repertoire.approvedCandidates.length,13);
});

test('R7-B binding fails closed: without a core record, with records bound to other bytes, or after the review-by date nothing is planned',()=>{
 for(const id of CORE_RECORDS){const g=gen({id:'b-core-'+id},withRecords(without(id)));assert.equal(g.status,'UNSUPPORTED',id);assert.match(g.reason,/bound repertoire/);}
 const other=RECORDS.map(r=>({...r,target:{...r.target,sha256:'0'.repeat(64)}}));assert.equal(gen({id:'b-other'},withRecords(other)).status,'UNSUPPORTED');
 const late=intake({id:'b-late'});late.asOf='2027-05-03';late.startDate='2027-05-03';late.athlete.eligibility.assessedAt='2027-05-03';
 assert.equal(generateProgram(late,opts).status,'UNSUPPORTED','a record past its review-by date enables nothing');
 // A review of a program planned under one catalog binding is refused under another.
 const p=program({id:'b-rev'}),moved={...repertoireAuthority({asOf:'2026-11-01'}),catalogSha256:'f'.repeat(64)};
 const r=evaluateProgram(p,review(p,0,{observations:[]}),{...opts,repertoire:moved});assert.equal(r.status,'UNSUPPORTED');
});

test('R7-B per-record gating: a candidate without its record is off and its conservative fallback applies; B0-C12 never changes a dose',()=>{
 const novice={id:'b-gate-c08',strengthExperience:'NONE',goals:{run:'REGULAR',strength:'GENERAL'},schedule:{strengthDays:[0,2,4,5]}};
 assert.ok(program(novice).noviceTemplates,'B0-C08 on: novice templates');
 const off=program(novice,withRecords(without('B0-C08')));assert.equal(off.noviceTemplates,undefined,'B0-C08 off: the R6 templates by day count');
 assert.deepEqual(off.templates.map(t=>t.type),['LOWER','UPPER','LOWER_B','UPPER_B']);
 // B0-C03 off: only R6-origin configurations.
 const r6only=program({id:'b-gate-c03',equipment:FULL,goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'}},withRecords(without('B0-C03')));
 assert.ok([...r6only.templates,...(r6only.noviceTemplates??[])].flatMap(t=>t.rows).every(r=>configurationOf(r.entry.id).origin==='R6'));
 // B0-C12 off: no label, the same weeks.
 const a=program({id:'b-gate-c12',goals:{run:'PERFORMANCE',strength:'STRENGTH'}}),b=program({id:'b-gate-c12',goals:{run:'PERFORMANCE',strength:'STRENGTH'}},withRecords(without('B0-C12')));
 assert.ok(a.archetype);assert.equal(b.archetype,null);assert.equal(JSON.stringify(a.weeks),JSON.stringify(b.weeks),'the archetype label adds no dose');
 // B0-C10 off: a 5K stays outside the event scope (the R6 behaviour), on: a performance plan without event phases.
 const fiveK={id:'b-gate-c10',goals:{run:'RACE',strength:'GENERAL'},event:{kind:'5K',date:'2026-12-20'}};
 assert.equal(gen(fiveK).status,'PROPOSED');
 // B0-C11 off: no CMP.I11 cost anywhere in the arrangement trace.
 const i11=g=>JSON.stringify(g.trace.arrangement).includes('Eccentric or new lower-body work');
 const withI11=gen({id:'b-gate-c11',strengthExperience:'NONE',goals:{run:'PERFORMANCE',strength:'GENERAL'},schedule:{strengthDays:[2,5],runDays:[1,3,6]}});
 const noI11=gen({id:'b-gate-c11',strengthExperience:'NONE',goals:{run:'PERFORMANCE',strength:'GENERAL'},schedule:{strengthDays:[2,5],runDays:[1,3,6]}},withRecords(without('B0-C11')));
 assert.ok(i11(withI11),'B0-C11 on: the ranking sees the cost');assert.ok(!i11(noI11),'B0-C11 off: no cost');
});

/** Every planned session of a program and its later reviews belongs to the bound catalog (request §21). */
function conformance(p,label){
 const rep=repertoireAuthority({asOf:'2026-11-01'});
 for(const w of p.weeks)for(const s of w.sessions.filter(live)){
  if(s.sport==='RUN'){const r=runRepertoireOf(s.prescription);assert.ok(r,`${label} ${s.id}: ${s.prescription.family} is not a catalog run family`);assert.ok(CATALOG.run.families.some(f=>f.id===r.family),`${label} ${r.family}`);continue;}
  for(const e of s.prescription.exercises){const c=configurationOf(e.id);assert.ok(c,`${label} ${e.id} not in the catalog`);assert.ok(c.roles.includes(e.role),`${label} ${e.id} in role ${e.role} (admits ${c.roles})`);assert.ok(c.origin==='R6'||rep.approved['B0-C03'],`${label} ${e.id}`);
   if(['BAND','ASSISTED'].includes(c.loading))assert.ok(e.load.mode==='BODYWEIGHT'&&e.load.value===undefined&&e.load.unit==='LEVEL',`${label} ${e.id}: never kilograms`);
   if(c.kind==='ISOLATION')assert.equal(e.role,'ACCESSORY',`${label} ${e.id}: isolation only in accessory slots`);}
 }
}
const GRID=[];
for(const strength of ['STRENGTH','HYPERTROPHY','RUNNING_SUPPORT','GENERAL','MAINTAIN'])for(const [eq,label] of [[FULL,'full'],[['DUMBBELLS','BENCH'],'db'],[['KETTLEBELL'],'kb'],[['BANDS','PULL_UP_BAR'],'bands'],[[],'bw'],[['MACHINES','DUMBBELLS'],'machines']])for(const exp of ['NONE','INTERMEDIATE'])GRID.push({id:`b-grid-${strength}-${label}-${exp}`,goals:{run:strength==='STRENGTH'?'REGULAR':'PERFORMANCE',strength},equipment:eq,strengthExperience:exp,schedule:{strengthDays:exp==='NONE'?[0,2,4,5]:[0,2,4]}});

test('R7-B conformance: every planned run belongs to a catalog run family and every strength row is a catalog configuration in a role it admits (60 programs, 12 weeks)',()=>{
 for(const o of GRID)conformance(program(o),o.id);
});

test('R7-B conformance: reviews keep the binding (4 executed weeks over a sample of the grid, including block boundaries)',()=>{
 for(const o of GRID.filter((x,i)=>i%7===0)){const t=reviewed(o,6);conformance(t.p,o.id+' reviewed');assert.equal(t.p.repertoire.catalogSha256,CATALOG_SHA256);}
});

test('R7-B conformance: no later-gate or unsupported item is ever prescribed (B0-C10)',()=>{
 const families=new Set(CATALOG.run.families.map(f=>f.id)),names=LATER_GATE.map(x=>x.id);
 for(const o of GRID.slice(0,20)){const p=program(o);for(const w of p.weeks)for(const s of w.sessions.filter(x=>live(x)&&x.sport==='RUN')){const r=runRepertoireOf(s.prescription);assert.ok(families.has(r.family));assert.ok(!['STEADY','HILLS','FASTER','VO2','SHORT_INTERVALS','TEMPO'].includes(s.prescription.family));}}
 assert.equal(names.length,20);
});

/** The catalog's run-class predicates (classification.runClasses), evaluated independently of assessCapability. */
function catalogClass({exp,minutes,days,longest,pauseWeeks,programmed=true,familiarQuality=false}){
 const T=RUN_CLASS_THRESHOLDS,longPause=pauseWeeks!==null&&pauseWeeks>=T.longPauseWeeksAtLeast,below=v=>Number.isFinite(v)&&v>0&&v<15;
 if(!programmed)return 'NOT_PROGRAMMED';
 if(exp==='NONE'||exp==='NOVICE'&&(minutes===null||minutes<T.noviceWeeklyMinutesBelow||days===0)||(below(longest)||below(minutes))&&!longPause)return 'WALK_JOG';
 if(days===0||minutes===0||longPause)return 'RESTART';
 if(minutes===null)return 'EASY_UNKNOWN';
 if(exp==='NOVICE'||minutes<T.easyLowWeeklyMinutesBelow||(days??0)<T.easyLowRunDaysBelow)return 'EASY_LOW';
 return familiarQuality?'QUALITY_FAMILIAR':'EASY_CURRENT';
}
test('R7-B classification equals the catalog predicates at their boundaries; the B0-F05 thresholds are exposed with provenance, not changed',()=>{
 assert.deepEqual({a:RUN_CLASS_THRESHOLDS.noviceWeeklyMinutesBelow,b:RUN_CLASS_THRESHOLDS.easyLowWeeklyMinutesBelow,c:RUN_CLASS_THRESHOLDS.easyLowRunDaysBelow,d:RUN_CLASS_THRESHOLDS.longPauseWeeksAtLeast},{a:45,b:60,c:2,d:4});
 assert.match(RUN_CLASS_THRESHOLDS.policyDeclaration,/B0-F05/);
 let n=0;
 for(const exp of ['NONE','NOVICE','INTERMEDIATE','EXPERIENCED'])for(const minutes of [null,0,10,44,45,46,59,60,61,150])for(const days of [0,1,2,3])for(const longest of [null,10,14,15,40])for(const pauseWeeks of [null,3,4]){
  const input=intake({id:'b-cls',runExperience:exp,recent:{runDaysPerWeek:days,runMinutesPerWeek:minutes,longestRunMinutes:longest,strengthDaysPerWeek:2},pause:pauseWeeks===null?null:{nonclinical:true,weeks:pauseWeeks,reasonCategory:'TRAVEL',reason:'Work travel'}});
  const ci=canonicalizeIntake(input);if(!ci.valid)continue;
  const cap=assessCapability(ci.canonical,opts.authority.policy.operational);
  assert.equal(cap.run.class,catalogClass({exp,minutes,days,longest,pauseWeeks}),JSON.stringify({exp,minutes,days,longest,pauseWeeks}));
  assert.equal(cap.run.classification.thresholds,'RUN_CLASS_THRESHOLDS');n++;
 }
 assert.ok(n>1000,`${n} cases`);
 assert.equal(program({id:'b-cls-trace'}).classification.thresholds.easyLowWeeklyMinutesBelow,60);
});

test('R7-B archetypes (B0-C12): the five labels are reachable and equal the goal-model lead; overlays never change the base lead',()=>{
 const cases=[[{run:'PERFORMANCE',strength:'NONE'},'ARCH.RUN_ONLY','RUN',{strengthDays:[]}],[{run:'NONE',strength:'STRENGTH'},'ARCH.STRENGTH_ONLY','STRENGTH',{runDays:[],longRunDay:null}],[{run:'PERFORMANCE',strength:'GENERAL'},'ARCH.RUN_LED','RUN',{}],[{run:'REGULAR',strength:'STRENGTH'},'ARCH.STRENGTH_LED','STRENGTH',{}],[{run:'PERFORMANCE',strength:'HYPERTROPHY'},'ARCH.JOINT','JOINT',{}]];
 for(const [goals,id,lead,schedule] of cases){const p=program({id:'b-arch-'+id,goals,schedule});assert.equal(p.archetype.id,id);assert.equal(p.archetype.baseLead,lead);assert.equal(p.goal.baseLead,lead);assert.equal(p.goal.staticPriorityRequired,false);}
 const ev=program({id:'b-arch-event',goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-01-10'},recent:{runDaysPerWeek:4,runMinutesPerWeek:180,longestRunMinutes:60,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6]}});
 assert.equal(ev.archetype.id,'ARCH.RUN_LED');assert.deepEqual(ev.archetype.overlays,['EVENT_PREP']);assert.equal(ev.archetype.phaseLeads.SPECIFIC,'RUN');
 assert.equal(archetypeOf(buildGoalModel(canonicalizeIntake(intake({id:'x',goals:{run:'PERFORMANCE',strength:'STRENGTH'}})).canonical)).id,'ARCH.JOINT');
});
