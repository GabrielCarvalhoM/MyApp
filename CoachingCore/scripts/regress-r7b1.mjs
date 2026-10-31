// R7-B.1 timeline differential against the predecessor runtime R7B-RUNTIME-REPERTOIRE-FREEZE-2 (DOMAIN_COACHING_R7-B.1; request §6 preservation, §7
// R7-A invariants). The predecessor's bytes (commit 10b26d6) are extracted from git into a temporary directory. Both runtimes run the same review
// timelines with the same event and observation identities: the R7-B regression intake corpus reviewed week by week as prescribed through its whole
// horizon, and scenario timelines through the other decision kinds, including the paths the four blockers changed. After every decision the two
// programs are compared (program hash; the weeks whose prescriptions differ) and so are the decisions (status, action).
// - A timeline outside the blocker paths (tag PRESERVE) must be identical step by step.
// - A difference on a blocker path is classified by its blocker; in the substitution grid a changed decision must be one FREEZE-2 could not apply in
//   every slot of the replaced exercise (QE-R7B-R2-04), or the decision is a finding.
// - Every R7-B.1 program is checked against the strength dose envelope (as regress-r7b.mjs) and its running against the predecessor's (no week's run
//   minutes, longest run or quality count above the predecessor's at the same step).
// Read-only unless given --write, which writes only the report named by --out (default r7/b1/REGRESSION_R7B1.json).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL,fileURLToPath} from 'node:url';
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i>=0&&process.argv[i+1]?process.argv[i+1]:d;};
const PRED=arg('--base','10b26d6e40542a066f7f100fbf16060b66e15aee');
const coach=fileURLToPath(new URL('..',import.meta.url)),repo=path.resolve(coach,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7b1-pred-')),tarFile=path.join(tmp,'pred.tar');
const ar=spawnSync('git',['archive','--format=tar','-o',tarFile,PRED,'CoachingCore/src','CoachingCore/r5','CoachingCore/r6','CoachingCore/r7/b0','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json','audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'],{cwd:repo,encoding:'utf8'});
if(ar.status!==0)throw new Error('git archive failed: '+ar.stderr);
const tx=spawnSync('tar',['-xf','pred.tar'],{cwd:tmp,encoding:'utf8'});if(tx.status!==0)throw new Error('tar failed: '+tx.stderr);
const load=async root=>{const idx=await import(pathToFileURL(path.join(root,'CoachingCore/src/r6-index.mjs')));const dev=(await import(pathToFileURL(path.join(root,'CoachingCore/r6/fixtures/dev-authority.mjs')))).devAuthority;return {generate:idx.generateProgram,evaluate:idx.evaluateProgram,opts:{authority:dev()}};};
const NOW=await load(repo),BEFORE=await load(tmp);
const op=JSON.parse(fs.readFileSync(path.join(coach,'r6/PROGRAM_POLICY_R6.json'),'utf8').replace(/^﻿/,'')).operational;
const {PROFILES,EDGE_PROFILES}=await import(pathToFileURL(path.join(coach,'r6/fixtures/profiles.mjs')));

// ---------- the timeline driver (deterministic identities, the same on both runtimes) ----------
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
 const run=(rv,label)=>{const r=rt.evaluate(t.p,{...rv,actualLedger:t.ledger},rt.opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.steps.push({label,w:rv.weekIndex,status:r.status,action:r.action,hash:t.p.hash,selected:r.substitutions?.[0]?.selected??null,missing:r.missingInputs??[]});t.programs.push({w:rv.weekIndex,p:t.p,r});return r;};
 const weekly=(w,{response=()=>null}={})=>run(review(w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(s,{response:response(s)}))}),'weekly:'+w);
 const fixes=(w,pred,at)=>t.ledger.filter(o=>!o.superseded&&t.p.weeks[w].sessions.some(s=>s.id===o.sessionId&&pred(s))).map(o=>({eventId:o.eventId+'-fix',athleteId:o.athleteId,sessionId:o.sessionId,observedAt:o.observedAt,correctionOf:o.eventId,correctedAt:at,actual:structuredClone(o.actual),response:{...o.response,...BAD}}));
 return {t,review,obs,run,weekly,fixes};
}

