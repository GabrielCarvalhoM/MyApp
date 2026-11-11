// CoachingCore V1 Run Calibration Extension: representative journeys (Founder request of 2026-11-11, section 7). Synthetic athletes only. Each journey
// runs the extended entry point week by week and, beside it, the frozen V1 entry point on the same reports: the plan and every decision must be the
// same (the extension adds, it never changes). Output: one compact record per journey as JSON and as text a reviewer can read. It shows what the
// software does; it approves nothing.
// Usage: node scripts/v1rc-journeys.mjs [outDir]   (default: ../audits/coachingcore-v1-run-calibration-2026-11-11/evidence)
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {DEV,VALUES,timeline,runner,result,live,mmss,hms,ELIG} from '../test/v1rc-helpers.mjs';
import {runCalibrationAuthority} from '../src/v1-run-calibration.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
// The independent record, once it exists, is the authority; until then the journeys run under the development authority and say so.
const auth=runCalibrationAuthority(),byRecord=Object.keys(auth.approved).length===4,opts=byRecord?{}:DEV,AUTH_NOTE=byRecord?'INDEPENDENT_RECORD':'DEV_AUTHORITY_PENDING_RECORD';
const pct=f=>(f>0?'+':'')+(f*100).toFixed(1)+'%';
const band=b=>!b?'-':b.status==='AVAILABLE'?mmss(b.fastSecondsPerKm)+'-'+mmss(b.slowSecondsPerKm)+(b.basis==='OBSERVED_AT_EFFORT'?' (observed)':'')+(b.trainingFactor?' (training '+pct(b.trainingFactor)+')':''):b.status==='REFERENCE_ONLY'?'reference '+mmss(b.fastSecondsPerKm)+'-'+mmss(b.slowSecondsPerKm):b.reason;
const est=e=>e.status==='AVAILABLE'?hms(e.lowSeconds)+' to '+hms(e.highSeconds)+' (central '+hms(e.centralSeconds)+', '+e.confidence+')':e.reason;
const ten=x=>x?.tenKEquivalentSeconds?hms(x.tenKEquivalentSeconds):'-';
function snap(t,label){
 const c=t.cal;if(!c||!c.capacity)return {label,status:c?.status??null,reason:c?.reason??null};
 const cap=c.capacity,ref=cap.reference,hr=c.heartRateZones,a=c.assessment,ch=c.nextWeek?.change;
 return {label,week:c.week,status:c.status,capacity:cap.status+(cap.confidence?' '+cap.confidence+', margin '+cap.margin:'')+(cap.reason?' ('+cap.reason+')':''),
  reference:ref?ref.kind+' '+ref.distanceKm+' km '+hms(ref.seconds)+' on '+ref.date+' ('+ref.measurement+')':null,causes:cap.confidenceCauses??[],
  evidence:c.evidence.map(e=>e.id+': '+e.kind+' '+(e.distanceKm??'-')+' km '+(e.seconds?hms(e.seconds):'-')+' '+(e.date??'undated')+' → '+e.use+(e.reasons.length?' ['+e.reasons.join(', ')+']':'')),refused:c.refusedEvidence,
  bands:Object.fromEntries(Object.entries(c.paceBands).map(([k,b])=>[k,band(b)])),estimates:Object.fromEntries(Object.entries(c.estimates).map(([k,e])=>[k,est(e)])),goal:c.goal?c.goal.event+' goal '+hms(c.goal.goalSeconds)+': '+c.goal.relation:null,
  heartRate:hr.status==='AVAILABLE'?hr.basis+': '+[...(hr.zones??[]).map(z=>z.name+' '+(z.lowBpm??'')+'-'+(z.highBpm??'')),...(hr.values??[]).map(v=>v.name+' '+v.value+' '+v.unit)].join(', '):hr.reason,
  assessment:a.status+(a.protocol?' '+a.protocol.id:'')+(a.reasons?' ['+a.reasons.join(', ')+']':a.reason?' ('+a.reason+')':'')+(a.replacesSessionId?' instead of '+a.replacesSessionId:''),
  screen:c.warningSignScreen?.status==='REQUIRED'?'REQUIRED for '+c.warningSignScreen.evidenceIds.join(', '):null,
  nextWeek:ch?ch.reason+(ch.domain?' ('+ch.domain+')':'')+': 10 km equivalent '+ten(ch.from)+' → '+ten(ch.to):null,projection:c.projection.reason};
}
/** One journey: `plan(t, note)` drives the timeline, which mirrors every review on the frozen V1 entry point (v1rc-helpers.mjs). */
function journey(name,input,plan){
 const t=timeline(input,{opts}),steps=[];
 if(!t.p)return {name,status:t.g.status,reason:t.g.reason,calibration:t.g.runCalibration?.status};
 plan(t,label=>steps.push(snap(t,label)));
 return {name,goal:t.p.goal.run.kind+(t.p.goal.run.event?' '+t.p.goal.run.event.kind:''),runClass:t.p.capability.run.class,engineDecisionsIdenticalToFrozenV1:t.same,steps};
}
const EASY=['EASY','LONG','RECOVERY_EASY','SHAKEOUT'];
const paced=(easy,work,rpeEasy=3,rpeHard=7)=>s=>EASY.includes(s.prescription.family)?{pace:easy,rpe:rpeEasy}:['WALK','WALK_JOG','RACE'].includes(s.prescription.family)?{rpe:rpeEasy}:{pace:easy,workPace:work,rpe:rpeHard};
const weeks=(t,from,to,how,note,every=1)=>{for(let w=from;w<=to;w++){t.week(w,how);if((w-from)%every===every-1||w===to)note('after week '+w);}};
const BEG=(over={})=>runner({id:'rc-beginner',runExperience:'NONE',goal:'REGULAR',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,strengthDaysPerWeek:0},schedule:{runDays:[1,3,5],runMinutes:35,longRunDay:5,longRunMinutes:undefined},weeks:8,...over});
const quality=(t,w)=>t.p.weeks[w]?.sessions.find(s=>s.role==='QUALITY'&&live(s))??null;
const firstQualityWeek=t=>t.p.weeks.findIndex(w=>w.sessions.some(s=>s.role==='QUALITY'&&live(s)));
const MAR={weeks:16,runExperience:'EXPERIENCED',recent:{runDaysPerWeek:5,runMinutesPerWeek:360,longestRunMinutes:150,strengthDaysPerWeek:1},schedule:{runDays:[0,1,3,4,6],strengthDays:[2],runMinutes:90,strengthMinutes:35,longRunDay:6,longRunMinutes:210}};
/** The offered test, done on the day of the harder session it replaces, reported with the session not done. */
const takeTest=(t,how,x={})=>{const a=t.cal.assessment,w=a.week,s=quality(t,w);
 t.week(w,q=>q.id===s.id?false:how(q),{runEvidence:[{id:'test-'+w,kind:'FIELD_TEST',protocol:a.protocol.id,date:s.date,distanceKm:a.protocol.distanceKm,seconds:Math.round(a.protocol.distanceKm*285),rpe:8,measurement:'TRACK',tolerated:true,replacedSessionId:s.id,...x}],expectWithhold:true});return w;};
