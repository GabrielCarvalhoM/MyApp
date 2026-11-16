// V1 Strength Extension (2026-11-16): the diagnosis probe of the Strength Intelligence Foundation, run again on the composed entry point
// (CoachingCore/src/v1-strength-index.mjs) with the four corrections on. Read-only: it edits nothing and writes nothing.
// - The scenarios A to I are the foundation's (audits/v1-strength-intelligence-2026-11-13/probe-strength.mjs), with the same facts.
// - The checks the foundation marked GAP-S2, GAP-S5, GAP-S6 and GAP-S8 are inverted: each now passes when the gap is closed.
// - Every other check is the foundation's own, unchanged: it must still pass (dose, progression, substitution, fatigue, the clinical route).
// - The foundation's probe itself is untouched and still reads the frozen entry point: there the gaps reproduce (37/37 of the diagnosis).
// - The sweep is the foundation's (120 profiles, 12 weeks): the planes never selected, before (the frozen entry point) and after.
// The authority is the independent SSCTR enabling record when it exists; until then the development authority, and the first line says which.
// Run from the repository root: node audits/v1-strength-corrections-2026-11-16/candidate/probes/probe-v1str.mjs [--verbose]
import * as X from '../../../../CoachingCore/src/v1-strength-index.mjs';
import * as FROZEN from '../../../../CoachingCore/src/v1-run-index.mjs';
import {devStrength,allowsStrength} from '../../../../CoachingCore/src/v1-strength.mjs';
import {configurationOf,CONFIGURATIONS,STRENGTH_RULES} from '../../../../CoachingCore/src/r7b-repertoire.mjs';
import {substitutesFor} from '../../../../CoachingCore/src/r6-catalogue.mjs';
import {interferenceCosts} from '../../../../CoachingCore/src/r6-balanced.mjs';

