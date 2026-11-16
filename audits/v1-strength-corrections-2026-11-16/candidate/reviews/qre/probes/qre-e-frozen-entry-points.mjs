// QRE V1STR R1, probe E (independent judge; read-only): what the frozen entry points do with this line's amended file.
// (1) A dev/test caller that supplies a repertoire authority carrying a `strength` field: at 2dfa216 the field is inert; here the frozen entry
//     points read it. Run this file in a clone of 2dfa216 and in one of 21838cb and compare the printed hashes (mode "hash").
// (2) A plan built under the rules (through v1-strength-index), reviewed through the frozen entry points (what custody calls today, D-11):
//     nothing refuses it, and a rebuild brings a hold back (mode "mixed", 21838cb only).
// Run from CoachingCore/: node ../audits/v1-strength-corrections-2026-11-16/candidate/reviews/qre/probes/qre-e-frozen-entry-points.mjs hash|mixed
import {createHash} from 'node:crypto';
import * as V1 from '../../../../../../CoachingCore/src/v1-index.mjs';
import {repertoireAuthority} from '../../../../../../CoachingCore/src/r7b-repertoire.mjs';
const mode=process.argv[2]??'hash';
const sha=o=>createHash('sha256').update(JSON.stringify(o)).digest('hex').slice(0,16);
const ELIG=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const intake={version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-13',startDate:'2026-11-16',weeks:12,timezoneOffsetMinutes:-180,learningConsent:true,
 athlete:{id:'qre-e',ageYears:32,eligibility:ELIG('2026-11-13'),strengthTrainingMonths:24,runTrainingMonths:0,goals:{run:'NONE',strength:'GENERAL'},equipment:[],recent:{strengthDaysPerWeek:3},exerciseRotationPreference:'COACH_DECIDES'},schedule:{strengthDays:[1,3,5],strengthMinutes:60}};
const ids=p=>[...new Set(p.weeks.flatMap(w=>w.sessions.filter(s=>s.prescription&&s.status!=='SKIPPED'&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))))].sort();
if(mode==='population'){
 // The frozen entry point v1-run-forecast-index with no options, over a population and three weekly reviews each: one digest to compare across
 // the two commits.
 const F=await import('../../../../../../CoachingCore/src/v1-run-forecast-index.mjs');
 const EQ={FULL:['BARBELL','RACK','BENCH','DUMBBELLS','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'],DB:['DUMBBELLS'],BW:[],BANDS:['BANDS'],MACH_DB:['DUMBBELLS','BENCH','MACHINES']};
 const digests=[];
 for(const [eq,equipment] of Object.entries(EQ))for(const strength of ['GENERAL','HYPERTROPHY','RUNNING_SUPPORT'])for(const days of [[1,4],[1,3,5],[0,2,4,6]])for(const months of [0,24]){
  const i={...intake,athlete:{...intake.athlete,id:`qre-e-${eq}-${strength}-${days.length}-${months}`,equipment,strengthTrainingMonths:months,goals:{run:'NONE',strength},recent:{strengthDaysPerWeek:months?days.length:0}},schedule:{strengthDays:days,strengthMinutes:60}};
  const g=F.generateProgram(i);digests.push(sha(g));let p=g.program;
  for(let w=0;p&&w<3;w++){const d=new Date(Date.parse(p.weeks[w].startDate+'T00:00:00Z')+6*864e5).toISOString().slice(0,10);
   const r=F.evaluateProgram(p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T20:00:00-03:00`,weekIndex:w,event:{id:`e-${w}`,kind:'WEEKLY_REVIEW'},eligibility:ELIG(d),observations:[]});digests.push(sha(r));if(r.proposal)p=r.proposal;}
 }
 console.log(JSON.stringify({answers:digests.length,digest:sha(digests)}));
}else if(mode==='hash'){
 const rep=repertoireAuthority({asOf:intake.asOf});
 const plain=V1.generateProgram(intake),withField=V1.generateProgram(intake,{repertoire:{...rep,strength:{hold:['front-plank','side-plank','dead-bug']}}});
 console.log(JSON.stringify({plain:sha(plain.program),withStrengthField:sha(withField.program),sameAsPlain:sha(plain.program)===sha(withField.program),holdsWithField:ids(withField.program).filter(i=>/plank|dead-bug/.test(i)),binding:withField.program.repertoire}));
}else{
 const S=await import('../../../../../../CoachingCore/src/v1-strength-index.mjs');
 const {devStrength}=await import('../../../../../../CoachingCore/src/v1-strength.mjs');
 const {DEV,timeline}=await import('../../../../../../CoachingCore/test/v1str-helpers.mjs');
 const t=timeline(intake);t.weeks(0,1);
 const built=ids(t.p).filter(i=>/plank/.test(i));
 const viaFrozen=V1.evaluateProgram(t.p,t.review(2,0,'EQUIPMENT_CHANGE',{changes:{equipment:['BANDS']}},'06:00'),{});
 const viaNew=S.evaluateProgram(t.p,t.review(2,0,'EQUIPMENT_CHANGE',{changes:{equipment:['BANDS']}},'06:00'),DEV);
 console.log(JSON.stringify({binding:t.p.repertoire.strengthExtension,planksAsBuilt:built,frozenStatus:viaFrozen.status,planksAfterFrozenReview:viaFrozen.proposal?ids(viaFrozen.proposal).filter(i=>/plank/.test(i)):null,newStatus:viaNew.status,planksAfterNewReview:viaNew.proposal?ids(viaNew.proposal).filter(i=>/plank/.test(i)):null}));
}
