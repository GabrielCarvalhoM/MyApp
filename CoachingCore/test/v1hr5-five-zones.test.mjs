// V1HR5 five heart-rate zones (Founder request of 2026-11-25): directed tests of heartRateFiveZones against SSCTR-HR5-DECISION-r1 — the authority
// (fail closed), the reference hierarchy, conflicts, invalid and extreme values, the arithmetic and interval convention, the role of heart rate
// in each session, withdrawal and the week boundary, the future sample classifier, determinism, and that nothing else of the run calibration,
// the plan or the session guidance moves. Synthetic athletes only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {X,DEV,VALUES,ELIG,runner,result,timeline,textsOf,hash,report,live} from './v1rc-helpers.mjs';
import {devRunCalibration,RUN_BOUNDARIES} from '../src/v1-run-calibration.mjs';
import {fiveZoneAuthority,devFiveZone,fiveZoneValuesOf,zonesFromMaximum,zoneOfBpm,classifySamples,sessionHeartRate,fiveZonesOf,HR5_SHA256,HR5_FILE_SHA256,HR5_URL,HR5_BOUNDARY,ZONE_NAMES} from '../src/v1-heart-rate-zones.mjs';
import {FORBIDDEN_CLAIM} from '../src/r6-prescription.mjs';

const H5=JSON.parse(fs.readFileSync(HR5_URL,'utf8'));
const ON={...DEV,heartRateFiveZone:devFiveZone()};
const AS_OF='2026-11-07',daysBefore=n=>new Date(Date.parse(AS_OF+'T00:00:00Z')-n*864e5).toISOString().slice(0,10);
const cal=(input,opts=ON)=>{const g=X.generateProgram(input,opts);assert.equal(g.status,'PROPOSED',g.reason);return g.runCalibration;};
const five=(input,opts=ON)=>cal(input,opts).heartRateFiveZones;
const STRAP=bpm=>({heartRate:{maxBpm:bpm,sensor:'CHEST_STRAP'}});
const recent10=(x={})=>result('10K',3300,daysBefore(14),x);
// A lab test as SSCTR-HR5-DECISION-r1 HR5-2 needs it: a declared running test (lab.modality), chest strap or ECG, RPE 8 or more, tolerated.
const LABV={protocol:'Incremental treadmill test',source:'Laboratory report',modality:'TREADMILL_RUN',values:[{name:'First measured anchor',value:150,unit:'bpm'}]};
const lab=(maxBpm,x={},labx={})=>({kind:'LAB_TEST',date:daysBefore(30),rpe:9,tolerated:true,lab:{...LABV,...labx},...(maxBpm===undefined?{}:{heartRate:{maxBpm,sensor:'ECG'}}),...x});
const ROOT=new URL('../../',import.meta.url),DECISION=JSON.parse(fs.readFileSync(new URL('audits/v1-five-zone-heart-rate-2026-11-25/ssctr/SSCTR_HR5_DECISION.json',ROOT),'utf8'));
const edges=z=>z.zones.map(x=>[x.zone,x.fromBpm,x.toBpm]);
const withoutFive=c=>{const {heartRateFiveZones:_f,hash:_h,...rest}=c;return rest;};

// ---------- authority: fail closed ----------
test('HR5 authority: the values are read only as the pinned bytes; off without an independent enabling record bound to them',()=>{
 assert.equal(HR5_FILE_SHA256,HR5_SHA256,'the values file is the pinned bytes');
 const bytes=fs.readFileSync(HR5_URL);assert.equal(createHash('sha256').update(bytes).digest('hex'),HR5_SHA256);
 assert.equal(fiveZoneValuesOf(Buffer.concat([bytes,Buffer.from(' ')])),null,'a single byte more and there are no values');
 const rec=(x={})=>({boundaryId:HR5_BOUNDARY,valuesSha256:HR5_SHA256,independent:true,disposition:'APPROVE_WITH_CONDITIONS',evidenceStatus:'SUPPORTED_WITH_LIMITS',sourceIds:['S1'],...x});
 const on=records=>fiveZoneAuthority({heartRateFiveZoneRecords:{records}}).approved;
 assert.equal(on([rec()]),true);
 for(const bad of [[],[rec({valuesSha256:'0'.repeat(64)})],[rec({independent:false})],[rec({evidenceStatus:'PLAUSIBLE_BUT_UNCERTAIN'})],[rec({sourceIds:[]})],[rec(),rec({disposition:'REFUSE'})],[rec({boundaryId:'V1X-RUN-HR'})]])
  assert.equal(on(bad),false,JSON.stringify(bad));
 const input=runner({id:'hr5-auth',anchors:[recent10(STRAP(186))]});
 const off=five(input,{...DEV,heartRateFiveZone:fiveZoneAuthority({heartRateFiveZoneRecords:{records:[]}})});
 assert.equal(off.status,'UNAVAILABLE');assert.equal(off.reason,'EXTENSION_NOT_ENABLED');assert.ok(Object.values(off.sessions).every(s=>s.role==='NONE'&&s.reason==='EXTENSION_NOT_ENABLED'));
});
test('HR5 authority: the five zones need the run calibration\'s heart-rate boundary (and CAPACITY): without it there are none',()=>{
 const input=runner({id:'hr5-auth-hr',anchors:[recent10(STRAP(186))]});
 const noHr=five(input,{...ON,runCalibration:devRunCalibration(Object.values(RUN_BOUNDARIES).filter(b=>b!==RUN_BOUNDARIES.HR))});
 assert.equal(noHr.status,'UNAVAILABLE');assert.equal(noHr.reason,'EXTENSION_NOT_ENABLED');
 const noCap=cal(input,{...ON,runCalibration:devRunCalibration([RUN_BOUNDARIES.HR])});
 assert.equal(noCap.status,'DISABLED');assert.equal(noCap.heartRateFiveZones,undefined,'a disabled calibration carries no reading at all, as before');
});

