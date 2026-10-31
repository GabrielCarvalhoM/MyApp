import {clone,freeze,hash} from './value.mjs';
import {canonicalizeIntake,onDate,dayGap} from './r6-intake.mjs';
import {r6Authority,allows} from './r6-authority.mjs';
import {catalogueEntry} from './r6-catalogue.mjs';
import {walkPrescription,walkJogPrescription,easyPrescription,qualityPrescription,racePrescription,exerciseRow,fitStrengthSession,strengthPrescription,validateR6Prescription,roundTo5,reducedWork} from './r6-prescription.mjs';
import {chooseBalanced,hourOf} from './r6-balanced.mjs';
import {admitted,repertoireAuthority,DEFAULT_REPERTOIRE,repertoireOf,repertoireBinding,allowsCandidate,buildTemplates,templateTypesFor,noviceTemplateTypes,PRACTICE_FOR,RUN_CLASS_THRESHOLDS,archetypeOf,noExternalLoad,ordinalResistance,incrementFor,kgText,pullCoverageDisclosure,lowerStimulusDisclosure,runRepertoireOf,ROTATION_DEFERRED_PHASES,rotationEligibility,configurationOf,novelOrEccentricLower,I11_PROTECTED_FAMILIES,demandRank,familiarRunCategory,familiarBoutsInputs,laterGateRunItem,laterGateItem} from './r7b-repertoire.mjs';

export const PROGRAM_VERSION='R6-PROGRAM-1';
export function programHash(p){const c=clone(p);delete c.hash;return hash(c);}
export const validProgram=p=>p?.version===PROGRAM_VERSION&&p.hash===programHash(p);
const permutations=list=>list.length<=1?[list]:list.flatMap((x,i)=>permutations([...list.slice(0,i),...list.slice(i+1)]).map(rest=>[x,...rest]));
export const EVENT_PHASES=['SPECIFIC','TAPER','RACE_WEEK'];
export const DEVELOPMENT=['BUILD','DEVELOPMENT','NEXT_BLOCK'];
export const GATES=['ADVANCE','HOLD','REGRESS','EARNED'];
const mid=([a,b])=>(a+b)/2;
const floor5=n=>Math.max(5,Math.floor(n/5)*5);

/** Capacity per modality from onboarding-like facts; unknown stays unknown and selects establishment. */
export function assessCapability(c,op=null){
 // The run-class thresholds are the reviewed runtime constants, exposed with their provenance (B0-F05); never changed or re-invented here.
 const T=RUN_CLASS_THRESHOLDS,a=c.athlete,r=a.recentRun,s=c.schedule,runGoal=c.goals.run.kind,strengthGoal=c.goals.strength.kind,pause=a.pause,longPause=pause?.screen?.status==='NONCLINICAL'&&(pause.weeks??0)>=T.longPauseWeeksAtLeast;
 const current=a.knownRuns.filter(t=>t.current&&!t.implausible);
 const run={programmed:runGoal!=='NONE'&&s.runDays.length>0,experience:a.runExperience,basis:r.basis,weeklyMinutes:r.runMinutesPerWeek,daysPerWeek:r.runDaysPerWeek,longestMinutes:r.longestRunMinutes,familiarQuality:a.knownRuns.filter(t=>t.current&&['THRESHOLD','CRUISE','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC'].includes(t.prescription?.family)),
  // B0-C02 / B0-C10: other current familiar tasks by category; they never change the run class (classification equals the reviewed binding).
  familiarBouts:current.filter(t=>familiarRunCategory(t)==='VO2_STYLE').map(t=>({task:clone(t),missing:familiarBoutsInputs(t)})),laterGateTasks:current.filter(t=>familiarRunCategory(t)==='LATER_GATE').map(t=>({task:clone(t),laterGate:laterGateRunItem(t)})),ambiguousTasks:current.filter(t=>familiarRunCategory(t)==='AMBIGUOUS').map(t=>clone(t))};
 // Current running below the minimum easy session (longest run or weekly total) cannot hold a continuous easy run: walk/jog (QRE-R6-09).
 const minimum=op?.run?.minimumSessionMinutes??15,belowSession=v=>Number.isFinite(v)&&v>0&&v<minimum;
 run.belowMinimumSession=belowSession(r.longestRunMinutes)||belowSession(r.runMinutesPerWeek);
 const why=(cls,predicate)=>{run.class=cls;run.classification={predicate,thresholds:'RUN_CLASS_THRESHOLDS',policyDeclaration:T.policyDeclaration};};
 if(!run.programmed)why('NOT_PROGRAMMED','Run goal NONE or no chosen run days');
 else if(a.runExperience==='NONE'||a.runExperience==='NOVICE'&&(r.runMinutesPerWeek===null||r.runMinutesPerWeek<T.noviceWeeklyMinutesBelow||r.runDaysPerWeek===0)||run.belowMinimumSession&&!longPause)why('WALK_JOG',a.runExperience==='NONE'?'Experience NONE':run.belowMinimumSession&&!longPause&&a.runExperience!=='NOVICE'?'Current longest run or weekly running below run.minimumSessionMinutes':`NOVICE with weekly minutes unknown, below ${T.noviceWeeklyMinutesBelow} or 0 run days`);
 else if(r.runDaysPerWeek===0||r.runMinutesPerWeek===0||longPause)why('RESTART',longPause?`Structured nonclinical pause of ${T.longPauseWeeksAtLeast} weeks or more`:'0 run days or 0 weekly minutes');
 else if(r.runMinutesPerWeek===null)why('EASY_UNKNOWN','Weekly running minutes unknown');
 else if(a.runExperience==='NOVICE'||r.runMinutesPerWeek<T.easyLowWeeklyMinutesBelow||(r.runDaysPerWeek??0)<T.easyLowRunDaysBelow)why('EASY_LOW',a.runExperience==='NOVICE'?'NOVICE':`Below ${T.easyLowWeeklyMinutesBelow} weekly minutes or ${T.easyLowRunDaysBelow} run days`);
 else if(run.familiarQuality.length)why('QUALITY_FAMILIAR','A current familiar THRESHOLD/CRUISE/TEN_K_SPECIFIC/HALF_MARATHON_SPECIFIC task');
 else why('EASY_CURRENT','Otherwise');
 const known=longPause?[]:a.knownExercises.filter(e=>e.dose);
 const strength={programmed:strengthGoal!=='NONE'&&s.strengthDays.length>0,experience:a.strengthExperience,known,familiarIds:a.knownExercises.filter(e=>e.familiar).map(e=>e.id),loadHints:Object.fromEntries(a.knownExercises.filter(e=>e.loadHint).map(e=>[e.id,e.loadHint]))};
 if(!strength.programmed)strength.class='NOT_PROGRAMMED';
 else if(known.length)strength.class='KNOWN_LOAD';
 else if(['INTERMEDIATE','EXPERIENCED'].includes(a.strengthExperience)||a.knownExercises.length)strength.class='FAMILIAR_UNKNOWN_LOAD';
 else strength.class='NONE';
 return {run,strength,pause:clone(pause),restartAfterPause:longPause};
}
/** Contextual priority from goals, event and phase. A static priority flag is never required. */
export function buildGoalModel(c){
 const run=c.goals.run.kind,str=c.goals.strength.kind,ev=c.goals.event,runDev=['RACE','PERFORMANCE'].includes(run),strDev=['STRENGTH','HYPERTROPHY'].includes(str);
 const base=run==='NONE'?'STRENGTH':str==='NONE'?'RUN':ev?(strDev?'JOINT':'RUN'):runDev&&strDev?'JOINT':runDev?'RUN':strDev?'STRENGTH':'JOINT';
 const why={JOINT:'Both goals develop with equal standing; arrangement trade-offs use the lowest worst-case joint harm',RUN:runDev?'The running goal leads; strength supports or is maintained':'Only running is programmed',STRENGTH:strDev?'Strength development leads; running keeps aerobic participation':'Only strength is programmed'};
 const lead={ESTABLISHMENT:base,BUILD:base,CONSOLIDATION:base,DEVELOPMENT:base,SPECIFIC:'RUN',TAPER:'RUN',RACE_WEEK:'RUN',POST_EVENT:'JOINT',NEXT_BLOCK:str==='NONE'?'RUN':strDev||run==='NONE'?'STRENGTH':'JOINT'};
 const priorityByPhase=Object.fromEntries(Object.entries(lead).map(([phase,l])=>[phase,{lead:l,reason:EVENT_PHASES.includes(phase)?'Event proximity: the race is the near goal; strength keeps its essential stimulus at a reduced dose':phase==='POST_EVENT'?'Post-event: recovery first, both modalities low':phase==='NEXT_BLOCK'?(strDev?'After the event, strength development leads the next block':'After the event, both goals continue from a lower level'):why[l]}]));
 return {run:{kind:run,development:runDev,event:clone(ev)},strength:{kind:str,development:strDev},baseLead:base,priorityByPhase,staticPriorityRequired:false,temporaryPreference:c.schedule.temporaryPreference??null};
}
export function planPhases(c,cap,op){
 const N=c.weeks,ev=c.goals.event,phases=[];
 const est=['WALK_JOG','RESTART','EASY_UNKNOWN'].includes(cap.run.class)||['NONE','FAMILIAR_UNKNOWN_LOAD'].includes(cap.strength.class)?1:0;
 const every=op.run.consolidationEveryNthDevelopmentWeek;let dev=0,next=0;
 if(ev){
  const offset=dayGap(c.startDate,ev.date),E=Math.floor(offset/7),raceDay=offset-E*7;
  const taper=E-est>=4?op.event.taperWeeks[ev.kind]:0,taperStart=E-taper;
  const specificLen=Math.max(0,Math.min(op.event.specificWeeks[ev.kind],taperStart-est-1)),specificStart=taperStart-specificLen;
  for(let i=0;i<N;i++)phases.push(i<est?'ESTABLISHMENT':i<specificStart?((++dev)%every===0?'CONSOLIDATION':'BUILD'):i<taperStart?'SPECIFIC':i<E?'TAPER':i===E?'RACE_WEEK':i===E+1?'POST_EVENT':(++next)%every===0?'CONSOLIDATION':'NEXT_BLOCK');
  return {phases,establishmentWeeks:est,raceWeek:E,raceDay,specificStart,taperStart};
 }
 for(let i=0;i<N;i++)phases.push(i<est?'ESTABLISHMENT':(++dev)%every===0?'CONSOLIDATION':'DEVELOPMENT');
 return {phases,establishmentWeeks:est,raceWeek:null,raceDay:null};
}
export function contextOf(phases,w){
 const p=phases[w];
 if(p==='CONSOLIDATION'){for(let i=w-1;i>=0;i--)if(DEVELOPMENT.includes(phases[i]))return phases[i];return phases.includes('BUILD')?'BUILD':'DEVELOPMENT';}
 if(['TAPER','RACE_WEEK','POST_EVENT'].includes(p))return phases.includes('SPECIFIC')?'SPECIFIC':phases.includes('BUILD')?'BUILD':'ESTABLISHMENT';
 return p;
}
export const BLOCK_INTENT={ESTABLISHMENT:'Establish current capacity: conservative entries, technique and observed response before progression',BUILD:'Build aerobic durability and strength with one progression step at a time, gated by observed response',DEVELOPMENT:'Develop both goals with response-gated steps and periodic consolidation',CONSOLIDATION:'Consolidate: hold intensity, step volume back, let adaptation catch up',SPECIFIC:'Event-specific running leads; strength keeps its essential stimulus at a reduced dose',TAPER:'Reduce volume progressively while keeping frequency and a short intensity touch; no new stimulus',RACE_WEEK:'Arrive fresh: short easy runs, a brief race-effort touch, race day',POST_EVENT:'Easy nonclinical transition after the race; check function and eligibility before redevelopment',NEXT_BLOCK:'Redevelop after the event from the transition level; no automatic restoration of peak dose'};
export function blocksFrom(phases,priorityByPhase){
 const blocks=[];
 phases.forEach((phase,i)=>{const family=phase==='CONSOLIDATION'?(blocks.at(-1)?.family??'DEVELOPMENT'):phase,prev=blocks.at(-1);if(prev&&prev.family===family&&prev.endWeekExclusive===i&&!(phase!=='CONSOLIDATION'&&phases[i-1]==='CONSOLIDATION'))prev.endWeekExclusive=i+1;else blocks.push({id:'block-'+blocks.length,family,phase:family,startWeek:i,endWeekExclusive:i+1});});
 return blocks.map(b=>({...b,intent:BLOCK_INTENT[b.family],contextualPriority:priorityByPhase[b.family]??null,exitCriteria:['Planned steps advance only after comparable executed sessions without adverse response','Missed key work or a single adverse response repeats the step; repeated adverse response regresses one step','Eligibility, function and schedule remain current'],progressionAutomatic:false}));
}
/** The practice configuration of each slot pattern (catalog skillLadders.practiceFor, equal to the R6 PRACTICE_ID). */
export const PRACTICE_ID=PRACTICE_FOR;
/**
 * Session templates (R7-B binding of the catalog templates, B0-C05/B0-C09/B0-C08): which configuration fills each slot of each chosen strength
 * day, from facts, equipment and the bound repertoire; the row's role is the slot's (DR-134). `capped` builds the novice-density set (two full
 * templates, TPL.CORE on further days; B0-C08); `established` lists exercises already in use, kept for continuity. Emphasis reorders, never
 * invents competence.
 */
export function strengthTemplates(c,goal,{equipment=c.athlete.equipment,knownOnly=false,auth=null,capped=false,established=[]}={}){
 const a=c.athlete,days=c.schedule.strengthDays.length,types=capped?noviceTemplateTypes(days):templateTypesFor(days);
 return buildTemplates({types,equipment,experience:a.strengthExperience,knownExercises:a.knownExercises,established,goal,auth:auth??DEFAULT_REPERTOIRE,knownOnly,emphasis:[...a.strengthPreferences.emphasis,...a.strengthPreferences.movementPriorities],selections:a.strengthSelections??[],ladderReached:a.ladderReached??[]});
}
/** B0-C08: strength class NONE with more than two chosen strength days keeps two full templates until the first block boundary. */
export const noviceDensityApplies=(sk,cap=sk.cap)=>allowsCandidate(sk.repertoire??DEFAULT_REPERTOIRE,'B0-C08')&&cap.strength.programmed&&cap.strength.class==='NONE'&&sk.c.schedule.strengthDays.length>2;
const turnOf=(c,sport)=>sport==='RUN'?c.schedule.runTurn:c.schedule.strengthTurn;
/** Candidate weekly arrangements: quality day × strength-type permutation × back-to-back order on shared same-turn days. */
export function arrangementCandidates(c,cap,goal,context,ctx,templates){
 const s=c.schedule,runDays=cap.run.programmed?s.runDays:[],strengthDays=cap.strength.programmed?s.strengthDays:[];
 // The R6 quality gates stay whole (B0-FIDELITY M1–M3): run goal RACE or PERFORMANCE, at least three chosen run days, a development or
 // specific context and R6-RUN-QUALITY. A graduated novice (B0-C01, decided on executed evidence at a block boundary) meets the class gate only.
 const qualityClass=['EASY_CURRENT','QUALITY_FAMILIAR'].includes(cap.run.class)||!!c.athlete.runGraduation&&allowsCandidate(ctx.repertoire??DEFAULT_REPERTOIRE,'B0-C01');
 const qualityAllowed=qualityClass&&['RACE','PERFORMANCE'].includes(goal.run.kind)&&['BUILD','SPECIFIC','NEXT_BLOCK','DEVELOPMENT'].includes(context)&&runDays.length>=3&&allows(ctx.authority,'R6-RUN-QUALITY');
 const longDay=cap.run.class==='WALK_JOG'?null:s.longRunDay,qualityOptions=qualityAllowed?runDays.filter(d=>d!==longDay):[null];
 const types=templates.map(t=>t.type),perms=types.length>5?[types]:permutations(types),out=[];
 const sameTurnShared=s.sharedDays.filter(d=>!s.runTurn||!s.strengthTurn||s.runTurn===s.strengthTurn);
 const specificFamily=EVENT_PHASES.includes(context)&&goal.run.event?(goal.run.event.kind==='10K'?'TEN_K_SPECIFIC':'HALF_MARATHON_SPECIFIC'):'THRESHOLD';
 for(const q of qualityOptions.length?qualityOptions:[null])for(const perm of perms)for(const runFirst of sameTurnShared.length?[true,false]:[true]){
  const sessions=[];
  for(const d of runDays){const role=d===longDay?'LONG':d===q?'QUALITY':'EASY';sessions.push({id:'RUN-'+d,sport:'RUN',role,day:d,turn:turnOf(c,'RUN'),backToBackOrder:sameTurnShared.includes(d)?(runFirst?0:1):0,prescription:{modality:'RUN',family:role==='QUALITY'?specificFamily:role}});}
  const taken=new Set();
  strengthDays.forEach((d,i)=>{const t=templates.find(x=>x.type===perm[i]&&!taken.has(x.index))??templates[i];taken.add(t.index);sessions.push({id:'STR-'+d,sport:'STRENGTH',role:'STRENGTH_'+t.type,templateIndex:t.index,day:d,turn:turnOf(c,'STRENGTH'),backToBackOrder:sameTurnShared.includes(d)?(runFirst?1:0):0,prescription:{modality:'STRENGTH',exercises:t.rows.map(r=>({id:r.entry.id,pattern:r.pattern,sets:context==='ESTABLISHMENT'&&cap.strength.class==='NONE'?1:cap.strength.known.find(k=>k.id===r.entry.id)?.dose?.sets??(r.role==='MAIN'?3:2),load:{mode:noExternalLoad(r.entry)?'BODYWEIGHT':'ESTABLISH',unit:noExternalLoad(r.entry)?'BODYWEIGHT':'KG'},...(context==='ESTABLISHMENT'&&!cap.strength.known.some(k=>k.id===r.entry.id)?{firstExposure:true}:{})}))}});});
  const adjacentToLong=q!==null&&longDay!==null&&[1,6].includes(Math.abs(q-longDay));
  out.push({id:`q${q??'-'}|${perm.join(',')}|${sameTurnShared.length?(runFirst?'run-first':'strength-first'):'separate'}`,quality:q,perm,runFirstOnShared:runFirst,sessions,admissible:true,adjacentToLong,preservesRun:true,preservesStrength:true,signature:hash(sessions.map(x=>[x.sport,x.role,x.day,x.backToBackOrder]))});
 }
 // R6-RUN-QUALITY: quality never sits the day before or after the long run when another chosen run day can hold it.
 if(ctx.op?.hybrid?.qualityAdjacentToLongForbiddenWhenAlternativeExists&&out.some(x=>x.quality!==null&&!x.adjacentToLong))for(const x of out)if(x.adjacentToLong){x.admissible=false;x.reasons=['Quality adjacent to the long run while another chosen run day can hold it'];}
 return out;
}
/** Arrangement costs of MODERATE or higher that the chosen layout keeps are disclosed with alternatives (R6-HYBRID-ARRANGEMENT). */
export function arrangementDisclosures(choices){
 const out=[];
 for(const [key,choice] of Object.entries(choices)){
  const [context,variant]=key.split('@'),selected=(choice?.counterfactuals??[]).find(c=>c.selected),heavy=(selected?.costs??[]).filter(c=>['MODERATE','HIGH'].includes(c.severity));
  if(!heavy.length)continue;
  out.push({id:'ARRANGEMENT_COST_DISCLOSED',blocking:false,informational:true,context,...(variant?{variant:'NOVICE_DENSITY'}:{}),costs:heavy.map(c=>({axis:c.axis,severity:c.severity,cause:c.cause})),detail:`In ${context.toLowerCase()} weeks this layout keeps ${[...new Set(heavy.map(c=>c.cause.charAt(0).toLowerCase()+c.cause.slice(1)))].join('; ')}. It was the least costly option on the chosen days and shifts.`,options:['Keep this layout','Swap the shifts on that day','Move one of the sessions to another chosen day']});
 }
 return out;
}
/**
 * Repertoire disclosures and negotiations of a program (R7-B; B0-C02, B0-C03, B0-C08, B0-C09, B0-C10): computed from what was selected, never
 * blocking. A later-gate or unsupported request is never prescribed: its fallback is used and disclosed as a different stimulus.
 */
export function repertoireNegotiation(sk,{templates=[],noviceTemplates=null}={}){
 const {cap,goal,c,repertoire:rep}=sk,out=[],all=[...templates,...(noviceTemplates??[])];
 const pull=pullCoverageDisclosure(all);if(pull)out.push(pull);
 const lower=lowerStimulusDisclosure(all,goalDose(sk));if(lower)out.push(lower);
 if(noviceTemplates&&noviceTemplates.length>2)out.push({id:'STRENGTH_DAYS_ABOVE_CURRENT_PRACTICE',blocking:false,days:c.schedule.strengthDays.length,detail:`${c.schedule.strengthDays.length} strength days chosen: until the first block review two of them are full sessions and the others are lighter trunk and calf sessions by design, so new work is spread rather than added; the full split starts once your first block shows the loads established and well tolerated`,options:['Keep the days with lighter sessions','Choose fewer strength days'],basis:'B0-C08 (a reversible coaching choice, not a physiological limit)'});
 for(const x of cap.run.laterGateTasks??[]){const g=laterGateItem(x.laterGate);out.push({id:'LATER_GATE_RUN_TASK',blocking:false,informational:true,laterGate:x.laterGate,detail:`Your familiar ${String(x.task.category??x.task.prescription?.family??'session').toLowerCase().replace(/_/g,' ')} is not part of the V1 plan yet; ${g?.fallback??'the nearest supported session'} is used instead and is a different stimulus, not an equivalent`,options:['Keep the plan']});}
 for(const t of cap.run.ambiguousTasks??[])out.push({id:'FAMILIAR_RUN_TASK_CATEGORY_ASK',blocking:false,question:'What kind of session is your familiar run task (easy, threshold, harder repeated intervals of a few minutes, short fast intervals, hills, a time trial)?',detail:'Until it is clear, the task is kept as history and does not change the plan',task:t.prescription?.family??null});
 const bouts=cap.run.familiarBouts??[];
 if(bouts.length&&['RACE','PERFORMANCE'].includes(goal.run.kind)){
  if(!allowsCandidate(rep,'B0-C02'))out.push({id:'LATER_GATE_RUN_TASK',blocking:false,informational:true,laterGate:'LATER.RUN.VO2_DE_NOVO',detail:'Continuing your familiar harder intervals is not available in this plan; the threshold ladder is used instead and is a different stimulus',options:['Keep the plan']});
  else if(bouts.every(b=>b.missing.length))out.push({id:'FAMILIAR_HARDER_INTERVALS_DETAILS',blocking:false,missingInputs:[...new Set(bouts.flatMap(b=>b.missing))],detail:'Your familiar harder intervals can continue exactly as you do them once the plan knows the exact session, its current target and how that target was measured, your recent sessions of it and that conditions are comparable; until then the quality day uses the threshold ladder from its first step',options:['Add the details','Use the threshold ladder']});
 }
 // Feasibility: a running quality session needs at least three chosen run days (R6-RUN-QUALITY gate, B0-FIDELITY M1–M3).
 if(cap.run.programmed&&['RACE','PERFORMANCE'].includes(goal.run.kind)&&c.schedule.runDays.length<3)out.push({id:'QUALITY_NEEDS_THREE_RUN_DAYS',blocking:false,detail:`With ${c.schedule.runDays.length} run day(s) the plan keeps easy and long running only: a harder quality session needs at least three chosen run days so it never crowds the long run`,options:['Add a run day','Keep easy and long running only'],authority:'R6-RUN-QUALITY'});
 if(c.goals.contextEvent?.kind==='5K')out.push({id:'EVENT_5K_PERFORMANCE_FALLBACK',blocking:false,informational:true,detail:'5K races have no event recipe in V1: the plan is a performance plan without specific, taper or race-week phases, and the race date and any time goal are context only',options:['Keep the performance plan','Choose a 10K or half marathon'],laterGate:'LATER.EVENT.5K'});
 return out;
}
/**
 * Feasibility negotiation trace (R7-B; request §18; catalog composition.protectedStimuli, infeasibleOrIncomparable; DR-112): the ideal week of
 * this goal model, what the chosen days and times allow, the stimuli protected first under each lead, and every reduction with the rule that made
 * it. Reductions use only existing authorities (walk conversion, the quality gates, the novice cap, the time fit that drops accessories before
 * main sets, rest by design when no supported session fits); chosen days are never dropped and nothing is removed at random.
 */
