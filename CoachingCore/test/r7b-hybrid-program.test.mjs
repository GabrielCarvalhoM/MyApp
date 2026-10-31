// DOMAIN_COACHING_R7-B: hybrid composition and the program level. CMP.I11 as an ordinal ranking cost (B0-C11, B0-F06), arrangement first; the
// CMP.P04 content stage by lead; protected stimuli; feasibility negotiation (request §18); a cold-start grid (request §17); program-level
// progression (request §19). The R6 composition relations CMP.I01–I10 are covered by the inherited suite.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {program,reviewed,weekly,gen,opts,FULL,K,rows,runs,live,intake,generateProgram} from '../r7/b/fixtures/helpers.mjs';
import {interferenceCosts} from '../src/r6-balanced.mjs';
import {validateWeeks,skeletonOf} from '../src/r6-program.mjs';

const RECORDS=JSON.parse(fs.readFileSync(new URL('../../audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json',import.meta.url),'utf8'));
const withoutI11={...opts,repertoireRecords:RECORDS.filter(r=>!r.review_id.endsWith('B0-C11'))};
const I11=/Eccentric or new lower-body work/;

test('B0-C11 / CMP.I11: an ordinal LOW run cost, counted once per pair, that the ranking avoids when the chosen days allow; never a prohibition',()=>{
 const o={id:'h-i11',goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:['DUMBBELLS','BENCH'],schedule:{strengthDays:[2,5],runDays:[1,3,6],longRunDay:6}};
 const on=program(o),off=program(o,withoutI11);
 const satTemplate=p=>p.weeks[2].sessions.find(s=>s.sport==='STRENGTH'&&s.day===5).templateType;
 assert.equal(satTemplate(off),'FULL_B','without the record the HIGH-eccentric session sits the day before the long run');
 assert.equal(satTemplate(on),'FULL_A','with it the arrangement moves the eccentric work away (arrangement first)');
 // Counted once per pair whatever the number of qualifying rows; LOW; never before the race (CMP.I01 keeps race proximity).
 const s=(id,day,turn,p)=>({id,day,turn,prescription:p});
 const heavyEcc={modality:'STRENGTH',exercises:[{id:'db-rdl',pattern:'HINGE',sets:3,load:{mode:'FROM_LOG',unit:'KG'}},{id:'bulgarian-split-squat-db',pattern:'LUNGE',sets:2,load:{mode:'FROM_LOG',unit:'KG'}}]};
 const long={modality:'RUN',family:'LONG',durationMinutes:60},race={modality:'RUN',family:'RACE',durationMinutes:60};
 const c=interferenceCosts([s('S',5,'PM',heavyEcc),s('L',6,'AM',long)],{wrap:false,cmpI11:true}).filter(x=>I11.test(x.cause));
 assert.equal(c.length,1);assert.equal(c[0].severity,'LOW');assert.equal(c[0].axis,'run');
 assert.equal(interferenceCosts([s('S',5,'PM',heavyEcc),s('R',6,'AM',race)],{wrap:false,cmpI11:true}).filter(x=>I11.test(x.cause)).length,0);
 // When every strength day neighbours a protected run, the plan is still generated: the cost is ranked, not forbidden.
 const all=gen({id:'h-i11-all',goals:{run:'PERFORMANCE',strength:'GENERAL'},schedule:{strengthDays:[5],runDays:[1,3,6],longRunDay:6}});assert.equal(all.status,'PROPOSED');
});

