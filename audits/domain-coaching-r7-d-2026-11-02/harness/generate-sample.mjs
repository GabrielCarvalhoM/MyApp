// R7-D generated intake sample (R7D-GENERATOR-1). Onboarding-only cases drawn from the public interface vocabulary (INTERFACE_ONLY_R7D §3):
// no runtime import, no runtime rule, no tuning. The seed is a function of the evaluated freeze's manifest digest, so the sample cannot be
// chosen after seeing outputs: seed = sha256('R7D-SAMPLE|' + label + '|' + manifestDigest). Distributions are fixed below, before any run.
// They test only invariant properties at onboarding (P02, P06 week 0, P07, P11, P12, P13); they carry no domain expectation.
//   node generate-sample.mjs --manifest-digest <hex> --label <DIAGNOSTIC|FINAL> --count <n> --out <file>
import fs from 'node:fs';
import {sha256,prng,addDays} from './lib/util.mjs';

export const GENERATOR_VERSION='R7D-GENERATOR-1';
const arg=(k,d=null)=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:d;};
const LIB={SQUAT:['back-squat','goblet-squat','kb-goblet-squat','leg-press','box-squat-bodyweight'],HINGE:['barbell-rdl','db-rdl','kb-deadlift','hip-thrust-db','glute-bridge'],LUNGE:['db-split-squat','db-step-up','reverse-lunge'],PUSH:['bench-press','db-bench-press','db-floor-press','machine-chest-press','push-up','db-overhead-press'],PULL:['one-arm-db-row','db-row','barbell-row','lat-pulldown','seated-cable-row','pull-up','band-row']};
const EQ={'back-squat':['BARBELL','RACK'],'goblet-squat':['DUMBBELLS'],'kb-goblet-squat':['KETTLEBELL'],'leg-press':['MACHINES'],'box-squat-bodyweight':[],'barbell-rdl':['BARBELL'],'db-rdl':['DUMBBELLS'],'kb-deadlift':['KETTLEBELL'],'hip-thrust-db':['DUMBBELLS','BENCH'],'glute-bridge':[],'db-split-squat':['DUMBBELLS'],'db-step-up':['DUMBBELLS','BENCH'],'reverse-lunge':[],'bench-press':['BARBELL','BENCH','RACK'],'db-bench-press':['DUMBBELLS','BENCH'],'db-floor-press':['DUMBBELLS'],'machine-chest-press':['MACHINES'],'push-up':[],'db-overhead-press':['DUMBBELLS'],'one-arm-db-row':['DUMBBELLS','BENCH'],'db-row':['DUMBBELLS'],'barbell-row':['BARBELL'],'lat-pulldown':['MACHINES'],'seated-cable-row':['MACHINES'],'pull-up':['PULL_UP_BAR'],'band-row':['BANDS']};
const CONV=id=>EQ[id].includes('BARBELL')||EQ[id].includes('MACHINES')?'TOTAL':EQ[id].includes('DUMBBELLS')?'PER_HAND':EQ[id].includes('KETTLEBELL')?'SINGLE_IMPLEMENT':'BODYWEIGHT';
const KG={TOTAL:[30,120],PER_HAND:[6,30],SINGLE_IMPLEMENT:[8,32]};