export function feasibilityOf(sk,weeks,negotiation=[]){
 const {c,cap,goal}=sk,s=c.schedule,ideal={run:cap.run.programmed?{longRun:s.longRunDay!==null,qualitySession:['RACE','PERFORMANCE'].includes(goal.run.kind),easyDays:Math.max(0,s.runDays.length-(s.longRunDay!==null?1:0)-(['RACE','PERFORMANCE'].includes(goal.run.kind)?1:0))}:null,strength:cap.strength.programmed?{templates:templateTypesFor(s.strengthDays.length).map(t=>'TPL.'+t)}:null};
 const order={RUN:['RUN.LONG','quality KEY run','RUN.EASY','strength MAIN at goal or phase dose','strength ACCESSORY'],STRENGTH:['strength MAIN (key SQUAT/HINGE sessions)','strength ACCESSORY','RUN.EASY participation on chosen days','RUN.LONG (content may yield)'],JOINT:['Pareto, then lowest worst-case joint harm; a genuine equal-harm trade-off is asked once']};
 const reductions=[],first=weeks.find(w=>DEVELOPMENT.includes(w.phase))??weeks[0];
 const q=['RACE','PERFORMANCE'].includes(goal.run.kind)&&cap.run.programmed;
 if(q&&!['EASY_CURRENT','QUALITY_FAMILIAR'].includes(cap.run.class))reductions.push({id:'QUALITY_AFTER_EVIDENCE',authority:'R6-RUN-QUALITY / B0-C01',detail:'No harder session yet: it needs current running at the easy-current level, or two complete weeks of easy running that reach it (graduation at a block review)'});
 if(q&&s.runDays.length<3)reductions.push({id:'QUALITY_NEEDS_THREE_RUN_DAYS',authority:'R6-RUN-QUALITY',detail:'Fewer than three run days: easy and long running only'});
 const walks=(first?.sessions??[]).filter(x=>x.converted==='TOO_MANY_RUN_DAYS_FOR_CURRENT_PRACTICE'||x.converted==='TOO_MANY_RUN_DAYS_FOR_ESTABLISHMENT');
 if(walks.length)reductions.push({id:'RUN_DAYS_AS_WALKS',authority:'R6-COLD-START / DR-112',days:walks.map(x=>x.day),detail:'Chosen run days beyond current running carry brisk walks that convert one at a time at block starts'});
 if(negotiation.some(n=>n.id==='STRENGTH_DAYS_ABOVE_CURRENT_PRACTICE'))reductions.push({id:'STRENGTH_DAYS_LIGHTER',authority:'B0-C08 / DR-112',detail:'Two full sessions until the first block review; the other chosen days are lighter by design'});
 const rest=weeks.flatMap(w=>w.sessions.filter(x=>x.sport==='STRENGTH'&&x.role==='REST_BY_DESIGN'&&/chosen time cannot hold/.test(x.explanation??'')).map(x=>x.id));
 if(rest.length)reductions.push({id:'STRENGTH_DAY_TIME_TOO_SHORT',authority:'R6-COLD-START (minimum supported session)',sessions:rest.length,detail:'The chosen time cannot hold a supported strength session on some days; they stay rest by design'});
 const dropped=[];for(const x of (first?.sessions??[]).filter(x=>x.sport==='STRENGTH'&&x.prescription)){const t=(sk.templates??[]).find(t=>t.type===x.templateType);if(!t)continue;const have=new Set(x.prescription.exercises.map(e=>e.id));for(const r of t.rows)if(!have.has(r.entry.id)&&r.role!=='MAIN')dropped.push(r.entry.id);}
 if(dropped.length)reductions.push({id:'STRENGTH_TIME_FIT',authority:'R6 fitting (accessories go before main sets)',exercises:[...new Set(dropped)],detail:'The chosen time per session keeps the main lifts; some accessories are left out'});
 for(const n of negotiation)if(['LONG_RUN_TIME_LIMITS_EVENT','TOO_FEW_RUN_DAYS_FOR_EVENT','EVENT_AMBITIOUS_FOR_CURRENT_RUNNING','MOVEMENT_PATTERN_UNAVAILABLE','PULL_LIMITED_FOR_EQUIPMENT','EQUIPMENT_LIMITS_STRENGTH_SESSION'].includes(n.id))reductions.push({id:n.id,authority:'negotiation',detail:n.detail??null});
 return {basis:'catalog composition.protectedStimuli, infeasibleOrIncomparable; DR-112 (chosen days and shifts are hard constraints)',lead:goal.baseLead,ideal,protectedOrder:order[goal.baseLead]??order.JOINT,chosenDaysKept:true,reductions};
}
/** Program-level progression (request §19): each block's intent, lead and the planned run and strength doses at its first and last week. */
export function progressionOf(weeks,blocks){
 const run=w=>w?{long:w.sessions.find(s=>s.role==='LONG'&&s.prescription)?.prescription.durationMinutes??null,easy:Math.max(0,...w.sessions.filter(s=>s.role==='EASY'&&s.prescription).map(s=>s.prescription.durationMinutes))||null,quality:w.sessions.find(s=>s.role==='QUALITY'&&s.prescription)?.prescription.family??null,plannedRunMinutes:w.plannedRunMinutes}:null;
 return blocks.map(b=>{const ws=weeks.filter(w=>w.index>=b.startWeek&&w.index<b.endWeekExclusive);return {block:b.id,family:b.family,weeks:[b.startWeek,b.endWeekExclusive-1],lead:b.contextualPriority?.lead??null,intent:b.intent,run:{first:run(ws[0]),last:run(ws.at(-1))},strength:{firstSets:ws[0]?.plannedStrengthSets??null,lastSets:ws.at(-1)?.plannedStrengthSets??null},advances:'Each step needs the previous comparable exposure executed without an adverse response; nothing advances on the calendar'};});
}
/** Days that keep a brisk walk instead of a run: adjacent to key runs first, then the latest days. */
export function walkDays(roles,walks){
 const easy=roles.filter(r=>r.sport==='RUN'&&r.role==='EASY'),keys=roles.filter(r=>r.sport==='RUN'&&['LONG','QUALITY'].includes(r.role));
 const adjacency=r=>keys.some(k=>[1,6].includes(Math.abs(k.day-r.day)))?1:0;
 return new Set([...easy].sort((a,b)=>adjacency(b)-adjacency(a)||b.day-a.day).slice(0,walks).map(r=>r.id));
}
// ---------- Run state machine: planned trajectory and response-gated transitions ----------
export function runTarget(sk){const R=sk.op.run,s=sk.c.schedule,ev=sk.goal.run.event;return Math.min(s.longRunMinutes??s.runMinutes??0,ev?R.longRunTargets[ev.kind]:R.longRunTargets[sk.goal.run.kind]??60);}
export function initialRunState(sk){
 const {c,cap,plan,op}=sk,R=op.run,s=c.schedule,budget=s.runMinutes,longBudget=s.longRunMinutes??budget,cls=cap.run.class;
 const runDays=cap.run.programmed?s.runDays:[],hasLong=cls!=='WALK_JOG'&&s.longRunDay!==null&&runDays.includes(s.longRunDay),nEasy=runDays.length-(hasLong?1:0);
 const st={mode:!runDays.length?'NONE':cls==='WALK_JOG'?'WALK_JOG':cls==='RESTART'?'RESTART':'EASY',walkStep:0,restart:op.return.entryRunMinutes,long:null,easy:null,easyExtra:0,walks:0,qualityStep:0,specificStep:0,thresholdDone:0,devCount:0,resumed:false,longByWeek:{},hasLong,nEasy,
  qualityRunner:['EASY_CURRENT','QUALITY_FAMILIAR'].includes(cls),qualityNeeds:cls==='QUALITY_FAMILIAR'?0:R.qualityRequiresEstablishedEasyWeeks,stridesEligible:['EASY_CURRENT','QUALITY_FAMILIAR','EASY_LOW'].includes(cls),
  easyWeeksDone:0,qualityDone:0,stridesDone:0,achieved:{long:null,easy:null,quality:null,strides:0}};
 // A non-novice whose current running is below the minimum easy session starts the ladder at the step that fits it:
 // one jog segment within the longest current run, a session's jogging within its share of current weekly running.
 if(st.mode==='WALK_JOG'&&cap.run.belowMinimumSession&&!['NONE','NOVICE'].includes(cap.run.experience)){
  const L=cap.run.longestMinutes,W=cap.run.weeklyMinutes,share=W/Math.max(1,Math.min(runDays.length,op.establishment.maxWalkJogDaysPerWeek));
  // A session's jogging stays within both the longest current run and its share of weekly running (SSCTR D42).
  const fits=op.establishment.walkJogLadder.map((x,i)=>Number.isFinite(L)&&Number.isFinite(W)&&x.repetitions*x.jogSeconds<=Math.min(L,share)*60?i:-1).filter(i=>i>=0);
  st.walkStep=fits.length?Math.max(...fits):0;st.walkStepStart=st.walkStep;
 }
 if(st.mode==='EASY'){
  // Unknown exposure: the reviewed easy entry only; the long-run day starts at the same entry.
  if(cls==='EASY_UNKNOWN'){st.easy=Math.min(budget,op.establishment.unknownExposureEasyMinutes);st.long=hasLong?Math.min(longBudget,st.easy):null;st.walks=Math.max(0,nEasy-2);}
  else{
   const W0=cap.run.weeklyMinutes,avg=W0/runDays.length,share=runDays.length>=3?Math.max(avg,W0*R.longRunShareOfWeeklyMinutesMax):W0;
   // Week-1 long run never exceeds the longest current run; rounding goes down.
   st.long=hasLong?Math.min(longBudget,W0,floor5(Math.min(cap.run.longestMinutes??avg,share))):null;
   // A current familiar quality task in week 1 counts inside the reported weekly minutes, otherwise it waits a week.
   const fq=cls==='QUALITY_FAMILIAR'&&plan.establishmentWeeks===0?familiarQualityMinutes(sk):null;
   // The ladder continues from the athlete's familiar level: the familiar task stands at the highest step it covers.
   if(cls==='QUALITY_FAMILIAR'){const f=cap.run.familiarQuality[0]?.prescription?.work,work=x=>x.repetitions*x.workMinutes;if(f?.repetitions&&f?.workMinutes){const covered=R.thresholdLadder.map((x,i)=>work(x)<=work(f)?i:-1).filter(i=>i>=0);st.familiarStep=covered.length?Math.max(...covered):0;st.qualityStep=st.familiarStep;}}
   let pool=W0-(st.long??0),days=nEasy;
   if(fq!==null&&nEasy>=2&&pool-fq>=R.minimumSessionMinutes){pool-=fq;days=nEasy-1;}else if(fq!==null)st.qualityNeeds=1;
   let e=days?pool/days:0;while(days-st.walks>0&&e<R.minimumSessionMinutes){st.walks++;e=pool/(days-st.walks);}
   st.easy=days-st.walks>0?Math.min(budget,Math.max(R.minimumSessionMinutes,Math.floor(e/5)*5)):null;
  }
 }
 return st;
}
function familiarQualityMinutes(sk){
 const f=sk.cap.run.familiarQuality[0];if(!f)return null;
 const fp=familiarQualityTask(f.prescription,sk.op.run);
 // It must also fit the week-1 ceiling (the longest current run), exactly as placement requires.
 return fp.durationMinutes<=Math.min(sk.c.schedule.runMinutes,sk.cap.run.longestMinutes??Infinity)&&!validateR6Prescription({...fp,calibration:{basis:'CURRENT_FAMILIAR_TASK'}}).length?fp.durationMinutes:null;
}
export function runRow(sk,st,w){
 const R=sk.op.run,phase=sk.plan.phases[w],cons=phase==='CONSOLIDATION';
 if(st.mode==='RETURN'){const f=st.returnFrom,to=st.returnTo,mix=(a,b)=>a===null||b===null?a??b:roundTo5((a+b)/2),step=st.returnStep;return {week:w,phase,mode:'RETURN',returnStep:step,long:step===0?f.long:mix(f.long,to.long),easy:step===0?f.easy:mix(f.easy,to.easy),walks:to.walks??0,qualityStep:0,specificStep:0,thresholdDone:st.thresholdDone,qualityActive:false,strides:0};}
 // Quality and strides unlock on executed established easy weeks, never on calendar weeks.
 const done=st.easyWeeksDone??0,stridesReady=st.stridesEligible&&st.mode==='EASY'&&done>=R.strides.requiresEstablishedEasyWeeks&&allows(sk.authority,'R6-RUN-QUALITY');
 return {week:w,phase,mode:st.mode,...(st.familiarBoutsLapsed?{familiarBoutsLapsed:true}:{}),...(st.familiarBoutsWithdrawn?{familiarBoutsWithdrawn:true}:{}),...(st.graduatedAt===w?{qualityIntroduction:true}:{}),walkStep:Math.min(st.walkStep,sk.op.establishment.walkJogLadder.length-1),restart:st.restart,long:cons&&st.long!==null?Math.max(R.minimumSessionMinutes,st.long-R.consolidationLongRunReductionSteps*R.longRunStepMinutes):st.long,easy:st.easy,easyExtra:st.easyExtra??0,walks:st.walks,qualityStep:st.qualityStep,specificStep:st.specificStep,thresholdDone:st.thresholdDone,qualityActive:st.qualityRunner&&st.mode==='EASY'&&done>=(st.qualityNeeds??0),familiarStep:st.familiarStep??0,strides:stridesReady?Math.min(R.strides.maxRepetitions,R.strides.entryRepetitions+Math.floor((done-R.strides.requiresEstablishedEasyWeeks)/2)):0};
}
/** Transition after week w. gate: {LONG,EASY,QUALITY,WALK_JOG} ∈ ADVANCE|HOLD|REGRESS|EARNED; planning assumes ADVANCE. */
export function advanceRun(sk,st0,w,gate={}){
 const {op,plan}=sk,R=op.run,s=sk.c.schedule,budget=s.runMinutes,longBudget=s.longRunMinutes??budget,phase=plan.phases[w],next=plan.phases[w+1],target=runTarget(sk),ladder=op.establishment.walkJogLadder;
 const st=clone(st0),g=k=>gate[k]??gate.ALL??'ADVANCE',done=k=>['ADVANCE','EARNED'].includes(g(k)),row=runRow(sk,st0,w);st.longByWeek[w]=row.long;
 // One step per dimension per week: EARNED never doubles a step and counts as ADVANCE in walk/jog, restart and return.
 const STEP={ADVANCE:1,HOLD:0,REGRESS:-1,EARNED:1};
 const regressable=x=>Math.max(R.minimumSessionMinutes,x-R.easyStepMinutes);
 const dev=[...DEVELOPMENT,'SPECIFIC'].includes(phase),P=st0.planned??{long:row.long,easy:row.easy,quality:null,strides:row.strides};
 st.achieved=clone(st0.achieved??{long:null,easy:null,quality:null,strides:0});delete st.planned;
 // The longest continuous run executed so far in any mode: easy, long, restart or return runs, or a continuous ladder step (SSCTR D47).
 const continuous=st0.mode==='WALK_JOG'?(P.continuousJog&&done('WALK_JOG')?P.continuousJog:0):st0.mode==='EASY'?Math.max(P.long&&done('LONG')?P.long:0,P.easy&&done('EASY')?P.easy:0):['RESTART','RETURN'].includes(st0.mode)&&done('EASY')?Math.max(P.long??0,P.easy??0):0;
 if(continuous>(st.longestContinuous??0))st.longestContinuous=continuous;
 // A re-entry transition starts from the dose the week's runs prescribed, never above the state (state model consumer closure, Property D; the run
 // side of SSCTR F1): runs that repeated an earlier return step or restart dose complete nothing beyond it, HOLD repeats that dose and a taper
 // holds what was run (SSCTR D43); the walk/jog ladder steps from the step it ran, as easy and long runs already do below. A projection prescribes
 // the state's own dose, so planning is unchanged.
 if(st.mode==='RETURN'){const k=g('EASY'),base=Number.isInteger(P.returnStep)?Math.min(st.returnStep,P.returnStep):st.returnStep;st.returnStep=Math.max(0,base+STEP[k]);if(st.returnStep>=sk.op.return.moderateStepsToPrior){const to=st.returnTo;st.mode=to.mode;st.easy=to.easy;st.long=to.long;st.walks=to.walks??0;st.walkStep=to.walkStep??st.walkStep;st.restart=to.restart??st.restart;st.qualityStep=Math.max(0,(to.qualityStep??0)-1);st.specificStep=Math.max(0,(to.specificStep??0)-1);delete st.returnFrom;delete st.returnTo;delete st.returnStep;}return st;}
 // Taper, race-window and post-event days hold what walk/jog and restart athletes have reached (SSCTR D43): no step there.
 const ed=eventDays(sk),endBefore=ed?ed.before(w,6):null,eventHold=['TAPER','RACE_WEEK','POST_EVENT'].includes(phase)||endBefore!==null&&endBefore>=0&&endBefore<=ed.taperDays;
 // The walk/jog step moves from the step the week's runs prescribed for every gate, as RETURN and RESTART do (decision authority closure, SSCTR F4,
 // R44): a consolidation week or a HOLD repeats that step, so history never keeps a step above the one the week ran. In the event window the
 // one-step-back days are a planned reduction, not a tolerance: the step reached holds there (SSCTR D43).
 if(st.mode==='WALK_JOG'){const k=g('WALK_JOG'),d=(phase==='CONSOLIDATION'||eventHold)&&k!=='REGRESS'?0:STEP[k],from=!eventHold&&Number.isInteger(P.walkStep)?Math.min(st.walkStep,P.walkStep):st.walkStep;st.walkStep=Math.max(0,from+d);if(next==='NEXT_BLOCK'&&!st.resumed){st.resumed=true;st.walkStep=Math.max(0,st.walkStep-1);}if(st.walkStep>=ladder.length){const X=R.walkJogExit;st.mode='EASY';st.easy=Math.min(budget,X.easyMinutes);st.long=null;st.walks=Math.max(0,st.nEasy-X.maxRunsPerWeek);st.easyWeeksDone=0;st.stridesEligible=true;}}
 else if(st.mode==='RESTART'){const k=g('EASY'),X=R.restart,d=eventHold&&k!=='REGRESS'?0:STEP[k],from=Number.isFinite(P.restart)?Math.min(st.restart,P.restart):st.restart;st.restart=Math.max(op.return.entryRunMinutes,from+X.stepMinutes*d);if(st.restart>=Math.min(budget,X.switchToEasyAtMinutes)){st.mode='EASY';st.easy=Math.min(budget,st.restart);st.long=st.hasLong?Math.min(longBudget,st.restart+X.longRunOffsetMinutes):null;st.easyWeeksDone=0;st.stridesEligible=true;
  // Running days stay at the restart frequency; the other chosen days keep walks and return one at a time at block starts.
  st.walks=Math.max(0,st.nEasy+(st.hasLong?1:0)-op.establishment.maxWalkJogDaysPerWeek);}}
 else if(st.mode==='EASY'){
  // When a cap (single-run ceiling, long-run share) trimmed this week's run, progression continues from what was prescribed.
  if(phase!=='CONSOLIDATION'&&st0.planned){if(st.long!==null&&Number.isFinite(P.long)&&P.long<row.long)st.long=P.long;if(st.easy!==null&&Number.isFinite(P.easy)&&P.easy<row.easy){st.easy=P.easy;st.easyExtra=0;}}
  if(g('LONG')==='REGRESS'&&st.long!==null)st.long=regressable(st.long);
  if(g('EASY')==='REGRESS'&&st.easy!==null)st.easy=regressable(st.easy);
  // B0-C02: the familiar repeated bouts never step the ladder, never become the taper's or race touch's executed peak and never count as executed
  // threshold sessions for the event-specific prerequisite; repeated adverse responses withdraw them (the threshold ladder from its first step, or
  // easy running, disclosed as a different stimulus; the fewer-repetition regression of SSCTR-R2-P07 is not used without its degradation record).
  const bouts=P.quality?.family==='FAMILIAR_REPEATED_BOUTS';
  if(g('QUALITY')==='REGRESS'){if(bouts)st.familiarBoutsWithdrawn=true;else if(phase==='SPECIFIC'&&st.specificStep>0)st.specificStep--;else st.qualityStep=Math.max(0,st.qualityStep-1);}
  // Executed weeks unlock quality and strides and set the achieved peaks the taper and redevelopment use.
  if(done('EASY')&&(!P.long||done('LONG'))&&phase!=='ESTABLISHMENT')st.easyWeeksDone=(st.easyWeeksDone??0)+1;
  if(P.long&&done('LONG'))st.achieved.long=Math.max(st.achieved.long??0,P.long);
  if(P.easy&&done('EASY'))st.achieved.easy=Math.max(st.achieved.easy??0,P.easy);
  if(P.strides&&done('EASY')){st.stridesDone=(st.stridesDone??0)+1;st.achieved.strides=Math.max(st.achieved.strides??0,P.strides);}
  if(P.quality&&done('QUALITY')&&!bouts){st.qualityDone=(st.qualityDone??0)+1;st.achieved.quality=clone(P.quality);}
  let smallReferenceStep=false,waitLong=false,otherStep=false,longBefore=null;
  // With no easy run planned (every easy day a walk), the executed long run gates the walk-to-run conversion (SSCTR R12).
  const easyGate=P.easy||!P.long?'EASY':'LONG';
  if(dev&&phase!=='CONSOLIDATION'){
   if(done(easyGate))st.devCount++;
   const blockStart=phase!=='SPECIFIC'&&st.walks>0&&st.devCount>1&&st.devCount%R.consolidationEveryNthDevelopmentWeek===1&&g(easyGate)==='ADVANCE';
   // A converted walk becomes an easy run at the minimum session, which then progresses like the other easy runs.
   if(blockStart){st.walks--;if(st.easy===null)st.easy=R.minimumSessionMinutes;}
   else{
    // Under a 50-minute reference a 5-minute step exceeds 10%: it is never combined with another session increase that week.
    // A long-run step that the share cap holds is no increase (SSCTR D50): the easy and quality steps then follow their own gates,
    // and when one of them steps the long run waits where it was prescribed, so two sessions never grow in the same week.
    const held=P.longHeldByShare===true;longBefore=st.long;if(st.long!==null&&st.long<target&&done('LONG'))st.long=Math.min(target,st.long+R.longRunStepMinutes);
    smallReferenceStep=st.long!==longBefore&&longBefore<50&&!held;waitLong=held&&st.long!==longBefore&&longBefore<50;
    // One easy session steps at a time (rotating), so weekly volume rises by about one step, never all easy runs at once.
    const running=Math.max(1,st.nEasy-st.walks);
    if(!smallReferenceStep&&st.easy!==null&&(g('EASY')==='EARNED'||g('EASY')==='ADVANCE'&&st.devCount%R.easyStepEveryDevelopmentWeeks===0)&&st.easy+R.easyStepMinutes<=Math.min(budget,(st.long??budget+5)-5)){st.easyExtra=(st.easyExtra??0)+1;if(st.easyExtra>=running){st.easy+=R.easyStepMinutes;st.easyExtra=0;}otherStep=true;}
   }
   if(P.quality&&done('QUALITY')&&!smallReferenceStep&&!bouts){
    if(phase==='SPECIFIC'&&st.thresholdDone>=R.specificRequiresCompatibleThresholdSessions)st.specificStep++;
    else{st.qualityStep++;st.thresholdDone++;}
    otherStep=true;
   }
   if(waitLong&&otherStep)st.long=longBefore;
  }
  // B0-C01: the block-boundary review that graduated a WALK_JOG-, RESTART- or EASY_LOW-started athlete on executed evidence states the week the
 // threshold ladder enters (the context of that week carries it): ladder step 0 at the effort cue (a calibration), and in that week no other run
 // dimension steps: easy, long and walk conversion hold where the reviewed week had them.
 const grad=sk.c.athlete.runGraduation;
 // Any later transition under a context that carries the graduation applies it too (the evidence reducer's HISTORY reading judges each week under
 // its own context, and a return restarts from that reading), keeping the ladder steps the evidence earned; the hold belongs to the introduction.
 if(grad&&grad.fromWeek<=w+1&&st.mode==='EASY'&&!st.qualityRunner&&allowsCandidate(sk.repertoire??DEFAULT_REPERTOIRE,'B0-C01')){st.qualityRunner=true;st.qualityNeeds=0;st.graduatedAt=grad.fromWeek;
  if(grad.fromWeek===w+1){st.qualityStep=0;
  // Held at what was executed (released is not executed, R7-A E1): a step the state took in the consolidation week is not run first now.
  st.long=st0.long===null?null:Math.min(st0.long,st.achieved.long??st0.long);st.easy=st0.easy===null?null:Math.min(st0.easy,st.achieved.easy??st0.easy);st.easyExtra=st.easy===st0.easy?(st0.easyExtra??0):0;st.walks=st0.walks;}}
 if(next==='NEXT_BLOCK'&&!st.resumed){const N=op.event.nextBlock;st.resumed=true;if(st.long!==null)st.long=Math.max(R.minimumSessionMinutes,floor5((st.achieved.long??st.long)*N.longRunFractionOfAchievedPeak));if(st.easy!==null)st.easy=Math.max(R.minimumSessionMinutes,floor5((st.achieved.easy??st.easy)*N.easyFractionOfAchievedPeak));if(st.long!==null&&st.easy!==null)st.long=Math.max(st.long,st.easy);st.qualityStep=Math.max(0,st.qualityStep-N.qualityStepsBack);}
 }
 return st;
}
/**
 * Strides stay optional, with an equal easy-only alternative, for every athlete who started in WALK_JOG, RESTART or EASY_LOW mode, who used
 * walk/jog or a restart in this program, or whose run experience is NONE or NOVICE (B0-C01 condition 8; extends R6-RUN-QUALITY C9).
 */
