// R7-B.2 timeline differential against the predecessor runtime R7B1-FREEZE-2 (DOMAIN_COACHING_R7-B.2, TASK_CONTRACT §7 G4). The predecessor's
// bytes (commit 146ebb8) are extracted from git into a temporary directory. Both runtimes run the same review timelines with the same event and
// observation identities (the R7-B.1 differential design, scripts/regress-r7b1.mjs): the R7-B regression intake corpus reviewed week by week through
// its whole horizon, the other decision kinds, the R7-B.1 blocker paths (now behaviour to keep), the R7-B.1 substitution grid, and the R7-B.2 paths:
// a return's re-entry week with late training before the break, a return resent under its event id, and a factual re-plan that raises its own
// question (R7B2-CAND-01, on a hash-valid program state the public API never produces, as in the B.2 tests). After every decision the two programs,
// the two ledgers and the two decisions (status, action, selection, proposal) are compared.
// - A step whose review carries no clinical signal of its own must be identical.
// - A step whose review carries one (the author marks it: its own handler screen routes it, pain/injury/clinical text with a named exercise, or a
//   clinical interruption reason) may differ only one way: FREEZE-2 returned a nonclinical question (ASK, no proposal) and R7-B.2 returns
//   CLINICAL_HUMAN_REQUIRED with no proposal, the same program and the same ledger. Anything else is a finding (contract §5: SSCTR and Quality).
// - The same-input check of the carried reference state: a later review given the same referenceState decides alike on both runtimes.
// - A clinical sweep: on every corpus program, reviews that carry a clinical signal outside the B.2 paths decide alike.
// - Every R7-B.2 program is checked against the strength dose envelope and its running against the predecessor's, as regress-r7b1.mjs does.
// Read-only unless given --write, which writes only the report named by --out (default r7/b2/REGRESSION_R7B2.json).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL,fileURLToPath} from 'node:url';
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i>=0&&process.argv[i+1]?process.argv[i+1]:d;};
const PRED=arg('--base','146ebb80c51d302ef3518a61c1cab208c7778632');
const coach=fileURLToPath(new URL('..',import.meta.url)),repo=path.resolve(coach,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7b2-pred-')),tarFile=path.join(tmp,'pred.tar');
const ar=spawnSync('git',['archive','--format=tar','-o',tarFile,PRED,'CoachingCore/src','CoachingCore/r5','CoachingCore/r6','CoachingCore/r7/b0','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json','audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'],{cwd:repo,encoding:'utf8'});
if(ar.status!==0)throw new Error('git archive failed: '+ar.stderr);
const tx=spawnSync('tar',['-xf','pred.tar'],{cwd:tmp,encoding:'utf8'});if(tx.status!==0)throw new Error('tar failed: '+tx.stderr);
const load=async root=>{const idx=await import(pathToFileURL(path.join(root,'CoachingCore/src/r6-index.mjs')));const P=await import(pathToFileURL(path.join(root,'CoachingCore/src/r6-program.mjs')));const V=await import(pathToFileURL(path.join(root,'CoachingCore/src/value.mjs')));const dev=(await import(pathToFileURL(path.join(root,'CoachingCore/r6/fixtures/dev-authority.mjs')))).devAuthority;return {generate:idx.generateProgram,evaluate:idx.evaluateProgram,programHash:P.programHash,validProgram:P.validProgram,hash:V.hash,opts:{authority:dev()}};};
const NOW=await load(repo),BEFORE=await load(tmp);
const op=JSON.parse(fs.readFileSync(path.join(coach,'r6/PROGRAM_POLICY_R6.json'),'utf8').replace(/^﻿/,'')).operational;
const {PROFILES,EDGE_PROFILES}=await import(pathToFileURL(path.join(coach,'r6/fixtures/profiles.mjs')));

// ---------- the timeline driver (regress-r7b1.mjs's, with the clinical mark, the proposal and the ledger per step) ----------
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'},BAD={performance:'UNDER',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'IMPAIRED'};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const FULL=['BARBELL','RACK','BENCH','DUMBBELLS','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'];
const intakeOf=({id,weeks=12,goals={run:'PERFORMANCE',strength:'GENERAL'},runExperience='INTERMEDIATE',strengthExperience='INTERMEDIATE',recent={runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60,strengthDaysPerWeek:2},equipment=['DUMBBELLS','BENCH'],rotation='FIXED',event=null,schedule={}})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks,learningConsent:true,athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals,runExperience,strengthExperience,recent,equipment,knownExercises:[],knownRuns:[],exerciseRotationPreference:rotation,...(event?{event}:{})},schedule:{runDays:[1,3,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:90,...schedule}});
function driver(rt,input,tid){
 let n=0;const g=rt.generate(input,rt.opts),t={p:g.program??null,ledger:[],steps:[],status:g.status,programs:[]};
 const review=(w,{day=6,hour='21:00:00',kind='WEEKLY_REVIEW',...x}={})=>{const d=addDays(t.p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`${tid}-e${n++}`,kind},eligibility:elig(d),observations:[],...x};};
 const obs=(s,{response=null}={})=>{const pr=s.prescription,a={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')a.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:e.load.mode==='KNOWN'?e.load.value:20,unit:'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));return {eventId:`${tid}-o${n++}`,athleteId:t.p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:a,response:{...OK,...(response??{})}};};
 const run=(rv,label,{clinical=false}={})=>{const r=rt.evaluate(t.p,{...rv,actualLedger:t.ledger},rt.opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.steps.push({label,clinical,w:rv.weekIndex,status:r.status,action:r.action,proposal:!!r.proposal,hash:t.p.hash,ledger:rt.hash(t.ledger),selected:r.substitutions?.[0]?.selected??null,missing:r.missingInputs??[],reason:String(r.reason??'').slice(0,200),pending:r.referenceState?.pending?.status??null});t.programs.push({w:rv.weekIndex,p:t.p,r});return r;};
 const weekly=(w,{response=()=>null,keep=()=>true}={})=>run(review(w,{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(s,{response:response(s)}))}),'weekly:'+w);
 const fixes=(w,pred,at)=>t.ledger.filter(o=>!o.superseded&&!o.correctionOf&&t.p.weeks[w].sessions.some(s=>s.id===o.sessionId&&pred(s))).map(o=>({eventId:o.eventId+'-fix',athleteId:o.athleteId,sessionId:o.sessionId,observedAt:o.observedAt,correctionOf:o.eventId,correctedAt:at,actual:structuredClone(o.actual),response:{...o.response,...BAD}}));
 return {t,rt,review,obs,run,weekly,fixes};
}

