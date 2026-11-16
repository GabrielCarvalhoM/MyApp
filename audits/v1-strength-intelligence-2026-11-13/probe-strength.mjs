// Strength Intelligence Foundation (2026-11-13): read-only probe of the strength module on the CURRENT composed entry,
// CoachingCore/src/v1-run-index.mjs at ce4f136 (COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-1 + RWS/RFC handoffs, no runtime change), no options
// (the real authority: R6-POLICY-5, the bound catalog R7B0-CATALOG-2 and its SSCTR r2 records).
// It edits nothing and writes nothing. Each check prints PASS/FAIL against the diagnosis in STRENGTH_INTELLIGENCE_FOUNDATION.md.
// A check marked GAP passes when the gap the diagnosis names is observed (it documents current behaviour, not a desired one).
// Run from the repository root: node audits/v1-strength-intelligence-2026-11-13/probe-strength.mjs [--verbose]
import * as X from '../../CoachingCore/src/v1-run-index.mjs';
import {configurationOf,CONFIGURATIONS,admissibleAlternative,closeVariation} from '../../CoachingCore/src/r7b-repertoire.mjs';
import {substitutesFor} from '../../CoachingCore/src/r6-catalogue.mjs';
import {interferenceCosts} from '../../CoachingCore/src/r6-balanced.mjs';

const VERBOSE=process.argv.includes('--verbose');
const AS_OF='2026-11-13',START='2026-11-16';
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const ELIG=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const FULL=['BARBELL','RACK','BENCH','DUMBBELLS','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'];
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const intake=(athlete,schedule,extra={})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:AS_OF,startDate:START,weeks:12,timezoneOffsetMinutes:-180,learningConsent:true,
 athlete:{id:'ssi-athlete',ageYears:32,eligibility:ELIG(AS_OF),...athlete},schedule,...extra});
