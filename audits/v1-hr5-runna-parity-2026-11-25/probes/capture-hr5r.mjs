// V1HR5R (2026-11-25, copied from V1HR5's capture-hr5.mjs): captures what the CORRECTED boundary returns for synthetic athletes, so the Swift
// contract delta (proposals/CoachingPresentation, FiveZoneDecodingTests) decodes real shapes, through createIntegration and api.mjs as the app
// calls them, with the production authority (SSCTR-HR5R-RECHECK-r1). Each file says which authority it was captured under (`authority`).
// Run: node audits/v1-hr5-runna-parity-2026-11-25/probes/capture-hr5r.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {fiveZoneAuthority} from '../../../CoachingCore/src/v1-heart-rate-zones.mjs';
import {athlete,athleteA,ELIG,addDays} from '../../../CoachingCore/test/v1int-helpers.mjs';
import {result} from '../../../CoachingCore/test/v1rc-helpers.mjs';

const authority=fiveZoneAuthority().approved?'CURRENT_INDEPENDENT_REVIEW':'NOT_ENABLED';
if(authority!=='CURRENT_INDEPENDENT_REVIEW')throw new Error('capture-hr5r: the five zones are not enabled by the independent record');
const OUT=path.join(path.dirname(fileURLToPath(import.meta.url)),'out');fs.mkdirSync(OUT,{recursive:true});
let idSeq=0;const newId=p=>`${p}_${String(++idSeq).padStart(6,'0')}`;
const STRAP=bpm=>({heartRate:{maxBpm:bpm,sensor:'CHEST_STRAP'}});
const R10=(x={})=>({id:'race-10k',...result('10K',3000,'2026-11-01',x)});
const LAB=bpm=>({id:'lab-1',kind:'LAB_TEST',date:'2026-10-20',rpe:9,tolerated:true,lab:{protocol:'Incremental treadmill test',source:'Laboratory report',modality:'TREADMILL_RUN',values:[{name:'First measured anchor',value:150,unit:'bpm'}]},heartRate:{maxBpm:bpm,sensor:'ECG'}});
const save=(name,x)=>fs.writeFileSync(path.join(OUT,name+'.json'),JSON.stringify({authority,...x},null,1)+'\n');
const cases=[['hr5r-age30',[R10()],30],['hr5r-strap-above',[R10(STRAP(186))],40],['hr5r-strap-below',[R10(STRAP(186))],30],['hr5r-lab',[R10(),LAB(190)],25],
 ['hr5r-conflict',[R10(STRAP(192)),LAB(180)],40],['hr5r-noage',[R10()],null],['hr5r-optical',[R10({heartRate:{maxBpm:176,sensor:'OPTICAL'}})],30],['hr5r-declared',[R10()],30]];
for(const [name,anchors,age] of cases){
 const t=athlete({newId,id:name,weeks:8}),i=athleteA({weeks:8,id:name});i.athlete.performanceAnchors=anchors;if(age===null){delete i.athlete.ageYears;i.athlete.ageEligible=true;}else i.athlete.ageYears=age;
 const e=t.it.enroll({actor:t.actor,intake:i,consents:{COACHING:true,HEALTH_SIGNALS:true,LEARNING:true}});if(!e.ok)throw new Error(name+' '+e.error.code);
 save(name+'-presentation',t.it.presentation({actor:t.actor}));
 if(name==='hr5r-declared'){
  const v=()=>t.it.read({actor:t.actor}).doc.version;
  let r=t.it.setHeartRateProfile({actor:t.actor,clientRequestId:'hr-1',expectedVersion:v(),heartRateProfile:{maxHeartRateBpm:195}});if(!r.ok)throw new Error('declared '+r.error.code);save('hr5r-declared-answer',r);
  save('hr5r-declared-presentation',t.it.presentation({actor:t.actor}));
  r=t.it.setHeartRateProfile({actor:t.actor,clientRequestId:'hr-2',expectedVersion:v(),heartRateProfile:{zoneUpperBpm:[130,150,165,180]}});if(!r.ok)throw new Error('custom '+r.error.code);
  save('hr5r-custom-presentation',t.it.presentation({actor:t.actor}));
  save('hr5r-invalid-answer',t.it.setHeartRateProfile({actor:t.actor,clientRequestId:'hr-3',expectedVersion:v(),heartRateProfile:{zoneUpperBpm:[150,140,165,180]}}));
  save('hr5r-carried',t.it.carried({actor:t.actor}));}
 if(name==='hr5r-age30'){const day=addDays(t.doc().program.startDate,2);t.set(day);
  const r=t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(day,{pain:true}),observations:[]});if(r.status!=='CLINICAL_HUMAN_REQUIRED')throw new Error('hold '+r.status);
  save('hr5r-hold-presentation',t.it.presentation({actor:t.actor}));}
}
console.log(JSON.stringify({authority,written:fs.readdirSync(OUT).filter(f=>f.startsWith('hr5r-')).sort()}));
