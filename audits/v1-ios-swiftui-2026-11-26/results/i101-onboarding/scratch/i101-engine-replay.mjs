// RepMile #101 engine replay (read-only CoachingCore, in-memory store, synthetic athletes). Usage: node i101-engine-replay.mjs <repo root>
// 0. A JS replica of OnboardingDraft.build (Swift, front C) reproduces the Swift golden request of OnboardingTests.lucasGolden byte for byte.
// 1. The Figma personas the onboarding can send today (Lucas 10 km; the marathon with every criterion; the marathon without the base) are
//    accepted by the real engine through the real boundary (api.onboard), with the outcome the screens map.
// 2. The personas held by an open decision (Rafa and Marina: no plan length without a race, D03) are replayed ONLY to show what the held field
//    changes: with `weeks` given as the engine's own default (12, an assumption marked here, never sent by the app) they are accepted.
// 3. The safety and scope outcomes the onboarding maps (clinical sign, age outside 18–80, race under 7 days) and the D02 encodings.
// 4. Copy checks the screens rely on: the week-1 strength of a never-trained athlete (25 Marina note), the full-gym preset.
import fs from 'node:fs';
const ROOT=process.argv[2];
const {athlete}=await import(ROOT+'/CoachingCore/test/v1int-helpers.mjs');
let failures=0;const check=(label,cond,extra='')=>{console.log(`  ${cond?'PASS':'FAIL'} ${label}${extra?' · '+extra:''}`);if(!cond)failures++;};
const sorted=v=>Array.isArray(v)?v.map(sorted):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sorted(v[k])])):v;
const days=(a,b)=>Math.round((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000);
const planWeeks=(start,race)=>{const g=days(start,race);return g<0?null:[4,8,12,16].find(w=>g<w*7)??null;};
const FULL_GYM=['BARBELL','RACK','BENCH','DUMBBELLS','MACHINES'];

// ---- The Swift builder, line for line (OnboardingDraft+Answers.build, OnboardingChoices). ----
const MONTHS={never:0,underSixMonths:1,sixMonthsToTwoYears:6,overTwoYears:24},TURN={morning:'AM',afternoon:'PM',night:'PM'};
function build(d,{athleteId,today,start,weeksOverride=null}){
 const runs=d.train!=='strengthOnly',lifts=d.train!=='runOnly';
 const eligibility=d.careNone?{status:'NONCLINICAL_CONFIRMED',pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false}
  :Object.fromEntries(['pain','persistentPain','injury','illness','functionalLimitation','clinicalConcern'].filter(k=>d.care.includes(k)).map(k=>[k,true]));
 const startRunning=d.runAim?.noRace==='startRunning';
 const runMonths=startRunning?(['never','stopped'].includes(d.runStart)?0:MONTHS[d.runBand]):MONTHS[d.runBand];
 const sd=d.strengthBand==='never'?0:d.recentStrengthDays;
 let recent;if(startRunning&&d.runStart==='never')recent={longestRunMinutes:0,runDaysPerWeek:0,runMinutesPerWeek:0,strengthDaysPerWeek:sd};
 else if(startRunning&&d.runStart==='stopped')recent=d.recentRunDaysChoice===0?{longestRunMinutes:0,runDaysPerWeek:0,runMinutesPerWeek:0,strengthDaysPerWeek:sd}:null;
 else recent={longestRunMinutes:d.longestRunMinutes,runDaysPerWeek:d.recentRunDays,runMinutesPerWeek:d.recentRunMinutes,strengthDaysPerWeek:sd};
 const KIND={officialRace:'RACE_RESULT',track:'TIME_TRIAL'},MEAS={officialRace:'OFFICIAL',track:'TRACK'};
 const anchors=d.hasResult?[{date:d.resultDay,distance:d.resultDistance,kind:KIND[d.resultMeasure],measurement:MEAS[d.resultMeasure],rpe:d.resultEffort,seconds:d.resultMinutes*60+d.resultSeconds,tolerated:d.resultTolerated}]:[];
 const race=d.runAim?.race;
 const run=race?{event:{date:d.raceDay,kind:race},kind:'RACE'}:{kind:{startRunning:'GENERAL',regularity:'REGULAR',performance:'PERFORMANCE'}[d.runAim?.noRace]};
 const weeks=race?planWeeks(start,d.raceDay):weeksOverride;
 const equipment=d.strengthPlace==='fullGym'?FULL_GYM:d.strengthPlace==='bodyweightOnly'?['BODYWEIGHT']:[...d.gymItems].sort();
 return {athlete:{ageYears:d.age,eligibility:{...eligibility,assessedAt:today},equipment,exerciseRotationPreference:'COACH_DECIDES',goals:{run,strength:d.strengthAim},id:athleteId,
  performanceAnchors:anchors,recent,runTrainingMonths:runMonths,specialPopulation:d.specialPopulation??[],strengthTrainingMonths:MONTHS[d.strengthBand]},
  schedule:{longRunDay:d.longRunDay,longRunMinutes:d.longRunMinutes,runDays:[...d.runDays].sort(),runMinutes:d.runMinutes,runTurn:TURN[d.runTurn],
   strengthDays:[...d.strengthDays].sort(),strengthMinutes:d.strengthMinutes,strengthTurn:TURN[d.strengthTurn]},startDate:start,weeks};
}
// IntakeRequest.encode (CoachingPresentation): the host's fields around the answers.
const intake=(a,asOf,learning)=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,startDate:a.startDate,weeks:a.weeks,timezoneOffsetMinutes:-180,learningConsent:learning,athlete:a.athlete,schedule:a.schedule});

