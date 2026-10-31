// DOMAIN_COACHING_R7-B: running repertoire bound to the runtime. Families and their eligibility; the R6 quality gates restated in B0 (B0-FIDELITY
// M1–M3, the defect corrected during B0, guarded here against regression); strides optionality (B0-C01 c8); graduation on executed evidence
// (B0-C01); familiar repeated bouts (B0-C02); later-gate fallbacks and the 5K fallback (B0-C10); taper. Negative cases are included.
import test from 'node:test';
import assert from 'node:assert/strict';
import {program,reviewed,weekly,review,evaluateProgram,opts,runs,live,gen,obs} from '../r7/b/fixtures/helpers.mjs';
import {runRepertoireOf} from '../src/r7b-repertoire.mjs';
import {validateWeeks,skeletonOf} from '../src/r6-program.mjs';
import {historicalStateOf} from '../src/r6-adaptation.mjs';

const RUN_ONLY={goals:{run:'PERFORMANCE',strength:'NONE'},schedule:{strengthDays:[]}};
const families=p=>new Set(p.weeks.flatMap(w=>runs(p,w.index).map(s=>runRepertoireOf(s.prescription).family)));
const quality=p=>p.weeks.flatMap(w=>runs(p,w.index).filter(s=>['THRESHOLD','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','FAMILIAR_REPEATED_BOUTS'].includes(s.prescription.family)));

test('Running families by class: walk/jog for a never-runner, the reviewed easy entry when exposure is unknown, threshold after executed easy weeks, event-specific, race touch and race for an event',()=>{
 const never=program({id:'r-fam-never',...RUN_ONLY,runExperience:'NONE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:0},schedule:{strengthDays:[],runDays:[1,3,5,6]}});
 assert.ok(families(never).has('RUN.WALK_JOG'));assert.ok(families(never).has('RUN.WALK'),'a fourth chosen day keeps a walk');assert.equal(quality(never).length,0);
 assert.ok(runs(never,0).filter(s=>s.prescription.family==='WALK_JOG').length<=3,'at most three walk/jog exposures');
 const unknown=program({id:'r-fam-unknown',...RUN_ONLY,recent:{runDaysPerWeek:3,runMinutesPerWeek:null,longestRunMinutes:null}});
 assert.equal(unknown.capability.run.class,'EASY_UNKNOWN');assert.ok(runs(unknown,0).filter(s=>s.prescription.family!=='WALK').every(s=>s.prescription.durationMinutes<=20));
 const current=program({id:'r-fam-current',...RUN_ONLY});assert.ok(families(current).has('RUN.THRESHOLD'));
 const firstQ=current.weeks.findIndex(w=>runs(current,w.index).some(s=>s.prescription.family==='THRESHOLD'));assert.ok(firstQ>=2,'quality after two executed established easy weeks, never week 1');
 const q0=runs(current,firstQ).find(s=>s.prescription.family==='THRESHOLD').prescription;assert.equal(q0.calibration.firstExposure,true);assert.equal(q0.calibration.paceFromGoalTime,false);
 const ev=program({id:'r-fam-event',goals:{run:'RACE',strength:'NONE'},event:{kind:'10K',date:'2027-01-24'},weeks:16,recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70},schedule:{strengthDays:[],runDays:[1,3,5,6]}});
 for(const f of ['RUN.EVENT_SPECIFIC','RUN.RACE','RUN.RACE_TOUCH','RUN.LONG','RUN.EASY'])assert.ok(families(ev).has(f),f);
 assert.equal(ev.phases.phases.filter(p=>p==='TAPER').length,1,'one taper week (multi-week taper is later-gated)');
});

test('B0-FIDELITY M1–M3 regression guard: quality is never released by apparent capacity alone (goal RACE/PERFORMANCE, at least three run days, development context, authority)',()=>{
 for(const goal of ['REGULAR','GENERAL']){const p=program({id:'r-gate-'+goal,goals:{run:goal,strength:'NONE'},schedule:{strengthDays:[]},recent:{runDaysPerWeek:5,runMinutesPerWeek:300,longestRunMinutes:100}});assert.equal(quality(p).length,0,goal+': a strong runner with a non-performance goal gets no quality');}
 const two=gen({id:'r-gate-2days',...RUN_ONLY,schedule:{strengthDays:[],runDays:[2,6]}});assert.equal(quality(two.program).length,0);assert.ok(two.negotiation.some(n=>n.id==='QUALITY_NEEDS_THREE_RUN_DAYS'&&n.options.includes('Add a run day')));
 const noAuth=program({id:'r-gate-auth',...RUN_ONLY},{authority:{...opts.authority,approved:Object.fromEntries(Object.entries(opts.authority.approved).filter(([k])=>k!=='R6-RUN-QUALITY'))}});assert.equal(quality(noAuth).length,0);
 const low=program({id:'r-gate-low',...RUN_ONLY,runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35}});assert.equal(quality(low).length,0,'EASY_LOW: no quality in the plan until a review graduates the athlete on executed evidence');
 // At most one quality session a week, never the day before or after the long run when another chosen run day can hold it.
 const p=program({id:'r-gate-one',...RUN_ONLY,schedule:{strengthDays:[],runDays:[1,3,5,6],longRunDay:6}});
 for(const w of p.weeks){const q=runs(p,w.index).filter(s=>['THRESHOLD','FAMILIAR_REPEATED_BOUTS'].includes(s.prescription.family));assert.ok(q.length<=1);for(const s of q)assert.ok(![0,5].includes(s.day),'not adjacent to the Sunday long run');}
 // The guard fails closed on a planted quality session for a non-performance goal.
 const reg=program({id:'r-gate-plant',goals:{run:'REGULAR',strength:'NONE'},schedule:{strengthDays:[]}}),cur=program({id:'r-gate-donor',...RUN_ONLY});
 const donor=cur.weeks.flatMap(w=>w.sessions).find(s=>s.prescription?.family==='THRESHOLD'),wk=reg.weeks[4],target=wk.sessions.find(s=>s.role==='EASY');
 const planted={...wk,sessions:wk.sessions.map(s=>s===target?{...s,role:'QUALITY',prescription:donor.prescription}:s)};
 assert.ok(validateWeeks(skeletonOf(reg,opts.authority),[planted]).some(e=>/qualityGate/.test(e)));
});

