// V1HR5 five heart-rate zones, corrected by V1HR5R (Founder decision FOUNDER-HR5-RUNNA-PARITY-2026-11-25): directed tests of heartRateFiveZones
// revision 2 (V1X-HR-FIVE-ZONE-2) — the authority (fail closed), five zones from the age for every valid athlete (220 - age), the exact whole-bpm
// edges of 65/81/89/97 %, the reference order (declared > lab > observed above the estimate > age), conflicts, invalid and extreme values, measured
// values classified one by one, the role of heart rate in each session, withdrawal, the future sample classifier, determinism, and that nothing
// else of the run calibration, the plan or the session guidance moves. The inner reading (the run calibration, no profile) is X (v1-run-index);
// the composed entry with the athlete's profile is S (v1-safety-index). Synthetic athletes only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {X,DEV,VALUES,ELIG,runner,result,timeline,textsOf,hash,report,live} from './v1rc-helpers.mjs';
import * as S from '../src/v1-safety-index.mjs';
import {devRunCalibration,RUN_BOUNDARIES} from '../src/v1-run-calibration.mjs';
import {fiveZoneAuthority,devFiveZone,fiveZoneValuesOf,zonesFromMaximum,zonesFromCustomLimits,zoneOfBpm,classifySamples,sessionHeartRate,applyHeartRateProfile,HR5_SHA256,HR5_FILE_SHA256,HR5_URL,HR5_BOUNDARY,ZONE_NAMES,KINDS} from '../src/v1-heart-rate-zones.mjs';
import {FORBIDDEN_CLAIM} from '../src/r6-prescription.mjs';

const H5=JSON.parse(fs.readFileSync(HR5_URL,'utf8'));
const ON={...DEV,heartRateFiveZone:devFiveZone()};
const AS_OF='2026-11-07',daysBefore=n=>new Date(Date.parse(AS_OF+'T00:00:00Z')-n*864e5).toISOString().slice(0,10);
/** The inner reading (no profile): the run calibration of the run entry. */
const cal=(input,opts=ON)=>{const g=X.generateProgram(input,opts);assert.equal(g.status,'PROPOSED',g.reason);return g.runCalibration;};
const five=(input,opts=ON)=>cal(input,opts).heartRateFiveZones;
/** The composed entry (the app's): the reading resolved with the athlete's profile. */
const gen=(input,opts=ON)=>{const g=S.generateProgram(input,opts);assert.equal(g.status,'PROPOSED',g.reason);return g;};
const calS=(input,opts=ON)=>gen(input,opts).runCalibration;
const fiveS=(input,opts=ON)=>calS(input,opts).heartRateFiveZones;
const STRAP=bpm=>({heartRate:{maxBpm:bpm,sensor:'CHEST_STRAP'}});
const recent10=(x={})=>result('10K',3300,daysBefore(14),x);
const LABV={protocol:'Incremental treadmill test',source:'Laboratory report',modality:'TREADMILL_RUN',values:[{name:'First measured anchor',value:150,unit:'bpm'}]};
const lab=(maxBpm,x={},labx={})=>({kind:'LAB_TEST',date:daysBefore(30),rpe:9,tolerated:true,lab:{...LABV,...labx},...(maxBpm===undefined?{}:{heartRate:{maxBpm,sensor:'ECG'}}),...x});
const aged=(age,x={})=>runner({...x,athlete:{...(x.athlete??{}),ageYears:age}});
/** Inclusive whole-bpm limits of each zone: [zone, minBpm, maxBpm]. */
const limits=z=>z.zones.map(x=>[x.zone,x.minBpm,x.maxBpm]);
const withoutFive=c=>{const {heartRateFiveZones:_f,hash:_h,...rest}=c;return rest;};
const HR_KEYS=['heartRateProfileRecord','heartRateProfileDeclared'];
const plainAnswer=r=>Object.fromEntries(Object.entries(r).filter(([k])=>!HR_KEYS.includes(k)&&k!=='runCalibration'));
const isCue=s=>H5.sessionUse.families[s.family]?.role==='COMPLEMENTARY_CEILING_CUE';

// ---------- authority: fail closed ----------
test('HR5 authority: the values are read only as the pinned bytes; off without an independent enabling record bound to them',()=>{
 assert.equal(HR5_FILE_SHA256,HR5_SHA256,'the values file is the pinned bytes');assert.equal(H5.id,'V1X-HR-FIVE-ZONE-2');
 const bytes=fs.readFileSync(HR5_URL);assert.equal(createHash('sha256').update(bytes).digest('hex'),HR5_SHA256);
 assert.equal(fiveZoneValuesOf(Buffer.concat([bytes,Buffer.from(' ')])),null,'a single byte more and there are no values');
 const rec=(x={})=>({boundaryId:HR5_BOUNDARY,valuesSha256:HR5_SHA256,independent:true,disposition:'APPROVE_WITH_CONDITIONS',evidenceStatus:'SUPPORTED_WITH_LIMITS',sourceIds:['S1'],...x});
 const on=records=>fiveZoneAuthority({heartRateFiveZoneRecords:{records}}).approved;
 assert.equal(on([rec()]),true);
 for(const bad of [[],[rec({valuesSha256:'0'.repeat(64)})],[rec({independent:false})],[rec({evidenceStatus:'PLAUSIBLE_BUT_UNCERTAIN'})],[rec({sourceIds:[]})],[rec(),rec({disposition:'REFUSE'})],[rec({boundaryId:'V1X-RUN-HR'})]])
  assert.equal(on(bad),false,JSON.stringify(bad));
 const offOpts={...DEV,heartRateFiveZone:fiveZoneAuthority({heartRateFiveZoneRecords:{records:[]}})};
 for(const off of [five(aged(30,{id:'hr5-auth',anchors:[recent10(STRAP(186))]}),offOpts),fiveS(aged(30,{id:'hr5-auth'}),offOpts)]){
  assert.equal(off.status,'UNAVAILABLE');assert.equal(off.reason,'EXTENSION_NOT_ENABLED');assert.ok(Object.values(off.sessions).every(s=>s.role==='NONE'&&s.reason==='EXTENSION_NOT_ENABLED'));}
});
test('HR5 authority: the five zones need the run calibration\'s heart-rate boundary (and CAPACITY): without it there are none',()=>{
 const input=aged(30,{id:'hr5-auth-hr',anchors:[recent10(STRAP(186))]});
 const noHr=fiveS(input,{...ON,runCalibration:devRunCalibration(Object.values(RUN_BOUNDARIES).filter(b=>b!==RUN_BOUNDARIES.HR))});
 assert.equal(noHr.status,'UNAVAILABLE');assert.equal(noHr.reason,'EXTENSION_NOT_ENABLED','the age does not open a boundary that is off');
 const noCap=calS(input,{...ON,runCalibration:devRunCalibration([RUN_BOUNDARIES.HR])});
 assert.equal(noCap.status,'DISABLED');assert.equal(noCap.heartRateFiveZones,undefined,'a disabled calibration carries no reading at all, as before');
});

