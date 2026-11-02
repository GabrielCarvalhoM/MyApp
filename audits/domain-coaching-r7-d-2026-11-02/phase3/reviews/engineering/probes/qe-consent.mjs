// QE engineering check R7-D Phase 3 (independent judge): what the runtime does with a learning-consent revocation that a later decision does
// not repeat (the behaviour PREREG-2 Δ4 turns into a CONSUMER_CONDITION). Read-only.
//   node qe-consent.mjs <root holding CoachingCore>
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=path.resolve(process.argv[2]);
const H=await import(pathToFileURL(path.join(root,'CoachingCore','r7/b/fixtures/helpers.mjs')).href);
const {opts,program,review,obs,live,evaluateProgram}=H;
const t={p:program({id:'qe-consent'}),ledger:[],model:null};
const out=[];
for(const [w,consent] of [[0,undefined],[1,false],[2,undefined],[3,undefined]]){
 const r=evaluateProgram(t.p,{...review(t.p,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s)),...(consent===undefined?{}:{learningConsent:consent})}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.model?{athleteModel:t.model}:{})},opts);
 out.push({week:w,sent:consent===undefined?'(absent)':consent,status:r.status,modelPurposeAllowed:r.updatedModel?.purposeAllowed??null,modelObservations:r.updatedModel?.observations?.length??null});
 t.ledger=r.actualLedger??t.ledger;t.model=r.updatedModel??t.model;if(r.proposal)t.p=r.proposal;
}
console.log(JSON.stringify({intakeConsent:t.p.learningConsent,steps:out},null,1));