// ---------- calibration (HR5-1, HR5-2, HR5-4, HR5-5) ----------
test('HR5 calibration: five zones from a chest-strap maximum observed in a hard effort, nested in the three approved domains, with provenance',()=>{
 const c=cal(runner({id:'hr5-strap',athlete:{ageYears:40},anchors:[{id:'race-10k',...recent10(STRAP(186))}]})),z=c.heartRateFiveZones,three=c.heartRateZones;
 assert.equal(z.status,'AVAILABLE');assert.equal(z.method,'FRACTION_OF_REFERENCE_MAXIMUM');assert.equal(z.basis,'ESTIMATED_FROM_OBSERVED_MAXIMUM');assert.equal(z.estimated,true);
 assert.deepEqual(edges(z),[['Z1',null,134],['Z2',134,149],['Z3',149,162],['Z4',162,171],['Z5',171,null]]);
 assert.deepEqual(z.zones.map(x=>x.domain),['LOW','LOW','MODERATE','HIGH','HIGH']);assert.deepEqual(z.domains,{LOW:['Z1','Z2'],MODERATE:['Z3'],HIGH:['Z4','Z5']});
 // The edges the two outputs share are equal: Z2|Z3 is LOW|MODERATE, Z3|Z4 is MODERATE|HIGH.
 assert.equal(three.status,'AVAILABLE');assert.equal(z.zones[2].fromBpm,three.zones[1].lowBpm);assert.equal(z.zones[3].fromBpm,three.zones[2].lowBpm);
 assert.deepEqual(z.reference,{kind:'OBSERVED_MAXIMUM',bpm:186,evidenceId:'race-10k',evidenceKind:'RACE_RESULT',date:daysBefore(14),ageDays:16,sensor:'CHEST_STRAP'});
 assert.equal(z.referenceConfidence,'LOW');assert.equal(z.zoneModelConfidence,'LOW');assert.equal(z.conflict,null);
 assert.equal(z.convention,'FROM_INCLUSIVE_TO_EXCLUSIVE');assert.equal(z.ageFormula,'AGE_FORMULA_NOT_INDIVIDUAL');
 for(const k of ['primaryGuidance','sessionTarget','gatesProgression','convertedToPaceOrEffort','namedThresholds'])assert.equal(z[k],false,k);
 assert.equal(z.role,'REFERENCE_SCALE_ONLY');assert.deepEqual(z.sessionDistribution,{status:'UNAVAILABLE',reason:'NO_HEART_RATE_SERIES_IN_CONTRACT',fromAverageHeartRate:false});
 assert.ok(z.notes.includes('NOT_THRESHOLDS')&&z.notes.includes('OBSERVED_MAXIMUM_MAY_BE_BELOW_TRUE_MAXIMUM'));
 assert.equal(z.model,'V1X-HR-FIVE-ZONE-1');assert.equal(z.sha256,HR5_FILE_SHA256);
});
test('HR5 calibration: the highest qualifying observed maximum of the window is the reference (an observed maximum is a floor of the true one)',()=>{
 const z=five(runner({id:'hr5-two',anchors:[{id:'a',...recent10(STRAP(182))},{id:'b',...result('5K',1500,daysBefore(40),STRAP(188))}]}));
 assert.equal(z.reference.evidenceId,'b');assert.equal(z.reference.bpm,188);assert.equal(z.conflict,null,'two observed maxima are no conflict');
});
test('HR5 calibration: a lab maximum as supplied is the first reference; the supplied lab values stay as supplied in the three-zone output',()=>{
 const c=cal(runner({id:'hr5-lab',anchors:[recent10(),{id:'lab-1',...lab(190)}]})),z=c.heartRateFiveZones;
 assert.equal(z.status,'AVAILABLE');assert.equal(z.basis,'LAB_MAXIMUM_AS_SUPPLIED');assert.equal(z.referenceConfidence,'LOW','HR5-5: LOW for a lab maximum too');assert.equal(z.zoneModelConfidence,'LOW');
 assert.deepEqual(edges(z),[['Z1',null,137],['Z2',137,152],['Z3',152,165],['Z4',165,175],['Z5',175,null]]);
 assert.deepEqual({...z.reference},{kind:'LAB_MEASURED_MAXIMUM',bpm:190,evidenceId:'lab-1',evidenceKind:'LAB_TEST',date:daysBefore(30),ageDays:32,sensor:'ECG',protocol:'Incremental treadmill test',source:'Laboratory report',modality:'TREADMILL_RUN',checkedByTheApp:false});
 assert.deepEqual(z.notes,['NOT_THRESHOLDS','FIXED_FRACTIONS_OF_A_MAXIMUM','NOT_CHECKED_BY_THE_APP']);assert.deepEqual(z.disclosures,['ZONES','LAB_MEASURED_MAXIMUM']);
 assert.equal(c.heartRateZones.basis,'MEASURED_AS_SUPPLIED');assert.equal(c.heartRateZones.zones,undefined,'the three-zone output is unchanged: values as supplied, never zones');
 // A lab test that states no maximum, or one that is not shown under the lab rules, is no reference: the observed maximum is, when there is one.
 for(const [anchor,why] of [[lab(undefined),'no maximum'],[lab(190,{lab:{source:'x',values:[{name:'a',value:1,unit:'bpm'}]}}),'no protocol'],[lab(190,{date:daysBefore(200)}),'older than 182 days'],[lab(130),'below the plausible range'],[lab(225),'above it'],
  [lab(190,{heartRate:{maxBpm:190,sensor:'OPTICAL'}}),'optical'],[lab(190,{heartRate:{maxBpm:190}}),'no sensor'],[lab(190,{rpe:7}),'not maximal by report'],[lab(190,{rpe:null}),'effort not reported'],
  [lab(190,{tolerated:false}),'not tolerated'],[lab(190,{completed:false,stoppedFor:'PACING'}),'stopped'],[lab(190,{},{modality:'CYCLE'}),'cycling'],[lab(190,{},{modality:undefined}),'modality not declared']]){
  const zz=five(runner({id:'hr5-lab-x',anchors:[recent10(STRAP(186)),anchor]}));assert.equal(zz.reference.kind,'OBSERVED_MAXIMUM',why);
  const alone=five(runner({id:'hr5-lab-y',anchors:[recent10(),anchor]}));assert.equal(alone.status,'UNAVAILABLE',why);
 }
 // A lab maximum that meets every rule but the running declaration has its own reason (HR5-2: a cycling test reads about 5% lower).
 for(const m of ['CYCLE',undefined,'ROW'])assert.equal(five(runner({id:'hr5-lab-m',anchors:[recent10(),lab(190,{},{modality:m})]})).reason,'LAB_MODALITY_NOT_RUNNING_OR_UNKNOWN',String(m));
 for(const m of ['RUN','treadmill run','field-run'])assert.equal(five(runner({id:'hr5-lab-m2',anchors:[recent10(),lab(190,{},{modality:m})]})).status,'AVAILABLE',m);
});
test('HR5 conflict: an observed maximum more than 5 bpm ABOVE the lab maximum gives no zones and shows both; a lab maximum above it is used',()=>{
 const z=five(runner({id:'hr5-conf',anchors:[{id:'race',...recent10(STRAP(192))},{id:'lab',...lab(180)}]}));
 assert.equal(z.status,'UNAVAILABLE');assert.equal(z.reason,'REFERENCE_CONFLICT');assert.equal(z.zones,undefined);assert.deepEqual(z.disclosures,['REFERENCE_CONFLICT']);
 assert.deepEqual(z.conflict,{status:'REFERENCE_CONFLICT',labMaxBpm:180,labDate:daysBefore(30),labEvidenceId:'lab',observedMaxBpm:192,observedDate:daysBefore(14),observedEvidenceId:'race',differenceBpm:12,bandBpm:5});
 const S=Object.values(cal(runner({id:'hr5-conf',anchors:[recent10(STRAP(192)),lab(180)]})).heartRateFiveZones.sessions);
 assert.ok(S.filter(s=>H5.sessionUse.families[s.family]?.role==='COMPLEMENTARY_CEILING_CUE').every(s=>s.role==='NONE'&&s.reason==='REFERENCE_CONFLICT'),'no cue under a conflict');
 const above=five(runner({id:'hr5-conf2',anchors:[recent10(STRAP(186)),lab(195)]}));assert.equal(above.status,'AVAILABLE');assert.equal(above.reference.kind,'LAB_MEASURED_MAXIMUM');assert.equal(above.reference.bpm,195);assert.equal(above.conflict,null,'a lab maximum above an observed one is expected');
 const edge=five(runner({id:'hr5-near',anchors:[recent10(STRAP(190)),lab(185)]}));assert.equal(edge.reference.kind,'LAB_MEASURED_MAXIMUM','5 bpm above is inside the band');
 const over=five(runner({id:'hr5-near2',anchors:[recent10(STRAP(191)),lab(185)]}));assert.equal(over.reason,'REFERENCE_CONFLICT','6 bpm above is not');
 // A lab maximum that does not qualify is no side of a conflict: the observed maximum is used.
 assert.equal(five(runner({id:'hr5-conf3',anchors:[recent10(STRAP(192)),lab(180,{rpe:6})]})).reference.kind,'OBSERVED_MAXIMUM');
});
test('HR5 calibration: no zones without a qualifying reference — no data, an age, an optical or declared maximum, an easy effort, or a value out of range',()=>{
 const none=five(runner({id:'hr5-none',athlete:{ageYears:40},anchors:[recent10()]}));
 assert.equal(none.status,'UNAVAILABLE');assert.equal(none.reason,'NO_MEASURED_HEART_RATE');assert.equal(none.zones,undefined);assert.equal(none.ageFormula,'AGE_FORMULA_NOT_INDIVIDUAL');
 const noAnchors=five(runner({id:'hr5-none2'}));assert.equal(noAnchors.reason,'NO_MEASURED_HEART_RATE');
 for(const [x,why] of [[{heartRate:{maxBpm:186,sensor:'OPTICAL'}},'optical'],[{heartRate:{maxBpm:186}},'declared, no sensor'],[{...STRAP(186),rpe:7},'not a hard effort'],[{...STRAP(186),rpe:null},'effort not reported'],
  [STRAP(139),'below 140'],[STRAP(221),'above 220'],[{...STRAP(186),tolerated:false},'not tolerated'],[{...STRAP(186),completed:false,stoppedFor:'PACING'},'not completed']]){
  const z=five(runner({id:'hr5-nq',anchors:[recent10(x)]}));assert.equal(z.status,'UNAVAILABLE',why);assert.equal(z.reason,'HEART_RATE_DATA_NOT_QUALIFYING',why);assert.equal(z.zones,undefined,why);}
 // A short effort (under 10 minutes) is no maximum.
 const short=five(runner({id:'hr5-short',anchors:[result('3K',590,daysBefore(10),STRAP(190))]}));assert.equal(short.status,'UNAVAILABLE');
 // An undated personal best is history, never a reference.
 const pb=five(runner({id:'hr5-pb',anchors:[{kind:'PERSONAL_BEST',distance:'10K',seconds:3000,rpe:9,tolerated:true,measurement:'OFFICIAL',...STRAP(190)}]}));assert.equal(pb.status,'UNAVAILABLE');
});
test('HR5 invalid values: a heart rate that is not a number is refused or ignored, never coerced, never a throw',()=>{
 for(const bad of ['186',-5,0,NaN,Infinity,null,{},[186],1e9]){
  const g=X.generateProgram(runner({id:'hr5-bad',anchors:[recent10({heartRate:{maxBpm:bad,sensor:'CHEST_STRAP'}})]}),ON);
  assert.equal(g.status,'PROPOSED');const z=g.runCalibration.heartRateFiveZones;assert.equal(z.status,'UNAVAILABLE',String(bad));assert.equal(z.zones,undefined);}
 for(const bad of ['CHEST_STRAP',7,[],null])assert.equal(X.generateProgram(runner({id:'hr5-bad2',anchors:[recent10({heartRate:bad})]}),ON).runCalibration.heartRateFiveZones.status,'UNAVAILABLE');
});

