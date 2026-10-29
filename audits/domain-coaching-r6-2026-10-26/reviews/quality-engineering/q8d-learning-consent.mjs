// QRE probe Q8d: does the athlete-specific learned rearrangement (learnedInterference over the completed-work ledger) run
// when learningConsent is false? The athlete model is correctly emptied without consent; this checks the arrangement path.
// Same scenario shape as the development test; REAL authority.
import {simulateProgram,write} from './qlib.mjs';
import {EDGE_PROFILES} from '../../../../CoachingCore/r6/fixtures/profiles.mjs';
const out={probe:'Q8d-learning-consent',authorityUsed:'REAL r6Authority()'};
for(const consent of [true,false]){
 const sh=EDGE_PROFILES.SHARED_SAME_TURN,input={...structuredClone(sh),learningConsent:consent,schedule:{...sh.schedule,temporaryPreference:'STRENGTH',sameTurnConfirmed:true}};
 const r=simulateProgram(input,{weeks:Array.from({length:8},(_,x)=>x>=3&&x<=5?{responses:[{sport:'RUN',role:'QUALITY',response:'HARDER'}]}:{})});
 const learned=r.decisions.filter(d=>d.action==='LEARNED_REARRANGEMENT');
 out['consent_'+consent]={learnedRearrangements:learned.map(d=>({week:d.weekIndex,reason:d.reason.slice(0,160)})),modelObservations:r.finalModel?.observations?.length??null,modelPurposeAllowed:r.finalModel?.purposeAllowed??null};
}
write('q8d-learning-consent.out.json',out);console.log(JSON.stringify(out,null,1));
