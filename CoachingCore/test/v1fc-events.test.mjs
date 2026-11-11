// CoachingCore V1 Final Closure (Founder request of 2026-11-11): the V1 event extension, V1X-EVENTS (src/v1-events.mjs). The 5K recipe and the bounded
// marathon support, as SSCTR-V1FC-DECISION states them (audits/coachingcore-v1-final-closure-2026-11-11/ssctr-decision). Development authority only:
// these tests show the software follows the record, never that the record is right. Synthetic data only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {generateProgram,evaluateProgram} from '../src/r6-index.mjs';
import {simulateProgram} from '../src/r6-simulator.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';
import {intake,PROFILES,EDGE_PROFILES} from '../r6/fixtures/profiles.mjs';
import {devEventExtension,eventExtensionAuthority,allowsEvent,EXTENSION_FILE_SHA256,EXTENSION_SHA256,EVENT_BOUNDARIES,EVENT_RECORDS_URL,extendPolicy} from '../src/v1-events.mjs';
import {loadR6Policy} from '../src/r6-authority.mjs';
import {hash} from '../src/value.mjs';

const X=JSON.parse(fs.readFileSync(new URL('../v1/EVENT_EXTENSION_V1.json',import.meta.url),'utf8')),D=JSON.parse(fs.readFileSync(new URL('../../audits/coachingcore-v1-final-closure-2026-11-11/ssctr-decision/SSCTR_V1FC_DECISION.json',import.meta.url),'utf8')).values,A1=JSON.parse(fs.readFileSync(new URL('../../audits/coachingcore-v1-final-closure-2026-11-11/ssctr-decision/SSCTR_V1FC_DECISION_AMENDMENT_1.json',import.meta.url),'utf8')).values.marathon;
const dev={authority:devAuthority(),eventExtension:devEventExtension()},off={authority:devAuthority(),eventExtension:devEventExtension([])};
const runs=w=>w.sessions.filter(s=>s.sport==='RUN'&&s.prescription),all=p=>p.weeks.flatMap(w=>w.sessions),fam=(p,f)=>all(p).filter(s=>s.prescription?.family===f);
const longOf=w=>w.sessions.find(s=>s.role==='LONG')?.prescription?.durationMinutes??null;
const five=(over={},sched={},weeks=12,date='2027-01-17')=>intake('v1fc-5k',{weeks,athlete:{goals:{run:{kind:'RACE',event:{kind:'5K',date}},strength:'MAINTAIN'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:110,longestRunMinutes:45},...over},schedule:{runDays:[0,2,5],strengthDays:[1,3],runMinutes:50,strengthMinutes:40,longRunDay:5,longRunMinutes:70,...sched}});
// A marathon intake that meets every eligibility criterion, with overrides; the race in week 12 of 16 leaves the post-event weeks and a next-block week.
const mar=(over={},sched={},{weeks=16,date='2027-01-31'}={})=>intake('v1fc-mar',{weeks,athlete:{goals:{run:{kind:'RACE',event:{kind:'MARATHON',date}},strength:'MAINTAIN'},runExperience:'EXPERIENCED',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:5,runMinutesPerWeek:360,longestRunMinutes:150},...over},schedule:{runDays:[0,1,3,4,6],strengthDays:[2],runMinutes:90,strengthMinutes:35,longRunDay:6,longRunMinutes:210,...sched}});
const prog=(i,o=dev)=>{const g=generateProgram(i,o);assert.equal(g.status,'PROPOSED',JSON.stringify([g.reason,g.errors,g.missingInputs]));return g.program;};
const unmetOf=i=>{const g=generateProgram(i,dev);assert.equal(g.status,'PROPOSED',g.reason);return {p:g.program,ids:(g.program.canonical.goals.contextEvent?.unmet??[]).map(u=>u.id),g};};

