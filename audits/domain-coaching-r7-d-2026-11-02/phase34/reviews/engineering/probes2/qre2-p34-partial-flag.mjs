// QRE R7-D Phase 3.4 recheck (QRE-R7D-PHASE34-CHECK-r2), CQ-3: P18(a) under the completion rule reads `partial` from the ledger the harness carries.
// Is that the runtime's own flag (so the oracle can be no stricter than the runtime's completion rule)? DEV-46's half-length race touch, through the
// harness client:   node qre2-p34-partial-flag.mjs <harness dir> <runtime root> [--out <file>]
import path from 'node:path';import fs from 'node:fs';import {pathToFileURL} from 'node:url';
const [harness,root]=process.argv.slice(2),arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const {loadRuntime,runCase}=await import(pathToFileURL(path.join(harness,'lib/client.mjs')).href);
const rt=await loadRuntime(path.join(root,'CoachingCore'));
const dev=JSON.parse(fs.readFileSync(path.join(harness,'validation/DEV_CASES_R7D_6.json'),'utf8'));
const t=runCase(rt,dev.cases.find(c=>c.caseId==='DEV-46')),last=t.steps.at(-1),plan=last.planBefore??last.planAfter;
const touch=plan.weeks.flatMap(w=>w.sessions).filter(s=>s.role==='RACE_TOUCH'&&s.date>='2026-12-21'&&s.date<='2026-12-27').map(s=>s.id);
const rows=(last.result.actualLedger??last.ledgerBefore??[]).filter(r=>touch.includes(r.sessionId));
const out={probe:'QRE2-P34-PARTIAL-FLAG-1',root,source:'trace.steps.at(-1).result.actualLedger (what properties.mjs p18 reads)',touch,rows:rows.map(r=>({sessionId:r.sessionId,partial:r.partial,hasPartialKey:'partial' in r,completed:r.actual?.completed,minutes:r.actual?.minutes,plannedMinutes:r.context?.plannedMinutes??null}))};
const text=JSON.stringify(out,null,1);if(arg('--out'))fs.writeFileSync(arg('--out'),text+'\n');else console.log(text);