// ---------- arithmetic and convention (HR5-4) ----------
test('HR5 arithmetic: over the whole plausible range the zones are contiguous, strictly increasing, open at both ends and share the approved edges',()=>{
 const O=VALUES.heartRate.observedMaximum;
 for(let bpm=O.plausibleBpm[0];bpm<=O.plausibleBpm[1];bpm++){
  const z=zonesFromMaximum(bpm,H5);assert.ok(z,'zones at '+bpm);assert.equal(z[0].fromBpm,null);assert.equal(z[4].toBpm,null);
  for(let i=1;i<5;i++){assert.equal(z[i].fromBpm,z[i-1].toBpm);assert.ok(Number.isInteger(z[i].fromBpm));if(i<4)assert.ok(z[i].fromBpm<z[i].toBpm,bpm+' '+z[i].zone);}
  // The three-zone output's arithmetic (Math.round(bpm x fraction)) at the edges both outputs have, and integer half-up per-mille at every edge.
  assert.equal(z[2].fromBpm,Math.round(bpm*O.zones[1].fromFraction));assert.equal(z[3].fromBpm,Math.round(bpm*O.zones[2].fromFraction));
  for(let i=1;i<5;i++){assert.equal(z[i].fromBpm,Math.round(bpm*H5.zones[i].fromFraction),'per mille = Math.round(bpm x fraction) at '+bpm);assert.equal(H5.zones[i].fromPerMille,Math.round(H5.zones[i].fromFraction*1000));}
 }
 assert.deepEqual(zonesFromMaximum(186,H5).map(z=>z.zone),[...ZONE_NAMES]);
 const broken=f=>zonesFromMaximum(186,{...H5,zones:H5.zones.map((z,i)=>f(z,i))});
 assert.equal(broken((z,i)=>i===2?{...z,toPerMille:800}:i===3?{...z,fromPerMille:800}:z),null,'an empty zone is degenerate');
 assert.equal(broken((z,i)=>i===0?{...z,fromPerMille:500}:z),null,'Z1 is open below');
 assert.equal(broken((z,i)=>i===1?{...z,toPerMille:810}:z),null,'a gap between zones');
 assert.equal(broken((z,i)=>i===1?{...z,fromPerMille:0.72}:z),null,'a per-mille edge is an integer');
 assert.equal(zonesFromMaximum(0,H5),null);assert.equal(zonesFromMaximum(NaN,H5),null);assert.equal(zonesFromMaximum(186,{...H5,zones:H5.zones.slice(1)}),null);
 // Found by the JavaScriptCore unit check (hr5-driver.js __hr5units): the pure function refuses an impossible maximum itself.
 for(const bad of [1000,139,221,186.5,-186,'186',null,undefined,Infinity])assert.equal(zonesFromMaximum(bad,H5),null,String(bad));
 assert.deepEqual(H5.plausibleReferenceBpm,VALUES.heartRate.observedMaximum.plausibleBpm,'the same range as the approved observed maximum');
 assert.deepEqual(H5.plausibleReferenceBpm,H5.references.LAB_MEASURED_MAXIMUM.plausibleBpm);
});
test('HR5 decision: the values file is SSCTR-HR5-DECISION-r1, and the decision\'s worked examples are what the engine computes',()=>{
 const D=DECISION.values;assert.equal(DECISION.recordId,'SSCTR-HR5-DECISION-r1');
 assert.deepEqual(H5.zones.map(z=>[z.zone,z.domain,z.fromPerMille,z.toPerMille,z.fromFraction,z.toFraction]),D.zones.map(z=>[z.name,z.domain,z.fromPerMille,z.toPerMille,z.fromFraction,z.toFraction]));
 const L=H5.references.LAB_MEASURED_MAXIMUM,DL=D.reference.labMeasuredMaximum;
 assert.deepEqual([L.plausibleBpm,L.sensors,L.rpeReportedMin,L.completedNotFalse,L.toleratedNotFalse,L.referenceConfidence,L.suppliedLabValuesMappedToZones],[DL.plausibleBpm,DL.sensors,DL.rpeReportedMin,DL.completedNotFalse,DL.toleratedNotFalse,DL.referenceConfidence,DL.suppliedLabValuesMappedToZones]);
 assert.equal(H5.references.OBSERVED_MAXIMUM.referenceConfidence,D.confidence.referenceConfidence.OBSERVED_MAXIMUM);assert.equal(H5.zoneModelConfidence,D.confidence.zoneModelConfidence);
 assert.equal(H5.conflict.observedAboveLabMoreThanBpm,D.conflict.bandBpm);assert.equal(H5.conflict.outcome,D.conflict.conflictOutput.reason);assert.equal(H5.conflict.lowerWins,D.conflict.lowerWins);
 for(const [f,u] of Object.entries(D.sessionUse.families))assert.deepEqual([H5.sessionUse.families[f].role,H5.sessionUse.families[f].reason??null,H5.sessionUse.families[f].slowDownCueFromZone??null],[u.role,u.reason??null,u.slowDownCueFromZone??null],f);
 assert.deepEqual(H5.sessionUse.unknownFamily,{role:D.sessionUse.states.UNKNOWN_FAMILY.role,reason:D.sessionUse.states.UNKNOWN_FAMILY.reason});
 for(const [k,v] of Object.entries(D.sessionUse.cueRules))if(typeof v==='boolean')assert.equal(H5.sessionUse.cueRules[k],v,k);
 for(const x of D.workedExamples.filter(x=>x.boundariesBpm)){const bpm=Number(x.reference.match(/(\d+)$/)[1]),z=zonesFromMaximum(bpm,H5);
  assert.deepEqual(z.slice(1).map(y=>y.fromBpm),[x.boundariesBpm.Z2from,x.boundariesBpm.Z3from,x.boundariesBpm.Z4from,x.boundariesBpm.Z5from],x.reference);}
 assert.deepEqual(Object.keys(D.disclosures).filter(k=>k!=='note').length,6);
});
test('HR5 convention: a reading on an edge belongs to the higher zone; readings outside any plausible heart rate have no zone',()=>{
 const z=zonesFromMaximum(186,H5);
 const P=[30,220];assert.deepEqual([60,133,134,148,149,161,162,170,171,200].map(b=>zoneOfBpm(z,b,P)),['Z1','Z1','Z2','Z2','Z3','Z3','Z4','Z4','Z5','Z5']);
 for(const b of [null,'150',NaN,-1,0,29,221])assert.equal(zoneOfBpm(z,b,P),null,String(b));
 assert.equal(zoneOfBpm(z,150),null,'no plausible range given, no zone');
});