test('B0-C01 c8: strides stay optional for walk/jog-, restart- and easy-low-started athletes and for never-runners and novices; not for an easy-current intermediate',()=>{
 const optional=p=>p.weeks.flatMap(w=>runs(p,w.index).filter(s=>s.prescription.strides)).map(s=>s.prescription.strides.optional===true);
 const low=program({id:'r-str-low',...RUN_ONLY,runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:50,longestRunMinutes:25}});
 assert.equal(low.capability.run.class,'EASY_LOW');assert.ok(optional(low).length&&optional(low).every(Boolean));
 const nov=program({id:'r-str-novice',...RUN_ONLY,runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35}});assert.ok(optional(nov).every(Boolean));
 const cur=program({id:'r-str-current',...RUN_ONLY});assert.ok(optional(cur).length&&optional(cur).every(x=>!x));
 const wj=program({id:'r-str-wj',...RUN_ONLY,runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:2,runMinutesPerWeek:20,longestRunMinutes:10},weeks:16});
 assert.equal(wj.capability.run.class,'WALK_JOG');assert.ok(optional(wj).every(Boolean));
});

const GRAD={id:'r-grad',...RUN_ONLY,runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35},schedule:{strengthDays:[],runMinutes:45},weeks:16};
test('B0-C01 graduation: two complete easy weeks of at least 60 executed minutes on two days graduate at the block boundary; the threshold ladder enters at step 0 by effort, a calibration, with the easy run as an equal alternative and nothing else stepping',()=>{
 const t=reviewed(GRAD,3);
 const r=weekly(t,3);assert.equal(r.action,'RUN_QUALITY_GRADUATION');assert.ok(r.disclosures.some(d=>d.id==='RUN_QUALITY_INTRODUCED'&&d.options.some(o=>/no penalty/.test(o))));
 const g=t.p.canonical.athlete.runGraduation;assert.equal(g.fromWeek,4);assert.ok(g.qualifyingWeeks.every(x=>x.minutes>=60&&x.days>=2));
 const q=runs(t.p,4).find(s=>s.role==='QUALITY');assert.ok(q,'quality in the introduction week');
 assert.equal(q.prescription.family,'THRESHOLD');assert.equal(q.progression.value,0);assert.equal(q.prescription.calibration.firstExposure,true);assert.equal(q.prescription.effortDomain,'THRESHOLD_CONTROLLED');
 assert.equal(q.introduction,true);assert.equal(q.alternative.role,'EASY');assert.match(q.explanation,/equal alternative/);
 // Nothing else steps in the introduction week: the long and easy runs are at most what was executed.
 const executed=k=>Math.max(...runs(t.p,k).filter(s=>s.role==='LONG').map(s=>s.prescription.durationMinutes));
 assert.ok(runs(t.p,4).find(s=>s.role==='LONG').prescription.durationMinutes<=Math.max(executed(2),executed(3)));
 assert.ok(Math.max(...runs(t.p,4).filter(s=>s.role==='EASY').map(s=>s.prescription.durationMinutes))<=Math.max(...[2,3].flatMap(k=>runs(t.p,k).filter(s=>s.role==='EASY').map(s=>s.prescription.durationMinutes))));
 // HistoricalState: once the introduction week is closed by evidence, the evidence reducer holds the graduation too (each week judged under
 // its own context), so history and the plan agree and a later return keeps it.
 weekly(t,4);const h=historicalStateOf(t.p,{asOf:t.p.weeks[5].startDate+'T12:00:00Z',actualLedger:t.ledger},opts);
 assert.equal(h.state.run.qualityRunner,true);assert.equal(h.state.run.graduatedAt,4);
 // Strides stay optional after graduation.
 assert.ok(runs(t.p,5).filter(s=>s.prescription.strides).every(s=>s.prescription.strides.optional));
});