export const stridesOptional=(sk,rs=null)=>['EASY_LOW','WALK_JOG','RESTART'].includes(sk.cap.run.class)||['NONE','NOVICE'].includes(sk.c.athlete.runExperience)||(rs?.modeHistory??[]).some(m=>['WALK_JOG','RESTART'].includes(m));
/** B0-C02: the athlete's current familiar harder repeated-bout task, fully specified, while its familiar status holds and the path is approved. */
export function familiarBoutsTask(sk,st=null){
 if(!allowsCandidate(sk.repertoire??DEFAULT_REPERTOIRE,'B0-C02')||st?.familiarBoutsLapsed||st?.familiarBoutsWithdrawn||!['RACE','PERFORMANCE'].includes(sk.goal.run.kind))return null;
 return (sk.cap.run.familiarBouts??[]).find(b=>!b.missing.length)?.task??null;
}
/** The familiar repeated bouts exactly as the athlete does them, at the familiar field-session target; held, never progressed (B0-C02). */
export function familiarBoutsPrescription(task,R,budget){
 const p=task.prescription,w=p.work,warm=p.warmupMinutes??R.qualityWarmupMinutes,cool=p.cooldownMinutes??R.qualityCooldownMinutes,duration=Math.ceil(Math.max(p.durationMinutes,warm+cool+w.repetitions*w.workMinutes+Math.max(0,w.repetitions-1)*w.recoveryMinutes));
 if(duration>budget)return null;
 const t=task.target,pace=String(t.method).toUpperCase()==='PACE',targetText=pace?'your current field-session target for this exact session ('+Math.floor(t.paceSecondsPerKm/60)+':'+String(Math.round(t.paceSecondsPerKm%60)).padStart(2,'0')+' per km)':'the talk-test effort you hold in this exact session';
 return {modality:'RUN',family:'FAMILIAR_REPEATED_BOUTS',durationMinutes:duration,warmupMinutes:warm,cooldownMinutes:cool,effortDomain:'FAMILIAR_HARDER_BOUTS',effort:'Your familiar harder intervals at the effort you already know for them; ease off if they feel harder than usual',equipment:[],work:{repetitions:w.repetitions,workMinutes:w.workMinutes,recoveryMinutes:w.recoveryMinutes},target:{method:String(t.method).toUpperCase(),construct:'FIELD_SESSION_TARGET',...(pace?{paceSecondsPerKm:t.paceSecondsPerKm}:{}),provenance:t.provenance,observedAt:task.observedAt??null},calibration:{basis:'CURRENT_FAMILIAR_TASK',observedAt:task.observedAt??null,paceFromGoalTime:false,paceFromEasyRuns:false},progressionAllowed:false,instructions:['Warm up '+warm+' minutes easy','Your familiar harder intervals exactly as you do them: '+w.repetitions+' × '+w.workMinutes+' min with '+w.recoveryMinutes+' min easy between','Target: '+targetText+'; effort counts as much as the target, and a session that feels harder than usual ends early','Kept as it is: no extra repetition, time or speed is added','Cool down '+cool+' minutes easy','Record repetitions completed, effort and next-day function']};
}
/** A self-reported familiar quality task keeps its own work; missing effort text comes from its family's cue, never a pace. */
const FAMILY_CUE={THRESHOLD:'THRESHOLD_CONTROLLED',TEN_K_SPECIFIC:'TEN_K_EFFORT',HALF_MARATHON_SPECIFIC:'HALF_MARATHON_EFFORT'};
function familiarQualityTask(p,R){
 const family=p.family==='CRUISE'?'THRESHOLD':p.family,effortDomain=p.effortDomain??FAMILY_CUE[family];
 return {equipment:[],warmupMinutes:R.qualityWarmupMinutes,cooldownMinutes:R.qualityCooldownMinutes,...clone(p),family,effortDomain,effort:p.effort??R.effortCues[effortDomain]};
}
/** The quality task of a week: a current familiar task first (its own work), otherwise the ladder step. */
function qualityFor(sk,row,budget){
 const R=sk.op.run,ev=sk.goal.run.event,specific=row.phase==='SPECIFIC'&&!!ev&&row.thresholdDone>=R.specificRequiresCompatibleThresholdSessions,ladder=specific?(ev.kind==='10K'?R.tenKSpecificLadder:R.halfMarathonSpecificLadder):R.thresholdLadder;
 const step=Math.max(0,Math.min(ladder.length-1,specific?row.specificStep:row.qualityStep)-(row.phase==='CONSOLIDATION'?1:0));
 // B0-C02: a current familiar repeated-bout task is the week's single quality session in BUILD, DEVELOPMENT and NEXT_BLOCK weeks (and their
 // consolidation), held exactly; never in SPECIFIC, taper or event weeks (event ladders and rules replace it), never after an interruption.
 const bouts=!specific&&['BUILD','DEVELOPMENT','NEXT_BLOCK','CONSOLIDATION'].includes(row.phase)?familiarBoutsTask(sk,row):null;
 if(bouts){const p=familiarBoutsPrescription(bouts,R,budget);if(p)return {prescription:p,progression:{dimension:'FAMILIAR_BOUTS',value:0,ladder:'FAMILIAR_BOUTS'},familiar:true,bouts:true};}
 const familiar=sk.cap.run.familiarQuality[0],fp=familiar?familiarQualityTask(familiar.prescription,R):null;
 if(fp&&row.qualityStep===(row.familiarStep??0)&&!specific&&fp.durationMinutes<=budget&&!validateR6Prescription({...fp,calibration:{basis:'CURRENT_FAMILIAR_TASK'}}).length)return {prescription:{...fp,calibration:{basis:'CURRENT_FAMILIAR_TASK',observedAt:familiar.observedAt}},progression:{dimension:'THRESHOLD_STEP',value:row.familiarStep??0,ladder:'FAMILIAR'},familiar:true};
 const p=qualityPrescription(specific?(ev.kind==='10K'?'TEN_K':'HALF_MARATHON'):'THRESHOLD',ladder[step],{cues:R.effortCues,warmup:R.qualityWarmupMinutes,cooldown:R.qualityCooldownMinutes,budget,firstExposure:specific?row.specificStep===0:row.qualityStep===0});
 return p?{prescription:p,progression:{dimension:specific?'SPECIFIC_STEP':'THRESHOLD_STEP',value:step,ladder:specific?ev.kind:'THRESHOLD'},familiar:false}:null;
}
/** Walk/jog and restart exposures: at most maxWalkJogDaysPerWeek of the chosen run days, spaced by a day where possible. */
function spacedExposures(op,runDays){
 const max=op.establishment.maxWalkJogDaysPerWeek,spaced=[];
 for(const r of runDays)if(spaced.length<max&&!spaced.some(x=>Math.abs(x.day-r.day)<2))spaced.push(r);
 for(const r of runDays)if(spaced.length<Math.min(max,runDays.length)&&!spaced.includes(r))spaced.push(r);
 return new Set(spaced.map(r=>r.id));
}
function distributeRun(sk,row,roles,{ceiling=null,firstWeek=false,previousLong=null,modeHistory=[]}={}){
 const {c,op}=sk,R=op.run,s=c.schedule,out={},cue=R.effortCues.EASY_CONVERSATIONAL;
 // Single-run ceiling: no planned run exceeds the longest recent completed run by more than one step.
 // Walks and walk/jog ladder steps keep the full session time: the ladder is the reviewed progression and walking is not running.
 const capped=x=>ceiling===null?x:Math.min(x,ceiling),budget=capped(s.runMinutes),longBudget=capped(s.longRunMinutes??s.runMinutes),fullBudget=s.runMinutes;
 const runDays=roles.filter(r=>r.sport==='RUN').sort((a,b)=>a.day-b.day);
 if(row.mode==='WALK_JOG'||row.mode==='RESTART'){
  const spaced=spacedExposures(op,runDays);
  for(const r of runDays){
   if(!spaced.has(r.id)){out[r.id]={role:'WALK',prescription:walkPrescription(Math.min(fullBudget,op.establishment.walkSessionMinutes[0]),{reason:row.mode==='WALK_JOG'?'Chosen run day beyond the three walk/jog exposures supported in establishment: a brisk walk keeps the day without extra impact':'Restart: extra chosen run days stay as brisk walks until easy runs are observed'}),optional:true,converted:row.mode==='WALK_JOG'?'TOO_MANY_RUN_DAYS_FOR_ESTABLISHMENT':'RESTART_FREQUENCY'};continue;}
   if(row.mode==='RESTART'){out[r.id]={role:'EASY',prescription:easyPrescription(Math.min(budget,row.restart),{cue}),essential:true,progression:{dimension:'RESTART_MINUTES',value:row.restart}};continue;}
   const p=walkJogPrescription(row.walkStep,op.establishment.walkJogLadder,{warmup:op.establishment.walkJogWarmupMinutes,cooldown:op.establishment.walkJogCooldownMinutes,budget:fullBudget});
   out[r.id]=p?{role:'WALK_JOG',prescription:p,essential:true,progression:{dimension:'WALK_JOG_STEP',value:row.walkStep}}:{role:'WALK',prescription:walkPrescription(Math.min(fullBudget,20)),optional:true,converted:'BUDGET'};
  }
  return out;
 }
 const quality=runDays.find(r=>r.role==='QUALITY'),longRole=runDays.find(r=>r.role==='LONG');
 let qp=null,qProgress=null;
 if(row.mode==='RETURN'){for(const r of runDays){const minutes=Math.min(r.role==='LONG'?longBudget:budget,Math.max(R.minimumSessionMinutes,(r.role==='LONG'?row.long:row.easy)??R.minimumSessionMinutes));out[r.id]={role:r.role==='LONG'?'LONG':'EASY',prescription:easyPrescription(minutes,{family:r.role==='LONG'?'LONG':'EASY',cue}),essential:r.role==='LONG',key:r.role==='LONG',progression:{dimension:'RETURN_STEP',value:row.returnStep},explanation:'Return step '+(row.returnStep+1)+': easy only; prior dose is the ceiling, reached in conditional steps'};}return out;}
 if(quality&&row.phase!=='ESTABLISHMENT'&&row.qualityActive){
  const q=qualityFor(sk,row,budget);
  // Week 1 holds no new intensity: only a current familiar task that fits the week-1 ceiling.
  if(q&&(!firstWeek||q.familiar)){qp=q.prescription;qProgress=q.progression;}
 }
 const asRoles=roles.map(r=>r.id===quality?.id&&!qp?{...r,role:'EASY'}:r),walkSet=walkDays(asRoles,row.walks);
 if(longRole){const minutes=Math.max(R.minimumSessionMinutes,Math.min(longBudget,row.long??R.minimumSessionMinutes)),reference=ceiling===null?null:ceiling-R.singleRunCeiling.stepMinutes;out[longRole.id]={role:'LONG',prescription:easyPrescription(minutes,{family:'LONG',cue}),key:true,essential:true,progression:{dimension:'LONG_MINUTES',value:row.long},...(reference!==null&&reference<50&&minutes>reference?{explanation:'Five minutes beyond your longest recent run, which is more than 10% of it: planned only after last week went well, and no other session grows this week'}:{})};}
 if(quality&&qp)out[quality.id]={role:'QUALITY',prescription:qp,key:true,essential:true,progression:qProgress,...(row.qualityIntroduction?{introduction:true,alternative:{role:'EASY',minutes:Math.min(budget,row.easy??R.minimumSessionMinutes)},explanation:'New harder session, introduced because your last two weeks of running went well: an easy run of the usual length is an equal alternative you can keep without any penalty or catch-up'}:{})};
 const easyRoles=runDays.filter(r=>r.role==='EASY'||r.id===quality?.id&&!qp);
 const nextIsKey=r=>runDays.some(k=>(k.role==='LONG'||k.id===quality?.id&&qp)&&(k.day===r.day+1||r.day===6&&k.day===0));
 const optionalStrides=stridesOptional(sk,{modeHistory});
 const stridesDay=row.strides?easyRoles.filter(r=>!walkSet.has(r.id)).sort((a,b)=>Number(nextIsKey(a))-Number(nextIsKey(b))||a.day-b.day)[0]:null;
 const extended=new Set(easyRoles.filter(r=>!walkSet.has(r.id)).sort((a,b)=>a.day-b.day).slice(0,row.easyExtra??0).map(r=>r.id));
 for(const r of easyRoles){
  if(walkSet.has(r.id)){out[r.id]={role:'WALK',prescription:walkPrescription(Math.min(fullBudget,op.establishment.walkSessionMinutes[0]),{reason:'More chosen run days than current weekly running supports: this day keeps a brisk walk so running load is spread, not added'}),optional:true,converted:'TOO_MANY_RUN_DAYS_FOR_CURRENT_PRACTICE'};continue;}
  const minutes=(row.easy??R.minimumSessionMinutes)+(extended.has(r.id)?R.easyStepMinutes:0);
  out[r.id]={role:'EASY',prescription:easyPrescription(Math.min(budget,Math.max(R.minimumSessionMinutes,minutes)),{cue,strides:r===stridesDay?{repetitions:row.strides,workSeconds:R.strides.workSeconds,recoverySeconds:R.strides.recoverySeconds,...(optionalStrides?{optional:true}:{})}:null}),essential:false,key:false,progression:{dimension:'EASY_MINUTES',value:minutes}};
 }
 // Long-run share: with three or more running sessions the long run stays within the declared share, never below the typical easy run.
 const long=longRole?out[longRole.id]:null,running=Object.values(out).filter(x=>x.prescription&&x.role!=='WALK');
 if(long&&running.length>=3){
  const share=R.longRunShareOfWeeklyMinutesMax,others=running.filter(x=>x!==long).reduce((n,x)=>n+x.prescription.durationMinutes,0),bound=Math.min(row.long??Infinity,Math.max(row.easy??R.minimumSessionMinutes,floor5(others*share/(1-share)),previousLong??0));
  if(long.prescription.durationMinutes>bound)out[longRole.id]={...long,prescription:easyPrescription(Math.max(R.minimumSessionMinutes,bound),{family:'LONG',cue}),progression:{...long.progression,heldBy:'LONG_RUN_SHARE'},explanation:'Long run held within its share of the week until easy running grows'};
 }
 return out;
}
// ---------- Strength state machine ----------
export const goalDose=sk=>sk.op.strength.goalDoses[sk.goal.strength.kind]??sk.op.strength.goalDoses.GENERAL;
export function initialStrengthState(sk){
 const exercises={};
 // A known dose was last performed when it was observed: the resume clock starts there (SSCTR D52).
 for(const k of sk.cap.strength.known)exercises[k.id]={status:'ESTABLISHED',mode:'KNOWN',load:k.dose.load.value,convention:k.dose.load.convention,reps:k.dose.reps,sets:k.dose.sets,rir:k.dose.rir,loadTick:0,source:'CURRENT_FAMILIAR_KNOWN_DOSE',...(typeof k.observedAt==='string'?{lastPerformed:k.observedAt.slice(0,10)}:{})};
 // B0-C08: strength class NONE starts under the novice density cap (two full templates until the first block boundary).
 return {exercises,devCount:0,completedBlocks:0,...(noviceDensityApplies(sk)?{density:{capped:true}}:{})};
}
const PENDING_RULE='Choose the load by effort as in your first session; the load you logged becomes your reference once you confirm it or log it again';
/** Return step 2 (SSCTR D49): one set above the entry and at least one below the count the sets come back to. */
export const returnStepSets=(op,ceiling)=>Math.max(1,Math.min(ceiling-1,op.return.strengthEntrySets+1));
/** What a strength row prescribes. The row carries its kind, so a review reads what was prescribed instead of re-deriving it (R7-A). */
export const EXPOSURE_KINDS=['PRACTICE','RETURN_ENTRY','RETURN_STEP','REESTABLISH','FIRST_ESTABLISH','UNLOGGED','KNOWN','FROM_LOG','BODYWEIGHT'];
/**
 * The phase reduction of a count and its reps in reserve (SSCTR D49; operational.event). It is the single place a phase reduces a
 * strength dose: every row passes through it, and the final validation checks every row against it (R7-A).
 */
export function phaseDose(op,phase,n,r){
 const S=op.strength,E=op.event;
 return phase==='CONSOLIDATION'?[Math.max(1,n-S.consolidationSetReduction),r]:phase==='SPECIFIC'?[Math.max(1,n-1),Math.max(3,r)]:phase==='TAPER'?[Math.max(1,Math.round(Math.max(1,n-1)*E.taperStrengthSetFraction)),Math.max(3,r)]:phase==='RACE_WEEK'?[E.raceWeekStrengthSets,E.raceWeekStrengthMinimumRir]:phase==='POST_EVENT'?[E.postEventStrengthSets,E.raceWeekStrengthMinimumRir]:[n,r];
}
/** The lowest reps in reserve a phase allows, whatever the row (operational.event; SSCTR D49). */
export const phaseMinimumRir=(op,phase)=>['RACE_WEEK','POST_EVENT'].includes(phase)?op.event.raceWeekStrengthMinimumRir:['SPECIFIC','TAPER'].includes(phase)?3:null;
/** Not performed for more than the moderate return window on `date`, outside a return step: established by effort again (SSCTR D52). */
export const needsReestablishment=(op,ex,entry,date)=>!!ex&&!noExternalLoad(entry)&&!Number.isInteger(ex.returnStep)&&!!ex.lastPerformed&&!!date&&dayGap(ex.lastPerformed,date)>op.return.moderateMaxDays;
/**
 * The row an exercise state calls for, before the phase: its kind, the count the phase reduction applies to (`basis`, the count the
 * exercise would otherwise have that day), a row cap and a reps-in-reserve floor. Each row keeps the rule that defines it.
 */