// ---------- the role of heart rate in each session (HR5-6) ----------
test('HR5 sessions: effort governs every session and heart rate is never primary; easy, long and recovery runs get a slow-down cue only',()=>{
 const c=cal(runner({id:'hr5-roles',anchors:[recent10(STRAP(186))]})),S=c.heartRateFiveZones.sessions;
 assert.ok(Object.keys(S).length>0);assert.deepEqual(Object.keys(S).sort(),Object.keys(c.sessions).sort(),'one role per planned run session');
 for(const [id,s] of Object.entries(S)){
  assert.equal(s.primary,false,id);assert.equal(s.effortGoverns,true,id);assert.equal(s.family,c.sessions[id].family);assert.equal(s.week,c.sessions[id].week);
  const use=H5.sessionUse.families[s.family]??H5.sessionUse.unknownFamily;assert.equal(s.role,use.role,id+' '+s.family);
  if(s.role==='COMPLEMENTARY_CEILING_CUE'){const cue=c.heartRateFiveZones.zones.find(z=>z.zone===use.slowDownCueFromZone);
   assert.equal(s.slowDownCueAtOrAboveBpm,cue.fromBpm);assert.equal(s.neverSpeedUp,true);assert.equal(s.sustainedReadingOnly,true);assert.equal(s.healthMeaning,false);assert.equal(s.disclosure,'CUE');
   assert.equal(s.effortConflict,'EFFORT_GOVERNS_HEART_RATE_MAY_ONLY_SUGGEST_SLOWING');}
  else assert.equal(s.slowDownCueAtOrAboveBpm,undefined,id);
 }
 const fam=f=>Object.values(S).filter(s=>s.family===f);
 assert.ok(fam('EASY').length&&fam('EASY').every(s=>s.role==='COMPLEMENTARY_CEILING_CUE'&&s.slowDownCueAtOrAboveBpm===162));
 assert.ok(fam('LONG').length&&fam('LONG').every(s=>s.role==='COMPLEMENTARY_CEILING_CUE'));
 assert.ok(fam('THRESHOLD').length&&fam('THRESHOLD').every(s=>s.role==='NO_HEART_RATE_GUIDANCE'&&s.reason==='ZONES_ARE_NOT_INDIVIDUAL_THRESHOLDS'));
 assert.deepEqual(H5.sessionUse.primaryInV1,[],'no family has heart rate as its primary guidance in V1');
 for(const [id,s] of Object.entries(S))if(c.sessions[id]?.strides)assert.deepEqual([s.strides.role,s.strides.reason],['NO_HEART_RATE_GUIDANCE','HEART_RATE_LAGS_SHORT_HARD_BOUTS']);
});
test('HR5 sessions: interval, race and specific efforts carry no heart-rate guidance; without zones the cue has its reason; nothing is ever a target',()=>{
 const MAR={id:'hr5-mar',weeks:16,runExperience:'EXPERIENCED',goal:{kind:'RACE',event:{kind:'MARATHON',date:'2027-02-28'}},recent:{runDaysPerWeek:5,runMinutesPerWeek:360,longestRunMinutes:150,strengthDaysPerWeek:1},schedule:{runDays:[0,1,3,4,6],strengthDays:[2],runMinutes:90,strengthMinutes:35,longRunDay:6,longRunMinutes:210},anchors:[result('HALF_MARATHON',6300,daysBefore(20),STRAP(184))]};
 const FIVE={id:'hr5-5k',goal:{kind:'RACE',event:{kind:'5K',date:'2027-01-24'}},anchors:[recent10(STRAP(190))]};
 for(const input of [runner(MAR),runner(FIVE)]){const c=cal(input),S=Object.values(c.heartRateFiveZones.sessions);
  for(const s of S){assert.equal(s.primary,false);assert.notEqual(s.role,'PRIMARY');
   if(['FIVE_K_SPECIFIC','TEN_K_SPECIFIC'].includes(s.family))assert.deepEqual([s.role,s.reason],['NO_HEART_RATE_GUIDANCE','HEART_RATE_LAGS_SHORT_HARD_BOUTS']);
   if(['RACE','RACE_TOUCH'].includes(s.family))assert.deepEqual([s.role,s.reason],['NO_HEART_RATE_GUIDANCE','RACE_DAY_GUIDANCE_AS_APPROVED']);
   if(['HALF_MARATHON_SPECIFIC','MARATHON_SPECIFIC','THRESHOLD'].includes(s.family))assert.equal(s.role,'NO_HEART_RATE_GUIDANCE');}
  assert.ok(S.some(s=>s.role==='NO_HEART_RATE_GUIDANCE')&&S.some(s=>s.role==='COMPLEMENTARY_CEILING_CUE'),input.athlete.id);}
 const none=cal(runner({id:'hr5-roles-none',anchors:[recent10()]})).heartRateFiveZones.sessions;
 for(const s of Object.values(none)){if(H5.sessionUse.families[s.family]?.role==='COMPLEMENTARY_CEILING_CUE')assert.deepEqual([s.role,s.reason],['NONE','NO_MEASURED_HEART_RATE']);assert.equal(s.slowDownCueAtOrAboveBpm,undefined);}
});
test('HR5 sessions: a beginner\'s walk/jog plan is by effort only, with no heart-rate role; the five zones say so',()=>{
 const c=cal(runner({id:'hr5-beg',runExperience:'NONE',goal:'REGULAR',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,strengthDaysPerWeek:0},schedule:{runDays:[1,3,5],runMinutes:35,longRunDay:5,longRunMinutes:undefined},weeks:8,anchors:[recent10(STRAP(186))]}));
 assert.equal(c.status,'EFFORT_ONLY');assert.equal(c.heartRateFiveZones.status,'UNAVAILABLE');assert.equal(c.heartRateFiveZones.reason,'MODE_WALK_JOG_RESTART_RETURN');
 assert.ok(Object.values(c.heartRateFiveZones.sessions).every(s=>s.role==='NONE'));
});
test('HR5 disclosures: a newer runner in EASY mode is told the same heart rate can mean a harder effort; an experienced runner is not',()=>{
 const nov=five(runner({id:'hr5-nov',runExperience:'NOVICE',goal:'REGULAR',anchors:[recent10(STRAP(186))]}));
 assert.equal(nov.status,'AVAILABLE','a NOVICE with recent running is in EASY mode');assert.deepEqual(nov.disclosures,['ZONES','OBSERVED_MAXIMUM','NEWER_RUNNER']);
 const exp=five(runner({id:'hr5-exp',runExperience:'EXPERIENCED',anchors:[recent10(STRAP(186))]}));assert.equal(exp.status,'AVAILABLE');assert.deepEqual(exp.disclosures,['ZONES','OBSERVED_MAXIMUM']);
});