// ---------- the timelines ----------
const corpusIntakes=[...Object.entries(PROFILES),...Object.entries(EDGE_PROFILES)];
for(const strength of ['STRENGTH','HYPERTROPHY','RUNNING_SUPPORT','GENERAL','MAINTAIN'])for(const [eq,l] of [[FULL,'full'],[['DUMBBELLS','BENCH'],'db'],[['KETTLEBELL'],'kb'],[['BANDS','PULL_UP_BAR'],'bands'],[[],'bw'],[['MACHINES','DUMBBELLS'],'mach']])for(const exp of ['NONE','INTERMEDIATE'])corpusIntakes.push([`grid-${strength}-${l}-${exp}`,intakeOf({id:`grid-${strength}-${l}-${exp}`,goals:{run:strength==='STRENGTH'?'REGULAR':'PERFORMANCE',strength},equipment:eq,strengthExperience:exp,rotation:'COACH_DECIDES',schedule:{strengthDays:exp==='NONE'?[0,2,4,5]:[0,2,4]}})]);
for(const [k,o] of [['run-never',{goals:{run:'PERFORMANCE',strength:'NONE'},runExperience:'NONE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:0},schedule:{strengthDays:[]}}],['run-low',{goals:{run:'PERFORMANCE',strength:'NONE'},runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35},schedule:{strengthDays:[],runMinutes:45},weeks:16}],['run-wj',{goals:{run:'PERFORMANCE',strength:'GENERAL'},recent:{runDaysPerWeek:2,runMinutesPerWeek:20,longestRunMinutes:10},weeks:16}],['event-10k',{goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:['DUMBBELLS','BENCH','KETTLEBELL'],recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6]}}],['event-hm',{goals:{run:'RACE',strength:'RUNNING_SUPPORT'},event:{kind:'HALF_MARATHON',date:'2027-01-31'},weeks:16,recent:{runDaysPerWeek:4,runMinutesPerWeek:220,longestRunMinutes:80},schedule:{runDays:[1,3,4,6],longRunMinutes:120}}],['two-weekly',{goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},equipment:FULL,rotation:'EVERY_2_WEEKS',weeks:16,schedule:{strengthDays:[0,2,4]}}]])corpusIntakes.push([k,intakeOf({id:k,...o})]);
const timelines=[];
// A. PRESERVE: every corpus intake reviewed week by week as prescribed through its whole horizon.
for(const [id,input] of corpusIntakes)timelines.push({id:'corpus:'+id,tag:'PRESERVE',input,steps:d=>{for(let w=0;w<d.t.p.weeks.length;w++)d.weekly(w);}});
// B. PRESERVE: the other decision kinds, away from the blocker paths.
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
// C. The blocker paths.
for(const phase of ['TAPER','RACE_WEEK','POST_EVENT'])for(const reason of ['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE'])for(const [label,input] of [['fixed',EVENT10K],['rotating',{...EVENT10K,athlete:{...EVENT10K.athlete,id:'s-event-rot',exerciseRotationPreference:'EVERY_2_WEEKS'}}]])
 timelines.push({id:`OBS-04:${label}:${phase}:${reason}`,tag:'OBS-04',input,steps:d=>{const wk=d.t.p.phases.phases.indexOf(phase);for(let w=0;w<wk;w++)d.weekly(w);const ids=[...new Set(d.t.p.weeks[wk].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>e.role!=='PRACTICE').map(e=>e.id)))];const id=ids[0];d.run(d.review(wk,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:id,reason,...(reason==='SKILL_MISMATCH'?{}:{nonclinicalConfirmed:true})}}),'substitution:'+id);for(let w=wk;w<Math.min(d.t.p.weeks.length,wk+4);w++)d.weekly(w);}});