test('B0-C11 / CMP.P04 content stage: under a RUN lead a non-MAIN HIGH-eccentric lower row next to a protected run loses one set, disclosed; MAIN rows and STRENGTH or JOINT leads are untouched',()=>{
 const o={id:'h-p04',goals:{run:'RACE',strength:'STRENGTH'},event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:FULL,knownExercises:[{id:'bulgarian-split-squat-db',familiar:true}],recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:3},schedule:{runDays:[1,3,6],strengthDays:[0,2,5],longRunDay:6}};
 const p=program(o);
 let reduced=0;
 for(const w of p.weeks){const lead=w.contextualPriority?.lead;for(const s of w.sessions.filter(x=>x.sport==='STRENGTH'&&x.prescription))for(const e of s.prescription.exercises){
  if(e.exposure?.contentReduction==='CMP.P04'){reduced++;assert.equal(lead,'RUN',`week ${w.index}`);assert.notEqual(e.role,'MAIN');assert.equal(e.id,'bulgarian-split-squat-db');assert.ok(e.instructions.some(t=>/not a recovery or injury measure/.test(t)));}
  if(e.role==='MAIN')assert.ok(!e.exposure?.contentReduction,'MAIN keeps the essential stimulus');
 }}
 assert.ok(reduced>0,'the content stage is reached in the RUN-led weeks');
 // A strength-led athlete keeps the content (the long run yields instead).
 const sl=program({...o,id:'h-p04-strength',goals:{run:'REGULAR',strength:'STRENGTH'},event:null});
 assert.ok(!sl.weeks.some(w=>w.sessions.some(s=>s.prescription?.exercises?.some(e=>e.exposure?.contentReduction))));
});

test('Protected stimuli: under a RUN lead the long run and the quality run are kept on their days in every week; strength keeps its main lifts',()=>{
 const p=program({id:'h-protect',goals:{run:'RACE',strength:'GENERAL'},event:{kind:'HALF_MARATHON',date:'2027-02-07'},weeks:16,recent:{runDaysPerWeek:4,runMinutesPerWeek:220,longestRunMinutes:80,strengthDaysPerWeek:2},schedule:{runDays:[1,3,4,6],strengthDays:[2,5],longRunMinutes:120}});
 for(const w of p.weeks.filter(w=>['BUILD','SPECIFIC'].includes(w.phase))){assert.ok(runs(p,w.index).some(s=>s.role==='LONG'),`week ${w.index} long run`);for(const s of w.sessions.filter(x=>x.sport==='STRENGTH'&&x.prescription))assert.ok(s.prescription.exercises.some(e=>e.role==='MAIN'),'main lifts kept');}
 assert.ok(p.weeks.filter(w=>w.phase==='SPECIFIC').every(w=>runs(p,w.index).some(s=>['HALF_MARATHON_SPECIFIC','THRESHOLD'].includes(s.prescription.family))),'a quality run every specific week');
});

test('Feasibility negotiation (request §18): ideal week, protected order and every reduction with its authority; chosen days are never dropped',()=>{
 const a=gen({id:'h-feas-days',goals:{run:'PERFORMANCE',strength:'GENERAL'},schedule:{runDays:[2,6],strengthDays:[0,4]}});
 assert.ok(a.program.feasibility.reductions.some(r=>r.id==='QUALITY_NEEDS_THREE_RUN_DAYS'));assert.equal(a.program.feasibility.chosenDaysKept,true);
 assert.deepEqual(a.program.feasibility.protectedOrder.slice(0,2),['RUN.LONG','quality KEY run']);
 const walks=gen({id:'h-feas-walks',goals:{run:'PERFORMANCE',strength:'NONE'},recent:{runDaysPerWeek:2,runMinutesPerWeek:70,longestRunMinutes:35},schedule:{runDays:[0,1,3,5,6],strengthDays:[]}});
 assert.ok(walks.program.feasibility.reductions.some(r=>r.id==='RUN_DAYS_AS_WALKS'));
 const time=gen({id:'h-feas-time',goals:{run:'PERFORMANCE',strength:'STRENGTH'},equipment:FULL,schedule:{strengthMinutes:30}});
 assert.ok(time.negotiation.some(n=>n.id==='STRENGTH_TIME_LIMITS_SESSION'));assert.ok(time.program.feasibility.reductions.some(r=>r.id==='STRENGTH_TIME_FIT'));
 for(const g of [a,walks,time]){const p=g.program,s=p.schedule;for(const w of p.weeks){for(const d of s.runDays)assert.ok(w.sessions.some(x=>x.sport==='RUN'&&x.day===d));for(const d of s.strengthDays)assert.ok(w.sessions.some(x=>x.sport==='STRENGTH'&&x.day===d));}}
});