// ---------- the timelines ----------
const corpusIntakes=[...Object.entries(PROFILES),...Object.entries(EDGE_PROFILES)];
for(const strength of ['STRENGTH','HYPERTROPHY','RUNNING_SUPPORT','GENERAL','MAINTAIN'])for(const [eq,l] of [[FULL,'full'],[['DUMBBELLS','BENCH'],'db'],[['KETTLEBELL'],'kb'],[['BANDS','PULL_UP_BAR'],'bands'],[[],'bw'],[['MACHINES','DUMBBELLS'],'mach']])for(const exp of ['NONE','INTERMEDIATE'])corpusIntakes.push([`grid-${strength}-${l}-${exp}`,intakeOf({id:`grid-${strength}-${l}-${exp}`,goals:{run:strength==='STRENGTH'?'REGULAR':'PERFORMANCE',strength},equipment:eq,strengthExperience:exp,rotation:'COACH_DECIDES',schedule:{strengthDays:exp==='NONE'?[0,2,4,5]:[0,2,4]}})]);
for(const [k,o] of [['run-never',{goals:{run:'PERFORMANCE',strength:'NONE'},runExperience:'NONE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:0},schedule:{strengthDays:[]}}],['run-low',{goals:{run:'PERFORMANCE',strength:'NONE'},runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35},schedule:{strengthDays:[],runMinutes:45},weeks:16}],['run-wj',{goals:{run:'PERFORMANCE',strength:'GENERAL'},recent:{runDaysPerWeek:2,runMinutesPerWeek:20,longestRunMinutes:10},weeks:16}],['event-10k',{goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:['DUMBBELLS','BENCH','KETTLEBELL'],recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6]}}],['event-hm',{goals:{run:'RACE',strength:'RUNNING_SUPPORT'},event:{kind:'HALF_MARATHON',date:'2027-01-31'},weeks:16,recent:{runDaysPerWeek:4,runMinutesPerWeek:220,longestRunMinutes:80},schedule:{runDays:[1,3,4,6],longRunMinutes:120}}],['two-weekly',{goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},equipment:FULL,rotation:'EVERY_2_WEEKS',weeks:16,schedule:{strengthDays:[0,2,4]}}]])corpusIntakes.push([k,intakeOf({id:k,...o})]);
const timelines=[];
// A. The corpus reviewed week by week as prescribed through its whole horizon.
for(const [id,input] of corpusIntakes)timelines.push({id:'corpus:'+id,tag:'PRESERVE',input,steps:d=>{for(let w=0;w<d.t.p.weeks.length;w++)d.weekly(w);}});
// B. The other decision kinds.
const EVENT10K=intakeOf({id:'s-event',goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:['DUMBBELLS','BENCH','KETTLEBELL'],recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6],strengthDays:[0,4]}});
const GEN=intakeOf({id:'s-gen',equipment:['DUMBBELLS','BENCH','KETTLEBELL'],weeks:12});
const NOV=intakeOf({id:'s-novice',strengthExperience:'NONE',goals:{run:'REGULAR',strength:'GENERAL'},equipment:['DUMBBELLS','BENCH'],schedule:{strengthDays:[0,2,4,5]},weeks:12});
const GRAD=intakeOf({id:'s-grad',goals:{run:'PERFORMANCE',strength:'NONE'},runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35},schedule:{strengthDays:[],runMinutes:45},weeks:16});
for(const [cls,days] of [['SHORT',5],['MODERATE',12],['LONG',40]])for(const [label,input] of [['gen',GEN],['event',EVENT10K]])timelines.push({id:`return:${label}:${cls}`,tag:'PRESERVE',input,steps:d=>{for(let w=0;w<5;w++)d.weekly(w);const end=addDays(d.t.p.weeks[6].startDate,-1);d.run(d.review(6,{day:0,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{reason:'work travel',reasonCategory:'TRAVEL',nonclinical:true,days,endDate:end}}),'return');for(let w=6;w<9;w++)d.weekly(w);}});
for(const [label,input] of [['gen',GEN],['grad',GRAD],['event',EVENT10K]])timelines.push({id:`correction:${label}`,tag:'PRESERVE',input,steps:d=>{for(let w=0;w<4;w++)d.weekly(w);d.run(d.review(4,{day:0,hour:'06:00:00',observations:d.fixes(3,()=>true,`${d.t.p.weeks[4].startDate}T05:00:00Z`)}),'correction');for(let w=4;w<7;w++)d.weekly(w);}});
timelines.push({id:'equipment:gen:permanent',tag:'PRESERVE',input:GEN,steps:d=>{for(let w=0;w<3;w++)d.weekly(w);d.run(d.review(3,{day:0,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']}}),'equipment');for(let w=3;w<6;w++)d.weekly(w);}});
timelines.push({id:'equipment:gen:window',tag:'PRESERVE',input:GEN,steps:d=>{for(let w=0;w<3;w++)d.weekly(w);d.run(d.review(3,{day:0,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:['BANDS'],from:d.t.p.weeks[4].startDate,to:addDays(d.t.p.weeks[4].startDate,6)}}),'equipment');for(let w=3;w<7;w++)d.weekly(w);}});
timelines.push({id:'schedule:gen',tag:'PRESERVE',input:GEN,steps:d=>{for(let w=0;w<2;w++)d.weekly(w);d.run(d.review(2,{day:0,hour:'06:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4]}}),'schedule');for(let w=2;w<6;w++)d.weekly(w);}});
timelines.push({id:'goal:gen',tag:'PRESERVE',input:GEN,steps:d=>{for(let w=0;w<2;w++)d.weekly(w);d.run(d.review(2,{day:0,hour:'06:00:00',kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}}),'goal');for(let w=2;w<6;w++)d.weekly(w);}});
timelines.push({id:'event:planned-taper',tag:'PRESERVE',input:EVENT10K,steps:d=>{for(let w=0;w<d.t.p.weeks.length;w++)d.weekly(w,{response:s=>s.role==='QUALITY'&&w===6?BAD:null});}});
timelines.push({id:'fatigue-missed:gen',tag:'PRESERVE',input:GEN,steps:d=>{for(let w=0;w<3;w++)d.weekly(w);const s=d.t.p.weeks[3].sessions.find(x=>live(x)&&x.sport==='STRENGTH');d.run(d.review(3,{day:s.day,hour:'06:00:00',kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}}),'fatigue');d.run(d.review(3,{day:6,hour:'06:00:00',kind:'MISSED_SESSION',targetSessionId:s.id}),'missed');for(let w=3;w<6;w++)d.weekly(w);}});
timelines.push({id:'novice:plain',tag:'PRESERVE',input:NOV,steps:d=>{for(let w=0;w<8;w++)d.weekly(w);}});
// C. The R7-B.1 blocker paths: closed at R7B1-FREEZE-2, behaviour R7-B.2 keeps (identical step by step).
for(const phase of ['TAPER','RACE_WEEK','POST_EVENT'])for(const reason of ['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE'])for(const [label,input] of [['fixed',EVENT10K],['rotating',{...EVENT10K,athlete:{...EVENT10K.athlete,id:'s-event-rot',exerciseRotationPreference:'EVERY_2_WEEKS'}}]])
 timelines.push({id:`R7B1:OBS-04:${label}:${phase}:${reason}`,tag:'R7B1_PATH',input,steps:d=>{const wk=d.t.p.phases.phases.indexOf(phase);for(let w=0;w<wk;w++)d.weekly(w);const ids=[...new Set(d.t.p.weeks[wk].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>e.role!=='PRACTICE').map(e=>e.id)))];const id=ids[0];d.run(d.review(wk,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:id,reason,...(reason==='SKILL_MISMATCH'?{}:{nonclinicalConfirmed:true})}}),'substitution:'+id);for(let w=wk;w<Math.min(d.t.p.weeks.length,wk+4);w++)d.weekly(w);}});
timelines.push({id:'R7B1:R2-01:novice-substitution',tag:'R7B1_PATH',input:NOV,steps:d=>{for(let w=0;w<2;w++)d.weekly(w);d.run(d.review(2,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'goblet-squat',reason:'SKILL_MISMATCH'}}),'substitution');for(let w=2;w<6;w++)d.weekly(w);}});
timelines.push({id:'R7B1:R2-01:novice-schedule',tag:'R7B1_PATH',input:{...NOV,athlete:{...NOV.athlete,id:'s-novice-2d'},schedule:{...NOV.schedule,strengthDays:[0,4]}},steps:d=>{d.weekly(0);d.run(d.review(1,{day:0,hour:'06:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4,5]}}),'schedule');for(let w=1;w<6;w++)d.weekly(w);}});
timelines.push({id:'R7B1:R2-01:novice-kettlebell',tag:'R7B1_PATH',input:NOV,steps:d=>{d.weekly(0);d.run(d.review(1,{day:0,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:['KETTLEBELL']}}),'equipment');for(let w=1;w<6;w++)d.weekly(w);}});
timelines.push({id:'R7B1:R2-02:novice-choice',tag:'R7B1_PATH',input:NOV,steps:d=>{for(let w=0;w<5;w++)d.weekly(w);d.run(d.review(5,{day:0,hour:'06:00:00',observations:d.fixes(4,s=>s.sport==='STRENGTH',`${d.t.p.weeks[5].startDate}T05:00:00Z`),choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}]}),'correction+choice');d.run(d.review(5,{day:1,hour:'06:00:00'}),'follow-up');for(let w=5;w<8;w++)d.weekly(w);}});
timelines.push({id:'R7B1:R2-02:graduation-decline',tag:'R7B1_PATH',input:GRAD,steps:d=>{for(let w=0;w<4;w++)d.weekly(w);d.run(d.review(4,{day:0,hour:'06:00:00',observations:d.fixes(3,s=>s.role==='LONG',`${d.t.p.weeks[4].startDate}T05:00:00Z`),choices:[{offer:'RUN_QUALITY_GRADUATION',decision:'DECLINE'}]}),'correction+choice');for(let w=4;w<8;w++)d.weekly(w);}});
for(const variant of ['permanent','window'])timelines.push({id:'R7B1:R2-03:mismatch-loss:'+variant,tag:'R7B1_PATH',input:{...GEN,athlete:{...GEN.athlete,id:'s-gen-loss'}},steps:d=>{for(let w=0;w<3;w++)d.weekly(w);d.run(d.review(3,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'db-rdl',reason:'SKILL_MISMATCH'}}),'substitution');d.weekly(3);d.run(d.review(4,{day:0,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:variant==='permanent'?{equipment:['DUMBBELLS','BENCH']}:{equipment:['DUMBBELLS','BENCH'],from:d.t.p.weeks[5].startDate,to:addDays(d.t.p.weeks[5].startDate,6)}}),'equipment');for(let w=4;w<8;w++)d.weekly(w);}});
timelines.push({id:'R7B1:QE-R7B1-01:clinical+choice',tag:'R7B1_PATH',input:NOV,steps:d=>{for(let w=0;w<5;w++)d.weekly(w);d.run(d.review(5,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'goblet-squat',reason:'SKILL_MISMATCH',pain:true},choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}]}),'pain+choice',{clinical:true});for(let w=5;w<8;w++)d.weekly(w);}});
// D. The R7-B.2 paths. The re-entry week (the R7-B.1 judge probes K6 and K6b): week 2's day-4 strength session is left out of its weekly review, a
// nonclinical return is reported on day 3 of week 3, and on day 4 a review reports that session late (R7-A final I6) with or without a clinical signal.
const REENTRY=intakeOf({id:'b2-reentry',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12});
const reentry=d=>{d.weekly(0);d.weekly(1);const late=d.t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.day===4);d.weekly(2,{keep:s=>s.id!==late.id});const rep=addDays(d.t.p.weeks[3].startDate,3);
 d.run(d.review(3,{day:3,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:d.t.p.weeks[3].startDate,endDate:addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true}}),'return');
 const X=d.t.p.weeks[3].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>rep).flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];return {late,X,lateObs:()=>d.obs(late)};};