timelines.push({id:'R2-01:novice-substitution',tag:'R2-01',input:NOV,steps:d=>{for(let w=0;w<2;w++)d.weekly(w);d.run(d.review(2,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'goblet-squat',reason:'SKILL_MISMATCH'}}),'substitution');for(let w=2;w<6;w++)d.weekly(w);}});
timelines.push({id:'R2-01:novice-schedule',tag:'R2-01',input:{...NOV,athlete:{...NOV.athlete,id:'s-novice-2d'},schedule:{...NOV.schedule,strengthDays:[0,4]}},steps:d=>{d.weekly(0);d.run(d.review(1,{day:0,hour:'06:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4,5]}}),'schedule');for(let w=1;w<6;w++)d.weekly(w);}});
timelines.push({id:'R2-01:novice-kettlebell',tag:'R2-01',input:NOV,steps:d=>{d.weekly(0);d.run(d.review(1,{day:0,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:['KETTLEBELL']}}),'equipment');for(let w=1;w<6;w++)d.weekly(w);}});
timelines.push({id:'R2-02:novice-choice',tag:'R2-02',input:NOV,steps:d=>{for(let w=0;w<5;w++)d.weekly(w);d.run(d.review(5,{day:0,hour:'06:00:00',observations:d.fixes(4,s=>s.sport==='STRENGTH',`${d.t.p.weeks[5].startDate}T05:00:00Z`),choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}]}),'correction+choice');d.run(d.review(5,{day:1,hour:'06:00:00'}),'follow-up');for(let w=5;w<8;w++)d.weekly(w);}});
timelines.push({id:'R2-02:graduation-decline',tag:'R2-02',input:GRAD,steps:d=>{for(let w=0;w<4;w++)d.weekly(w);d.run(d.review(4,{day:0,hour:'06:00:00',observations:d.fixes(3,s=>s.role==='LONG',`${d.t.p.weeks[4].startDate}T05:00:00Z`),choices:[{offer:'RUN_QUALITY_GRADUATION',decision:'DECLINE'}]}),'correction+choice');for(let w=4;w<8;w++)d.weekly(w);}});
for(const variant of ['permanent','window'])timelines.push({id:'R2-03:mismatch-loss:'+variant,tag:'R2-03',input:{...GEN,athlete:{...GEN.athlete,id:'s-gen-loss'}},steps:d=>{for(let w=0;w<3;w++)d.weekly(w);d.run(d.review(3,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'db-rdl',reason:'SKILL_MISMATCH'}}),'substitution');d.weekly(3);d.run(d.review(4,{day:0,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:variant==='permanent'?{equipment:['DUMBBELLS','BENCH']}:{equipment:['DUMBBELLS','BENCH'],from:d.t.p.weeks[5].startDate,to:addDays(d.t.p.weeks[5].startDate,6)}}),'equipment');for(let w=4;w<8;w++)d.weekly(w);}});
// D. The substitution grid of the engineering recheck (N5): every exercise in use in week 4, both reasons, decided on week 3 day 1.
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
const results=[],envelope=[],runRises=[];
for(const tl of timelines){
 const a=driver(BEFORE,tl.input,tl.id),b=driver(NOW,tl.input,tl.id);
 if(!a.t.p||!b.t.p){results.push({id:tl.id,tag:tl.tag,identical:a.t.status===b.t.status,generated:false});continue;}
 let errA=null,errB=null;try{tl.steps(a);}catch(e){errA=String(e.message).slice(0,160);}try{tl.steps(b);}catch(e){errB=String(e.message).slice(0,160);}
 const diffs=[];
 for(let i=0;i<Math.max(a.t.steps.length,b.t.steps.length);i++){
  const x=a.t.steps[i],y=b.t.steps[i];if(!x||!y){diffs.push({step:i,label:(x??y).label,missingOn:x?'R7B1':'FREEZE-2'});continue;}
  const pa=a.t.programs[i].p,pb=b.t.programs[i].p,weeks=pa.weeks.map((wk,k)=>prescriptionsOf(wk)!==prescriptionsOf(pb.weeks[k])?k:null).filter(k=>k!==null);
  if(x.status!==y.status||x.action!==y.action||x.hash!==y.hash||x.selected!==y.selected)diffs.push({step:i,label:x.label,freeze2:{status:x.status,action:x.action,selected:x.selected},r7b1:{status:y.status,action:y.action,selected:y.selected},weeksWithDifferentPrescriptions:weeks,programOnly:!weeks.length&&x.status===y.status&&x.action===y.action&&x.selected===y.selected});
  for(let k=x.w;k<pb.weeks.length;k++){const ra=runOf(pa.weeks[k]),rb=runOf(pb.weeks[k]);if(rb.minutes>ra.minutes||rb.longest>ra.longest||rb.quality>ra.quality)runRises.push({timeline:tl.id,step:i,week:k,freeze2:ra,r7b1:rb});}
 }
 envelope.push(...strengthEnvelope(b.t.p,tl.id));
 results.push({id:tl.id,tag:tl.tag,identical:!diffs.length&&!errA&&!errB,steps:b.t.steps.length,diffs:diffs.slice(0,6),...(errA||errB?{errors:{freeze2:errA,r7b1:errB}}:{})});
}
// The substitution grid: a decision that changed must be one FREEZE-2 could not apply in every slot of the replaced exercise (QE-R7B-R2-04).
const gridRows=[];
for(const input of gridInputs){
 const a=driver(BEFORE,input,'grid:'+input.athlete.id),b=driver(NOW,input,'grid:'+input.athlete.id);for(let w=0;w<3;w++){a.weekly(w);b.weekly(w);}
 const ids=[...new Set(a.t.p.weeks[4].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>e.role!=='PRACTICE').map(e=>e.id)))];
 for(const id of ids)for(const reason of ['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE']){
  const sub={exerciseId:id,reason,...(reason==='SKILL_MISMATCH'?{}:{nonclinicalConfirmed:true})};
  const ra=BEFORE.evaluate(a.t.p,{...a.review(3,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:sub}),actualLedger:a.t.ledger},BEFORE.opts),rb=NOW.evaluate(b.t.p,{...b.review(3,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:sub}),actualLedger:b.t.ledger},NOW.opts);
  // The engineering recheck's criterion (N5): in every week-4 session that held the replaced exercise, its slot (same pattern and role) prescribes the
  // exercise the decision selected.
  const consistent=(r,p)=>{if(r.status!=='MODIFY')return null;const sel=r.substitutions[0].selected,pat=p.weeks[4].sessions.flatMap(s=>s.prescription?.exercises??[]).find(e=>e.id===id)?.pattern;
   return p.weeks[4].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').every(s=>{const old=s.prescription.exercises.find(e=>e.id===id);if(!old)return true;const now=(r.proposal.weeks[4].sessions.find(x=>x.id===s.id)?.prescription?.exercises??[]).filter(e=>e.pattern===pat&&e.role===old.role).map(e=>e.id);return now.includes(sel);});};
  // Plans are compared by what they prescribe (a template row's fallbackFor marker is no prescription).
  const plan=r=>r.proposal?JSON.stringify(r.proposal.weeks.map(prescriptionsOf)):null;
  const same=ra.status===rb.status&&ra.substitutions?.[0]?.selected===rb.substitutions?.[0]?.selected&&plan(ra)===plan(rb);
  gridRows.push({program:input.athlete.id,exercise:id,reason,freeze2:{status:ra.status,selected:ra.substitutions?.[0]?.selected??null,consistent:consistent(ra,a.t.p)},r7b1:{status:rb.status,selected:rb.substitutions?.[0]?.selected??null,consistent:consistent(rb,b.t.p),...(rb.status==='ASK'?{reason:String(rb.reason).slice(0,200)}:{})},same});
 }
}
fs.rmSync(tmp,{recursive:true,force:true});
const byTag={};for(const r of results){const x=byTag[r.tag]??={timelines:0,identical:0,changed:0};x.timelines++;r.identical?x.identical++:x.changed++;}
const preserveFindings=results.filter(r=>r.tag==='PRESERVE'&&!r.identical);
const gridChanged=gridRows.filter(r=>!r.same),gridFindings=gridChanged.filter(r=>r.freeze2.consistent!==false);
const report={check:'R7B1-REGRESSION-TIMELINE-DIFFERENTIAL',predecessor:PRED,current:'working tree',timelines:results.length,byTag,preserveFindings,
 substitutionGrid:{decisions:gridRows.length,applied:{freeze2:gridRows.filter(r=>r.freeze2.status==='MODIFY').length,r7b1:gridRows.filter(r=>r.r7b1.status==='MODIFY').length},inconsistent:{freeze2:gridRows.filter(r=>r.freeze2.consistent===false).length,r7b1:gridRows.filter(r=>r.r7b1.consistent===false).length},changed:gridChanged.length,changedWhereFreeze2WasConsistent:gridFindings,changedRows:gridChanged},
 envelopeFindings:envelope,runRises,blockerPathDifferences:results.filter(r=>r.tag!=='PRESERVE').map(r=>({id:r.id,tag:r.tag,identical:r.identical,diffs:r.diffs})),
 result:preserveFindings.length||gridFindings.length||envelope.length||runRises.length?'FINDINGS':'PASS',
 note:'Identical means every decision of the timeline has the same status, action, selection and resulting program hash on both runtimes. PRESERVE timelines must be identical; blocker-path timelines are listed with the steps that differ.'};
if(process.argv.includes('--write'))fs.writeFileSync(path.join(coach,arg('--out','r7/b1/REGRESSION_R7B1.json')),JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({result:report.result,timelines:report.timelines,byTag,preserveFindings:preserveFindings.map(r=>({id:r.id,diffs:r.diffs.slice(0,2),errors:r.errors})),grid:{...report.substitutionGrid,changedRows:undefined},envelopeFindings:envelope.length,runRises:runRises.slice(0,5)},null,1));
process.exitCode=report.result==='PASS'?0:1;