test('B0-C01 negatives: 40-minute weeks, an adverse report, a declined offer, a non-performance goal or two run days never graduate; projections never graduate',()=>{
 const short=reviewed({...GRAD,id:'r-grad-short',runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:40,longestRunMinutes:20},schedule:{strengthDays:[],runMinutes:20,longRunMinutes:20}},3);
 const s=weekly(short,3);assert.notEqual(s.action,'RUN_QUALITY_GRADUATION');assert.ok(s.disclosures.some(d=>d.id==='RUN_QUALITY_NOT_YET'&&d.weeks.some(x=>x.why==='BELOW_RUNNING_THRESHOLD')),'WN-25');
 const adv=reviewed({...GRAD,id:'r-grad-adverse'},2);weekly(adv,2,{o:s=>s.role==='LONG'?{response:{performance:'UNDER',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'IMPAIRED'}}:{}});
 assert.notEqual(weekly(adv,3).action,'RUN_QUALITY_GRADUATION');
 const dec=reviewed({...GRAD,id:'r-grad-decline'},3);const d=weekly(dec,3,{extra:{choices:[{offer:'RUN_QUALITY_GRADUATION',decision:'DECLINE'}]}});
 assert.notEqual(d.action,'RUN_QUALITY_GRADUATION');assert.ok(d.disclosures.some(x=>x.id==='RUN_QUALITY_GRADUATION_DECLINED'));assert.equal(runs(dec.p,4).filter(s=>s.role==='QUALITY').length,0);
 const reg=reviewed({...GRAD,id:'r-grad-regular',goals:{run:'REGULAR',strength:'NONE'}},3);assert.notEqual(weekly(reg,3).action,'RUN_QUALITY_GRADUATION');
 const two=reviewed({...GRAD,id:'r-grad-two',schedule:{strengthDays:[],runDays:[2,6],runMinutes:45}},3);assert.notEqual(weekly(two,3).action,'RUN_QUALITY_GRADUATION');
 assert.equal(quality(program(GRAD)).length,0,'the conditional plan never graduates by itself');
});