// ---------- the age estimate: five zones for every valid athlete (acceptance 1, 4, 5) ----------
test('HR5R acceptance 1: a 30-year-old with no wearable gets five estimated zones (220 - 30 = 190), exact, with provenance and no fabricated measurement',()=>{
 const g=gen(aged(30,{id:'hr5r-30'})),z=g.runCalibration.heartRateFiveZones;
 assert.equal(z.status,'AVAILABLE');assert.equal(z.method,'PERCENT_OF_MAXIMUM_HEART_RATE');assert.equal(z.basis,'ESTIMATED_FROM_AGE');assert.equal(z.provenance,'ESTIMATED');assert.equal(z.estimated,true);
 assert.deepEqual(z.reference,{kind:'AGE_ESTIMATE',provenance:'ESTIMATED',bpm:190,formula:'220_MINUS_AGE',ageYears:30,ageDeclared:30,ageDeclaredOn:AS_OF});
 assert.deepEqual(limits(z),[['Z1',null,123],['Z2',124,153],['Z3',154,169],['Z4',170,184],['Z5',185,null]]);
 assert.deepEqual(z.zones.map(x=>[x.abovePercent,x.upToPercent]),[[null,65],[65,81],[81,89],[89,97],[97,null]]);
 assert.deepEqual(z.zones.map(x=>[x.fromBpm,x.toBpm]),[[null,124],[124,154],[154,170],[170,185],[185,null]],'the same intervals as [from, to)');
 assert.equal(z.referenceConfidence,'LOW');assert.equal(z.zoneModelConfidence,'LOW');assert.equal(z.boundarySource,'DEFAULT_PERCENT_OF_MAXIMUM');assert.equal(z.threeDomains,'NOT_NESTED');
 assert.deepEqual(z.disclosures,['ZONES','AGE_ESTIMATE','NOT_MEDICAL']);assert.ok(z.notes.includes('POPULATION_FORMULA_NOT_INDIVIDUAL')&&z.notes.includes('NOT_MEDICAL_EVIDENCE'));
 // Acceptance 5: no measurement, no distribution, no live heart rate assumed.
 assert.deepEqual(z.measuredHeartRate,{status:'UNAVAILABLE',reason:'NO_HEART_RATE_MEASUREMENTS'});assert.deepEqual(z.measurements,[]);
 assert.deepEqual(z.sessionDistribution,{status:'UNAVAILABLE',reason:'NO_HEART_RATE_SERIES_IN_CONTRACT',fromAverageHeartRate:false});
 assert.deepEqual(z.liveHeartRate,{status:'UNAVAILABLE',reason:'NO_LIVE_HEART_RATE_CHANNEL_IN_CONTRACT',assumedFromASyncedWatch:false});
 assert.equal(z.measuredReferences.status,'UNAVAILABLE');assert.equal(z.measuredReferences.reason,'NO_MEASURED_HEART_RATE');
 for(const k of ['primaryGuidance','sessionTarget','gatesProgression','convertedToPaceOrEffort','namedThresholds','changesThePlan','medicalEvidence','releasesASafetyBlock'])assert.equal(z[k],false,k);
 // The age is the intake's, recorded once in the carried profile record.
 assert.deepEqual(g.heartRateProfileRecord.map(r=>[r.source,r.declaration]),[['INTAKE',{ageYears:30}]]);assert.deepEqual(g.heartRateProfileDeclared,{added:['hrp-0001'],refused:[],unchanged:[]});
 // The easy-running cue is there with no device: Z4 starts at 170.
 const S5=Object.values(z.sessions).filter(isCue);assert.ok(S5.length&&S5.every(s=>s.role==='COMPLEMENTARY_CEILING_CUE'&&s.slowDownCueAtOrAboveBpm===170&&s.reference==='AGE_ESTIMATE'));
});
test('HR5R acceptance 4: every valid age 18-80 has five zones with no lab, strap or history; the intake\'s own age rules refuse the rest',()=>{
 for(let age=18;age<=80;age++){const z=zonesFromMaximum(220-age,H5);assert.ok(z,'age '+age);assert.equal(z.length,5);}
 for(const age of [18,45,80]){const z=fiveS(aged(age,{id:'hr5r-age-'+age}));assert.equal(z.status,'AVAILABLE',String(age));assert.equal(z.reference.bpm,220-age);assert.equal(z.reference.kind,'AGE_ESTIMATE');}
 for(const bad of [17,81,'30',30.5,-1,null]){
  const g=S.generateProgram(aged(bad,{id:'hr5r-age-bad'}),ON);
  assert.ok(!(g.heartRateProfileRecord??[]).some(r=>r.declaration?.ageYears!==undefined),'no invalid age is recorded: '+bad);
  if(g.runCalibration?.heartRateFiveZones)assert.notEqual(g.runCalibration.heartRateFiveZones.reference?.kind,'AGE_ESTIMATE',String(bad));}
 // An intake that states only "adult" (ageEligible) and no age: no estimate, typed, never assumed; a declared maximum still gives zones.
 const noAge=fiveS(runner({id:'hr5r-noage'}));assert.equal(noAge.status,'UNAVAILABLE');assert.equal(noAge.reason,'AGE_REQUIRED');assert.equal(noAge.zones,undefined);
 const declaredOnly=fiveS({...runner({id:'hr5r-noage2'}),heartRateProfile:{maxHeartRateBpm:188}});assert.equal(declaredOnly.status,'AVAILABLE');assert.equal(declaredOnly.reference.kind,'ATHLETE_DECLARED_MAXIMUM');
});
test('HR5R aging: the age in force grows by the whole years elapsed since it was declared, never by a fraction',()=>{
 const g=gen(aged(30,{id:'hr5r-aging'})),rc=g.runCalibration,rec=g.heartRateProfileRecord,id='hr5r-aging';
 const at=d=>S.heartRateProfileReading(rc,rec,{athleteId:id,at:d},ON).heartRateFiveZones.reference;
 assert.equal(at('2027-11-06').ageYears,30,'the day before the anniversary');
 // SSCTR-HR5R-REV-3: past 80 there is no estimate (typed); a declared maximum still gives zones.
 const g80=gen(aged(80,{id:'hr5r-80'})),r80=g80.runCalibration,q=d=>S.heartRateProfileReading(r80,g80.heartRateProfileRecord,{athleteId:'hr5r-80',at:d},ON).heartRateFiveZones;
 assert.equal(q('2027-11-06').reference.bpm,140);const past=q('2027-11-07');assert.equal(past.status,'UNAVAILABLE');assert.equal(past.reason,'AGE_OUTSIDE_ESTIMATE_RANGE');assert.equal(past.ageOutsideEstimateRange,true);
 assert.ok(Object.values(past.sessions).filter(isCue).every(s=>s.role==='NONE'&&s.reason==='AGE_OUTSIDE_ESTIMATE_RANGE'));
 const d80=gen({...aged(80,{id:'hr5r-80d'}),heartRateProfile:{maxHeartRateBpm:165}}),decl=S.heartRateProfileReading(d80.runCalibration,d80.heartRateProfileRecord,{athleteId:'hr5r-80d',at:'2027-11-07'},ON).heartRateFiveZones;
 assert.equal(decl.status,'AVAILABLE');assert.equal(decl.reference.kind,'ATHLETE_DECLARED_MAXIMUM');assert.equal(decl.reference.bpm,165);assert.equal(at('2027-11-07').ageYears,31);assert.equal(at('2027-11-07').bpm,189);assert.equal(at('2029-11-07').bpm,187);
});

// ---------- arithmetic and convention ----------
test('HR5R arithmetic: for every maximum 120-230 each whole bpm lies in exactly one zone, and in Z_k exactly when its percentage is above the lower and at most the upper',()=>{
 const P=H5.declaredMaximum.plausibleBpm,pct=[0,65,81,89,97,Infinity];
 for(let m=P[0];m<=P[1];m++){
  const z=zonesFromMaximum(m,H5);assert.ok(z,'zones at '+m);assert.equal(z[0].minBpm,null);assert.equal(z[4].maxBpm,null);
  for(let i=1;i<5;i++){assert.equal(z[i].minBpm,z[i-1].maxBpm+1,'contiguous at '+m);if(i<4)assert.ok(z[i].minBpm<=z[i].maxBpm,'not empty at '+m);}
  for(let x=1;x<=260;x++){const inZ=z.filter(k=>(k.minBpm===null||x>=k.minBpm)&&(k.maxBpm===null||x<=k.maxBpm));assert.equal(inZ.length,1,`${x} at ${m}`);
   const i=ZONE_NAMES.indexOf(inZ[0].zone);assert.ok(x*100>pct[i]*m&&(i===4||x*100<=pct[i+1]*m),`${x} of ${m} in ${inZ[0].zone}`);}
 }
 assert.deepEqual(limits({zones:zonesFromMaximum(186,H5)}),[['Z1',null,120],['Z2',121,150],['Z3',151,165],['Z4',166,180],['Z5',181,null]]);
 const broken=f=>zonesFromMaximum(186,{...H5,zones:H5.zones.map((z,i)=>f(z,i))});
 assert.equal(broken((z,i)=>i===1?{...z,upToPercent:65}:i===2?{...z,abovePercent:65}:z),null,'an empty zone is degenerate');
 assert.equal(broken((z,i)=>i===0?{...z,abovePercent:10}:z),null,'Z1 is open below');
 assert.equal(broken((z,i)=>i===2?{...z,abovePercent:82}:z),null,'a gap between zones');
 assert.equal(broken((z,i)=>i===1?{...z,upToPercent:81.5}:z),null,'a percentage is whole');
 for(const bad of [1000,119,231,186.5,-186,'186',null,undefined,Infinity,NaN,0])assert.equal(zonesFromMaximum(bad,H5),null,String(bad));
});
test('HR5R convention: a reading is rounded half up to a whole bpm, then placed by inclusive limits; readings outside any plausible heart rate have no zone',()=>{
 const z=zonesFromMaximum(190,H5),P=[30,230];
 assert.deepEqual([60,123,123.4,123.5,124,153,154,169,170,184,185,200].map(b=>zoneOfBpm(z,b,P)),['Z1','Z1','Z1','Z2','Z2','Z2','Z3','Z3','Z4','Z4','Z5','Z5']);
 for(const b of [null,'150',NaN,-1,0,29,231])assert.equal(zoneOfBpm(z,b,P),null,String(b));
 assert.equal(zoneOfBpm(z,150),null,'no plausible range given, no zone');
});