const sub=(X,x={})=>({kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',...x}});
const ILL={kind:'RETURN_AFTER_PAUSE',interruption:{days:1,reason:'Flu illness',nonclinical:true}},INJ={kind:'RETURN_AFTER_PAUSE',interruption:{days:1,reasonCategory:'INJURY',reason:'Twisted ankle'}};
const REENTRY_VARIANTS=[
 // C: late evidence + a clinical signal in the same review (QE-R7B1-04)
 ['C:pain',true,true,X=>sub(X,{pain:true})],['C:injury',true,true,X=>sub(X,{injury:true})],['C:pain-yes',true,true,X=>sub(X,{pain:'yes'})],
 ['C:clinical-text',true,true,X=>sub(X,{reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true,text:'My knee hurts when I squat'})],
 ['C:pain+ladder',true,true,X=>({...sub(X,{pain:true}),choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}]})],
 ['C:pain+decline',true,true,X=>({...sub(X,{pain:true}),choices:[{offer:'RUN_QUALITY_GRADUATION',decision:'DECLINE'}]})],
 ['C:pain+unrecognised',true,true,X=>({...sub(X,{pain:true}),choices:[{type:'LADDER_JUMP'}]})],
 ['C:illness-return',true,true,()=>ILL],['C:injury-return',true,true,()=>INJ],
 // A: late evidence, no clinical signal (R7-A's confirmation question)
 ['A:weekly',false,true,()=>({})],['A:sub-no-pain',false,true,X=>sub(X,{pain:false,injury:false})],['A:sub-pain-maybe',false,true,X=>sub(X,{pain:'maybe'})],
 ['A:nonclinical-discomfort',false,true,X=>sub(X,{reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true,text:'I just dislike this one'})],
 ['A:return-nonclinical',false,true,()=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:1,reasonCategory:'FAMILY',reason:'Family visit',nonclinical:true}})],
 // B: a clinical signal, no late evidence; E: a block choice + a clinical signal (QE-R7B1-01); F: a skill substitution, no signal
 ['B:pain',true,false,X=>sub(X,{pain:true})],['B:illness-return',true,false,()=>ILL],
 ['E:pain+ladder',true,false,X=>({...sub(X,{pain:true}),choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}]})],
 ['F:skill',false,false,X=>sub(X)],
 // R7B2-OBS-01 (class c, unchanged): pain with no named exercise
 ['OBS-01:pain-no-exercise+late',false,true,()=>({kind:'EXERCISE_SUBSTITUTION',substitution:{reason:'SKILL_MISMATCH',pain:true}})]];