test('V1X authority (fail closed): without an independent record bound to the extension bytes a 5K keeps its fallback and a marathon stays outside; a record for other bytes, a rejection or a self-review enables nothing',()=>{
 const none=eventExtensionAuthority({eventRecords:{records:[]}});assert.ok(!allowsEvent(none,'5K')&&!allowsEvent(none,'MARATHON'));assert.ok(allowsEvent(none,'10K')&&allowsEvent(none,'HALF_MARATHON'));
 const rec=(o={})=>({records:Object.values(EVENT_BOUNDARIES).map(boundaryId=>({boundaryId,extensionSha256:EXTENSION_SHA256,independent:true,disposition:'APPROVE_WITH_CONDITIONS',evidenceStatus:'SUPPORTED_WITH_LIMITS',sourceIds:['S1'],...o}))});
 for(const bad of [{extensionSha256:'0'.repeat(64)},{disposition:'REJECT'},{independent:false},{evidenceStatus:'PLAUSIBLE_BUT_UNCERTAIN'},{sourceIds:[]}]){const a=eventExtensionAuthority({eventRecords:rec(bad)});assert.ok(!allowsEvent(a,'5K')&&!allowsEvent(a,'MARATHON'),JSON.stringify(bad));}
 // The file is used only as the pinned bytes; when it is pinned, a good record enables both events.
 if(EXTENSION_FILE_SHA256===EXTENSION_SHA256){const a=eventExtensionAuthority({eventRecords:rec()});assert.ok(allowsEvent(a,'5K')&&allowsEvent(a,'MARATHON'));
  // One record that does not enable vetoes its event, whatever else approves it.
  const mixed=rec();mixed.records.push({...mixed.records[0],disposition:'REQUEST_REVISION'});assert.ok(!allowsEvent(eventExtensionAuthority({eventRecords:mixed}),'5K'));}
 // Off: the R7-B behaviour, unchanged.
 // The committed records of the independent judge, bound to the pinned bytes, enable both events in the default authority.
 if(EXTENSION_FILE_SHA256===EXTENSION_SHA256&&fs.existsSync(EVENT_RECORDS_URL)){const committed=eventExtensionAuthority();assert.deepEqual(Object.keys(committed.approved).sort(),['V1X-5K','V1X-MARATHON']);assert.ok(committed.records.every(r=>['APPROVE','APPROVE_WITH_CONDITIONS'].includes(r.disposition)));assert.equal(committed.source,'CURRENT_INDEPENDENT_REVIEW');}
 const f=generateProgram(five(),off);assert.equal(f.status,'PROPOSED');assert.equal(f.program.goal.run.event,null);assert.equal(f.program.canonical.goals.contextEvent.kind,'5K');assert.ok(!all(f.program).some(s=>s.role==='RACE'));
 const m=generateProgram(mar(),off);assert.equal(m.status,'UNSUPPORTED');assert.equal(m.scope,'EVENT_DISTANCE_OUTSIDE_V1');
 // A program planned for an extension event is reviewed only under the same enabled bytes.
 const p=prog(five()),d=p.weeks[0].sessions.at(-1).date,rv={version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:d+'T21:00:00Z',weekIndex:0,event:{id:'e1',kind:'WEEKLY_REVIEW'},eligibility:{status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false}};
 assert.deepEqual(p.eventExtension,{id:'V1X-EVENTS-1',sha256:EXTENSION_FILE_SHA256});
 assert.equal(evaluateProgram(p,rv,off).status,'UNSUPPORTED');assert.equal(evaluateProgram(p,rv,{...dev,eventExtension:{...devEventExtension(),sha256:'1'.repeat(64)}}).status,'UNSUPPORTED');assert.notEqual(evaluateProgram(p,rv,dev).status,'UNSUPPORTED');
 assert.equal(generateProgram(intake('v1fc-ultra',{weeks:16,athlete:{goals:{run:{kind:'RACE',event:{kind:'ULTRA',date:'2027-02-14'}},strength:'MAINTAIN'}},schedule:{runDays:[0,2,4,6],strengthDays:[1],runMinutes:60,strengthMinutes:30}}),dev).status,'UNSUPPORTED','an ultra stays outside');
});
test('V1X values: the extension file states the SSCTR decision\'s values, the taper points are bounds of the R6 taper ranges, and no R6 value is changed',()=>{
 const f=X.fiveK,m=X.marathon,E=loadR6Policy().operational.event,R=loadR6Policy().operational.run;
 assert.deepEqual([f.longRunTarget,f.specificLadder,f.effortCue,f.specificWeeks,f.taperWeeks,f.raceWeekTouch,f.raceDayWindowMinutes,f.raceDayWarmupMinutes,f.minimumRunDays,f.specificLadderRequiresRunExperience],
  [D.fiveK.longRunTarget,D.fiveK.specificLadder,D.fiveK.effortCue.text,D.fiveK.specificWeeks,D.fiveK.taperWeeks,D.fiveK.raceWeekTouch,D.fiveK.raceDayWindowMinutes,D.fiveK.raceDayWarmupMinutes,D.fiveK.minimumRunDays,D.fiveK.specificLadderRequiresRunExperience]);
 const q=m.eligibility,dq=D.marathon.eligibility;
 assert.deepEqual([q.longestRunMinutesAtLeast,q.longestRunWithinDays,q.weeklyRunMinutesAtLeast,q.runDaysAtLeast,q.longRunTimeAvailableMinutesAtLeast,q.weeksToRaceAtLeast,q.runExperience,q.monthsAtLeastWhenKnown],
  [dq.longestCurrentRunMinutesMin,dq.longestRunWithinDays,dq.weeklyRunMinutesMin,dq.chosenRunDaysMin,dq.longRunDayAvailableMinutesMin,dq.raceWeeksAfterPlanStartMin,dq.runExperience,dq.currentContinuousMonthsMinWhenKnown]);
 // Amendment 1 replaces three values of the first record: the projection criterion, the preparatory long-run target and the keep caution.
 assert.equal(q.projectedPeakLongRunMinutesAtLeast,A1.eligibility.projectedPeakLongRunMinMinutes);assert.deepEqual([m.preparatoryLongRunTarget.min,m.preparatoryLongRunTarget.max],[A1.preparatoryLongRunTarget.min,A1.preparatoryLongRunTarget.max]);assert.equal(m.keepCautionLongRunBelowMinutes,A1.keepCautionLongRunBelowMinutes);
 for(const k of ['longRunTarget','specificLadder','specificWeeks','taperWeeks','raceWeekTouch','raceDayWindowMinutes','raceDayWarmupMinutes','completionLongRunBelowMinutes','postEventFirstRunMinDaysAfterRace','postEventEasyOnlyThroughDaysAfterRace','postEventStrengthMinDaysAfterRace','minimumRunDays'])assert.deepEqual(m[k],D.marathon[k],k);
 assert.equal(m.effortCue,D.marathon.effortCue.text);
 const [far,near]=m.taperPoints;assert.deepEqual([far.daysBeforeRaceAtLeast,far.runVolume,far.longRun,far.qualityWork],[14,E.taperWeekRunVolumeRange[1],E.taperWeekLongRunRange[1],E.taperQualityWorkRange[1]]);
 assert.deepEqual([near.daysBeforeRaceAtLeast,near.runVolume,near.longRun,near.qualityWork],[7,E.taperWeekRunVolumeRange[0],E.taperWeekLongRunRange[0],E.taperQualityWorkRange[0]]);
 // The merged view restates every R6 value: the policy hash is the R6 policy's and the 10K and half-marathon entries are untouched.
 const pol=loadR6Policy(),ext=extendPolicy(pol,devEventExtension()).operational;assert.equal(hash(pol),devAuthority().policyHash);
 for(const k of ['10K','HALF_MARATHON']){assert.equal(ext.run.longRunTargets[k],R.longRunTargets[k]);assert.deepEqual(ext.event.raceWeekTouch[k],E.raceWeekTouch[k]);assert.equal(ext.event.specificWeeks[k],E.specificWeeks[k]);assert.equal(ext.event.taperWeeks[k],1);assert.equal(ext.event.raceDay.windowMinutes[k],E.raceDay.windowMinutes[k]);}
 assert.deepEqual(ext.run.tenKSpecificLadder,R.tenKSpecificLadder);assert.equal(ext.event.completionLongRunBelowMinutes.HALF_MARATHON,E.raceDayCompletion.halfMarathonAchievedLongRunBelowMinutes);
});
test('G.1: the 10K and the half marathon are byte for byte what they were, with the extension enabled or not (programs and a year of weekly reviews)',()=>{
 for(const inp of [PROFILES.A_RUN_FIRST_HALF_MARATHON,PROFILES.E_EXPERIENCED_RUNNER_NOVICE_STRENGTH,EDGE_PROFILES.TEN_K_EIGHT_WEEKS]){
  const a=simulateProgram(inp,{},off),b=simulateProgram(inp,{},dev);
  assert.equal(a.initial.program.hash,b.initial.program.hash);assert.equal(a.finalProgram.hash,b.finalProgram.hash);assert.equal(a.initial.program.eventExtension,undefined);
  assert.deepEqual(a.decisions.map(d=>[d.status,d.action]),b.decisions.map(d=>[d.status,d.action]));
 }
});