// ---------- the reference order ----------
test('HR5R acceptance 2: measured heart rate keeps five zones — a chest-strap maximum above the age estimate replaces it; one below it does not',()=>{
 const above=fiveS(aged(40,{id:'hr5r-strap',anchors:[{id:'race-10k',...recent10(STRAP(186))}]}));
 assert.equal(above.status,'AVAILABLE');assert.equal(above.reference.kind,'OBSERVED_MAXIMUM');assert.equal(above.reference.bpm,186);assert.equal(above.provenance,'MEASURED');assert.equal(above.basis,'ESTIMATED_FROM_OBSERVED_MAXIMUM');
 assert.deepEqual(limits(above),[['Z1',null,120],['Z2',121,150],['Z3',151,165],['Z4',166,180],['Z5',181,null]]);
 assert.deepEqual(above.notUsed,[{kind:'AGE_ESTIMATE',bpm:180,reason:'A_MORE_SPECIFIC_REFERENCE_IN_FORCE'}]);assert.ok(above.notes.includes('OBSERVED_MAXIMUM_MAY_BE_BELOW_TRUE_MAXIMUM'));
 const below=fiveS(aged(30,{id:'hr5r-strap2',anchors:[{id:'race-10k',...recent10(STRAP(186))}]}));
 assert.equal(below.reference.kind,'AGE_ESTIMATE');assert.equal(below.reference.bpm,190);assert.deepEqual(below.notUsed,[{kind:'OBSERVED_MAXIMUM',bpm:186,reason:'OBSERVED_NOT_ABOVE_THE_AGE_ESTIMATE'}]);
 assert.equal(below.measuredReferences.observed.bpm,186,'the measured value is still shown, as measured');
 // The measured session maximum is classified as one value in the zones in force (never a distribution).
 assert.deepEqual(below.measurements,[{evidenceId:'race-10k',evidenceKind:'RACE_RESULT',date:daysBefore(14),kind:'SESSION_MAXIMUM',bpm:186,sensor:'CHEST_STRAP',zone:'Z5',singleValue:true,isADistribution:false}]);
 assert.deepEqual(below.measuredHeartRate,{status:'AVAILABLE',count:1});assert.equal(below.sessionDistribution.status,'UNAVAILABLE');
 // Without an age (the inner reading, or an intake with none) the observed maximum is the reference, as before.
 assert.equal(five(runner({id:'hr5r-strap3',anchors:[recent10(STRAP(186))]})).reference.kind,'OBSERVED_MAXIMUM');
 // The highest qualifying observed maximum of the window (an observed maximum is a floor of the true one).
 const two=fiveS(runner({id:'hr5-two',anchors:[{id:'a',...recent10(STRAP(182))},{id:'b',...result('5K',1500,daysBefore(40),STRAP(188))}]}));assert.equal(two.reference.evidenceId,'b');assert.equal(two.reference.bpm,188);
});
test('HR5 calibration: a lab maximum as supplied comes before the observed maximum and the age estimate; the three-zone output stays as supplied',()=>{
 const c=calS(aged(25,{id:'hr5-lab',anchors:[recent10(),{id:'lab-1',...lab(190)}]})),z=c.heartRateFiveZones;
 assert.equal(z.status,'AVAILABLE');assert.equal(z.basis,'LAB_MAXIMUM_AS_SUPPLIED');assert.equal(z.provenance,'MEASURED');assert.equal(z.estimated,false);assert.equal(z.referenceConfidence,'MODERATE');
 assert.deepEqual(limits(z),[['Z1',null,123],['Z2',124,153],['Z3',154,169],['Z4',170,184],['Z5',185,null]]);
 assert.deepEqual({...z.reference},{kind:'LAB_MEASURED_MAXIMUM',provenance:'MEASURED',bpm:190,evidenceId:'lab-1',evidenceKind:'LAB_TEST',date:daysBefore(30),ageDays:32,sensor:'ECG',protocol:'Incremental treadmill test',source:'Laboratory report',modality:'TREADMILL_RUN',checkedByTheApp:false});
 assert.deepEqual(z.notUsed,[{kind:'AGE_ESTIMATE',bpm:195,reason:'A_MORE_SPECIFIC_REFERENCE_IN_FORCE'}],'a lab maximum below the age estimate is used: it is a measurement');
 assert.deepEqual(z.disclosures,['ZONES','LAB_MEASURED_MAXIMUM','NOT_MEDICAL']);
 assert.equal(c.heartRateZones.basis,'MEASURED_AS_SUPPLIED');assert.equal(c.heartRateZones.zones,undefined,'the three-zone output is unchanged: values as supplied, never zones');
 // A lab test that does not qualify is no reference: the observed maximum is, else the age estimate; with neither, no zones (typed).
 for(const [anchor,why] of [[lab(undefined),'no maximum'],[lab(190,{lab:{source:'x',values:[{name:'a',value:1,unit:'bpm'}]}}),'no protocol'],[lab(190,{date:daysBefore(200)}),'older than 182 days'],[lab(130),'below the plausible range'],[lab(225),'above it'],
  [lab(190,{heartRate:{maxBpm:190,sensor:'OPTICAL'}}),'optical'],[lab(190,{heartRate:{maxBpm:190}}),'no sensor'],[lab(190,{rpe:7}),'not maximal by report'],[lab(190,{rpe:null}),'effort not reported'],
  [lab(190,{tolerated:false}),'not tolerated'],[lab(190,{completed:false,stoppedFor:'PACING'}),'stopped'],[lab(190,{},{modality:'CYCLE'}),'cycling'],[lab(190,{},{modality:undefined}),'modality not declared']]){
  assert.equal(fiveS(runner({id:'hr5-lab-x',anchors:[recent10(STRAP(186)),anchor]})).reference.kind,'OBSERVED_MAXIMUM',why);
  assert.equal(fiveS(aged(30,{id:'hr5-lab-z',anchors:[recent10(),anchor]})).reference.kind,'AGE_ESTIMATE',why);
  assert.equal(fiveS(runner({id:'hr5-lab-y',anchors:[recent10(),anchor]})).status,'UNAVAILABLE',why);
 }
 for(const m of ['CYCLE',undefined,'ROW'])assert.equal(five(runner({id:'hr5-lab-m',anchors:[recent10(),lab(190,{},{modality:m})]})).measuredReferences.reason,'LAB_MODALITY_NOT_RUNNING_OR_UNKNOWN',String(m));
 for(const m of ['RUN','treadmill run','field-run'])assert.equal(five(runner({id:'hr5-lab-m2',anchors:[recent10(),lab(190,{},{modality:m})]})).reference.kind,'LAB_MEASURED_MAXIMUM',m);
});
test('HR5 conflict: a strap maximum more than 5 bpm ABOVE the lab maximum — neither measured value is used, the zones fall back to the age estimate, both are shown',()=>{
 const conflict={status:'REFERENCE_CONFLICT',labMaxBpm:180,labDate:daysBefore(30),labEvidenceId:'lab',observedMaxBpm:192,observedDate:daysBefore(14),observedEvidenceId:'race',differenceBpm:12,bandBpm:5};
 const z=fiveS(aged(40,{id:'hr5-conf',anchors:[{id:'race',...recent10(STRAP(192))},{id:'lab',...lab(180)}]}));
 assert.equal(z.status,'AVAILABLE','acceptance 4: a conflict between measurements does not take the zones away');assert.equal(z.reference.kind,'AGE_ESTIMATE');assert.equal(z.reference.bpm,180);
 assert.deepEqual(z.conflict,conflict);assert.ok(z.disclosures.includes('REFERENCE_CONFLICT'));
 assert.deepEqual(z.notUsed,[{kind:'LAB_MEASURED_MAXIMUM',bpm:180,reason:'REFERENCE_CONFLICT'},{kind:'OBSERVED_MAXIMUM',bpm:192,reason:'REFERENCE_CONFLICT'}]);
 const noAge=fiveS(runner({id:'hr5-conf',anchors:[{id:'race',...recent10(STRAP(192))},{id:'lab',...lab(180)}]}));
 assert.equal(noAge.status,'UNAVAILABLE');assert.equal(noAge.reason,'REFERENCE_CONFLICT');assert.deepEqual(noAge.conflict,conflict);assert.equal(noAge.zones,undefined);
 assert.ok(Object.values(noAge.sessions).filter(isCue).every(s=>s.role==='NONE'&&s.reason==='REFERENCE_CONFLICT'),'no cue without zones');
 const above=fiveS(runner({id:'hr5-conf2',anchors:[recent10(STRAP(186)),lab(195)]}));assert.equal(above.reference.kind,'LAB_MEASURED_MAXIMUM');assert.equal(above.reference.bpm,195);assert.equal(above.conflict,null);
 assert.equal(fiveS(runner({id:'hr5-near',anchors:[recent10(STRAP(190)),lab(185)]})).reference.kind,'LAB_MEASURED_MAXIMUM','5 bpm above is inside the band');
 assert.equal(fiveS(runner({id:'hr5-near2',anchors:[recent10(STRAP(191)),lab(185)]})).reason,'REFERENCE_CONFLICT','6 bpm above is not');
 assert.equal(fiveS(runner({id:'hr5-conf3',anchors:[recent10(STRAP(192)),lab(180,{rpe:6})]})).reference.kind,'OBSERVED_MAXIMUM','a lab maximum that does not qualify is no side of a conflict');
});
test('HR5 measured values: only a chest strap or ECG in a hard effort is a maximum; an optical value is classified for presentation, its sensor kept; nothing is coerced',()=>{
 for(const [x,why] of [[{heartRate:{maxBpm:186,sensor:'OPTICAL'}},'optical'],[{heartRate:{maxBpm:186}},'no sensor'],[{...STRAP(186),rpe:7},'not a hard effort'],[{...STRAP(186),rpe:null},'effort not reported'],
  [STRAP(139),'below 140'],[STRAP(221),'above 220'],[{...STRAP(186),tolerated:false},'not tolerated'],[{...STRAP(186),completed:false,stoppedFor:'PACING'},'not completed']]){
  const z=fiveS(aged(30,{id:'hr5-nq',anchors:[recent10(x)]}));assert.equal(z.reference.kind,'AGE_ESTIMATE',why);assert.equal(z.measuredReferences.observed,null,why);
  const inner=five(runner({id:'hr5-nq',anchors:[recent10(x)]}));assert.equal(inner.reason,'AGE_REQUIRED',why);assert.equal(inner.measuredReferences.reason,'HEART_RATE_DATA_NOT_QUALIFYING',why);}
 const opt=fiveS(aged(30,{id:'hr5-opt',anchors:[{id:'r',...recent10({heartRate:{maxBpm:176,sensor:'OPTICAL'}})}]}));
 assert.deepEqual(opt.measurements.map(m=>[m.evidenceId,m.bpm,m.sensor,m.zone,m.singleValue]),[['r',176,'OPTICAL','Z4',true]]);assert.ok(opt.disclosures.includes('OPTICAL_MEASUREMENT'),'SSCTR-HR5R-REV-7');assert.equal(opt.reference.kind,'AGE_ESTIMATE');
 for(const bad of ['186',-5,0,NaN,Infinity,null,{},[186],1e9]){
  const g=S.generateProgram(runner({id:'hr5-bad',anchors:[recent10({heartRate:{maxBpm:bad,sensor:'CHEST_STRAP'}})]}),ON);
  assert.equal(g.status,'PROPOSED');const z=g.runCalibration.heartRateFiveZones;assert.equal(z.status,'UNAVAILABLE',String(bad));assert.equal(z.zones,undefined);assert.deepEqual(z.measuredReferences.observed,null);}
 for(const bad of ['CHEST_STRAP',7,[],null])assert.equal(S.generateProgram(runner({id:'hr5-bad2',anchors:[recent10({heartRate:bad})]}),ON).runCalibration.heartRateFiveZones.status,'UNAVAILABLE');
 // A short effort (under 10 minutes) and an undated personal best are no maximum.
 assert.equal(fiveS(runner({id:'hr5-short',anchors:[result('3K',590,daysBefore(10),STRAP(190))]})).status,'UNAVAILABLE');
 assert.equal(fiveS(runner({id:'hr5-pb',anchors:[{kind:'PERSONAL_BEST',distance:'10K',seconds:3000,rpe:9,tolerated:true,measurement:'OFFICIAL',...STRAP(190)}]})).status,'UNAVAILABLE');
});