// ---------- nothing else moves ----------
test('HR5 additive: heart rate and the five zones change no plan, no pace band, no estimate, no session guidance and no other reading',()=>{
 for(const id of ['hr5-add-a','hr5-add-b']){
  const input=runner({id,anchors:[recent10(STRAP(186)),lab(190)]}),plain=runner({id,anchors:[recent10()]});
  const on=X.generateProgram(input,ON),off=X.generateProgram(input,DEV),bare=X.generateProgram(plain,ON);
  // The program carries its canonical intake (the anchors themselves), so across intakes the weeks are compared: every session and prescription.
  assert.equal(hash(on.program),hash(off.program));assert.equal(hash(on.program.weeks),hash(bare.program.weeks),'heart rate changes no prescribed session');
  assert.equal(hash(withoutFive(on.runCalibration)),hash(withoutFive(off.runCalibration)),'the five zones change nothing else of the reading');
  for(const k of ['paceBands','estimates','sessions','capacity','assessment','effortDomains'])assert.equal(hash(on.runCalibration[k]),hash(bare.runCalibration[k]),k);
  const {runCalibration:_a,...restOn}=on,{runCalibration:_b,...restOff}=off;assert.equal(hash(restOn),hash(restOff),'nor any other key of the answer');
 }
});
test('HR5 determinism: the same record gives the same bytes; JSON round trip is identity',()=>{
 const input=runner({id:'hr5-det',anchors:[recent10(STRAP(186)),lab(195)]}),a=five(input),b=five(JSON.parse(JSON.stringify(input)));
 assert.equal(hash(a),hash(b));assert.deepEqual(JSON.parse(JSON.stringify(a)),a);
});

