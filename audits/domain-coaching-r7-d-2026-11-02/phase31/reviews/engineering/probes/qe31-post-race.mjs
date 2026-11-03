// R7-D Phase 3.1 engineering check: the post-race eligibility question (SSCTR D04) keeps a break its review declares (the early return no
// directed test exercises; mutant QM31-03 survives the whole suite). Minimal: a race program, a fatigue report after race day with an
// eligibility assessed before it and a break; is the break recorded, and read by the next review?
//   node qe31-post-race.mjs --root <dir holding CoachingCore and the records it reads>
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const root=path.resolve(arg('--root')??'.');
const H=await import(pathToFileURL(path.join(root,'CoachingCore','r7/b/fixtures/helpers.mjs')).href);
const {opts,FULL,elig,program,review,addDays,evaluateProgram}=H;
const RACE={kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',13*7+6)}};
const p=program({id:'qe31-race',weeks:16,goals:{run:RACE,strength:'GENERAL'},equipment:FULL});
const raceWeek=p.phases.raceWeek,raceDate=addDays(p.startDate,raceWeek*7+p.phases.raceDay),w=raceWeek+1;
const brk={startDate:p.weeks[w].startDate,endDate:p.weeks[w].startDate,days:1,reasonCategory:'TRAVEL',reason:'Travel day',nonclinical:true};
const r=evaluateProgram(p,{...review(p,w,{day:1,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk}),eligibility:elig(addDays(raceDate,-2))},opts);
const rows=(r.actualLedger??[]).filter(o=>o?.fact==='INTERRUPTION_DECLARED');
const n=evaluateProgram(p,{...review(p,w,{day:2,hour:'07:00:00'}),actualLedger:r.actualLedger??[]},opts);
console.log(JSON.stringify({raceWeek,raceDate,reviewWeek:w,phase:p.weeks[w].phase,decision:{status:r.status,missing:r.missingInputs},recorded:rows.length,next:{status:n.status,action:n.action,missing:n.missingInputs,readsKeptBreak:/on record/.test(n.reason)||!!n.proposal?.decisions?.at(-1)?.interruption?.declaredBy,reason:n.reason.slice(0,160)}},null,1));
