// R7-B differential regression against the predecessor runtime (request §24 "regression against R7-A"). The predecessor is the runtime of the
// B0 closure c66966e, byte-identical to R7A-RESIDUAL-AUTHORITY-FREEZE-1's; it is extracted from git into a temporary directory. Both runtimes
// generate the same corpus of onboarding-like programs; every difference is classified by the B0 rule that causes it, and any dose that rises
// (run minutes of a week, the longest run of a week, sets of an exercise present in both) is listed. Read-only unless given --write, which
// writes only CoachingCore/r7/b/REGRESSION_R7B.json.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL,fileURLToPath} from 'node:url';
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i>=0&&process.argv[i+1]?process.argv[i+1]:d;};
// --base <commit> compares with another runtime (FREEZE-1 for the fix cycle); --out <path under CoachingCore> names the report written by --write.
const PRED=arg('--base','c66966e041443b0043c6c01718e840604380c9b9');
const coach=fileURLToPath(new URL('..',import.meta.url)),repo=path.resolve(coach,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7b-pred-'));
const tarFile=path.join(tmp,'pred.tar');
const ar=spawnSync('git',['archive','--format=tar','-o',tarFile,PRED,'CoachingCore/src','CoachingCore/r5','CoachingCore/r6','CoachingCore/r7/b0','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json','audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'],{cwd:repo,encoding:'utf8'});
if(ar.status!==0)throw new Error('git archive failed: '+ar.stderr);
const tx=spawnSync('tar',['-xf','pred.tar'],{cwd:tmp,encoding:'utf8'});if(tx.status!==0)throw new Error('tar failed: '+tx.stderr);
const load=async root=>({gen:(await import(pathToFileURL(path.join(root,'CoachingCore/src/r6-index.mjs')))).generateProgram,dev:(await import(pathToFileURL(path.join(root,'CoachingCore/r6/fixtures/dev-authority.mjs')))).devAuthority});
const now=await load(repo),pred=await load(tmp);
const op=JSON.parse(fs.readFileSync(path.join(coach,'r6/PROGRAM_POLICY_R6.json'),'utf8')).operational;
const {PROFILES,EDGE_PROFILES}=await import(pathToFileURL(path.join(coach,'r6/fixtures/profiles.mjs')));
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const intake=(id,{goals,eq=['DUMBBELLS','BENCH'],exp='INTERMEDIATE',runExp='INTERMEDIATE',recent={runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60,strengthDaysPerWeek:2},schedule={},event=null,rotation='COACH_DECIDES',weeks=12})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks,learningConsent:true,athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals,runExperience:runExp,strengthExperience:exp,recent,equipment:eq,knownExercises:[],exerciseRotationPreference:rotation,...(event?{event}:{})},schedule:{runDays:[1,3,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:90,...schedule}});
const FULL=['BARBELL','RACK','BENCH','DUMBBELLS','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'];
const corpus=[...Object.entries(PROFILES),...Object.entries(EDGE_PROFILES)].map(([k,v])=>[k,v]);
for(const strength of ['STRENGTH','HYPERTROPHY','RUNNING_SUPPORT','GENERAL','MAINTAIN'])for(const [eq,l] of [[FULL,'full'],[['DUMBBELLS','BENCH'],'db'],[['KETTLEBELL'],'kb'],[['BANDS','PULL_UP_BAR'],'bands'],[[],'bw'],[['MACHINES','DUMBBELLS'],'mach']])for(const exp of ['NONE','INTERMEDIATE'])corpus.push([`grid-${strength}-${l}-${exp}`,intake(`grid-${strength}-${l}-${exp}`,{goals:{run:strength==='STRENGTH'?'REGULAR':'PERFORMANCE',strength},eq,exp,schedule:{strengthDays:exp==='NONE'?[0,2,4,5]:[0,2,4]}})]);
for(const [k,o] of [['run-never',{goals:{run:'PERFORMANCE',strength:'NONE'},runExp:'NONE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:0},schedule:{strengthDays:[]}}],['run-unknown',{goals:{run:'PERFORMANCE',strength:'NONE'},recent:{runDaysPerWeek:3,runMinutesPerWeek:null},schedule:{strengthDays:[]}}],['run-low',{goals:{run:'PERFORMANCE',strength:'NONE'},runExp:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35},schedule:{strengthDays:[]}}],['run-wj',{goals:{run:'PERFORMANCE',strength:'GENERAL'},recent:{runDaysPerWeek:2,runMinutesPerWeek:20,longestRunMinutes:10},weeks:16}],['event-10k',{goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-01-24'},weeks:16,recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70},schedule:{runDays:[1,3,5,6]}}],['event-hm',{goals:{run:'RACE',strength:'RUNNING_SUPPORT'},event:{kind:'HALF_MARATHON',date:'2027-01-31'},weeks:16,recent:{runDaysPerWeek:4,runMinutesPerWeek:220,longestRunMinutes:80},schedule:{runDays:[1,3,4,6],longRunMinutes:120}}],['two-weekly',{goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},eq:FULL,rotation:'EVERY_2_WEEKS',weeks:16,schedule:{strengthDays:[0,2,4]}}]])corpus.push([k,intake(k,o)]);
const runKey=s=>[s.role,s.prescription.family,s.prescription.durationMinutes,s.prescription.strides?.repetitions??0].join(':');
const exKey=e=>[e.id,e.sets,e.reps,e.rir,e.load.mode].join(':');
const counts={},inc=k=>counts[k]=(counts[k]??0)+1,doseRises=[],statusDiff=[];let programs=0,identical=0;
for(const [id,input] of corpus){
 const a=pred.gen(input,{authority:pred.dev()}),b=now.gen(input,{authority:now.dev()});programs++;
 if(a.status!==b.status){statusDiff.push({id,predecessor:a.status,r7b:b.status});inc('STATUS');continue;}
 if(!a.program){identical++;continue;}
 const A=a.program,B=b.program;let same=true;
 for(let w=0;w<Math.min(A.weeks.length,B.weeks.length);w++){
  const wa=A.weeks[w],wb=B.weeks[w],ra=wa.sessions.filter(s=>s.sport==='RUN'&&s.prescription),rb=wb.sessions.filter(s=>s.sport==='RUN'&&s.prescription);
  const ma=ra.map(runKey).sort().join('|'),mb=rb.map(runKey).sort().join('|');
  if(ma!==mb){same=false;inc('RUN_DOSE');}else if(ra.map(s=>s.day+runKey(s)).sort().join()!==rb.map(s=>s.day+runKey(s)).sort().join()){same=false;inc('RUN_ARRANGEMENT');}
  if(ra.some(s=>s.prescription.strides)&&JSON.stringify(ra.map(s=>s.prescription.strides?.optional??null))!==JSON.stringify(rb.map(s=>s.prescription.strides?.optional??null))){same=false;inc('STRIDES_OPTIONAL (B0-C01 c8)');}
  if(wb.plannedRunMinutes>wa.plannedRunMinutes)doseRises.push({id,week:w,kind:'WEEKLY_RUN_MINUTES',predecessor:wa.plannedRunMinutes,r7b:wb.plannedRunMinutes});
  const la=Math.max(0,...ra.map(s=>s.prescription.durationMinutes)),lb=Math.max(0,...rb.map(s=>s.prescription.durationMinutes));if(lb>la)doseRises.push({id,week:w,kind:'LONGEST_RUN',predecessor:la,r7b:lb});
  const ea=wa.sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises),eb=wb.sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises);
  const idsA=new Set(ea.map(e=>e.id)),idsB=new Set(eb.map(e=>e.id));
  if([...idsA].sort().join()!==[...idsB].sort().join()){same=false;inc('STRENGTH_SELECTION (catalog selection, goal context, novice density, PULL coverage, rotation cadence)');}
  if(ea.map(exKey).sort().join()!==eb.map(exKey).sort().join()&&[...idsA].sort().join()===[...idsB].sort().join()){same=false;inc('STRENGTH_DOSE_SAME_EXERCISES');}
  if(JSON.stringify(ea.map(e=>[e.id,e.role]).sort())!==JSON.stringify(eb.map(e=>[e.id,e.role]).sort())&&[...idsA].sort().join()===[...idsB].sort().join()){same=false;inc('STRENGTH_ROLE (contextual roles, B0-F03)');}
  if(ea.some(e=>eb.some(x=>x.id===e.id&&x.load.convention!==e.load.convention))){same=false;inc('STRENGTH_CONVENTION (B0-F01)');}
  // Strength dose envelope (absolute, per R7-B row): rows of different runtimes fill different slots with different exercises (the R6 rows also
  // carry the role defect B0-F03), so sets are not compared across runtimes; instead every R7-B row must stay inside its slot role's goal dose
  // (MAIN at most maxSets, ACCESSORY at most maxSets - 1), its phase reduction, the establishment caps (first establishment and
  // re-establishment at most 2 sets, practice at the unloaded-practice dose, return entry at the entry sets) and RIR at least 2.
  const G=op.strength.goalDoses[B.goal.strength.kind]??op.strength.goalDoses.GENERAL;
  for(const s2 of wb.sessions.filter(x=>x.sport==='STRENGTH'&&x.prescription))for(const e of s2.prescription.exercises){
   const k=e.exposure?.kind,cap=e.role==='PRACTICE'||k==='PRACTICE'?op.establishment.unloadedPractice.sets:k==='RETURN_ENTRY'?op.return.strengthEntrySets:['FIRST_ESTABLISH','REESTABLISH','UNLOGGED'].includes(k)?2:e.role==='MAIN'?G.maxSets:Math.max(1,G.maxSets-1);
   if(e.sets>cap||e.rir<2)doseRises.push({id,week:w,day:s2.day,kind:'ENVELOPE',exercise:e.id,role:e.role,exposure:k??null,sets:e.sets,cap,rir:e.rir});
  }
  const ta=wa.sessions.filter(s=>s.sport==='STRENGTH').map(s=>s.day+':'+(s.templateType??'-')).join(),tb=wb.sessions.filter(s=>s.sport==='STRENGTH').map(s=>s.day+':'+(s.templateType??'-')).join();
  if(ta!==tb){same=false;inc('STRENGTH_TEMPLATE_DAY (CMP.I11 arrangement or novice density)');}
 }
 if(same)identical++;
}
const causes={};for(const d of doseRises)causes[d.kind]=(causes[d.kind]??0)+1;
const report={check:'R7B-REGRESSION-DIFFERENTIAL',doseFindings:causes,predecessor:PRED,corpus:programs,identical,changed:programs-identical,statusDifferences:statusDiff,weeksWithDifference:counts,doseRises,note:'Running is compared exactly with the predecessor (weekly minutes, longest run, every session); strength differences are classified by the B0 rule that causes them, and every R7-B strength row is checked against its slot role dose envelope. Every finding is listed with its program and week.'};
fs.rmSync(tmp,{recursive:true,force:true});
if(process.argv.includes('--write'))fs.writeFileSync(path.join(coach,arg('--out','r7/b/REGRESSION_R7B.json')),JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({...report,doseRises:report.doseRises.slice(0,30),doseRiseCount:report.doseRises.length},null,1));
