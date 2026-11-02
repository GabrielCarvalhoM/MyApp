// DOMAIN_COACHING_R7-B: hybrid composition and the program level. CMP.I11 as an ordinal ranking cost (B0-C11, B0-F06), arrangement first; the
// CMP.P04 content stage by lead; protected stimuli; feasibility negotiation (request §18); a cold-start grid (request §17); program-level
// progression (request §19). The R6 composition relations CMP.I01–I10 are covered by the inherited suite.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {program,reviewed,weekly,gen,opts,FULL,K,rows,runs,live,intake,generateProgram,review,evaluateProgram,addDays} from '../r7/b/fixtures/helpers.mjs';
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
 // Split by SSCTR-SD-R7C-r2 (R7-C Phase 5; audits/domain-coaching-r7-c-2026-11-01/reviews/ssctr/SSCTR_SEMANTIC_REDISPOSITION_R7C.json, legacyTests
 // §19): sessions with no report are unknown, never missed (UNREPORTED: week 4 asks, nothing grows); sessions reported not done are missed and
 // the original invariant holds (KNOWN_MISS); answered after the question, the known-miss plan follows (ANSWERED_KNOWN_STOP).
 const MISSED={id:'h-prog-missed',goals:{run:'PERFORMANCE',strength:'GENERAL'},weeks:12};
 const notDone=(p,s)=>({eventId:`s19-nd-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:{completed:false},response:{}});
 const step=(x,rv)=>{const r=evaluateProgram(x.p,{...rv,actualLedger:x.ledger,...(x.ref?{referenceState:x.ref}:{})},opts);x.ledger=r.actualLedger??x.ledger;x.ref=r.referenceState??x.ref;if(r.proposal)x.p=r.proposal;return r;};
 const block=r=>(r.disclosures??[]).find(d=>d.id==='BLOCK_REVIEW')?.held??null,runsOf=(p,w,from=p.weeks[w].startDate)=>runs(p,w).filter(s=>s.date>=from).map(s=>`${s.id}:${s.role}:${s.prescription.durationMinutes}`);
 const HELD=['run.long','run.easy','run.qualityStep'],VALID='VALID_WITHIN_CURRENT_BOUNDED_SCOPE';
 // UNREPORTED: every session of weeks 0-4 with no report. Week 4 is the typed question, with no block review (it belongs to a deciding review).
 const m={p:program(MISSED),ledger:[],ref:null};let last=null;for(let w=0;w<5;w++)last=step(m,review(m.p,w,{}));
 assert.deepEqual([last.status,last.question?.kind,last.proposal,last.planValidity.status,block(last)],['ASK','UNREPORTED_TRAINING',null,'REQUIRES_RECONCILIATION',null],'UNREPORTED week 4');
 assert.ok(longOf(m.p,5)<=longOf(m.p,1),'unreported weeks never grow the long run (no credit)');
 assert.equal(m.p.stateTrace[5].run.long,t.p.stateTrace[1].run.long,'the state holds');
 // KNOWN_MISS: every session reported not done at its review: the original invariant.
 const k={p:program(MISSED),ledger:[],ref:null};let k4=null;for(let w=0;w<5;w++)k4=step(k,review(k.p,w,{observations:k.p.weeks[w].sessions.filter(live).map(s=>notDone(k.p,s))}));
 assert.ok(longOf(k.p,5)<=longOf(k.p,1),'missed weeks never grow the long run (no debt, no calendar progression; with no run in the window the reviewed entry is the ceiling)');
 assert.equal(k.p.stateTrace[5].run.long,t.p.stateTrace[1].run.long,'the state holds: HOLD repeats the dose');
 assert.ok((k4.disclosures??[]).some(d=>d.id==='BLOCK_REVIEW'&&d.held.length),'the block review names what held');
 assert.deepEqual(block(k4),HELD);
 // ANSWERED_KNOWN_STOP (a): the week-4 review re-submitted at the end of the week with every session of weeks 0-4 reported not done.
 const reportedNotDone=(x,day)=>x.p.weeks.flatMap(w=>w.sessions).filter(s=>live(s)&&s.date<day).map(s=>notDone(x.p,s));
 const a={p:m.p,ledger:[...m.ledger],ref:m.ref},a4=step(a,review(a.p,4,{hour:'22:00:00',observations:reportedNotDone(a,addDays(a.p.weeks[4].startDate,7))}));
 assert.deepEqual([a4.status,a4.action,a4.planValidity.status,a4.referenceState.pending],['MODIFY','GATED_NEXT_STEP',VALID,null],'ANSWERED at the end of week 4');
 assert.deepEqual(block(a4),HELD,'the block review names the held doses');
 assert.deepEqual(runsOf(a.p,5),runsOf(k.p,5),'week 5 equals the known miss');assert.equal(a.p.stateTrace[5].run.long,t.p.stateTrace[1].run.long);
 // ANSWERED_KNOWN_STOP (b): the answer on day 2 of week 5: the runs ahead at the entry, no quality.
 const b={p:m.p,ledger:[...m.ledger],ref:m.ref},d2=addDays(b.p.weeks[5].startDate,2),b5=step(b,review(b.p,5,{day:2,hour:'07:00:00',observations:reportedNotDone(b,d2)}));
 assert.deepEqual([b5.status,b5.action,b5.planValidity.status,b5.referenceState.pending],['MODIFY','REPLAN_FROM_EVIDENCE',VALID,null],'ANSWERED on day 2 of week 5');
 assert.ok(runs(b.p,5).filter(s=>s.date>=d2).every(s=>s.prescription.durationMinutes<=opts.authority.policy.operational.return.entryRunMinutes&&s.role!=='QUALITY'),runsOf(b.p,5,d2).join('/'));
});