// ---------- the week boundary and withdrawal (HR5-8) ----------
const RECENT=x=>runner({asOf:'2026-11-07',start:'2026-11-09',...x});
test('HR5 flow: a maximum declared during a week counts from the next week; a hold withholds the zones and every cue at once',()=>{
 const t=timeline(RECENT({id:'hr5-f-week',anchors:[recent10()]}),{opts:ON});
 assert.equal(t.cal.heartRateFiveZones.status,'UNAVAILABLE');
 t.step(0,2,'WEEKLY_REVIEW',{runEvidence:[{id:'tt-1',kind:'TIME_TRIAL',distance:'5K',seconds:1500,date:t.day(0,1),measurement:'GPS',rpe:9,tolerated:true,...STRAP(188)}]});
 assert.equal(t.cal.heartRateFiveZones.status,'UNAVAILABLE','the week in force is fixed');
 const nextWeek=Object.values(t.cal.heartRateFiveZones.sessions).filter(s=>s.provisional&&s.role==='COMPLEMENTARY_CEILING_CUE');
 assert.ok(nextWeek.length&&nextWeek.every(s=>s.slowDownCueAtOrAboveBpm===Math.round(188*0.87)),'next week\'s sessions already show what is known today');
 const d=t.day(1,0);t.step(1,0,'WEEKLY_REVIEW',{eligibility:ELIG(d)});
 assert.equal(t.cal.heartRateFiveZones.status,'AVAILABLE');assert.equal(t.cal.heartRateFiveZones.reference.evidenceId,'tt-1');
 const held=t.step(1,1,'WEEKLY_REVIEW',{eligibility:ELIG(t.day(1,1),{pain:true})});
 assert.equal(held.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(t.cal.heartRateFiveZones.status,'UNAVAILABLE');assert.equal(t.cal.heartRateFiveZones.reason,'HOLD_NO_PRESCRIPTION');
 assert.ok(Object.values(t.cal.heartRateFiveZones.sessions).every(s=>s.role==='NONE'&&s.reason==='HOLD_NO_PRESCRIPTION'));
 assert.equal(t.cal.heartRateZones.reason,'HOLD_NO_PRESCRIPTION');assert.ok(t.same,t.differences.join(','));
});
test('HR5 flow: a declared break of 14 days or more withdraws the zones; the maximum from before it is not read again',()=>{
 const W=VALUES.withdrawal,t=timeline(RECENT({id:'hr5-f-break',anchors:[result('10K',3300,'2026-11-05',STRAP(186))]}),{opts:ON});
 assert.equal(t.cal.heartRateFiveZones.status,'AVAILABLE');
 const r=t.step(4,3,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(2,0),endDate:t.day(2,W.breakDaysWithdrawMin+1),days:W.breakDaysWithdrawMin+2,nonclinical:true,reasonCategory:'SCHEDULE'}});
 assert.notEqual(r.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(t.cal.heartRateFiveZones.status,'UNAVAILABLE');assert.equal(t.cal.heartRateZones.status,'UNAVAILABLE');
 assert.ok(['MODE_WALK_JOG_RESTART_RETURN','HEART_RATE_DATA_NOT_QUALIFYING','NO_MEASURED_HEART_RATE'].includes(t.cal.heartRateFiveZones.reason),t.cal.heartRateFiveZones.reason);
 assert.ok(t.same,t.differences.join(','));
});
test('HR5 flow: the athlete without any heart rate trains exactly as before — every session prescribed, logged and reviewed by effort',()=>{
 const t=timeline(RECENT({id:'hr5-f-watchless',anchors:[recent10()]}),{opts:ON}),u=timeline(RECENT({id:'hr5-f-watchless',anchors:[recent10()]}),{opts:DEV});
 for(const w of [0,1]){t.week(w);u.week(w);}
 assert.equal(hash(t.p),hash(u.p));assert.equal(hash(t.ledger),hash(u.ledger));assert.equal(hash(withoutFive(t.cal)),hash(withoutFive(u.cal)));
 assert.ok(t.p.weeks[2].sessions.filter(live).length>0,'the plan goes on');assert.equal(t.cal.heartRateFiveZones.reason,'NO_MEASURED_HEART_RATE');assert.ok(t.same);
});

