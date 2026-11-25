// V1HR5 (2026-11-25): captures what the AMENDED boundary returns for synthetic athletes with and without heart rate, so the Swift contract delta
// (proposals/CoachingPresentation, FiveZoneDecodingTests) decodes real shapes. Through createIntegration and api.mjs, as the app calls them.
// The engine authority is the production one unless `--dev` is given (the development five-zone authority over the file as read), which is how
// the shapes are captured before the independent enabling record exists; each file says which (`authority`).
// Run: node audits/v1-five-zone-heart-rate-2026-11-25/probes/capture-hr5.mjs [--dev]
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as S from '../../../CoachingCore/src/v1-safety-index.mjs';
import {devFiveZone,fiveZoneAuthority} from '../../../CoachingCore/src/v1-heart-rate-zones.mjs';
import {athlete,athleteA,ELIG,addDays} from '../../../CoachingCore/test/v1int-helpers.mjs';
import {result} from '../../../CoachingCore/test/v1rc-helpers.mjs';

const dev=process.argv.includes('--dev'),authority=dev?'DEV_TEST_ONLY':fiveZoneAuthority().approved?'CURRENT_INDEPENDENT_REVIEW':'NOT_ENABLED';
// The engine an integration composes, with the development five-zone authority added to every call when --dev (production passes no options).
const engine=dev?{...S,generateProgram:(i,o)=>S.generateProgram(i,{...o,heartRateFiveZone:devFiveZone()}),evaluateProgram:(p,i,o)=>S.evaluateProgram(p,i,{...o,heartRateFiveZone:devFiveZone()}),restartProgram:(i,o)=>S.restartProgram(i,{...o,heartRateFiveZone:devFiveZone()})}:S;
const OUT=path.join(path.dirname(fileURLToPath(import.meta.url)),'out');fs.mkdirSync(OUT,{recursive:true});
let idSeq=0;const newId=p=>`${p}_${String(++idSeq).padStart(6,'0')}`;
const STRAP=bpm=>({heartRate:{maxBpm:bpm,sensor:'CHEST_STRAP'}});
const R10=(x={})=>({id:'race-10k',...result('10K',3000,'2026-11-01',x)});
// A lab test as SSCTR-HR5-DECISION-r1 HR5-2 needs it: a declared running test (lab.modality), ECG or chest strap, RPE 8 or more, tolerated.
const LAB=bpm=>({id:'lab-1',kind:'LAB_TEST',date:'2026-10-20',rpe:9,tolerated:true,lab:{protocol:'Incremental treadmill test',source:'Laboratory report',modality:'TREADMILL_RUN',values:[{name:'First measured anchor',value:150,unit:'bpm'}]},heartRate:{maxBpm:bpm,sensor:'ECG'}});
const save=(name,x)=>fs.writeFileSync(path.join(OUT,name+'.json'),JSON.stringify({authority,...x},null,1)+'\n');
const cases=[['hr5-strap',[R10(STRAP(186))]],['hr5-lab',[R10(),LAB(190)]],['hr5-conflict',[R10(STRAP(192)),LAB(180)]],['hr5-none',[R10()]]];
for(const [name,anchors] of cases){
 const t=athlete({newId,id:name,weeks:8,engine}),i=athleteA({weeks:8,id:name});i.athlete.performanceAnchors=anchors;
 const e=t.it.enroll({actor:t.actor,intake:i,consents:{COACHING:true,HEALTH_SIGNALS:true,LEARNING:true}});if(!e.ok)throw new Error(name+' '+e.error.code);
 save(name+'-presentation',t.it.presentation({actor:t.actor}));
 if(name==='hr5-strap'){const day=addDays(t.doc().program.startDate,2);t.set(day);
  const r=t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(day,{pain:true}),observations:[]});if(r.status!=='CLINICAL_HUMAN_REQUIRED')throw new Error('hold '+r.status);
  save('hr5-hold-presentation',t.it.presentation({actor:t.actor}));}
}
console.log(JSON.stringify({authority,written:fs.readdirSync(OUT).filter(f=>f.startsWith('hr5-')).sort()}));