for(const [name,clinical,withLate,make] of REENTRY_VARIANTS)timelines.push({id:'B2:reentry:'+name,tag:'B2_PATH',input:REENTRY,steps:d=>{const {X,lateObs}=reentry(d);d.run(d.review(3,{day:4,hour:'06:00:00',...make(X),observations:withLate?[lateObs()]:[]}),name,{clinical});for(let w=3;w<7;w++)d.weekly(w);}});
// K6b, two steps: the late report alone (its question), then a pain-only review of the same week; and the D neighbor, a nonclinical correction + late.
timelines.push({id:'B2:reentry:C:two-step',tag:'B2_PATH',input:REENTRY,steps:d=>{const {X,lateObs}=reentry(d);d.run(d.review(3,{day:4,hour:'05:00:00',observations:[lateObs()]}),'late report alone');d.run(d.review(3,{day:4,hour:'06:00:00',...sub(X,{pain:true})}),'pain only',{clinical:true});d.run(d.review(3,{day:4,hour:'07:00:00'}),'later review, no signal');for(let w=3;w<7;w++)d.weekly(w);}});
timelines.push({id:'B2:reentry:D:correction+late',tag:'B2_PATH',input:REENTRY,steps:d=>{const {lateObs}=reentry(d);d.run(d.review(3,{day:4,hour:'06:00:00',observations:[...d.fixes(2,s=>s.sport==='STRENGTH',`${addDays(d.t.p.weeks[3].startDate,4)}T05:00:00Z`),lateObs()]}),'correction+late');for(let w=3;w<7;w++)d.weekly(w);}});
// R7B2-CAND-02: a return resent under its event id.
const CAND02=intakeOf({id:'b2-c02',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12});
for(const [name,clinical,change] of [['same-report',false,f=>f],['illness',true,f=>({...f,reasonCategory:null,reason:'Flu illness'})],['injury-category',true,f=>({...f,reasonCategory:'INJURY',reason:'Twisted ankle'})],['clinical-flag',true,f=>({...f,clinicalReason:true})],['other-nonclinical',false,f=>({...f,reason:'Family visit',reasonCategory:'FAMILY'})]])
 timelines.push({id:'B2:CAND-02:'+name,tag:'B2_PATH',input:CAND02,steps:d=>{for(let w=0;w<3;w++)d.weekly(w);const rep=addDays(d.t.p.weeks[3].startDate,3),first={startDate:d.t.p.weeks[3].startDate,endDate:addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true};
  const r0=d.review(3,{day:3,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:first});d.run(r0,'return');const r1=d.review(3,{day:4,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:change(first)});d.run({...r1,event:{...r1.event,id:r0.event.id}},'resent:'+name,{clinical});for(let w=3;w<6;w++)d.weekly(w);}});
