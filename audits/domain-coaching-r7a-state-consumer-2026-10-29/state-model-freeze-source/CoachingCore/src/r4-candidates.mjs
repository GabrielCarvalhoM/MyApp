import {clone,hash} from './value.mjs';
import {numericBound} from './r4-authority.mjs';
import {summarizeOptionResponse} from './r4-athlete-model.mjs';
import {favorable,comparable,nonmaximal} from './r4-context.mjs';

const good=favorable;
const n=v=>typeof v==='number'&&Number.isFinite(v)&&v>0;
const clean=v=>v!==undefined&&v!==null&&!/^(unknown|not supplied|not established|not assessed|not tested|uncertain)/i.test(String(v));
const pick=(id,recipe,why,grades={},valid=true)=>({id,recipe:clone(recipe),admissible:valid,reason:why,grades:{essential:'PREFERRED',goal:'PREFERRED',continuity:'PREFERRED',recovery:'ACCEPTABLE',change:'ACCEPTABLE',...grades}});
const missing=(reason,paths)=>({reason,missingInputs:paths});
const blocked=(reason,dependency)=>({reason,dependency});
const selection=(envelopeId,candidates,essentialStimulus,extra={})=>({envelopeId,candidates,essentialStimulus,criteria:['essential','goal','recovery','continuity','change'],...extra});
const rejected=(id,why)=>pick(id,null,why,{essential:'INADMISSIBLE'},false);
const familiarStrength=(exercise,sets,reps,rir)=>({exercise,sets,reps,loadSelection:{method:'LOWEST_FAMILIAR_OR_UNLOADED_THEN_EASY_TECHNIQUE_CHECK',targetRirAtLeast:rir,stopBeforeTechniqueChange:true,noLoadConversion:true},rest:'Until comfortable and technique ready; do not shorten rest to meet a volume target'});
function entryRun(bound,totalCap,familiar=null){
 const total=numericBound(bound,'entryTotalMinutes'),repetitions=numericBound(bound,'entryJogRepetitions'),seconds=numericBound(bound,'entryJogSeconds'),walk=numericBound(bound,'entryWalkRecoveryMinutes');
 if(!total||!repetitions||!seconds||!walk||totalCap<total||repetitions*(seconds/60+walk)>total)return null;
 return {modality:'RUN_WALK',totalMinutes:total,preparation:{method:'Comfortable walking',minutes:total-repetitions*(seconds/60+walk)},work:{repetitions,jogSecondsEach:seconds,walkRecoveryMinutes:walk,effort:'Comfortable complete sentences; exploratory jog, never a pace test',walkInsteadIfTalkOrFunctionDeteriorates:true},previouslyReported:familiar,stop:'New pain, unusual symptoms or altered function ends dependent work; clinical concern routes to qualified human',intent:'Establish tolerable running exposure; current run capacity is not presumed'};
}
function establishment(c,a){
 const {demand:d,onboarding:o={},reportedExposure:e={},population:p}=c,b=a?.bounds??{};
 const days=o.availability;
 if(!Array.isArray(days)||!days.length||days.some(x=>!x.day||!n(x.minutes)))return missing('Availability materially determines the entry plan',['/onboarding/availability']);
 if(!Array.isArray(o.equipment)||!o.equipment.length)return missing('Available equipment and route are needed',['/onboarding/equipment']);
 if(!o.goals?.length)return missing('An initial prescription needs an athlete objective',['/onboarding/goals']);
 const sets=numericBound(b,'entryStrengthSets'),reps=numericBound(b,'entryStrengthReps'),rir=numericBound(b,'minimumRir');
 if(!sets||!reps||!rir)return blocked('Reviewed establishment bounds are unavailable','ESTABLISHMENT_BOUNDS');
 const movement=typeof o.movementKnowledge==='object'?JSON.stringify(o.movementKnowledge):String(o.movementKnowledge??'');
 if(d.requestedExercise&&/unknown|never handled/i.test(movement))return missing('The requested loaded exercise has no demonstrated movement competence or starting-load anchor',['/onboarding/movementKnowledge','/reportedExposure/strength']);
 const supportsSit=/sit[- _]?to[- _]?stand.*(?:comfortable|demonstrat)|comfortable.*sit[- _]?to[- _]?stand/i.test(movement);
 const supportsRow=/supported.?row.*(?:demonstrat|familiar)|(?:demonstrat|familiar).*supported.?row/i.test(movement)||/supported row/i.test(String(e.strength?.recentConfiguration??''));
 const supportsSquat=/goblet squat/i.test(String(e.strength?.recentConfiguration??''));
 const exercises=[];
 if(supportsSit)exercises.push({...familiarStrength('unloaded sit-to-stand',sets,reps,rir),load:'BODYWEIGHT'});
 if(supportsRow)exercises.push(familiarStrength('chest-supported row',sets,reps,rir));
 if(supportsSquat)exercises.push(familiarStrength('goblet squat',sets,reps,rir));
 const familiarMinutes=e.run?.easyMinutes??e.run?.recentSessions?.filter(x=>(!x.family||x.family==='EASY')&&good(x.talk)&&good(x.nextDay)).at(-1)?.minutes;
 const walk=e.walk,walkEstablished=n(walk?.minutes)&&good(walk.effort??walk.talk)&&walk.recent!==false;
 const familiarRun=typeof e.run?.familiar==='string'&&good(e.run?.recentResponse)?e.run.familiar:null;
 const makeRun=day=>n(familiarMinutes)?{modality:'RUN',family:'EASY',minutes:Math.min(familiarMinutes,day.minutes),effort:'Reported familiar conversational talk anchor',stopIfUnusualResponse:true}:familiarRun?{modality:'RUN_WALK',sequence:familiarRun,ceilingMinutes:day.minutes,effort:'Repeat reported relaxed familiar effort',noAutomaticProgression:true}:walkEstablished?entryRun(b,Math.min(walk.minutes,day.minutes)):null;
 if(d.kind==='FIRST_STRENGTH_SESSION'){
  if(!exercises.length)return missing('Familiar supported movements or a coached familiarization pathway are needed before selecting a loaded task',['/onboarding/movementKnowledge']);
  const recipe={scope:'FIRST_STRENGTH_SESSION',exercises,preparation:'Rehearse each known movement unloaded before easy work',availableMinutes:Math.min(...days.map(x=>x.minutes)),preserveOfficialRunWeek:clone(d.officialRunWeek??null),progression:'None until execution, technique, effort and next-day response are observed'};
  return selection('R4-ESTABLISHMENT',[pick('FAMILIAR_LOW_DEMAND_ENTRY',recipe,'Practice known movements at easy effort while protecting established running'),rejected('REQUEST_UNESTABLISHED_LOADED_HINGE','Unknown loaded-hinge competence cannot be inferred from equipment'),pick('OMIT_ALL_STRENGTH',null,'Defers the stated learn-strength goal despite demonstrated supported alternatives',{goal:'POOR'})],'Movement practice with productive low-demand resistance exposure',{tradeOff:'Initial exposure is intentionally below a mature strength program; increase only after observed response'});
 }
 const first=makeRun(days[0]);
 if(!first)return missing('Recent comfortable walk/run exposure is needed to choose an entry route',['/reportedExposure']);
 if(d.kind==='FIRST_RUN_SESSION')return selection('R4-ESTABLISHMENT',[pick('GOVERNED_RUN_WALK_ENTRY',first,'A small exploratory jog exposure serves learn-run/walk without presuming running capacity'),pick('WALK_ONLY',{modality:'WALK',minutes:Math.min(e.walk?.minutes??first.totalMinutes,days[0].minutes)},'Comfortable walking is admissible, but does not test the requested learn-run/walk stimulus',{goal:'ACCEPTABLE'}),rejected('UNFAMILIAR_HARD_RUN','No established hard-running tolerance or calibration')],'Establish comfortable run/walk exposure');
 if(e.run?.recentSessions?.some(x=>x.family)||e.run?.sessionsPerWeek!==undefined||Array.isArray(e.strength?.sessions))return missing('An established athlete’s hybrid week must preserve the actual weekly family/strength pattern rather than fill availability with generic entry sessions',['/reportedExposure/currentWeeklyConfiguration']);
 if(!exercises.length)return missing('A familiar full strength configuration is needed for the requested entire hybrid week; an example lift is not a complete session',['/reportedExposure/strength/completeConfiguration']);
 const sessions=days.map((day,index)=>({day:day.day,capacityMinutes:day.minutes,session:index===1?{modality:'STRENGTH',exercises:clone(exercises),preparation:'Unloaded rehearsal then easy familiar movement'}:makeRun(day)}));
 if(sessions.some(x=>x.session===null))return missing('A complete admissible entry session cannot be chosen for the supplied availability',['/reportedExposure']);
 return selection('R4-ESTABLISHMENT',[pick('ENTRY_WEEK',{scope:'ESTABLISHMENT_WEEK',sessions,priority:p.priority,noAutomaticProgression:true},'Use known movements and conversational exposure within available days; establish response before increasing work'),pick('RUN_ONLY_WEEK',{sessions:sessions.filter(x=>x.session.modality!=='STRENGTH')},'Omits the stated hybrid strength objective',{goal:'POOR'}),rejected('FILL_ALL_AVAILABLE_TIME','Availability is a ceiling, not a training dose target')],'Consistent entry exposure in both modalities',{tradeOff:'A low-demand first week prioritizes learning tolerance over mature training volume'});
}
function strength(c,a){
 const d=c.demand,h=c.history??{},o=c.observations??{},b=a?.bounds??{},base=d.base;
 if(b.oneDimensionOnly!==true||b.requireComparableResponse!==true)return blocked('Strength transformation bounds are not established','STRENGTH_BOUNDS');
 const candidate=d.candidate??d.availableAlternative;
 const path=d.candidate?'/currentDemand/candidate':'/currentDemand/availableAlternative';
 if(!base||!candidate||!n(base.sets)||!n(base.reps)||!n(candidate.sets)||!n(candidate.reps))return missing('Complete comparable strength recipes are required',['/currentDemand/base',path]);
 const doseKeys=['sets','reps','loadKg','loadKgPerHand','targetRir','restSeconds'];
 const changed=doseKeys.filter(k=>base[k]!==candidate[k]);
 if(changed.length!==1||!['reps','loadKg','loadKgPerHand','sets'].includes(changed[0]))return blocked('A candidate changes multiple dimensions or effort without a reviewed transformation','MULTIDIMENSION_STRENGTH_CHANGE');
 const key=changed[0],up=candidate[key]>base[key],sessions=o.recentComparableSessions??[];
 if(o.nextDay!==undefined&&!good(o.nextDay)||o.systemic!==undefined&&!good(o.systemic))return missing('Current recovery is incompatible or uncertain; prior easy sets cannot override it',['/observations/nextDay','/observations/systemic']);
 if(sessions.some(s=>!good(s.technique)))return missing('Technique quality is not established for comparable progression',['/observations/recentComparableSessions/technique']);
 const repeated=sessions.length>1&&sessions.every(s=>Array.isArray(s.reps)&&s.reps.length===base.sets&&s.reps.every(x=>x>=base.reps)&&Array.isArray(s.reportedRir)&&s.reportedRir.length===base.sets&&s.reportedRir.every(x=>x>base.targetRir)&&good(s.technique));
 const priorCandidate=h.candidatePreviouslyExposed===true&&good(h.knownResponse)&&comparable(h.contextComparability);
 const confirmedUnder=/second comparable|repeated|confirmed/i.test(String(o.recentTrend??''))&&Array.isArray(o.lastSession?.actualReps)&&o.lastSession.actualReps.some(x=>x<base.reps)&&o.lastSession.reportedRir?.some(x=>x<base.targetRir);
 const familiarDown=h.alternativeFamiliar===true&&good(h.alternativeResponse);
 if(up&&(!repeated||!priorCandidate))return {keep:true,reason:'A single noisy response or unfamiliar candidate does not earn progression; retain the familiar prescription and observe comparable response',nextObservation:'Comparable set completion, technique, effort and next-day response'};
 if(!up&&(!confirmedUnder||!familiarDown))return {keep:true,reason:'No convergent comparable underperformance justifies reducing future strength work',nextObservation:'Repeat comparable execution and distinguish ordinary noise from persistent mismatch'};
 if(up&&key==='reps'&&candidate.reps!==base.reps+1)return blocked('A larger rep jump ignores the available smaller one-repetition transformation','NONMINIMUM_REP_PROGRESSION');
 if(up&&['loadKg','loadKgPerHand'].includes(key)&&n(h.equipmentIncrementKg)&&candidate[key]-base[key]!==h.equipmentIncrementKg)return blocked('Candidate is not the smallest available equipment increment','NONMINIMUM_LOAD_PROGRESSION');
 if(!up&&['loadKg','loadKgPerHand'].includes(key)&&n(h.equipmentIncrementKg)&&Math.abs(base[key]-candidate[key])!==h.equipmentIncrementKg)return blocked('Provided regression is larger than the known available equipment increment','NONMINIMUM_LOAD_REGRESSION');
 const recipe={exercise:d.exercise,...clone(candidate),...(candidate.restSeconds===undefined&&candidate.rest===undefined?{rest:'Plan approximately 2 minutes between work sets, then wait until effort and technique are ready; extend rest or reassess remaining work if actual time no longer fits. This is an operational choice, not a physiological threshold.'}:{})};
 return selection('R4-STRENGTH-ADAPTATION',[pick(up?'EARNED_MINIMUM_PROGRESSION':'SMALLEST_FAMILIAR_REGRESSION',recipe,up?'Repeated easy comparable completion and prior compatible candidate support a one-dimension step':'Convergent target misses warrant the smallest familiar load reduction while preserving sets/reps'),pick('KEEP_BASE',{exercise:d.exercise,...clone(base)},up?'Admissible continuity, but repeated excess reserve under-serves the requested strength progression':'Repeated mismatch would remain unresolved',{goal:up?'ACCEPTABLE':'POOR',recovery:up?'PREFERRED':'POOR',change:'PREFERRED'}),rejected('CHANGE_MULTIPLE_DIMENSIONS','More disruption than the available sufficient one-dimension change')],up?'Progress the familiar strength stimulus without unnecessary disruption':'Restore intended quality and reserve for future strength development',{criteria:['essential','goal','continuity','change','recovery'],tradeOff:up?'Slightly more work; no extra set, load or concurrent run escalation':'Lower external load preserves useful execution and recovery rather than forcing missed targets'});
}
function local(c,a){
 const s=c.demand.session,o=c.observations,b=a?.bounds??{};
 if(b.optionalOnly!==true)return blocked('Optional-only local adaptation boundary missing','LOCAL_BOUNDS');
 if(!Array.isArray(s?.essential)||!s.essential.length||!Array.isArray(s.optional)||!s.optional.length)return missing('Essential and optional work must be distinguished',['/currentDemand/session']);
 if(!good(o.systemic)||!good(o.performance)||o.pain!==false)return missing('Current systemic response and essential-work function materially affect a local-only intervention',['/observations/systemic','/observations/performance','/observations/pain']);
 const affected=s.optional.filter(e=>/calf|calves/i.test(e.exercise)&&/calf|calves/i.test(o.local??''));
 if(!affected.length)return missing('Identify which optional work loads the affected local region before changing it',['/observations/local','/currentDemand/session/optional']);
 const completedSets=e=>(s.completed??[]).filter(x=>x.exercise===e.exercise).reduce((sum,x)=>sum+(Number.isFinite(x.sets)?x.sets:1),0);
 if(affected.every(e=>completedSets(e)>=e.sets))return {keep:true,reason:'The affected optional work is already completed; no unperformed affected remainder exists to omit. Preserve actual work and reassess future response.'};
 const remaining=s.optional.filter(e=>!affected.includes(e));
 return selection('R4-LOCAL-FATIGUE',[pick('OMIT_AFFECTED_OPTIONAL',{scope:'UNCOMPLETED_SUFFIX_ONLY',essential:clone(s.essential),optional:clone(remaining),remainingEssential:s.essential.map(e=>({...clone(e),sets:Math.max(0,e.sets-completedSets(e))})).filter(e=>e.sets>0),completed:clone(s.completed??[]),omittedRemaining:affected.map(e=>({...clone(e),sets:Math.max(0,e.sets-completedSets(e))})).filter(e=>e.sets>0)},'Omit only the affected optional accessory remainder; preserve all tolerated essential work and completed facts',{recovery:'PREFERRED',change:'PREFERRED'}),pick('KEEP_ALL',s,'Known recipe remains possible but adds unnecessary local fatigue despite a legitimate request',{recovery:'POOR'}),pick('CANCEL_SESSION',{essential:[],optional:[]},'Needlessly removes essential strength stimulus',{essential:'POOR',goal:'POOR',recovery:'PREFERRED'})],'Preserve current essential strength stimuli and recovery for upcoming key work',{tradeOff:'Skip a dispensable accessory stimulus today; do not compensate later'});
}
function systemic(c,a){
 const s=c.demand.session,o=c.observations,p=c.completedPrefix,b=a?.bounds??{};
 if(b.noFurtherHardWorkAfterEarlyTermination!==true)return blocked('Convergent-response suffix boundary is unavailable','SUFFIX_BOUNDS');
 if(!p||!n(p.repetitions)||!Array.isArray(p.actualWorkMinutes)||p.actualWorkMinutes.length!==p.repetitions||p.repetitions>s.repetitions||p.actualWorkMinutes.some(x=>!n(x)||x>s.workMinutesEach))return missing('Actual completed work must be internally consistent before selecting the remainder',['/completedPrefix']);
 const convergent=/poor|unusual|low|disrupt/i.test(o.severalDays??'')&&/more effort|harder|ended early|underperform/i.test(o.firstTwoRepetitions??'');
 if(!convergent)return {keep:true,reason:'A single uncorroborated fatigue signal is insufficient to change the remaining prescription'};
 const earlyStop=/(?:ended|stopped|terminated|cut).*early/i.test(o.firstTwoRepetitions??'')||p.actualWorkMinutes.at(-1)<s.workMinutesEach;
 if(!earlyStop)return missing('In-session execution and willingness to continue are material when convergent fatigue is present',['/observations/firstTwoRepetitions']);
 const easy=numericBound(b,'easyExitMinutes');if(!easy)return blocked('Easy exit bound unavailable','SUFFIX_BOUNDS');
 return selection('R4-SYSTEMIC-SUFFIX',[pick('END_HARD_WORK',{scope:'UNCOMPLETED_SUFFIX_ONLY',completedPrefix:clone(p),remainingHardRepetitions:0,easyExit:{maximumMinutes:easy,method:'Comfortable walking or very easy jogging only if current function remains normal; otherwise end session'},restoreMissedWork:false},'A voluntarily early-ended rep plus converging systemic response makes more hard work an avoidable cost; preserve future quality',{recovery:'PREFERRED',change:'PREFERRED'}),rejected('FORCE_ANOTHER_FULL_REPETITION','The last repetition could not sustain usual effort; deleting a later rep does not justify forcing the next one'),pick('RESTORE_COMPLETED_TO_PLANNED',null,'Completed work cannot be rewritten',{essential:'INADMISSIBLE'},false)],'Protect future key training while retaining the actual useful work already completed',{tradeOff:'Less cruise work today is accepted to avoid low-quality additional stress; no completion-at-any-cost rule',nextObservation:'Current symptoms/function and next-day recovery before resuming future key work'});
}
const minute=v=>{const m=/^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(v));return m?Number(m[1])*60+Number(m[2]):null;};
const clock=m=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
function schedule(c,a){
 const d=c.demand,h=c.history,b=a?.bounds??{};
 if(b.sameDoseOnly!==true||b.preserveKeyPlacement!==true)return blocked('Same-dose scheduling boundary is unavailable','SCHEDULE_BOUNDS');
 if(h?.bothArrangementsFamiliar!==true||!good(c.observations?.recovery))return missing('Familiar arrangement and current recovery matter before rearranging key work',['/history/bothArrangementsFamiliar','/observations/recovery']);
 const candidates=[];
 const primary=c.population.priority==='RUN_FIRST'?'run':c.population.priority==='STRENGTH_FIRST'?'strength':Object.keys(d.planned??{}).find(k=>d.planned[k].role==='KEY');
 if(!primary)return missing('Both modalities compete for the same window; a primary goal or explicit key-session role is needed',['/population/priority','/currentDemand/planned']);
 for(const option of c.alternatives??[]){
  const sessions=[];let feasible=true;
  for(const modality of ['run','strength']){
   const original=d.planned?.[modality],day=/^([A-Z]{3})\b/.exec(option[modality]??'')?.[1];
   if(!original||!day){feasible=false;break;}
   const windows=d.availability?.[day];
   if(!Array.isArray(windows)){feasible=false;break;}
   const slots=windows.map(w=>[minute(w[0]),minute(w[1])]).filter(([start,end])=>start!==null&&end!==null&&end-start>=original.durationMinutes);
   if(!slots.length){feasible=false;break;}
   const originalStart=minute(original.start),slot=slots.find(([start,end])=>day===d.day&&originalStart>=start&&originalStart+original.durationMinutes<=end)??slots[0];
   const start=day===d.day&&originalStart>=slot[0]&&originalStart+original.durationMinutes<=slot[1]?originalStart:slot[0];
   sessions.push({modality,day,start:clock(start),durationMinutes:original.durationMinutes,family:original.family,sourcePrescription:'UNCHANGED_ORIGINAL_'+modality.toUpperCase(),role:original.role});
  }
  if(sessions.length===2&&sessions[0].day===sessions[1].day){const x=sessions[0],y=sessions[1];if(minute(x.start)<minute(y.start)+y.durationMinutes&&minute(y.start)<minute(x.start)+x.durationMinutes)feasible=false;}
  const retained=sessions.find(s=>s.modality===primary)?.day===d.day;
  candidates.push(pick(option.id,{scope:'SCHEDULE_ONLY',sessions,noDoseChange:true},feasible?(retained?'Preserve priority/key placement and move the secondary familiar session into a valid window':'Feasible, but moves the key priority session despite a valid secondary-session move'):'Invalid duration, window or overlap',{goal:retained?'PREFERRED':'ACCEPTABLE',continuity:retained?'PREFERRED':'ACCEPTABLE',recovery:'ACCEPTABLE',change:'PREFERRED'},feasible));
 }
 return selection('R4-SCHEDULE',candidates,'Retain both familiar stimuli while preserving priority key placement',{criteria:['essential','goal','continuity','change','recovery'],tradeOff:'Move the secondary session by a day; no universal spacing threshold or guaranteed interference benefit',nextObservation:'Execution quality and recovery after the rearranged pair'});
}
function run(c,a){
 const d=c.demand,h=c.priorHistory??{},b=a?.bounds??{};
 if(c.interruption||c.observations?.response==='INCOMPATIBLE')return missing('Changed current context requires current tolerance assessment',['/observations/currentFunction','/observations/subjectiveRecovery']);
 if(d.kind==='RUN_NEXT_SESSION'){
  if(!['LONG_RUN','EASY'].includes(d.family))return blocked('Easy-duration tolerance cannot authorize a different run-family stimulus','RUN_FAMILY_TOLERANCE_MISMATCH');
  const compatible=h.recentComparable?.length>1&&h.recentComparable.every(x=>x.minutes===d.currentMinutes&&good(x.talk)&&good(x.nextDay));
  if(!compatible)return {keep:true,reason:'Comparable response has not established the need or tolerance for progression'};
  const known=h.candidatePreviouslyFamiliar??Object.entries(h).some(([key,value])=>{const matched=/^candidate(\d+(?:\.\d+)?)PreviouslyFamiliar$/.exec(key);return value===true&&matched!==null&&Number(matched[1])===d.candidateMinutes;});
  if(known!==true||!good(h.candidateResponse)||!n(d.candidateMinutes)||d.candidateMinutes<=d.currentMinutes||b.requirePreviouslyToleratedProgression!==true)return missing('A concrete previously tolerated candidate and compatible context are needed before extending the long run',['/priorHistory/candidatePreviouslyFamiliar','/priorHistory/candidateResponse']);
  return selection('R4-FAMILIAR-RUN',[pick('FAMILIAR_SINGLE_DIMENSION_PROGRESSION',{family:d.family,minutes:d.candidateMinutes,effort:'Familiar easy conversational talk anchor',noPaceIncrease:true},'Repeated compatible current exposure plus a previously compatible longer candidate serve gradual long-run development'),pick('KEEP_CURRENT',{family:d.family,minutes:d.currentMinutes,effort:'Familiar conversational'},'Safe continuity but forgoes a supported progression opportunity',{goal:'ACCEPTABLE',change:'PREFERRED'}),rejected('SIMULTANEOUS_PACE_AND_DURATION_INCREASE','Unnecessary extra dimension without supporting response')],'Gradually extend goal-specific familiar easy endurance',{tradeOff:'A small additional duration cost; other training remains stable'});
 }
 const family=d.family,same=h.sameFamily;
 const env=c.environment;
 if(env&&(env.conditions!==undefined&&(!comparable(env.conditions)&&!good(env.conditions))||env.terrain!==undefined&&!/^(flat|level)$/i.test(env.terrain)||env.surface!==undefined&&/icy|uneven|wet|unknown|new/i.test(env.surface)))return missing('Current terrain/surface/conditions are not comparable with the familiar anchor; assess current task effort rather than reuse old pace',['/environment','/calibration/currentComparableTaskAnchor']);
 if(family==='EASY'&&clean(h.sameRoute)&&good(h.response)&&clean(h.talkAnchor)&&n(d.requestedMinutes)){
  const matched=String(h.sameRoute).match(/\b(\d+(?:\.\d+)?)\s*min\b/i);
  if(!matched||d.requestedMinutes>Number(matched[1]))return missing('Requested easy duration exceeds the explicit familiar anchor',['/priorHistory/sameRoute']);
  return selection('R4-FAMILIAR-RUN',[pick('FAMILIAR_CONVERSATIONAL_EASY',{family,minutes:d.requestedMinutes,target:{method:'TALK_RPE',anchor:h.talkAnchor,noPhysiologicalZoneClaim:true}},'Repeat recent compatible exposure using the athlete’s familiar effort anchor'),rejected('INVENT_HR_OR_LAB_ZONE','No measured individual physiological calibration')],'Comfortable familiar aerobic exposure');
 }
 if(['STEADY','THRESHOLD_CRUISE','STRIDES'].includes(family)&&same&&good(same.response)){
  if(!nonmaximal(same.effort??same.subjective))return blocked('Maximal, unsustainable or unestablished effort is outside controlled familiar run/stride envelopes','RUN_INTENSITY_OUTSIDE_ENVELOPE');
  const warm=n(same.warmupMinutes)?same.warmupMinutes:numericBound(b,'preparationMinutes'),cool=n(same.cooldownMinutes)?same.cooldownMinutes:numericBound(b,'cooldownMinutes');
  if(!warm||!cool)return blocked('Reviewed full-session preparation and cooldown bounds unavailable','FULL_SESSION_RUN_BOUNDS');
  if(family==='STEADY'&&d.requestedWorkMinutes!==undefined&&d.requestedWorkMinutes!==same.workMinutes)return missing('Changed steady work duration requires a concrete progression context',['/currentDemand/requestedWorkMinutes','/priorHistory/sameFamily']);
  const valid=family==='STEADY'?n(same.workMinutes)&&n(same.paceSecondsPerKm):family==='STRIDES'?n(same.repetitions)&&n(same.secondsEach)&&clean(same.recovery)&&clean(same.effort):n(same.repetitions)&&n(same.workMinutesEach)&&typeof same.recoveryMinutes==='number'&&n(same.paceSecondsPerKm);
  if(!valid)return missing('The work block needs complete task-specific intensity and recovery anchors',['/priorHistory/sameFamily']);
  const recipe={family,warmup:{minutes:warm,effort:'Comfortable conversational; walk if needed'},work:clone(same),cooldown:{minutes:cool,effort:'Very easy conversational or walk'},calibration:{method:c.calibration?.method,claim:'Familiar task/effort anchor, not a measured physiological boundary'},stopIfEffortPaceDiverge:true};
  return selection('R4-FAMILIAR-RUN',[pick('COMPOSE_FAMILIAR_WORK_SESSION',recipe,'Retain the familiar compatible task and compose reviewed easy preparation/cooldown rather than demand a paper for exact minutes'),pick('EASY_ONLY',{family:'EASY',minutes:warm+cool},'Useful aerobic exposure but omits the requested supported specific stimulus',{goal:'POOR'}),rejected('AUTOMATIC_WORK_PROGRESSION','No explicit earned progression or need is supplied')],family==='STRIDES'?'Relaxed familiar neuromuscular practice':family==='STEADY'?'Controlled familiar steady work':'Controlled familiar threshold-intent work',{tradeOff:'Preparation/cooldown are new governed selections where history is silent; no claim of previously demonstrated full-session tolerance',uncertainty:'Familiar work does not guarantee today’s response; preparation is an active checkpoint'});
 }
 if(family==='RECOVERY')return missing('A distinct recovery intent is a goal choice; ordinary fatigue does not create a scientifically distinct pace',['/calibration/recoveryDistinctConstruct','/observations/needForSeparateRecoveryIntent']);
 if(['VO2_STYLE_INTERVALS','SHORT_INTERVALS','RACE_PACE'].includes(family))return missing('A watch estimate or remote race cannot calibrate a new fast task. Establish current comparable execution/effort or choose a governed entry session',['/calibration/recentTaskAnchor','/priorHistory/currentComparableResponse']);
 if(family==='HILLS')return missing('The new hill’s surface, grade and task exposure materially affect the prescription',['/calibration/grade','/calibration/duration','/calibration/downhillExposure','/environment/surface']);
 return blocked('The supplied run family/context has no reusable executable binding','RUN_CONTEXT_OUTSIDE_ENVELOPE');
}
function returnEntry(c,a){
 const t=c.interruption,h=c.priorHistory??{},o=c.observations??{},d=c.demand,b=a?.bounds??{};
 if(!t?.reason||t.nonclinical!==true||t.actualExposureKnown!==true)return missing('Interruption cause, actual exposure and current restrictions are needed before treating this as nonclinical re-establishment',['/interruption/reason','/interruption/nonclinical','/interruption/actualExposureKnown','/observations/currentRestrictions']);
 if(b.restorationAutomatic!==false)return blocked('No automatic restoration boundary is missing','RETURN_BOUNDS');
 const mins=numericBound(b,'entryRunMinutes'),sets=numericBound(b,'entryStrengthSets'),rir=numericBound(b,'minimumRir');
 if(!mins||!sets||!rir)return blocked('Re-establishment bounds missing','RETURN_BOUNDS');
 const currentRun=c.reportedExposure?.run;
 const currentReported=currentRun?.establishedToday===true&&currentRun.family==='EASY'&&n(currentRun.minutes)&&good(currentRun.talk)&&good(currentRun.response)&&(d.candidateMinutes===undefined||d.candidateMinutes===currentRun.minutes);
 const demonstrated=o.currentTaskDemonstration??(currentReported?{current:true,comparable:true,response:currentRun.response,recipe:{family:'EASY',minutes:currentRun.minutes,effort:currentRun.talk,anchorSource:'/reportedExposure/run',derivation:'Explicit establishedToday same-family dose and compatible actual response, not parsed narrative capacity'}}:undefined);
 if(demonstrated!==undefined&&(!good(o.currentFunction??o.ordinaryFunction)||typeof demonstrated!=='object'||!good(demonstrated.response)||!nonmaximal((demonstrated.recipe??demonstrated).effort??(demonstrated.recipe??demonstrated).effortAnchor)))return missing('Current demonstration must have compatible current function and a nonmaximal task/effort anchor; contradictory current evidence cannot be replaced by a generic prior',['/observations/currentTaskDemonstration','/observations/currentFunction']);
 if(b.allowCurrentDemonstrationReuse===true&&demonstrated&&typeof demonstrated==='object'&&demonstrated.current===true&&demonstrated.comparable===true&&good(demonstrated.response)){
  const recipe=demonstrated.recipe??demonstrated;
  const isRun=n(recipe.minutes)&&nonmaximal(recipe.effort??recipe.effortAnchor)&&['EASY','EASY_REESTABLISHMENT','RUN_WALK','WALK'].includes(recipe.family??recipe.modality);
  const isStrength=clean(recipe.exercise)&&n(recipe.sets)&&n(recipe.reps)&&(n(recipe.loadKg)||n(recipe.loadKgPerHand)||recipe.load==='BODYWEIGHT')&&typeof recipe.targetRir==='number'&&recipe.targetRir>=rir;
  const appropriate=d.kind==='FIRST_RETURN_SESSION'?isRun:d.kind==='FIRST_RETURN_STRENGTH'?isStrength:false;
  if(appropriate&&(d.availabilityMinutes===undefined||!isRun||recipe.minutes<=d.availabilityMinutes))return selection('R4-RETURN',[pick('CURRENT_COMPATIBLE_DEMONSTRATION',clone(recipe),'Current comparable compatible execution outranks a generic population entry prior; repeat this demonstrated task without assuming former capacity'),pick('GENERIC_REENTRY_PRIOR',null,'A generic reduction would discard stronger current individual evidence',{goal:'POOR'},false),rejected('RESTORE_UNDEMONSTRATED_FORMER_DOSE','Current demonstrated tolerance does not authorize restoration of higher former work')],'Continue currently demonstrated compatible re-establishment exposure',{uncertainty:'Current comparable response supports this task only; it does not establish former weekly capacity'});
 }
 if(d.kind==='FIRST_RETURN_SESSION'){
  if(!good(o.currentFunction)||!n(h.run?.easyMinutes))return missing('Current ordinary function and prior easy exposure are needed for a reversible re-entry trial',['/observations/currentFunction','/priorHistory/run/easyMinutes']);
  const recipe={family:'EASY_REESTABLISHMENT',maximumMinutes:Math.min(mins,h.run.easyMinutes,d.availabilityMinutes??mins),effort:'Comfortable complete sentences; begin walking, introduce short easy jogs only while comfortable',walkBreaks:'As needed; total time is a ceiling, not an obligation',noRestoredCapacityClaim:true,noAutomaticProgression:true};
  return selection('R4-RETURN',[pick('GOVERNED_LOW_DEMAND_REENTRY',recipe,'Use a lower-demand reversible trial instead of requiring current performance before any safe establishment action'),rejected('RESTORE_FORMER_LONG_OR_CRUISE','Former tolerance and elapsed days do not establish current readiness'),pick('DEFER_ALL_TRAINING',null,'No clinical dependency or impaired ordinary function supports complete deferral',{goal:'POOR'})],'Re-establish current easy tolerance without restoring prior capacity',{tradeOff:'Lower training stimulus today purchases current individual response evidence'});
 }
 if(d.kind==='FIRST_RETURN_STRENGTH'){
  const prior=h.previousLowDemandFamiliarization;
  if(!good(o.ordinaryFunction)||!prior||!n(prior.reps)||!good(h.historicalResponse))return missing('A familiar lower-demand task and ordinary function are needed',['/priorHistory/previousLowDemandFamiliarization','/observations/ordinaryFunction']);
  const recipe={exercise:h.exercise,sets:Math.min(sets,prior.sets),reps:prior.reps,targetRirAtLeast:Math.max(rir,prior.targetRir??rir),loadSelection:{method:'Begin unloaded rehearsal, then select easy familiar load only if technique and reserve remain appropriate',ceilingKg:prior.loadKg,noAutomaticRestoration:true},stopIfTechniqueOrFunctionChanges:true};
  return selection('R4-RETURN',[pick('LOW_DEMAND_STRENGTH_REENTRY',recipe,'Use the previously familiar low-demand configuration as a ceiling, not proof of current capacity'),rejected('RESTORE_FORMER_LOADS','No current compatible execution supports restoration')],'Re-establish technically controlled strength exposure');
 }
 if(d.kind==='RETURN_WEEK'){
  const days=d.availability;
  if(!Array.isArray(days)||days.length<2||!h.runEntry||!h.strengthEntry)return missing('A complete re-entry week needs availability and familiar entry tasks for both modalities',['/currentDemand/availability','/priorHistory/runEntry','/priorHistory/strengthEntry']);
  // Later work is explicitly conditional on the first response; no full former-week restoration.
  const sessions=days.slice(0,2).map((day,index)=>({day:day.day,capacityMinutes:day.minutes,requires:index?'Compatible response to first entry and current normal function':'Current nonclinical eligibility',session:index?{modality:'STRENGTH',exercise:h.strengthEntry.exercise,setsEach:Math.min(sets,h.strengthEntry.setsEach),reps:5,loadSelection:'Unloaded or lowest familiar load maintaining easy technique and at least '+rir+' repetitions in reserve'}:{modality:'RUN_WALK',maximumMinutes:Math.min(mins,h.runEntry.minutes,day.minutes),effort:'Comfortable conversational; walk freely'}}));
  return selection('R4-RETURN',[pick('CONDITIONAL_REENTRY_WEEK',{scope:'RETURN_WEEK',sessions,remainingDays:'Rest or ordinary comfortable walking; review before adding training',noAutomaticRestoration:true},'Re-establish both modalities with response checkpoints rather than jumping to former frequency'),rejected('RESTORE_FORMER_WEEK','Former frequency does not establish current capacity')],'Re-establish response to both familiar modalities',{tradeOff:'A staged entry week provides less dose than the former plan and avoids claiming restored capacity'});
 }
 return blocked('Return request needs current response reassessment','RETURN_NEXT_STEP');
}
function learned(c,a){
 const b=a?.bounds??{},options=c.demand.options??[],constraints=c.constraints??{};
 if(b.sameDoseOnly!==true||b.causalClaims!==false)return blocked('Observational-ranking boundaries are unavailable','LEARNING_BOUNDS');
 if(c.learningConsent?.purposeAllowed!==true)return missing('Individual response learning needs purpose-specific agency',['/learningConsent/purposeAllowed']);
 if(constraints.sameDoseCandidates!==true||constraints.noNewOption!==true||constraints.populationPriorVisible!==true)return blocked('Only unchanged-dose existing alternatives may be ranked from observational associations','UNREVIEWED_INDIVIDUAL_DOSE');
 const availability=c.demand.availability??constraints.availability;
 if(!availability||options.some(x=>!x.schedule||!x.prescriptions))return missing('Observed placement associations can advise ranking, but option names do not supply actual availability or complete unchanged prescriptions',['/currentDemand/availability','/currentDemand/options/schedule','/currentDemand/options/prescriptions']);
 const source=c.priorHistory?.observations??[],model=c.model?.observations??[],observations=[...source,...model];
 // An embedded recipe object or self-declared same-dose label is not an admissibility proof.
 // The reusable validator for complete, equal-dose, currently approved option generation is
 // still missing. Associations remain useful advisory evidence without positive task credit.
 return {...blocked('Comparable associations can advise preference, but complete task structure, unchanged dose and independently bounded candidate generation are not yet verified by a reusable runtime contract','LEARNED_OPTION_ADMISSIBILITY_CONTRACT'),advisoryRanking:{method:'CONTEXTUAL_RESPONSE_ASSOCIATIONS_ONLY',prescriptive:false,causalClaim:false,populationPriorRetained:true,options:options.map(option=>({id:option.id,association:summarizeOptionResponse(observations,option.id)})),nextObservation:'Reassess repeated comparable response and confounders; no arbitrary sample count establishes a causal rule or dose authority'}};
}
function substitution(c,a){
 const d=c.demand,h=c.history??{},b=a?.bounds??{},r=d.requested;
 if(b.requireFamiliarCompleteAlternative!==true)return blocked('Substitution boundary missing','SUBSTITUTION_BOUNDS');
 const alt=typeof h.completeAlternativeRecipe==='object'?h.completeAlternativeRecipe:h.alternativeRecipe;
 if(h.requestedMovementFamiliar!==true||!alt||typeof alt!=='object'||!n(alt.sets)||!n(alt.reps)||!(n(alt.loadKg)||n(alt.loadKgPerHand))||!n(alt.targetRir)||!(n(alt.restSeconds)||clean(alt.rest)))return missing('Movement familiarity and a complete independently anchored alternative, including own effort/rest, are required; barbell load cannot be converted to dumbbell load',['/history/requestedMovementFamiliar','/history/completeAlternativeRecipe','/currentDemand/requested/loadKgPerHand']);
 if(alt.exercise!==r?.exercise)return missing('The familiar alternative must match the requested movement',['/history/completeAlternativeRecipe/exercise']);
 if(/dumbbell/i.test(alt.exercise)&&!n(alt.loadKgPerHand)&&!(n(alt.loadKg)&&alt.loadBasis==='PER_HAND'))return missing('Dumbbell alternative requires its own unambiguous per-hand load basis; total kilograms cannot be silently interpreted or converted',['/history/completeAlternativeRecipe/loadKgPerHand','/history/completeAlternativeRecipe/loadBasis']);
 return selection('R4-SUBSTITUTION',[pick('FAMILIAR_EQUIPMENT_ALTERNATIVE',alt,'Use the complete familiar alternative without converting loads'),rejected('CONVERT_BARBELL_KILOGRAMS','Different equipment changes task mechanics; no universal load conversion')],'Preserve the intended movement stimulus within available equipment');
}
export function generateCoachingCandidates(context,approval){
 const kind=context.demand.kind;
 if(['FIRST_WEEK','FIRST_PRODUCT_WEEK','FIRST_RUN_SESSION','FIRST_STRENGTH_SESSION'].includes(kind))return establishment(context,approval);
 if(kind==='NEXT_STRENGTH_SESSION')return strength(context,approval);
 if(kind==='LOCAL_FATIGUE')return local(context,approval);
 if(kind==='SYSTEMIC_FATIGUE')return systemic(context,approval);
 if(kind==='ACUTE_INTERFERENCE_AND_SCHEDULE_CONFLICT')return schedule(context,approval);
 if(['RUN_CALIBRATION','RUN_NEXT_SESSION'].includes(kind))return run(context,approval);
 if(['FIRST_RETURN_SESSION','FIRST_RETURN_STRENGTH','RETURN_WEEK'].includes(kind))return returnEntry(context,approval);
 if(kind==='RANK_EXISTING_ADMISSIBLE_OPTIONS')return learned(context,approval);
 if(kind==='EQUIPMENT_SUBSTITUTION')return substitution(context,approval);
 return null;
}
export function envelopeFor(kind){
 if(['FIRST_WEEK','FIRST_PRODUCT_WEEK','FIRST_RUN_SESSION','FIRST_STRENGTH_SESSION'].includes(kind))return 'R4-ESTABLISHMENT';
 return ({NEXT_STRENGTH_SESSION:'R4-STRENGTH-ADAPTATION',LOCAL_FATIGUE:'R4-LOCAL-FATIGUE',SYSTEMIC_FATIGUE:'R4-SYSTEMIC-SUFFIX',ACUTE_INTERFERENCE_AND_SCHEDULE_CONFLICT:'R4-SCHEDULE',RUN_CALIBRATION:'R4-FAMILIAR-RUN',RUN_NEXT_SESSION:'R4-FAMILIAR-RUN',FIRST_RETURN_SESSION:'R4-RETURN',FIRST_RETURN_STRENGTH:'R4-RETURN',RETURN_WEEK:'R4-RETURN',RANK_EXISTING_ADMISSIBLE_OPTIONS:'R4-OBSERVATIONAL-RANKING',EQUIPMENT_SUBSTITUTION:'R4-SUBSTITUTION'})[kind]??null;
}
/** Ordinal comparisons are context ordered; there is no summed universal utility score. */
export function rankCandidates(candidates,criteria){
 const ord={PREFERRED:0,ACCEPTABLE:1,POOR:2,INADMISSIBLE:3};
 const compare=(x,y)=>{if(x.admissible!==y.admissible)return x.admissible?-1:1;for(const k of criteria){const diff=(ord[x.grades[k]]??1)-(ord[y.grades[k]]??1);if(diff)return diff;}return x.id.localeCompare(y.id);};
 const ranked=clone(candidates).sort(compare),selected=ranked.find(x=>x.admissible);
 return {method:'LEXICOGRAPHIC_CONTEXT_RULES',criteria:clone(criteria),grades:'PREFERRED < ACCEPTABLE < POOR; INADMISSIBLE excluded; ties stable by candidate id',candidates:ranked,selectedId:selected?.id??null,selected:selected??null,hash:hash({candidates,criteria})};
}
