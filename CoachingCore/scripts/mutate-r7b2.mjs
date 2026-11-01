// R7-B.2 bounded mutation probe (DOMAIN_COACHING_R7-B.2, TASK_CONTRACT §7 G5). Two sets:
// - the precedence mutants (M58-M64): each undoes or weakens the one precedence point of QE-R7B1-04 / R7B2-CAND-01 / R7B2-CAND-02, and must be killed
//   by the R7-B.2 tests (test/r7b2-clinical-precedence.test.mjs);
// - the inherited mutants whose fragment the R7-B.2 diff overlaps (computed against the baseline 033f300: R7-B.1's M26 and M41, both on the decision
//   line; no R7-B mutant fragment overlaps), rerun on the new bytes with their own R7-B.1 test files (M41 with the R7-B.2 tests too). M26's fragment
//   no longer occurs verbatim, so it is rerun as M26b, the same mutation on the new line. M41 is equivalent on the new bytes (documented below).
//   Every other R7-B.1 and R7-B mutant result is inherited from R7B1-FREEZE-2's records.
// Each mutant changes exact source fragments (each must occur once), runs its test files, and restores the file byte for byte (checked by SHA-256,
// and against git at the end). Read-only for the repository unless given --write, which writes only the report named by --out (default
// r7/b2/MUTATION_R7B2.json). Not a general mutation score.
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i>=0&&process.argv[i+1]?process.argv[i+1]:d;};
const root=new URL('..',import.meta.url),sha=b=>createHash('sha256').update(b).digest('hex');
const AD='src/r6-adaptation.mjs',B2=['test/r7b2-clinical-precedence.test.mjs'],B1=['test/r7b1-residual-closure.test.mjs','test/r7b1-correction-cycle.test.mjs'];
const POINT="const clinical=clinicalRoute(kind,review);",DECIDE="const decide=c=>(kind!=='RETURN_AFTER_PAUSE'&&staleReturn(c))||(HANDLERS[kind]??weeklyReview)(c);";
const HANDLED="const handled=clinical??(factual?.ask?null:decide(factual?.ctx??ctx));",DECISION0="const decision0=clinical??factual?.ask??withFactualReplan(factual,handled.status==='CLINICAL_HUMAN_REQUIRED'?handled:choiceAsk??handled);";
const SUBST="if(kind==='EXERCISE_SUBSTITUTION'){const sub=substitutionOf(review);return sub&&typeof sub.exerciseId==='string'?substitutionClinical(sub):null;}",RET="return kind==='RETURN_AFTER_PAUSE'?interruptionScreen(interruptionOf(review)).clinical:null;";
const MUTANTS=[
 {id:'M58',blocker:'QE-R7B1-04, R7B2-CAND-01, R7B2-CAND-02',what:'the precedence point removed (the R7B1-FREEZE-2 behaviour)',edits:[[POINT,'const clinical=null;']],tests:B2},
 {id:'M59',blocker:'QE-R7B1-04',what:'the clinical route moved into decide, after staleReturn',edits:[[POINT,'const clinical=null;'],[DECIDE,"const decide=c=>(kind!=='RETURN_AFTER_PAUSE'&&staleReturn(c))||clinicalRoute(kind,review)||(HANDLERS[kind]??weeklyReview)(c);"]],tests:B2},
 {id:'M60',blocker:'R7B2-CAND-01',what:'the precedence point after the factual re-plan question',edits:[[HANDLED,"const handled=factual?.ask?null:clinical??decide(factual?.ctx??ctx);"],[DECISION0,"const decision0=factual?.ask??clinical??withFactualReplan(factual,handled.status==='CLINICAL_HUMAN_REQUIRED'?handled:choiceAsk??handled);"]],tests:B2},
 {id:'M61',blocker:'R7B2-CAND-02, R7B2-CAND-01',what:'the precedence point limited to EXERCISE_SUBSTITUTION (no return screen)',edits:[[RET,'return null;']],tests:B2},
 {id:'M62',blocker:'QE-R7B1-04, R7B2-CAND-01',what:'the precedence point limited to RETURN_AFTER_PAUSE (no substitution screen)',edits:[[SUBST,'']],tests:B2},
 {id:'M63',blocker:'QE-R7B1-04',what:'the point reads a weaker substitution predicate (pain only) than the handler',edits:[["return sub&&typeof sub.exerciseId==='string'?substitutionClinical(sub):null;","return sub&&typeof sub.exerciseId==='string'&&isYes(sub.pain)?substitutionClinical(sub):null;"]],tests:B2},
 {id:'M64',blocker:'R7B2-CAND-02, R7B2-CAND-01',what:'the point reads a weaker return predicate (the clinical flag only) than the handler',edits:[[RET,"return kind==='RETURN_AFTER_PAUSE'&&interruptionOf(review).clinicalReason===true?interruptionScreen(interruptionOf(review)).clinical:null;"]],tests:B2},
 // Inherited, rerun on the new bytes (the diff overlaps their fragment).
 {id:'M26b',inherits:'M26 (R7-B.1)',blocker:'QE-R7B-R2-02',what:'the block-choice question asked mid-week or in another review kind drops the factual re-plan',edits:[[DECISION0,"const decision0=clinical??factual?.ask??(handled.status==='CLINICAL_HUMAN_REQUIRED'?handled:choiceAsk??withFactualReplan(factual,handled));"]],tests:B1},
 {id:'M41',inherits:'M41 (R7-B.1)',blocker:'QE-R7B1-01',what:'a block-choice question wins over the clinical route of the same review',edits:[["handled.status==='CLINICAL_HUMAN_REQUIRED'?handled:choiceAsk??handled","choiceAsk??handled"]],tests:[...B1,...B2]}
];
const results=[];
for(const m of MUTANTS){
 const file=new URL(AD,root),original=fs.readFileSync(file),text=original.toString('utf8');
 const counts=m.edits.map(([f])=>text.split(f).length-1);
 if(counts.some(n=>n!==1)){results.push({id:m.id,blocker:m.blocker,what:m.what,result:'INVALID',reason:'fragment occurrences '+counts.join(',')});console.log(m.id,'INVALID',counts);continue;}
 let outcome;
 try{
  let mutated=text;for(const [f,r] of m.edits)mutated=mutated.replace(f,()=>r);
  fs.writeFileSync(file,mutated);
  const r=spawnSync(process.execPath,['--test',...m.tests],{cwd:root,encoding:'utf8',timeout:900000});
  const failed=Number((r.stdout.match(/ℹ fail (\d+)/)??[])[1]??'NaN'),passed=Number((r.stdout.match(/ℹ pass (\d+)/)??[])[1]??'NaN');
  outcome={result:failed>0?'KILLED':Number.isFinite(failed)?'SURVIVED':'ERROR',failedTests:failed,passedTests:passed,failing:(r.stdout.match(/^✖ .*$/gm)??[]).filter(l=>!/failing tests/.test(l)).slice(0,6)};
 }finally{fs.writeFileSync(file,original);}
 if(sha(fs.readFileSync(file))!==sha(original))throw new Error('restore failed for '+AD);
 results.push({id:m.id,...(m.inherits?{inherits:m.inherits}:{}),blocker:m.blocker,what:m.what,file:AD,tests:m.tests,...outcome});
 console.log(m.id,outcome.result,m.what);
}
const clean=spawnSync('git',['diff','--quiet','--','src'],{cwd:root}).status===0;
// A survivor is accepted only as a documented equivalent mutant.
const EQUIVALENT=[{id:'M41',why:"Equivalent on the R7-B.2 bytes: the guard it removes (a clinical handler result outranks the block-choice question, QE-R7B1-01) is now subsumed by the precedence point. In evaluateProgram's decision step a handler returns CLINICAL_HUMAN_REQUIRED only through its own screen (exerciseSubstitution: substitutionClinical; returnAfterPause: interruptionScreen; no other handler or callee returns that status after admission, src/r6-adaptation.mjs and its imports), and clinicalRoute(kind,review) calls the same function on the same review (the factual re-plan context spreads ctx and keeps its review). So handled.status==='CLINICAL_HUMAN_REQUIRED' implies clinical!==null, and then decision0 is clinical before the mutated fragment is read. QE-R7B1-01's behaviour stays covered by the R7-B.1 tests (passing on these bytes) and by neighbor E (scripts/neighbors-r7b2.mjs). The fragment is left in place (smallest diff; no runtime change in U3)."}];
const report={check:'R7B2-MUTATION',mutants:results.length,killed:results.filter(r=>r.result==='KILLED').length,survived:results.filter(r=>r.result==='SURVIVED').map(r=>r.id),equivalent:EQUIVALENT.filter(e=>results.some(r=>r.id===e.id&&r.result==='SURVIVED')),invalid:results.filter(r=>['INVALID','ERROR'].includes(r.result)).map(r=>r.id),sourceRestored:clean,
 inherited:{note:'Every other R7-B.1 mutant (M27-M40, M42-M57) and every R7-B mutant (M01-M25) keeps its result from R7B1-FREEZE-2 (r7/b1/MUTATION_R7B1_2.json, r7/b1/MUTATION_R7B_ON_R7B1_2.json): none of their fragments overlaps the R7-B.2 diff (baseline 033f300 -> this runtime), and each still occurs once in the new bytes.',overlapRerun:['M26 (as M26b)','M41 (equivalent on these bytes; see equivalent)']},results};
if(process.argv.includes('--write'))fs.writeFileSync(new URL(arg('--out','r7/b2/MUTATION_R7B2.json'),root),JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({mutants:report.mutants,killed:report.killed,survived:report.survived,invalid:report.invalid,sourceRestored:clean}));
process.exitCode=report.survived.some(id=>!report.equivalent.some(e=>e.id===id))||report.invalid.length||!clean?1:0;
