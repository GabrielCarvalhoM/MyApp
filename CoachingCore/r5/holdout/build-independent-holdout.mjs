// Independent R5 holdout authoring. Built-ins only; no runtime imports or evaluations.
// This builder refuses to overwrite either sealed artifact.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:([A-Za-z]:))/, '$1'));
const outputPath = path.join(here, 'R5_INDEPENDENT_HOLDOUT.json');
const manifestPath = path.join(here, 'INDEPENDENCE_MANIFEST.json');
assert(!fs.existsSync(outputPath) && !fs.existsSync(manifestPath), 'Preserve original: sealed artifact already exists');
const freezePath = path.join(here, '..', 'RUNTIME_FREEZE_R5.json');
const freezeRaw = fs.readFileSync(freezePath);
const freeze = JSON.parse(freezeRaw);
const expectedFreeze = '1590d1aaa6cb5cb5259d2fc86e77191f3e1a60f1dd5411fc4c34bb9748f839d3';
assert.equal(freeze.sourceDigest, expectedFreeze);
const authorStartedAt = '2026-10-26T11:58:07.000Z';
assert(new Date(authorStartedAt) > new Date(freeze.frozenAt));

const clone = x => structuredClone(x);
const canonical = x => Array.isArray(x) ? x.map(canonical) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().map(k => [k, canonical(x[k])])) : x;
const sha = x => crypto.createHash('sha256').update(x).digest('hex');
const hash = x => sha(JSON.stringify(canonical(x)));
const configurationHash = anchors => hash(anchors.map(a => ({id:a.id,prescription:a.prescription})).sort((a,b) => a.id.localeCompare(b.id)));
const plusDays = (date, days) => { const d = new Date(`${date}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0,10); };
const START = '2026-11-02';
const knownEligibility = date => ({status:'NONCLINICAL_CONFIRMED',assessedAt:date,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});

function run(family, durationMinutes, options={}) {
  const isWork = ['CRUISE','FASTER','HILLS','EVENT_SPECIFIC'].includes(family);
  const p = {modality:'RUN',family,durationMinutes,effortDomain:isWork ? 'CONTROLLED_CURRENT' : 'EASY_CONVERSATIONAL',effort:isWork ? 'Familiar controlled work, able to finish every repetition without racing' : 'Comfortable conversational effort; walking breaks remain available',warmupMinutes:isWork ? 10 : 5,cooldownMinutes:5,equipment:['OUTDOOR']};
  if (isWork) { p.calibration={basis:'CURRENT_TASK',current:true}; p.work={repetitions:3,workMinutes:6,recoveryMinutes:2}; }
  if (family === 'WALK_JOG') p.work={repetitions:6,workMinutes:2,recoveryMinutes:2};
  return {...p,...clone(options)};
}
const exercise = (id,pattern,sets,reps,value,options={}) => ({id,pattern,sets,reps,load:{value,unit:'KG',convention:'TOTAL'},rir:3,restSeconds:120,preparationMinutes:4,...clone(options)});
function strength(family, durationMinutes, exercises, equipment=['DUMBBELLS','BENCH']) { return {modality:'STRENGTH',family,durationMinutes,equipment,exercises}; }
const full = (minutes=45, load=20) => strength('FULL_BODY',minutes,[exercise('goblet-squat','SQUAT',3,8,load),exercise('db-rdl','HINGE',3,8,load*2),exercise('db-floor-press','PUSH',3,8,load,{load:{value:load/2,unit:'KG',convention:'PER_HAND'},restSeconds:90}),exercise('db-row','PULL',3,8,load,{restSeconds:90})]);
const lower = (minutes=50, load=50) => strength('LOWER',minutes,[exercise('back-squat','SQUAT',3,6,load),exercise('barbell-rdl','HINGE',3,6,load+10),exercise('standing-calf-raise','CALF',2,12,20,{restSeconds:60})],['BARBELL','RACK']);
const upper = (minutes=40, load=16) => strength('UPPER',minutes,[exercise('db-bench-press','PUSH',3,8,load,{load:{value:load,unit:'KG',convention:'PER_HAND'}}),exercise('one-arm-db-row','PULL',3,10,load,{restSeconds:90}),exercise('db-overhead-press','PUSH',2,8,load-4,{load:{value:load-4,unit:'KG',convention:'PER_HAND'},restSeconds:90})]);
const novicePractice = () => strength('PRACTICE',30,[exercise('box-squat','SQUAT',2,8,8,{rir:4,restSeconds:90}),exercise('supported-db-row','PULL',2,8,8,{rir:4,restSeconds:90}),exercise('incline-push-up','PUSH',2,6,0,{load:{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'},rir:4,restSeconds:90})],['DUMBBELLS','BENCH']);
const hotelPractice = () => strength('PRACTICE',25,[exercise('bodyweight-squat','SQUAT',2,10,0,{load:{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'},rir:4,restSeconds:60}),exercise('incline-push-up','PUSH',2,8,0,{load:{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'},rir:4,restSeconds:60}),exercise('reverse-lunge','LUNGE',2,8,0,{load:{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'},rir:4,restSeconds:60})],['BODYWEIGHT']);
function anchor(id, objective, prescription, essential=true) { return {id,objective,essential,current:true,familiar:true,tolerated:true,observedAt:START,prescription,alternatives:[]}; }
function alternative(a, id, purpose, prescription, observedAt=START) { a.alternatives.push({id,purpose,prescription:clone(prescription),familiar:true,tolerated:true,observedAt}); return a; }
function supportAlternatives(anchors, date=START, recovery='COMPATIBLE') {
  const baselineHash=configurationHash(anchors);
  for (const a of anchors) for (const alt of a.alternatives ?? []) {
    const proposed=anchors.map(x => ({...x,prescription:x.id === a.id ? alt.prescription : x.prescription}));
    alt.weeklyContext={source:'SELF_REPORT',recovery,observedAt:date,baselineHash,proposedHash:configurationHash(proposed)};
  }
}
const allEquipment=['OUTDOOR','DUMBBELLS','BENCH','BARBELL','RACK','BODYWEIGHT'];
function availability(days=[0,1,2,3,4,5,6], duration=100) { return days.map(day => ({day,windows:[{id:`d${day}-am`,startMinute:420,durationMinutes:duration,equipment:clone(allEquipment)},{id:`d${day}-pm`,startMinute:1080,durationMinutes:duration,equipment:clone(allEquipment)}]})); }
function schedule(id, placements, recovery='COMPATIBLE', current=true, observedAt=START) { return {id,assignments:placements.map(([anchorId,day,period='am']) => ({anchorId,day,windowId:`d${day}-${period}`})),evidence:{current,observedAt,source:'SELF_REPORT',combinedRecovery:recovery}}; }
function program(id, anchors, {weeks=8,kind='BALANCED',priority='BALANCED',secondary='Maintain both running and strength practice',runExperience='INTERMEDIATE',strengthExperience='INTERMEDIATE',schedules,days,learningConsent=true,eventDate,ageYears=36}={}) {
  supportAlternatives(anchors);
  const goal={kind,priority,secondary}; if (eventDate) goal.eventDate=eventDate;
  return {version:'R5-INPUT-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:START,startDate:START,weeks,learningConsent,
    athlete:{id:`fictional-${id}`,ageYears,participation:'RECREATIONAL_HYBRID',runExperience,strengthExperience,eligibility:knownEligibility(START),goal,anchors,
      weeklyTolerance:{current:true,observedAt:START,source:'SELF_REPORT',anchorIds:anchors.map(a=>a.id),recovery:'COMPATIBLE'}},
    availability:availability(days),scheduleOptions:schedules ?? [schedule('ordinary-week',anchors.map((a,i)=>[a.id,[0,2,4,6,1,3][i],'am']))]};
}
function hm(id, weeks=16) {
  const a=[anchor('easy-a','Aerobic frequency and easy movement',run('EASY',35)),anchor('controlled-run','Controlled running without a race-pace estimate',run('CRUISE',42)),anchor('long-run','Current tolerable continuous endurance',run('LONG',65)),anchor('strength-maintenance','Maintain squat, hinge, push and pull practice',full(45,16))];
  alternative(a[0],'easy-a-40','PROGRESS',run('EASY',40));
  alternative(a[2],'long-70','PROGRESS',run('LONG',70)); alternative(a[2],'long-50','REGRESS',run('LONG',50));
  alternative(a[3],'strength-30','RECOVERY',strength('FULL_BODY',30,a[3].prescription.exercises.map(x=>({...clone(x),sets:2}))));
  return program(id,a,{weeks,kind:'HALF_MARATHON',priority:'RUN_FIRST',secondary:'Maintain one complete familiar weekly strength session during recreational half-marathon preparation',eventDate:plusDays(START,weeks*7-1),schedules:[schedule('run-protected',[['easy-a',0],['strength-maintenance',1],['controlled-run',3],['long-run',6]])]});
}
function strengthFirst(id) {
  const a=[anchor('lower-primary','Increase repeatable squat and hinge strength with reps in reserve',lower(50,55)),anchor('upper-primary','Progress pressing and pulling skill and load',upper(40,18)),anchor('full-secondary','Second weekly squat/hinge exposure at a familiar lighter dose',full(45,20)),anchor('walk-jog','Preserve comfortable aerobic participation while running is novice',run('WALK_JOG',35,{work:{repetitions:5,workMinutes:2,recoveryMinutes:3}}))];
  alternative(a[0],'lower-load-plus','PROGRESS',lower(50,57.5));
  alternative(a[0],'lower-less-volume','REGRESS',strength('LOWER',38,a[0].prescription.exercises.map(x=>({...clone(x),sets:2})),['BARBELL','RACK']));
  alternative(a[1],'upper-load-plus','PROGRESS',upper(40,20));
  return program(id,a,{weeks:12,kind:'STRENGTH',priority:'STRENGTH_FIRST',runExperience:'NOVICE',schedules:[schedule('strength-separated',[['lower-primary',0],['walk-jog',2],['upper-primary',3],['full-secondary',5]])]});
}
function general(id, options={}) {
  const a=[anchor('conversational-run','Enjoyable repeatable aerobic exercise',run('EASY',28)),anchor('longer-easy','A slightly longer easy outing without pace targets',run('LONG',42)),anchor('practice-a','Build movement confidence with modest resistance',novicePractice()),anchor('practice-b','A second familiar strength exposure',strength('PRACTICE',30,[exercise('db-split-squat','LUNGE',2,8,8,{rir:4,restSeconds:90}),exercise('db-rdl','HINGE',2,8,16,{rir:4,restSeconds:90}),exercise('db-floor-press','PUSH',2,8,8,{load:{value:8,unit:'KG',convention:'PER_HAND'},rir:4,restSeconds:90})]))];
  return program(id,a,{weeks:8,kind:'GENERAL_FITNESS',priority:'BALANCED',strengthExperience:'NOVICE',...options,schedules:[schedule('alternating-practice',[['conversational-run',0],['practice-a',2],['longer-easy',4],['practice-b',6]])]});
}
function balanced(id) {
  const a=[anchor('quality-run','Preserve one controlled running stimulus',run('CRUISE',44,{work:{repetitions:4,workMinutes:5,recoveryMinutes:2}})),anchor('lower-strength','Preserve a meaningful squat/hinge dose',lower(50,50)),anchor('long-easy','Aerobic endurance without a maximal session',run('LONG',58)),anchor('upper-strength','Preserve upper-body strength practice',upper(40,16)),anchor('optional-easy','Optional recovery-compatible frequency',run('EASY',22),false)];
  const ss=[schedule('protect-run',[['quality-run',0],['lower-strength',1],['long-easy',4],['upper-strength',5],['optional-easy',6]]),schedule('protect-strength',[['lower-strength',0],['quality-run',1],['long-easy',4],['upper-strength',5],['optional-easy',6]]),schedule('known-adverse-copy',[['quality-run',0],['lower-strength',1],['long-easy',4],['upper-strength',5],['optional-easy',6]],'ADVERSE')];
  return program(id,a,{weeks:12,kind:'BALANCED',priority:'BALANCED',secondary:'Equal standing for running and lower-body strength; preferences do not resolve a genuine conflict yet',schedules:ss});
}
function review(p,id,kind,weekIndex,extra={}) { return {version:'R5-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${plusDays(p.startDate,weekIndex*7+6)}T20:00:00Z`,weekIndex,event:{id,kind},eligibility:knownEligibility(plusDays(p.startDate,weekIndex*7+6)),observations:[],actualLedger:[],learningConsent:p.learningConsent,...clone(extra)}; }
function obs(weekIndex,anchorId,performance='COMPATIBLE',recovery='COMPATIBLE',effort='ON_TARGET',extra={}) { return {weekIndex,anchorId,performance,recovery,effort,completed:true,actualStimulus:'AS_PRESCRIBED',comparable:true,confounded:false,...clone(extra)}; }
function stimulus(p) {
  if(p.modality==='RUN') return {modality:p.modality,family:p.family,durationMinutes:p.durationMinutes,warmupMinutes:p.warmupMinutes,cooldownMinutes:p.cooldownMinutes,work:p.work ? clone(p.work) : null,effortDomain:p.effortDomain,equipment:clone(p.equipment)};
  return {modality:p.modality,family:p.family,equipment:clone(p.equipment),exercises:p.exercises.map(({id,pattern,sets,reps,load,restSeconds})=>({id,pattern,sets,reps,load:clone(load),restSeconds}))};
}
function history(p,anchorId,id,date,arrangement,performance='COMPATIBLE',recovery='COMPATIBLE',effort='ON_TARGET',extra={}) {
  const a=p.athlete.anchors.find(x=>x.id===anchorId); assert(a);
  return {id,weekIndex:0,anchorId,date,phase:'FOUNDATION',arrangement,priority:p.athlete.goal.priority,prescription:clone(a.prescription),performance,recovery,effort,completed:true,actualMinutes:a.prescription.durationMinutes,actualStimulus:stimulus(a.prescription),comparable:true,confounded:false,...clone(extra)};
}
const assessment = (rationale,preferredCoachingBehavior,acceptableAlternatives,concerns) => ({rationale,preferredCoachingBehavior,acceptableAlternatives,concerns});
const cases=[];
function add(caseId,family,scenario,operation,programInput,independentAssessment,extra={}) { cases.push({caseId,family,scenario,operation,programInput,...extra,independentAssessment}); }