const VERBOSE=process.argv.includes('--verbose');
const real=X.strengthAuthority(),independent=['HOLD','UPPER','PLANE','EXPOSURE'].every(k=>allowsStrength(real,k)),OPTS=independent?{}:{strengthExtension:devStrength()};
console.log(`authority of the strength extension: ${independent?'INDEPENDENT_SSCTR_RECORD':'DEVELOPMENT_AUTHORITY_PENDING_THE_RECORD'}\n`);
const AS_OF='2026-11-13',START='2026-11-16',HOLDS=['front-plank','side-plank'];
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const ELIG=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const FULL=['BARBELL','RACK','BENCH','DUMBBELLS','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'];
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const intake=(athlete,schedule,extra={})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:AS_OF,startDate:START,weeks:12,timezoneOffsetMinutes:-180,learningConsent:true,athlete:{id:'ssi-athlete',ageYears:32,eligibility:ELIG(AS_OF),...athlete},schedule,...extra});
const K=(id,sets,reps,kg,convention='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-11-06'});
const gen=i=>{const r=X.generateProgram(i,OPTS);if(!r.program)throw new Error('no program: '+r.status+' '+r.reason+' '+JSON.stringify(r.errors));return r;};
const live=s=>!!s?.prescription&&s.status!=='SKIPPED';
const strengthRows=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>({s,e})));
const mains=(p,w)=>[...new Set(strengthRows(p,w).filter(x=>x.e.role==='MAIN').map(x=>x.e.id))].sort();
/** The foundation's own count (primary only, practice never), kept here as the oracle of the exposure. */
function setsPerPrimary(p,w){const out={};for(const {e} of strengthRows(p,w)){if(e.role==='PRACTICE')continue;for(const m of configurationOf(e.id)?.primary??[])out[m]=(out[m]??0)+e.sets;}return out;}
let N=0;
/** The conforming client: it keeps and sends back the plan, the engine's record and every record of the run extensions. */
const client=r=>({p:r.program,ledger:[],ev:r.runEvidenceRecord??[],fmt:r.runFormatRecord??[],hist:r.runHistoryRecord??[],rev:r.paceRevisionRecord??[],last:r});
const review=(t,w,{day=6,hour='21:00:00',kind='WEEKLY_REVIEW',...x}={})=>{const d=addDays(t.p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`ssi-${w}-${kind}-${N++}`,kind},eligibility:ELIG(d),observations:[],...x,...(t.ledger.length?{actualLedger:t.ledger}:{}),runEvidenceRecord:t.ev,runFormatRecord:t.fmt,runHistoryRecord:t.hist,paceRevisionRecord:t.rev};};
function obs(p,s,{kg=null,response=null}={}){
 const pr=s.prescription,a={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH')a.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:e.load.mode==='KNOWN'?e.load.value:Number.isFinite(e.load.value)?e.load.value:kg?.(e)??20,unit:'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));
 return {eventId:`ssi-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:a,response:{...OK,...(response??{})}};
}
const ask=(t,rv)=>X.evaluateProgram(t.p,rv,OPTS);
function take(t,r){t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.ev=r.runEvidenceRecord??t.ev;t.fmt=r.runFormatRecord??t.fmt;t.hist=r.runHistoryRecord??t.hist;t.rev=r.paceRevisionRecord??t.rev;t.last=r;return r;}
const weekly=(t,w,{keep=()=>true,o=()=>({})}={})=>take(t,ask(t,review(t,w,{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s,o(s)))})));
const results=[];
const check=(scenario,claim,ok,observed,tag='')=>results.push({scenario,claim:(tag?tag+' ':'')+claim,ok:!!ok,observed});

// ---------- A. Beginner, three strength days, basic equipment ----------
{
 const r=gen(intake({strengthTrainingMonths:0,runTrainingMonths:0,goals:{run:'NONE',strength:'GENERAL'},equipment:['DUMBBELLS'],recent:{strengthDaysPerWeek:0}},{strengthDays:[1,3,5],strengthMinutes:45}));
 const p=r.program,w0=strengthRows(p,0);
 check('A','strength class NONE',p.capability.strength.class==='NONE',p.capability.strength.class);
 check('A','no HIGH-skill configuration while skill is unproven',strengthRows(p,0).concat(strengthRows(p,4)).every(x=>(configurationOf(x.e.id)?.skill??'LOW')!=='HIGH'),[...new Set(w0.map(x=>x.e.id))]);
 check('A','week 0 is movement practice or effort-guided establishment, never a kilogram',w0.every(x=>x.e.role==='PRACTICE'||x.e.load.mode==='ESTABLISH'||x.e.load.mode==='BODYWEIGHT'),w0.map(x=>x.e.id+':'+x.e.load.mode));
 check('A','novice density B0-C08: at most two full templates, the third day lighter (CORE)',p.weeks[0].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&['FULL_BODY','PRACTICE'].includes(s.prescription.family)).length<=3&&(p.negotiation??[]).some(n=>/STRENGTH_DAYS_ABOVE_CURRENT_PRACTICE/.test(JSON.stringify(n))),p.weeks[0].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>s.prescription.family));
 check('A','identical MAIN set in weeks 1 and 2 (no week-to-week reshuffle)',JSON.stringify(mains(p,1))===JSON.stringify(mains(p,2)),{w1:mains(p,1),w2:mains(p,2)});
 check('A','a plan that opens with movement practice asks nothing of the plane rule: its upper MAIN rows are the frozen entry point\'s',JSON.stringify(p.templates.map(t=>t.rows.filter(z=>z.role==='MAIN').map(z=>z.entry.id)))===JSON.stringify(FROZEN.generateProgram(intake({strengthTrainingMonths:0,runTrainingMonths:0,goals:{run:'NONE',strength:'GENERAL'},equipment:['DUMBBELLS'],recent:{strengthDaysPerWeek:0}},{strengthDays:[1,3,5],strengthMinutes:45})).program.templates.map(t=>t.rows.filter(z=>z.role==='MAIN').map(z=>z.entry.id))),null,'N4');
 check('A','a novice gets no vertical push (none is admissible at LOW skill): the push slots stay horizontal',[...new Set(p.weeks.flatMap((_,i)=>strengthRows(p,i).map(x=>configurationOf(x.e.id)?.subpattern)))].every(s=>s!=='VERTICAL_PUSH'),null,'N4');
}

// ---------- B. Intermediate, hypertrophy, limited availability ----------
let B;
{
 const known=[K('bench-press',3,8,60),K('back-squat',3,8,80)];
 const r=gen(intake({strengthTrainingMonths:24,runTrainingMonths:0,goals:{run:'NONE',strength:'HYPERTROPHY'},equipment:FULL,recent:{strengthDaysPerWeek:2},knownExercises:known},{strengthDays:[1,4],strengthMinutes:40}));
 const p=r.program,rows=strengthRows(p,1);B=r;
 check('B','hypertrophy goal dose: reps 8-12 band, REPS_THEN_LOAD',rows.filter(x=>x.e.role==='MAIN').every(x=>x.e.reps>=8&&x.e.reps<=12)&&p.weeks[1].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').every(s=>s.prescription.goalMode==='REPS_THEN_LOAD'),rows.map(x=>`${x.e.id} ${x.e.sets}x${x.e.reps} ${x.e.load.mode}`));
 check('B','familiar HIGH-skill lifts are selected for an athlete who declared them',mains(p,1).includes('back-squat')&&mains(p,1).includes('bench-press'),mains(p,1));
 check('B','known load starts at the declared working load (no conversion)',rows.some(x=>x.e.id==='bench-press'&&x.e.load.mode==='KNOWN'&&x.e.load.value===60),rows.filter(x=>x.e.id==='bench-press').map(x=>x.e.load));
 const x=X.weeklyStrengthExposure({program:p,weekIndex:1}),vol=setsPerPrimary(p,1),text=JSON.stringify(x);
 check('B','the weekly sets per primary muscle exist as a described quantity equal to the catalog count, with no target, range, threshold or score',x.status==='ACTIVE'&&x.descriptiveOnly===true&&JSON.stringify(x.planned.byPrimaryMuscle)===JSON.stringify(Object.fromEntries(Object.keys(x.planned.byPrimaryMuscle).map(m=>[m,vol[m]])))&&Object.keys(vol).length===Object.keys(x.planned.byPrimaryMuscle).length&&!/target|optim|recommend|enough|below|above|range|threshold|score/i.test(text),x.planned.byPrimaryMuscle,'N3 (GAP-S5 closed, descriptive)');
 const t=p.templates.flatMap(q=>q.rows.filter(z=>z.role==='MAIN').map(z=>q.type+':'+z.entry.id));
 check('B','the familiar bench keeps the first push slot; the second push and pull slots take the vertical plane (db-overhead-press, lat-pulldown)',t.includes('FULL_A:bench-press')&&t.includes('FULL_B:db-overhead-press')&&t.includes('FULL_B:lat-pulldown'),t,'N4');
}

// ---------- B2. Experienced lifter who names no familiar lifts ----------
{
 const r=gen(intake({strengthTrainingMonths:36,runTrainingMonths:0,goals:{run:'NONE',strength:'STRENGTH'},equipment:FULL,recent:{strengthDaysPerWeek:3}},{strengthDays:[1,3,5],strengthMinutes:60}));
 const p=r.program,m=mains(p,1),hi=m.filter(id=>configurationOf(id)?.skill==='HIGH');
 check('B2','36 months of strength training without named lifts: still no barbell squat, bench or deadlift as MAIN (HIGH skill stays familiarity-gated; the onboarding question is S0, not this mission)',hi.length===0,{mains:m},'GAP-S3 unchanged');
 const fam=id=>({id,familiar:true,current:true,tolerated:true,observedAt:'2026-11-06'});
 const r3=gen(intake({strengthTrainingMonths:36,runTrainingMonths:0,goals:{run:'NONE',strength:'STRENGTH'},equipment:FULL,recent:{strengthDaysPerWeek:3},knownExercises:[fam('back-squat'),fam('bench-press'),fam('deadlift')]},{strengthDays:[1,3,5],strengthMinutes:60}));
 const m3=mains(r3.program,1),rows3=strengthRows(r3.program,0).filter(x=>['back-squat','bench-press','deadlift'].includes(x.e.id));
 check('B3','familiarity declared without a load: HIGH-skill lifts selected and established by effort',['back-squat','bench-press','deadlift'].every(id=>m3.includes(id))&&rows3.every(x=>x.e.load.mode==='ESTABLISH'),{mains:m3,w0:rows3.map(x=>x.e.id+':'+x.e.load.mode)});
}

// ---------- C. Hybrid: quality run, long run and lower-body strength (RUN lead) ----------
{
 const r=gen(intake({strengthTrainingMonths:18,runTrainingMonths:36,goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays(START,83)}},strength:'RUNNING_SUPPORT'},equipment:FULL,recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:80,strengthDaysPerWeek:2},knownExercises:[K('back-squat',3,6,80),K('barbell-rdl',3,8,70)]},
  {runDays:[1,3,5,6],runMinutes:50,longRunMinutes:90,longRunDay:6,strengthDays:[2,5],strengthMinutes:45,runTurn:'AM',strengthTurn:'PM'}));
 const p=r.program,w=3,sess=p.weeks[w].sessions.filter(live),costs=interferenceCosts(sess,{wrap:true,hybrid:undefined});
 check('C','run-axis costs stay ordinal and none is HIGH outside race proximity',costs.every(c=>c.severity!=='HIGH'),costs.map(c=>`${c.severity}:${c.cause}`));
 const strengthDay5=sess.find(s=>s.sport==='STRENGTH'&&s.day===5);
 check('C','strength the day before the long run: MAIN rows kept, CMP.P04 trims only HIGH-eccentric non-MAIN lower rows',!!strengthDay5&&strengthDay5.prescription.exercises.filter(e=>e.role==='MAIN').length>=1&&strengthDay5.prescription.exercises.every(e=>e.exposure?.contentReduction!=='CMP.P04'||(e.role!=='MAIN'&&configurationOf(e.id)?.eccentric==='HIGH')),strengthDay5?.prescription.exercises.map(e=>`${e.id}/${e.role} ${e.sets} ${e.exposure?.contentReduction??''}`));
 const ph=p.phases.phases,taper=ph.indexOf('TAPER'),raceW=ph.indexOf('RACE_WEEK'),tRows=taper>=0?strengthRows(p,taper):[],rRows=raceW>=0?strengthRows(p,raceW):[];
 const earlier=new Set(Array.from({length:Math.max(0,taper)},(_,i)=>strengthRows(p,i).map(x=>x.e.id)).flat());
 check('C','taper/race week: RIR >= 3, MAIN only in race week, no exercise new to the program',taper>0&&tRows.every(x=>x.e.rir>=3)&&rRows.every(x=>x.e.role==='MAIN'&&x.e.rir>=3)&&[...tRows,...rRows].every(x=>earlier.has(x.e.id)),{taper:tRows.map(x=>`${x.e.id} ${x.e.sets}@${x.e.rir}`),race:rRows.map(x=>`${x.e.id} ${x.e.sets}@${x.e.rir}`)});
 const upperMain=mains(p,1).filter(id=>configurationOf(id)?.region==='UPPER');
 check('C','RUNNING_SUPPORT with a full gym: every upper MAIN row is externally loaded, none is push-up or band-row, and none is a HIGH-skill lift the athlete did not name',upperMain.length>0&&upperMain.every(id=>configurationOf(id).loading==='EXTERNAL'&&configurationOf(id).skill!=='HIGH'),{upperMain},'N2 (GAP-S6 closed)');
 const lowerMain=mains(p,1).filter(id=>configurationOf(id)?.region==='LOWER'),frozen=FROZEN.generateProgram(intake({strengthTrainingMonths:18,runTrainingMonths:36,goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays(START,83)}},strength:'RUNNING_SUPPORT'},equipment:FULL,recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:80,strengthDaysPerWeek:2},knownExercises:[K('back-squat',3,6,80),K('barbell-rdl',3,8,70)]},
  {runDays:[1,3,5,6],runMinutes:50,longRunMinutes:90,longRunDay:6,strengthDays:[2,5],strengthMinutes:45,runTurn:'AM',strengthTurn:'PM'})).program;
 check('C','the lower-body MAIN rows and every run of the plan are the frozen entry point\'s',JSON.stringify(lowerMain)===JSON.stringify(mains(frozen,1).filter(id=>configurationOf(id)?.region==='LOWER'))&&JSON.stringify(p.weeks.map(x=>x.sessions.filter(s=>s.sport==='RUN').map(s=>s.prescription)))===JSON.stringify(frozen.weeks.map(x=>x.sessions.filter(s=>s.sport==='RUN').map(s=>s.prescription))),{lowerMain},'N2');
}

// ---------- D. Substitution without losing continuity ----------
{
 const t=client(gen(intake({strengthTrainingMonths:18,runTrainingMonths:0,goals:{run:'NONE',strength:'GENERAL'},equipment:['DUMBBELLS','BENCH','KETTLEBELL'],recent:{strengthDaysPerWeek:2}},{strengthDays:[1,4],strengthMinutes:50})));
 weekly(t,0);weekly(t,1);
 const before=mains(t.p,2),target=strengthRows(t.p,2).find(x=>x.e.role==='MAIN'&&x.e.pattern==='SQUAT')?.e.id;
 const r=ask(t,review(t,2,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:target,reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}}));
 const sub=r.substitutions?.[0],after=r.proposal?mains(r.proposal,2):[];
 check('D','nonclinical substitution: same pattern, establishment, nothing converted',r.status!=='ASK'&&!!sub&&configurationOf(sub.selected)?.pattern===configurationOf(target)?.pattern&&sub.requiresEstablishment===true,{status:r.status,sub});
 check('D','only the substituted MAIN changes; the other MAIN lifts keep identity',after.length>0&&before.filter(id=>id!==target).every(id=>after.includes(id)),{before,after});
 const pain=ask(t,review(t,2,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:target,reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',pain:true}}));
 check('D','pain with an exercise routes to a human, never a substitution as remedy',pain.status==='CLINICAL_HUMAN_REQUIRED'&&!pain.proposal,pain.status);
 const trunk=ask(t,review(t,2,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'dead-bug',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true,to:'front-plank'}}));
 check('D','a plank named as the substitute is asked about, never placed',trunk.status==='ASK'&&!trunk.proposal,{status:trunk.status,reason:trunk.reason},'N1');
}

// ---------- E. Progression over several weeks ----------
{
 const t=client(gen(intake({strengthTrainingMonths:18,runTrainingMonths:0,goals:{run:'NONE',strength:'STRENGTH'},equipment:FULL,recent:{strengthDaysPerWeek:2},knownExercises:[K('back-squat',3,5,100),K('bench-press',3,5,70)]},{strengthDays:[1,4],strengthMinutes:60})));
 const trail=[];for(let w=0;w<6;w++){const sq=strengthRows(t.p,w).find(x=>x.e.id==='back-squat');trail.push({w,phase:t.p.phases.phases[w],load:sq?.e.load.value??null,reps:sq?.e.reps,sets:sq?.e.sets});weekly(t,w);}
 const loads=trail.map(x=>x.load).filter(Number.isFinite),steps=loads.slice(1).map((v,i)=>Math.round((v-loads[i])*10)/10);
 check('E','LOAD goal: at most one smallest increment per week, never a jump, only on executed evidence',steps.every(d=>d===0||d===2.5)&&steps.some(d=>d>0),trail);
 check('E','identity preserved: back-squat stays the squat MAIN through the block',trail.every(x=>x.load!==null),trail.map(x=>x.load));
 const tb=client(B),tr=[];for(let w=0;w<5;w++){const b=strengthRows(tb.p,w).find(x=>x.e.id==='bench-press');tr.push({w,load:b?.e.load.value??null,reps:b?.e.reps});weekly(tb,w);}
 check('E','REPS_THEN_LOAD: reps stay inside 8-12 through the weeks',tr.filter(x=>Number.isFinite(x.reps)).every(x=>x.reps>=8&&x.reps<=12),tr);
 check('E','the vertical rows the plan was built with are still in their slots after five reviewed weeks',tb.p.templates.flatMap(q=>q.rows).filter(z=>z.planeAlternation).every(z=>z.entry.id===z.planeAlternation.built)&&tb.last.strengthExtension.status==='ACTIVE',tb.p.templates.flatMap(q=>q.rows).filter(z=>z.planeAlternation).map(z=>z.entry.id),'N4');
}

// ---------- F. Missed sessions, fatigue ----------
{
 const t=client(gen(intake({strengthTrainingMonths:18,runTrainingMonths:24,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60,strengthDaysPerWeek:2}},{runDays:[1,3,6],strengthDays:[0,4],runMinutes:45,longRunMinutes:75,longRunDay:6,strengthMinutes:50})));
 weekly(t,0);const skipped=weekly(t,1,{keep:s=>s.sport!=='STRENGTH'});
 const w2=strengthRows(t.p,2).filter(x=>x.e.role==='MAIN'),w1=strengthRows(t.p,1).filter(x=>x.e.role==='MAIN');
 check('F','missed strength week: no stacking, no catch-up sets',w2.every(x=>x.e.sets<=Math.max(...w1.map(y=>y.e.sets))),{status:skipped.status});
 const lf=ask(t,review(t,2,{day:0,hour:'06:00:00',kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}})),lfRows=lf.proposal?strengthRows(lf.proposal,2):[];
 check('F','local fatigue (LOWER): optional lower accessories removed this week, MAIN kept',lf.proposal&&lfRows.every(x=>!(x.e.role!=='MAIN'&&x.e.region==='LOWER'))&&lfRows.some(x=>x.e.role==='MAIN'),{status:lf.status});
 const sf=ask(t,review(t,2,{day:0,hour:'06:00:00',kind:'SYSTEMIC_FATIGUE'})),sfRows=sf.proposal?strengthRows(sf.proposal,2):[];
 check('F','systemic fatigue: main lifts only, RIR >= 4',sf.proposal&&sfRows.every(x=>x.e.role==='MAIN'&&x.e.rir>=4),{status:sf.status});
}

// ---------- G. Run and strength on the same day ----------
{
 const r=gen(intake({strengthTrainingMonths:18,runTrainingMonths:24,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60,strengthDaysPerWeek:2}},{runDays:[1,3,6],strengthDays:[1,3],runTurn:'AM',strengthTurn:'PM',runMinutes:45,longRunMinutes:75,longRunDay:6,strengthMinutes:50}));
 const p=r.program,sess=p.weeks[2].sessions.filter(live),shared=[1,3].map(d=>sess.filter(s=>s.day===d).map(s=>s.sport+'@'+s.turn));
 check('G','same day, different shifts: two sessions kept on the chosen days',shared.every(x=>x.length===2),shared);
}

// ---------- H. Load history for some lifts only ----------
{
 const r=gen(intake({strengthTrainingMonths:24,runTrainingMonths:0,goals:{run:'NONE',strength:'GENERAL'},equipment:FULL,recent:{strengthDaysPerWeek:3},knownExercises:[K('back-squat',3,8,100)]},{strengthDays:[1,3,5],strengthMinutes:60}));
 const p=r.program,rows=strengthRows(p,0),squat=rows.filter(x=>x.e.id==='back-squat'),others=rows.filter(x=>x.e.id!=='back-squat'&&x.e.load.mode!=='BODYWEIGHT'&&x.e.role!=='PRACTICE');
 check('H','known lift keeps its load; every other loaded lift is established by effort (no cross-exercise kilogram)',squat.every(x=>x.e.load.mode==='KNOWN'&&x.e.load.value===100)&&others.every(x=>x.e.load.mode==='ESTABLISH'&&!Number.isFinite(x.e.load.value)),others.map(x=>x.e.id+':'+x.e.load.mode));
 check('H','an unnamed HIGH-skill variant (front squat) is not assumed familiar from the back squat',!rows.find(x=>x.e.id==='front-squat'),null);
}

// ---------- I. The representation and coverage gaps ----------
{
 const bw=intake({strengthTrainingMonths:0,runTrainingMonths:0,goals:{run:'NONE',strength:'GENERAL'},equipment:[],recent:{strengthDaysPerWeek:0},exerciseRotationPreference:'EVERY_2_WEEKS'},{strengthDays:[1,4],strengthMinutes:40});
 const r=gen(bw),planks=p=>p.weeks.flatMap((w,i)=>strengthRows(p,i).filter(x=>HOLDS.includes(x.e.id)).map(x=>`w${i} ${x.e.id} ${x.e.sets}x${x.e.reps} reps`));
 const frozen=planks(FROZEN.generateProgram(bw).program),trunk=r.program.weeks.map((w,i)=>strengthRows(r.program,i).filter(x=>x.e.pattern==='TRUNK').length);
 check('I','no plank is prescribed in repetitions in any of the 12 weeks (the frozen entry point prescribes '+frozen.length+' such rows for the same athlete), and trunk work is in every week',planks(r.program).length===0&&frozen.length>0&&trunk.every(n=>n>0),{frozen:frozen.slice(0,3),trunkRowsPerWeek:trunk},'N1 (GAP-S2 closed by exclusion)');
 check('I','the catalog still holds no time dose: the hold configurations are out of selection, not given a dose',CONFIGURATIONS.filter(e=>HOLDS.includes(e.id)).length===2&&!CONFIGURATIONS.some(e=>'holdSeconds' in e||'doseUnit' in e),null,'N1');
 check('I','a plank is not a ranked substitute under the rules',!substitutesFor('dead-bug',{equipment:[],experience:'INTERMEDIATE',auth:{valid:true,approved:{'B0-C03':'APPROVE_WITH_CONDITIONS'},[STRENGTH_RULES]:{hold:HOLDS}}}).some(e=>HOLDS.includes(e.id)),null,'N1');
 const planes=(eq,goal,days)=>{const p=gen(intake({strengthTrainingMonths:24,runTrainingMonths:0,goals:{run:'NONE',strength:goal},equipment:eq,recent:{strengthDaysPerWeek:days.length},exerciseRotationPreference:'COACH_DECIDES'},{strengthDays:days,strengthMinutes:60})).program;return [...new Set(p.weeks.flatMap((w,i)=>strengthRows(p,i).map(x=>configurationOf(x.e.id)?.subpattern)))].filter(s=>/VERTICAL|HORIZONTAL/.test(s)).sort();};
 const pv=[['FULL','HYPERTROPHY',[0,2,4,6]],['FULL','GENERAL',[1,4]],['MACHINES+DB','STRENGTH',[1,3,5]]].map(([n,g,d])=>({profile:n,goal:g,days:d.length,planes:planes(n==='FULL'?FULL:['DUMBBELLS','BENCH','MACHINES'],g,d)}));
 check('I','12 weeks, full gym or machines: horizontal and vertical push and pull are all selected',pv.every(x=>['HORIZONTAL_PULL','HORIZONTAL_PUSH','VERTICAL_PULL','VERTICAL_PUSH'].every(s=>x.planes.includes(s))),pv,'N4 (GAP-S8 closed)');
}

// ---------- the foundation's sweep, before and after ----------
{
 const profiles={FULL,DB_BENCH:['DUMBBELLS','BENCH'],DB:['DUMBBELLS'],BW:[],MACH_DB:['DUMBBELLS','BENCH','MACHINES']},PLANES=['VERTICAL_PUSH','VERTICAL_PULL','HORIZONTAL_PUSH','HORIZONTAL_PULL'];
 const count={before:Object.fromEntries(PLANES.map(x=>[x,0])),after:Object.fromEntries(PLANES.map(x=>[x,0]))},still=[];let n=0,holds=0;
 for(const [pn,eq] of Object.entries(profiles))for(const goal of ['GENERAL','HYPERTROPHY','STRENGTH','RUNNING_SUPPORT'])for(const days of [[1,4],[1,3,5],[0,2,4,6]])for(const months of [0,24]){
  const i={version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:AS_OF,startDate:START,weeks:12,athlete:{id:'v',ageYears:30,eligibility:ELIG(AS_OF),strengthTrainingMonths:months,runTrainingMonths:0,goals:{run:'NONE',strength:goal},equipment:eq,recent:{strengthDaysPerWeek:days.length},exerciseRotationPreference:'COACH_DECIDES'},schedule:{strengthDays:days,strengthMinutes:60}};
  const subs=p=>new Set(p.weeks.flatMap(w=>w.sessions.filter(s=>s.prescription&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>configurationOf(e.id)?.subpattern))));
  const a=subs(FROZEN.generateProgram(i).program),bp=gen(i).program,b=subs(bp);n++;
  if(bp.weeks.some(w=>w.sessions.some(s=>s.prescription?.exercises?.some(e=>HOLDS.includes(e.id)))))holds++;
  for(const x of PLANES){if(!a.has(x))count.before[x]++;if(!b.has(x)){count.after[x]++;if(x.startsWith('VERTICAL'))still.push(`${pn} ${goal} ${days.length}d ${months}mo: ${x}`);}}
 }
 console.log(`sweep (${n} profiles x 12 weeks): profiles in which a plane is never selected`);
 for(const x of PLANES)console.log(`  ${x.padEnd(16)} before ${String(count.before[x]).padStart(3)}   after ${String(count.after[x]).padStart(3)}`);
 console.log(`  profiles with a plank row in any week after: ${holds}`);
 const why=s=>/ 0mo: VERTICAL_PUSH/.test(s)?'a plan that opens with movement practice: no vertical push is admissible at LOW skill':/ 0mo: VERTICAL_PULL/.test(s)?'a plan that opens with movement practice: the plane rule asks nothing of it':/ (DB|DB_BENCH) .*VERTICAL_PULL/.test(' '+s)?'no vertical pull exists for dumbbells (catalog)':/^BW .*VERTICAL_PULL/.test(s)?'no pull-down or pull-up without equipment':'see the profile';
 const groups={};for(const s of still){const k=why(s);groups[k]=(groups[k]??0)+1;}
 console.log('  vertical planes still absent after, by reason: '+JSON.stringify(groups)+(VERBOSE?'\n   '+still.join('\n   '):''));
 check('sweep','past movement practice (24 months), vertical pull is selected wherever machines exist and vertical push in every profile; no profile holds a plank; the horizontal planes are as before',count.after.HORIZONTAL_PUSH===count.before.HORIZONTAL_PUSH&&count.after.HORIZONTAL_PULL===count.before.HORIZONTAL_PULL&&holds===0&&!still.some(s=>/^(FULL|MACH_DB) .* 24mo: VERTICAL_PULL/.test(s))&&!still.some(s=>/ 24mo: VERTICAL_PUSH/.test(s))&&count.after.VERTICAL_PULL<count.before.VERTICAL_PULL&&count.after.VERTICAL_PUSH<count.before.VERTICAL_PUSH,count,'N4');
}

console.log('');
let pass=0;for(const x of results){if(x.ok)pass++;console.log(`${x.ok?'PASS':'FAIL'} [${x.scenario}] ${x.claim}${VERBOSE||!x.ok?'\n      '+JSON.stringify(x.observed):''}`);}
console.log(`\n${pass}/${results.length} checks pass with the corrections on`);
process.exitCode=pass===results.length?0:1;