// R7B2-CAND-01: the factual re-plan's own question, on the runtime's own program with an UNAVAILABLE_DAY adaptation over its race date (hash
// recomputed by that runtime; validProgram accepts it), and a correction of last week's strength reports that moves this week's PlanningView.
const CAND01=intakeOf({id:'b2-c01',goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:['DUMBBELLS','BENCH','KETTLEBELL'],recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6],strengthDays:[0,4]}});
for(const [name,clinical,make] of [['weekly',false,()=>({})],['sub-no-pain',false,X=>sub(X)],['pain',true,X=>sub(X,{pain:true})],['illness-return',true,()=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:2,reason:'Flu illness',nonclinical:true}})],['pain+unrecognised',true,X=>({...sub(X,{pain:true}),choices:[{type:'LADDER_JUMP'}]})]])
 timelines.push({id:'B2:CAND-01:'+name,tag:'B2_PATH',input:CAND01,steps:d=>{for(let w=0;w<5;w++)d.weekly(w);const w=5,day=d.t.p.weeks[w].startDate,race=d.t.p.weeks.flatMap(x=>x.sessions).find(s=>s.role==='RACE'&&s.prescription);
  const p=structuredClone(d.t.p),rw=p.weeks[race.weekIndex];rw.adaptations=[...(rw.adaptations??[]),{kind:'UNAVAILABLE_DAY',eventId:'b2-state',asOf:`${day}T05:00:00Z`,asOfLocal:day,past:[],dates:[race.date]}];p.hash=d.rt.programHash(p);
  if(!d.rt.validProgram(p))throw Error('setup: the program state is not valid');d.t.p=p;
  const X=p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>day).flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
  d.run(d.review(w,{day:0,hour:'06:00:00',...make(X),observations:d.fixes(w-1,s=>s.sport==='STRENGTH',`${day}T05:00:00Z`)}),'factual question:'+name,{clinical});}});