// ---------- 5K ----------
test('5K: a specific preparation with the reviewed values: event phases, the 5K-effort ladder from its first rung after two executed threshold sessions, one taper week, the touch, the race window',()=>{
 const p=prog(five()),ph=p.phases.phases,E=p.phases.raceWeek;
 assert.equal(p.goal.run.event.kind,'5K');assert.equal(ph.filter(x=>x==='SPECIFIC').length,3);assert.equal(ph.filter(x=>x==='TAPER').length,1);assert.equal(ph[E],'RACE_WEEK');assert.equal(ph[E+1],'POST_EVENT');
 const r=simulateProgram(five(),{},dev),f=r.finalProgram,spec=fam(f,'FIVE_K_SPECIFIC');
 assert.ok(spec.length>=1,'executed threshold sessions open the 5K-effort ladder in the specific weeks');
 assert.deepEqual(spec[0].prescription.work,X.fiveK.specificLadder[0],'the first exposure is the first rung');assert.equal(spec[0].prescription.calibration.firstExposure,true);
 assert.equal(spec[0].prescription.effort,X.fiveK.effortCue);assert.equal(spec[0].prescription.effortDomain,'FIVE_K_EFFORT');assert.equal(spec[0].prescription.warmupMinutes,10);assert.equal(spec[0].prescription.cooldownMinutes,5);
 for(const s of spec)assert.ok(X.fiveK.specificLadder.some(w=>hash(w)===hash(s.prescription.work)||s.weekIndex>=f.phases.taperStart),'only ladder rungs before the taper');
 assert.ok(spec.every(s=>['SPECIFIC','TAPER'].includes(f.weeks[s.weekIndex].phase)),'never outside the specific and taper weeks');
 const thresholdsBefore=fam(f,'THRESHOLD').filter(s=>s.weekIndex<spec[0].weekIndex).length;assert.ok(thresholdsBefore>=2,'two threshold sessions come first');
 const touch=fam(f,'RACE_TOUCH')[0],race=all(f).find(s=>s.role==='RACE');
 assert.deepEqual(touch.prescription.work,X.fiveK.raceWeekTouch);assert.equal(touch.prescription.effortDomain,'FIVE_K_EFFORT');assert.ok((Date.parse(race.date)-Date.parse(touch.date))/864e5>=3);
 assert.equal(race.prescription.durationMinutes,45);assert.equal(race.prescription.warmupMinutes,12);assert.equal(race.prescription.effortDomain,'FIVE_K_EFFORT');assert.equal(race.prescription.calibration.timeGoalUsedForPace,false);
 assert.ok(all(f).every(s=>(longOf({sessions:[s]})??0)<=60),'the long run never exceeds the 5K target');
 assert.ok(!JSON.stringify(all(f).map(s=>s.prescription)).match(/pace of|min\/km|VO2|zone \d/i),'G.4: effort cues only');
 assert.ok(Object.values(r.invariants).every(Boolean),JSON.stringify(r.invariants));
});
test('5K: a novice, or a runner with fewer than six known months, keeps the threshold ladder in the specific weeks and is told so; a walk/jog beginner gets a completion race day',()=>{
 for(const over of [{runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:130,longestRunMinutes:45}},{runExperience:undefined,runTrainingMonths:4}]){
  const g=generateProgram(five(over),dev);assert.equal(g.status,'PROPOSED',g.reason);assert.equal(g.program.goal.run.event.thresholdOnly,true);
  const f=simulateProgram(five(over),{},dev).finalProgram;assert.equal(fam(f,'FIVE_K_SPECIFIC').length,0,'no 5K-effort repetitions');
  assert.ok((g.negotiation??g.program.negotiation).some(n=>n.id==='EVENT_5K_THRESHOLD_INTERVALS'));assert.ok(all(f).some(s=>s.role==='RACE'),'the race is still planned');
 }
 const b=prog(five({runExperience:'NONE',strengthExperience:'NONE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0}},{runDays:[1,3,5],runMinutes:35,longRunMinutes:undefined}));
 assert.equal(b.capability.run.class,'WALK_JOG');const race=all(b).find(s=>s.role==='RACE');assert.equal(race.prescription.completion,true);assert.equal(race.prescription.effortDomain,'EASY_CONVERSATIONAL');
 assert.equal(fam(b,'FIVE_K_SPECIFIC').length+fam(b,'THRESHOLD').length,0,'no quality on walk/jog');
});

// ---------- marathon ----------
test('Marathon eligibility: every criterion is read from the athlete\'s own facts; one criterion not met gives the preparatory plan, named with the athlete\'s value and the threshold',()=>{
 assert.deepEqual(unmetOf(mar()).ids,[],'the reference athlete is eligible');assert.equal(prog(mar()).goal.run.event.kind,'MARATHON');
 const cases={RUN_EXPERIENCE:mar({runExperience:'NOVICE'}),RUN_EXPERIENCE_MONTHS:mar({runTrainingMonths:5}),LONGEST_RUN:mar({recent:{runDaysPerWeek:5,runMinutesPerWeek:360,longestRunMinutes:85}}),
  WEEKLY_RUNNING:mar({recent:{runDaysPerWeek:5,runMinutesPerWeek:175,longestRunMinutes:150}}),RUN_DAYS:mar({},{runDays:[0,3,6],longRunDay:6}),LONG_RUN_TIME:mar({},{longRunMinutes:145}),
  RACE_TOO_CLOSE:mar({},{},{date:'2027-01-17'}),RACE_BEYOND_THIS_PLAN:mar({},{},{date:'2027-06-06'}),RETURNING_FROM_A_STOP:mar({pause:{nonclinical:true,weeks:2,reasonCategory:'WORK'}})};
 for(const [id,inp] of Object.entries(cases)){const {p,ids,g}=unmetOf(inp);assert.ok(ids.includes(id),`${id}: ${ids}`);
  assert.equal(p.goal.run.event,null);assert.equal(p.canonical.goals.contextEvent.preparatory,true);assert.ok(!all(p).some(s=>s.role==='RACE'),'no race session');
  assert.ok(!p.phases.phases.some(x=>['SPECIFIC','TAPER','RACE_WEEK','POST_EVENT'].includes(x)),'no event phase');assert.equal(fam(p,'MARATHON_SPECIFIC').length,0);assert.equal(p.eventExtension,undefined);
  const note=(g.negotiation??p.negotiation).find(n=>n.id==='MARATHON_PREPARATORY_PLAN');assert.ok(note&&note.unmet.some(u=>u.id===id&&'needed' in u),id);
  assert.match(note.detail,/does not prepare you for the marathon date/);assert.match(note.detail,/do not train for 7 days after it/);assert.match(note.detail,/no date is promised/);assert.deepEqual(note.options,['Keep the preparatory plan','Choose a later marathon','Choose a 10K or half marathon first']);}
 // Unknown is never read as met; a known month count of six or more with an explicit category is met; a recent tolerated race counts as the long run.
 assert.ok(unmetOf(mar({recent:{runDaysPerWeek:5,runMinutesPerWeek:360}})).ids.includes('LONGEST_RUN'));
 assert.deepEqual(unmetOf(mar({runTrainingMonths:7})).ids,[]);
 assert.ok(!unmetOf(mar({recent:{runDaysPerWeek:5,runMinutesPerWeek:360},performanceAnchors:[{sport:'RUN',kind:'RACE_RESULT',distanceKm:21.1,durationMinutes:118,date:'2026-10-18',completed:true,tolerated:true}]})).ids.includes('LONGEST_RUN'));
 // A beginner with a marathon goal gets the ordinary beginner plan, never an advanced block; the long run of a preparatory plan is capped at 90.
 const beg=unmetOf(intake('v1fc-mar-beg',{weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind:'MARATHON',date:'2027-10-10'}},strength:'GENERAL'},runExperience:'NONE',strengthExperience:'NONE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0}},schedule:{runDays:[1,3,5],strengthDays:[2,4],runMinutes:40,strengthMinutes:30,longRunDay:5}}));
 assert.equal(beg.p.capability.run.class,'WALK_JOG');assert.ok(beg.ids.length>=5);assert.ok(runs(beg.p.weeks[0]).every(s=>s.prescription.family==='WALK_JOG'));
 // The preparatory long-run cap (Amendment 1): the higher of 130 and the current longest run, at most 150, and never above the time available.
 const prep=simulateProgram(mar({},{longRunMinutes:145}),{},dev).finalProgram;assert.ok(prep.weeks.every(w=>(longOf(w)??0)<=145));
 // B1.8: every static criterion met, but the block's own projection stays below 150 (the long-run share holds the long run): the preparatory plan,
 // which keeps building from where the athlete is (never held at a lower long run than the first-week rules give).
 const mid=mar({runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:4,runMinutesPerWeek:240,longestRunMinutes:110}},{runDays:[0,2,4,6],strengthDays:[1,3],runMinutes:75,longRunMinutes:200},{date:'2027-02-14'}),u=unmetOf(mid);
 assert.deepEqual(u.ids,['PROJECTED_LONG_RUN']);assert.deepEqual(u.p.canonical.goals.contextEvent.unmet[0],{id:'PROJECTED_LONG_RUN',value:130,needed:150});
 assert.match((u.g.negotiation??u.p.negotiation).find(n=>n.id==='MARATHON_PREPARATORY_PLAN').detail,/would reach a longest run of about 130 minutes; it needs about 150/);
 const built=simulateProgram(mid,{},dev).finalProgram,L=built.weeks.map(longOf);assert.equal(L[0],105);assert.equal(Math.max(...L),130,'builds toward the cap of 130');
 // The same projection decides the block for the reference athlete, and the plan states it as conditional.
 const proj=(generateProgram(mar(),dev).negotiation??[]).find(n=>n.id==='MARATHON_PROJECTION');assert.ok(proj&&proj.projectedLongRunMinutes>=150);assert.match(proj.detail,/conditional projection, never a promise/);
});
test('Marathon block: six specific weeks on the marathon-effort ladder, a two-week taper at the reviewed points, the last full long run three weeks out, the touch, the race window and its texts',()=>{
 const r=simulateProgram(mar(),{},dev),f=r.finalProgram,ph=f.phases.phases,E=f.phases.raceWeek,race=all(f).find(s=>s.role==='RACE');
 assert.equal(ph.filter(x=>x==='SPECIFIC').length,6);assert.deepEqual([ph[E-2],ph[E-1],ph[E],ph[E+1],ph[E+2],ph[E+3]],['TAPER','TAPER','RACE_WEEK','POST_EVENT','POST_EVENT','NEXT_BLOCK']);
 const spec=fam(f,'MARATHON_SPECIFIC').filter(s=>f.weeks[s.weekIndex].phase==='SPECIFIC');assert.ok(spec.length>=3);assert.deepEqual(spec[0].prescription.work,X.marathon.specificLadder[0]);
 assert.ok(spec.every(s=>X.marathon.specificLadder.some(w=>hash(w)===hash(s.prescription.work))));assert.equal(spec[0].prescription.effort,X.marathon.effortCue);assert.ok(spec.every(s=>s.prescription.durationMinutes<=90));
 // The long run: one step a week at most, never above the cap or the time available, peak in the last specific week (three weeks before the race).
 const longs=f.weeks.slice(0,E-2).map(longOf),peak=Math.max(...longs);assert.ok(peak<=180&&peak<=210);assert.equal(longOf(f.weeks[E-3]),peak,'the last full long run is three weeks out');
 for(let i=1;i<longs.length;i++)assert.ok(longs[i]-longs[i-1]<=5,`week ${i}: ${longs}`);
 assert.equal(longOf(f.weeks[E-2]),Math.round(peak*0.7/5)*5,'14 to 20 days out: the upper taper bound');assert.equal(longOf(f.weeks[E-1]),Math.round(peak*0.55/5)*5,'7 to 13 days out: the lower bound');
 const peakQ=spec.at(-1).prescription.work,total=w=>w.repetitions*w.workMinutes,tq=k=>runs(f.weeks[k]).find(s=>s.prescription.family==='MARATHON_SPECIFIC')?.prescription.work;
 assert.ok(Math.abs(total(tq(E-2))-total(peakQ)*0.6)<=2&&Math.abs(total(tq(E-1))-total(peakQ)*0.5)<=2,'taper quality: 0.6 then 0.5 of the peak session, each from the peak (never from the week before)');
 assert.ok(runs(f.weeks[E]).every(s=>!['LONG','MARATHON_SPECIFIC','THRESHOLD'].includes(s.prescription.family)),'race week: no long run, no quality');
 const touch=fam(f,'RACE_TOUCH')[0];assert.deepEqual(touch.prescription.work,X.marathon.raceWeekTouch);assert.equal(touch.prescription.effortDomain,'MARATHON_EFFORT');
 assert.equal(race.prescription.durationMinutes,360);assert.equal(race.prescription.warmupMinutes,5);assert.equal(race.prescription.windowMinutesIsUpperBound,true);
 assert.equal(race.prescription.effortDomain,'MARATHON_EFFORT','an executed long run of 150 or more: effort anchored');
 const text=race.prescription.instructions.join(' ');assert.match(text,/Start easier than it feels necessary/);assert.match(text,/does not cover fuelling, drinking or heat/);assert.match(text,/No finish time is promised/);assert.match(text,/Stop for pain, dizziness or unusual symptoms/);
 assert.ok(f.weeks.filter(w=>['SPECIFIC','TAPER','RACE_WEEK'].includes(w.phase)).every(w=>w.sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).every(s=>s.prescription.exercises.every(e=>e.sets<=3))),'strength stays at a reduced dose while running leads');
 assert.ok((r.initial.negotiation??r.initial.program.negotiation).some(n=>n.id==='MARATHON_BLOCK_NOTES'));assert.ok(Object.values(r.invariants).every(Boolean),JSON.stringify(r.invariants));
});
test('Marathon, after the race (B3.postEvent, G.3): no run for 7 days, easy runs only through day 14, strength rules by days, and the race never sets a training peak',()=>{
 const r=simulateProgram(mar(),{},dev),f=r.finalProgram,E=f.phases.raceWeek,race=all(f).find(s=>s.role==='RACE'),since=s=>Math.round((Date.parse(s.date)-Date.parse(race.date))/864e5);
 const after=all(f).filter(s=>since(s)>0&&since(s)<=14);
 assert.ok(after.filter(s=>s.sport==='RUN'&&since(s)<=7).every(s=>!s.prescription),'days 1 to 7: no run');
 const easy=after.filter(s=>s.sport==='RUN'&&s.prescription);assert.ok(easy.length>0&&easy.every(s=>s.prescription.family==='RECOVERY_EASY'&&s.prescription.durationMinutes<=30&&s.optional&&!s.prescription.strides),'days 8 to 14: short optional easy runs only');
 const lifts=after.filter(s=>s.sport==='STRENGTH'&&s.prescription);assert.ok(lifts.every(s=>since(s)>3&&s.prescription.exercises.every(e=>e.sets===1&&e.rir>=4)),'no strength on days 1 to 3; then one light set, at least 4 in reserve');
 for(const k of [E+1,E+2])assert.ok(f.weeks[k].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).length<=1,'at most one light session per post-event week');
 // G.3: the race (reported at its 360-minute window by the simulator) is no long, easy or quality peak; the next block resumes from the training peak.
 const peak=Math.max(...f.weeks.slice(0,E-2).map(longOf)),next=f.weeks[E+3];assert.equal(next.phase,'NEXT_BLOCK');
 assert.ok(longOf(next)<=Math.floor(peak*0.625/5)*5,`next block long run ${longOf(next)} from the training peak ${peak}, never from the race`);assert.ok(longOf(next)<0.625*240);
 assert.ok(f.stateTrace.every(s=>(s.run?.achieved?.long??0)<=peak),'the achieved long run is a training run');
});
test('Marathon, race day by the executed long run (B3.completion, Amendment 1): a block whose long runs are not done ends in a completion race day, and the later or shorter event is offered first',()=>{
 // The executed long run stays below 150. The block is never removed (B1.8 is read once, when the plan is made).
 // (An athlete who starts at 130 and is projected to 155; the long runs from week 2 on are not done.)
 const high=mar({recent:{runDaysPerWeek:5,runMinutesPerWeek:300,longestRunMinutes:130}},{runMinutes:75},{date:'2027-02-14'});
 const script={weeks:Array.from({length:16},(_,w)=>w>=2&&w<12?{missed:[{sport:'RUN',role:'LONG'}]}:{})},r=simulateProgram(high,script,dev),f=r.finalProgram,race=all(f).find(s=>s.role==='RACE');
 assert.equal(f.goal.run.event.kind,'MARATHON');assert.ok(race,'the race is still planned');assert.equal(race.prescription.completion,true);assert.equal(race.prescription.effortDomain,'EASY_CONVERSATIONAL');
 assert.match(race.prescription.instructions.join(' '),/does not cover fuelling, drinking or heat/);assert.match(race.prescription.instructions.join(' '),/Walk breaks/);
 const note=(f.negotiation??[]).find(n=>n.id==='EVENT_AMBITIOUS_FOR_CURRENT_RUNNING');assert.ok(note,'the completion is disclosed on the plan that makes it one');
 assert.equal(note.basis,'LONG_RUN_BELOW_COMPLETION');assert.deepEqual(note.options,['Choose a later or shorter event','Keep the event and complete it with walk breaks']);assert.equal(note.caution,'LATER_OR_SHORTER_EVENT_FIRST');
 assert.match(note.detail,/Your longest long run between about 7 and 3 weeks before the race is 0 minutes \(earlier long runs are too long ago to count\)/);assert.match(note.detail,/stays your choice/);
 // The 10K and the half marathon keep their order and text (G.1): no caution.
 const hm=generateProgram(intake('v1fc-hm-beg',{weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind:'HALF_MARATHON',date:'2027-01-17'}},strength:'GENERAL'},runExperience:'NONE',strengthExperience:'NONE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0}},schedule:{runDays:[1,3,5],strengthDays:[2,4],runMinutes:40,strengthMinutes:30,longRunDay:5}}),dev);
 const h=(hm.negotiation??hm.program.negotiation).find(n=>n.id==='EVENT_AMBITIOUS_FOR_CURRENT_RUNNING');assert.deepEqual(h.options,['Keep the event and complete it with walk breaks','Choose a later or shorter event']);assert.equal(h.caution,undefined);
});