// ---- The personas (OnboardingTests.lucas / marathon / marathonPrep; OnboardingDebugSeed rafa / marina). ----
const lucas={train:'both',runAim:{race:'10K'},raceDay:'2026-12-20',strengthAim:'STRENGTH',runDays:[1,3,5,6],strengthDays:[0,2,3],runTurn:'night',strengthTurn:'morning',longRunDay:5,
 runMinutes:60,longRunMinutes:100,strengthMinutes:55,strengthPlace:'fullGym',gymItems:[],age:32,recentRunDays:4,recentRunMinutes:200,longestRunMinutes:80,runBand:'overTwoYears',
 hasResult:true,resultDistance:'5K',resultMinutes:21,resultSeconds:48,resultDay:'2026-10-18',resultMeasure:'officialRace',resultEffort:9,resultTolerated:true,
 strengthBand:'overTwoYears',recentStrengthDays:3,care:[],careNone:true};
const marathon={...lucas,runAim:{race:'MARATHON'},raceDay:'2027-02-28',runDays:[0,1,3,4,6],strengthDays:[2],longRunDay:6,runMinutes:70,longRunMinutes:210,
 recentRunDays:5,recentRunMinutes:360,longestRunMinutes:150,hasResult:false};
const marathonPrep={...marathon,runDays:[1,3,6],strengthDays:[0,2],runMinutes:50,longRunMinutes:120,recentRunDays:3,recentRunMinutes:120,longestRunMinutes:50,runBand:'sixMonthsToTwoYears'};
const rafa={...lucas,runAim:{noRace:'performance'},raceDay:null,runDays:[1,3,6],strengthDays:[0],longRunDay:6,hasResult:false};
const marina={...lucas,runAim:{noRace:'startRunning'},raceDay:null,runStart:'never',runDays:[1,3,5],strengthDays:[2],longRunDay:5,runMinutes:20,longRunMinutes:20,strengthMinutes:15,
 strengthPlace:'bodyweightOnly',recentRunDays:null,recentRunMinutes:null,longestRunMinutes:null,runBand:null,hasResult:false,strengthBand:'never',recentStrengthDays:null};

let seq=0;const newId=p=>`${p}_${String(++seq).padStart(6,'0')}`;
function onboard(name,body,{asOf,consents={COACHING:true,HEALTH_SIGNALS:false,LEARNING:false}}){
 const t=athlete({newId,id:'i101-'+name,start:asOf+'T12:00:00-03:00'});
 const answer=t.api.onboard({actor:t.actor,intake:JSON.parse(JSON.stringify(body)),consents,clientRequestId:name+'-1'});
 return {t,answer};
}
const summary=(t)=>{const o=t.it.read({actor:t.actor});if(!o.ok)return {};const p=o.doc.program;const w0=p?.weeks?.[0]?.sessions??[];
 return {weeks:p?.weeks?.length,phases:[...new Set((p?.weeks??[]).map(w=>w.phase).filter(Boolean))],week1:w0.map(s=>`${s.date} ${s.sport} ${s.role}`)}};

