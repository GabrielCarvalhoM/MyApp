import {clone,freeze,hash} from './value.mjs';
import {canonicalizeIntake,onDate,dayGap} from './r6-intake.mjs';
import {r6Authority,allows} from './r6-authority.mjs';
import {candidatesFor,catalogueEntry} from './r6-catalogue.mjs';
import {walkPrescription,walkJogPrescription,easyPrescription,qualityPrescription,racePrescription,exerciseRow,fitStrengthSession,strengthPrescription,validateR6Prescription,roundTo5,reducedWork} from './r6-prescription.mjs';
import {chooseBalanced} from './r6-balanced.mjs';

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
export function assessCapability(c){
 const a=c.athlete,r=a.recentRun,s=c.schedule,runGoal=c.goals.run.kind,strengthGoal=c.goals.strength.kind,pause=a.pause,longPause=pause?.screen?.status==='NONCLINICAL'&&(pause.weeks??0)>=4;
 const run={programmed:runGoal!=='NONE'&&s.runDays.length>0,experience:a.runExperience,basis:r.basis,weeklyMinutes:r.runMinutesPerWeek,daysPerWeek:r.runDaysPerWeek,longestMinutes:r.longestRunMinutes,familiarQuality:a.knownRuns.filter(t=>t.current&&['THRESHOLD','CRUISE','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC'].includes(t.prescription?.family))};
 if(!run.programmed)run.class='NOT_PROGRAMMED';
 else if(a.runExperience==='NONE'||a.runExperience==='NOVICE'&&(r.runMinutesPerWeek===null||r.runMinutesPerWeek<45||r.runDaysPerWeek===0))run.class='WALK_JOG';
 else if(r.runDaysPerWeek===0||r.runMinutesPerWeek===0||longPause)run.class='RESTART';
 else if(r.runMinutesPerWeek===null)run.class='EASY_UNKNOWN';
 else if(a.runExperience==='NOVICE'||r.runMinutesPerWeek<60||(r.runDaysPerWeek??0)<2)run.class='EASY_LOW';
 else run.class=run.familiarQuality.length?'QUALITY_FAMILIAR':'EASY_CURRENT';
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
const TYPES={1:['FULL_A'],2:['FULL_A','FULL_B'],3:['LOWER','UPPER','FULL_B'],4:['LOWER','UPPER','LOWER_B','UPPER_B']};
const SLOTS={FULL_A:[['SQUAT','MAIN'],['PUSH','MAIN'],['PULL','MAIN'],['CALF','ACCESSORY'],['TRUNK','ACCESSORY']],FULL_B:[['HINGE','MAIN'],['PULL','MAIN'],['PUSH','MAIN'],['LUNGE','ACCESSORY'],['TRUNK','ACCESSORY']],LOWER:[['SQUAT','MAIN'],['HINGE','MAIN'],['LUNGE','ACCESSORY'],['CALF','ACCESSORY'],['TRUNK','ACCESSORY']],UPPER:[['PUSH','MAIN'],['PULL','MAIN'],['PUSH','ACCESSORY'],['PULL','ACCESSORY'],['TRUNK','ACCESSORY']],LOWER_B:[['HINGE','MAIN'],['LUNGE','MAIN'],['CALF','ACCESSORY'],['TRUNK','ACCESSORY']],UPPER_B:[['PULL','MAIN'],['PUSH','MAIN'],['TRUNK','ACCESSORY']],CORE:[['TRUNK','ACCESSORY'],['CALF','ACCESSORY'],['TRUNK','ACCESSORY']]};
const FAMILY_OF={FULL_A:'FULL_BODY',FULL_B:'FULL_BODY',LOWER:'LOWER',UPPER:'UPPER',LOWER_B:'LOWER',UPPER_B:'UPPER',CORE:'PRACTICE'};
export const PRACTICE_ID={SQUAT:'sit-to-stand',HINGE:'hip-hinge-practice',LUNGE:'split-squat-bodyweight',PUSH:'wall-pushup',PULL:'prone-row-practice',CALF:'supported-calf-raise',TRUNK:'dead-bug-practice'};
/** Session templates: which exercise fills each slot, from facts and equipment. Emphasis reorders, never invents competence. */
export function strengthTemplates(c,goal,{equipment=c.athlete.equipment,knownOnly=false}={}){
 const a=c.athlete,count=Math.min(4,c.schedule.strengthDays.length),types=[...(TYPES[count]??[])];
 for(let i=4;i<c.schedule.strengthDays.length;i++)types.push('CORE');
 const known=a.knownExercises,emphasis=new Set([...a.strengthPreferences.emphasis,...a.strengthPreferences.movementPriorities]);
 const runningSupport=goal.strength.kind==='RUNNING_SUPPORT'||!!goal.run.event;
 return types.map((type,index)=>{
  const used=[];
  const rows=SLOTS[type].map(([pattern,role],slot)=>{
   let options=candidatesFor(pattern,{equipment,experience:a.strengthExperience,known,role:'ANY',exclude:used});
   if(knownOnly)options=options.filter(o=>o.loading==='BODYWEIGHT'||known.some(k=>k.id===o.id&&k.dose));
   if(runningSupport&&role==='ACCESSORY')options=[...options.filter(o=>o.runningSupport),...options.filter(o=>!o.runningSupport)];
   if(role==='MAIN')options=[...options.filter(o=>o.role==='MAIN'||o.familiar),...options.filter(o=>!(o.role==='MAIN'||o.familiar))];
   const pick=options[0]??null;if(pick)used.push(pick.id);
   return pick?{slot,pattern,role,entry:pick,alternatives:options.slice(1,4).map(o=>o.id),emphasized:emphasis.has(pattern)||emphasis.has(pick.region)}:{slot,pattern,role,entry:null,missing:true};
  });
  const present=rows.filter(r=>r.entry);
  present.sort((x,y)=>Number(y.role==='MAIN')-Number(x.role==='MAIN')||Number(y.emphasized)-Number(x.emphasized)||x.slot-y.slot);
  return {index,type,family:FAMILY_OF[type],rows:present,missingPatterns:rows.filter(r=>r.missing).map(r=>r.pattern)};
 });
}
const turnOf=(c,sport)=>sport==='RUN'?c.schedule.runTurn:c.schedule.strengthTurn;
/** Candidate weekly arrangements: quality day × strength-type permutation × back-to-back order on shared same-turn days. */
export function arrangementCandidates(c,cap,goal,context,ctx,templates){
 const s=c.schedule,runDays=cap.run.programmed?s.runDays:[],strengthDays=cap.strength.programmed?s.strengthDays:[];
 const qualityAllowed=['EASY_CURRENT','QUALITY_FAMILIAR'].includes(cap.run.class)&&['RACE','PERFORMANCE'].includes(goal.run.kind)&&['BUILD','SPECIFIC','NEXT_BLOCK','DEVELOPMENT'].includes(context)&&runDays.length>=3&&allows(ctx.authority,'R6-RUN-QUALITY');
 const longDay=cap.run.class==='WALK_JOG'?null:s.longRunDay,qualityOptions=qualityAllowed?runDays.filter(d=>d!==longDay):[null];
 const types=templates.map(t=>t.type),perms=types.length>5?[types]:permutations(types),out=[];
 const sameTurnShared=s.sharedDays.filter(d=>!s.runTurn||!s.strengthTurn||s.runTurn===s.strengthTurn);
 const specificFamily=EVENT_PHASES.includes(context)&&goal.run.event?(goal.run.event.kind==='10K'?'TEN_K_SPECIFIC':'HALF_MARATHON_SPECIFIC'):'THRESHOLD';
 for(const q of qualityOptions.length?qualityOptions:[null])for(const perm of perms)for(const runFirst of sameTurnShared.length?[true,false]:[true]){
  const sessions=[];
  for(const d of runDays){const role=d===longDay?'LONG':d===q?'QUALITY':'EASY';sessions.push({id:'RUN-'+d,sport:'RUN',role,day:d,turn:turnOf(c,'RUN'),backToBackOrder:sameTurnShared.includes(d)?(runFirst?0:1):0,prescription:{modality:'RUN',family:role==='QUALITY'?specificFamily:role}});}
  const taken=new Set();
  strengthDays.forEach((d,i)=>{const t=templates.find(x=>x.type===perm[i]&&!taken.has(x.index))??templates[i];taken.add(t.index);sessions.push({id:'STR-'+d,sport:'STRENGTH',role:'STRENGTH_'+t.type,templateIndex:t.index,day:d,turn:turnOf(c,'STRENGTH'),backToBackOrder:sameTurnShared.includes(d)?(runFirst?1:0):0,prescription:{modality:'STRENGTH',exercises:t.rows.map(r=>({id:r.entry.id,pattern:r.pattern,sets:context==='ESTABLISHMENT'&&cap.strength.class==='NONE'?1:cap.strength.known.find(k=>k.id===r.entry.id)?.dose?.sets??(r.role==='MAIN'?3:2),load:{mode:r.entry.loading==='BODYWEIGHT'?'BODYWEIGHT':'ESTABLISH',unit:r.entry.loading==='BODYWEIGHT'?'BODYWEIGHT':'KG'}}))}});});
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
 for(const [context,choice] of Object.entries(choices)){
  const selected=(choice?.counterfactuals??[]).find(c=>c.selected),heavy=(selected?.costs??[]).filter(c=>['MODERATE','HIGH'].includes(c.severity));
  if(!heavy.length)continue;
  out.push({id:'ARRANGEMENT_COST_DISCLOSED',blocking:false,informational:true,context,costs:heavy.map(c=>({axis:c.axis,severity:c.severity,cause:c.cause})),detail:`In ${context.toLowerCase()} weeks this layout keeps ${[...new Set(heavy.map(c=>c.cause.charAt(0).toLowerCase()+c.cause.slice(1)))].join('; ')}. It was the least costly option on the chosen days and shifts.`,options:['Keep this layout','Swap the shifts on that day','Move one of the sessions to another chosen day']});
 }
 return out;
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
 return {week:w,phase,mode:st.mode,walkStep:Math.min(st.walkStep,sk.op.establishment.walkJogLadder.length-1),restart:st.restart,long:cons&&st.long!==null?Math.max(R.minimumSessionMinutes,st.long-R.consolidationLongRunReductionSteps*R.longRunStepMinutes):st.long,easy:st.easy,easyExtra:st.easyExtra??0,walks:st.walks,qualityStep:st.qualityStep,specificStep:st.specificStep,thresholdDone:st.thresholdDone,qualityActive:st.qualityRunner&&st.mode==='EASY'&&done>=(st.qualityNeeds??0),familiarStep:st.familiarStep??0,strides:stridesReady?Math.min(R.strides.maxRepetitions,R.strides.entryRepetitions+Math.floor((done-R.strides.requiresEstablishedEasyWeeks)/2)):0};
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
 if(st.mode==='RETURN'){const k=g('EASY');st.returnStep=Math.max(0,st.returnStep+STEP[k]);if(st.returnStep>=sk.op.return.moderateStepsToPrior){const to=st.returnTo;st.mode=to.mode;st.easy=to.easy;st.long=to.long;st.walks=to.walks??0;st.walkStep=to.walkStep??st.walkStep;st.restart=to.restart??st.restart;st.qualityStep=Math.max(0,(to.qualityStep??0)-1);st.specificStep=Math.max(0,(to.specificStep??0)-1);delete st.returnFrom;delete st.returnTo;delete st.returnStep;}return st;}
 if(st.mode==='WALK_JOG'){const k=g('WALK_JOG');st.walkStep=Math.max(0,st.walkStep+(phase==='CONSOLIDATION'&&k!=='REGRESS'?0:STEP[k]));if(st.walkStep>=ladder.length){const X=R.walkJogExit;st.mode='EASY';st.easy=Math.min(budget,X.easyMinutes);st.long=null;st.walks=Math.max(0,st.nEasy-X.maxRunsPerWeek);st.easyWeeksDone=0;st.stridesEligible=true;}}
 else if(st.mode==='RESTART'){const k=g('EASY'),X=R.restart;st.restart=Math.max(op.return.entryRunMinutes,st.restart+X.stepMinutes*STEP[k]);if(st.restart>=Math.min(budget,X.switchToEasyAtMinutes)){st.mode='EASY';st.easy=Math.min(budget,st.restart);st.long=st.hasLong?Math.min(longBudget,st.restart+X.longRunOffsetMinutes):null;st.easyWeeksDone=0;st.stridesEligible=true;
  // Running days stay at the restart frequency; the other chosen days keep walks and return one at a time at block starts.
  st.walks=Math.max(0,st.nEasy+(st.hasLong?1:0)-op.establishment.maxWalkJogDaysPerWeek);}}
 else if(st.mode==='EASY'){
  // When a cap (single-run ceiling, long-run share) trimmed this week's run, progression continues from what was prescribed.
  if(phase!=='CONSOLIDATION'&&st0.planned){if(st.long!==null&&Number.isFinite(P.long)&&P.long<row.long)st.long=P.long;if(st.easy!==null&&Number.isFinite(P.easy)&&P.easy<row.easy){st.easy=P.easy;st.easyExtra=0;}}
  if(g('LONG')==='REGRESS'&&st.long!==null)st.long=regressable(st.long);
  if(g('EASY')==='REGRESS'&&st.easy!==null)st.easy=regressable(st.easy);
  if(g('QUALITY')==='REGRESS'){if(phase==='SPECIFIC'&&st.specificStep>0)st.specificStep--;else st.qualityStep=Math.max(0,st.qualityStep-1);}
  // Executed weeks unlock quality and strides and set the achieved peaks the taper and redevelopment use.
  if(done('EASY')&&(!P.long||done('LONG'))&&phase!=='ESTABLISHMENT')st.easyWeeksDone=(st.easyWeeksDone??0)+1;
  if(P.long&&done('LONG'))st.achieved.long=Math.max(st.achieved.long??0,P.long);
  if(P.easy&&done('EASY'))st.achieved.easy=Math.max(st.achieved.easy??0,P.easy);
  if(P.strides&&done('EASY')){st.stridesDone=(st.stridesDone??0)+1;st.achieved.strides=Math.max(st.achieved.strides??0,P.strides);}
  if(P.quality&&done('QUALITY')){st.qualityDone=(st.qualityDone??0)+1;st.achieved.quality=clone(P.quality);}
  let smallReferenceStep=false;
  if(dev&&phase!=='CONSOLIDATION'){
   if(done('EASY'))st.devCount++;
   const blockStart=phase!=='SPECIFIC'&&st.walks>0&&st.devCount>1&&st.devCount%R.consolidationEveryNthDevelopmentWeek===1&&g('EASY')==='ADVANCE';
   if(blockStart)st.walks--;
   else{
    // Under a 50-minute reference a 5-minute step exceeds 10%: it is never combined with another session increase that week.
    const longBefore=st.long;if(st.long!==null&&st.long<target&&done('LONG'))st.long=Math.min(target,st.long+R.longRunStepMinutes);
    smallReferenceStep=st.long!==longBefore&&longBefore<50;
    // One easy session steps at a time (rotating), so weekly volume rises by about one step, never all easy runs at once.
    const running=Math.max(1,st.nEasy-st.walks);
    if(!smallReferenceStep&&st.easy!==null&&(g('EASY')==='EARNED'||g('EASY')==='ADVANCE'&&st.devCount%R.easyStepEveryDevelopmentWeeks===0)&&st.easy+R.easyStepMinutes<=Math.min(budget,(st.long??budget+5)-5)){st.easyExtra=(st.easyExtra??0)+1;if(st.easyExtra>=running){st.easy+=R.easyStepMinutes;st.easyExtra=0;}}
   }
   if(P.quality&&done('QUALITY')&&!smallReferenceStep){
    if(phase==='SPECIFIC'&&st.thresholdDone>=R.specificRequiresCompatibleThresholdSessions)st.specificStep++;
    else{st.qualityStep++;st.thresholdDone++;}
   }
  }
  if(next==='NEXT_BLOCK'&&!st.resumed){const N=op.event.nextBlock;st.resumed=true;if(st.long!==null)st.long=Math.max(R.minimumSessionMinutes,floor5((st.achieved.long??st.long)*N.longRunFractionOfAchievedPeak));if(st.easy!==null)st.easy=Math.max(R.minimumSessionMinutes,floor5((st.achieved.easy??st.easy)*N.easyFractionOfAchievedPeak));st.qualityStep=Math.max(0,st.qualityStep-N.qualityStepsBack);}
 }
 return st;
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
 const familiar=sk.cap.run.familiarQuality[0],fp=familiar?familiarQualityTask(familiar.prescription,R):null;
 if(fp&&row.qualityStep===(row.familiarStep??0)&&!specific&&fp.durationMinutes<=budget&&!validateR6Prescription({...fp,calibration:{basis:'CURRENT_FAMILIAR_TASK'}}).length)return {prescription:{...fp,calibration:{basis:'CURRENT_FAMILIAR_TASK',observedAt:familiar.observedAt}},progression:{dimension:'THRESHOLD_STEP',value:row.familiarStep??0,ladder:'FAMILIAR'},familiar:true};
 const p=qualityPrescription(specific?(ev.kind==='10K'?'TEN_K':'HALF_MARATHON'):'THRESHOLD',ladder[step],{cues:R.effortCues,warmup:R.qualityWarmupMinutes,cooldown:R.qualityCooldownMinutes,budget,firstExposure:specific?row.specificStep===0:row.qualityStep===0});
 return p?{prescription:p,progression:{dimension:specific?'SPECIFIC_STEP':'THRESHOLD_STEP',value:step,ladder:specific?ev.kind:'THRESHOLD'},familiar:false}:null;
}
function distributeRun(sk,row,roles,{ceiling=null,firstWeek=false,previousLong=null}={}){
 const {c,op}=sk,R=op.run,s=c.schedule,out={},cue=R.effortCues.EASY_CONVERSATIONAL;
 // Single-run ceiling: no planned run exceeds the longest recent completed run by more than one step.
 // Walks and walk/jog ladder steps keep the full session time: the ladder is the reviewed progression and walking is not running.
 const capped=x=>ceiling===null?x:Math.min(x,ceiling),budget=capped(s.runMinutes),longBudget=capped(s.longRunMinutes??s.runMinutes),fullBudget=s.runMinutes;
 const runDays=roles.filter(r=>r.sport==='RUN').sort((a,b)=>a.day-b.day);
 if(row.mode==='WALK_JOG'||row.mode==='RESTART'){
  const max=op.establishment.maxWalkJogDaysPerWeek,spaced=[];
  for(const r of runDays)if(spaced.length<max&&!spaced.some(x=>Math.abs(x.day-r.day)<2))spaced.push(r);
  for(const r of runDays)if(spaced.length<Math.min(max,runDays.length)&&!spaced.includes(r))spaced.push(r);
  for(const r of runDays){
   if(!spaced.includes(r)){out[r.id]={role:'WALK',prescription:walkPrescription(Math.min(fullBudget,op.establishment.walkSessionMinutes[0]),{reason:row.mode==='WALK_JOG'?'Chosen run day beyond the three walk/jog exposures supported in establishment: a brisk walk keeps the day without extra impact':'Restart: extra chosen run days stay as brisk walks until easy runs are observed'}),optional:true,converted:row.mode==='WALK_JOG'?'TOO_MANY_RUN_DAYS_FOR_ESTABLISHMENT':'RESTART_FREQUENCY'};continue;}
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
 if(quality&&qp)out[quality.id]={role:'QUALITY',prescription:qp,key:true,essential:true,progression:qProgress};
 const easyRoles=runDays.filter(r=>r.role==='EASY'||r.id===quality?.id&&!qp);
 const nextIsKey=r=>runDays.some(k=>(k.role==='LONG'||k.id===quality?.id&&qp)&&(k.day===r.day+1||r.day===6&&k.day===0));
 const optionalStrides=sk.cap.run.class==='EASY_LOW'||c.athlete.runExperience==='NOVICE';
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
  if(long.prescription.durationMinutes>bound)out[longRole.id]={...long,prescription:easyPrescription(Math.max(R.minimumSessionMinutes,bound),{family:'LONG',cue}),explanation:'Long run held within its share of the week until easy running grows'};
 }
 return out;
}
// ---------- Strength state machine ----------
export const goalDose=sk=>sk.op.strength.goalDoses[sk.goal.strength.kind]??sk.op.strength.goalDoses.GENERAL;
export function initialStrengthState(sk){
 const exercises={};
 for(const k of sk.cap.strength.known)exercises[k.id]={status:'ESTABLISHED',mode:'KNOWN',load:k.dose.load.value,convention:k.dose.load.convention,reps:k.dose.reps,sets:k.dose.sets,rir:k.dose.rir,loadTick:0,source:'CURRENT_FAMILIAR_KNOWN_DOSE'};
 return {exercises,devCount:0,completedBlocks:0};
}
/** Dose of one slot in week w from the exercise state and phase. */
function strengthDose(sk,ss,w,slot,entry,{firstOfWeek}){
 const {op,plan,cap}=sk,S=op.strength,E=op.event,g=goalDose(sk),phase=plan.phases[w],main=slot.role==='MAIN',[lo,hi]=g.repRange,ex=ss.exercises[entry.id];
 if(['RACE_WEEK','POST_EVENT'].includes(phase)&&!main)return {skip:true};
 if(!ex&&Object.values(ss.exercises).some(e=>e.returnStep===0)){const r=op.return;return {sets:r.strengthEntrySets,reps:g.reps,rir:r.strengthEntryMinimumRir,mode:entry.loading==='BODYWEIGHT'?'BODYWEIGHT':'ESTABLISH',establishment:entry.loading!=='BODYWEIGHT',note:'Return entry: lowest demand while capacity is re-established'};}
 if(!ex&&phase==='ESTABLISHMENT'&&cap.strength.class==='NONE'&&firstOfWeek){const u=op.establishment.unloadedPractice;return {practice:true,sets:u.sets,reps:u.reps,rir:u.minimumRir};}
 if(ex&&!Number.isInteger(ex.returnStep)&&Number.isInteger(ex.lastWeek)&&(w-ex.lastWeek-1)*7>op.return.moderateMaxDays&&entry.loading!=='BODYWEIGHT'){const e=op.establishment.effortGuidedLoad;return {sets:Math.min(main?g.sets:Math.max(1,g.sets-1),2),reps:main?g.reps:Math.min(15,g.reps+2),rir:Math.max(e.minimumRir,g.startRir),mode:'ESTABLISH',establishment:true,note:`Not done for more than ${op.return.moderateMaxDays} days: establish the load again by effort${ex.load!=null?`; do not exceed ${ex.load} ${ex.convention==='PER_HAND'?'kg per hand':'kg'}`:''}`};}
 if(ex&&Number.isInteger(ex.returnStep)){const r=op.return;if(ex.returnStep===0)return entry.loading==='BODYWEIGHT'?{sets:r.strengthEntrySets,reps:ex.reps??g.reps,rir:r.strengthEntryMinimumRir,mode:'BODYWEIGHT'}:{sets:r.strengthEntrySets,reps:ex.reps??g.reps,rir:r.strengthEntryMinimumRir,mode:'ESTABLISH',establishment:true,note:ex.load!==null&&ex.load!==undefined?'Return entry: choose a load that leaves at least '+r.strengthEntryMinimumRir+' reps in reserve; do not exceed the previous '+ex.load+' and do not restore it because days have passed':'Return entry: effort-guided load with at least '+r.strengthEntryMinimumRir+' reps in reserve'};const s1=Math.max(1,(ex.sets??(main?g.sets:Math.max(1,g.sets-1)))-1);if(entry.loading==='BODYWEIGHT')return {sets:s1,reps:ex.reps??g.reps,rir:3,mode:'BODYWEIGHT'};return ex.mode==='KNOWN'&&ex.returnLogged===true?{sets:s1,reps:ex.reps,rir:3,mode:'KNOWN',value:ex.load,convention:ex.convention,note:'Return step 2: the load logged at the return entry, at fewer sets than before the break'}:{sets:s1,reps:ex.reps??g.reps,rir:3,mode:'FROM_LOG',rule:`Use the load you logged at the return entry; no increase yet${ex.load!=null?`; never above the previous ${ex.load}`:''}`};}
 let sets=ex?.sets??(main?g.sets:Math.max(1,g.sets-1)),reps=main?g.reps:Math.min(15,g.reps+2),rir=g.startRir;
 const firstDevBlock=sk.blocks.find(b=>['BUILD','DEVELOPMENT'].includes(b.family));
 if(cap.strength.class==='NONE'&&firstDevBlock&&w>=firstDevBlock.startWeek&&w<firstDevBlock.endWeekExclusive)sets=Math.min(sets,2);
 if(S.addSetAtBlockBoundary&&(ex?.blocksDone??0)>0&&g.mode!=='HOLD')sets=Math.max(sets,Math.min(main?g.maxSets:Math.max(1,g.maxSets-1),sets+1));
 if(phase==='CONSOLIDATION')sets=Math.max(1,sets-S.consolidationSetReduction);
 if(phase==='SPECIFIC'){sets=Math.max(1,sets-1);rir=Math.max(3,rir);}
 if(phase==='TAPER'){sets=Math.max(1,Math.round(Math.max(1,sets-1)*E.taperStrengthSetFraction));rir=Math.max(3,rir);}
 if(['RACE_WEEK','POST_EVENT'].includes(phase)){sets=phase==='RACE_WEEK'?E.raceWeekStrengthSets:E.postEventStrengthSets;rir=E.raceWeekStrengthMinimumRir;}
 const hold=['SPECIFIC','TAPER','RACE_WEEK','POST_EVENT','CONSOLIDATION'].includes(phase);
 if(entry.loading==='BODYWEIGHT')return {sets:ex?sets:Math.min(sets,2),reps:ex?.reps??reps,rir:Math.max(3,rir),mode:'BODYWEIGHT',establishment:!ex};
 if(!ex){
  const e=op.establishment.effortGuidedLoad,hint=cap.strength.loadHints[entry.id];
  return {sets:Math.min(sets,cap.strength.class==='NONE'&&phase==='ESTABLISHMENT'?e.sets:2),reps:cap.strength.class==='NONE'&&phase==='ESTABLISHMENT'?e.reps:reps,rir:Math.max(e.minimumRir,rir),mode:'ESTABLISH',establishment:true,note:hint?`An earlier ${hint.value} ${hint.unit} at another rep target is a starting hint only`:null};
 }
 if(ex.mode==='KNOWN')return {sets,reps:g.mode==='LOAD'?Math.min(ex.reps,hi):Math.min(ex.reps,hi),rir:Math.max(rir,2),mode:'KNOWN',value:ex.load,convention:ex.convention,note:hold?'No load increase in this phase':null};
 const rule=ex.ceiling!=null&&ex.source==='RE_ESTABLISHED'?`Use the load you established last time; never above the previous ${ex.ceiling} until a new log supports it`:hold?'Use the last logged load; no increase in this phase':g.mode==='LOAD'?`If every set reached ${g.reps} reps with at least ${g.targetRir} in reserve, add the smallest available increment; otherwise repeat`:g.mode==='HOLD'?'Keep the logged load while reps in reserve hold':`Add ${S.repStep} reps per set while at least ${g.targetRir} reps stay in reserve, up to ${hi}; then add the smallest increment and return to ${lo}`;
 return {sets,reps:ex.reps??reps,rir,mode:'FROM_LOG',rule};
}
/** Transition after week w for exercises used that week. gate per exercise id or 'STRENGTH'. Logged loads replace planned ones before the gate.
 * A step needs a logged set at the current load in the gating week; a conditional projection assumes the planned logs. */
export function advanceStrength(sk,ss0,w,used,gate={},logged={},{assumeLogged=false}={}){
 const {op,plan,blocks}=sk,S=op.strength,g=goalDose(sk),phase=plan.phases[w],[lo,hi]=g.repRange,ss=clone(ss0),dev=DEVELOPMENT.includes(phase),blockEnd=blocks.some(b=>DEVELOPMENT.includes(b.family)&&b.endWeekExclusive===w+1);
 for(const u of [...new Map(used.map(x=>[x.id,x])).values()]){
  let ex=ss.exercises[u.id];
  if(!ex)ex=ss.exercises[u.id]={status:'ESTABLISHED',mode:u.mode==='BODYWEIGHT'?'BODYWEIGHT':u.mode==='KNOWN'?'KNOWN':'FROM_LOG',load:u.mode==='KNOWN'?u.value:null,convention:u.convention??null,reps:u.reps,sets:u.mode==='KNOWN'?u.sets:null,rir:u.rir,loadTick:0,source:'PLANNED_ESTABLISHMENT'};
  else if(u.mode==='ESTABLISH'&&ex.mode==='KNOWN'&&!Number.isInteger(ex.returnStep)){ex.ceiling=ex.load;ex.mode='FROM_LOG';ex.source='RE_ESTABLISHED';}
  ex.lastWeek=w;
  if(u.practice)continue;
  const log=logged[u.id];
  if(log&&Number.isFinite(log.load)){ex.mode='KNOWN';ex.load=log.load;ex.convention=log.convention??ex.convention??catalogueEntry(u.id)?.convention??'TOTAL';ex.reps=log.reps??ex.reps;ex.source='LOGGED_ACTUAL';delete ex.ceiling;if(Number.isInteger(ex.returnStep))ex.returnLogged=true;}
  const k=gate[u.id]??gate.STRENGTH??gate.ALL??'ADVANCE',step=S.smallestIncrement[ex.convention]??0,evidence=assumeLogged||!!log,executed=['ADVANCE','EARNED'].includes(k)&&evidence;
  if(blockEnd&&executed)ex.blocksDone=(ex.blocksDone??0)+1;
  if(Number.isInteger(ex.returnStep)){if(k==='REGRESS')ex.returnStep=Math.max(0,ex.returnStep-1);else if(executed)ex.returnStep++;if(ex.returnStep>=2){delete ex.returnStep;delete ex.returnLogged;}continue;}
  if(k==='REGRESS'){if(ex.mode==='KNOWN'&&ex.load>=step&&step>0)ex.load=Math.round((ex.load-step)*10)/10;else ex.reps=Math.max(lo,(ex.reps??lo)-S.repStep);continue;}
  if(!dev||!executed)continue;
  // One step per week; EARNED may release the load tick but never adds a second step.
  if(ex.mode==='BODYWEIGHT'){ex.reps=Math.min(hi+4,(ex.reps??lo)+S.repStep);continue;}
  if(ex.mode!=='KNOWN'||g.mode==='HOLD')continue;
  if(g.mode==='LOAD'){ex.loadTick=(ex.loadTick??0)+1;if(k==='EARNED'||ex.loadTick%2===0){ex.load=Math.round((ex.load+step)*10)/10;ex.loadTick=0;}}
  else if((ex.reps??lo)+S.repStep<=hi)ex.reps=(ex.reps??lo)+S.repStep;else{ex.load=Math.round((ex.load+step)*10)/10;ex.reps=Math.max(lo,Math.min(hi,ex.repsBase??lo));}
 }
 if(dev)ss.devCount++;
 return ss;
}
function strengthRowsFor(sk,template,w,ss,{firstOfWeek}){
 const {op,goal}=sk,S=op.strength,rows=[],used=[],returning=Object.values(ss.exercises).some(e=>Number.isInteger(e.returnStep)),rotation=returning?{}:sk.rotation(w,template);
 for(const r of template.rows){
  const entryId=rotation[r.slot]??r.entry.id,entry=catalogueEntry(entryId)??r.entry;
  const restKey=r.role==='MAIN'?(goal.strength.kind==='STRENGTH'?'MAIN_STRENGTH_GOAL':'MAIN'):'ACCESSORY',common={restSeconds:S.restSeconds[restKey],preparationMinutes:S.preparationMinutes[r.role==='MAIN'?'MAIN':'ACCESSORY']};
  const dose=strengthDose(sk,ss,w,r,entry,{firstOfWeek});
  if(dose.skip)continue;
  if(dose.practice){const practice=catalogueEntry(PRACTICE_ID[r.pattern])??entry;rows.push(exerciseRow(practice,{sets:dose.sets,reps:dose.reps,rir:dose.rir,mode:'BODYWEIGHT',restSeconds:S.restSeconds.PRACTICE,preparationMinutes:S.preparationMinutes.PRACTICE,establishment:true,note:'Movement practice: learn the pattern; this is not a strength test'}));used.push({id:practice.id,practice:true});continue;}
  rows.push(exerciseRow(entry,{...common,sets:dose.sets,reps:dose.reps,rir:Math.max(2,dose.rir),mode:dose.mode,value:dose.value??null,convention:dose.convention??null,establishment:!!dose.establishment,rule:dose.rule??null,note:dose.note??null}));
  used.push({id:entry.id,mode:dose.mode,value:dose.value??null,convention:dose.convention??entry.convention,reps:dose.reps,sets:dose.sets,rir:dose.rir});
 }
 return {rows,used};
}
function eventWeekSessions(sk,w,roles,{achieved={},walks=0,ceiling=null}={}){
 const {c,op,plan,goal}=sk,R=op.run,E=op.event,ev=goal.run.event,out={},phase=plan.phases[w],raceDay=plan.raceDay,cue=R.effortCues.EASY_CONVERSATIONAL;
 const capped=x=>ceiling===null?x:Math.min(x,ceiling),budget=capped(c.schedule.runMinutes),qualityOk=allows(sk.authority,'R6-RUN-QUALITY');
 const walkSet=walkDays(roles,walks),runs=roles.filter(r=>r.sport==='RUN'),strides=qualityOk&&(achieved.strides??0)>0;
 const easyMinutes=fraction=>Math.min(budget,Math.max(R.minimumSessionMinutes,roundTo5((achieved.easy||R.minimumSessionMinutes)*fraction)));
 const walk=()=>({role:'WALK',prescription:walkPrescription(Math.min(c.schedule.runMinutes,E.keptWalkMinutes)),optional:true,converted:'KEPT_FROM_BUILD'});
 const kindOf=family=>family==='TEN_K_SPECIFIC'?'TEN_K':family==='HALF_MARATHON_SPECIFIC'?'HALF_MARATHON':'THRESHOLD';
 if(phase==='TAPER'){
  const f=ev.kind==='10K'?E.taperWeekRunVolumeRange[1]:mid(E.taperWeekRunVolumeRange);
  for(const r of runs){
   if(walkSet.has(r.id)){out[r.id]=walk();continue;}
   if(r.role==='LONG'&&achieved.long){out[r.id]={role:'LONG',prescription:easyPrescription(Math.min(budget,Math.max(R.minimumSessionMinutes,roundTo5(achieved.long*mid(E.taperWeekLongRunRange)))),{family:'LONG',cue}),key:true,essential:true,explanation:'Taper: shorter long run relative to the achieved peak'};continue;}
   if(r.role==='QUALITY'&&qualityOk&&achieved.quality?.work){const q=achieved.quality,work=reducedWork(q.work,E.taperQualityWorkRange,E.reducedWorkMinimums);const p=qualityPrescription(kindOf(q.family),{repetitions:work.repetitions,workMinutes:work.workMinutes,recoveryMinutes:q.work.recoveryMinutes},{cues:R.effortCues,warmup:R.qualityWarmupMinutes,cooldown:R.qualityCooldownMinutes,budget});if(p){out[r.id]={role:'QUALITY',prescription:p,key:true,essential:true,explanation:'Taper: same effort, less work than the achieved peak session'};continue;}}
   out[r.id]={role:'EASY',prescription:easyPrescription(easyMinutes(f),{cue,strides:strides?{repetitions:Math.max(R.strides.entryRepetitions,achieved.strides-1),workSeconds:R.strides.workSeconds,recoverySeconds:R.strides.recoverySeconds}:null})};
  }
  return out;
 }
 if(phase==='RACE_WEEK'){
  const before=d=>raceDay-d,touch=qualityOk&&achieved.quality?runs.filter(r=>before(r.day)>=E.raceWeekTouchMinDaysBeforeRace&&!walkSet.has(r.id)).sort((a,b)=>b.day-a.day)[0]:null;
  for(const r of runs){
   const b=before(r.day);
   if(b===0)continue;
   if(b<0){out[r.id]=b===-1?{role:'REST_BY_DESIGN',prescription:null,optional:true,explanation:'Day after the race: rest or an easy walk; no running is planned'}:{role:'RECOVERY_EASY',prescription:easyPrescription(Math.min(budget,E.postEventEasyMinutes[0]),{family:'RECOVERY_EASY',cue}),optional:true,explanation:'Optional easy run by feel after the race; skip it if anything feels off'};continue;}
   if(walkSet.has(r.id)){out[r.id]=walk();continue;}
   if(b===1){out[r.id]={role:'SHAKEOUT',prescription:{...easyPrescription(Math.min(budget,E.shakeoutMinutes[0]),{family:'SHAKEOUT',cue,strides:strides?{repetitions:Math.min(E.shakeoutStrideRepetitions,achieved.strides),workSeconds:R.strides.workSeconds,recoverySeconds:R.strides.recoverySeconds}:null}),optionalByDesign:true},optional:true,explanation:'Optional short shakeout the day before the race'};continue;}
   if(r===touch){const p=qualityPrescription('TOUCH',E.raceWeekTouch[ev.kind],{cues:R.effortCues,warmup:R.qualityWarmupMinutes,cooldown:R.qualityCooldownMinutes,budget,touchCue:ev.kind==='10K'?'TEN_K_EFFORT':'HALF_MARATHON_EFFORT'});if(p){out[r.id]={role:'RACE_TOUCH',prescription:p,key:true,essential:false,explanation:'Brief race-effort touch to stay sharp; only work already done in the build'};continue;}}
   out[r.id]={role:'EASY',prescription:easyPrescription(easyMinutes(mid(E.raceWeekRunVolumeRange)),{cue})};
  }
  return out;
 }
 const since=d=>7-raceDay+d;
 for(const r of runs)out[r.id]=since(r.day)<E.postEventFirstRunMinDaysAfterRace?{role:'REST_BY_DESIGN',prescription:null,optional:true,explanation:'Too soon after the race: rest or walk'}:{role:'RECOVERY_EASY',prescription:easyPrescription(Math.min(budget,E.postEventEasyMinutes[since(r.day)>=4?1:0]),{family:'RECOVERY_EASY',cue}),optional:true,explanation:'Easy and optional; stop and report pain, illness or unusual fatigue'};
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
/** Builds one week from the run row, the strength state and the context arrangement. */
export function buildWeek(sk,w,rs,ss,priorWeeks,{arrangementOverride=null,equipmentOverride=null,runCeiling=null,firstWeek=false}={}){
 const {c,op,plan,goal,blocks}=sk,s=c.schedule,phase=plan.phases[w],context=contextOf(plan.phases,w),arr=arrangementOverride??sk.arrangement[context]??Object.values(sk.arrangement)[0];
 const row=runRow(sk,rs,w),roles=clone(arr?.sessions??[]);
 const runOut=['TAPER','RACE_WEEK','POST_EVENT'].includes(phase)?eventWeekSessions(sk,w,roles,{achieved:rs.achieved??{},walks:peakOf(priorWeeks).walks,ceiling:runCeiling}):distributeRun(sk,row,roles,{ceiling:runCeiling,firstWeek,previousLong:previousBuildLong(priorWeeks)});
 if(firstWeek)firstWeekGuard(sk,runOut);
 const blockId=blocks.find(b=>w>=b.startWeek&&w<b.endWeekExclusive)?.id,sessions=[],used=[];let firstStrength=true,strengthState=ss;
 const templates=equipmentOverride?sk.templatesFor(equipmentOverride):sk.templates;
 for(const r of roles.sort((a,b)=>a.day-b.day||a.backToBackOrder-b.backToBackOrder)){
  const common={id:`w${w}-${r.sport==='RUN'?'run':'str'}-d${r.day}`,weekIndex:w,day:r.day,date:onDate(c.startDate,w*7+r.day),turn:r.turn??null,sport:r.sport,backToBackOrder:r.backToBackOrder,blockId};
  if(r.sport==='RUN'){
   const x=runOut[r.id];if(!x)continue;
   sessions.push({...common,role:x.role,key:!!x.key,essential:!!x.essential,optional:!!x.optional,prescription:x.prescription,progression:x.progression??null,explanation:x.explanation??(x.converted?x.prescription.instructions[0]:null),converted:x.converted??null,status:'PLANNED',plannedPrescriptionHash:x.prescription?hash(x.prescription):null,...(arr?.orderFlexible&&s.sharedDays.includes(r.day)?{orderFlexible:true}:{})});
   continue;
  }
  const t=(equipmentOverride?templates:sk.templatesForDate?sk.templatesForDate(common.date):templates)[r.templateIndex];
  if(phase==='RACE_WEEK'){const before=plan.raceDay-r.day;if(before<op.event.raceWeekStrengthMinDaysBeforeRace||sessions.some(x=>x.sport==='STRENGTH'&&x.prescription)){sessions.push(restByDesign(common,before>=0?'Race week: no strength in the final days before the race':'Strength resumes after the post-event check'));continue;}}
  if(phase==='POST_EVENT'){const since=7-plan.raceDay+r.day;if(since<op.event.postEventFirstRunMinDaysAfterRace||sessions.some(x=>x.sport==='STRENGTH'&&x.prescription)){sessions.push(restByDesign(common,'Post-event week: one light strength session is enough; this day is rest or mobility by design'));continue;}}
  const built=t?strengthRowsFor(sk,t,w,strengthState,{firstOfWeek:firstStrength}):{rows:[],used:[]};firstStrength=false;
  const fitted=built.rows.length?fitStrengthSession(built.rows,{budget:s.strengthMinutes,warmup:op.strength.warmupMinutes,cooldown:op.strength.cooldownMinutes,secondsPerRep:op.strength.secondsPerRep,maxExercises:s.strengthMinutes<35?op.strength.maxExercises.MAIN_ONLY_BUDGET:op.strength.maxExercises.DEFAULT,minimumExercises:Math.min(2,built.rows.length)}):null;
  if(!fitted){sessions.push(restByDesign(common,'The chosen time cannot hold a supported strength session; more time on this day is needed'));continue;}
  const fittedIds=new Set(fitted.map(e=>e.id)),usedNow=built.used.filter(u=>fittedIds.has(u.id));used.push(...usedNow);
  // Exercises established earlier in the same week are established for the later sessions of that week.
  strengthState=clone(strengthState);for(const u of usedNow)if(!u.practice&&!strengthState.exercises[u.id])strengthState.exercises[u.id]={status:'ESTABLISHED',mode:u.mode==='BODYWEIGHT'?'BODYWEIGHT':u.mode==='KNOWN'?'KNOWN':'FROM_LOG',load:u.mode==='KNOWN'?u.value:null,convention:u.convention??null,reps:u.reps,sets:u.mode==='KNOWN'?u.sets:null,rir:u.rir,loadTick:0,source:'PLANNED_ESTABLISHMENT'};
  const family=['RACE_WEEK','POST_EVENT','TAPER'].includes(phase)?'MAINTENANCE':fitted.every(e=>e.load.mode==='BODYWEIGHT'&&e.establishment)?'PRACTICE':t.family;
  const p=strengthPrescription(family,fitted,{budget:s.strengthMinutes,warmup:op.strength.warmupMinutes,cooldown:op.strength.cooldownMinutes,secondsPerRep:op.strength.secondsPerRep,goalMode:goalDose(sk).mode,instructions:phase==='RACE_WEEK'?['Race week: one short session to keep the movement pattern; nothing new or heavy']:phase==='TAPER'?['Taper: fewer sets at familiar loads; no new exercises or heavier loads']:[]});
  const heavy=fitted.some(e=>e.region==='LOWER'&&['HEAVY','MODERATE'].includes(e.lowerDemand)&&e.sets>=2);
  sessions.push({...common,role:'STRENGTH_'+t.type,key:heavy&&t.rows.some(x=>x.role==='MAIN'&&['SQUAT','HINGE'].includes(x.pattern)),essential:true,optional:false,prescription:p,status:'PLANNED',plannedPrescriptionHash:hash(p),templateType:t.type,...(arr?.orderFlexible&&s.sharedDays.includes(r.day)?{orderFlexible:true,explanation:'Either order on this day: the two sessions carry no interference difference'}:{})});
 }
 if(phase==='RACE_WEEK'){
  const onChosen=s.runDays.includes(plan.raceDay),race=racePrescription(goal.run.event,{cues:op.run.effortCues,raceDay:op.event.raceDay});
  sessions.push({id:`w${w}-race`,weekIndex:w,day:plan.raceDay,date:onDate(c.startDate,w*7+plan.raceDay),turn:null,sport:'RUN',role:'RACE',key:true,essential:true,optional:false,prescription:race,status:'PLANNED',plannedPrescriptionHash:hash(race),explanation:onChosen?'Race day':'Race day is the athlete’s own event date, outside the usual run days',blockId});
  sessions.sort((a,b)=>a.day-b.day||(a.backToBackOrder??0)-(b.backToBackOrder??0));
 }
 const run=sessions.filter(x=>x.sport==='RUN'&&x.prescription&&x.role!=='RACE'&&x.prescription.family!=='WALK');
 const week={index:w,startDate:onDate(c.startDate,w*7),blockId,phase,status:'CONDITIONAL',conditional:true,contextualPriority:goal.priorityByPhase[phase==='CONSOLIDATION'?context:phase]??null,arrangementId:arr?.id??null,sessions,restDays:[0,1,2,3,4,5,6].filter(d=>!sessions.some(x=>x.day===d&&x.prescription)),plannedRunMinutes:run.reduce((n,x)=>n+x.prescription.durationMinutes,0),plannedStrengthSets:sessions.filter(x=>x.sport==='STRENGTH'&&x.prescription).reduce((n,x)=>n+x.prescription.exercises.reduce((m,e)=>m+e.sets,0),0),progressionGate:w===0?{requires:'NONE_FIRST_WEEK',note:'The first week does not exceed current practice'}:{requires:'PREVIOUS_COMPARABLE_SESSIONS_EXECUTED_WITHOUT_ADVERSE_RESPONSE',fallback:'REPEAT_PREVIOUS_DOSE',regression:'REPEATED_ADVERSE_REGRESSES_ONE_STEP'},intent:BLOCK_INTENT[phase]};
 return {week,used};
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
 return {long:long?long.prescription.durationMinutes:null,easy:easy.length?Math.max(...easy.map(s=>s.prescription.durationMinutes)):null,quality:quality?{family:quality.prescription.family,work:clone(quality.prescription.work)}:null,strides:Math.max(0,...easy.map(s=>s.prescription.strides?.repetitions??0))};
}
/** Projects weeks [fromWeek, N) from start states; later transitions assume ADVANCE (planning, not prediction). */
export function projectWeeks(sk,fromWeek,{runState,strengthState},priorWeeks=[],options={}){
 const weeks=[],states=[],C=sk.op.run.singleRunCeiling,history=[...(options.completedRuns??[])];let rs=runState,ss=strengthState;
 for(let w=fromWeek;w<sk.c.weeks;w++){
  // Earlier projected weeks count as executed (conditional plan); the first projected week uses completed runs only.
  const start=onDate(sk.c.startDate,w*7),recent=history.filter(h=>dayGap(h.date,start)>0&&dayGap(h.date,start)<=C.windowDays).map(h=>h.minutes);
  const runCeiling=recent.length?Math.max(...recent)+C.stepMinutes:w===fromWeek?(options.coldStart?options.initialCeiling??null:sk.op.return.entryRunMinutes):null;
  const {week,used}=buildWeek(sk,w,rs,ss,[...priorWeeks,...weeks],{...options,runCeiling,firstWeek:!!options.coldStart&&w===0});
  weeks.push(week);
  for(const s of week.sessions){const m=runMinutesOf(s);if(m)history.push({date:s.date,minutes:m});}
  rs={...rs,planned:plannedOf(week)};
  states.push({run:rs,strength:ss});
  rs=advanceRun(sk,rs,w);ss=advanceStrength(sk,ss,w,used,{},{},{assumeLogged:true});
 }
 return {weeks,states};
}
export function validateWeeks(sk,weeks){
 const {c,cap,goal,plan}=sk,s=c.schedule,errors=[];
 for(const wk of weeks)for(const x of wk.sessions){
  if(!x.prescription)continue;
  const v=validateR6Prescription(x.prescription);if(v.length)errors.push(x.id+':'+v.join(','));
  if(x.role!=='RACE'&&x.sport==='RUN'&&!s.runDays.includes(x.day))errors.push(x.id+':notChosenRunDay');
  if(x.sport==='STRENGTH'&&!s.strengthDays.includes(x.day))errors.push(x.id+':notChosenStrengthDay');
  const limit=x.sport==='RUN'?(x.role==='LONG'?s.longRunMinutes??s.runMinutes:s.runMinutes):s.strengthMinutes;
  if(x.role!=='RACE'&&x.prescription.durationMinutes>limit)errors.push(x.id+':exceedsChosenTime');
 }
 for(const wk of weeks){
  if(cap.run.programmed)for(const d of s.runDays)if(!wk.sessions.some(x=>x.sport==='RUN'&&x.day===d))errors.push(`w${wk.index}:chosenRunDayEmpty:${d}`);
  if(cap.strength.programmed)for(const d of s.strengthDays)if(!wk.sessions.some(x=>x.sport==='STRENGTH'&&x.day===d))errors.push(`w${wk.index}:chosenStrengthDayEmpty:${d}`);
 }
 if(goal.run.event&&weeks.some(w=>w.index===plan.raceWeek)&&!weeks.find(w=>w.index===plan.raceWeek).sessions.some(x=>x.role==='RACE'))errors.push('raceWeekMissing');
 if(!allows(sk.authority,'R6-LOAD-ESTABLISHMENT'))for(const wk of weeks)for(const x of wk.sessions)if(x.sport==='STRENGTH'&&x.prescription)for(const e of x.prescription.exercises)if(e.load.mode==='ESTABLISH'||e.role==='PRACTICE')errors.push(x.id+':establishmentWithoutAuthority:'+e.id);
 return errors;
}
/** Rebuilds the deterministic skeleton (context) of a stored program for projection; authority is re-resolved, never stored. */
export function skeletonOf(program,authority){
 const op=authority.policy.operational,sk={c:program.canonical,cap:program.capability,goal:program.goal,plan:program.phases,blocks:program.blocks,op,authority,templates:program.templates,arrangement:program.arrangementSessions};
 sk.templatesFor=equipment=>strengthTemplates({...sk.c,athlete:{...sk.c.athlete,equipment}},sk.goal,{equipment,knownOnly:!allows(authority,'R6-LOAD-ESTABLISHMENT')}).map((t,i)=>({...t,index:i}));
 const windows=sk.c.equipmentWindows??[],cache=new Map();
 sk.templatesForDate=date=>{const win=windows.find(x=>date>=x.from&&(!x.to||date<=x.to));if(!win)return sk.templates;const key=hash(win.equipment);if(!cache.has(key))cache.set(key,sk.templatesFor(win.equipment));return cache.get(key);};
 const rot=op.rotation[sk.c.athlete.strengthPreferences.rotation]??op.rotation.COACH_DECIDES;
 sk.rotation=(w,template)=>{
  if(!allows(authority,'R6-ROTATION')||!rot.everyWeeks||rot.scope==='NONE')return {};
  let turns=0;for(let i=1;i<=w;i++)if(i%rot.everyWeeks===0&&![...op.rotation.deferInPhases,'ESTABLISHMENT'].includes(sk.plan.phases[i]))turns++;
  return turns?Object.fromEntries(template.rows.filter(r=>r.role==='ACCESSORY'&&r.alternatives.length).map(r=>[r.slot,[r.entry.id,...r.alternatives][turns%(r.alternatives.length+1)]])):{};
 };
 return sk;
}
/** Generates a complete conditional program from onboarding-like input. Never requires a prebuilt week or a static priority. */
export function generateProgram(input,options={}){
 const intake=canonicalizeIntake(input),authority=r6Authority(options),op=authority.policy?.operational;
 const base={runtimeVersion:'R6-1',mode:'SHADOW',inputHash:hash(input??null),program:null,applied:false,officialPlanState:clone(input?.officialPlanState??null),appliedState:clone(input?.officialPlanState??null),completedWork:clone(input?.completedWork??[]),missingInputs:[...intake.missing],errors:[...intake.errors],uncertainty:clone(intake.uncertainty),negotiation:clone(intake.negotiation),horizonsConsidered:['H0_SESSION','H1_WEEK','H2_BLOCK','H3_GOAL_EVENT'],qualityAssessment:{assessor:'RUNTIME_SELF_CHECK',independent:false,class:'UNREVIEWED'}};
 const reject=(status,reason,extra={})=>freeze({...base,status,reason,...extra});
 if(intake.status==='CLINICAL_HUMAN_REQUIRED')return reject('CLINICAL_HUMAN_REQUIRED','Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted');
 if(intake.status==='UNSUPPORTED')return reject('UNSUPPORTED','Outside the V1 coaching population or event scope: '+intake.scope,{scope:intake.scope});
 if(intake.status==='INVALID_INPUT')return reject('INVALID_INPUT','Input facts are malformed or contradictory');
 if(intake.status==='ASK')return reject('ASK','Only facts that change the first program are asked; everything else is established or learned',{missingInputs:intake.missing});
 if(!op||!allows(authority,'R6-COLD-START')||!allows(authority,'R6-PLANNED-PROGRESSION'))return reject('UNSUPPORTED','Current independent cold-start/progression authority is unavailable; no program is generated');
 const c=intake.canonical,s=c.schedule,cap=assessCapability(c),goal=buildGoalModel(c),plan=planPhases(c,cap,op),blocks=blocksFrom(plan.phases,goal.priorityByPhase);
 if(cap.strength.programmed&&cap.strength.class!=='KNOWN_LOAD'&&!allows(authority,'R6-LOAD-ESTABLISHMENT'))return reject('UNSUPPORTED','Load-establishment authority is unavailable; unknown strength loads cannot be established');
 if(goal.run.event&&!allows(authority,'R6-EVENT-TRANSITION'))return reject('UNSUPPORTED','Event-transition authority is unavailable; an event program would leave the race week unsupported');
 if(cap.restartAfterPause&&!allows(authority,'R6-NONCLINICAL-RETURN'))return reject('UNSUPPORTED','Nonclinical-return authority is unavailable; a restart after a pause cannot be programmed');
 const negotiation=[...base.negotiation],gaps=[];
 const templates=cap.strength.programmed?strengthTemplates(c,goal,{knownOnly:!allows(authority,'R6-LOAD-ESTABLISHMENT')}):[];
 const sk={c,cap,goal,plan,blocks,op,authority,templates,arrangement:{}};
 const program0={canonical:c,capability:cap,goal,phases:plan,blocks,templates,arrangementSessions:{}};
 Object.assign(sk,skeletonOf(program0,authority),{templates,arrangement:{}});
 if(templates.some(t=>t.rows.length<2))negotiation.push({id:'EQUIPMENT_LIMITS_STRENGTH_SESSION',blocking:false,detail:'Available equipment supports fewer than two patterns in a session; bodyweight practice fills the gap',options:['Add equipment','Accept bodyweight practice']});
 const missingPatterns=[...new Set(templates.flatMap(t=>t.missingPatterns))];
 if(missingPatterns.length)negotiation.push({id:'MOVEMENT_PATTERN_UNAVAILABLE',blocking:false,informational:true,patterns:missingPatterns,detail:'No available equipment supports these patterns; sessions keep the patterns that can be loaded',options:['Add a band or bar','Accept the gap']});
 const severityAuthority=allows(authority,'R6-HYBRID-ARRANGEMENT'),arrangementTrace={},choices={};let previousId=null;
 for(const context of [...new Set(plan.phases.map((p,w)=>contextOf(plan.phases,w)))]){
  const candidates=arrangementCandidates(c,cap,goal,context,sk,templates),lead=goal.priorityByPhase[context]?.lead??goal.baseLead;
  const choice=chooseBalanced(candidates,{lead,temporaryPreference:goal.temporaryPreference,severityAuthority,currentId:previousId,hybrid:op.hybrid,context:{eventPhase:EVENT_PHASES.includes(context),strengthDevelopment:goal.strength.development,runDevelopment:goal.run.development,runRole:goal.run.kind==='NONE'?'MAINTAIN':'PRIMARY',strengthRole:EVENT_PHASES.includes(context)||goal.strength.kind==='MAINTAIN'?'MAINTAIN':'PRIMARY'}});
  arrangementTrace[context]={lead,basis:choice.basis,reason:choice.reason,selectedId:choice.selected?.id??null,paretoIds:choice.paretoIds,candidateCount:candidates.length,counterfactuals:choice.counterfactuals.filter(x=>x.selected||choice.paretoIds.includes(x.id)).slice(0,8)};
  if(choice.askRequired)return reject('ASK','Genuine run/strength arrangement trade-off with equal worst-case joint harm; a temporary preference is needed',{missingInputs:['schedule.temporaryPreference'],question:choice.question,trace:{capability:cap,goalModel:goal,phases:plan,arrangement:arrangementTrace}});
  sk.arrangement[context]=choice.selected;previousId=choice.selected?.id??previousId;choices[context]=choice;
 }
 const runState=initialRunState(sk),strengthState=initialStrengthState(sk),{weeks,states}=projectWeeks(sk,0,{runState,strengthState},[],{coldStart:true,initialCeiling:['EASY_CURRENT','QUALITY_FAMILIAR','EASY_LOW'].includes(cap.run.class)?cap.run.longestMinutes??null:null});
 if(cap.run.programmed&&cap.run.class==='WALK_JOG'&&s.runDays.length>op.establishment.maxWalkJogDaysPerWeek)negotiation.push({id:'TOO_MANY_RUN_DAYS_FOR_ESTABLISHMENT',blocking:false,detail:`${s.runDays.length} run days chosen; establishment supports up to ${op.establishment.maxWalkJogDaysPerWeek} walk/jog exposures, so the other chosen days carry brisk walks`,options:['Keep the walks on those days','Choose fewer run days']});
 if(runState.walks>0&&cap.run.class!=='WALK_JOG')negotiation.push({id:'TOO_MANY_RUN_DAYS_FOR_CURRENT_PRACTICE',blocking:false,detail:`Current running (${cap.run.weeklyMinutes??'unknown'} min/week) is spread over fewer runs; ${runState.walks} chosen run day(s) carry brisk walks and convert to runs at block starts when responses allow`,options:['Keep the plan','Choose fewer run days','Report more current running']});
 const target=runTarget(sk);
 if(goal.run.event){
  const minimumDays=goal.run.event.kind==='HALF_MARATHON'?3:2;
  if(s.runDays.length<minimumDays)negotiation.push({id:'TOO_FEW_RUN_DAYS_FOR_EVENT',blocking:false,detail:`${s.runDays.length} run day(s) for a ${goal.run.event.kind}; the trajectory stays conservative and completion-focused`,options:['Add a run day','Keep the days with a completion goal','Choose a later or shorter event']});
  if((s.longRunMinutes??s.runMinutes)<op.run.longRunTargets[goal.run.event.kind])negotiation.push({id:'LONG_RUN_TIME_LIMITS_EVENT',blocking:false,detail:`Long-run time is limited to ${s.longRunMinutes??s.runMinutes} minutes`,options:['More time on the long-run day','Keep the current time with a completion goal']});
  if(['WALK_JOG','RESTART'].includes(cap.run.class))negotiation.push({id:'EVENT_AMBITIOUS_FOR_CURRENT_RUNNING',blocking:false,detail:'The race comes early relative to current running: the plan builds toward completion with walk breaks and cannot promise readiness',options:['Keep the event with walk breaks','Choose a shorter or later event']});
  if(!s.runDays.includes(plan.raceDay))negotiation.push({id:'EVENT_DAY_OUTSIDE_CHOSEN_DAYS',blocking:false,informational:true,detail:'The race date is not a chosen run day; race-week runs keep the chosen days'});
 }
 negotiation.push(...arrangementDisclosures(choices));
 if(s.sharedDays.length&&(!s.runTurn||!s.strengthTurn||s.runTurn===s.strengthTurn)&&!s.sameTurnConfirmed)negotiation.push({id:'BACK_TO_BACK_CONFIRMATION',blocking:false,days:s.sharedDays,detail:'Run and strength share a shift on these days and are planned back to back; confirm the order or change one shift'});
 const errors=validateWeeks(sk,weeks);
 if(errors.length)return reject('UNSUPPORTED','Generated candidate failed complete validation; no partial program is presented as complete',{errors});
 const peak=peakOf(weeks);
 if(goal.run.event&&peak.long<target)gaps.push({id:'LONG_RUN_PEAK_BELOW_TARGET',detail:`Planned long run peaks at ${peak.long} of ${target} minutes before the taper`,owner:'COACHING',materialToGoal:goal.run.event.kind==='HALF_MARATHON'&&peak.long<75});
 const program={version:PROGRAM_VERSION,id:'program-'+c.hash.slice(0,16),athleteId:c.athlete.id,revision:0,proposalOnly:true,official:false,sourceInputHash:base.inputHash,intakeHash:c.hash,policyHash:authority.policyHash,startDate:c.startDate,weeksCount:c.weeks,timezoneOffsetMinutes:c.timezoneOffsetMinutes,learningConsent:c.learningConsent,canonical:c,goal,capability:cap,schedule:clone(s),phases:plan,blocks,weeks,stateTrace:states,arrangement:Object.fromEntries(Object.entries(sk.arrangement).map(([k,v])=>[k,{id:v.id,quality:v.quality,perm:v.perm,runFirstOnShared:v.runFirstOnShared}])),arrangementSessions:clone(sk.arrangement),templates,negotiation,uncertainty:clone(intake.uncertainty),gaps,decisions:[],completedWork:clone(c.completedWork),officialPlanState:clone(c.officialPlanState),profileContextUsedForDose:false,assumptions:['Future weeks are conditional proposals, not predictions; each step needs the previous comparable exposure executed without an adverse signal','Effort cues, not paces, define running intensity; any time goal is context only','Loads come from known current loads or effort-guided establishment; nothing is derived from sex, body size or another exercise','Phase lengths are operational choices inside reviewed envelopes, not validated optimal periodization'],authorityRefs:authority.records.map(r=>({boundaryId:r.boundaryId,disposition:r.disposition}))};
 program.hash=programHash(program);
 return freeze({...base,status:'PROPOSED',reason:'Complete conditional program generated from onboarding-like facts',program,negotiation,requestedScopeSatisfied:gaps.every(g=>!g.materialToGoal),trace:{capability:cap,goalModel:goal,phases:plan,arrangement:arrangementTrace,unknowns:intake.uncertainty},nextObservation:'Record each session: completed or not, actual minutes or sets/reps/load, effort if known and next-day function. Next week’s steps advance only on that evidence.'});
}