// Every assessment below was authored before any engine output was available.
{
  const p=hm('hm16-start');
  add('R5-H01','whole-program-run-first','Fictional recreational adult has recently completed every listed anchor together in the supplied weekly arrangement with compatible self-reported recovery. The half marathon is 16 weeks away; the goal is to finish comfortably while preserving strength practice, without a time target. These are current self-report facts, not medical clearance inferred from silence.','GENERATE',p,assessment(
    'A complete current running-and-strength baseline plus an explicit event horizon should support an inspectable multiweek reference program rather than a single workout.',
    'Relate the 16-week horizon to meaningful blocks, weeks and physically specified sessions; preserve the existing tolerable week initially and make goal priority visible when choices conflict.',
    ['A conservative repeated baseline is acceptable when progression evidence is insufficient.','Different block names and nonuniform block lengths are acceptable if chronology and the event remain coherent.'],
    ['Do not invent a race pace, fitness test, clearance, promised finish time or unrestricted progression.','A label-only strength session or generic running duration without its physical task would miss the case.']));
}
{
  const p=strengthFirst('strength12-start'); p.athlete.ageYears=42;
  add('R5-H02','whole-program-strength-first','Twelve weeks of recreational hybrid training are desired. Squats, hinges, presses and rows are familiar at the explicit loads; running remains novice and uses walk/jog intervals. The athlete wants stronger lower-body performance and to retain aerobic participation.','GENERATE',p,assessment(
    'Strength priority must affect the actual week while running experience remains a separate dimension.',
    'Create a coherent strength-oriented program with real exercises, sets, reps, load conventions, rest and reserved effort; keep the modest walk/jog task compatible with the strength emphasis.',
    ['Maintain the current four-session arrangement pending new evidence.','Use a different supported arrangement if it protects the primary lower-body work and remains feasible.'],
    ['Do not translate strength experience into intermediate running capacity.','Do not replace load-bearing strength work with an unparameterized strength label.']));
}
{
  const p=balanced('balanced-frontier');
  add('R5-H03','balanced-pareto-conflict','Two self-reported compatible arrangements use exactly the same five physical tasks. One puts controlled running before the lower-body session; the other gives lower-body strength the first fresh day and puts controlled running the following day. The stated goal gives both modalities equal standing. A third arrangement repeats protect-run assignments but has explicitly adverse combined recovery. No current preference resolves the trade-off between the two compatible arrangements.','GENERATE',p,assessment(
    'Known adverse evidence can remove an otherwise identical candidate, but equal standing does not establish dominance between the two fresh-day allocations.',
    'Filter infeasible or genuinely dominated candidates before applying goal priority. Preserve the nondominated conflict or present a justified choice with its cost; BALANCED alone must not erase a real trade-off.',
    ['Keep either compatible arrangement if the unresolved cost is explicit.','Request the missing preference or further matched evidence instead of declaring one globally superior.'],
    ['Candidate ordering or arbitrary scalar weights are not evidence of dominance.','Known adverse combined recovery must not disappear because a schedule is convenient.']));
}
{
  const a=[anchor('novice-run','Repeat comfortable jog/walk exposure without importing strength fitness',run('WALK_JOG',26,{work:{repetitions:5,workMinutes:2,recoveryMinutes:2},warmupMinutes:3,cooldownMinutes:3})),anchor('short-run','A second short aerobic exposure',run('EASY',18,{warmupMinutes:3,cooldownMinutes:3})),anchor('experienced-lower','Preserve established lower strength task',lower(48,65)),anchor('experienced-upper','Preserve established upper strength task',upper(40,20))];
  const p=program('novice-asymmetry',a,{weeks:4,kind:'BALANCED',priority:'BALANCED',runExperience:'NOVICE',strengthExperience:'INTERMEDIATE',schedules:[schedule('novice-run-spaced',[['experienced-lower',0],['novice-run',2],['experienced-upper',4],['short-run',6]])]});
  add('R5-H04','novice-asymmetry','The adult is intermediate in resistance exercise and novice in running. The short aerobic tasks are complete recently tolerated tasks; a long run, threshold pace and race preparation have not been demonstrated. The four-week objective is repeatable hybrid participation.','GENERATE',p,assessment(
    'Training experience and demonstrated dose must remain specific to modality.',
    'Preserve the small current running exposure while retaining meaningful familiar strength. Make the short horizon and limited running evidence visible in any development plan.',
    ['KEEP all four tasks is acceptable.','A supported rearrangement that separates the novice running exposures is acceptable.'],
    ['Do not infer long-run capacity from a 65 kg squat task.','Do not call this four-week general hybrid phase half-marathon readiness.']));
}
{
  const p=general('general-fitness-no-learning',{learningConsent:false});
  add('R5-H05','general-fitness-consent','Eight weeks of enjoyable general fitness are requested by an intermediate recreational runner who is new to strength. The athlete explicitly declines persistent learning consent. Current self-reported weekly tolerance supports the listed easy running and modest strength practice.','GENERATE',p,assessment(
    'General fitness is a complete goal; it need not be converted into an event or maximal strength target. Consent limits learning, not the factual content of the current tasks.',
    'Produce a useful hybrid reference week and program horizon with both modalities represented. Respect the declined learning consent in any claimed learned response.',
    ['A conservative maintenance-oriented block is acceptable.','The explanation may request consent later without requiring it to describe current supported work.'],
    ['Do not manufacture an event, target pace, strength test or long-term personal learning state.','Running experience must not erase novice strength technique and reserve requirements.']));
}
{
  const p=general('cold-start'); p.weeks=4;
  for(const a of p.athlete.anchors) { a.current=false; a.familiar=false; a.tolerated=false; a.observedAt='2026-07-01'; }
  p.athlete.weeklyTolerance={current:false,observedAt:'2026-07-01',source:'SELF_REPORT',anchorIds:p.athlete.anchors.map(a=>a.id),recovery:'UNKNOWN'};
  p.scheduleOptions[0].evidence={current:false,observedAt:'2026-07-01',source:'SELF_REPORT',combinedRecovery:'UNKNOWN'};
  add('R5-H06','cold-start-limited-facts','The adult explicitly reports no current task or combined-week demonstration. The supplied prescriptions describe ideas the person might try, not current tolerated capacity. Nonclinical screening facts are explicit and current, while performance and weekly recovery remain unknown.','GENERATE',p,assessment(
    'Absence of current physical evidence is material even when the desired tasks look modest.',
    'Identify the missing current demonstration and combined-week tolerance; abstain from asserting that the complete proposed week is supported. Offer an appropriately bounded information-gathering or reference-only path.',
    ['A blocked/needs-facts result is acceptable.','A minimal clearly conditional familiarization reference is acceptable only if it does not relabel unknown capacity as demonstrated.'],
    ['Unknown response is not compatible recovery.','A current nonclinical status is not proof of tolerance for the proposed exercise week.']));
}
{
  const p=hm('rich-history',12); const arrangement=p.scheduleOptions[0].id;
  const h=[]; for(let i=0;i<4;i++) { h.push(history(p,'long-run',`rich-long-${i}`,plusDays(START,-28+i*7),arrangement)); h.push(history(p,'strength-maintenance',`rich-strength-${i}`,plusDays(START,-33+i*7),arrangement)); }
  add('R5-H07','rich-history-mixed-evidence','Eight complete recent historical tasks include four compatible long runs and four compatible strength tasks at their declared doses and arrangement. In week 1 the same long-run task is completed but feels harder and performs below usual, with compatible next-day recovery. The athlete reports a disrupted night of sleep, explicitly confounding that single response.','REVIEW',p,assessment(
    'The current response matters, but a confounded single execution should not erase repeated complete history or become a new stable ability estimate.',
    'Retain provenance and context, distinguish the isolated confounded response from a trend, and keep or conservatively review the current long-run task rather than assert a durable decline.',
    ['KEEP with a targeted follow-up observation is preferred.','A small reversible recovery-oriented adjustment is acceptable if justified as temporary uncertainty rather than inferred chronic incapacity.'],
    ['Do not convert a poor night into a diagnosis.','Do not count historical prescriptions as outcomes unless their supplied actual physical execution is retained.']),{review:review(p,'rich-current-review','REVIEW',1),target:{weekIndex:1,anchorId:'long-run'},observationFacts:[obs(1,'long-run','UNDER','COMPATIBLE','HARDER',{confounded:true})],historicalFacts:h});
}
{
  const p=hm('run-progression',8);
  const steps=[0,1,2].map((w)=>({review:review(p,`run-progress-${w}`,'PROGRESSION_TOO_EASY',w),target:{weekIndex:w,anchorId:'long-run'},observationFacts:[obs(w,'long-run','OVER','COMPATIBLE','EASIER')],adoptProposal:w===2}));
  add('R5-H08','run-progression-sequence','Across three chronological weeks, the athlete completes the same explicitly prescribed long-run work with easier-than-target effort and compatible recovery. A 70-minute long run is separately familiar, tolerated and supported by a complete-week self-report hash. Earlier proposals remain unadopted; only the third proposal may be adopted.','SEQUENCE',p,assessment(
    'Repeated comparable response may support a modest supported change, while observation, learning and explicit adoption remain separate steps.',
    'Carry actual observations forward, identify the repeated long-run response and consider the known 70-minute alternative without escalating unrelated strength or inventing race pace. A proposal must remain a shadow until the final explicit adoption.',
    ['KEEP is acceptable if the evidence threshold or weekly context is still insufficient, with that gap stated.','A modest familiar progression is acceptable after explaining why it fits the whole week.'],
    ['Do not count a proposed 70-minute task as already completed.','Do not adopt earlier unaccepted proposals or progress every session from one anchor trend.']),{steps});
}
{
  const p=strengthFirst('strength-progression'); const h=[];
  for(let i=0;i<3;i++) h.push(history(p,'lower-primary',`strength-easier-${i}`,plusDays(START,-21+i*7),'strength-separated','OVER','COMPATIBLE','EASIER'));
  add('R5-H09','strength-progression-physical-dose','The lower-body task includes three squat sets and three hinge sets at explicit total barbell loads. Three recent matched actual tasks and the current execution are easier than intended with compatible recovery. A small 2.5 kg load change has its own familiar tolerated complete-week support. The upper-body and walk/jog tasks have no new outcome evidence.','REVIEW',p,assessment(
    'A strength progression decision must operate on actual load-bearing work and its response rather than a modality tag.',
    'Consider a modest supported change to the matched lower-body task while preserving reps in reserve and the run/strength balance. Keep the other anchors unless their own facts justify a change.',
    ['KEEP with a clear evidence or uncertainty reason is acceptable.','A known lower-volume alternative remains acceptable if whole-week recovery context makes progression unsuitable.'],
    ['Do not treat per-hand and total loads as interchangeable.','Do not claim a new one-repetition maximum or infer novice running progression from lower-body overperformance.']),{review:review(p,'strength-current-easier','PROGRESSION_TOO_EASY',0),target:{weekIndex:0,anchorId:'lower-primary'},observationFacts:[obs(0,'lower-primary','OVER','COMPATIBLE','EASIER')],historicalFacts:h});
}
{
  const p=hm('essential-missed',8); const zero=stimulus(p.athlete.anchors.find(a=>a.id==='long-run').prescription); zero.durationMinutes=0; zero.warmupMinutes=0; zero.cooldownMinutes=0; zero.work=null;
  add('R5-H10','essential-session-missed','A work obligation causes the essential week-2 long run to be completely missed. The athlete explicitly reports zero minutes and no running work, with no pain or illness. No make-up capacity has been demonstrated, and the next week still contains the ordinary four tasks.','REVIEW',p,assessment(
    'Missing an important session changes the completed training record without creating a debt that must be repaid.',
    'Record the zero-work execution accurately and re-evaluate the remaining program around the run-first objective; preserve recovery and avoid stacking the missed long run on the next one.',
    ['KEEP the next supported week is acceptable.','A feasible rearrangement of an upcoming task is acceptable if it fits the whole week and does not invent tolerance.'],
    ['Zero work cannot count toward endurance completion or learning that the full dose was easy.','Essential does not mean compulsory catch-up volume.']),{review:review(p,'missed-long-work','MISSED_ESSENTIAL',2),target:{weekIndex:2,anchorId:'long-run'},observationFacts:[obs(2,'long-run','UNKNOWN','UNKNOWN','UNKNOWN',{completed:false,actualMinutes:0,actualStimulus:zero,comparable:false,confounded:true})]});
}
{
  const p=balanced('optional-missed'); const zero=stimulus(p.athlete.anchors.find(a=>a.id==='optional-easy').prescription); zero.durationMinutes=0; zero.warmupMinutes=0; zero.cooldownMinutes=0;
  add('R5-H11','optional-session-missed','The optional 22-minute easy run is skipped during a busy weekend. All essential running and strength tasks remain available as planned. The skipped outing has zero physical work and unknown response rather than inferred adverse recovery.','REVIEW',p,assessment(
    'Optional work should remain optional and should not destabilize the entire supported week when missed once.',
    'Preserve the factual missed record and ordinarily keep the essential program without compensatory volume or invented fatigue.',
    ['Remove the optional slot for the immediate week if schedule burden warrants it.','Ask about recurrent schedule pressure if that becomes material, without treating this single miss as a trend.'],
    ['Do not promote optional work to essential after it is missed.','Do not invent fitness loss or adverse recovery from a skipped task.']),{review:review(p,'missed-optional-busy','MISSED_OPTIONAL',1),target:{weekIndex:1,anchorId:'optional-easy'},observationFacts:[obs(1,'optional-easy','UNKNOWN','UNKNOWN','UNKNOWN',{completed:false,actualMinutes:0,actualStimulus:zero,comparable:false,confounded:false})]});
}
{
  const p=hm('isolated-under',8);
  add('R5-H12','isolated-underperformance','The week-0 controlled run is completed at its actual 3 x 6-minute work prescription, feels harder than target, and is reported as below usual performance. Recovery and ordinary function remain compatible, no confound is declared, and there is only this one comparable execution.','REVIEW',p,assessment(
    'One valid underperformance is a real signal but cannot by itself establish a durable model of decline.',
    'Use the single observation to watch or modestly adjust the matched running task while preserving the rest of the supported hybrid week; explain the evidence limit.',
    ['KEEP and observe another comparable execution is acceptable.','A temporary local reduction is acceptable if supported and explicitly bounded.'],
    ['Do not infer systemic fatigue, injury or a chronic inability from a single report.','Do not progress because the prescribed minutes were technically completed despite the adverse performance signal.']),{review:review(p,'single-controlled-under','UNDERPERFORMANCE',0),target:{weekIndex:0,anchorId:'controlled-run'},observationFacts:[obs(0,'controlled-run','UNDER','COMPATIBLE','HARDER')]});
}
{
  const p=strengthFirst('repeated-under');
  const steps=[0,1,2].map(w=>({review:review(p,`lower-repeat-under-${w}`,'UNDERPERFORMANCE',w),target:{weekIndex:w,anchorId:'lower-primary'},observationFacts:[obs(w,'lower-primary','UNDER','ADVERSE','HARDER')],adoptProposal:w===2}));
  add('R5-H13','repeated-underperformance-sequence','Three chronological lower-body sessions are complete at the declared loads but repeatedly perform below usual with harder-than-target effort and adverse next-day recovery. No pain, illness or injury is reported. Other anchors lack contrary execution evidence. The known lower-volume option has explicit complete-week support.','SEQUENCE',p,assessment(
    'Repeated matched adverse responses are more actionable than an isolated fluctuation, but remain nonclinical facts in this scenario.',
    'Accumulate distinct actual tasks, avoid progression, and consider the familiar lower-volume or recovery-oriented alternative while checking the complete week. Keep the response local unless other observations support a broader conclusion.',
    ['Pause a lower-body progression and retain a conservative baseline with a clear reason.','Propose a modest supported reduction and adopt it only on the final authorized step.'],
    ['Do not diagnose overtraining or an injury.','Do not keep requesting identical evidence indefinitely once a repeated material response is established.']),{steps});
}
{
  const p=hm('single-over',8);
  add('R5-H14','isolated-overperformance','One controlled run is completed exactly as prescribed and feels easier than target, with compatible recovery. No earlier comparable actual task is supplied. The athlete requests a faster next week but no faster task has current familiar/tolerated evidence.','REVIEW',p,assessment(
    'One easier execution can be acknowledged without turning it into a race-pace estimate or maximal progression.',
    'Record the good response and distinguish confidence in task completion from evidence for a new faster dose. Prefer KEEP or a bounded supported option if one exists.',
    ['Request another comparable observation.','Explain why an unsupported faster prescription remains conditional.'],
    ['Do not invent current speed zones, VO2max or a finish time.','The requested faster work is not made safe or supported merely by the athlete asking.']),{review:review(p,'single-easier-request','OVERPERFORMANCE',0),target:{weekIndex:0,anchorId:'controlled-run'},observationFacts:[obs(0,'controlled-run','OVER','COMPATIBLE','EASIER')]});
}
{
  const p=general('return-unknown');
  const elig={status:'UNKNOWN',assessedAt:'2026-10-01',pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false};
  add('R5-H15','return-current-capacity-unknown','After an explicitly nonclinical work interruption, the athlete wants to resume. Current ordinary function and exercise response are unreported, the last eligibility assessment is stale and its status is explicitly UNKNOWN. No current task demonstration is supplied. The old program is a historical reference, not current clearance.','REVIEW',p,assessment(
    'A nonclinical explanation for stopping does not supply missing current eligibility or exercise capacity.',
    'Keep return-to-training conditional on explicit current nonclinical and capacity facts. Preserve the old program without asserting that it can be resumed at its prior complete dose.',
    ['A needs-facts or out-of-scope/unknown result is acceptable.','State the specific current demonstration or ordinary-function report required before adaptation.'],
    ['Do not silently convert UNKNOWN eligibility into NONCLINICAL_CONFIRMED.','Absence of a reported symptom is not affirmative current clearance.']),{review:review(p,'return-work-unknown','RETURN',2,{eligibility:elig,interruption:{reason:'Work deadlines and stopped exercise for two weeks; current response not reported',clinicalReason:false},currentCapacityConfirmed:false}),target:{weekIndex:2,anchorId:'conversational-run'}});
}
{
  const p=general('return-current'); const demonstrated=run('EASY',20,{warmupMinutes:4,cooldownMinutes:4});
  alternative(p.athlete.anchors[0],'return-easy-20','REGRESS',demonstrated); supportAlternatives(p.athlete.anchors);
  const rv=review(p,'return-work-known','RETURN',2,{interruption:{reason:'Two weeks without planned exercise because of work travel; no clinical reason',clinicalReason:false},currentCapacityConfirmed:true,currentDemonstration:{current:true,observedAt:plusDays(START,18),response:'COMPATIBLE',ordinaryFunction:'COMPATIBLE',prescription:demonstrated}});
  add('R5-H16','return-confirmed-nonclinical','The adult explicitly confirms no clinical reason for the interruption and current ordinary function is compatible. A current self-reported 20-minute easy run was physically completed with compatible response after the interruption. This supports that task only; no current full-week or strength demonstration is claimed.','REVIEW',p,assessment(
    'Explicit current nonclinical facts and a smaller demonstrated task distinguish this return from the unknown-capacity case without granting unlimited capacity.',
    'Recognize the supported easy-running return and consider the familiar reduced task, while keeping the undemonstrated full week and strength capacity appropriately conditional.',
    ['A conservative staged reference return is acceptable.','KEEP a reduced supported task while requesting current strength or combined-week facts.'],
    ['Do not infer full-dose strength tolerance from a 20-minute run.','Do not deny that a current self-reported physical demonstration is a fact merely because it is synthetic.']),{review:rv,target:{weekIndex:2,anchorId:'conversational-run'}});
}
{
  const p=hm('return-clinical',8); const elig={status:'UNKNOWN',assessedAt:plusDays(START,20),pain:true,persistentPain:true,injury:true,illness:false,functionalLimitation:true,clinicalConcern:true};
  add('R5-H17','clinical-return-outside-scope','This fictional adult explicitly reports persistent lower-leg pain after an injury, difficulty with ordinary walking and a clinical concern. The requested return follows a clinical interruption. No medical diagnosis, treatment or clearance is supplied. This is intentionally outside the nonclinical coaching scope.','REVIEW',p,assessment(
    'Current clinical flags and functional limitation materially override the old nonclinical training reference.',
    'Identify the clinical return as outside this offline nonclinical coaching scope and avoid producing an executable training return prescription or inferred clearance.',
    ['Retain the prior program only as historical context while routing the unresolved clinical question appropriately.'],
    ['Do not diagnose the injury, prescribe rehabilitation or assume clearance from the earlier healthy program input.','Neither event urgency nor run priority can make clinical uncertainty disappear.']),{review:review(p,'return-clinical-flags','RETURN',2,{eligibility:elig,interruption:{reason:'Injury-associated persistent pain and impaired ordinary walking',clinicalReason:true},currentCapacityConfirmed:false}),target:{weekIndex:2,anchorId:'long-run'}});
}
{
  const p=general('schedule-reduced');
  const av=[{day:0,windows:[{id:'d0-am',startMinute:420,durationMinutes:35,equipment:clone(allEquipment)},{id:'d0-pm',startMinute:1080,durationMinutes:35,equipment:clone(allEquipment)}]},{day:3,windows:[{id:'d3-am',startMinute:420,durationMinutes:50,equipment:clone(allEquipment)}]},{day:6,windows:[{id:'d6-am',startMinute:420,durationMinutes:35,equipment:clone(allEquipment)}]}];
  const opts=[schedule('changed-double',[['conversational-run',0,'am'],['practice-a',0,'pm'],['longer-easy',3],['practice-b',6]],'COMPATIBLE',true,plusDays(START,13))];
  add('R5-H18','schedule-change-feasible-double','A new work schedule leaves four windows on three days. There are two distinct 35-minute windows on day 0, a 50-minute window on day 3 and a 35-minute window on day 6. The athlete explicitly reports having completed this same four-task double-day arrangement with compatible combined recovery at the new schedule.','REVIEW',p,assessment(
    'A double is neither inherently feasible nor infeasible; complete windows, equipment and combined response determine what is supported.',
    'Use the explicitly supported changed arrangement if the complete tasks fit, while retaining all physical work and checking the new week as a whole.',
    ['KEEP the tasks in the new compatible arrangement.','A different equally feasible supported arrangement is acceptable if its evidence is explicit.'],
    ['Do not merge separate windows into one impossible overlapping session.','Do not treat a schedule move as an actually completed task or as a dose progression.']),{review:review(p,'work-schedule-three-days','SCHEDULE_CHANGE',1,{availability:av,scheduleOptions:opts}),target:{weekIndex:1,anchorId:'practice-a'}});
}
{
  const p=general('travel-substitution'); const replacement=hotelPractice();
  for(const a of p.athlete.anchors.filter(a=>a.prescription.modality==='STRENGTH')) alternative(a,`${a.id}-hotel`,'SUBSTITUTE',replacement);
  supportAlternatives(p.athlete.anchors);
  const av=availability([0,2,4,6],50).map(d=>({...d,windows:d.windows.map(w=>({...w,equipment:['OUTDOOR','BODYWEIGHT']}))}));
  add('R5-H19','travel-equipment-substitution','During travel the available windows retain outdoor running and bodyweight equipment but contain no dumbbells, bench, rack or barbell. A familiar 25-minute bodyweight squat, incline-push-up and reverse-lunge task is explicitly supplied as a supported alternative to each novice strength practice. No equivalent external load or strength outcome is claimed.','REVIEW',p,assessment(
    'A practical substitute can maintain participation while changing the physical stimulus; equipment feasibility must be real.',
    'Consider the known equipment-compatible practice alternatives, retain the feasible easy runs and make the change in strength stimulus transparent.',
    ['Temporarily omit an unavailable strength task if substituting cannot preserve the requested objective.','Use one supported bodyweight exposure and keep the other conditional on combined-week evidence.'],
    ['Do not prescribe dumbbells in a bodyweight-only window.','Do not claim bodyweight practice is quantitatively equal to external-load strength progression.']),{review:review(p,'travel-no-dumbbells','TRAVEL',1,{availability:av,scheduleOptions:[schedule('hotel-week',[['conversational-run',0],['practice-a',2],['longer-easy',4],['practice-b',6]],'COMPATIBLE',true,plusDays(START,13))]}),target:{weekIndex:1,anchorId:'practice-a'}});
}
{
  const p=balanced('double-infeasible');
  const av=availability([0,1,3,4,6],70); av.find(d=>d.day===0).windows=[{id:'d0-am',startMinute:420,durationMinutes:70,equipment:clone(allEquipment)}];
  const same=schedule('same-single-window',[['quality-run',0],['lower-strength',0],['long-easy',3],['upper-strength',4],['optional-easy',6]],'ADVERSE',true,plusDays(START,6));
  const spread=schedule('spread-feasible',[['quality-run',0],['lower-strength',1],['long-easy',3],['upper-strength',4],['optional-easy',6]],'COMPATIBLE',true,plusDays(START,6));
  add('R5-H20','double-infeasible-pareto-first','The proposed same-day double assigns a 44-minute controlled run and a 50-minute lower-body session to the same single 70-minute window. It also has explicitly adverse combined recovery. A complete supported spread arrangement fits the distinct windows and retains all five tasks.','REVIEW',p,assessment(
    'An overlapping 94-minute pair cannot fit a 70-minute window, independent of goal priority; the feasible supported candidate should survive before any trade-off weighting.',
    'Exclude the physically infeasible double and consider the complete compatible spread arrangement without changing the work merely to make arithmetic appear feasible.',
    ['KEEP the task doses with the spread arrangement.','If other constraints invalidate the spread option, expose that new gap rather than silently overlap work.'],
    ['Do not use BALANCED as permission to overlap sessions.','Do not invoke run/strength priority to rescue a dominated infeasible arrangement.']),{review:review(p,'double-overlap','DOUBLE_INFEASIBLE',0,{availability:av,scheduleOptions:[same,spread]}),target:{weekIndex:0,anchorId:'lower-strength'}});
}
{
  const p=balanced('learned-arrangement'); p.scheduleOptions=p.scheduleOptions.slice(0,2);
  for(const s of p.scheduleOptions) s.evidence.combinedRecovery='UNKNOWN';
  const h=[]; for(let i=0;i<3;i++) { h.push(history(p,'quality-run',`arr-run-fresh-${i}`,plusDays(START,-42+i*14),'protect-run','COMPATIBLE','COMPATIBLE','ON_TARGET')); h.push(history(p,'quality-run',`arr-run-after-lower-${i}`,plusDays(START,-35+i*14),'protect-strength','UNDER','ADVERSE','HARDER')); }
  add('R5-H21','learned-response-arrangement','Six historical actual controlled runs have the same task, equipment, phase and priority. Three in protect-run are compatible; three in protect-strength are underperforming with adverse recovery. The schedule options themselves currently report UNKNOWN combined recovery. The history says something about this matched run in these arrangements, not every possible week or all strength outcomes.','REVIEW',p,assessment(
    'Arrangement-specific actual responses can resolve part of an otherwise balanced conflict, provided they remain contextual and do not become universal dose claims.',
    'Retain matched historical physical tasks and their arrangement provenance, and let the repeated response inform the schedule decision or an explicit remaining uncertainty.',
    ['Prefer protect-run conditionally on the whole-week and strength evidence.','KEEP with a request for matched lower-body response is acceptable if the system cannot establish a whole-week comparison.'],
    ['Do not pool both arrangements into a claim that controlled running itself is universally harmful.','Three favorable run observations do not prove all other tasks or combined weeks are compatible.']),{review:review(p,'arrangement-learning-review','CONFLICT',0),target:{weekIndex:0,anchorId:'quality-run'},historicalFacts:h});
}
{
  const p=hm('event-short-horizon',4);
  const eventAnchors=[anchor('easy-a','Familiar short easy event-week outing',run('EASY',20)),anchor('controlled-run','Familiar reduced controlled event-week task',run('CRUISE',28,{work:{repetitions:2,workMinutes:4,recoveryMinutes:2},warmupMinutes:8,cooldownMinutes:5})),anchor('long-run','Familiar shorter easy outing before event',run('LONG',35)),anchor('strength-maintenance','Familiar low-volume strength practice',strength('FULL_BODY',28,full(45,16).exercises.map(x=>({...x,sets:1}))))];
  supportAlternatives(eventAnchors);
  p.eventWeek={goalKind:'HALF_MARATHON',eventDate:p.athlete.goal.eventDate,baselineHash:configurationHash(p.athlete.anchors),anchors:eventAnchors,weeklyTolerance:{current:true,observedAt:START,source:'SELF_REPORT',anchorIds:eventAnchors.map(a=>a.id),recovery:'COMPATIBLE'},scheduleOptions:[schedule('familiar-event-week',[['easy-a',0],['strength-maintenance',1],['controlled-run',2],['long-run',4]])]};
  add('R5-H22','event-horizon-supported-event-week','The half marathon is four weeks from program start. The athlete supplies an independently familiar complete reduced event-week configuration, current compatible self-reported combined tolerance and an event date. The event is not supplied as a completed performance, and no finish-time capacity is claimed.','GENERATE',p,assessment(
    'A short event horizon should constrain what development can be claimed; an explicit supported event-week configuration can be used without inventing a taper or capacity guarantee.',
    'Relate the program blocks and final week to the stated event date, preserve the provenance of the supplied reduced physical tasks and avoid last-minute unsupported overload.',
    ['Use the supplied event-week reference conditionally on its continuing validity.','Keep the ordinary baseline while clearly exposing any evidence gap in activating the event-week configuration.'],
    ['Do not infer half-marathon readiness or a promised finish from a 65-minute long run.','Do not count the future race as an actual observation or learning outcome.']));
}
{
  const p=general('unknown-response');
  const a=p.athlete.anchors.find(x=>x.id==='longer-easy'); const partial=stimulus(a.prescription); partial.durationMinutes=24; partial.warmupMinutes=5; partial.cooldownMinutes=4;
  add('R5-H23','unknown-and-partial-observation','The 42-minute longer-easy outing ends after 24 actual minutes for a nonclinical family obligation. The full physical partial stimulus is declared. Performance, recovery and effort are explicitly UNKNOWN; the task is not comparable to a full execution. A separate strength task was physically complete but its subjective response is also unknown.','REVIEW',p,assessment(
    'Physical completion and subjective response are different facts; neither partial work nor unknown recovery may be expanded into a compatible full-dose observation.',
    'Retain 24 minutes of actual running, the incomplete flag and explicit unknown response. Keep any learning limited to the facts and avoid deriving progression or adverse capacity from the interruption.',
    ['KEEP the supported future baseline with a request for complete comparable observations.','Temporarily simplify the schedule if repeated family constraints emerge, while keeping that distinct from a fitness claim.'],
    ['AS_PRESCRIBED for the complete strength task describes work, not compatible response.','No conversion of unknown to compatible, and no fictional extra 18 running minutes.']),{review:review(p,'partial-family-obligation','REVIEW',0),target:{weekIndex:0,anchorId:'longer-easy'},observationFacts:[obs(0,'longer-easy','UNKNOWN','UNKNOWN','UNKNOWN',{completed:false,actualMinutes:24,actualStimulus:partial,comparable:false,confounded:true}),obs(0,'practice-a','UNKNOWN','UNKNOWN','UNKNOWN',{comparable:false})]});
}
{
  const p=strengthFirst('stale-duplicates'); const a=p.athlete.anchors.find(x=>x.id==='lower-primary');
  for(const alt of a.alternatives) {alt.observedAt='2025-08-01';alt.weeklyContext.observedAt='2025-08-01';}
  const old=history(p,'lower-primary','old-task-stable-id','2025-08-02','strength-separated','OVER','COMPATIBLE','EASIER');
  const contradictory=clone(old); contradictory.actualStimulus.exercises[0].sets=1; contradictory.actualMinutes=25; contradictory.performance='UNDER'; contradictory.recovery='ADVERSE'; contradictory.effort='HARDER';
  const steps=[
    {review:review(p,'stale-source-first','REVIEW',0),target:{weekIndex:0,anchorId:'lower-primary'},historicalFacts:[clone(old)],adoptProposal:false},
    {review:review(p,'stale-source-replayed','REVIEW',1),target:{weekIndex:1,anchorId:'lower-primary'},historicalFacts:[clone(old)],adoptProposal:false},
    {review:review(p,'stale-source-contradiction','REVIEW',2),target:{weekIndex:2,anchorId:'lower-primary'},historicalFacts:[contradictory],observationFacts:[obs(2,'lower-primary','COMPATIBLE','UNKNOWN','ON_TARGET',{comparable:false})],adoptProposal:false}
  ];
  add('R5-H24','stale-duplicate-conflicting-provenance','One physical strength task from 2025 is replayed in the next review with the same source identity, then replayed with that same identity but conflicting actual sets, minutes and response. The supported alternatives also have stale 2025 contextual timestamps. A genuinely new current execution has unknown recovery and is not comparable. All source-quality problems are intentional.','SEQUENCE',p,assessment(
    'A learning system must distinguish new evidence from a replay and preserve uncertainty when an identity is reused for contradictory facts; stale support does not become current through replay.',
    'Do not count the duplicate as another successful task. Surface or quarantine the contradictory identity and stale alternative support, keep the new unknown-recovery execution separate, and avoid unsupported progression.',
    ['KEEP while requesting fresh coherent current evidence.','Reject the conflicted historical source or mark its contribution uncertain, provided the actual current record is retained.'],
    ['Three reviews do not equal three actual successful strength tasks.','Do not silently choose whichever contradictory payload best supports a desired progression.']),{steps});
}