// ---------- the athlete's own maximum and limits (acceptance 3) ----------
test('HR5R acceptance 3: an athlete\'s declared maximum is an explicit override — zones recalculated exactly, ahead of lab, strap and age, marked DECLARED',()=>{
 const g=gen({...aged(30,{id:'hr5r-decl',anchors:[recent10(STRAP(200)),lab(198)]}),heartRateProfile:{maxHeartRateBpm:195}}),z=g.runCalibration.heartRateFiveZones;
 assert.equal(z.reference.kind,'ATHLETE_DECLARED_MAXIMUM');assert.equal(z.reference.bpm,195);assert.equal(z.provenance,'DECLARED');assert.equal(z.referenceConfidence,'UNVERIFIED');assert.equal(z.estimated,false);assert.equal(z.reference.checkedByTheApp,false);
 assert.deepEqual(limits(z),[['Z1',null,126],['Z2',127,157],['Z3',158,173],['Z4',174,189],['Z5',190,null]]);
 assert.deepEqual(z.notUsed.map(x=>[x.kind,x.reason]),[['LAB_MEASURED_MAXIMUM','ATHLETE_DECLARED_MAXIMUM_IN_FORCE'],['OBSERVED_MAXIMUM','ATHLETE_DECLARED_MAXIMUM_IN_FORCE'],['AGE_ESTIMATE','ATHLETE_DECLARED_MAXIMUM_IN_FORCE']]);
 assert.deepEqual(g.heartRateProfileRecord.map(r=>[r.source,r.declaration]),[['INTAKE',{ageYears:30}],['ATHLETE',{maxHeartRateBpm:195}]]);
 assert.ok(Object.values(z.sessions).filter(isCue).every(s=>s.slowDownCueAtOrAboveBpm===174&&s.reference==='ATHLETE_DECLARED_MAXIMUM'));
});
test('HR5R custom limits: the athlete\'s four limits replace the default percentages exactly, are validated for order, and are kept when the maximum changes',()=>{
 const z=fiveS({...aged(30,{id:'hr5r-cust'}),heartRateProfile:{zoneUpperBpm:[130,150,165,180]}});
 assert.equal(z.boundarySource,'ATHLETE_CUSTOM');assert.equal(z.method,'ATHLETE_CUSTOM_LIMITS');assert.equal(z.reference.kind,'AGE_ESTIMATE');
 assert.deepEqual(limits(z),[['Z1',null,130],['Z2',131,150],['Z3',151,165],['Z4',166,180],['Z5',181,null]]);assert.ok(z.zones.every(x=>x.upToPercent===null&&x.abovePercent===null));
 assert.ok(z.disclosures.includes('ATHLETE_CUSTOM'));assert.ok(z.notes.includes('CUSTOM_LIMITS_AS_SET_BY_THE_ATHLETE'));
 assert.deepEqual(zonesFromCustomLimits([130,150,165,180],H5).map(x=>x.minBpm),[null,131,151,166,181]);
 for(const bad of [[150,140,165,180],[130,130,165,180],[130,150,165],[130,150,165,180,190],[50,150,165,180],[130,150,165,240],[130.5,150,165,180],['130',150,165,180]])assert.equal(zonesFromCustomLimits(bad,H5),null,JSON.stringify(bad));
 // Custom limits with no reference at all (no age): the athlete's own scale is still shown.
 const alone=fiveS({...runner({id:'hr5r-cust2'}),heartRateProfile:{zoneUpperBpm:[130,150,165,180]}});assert.equal(alone.status,'AVAILABLE');assert.equal(alone.reference,null);assert.equal(alone.boundarySource,'ATHLETE_CUSTOM');
});
test('HR5R declarations are refused whole when invalid: never coerced, rounded or repaired; nothing is recorded',()=>{
 for(const [decl,err] of [[{maxHeartRateBpm:'190'},'maxHeartRateBpm.wholeBpm120to230'],[{maxHeartRateBpm:187.6},'maxHeartRateBpm.wholeBpm120to230'],[{maxHeartRateBpm:119},'maxHeartRateBpm.wholeBpm120to230'],[{maxHeartRateBpm:231},'maxHeartRateBpm.wholeBpm120to230'],
  [{zoneUpperBpm:[150,140,165,180]},'zoneUpperBpm.strictlyIncreasing'],[{zoneUpperBpm:[130,150,165]},'zoneUpperBpm.fourLimits'],[{zoneUpperBpm:[30,150,165,180]},'zoneUpperBpm.wholeBpm60to230'],
  [{maxHeartRateBpm:190,zoneUpperBpm:[1]},'zoneUpperBpm.fourLimits'],[{restingBpm:50},'heartRateProfile.unknownField'],[{},'heartRateProfile.empty'],['190','heartRateProfile.object']]){
  const g=gen({...aged(30,{id:'hr5r-bad'}),heartRateProfile:decl});
  assert.ok(g.heartRateProfileDeclared.refused[0].errors.includes(err),JSON.stringify(decl)+' '+JSON.stringify(g.heartRateProfileDeclared));
  assert.deepEqual(g.heartRateProfileRecord.map(r=>r.source),['INTAKE'],'nothing of the declaration is recorded');assert.equal(g.runCalibration.heartRateFiveZones.reference.kind,'AGE_ESTIMATE');}
});
test('HR5R persistence: overrides are carried, kept across reviews and a restart, never overwritten by a new measurement or the intake, and cleared only by the athlete',()=>{
 const id='hr5r-keep',g=gen({...aged(30,{id}),heartRateProfile:{maxHeartRateBpm:195,zoneUpperBpm:[130,150,165,180]}});
 let rec=g.heartRateProfileRecord,ev=[];const day=w=>new Date(Date.parse(g.program.startDate+'T00:00:00Z')+w*864e5).toISOString().slice(0,10);
 const review=(d,x={})=>({version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T20:00:00-03:00`,weekIndex:0,event:{id:'e-'+d+(x.tag??''),kind:'WEEKLY_REVIEW'},eligibility:ELIG(d),heartRateProfileRecord:rec,runEvidenceRecord:ev,...x.extra});
 // A review that says nothing about heart rate keeps both overrides.
 let r=S.evaluateProgram(g.program,review(day(2)),ON);rec=r.heartRateProfileRecord;
 assert.equal(r.runCalibration.heartRateFiveZones.reference.bpm,195);assert.equal(r.runCalibration.heartRateFiveZones.boundarySource,'ATHLETE_CUSTOM');assert.equal(rec.length,2,'the intake age and one declaration of both');
 // A qualifying measured maximum declared later never displaces the athlete's override.
 r=S.evaluateProgram(g.program,review(day(3),{tag:'ev',extra:{runEvidence:[{id:'tt-1',kind:'TIME_TRIAL',distance:'5K',seconds:1500,date:day(1),measurement:'GPS',rpe:9,tolerated:true,...STRAP(201)}]}}),ON);rec=r.heartRateProfileRecord;ev=r.runEvidenceRecord;assert.equal(ev.length,1);
 assert.equal(r.runCalibration.heartRateFiveZones.reference.kind,'ATHLETE_DECLARED_MAXIMUM');
 // The athlete changes only the maximum: the custom limits stay as set (never recomputed from the new maximum).
 r=S.evaluateProgram(g.program,review(day(4),{tag:'m',extra:{heartRateProfile:{maxHeartRateBpm:188}}}),ON);rec=r.heartRateProfileRecord;
 let z=r.runCalibration.heartRateFiveZones;assert.equal(z.reference.bpm,188);assert.deepEqual(limits(z),[['Z1',null,130],['Z2',131,150],['Z3',151,165],['Z4',166,180],['Z5',181,null]]);
 // The same value again is unchanged and appends nothing.
 r=S.evaluateProgram(g.program,review(day(4),{tag:'m2',extra:{heartRateProfile:{maxHeartRateBpm:188}}}),ON);assert.deepEqual(r.heartRateProfileDeclared.unchanged,['maxHeartRateBpm']);assert.equal(r.heartRateProfileRecord.length,rec.length);
 // A restart with the same age keeps the overrides; the intake states no maximum, so nothing of the athlete's is touched.
 const restart=S.restartProgram({intake:{...aged(30,{id,asOf:day(5),start:day(7)})},record:r.actualLedger??[],heartRateProfileRecord:rec},ON);
 assert.equal(restart.status,'PROPOSED',restart.reason);assert.equal(restart.runCalibration.heartRateFiveZones.reference.bpm,188);assert.equal(restart.heartRateProfileRecord.length,rec.length,'the same age is not recorded again');
 // A backdated declaration is refused.
 const back=S.evaluateProgram(g.program,review(day(1),{tag:'b',extra:{heartRateProfileRecord:rec,heartRateProfile:{maxHeartRateBpm:199}}}),ON);
 assert.deepEqual(back.heartRateProfileDeclared.refused,[{errors:['heartRateProfile.beforeTheRecord']}]);
 // Only the athlete clears them: back to the age estimate and the default percentages.
 r=S.evaluateProgram(g.program,review(day(6),{tag:'c',extra:{heartRateProfileRecord:rec,heartRateProfile:{maxHeartRateBpm:null,zoneUpperBpm:null}}}),ON);
 z=r.runCalibration.heartRateFiveZones;assert.equal(z.reference.kind,'AGE_ESTIMATE','the time trial of this week counts from the next week');assert.equal(z.reference.bpm,190);assert.equal(z.boundarySource,'DEFAULT_PERCENT_OF_MAXIMUM');
 const next=S.evaluateProgram(g.program,{...review(day(8),{tag:'n',extra:{heartRateProfileRecord:r.heartRateProfileRecord}}),weekIndex:1},ON).runCalibration.heartRateFiveZones;
 assert.equal(next.reference.kind,'OBSERVED_MAXIMUM','from the next week the measured 201 above the estimate is used, the override being cleared');assert.equal(next.reference.bpm,201);
});
test('HR5R record integrity: a row of another athlete, an altered row, a row from the future or an unknown source is never read',()=>{
 const id='hr5r-int',g=gen({...aged(30,{id}),heartRateProfile:{maxHeartRateBpm:195}}),rec=g.heartRateProfileRecord,rc=g.runCalibration;
 const read=rows=>S.heartRateProfileReading(rc,rows,{athleteId:id,at:'2026-11-20'},ON).heartRateFiveZones.reference;
 assert.equal(read(rec).bpm,195);
 const alter=(i,f)=>rec.map((r,k)=>k===i?f(JSON.parse(JSON.stringify(r))):r);
 assert.equal(read(alter(1,r=>(r.declaration.maxHeartRateBpm=150,r))).kind,'AGE_ESTIMATE','an altered declaration fails its hash');
 assert.equal(read(alter(1,r=>(r.athleteId='other',r))).kind,'AGE_ESTIMATE');
 assert.equal(read(alter(1,r=>(r.declaredAt='2027-01-01',r))).kind,'AGE_ESTIMATE');
 assert.equal(read(alter(1,r=>(r.source='ENGINE',r))).kind,'AGE_ESTIMATE');
 assert.equal(read(alter(0,r=>(r.source='ATHLETE',r))).kind,'ATHLETE_DECLARED_MAXIMUM','an age row is read only as the intake\'s');
});

// ---------- the role of heart rate in each session ----------
test('HR5 sessions: effort governs every session and heart rate is never primary; easy, long and recovery runs get a slow-down cue only',()=>{
 const c=calS(aged(40,{id:'hr5-roles',anchors:[recent10(STRAP(186))]})),S5=c.heartRateFiveZones.sessions;
 assert.ok(Object.keys(S5).length>0);assert.deepEqual(Object.keys(S5).sort(),Object.keys(c.sessions).sort(),'one role per planned run session');
 for(const [id,s] of Object.entries(S5)){
  assert.equal(s.primary,false,id);assert.equal(s.effortGoverns,true,id);assert.equal(s.family,c.sessions[id].family);assert.equal(s.week,c.sessions[id].week);
  const use=H5.sessionUse.families[s.family]??H5.sessionUse.unknownFamily;assert.equal(s.role,use.role,id+' '+s.family);
  if(s.role==='COMPLEMENTARY_CEILING_CUE'){const cue=c.heartRateFiveZones.zones.find(z=>z.zone===use.slowDownCueFromZone);
   assert.equal(s.slowDownCueAtOrAboveBpm,cue.minBpm);assert.equal(s.neverSpeedUp,true);assert.equal(s.sustainedReadingOnly,true);assert.equal(s.healthMeaning,false);assert.equal(s.disclosure,'CUE');
   assert.equal(s.effortConflict,'EFFORT_GOVERNS_HEART_RATE_MAY_ONLY_SUGGEST_SLOWING');}
  else assert.equal(s.slowDownCueAtOrAboveBpm,undefined,id);
 }
 const fam=f=>Object.values(S5).filter(s=>s.family===f);
 assert.ok(fam('EASY').length&&fam('EASY').every(s=>s.role==='COMPLEMENTARY_CEILING_CUE'&&s.slowDownCueAtOrAboveBpm===166));
 assert.ok(fam('LONG').length&&fam('LONG').every(s=>s.role==='COMPLEMENTARY_CEILING_CUE'));
 assert.ok(fam('THRESHOLD').length&&fam('THRESHOLD').every(s=>s.role==='NO_HEART_RATE_GUIDANCE'&&s.reason==='ZONES_ARE_NOT_INDIVIDUAL_THRESHOLDS'));
 assert.deepEqual(H5.sessionUse.primaryInV1,[],'no family has heart rate as its primary guidance in V1');
 for(const [id,s] of Object.entries(S5))if(c.sessions[id]?.strides)assert.deepEqual([s.strides.role,s.strides.reason],['NO_HEART_RATE_GUIDANCE','HEART_RATE_LAGS_SHORT_HARD_BOUTS']);
});
test('HR5 sessions: interval, race and specific efforts carry no heart-rate guidance; without zones the cue has its reason; nothing is ever a target',()=>{
 const MAR={id:'hr5-mar',weeks:16,runExperience:'EXPERIENCED',goal:{kind:'RACE',event:{kind:'MARATHON',date:'2027-02-28'}},recent:{runDaysPerWeek:5,runMinutesPerWeek:360,longestRunMinutes:150,strengthDaysPerWeek:1},schedule:{runDays:[0,1,3,4,6],strengthDays:[2],runMinutes:90,strengthMinutes:35,longRunDay:6,longRunMinutes:210},anchors:[result('HALF_MARATHON',6300,daysBefore(20),STRAP(184))]};
 const FIVE={id:'hr5-5k',goal:{kind:'RACE',event:{kind:'5K',date:'2027-01-24'}},anchors:[recent10(STRAP(190))]};
 for(const input of [aged(35,MAR),aged(35,FIVE)]){const c=calS(input),S5=Object.values(c.heartRateFiveZones.sessions);
  for(const s of S5){assert.equal(s.primary,false);assert.notEqual(s.role,'PRIMARY');
   if(['FIVE_K_SPECIFIC','TEN_K_SPECIFIC'].includes(s.family))assert.deepEqual([s.role,s.reason],['NO_HEART_RATE_GUIDANCE','HEART_RATE_LAGS_SHORT_HARD_BOUTS']);
   if(['RACE','RACE_TOUCH'].includes(s.family))assert.deepEqual([s.role,s.reason],['NO_HEART_RATE_GUIDANCE','RACE_DAY_GUIDANCE_AS_APPROVED']);
   if(['HALF_MARATHON_SPECIFIC','MARATHON_SPECIFIC','THRESHOLD'].includes(s.family))assert.equal(s.role,'NO_HEART_RATE_GUIDANCE');}
  assert.ok(S5.some(s=>s.role==='NO_HEART_RATE_GUIDANCE')&&S5.some(s=>s.role==='COMPLEMENTARY_CEILING_CUE'),input.athlete.id);}
 const none=calS(runner({id:'hr5-roles-none',anchors:[recent10()]})).heartRateFiveZones.sessions;
 for(const s of Object.values(none)){if(isCue(s))assert.deepEqual([s.role,s.reason],['NONE','AGE_REQUIRED']);assert.equal(s.slowDownCueAtOrAboveBpm,undefined);}
 // The inner reading gives a cue family with no zones its reason; the composed entry gives it the cue once the age gives zones.
 const inner=Object.values(cal(aged(30,{id:'hr5-roles-age'})).heartRateFiveZones.sessions).filter(isCue),outer=Object.values(calS(aged(30,{id:'hr5-roles-age'})).heartRateFiveZones.sessions).filter(isCue);
 assert.ok(inner.every(s=>s.role==='NONE'&&s.reason==='AGE_REQUIRED'));assert.ok(outer.every(s=>s.role==='COMPLEMENTARY_CEILING_CUE'&&s.slowDownCueAtOrAboveBpm===170));
});
test('HR5R walk/jog, restart and return: the zones describe the athlete and are shown; the sessions carry no heart-rate role; effort only',()=>{
 const c=calS(aged(30,{id:'hr5-beg',runExperience:'NONE',goal:'REGULAR',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,strengthDaysPerWeek:0},schedule:{runDays:[1,3,5],runMinutes:35,longRunDay:5,longRunMinutes:undefined},weeks:8,anchors:[recent10(STRAP(186))]}));
 assert.equal(c.status,'EFFORT_ONLY');assert.equal(c.heartRateFiveZones.status,'AVAILABLE');assert.equal(c.heartRateFiveZones.reference.kind,'AGE_ESTIMATE');
 assert.ok(Object.values(c.heartRateFiveZones.sessions).every(s=>s.role==='NONE'&&(s.reason==='MODE_WALK_JOG_RESTART_RETURN'||s.reason==='EFFORT_ONLY_FAMILY')));
 assert.ok(c.heartRateFiveZones.disclosures.includes('NEWER_RUNNER'));
});
test('HR5 disclosures: a newer runner is told the same heart rate can mean a harder effort; an experienced runner is not',()=>{
 const nov=fiveS(aged(30,{id:'hr5-nov',runExperience:'NOVICE',goal:'REGULAR'}));assert.deepEqual(nov.disclosures,['ZONES','AGE_ESTIMATE','NEWER_RUNNER','NOT_MEDICAL']);
 const exp=fiveS(aged(30,{id:'hr5-exp',runExperience:'EXPERIENCED'}));assert.deepEqual(exp.disclosures,['ZONES','AGE_ESTIMATE','NOT_MEDICAL']);
 for(const k of [...nov.disclosures,'CUE','OPTICAL_MEASUREMENT','REFERENCE_CONFLICT','ATHLETE_CUSTOM','ATHLETE_DECLARED_MAXIMUM','LAB_MEASURED_MAXIMUM','OBSERVED_MAXIMUM'])assert.equal(typeof H5.disclosures[k],'string',k);
});

// ---------- nothing else moves (acceptance 6) ----------
test('HR5R acceptance 6: age, a declared maximum or custom limits change no plan, no pace, no effort cue, no strength, no decision and no record of the engine',()=>{
 for(const id of ['hr5-add-a','hr5-add-b']){
  const bare=runner({id,anchors:[recent10()]}),withAge=aged(30,{id,anchors:[recent10()]}),declared={...aged(30,{id,anchors:[recent10()]}),heartRateProfile:{maxHeartRateBpm:201,zoneUpperBpm:[120,140,160,180]}};
  const a=S.generateProgram(bare,ON),b=S.generateProgram(withAge,ON),c=S.generateProgram(declared,ON),off=S.generateProgram(withAge,DEV);
  assert.equal(hash(b.program.weeks),hash(a.program.weeks),'the age changes no prescribed session');assert.equal(hash(c.program),hash(b.program),'a declaration changes no plan');
  assert.equal(hash(withoutFive(c.runCalibration)),hash(withoutFive(b.runCalibration)),'nothing else of the reading moves');assert.equal(hash(withoutFive(b.runCalibration)),hash(withoutFive(off.runCalibration)));
  for(const k of ['paceBands','estimates','sessions','capacity','assessment','effortDomains','heartRateZones'])assert.equal(hash(c.runCalibration[k]),hash(a.runCalibration[k]),k);
  assert.equal(hash(plainAnswer(c)),hash(plainAnswer(b)),'nor any other key of the answer (strength exposure, forecast, formats among them)');
  // The engine below the composed entry answers the same without the heart-rate keys.
  const below=S.generateProgram({...declared,heartRateProfile:undefined},ON);assert.equal(hash(below.program),hash(c.program));
 }
});
test('HR5R safety: a heart rate never releases a hold or changes a clinical route; under a hold the zones are withheld and the profile kept',()=>{
 const id='hr5r-hold',g=gen({...aged(30,{id}),heartRateProfile:{maxHeartRateBpm:195}}),d=new Date(Date.parse(g.program.startDate+'T00:00:00Z')+864e5).toISOString().slice(0,10);
 const rv=x=>({version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T20:00:00-03:00`,weekIndex:0,event:{id:'p-'+d,kind:'WEEKLY_REVIEW'},eligibility:ELIG(d,{pain:true}),heartRateProfileRecord:g.heartRateProfileRecord,...x});
 const held=S.evaluateProgram(g.program,rv({}),ON),again=S.evaluateProgram(g.program,rv({heartRateProfile:{maxHeartRateBpm:160}}),ON),plain=S.evaluateProgram(g.program,{...rv({}),heartRateProfileRecord:undefined},ON);
 for(const r of [held,again]){assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(r.runCalibration.heartRateFiveZones.reason,'HOLD_NO_PRESCRIPTION');
  assert.ok(Object.values(r.runCalibration.heartRateFiveZones.sessions).every(s=>s.role==='NONE'&&s.reason==='HOLD_NO_PRESCRIPTION'));}
 assert.equal(hash(plainAnswer(again)),hash(plainAnswer(plain)),'the clinical answer is the one without any heart rate');
 assert.equal(again.heartRateProfileRecord.at(-1).declaration.maxHeartRateBpm,160,'the athlete\'s own fact is still recorded');
 assert.ok(!JSON.stringify(H5).includes('CLEARANCE')&&H5.safety.releasesASafetyBlock===false&&H5.safety.medicalEvidence===false&&H5.safety.changesThePlan===false);
});
test('HR5 determinism: the same record gives the same bytes; JSON round trip is identity; valid inputs never hit the fault path',()=>{
 const input={...aged(33,{id:'hr5-det',anchors:[recent10(STRAP(186)),lab(195)]}),heartRateProfile:{zoneUpperBpm:[125,150,165,180]}},a=fiveS(input),b=fiveS(JSON.parse(JSON.stringify(input)));
 assert.equal(hash(a),hash(b));assert.deepEqual(JSON.parse(JSON.stringify(a)),a);
 for(const anchors of [[recent10()],[recent10(STRAP(186))],[recent10(STRAP(140))],[recent10(STRAP(220))],[recent10(),lab(190)],[recent10(STRAP(192)),lab(180)],[recent10(STRAP(186)),lab(195)],[recent10(),lab(190,{},{modality:'CYCLE'})]])
  for(const input2 of [runner({id:'hr5-noerr',anchors}),aged(50,{id:'hr5-noerr',anchors})]){const c=calS(input2);assert.notEqual(c.heartRateFiveZones.reason,'FIVE_ZONE_ERROR',JSON.stringify(anchors));
   assert.ok(Object.values(c.heartRateFiveZones.sessions).every(x=>x.reason!=='FIVE_ZONE_ERROR'));}
});