function strengthCandidate(sk,ss,w,slot,entry,{firstOfWeek,phase,date,entryWeek}){
 const {op,cap}=sk,S=op.strength,g=goalDose(sk),main=slot.role==='MAIN',[lo,hi]=g.repRange,ex=ss.exercises[entry.id],bodyweight=noExternalLoad(entry),R=op.return,e=op.establishment.effortGuidedLoad;
 // The current goal's contract (state model consumer closure, Property C; SSCTR F3): the repetition target of an exercise with a known load (known,
 // or re-established, returning or unlogged under one) is never above the goal's range, whichever row carries it, as the KNOWN row already cuts it;
 // so a goal change to MAINTAIN (8-8) never leaves a from-log 12. Below the range the executed dose stands: an increase needs evidence. A row
 // that carries the goal's establishment target instead of the exercise's (a first establishment, a re-establishment) keeps it.
 const knownDose=!!ex&&!bodyweight&&(ex.mode==='KNOWN'||Number.isFinite(ex.load)||Number.isFinite(ex.ceiling)),inRange=r=>knownDose&&Number.isFinite(r)?Math.min(r,hi):r;
 // A new exercise in a return-entry week (an exercise in use this week is at the entry step) takes the entry dose (R6-POLICY-4).
 if(!ex&&entryWeek)return {kind:'RETURN_ENTRY',basis:R.strengthEntrySets,rirBase:R.strengthEntryMinimumRir,rirFloor:R.strengthEntryMinimumRir,row:{reps:g.reps,mode:bodyweight?'BODYWEIGHT':'ESTABLISH',establishment:!bodyweight,note:'Return entry: lowest demand while capacity is re-established'}};
 if(!ex&&phase==='ESTABLISHMENT'&&cap.strength.class==='NONE'&&firstOfWeek){const u=op.establishment.unloadedPractice;return {kind:'PRACTICE',basis:u.sets,rirBase:u.minimumRir,row:{practice:true,reps:u.reps}};}
 let normal=ex?.sets??(main?g.sets:Math.max(1,g.sets-1));
 const firstDevBlock=sk.blocks.find(b=>['BUILD','DEVELOPMENT'].includes(b.family));
 if(cap.strength.class==='NONE'&&firstDevBlock&&w>=firstDevBlock.startWeek&&w<firstDevBlock.endWeekExclusive)normal=Math.min(normal,2);
 if(S.addSetAtBlockBoundary&&(ex?.blocksDone??0)>0&&g.mode!=='HOLD')normal=Math.max(normal,Math.min(main?g.maxSets:Math.max(1,g.maxSets-1),normal+1));
 if(ex&&Number.isInteger(ex.returnStep)){
  if(ex.returnStep===0)return {kind:'RETURN_ENTRY',basis:R.strengthEntrySets,rirBase:R.strengthEntryMinimumRir,rirFloor:R.strengthEntryMinimumRir,row:bodyweight?{reps:ex.reps??g.reps,mode:'BODYWEIGHT'}:{reps:inRange(ex.reps??g.reps),mode:'ESTABLISH',establishment:true,note:ex.load!==null&&ex.load!==undefined?'Return entry: choose a load that leaves at least '+R.strengthEntryMinimumRir+' reps in reserve; do not exceed the previous '+ex.load+' and do not restore it because days have passed':'Return entry: effort-guided load with at least '+R.strengthEntryMinimumRir+' reps in reserve'}};
  // Step 2 comes from the count before the break (the return ceiling), never from the base count (SSCTR D49).
  const s1=returnStepSets(op,Number.isInteger(ex.setCeiling)?ex.setCeiling:normal),step={kind:'RETURN_STEP',basis:s1,rirBase:3};
  if(bodyweight)return {...step,row:{reps:ex.reps??g.reps,mode:'BODYWEIGHT'}};
  return {...step,row:ex.mode==='KNOWN'&&ex.returnLogged===true?{reps:inRange(ex.reps),mode:'KNOWN',value:ex.load,convention:ex.convention,note:'Return step 2: the load logged at the return entry; sets come back one at a time'}:{reps:inRange(ex.reps??g.reps),mode:'FROM_LOG',rule:Number.isFinite(ex.pendingLoad)?PENDING_RULE:`Use the load you logged at the return entry; no increase yet${ex.load!=null?`; never above the previous ${ex.load}`:''}`,...(Number.isFinite(ex.pendingLoad)?{pending:true}:{})}};
 }
 // After a return the sets come back one per executed week, up to the count before the break (SSCTR D49). After a re-establishment
 // the count, block-boundary set included, comes back from the re-establishment count the same way (SSCTR D53).
 const base=Math.min(normal,Number.isInteger(ex?.setCap)?ex.setCap:Infinity,Number.isInteger(ex?.regainCap)?ex.regainCap:Infinity),reps=main?g.reps:Math.min(15,g.reps+2);
 const counts={basis:base,rirBase:g.startRir,normal};
 // Not performed for more than the moderate return window, in calendar days from its last executed exposure (SSCTR D52): established
 // by effort again under the earlier load, and like the other establishment rows never above the count the phase allows (SSCTR D54).
 if(needsReestablishment(op,ex,entry,date))return {kind:'REESTABLISH',...counts,cap:Math.min(main?g.sets:Math.max(1,g.sets-1),2),rirFloor:Math.max(e.minimumRir,g.startRir),row:{reps:main?g.reps:Math.min(15,g.reps+2),mode:'ESTABLISH',establishment:true,note:`Not done for more than ${R.moderateMaxDays} days as of the last review: establish the load again by effort${ex.load!=null?`; do not exceed ${ex.load} ${ex.convention==='PER_HAND'?'kg per hand':'kg'}`:''}`}};
 const hold=['SPECIFIC','TAPER','RACE_WEEK','POST_EVENT','CONSOLIDATION'].includes(phase);
 // A band or assistance level progresses by repetitions inside the goal range and is never a kilogram (B0-C04): at the top the level is the athlete's.
 if(bodyweight)return {kind:'BODYWEIGHT',...counts,...(ex?{}:{cap:2}),rirFloor:3,row:{reps:ex?.reps??reps,mode:'BODYWEIGHT',establishment:!ex,note:ordinalResistance(entry)&&(ex?.reps??reps)>=hi?'At the top of the repetition range the dose holds; a harder level is your choice, reported when you make it':null}};
 if(!ex){
  const hint=cap.strength.loadHints[entry.id],novice=cap.strength.class==='NONE'&&phase==='ESTABLISHMENT';
  const ladder=slot.directive?.reason==='SKILL_PROGRESSION'?'New step on your skill ladder: technique first, from the lightest load (the empty bar for barbell lifts); you can always step back':null;
  return {kind:'FIRST_ESTABLISH',...counts,cap:novice?e.sets:2,rirFloor:e.minimumRir,row:{reps:novice?e.reps:reps,mode:'ESTABLISH',establishment:true,note:ladder??(hint?`An earlier ${hint.value} ${hint.unit} at another rep target is a starting hint only`:null)}};
 }
 // A from-log row needs a logged load: an exercise a review saw performed without one is established by effort again (SSCTR D52).
 if(ex.unlogged&&ex.mode==='FROM_LOG')return {kind:'UNLOGGED',...counts,cap:e.sets,rirFloor:e.minimumRir,row:{reps:inRange(ex.reps??reps),mode:'ESTABLISH',establishment:true,note:`No usable load was logged last time: establish the load by effort again${Number.isFinite(ex.ceiling)?`; do not exceed ${ex.ceiling} ${ex.convention==='PER_HAND'?'kg per hand':'kg'}`:''}`}};
 if(ex.mode==='KNOWN')return {kind:'KNOWN',...counts,rirFloor:2,row:{reps:Math.min(ex.reps,hi),mode:'KNOWN',value:ex.load,convention:ex.convention,note:hold?'No load increase in this phase':null}};
 const pending=Number.isFinite(ex.pendingLoad),rule=pending?PENDING_RULE:ex.ceiling!=null&&ex.source==='RE_ESTABLISHED'?`Use the load you established last time; never above the previous ${ex.ceiling} until a new log supports it`:hold?'Use the last logged load; no increase in this phase':g.mode==='LOAD'?`If every set reached ${g.reps} reps with at least ${g.targetRir} in reserve, add the smallest available increment; otherwise repeat`:g.mode==='HOLD'?'Keep the logged load while reps in reserve hold':`Add ${S.repStep} reps per set while at least ${g.targetRir} reps stay in reserve, up to ${hi}; then add the smallest increment and return to ${lo}`;
 return {kind:'FROM_LOG',...counts,row:{reps:inRange(ex.reps??reps),mode:'FROM_LOG',rule,...(pending?{pending:true}:{})}};
}
/**
 * ResolvedPrescription (state model consumer closure, Property C; Founder §7, §8): the one place an exercise's dose is resolved for a decision, from
 * what happened. HistoricalState (`history`, the evidence reducer's exercise state at the week the decision plans) is the dose, as one unit:
 * EarnedProgress — the load, the repetition target and the load tick the evidence settled, the weekly review's rule applied only to executed
 * weeks — together with every atom only executed evidence moves (the last performed date D52 measures from, the return steps and their caps, the
 * counts that come back one executed week at a time, the blocks earned, what the logs left: unlogged, a load awaiting confirmation, a
 * re-establishment ceiling). ProjectedProgress, the ticks, repetition steps and loads the plan assumed for weeks it projected, is never part of the
 * dose: a projected step is released only by the evidence that earns it (R42), and a projection below history never withholds a step the evidence
 * released. No atom is combined from one structure with another atom from the other.
 * - Ingress: an exercise the evidence never established is not resolved (null): its next exposure is an establishment (SSCTR D52).
 * - The planner then applies, in one place for every week and every kind of row (strengthDose: strengthCandidate and phaseDose), the current goal
 *   (its repetition range, HOLD and MAINTAIN), the phase, the return or re-establishment the state is in and the time budget; the transition
 *   (advanceStrength) moves the progression state on executed evidence only (HOLD repeats the dose it held).
 * The resolved state is the history itself, so a decision that re-plans week 0 writes the intake back unchanged.
 */
export const resolveExercisePrescription=history=>history?clone(history):null;
/**
 * Dose of one slot in week w: the candidate for the exercise state, then the phase of that day, applied once and in the same way for
 * every kind of row (R7-A; SSCTR D49, D54): never more sets than the phase allows for the count the exercise would otherwise have,
 * and never fewer reps in reserve than the phase minimum. baseSets is the count before the phase reduction and normalSets the count
 * without a return or regain cap; both travel in the week's planned strength state and in the row's exposure. The exposure's
 * phasedSets is the count the row carries before any time-budget fit (an adaptation that reduces the row lowers it too), so a fit alone
 * never reads as a reduced week (R7-A QE-R7A-14).
 */
function strengthDose(sk,ss,w,slot,entry,{firstOfWeek,phase:dayPhase=null,date=null,entryWeek=false}){
 const {op,plan}=sk,phase=dayPhase??plan.phases[w];
 // Race week and post-event keep the main lifts only (operational.event).
 if(['RACE_WEEK','POST_EVENT'].includes(phase)&&slot.role!=='MAIN')return {skip:true};
 const c=strengthCandidate(sk,ss,w,slot,entry,{firstOfWeek,phase,date,entryWeek});
 const [phasedSets,phasedRir]=phaseDose(op,phase,c.basis,c.rirBase),cap=c.cap??Infinity;
 const sets=Math.min(cap,phasedSets),rir=Math.max(c.rirFloor??-Infinity,phasedRir),baseSets=Math.min(cap,c.basis),normalSets=Number.isInteger(c.normal)?c.normal:null;
 return {...c.row,kind:c.kind,sets,rir,baseSets,normalSets,exposure:{kind:c.kind,phase,phaseBasis:c.basis,phasedSets:sets,baseSets,normalSets}};
}
/**
 * Logged-load adoption (QRE-R6-02; SSCTR D44, D45). A logged load becomes the reference only inside 0–500 kg and at most one
 * smallest increment above the load the plan stated for that exposure; above that load only when the exposure met the ADVANCE
 * criterion (`advanced`: target reps, minimum logged RIR at or above the prescription minus one, no adverse response); and never
 * above a re-establishment or return-entry ceiling (it is capped there). A first establishment log (no planned value, no ceiling,
 * no earlier load) is pending until the athlete confirms it, a second log (a later exposure, or an earlier one in the same week:
 * `log.earlier`) agrees with it within one increment, or it is within one increment of the athlete's own load hint in the same
 * convention. Anything else keeps the planned reference and is asked about.
 * `advanced` is null when no gate was evaluated; the target criterion then waits for the weekly gate.
 */
export function loggedLoadDecision(S,ex,u,log,{advanced=null,hint=null}={}){
 const A=S.loggedLoadAdoption??{};
 if(!Number.isFinite(log?.load))return {adopted:false,reason:'LOGGED_LOAD_MISSING'};
 if(log.load<=0||log.load>(A.maximumKilograms??500))return {adopted:false,reason:'LOGGED_LOAD_IMPLAUSIBLE'};
 const conv=log.convention??ex?.convention,step=incrementFor(S,conv),planned=u?.mode==='KNOWN'&&Number.isFinite(u.value)?u.value:u?.mode==='FROM_LOG'&&Number.isFinite(ex?.load)?ex.load:null;
 if(planned!==null&&log.load>planned+(A.maximumIncrementsAbovePlanned??1)*step+1e-9)return {adopted:false,reason:'LOGGED_LOAD_ABOVE_PLAN',planned};
 if(planned!==null&&log.load>planned+1e-9&&advanced===false)return {adopted:false,reason:'LOGGED_LOAD_ABOVE_PLAN_TARGET_NOT_MET',planned};
 const ceiling=Number.isFinite(ex?.ceiling)?ex.ceiling:Number.isInteger(ex?.returnStep)&&Number.isFinite(ex?.load)?ex.load:null;
 if(ceiling!==null&&log.load>ceiling+1e-9)return {adopted:true,value:ceiling,capped:true,reason:'LOGGED_LOAD_ABOVE_CEILING_CAPPED',planned};
 if(planned===null&&ceiling===null&&!Number.isFinite(ex?.load)&&log.confirmed!==true){
  const near=v=>Number.isFinite(v)&&Math.abs(log.load-v)<=(A.establishmentAgreementIncrements??1)*step+1e-9;
  if(near(ex?.pendingLoad)||near(log.earlier))return {adopted:true,value:log.load,planned,reason:'ESTABLISHMENT_LOG_REPEATED'};
  if(hint?.unit==='KG'&&hint.convention===conv&&near(hint.value))return {adopted:true,value:log.load,planned,reason:'ESTABLISHMENT_LOG_MATCHES_HINT'};
  return {adopted:false,pending:true,reason:'ESTABLISHMENT_LOG_UNCONFIRMED',planned};
 }
 return {adopted:true,value:log.load,planned,...(log.confirmed===true?{confirmed:true}:{})};
}
/**
 * The kind of a prescribed exposure. A row states its own kind (R7-A); a row written before that is classified from the week-start
 * state with the rules that produced it, so a stored program keeps its meaning.
 */
export function exposureKindOf(sk,ss0,u){
 if(u?.kind)return u.kind;
 const ex=ss0?.exercises?.[u?.id];if(u?.practice)return 'PRACTICE';
 if(!ex)return u?.mode==='BODYWEIGHT'?'BODYWEIGHT':Object.values(ss0?.exercises??{}).some(e=>e.returnStep===0)?'RETURN_ENTRY':'FIRST_ESTABLISH';
 if(Number.isInteger(ex.returnStep))return ex.returnStep===0?'RETURN_ENTRY':'RETURN_STEP';
 if(u.mode==='ESTABLISH')return ex.lastPerformed&&u.date&&dayGap(ex.lastPerformed,u.date)>sk.op.return.moderateMaxDays?'REESTABLISH':ex.unlogged&&ex.mode==='FROM_LOG'?'UNLOGGED':'FIRST_ESTABLISH';
 return u.mode;
}
/** An exercise re-established by effort keeps its earlier known load as a ceiling (QRE-R6-17); the adoption rule reads that state. */
export const reestablishes=(ex,u)=>(u?.kind?u.kind==='REESTABLISH':u?.mode==='ESTABLISH')&&ex?.mode==='KNOWN'&&!Number.isInteger(ex.returnStep);
export const adoptionBasis=(ex,u)=>reestablishes(ex,u)?{...ex,ceiling:ex.load,mode:'FROM_LOG'}:ex??{};
/**
 * Strength at a moderate or long return (SSCTR D49): the return steps start, the block in progress earns no set, and the last
 * executed count before the break (outside a phase reduction; the known count if none was executed) is the ceiling.
 */
export function startStrengthReturn(ex){
 const n={...ex,returnStep:0,returnInBlock:true};delete n.setCap;delete n.setCeiling;delete n.returnLogged;delete n.regainCap;
 const ceiling=Number.isInteger(ex.lastExecutedSets)?ex.lastExecutedSets:Number.isInteger(ex.sets)?ex.sets:null;
 if(ceiling!==null)n.setCeiling=ceiling;
 return n;
}
const advancedGate=k=>['ADVANCE','EARNED'].includes(k);
// One reading of a week's executed strength exposures, shared by the week's transition and the state at a break (R7-A.2).
/** The exposures of one exercise a review saw executed: `p` gives the local date it was last performed and the sessions that performed it
 * ({date, sessions}; a bare date is read as that date); a conditional projection assumes every planned exposure performed on its date. */
const executedOf=(list,p,assumeLogged)=>{if(assumeLogged)return {date:list.map(x=>x.date).filter(Boolean).sort().at(-1)??null,executed:list};const date=typeof p==='string'?p:p?.date??null,sessions=p&&typeof p==='object'&&Array.isArray(p.sessions)?p.sessions:null;return {date,executed:date===null?[]:sessions?list.filter(x=>sessions.includes(x.session)):list.filter(x=>x.date===date)};};
/** An executed exposure's count before the phase reduction, after it and after the time fit, whatever wrote it (R7-A QE-R7A-14; R7-A.1). A
 * row written before R7-A states no counts: the week's planned counts `pl` stand in, and its sets are its count after the fit. */
const countsOf=(x,pl)=>{const base=Number.isInteger(x.baseSets)?x.baseSets:Number.isInteger(pl?.baseSets)?pl.baseSets:null,phased=Number.isInteger(x.phasedSets)?x.phasedSets:!Number.isInteger(x.baseSets)&&Number.isInteger(pl?.sets)?pl.sets:x.sets;return {base,phased,afterFit:Math.min(phased,Number.isInteger(x.fittedSets)?x.fittedSets:x.sets)};};
/** The whole counts executed outside a phase reduction, each after its time fit: the last executed count of a later return reads them (SSCTR D49, R20). */
const wholeCounts=(done,pl)=>done.map(x=>countsOf(x,pl)).filter(c=>Number.isInteger(c.base)&&c.phased===c.base).map(c=>c.afterFit);
/** An exercise set up by its first executed exposure; set up in a return-entry week it starts the return steps (R6-POLICY-4), set up while an
 * exercise in use is in them its count comes back from its own (SSCTR D55). */
const setUp=(u,{entryWeek,returningWeek})=>({status:'ESTABLISHED',mode:u.mode==='BODYWEIGHT'?'BODYWEIGHT':u.mode==='KNOWN'?'KNOWN':'FROM_LOG',load:u.mode==='KNOWN'?u.value:null,convention:u.convention??null,reps:u.reps,sets:u.mode==='KNOWN'?u.sets:null,rir:u.rir,loadTick:0,source:'PLANNED_ESTABLISHMENT',...(entryWeek?{returnStep:0}:returningWeek?{returnInBlock:true,...(Number.isInteger(u.baseSets??u.sets)?{regainCap:u.baseSets??u.sets}:{})}:{})});
/** Re-established by effort once performed, whatever the state's mode: the earlier load becomes a ceiling and the earlier count comes back one
 * set per executed week from the re-establishment count before its phase reduction, never at once (QRE-R6-17, SSCTR D49, D53). */
const reEstablish=(ex,u)=>{const c0=Number.isInteger(u.baseSets)?u.baseSets:u.sets;if(ex.mode==='KNOWN'){ex.ceiling=ex.load;ex.mode='FROM_LOG';}ex.source='RE_ESTABLISHED';if(Number.isInteger(ex.sets)&&Number.isInteger(c0)&&ex.sets>c0){ex.priorSets=ex.sets;ex.sets=c0;}if(Number.isInteger(c0))ex.regainCap=c0;};
/**
 * History ingress (state model consumer closure, Property A; QE-R7ASM-01): a prescription never establishes a state. Read as executed evidence, an
 * exposure of an exercise the start does not hold is an effort-guided establishment whatever its row prescribed: a KNOWN row's load is neither the
 * exercise's load nor the reference a first log is judged against, so that log waits for confirmation (SSCTR D45) and an exposure without a usable
 * load leaves the exercise to be established by effort again (SSCTR D52). Whether the evidence that once established the exercise was retracted
 * before or after the row was planned therefore makes no difference. The repetition target stays the one the row prescribed for that exposure.
 */
export const asEstablishment=u=>u?.mode==='KNOWN'?{...u,mode:'ESTABLISH',value:null}:u;
/** Factual authority (decision authority closure, QE-R7ASC-01): the start holds a known load for the exercise, settled by executed evidence. Only
 * then is a KNOWN row the reference a log is judged against (SSCTR D44). An exercise held as FROM_LOG (established by effort, unlogged, or a log
 * awaiting confirmation) has no usable load, so a KNOWN row planned before a correction, retraction or conflict is read as an establishment: its
 * first log waits for confirmation (SSCTR D45), whenever the correction reached the plan. */
export const heldKnownLoad=ex=>ex?.mode==='KNOWN'&&Number.isFinite(ex.load);
/** The return step an exercise's exposures of the week were dosed at (state model consumer closure, Property D; SSCTR F1, D49, D53): the entry is
 * step 0, return step 2 is step 1, any other row a dose beyond the return steps. The highest one, so a week that reached a step is read at it. */
const RETURN_DOSE={RETURN_ENTRY:0,RETURN_STEP:1};
const doseStep=xs=>{const v=xs.filter(x=>!x.practice).map(x=>RETURN_DOSE[x.kind]??Infinity);return v.length?Math.max(...v):Infinity;};
const entryWeekOf=(ss0,used)=>typeof ss0.entryWeek==='boolean'?ss0.entryWeek:used.some(x=>!x.practice&&ss0.exercises[x.id]?.returnStep===0);
const returningWeekOf=(ss0,used)=>used.some(x=>!x.practice&&Number.isInteger(ss0.exercises[x.id]?.returnStep));
const byExercise=used=>{const m=new Map();for(const x of used){if(!m.has(x.id))m.set(x.id,[]);m.get(x.id).push(x);}return m;};
/**
 * EARNED_PROGRESS (R42; state model, audits/domain-coaching-r7a-state-model-2026-10-28/STATE_MODEL_CONTRACT.md): a load tick counts the
 * successful exposures at a load, and only the evidence that earned them writes it: when a lift adopts a load above the one the state held, the
 * credit at that new load starts at 0, and a load the state already held keeps its credit. It holds in both readings, because it is a property of
 * the count itself: the evidence reducer never counts an exposure the athlete did not make at that load (EARNED_PROGRESS), and the planner never
 * carries a credit earned at another load into its projection (PROJECTED_PROGRESS). A step therefore needs two exposures at the load it steps
 * from, whichever reading asks.
 *
 * A load the state had not reached also brings its own repetition target: the state's target belonged to the earlier load, so the exposure that
 * was executed supplies it, by the gate's rule (SSCTR DOSE-READING; state model consumer closure, F2): ADVANCE takes the repetitions logged, HOLD and
 * REGRESS the target its row prescribed, so HOLD repeats the dose it held and a short set never walks the target out of the goal's range. Load and
 * repetitions therefore stay one dose, whichever reading asks, and no state pairs one load with another load's target.
 */
// Whoever set the higher load: a row the plan stepped above history, or the athlete lifting above the row with its target met (SSCTR D44); a credit
// earned at another load never crosses to it (state model consumer closure: the SSCTR's R42 scope note).
const earnedAt=(ex,before,uLog,log,advanced)=>{
 if(!(Number.isFinite(before)&&Number.isFinite(ex.load)&&ex.load>before+1e-9))return;
 ex.loadTick=0;
 const reps=advanced&&Number.isFinite(log?.reps)?log.reps:uLog.reps;
 if(Number.isFinite(reps))ex.reps=reps;
};
/** The dose an exercise executed (HistoricalState): the load and repetition target the evidence settled on its last logged exposure, the load and
 * repetitions logged, and the day. Written by the evidence reducer only (evidenceMode); the planner never reads or writes it. */