test('Cold start (request §17): incomplete history, no running, no strength history, one modality experienced, limited availability and shared shifts all reach a coherent first plan or an explicit question',()=>{
 const cases=[
  ['unknown running',{recent:{runDaysPerWeek:3,runMinutesPerWeek:null,longestRunMinutes:null,strengthDaysPerWeek:null}}],
  ['no recent running',{recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:0,strengthDaysPerWeek:2}}],
  ['strength novice, experienced runner',{runExperience:'EXPERIENCED',strengthExperience:'NONE',recent:{runDaysPerWeek:5,runMinutesPerWeek:300,longestRunMinutes:100,strengthDaysPerWeek:0},schedule:{runDays:[0,1,3,4,6]}}],
  ['run novice, experienced lifter',{runExperience:'NONE',strengthExperience:'EXPERIENCED',knownExercises:[K('back-squat',4,5,120),K('bench-press',4,5,90)],equipment:FULL,recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:0,strengthDaysPerWeek:4},schedule:{strengthDays:[0,2,4,5]}}],
  ['one day each, short sessions',{schedule:{runDays:[6],strengthDays:[2],runMinutes:25,strengthMinutes:25,longRunDay:null,longRunMinutes:25}}],
  ['shared days, same shift',{schedule:{runDays:[1,3,6],strengthDays:[1,3],runTurn:'PM',strengthTurn:'PM'}}],
  ['wearable partial history',{athlete:{wearableCapabilities:{activityAvailable:true,completeness:'PARTIAL'}}}]
 ];
 for(const [label,o] of cases){
  const g=gen({id:'h-cold-'+label.replace(/\W+/g,'-'),...o});
  assert.ok(['PROPOSED','ASK'].includes(g.status),`${label}: ${g.status} ${g.reason}`);
  if(g.status==='ASK'){assert.ok(g.missingInputs.length,label);continue;}
  const p=g.program;assert.ok(p.coldStart&&p.feasibility&&p.progression,label);
  assert.deepEqual(validateWeeks(skeletonOf(p,opts.authority),p.weeks),[],label);
  const W0=p.capability.run.weeklyMinutes;if(Number.isFinite(W0)&&W0>0&&['EASY_CURRENT','EASY_LOW','QUALITY_FAMILIAR'].includes(p.capability.run.class))assert.ok(p.weeks[0].plannedRunMinutes<=W0,`${label}: week 1 within current running`);
  for(const {e} of rows(p,0))assert.ok(['KNOWN','ESTABLISH','BODYWEIGHT'].includes(e.load.mode)&&(e.load.mode!=='KNOWN'||p.capability.strength.known.some(k=>k.id===e.id)),`${label}: ${e.id} no fabricated load`);
  assert.equal(p.weeks.slice(0,1).flatMap(w=>runs(p,w.index)).filter(s=>s.prescription.family==='THRESHOLD').length,0,`${label}: no new intensity in week 1`);
 }
});

test('Program-level progression (request §19): each block states its intent, lead and planned doses; steps follow executed evidence, never the calendar',()=>{
 const t=reviewed({id:'h-prog',goals:{run:'PERFORMANCE',strength:'GENERAL'},weeks:12},0);
 const prog=t.p.progression;assert.equal(prog.length,t.p.blocks.length);assert.ok(prog.every(b=>b.intent&&b.lead&&/executed/.test(b.advances)));
 // Every week executed: the long run grows; every week missed: nothing grows and the block review lists the held doses.
 for(let w=0;w<5;w++)weekly(t,w);
 const longOf=(p,w)=>runs(p,w).find(s=>s.role==='LONG')?.prescription.durationMinutes;
 assert.ok(longOf(t.p,5)>=longOf(t.p,1));
 const m=reviewed({id:'h-prog-missed',goals:{run:'PERFORMANCE',strength:'GENERAL'},weeks:12},0);
 let last=null;for(let w=0;w<5;w++)last=weekly(m,w,{keep:()=>false});
 assert.ok(longOf(m.p,5)<=longOf(m.p,1),'missed weeks never grow the long run (no debt, no calendar progression; with no run in the window the reviewed entry is the ceiling)');
 assert.equal(m.p.stateTrace[5].run.long,t.p.stateTrace[1].run.long,'the state holds: HOLD repeats the dose');
 assert.ok((last.disclosures??[]).some(d=>d.id==='BLOCK_REVIEW'&&d.held.length),'the block review names what held');
});