console.log('=== 0 replica == Swift golden (OnboardingTests.lucasGolden)');
{const src=fs.readFileSync(ROOT+'/ios/Packages/RepMileUI/Tests/RepMileUIUnitTests/OnboardingTests.swift','utf8');
 const golden=src.match(/static let lucasGolden = #"(.*?)"#/)[1];
 const mine=JSON.stringify(sorted(build(lucas,{athleteId:'i101-athlete',today:'2026-10-24',start:'2026-10-26'})));
 check('the JS replica encodes exactly the Swift golden answers',mine===golden);}

console.log('=== 1 personas the onboarding sends today');
for(const [name,d,asOf,start,expect] of [['lucas',lucas,'2026-10-24','2026-10-26',8],['marathon',marathon,'2026-11-07','2026-11-09',16],['marathon-prep',marathonPrep,'2026-11-07','2026-11-09',16]]){
 const a=build(d,{athleteId:'i101-'+name,today:asOf,start});
 const {t,answer}=onboard(name,intake(a,asOf,false),{asOf});
 const s=summary(t);
 console.log(`  ${name}: status=${answer.status} enrolled=${answer.enrolled} weeks=${a.weeks} phases=${s.phases?.join(',')}`);
 console.log(`    week 1: ${s.week1?.join(' | ')}`);
 check(`${name}: accepted (PROPOSED, enrolled)`,answer.ok&&answer.status==='PROPOSED'&&answer.enrolled!==false,JSON.stringify(answer.error??answer.missingInputs??''));
 check(`${name}: plan of ${expect} weeks`,s.weeks===expect&&a.weeks===expect);
 if(name==='marathon')check('marathon with every criterion: a race-shaped plan (specific/taper/race week)',s.phases.some(p=>['SPECIFIC','TAPER','RACE_WEEK'].includes(p)));
 if(name==='marathon-prep')check('marathon without the base: the preparatory plan (no specific, taper or race week)',!s.phases.some(p=>['SPECIFIC','TAPER','RACE_WEEK'].includes(p)));
 if(name==='lucas'){const pr=t.it.presentation({actor:t.actor}).readings?.runCalibration;check('lucas: calibrated by the 5 km result (31 "Ritmos calibrados")',pr?.capacity?.status==='CALIBRATED'&&pr?.paceBands?.EASY?.status==='AVAILABLE',pr?.capacity?.status);
  check('lucas: a 10 km estimate exists (31 "Capacidade atual nos 10 km")',pr?.estimates?.['10K']?.status==='AVAILABLE');}
}

console.log('=== 2 personas held by D03 (no plan length without a race): weeks=12 is a REPLAY ASSUMPTION (the engine default), never sent by the app');
for(const [name,d] of [['rafa',rafa],['marina',marina]]){
 const a=build(d,{athleteId:'i101-'+name,today:'2026-11-07',start:'2026-11-09',weeksOverride:12});
 const {t,answer}=onboard(name,intake(a,'2026-11-07',false),{asOf:'2026-11-07'});
 const s=summary(t);
 console.log(`  ${name}: run goal=${a.athlete.goals.run.kind} recent=${JSON.stringify(a.athlete.recent)} status=${answer.status}`);
 console.log(`    week 1: ${s.week1?.join(' | ')}`);
 check(`${name}: accepted once weeks is given`,answer.ok&&answer.status==='PROPOSED',JSON.stringify(answer.missingInputs??answer.error??''));
 if(name==='marina'){const w=t.doc().program.weeks[0].sessions.filter(x=>x.sport==='STRENGTH');
  check('marina (never trained, bodyweight): week-1 strength has no external load (25 note "prática com o peso do corpo")',w.length>0&&w.every(x=>(x.prescription?.exercises??[]).every(e=>!e.load||e.load.unit==='BODYWEIGHT'||e.load.value==null)),w.map(x=>x.role+':'+(x.prescription?.exercises??[]).map(e=>e.id).join('/')).join(' '));}
}

console.log('=== 3 outcomes the screens map');
{const clinical={...lucas,careNone:false,care:['persistentPain']};
 const r=onboard('clinical',intake(build(clinical,{athleteId:'i101-clinical',today:'2026-10-24',start:'2026-10-26'}),'2026-10-24',false),{asOf:'2026-10-24'}).answer;
 check('a marked sign: CLINICAL_HUMAN_REQUIRED (→ 838:3689)',r.status==='CLINICAL_HUMAN_REQUIRED',`status=${r.status} enrolled=${r.enrolled}`);
 const age=onboard('age16',intake(build({...lucas,age:16},{athleteId:'i101-age16',today:'2026-10-24',start:'2026-10-26'}),'2026-10-24',false),{asOf:'2026-10-24'}).answer;
 check('age 16: UNSUPPORTED, not enrolled (D16 → 838:4053)',age.status==='UNSUPPORTED'&&age.enrolled===false,`status=${age.status}`);
 const close=onboard('close',intake(build({...lucas,raceDay:'2026-10-30'},{athleteId:'i101-close',today:'2026-10-24',start:'2026-10-26'}),'2026-10-24',false),{asOf:'2026-10-24'}).answer;
 check('a race 4 days after the start: INVALID_INPUT (D04 → 838:3972)',close.status==='INVALID_INPUT',`status=${close.status}`);
 for(const codes of [['PREGNANCY'],['POSTPARTUM'],['PREGNANCY','POSTPARTUM']]){
  const p={...lucas,careNone:false,care:[],specialPopulation:codes};
  const x=onboard('sp-'+codes.join('-'),intake(build(p,{athleteId:'i101-sp',today:'2026-10-24',start:'2026-10-26'}),'2026-10-24',false),{asOf:'2026-10-24'}).answer;
  check(`D02 option ${JSON.stringify(codes)} (flags unanswered): UNSUPPORTED, not enrolled`,x.status==='UNSUPPORTED'&&x.enrolled===false,`status=${x.status}`);
 }}

console.log('=== 4 SSCTR C4: a clinical answer, then the same athlete onboarding again with "Nenhum destes"');
{const clinical={...lucas,careNone:false,care:['persistentPain']};
 const t=athlete({newId,id:'i101-c4',start:'2026-10-24T12:00:00-03:00'});
 const first=t.api.onboard({actor:t.actor,intake:intake(build(clinical,{athleteId:'i101-c4',today:'2026-10-24',start:'2026-10-26'}),'2026-10-24',false),consents:{COACHING:true,HEALTH_SIGNALS:false,LEARNING:false},clientRequestId:'c4-1'});
 const again=t.api.onboard({actor:t.actor,intake:intake(build(lucas,{athleteId:'i101-c4',today:'2026-10-24',start:'2026-10-26'}),'2026-10-24',false),consents:{COACHING:true,HEALTH_SIGNALS:false,LEARNING:false},clientRequestId:'c4-2'});
 console.log(`  first: ${first.status} enrolled=${first.enrolled} · resubmitted with "Nenhum destes": ${again.status} enrolled=${again.enrolled}`);
 check('the engine keeps no record of the clinical answer at enrolment (CLINICAL_HUMAN_REQUIRED, not enrolled)',first.status==='CLINICAL_HUMAN_REQUIRED'&&first.enrolled===false);
 check('so a resubmission with other answers WOULD be enrolled: the app must never resend a held draft (OnboardingViewModel: heldForSafety)',again.status==='PROPOSED'&&again.enrolled!==false,`status=${again.status}`);}

console.log('=== 5 SSCTR C1: a never-trained strength athlete, week 1 and week 2 strength, by strength days and equipment');
{const EQ={'full gym':{strengthPlace:'fullGym',gymItems:[]},'dumbbells':{strengthPlace:'home',gymItems:['DUMBBELLS']},'bodyweight':{strengthPlace:'bodyweightOnly',gymItems:[]}};
 const DAYS={1:[2],2:[0,2],3:[0,2,4]};
 // The note's two facts: week 1 is bodyweight practice only, and week 2 carries external loads.
 const bodyweightOnly=ss=>ss.every(x=>(x.prescription?.exercises??[]).every(e=>e.load?.unit==='BODYWEIGHT'));
 const externalLoads=ss=>ss.some(x=>(x.prescription?.exercises??[]).some(e=>e.load&&e.load.unit!=='BODYWEIGHT'));
 let row=0;
 for(const [eqName,eq] of Object.entries(EQ))for(const [n,days] of Object.entries(DAYS)){
  const d={...lucas,...eq,strengthBand:'never',recentStrengthDays:null,strengthDays:days,runDays:[1,3,5,6].filter(x=>!days.includes(x)||x===3),careNone:true};
  if(!d.runDays.includes(d.longRunDay))d.longRunDay=d.runDays.at(-1);
  const a=build(d,{athleteId:'i101-c1-'+(++row),today:'2026-10-24',start:'2026-10-26'});
  const {t,answer}=onboard('c1-'+row,intake(a,'2026-10-24',false),{asOf:'2026-10-24'});
  if(answer.status!=='PROPOSED'){check(`C1 ${n} day(s) × ${eqName}: accepted`,false,answer.status);continue;}
  const w=k=>t.doc().program.weeks[k].sessions.filter(x=>x.sport==='STRENGTH');
  const w1=w(0),w2=w(1);
  const describe=ss=>ss.map(x=>x.role+':'+(x.prescription?.exercises??[]).map(e=>e.id+(e.load?.value!=null?`@${e.load.value}${e.load.unit}`:e.load?.mode?`@${e.load.mode}`:'')).join('/')).join(' ');
  console.log(`  ${n} day(s) × ${eqName}: week 1 = ${describe(w1)}`);
  console.log(`  ${''.padStart(String(n).length)}          week 2 = ${describe(w2)}`);
  const note=Number(n)===1&&eqName!=='bodyweight',truth=bodyweightOnly(w1)&&externalLoads(w2);
  check(`${n} day(s) × ${eqName}: the 25 note is shown (${note}) exactly when it is true (${truth})`,note===truth);
 }
 check('C1 matrix: 1/2/3 strength days × full gym, dumbbells, bodyweight',row===9);}

console.log(failures?`\n${failures} FAILED`:'\nall checks passed');
process.exit(failures?1:0);