test('B0-C01 c2: a walk/jog starter is assessed only on a block run entirely in easy mode after the exit',()=>{
 const wj={id:'r-grad-wj',...RUN_ONLY,runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:40,longestRunMinutes:12},schedule:{strengthDays:[],runMinutes:45},weeks:16};
 const t=reviewed(wj,0);assert.equal(t.p.capability.run.class,'WALK_JOG');
 for(let w=0;w<16;w++){
  const r=weekly(t,w);
  if(r.action==='RUN_QUALITY_GRADUATION'){const b=t.p.blocks.find(x=>x.endWeekExclusive===w+1);for(let k=b.startWeek;k<=w;k++)assert.equal(t.p.stateTrace[k].run.mode,'EASY',`week ${k} of the assessed block is easy mode`);return;}
 }
});

const BOUTS_TASK={category:'VO2_STYLE',current:true,familiar:true,tolerated:true,observedAt:'2026-10-28',prescription:{modality:'RUN',family:'VO2_STYLE_INTERVALS',durationMinutes:40,warmupMinutes:12,cooldownMinutes:8,work:{repetitions:4,workMinutes:3,recoveryMinutes:2}},target:{method:'PACE',construct:'FIELD_SESSION_TARGET',paceSecondsPerKm:255,provenance:'Athlete report of the last three track sessions'},history:{sameTaskExposures:6,response:'TOLERATED'},conditions:{comparable:true}};
const BOUTS={id:'r-bouts',...RUN_ONLY,recent:{runDaysPerWeek:4,runMinutesPerWeek:180,longestRunMinutes:70},knownRuns:[BOUTS_TASK],schedule:{strengthDays:[],runDays:[1,3,5,6]},weeks:12};
test('B0-C02: a fully specified familiar repeated-bout task is the week’s single quality session, held exactly, at its familiar target, never progressed',()=>{
 const p=program(BOUTS);const b=quality(p).filter(s=>s.prescription.family==='FAMILIAR_REPEATED_BOUTS');
 assert.ok(b.length>=4);for(const s of b){assert.deepEqual(s.prescription.work,BOUTS_TASK.prescription.work);assert.equal(s.prescription.progressionAllowed,false);assert.equal(s.prescription.target.construct,'FIELD_SESSION_TARGET');assert.equal(runRepertoireOf(s.prescription).intensityMethod,'FAMILIAR_FIELD_SESSION_TARGET');assert.ok(!s.prescription.instructions.some(t=>/VO2/i.test(t)));}
 assert.equal(new Set(b.map(s=>JSON.stringify(s.prescription))).size,1,'the same dose every week');
 // Not in event phases: an event program uses the event ladders in SPECIFIC and the taper rules after it.
 const ev=program({...BOUTS,id:'r-bouts-event',goals:{run:'RACE',strength:'NONE'},event:{kind:'10K',date:'2027-01-24'},weeks:16});
 for(const w of ev.weeks)if(['SPECIFIC','TAPER','RACE_WEEK','POST_EVENT'].includes(w.phase))assert.ok(!runs(ev,w.index).some(s=>s.prescription.family==='FAMILIAR_REPEATED_BOUTS'),w.phase);
 // Incomplete inputs: the threshold ladder and a non-blocking request for the details; no task, no VO2-style work at all (LATER.RUN.VO2_DE_NOVO).
 const inc=gen({...BOUTS,id:'r-bouts-incomplete',knownRuns:[{...BOUTS_TASK,target:{method:'PACE',construct:'FIELD_SESSION_TARGET'}}]});
 assert.ok(!quality(inc.program).some(s=>s.prescription.family==='FAMILIAR_REPEATED_BOUTS'));assert.ok(inc.negotiation.some(n=>n.id==='FAMILIAR_HARDER_INTERVALS_DETAILS'&&n.missingInputs.includes('target.provenance')));
 assert.ok(!quality(program({...BOUTS,id:'r-bouts-none',knownRuns:[]})).some(s=>s.prescription.family==='FAMILIAR_REPEATED_BOUTS'));
});