// E. A clinical signal in event weeks (no late evidence): the handler's own route on both runtimes.
for(const phase of ['TAPER','RACE_WEEK'])timelines.push({id:'B2:event-week-pain:'+phase,tag:'B2_PATH',input:EVENT10K,steps:d=>{const wk=d.t.p.phases.phases.indexOf(phase);for(let w=0;w<wk;w++)d.weekly(w);const X=d.t.p.weeks[wk].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];d.run(d.review(wk,{day:0,hour:'06:00:00',...sub(X,{pain:true})}),'pain',{clinical:true});for(let w=wk;w<Math.min(d.t.p.weeks.length,wk+3);w++)d.weekly(w);}});
// The substitution grid of the R7-B engineering recheck (N5), kept from regress-r7b1.mjs: every row must decide alike.
const grid=[['GENERAL',['DUMBBELLS','BENCH','KETTLEBELL'],[0,4]],['STRENGTH',FULL,[0,2,4]],['HYPERTROPHY',['KETTLEBELL','BANDS'],[0,4]],['RUNNING_SUPPORT',[],[0,4]],['HYPERTROPHY',FULL,[0,1,3,4]],['GENERAL',['MACHINES','DUMBBELLS'],[0,2,4]],['STRENGTH',['DUMBBELLS','BENCH'],[0,1,3,4]],['HYPERTROPHY',['DUMBBELLS','BENCH','BANDS','PULL_UP_BAR'],[0,2,4]],['GENERAL',['BANDS','PULL_UP_BAR'],[0,2,4]],['RUNNING_SUPPORT',['DUMBBELLS','KETTLEBELL'],[0,1,3,4]]];
const gridInputs=grid.map(([strength,eq,days],i)=>intakeOf({id:`s-grid-${i}-${strength}`,equipment:eq,goals:{run:'PERFORMANCE',strength},rotation:'FIXED',weeks:12,schedule:{strengthDays:days}}));

// ---------- running and comparing ----------
const strengthEnvelope=(p,tl)=>{const out=[],G=op.strength.goalDoses[p.goal.strength.kind]??op.strength.goalDoses.GENERAL;
 for(const wk of p.weeks)for(const s of wk.sessions.filter(x=>x.sport==='STRENGTH'&&x.prescription))for(const e of s.prescription.exercises){
  const k=e.exposure?.kind,cap=e.role==='PRACTICE'||k==='PRACTICE'?op.establishment.unloadedPractice.sets:k==='RETURN_ENTRY'?op.return.strengthEntrySets:['FIRST_ESTABLISH','REESTABLISH','UNLOGGED'].includes(k)?2:e.role==='MAIN'?G.maxSets:Math.max(1,G.maxSets-1);
  if(e.sets>cap||e.rir<2)out.push({timeline:tl,week:wk.index,session:s.id,exercise:e.id,role:e.role,exposure:k??null,sets:e.sets,cap,rir:e.rir});}
 return out;};
