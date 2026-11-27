// REPMILE CoachingCore CCP-79 item 2, the matrix of issue #124 (an urgent warning sign wins over the screening result): a regression test of
// REPMILE-COACHINGCORE-V1-CCP79-AMENDMENT-3. Four flows of the frozen api (notFeeling100, declareReadiness, wellbeingCheck, weeklyCheckIn with a
// check) x three screenings (all No, one Yes, several Yes) x seven signs (none, W7 swelling, W2, W3, W4, W5, X1): 84 cells, one synthetic athlete
// each, in-memory store. The matrix is the #124 probe's, unchanged, so its answers are byte-comparable with it.
// - screening Yes + an urgent sign (40 cells): URGENT_CARE_ADVISED, the sign named. All 40 failed first on the frozen base (PROFESSIONAL_ASSESSMENT).
// - screening Yes + W7 (8 cells): PROFESSIONAL_ASSESSMENT, the sign named and its own reason.
// - no sign, or screening all No (36 cells): the whole answer is byte-identical to the frozen base's (v1ccp79-i124-base-digests.json).
// Two answers of the unchanged cells are noted, not changed (outside CCP-79): declareReadiness with X1 and screening all No asks
// readiness.unrecognized (X1 is no READINESS_SIGNS item; the app never sends it there), and weeklyCheckIn reads no check outside an episode (KEEP;
// the app never calls weeklyCheckIn).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createCustody} from '../src/boundary/custody.mjs';
import {memoryStore} from '../src/boundary/store.mjs';
import {createBoundary} from '../src/boundary/api.mjs';
import {HYBRID} from './v1cp-fixtures.mjs';
import {signsFor,exerciseSignsFor,READINESS_SIGNS,WARNING_SIGNS as W,EXERCISE_SIGNS as X} from '../src/v1-f08.mjs';

const BASE=JSON.parse(fs.readFileSync(new URL('./v1ccp79-i124-base-digests.json',import.meta.url),'utf8')).digests;
function world(){
 const START='2026-11-09',addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
 const at=(w,d,hm)=>Date.parse(`${addDays(START,w*7+d)}T${hm}:00-03:00`),clock={t:at(-1,5,'12:00')};
 let k=0;const store=memoryStore(),custody=createCustody({store,key:'probe-key-not-a-secret',now:()=>clock.t,newId:p=>p+'_'+(++k)});
 const api=createBoundary({custody,now:()=>clock.t}),actor={athleteId:'ath-probe'};
 const set=(w,d,hm)=>{clock.t=at(w,d,hm);},ver=()=>api.plan({actor}).view?.version;let n=0;const rid=()=>'r'+(++n);
 const ELIG=(o={})=>({status:'NONCLINICAL_CONFIRMED',assessedAt:new Date(clock.t).toISOString(),pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false,...o});
 api.onboard({actor,intake:HYBRID(),consents:{COACHING:true,HEALTH_SIGNALS:true,LEARNING:false},clientRequestId:rid()});
 return {api,actor,set,ver,rid,ELIG};
}
const F=a=>Object.fromEntries(a.map(x=>[x,false]));
const SCREEN={none:{},one:{pain:true},several:{pain:true,injury:true,illness:true}};
const SIGN={none:null,W7:W.W7,W2:W.W2,W3:W.W3,W4:W.W4,W5:W.W5,X1:X.X1};
const URGENT=['W2','W3','W4','W5','X1'],COND='MILD_ILLNESS';
const payload=(base,sign,withX)=>{const ws=F(base),xr=withX?F(exerciseSignsFor(COND)):null;if(sign&&sign.startsWith('breathlessChestDizzy'))xr[sign]=true;else if(sign)ws[sign]=true;return {warningSigns:ws,...(xr?{exerciseResponse:xr}:{})};};
const FLOWS={
 notFeeling100:(w,el,s)=>{w.set(1,2,'08:00');return w.api.notFeeling100({actor:w.actor,clientRequestId:w.rid(),expectedVersion:w.ver(),eligibility:w.ELIG(el),wellbeing:{condition:COND,...payload(signsFor(COND),s,true),intent:'REST',days:4}});},
 declareReadiness:(w,el,s)=>{w.set(1,2,'08:00');w.api.notFeeling100({actor:w.actor,clientRequestId:w.rid(),expectedVersion:w.ver(),eligibility:w.ELIG(),wellbeing:{condition:COND,warningSigns:{...F(signsFor(COND)),[W.W7]:true},intent:'REST',days:4}});
  w.set(1,4,'09:00');return w.api.declareReadiness({actor:w.actor,clientRequestId:w.rid(),expectedVersion:w.ver(),eligibility:w.ELIG(el),readiness:{declaredRecovered:true,...payload(READINESS_SIGNS,s,s===X.X1),sports:{RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}}}});},
 wellbeingCheck:(w,el,s)=>{w.set(1,2,'08:00');w.api.notFeeling100({actor:w.actor,clientRequestId:w.rid(),expectedVersion:w.ver(),eligibility:w.ELIG(),wellbeing:{condition:COND,warningSigns:F(signsFor(COND)),exerciseResponse:F(exerciseSignsFor(COND)),intent:'REST',days:4}});
  w.set(1,4,'09:00');return w.api.wellbeingCheck({actor:w.actor,clientRequestId:w.rid(),expectedVersion:w.ver(),eligibility:w.ELIG(el),check:{...payload(signsFor(COND),s,true),improved:false}});},
 weeklyCheckIn:(w,el,s)=>{w.set(1,2,'08:00');w.api.notFeeling100({actor:w.actor,clientRequestId:w.rid(),expectedVersion:w.ver(),eligibility:w.ELIG(),wellbeing:{condition:COND,warningSigns:F(signsFor(COND)),exerciseResponse:F(exerciseSignsFor(COND)),intent:'REST',days:4}});
  w.set(1,4,'20:00');return w.api.weeklyCheckIn({actor:w.actor,clientRequestId:w.rid(),expectedVersion:w.ver(),eligibility:w.ELIG(el),reports:[],check:{...payload(signsFor(COND),s,true),improved:false}});},
};
const cells=[];for(const [f,run] of Object.entries(FLOWS))for(const [sc,el] of Object.entries(SCREEN))for(const [sk,s] of Object.entries(SIGN))cells.push({cell:`${f}|${sc}|${sk}`,f,sc,sk,sign:s,r:run(world(),el,s)});
const sha=r=>createHash('sha256').update(JSON.stringify(r)).digest('hex');