test('B0-C02 c3–c6: bouts never count as threshold sessions or taper/touch peaks; repeated adverse responses withdraw them; any interruption lapses them',()=>{
 const t=reviewed(BOUTS,6);
 const st=t.p.stateTrace[6].run;assert.equal(st.thresholdDone,0,'not an executed threshold session');assert.equal(st.achieved.quality,null,'not the taper or touch peak');
 // Two adverse bouts within 14 days: the threshold ladder from its first step.
 const a=reviewed({...BOUTS,id:'r-bouts-adverse'},2),bad={response:{performance:'UNDER',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'IMPAIRED'}};
 weekly(a,2,{o:s=>s.role==='QUALITY'?bad:{}});weekly(a,3,{o:s=>s.role==='QUALITY'?bad:{}});
 const next=runs(a.p,4).find(s=>s.role==='QUALITY');assert.ok(!next||next.prescription.family==='THRESHOLD','withdrawn after repeated adverse responses');
 // A nonclinical interruption: the familiar status lapses until the task is current again.
 const i=reviewed({...BOUTS,id:'r-bouts-break'},3);
 const ret=evaluateProgram(i.p,{...review(i.p,4,{day:3,kind:'RETURN_AFTER_PAUSE',interruption:{days:4,reasonCategory:'TRAVEL',nonclinical:true}}),actualLedger:i.ledger},opts);
 assert.equal(ret.action,'REESTABLISH');for(let w=5;w<12;w++)assert.ok(!runs(ret.proposal,w).some(s=>s.prescription.family==='FAMILIAR_REPEATED_BOUTS'),'week '+w);
});

test('B0-C10: later-gate familiar tasks fall back and are disclosed; an unclear category is asked; a 5K is a performance plan without event phases',()=>{
 const hills=gen({...BOUTS,id:'r-lg-hills',knownRuns:[{...BOUTS_TASK,category:'HILLS',prescription:{...BOUTS_TASK.prescription,family:'HILLS'}}]});
 assert.ok(hills.negotiation.some(n=>n.id==='LATER_GATE_RUN_TASK'&&n.laterGate==='LATER.RUN.HILL_REPEATS'&&/different stimulus/.test(n.detail)));
 assert.ok(!quality(hills.program).some(s=>s.prescription.family==='FAMILIAR_REPEATED_BOUTS'));
 const odd=gen({...BOUTS,id:'r-lg-odd',knownRuns:[{...BOUTS_TASK,category:'MYSTERY',prescription:{...BOUTS_TASK.prescription,family:'INTERVALS'}}]});
 assert.ok(odd.negotiation.some(n=>n.id==='FAMILIAR_RUN_TASK_CATEGORY_ASK'));assert.equal(odd.status,'PROPOSED','asked without blocking the plan');
 const fiveK=gen({id:'r-lg-5k',goals:{run:'RACE',strength:'NONE'},event:{kind:'5K',date:'2026-12-20',timeGoalMinutes:24},schedule:{strengthDays:[]}});
 assert.equal(fiveK.status,'PROPOSED');assert.equal(fiveK.program.goal.run.kind,'PERFORMANCE');assert.equal(fiveK.program.goal.run.event,null);
 assert.ok(!fiveK.program.phases.phases.some(p=>['SPECIFIC','TAPER','RACE_WEEK','POST_EVENT'].includes(p)));assert.ok(!fiveK.program.weeks.some(w=>w.sessions.some(s=>s.role==='RACE')));
 assert.ok(fiveK.negotiation.some(n=>n.id==='EVENT_5K_PERFORMANCE_FALLBACK'));
 assert.equal(gen({id:'r-lg-marathon',goals:{run:'RACE',strength:'NONE'},event:{kind:'MARATHON',date:'2027-01-20'},schedule:{strengthDays:[]}}).status,'UNSUPPORTED');
});