const runOf=wk=>{const r=wk.sessions.filter(s=>live(s)&&s.sport==='RUN');return {minutes:r.reduce((n,s)=>n+s.prescription.durationMinutes,0),longest:Math.max(0,...r.map(s=>s.prescription.durationMinutes)),quality:r.filter(s=>['THRESHOLD','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','FAMILIAR_REPEATED_BOUTS','RACE_TOUCH'].includes(s.prescription.family)).length};};
const prescriptionsOf=wk=>JSON.stringify(wk.sessions.map(s=>[s.id,s.prescription??null,s.eventStandIns??null]));
const pick=x=>({status:x.status,action:x.action,proposal:x.proposal,selected:x.selected,pending:x.pending,reason:x.reason});
const results=[],envelope=[],runRises=[],allowedChanges=[];
for(const tl of timelines){
 const a=driver(BEFORE,tl.input,tl.id),b=driver(NOW,tl.input,tl.id);
 if(!a.t.p||!b.t.p){results.push({id:tl.id,tag:tl.tag,identical:a.t.status===b.t.status,generated:false,steps:0,clinicalSteps:0,changedToClinical:0,findings:a.t.status===b.t.status?[]:[{generation:{freeze2:a.t.status,r7b2:b.t.status}}]});continue;}
 let errA=null,errB=null;try{tl.steps(a);}catch(e){errA=String(e.message).slice(0,160);}try{tl.steps(b);}catch(e){errB=String(e.message).slice(0,160);}
 const findings=[],changes=[];
 for(let i=0;i<Math.max(a.t.steps.length,b.t.steps.length);i++){
  const x=a.t.steps[i],y=b.t.steps[i];if(!x||!y){findings.push({step:i,label:(x??y).label,missingOn:x?'R7-B.2':'FREEZE-2'});continue;}
  const pa=a.t.programs[i].p,pb=b.t.programs[i].p,weeks=pa.weeks.map((wk,k)=>prescriptionsOf(wk)!==prescriptionsOf(pb.weeks[k])?k:null).filter(k=>k!==null);
  const same=x.status===y.status&&x.action===y.action&&x.hash===y.hash&&x.ledger===y.ledger&&x.selected===y.selected&&x.proposal===y.proposal&&x.reason===y.reason&&JSON.stringify(x.missing)===JSON.stringify(y.missing)&&x.pending===y.pending;
  if(!same){
   // The one allowed change (contract §5/§7 G4): on a review carrying a clinical signal, a nonclinical question replaced by the clinical route, no
   // proposal on either side, the same program, the same ledger, no prescription differing.
   const allowed=y.clinical&&x.action==='ASK'&&x.status==='ASK'&&!x.proposal&&!y.proposal&&y.status==='CLINICAL_HUMAN_REQUIRED'&&y.action==='CLINICAL_HUMAN_REQUIRED'&&y.pending==='CLINICAL_HUMAN_REQUIRED'&&x.hash===y.hash&&x.ledger===y.ledger&&!weeks.length;
   const row={step:i,label:x.label,clinicalSignal:y.clinical,freeze2:pick(x),r7b2:pick(y),sameProgram:x.hash===y.hash,sameLedger:x.ledger===y.ledger,weeksWithDifferentPrescriptions:weeks};
   (allowed?changes:findings).push(row);if(allowed)allowedChanges.push({timeline:tl.id,...row});
  }
  for(let k=x.w;k<pb.weeks.length;k++){const ra=runOf(pa.weeks[k]),rb=runOf(pb.weeks[k]);if(rb.minutes>ra.minutes||rb.longest>ra.longest||rb.quality>ra.quality)runRises.push({timeline:tl.id,step:i,week:k,freeze2:ra,r7b2:rb});}
 }
 envelope.push(...strengthEnvelope(b.t.p,tl.id));
 results.push({id:tl.id,tag:tl.tag,identical:!findings.length&&!changes.length&&!errA&&!errB,steps:b.t.steps.length,clinicalSteps:b.t.steps.filter(s=>s.clinical).length,changedToClinical:changes.length,findings:findings.slice(0,6),...(errA||errB?{errors:{freeze2:errA,r7b2:errB}}:{})});
}
// The substitution grid: every decision alike (status, selection, the plan it proposes).
const gridRows=[];
for(const input of gridInputs){
 const a=driver(BEFORE,input,'grid:'+input.athlete.id),b=driver(NOW,input,'grid:'+input.athlete.id);for(let w=0;w<3;w++){a.weekly(w);b.weekly(w);}
 const ids=[...new Set(a.t.p.weeks[4].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>e.role!=='PRACTICE').map(e=>e.id)))];
 for(const id of ids)for(const reason of ['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE']){
  const s={exerciseId:id,reason,...(reason==='SKILL_MISMATCH'?{}:{nonclinicalConfirmed:true})};
  const ra=BEFORE.evaluate(a.t.p,{...a.review(3,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:s}),actualLedger:a.t.ledger},BEFORE.opts),rb=NOW.evaluate(b.t.p,{...b.review(3,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:s}),actualLedger:b.t.ledger},NOW.opts);
  const plan=r=>r.proposal?JSON.stringify(r.proposal.weeks.map(prescriptionsOf)):null;
  gridRows.push({program:input.athlete.id,exercise:id,reason,freeze2:{status:ra.status,selected:ra.substitutions?.[0]?.selected??null},r7b2:{status:rb.status,selected:rb.substitutions?.[0]?.selected??null},same:ra.status===rb.status&&ra.reason===rb.reason&&ra.substitutions?.[0]?.selected===rb.substitutions?.[0]?.selected&&plan(ra)===plan(rb)});
 }
}
// The clinical sweep: on every corpus program after two reviewed weeks, reviews that carry a clinical signal outside the B.2 paths (no late
// evidence, no factual question, no resent id) decide alike: substitution pain, injury and clinical text with a named exercise; an illness return.
const sweep=[];
for(const [id,input] of corpusIntakes){
 const a=driver(BEFORE,input,'sweep:'+id),b=driver(NOW,input,'sweep:'+id);if(!a.t.p||!b.t.p)continue;
 for(let w=0;w<2;w++){a.weekly(w);b.weekly(w);}
 const X=a.t.p.weeks[2].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0]??null;
 const cases=[['illness-return',ILL],['injury-return',INJ],...(X?[['pain',sub(X,{pain:true})],['injury',sub(X,{injury:true})],['clinical-text',sub(X,{reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true,text:'Sharp pain in my shoulder'})]]:[])];
 for(const [name,x] of cases){
  const ra=BEFORE.evaluate(a.t.p,{...a.review(2,{day:1,hour:'06:00:00',...x}),actualLedger:a.t.ledger},BEFORE.opts),rb=NOW.evaluate(b.t.p,{...b.review(2,{day:1,hour:'06:00:00',...x}),actualLedger:b.t.ledger},NOW.opts);
  sweep.push({program:id,case:name,freeze2:ra.status,r7b2:rb.status,same:ra.status===rb.status&&ra.action===rb.action&&ra.reason===rb.reason&&!!ra.proposal===!!rb.proposal&&BEFORE.hash(ra.referenceState??null)===NOW.hash(rb.referenceState??null)});
 }
}
// The carried reference state, same input on both runtimes: after the re-entry pain review (FREEZE-2: ASK; R7-B.2: CLINICAL), a later review with no
// signal is given each runtime's state in turn; for one and the same input the two runtimes must decide alike (the sticky rule is unchanged).
const carried=[];
{
 const a=driver(BEFORE,REENTRY,'carry'),b=driver(NOW,REENTRY,'carry');const ea=reentry(a),eb=reentry(b);
 const pa=a.run(a.review(3,{day:4,hour:'06:00:00',...sub(ea.X,{pain:true}),observations:[ea.lateObs()]}),'pain+late',{clinical:true});
 const pb=b.run(b.review(3,{day:4,hour:'06:00:00',...sub(eb.X,{pain:true}),observations:[eb.lateObs()]}),'pain+late',{clinical:true});
 for(const [from,state] of [['the FREEZE-2 state (pending ASK)',pa.referenceState],['the R7-B.2 state (pending CLINICAL_HUMAN_REQUIRED)',pb.referenceState]])for(const [name,make] of [['weekly, no signal',()=>({})],['weekly of the next week',null]]){
  const at=(d,rt)=>make?d.review(3,{day:5,hour:'06:00:00',...make()}):d.review(4,{day:6,hour:'21:00:00',observations:d.t.p.weeks[4].sessions.filter(live).map(s=>d.obs(s))});
  const ra=BEFORE.evaluate(a.t.p,{...at(a),actualLedger:a.t.ledger,referenceState:state},BEFORE.opts),rb=NOW.evaluate(b.t.p,{...at(b),actualLedger:b.t.ledger,referenceState:state},NOW.opts);
  carried.push({given:from,review:name,freeze2:{status:ra.status,proposal:!!ra.proposal},r7b2:{status:rb.status,proposal:!!rb.proposal},same:ra.status===rb.status&&ra.action===rb.action&&ra.reason===rb.reason&&(ra.proposal?.hash??null)===(rb.proposal?.hash??null)});
 }
}
fs.rmSync(tmp,{recursive:true,force:true});
const byTag={};for(const r of results){const x=byTag[r.tag]??={timelines:0,identical:0,changedToClinicalOnly:0,findings:0};x.timelines++;if(r.identical)x.identical++;else if(!r.findings.length&&!r.errors)x.changedToClinicalOnly++;else x.findings++;}
const timelineFindings=results.filter(r=>r.findings.length||r.errors||r.generated===false&&!r.identical);
const changedOffClinical=results.filter(r=>r.changedToClinical&&!r.clinicalSteps);
const gridFindings=gridRows.filter(r=>!r.same),sweepFindings=sweep.filter(r=>!r.same),carriedFindings=carried.filter(r=>!r.same);
const result=timelineFindings.length||changedOffClinical.length||gridFindings.length||sweepFindings.length||carriedFindings.length||envelope.length||runRises.length?'FINDINGS':'PASS';
const report={check:'R7B2-REGRESSION-TIMELINE-DIFFERENTIAL',predecessor:PRED,current:'working tree',timelines:results.length,steps:results.reduce((n,r)=>n+(r.steps??0),0),byTag,
 allowedChanges:{count:allowedChanges.length,rule:'on a review carrying a clinical signal: FREEZE-2 ASK (a nonclinical question, no proposal) -> R7-B.2 CLINICAL_HUMAN_REQUIRED (no proposal, pending CLINICAL_HUMAN_REQUIRED), same program, same ledger, no prescription differing',rows:allowedChanges},
 timelineFindings,substitutionGrid:{decisions:gridRows.length,changed:gridFindings.length,changedRows:gridFindings},clinicalSweep:{programs:new Set(sweep.map(r=>r.program)).size,decisions:sweep.length,clinical:{freeze2:sweep.filter(r=>r.freeze2==='CLINICAL_HUMAN_REQUIRED').length,r7b2:sweep.filter(r=>r.r7b2==='CLINICAL_HUMAN_REQUIRED').length},changed:sweepFindings.length,changedRows:sweepFindings},
 carriedReferenceState:{rows:carried,changed:carriedFindings.length},envelopeFindings:envelope,runRises,b2Paths:results.filter(r=>r.tag==='B2_PATH'||r.tag==='R7B1_PATH'&&r.clinicalSteps).map(r=>({id:r.id,identical:r.identical,clinicalSteps:r.clinicalSteps,changedToClinical:r.changedToClinical,findings:r.findings})),
 result,note:'Identical means every decision of the timeline has the same status, action, reason, missing inputs, selection, proposal, pending reference state, resulting program hash and ledger on both runtimes. A difference is allowed only under the rule above; anything else is listed in timelineFindings.'};
if(process.argv.includes('--write'))fs.writeFileSync(path.join(coach,arg('--out','r7/b2/REGRESSION_R7B2.json')),JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({result,timelines:report.timelines,steps:report.steps,byTag,allowedChanges:allowedChanges.map(r=>({timeline:r.timeline,label:r.label,freeze2:r.freeze2.status+' '+r.freeze2.reason.slice(0,70),r7b2:r.r7b2.status})),timelineFindings:timelineFindings.map(r=>({id:r.id,findings:r.findings.slice(0,2),errors:r.errors})),grid:{decisions:gridRows.length,changed:gridFindings.length},sweep:report.clinicalSweep.decisions+' decisions, changed '+sweepFindings.length,carried,envelopeFindings:envelope.length,runRises:runRises.slice(0,5)},null,1));
process.exitCode=result==='PASS'?0:1;