const executedDose=(ex,log,on)=>({mode:ex.mode,load:Number.isFinite(ex.load)?ex.load:null,convention:ex.convention??null,reps:ex.reps??null,lifted:Number.isFinite(log?.load)?log.load:null,liftedReps:Number.isFinite(log?.reps)?log.reps:null,on});
/** The executed doses a state already holds as facts: the intake's reported doses, or a return's entry (computed from history). */
export const executedDosesOf=ss=>Object.fromEntries(Object.entries(ss?.exercises??{}).filter(([,e])=>e&&['KNOWN','BODYWEIGHT'].includes(e.mode)).map(([id,e])=>[id,{mode:e.mode,load:Number.isFinite(e.load)?e.load:null,convention:e.convention??null,reps:e.reps??null,lifted:null,liftedReps:null,on:e.lastPerformed??null}]));
/**
 * The strength state when a break began (R7-A.2 I4–I7; SSCTR D59). `ss0` is the state in force at the last point before the break, `used`
 * the exposures prescribed after that point and before the break, `gate` their weekly gate reading and `performed` what the record shows
 * executed. Each executed exposure is read as the week's transition reads it, as facts only: the exercise is in use (set up as a review sets
 * it up, or recorded as re-established), with its last performed date and, outside a return, the last executed whole count after the time fit
 * when its logged target was met (the ceiling of a return, SSCTR D49, R20). What a review of the week decides is not applied: no load is
 * adopted (an exercise left without a usable load is unlogged, so outside a return its next exposure establishes the load by effort again,
 * SSCTR D52), and no gate step, cap rise or end, return step or block set (strengthReturnSets: the block in progress earns no set). An
 * exercise not executed is unchanged. One load is a fact, not a decision (state evidence, Founder §19 B, P5): the load the athlete lifted on a
 * row that prescribed a known load, as the adoption rule reads the week's deciding log (`logged`; judged against that row, SSCTR D44; a
 * heavier one only with the row's target met), is the exercise's known load: lighter or heavier than the one the state held, never a step.
 * An effort-guided row (whose known load is a ceiling) adopts nothing (R7-A boundary S-B).
 */
export function strengthAtBreak(sk,ss0,used,gate={},{performed={},logged={},evidenceMode=false}={}){
 const ss=clone(ss0),planned=ss0.planned??{},entryWeek=entryWeekOf(ss0,used),returningWeek=returningWeekOf(ss0,used),facts=evidenceMode?{...(ss0.facts??executedDosesOf(ss0))}:null;delete ss.planned;delete ss.entryWeek;delete ss.facts;
 for(const [id,rows] of byExercise(used)){
  // An exercise the start does not hold with a known load is set up or read only by what was executed (asEstablishment; QE-R7ASC-01).
  const list=heldKnownLoad(ss0.exercises[id])?rows:rows.map(asEstablishment);
  const {date:on,executed:done}=executedOf(list,performed?.[id],false);if(!on)continue;
  const u=done[0]??list.at(-1),k=gate[id]??gate.STRENGTH??gate.ALL??'HOLD';
  let ex=ss.exercises[id];
  if(!ex)ex=ss.exercises[id]=setUp(u,{entryWeek,returningWeek});else if(exposureKindOf(sk,ss0,u)==='REESTABLISH')reEstablish(ex,u);
  if(!(ex.lastPerformed>=on))ex.lastPerformed=on;
  if(u.practice)continue;
  const log=logged[id],uLog=log?.sessionId?list.find(x=>x.session===log.sessionId)??u:u;
  if(log&&!uLog.practice&&uLog.mode==='KNOWN'&&Number.isFinite(uLog.value)&&ex.mode==='KNOWN'&&Number.isFinite(ex.load)){const before=ex.load,d=loggedLoadDecision(sk.op.strength,adoptionBasis(ex,uLog),uLog,log,{advanced:advancedGate(k)});if(d.adopted){ex.load=d.value;earnedAt(ex,before,uLog,log,advancedGate(k));}}
  if(ex.mode==='FROM_LOG'&&!Number.isFinite(ex.pendingLoad))ex.unlogged=true;else delete ex.unlogged;
  const whole=wholeCounts(done,planned[id]);
  if(!Number.isInteger(ex.returnStep)&&advancedGate(k)&&whole.length)ex.lastExecutedSets=Math.max(...whole);
  if(evidenceMode&&log)facts[id]=executedDose(ex,log,on);
 }
 if(evidenceMode)ss.facts=facts;
 return ss;
}
/**
 * The strength part of HistoricalState in the planner's terms (state model; Founder §3, I3–I5, I13, T13): the evidence state with every step the
 * evidence released but the athlete has not yet executed undone. A step up of the load or of the repetitions is the plan's next target
 * (PlanningProjection.targetLoad), never a fact: the exercise keeps the dose it last executed (the load and repetition target the evidence settled
 * on it), and the step it earned waits for one observed execution (its tick one short of the step). A step down the evidence decided (a
 * regression) stands, and so do counts, return steps and caps, which only executed weeks move. A re-establishment ceiling is never above the
 * last executed load. The executed doses themselves (`facts`) are dropped: what is returned is a state, as a return reads it.
 */
export function historicalStrength(ss){
 const {facts={},...rest}=ss??{exercises:{}},exercises={};
 for(const [id,ex] of Object.entries(rest.exercises??{})){
  const f=facts[id];
  if(!f||!ex){exercises[id]=ex;continue;}
  const same=(ex.convention??null)===(f.convention??null);
  if(ex.mode==='KNOWN'&&f.mode==='KNOWN'&&same&&Number.isFinite(ex.load)&&Number.isFinite(f.load)){
   const loadUp=ex.load>f.load+1e-9,repsUp=Math.abs(ex.load-f.load)<1e-9&&Number.isFinite(f.reps)&&(ex.reps??0)>f.reps;
   exercises[id]=loadUp?{...ex,load:f.load,reps:f.reps,loadTick:1}:repsUp?{...ex,reps:f.reps}:ex;continue;
  }
  if(ex.mode==='BODYWEIGHT'&&f.mode==='BODYWEIGHT'&&Number.isFinite(f.reps)&&(ex.reps??0)>f.reps){exercises[id]={...ex,reps:f.reps};continue;}
  if(ex.mode==='FROM_LOG'&&Number.isFinite(ex.ceiling)&&f.mode==='KNOWN'&&same&&Number.isFinite(f.load)&&f.load<ex.ceiling-1e-9){exercises[id]={...ex,ceiling:f.load};continue;}
  exercises[id]=ex;
 }
 return {...rest,exercises};
}
/**
 * The run as a return reads it (decision authority closure, SSCTR F4; residual authority closure, QE-R7ADA-02, SSCTR F4-X; R6-NONCLINICAL-RETURN:
 * "SHORT: resume the last executed doses; ... the next step waits for executed sessions", MODERATE: "conditional steps to the prior executed dose",
 * historical maxima are a ceiling, not current proof): HistoricalState's run with every release the athlete has not run yet undone, so a return
 * never starts above the running state or dose last executed. Released is not executed: a dose or mode the evidence released, or the plan projects,
 * is no tolerance until a run executes it. `ran` is the record of the runs executed completely since the state's latest entry (the report of the
 * latest return, else the intake) and before this interruption began, in order: each with the role, progression dimension and value, and minutes
 * its row prescribed, its week, and whether its response was tolerated (no adverse or conflicting signal); `stateOf(week)` is HistoricalState's
 * run at the start of a week (the state that prescribed that week's rows).
 * - A mode the evidence released that no run has used yet (the walk/jog exit to continuous running, the restart's switch to easy running, a
 *   return's completion) is undone: the run is the state that prescribed the last run executed, with the records the evidence accumulated.
 *   `undo(mode)` says whether a release out of the last run's mode is undone; the return's recipe decides it (stateAtBreak).
 * - Within its mode no dose is above the one the athlete reached by execution. On a ladder (walk/jog steps, restart minutes, return steps), whose
 *   consolidation and HOLD weeks repeat the step, that is the step last run (W2). Easy running is phase-modulated from the state (a consolidation
 *   or event week runs shorter rows from the same state), so there it is the largest long run, and the largest easy run, executed and tolerated
 *   since the entry: a planned reduction is no lower tolerance, and a released step is no tolerance.
 * Without a run of the dimension on the record since the entry the state stands (the intake's, or the entry's). Once the athlete runs the next dose
 * or mode, that is the one a later return reads.
 */
// The mode a run's row was prescribed in, by its progression dimension: quality steps exist in easy running only. A row without one (a walk, the
// race, an event-window run) states no mode.
const MODE_OF_DIMENSION={WALK_JOG_STEP:'WALK_JOG',RESTART_MINUTES:'RESTART',RETURN_STEP:'RETURN',LONG_MINUTES:'EASY',EASY_MINUTES:'EASY',THRESHOLD_STEP:'EASY',SPECIFIC_STEP:'EASY'};
const RUN_RECORDS=['achieved','longestContinuous','longByWeek','modeHistory','resumed'];
export function historicalRun(run,ran=[],{stateOf=null,easyStepMinutes=0,undo=()=>true}={}){
 if(!run)return run;
 const stated=ran.filter(x=>MODE_OF_DIMENSION[x.dimension]),last=stated.at(-1),mode=last?MODE_OF_DIMENSION[last.dimension]:null;
 let st=run;
 if(mode&&mode!==run.mode&&undo(mode)){const b=stateOf?.(last.week);if(b?.mode===mode){st=clone(b);for(const k of RUN_RECORDS)if(k in run)st[k]=clone(run[k]);else delete st[k];}}
 const lastValue=dim=>stated.filter(x=>x.dimension===dim).at(-1)?.value??null,above=(v,x)=>Number.isFinite(v)&&Number.isFinite(x)&&x>v;
 if(st.mode==='WALK_JOG'){const v=lastValue('WALK_JOG_STEP');if(Number.isInteger(v)&&above(v,st.walkStep))st={...st,walkStep:v};}
 else if(st.mode==='RESTART'){const v=lastValue('RESTART_MINUTES');if(above(v,st.restart))st={...st,restart:v};}
 else if(st.mode==='RETURN'){const v=lastValue('RETURN_STEP');if(Number.isInteger(v)&&above(v,st.returnStep))st={...st,returnStep:v};}
 else if(st.mode==='EASY'){
  // The easy runs a quality slot became after a short break (D58) keep that slot's dimension and are no easy-run dose.
  const largest=pred=>{const v=ran.filter(x=>x.tolerated&&pred(x)).map(x=>x.minutes);return v.length?Math.max(...v):null;};
  const long=largest(x=>x.role==='LONG'),easy=largest(x=>x.role==='EASY'&&!['THRESHOLD_STEP','SPECIFIC_STEP'].includes(x.dimension));
  if(above(long,st.long))st={...st,long};
  // No easy run above the largest one executed: the rotating extra step waits too.
  if(Number.isFinite(easy)&&Number.isFinite(st.easy)&&st.easy+((st.easyExtra??0)>0?easyStepMinutes:0)>easy)st={...st,easy:Math.min(st.easy,easy),easyExtra:0};
 }
 return st;
}
/** Transition after week w for exercises used that week. gate per exercise id or 'STRENGTH'. Logged loads replace planned ones before the gate.
 * A step needs a logged set at the current load in the gating week; a conditional projection assumes the planned logs.
 * `performed` maps an exercise to the local date a review saw it last performed in the week and the sessions that performed it
 * ({date, sessions}; a bare date is read as that date); a conditional projection assumes every planned exposure performed on its date
 * (SSCTR D52). The week's own exposure decides it: the first one executed, with the kind and counts its row prescribed (R7-A). */
export function advanceStrength(sk,ss0,w,used,gate={},logged={},{assumeLogged=false,performed={},evidenceMode=false}={}){
 const {op,plan,blocks}=sk,S=op.strength,g=goalDose(sk),phase=plan.phases[w],[lo,hi]=g.repRange,ss=clone(ss0),dev=DEVELOPMENT.includes(phase),blockEnd=blocks.some(b=>DEVELOPMENT.includes(b.family)&&b.endWeekExclusive===w+1);
 // The week's planned counts (before the phase reduction, and without a return cap) travel in its state, so a review of a row that does
 // not state its own counts sees them too.
 const planned=ss0.planned??{};delete ss.planned;
 // State model: the executed doses are HistoricalState, kept by the evidence reducer (evidenceMode); a planning transition never carries them.
 const facts=evidenceMode?{...(ss0.facts??executedDosesOf(ss0))}:null;delete ss.facts;
 // An exercise first established in a return-entry week continues through the return steps like the others (author-found, R6-POLICY-4);
 // the week is an entry week when an exercise in use is at the entry step (R7-A).
 const entryWeek=entryWeekOf(ss0,used);delete ss.entryWeek;let finished=false;
 // SSCTR D55: an exercise first set up while an exercise in use is in the return steps earns no block-boundary set for the block of the
 // return (strengthReturnSets: the block in progress at the break earns no set), and its count rises at most one set per executed week.
 const returningWeek=returningWeekOf(ss0,used);
 for(const [id,rows] of byExercise(used)){
  // Read as executed evidence (a review or the evidence reducer, not a conditional projection), an exercise the start does not hold with a known
  // load is set up or adopted only by what was executed, never by what its rows prescribed (asEstablishment; QE-R7ASM-01, QE-R7ASC-01): a KNOWN
  // row of an exercise history holds only as FROM_LOG is no reference for its first log.
  const list=assumeLogged||heldKnownLoad(ss0.exercises[id])?rows:rows.map(asEstablishment);
  // The gate is known before the adoption: an above-plan load is adopted only when this exposure met the ADVANCE criterion (SSCTR D44).
  // The first executed exposure decides what the week was (a re-establishment or not); the last executed one gives its counts, as
  // "the last executed count" reads (SSCTR D49, R19; R7-A).
  const {date:on,executed:done}=executedOf(list,performed?.[id],assumeLogged),u=done[0]??list.at(-1),uc=done.at(-1)??list.at(-1),kind=exposureKindOf(sk,ss0,u),k=gate[id]??gate.STRENGTH??gate.ALL??'ADVANCE',log=logged[id];
  // A logged load is judged against the exposure it was logged in (SSCTR D44).
  const uLog=log?.sessionId?list.find(x=>x.session===log.sessionId)??u:u;
  let ex=ss.exercises[id];const fresh=!ex;
  // A prescription that was not executed establishes nothing: an exercise gets its state once it is performed (SSCTR D52).
  if(fresh){if(!on)continue;ex=setUp(u,{entryWeek,returningWeek});}
  // Re-established by effort once performed, whatever the state's mode (known load, pending or unlogged log, re-established): the earlier
  // count comes back one set per executed week, never at once (QRE-R6-17, SSCTR D53). The regain starts from the re-establishment count
  // before its phase reduction, with phase reductions on top (SSCTR D49, D53).
  else if(on&&kind==='REESTABLISH')reEstablish(ex,u);
  const adoption=!uLog.practice&&log?loggedLoadDecision(S,adoptionBasis(ex,uLog),uLog,log,{advanced:advancedGate(k),hint:sk.cap?.strength?.loadHints?.[id]??null}):null;
  // At a review a loaded exercise is established only by a logged load, adopted or awaiting confirmation (SSCTR D52).
  if(fresh){if(!assumeLogged&&!u.practice&&ex.mode==='FROM_LOG'&&!adoption?.adopted&&!adoption?.pending)continue;ss.exercises[u.id]=ex;}
  if(on&&!(ex.lastPerformed>=on))ex.lastPerformed=on;
  if(u.practice)continue;
  // A log of an exposure that prescribed a known load, at that load or a lighter one, is progression evidence: its repetition target is the
  // gate's (HOLD and REGRESS repeat it, ADVANCE takes the logged repetitions). Only an establishment exposure sets its target from the
  // repetitions it was established with (R7-A; R7-A.1 QE-R7A-12, SSCTR R25).
  if(adoption?.adopted){const before=ex.mode==='KNOWN'?ex.load:null,progression=uLog.mode==='KNOWN'||ex.mode==='KNOWN'&&Number.isFinite(ex.load)&&Math.abs(ex.load-adoption.value)<1e-9;ex.mode='KNOWN';ex.load=adoption.value;earnedAt(ex,before,uLog,log,advancedGate(k));ex.convention=log.convention??ex.convention??catalogueEntry(u.id)?.convention??'TOTAL';ex.reps=progression&&!(advancedGate(k)&&Number.isFinite(log.reps))?ex.reps:log.reps??ex.reps;ex.source='LOGGED_ACTUAL';delete ex.ceiling;delete ex.pendingLoad;if(Number.isInteger(ex.returnStep))ex.returnLogged=true;}
  // An unconfirmed establishment log is not a number: the next exposure stays FROM_LOG and the athlete is asked (SSCTR D45).
  else if(adoption?.pending){ex.mode='FROM_LOG';ex.pendingLoad=log.load;ex.convention=log.convention??ex.convention;}
  // A from-log row needs a logged load: an exposure performed without a usable one leaves the next one chosen by effort (SSCTR D52).
  if(on&&!assumeLogged&&ex.mode==='FROM_LOG'&&!Number.isFinite(ex.pendingLoad))ex.unlogged=true;else if(on)delete ex.unlogged;
  // The dose executed, as the evidence settled it before any step (HistoricalState; evidence mode only).
  if(evidenceMode&&on&&log)facts[id]=executedDose(ex,log,on);
  // The counts are those its row prescribed (R7-A); a row without them falls back to the week's plan.
  const step=incrementFor(S,ex.convention),evidence=assumeLogged||!!log,executed=advancedGate(k)&&evidence,returning=Number.isInteger(ex.returnStep),p=Number.isInteger(uc.baseSets)?{sets:uc.sets,phasedSets:Number.isInteger(uc.phasedSets)?uc.phasedSets:uc.sets,baseSets:uc.baseSets,normalSets:Number.isInteger(uc.normalSets)?uc.normalSets:null}:planned[id];
  // A week without a phase reduction executed its whole count; only such a week moves the return count up (SSCTR D49).
  const unreduced=!p||!Number.isInteger(p.sets)||(p.phasedSets??p.sets)===p.baseSets,ceiling=Number.isInteger(ex.setCeiling)?ex.setCeiling:Infinity;
  // A block earns its set only when no exposure in it was a return step; each such block also lifts the return ceiling by one (SSCTR D49).
  if(returning)ex.returnInBlock=true;
  const blockSet=blockEnd&&executed&&!ex.returnInBlock;
  if(blockEnd){if(blockSet){ex.blocksDone=(ex.blocksDone??0)+1;if(Number.isInteger(ex.setCeiling))ex.setCeiling++;}delete ex.returnInBlock;}
  // The last executed count outside a return and outside a phase reduction is the ceiling of a later return (SSCTR D49): the largest whole
  // count the week executed outside a phase reduction, each after its time fit (SSCTR R20; one reading of each exposure, countsOf).
  const whole=wholeCounts(done,planned[id]);
  if(!returning&&executed&&whole.length)ex.lastExecutedSets=Math.max(...whole);
  // The return and regain caps rise or end only after a week whose last executed exposure, the one that gives the week's counts (R19), did
  // its whole count after its time fit: a time fit is no phase reduction, but a week trimmed to the time budget is no whole week either
  // (R7-A.1, SSCTR D56). Without any count the week's plan reading stays.
  const last=countsOf(uc,planned[id]),wholeWeek=Number.isInteger(last.base)?last.afterFit===last.base:unreduced;
  // After the return steps the cap rises one set per executed whole week up to the ceiling. It ends only after such a week, once it covers
  // the count the exercise would otherwise have next week (its normal count with the block set this transition earns), so no count comes
  // back more than one set above the last whole one (R7-A.1, SSCTR D57).
  if(!returning&&Number.isInteger(ex.setCap)&&executed&&wholeWeek){ex.setCap=Math.min(Number.isInteger(ex.setCeiling)?ex.setCeiling:Infinity,ex.setCap+1);if(Number.isInteger(p?.normalSets)&&ex.setCap>=p.normalSets+(blockSet?1:0)){delete ex.setCap;delete ex.setCeiling;}}
  // After a re-establishment the cap rises one set per executed whole week, and ends once no count it could hold back remains (SSCTR D53, D56).
  if(!returning&&Number.isInteger(ex.regainCap)){if(executed&&wholeWeek)ex.regainCap++;if(ex.regainCap>=Math.max(g.maxSets,Number.isInteger(ex.priorSets)?ex.priorSets:0,Number.isInteger(ex.sets)?ex.sets:0))delete ex.regainCap;}
  if(Number.isInteger(ex.priorSets)){if(executed)ex.sets=Math.min(ex.priorSets,ex.sets+1);if(ex.sets>=ex.priorSets)delete ex.priorSets;}
  // A return step moves from the dose the week's exposures were prescribed at, never above the state: an exposure that repeated the entry dose
  // completes the entry only, so the restoration never skips the step it did not execute, and HOLD repeats the dose it held (Property D, SSCTR F1).
  if(returning){const base=Math.min(ex.returnStep,doseStep(done.length?done:list));ex.returnStep=k==='REGRESS'?Math.max(0,base-1):executed?base+1:base;if(ex.returnStep>=2){delete ex.returnStep;delete ex.returnLogged;finished=true;ex.setCap=Math.min(ceiling,(Number.isInteger(p?.baseSets)?p.baseSets:uc.sets)+(wholeWeek?1:0));}continue;}
  if(k==='REGRESS'){if(ex.mode==='KNOWN'&&ex.load>=step&&step>0)ex.load=Math.round((ex.load-step)*10)/10;else ex.reps=Math.max(lo,(ex.reps??lo)-S.repStep);continue;}
  if(!dev||!executed)continue;
  // One step per week; EARNED may release the load tick but never adds a second step.
  if(ex.mode==='BODYWEIGHT'){ex.reps=ordinalResistance(catalogueEntry(id))?Math.max(ex.reps??lo,Math.min(hi,(ex.reps??lo)+S.repStep)):Math.min(hi+4,(ex.reps??lo)+S.repStep);continue;}
  if(ex.mode!=='KNOWN'||g.mode==='HOLD')continue;
  if(g.mode==='LOAD'){ex.loadTick=(ex.loadTick??0)+1;if(k==='EARNED'||ex.loadTick%2===0){ex.load=Math.round((ex.load+step)*10)/10;ex.loadTick=0;}}
  else if((ex.reps??lo)+S.repStep<=hi)ex.reps=(ex.reps??lo)+S.repStep;else{ex.load=Math.round((ex.load+step)*10)/10;ex.reps=Math.max(lo,Math.min(hi,ex.repsBase??lo));}
 }
 // The return ends with the exercises in use: one not used during it carries no return step once they complete theirs, so rotation
 // resumes on its cadence and later new exercises start normally (SSCTR D51).
 if(finished&&!used.some(u=>Number.isInteger(ss.exercises[u.id]?.returnStep)))for(const e of Object.values(ss.exercises))if(Number.isInteger(e.returnStep)){delete e.returnStep;delete e.returnInBlock;delete e.setCeiling;delete e.returnLogged;}
 // B0-C08: the novice cap releases at a block boundary only on executed evidence: every exercise of the week's last exposures ADVANCE or EARNED
 // (no repeated adverse response) and every loaded one established with a usable load (adopted from a log, or known). Otherwise it holds and
 // is re-assessed at the next boundary. A conditional projection assumes the planned evidence, as it does for every step.
 if(ss.density?.capped&&blockEnd){
  const ids=[...byExercise(used)].filter(([,rows])=>!rows.every(x=>x.practice)).map(([id])=>id),gateOf=id=>gate[id]??gate.STRENGTH??gate.ALL??'HOLD';
  const ok=assumeLogged||ids.length>0&&ids.every(id=>advancedGate(gateOf(id)))&&ids.filter(id=>!noExternalLoad(catalogueEntry(id))).every(id=>ss.exercises[id]?.mode==='KNOWN'&&Number.isFinite(ss.exercises[id]?.load));
  ss.density=ok?{capped:false,releasedAfterWeek:w}:{capped:true,heldAt:[...(ss.density.heldAt??[]),w]};
 }
 if(dev)ss.devCount++;
 if(evidenceMode)ss.facts=facts;
 return ss;
}
/** The exercise each slot of a template uses in week w: rotation applies outside a return (SSCTR D51). One resolution for every reader. */
function slotEntries(sk,template,w,ss){
 const returning=Object.values(ss.exercises).some(e=>Number.isInteger(e.returnStep)),rotation=returning?{}:sk.rotation(w,template);
 return template.rows.map(r=>({r,entry:catalogueEntry(rotation[r.slot]??r.entry.id)??r.entry}));
}
function strengthRowsFor(sk,template,w,ss,{firstOfWeek,phase=null,date=null,entryWeek=false}){
 const {op,goal}=sk,S=op.strength,rows=[],used=[];
 for(const {r,entry} of slotEntries(sk,template,w,ss)){
  const restKey=r.role==='MAIN'?(goal.strength.kind==='STRENGTH'?'MAIN_STRENGTH_GOAL':'MAIN'):'ACCESSORY',common={restSeconds:S.restSeconds[restKey],preparationMinutes:S.preparationMinutes[r.role==='MAIN'?'MAIN':'ACCESSORY']};
  const dose=strengthDose(sk,ss,w,r,entry,{firstOfWeek,phase,date,entryWeek});
  if(dose.skip)continue;
  if(dose.practice){const practice=catalogueEntry(PRACTICE_ID[r.slotPattern??r.pattern])??entry;rows.push(exerciseRow(practice,{role:'PRACTICE',sets:dose.sets,reps:dose.reps,rir:dose.rir,mode:'BODYWEIGHT',restSeconds:S.restSeconds.PRACTICE,preparationMinutes:S.preparationMinutes.PRACTICE,establishment:true,note:'Movement practice: learn the pattern; this is not a strength test',exposure:dose.exposure}));used.push({id:practice.id,practice:true,kind:dose.kind,date});continue;}
  rows.push(exerciseRow(entry,{...common,role:r.role,sets:dose.sets,reps:dose.reps,rir:Math.max(2,dose.rir),mode:dose.mode,value:dose.value??null,convention:dose.convention??null,establishment:!!dose.establishment,rule:dose.rule??null,note:dose.note??null,pending:!!dose.pending,exposure:dose.exposure}));
  used.push({id:entry.id,kind:dose.kind,mode:dose.mode,value:dose.value??null,convention:dose.convention??entry.convention,reps:dose.reps,sets:dose.sets,phasedSets:dose.sets,rir:dose.rir,baseSets:dose.baseSets??null,normalSets:dose.normalSets??null,date});
 }
 return {rows,used};
}
/**
 * Event proximity counts days to the race, never calendar weeks (QRE-R6-03): the last raceWindowDays before the race follow
 * race-week rules and the taper days before them follow taper rules, whichever calendar week they fall in. Each weekday
 * falls once in each window, so the touch and the single light strength session are chosen by weekday.
 */