// ---------- the week boundary and withdrawal ----------
const RECENT=x=>runner({asOf:'2026-11-07',start:'2026-11-09',...x});
test('HR5 flow: a maximum declared during a week counts from the next week; a hold withholds the zones and every cue at once',()=>{
 const t=timeline(RECENT({id:'hr5-f-week',anchors:[recent10()]}),{opts:ON});
 assert.equal(t.cal.heartRateFiveZones.reason,'AGE_REQUIRED');
 t.step(0,2,'WEEKLY_REVIEW',{runEvidence:[{id:'tt-1',kind:'TIME_TRIAL',distance:'5K',seconds:1500,date:t.day(0,1),measurement:'GPS',rpe:9,tolerated:true,...STRAP(188)}]});
 assert.equal(t.cal.heartRateFiveZones.status,'UNAVAILABLE','the week in force is fixed');
 const nextWeek=Object.values(t.cal.heartRateFiveZones.sessions).filter(s=>s.provisional&&s.role==='COMPLEMENTARY_CEILING_CUE');
 assert.ok(nextWeek.length&&nextWeek.every(s=>s.slowDownCueAtOrAboveBpm===Math.floor(188*89/100)+1),'next week\'s sessions already show what is known today');
 const d=t.day(1,0);t.step(1,0,'WEEKLY_REVIEW',{eligibility:ELIG(d)});
 assert.equal(t.cal.heartRateFiveZones.status,'AVAILABLE');assert.equal(t.cal.heartRateFiveZones.reference.evidenceId,'tt-1');
 const held=t.step(1,1,'WEEKLY_REVIEW',{eligibility:ELIG(t.day(1,1),{pain:true})});
 assert.equal(held.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(t.cal.heartRateFiveZones.status,'UNAVAILABLE');assert.equal(t.cal.heartRateFiveZones.reason,'HOLD_NO_PRESCRIPTION');
 assert.ok(Object.values(t.cal.heartRateFiveZones.sessions).every(s=>s.role==='NONE'&&s.reason==='HOLD_NO_PRESCRIPTION'));
 assert.equal(t.cal.heartRateZones.reason,'HOLD_NO_PRESCRIPTION');assert.ok(t.same,t.differences.join(','));
});
test('HR5 flow: a declared break of 14 days or more withdraws a measured maximum; the age estimate stays',()=>{
 const W=VALUES.withdrawal,t=timeline(RECENT({id:'hr5-f-break',anchors:[result('10K',3300,'2026-11-05',STRAP(186))]}),{opts:ON});
 assert.equal(t.cal.heartRateFiveZones.reference.kind,'OBSERVED_MAXIMUM');
 const r=t.step(4,3,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(2,0),endDate:t.day(2,W.breakDaysWithdrawMin+1),days:W.breakDaysWithdrawMin+2,nonclinical:true,reasonCategory:'SCHEDULE'}});
 assert.notEqual(r.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(t.cal.heartRateFiveZones.measuredReferences.observed,null,'the maximum from before the break is not read again');assert.equal(t.cal.heartRateZones.status,'UNAVAILABLE');
 const z=applyHeartRateProfile(t.cal,{age:{ageYears:30,ageInForce:30,declaredOn:'2026-11-07'}},ON).heartRateFiveZones;assert.equal(z.status,'AVAILABLE');assert.equal(z.reference.kind,'AGE_ESTIMATE');
 assert.ok(t.same,t.differences.join(','));
});
test('HR5 flow: the athlete without any heart rate trains exactly as before — every session prescribed, logged and reviewed by effort',()=>{
 const t=timeline(RECENT({id:'hr5-f-watchless',anchors:[recent10()]}),{opts:ON}),u=timeline(RECENT({id:'hr5-f-watchless',anchors:[recent10()]}),{opts:DEV});
 for(const w of [0,1]){t.week(w);u.week(w);}
 assert.equal(hash(t.p),hash(u.p));assert.equal(hash(t.ledger),hash(u.ledger));assert.equal(hash(withoutFive(t.cal)),hash(withoutFive(u.cal)));
 assert.ok(t.p.weeks[2].sessions.filter(live).length>0,'the plan goes on');assert.equal(t.cal.heartRateFiveZones.measuredReferences.reason,'NO_MEASURED_HEART_RATE');assert.ok(t.same);
});
test('HR5 lab expiry and floors (QRE-HR5-11): a lab maximum lasts 182 days and is never read across a declared break of 14 days or more',()=>{
 const at=d=>five(runner({id:'hr5-lab-age',anchors:[recent10(),lab(190,{date:daysBefore(d)})]}));
 assert.equal(at(180).reference.kind,'LAB_MEASURED_MAXIMUM');assert.equal(at(180).reference.ageDays,182);
 assert.equal(at(181).status,'UNAVAILABLE','182 days old at the week start is the last day in force; 183 is past it');assert.equal(at(181).measuredReferences.reason,'HEART_RATE_DATA_NOT_QUALIFYING');
 const W=VALUES.withdrawal,t=timeline(RECENT({id:'hr5-lab-break',anchors:[recent10(),{id:'lab-b',...lab(190,{date:'2026-10-20'})}]}),{opts:ON});
 assert.equal(t.cal.heartRateFiveZones.reference.evidenceId,'lab-b');
 t.step(4,3,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(2,0),endDate:t.day(2,W.breakDaysWithdrawMin+1),days:W.breakDaysWithdrawMin+2,nonclinical:true,reasonCategory:'SCHEDULE'}});
 assert.equal(t.cal.heartRateFiveZones.measuredReferences.lab,null,'the lab maximum from before the break is not read again');
 assert.ok(t.same,t.differences.join(','));
});