export function generateSample({manifestDigest,label,count}){
 const seed=sha256(`R7D-SAMPLE|${label}|${manifestDigest}`),r=prng(seed);
 const pick=a=>a[Math.floor(r()*a.length)],chance=p=>r()<p,int=(a,b)=>a+Math.floor(r()*(b-a+1));
 const subset=(a,min,max)=>{const n=int(min,max),s=[...a].sort(()=>r()-0.5);return s.slice(0,n).sort((x,y)=>x-y);};
 const cases=[];
 for(let n=0;n<count;n++){
  const weeks=pick([4,8,12,16]),latest=Math.max(0,Math.floor((Date.parse('2027-04-30')-Date.parse('2026-11-09'))/864e5)-weeks*7);
  const startDate=addDays('2026-11-09',int(0,Math.min(latest,60))),asOf=addDays(startDate,-int(0,3));
  const runKind=pick(['RACE_10K','RACE_HALF','PERFORMANCE','REGULAR','GENERAL','NONE']),strength=pick(['STRENGTH','HYPERTROPHY','RUNNING_SUPPORT','MAINTAIN','GENERAL',runKind==='NONE'?'GENERAL':'NONE']);
  const end=addDays(startDate,weeks*7-1),race=runKind.startsWith('RACE')?addDays(end,-int(0,Math.min(13,weeks*7-1))):null;
  const marathon=chance(0.04);
  const goals={run:runKind.startsWith('RACE')?{kind:'RACE',event:{kind:marathon?'MARATHON':runKind==='RACE_10K'?'10K':'HALF_MARATHON',date:race}}:runKind,strength};
  const runExp=pick(['NONE','NOVICE','INTERMEDIATE','EXPERIENCED',undefined]),strExp=pick(['NONE','NOVICE','INTERMEDIATE','EXPERIENCED',undefined]);
  const runs=runKind==='NONE'?[]:subset([0,1,2,3,4,5,6],1,6),strs=strength==='NONE'?[]:subset([0,1,2,3,4,5,6],1,5);
  const ALL_EQ=['BODYWEIGHT','DUMBBELLS','BARBELL','RACK','BENCH','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'];
  const equipment=chance(0.2)?['BODYWEIGHT']:[...ALL_EQ].sort(()=>r()-0.5).slice(0,int(1,9));
  const have=new Set(equipment);
  const known=chance(0.4)?Object.values(LIB).map(xs=>xs.filter(id=>EQ[id].every(e=>have.has(e)))).filter(xs=>xs.length).slice(0,int(1,3)).map(xs=>{const id=pick(xs),c=CONV(id);return {id,sets:int(2,5),reps:pick([5,6,8,10,12]),load:c==='BODYWEIGHT'?{value:0,unit:'KG',convention:'BODYWEIGHT'}:{value:int(...KG[c]),unit:'KG',convention:chance(0.15)&&c==='PER_HAND'?'TOTAL':c},rir:int(1,4),current:true,familiar:chance(0.8),tolerated:true,observedAt:addDays(asOf,-int(1,20))};}).map(k=>k.load.convention==='TOTAL'&&CONV(k.id)==='PER_HAND'?{...k,load:{...k.load,value:k.load.value*2}}:k):[];
  const flags={pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false};
  const e=r();let eligibility;
  if(e<0.06)eligibility={status:'UNKNOWN',assessedAt:asOf};
  else if(e<0.12){const k=pick(Object.keys(flags));eligibility={status:'NONCLINICAL_CONFIRMED',assessedAt:asOf,...flags,[k]:true};}
  else if(e<0.16){const {[pick(Object.keys(flags))]:_,...rest}=flags;eligibility={status:'NONCLINICAL_CONFIRMED',assessedAt:asOf,...rest};}
  else eligibility={status:'NONCLINICAL_CONFIRMED',assessedAt:asOf,...flags};
  const runDaysRecent=runExp==='NONE'?0:int(0,6),longest=runDaysRecent?int(15,runExp==='EXPERIENCED'?150:90):undefined;
  const athlete={id:`gen-${n}`,...(chance(0.03)?{ageYears:int(15,17)}:{ageEligible:true}),eligibility,goals,...(runExp?{runExperience:runExp}:{}),...(strExp?{strengthExperience:strExp}:{}),
   recent:{runDaysPerWeek:runDaysRecent,...(runDaysRecent?{runMinutesPerWeek:runDaysRecent*int(20,60),longestRunMinutes:longest}:{}),strengthDaysPerWeek:int(0,4)},
   equipment,...(known.length?{knownExercises:known}:{}),exerciseRotationPreference:pick(['COACH_DECIDES','EVERY_6_WEEKS','EVERY_2_WEEKS','FIXED']),
   ...(chance(0.03)?{specialPopulation:['PREGNANCY']}:{}),...(chance(0.08)?{pause:{nonclinical:true,weeks:int(2,10),reasonCategory:pick(['WORK','TRAVEL','FAMILY','STUDY'])}}:{})};
  const schedule={runDays:runs,strengthDays:strs,runTurn:pick(['AM','PM']),strengthTurn:pick(['AM','PM']),runMinutes:int(20,90),strengthMinutes:int(20,75),...(runs.length?{longRunDay:pick(runs),longRunMinutes:int(30,150)}:{}),sameTurnConfirmed:chance(0.5)};
  const intake={version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,startDate,weeks,learningConsent:chance(0.7),timezoneOffsetMinutes:pick([-180,0,60,330]),athlete,schedule};
  const tags=['COLD_START',`H${weeks}`,runKind==='RACE_10K'?'RACE_10K':runKind==='RACE_HALF'?'RACE_HALF':'NON_RACE',...(new Date(startDate+'T00:00:00Z').getUTCDay()!==1?['START_NON_MONDAY']:[]),...(eligibility.status!=='NONCLINICAL_CONFIRMED'||Object.keys(flags).some(k=>typeof eligibility[k]!=='boolean')?['ELIGIBILITY_UNKNOWN']:[]),...(Object.keys(flags).some(k=>eligibility[k]===true)?['CLINICAL_SIGNAL']:[]),...(marathon||athlete.ageYears||athlete.specialPopulation?['OUT_OF_SCOPE']:[]),...(equipment.length===1&&equipment[0]==='BODYWEIGHT'?['BODYWEIGHT_ONLY']:[]),...(runs.some(d=>strs.includes(d))?['SHARED_DAYS']:[])];
  cases.push({caseId:`R7D-G${String(n+1).padStart(3,'0')}`,authorIntent:'Generated onboarding intake (invariant properties only)',coverageTags:tags,oracleClass:'INVARIANT_ORACLE',intake,timeline:[],expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:{rationale:'generated',preferredCoachingBehavior:'not asserted (invariants only)',acceptableAlternatives:[],concerns:[]},domainNotes:''});
 }
 return {corpusRevision:`R7D-GENERATED-${label}-1`,generator:GENERATOR_VERSION,seed,seedRule:"sha256('R7D-SAMPLE|'+label+'|'+manifestDigest)",manifestDigest,label,count,cases};
}
if(process.argv[1]&&process.argv[1].endsWith('generate-sample.mjs')){
 const s=generateSample({manifestDigest:arg('--manifest-digest'),label:arg('--label','DIAGNOSTIC'),count:Number(arg('--count','96'))});
 const bytes=JSON.stringify(s,null,1)+'\n';fs.writeFileSync(arg('--out'),bytes,{flag:'wx'});
 console.log(JSON.stringify({out:arg('--out'),cases:s.cases.length,seed:s.seed,sha256:sha256(Buffer.from(bytes))}));
}