export function eventDays(sk){
 const {plan,op,goal}=sk;if(!goal.run.event||!Number.isInteger(plan.raceWeek))return null;
 const windowDays=op.event.raceWindowDays,taperWeeks=Math.max(0,plan.raceWeek-(plan.taperStart??plan.raceWeek));
 return {raceAbs:plan.raceWeek*7+plan.raceDay,windowDays,taperDays:windowDays+7*taperWeeks,before:(w,d)=>plan.raceWeek*7+plan.raceDay-(w*7+d),windowB:d=>(plan.raceDay-d+7)%7};
}
/**
 * The phase a session on day `day` of week w is dosed in: race-window days follow race-week rules and taper days taper rules, whichever
 * calendar week they fall in (QRE-R6-03). One definition for the planner, moves within a week and the final validation (R7-A).
 */
export function dayPhaseOf(sk,w,day){
 const phase=sk.plan.phases[w],ed=eventDays(sk);if(!ed)return phase;
 const b=ed.before(w,day);
 if(b>=1&&b<=ed.windowDays)return 'RACE_WEEK';
 if(b>ed.windowDays&&b<=ed.taperDays&&!['TAPER','RACE_WEEK','POST_EVENT'].includes(phase))return 'TAPER';
 return phase;
}
function eventWeekSessions(sk,w,roles,{achieved={},walks=0,ceiling=null,runState=null}={}){
 const {c,op,goal}=sk,R=op.run,E=op.event,ev=goal.run.event,out={},ed=eventDays(sk),cue=R.effortCues.EASY_CONVERSATIONAL;
 const capped=x=>ceiling===null?x:Math.min(x,ceiling),budget=capped(c.schedule.runMinutes),qualityOk=allows(sk.authority,'R6-RUN-QUALITY');
 const runs=roles.filter(r=>r.sport==='RUN').sort((a,b)=>a.day-b.day),strides=qualityOk&&(achieved.strides??0)>0,optionalStrides=stridesOptional(sk,runState)?{optional:true}:{};
 // Walk/jog, restart and return athletes keep or reduce what they have reached; never a continuous run they have not done (SSCTR D43).
 const mode=runState?.mode??'EASY',ladder=op.establishment.walkJogLadder,entry=op.return.entryRunMinutes;
 const exposures=mode==='EASY'?null:spacedExposures(op,runs),walkSet=mode==='EASY'?walkDays(roles,walks):new Set(runs.filter(r=>!exposures.has(r.id)).map(r=>r.id));
 const current=mode==='RESTART'?runState.restart??entry:mode==='RETURN'?runState.returnFrom?.easy??entry:null;
 const heldMinutes=fraction=>Math.min(budget,Math.max(entry,roundTo5(current*fraction)));
 const walk=()=>({role:'WALK',prescription:walkPrescription(Math.min(c.schedule.runMinutes,E.keptWalkMinutes)),optional:true,converted:'KEPT_FROM_BUILD'});
 const walkJog=(step,why,optional=false)=>{const s=Math.max(0,Math.min(step,ladder.length-1)),p=walkJogPrescription(s,ladder,{warmup:op.establishment.walkJogWarmupMinutes,cooldown:op.establishment.walkJogCooldownMinutes,budget:c.schedule.runMinutes});return p?{role:'WALK_JOG',prescription:p,essential:!optional,optional,explanation:why,progression:{dimension:'WALK_JOG_STEP',value:s}}:walk();};
 const easyMinutes=fraction=>Math.min(budget,Math.max(R.minimumSessionMinutes,roundTo5((achieved.easy||R.minimumSessionMinutes)*fraction)));
 const kindOf=family=>family==='TEN_K_SPECIFIC'?'TEN_K':family==='HALF_MARATHON_SPECIFIC'?'HALF_MARATHON':'THRESHOLD';
 // The touch is the run day closest to the race that is still at least raceWeekTouchMinDaysBeforeRace days before it.
 const touchDay=mode==='EASY'&&qualityOk&&achieved.quality?runs.filter(r=>!walkSet.has(r.id)&&ed.windowB(r.day)>=E.raceWeekTouchMinDaysBeforeRace).sort((a,b)=>ed.windowB(a.day)-ed.windowB(b.day))[0]?.day??null:null;
 const taperVolume=ev.kind==='10K'?E.taperWeekRunVolumeRange[1]:mid(E.taperWeekRunVolumeRange);
 for(const r of runs){
  const b=ed.before(w,r.day);
  if(b===0)continue;
  if(b<0){
   const since=-b;
   if(since<E.postEventFirstRunMinDaysAfterRace){out[r.id]={role:'REST_BY_DESIGN',prescription:null,optional:true,explanation:since===1?'Day after the race: rest or an easy walk; no running is planned':'Too soon after the race: rest or walk'};continue;}
   if(mode==='WALK_JOG'){out[r.id]=exposures.has(r.id)?walkJog(runState.walkStep-1,'Easy and optional after the race: an easier walk/jog than before it; stop and report pain, illness or unusual fatigue',true):walk();continue;}
   out[r.id]={role:'RECOVERY_EASY',prescription:easyPrescription(Math.min(budget,E.postEventEasyMinutes[since>=4?1:0],current??Infinity),{family:'RECOVERY_EASY',cue}),optional:true,explanation:'Easy and optional after the race; stop and report pain, illness or unusual fatigue'};continue;
  }
  if(walkSet.has(r.id)){out[r.id]=walk();continue;}
  if(b<=ed.windowDays){
   if(mode==='WALK_JOG'){out[r.id]=b===1?{role:'WALK',prescription:walkPrescription(Math.min(c.schedule.runMinutes,E.keptWalkMinutes),{reason:'Day before the race: an easy walk if you like; no running'}),optional:true,converted:'RACE_EVE_WALK'}:walkJog(runState.walkStep-1,'Final days before the race: an easier walk/jog than your current step');continue;}
   if(mode!=='EASY'){out[r.id]=b===1?{role:'SHAKEOUT',prescription:{...easyPrescription(Math.min(budget,E.shakeoutMinutes[0],current),{family:'SHAKEOUT',cue}),optionalByDesign:true},optional:true,explanation:'Optional short easy run the day before the race'}:{role:'EASY',prescription:easyPrescription(heldMinutes(mid(E.raceWeekRunVolumeRange)),{cue}),explanation:'Final days before the race: shorter than your current runs'};continue;}
   if(b===1){out[r.id]={role:'SHAKEOUT',prescription:{...easyPrescription(Math.min(budget,E.shakeoutMinutes[0]),{family:'SHAKEOUT',cue,strides:strides?{repetitions:Math.min(E.shakeoutStrideRepetitions,achieved.strides),workSeconds:R.strides.workSeconds,recoverySeconds:R.strides.recoverySeconds,...optionalStrides}:null}),optionalByDesign:true},optional:true,explanation:'Optional short shakeout the day before the race'};continue;}
   if(r.day===touchDay){const p=qualityPrescription('TOUCH',E.raceWeekTouch[ev.kind],{cues:R.effortCues,warmup:R.qualityWarmupMinutes,cooldown:R.qualityCooldownMinutes,budget,touchCue:ev.kind==='10K'?'TEN_K_EFFORT':'HALF_MARATHON_EFFORT'});if(p){out[r.id]={role:'RACE_TOUCH',prescription:p,key:true,essential:false,explanation:'Brief race-effort touch to stay sharp; only work already done in the build'};continue;}}
   out[r.id]={role:'EASY',prescription:easyPrescription(easyMinutes(mid(E.raceWeekRunVolumeRange)),{cue}),explanation:'Final days before the race: short and easy'};
   continue;
  }
  if(mode==='WALK_JOG'){out[r.id]=walkJog(runState.walkStep,'Taper: hold your current walk/jog step; nothing new before the race');continue;}
  if(mode!=='EASY'){out[r.id]={role:'EASY',prescription:easyPrescription(heldMinutes(1),{cue}),explanation:'Taper: hold your current easy runs; nothing longer before the race'};continue;}
  // R10: the taper long run is never shorter than that week's easy run.
  if(r.role==='LONG'&&achieved.long){const minutes=Math.max(roundTo5(achieved.long*mid(E.taperWeekLongRunRange)),easyMinutes(taperVolume));out[r.id]={role:'LONG',prescription:easyPrescription(Math.min(budget,Math.max(R.minimumSessionMinutes,minutes)),{family:'LONG',cue}),key:true,essential:true,explanation:'Taper: shorter long run relative to the achieved peak, never shorter than the easy runs'};continue;}
  if(r.role==='QUALITY'&&qualityOk&&achieved.quality?.work){const q=achieved.quality,work=reducedWork(q.work,E.taperQualityWorkRange,E.reducedWorkMinimums);const p=qualityPrescription(kindOf(q.family),{repetitions:work.repetitions,workMinutes:work.workMinutes,recoveryMinutes:q.work.recoveryMinutes},{cues:R.effortCues,warmup:R.qualityWarmupMinutes,cooldown:R.qualityCooldownMinutes,budget});if(p){out[r.id]={role:'QUALITY',prescription:p,key:true,essential:true,explanation:'Taper: same effort, less work than the achieved peak session'};continue;}}
  out[r.id]={role:'EASY',prescription:easyPrescription(easyMinutes(taperVolume),{cue,strides:strides?{repetitions:Math.max(R.strides.entryRepetitions,achieved.strides-1),workSeconds:R.strides.workSeconds,recoverySeconds:R.strides.recoverySeconds,...optionalStrides}:null})};
 }
 return out;
}
const restByDesign=(common,explanation)=>({...common,role:'REST_BY_DESIGN',key:false,essential:false,optional:true,prescription:null,explanation,status:'PLANNED',plannedPrescriptionHash:null});
export function peakOf(weeks){
 const peak={long:0,easy:0,quality:null,strides:0,walks:0};
 for(const wk of weeks){
  if(![...DEVELOPMENT,'SPECIFIC','ESTABLISHMENT','CONSOLIDATION'].includes(wk.phase))continue;
  const long=wk.sessions.find(x=>x.role==='LONG'),easy=wk.sessions.filter(x=>x.role==='EASY'||x.role==='WALK_JOG'),quality=wk.sessions.find(x=>x.role==='QUALITY');
  if(long)peak.long=Math.max(peak.long,long.prescription.durationMinutes);
  if(easy.length)peak.easy=Math.max(peak.easy,...easy.map(x=>x.prescription.durationMinutes));
  if(quality)peak.quality=clone(quality.prescription);
  peak.strides=Math.max(peak.strides,...easy.map(x=>x.prescription.strides?.repetitions??0));
  peak.walks=wk.sessions.filter(x=>x.converted==='TOO_MANY_RUN_DAYS_FOR_CURRENT_PRACTICE').length;
 }
 return peak;
}
/**
 * Why race day is a completion at conversational effort with walk breaks, or null when it is raced by effort: walk/jog, restart or
 * return in race week; walk/jog or restart in any earlier week of this program, from the start or applied by a review (SSCTR D47);
 * or a half marathon whose achieved long run is below the declared minimum (SSCTR D43, R9). No other exemption applies.
 */
export function raceDayCompletionBasis(sk,rs){
 const C=sk.op.event.raceDayCompletion,ev=sk.goal.run.event;if(!ev)return null;
 const mode=rs?.mode??'EASY';
 if(C.modes.includes(mode))return mode==='RETURN'?'RETURN_IN_RACE_WEEK':'MODE_IN_RACE_WEEK';
 if((rs?.modeHistory??[]).some(m=>(C.historyModes??[]).includes(m)))return 'PROGRAM_HISTORY';
 if(ev.kind==='HALF_MARATHON'&&(rs?.achieved?.long??0)<C.halfMarathonAchievedLongRunBelowMinutes)return 'HALF_MARATHON_LONG_RUN';
 return null;
}
export const raceDayCompletion=(sk,rs)=>raceDayCompletionBasis(sk,rs)!==null;
/**
 * The negotiation that goes with a completion race day (SSCTR D43, D47): what the plan reaches by race week, stated as the longest
 * continuous run executed so far (never 0 when runs were reached), why race day is a completion, and both options.
 */
