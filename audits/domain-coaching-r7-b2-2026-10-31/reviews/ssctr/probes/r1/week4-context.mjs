// R7B2-SSCTR-r1 helper probe: the week-4 strength rows that the QE-R7B2-01 correction refers to, and the week-5 rows planned from them, on
// R7-B.2 (NOW_ROOT only). Read-only; writes ./out/week4-context.json.
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL,fileURLToPath} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),c=path.join(path.resolve(process.env.NOW_ROOT),'CoachingCore');
const H=await import(pathToFileURL(path.join(c,'r7/b/fixtures/helpers.mjs')).href);
const {reviewed,weekly,review,evaluateProgram,opts,addDays}=H;
const t=reviewed({id:'ssctr-q3',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},3);
const rep=addDays(t.p.weeks[3].startDate,3);
const ret=evaluateProgram(t.p,{...review(t.p,3,{day:3,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:t.p.weeks[3].startDate,endDate:addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true}}),actualLedger:t.ledger},opts);
t.ledger=ret.actualLedger;t.p=ret.proposal;weekly(t,3);const w4=weekly(t,4);
const rows=k=>t.p.weeks[k].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).map(s=>s.id+': '+s.prescription.exercises.map(e=>e.id+' '+e.sets+'x'+e.reps+'@'+(e.load.mode==='KNOWN'?e.load.value:e.load.mode)+' RIR'+e.rir).join('; '));
const out={week4:rows(4),week5:rows(5),week4Review:{status:w4.status,action:w4.action,reason:w4.reason},week4Logged:t.ledger.filter(o=>t.p.weeks[4].sessions.some(s=>s.id===o.sessionId&&s.sport==='STRENGTH')).map(o=>({sessionId:o.sessionId,response:o.response}))};
fs.mkdirSync(path.join(HERE,'out'),{recursive:true});fs.writeFileSync(path.join(HERE,'out','week4-context.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify(out,null,1));