test('#124 matrix: 84 cells, 4 flows x 3 screenings x 7 signs',()=>{
 assert.equal(cells.length,84);assert.equal(Object.keys(BASE).length,36);
});
test('#124 / CCP-79 item 2: screening Yes (one or several) with an urgent sign (W2-W5, X1) advises urgent care and names the sign, in every flow (40 cells)',()=>{
 const urgent=cells.filter(c=>c.sc!=='none'&&URGENT.includes(c.sk));assert.equal(urgent.length,40);
 for(const c of urgent){assert.equal(c.r.status,'CLINICAL_HUMAN_REQUIRED',c.cell);assert.equal(c.r.decision?.guidance?.level,'URGENT_CARE_ADVISED',c.cell);assert.deepEqual(c.r.decision?.warningSigns,[c.sign],c.cell);
  assert.match(c.r.decision.reason,/seek urgent medical care/,c.cell);}
});
test('#124: screening Yes with a non-urgent sign (W7 swelling) keeps the professional assessment, with the sign named and its own reason (8 cells)',()=>{
 const pro=cells.filter(c=>c.sc!=='none'&&c.sk==='W7');assert.equal(pro.length,8);
 for(const c of pro){assert.equal(c.r.status,'CLINICAL_HUMAN_REQUIRED',c.cell);assert.equal(c.r.decision?.guidance?.level,'PROFESSIONAL_ASSESSMENT',c.cell);assert.deepEqual(c.r.decision?.warningSigns,['swelling'],c.cell);
  assert.match(c.r.decision.reason,/^You reported a warning sign \(swelling\): stop training and seek a professional assessment/,c.cell);}
});
test('#124: with no sign, or with screening all No, every answer is byte-identical to the frozen base (36 cells)',()=>{
 const kept=cells.filter(c=>c.sk==='none'||c.sc==='none');assert.equal(kept.length,36);
 for(const c of kept)assert.equal(sha(c.r),BASE[c.cell],c.cell+' differs from the frozen base');
 // Noted, outside CCP-79 (unchanged): X1 is no readiness item, and the weekly check-in reads no check outside an episode.
 assert.deepEqual(cells.find(c=>c.cell==='declareReadiness|none|X1').r.decision.missingInputs,['readiness.unrecognized']);
 for(const sk of URGENT)assert.equal(cells.find(c=>c.cell==='weeklyCheckIn|none|'+sk).r.status,'KEEP');
});