// Public-contract-only checks: syntax, identities, calendar, references, and supplied hashes.
// These checks do not import or predict the engine and do not judge runtime behavior.
assert.equal(cases.length,24);
assert.equal(new Set(cases.map(c=>c.caseId)).size,24);
const operations={}; const familySet=new Set();
function validDate(s) { assert(/^\d{4}-\d{2}-\d{2}$/.test(s),`Date shape ${s}`); assert.equal(new Date(`${s}T00:00:00Z`).toISOString().slice(0,10),s); }
function validatePrescription(p) {
  assert(['RUN','STRENGTH'].includes(p.modality)); assert(p.durationMinutes>0);
  assert(Array.isArray(p.equipment));
  if(p.modality==='RUN') { assert(p.warmupMinutes+p.cooldownMinutes<=p.durationMinutes); if(p.work) assert(p.work.repetitions*p.work.workMinutes + Math.max(0,p.work.repetitions-1)*p.work.recoveryMinutes+p.warmupMinutes+p.cooldownMinutes<=p.durationMinutes,`Work exceeds duration: ${JSON.stringify(p)}`); }
  else { assert(p.exercises.length>0); for(const e of p.exercises){assert(e.sets>0 && e.reps>0);assert(e.load.value>=0);assert(['KG','BODYWEIGHT'].includes(e.load.unit));assert(['TOTAL','PER_HAND','BODYWEIGHT'].includes(e.load.convention));} }
}
function validateSchedule(ss,anchors,av) {
  const ids=new Set(anchors.map(a=>a.id));
  for(const s of ss){validDate(s.evidence.observedAt); for(const a of s.assignments){assert(ids.has(a.anchorId));assert(Number.isInteger(a.day)&&a.day>=0&&a.day<=6);assert(av.some(d=>d.day===a.day&&d.windows.some(w=>w.id===a.windowId)),`Unknown window ${s.id}/${a.windowId}`);} }
}
function validateFacts(facts,p,rv) {
  for(const f of facts??[]){assert(p.athlete.anchors.some(a=>a.id===f.anchorId));assert(['COMPATIBLE','UNDER','OVER','UNKNOWN'].includes(f.performance));assert(['COMPATIBLE','ADVERSE','UNKNOWN'].includes(f.recovery));assert(['ON_TARGET','EASIER','HARDER','UNKNOWN'].includes(f.effort));assert(typeof f.completed==='boolean');assert(f.actualStimulus==='AS_PRESCRIBED'||typeof f.actualStimulus==='object');if(f.date){validDate(f.date);assert(f.date<=rv.asOf.slice(0,10));validatePrescription(f.prescription);assert(p.scheduleOptions.some(s=>s.id===f.arrangement));}else{assert(f.weekIndex<=rv.weekIndex);}}
}
for(const c of cases){
  operations[c.operation]=(operations[c.operation]??0)+1; familySet.add(c.family);
  assert(['GENERATE','REVIEW','SEQUENCE'].includes(c.operation));assert(c.scenario.length>100);
  const p=c.programInput; assert.equal(p.synthetic,true); assert.equal(p.version,'R5-INPUT-1'); assert([4,8,12,16].includes(p.weeks));validDate(p.asOf);validDate(p.startDate);
  assert(p.athlete.ageYears>=18); assert.equal(new Set(p.athlete.anchors.map(a=>a.id)).size,p.athlete.anchors.length);
  for(const a of p.athlete.anchors){validatePrescription(a.prescription);validDate(a.observedAt);for(const alt of a.alternatives??[]){validatePrescription(alt.prescription);validDate(alt.observedAt);assert.equal(alt.weeklyContext.baselineHash,configurationHash(p.athlete.anchors));const proposed=p.athlete.anchors.map(x=>({...x,prescription:x.id===a.id?alt.prescription:x.prescription}));assert.equal(alt.weeklyContext.proposedHash,configurationHash(proposed));}}
  validateSchedule(p.scheduleOptions,p.athlete.anchors,p.availability);
  if(p.athlete.goal.eventDate){validDate(p.athlete.goal.eventDate);assert(p.athlete.goal.eventDate>=p.startDate);assert(p.athlete.goal.eventDate<=plusDays(p.startDate,p.weeks*7-1));}
  if(p.eventWeek){assert.equal(p.eventWeek.baselineHash,configurationHash(p.athlete.anchors));for(const a of p.eventWeek.anchors)validatePrescription(a.prescription);validateSchedule(p.eventWeek.scheduleOptions,p.eventWeek.anchors,p.availability);}
  const aa=c.independentAssessment; assert(aa.rationale.length>60&&aa.preferredCoachingBehavior.length>80);assert(aa.acceptableAlternatives.length&&aa.concerns.length);
  const steps=c.operation==='SEQUENCE'?c.steps:c.operation==='REVIEW'?[c]:[]; let previousDate='';
  for(const s of steps){const rv=s.review;assert.equal(rv.version,'R5-REVIEW-1');assert.equal(rv.synthetic,true);assert(rv.weekIndex>=0&&rv.weekIndex<p.weeks);assert(rv.asOf>previousDate);previousDate=rv.asOf;assert.equal(rv.asOf.slice(0,10),plusDays(p.startDate,rv.weekIndex*7+6));if(s.target){assert.equal(s.target.weekIndex,rv.weekIndex);assert(p.athlete.anchors.some(a=>a.id===s.target.anchorId));}validateFacts(s.observationFacts,p,rv);validateFacts(s.historicalFacts,p,rv);if(rv.scheduleOptions)validateSchedule(rv.scheduleOptions,p.athlete.anchors,rv.availability??p.availability);}
}
assert.equal(familySet.size,24);
const corpus={revision:'R5-INDEPENDENT-HOLDOUT-1',cases};
const raw=Buffer.from(JSON.stringify(corpus,null,2)+'\n','utf8');
assert.equal(JSON.parse(raw).cases.length,24);
const sealedAt=new Date().toISOString();
const coverage={caseCount:24,operations,uniqueFamilies:familySet.size,programHorizons:[...new Set(cases.map(c=>c.programInput.weeks))].sort((a,b)=>a-b),caseIds:cases.map(c=>c.caseId),themes:['whole-program run-first HM16','strength-first real loaded work','balanced Pareto before unresolved priority tradeoff','novice experience asymmetry','general fitness and declined learning consent','cold start with explicit insufficient evidence','rich complete historical tasks','run progression across chronological reviews','strength progression with physical loads','essential missed work','optional missed work','isolated underperformance','repeated adverse response','isolated overperformance','return with unknown current capacity','explicit current nonclinical return demonstration','clinical return outside scope','schedule change with supported double','travel equipment substitution','overlapping infeasible double','arrangement-specific learned response','event horizon and supplied reduced event week','partial physical execution and unknown response','stale duplicated and contradictory source identity']};
const inspectedFiles=[
  {path:'CoachingCore/r5/holdout/INTERFACE_ONLY.md',scope:'Full public representation contract only',sha256:sha(fs.readFileSync(path.join(here,'INTERFACE_ONLY.md')))},
  {path:'CoachingCore/r5/RUNTIME_FREEZE_R5.json',scope:'Freeze metadata only; no referenced file contents read',sha256:sha(freezeRaw)},
  {path:'C:/Users/carva/.agents/skills/route-work/SKILL.md',scope:'Global routing policy; not runtime information'},
  {path:'C:/Users/carva/.codex/agent-system/protocols/EXECUTION_PROPORTIONALITY.md',scope:'Global proportionality policy; not runtime information'},
  {path:'C:/Users/carva/.agents/skills/verify-before-completion/SKILL.md',scope:'Global objective-evidence policy; not runtime information'},
  {path:'C:/Users/carva/.codex/agent-system/registry/routing.json',scope:'Global routing matrix; not runtime information'},
  {path:'C:/Users/carva/.codex/agent-system/registry/ROUTING.md',scope:'Global routing guide; not runtime information'}
];
const manifest={revision:'R5-INDEPENDENCE-MANIFEST-1',corpus:'CoachingCore/r5/holdout/R5_INDEPENDENT_HOLDOUT.json',date:sealedAt.slice(0,10),author:'Fresh independent holdout author /root/holdout_author',authorStartedAt,authorStartClockBasis:'First recorded UTC checkpoint after permitted interface reads and before drafting cases; freeze was already present before task dispatch',sealedAt,freezeDigest:freeze.sourceDigest,freezeTimestamp:freeze.frozenAt,freezeManifestRawSha256:sha(freezeRaw),corpusRawSha256:sha(raw),hashMode:'SHA256 over exact UTF-8 corpus bytes including final newline; not parsed/canonical JSON',bytes:raw.length,engineImplementationByAuthor:false,runtimeInspectedBeforeSeal:false,outputsInspectedBeforeSeal:false,runtimeImportedOrExecutedByAuthor:false,developmentFixturesInspected:false,earlierHoldoutsInspected:false,assessmentsAuthoredBeforeRuntimeOutput:true,firstEvaluationExecutedByAuthor:false,inspectedFiles,representationClarifications:[{source:'Parent task message, representation only',fields:['historicalFacts.phase enum','historicalFacts.arrangement is scheduleOption id','currentDemonstration.response and ordinaryFunction COMPATIBLE/ADVERSE/UNKNOWN','explicit RUN and STRENGTH actual stimulus shapes'],runtimeBehaviorOrResultsProvided:false}],scope:'Offline synthetic recreational-adult reference evidence only; no real athlete, clinical diagnosis/clearance, UI, KMP, production or external publication',ownership:['R5_INDEPENDENT_HOLDOUT.json','INDEPENDENCE_MANIFEST.json','build-independent-holdout.mjs'],routing:{phase:'review-evidence-authoring',tier:'T2',risk:'R2',rigor:'L2',owner:'/root/holdout_author',impact:'medium: independent evidence for material domain behavior',irreversibility:'low: local synthetic files',uncertainty:'medium: behavior intentionally unobserved',dependencies:'medium: frozen representation contract and separate first-evaluation owner',flags:{independent_review:true,measurement:true,behavior:false,code_changed:false,new_trust_boundary:false,sensitive_data:false},independence:'This author does not implement or judge runtime outputs. Root separately executes the first evaluation; no child delegation.'},checks:{mechanism:'Node24 standard fs/crypto/assert only; no engine imports',node:process.version,syntaxAndRoundTrip:true,uniqueCaseAndAnchorIds:true,calendarAndChronology:true,assignmentWindowReferences:true,prescriptionPhysicalRepresentation:true,suppliedConfigurationHashIntegrity:true,expectedBehaviorValidated:false,engineBehaviorPrevalidated:false},coverage,preservation:'Exclusive-create writes; builder aborts if corpus or manifest already exists. Do not edit corpus after seal; preserve original for first evaluation.'};
fs.writeFileSync(outputPath,raw,{flag:'wx'});
assert.equal(sha(fs.readFileSync(outputPath)),manifest.corpusRawSha256);
fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({corpus:outputPath,manifest:manifestPath,seal:manifest.corpusRawSha256,sealedAt,bytes:raw.length,coverage,engineExecuted:false},null,2));