// ---------- time in zone (HR5-7) ----------
test('HR5 classifier: only a strap or ECG series, with limits the caller must give; gaps and artifacts are unknown, never interpolated; coverage always reported',()=>{
 const z=zonesFromMaximum(186,H5),T={maxGapSeconds:10,minCoverageFraction:0.8,plausibleBpm:[30,220]}; // TEST-ONLY limits: the decision sets none (HR5-7)
 const S=samples=>({sensor:'CHEST_STRAP',samples});
 const series=[{t:0,bpm:120},{t:5,bpm:140},{t:10,bpm:150},{t:15,bpm:165},{t:20,bpm:175},{t:25,bpm:175}];
 const r=classifySamples(z,S(series),T);assert.equal(r.status,'AVAILABLE');assert.deepEqual(r.seconds,{Z1:5,Z2:5,Z3:5,Z4:5,Z5:5});assert.equal(r.fromAverageHeartRate,false);assert.equal(r.coverage,1);assert.equal(r.coveredSeconds,25);
 assert.equal(classifySamples(z,S(series)).reason,'CLASSIFIER_LIMITS_NOT_SET','no numeric limit is approved: without the caller\'s there is no distribution');
 for(const sensor of ['OPTICAL',undefined,'WRIST'])assert.equal(classifySamples(z,{sensor,samples:series},T).reason,'SENSOR_NOT_QUALIFYING',String(sensor));
 assert.equal(classifySamples(z,{sensor:'ECG',samples:series},T).status,'AVAILABLE');
 const gap=classifySamples(z,S([{t:0,bpm:150},{t:60,bpm:150},{t:62,bpm:150}]),T);assert.equal(gap.status,'UNAVAILABLE');assert.equal(gap.reason,'INSUFFICIENT_COVERAGE');assert.equal(gap.unknownSeconds,50);
 const bad=classifySamples(z,S([{t:0,bpm:150},{t:5,bpm:230},{t:10,bpm:150,artifact:true},{t:15,bpm:150},{t:20,bpm:150},{t:25,bpm:150},{t:30,bpm:150},{t:35,bpm:150},{t:40,bpm:150},{t:45,bpm:150},{t:50,bpm:150}]),T);
 assert.equal(bad.status,'AVAILABLE');assert.equal(bad.unknownSeconds,10,'above 220 bpm and an artifact are unknown');assert.equal(bad.seconds.Z3,40);
 assert.equal(classifySamples(z,S([{t:10,bpm:150},{t:5,bpm:150}]),T).reason,'SERIES_OUT_OF_ORDER');
 assert.equal(classifySamples(z,S([{t:0,bpm:150}]),T).reason,'NO_HEART_RATE_SERIES','one value (an average) is never a distribution');
 assert.equal(classifySamples(null,S(series),T).reason,'NO_ZONES');
 assert.equal(H5.sessionDistribution.classifierWiredToInput,false);
 // QRE-HR5-11: a limit of zero, a reversed or open range, a coverage of 0 or above 1, or a duration shorter than the series is no limit.
 for(const bad of [{...T,maxGapSeconds:0},{...T,minCoverageFraction:0},{...T,minCoverageFraction:1.5},{...T,plausibleBpm:[220,30]},{...T,plausibleBpm:[30]},{...T,plausibleBpm:[-5,220]}])
  assert.equal(classifySamples(z,S(series),bad).reason,'CLASSIFIER_LIMITS_NOT_SET',JSON.stringify(bad));
 assert.equal(classifySamples(z,S(series),{...T,durationSeconds:10}).reason,'INVALID_DURATION');assert.equal(classifySamples(z,S(series),{...T,durationSeconds:30}).coverage,0.833);
});