// ---------- time in zone ----------
test('HR5R classifier: a strap, ECG or optical series with enough samples; the sensor kept; gaps and artifacts unknown, never interpolated; never from an average',()=>{
 const z=zonesFromMaximum(186,H5),T={maxGapSeconds:10,minCoverageFraction:0.8,minSamples:2,plausibleBpm:[30,230]};
 const ser=(samples,sensor='CHEST_STRAP')=>({sensor,source:'HEALTHKIT',samples});
 const series=[{t:0,bpm:110},{t:5,bpm:140},{t:10,bpm:160},{t:15,bpm:170},{t:20,bpm:185},{t:25,bpm:185}];
 const r=classifySamples(z,ser(series),T);assert.equal(r.status,'AVAILABLE');assert.deepEqual(r.seconds,{Z1:5,Z2:5,Z3:5,Z4:5,Z5:5});assert.equal(r.fromAverageHeartRate,false);assert.equal(r.coverage,1);assert.equal(r.sensor,'CHEST_STRAP');assert.equal(r.source,'HEALTHKIT');
 const opt=classifySamples(z,ser(series,'OPTICAL'),T);assert.equal(opt.status,'AVAILABLE');assert.equal(opt.sensor,'OPTICAL','an optical series is classified, its provenance kept');
 for(const sensor of [undefined,'WRIST','PPG'])assert.equal(classifySamples(z,{sensor,samples:series},T).reason,'SENSOR_NOT_QUALIFYING',String(sensor));
 // The operational defaults: 10 samples at least, gaps over 30 s unknown, 80 % coverage.
 assert.deepEqual(H5.sessionDistribution.futureClassifier.defaultLimits,{maxGapSeconds:30,minCoverageFraction:0.8,minSamples:10,plausibleBpm:[30,230]});
 assert.equal(classifySamples(z,ser(series)).reason,'INSUFFICIENT_SAMPLES','six samples are not enough under the defaults');
 const ten=Array.from({length:12},(_,i)=>({t:i*5,bpm:150}));assert.equal(classifySamples(z,ser(ten)).status,'AVAILABLE');
 const gap=classifySamples(z,ser([{t:0,bpm:150},{t:60,bpm:150},{t:62,bpm:150}]),T);assert.equal(gap.reason,'INSUFFICIENT_COVERAGE');assert.equal(gap.unknownSeconds,50);
 const bad=classifySamples(z,ser([{t:0,bpm:150},{t:5,bpm:240},{t:10,bpm:150,artifact:true},...Array.from({length:8},(_,i)=>({t:15+i*5,bpm:150}))]),T);
 assert.equal(bad.status,'AVAILABLE');assert.equal(bad.unknownSeconds,10,'an implausible value and an artifact are unknown');assert.equal(bad.seconds.Z2,40);
 assert.equal(classifySamples(z,ser([{t:10,bpm:150},{t:5,bpm:150}]),T).reason,'SERIES_OUT_OF_ORDER');
 assert.equal(classifySamples(z,ser([{t:0,bpm:150}]),T).reason,'INSUFFICIENT_SAMPLES','one value (an average) is never a distribution');
 assert.equal(classifySamples(null,ser(series),T).reason,'NO_ZONES');assert.equal(H5.sessionDistribution.classifierWiredToInput,false);
 for(const b of [{...T,maxGapSeconds:0},{...T,minCoverageFraction:0},{...T,minCoverageFraction:1.5},{...T,minSamples:1},{...T,plausibleBpm:[220,30]},{...T,plausibleBpm:[30]},{...T,plausibleBpm:[-5,220]}])
  assert.equal(classifySamples(z,ser(series),b).reason,'CLASSIFIER_LIMITS_NOT_SET',JSON.stringify(b));
 assert.equal(classifySamples(z,ser(series),{...T,durationSeconds:10}).reason,'INVALID_DURATION');assert.equal(classifySamples(z,ser(series),{...T,durationSeconds:30}).coverage,0.833);
});