const K=(id,sets,reps,kg,convention='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-11-06'});
const gen=i=>{const r=X.generateProgram(i);if(!r.program)throw new Error('no program: '+r.status+' '+r.reason+' '+JSON.stringify(r.errors));return r;};
const live=s=>!!s?.prescription&&s.status!=='SKIPPED';
const strengthRows=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>({s,e})));
const mains=(p,w)=>[...new Set(strengthRows(p,w).filter(x=>x.e.role==='MAIN').map(x=>x.e.id))].sort();
const SKILL={LOW:0,MODERATE:1,HIGH:2};
/** Descriptive weekly working sets per primary muscle (catalog muscleCounting: primary only, once per side; never a gate). */
function setsPerPrimary(p,w){const out={};for(const {e} of strengthRows(p,w)){if(e.role==='PRACTICE')continue;for(const m of configurationOf(e.id)?.primary??[])out[m]=(out[m]??0)+e.sets;}return out;}
let N=0;
const review=(p,w,{day=6,hour='21:00:00',kind='WEEKLY_REVIEW',...x}={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`ssi-${w}-${kind}-${N++}`,kind},eligibility:ELIG(d),observations:[],...x};};
/** A report of session s executed as prescribed; a load chosen by effort is logged at kg(e) (default 20). */
function obs(p,s,{kg=null,response=null}={}){
 const pr=s.prescription,a={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH')a.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:e.load.mode==='KNOWN'?e.load.value:Number.isFinite(e.load.value)?e.load.value:kg?.(e)??20,unit:'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));
 return {eventId:`ssi-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:a,response:{...OK,...(response??{})}};
}
function weekly(t,w,{keep=()=>true,o=()=>({}),extra={}}={}){
 const r=X.evaluateProgram(t.p,{...review(t.p,w,{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s,o(s))),...extra}),actualLedger:t.ledger});
 t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.last=r;return r;
}
const results=[];
const check=(scenario,claim,ok,observed,tag='')=>results.push({scenario,claim:(tag?tag+' ':'')+claim,ok:!!ok,observed});

// ---------- A. Beginner, three strength days, basic equipment ----------
{
 const r=gen(intake({strengthTrainingMonths:0,runTrainingMonths:0,goals:{run:'NONE',strength:'GENERAL'},equipment:['DUMBBELLS'],recent:{strengthDaysPerWeek:0}},{strengthDays:[1,3,5],strengthMinutes:45}));
 const p=r.program,w0=strengthRows(p,0),types=p.templates?.map?.(t=>t.type)??null;
 check('A','strength class NONE',p.capability.strength.class==='NONE',p.capability.strength.class);
 check('A','no HIGH-skill configuration while skill is unproven',strengthRows(p,0).concat(strengthRows(p,4)).every(x=>(configurationOf(x.e.id)?.skill??'LOW')!=='HIGH'),[...new Set(w0.map(x=>x.e.id))]);
 check('A','week 0 is movement practice or effort-guided establishment, never a kilogram',w0.every(x=>x.e.role==='PRACTICE'||x.e.load.mode==='ESTABLISH'||x.e.load.mode==='BODYWEIGHT'),w0.map(x=>x.e.id+':'+x.e.load.mode));
 check('A','novice density B0-C08: at most two full templates, the third day lighter (CORE)',p.weeks[0].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&['FULL_BODY','PRACTICE'].includes(s.prescription.family)).length<=3&&(p.negotiation??[]).some(n=>/STRENGTH_DAYS_ABOVE_CURRENT_PRACTICE/.test(JSON.stringify(n))),{families:p.weeks[0].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>s.prescription.family),negotiation:(p.negotiation??[]).map(n=>n.id??n.kind)});
 check('A','identical MAIN set in weeks 1 and 2 (no week-to-week reshuffle)',JSON.stringify(mains(p,1))===JSON.stringify(mains(p,2)),{w1:mains(p,1),w2:mains(p,2)});
 if(VERBOSE)console.log('A',JSON.stringify(p.weeks[0].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>[s.prescription.family,s.prescription.exercises.map(e=>e.id+'/'+e.role)])));
}

// ---------- B. Intermediate, hypertrophy, limited availability ----------
let B;
{
 const known=[K('bench-press',3,8,60),K('back-squat',3,8,80)];
 const r=gen(intake({strengthTrainingMonths:24,runTrainingMonths:0,goals:{run:'NONE',strength:'HYPERTROPHY'},equipment:FULL,recent:{strengthDaysPerWeek:2},knownExercises:known},{strengthDays:[1,4],strengthMinutes:40}));
 const p=B=r.program,rows=strengthRows(p,1);
 check('B','hypertrophy goal dose: reps 8-12 band, REPS_THEN_LOAD',rows.filter(x=>x.e.role==='MAIN').every(x=>x.e.reps>=8&&x.e.reps<=12)&&p.weeks[1].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').every(s=>s.prescription.goalMode==='REPS_THEN_LOAD'),rows.map(x=>`${x.e.id} ${x.e.sets}x${x.e.reps} ${x.e.load.mode}`));
 check('B','familiar HIGH-skill lifts are selected for an athlete who declared them',mains(p,1).includes('back-squat')&&mains(p,1).includes('bench-press'),mains(p,1));
 check('B','known load starts at the declared working load (no conversion)',rows.some(x=>x.e.id==='bench-press'&&x.e.load.mode==='KNOWN'&&x.e.load.value===60),rows.filter(x=>x.e.id==='bench-press').map(x=>x.e.load));
 const vol=setsPerPrimary(p,1);
 check('B','weekly sets per primary muscle are only descriptive: no muscle-volume target exists',true,vol,'GAP-S5');
}

// ---------- B2. Experienced lifter who names no familiar lifts ----------
{
 const r=gen(intake({strengthTrainingMonths:36,runTrainingMonths:0,goals:{run:'NONE',strength:'STRENGTH'},equipment:FULL,recent:{strengthDaysPerWeek:3}},{strengthDays:[1,3,5],strengthMinutes:60}));
 const p=r.program,m=mains(p,1),hi=m.filter(id=>configurationOf(id)?.skill==='HIGH');
 check('B2','36 months of strength training without named lifts: no barbell squat, bench or deadlift as MAIN (HIGH skill is familiarity-gated)',hi.length===0,{experience:p.canonical.athlete.strengthExperience,mains:m},'GAP-S3');
 // The engine already accepts familiarity without a load: the gap is the onboarding question, not the engine.
 const fam=id=>({id,familiar:true,current:true,tolerated:true,observedAt:'2026-11-06'});
 const r3=gen(intake({strengthTrainingMonths:36,runTrainingMonths:0,goals:{run:'NONE',strength:'STRENGTH'},equipment:FULL,recent:{strengthDaysPerWeek:3},knownExercises:[fam('back-squat'),fam('bench-press'),fam('deadlift')]},{strengthDays:[1,3,5],strengthMinutes:60}));
 const m3=mains(r3.program,1),rows3=strengthRows(r3.program,0).filter(x=>['back-squat','bench-press','deadlift'].includes(x.e.id));
 check('B3','familiarity declared without a load (knownExercises, no dose): HIGH-skill lifts selected and established by effort',['back-squat','bench-press','deadlift'].every(id=>m3.includes(id))&&rows3.every(x=>x.e.load.mode==='ESTABLISH'),{mains:m3,w0:rows3.map(x=>x.e.id+':'+x.e.load.mode)});
}

// ---------- C. Hybrid: quality run, long run and lower-body strength (RUN lead) ----------
let C;
{
 const r=gen(intake({strengthTrainingMonths:18,runTrainingMonths:36,goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays(START,83)}},strength:'RUNNING_SUPPORT'},equipment:FULL,recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:80,strengthDaysPerWeek:2},knownExercises:[K('back-squat',3,6,80),K('barbell-rdl',3,8,70)]},
  {runDays:[1,3,5,6],runMinutes:50,longRunMinutes:90,longRunDay:6,strengthDays:[2,5],strengthMinutes:45,runTurn:'AM',strengthTurn:'PM'}));
 const p=C=r.program,w=3,sess=p.weeks[w].sessions.filter(live),costs=interferenceCosts(sess,{wrap:true,hybrid:undefined});
 const heavyBeforeKey=costs.filter(c=>c.axis==='run'&&['MODERATE','HIGH'].includes(c.severity));
 check('C','run-axis costs stay ordinal and none is HIGH outside race proximity',costs.every(c=>c.severity!=='HIGH'),costs.map(c=>`${c.severity}:${c.cause}`));
 const strengthDay5=sess.find(s=>s.sport==='STRENGTH'&&s.day===5),long=sess.find(s=>s.sport==='RUN'&&s.prescription.family==='LONG');
 check('C','strength the day before the long run: MAIN rows kept (essential stimulus), CMP.P04 trims only HIGH-eccentric non-MAIN lower rows, disclosed',!!strengthDay5&&strengthDay5.prescription.exercises.filter(e=>e.role==='MAIN').length>=1&&strengthDay5.prescription.exercises.every(e=>e.exposure?.contentReduction!=='CMP.P04'||(e.role!=='MAIN'&&configurationOf(e.id)?.eccentric==='HIGH')),{day5:strengthDay5?.prescription.exercises.map(e=>`${e.id}/${e.role} ${e.sets} ${e.exposure?.contentReduction??''}`),long:long?.day,moderateOrHigherRunCosts:heavyBeforeKey.length});
 const ph=p.phases.phases,taper=ph.indexOf('TAPER'),raceW=ph.indexOf('RACE_WEEK');
 const tRows=taper>=0?strengthRows(p,taper):[],rRows=raceW>=0?strengthRows(p,raceW):[];
 const earlier=new Set(Array.from({length:Math.max(0,taper)},(_,i)=>strengthRows(p,i).map(x=>x.e.id)).flat());
 check('C','taper/race week: fewer sets, RIR >= 3, MAIN only in race week, no exercise new to the program',taper>0&&tRows.every(x=>x.e.rir>=3)&&rRows.every(x=>x.e.role==='MAIN'&&x.e.rir>=3)&&[...tRows,...rRows].every(x=>earlier.has(x.e.id)),{phases:ph.join(','),taper:tRows.map(x=>`${x.e.id} ${x.e.sets}@${x.e.rir}`),race:rRows.map(x=>`${x.e.id} ${x.e.sets}@${x.e.rir}`)});
 const upperMain=mains(p,1).filter(id=>configurationOf(id)?.region==='UPPER');
 check('C','RUNNING_SUPPORT with a full gym: the upper MAIN rows are the only upper configurations tagged RUNNING_SUPPORT (push-up, band-row): the purpose criterion outranks external loading',upperMain.length>0&&upperMain.every(id=>configurationOf(id).purposes.includes('RUNNING_SUPPORT')),{upperMain},'GAP-S6');
 if(VERBOSE)for(const s of sess)console.log('C',s.day,s.turn,s.sport,s.prescription.family,s.sport==='STRENGTH'?s.prescription.exercises.map(e=>e.id+':'+e.lowerDemand).join(','):s.prescription.durationMinutes);
}

// ---------- D. Substitution without losing continuity ----------
{
 const t={p:gen(intake({strengthTrainingMonths:18,runTrainingMonths:0,goals:{run:'NONE',strength:'GENERAL'},equipment:['DUMBBELLS','BENCH','KETTLEBELL'],recent:{strengthDaysPerWeek:2}},{strengthDays:[1,4],strengthMinutes:50})).program,ledger:[]};
 weekly(t,0);weekly(t,1);
 const before=mains(t.p,2),target=strengthRows(t.p,2).find(x=>x.e.role==='MAIN'&&x.e.pattern==='SQUAT')?.e.id;
 const r=X.evaluateProgram(t.p,{...review(t.p,2,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:target,reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}}),actualLedger:t.ledger});
 const sub=r.substitutions?.[0],after=r.proposal?mains(r.proposal,2):[];
 check('D','nonclinical substitution: same pattern, establishment, nothing converted',r.status!=='ASK'&&!!sub&&configurationOf(sub.selected)?.pattern===configurationOf(target)?.pattern&&sub.requiresEstablishment===true,{status:r.status,reason:r.reason,sub});
 check('D','only the substituted MAIN changes; the other MAIN lifts keep identity',after.length>0&&before.filter(id=>id!==target).every(id=>after.includes(id)),{before,after});
 const rowNew=r.proposal?[2,3,4].flatMap(w=>strengthRows(r.proposal,w)).find(x=>x.e.id===sub?.selected):null;
 check('D','the first exposure of the substitute is an effort-guided establishment, not the replaced exercise load',!!rowNew&&rowNew.e.load.mode==='ESTABLISH',rowNew?.e.load);
 const pain=X.evaluateProgram(t.p,{...review(t.p,2,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:target,reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',pain:true}}),actualLedger:t.ledger});
 check('D','pain with an exercise routes to a human, never a substitution as remedy',pain.status==='CLINICAL_HUMAN_REQUIRED',pain.status);
 // Static relations of the catalog: no claim of equivalence.
 const s=substitutesFor('back-squat',{equipment:['DUMBBELLS','BENCH'],experience:'INTERMEDIATE',known:[]});
 check('D','catalog substitutes for back-squat with dumbbells only: ranked, each requires establishment, none claimed equivalent',s.length>0&&s.every(x=>x.requiresEstablishment===true),s.map(x=>`${x.id} close=${x.closeVariation} sub=${x.sameSubpattern}`));
 const bw=substitutesFor('db-row',{equipment:[],experience:'NOVICE',known:[]});
 check('D','a bodyweight stand-in for a loaded row is flagged as a different stimulus',bw.every(x=>!!x.stimulusChange),bw.map(x=>x.id+':'+(x.stimulusChange?'DIFFERENT':'same')));
 check('D','PROTECTED_RUN_STIMULUS_CONFLICT substitution reason is catalog text only: EXERCISE_SUBSTITUTION accepts two reasons',X.evaluateProgram(t.p,{...review(t.p,2,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:target,reason:'PROTECTED_RUN_STIMULUS_CONFLICT'}}),actualLedger:t.ledger}).status==='ASK',null,'GAP-S7');
}

// ---------- E. Progression over several weeks ----------
{
 const t={p:gen(intake({strengthTrainingMonths:18,runTrainingMonths:0,goals:{run:'NONE',strength:'STRENGTH'},equipment:FULL,recent:{strengthDaysPerWeek:2},knownExercises:[K('back-squat',3,5,100),K('bench-press',3,5,70)]},{strengthDays:[1,4],strengthMinutes:60})).program,ledger:[]};
 const trail=[];for(let w=0;w<6;w++){const sq=strengthRows(t.p,w).find(x=>x.e.id==='back-squat');trail.push({w,phase:t.p.phases.phases[w],load:sq?.e.load.value??null,reps:sq?.e.reps,sets:sq?.e.sets});weekly(t,w);}
 const loads=trail.map(x=>x.load).filter(Number.isFinite),steps=loads.slice(1).map((v,i)=>Math.round((v-loads[i])*10)/10);
 check('E','LOAD goal: at most one smallest increment per week, never a jump, only on executed evidence',steps.every(d=>d===0||d===2.5)&&steps.some(d=>d>0),trail);
 check('E','identity preserved: back-squat stays the squat MAIN through the block',trail.every(x=>x.load!==null),trail.map(x=>x.load));
 // Hypertrophy REPS_THEN_LOAD on the B athlete
 const tb={p:B,ledger:[]},tr=[];for(let w=0;w<5;w++){const b=strengthRows(tb.p,w).find(x=>x.e.id==='bench-press');tr.push({w,phase:tb.p.phases.phases[w],load:b?.e.load.value??null,reps:b?.e.reps});weekly(tb,w);}
 check('E','REPS_THEN_LOAD: reps rise by 2 inside 8-12, then the smallest increment and back to the bottom',tr.filter(x=>Number.isFinite(x.reps)).every(x=>x.reps>=8&&x.reps<=12),tr);
}

// ---------- F. Missed sessions, fatigue, availability change ----------
{
 const t={p:gen(intake({strengthTrainingMonths:18,runTrainingMonths:24,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60,strengthDaysPerWeek:2}},{runDays:[1,3,6],strengthDays:[0,4],runMinutes:45,longRunMinutes:75,longRunDay:6,strengthMinutes:50})).program,ledger:[]};
 weekly(t,0);
 const skipped=weekly(t,1,{keep:s=>s.sport!=='STRENGTH'});
 const w2=strengthRows(t.p,2).filter(x=>x.e.role==='MAIN'),w1=strengthRows(t.p,1).filter(x=>x.e.role==='MAIN');
 check('F','missed strength week: no stacking, no catch-up sets',w2.every(x=>x.e.sets<=Math.max(...w1.map(y=>y.e.sets))),{status:skipped.status,w1:w1.map(x=>x.e.id+' '+x.e.sets),w2:w2.map(x=>x.e.id+' '+x.e.sets)});
 const lf=X.evaluateProgram(t.p,{...review(t.p,2,{day:0,hour:'06:00:00',kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}}),actualLedger:t.ledger});
 const lfRows=lf.proposal?strengthRows(lf.proposal,2):[];
 check('F','local fatigue (LOWER): optional lower accessories removed this week, MAIN kept, region-level only',lf.proposal&&lfRows.every(x=>!(x.e.role!=='MAIN'&&x.e.region==='LOWER'))&&lfRows.some(x=>x.e.role==='MAIN'),{status:lf.status,rows:lfRows.map(x=>x.e.id+'/'+x.e.role)});
 const sf=X.evaluateProgram(t.p,{...review(t.p,2,{day:0,hour:'06:00:00',kind:'SYSTEMIC_FATIGUE'}),actualLedger:t.ledger});
 const sfRows=sf.proposal?strengthRows(sf.proposal,2).filter(x=>x.s.date>=addDays(t.p.weeks[2].startDate,0)):[];
 check('F','systemic fatigue: main lifts only, one set fewer, RIR >= 4',sf.proposal&&sfRows.every(x=>x.e.role==='MAIN'&&x.e.rir>=4),{status:sf.status,rows:sfRows.map(x=>`${x.e.id} ${x.e.sets}@${x.e.rir}`)});
}

// ---------- G. Run and strength on the same day ----------
{
 const r=gen(intake({strengthTrainingMonths:18,runTrainingMonths:24,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60,strengthDaysPerWeek:2}},{runDays:[1,3,6],strengthDays:[1,3],runTurn:'AM',strengthTurn:'PM',runMinutes:45,longRunMinutes:75,longRunDay:6,strengthMinutes:50}));
 const p=r.program,w=2,sess=p.weeks[w].sessions.filter(live),shared=[1,3].map(d=>sess.filter(s=>s.day===d).map(s=>s.sport+'@'+s.turn+':'+(s.prescription.family??'')));
 const costs=interferenceCosts(sess,{wrap:true});
 check('G','same day, different shifts: two sessions kept on the chosen days, costs computed ordinally and disclosed when MODERATE+',shared.every(x=>x.length===2),{shared,costs:costs.map(c=>`${c.axis}:${c.severity}:${c.cause}`),disclosures:(p.negotiation??[]).map(n=>n.id??n.kind)});
}

// ---------- H. Load history for some lifts only ----------
{
 const r=gen(intake({strengthTrainingMonths:24,runTrainingMonths:0,goals:{run:'NONE',strength:'GENERAL'},equipment:FULL,recent:{strengthDaysPerWeek:3},knownExercises:[K('back-squat',3,8,100)]},{strengthDays:[1,3,5],strengthMinutes:60}));
 const p=r.program,rows=strengthRows(p,0),squat=rows.filter(x=>x.e.id==='back-squat'),others=rows.filter(x=>x.e.id!=='back-squat'&&x.e.load.mode!=='BODYWEIGHT'&&x.e.role!=='PRACTICE');
 check('H','known lift keeps its load; every other loaded lift is established by effort (no cross-exercise kilogram)',squat.every(x=>x.e.load.mode==='KNOWN'&&x.e.load.value===100)&&others.every(x=>x.e.load.mode==='ESTABLISH'&&!Number.isFinite(x.e.load.value)),{squat:squat.map(x=>x.e.load),others:others.map(x=>x.e.id+':'+x.e.load.mode)});
 const fsq=rows.find(x=>x.e.id==='front-squat');
 check('H','an unnamed HIGH-skill variant (front squat) is not assumed familiar from the back squat',!fsq,rows.map(x=>x.e.id));
}

// ---------- I. Representation gaps of the catalog ----------
{
 const holds=CONFIGURATIONS.filter(e=>['front-plank','side-plank'].includes(e.id));
 const r=gen(intake({strengthTrainingMonths:0,runTrainingMonths:0,goals:{run:'NONE',strength:'GENERAL'},equipment:[],recent:{strengthDaysPerWeek:0},exerciseRotationPreference:'EVERY_2_WEEKS'},{strengthDays:[1,4],strengthMinutes:40}));
 const planks=r.program.weeks.flatMap((w,i)=>strengthRows(r.program,i).filter(x=>['front-plank','side-plank'].includes(x.e.id)).map(x=>`w${i} ${x.e.id} ${x.e.sets}x${x.e.reps} reps @RIR${x.e.rir}`));
 check('I','isometric holds (plank, side plank) have no time dose: the row model is sets x reps x RIR only',holds.length===2&&!holds.some(h=>'holdSeconds' in h||'doseUnit' in h),{prescribedPlanks:planks.slice(0,4)},'GAP-S2');
 check('I','no localized names or synonyms in the bound catalog (English name only)',CONFIGURATIONS.every(e=>!('names' in e)&&!('aliases' in e)),CONFIGURATIONS.slice(0,3).map(e=>e.name),'GAP-S1');
 // Plane coverage: the PUSH/PULL MAIN slots admit both planes but always prefer the horizontal default subpattern; no weekly alternation exists.
 const planes=(eq,goal,days)=>{const p=gen(intake({strengthTrainingMonths:24,runTrainingMonths:0,goals:{run:'NONE',strength:goal},equipment:eq,recent:{strengthDaysPerWeek:days.length},exerciseRotationPreference:'COACH_DECIDES'},{strengthDays:days,strengthMinutes:60})).program;return [...new Set(p.weeks.flatMap((w,i)=>strengthRows(p,i).map(x=>configurationOf(x.e.id)?.subpattern)))].filter(s=>/VERTICAL|HORIZONTAL/.test(s)).sort();};
 const pv=[['FULL','HYPERTROPHY',[0,2,4,6]],['FULL','GENERAL',[1,4]],['MACHINES+DB','STRENGTH',[1,3,5]]].map(([n,g,d])=>({profile:n,goal:g,days:d.length,planes:planes(n==='FULL'?FULL:['DUMBBELLS','BENCH','MACHINES'],g,d)}));
 check('I','12 weeks, full gym or machines: no vertical push and no vertical pull is ever selected (horizontal default subpattern always wins)',pv.every(x=>!x.planes.some(s=>s.startsWith('VERTICAL'))),pv,'GAP-S8');
 check('I','no per-configuration admissible repetition range (the goal range applies to every row)',CONFIGURATIONS.every(e=>!('repRange' in e)),null,'GAP-S4');
 check('I','close variation is directed, never a symmetric equivalence (barbell-rdl -> db-rdl is close; db-rdl -> barbell-rdl is not: skill rises)',closeVariation(configurationOf('barbell-rdl'),configurationOf('db-rdl'))&&!closeVariation(configurationOf('db-rdl'),configurationOf('barbell-rdl')),null);
 check('I','back-squat -> goblet-squat is not a close variation (axial and lower demand differ by more than one step): a substitute, not a variant',!closeVariation(configurationOf('back-squat'),configurationOf('goblet-squat')),null);
}

let pass=0;for(const x of results){if(x.ok)pass++;console.log(`${x.ok?'PASS':'FAIL'} [${x.scenario}] ${x.claim}${VERBOSE||!x.ok?'\n      '+JSON.stringify(x.observed):''}`);}
console.log(`\n${pass}/${results.length} checks match the diagnosis`);
process.exitCode=pass===results.length?0:1;