export function eventCompletionItem(sk,rs){
 const basis=raceDayCompletionBasis(sk,rs);if(!basis)return null;
 const ev=sk.goal.run.event,ladder=sk.op.establishment.walkJogLadder,name=ev.kind==='10K'?'10K':'half marathon',L=rs.longestContinuous??0;
 const longest=L>0?`a longest continuous run of ${L} minutes`:'no continuous run yet';
 const reach=rs.mode==='WALK_JOG'?`walk/jog step ${Math.min(rs.walkStep,ladder.length-1)+1} of ${ladder.length}${L>0?' and '+longest:''}`:rs.mode==='RETURN'?`easy runs of about ${rs.returnFrom?.easy??sk.op.return.entryRunMinutes} minutes after the break`:longest;
 const built=(rs.modeHistory??[]).map(m=>m==='WALK_JOG'?'from walk/jog':'after a restart').join(' and ');
 const why={MODE_IN_RACE_WEEK:`which is not continuous race-ready running for a ${name}`,RETURN_IN_RACE_WEEK:'while still returning from the break',PROGRAM_HISTORY:`built ${built} in this program, which does not show race-ready running for a ${name}`,HALF_MARATHON_LONG_RUN:'which is not continuous race-ready running for a half marathon'}[basis];
 return {id:'EVENT_AMBITIOUS_FOR_CURRENT_RUNNING',blocking:false,basis,longestContinuousRunMinutes:L,detail:`By race week the plan reaches ${reach}, ${why}: race day is planned as a completion at conversational effort with walk breaks, and no readiness or finish time is promised`,options:['Keep the event and complete it with walk breaks','Choose a later or shorter event']};
}
/** Builds one week from the run row, the strength state and the context arrangement. */
export function buildWeek(sk,w,rs,ss,priorWeeks,{arrangementOverride=null,equipmentOverride=null,runCeiling=null,firstWeek=false}={}){
 const {c,op,plan,goal,blocks}=sk,s=c.schedule,phase=plan.phases[w],context=contextOf(plan.phases,w),capped=!!ss?.density?.capped&&noviceDensityApplies(sk),arr=arrangementOverride??arrangementFor(sk,context,capped);
 const row=runRow(sk,rs,w),roles=clone(arr?.sessions??[]),ed=eventDays(sk),eventWeek=['TAPER','RACE_WEEK','POST_EVENT'].includes(phase);
 const eventContext={achieved:rs.achieved??{},walks:peakOf(priorWeeks).walks,ceiling:runCeiling,runState:rs},nearRace=r=>!!ed&&ed.before(w,r.day)>=1&&ed.before(w,r.day)<=ed.taperDays;
 let runOut=eventWeek?eventWeekSessions(sk,w,roles,eventContext):distributeRun(sk,row,roles,{ceiling:runCeiling,firstWeek,previousLong:previousBuildLong(priorWeeks),modeHistory:rs.modeHistory??[]});
 // A build or specific week whose last days fall in the taper or race window takes the event rules for those days (QRE-R6-03).
 if(!eventWeek&&roles.some(r=>r.sport==='RUN'&&nearRace(r))){const near=eventWeekSessions(sk,w,roles,eventContext);runOut={...runOut,...Object.fromEntries(roles.filter(r=>r.sport==='RUN'&&nearRace(r)&&near[r.id]).map(r=>[r.id,near[r.id]]))};}
 const windowStrengthDay=ed?roles.filter(x=>x.sport==='STRENGTH'&&ed.windowB(x.day)>=op.event.raceWeekStrengthMinDaysBeforeRace).sort((a,b)=>ed.windowB(b.day)-ed.windowB(a.day))[0]?.day??null:null;
 if(firstWeek)firstWeekGuard(sk,runOut);
 const blockId=blocks.find(b=>w>=b.startWeek&&w<b.endWeekExclusive)?.id,sessions=[],used=[];let firstStrength=true,strengthState=ss;
 const templates=equipmentOverride?sk.templatesFor(equipmentOverride,{capped}):capped&&sk.noviceTemplates?sk.noviceTemplates:sk.templates,templatesOn=date=>equipmentOverride?templates:sk.templatesForDate?sk.templatesForDate(date,{capped}):templates;
 // A return-entry week is one in which an exercise in use this week is at the entry step; a rotated-out exercise still parked at
 // that step does not make one (R7-A).
 const inUse=new Set(roles.filter(x=>x.sport==='STRENGTH').flatMap(x=>{const t=templatesOn(onDate(c.startDate,w*7+x.day))[x.templateIndex];return t?slotEntries(sk,t,w,ss).map(y=>y.entry.id):[];}));
 // A week planned as a return-entry week stays one when its remaining days are rebuilt (R7-A QE-R7A-15).
 const entryWeek=ss.entryWeek===true||[...inUse].some(id=>ss.exercises[id]?.returnStep===0);
 for(const r of roles.sort((a,b)=>a.day-b.day||a.backToBackOrder-b.backToBackOrder)){
  const common={id:`w${w}-${r.sport==='RUN'?'run':'str'}-d${r.day}`,weekIndex:w,day:r.day,date:onDate(c.startDate,w*7+r.day),turn:r.turn??null,sport:r.sport,backToBackOrder:r.backToBackOrder,blockId};
  if(r.sport==='RUN'){
   const x=runOut[r.id];if(!x)continue;
   sessions.push({...common,role:x.role,key:!!x.key,essential:!!x.essential,optional:!!x.optional,prescription:x.prescription,progression:x.progression??null,explanation:x.explanation??(x.converted?x.prescription.instructions[0]:null),converted:x.converted??null,...(x.introduction?{introduction:true,alternative:clone(x.alternative)}:{}),status:'PLANNED',plannedPrescriptionHash:x.prescription?hash(x.prescription):null,...(arr?.orderFlexible&&s.sharedDays.includes(r.day)?{orderFlexible:true}:{})});
   continue;
  }
  const t=templatesOn(common.date)[r.templateIndex];
  // Strength near the race follows days to the race: one short light session at most in the final window, none in its last days.
  const strengthPhase=dayPhaseOf(sk,w,r.day);
  if(ed){
   const b=ed.before(w,r.day);
   if(b<=0&&phase==='RACE_WEEK'){sessions.push(restByDesign(common,b===0?'Race day: no strength':'Strength resumes after the post-event check'));continue;}
   if(b>=1&&b<=ed.windowDays&&(b<op.event.raceWeekStrengthMinDaysBeforeRace||r.day!==windowStrengthDay)){sessions.push(restByDesign(common,'Final days before the race: no strength in the last '+op.event.raceWeekStrengthMinDaysBeforeRace+' days, and one short light session at most before that'));continue;}
  }
  if(phase==='POST_EVENT'){const since=7-plan.raceDay+r.day;if(since<op.event.postEventFirstRunMinDaysAfterRace||sessions.some(x=>x.sport==='STRENGTH'&&x.prescription)){sessions.push(restByDesign(common,'Post-event week: one light strength session is enough; this day is rest or mobility by design'));continue;}}
  // B0-C08: a TPL.CORE day under the novice cap runs at practice dose in the establishment week (practice first), accessory dose after it.
  const built=t?strengthRowsFor(sk,t,w,strengthState,{firstOfWeek:firstStrength||!!t.densityCapped&&t.type==='CORE',phase:strengthPhase,date:common.date,entryWeek}):{rows:[],used:[]};firstStrength=false;
  let fitted=built.rows.length?fitStrengthSession(built.rows,{budget:s.strengthMinutes,warmup:op.strength.warmupMinutes,cooldown:op.strength.cooldownMinutes,secondsPerRep:op.strength.secondsPerRep,maxExercises:s.strengthMinutes<35?op.strength.maxExercises.MAIN_ONLY_BUDGET:op.strength.maxExercises.DEFAULT,minimumExercises:Math.min(2,built.rows.length)}):null;
  if(!fitted){sessions.push(restByDesign(common,'The chosen time cannot hold a supported strength session; more time on this day is needed'));continue;}
  // B0-C11 / CMP.P04: under a RUN lead, a non-MAIN HIGH-eccentric lower row in a session within about a day before the long run or the week's
  // quality run falls by content (one set fewer, a planned reduction), disclosed; the arrangement came first (CMP.I11 ranking), MAIN rows keep
  // the essential stimulus, and nothing new or HIGH-eccentric is introduced there. Under STRENGTH or JOINT lead nothing is reduced here.
  const lead=goal.priorityByPhase[phase==='CONSOLIDATION'?context:phase]?.lead??goal.baseLead,H=op.hybrid;
  const nearProtected=allowsCandidate(sk.repertoire??DEFAULT_REPERTOIRE,'B0-C11')&&lead==='RUN'&&roles.some(k=>{const x=runOut[k.id];if(k.sport!=='RUN'||!x?.prescription||!I11_PROTECTED_FAMILIES.includes(x.prescription.family))return false;const g=hourOf(k,H)-hourOf(r,H);return g>0&&g<=H.nextDayGapHours;});
  if(nearProtected)fitted=fitted.map(e=>e.role!=='MAIN'&&e.region==='LOWER'&&configurationOf(e.id)?.eccentric==='HIGH'&&e.sets>1?{...e,sets:e.sets-1,...(e.exposure?{exposure:{...e.exposure,phasedSets:e.sets-1,contentReduction:'CMP.P04'}}:{}),instructions:[...e.instructions,'One set fewer this week: this session is close to your long run or harder run, which this block protects; it is not a recovery or injury measure']}:e);
  const fittedIds=new Set(fitted.map(e=>e.id)),usedNow=built.used.filter(u=>fittedIds.has(u.id)).map(u=>{const e=fitted.find(x=>x.id===u.id);return {...u,session:common.id,fittedSets:e.sets,...(e.exposure?.contentReduction?{phasedSets:e.sets,sets:e.sets}:{})};});used.push(...usedNow);
  // An exercise first set up earlier in the week is not yet established for its later sessions: until a review sees it performed
  // with a logged load, every exposure is its establishment (SSCTR D52). In a return-entry week such an exercise keeps the entry
  // dose for the rest of the week (author-found, R6-POLICY-4).
  if(entryWeek){strengthState=clone(strengthState);for(const u of usedNow)if(!u.practice&&!strengthState.exercises[u.id])strengthState.exercises[u.id]={status:'ESTABLISHED',mode:u.mode==='BODYWEIGHT'?'BODYWEIGHT':u.mode==='KNOWN'?'KNOWN':'FROM_LOG',load:u.mode==='KNOWN'?u.value:null,convention:u.convention??null,reps:u.reps,sets:u.mode==='KNOWN'?u.sets:null,rir:u.rir,loadTick:0,source:'PLANNED_ESTABLISHMENT',returnStep:0};}
  const family=['RACE_WEEK','POST_EVENT','TAPER'].includes(strengthPhase)?'MAINTENANCE':fitted.every(e=>e.load.mode==='BODYWEIGHT'&&e.establishment)?'PRACTICE':t.family;
  const p=strengthPrescription(family,fitted,{budget:s.strengthMinutes,warmup:op.strength.warmupMinutes,cooldown:op.strength.cooldownMinutes,secondsPerRep:op.strength.secondsPerRep,goalMode:goalDose(sk).mode,instructions:strengthPhase==='RACE_WEEK'?['Final days before the race: one short session to keep the movement pattern; nothing new or heavy']:strengthPhase==='TAPER'?['Taper: fewer sets at familiar loads; no new exercises or heavier loads']:[]});
  const heavy=fitted.some(e=>e.region==='LOWER'&&['HEAVY','MODERATE'].includes(e.lowerDemand)&&e.sets>=2);
  sessions.push({...common,role:'STRENGTH_'+t.type,key:heavy&&t.rows.some(x=>x.role==='MAIN'&&['SQUAT','HINGE'].includes(x.pattern)),essential:true,optional:false,prescription:p,status:'PLANNED',plannedPrescriptionHash:hash(p),templateType:t.type,templateId:t.templateId??'TPL.'+t.type,...(t.densityCapped&&t.type==='CORE'?{lighterByDesign:true,explanation:'Lighter by design while strength is being established: trunk and calf work only; two full sessions a week until the first block review (keep this day lighter or choose fewer strength days)'}:{}),...(arr?.orderFlexible&&s.sharedDays.includes(r.day)?{orderFlexible:true,explanation:'Either order on this day: the two sessions carry no interference difference'}:{})});
 }
 if(phase==='RACE_WEEK'){
  const onChosen=s.runDays.includes(plan.raceDay),completion=raceDayCompletion(sk,rs),ladder=op.establishment.walkJogLadder,step=rs.mode==='WALK_JOG'?ladder[Math.max(0,Math.min(rs.walkStep,ladder.length-1))]:null;
  const span=x=>x>=60?(Math.round(x/6)/10)+' min':x+' s',walkBreaks=step?(step.walkSeconds?span(step.jogSeconds)+' jog, '+span(step.walkSeconds)+' walk':'continuous easy jogging, walking whenever needed'):null;
  const race=racePrescription(goal.run.event,{cues:op.run.effortCues,raceDay:op.event.raceDay,completion,stridesWarmup:(rs.achieved?.strides??0)>0,walkBreaks});
  sessions.push({id:`w${w}-race`,weekIndex:w,day:plan.raceDay,date:onDate(c.startDate,w*7+plan.raceDay),turn:null,sport:'RUN',role:'RACE',key:true,essential:true,optional:false,prescription:race,status:'PLANNED',plannedPrescriptionHash:hash(race),explanation:onChosen?'Race day':'Race day is the athlete’s own event date, outside the usual run days',blockId});
  sessions.sort((a,b)=>a.day-b.day||(a.backToBackOrder??0)-(b.backToBackOrder??0));
 }
 const week={index:w,startDate:onDate(c.startDate,w*7),blockId,phase,status:'CONDITIONAL',conditional:true,contextualPriority:goal.priorityByPhase[phase==='CONSOLIDATION'?context:phase]??null,arrangementId:arr?.id??null,sessions,...weekSummary(sessions),progressionGate:w===0?{requires:'NONE_FIRST_WEEK',note:'The first week does not exceed current practice'}:{requires:'PREVIOUS_COMPARABLE_SESSIONS_EXECUTED_WITHOUT_ADVERSE_RESPONSE',fallback:'REPEAT_PREVIOUS_DOSE',regression:'REPEATED_ADVERSE_REGRESSES_ONE_STEP'},intent:BLOCK_INTENT[phase]};
 return {week,used,entryWeek};
}
/** A week's rest days and planned totals from its prescribed sessions: the plan, before same-week adaptations (R7-A.1 composition). */
export function weekSummary(sessions){
 const planned=sessions.filter(x=>x.prescription),run=planned.filter(x=>x.sport==='RUN'&&x.role!=='RACE'&&x.prescription.family!=='WALK');
 return {restDays:[0,1,2,3,4,5,6].filter(d=>!planned.some(x=>x.day===d)),plannedRunMinutes:run.reduce((n,x)=>n+x.prescription.durationMinutes,0),plannedStrengthSets:planned.filter(x=>x.sport==='STRENGTH').reduce((n,x)=>n+x.prescription.exercises.reduce((m,e)=>m+e.sets,0),0)};
}
/** Week 1 never exceeds the reported weekly running: shorten easy runs first, then hold a non-familiar or oversized quality task, then keep a walk. */
function firstWeekGuard(sk,runOut){
 const W0=sk.cap.run.weeklyMinutes,R=sk.op.run;if(!Number.isFinite(W0)||!['EASY_CURRENT','QUALITY_FAMILIAR','EASY_LOW'].includes(sk.cap.run.class))return;
 const running=()=>Object.values(runOut).filter(x=>x.prescription&&x.role!=='WALK'),total=()=>running().reduce((n,x)=>n+x.prescription.durationMinutes,0),cue=R.effortCues.EASY_CONVERSATIONAL;
 for(let guard=0;guard<40&&total()>W0;guard++){
  const easy=Object.entries(runOut).filter(([,x])=>x.role==='EASY'&&x.prescription.durationMinutes-5>=R.minimumSessionMinutes).sort((a,b)=>b[1].prescription.durationMinutes-a[1].prescription.durationMinutes)[0];
  if(easy){runOut[easy[0]]={...easy[1],prescription:easyPrescription(easy[1].prescription.durationMinutes-5,{cue,strides:easy[1].prescription.strides??null})};continue;}
  const quality=Object.entries(runOut).find(([,x])=>x.role==='QUALITY');
  if(quality){runOut[quality[0]]={role:'EASY',prescription:easyPrescription(R.minimumSessionMinutes,{cue}),essential:false,key:false,explanation:'The familiar quality task waits a week: week 1 stays inside current running'};continue;}
  const last=Object.entries(runOut).filter(([,x])=>x.role==='EASY').at(-1);
  if(last){runOut[last[0]]={role:'WALK',prescription:walkPrescription(Math.min(sk.c.schedule.runMinutes,sk.op.establishment.walkSessionMinutes[0])),optional:true,converted:'TOO_MANY_RUN_DAYS_FOR_CURRENT_PRACTICE'};continue;}
  break;
 }
}
/** Long run of the last build week (consolidation skipped); none across an event transition. */
const previousBuildLong=weeks=>{const prev=[...weeks].reverse().find(x=>x.phase!=='CONSOLIDATION');return prev&&!['TAPER','RACE_WEEK','POST_EVENT'].includes(prev.phase)?prev.sessions.find(s=>s.role==='LONG')?.prescription?.durationMinutes??null:null;};
/** Running minutes a session adds to the single-run reference: jog minutes for walk/jog, none for walks or the race. */
export function runMinutesOf(s){
 const p=s.prescription;if(s.sport!=='RUN'||!p||s.role==='RACE'||p.family==='WALK')return 0;
 return p.family==='WALK_JOG'?Math.round((p.work?.repetitions??0)*(p.work?.workSeconds??0)/60):p.durationMinutes;
}
export function plannedOf(week){
 const run=week.sessions.filter(s=>s.sport==='RUN'&&s.prescription),long=run.find(s=>s.role==='LONG'),easy=run.filter(s=>s.role==='EASY'),quality=run.find(s=>s.role==='QUALITY');
 // A ladder step without walk breaks is a continuous run (SSCTR D47).
 const continuousJog=Math.max(0,...run.filter(s=>s.role==='WALK_JOG'&&s.prescription.work?.recoverySeconds===0).map(s=>Math.round(s.prescription.work.repetitions*s.prescription.work.workSeconds/60)));
 // The re-entry dose the runs prescribed (state model consumer closure, Property D): their lowest return step, restart minutes or walk/jog step,
 // so the transition steps from the dose executed (advanceRun). Stated only by a week that prescribes one.
 const lowest=dim=>{const v=run.filter(s=>s.progression?.dimension===dim&&Number.isFinite(s.progression.value)).map(s=>s.progression.value);return v.length?Math.min(...v):null;};
 const reentry=Object.fromEntries([['returnStep','RETURN_STEP'],['restart','RESTART_MINUTES'],['walkStep','WALK_JOG_STEP']].map(([k,dim])=>[k,lowest(dim)]).filter(([,v])=>v!==null));
 // A long run the share cap held keeps the easy and quality steps open (SSCTR D50).
 return {long:long?long.prescription.durationMinutes:null,easy:easy.length?Math.max(...easy.map(s=>s.prescription.durationMinutes)):null,quality:quality?{family:quality.prescription.family,work:clone(quality.prescription.work)}:null,strides:Math.max(0,...easy.map(s=>s.prescription.strides?.repetitions??0)),continuousJog:continuousJog||null,...(long?.progression?.heldBy==='LONG_RUN_SHARE'?{longHeldByShare:true}:{}),...reentry};
}
/** The week's planned strength counts per exercise, read by the transition in projection and in reviews (SSCTR D49). */
export const plannedStrengthOf=used=>Object.fromEntries(used.filter(u=>!u.practice).map(u=>[u.id,{sets:u.sets,baseSets:u.baseSets??null,normalSets:u.normalSets??null}]));
/**
 * In a conditional projection a run dimension advances only when the week plans a session of it; the others hold (SSCTR D46).
 * Restart and return sessions of any role gate on EASY, as they do in weekly reviews (SSCTR R13).
 */
export const projectionGates=(week,mode='EASY')=>{
 const roles=new Set(week.sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>s.role)),gates={ALL:'HOLD',...Object.fromEntries(['LONG','EASY','QUALITY','WALK_JOG'].filter(k=>roles.has(k)).map(k=>[k,'ADVANCE']))};
 if(['RESTART','RETURN'].includes(mode)&&['LONG','EASY','QUALITY'].some(k=>roles.has(k)))gates.EASY='ADVANCE';
 return gates;
};
/** The run modes the race-day completion rule remembers (SSCTR D47): each one the program has used stays in the run state. */
export function withModeHistory(sk,rs){
 const remembered=sk.op.event.raceDayCompletion?.historyModes??[],seen=rs.modeHistory??[];
 return remembered.includes(rs.mode)&&!seen.includes(rs.mode)?{...rs,modeHistory:[...seen,rs.mode].sort()}:rs;
}
/**
 * Week-start authority (R7-A boundary closure; Founder 0.1, §7, §8): why a week's start holds the state it holds, per sport. An
 * evidence-anchored part records what the athlete had accumulated, with the clock of the decision that read that evidence (`evidenceThrough`):
 * INTAKE (the reported current state the program starts from), RETURN_ENTRY (a return's entry: the state executed when its interruption began,
 * with the interruption's facts) or WEEK_EVIDENCE (the weekly review's rule applied to the complete week before). A projected part
 * (CONDITIONAL_PLAN) is the plan: the week before assumed executed as prescribed, with a digest of the rows it assumed (`premise`). The planner
 * reads every start alike; only a historical reader tells them apart (historicalWeekStart).
 */
export const WEEK_START={INTAKE:'INTAKE',RETURN_ENTRY:'RETURN_ENTRY',WEEK_EVIDENCE:'WEEK_EVIDENCE',CONDITIONAL_PLAN:'CONDITIONAL_PLAN'};
const START_SPORTS=['RUN','STRENGTH'];
/** The rows of one sport a projection of the next week's start assumed executed: identity, status and prescription, in any order. */
export const premiseOf=(week,sport)=>hash((week?.sessions??[]).filter(s=>s.sport===sport).map(s=>[s.id,s.status??'PLANNED',s.prescription??null]).sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0));
/** The rows of one strength exercise a projection assumed executed (state evidence, value-scoped): each session that prescribes it, with its
 * status, date and the exercise's row, in any order. An exercise the week does not prescribe has the premise of no rows. */
export const exercisePremiseOf=(week,id)=>hash((week?.sessions??[]).filter(s=>s.sport==='STRENGTH').flatMap(s=>(s.prescription?.exercises??[]).filter(e=>e.id===id).map(e=>[s.id,s.status??'PLANNED',s.date,e])).sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0));
const exerciseIdsOf=week=>[...new Set((week?.sessions??[]).filter(s=>s.sport==='STRENGTH').flatMap(s=>(s.prescription?.exercises??[]).map(e=>e.id)))].sort();
export function startAuthority(parts){
 const p=Object.fromEntries(START_SPORTS.map(x=>[x,parts?.[x]??null]));
 return {authority:START_SPORTS.every(x=>p[x]&&p[x].provenance!==WEEK_START.CONDITIONAL_PLAN)?'EVIDENCE_ANCHORED':'PROJECTED',...p};
}
/** State model: a start records only its provenance and the clock of the evidence it read. History never reads a start's values, so the values a
 * start carried from a projection (the state evidence mission's `projectedBase`) are no longer recorded: the evidence reducer reads, from this
 * record, only which decision closed a week for a sport (WEEK_EVIDENCE) and when. */
export const anchoredStart=(provenance,{eventId=null,asOf=null}={})=>startAuthority(Object.fromEntries(START_SPORTS.map(x=>[x,{provenance,eventId,evidenceThrough:asOf}])));
// A projection's strength part also records the premise of each exercise it assumed, so completed sessions verify it value by value.
export const projectedStart=(week,{eventId=null,asOf=null}={})=>startAuthority(Object.fromEntries(START_SPORTS.map(x=>[x,{provenance:WEEK_START.CONDITIONAL_PLAN,eventId,asOf,premise:premiseOf(week,x),...(x==='STRENGTH'?{values:Object.fromEntries(exerciseIdsOf(week).map(id=>[id,exercisePremiseOf(week,id)]))}:{})}])));
/**
 * Projects weeks [fromWeek, toWeek) (default: to the end) from start states; later transitions assume each planned session executed
 * (planning, not prediction). Each week is built under the context in force for it and the transition into a week follows that week's
 * context (R7-A.1 C2: sk.at).
 */
export function projectWeeks(sk,fromWeek,{runState,strengthState},priorWeeks=[],options={}){
 const weeks=[],states=[],C=sk.op.run.singleRunCeiling,history=[...(options.completedRuns??[])],at=i=>sk.at?.(i)??sk;let rs=runState,ss=strengthState;
 for(let w=fromWeek;w<(options.toWeek??sk.c.weeks);w++){
  const skw=at(w),skn=at(w+1);
  rs=withModeHistory(skw,rs);
  // Earlier projected weeks count as executed (conditional plan); the first projected week uses completed runs only.
  // With no run in the window the reviewed entry is the ceiling in every week, not only the first (QRE-R6-09).
  const start=onDate(sk.c.startDate,w*7),recent=history.filter(h=>dayGap(h.date,start)>0&&dayGap(h.date,start)<=C.windowDays).map(h=>h.minutes);
  const runCeiling=recent.length?Math.max(...recent)+C.stepMinutes:w===fromWeek&&options.coldStart?options.initialCeiling??null:sk.op.return.entryRunMinutes;
  const {week,used,entryWeek}=buildWeek(skw,w,rs,ss,[...priorWeeks,...weeks],{...options,runCeiling,firstWeek:!!options.coldStart&&w===0});
  weeks.push(week);
  for(const s of week.sessions){const m=runMinutesOf(s);if(m)history.push({date:s.date,minutes:m});}
  rs={...rs,planned:plannedOf(week)};ss={...ss,planned:plannedStrengthOf(used),entryWeek};
  states.push({run:rs,strength:ss});
  rs=advanceRun(skn,rs,w,projectionGates(week,rs.mode));ss=advanceStrength(skn,ss,w,used,{},{},{assumeLogged:true});
 }
 return {weeks,states};
}
export function validateWeeks(sk,weeks,{history=null}={}){
 const {cap,goal,plan}=sk,errors=[],at=i=>sk.at?.(i)??sk;
 // Each week is checked against the chosen days and times of the context in force for it (R7-A.1 C2).
 for(const wk of weeks){const s=at(wk.index).c.schedule;for(const x of wk.sessions){
  if(!x.prescription)continue;
  const v=validateR6Prescription(x.prescription);if(v.length)errors.push(x.id+':'+v.join(','));
  if(x.role!=='RACE'&&x.sport==='RUN'&&!s.runDays.includes(x.day))errors.push(x.id+':notChosenRunDay');
  if(x.sport==='STRENGTH'&&!s.strengthDays.includes(x.day))errors.push(x.id+':notChosenStrengthDay');
  const limit=x.sport==='RUN'?(x.role==='LONG'?s.longRunMinutes??s.runMinutes:s.runMinutes):s.strengthMinutes;
  if(x.role!=='RACE'&&x.prescription.durationMinutes>limit)errors.push(x.id+':exceedsChosenTime');
 }}
 for(const wk of weeks){
  const s=at(wk.index).c.schedule;
  // Every session id is unique and no date carries two key runs (QRE-R6-08).
  const ids=new Set();for(const x of wk.sessions){if(ids.has(x.id))errors.push(x.id+':duplicateSessionId');ids.add(x.id);}
  const keys={};for(const x of wk.sessions)if(x.sport==='RUN'&&x.prescription&&x.status!=='SKIPPED'&&['QUALITY','LONG','RACE_TOUCH','RACE'].includes(x.role))(keys[x.date]??=[]).push(x.role);
  for(const [d,list] of Object.entries(keys))if(list.length>1)errors.push(`w${wk.index}:keyRunsSameDate:${d}:${list.join('+')}`);
  if(cap.run.programmed)for(const d of s.runDays)if(!wk.sessions.some(x=>x.sport==='RUN'&&x.day===d))errors.push(`w${wk.index}:chosenRunDayEmpty:${d}`);
  if(cap.strength.programmed)for(const d of s.strengthDays)if(!wk.sessions.some(x=>x.sport==='STRENGTH'&&x.day===d))errors.push(`w${wk.index}:chosenStrengthDayEmpty:${d}`);
 }
 // Every strength row stays inside the dose of its day's phase, whatever branch built it (R7-A; SSCTR D49, D54): race week and post-event
 // keep main lifts only, at the declared sets and reps in reserve; no row is above the phase reduction of the count it states it is based on,
 // and none needs equipment the athlete has not got on its date.
 const E=sk.op.event;
 for(const wk of weeks)for(const x of wk.sessions){
  if(x.sport!=='STRENGTH'||!x.prescription||x.status==='SKIPPED'||history?.has(x.id))continue;
  const P=dayPhaseOf(at(wk.index),wk.index,x.day),floor=phaseMinimumRir(sk.op,P),have=new Set([...at(wk.index).equipmentForDate(x.date),'BODYWEIGHT']);
  for(const e of x.prescription.exercises){
   const bad=why=>errors.push(`${x.id}:phaseDose:${e.id}:${why}`);
   // Every exercise needs only equipment in force on its date (R7-A.1, QE-R7A1-01: fail closed).
   if((e.equipment??[]).some(q=>!have.has(q)))errors.push(`${x.id}:equipmentUnavailable:${e.id}`);
   if(['RACE_WEEK','POST_EVENT'].includes(P)){if(e.role!=='MAIN')bad('accessory');if(e.sets>(P==='RACE_WEEK'?E.raceWeekStrengthSets:E.postEventStrengthSets))bad('sets');}
   if(floor!==null&&e.rir<floor)bad('rir');
   if(Number.isInteger(e.exposure?.phaseBasis)&&e.sets>phaseDose(sk.op,P,e.exposure.phaseBasis,e.rir)[0])bad('sets');
  }
 }
 // R7-B guards (fail closed): every strength row is a configuration of the bound catalog admitted under its records, HIGH skill only when familiar
 // or reached through a ladder; every run belongs to a catalog family; quality only under every R6 quality gate (B0-FIDELITY M1–M3, B0-C01);
 // the familiar repeated bouts only on B0-C02 with a fully specified familiar task.
 for(const wk of weeks)for(const x of wk.sessions){
  if(!x.prescription||x.status==='SKIPPED'||history?.has(x.id))continue;
  const skw=at(wk.index),rep=skw.repertoire??DEFAULT_REPERTOIRE;
  if(x.sport==='STRENGTH')for(const e of x.prescription.exercises){const cfg=configurationOf(e.id);if(!cfg||!admitted(cfg,rep))errors.push(`${x.id}:notInRepertoire:${e.id}`);else if(cfg.skill==='HIGH'&&!highSkillAdmissible(skw,cfg.id))errors.push(`${x.id}:skillNotAdmissible:${e.id}`);}
  if(x.sport!=='RUN')continue;
  if(!runRepertoireOf(x.prescription))errors.push(`${x.id}:runNotInRepertoire`);
  if(['THRESHOLD','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','FAMILIAR_REPEATED_BOUTS'].includes(x.prescription.family)&&!qualityGateOpen(skw,contextOf(skw.plan.phases,wk.index)))errors.push(`${x.id}:qualityGate`);
  if(x.prescription.family==='FAMILIAR_REPEATED_BOUTS'&&!familiarBoutsTask(skw))errors.push(`${x.id}:familiarBoutsAuthority`);
 }
 if(goal.run.event&&weeks.some(w=>w.index===plan.raceWeek)&&!weeks.find(w=>w.index===plan.raceWeek).sessions.some(x=>x.role==='RACE'))errors.push('raceWeekMissing');
 if(!allows(sk.authority,'R6-LOAD-ESTABLISHMENT'))for(const wk of weeks)for(const x of wk.sessions)if(x.sport==='STRENGTH'&&x.prescription)for(const e of x.prescription.exercises)if(e.load.mode==='ESTABLISH'||e.role==='PRACTICE')errors.push(x.id+':establishmentWithoutAuthority:'+e.id);
 return errors;
}
/** HIGH-skill admissibility (catalog classification.skillAdmissibility; B0-C03, B0-C07): familiar, or reached through a skill ladder with agency. */
export const highSkillAdmissible=(sk,id)=>(sk.c.athlete.knownExercises??[]).some(k=>k.id===id&&k.familiar!==false)||(sk.c.athlete.ladderReached??[]).includes(id);
/** Every R6 quality gate (src/r6-program.mjs qualityAllowed at the freeze; B0-FIDELITY M1–M3): class or graduation, goal, three run days, context, authority. */
export const qualityGateOpen=(sk,context)=>(['EASY_CURRENT','QUALITY_FAMILIAR'].includes(sk.cap.run.class)||!!sk.c.athlete.runGraduation&&allowsCandidate(sk.repertoire??DEFAULT_REPERTOIRE,'B0-C01'))&&['RACE','PERFORMANCE'].includes(sk.goal.run.kind)&&['BUILD','SPECIFIC','NEXT_BLOCK','DEVELOPMENT'].includes(context)&&sk.c.schedule.runDays.length>=3&&allows(sk.authority,'R6-RUN-QUALITY');
/** Rebuilds the deterministic skeleton (context) of a stored program for projection; authority is re-resolved, never stored. */
export function skeletonOf(program,authority){
 const op=authority.policy.operational,sk={c:program.canonical,cap:program.capability,goal:program.goal,plan:program.phases,blocks:program.blocks,op,authority,repertoire:repertoireOf(authority),templates:program.templates,noviceTemplates:program.noviceTemplates??null,arrangement:program.arrangementSessions};
 const knownOnly=!allows(authority,'R6-LOAD-ESTABLISHMENT');
 sk.templatesFor=(equipment,{capped=false}={})=>strengthTemplates({...sk.c,athlete:{...sk.c.athlete,equipment}},sk.goal,{equipment,knownOnly,auth:sk.repertoire,capped}).map((t,i)=>({...t,index:i,...(capped?{densityCapped:true}:{})}));
 // The latest window that covers a date is the athlete's latest statement about it (R7-A.1 C2, C5).
 const windows=sk.c.equipmentWindows??[],cache=new Map();
 const windowFor=date=>windows.findLast(x=>date>=x.from&&(!x.to||date<=x.to));
 sk.templatesForDate=(date,{capped=false}={})=>{const own=capped&&sk.noviceTemplates?sk.noviceTemplates:sk.templates,win=windowFor(date);if(!win)return own;const key=hash([win.equipment,capped]);if(!cache.has(key))cache.set(key,sk.templatesFor(win.equipment,{capped}));return cache.get(key);};
 sk.equipmentForDate=date=>windowFor(date)?.equipment??sk.c.athlete.equipment;
 // The context in force for week i when it is an earlier one: a change stated from a later week leaves the earlier context in force
 // before it (R7-A.1 C2). Null means the skeleton's own context; callers use `sk.at?.(i)??sk`.
 const before=program.contextBefore??[],versions=new Map();
 sk.at=i=>{const e=before.find(x=>i<x.untilWeek);if(!e)return null;if(!versions.has(e)){const {untilWeek,...context}=e,view={...program,...context};delete view.contextBefore;versions.set(e,skeletonOf(view,authority));}return versions.get(e);};
 sk.rotation=(w,template)=>rotationFor(sk,w,template);
 return sk;
}
/** The arrangement a week is built under: the novice-density variant while the cap holds (B0-C08), else the context's own. */
export const arrangementKey=(context,capped)=>capped?context+'@B0-C08':context;
export const arrangementFor=(sk,context,capped)=>sk.arrangement?.[arrangementKey(context,capped)]??sk.arrangement?.[context]??Object.values(sk.arrangement??{})[0];
/** Hours from the strength session of a template to the next protected run of its arrangement (CMP.I11 placement, B0-C06 condition 2). */
function neighboursProtectedRun(sk,arr,template){
 const H=sk.op.hybrid,s=(arr?.sessions??[]).find(x=>x.sport==='STRENGTH'&&x.templateIndex===template.index);if(!s)return false;
 const at=x=>hourOf(x,H);
 return (arr.sessions??[]).some(r=>r.sport==='RUN'&&['LONG','QUALITY'].includes(r.role)&&((at(r)-at(s)+168)%168)>0&&((at(r)-at(s)+168)%168)<=H.nextDayGapHours);
}
/**
 * Calendar rotation under DR-134 (B0-C06, B0-F04): selection only, permitted never mandatory. A MAIN never changes on the calendar (default
 * keep; only a block-boundary choice with a recorded reason changes it) and a PRACTICE row never rotates; an ACCESSORY with an admissible
 * alternative turns every two weeks under EVERY_2_WEEKS (TWO_WEEK_ELIGIBLE), otherwise only at the first block boundary on or after its policy
 * cadence (never at every 4-week boundary); no new turn in deferred phases (REASON_ONLY), the configuration in use stays. A turn never raises the
 * session's lower-body or eccentric class, and a lower-body turn never lands in a session within about a day before the long run or the week's
 * quality run (its first exposure follows B0-C11 placement). FIXED: no calendar rotation. The candidate's record off: no calendar rotation.
 */