test('Event taper (10K, half marathon) with the combined strength taper: one taper week, achieved peaks, reduced strength, nothing new or heavy before the race',()=>{
 for(const [kind,date] of [['10K','2027-01-24'],['HALF_MARATHON','2027-01-31']]){
  const t=reviewed({id:'r-taper-'+kind,goals:{run:'RACE',strength:'GENERAL'},event:{kind,date},weeks:16,recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:75},schedule:{runDays:[1,3,5,6],longRunMinutes:120},rotation:'EVERY_2_WEEKS'},0);
  const ph=t.p.phases.phases,tw=ph.indexOf('TAPER'),rw=ph.indexOf('RACE_WEEK');assert.ok(tw>0&&rw===tw+1,kind);
  for(let w=0;w<rw;w++)weekly(t,w);
  const peakLong=t.p.stateTrace[tw].run.achieved.long,taperLong=runs(t.p,tw).find(s=>s.role==='LONG')?.prescription.durationMinutes;
  if(peakLong&&taperLong)assert.ok(taperLong<peakLong,`${kind}: the taper long run is shorter than the achieved peak`);
  const str=t.p.weeks[rw].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription);
  assert.ok(str.length<=1&&str.every(s=>s.prescription.exercises.every(e=>e.role==='MAIN'&&e.sets<=1&&e.rir>=4)),`${kind}: at most one light main-lift session in race week`);
  const before=new Set(rows(t.p,tw-1).map(x=>x.e.id));assert.ok(rows(t.p,tw).every(x=>before.has(x.e.id)),`${kind}: no new exercise in the taper`);
 }
});
import {rows} from '../r7/b/fixtures/helpers.mjs';

test('B0-C01 with R7-A returns: a graduated athlete keeps the graduation through a short break (first quality slot easy, D58) and a moderate return (no quality in return steps, then quality again); never above the executed dose',()=>{
 const t=reviewed({...GRAD,id:'r-grad-return'},6);
 const short=evaluateProgram(t.p,{...review(t.p,6,{day:4,kind:'RETURN_AFTER_PAUSE',interruption:{days:4,reasonCategory:'TRAVEL',nonclinical:true}}),actualLedger:t.ledger},opts);
 assert.equal(short.action,'REESTABLISH');assert.ok(!runs(short.proposal,7).some(s=>s.role==='QUALITY'),'the first quality slot after a short break runs easy');assert.ok(runs(short.proposal,8).some(s=>s.role==='QUALITY'));
 const moderate=evaluateProgram(t.p,{...review(t.p,6,{day:6,kind:'RETURN_AFTER_PAUSE',interruption:{days:18,reasonCategory:'TRAVEL',nonclinical:true}}),actualLedger:t.ledger},opts);
 assert.equal(moderate.action,'REESTABLISH');const P=moderate.proposal,ew=P.decisions.at(-1).fromWeek;
 for(let w=ew;w<P.weeks.length&&P.stateTrace[w].run.mode==='RETURN';w++)assert.ok(!runs(P,w).some(s=>s.role==='QUALITY'),'no quality in return steps (week '+w+')');
 assert.ok(P.weeks.slice(ew).some(w=>runs(P,w.index).some(s=>s.role==='QUALITY')),'quality comes back after the return');
 const executedLong=Math.max(...[...Array(6).keys()].flatMap(k=>runs(t.p,k).filter(s=>s.role==='LONG').map(s=>s.prescription.durationMinutes)));
 assert.ok(runs(P,ew).filter(s=>s.role==='LONG').every(s=>s.prescription.durationMinutes<=executedLong),'E1: the return never starts above the executed long run');
});
