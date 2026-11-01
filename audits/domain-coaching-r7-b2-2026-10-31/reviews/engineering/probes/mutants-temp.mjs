// QE-R7B2 judge: independent negative controls on a TEMPORARY copy of the frozen bytes (never the repository). Each mutant rewrites the temp
// copy's src/r6-adaptation.mjs from the pristine frozen file, runs the R7-B.2 test file and the R7-B.1 correction-cycle tests, and restores the
// pristine file. Usage: node mutants-temp.mjs <temp tree root> <pristine r6-adaptation.mjs>; writes ./out/mutants-temp.json.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(process.argv[2]),pristine=path.resolve(process.argv[3]),repo=path.resolve(HERE,'../../../../..');
if(root.startsWith(repo))throw new Error('refusing to mutate inside the repository: '+root);
const cc=path.join(root,'CoachingCore'),file=path.join(cc,'src/r6-adaptation.mjs'),orig=fs.readFileSync(pristine,'utf8');
const P0='  const clinical=clinicalRoute(kind,review);\n';
const H0='  const handled=clinical??(factual?.ask?null:decide(factual?.ctx??ctx));\n';
const D0='  const decision0=clinical??factual?.ask??withFactualReplan(factual,handled.status===\'CLINICAL_HUMAN_REQUIRED\'?handled:choiceAsk??handled);\n';
const S0="  const decide=c=>(kind!=='RETURN_AFTER_PAUSE'&&staleReturn(c))||(HANDLERS[kind]??weeklyReview)(c);\n";
const R0=" if(kind==='EXERCISE_SUBSTITUTION'){const sub=substitutionOf(review);return sub&&typeof sub.exerciseId==='string'?substitutionClinical(sub):null;}\n";
const R1=" return kind==='RETURN_AFTER_PAUSE'?interruptionScreen(interruptionOf(review)).clinical:null;\n";
const MUTANTS=[
 ['QM1 precedence point removed',[[P0,'  const clinical=null;\n']]],
 ['QM2 point moved into decide after staleReturn',[[P0,'  const clinical=null;\n'],[S0,"  const decide=c=>(kind!=='RETURN_AFTER_PAUSE'&&staleReturn(c))||clinicalRoute(kind,review)||(HANDLERS[kind]??weeklyReview)(c);\n"]]],
 ['QM3 point after the factual question',[[H0,'  const handled=factual?.ask?null:(clinical??decide(factual?.ctx??ctx));\n'],[D0,D0.replace('clinical??factual?.ask??','factual?.ask??clinical??')]]],
 ['QM4 point limited to EXERCISE_SUBSTITUTION',[[R1,'  return null;\n']]],
 ['QM5 point reads pain only',[[R0," if(kind==='EXERCISE_SUBSTITUTION'){const sub=substitutionOf(review);return sub&&typeof sub.exerciseId==='string'&&isYes(sub.pain)?substitutionClinical(sub):null;}\n"]]],
 ['QM6 point skipped when the review carries block choices',[[P0,'  const clinical=blockChoices.length?null:clinicalRoute(kind,review);\n']]],
 ['QM7 point routes a substitution without its exercise (false route)',[[R0," if(kind==='EXERCISE_SUBSTITUTION'){const sub=substitutionOf(review);return sub?substitutionClinical(sub):null;}\n"]]],
 ['QM8 late-evidence question suppressed (staleReturn never asked)',[[S0,'  const decide=c=>(HANDLERS[kind]??weeklyReview)(c);\n']]],
 ['QM9 = R7-B.1 M41: the handler-clinical guard removed',[[D0,"  const decision0=clinical??factual?.ask??withFactualReplan(factual,choiceAsk??handled);\n"]]],
 ['QM10 clinical route given the factual re-plan proposal',[[D0,"  const decision0=clinical?{...clinical,proposal:factual?.proposal??null}:factual?.ask??withFactualReplan(factual,handled.status==='CLINICAL_HUMAN_REQUIRED'?handled:choiceAsk??handled);\n"]]]];
const TESTS=['test/r7b2-clinical-precedence.test.mjs','test/r7b1-correction-cycle.test.mjs','test/r7b1-residual-closure.test.mjs'];
const runTests=()=>{const r=spawnSync(process.execPath,['--test',...TESTS],{cwd:cc,encoding:'utf8',maxBuffer:64*1024*1024});const n=k=>Number(r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
 const failed=[...r.stdout.matchAll(/^not ok \d+ - (.+)$/gm)].map(m=>m[1]).slice(0,12);return {tests:n('tests'),pass:n('pass'),fail:n('fail'),failed};};
const rows=[];
try{
 fs.writeFileSync(file,orig);const base=runTests();rows.push({mutant:'pristine (control)',...base});
 for(const [name,edits] of MUTANTS){
  let s=orig;for(const [a,b] of edits){if(!s.includes(a))throw new Error(name+': anchor not found: '+a.slice(0,60));s=s.split(a).join(b);}
  fs.writeFileSync(file,s);const r=runTests();rows.push({mutant:name,killed:r.fail>0,...r});console.log(name.padEnd(64),r.fail>0?'KILLED':'survived',r.pass+'/'+r.tests);
 }
}finally{fs.writeFileSync(file,orig);}
fs.mkdirSync(path.join(HERE,'out'),{recursive:true});
fs.writeFileSync(path.join(HERE,'out','mutants-temp.json'),JSON.stringify({ran:new Date().toISOString(),tree:'temporary git archive of 1a1c728 (R7B2-FREEZE-1 bytes), restored after each mutant',tests:TESTS,rows},null,1)+'\n');
console.log(JSON.stringify(rows.map(r=>({mutant:r.mutant,killed:r.killed,pass:r.pass,fail:r.fail})),null,1));