const J=[
 ['01 absolute beginner, no history (walk/jog)',BEG(),(t,n)=>{n('plan');weeks(t,0,3,()=>({rpe:3}),n,4);}],
 ['02 beginner with some walk/jog history',BEG({id:'rc-beginner-2',runExperience:'NOVICE',recent:{runDaysPerWeek:2,runMinutesPerWeek:40,longestRunMinutes:15,strengthDaysPerWeek:0}}),(t,n)=>{n('plan');weeks(t,0,3,()=>({rpe:3}),n,4);}],
 ['03 runner without a recent result: observed, test offered and declined',runner({id:'rc-no-result'}),(t,n)=>{n('plan');weeks(t,0,6,paced(390,300),n,2);}],
 ['04 runner without a recent result who takes the offered test',runner({id:'rc-test'}),(t,n)=>{const q=firstQualityWeek(t);weeks(t,0,q,paced(390,300),n,q+1);const w=takeTest(t,paced(390,300));n('week '+w+': test done instead of the harder session');t.week(w+1,paced(390,300));n('after week '+(w+1)+' (test in force)');}],
 ['05 runner with a recent 10 km result, half-marathon goal',runner({id:'rc-recent',weeks:16,goal:{kind:'RACE',event:{kind:'HALF_MARATHON',date:'2027-02-21',timeGoalMinutes:115}},anchors:[result('10K',3300,'2026-10-18')]}),(t,n)=>{n('plan');weeks(t,0,3,paced(400,345),n,2);}],
 ['06 old personal best far from current capacity',runner({id:'rc-old-best',anchors:[{kind:'PERSONAL_BEST',distance:'10K',seconds:2520,date:'2019-05-12',measurement:'OFFICIAL',tolerated:true,rpe:10},result('10K',3360,'2026-10-25')]}),(t,n)=>{n('plan');}],
 ['07 only an old personal best',runner({id:'rc-only-best',anchors:[{kind:'PERSONAL_BEST',distance:'5K',seconds:1260,measurement:'OFFICIAL',tolerated:true}]}),(t,n)=>{n('plan');}],
 ['08 contradictory recent results (never the fastest)',runner({id:'rc-conflict',anchors:[result('5K',1380,'2026-10-11'),result('10K',3360,'2026-10-25')]}),(t,n)=>{n('plan');}],
 ['09 a test stopped for pacing, then the one repeat',runner({id:'rc-incomplete'}),(t,n)=>{const q=firstQualityWeek(t);weeks(t,0,q,paced(390,300),n,q+1);const w=takeTest(t,paced(390,300),{distanceKm:2.1,seconds:600,completed:false,stoppedFor:'PACING'});n('week '+w+': test stopped at 2.1 km (pacing)');const w2=takeTest(t,paced(390,300));n('week '+w2+': repeated and completed');t.week(w2+1,paced(390,300));n('after week '+(w2+1));}],
 ['10 fast easy runs do not recalibrate performance',runner({id:'rc-fast-easy',anchors:[result('10K',3300,'2026-10-25')]}),(t,n)=>{n('plan');weeks(t,0,3,s=>EASY.includes(s.prescription.family)?{pace:340,rpe:4}:{workPace:345,rpe:7},n,4);}],
 ['11 recalibration: two fast threshold sessions (that band only), then a race',runner({id:'rc-recal',anchors:[result('10K',3300,'2026-10-25')]}),(t,n)=>{n('plan');weeks(t,0,2,paced(400,345),n,3);weeks(t,3,5,paced(400,322),n);
   t.week(6,paced(400,322),{runEvidence:[{id:'race-2',...result('10K',3120,t.day(6,6))}]});n('week 6: a 10 km race in 52:00');t.week(7,paced(400,322));n('after week 7 (race in force)');}],
 ['12 5 km goal, slower runner (the 5 km band is their own 5 km pace)',runner({id:'rc-5k',weeks:12,goal:{kind:'RACE',event:{kind:'5K',date:'2027-01-24',timeGoalMinutes:31}},anchors:[result('10K',4200,'2026-10-25',{measurement:'GPS'})]}),(t,n)=>{n('plan');}],
 ['13 10 km goal from a 5 km result',runner({id:'rc-10k',weeks:12,goal:{kind:'RACE',event:{kind:'10K',date:'2027-01-24',timeGoalMinutes:52}},anchors:[result('5K',1500,'2026-10-25')]}),(t,n)=>{n('plan');}],
 ['14 marathon, eligible athlete with a recent half marathon',runner({id:'rc-mar',...MAR,goal:{kind:'RACE',event:{kind:'MARATHON',date:'2027-02-28',timeGoalMinutes:225}},anchors:[result('HALF_MARATHON',6300,'2026-10-18')]}),(t,n)=>{n('plan');}],
 ['15 marathon, eligible athlete with only a 10 km result',runner({id:'rc-mar-10k',...MAR,goal:{kind:'RACE',event:{kind:'MARATHON',date:'2027-02-28'}},anchors:[result('10K',2880,'2026-10-18')]}),(t,n)=>{n('plan');}],
 ['16 marathon goal without the base (preparatory plan)',runner({id:'rc-mar-no-base',weeks:16,goal:{kind:'RACE',event:{kind:'MARATHON',date:'2027-02-28'}},recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:1},anchors:[result('HALF_MARATHON',7500,'2026-10-25')]}),(t,n)=>{n('plan');}],
 ['17 no GPS and no heart rate (reports by minutes and effort only)',runner({id:'rc-no-device'}),(t,n)=>{n('plan');weeks(t,0,4,()=>({rpe:3}),n,5);}],
 ['18 noisy and incomplete data',runner({id:'rc-noisy',anchors:[{kind:'RACE_RESULT',distance:'10K',date:'2026-10-25'},{kind:'RACE_RESULT',distanceKm:10,seconds:3300,date:'2026-13-40'},result('5K',240,'2026-10-30',{kind:'TIME_TRIAL',distanceKm:1,distance:undefined,measurement:'GPS'}),'not an object',result('10K',3300,'2026-10-18',{conditions:['HEAT']}),{kind:'RACE_RESULT',distance:'10K',seconds:3300,date:'2026-10-20'},result('10K',3300,'2026-10-21',{measurement:'MANUAL',rpe:null})]}),(t,n)=>{n('plan');
   t.week(0,s=>s.prescription.family==='EASY'?{pace:390,rpe:3,actual:{gpsQuality:'POOR'}}:{},{runEvidence:[{id:'future',...result('5K',1500,'2027-06-01')},{kind:'UNKNOWN_KIND',distanceKm:5,seconds:1500,date:t.day(0,2)},{id:'hr-only',...result('5K',1500,t.day(0,2),{kind:'TIME_TRIAL',measurement:'GPS',heartRate:{maxBpm:188,sensor:'OPTICAL'}})}]});n('week 0 with poor GPS, a future result, an unknown kind');t.week(1,paced(390,300));n('after week 1');}],
 ['19 heart rate observed by chest strap in a hard effort; then measured values supplied',runner({id:'rc-hr',anchors:[result('10K',3300,'2026-10-25',{heartRate:{maxBpm:186,sensor:'CHEST_STRAP'}})]}),(t,n)=>{n('plan (observed maximum)');
   t.week(0,paced(400,345),{runEvidence:[{id:'lab-1',kind:'LAB_TEST',date:t.day(0,3),lab:{protocol:'Incremental treadmill test with gas exchange',source:'Sports medicine laboratory report',values:[{name:'Heart rate at the first measured anchor',value:148,unit:'bpm'},{name:'Heart rate at the second measured anchor',value:168,unit:'bpm'}]}}]});t.week(1,paced(400,345));n('after week 1 (measured values supplied)');}],
 ['20 a declared break of 16 days withdraws the calibration',runner({id:'rc-break',anchors:[result('10K',3300,'2026-10-25')]}),(t,n)=>{n('plan');weeks(t,0,1,paced(400,345),n,2);t.step(4,3,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(2,0),endDate:t.day(4,1),days:16,nonclinical:true,reasonCategory:'SCHEDULE'}});n('back after 16 days');}],
 ['21 a clinical hold withholds everything',runner({id:'rc-hold',anchors:[result('10K',3300,'2026-10-25')]}),(t,n)=>{n('plan');const d=t.day(0,2);t.step(0,2,'WEEKLY_REVIEW',{eligibility:ELIG(d,{pain:true})});n('pain reported');}],
 ['22 a runner outside the model population (10 km equivalent above 75 minutes)',runner({id:'rc-outside',anchors:[result('5K',2700,'2026-10-25')]}),(t,n)=>{n('plan');}],
 ['24 a test stopped with no stated reason (read as a symptom): no further test, the warning-sign screen named',runner({id:'rc-symptom'}),(t,n)=>{const q=firstQualityWeek(t);weeks(t,0,q,paced(390,300),n,q+1);const w=takeTest(t,paced(390,300),{distanceKm:1.6,seconds:480,completed:false,tolerated:false});n('week '+w+': test stopped');t.week(w+1,paced(390,300));n('after week '+(w+1));}],
 ['25 marathon block, half marathon in 2:55 (outside the model population)',runner({id:'rc-mar-slow',...MAR,goal:{kind:'RACE',event:{kind:'MARATHON',date:'2027-02-28'}},anchors:[result('HALF_MARATHON',10500,'2026-10-18')]}),(t,n)=>{n('plan');}],
 ['23 a marathon result only (never converted downward)',runner({id:'rc-mar-only',anchors:[result('MARATHON',14400,'2026-10-11')]}),(t,n)=>{n('plan');}]
];
const out=J.map(([name,input,plan])=>{try{return journey(name,input,plan);}catch(e){return {name,error:String(e?.stack??e).slice(0,700)};}});
const dir=path.resolve(process.argv[2]??path.join(here,'../../audits/coachingcore-v1-run-calibration-2026-11-11/evidence'));fs.mkdirSync(dir,{recursive:true});
const head={mission:'CoachingCore V1 Run Calibration Extension',authority:AUTH_NOTE,extension:{id:VALUES.id,revision:VALUES.revision},synthetic:true,note:'Shows what the software does on synthetic athletes; approves nothing.'};
fs.writeFileSync(path.join(dir,'JOURNEYS_V1RC.json'),JSON.stringify({...head,journeys:out},null,1)+'\n');
const lines=[`CoachingCore V1 Run Calibration Extension: journeys (authority: ${AUTH_NOTE}; values ${VALUES.id} revision ${VALUES.revision}; synthetic athletes)`,'Paces are minutes:seconds per km, fast edge to slow edge. Estimates are ranges of current capacity, never a promise.',''];
const compact=o=>{const vals=[...new Set(Object.values(o))];return vals.length===1?'all: '+vals[0]:Object.entries(o).map(([k,v])=>k+' '+v).join(' | ');};
for(const j of out){lines.push('='.repeat(110),j.name,j.error?'ERROR '+j.error:j.steps?`goal ${j.goal} | run class ${j.runClass} | engine plan and decisions identical to the frozen V1 entry point: ${j.engineDecisionsIdenticalToFrozenV1?'YES':'NO'}`:`${j.status}: ${j.reason}`);
 for(const s of j.steps??[]){lines.push('',`  [${s.label}] ${s.status}`+(s.capacity?` | capacity ${s.capacity}`:'')+(s.reference?` | reference ${s.reference}`:'')+(s.causes?.length?` | ${s.causes.join(', ')}`:''));
  if(!s.bands){if(s.reason)lines.push('    '+s.reason);continue;}
  for(const e of s.evidence)lines.push('    evidence   '+e);for(const r of s.refused)lines.push('    refused    '+(r.id??'(no id)')+': '+r.errors.join(', '));
  lines.push('    pace/km    '+compact(s.bands),'    estimates  '+compact(s.estimates));
  if(s.goal)lines.push('    goal       '+s.goal);lines.push('    heart rate '+s.heartRate,'    assessment '+s.assessment,'    projection '+s.projection);if(s.screen)lines.push('    warning-sign screen '+s.screen);if(s.nextWeek)lines.push('    next week  '+s.nextWeek);}
 lines.push('');}
fs.writeFileSync(path.join(dir,'JOURNEYS_V1RC.txt'),lines.join('\n'));
const bad=out.filter(j=>j.error||j.steps&&!j.engineDecisionsIdenticalToFrozenV1);
console.log(`${out.length} journeys written to ${dir}; ${bad.length?'NOT identical or failed: '+bad.map(j=>j.name).join('; '):'engine plan and decisions identical to the frozen V1 entry point in all'}`);
process.exit(bad.length?1:0);