export function rotationFor(sk,w,template){
 const pref=sk.c.athlete.strengthPreferences.rotation,rot=sk.op.rotation[pref]??sk.op.rotation.COACH_DECIDES;
 if(!allows(sk.authority,'R6-ROTATION')||!allowsCandidate(sk.repertoire,'B0-C06')||!rot.everyWeeks||rot.scope==='NONE')return {};
 const context=contextOf(sk.plan.phases,w),arr=arrangementFor(sk,context,!!template.densityCapped),neighbours=neighboursProtectedRun(sk,arr,template),out={};
 const deferred=i=>ROTATION_DEFERRED_PHASES.includes(sk.plan.phases[i]);
 const blockStart=i=>sk.blocks.some(b=>DEVELOPMENT.includes(b.family)&&b.startWeek===i&&i>0);
 for(const r of template.rows){
  if(r.role!=='ACCESSORY'||!r.alternatives?.length)continue;
  const base=configurationOf(r.entry.id)??r.entry,cycle=[r.entry.id,...r.alternatives.filter(id=>{const e=configurationOf(id);return e&&demandRank(e.lowerDemand)<=demandRank(base.lowerDemand)&&(e.eccentric!=='HIGH'||base.eccentric==='HIGH');})];
  if(cycle.length<2||base.region==='LOWER'&&neighbours)continue;
  const eligibility=rotationEligibility(pref,'ACCESSORY',{phase:null,hasAlternative:true});
  let turns=0,last=0;
  for(let i=1;i<=w;i++){
   if(deferred(i))continue;
   if(eligibility==='TWO_WEEK_ELIGIBLE'?i%rot.everyWeeks===0:blockStart(i)&&i-last>=rot.everyWeeks){turns++;last=i;}
  }
  if(turns)out[r.slot]=cycle[turns%cycle.length];
 }
 return out;
}
/** Generates a complete conditional program from onboarding-like input. Never requires a prebuilt week or a static priority. */
export function generateProgram(input,options={}){
 // The repertoire authority is read at the intake's date (each SSCTR record's review-by date applies), and travels with the R6 authority.
 const intake=canonicalizeIntake(input),authority0=r6Authority(options),authority={...authority0,repertoire:authority0.repertoire??repertoireAuthority({...options,asOf:intake.canonical?.asOf})},op=authority.policy?.operational;
 const base={runtimeVersion:'R6-1',mode:'SHADOW',inputHash:hash(input??null),program:null,applied:false,officialPlanState:clone(input?.officialPlanState??null),appliedState:clone(input?.officialPlanState??null),completedWork:clone(input?.completedWork??[]),missingInputs:[...intake.missing],errors:[...intake.errors],uncertainty:clone(intake.uncertainty),negotiation:clone(intake.negotiation),horizonsConsidered:['H0_SESSION','H1_WEEK','H2_BLOCK','H3_GOAL_EVENT'],qualityAssessment:{assessor:'RUNTIME_SELF_CHECK',independent:false,class:'UNREVIEWED'}};
 const reject=(status,reason,extra={})=>freeze({...base,status,reason,...extra});
 if(intake.status==='CLINICAL_HUMAN_REQUIRED')return reject('CLINICAL_HUMAN_REQUIRED','Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted');
 if(intake.status==='UNSUPPORTED')return reject('UNSUPPORTED','Outside the V1 coaching population or event scope: '+intake.scope,{scope:intake.scope});
 if(intake.status==='INVALID_INPUT')return reject('INVALID_INPUT','Input facts are malformed or contradictory');
 if(intake.status==='ASK')return reject('ASK','Only facts that change the first program are asked; everything else is established or learned',{missingInputs:intake.missing});
 if(!op||!allows(authority,'R6-COLD-START')||!allows(authority,'R6-PLANNED-PROGRESSION'))return reject('UNSUPPORTED','Current independent cold-start/progression authority is unavailable; no program is generated');
 // R7-B: the configurations come from the bound catalog; without its exact bytes and core SSCTR records nothing is planned (fail closed).
 if(!authority.repertoire.valid)return reject('UNSUPPORTED','The bound repertoire (R7B0-CATALOG-2 with its SSCTR records) is unavailable or does not match; no program is generated',{repertoire:repertoireBinding(authority.repertoire)});
 const c=intake.canonical,s=c.schedule,cap=assessCapability(c,op),goal=buildGoalModel(c),plan=planPhases(c,cap,op),blocks=blocksFrom(plan.phases,goal.priorityByPhase);
 if(cap.strength.programmed&&cap.strength.class!=='KNOWN_LOAD'&&!allows(authority,'R6-LOAD-ESTABLISHMENT'))return reject('UNSUPPORTED','Load-establishment authority is unavailable; unknown strength loads cannot be established');
 if(goal.run.event&&!allows(authority,'R6-EVENT-TRANSITION'))return reject('UNSUPPORTED','Event-transition authority is unavailable; an event program would leave the race week unsupported');
 if(cap.restartAfterPause&&!allows(authority,'R6-NONCLINICAL-RETURN'))return reject('UNSUPPORTED','Nonclinical-return authority is unavailable; a restart after a pause cannot be programmed');
 const negotiation=[...base.negotiation],gaps=[];
 const rep=authority.repertoire,knownOnly=!allows(authority,'R6-LOAD-ESTABLISHMENT');
 const templates=cap.strength.programmed?strengthTemplates(c,goal,{knownOnly,auth:rep}):[];
 const sk={c,cap,goal,plan,blocks,op,authority,repertoire:rep,templates,arrangement:{}};
 const noviceTemplates=noviceDensityApplies(sk)?strengthTemplates(c,goal,{knownOnly,auth:rep,capped:true}).map(t=>({...t,densityCapped:true})):null;
 const program0={canonical:c,capability:cap,goal,phases:plan,blocks,templates,noviceTemplates,arrangementSessions:{}};
 Object.assign(sk,skeletonOf(program0,authority),{templates,noviceTemplates,arrangement:{}});
 if(templates.some(t=>t.rows.length<2))negotiation.push({id:'EQUIPMENT_LIMITS_STRENGTH_SESSION',blocking:false,detail:'Available equipment supports fewer than two patterns in a session; bodyweight practice fills the gap',options:['Add equipment','Accept bodyweight practice']});
 const missingPatterns=[...new Set([...templates,...(noviceTemplates??[])].flatMap(t=>t.missingPatterns))];
 if(missingPatterns.length)negotiation.push({id:'MOVEMENT_PATTERN_UNAVAILABLE',blocking:false,informational:true,patterns:missingPatterns,detail:'No available equipment supports these patterns; sessions keep the patterns that can be loaded',options:['Add a band or bar','Accept the gap']});
 const severityAuthority=allows(authority,'R6-HYBRID-ARRANGEMENT'),cmpI11=severityAuthority&&allowsCandidate(rep,'B0-C11'),arrangementTrace={},choices={};let previousId=null;
 // Each context gets its arrangement; under the novice density cap (B0-C08) each context also gets the variant for the capped templates. A
 // capped variant that would need a trade-off preference falls back to the context's own day assignment (same template count).
 const variants=[...new Set(plan.phases.map((p,w)=>contextOf(plan.phases,w)))].flatMap(context=>[[context,false],...(noviceTemplates?[[context,true]]:[])]);
 for(const [context,capped] of variants){
  const own=capped?noviceTemplates:templates,key=arrangementKey(context,capped);
  const candidates=arrangementCandidates(c,cap,goal,context,sk,own),lead=goal.priorityByPhase[context]?.lead??goal.baseLead;
  const choice=chooseBalanced(candidates,{lead,temporaryPreference:goal.temporaryPreference,severityAuthority,cmpI11,currentId:capped?sk.arrangement[context]?.id??null:previousId,hybrid:op.hybrid,context:{eventPhase:EVENT_PHASES.includes(context),strengthDevelopment:goal.strength.development,runDevelopment:goal.run.development,runRole:goal.run.kind==='NONE'?'MAINTAIN':'PRIMARY',strengthRole:EVENT_PHASES.includes(context)||goal.strength.kind==='MAINTAIN'?'MAINTAIN':'PRIMARY'}});
  arrangementTrace[key]={lead,basis:choice.basis,reason:choice.reason,selectedId:choice.selected?.id??null,paretoIds:choice.paretoIds,candidateCount:candidates.length,counterfactuals:choice.counterfactuals.filter(x=>x.selected||choice.paretoIds.includes(x.id)).slice(0,8)};
  if(capped&&(choice.askRequired||!choice.selected)){arrangementTrace[key].fallback='CONTEXT_ARRANGEMENT';continue;}
  if(choice.askRequired)return reject('ASK','Genuine run/strength arrangement trade-off with equal worst-case joint harm; a temporary preference is needed',{missingInputs:['schedule.temporaryPreference'],question:choice.question,trace:{capability:cap,goalModel:goal,phases:plan,arrangement:arrangementTrace}});
  sk.arrangement[key]=choice.selected;if(!capped)previousId=choice.selected?.id??previousId;choices[key]=choice;
 }
 const runState=initialRunState(sk),strengthState=initialStrengthState(sk),{weeks:projected,states}=projectWeeks(sk,0,{runState,strengthState},[],{coldStart:true,initialCeiling:['EASY_CURRENT','QUALITY_FAMILIAR','EASY_LOW'].includes(cap.run.class)?cap.run.longestMinutes??null:null});
 // The first week starts from the athlete's reported current state; every later week from the conditional plan of the week before.
 const weeks=projected.map((wk,i)=>({...wk,startAuthority:i===0?anchoredStart(WEEK_START.INTAKE,{asOf:c.asOf}):projectedStart(projected[i-1])}));
 if(cap.run.programmed&&cap.run.class==='WALK_JOG'&&s.runDays.length>op.establishment.maxWalkJogDaysPerWeek)negotiation.push({id:'TOO_MANY_RUN_DAYS_FOR_ESTABLISHMENT',blocking:false,detail:`${s.runDays.length} run days chosen; establishment supports up to ${op.establishment.maxWalkJogDaysPerWeek} walk/jog exposures, so the other chosen days carry brisk walks`,options:['Keep the walks on those days','Choose fewer run days']});
 if(runState.walks>0&&cap.run.class!=='WALK_JOG')negotiation.push({id:'TOO_MANY_RUN_DAYS_FOR_CURRENT_PRACTICE',blocking:false,detail:`Current running (${cap.run.weeklyMinutes??'unknown'} min/week) is spread over fewer runs; ${runState.walks} chosen run day(s) carry brisk walks and convert to runs at block starts when responses allow`,options:['Keep the plan','Choose fewer run days','Report more current running']});
 const target=runTarget(sk);
 if(goal.run.event){
  const minimumDays=goal.run.event.kind==='HALF_MARATHON'?3:2;
  if(s.runDays.length<minimumDays)negotiation.push({id:'TOO_FEW_RUN_DAYS_FOR_EVENT',blocking:false,detail:`${s.runDays.length} run day(s) for a ${goal.run.event.kind}; the trajectory stays conservative and completion-focused`,options:['Add a run day','Keep the days with a completion goal','Choose a later or shorter event']});
  if((s.longRunMinutes??s.runMinutes)<op.run.longRunTargets[goal.run.event.kind])negotiation.push({id:'LONG_RUN_TIME_LIMITS_EVENT',blocking:false,detail:`Long-run time is limited to ${s.longRunMinutes??s.runMinutes} minutes`,options:['More time on the long-run day','Keep the current time with a completion goal']});
  const raceState=states[plan.raceWeek]?.run,completion=raceState?eventCompletionItem(sk,raceState):null;
  if(completion)negotiation.push(completion);
  if(!s.runDays.includes(plan.raceDay))negotiation.push({id:'EVENT_DAY_OUTSIDE_CHOSEN_DAYS',blocking:false,informational:true,detail:'The race date is not a chosen run day; race-week runs keep the chosen days'});
 }
 negotiation.push(...arrangementDisclosures(choices));
 if(s.sharedDays.length&&(!s.runTurn||!s.strengthTurn||s.runTurn===s.strengthTurn)&&!s.sameTurnConfirmed)negotiation.push({id:'BACK_TO_BACK_CONFIRMATION',blocking:false,days:s.sharedDays,detail:'Run and strength share a shift on these days and are planned back to back; confirm the order or change one shift'});
 negotiation.push(...repertoireNegotiation(sk,{templates,noviceTemplates}));
 // The time fit leaves accessories out before main sets lose any (R6); stated, never silent.
 const fitFirst=weeks.find(w=>DEVELOPMENT.includes(w.phase))??weeks[0],lost=[];for(const x of (fitFirst?.sessions??[]).filter(x=>x.sport==='STRENGTH'&&x.prescription)){const t=templates.find(t=>t.type===x.templateType);if(t)for(const r of t.rows)if(!x.prescription.exercises.some(e=>e.id===r.entry.id)&&r.role!=='MAIN')lost.push(r.entry.id);}
 if(lost.length)negotiation.push({id:'STRENGTH_TIME_LIMITS_SESSION',blocking:false,exercises:[...new Set(lost)],detail:'The chosen time per strength session keeps the main lifts and leaves some accessories out',options:['More time on strength days','Keep the shorter sessions']});
 const errors=validateWeeks(sk,weeks);
 if(errors.length)return reject('UNSUPPORTED','Generated candidate failed complete validation; no partial program is presented as complete',{errors});
 const peak=peakOf(weeks);
 if(goal.run.event&&peak.long<target)gaps.push({id:'LONG_RUN_PEAK_BELOW_TARGET',detail:`Planned long run peaks at ${peak.long} of ${target} minutes before the taper`,owner:'COACHING',materialToGoal:goal.run.event.kind==='HALF_MARATHON'&&peak.long<sk.op.event.raceDayCompletion.halfMarathonAchievedLongRunBelowMinutes});
 const program={version:PROGRAM_VERSION,id:'program-'+c.hash.slice(0,16),athleteId:c.athlete.id,revision:0,proposalOnly:true,official:false,sourceInputHash:base.inputHash,intakeHash:c.hash,policyHash:authority.policyHash,startDate:c.startDate,weeksCount:c.weeks,timezoneOffsetMinutes:c.timezoneOffsetMinutes,learningConsent:c.learningConsent,canonical:c,goal,capability:cap,schedule:clone(s),phases:plan,blocks,weeks,stateTrace:states,arrangement:Object.fromEntries(Object.entries(sk.arrangement).map(([k,v])=>[k,{id:v.id,quality:v.quality,perm:v.perm,runFirstOnShared:v.runFirstOnShared}])),arrangementSessions:clone(sk.arrangement),templates,...(noviceTemplates?{noviceTemplates}:{}),repertoire:repertoireBinding(rep),archetype:allowsCandidate(rep,'B0-C12')?archetypeOf(goal):null,classification:{run:cap.run.classification??null,strength:cap.strength.class,thresholds:RUN_CLASS_THRESHOLDS},coldStart:{run:{class:cap.run.class,basis:cap.run.basis,weeklyMinutes:cap.run.weeklyMinutes,longestMinutes:cap.run.longestMinutes,entry:cap.run.class==='WALK_JOG'?'walk/jog ladder':cap.run.class==='RESTART'?'restart entry':cap.run.class==='EASY_UNKNOWN'?'reviewed easy entry':'current easy running'},strength:{class:cap.strength.class,known:cap.strength.known.map(k=>k.id),entry:cap.strength.class==='KNOWN_LOAD'?'known doses, others established by effort':cap.strength.class==='NONE'?'movement practice, then effort-guided establishment':'effort-guided establishment'},unknowns:clone(intake.uncertainty).map(u=>({field:u.field,category:u.category})),learning:'Longitudinal learning is R7-C; the first sessions only establish and confirm'},feasibility:feasibilityOf(sk,weeks,negotiation),progression:progressionOf(weeks,blocks),negotiation,uncertainty:clone(intake.uncertainty),gaps,decisions:[],completedWork:clone(c.completedWork),officialPlanState:clone(c.officialPlanState),profileContextUsedForDose:false,assumptions:['Future weeks are conditional proposals, not predictions; each step needs the previous comparable exposure executed without an adverse signal','Effort cues, not paces, define running intensity; any time goal is context only','Loads come from known current loads or effort-guided establishment; nothing is derived from sex, body size or another exercise','Phase lengths are operational choices inside reviewed envelopes, not validated optimal periodization'],authorityRefs:authority.records.map(r=>({boundaryId:r.boundaryId,disposition:r.disposition}))};
 program.hash=programHash(program);
 return freeze({...base,status:'PROPOSED',reason:'Complete conditional program generated from onboarding-like facts',program,negotiation,requestedScopeSatisfied:gaps.every(g=>!g.materialToGoal),trace:{capability:cap,goalModel:goal,phases:plan,arrangement:arrangementTrace,unknowns:intake.uncertainty},nextObservation:'Record each session: completed or not, actual minutes or sets/reps/load, effort if known and next-day function. Next week’s steps advance only on that evidence.'});
}
