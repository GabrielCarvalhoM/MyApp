// QE-R7B2 judge: writes an instrumented copy of src/r6-adaptation.mjs into a TEMPORARY tree (never the repository). The copy records, to the file
// named by QE_WITNESS, (W1) any decision where the handler returned CLINICAL_HUMAN_REQUIRED while the precedence point returned null (the only case
// in which the guard that R7-B.1's mutant M41 removes could still matter), and (W2) any precedence route that the review's own handler, run
// directly with a fresh event id (so the return's report-identity question is not reached), would not return identically (a false or divergent
// clinical route). It also appends one character per decision step to QE_WITNESS.count: C (precedence route), H (handler-only clinical), . (other).
// Usage: node m41-witness-instrument.mjs <temp tree root> <pristine r6-adaptation.mjs>   (refuses any path inside the repository)
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(process.argv[2]),pristine=path.resolve(process.argv[3]),repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../../..');
if(root.startsWith(repo))throw new Error('refusing to instrument inside the repository: '+root);
const f=path.join(root,'CoachingCore/src/r6-adaptation.mjs');let s=fs.readFileSync(pristine,'utf8');
const anchor='  const handled=clinical??(factual?.ask?null:decide(factual?.ctx??ctx));\n';
if(!s.includes(anchor))throw new Error('anchor not found');
const NL='String.fromCharCode(10)';
const probe=[
 '  if(process.env.QE_WITNESS){',
 `   if(!clinical&&handled?.status==='CLINICAL_HUMAN_REQUIRED')__qefs.appendFileSync(process.env.QE_WITNESS,JSON.stringify({w:'W1',kind,reason:handled.reason})+${NL});`,
 `   if(clinical){const c=factual?.ctx??ctx,h=(HANDLERS[kind]??weeklyReview)({...c,review:{...c.review,event:{...c.review.event,id:'__qe_fresh__'+c.review.event.id}}});if(JSON.stringify(h)!==JSON.stringify(clinical))__qefs.appendFileSync(process.env.QE_WITNESS,JSON.stringify({w:'W2',kind,route:clinical.reason,handler:String(h?.status)+' '+String(h?.reason)})+${NL});}`,
 `   __qefs.appendFileSync(process.env.QE_WITNESS+'.count',clinical?'C':handled?.status==='CLINICAL_HUMAN_REQUIRED'?'H':'.');`,
 '  }',''].join('\n');
s="import __qefs from 'node:fs';\n"+s.split(anchor).join(anchor+probe);
fs.writeFileSync(f,s);console.log('instrumented',f);
