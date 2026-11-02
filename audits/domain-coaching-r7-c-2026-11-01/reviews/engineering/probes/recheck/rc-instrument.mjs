// Engineering recheck (R7C-FREEZE-2) instrument: patches an ISOLATED copy of CoachingCore (a git archive of a10cec0, never the repository) so
// that every ceiling re-plan (factualReplan origin CEILING) and every G01 guard re-decision is appended, one JSON line each, to the file named by
// the environment variable QE_LOG. Behaviour is unchanged: the patch only observes. Usage:
//   node rc-instrument.mjs <copy root containing CoachingCore/>
// Refuses to patch a root inside the repository worktree.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(process.argv[2]??''),repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../../../..');
if(!process.argv[2]||root.toLowerCase().startsWith(repo.toLowerCase()))throw Error('copy root required, outside the repository: '+root);
const f=path.join(root,'CoachingCore/src/r6-adaptation.mjs');let src=fs.readFileSync(f,'utf8');
const swap=(from,to)=>{const n=src.split(from).length-1;if(n!==1)throw Error(`anchor found ${n} times: ${from.slice(0,80)}`);src=src.replace(from,to);};
swap("import {clone,freeze,hash} from './value.mjs';",
 "import {clone,freeze,hash} from './value.mjs';\nimport {appendFileSync as __qeAppend} from 'node:fs';\nconst __qeLog=x=>{if(process.env.QE_LOG)__qeAppend(process.env.QE_LOG,JSON.stringify({test:process.env.QE_TEST??null,...x})+'\\n');};");
// The G01 guard: log the re-decision without the ceiling and its outcome.
swap("if(factual0?.origin==='CEILING'&&decision.question?.kind==='UNREPORTED_TRAINING')return evaluateProgram(program,review,{...options,[NO_CEILING]:true});",
 "if(factual0?.origin==='CEILING'&&decision.question?.kind==='UNREPORTED_TRAINING'){const __r=evaluateProgram(program,review,{...options,[NO_CEILING]:true});__qeLog({at:'G01_GUARD',athlete:program.athleteId,w,kind,asOf,withCeiling:{status:decision.status??decision.action,question:decision.question?.kind??null,proposal:!!decision.proposal},rerun:{status:__r.status,action:__r.action,question:__r.question?.kind??null,validity:__r.planValidity?.status,proposal:!!__r.proposal,reason:String(__r.reason??'').slice(0,200)}});return __r;}");
// Every decision whose canonical factual state came from the ceiling re-plan: what the decision became.
swap("  // Load questions follow the decision's own gates, so they never contradict the adoption the transition made (SSCTR D44).",
 "  if(factual0?.origin==='CEILING')__qeLog({at:'CEILING_DECISION',athlete:program.athleteId,w,kind,asOf,factualAsk:!!factual0.ask,gap:!!gap,status:decision.status??(decision.proposal&&!decision.instantiationOnly?'MODIFY':decision.action==='ASK'?'ASK':'KEEP'),action:decision.action,question:decision.question?.kind??null,proposal:!!decision.proposal,reason:String(decision.reason??'').slice(0,160)});\n  // Load questions follow the decision's own gates, so they never contradict the adoption the transition made (SSCTR D44).");
fs.writeFileSync(f,src);
console.log(JSON.stringify({patched:f}));
