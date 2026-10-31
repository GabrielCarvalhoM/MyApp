// Engineering judge probe helpers, recheck copy for R7B-RUNTIME-REPERTOIRE-FREEZE-2 (REPO one level deeper; outputs in recheck/probes/out). Read-only against the frozen runtime: imports the repository modules and
// never writes outside this folder. Each probe records {id, area, verdict, expected, actual, detail}.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

export const HERE=path.dirname(fileURLToPath(import.meta.url));
export const REPO=path.resolve(HERE,'../../../../../..');
export const CORE=path.join(REPO,'CoachingCore');
export const imp=rel=>import(pathToFileURL(path.join(CORE,rel)).href);

export const H=await imp('r7/b/fixtures/helpers.mjs');
export const R=await imp('src/r7b-repertoire.mjs');
export const P=await imp('src/r6-program.mjs');
export const A=await imp('src/r6-adaptation.mjs');
export const V=await imp('src/value.mjs');
export const RECORDS=JSON.parse(fs.readFileSync(path.join(REPO,'audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json'),'utf8'));
export const without=(...ids)=>RECORDS.filter(r=>!ids.includes(r.review_id.replace('R7B0-SSCTR-','')));

const results=[];
export function record(id,area,ok,expected,actual,detail=null){results.push({id,area,verdict:ok?'PASS':'FAIL',expected,actual,...(detail?{detail}:{})});}
export function guard(id,area,fn){try{fn();}catch(e){results.push({id,area,verdict:'ERROR',expected:'probe runs',actual:String(e?.stack??e).split('\n').slice(0,4).join(' | ')});}}
export function done(name){
 const out={probe:name,frozen:'R7B-RUNTIME-REPERTOIRE-FREEZE-2',ran:new Date().toISOString(),results};
 fs.writeFileSync(path.join(HERE,'out',name+'.json'),JSON.stringify(out,null,1)+'\n');
 console.log(JSON.stringify({probe:name,pass:results.filter(r=>r.verdict==='PASS').length,fail:results.filter(r=>r.verdict==='FAIL').map(r=>r.id),error:results.filter(r=>r.verdict==='ERROR').map(r=>r.id)}));
}
fs.mkdirSync(path.join(HERE,'out'),{recursive:true});

// ---- shared scenario helpers (built only from the frozen fixtures' public helpers) ----
export const {program,reviewed,weekly,review,evaluateProgram,generateProgram,opts,FULL,K,rows,runs,live,gen,obs,intake,addDays,elig,OK}=H;
export const BAD={performance:'UNDER',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'IMPAIRED'};
export const correctionOf=(o,actual,correctedAt,response=null)=>({eventId:o.eventId+'-fix',athleteId:o.athleteId,sessionId:o.sessionId,observedAt:o.observedAt,correctionOf:o.eventId,correctedAt,actual,response:{...o.response,...(response??{})}});
export const strengthIds=(p,w,pred=()=>true)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(pred).map(e=>e.id));
export const templateTypes=(p,w)=>p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).map(s=>s.templateType).sort().join(',');
export const qualityRuns=(p,w)=>runs(p,w).filter(s=>['THRESHOLD','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','FAMILIAR_REPEATED_BOUTS'].includes(s.prescription.family));
export const evalAt=(t,w,x={},options=opts)=>evaluateProgram(t.p,{...review(t.p,w,x),actualLedger:t.ledger},options);
/** Applies a result to a running timeline the way the fixtures do. */
export const apply=(t,r)=>{t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.last=r;return r;};
export const summary=r=>({status:r.status,action:r.action,reason:String(r.reason??'').slice(0,240),missingInputs:r.missingInputs??[],errors:(r.errors??[]).slice(0,6)});