// ---------- review findings (QRE-SEC-HR5-REVIEW, SSCTR-HR5-REVIEW-r1) ----------
test('HR5 sessions follow the reading\'s order: a hold, then the boundary off (either one), then an effort-only mode, then the family (C5, SSCTR-HR5-R-02)',()=>{
 const input=runner({id:'hr5-order',anchors:[recent10(STRAP(186))]});
 const noHr=cal(input,{...ON,runCalibration:devRunCalibration(Object.values(RUN_BOUNDARIES).filter(b=>b!==RUN_BOUNDARIES.HR))}).heartRateFiveZones;
 assert.ok(Object.values(noHr.sessions).every(s=>s.role==='NONE'&&s.reason==='EXTENSION_NOT_ENABLED'),'no sporting reason is given while the heart-rate boundary is off');
 const off=cal(input,{...DEV,heartRateFiveZone:fiveZoneAuthority({heartRateFiveZoneRecords:{records:[]}})}).heartRateFiveZones;
 assert.ok(Object.values(off.sessions).every(s=>s.role==='NONE'&&s.reason==='EXTENSION_NOT_ENABLED'));
 const s={prescription:{family:'EASY'}},z=five(input),auth=devFiveZone();
 assert.equal(sessionHeartRate(s,{zones5:z,hold:true,effortOnly:false,auth:fiveZoneAuthority({heartRateFiveZoneRecords:{records:[]}}),on:false}).reason,'HOLD_NO_PRESCRIPTION','a hold comes first, as in the reading');
 assert.equal(sessionHeartRate(s,{zones5:z,hold:false,effortOnly:true,auth,on:true}).reason,'MODE_WALK_JOG_RESTART_RETURN');
 assert.equal(sessionHeartRate(s,{zones5:z,hold:false,effortOnly:false,auth,on:true,mode:'EASY'}).slowDownCueAtOrAboveBpm,162);
 // QRE-HR5-15: EASY_REESTABLISHMENT has its cue only in EASY mode.
 assert.equal(sessionHeartRate({prescription:{family:'EASY_REESTABLISHMENT'}},{zones5:z,hold:false,effortOnly:false,auth,on:true,mode:'RESTART'}).reason,'MODE_WALK_JOG_RESTART_RETURN');
 assert.equal(sessionHeartRate({prescription:{family:'EASY_REESTABLISHMENT'}},{zones5:z,hold:false,effortOnly:false,auth,on:true,mode:'EASY'}).role,'COMPLEMENTARY_CEILING_CUE');
 // SSCTR-HR5-R-03: a family read only as an own key; a prototype name or a non-string is the unknown family, failing closed.
 for(const family of ['constructor','__proto__','toString','hasOwnProperty',7,null,undefined])
  assert.deepEqual([sessionHeartRate({prescription:{family}},{zones5:z,hold:false,effortOnly:false,auth,on:true,mode:'EASY'}).role,sessionHeartRate({prescription:{family}},{zones5:z,hold:false,effortOnly:false,auth,on:true,mode:'EASY'}).reason],['NO_HEART_RATE_GUIDANCE','UNKNOWN_FAMILY_FAIL_CLOSED'],String(family));
});
test('HR5 fault isolation (QRE-HR5-08): a fault in the five-zone code is a typed UNAVAILABLE, never a broken run calibration',()=>{
 const broken={...devFiveZone(),values:{...devFiveZone().values,references:null,sessionUse:null}};
 const c=cal(runner({id:'hr5-fault',anchors:[recent10(STRAP(186))]}),{...DEV,heartRateFiveZone:broken});
 assert.notEqual(c.status,'CALIBRATION_ERROR');assert.equal(c.heartRateFiveZones.status,'UNAVAILABLE');assert.equal(c.heartRateFiveZones.reason,'FIVE_ZONE_ERROR');
 assert.ok(Object.values(c.heartRateFiveZones.sessions).every(s=>s.role==='NONE'&&s.reason==='FIVE_ZONE_ERROR'&&s.primary===false));
 const good=cal(runner({id:'hr5-fault',anchors:[recent10(STRAP(186))]}),DEV);assert.equal(hash(withoutFive(c)),hash(withoutFive(good)),'nothing else of the reading moves');
});
test('HR5 lab expiry and floors (QRE-HR5-11): a lab maximum lasts 182 days and is never read across a declared break of 14 days or more',()=>{
 const at=d=>five(runner({id:'hr5-lab-age',anchors:[recent10(),lab(190,{date:daysBefore(d)})]}));
 const week0=d=>d+2; // the plan's first week starts two days after the intake
 assert.equal(at(180).status,'AVAILABLE');assert.equal(at(180).reference.ageDays,week0(180));
 assert.equal(at(181).status,'UNAVAILABLE','182 days old at the week start is the last day in force; 183 is past it');assert.equal(at(181).reason,'HEART_RATE_DATA_NOT_QUALIFYING');
 const W=VALUES.withdrawal,t=timeline(RECENT({id:'hr5-lab-break',anchors:[recent10(),{id:'lab-b',...lab(190,{date:'2026-10-20'})}]}),{opts:ON});
 assert.equal(t.cal.heartRateFiveZones.reference.evidenceId,'lab-b');
 t.step(4,3,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(2,0),endDate:t.day(2,W.breakDaysWithdrawMin+1),days:W.breakDaysWithdrawMin+2,nonclinical:true,reasonCategory:'SCHEDULE'}});
 assert.equal(t.cal.heartRateFiveZones.status,'UNAVAILABLE','the lab maximum from before the break is not read again');
 assert.ok(t.same,t.differences.join(','));
});
test('HR5 production authority end to end (QRE-HR5-11): an independent record bound to the pinned bytes enables the zones through the engine; one bound to other bytes does not',()=>{
 const rec=(x={})=>({boundaryId:HR5_BOUNDARY,valuesSha256:HR5_SHA256,independent:true,disposition:'APPROVE_WITH_CONDITIONS',evidenceStatus:'SUPPORTED_WITH_LIMITS',sourceIds:['S02'],reviewId:'TEST',...x});
 const input=runner({id:'hr5-prod',anchors:[recent10(STRAP(186))]});
 const on=five(input,{...DEV,heartRateFiveZoneRecords:{records:[rec()]}}),stale=five(input,{...DEV,heartRateFiveZoneRecords:{records:[rec({valuesSha256:'0'.repeat(64)})]}});
 assert.equal(on.status,'AVAILABLE');assert.equal(on.source,'CURRENT_INDEPENDENT_REVIEW');assert.equal(on.sha256,HR5_SHA256);
 assert.equal(stale.reason,'EXTENSION_NOT_ENABLED');
});

// ---------- the standing rules ----------
test('HR5 texts: no physiological threshold claim in the values or any output',()=>{
 assert.ok(!textsOf(H5).some(t=>FORBIDDEN_CLAIM.test(t)),'values file');
 for(const input of [runner({id:'hr5-txt',anchors:[recent10(STRAP(186)),lab(195)]}),runner({id:'hr5-txt2'})])assert.ok(!textsOf(five(input)).some(t=>FORBIDDEN_CLAIM.test(t)));
});
