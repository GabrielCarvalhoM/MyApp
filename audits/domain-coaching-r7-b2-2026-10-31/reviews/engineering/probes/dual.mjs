// R7-B.2 Engineering judge (QE-R7B2 review) dual-runtime probe library. Loads the same public fixture helpers and runtime modules from two
// trees in one process: NOW (the frozen R7B2-FREEZE-1 bytes, NOW_ROOT) and PRED (R7B1-FREEZE-2 extracted with git archive 146ebb8 into a temp
// directory outside the repository, PRED_ROOT). Each tree's helpers keep their own id counter, so running one scenario function on each tree
// with the same call sequence gives the same event and observation ids. Read-only on both trees; writes only ./out/<probe>.json.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

export const HERE=path.dirname(fileURLToPath(import.meta.url));
if(!process.env.NOW_ROOT||!process.env.PRED_ROOT)throw new Error('NOW_ROOT and PRED_ROOT are required');
async function load(root,label){
 const c=path.join(path.resolve(root),'CoachingCore'),imp=rel=>import(pathToFileURL(path.join(c,rel)).href);
 const H=await imp('r7/b/fixtures/helpers.mjs'),P=await imp('src/r6-program.mjs'),V=await imp('src/value.mjs'),A=await imp('src/r6-adaptation.mjs');
 return {label,root:path.resolve(root),H,P,V,A};
}
export const NOW=await load(process.env.NOW_ROOT,'R7B2-FREEZE-1');
export const PRED=await load(process.env.PRED_ROOT,'R7B1-FREEZE-2');
export const BAD={performance:'UNDER',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'IMPAIRED'};
export const correctionOf=(o,actual,correctedAt,response=null)=>({eventId:o.eventId+'-fix',athleteId:o.athleteId,sessionId:o.sessionId,observedAt:o.observedAt,correctionOf:o.eventId,correctedAt,actual,response:{...o.response,...(response??{})}});
export const apply=(t,r)=>{t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
/** A deterministic summary of one evaluateProgram result (everything a later review or a client could read). */
export function snap(rt,r){
 const h=x=>x===undefined||x===null?null:rt.V.hash(x);
 return {status:r.status,action:r.action,reason:r.reason??null,missingInputs:r.missingInputs??[],question:r.question??null,proposal:r.proposal?r.proposal.hash:null,
  disclosures:h(r.disclosures),offers:h(r.offers),substitutions:h(r.substitutions),counterfactuals:h(r.counterfactuals),gates:r.gates??null,horizons:h(r.horizons),
  instantiationOnly:r.instantiationOnly??null,loadQuestions:h(r.loadQuestions),ledger:h(r.actualLedger),pending:r.referenceState?.pending??null,referenceState:h(r.referenceState),
  planValidity:r.planValidity?.status??null,errors:r.errors??[]};
}
/** Field-by-field difference between two snaps. */
export const diff=(a,b)=>Object.keys({...a,...b}).filter(k=>JSON.stringify(a[k])!==JSON.stringify(b[k]));
export function write(name,body){
 fs.mkdirSync(path.join(HERE,'out'),{recursive:true});
 const out={probe:name,now:{label:NOW.label,root:'NOW_ROOT (worktree)'},pred:{label:PRED.label,root:'PRED_ROOT (temporary git archive of 146ebb8)'},ran:new Date().toISOString(),...body};
 fs.writeFileSync(path.join(HERE,'out',name+'.json'),JSON.stringify(out,null,1)+'\n');
 return out;
}
/** The re-entry week of the R7-B.1 judge probes K6/K6b: week 2's day-4 strength session left out of its weekly review, a nonclinical (WORK)
 * return reported on day 3 of week 3 (break from day 0). Reporting that session later is late evidence of training before the break. */
export function reentry(rt,id='qe-k6'){
 const {reviewed,weekly,review,evaluateProgram,opts,live,addDays,obs}=rt.H;
 const t=reviewed({id,equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},2);
 const late=t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.day===4);weekly(t,2,{keep:s=>s.id!==late.id});
 const rep=addDays(t.p.weeks[3].startDate,3);
 const ret=apply(t,evaluateProgram(t.p,{...review(t.p,3,{day:3,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:t.p.weeks[3].startDate,endDate:addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true}}),actualLedger:t.ledger},opts));
 if(ret.action!=='REESTABLISH')throw new Error('setup: return did not re-establish on '+rt.label+': '+ret.status+' '+ret.reason);
 const X=t.p.weeks[3].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>rep).flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
 return {t,late,lateObs:obs(t.p,late),X,rep,ret};
}
export const at=(rt,t,w,x,{day=4,hour='06:00:00'}={})=>rt.H.evaluateProgram(t.p,{...rt.H.review(t.p,w,{day,hour,...x}),actualLedger:t.ledger},rt.H.opts);
export const sub=(X,x={})=>({kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',...x}});
export const recorded=(r,s)=>(r.actualLedger??[]).some(o=>o.sessionId===s.id&&!o.superseded);