// ---------- review findings kept ----------
test('HR5 sessions follow the reading\'s order: a hold, then the boundary off (either one), then an effort-only mode, then the family (C5, SSCTR-HR5-R-02)',()=>{
 const input=aged(40,{id:'hr5-order',anchors:[recent10(STRAP(186))]});
 const noHr=calS(input,{...ON,runCalibration:devRunCalibration(Object.values(RUN_BOUNDARIES).filter(b=>b!==RUN_BOUNDARIES.HR))}).heartRateFiveZones;
 assert.ok(Object.values(noHr.sessions).every(s=>s.role==='NONE'&&s.reason==='EXTENSION_NOT_ENABLED'));
 const s={prescription:{family:'EASY'}},z=fiveS(input),auth=devFiveZone();
 assert.equal(sessionHeartRate(s,{zones5:z,hold:true,effortOnly:false,auth:fiveZoneAuthority({heartRateFiveZoneRecords:{records:[]}}),on:false}).reason,'HOLD_NO_PRESCRIPTION','a hold comes first, as in the reading');
 assert.equal(sessionHeartRate(s,{zones5:z,hold:false,effortOnly:true,auth,on:true}).reason,'MODE_WALK_JOG_RESTART_RETURN');
 assert.equal(sessionHeartRate(s,{zones5:z,hold:false,effortOnly:false,auth,on:true,mode:'EASY'}).slowDownCueAtOrAboveBpm,166);
 assert.equal(sessionHeartRate({prescription:{family:'EASY_REESTABLISHMENT'}},{zones5:z,hold:false,effortOnly:false,auth,on:true,mode:'RESTART'}).reason,'MODE_WALK_JOG_RESTART_RETURN');
 assert.equal(sessionHeartRate({prescription:{family:'EASY_REESTABLISHMENT'}},{zones5:z,hold:false,effortOnly:false,auth,on:true,mode:'EASY'}).role,'COMPLEMENTARY_CEILING_CUE');
 for(const family of ['constructor','__proto__','toString','hasOwnProperty',7,null,undefined])
  assert.deepEqual([sessionHeartRate({prescription:{family}},{zones5:z,hold:false,effortOnly:false,auth,on:true,mode:'EASY'}).role,sessionHeartRate({prescription:{family}},{zones5:z,hold:false,effortOnly:false,auth,on:true,mode:'EASY'}).reason],['NO_HEART_RATE_GUIDANCE','UNKNOWN_FAMILY_FAIL_CLOSED'],String(family));
});
test('HR5 fault isolation (QRE-HR5-08): a fault in the five-zone code is a typed UNAVAILABLE, never a broken run calibration',()=>{
 const broken={...devFiveZone(),values:{...devFiveZone().values,references:null,sessionUse:null}};
 const c=calS(aged(30,{id:'hr5-fault',anchors:[recent10(STRAP(186))]}),{...DEV,heartRateFiveZone:broken});
 assert.notEqual(c.status,'CALIBRATION_ERROR');assert.equal(c.heartRateFiveZones.status,'UNAVAILABLE');assert.equal(c.heartRateFiveZones.reason,'FIVE_ZONE_ERROR');
 assert.ok(Object.values(c.heartRateFiveZones.sessions).every(s=>s.role==='NONE'&&s.reason==='FIVE_ZONE_ERROR'&&s.primary===false));
 const good=calS(aged(30,{id:'hr5-fault',anchors:[recent10(STRAP(186))]}),DEV);assert.equal(hash(withoutFive(c)),hash(withoutFive(good)),'nothing else of the reading moves');
});
test('HR5 production authority end to end: an independent record bound to the pinned bytes enables the zones through the engine; one bound to other bytes does not',()=>{
 const rec=(x={})=>({boundaryId:HR5_BOUNDARY,valuesSha256:HR5_SHA256,independent:true,disposition:'APPROVE_WITH_CONDITIONS',evidenceStatus:'SUPPORTED_WITH_LIMITS',sourceIds:['S02'],reviewId:'TEST',...x});
 const input=aged(30,{id:'hr5-prod'});
 const on=fiveS(input,{...DEV,heartRateFiveZoneRecords:{records:[rec()]}}),stale=fiveS(input,{...DEV,heartRateFiveZoneRecords:{records:[rec({valuesSha256:'0'.repeat(64)})]}});
 assert.equal(on.status,'AVAILABLE');assert.equal(on.source,'CURRENT_INDEPENDENT_REVIEW');assert.equal(on.sha256,HR5_SHA256);
 assert.equal(stale.reason,'EXTENSION_NOT_ENABLED');
});
test('HR5 texts: no physiological threshold claim in the values or any output',()=>{
 assert.ok(!textsOf(H5).some(t=>FORBIDDEN_CLAIM.test(t)),'values file');
 for(const input of [aged(30,{id:'hr5-txt',anchors:[recent10(STRAP(186)),lab(195)]}),runner({id:'hr5-txt2'}),{...aged(30,{id:'hr5-txt3'}),heartRateProfile:{maxHeartRateBpm:190}}])assert.ok(!textsOf(fiveS(input)).some(t=>FORBIDDEN_CLAIM.test(t)));
});
test('QRE-HR5R-07: through the composed entry a provisional session is cued from ITS week\'s references with the profile — a strap maximum declared this week cues next week only',()=>{
 const g=gen(aged(30,{id:'hr5r-q07',asOf:'2026-11-07',start:'2026-11-09'})),day=d=>new Date(Date.parse(g.program.startDate+'T00:00:00Z')+d*864e5).toISOString().slice(0,10);
 const r=S.evaluateProgram(g.program,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${day(2)}T20:00:00-03:00`,weekIndex:0,event:{id:'q07',kind:'WEEKLY_REVIEW'},eligibility:ELIG(day(2)),
  heartRateProfileRecord:g.heartRateProfileRecord,runEvidence:[{id:'tt-q07',kind:'TIME_TRIAL',distance:'5K',seconds:1500,date:day(1),measurement:'GPS',rpe:9,tolerated:true,...STRAP(200)}]},ON);
 const z=r.runCalibration.heartRateFiveZones,cues=Object.values(z.sessions).filter(s=>s.role==='COMPLEMENTARY_CEILING_CUE');
 assert.equal(z.reference.kind,'AGE_ESTIMATE','the week in force is fixed');
 assert.ok(cues.filter(s=>!s.provisional).every(s=>s.slowDownCueAtOrAboveBpm===170&&s.reference==='AGE_ESTIMATE'));
 const next=cues.filter(s=>s.provisional&&s.week===1);assert.ok(next.length);assert.ok(next.every(s=>s.slowDownCueAtOrAboveBpm===Math.floor(200*89/100)+1&&s.reference==='OBSERVED_MAXIMUM'),JSON.stringify(next[0]));
 // The athlete's own maximum applies to every week at once, over each week's references.
 const d=S.evaluateProgram(g.program,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${day(3)}T20:00:00-03:00`,weekIndex:0,event:{id:'q07b',kind:'WEEKLY_REVIEW'},eligibility:ELIG(day(3)),
  heartRateProfileRecord:r.heartRateProfileRecord,runEvidenceRecord:r.runEvidenceRecord,heartRateProfile:{maxHeartRateBpm:185}},ON).runCalibration.heartRateFiveZones;
 assert.ok(Object.values(d.sessions).filter(s=>s.role==='COMPLEMENTARY_CEILING_CUE').every(s=>s.slowDownCueAtOrAboveBpm===Math.floor(185*89/100)+1&&s.reference==='ATHLETE_DECLARED_MAXIMUM'));
});
