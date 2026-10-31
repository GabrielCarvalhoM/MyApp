// R7-B.1 bounded mutation probe (DOMAIN_COACHING_R7-B.1): one mutant per fix branch of the residual blocker closure. Each mutant changes one exact
// source fragment back towards FREEZE-2's behaviour, runs the R7-B.1 test file, and restores the file byte for byte (checked by SHA-256, and against
// git at the end). Read-only for the repository unless given --write, which writes only the report named by --out (default r7/b1/MUTATION_R7B1.json).
// The R7-B mutants run separately with scripts/mutate-r7b.mjs on the same bytes. Not a general mutation score.
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i>=0&&process.argv[i+1]?process.argv[i+1]:d;};
const root=new URL('..',import.meta.url),sha=b=>createHash('sha256').update(b).digest('hex'),T=['test/r7b1-residual-closure.test.mjs'];
const AD='src/r6-adaptation.mjs',PR='src/r6-program.mjs',RE='src/r7b-repertoire.mjs';
const MUTANTS=[
 {id:'M26',blocker:'QE-R7B-R2-02',what:'the block-choice question asked mid-week or in another review kind drops the factual re-plan',file:AD,find:'const decision0=factual?.ask??withFactualReplan(factual,choiceAsk??decide(factual?.ctx??ctx));',replace:'const decision0=factual?.ask??(choiceAsk??withFactualReplan(factual,decide(factual?.ctx??ctx)));'},
 {id:'M27',blocker:'QE-R7B-R2-02',what:'the block-choice question of a complete review that never reached the boundary step drops the factual re-plan',file:AD,find:"?withFactualReplan(factual,{action:'ASK',reason:'The block choices could not be applied in this review; they are made at the block boundary review',missingInputs:['choices']}):decision0;",replace:"?{action:'ASK',reason:'The block choices could not be applied in this review; they are made at the block boundary review',missingInputs:['choices']}:decision0;"},
 {id:'M28',blocker:'QE-R7B-R2-01',what:'proposals never store the novice templates of their context',file:AD,find:" if('noviceTemplates' in next){if(next.noviceTemplates)proposal.noviceTemplates=clone(next.noviceTemplates);else delete proposal.noviceTemplates;}",replace:''},
 {id:'M29',blocker:'QE-R7B-R2-01',what:'a re-plan of the context (substitution, schedule, goal, block boundary) does not state its novice templates',file:AD,find:'templates:next.templates,noviceTemplates:next.noviceTemplates??null,arrangementSessions:next.arrangementSessions',replace:'templates:next.templates,arrangementSessions:next.arrangementSessions'},
 {id:'M30',blocker:'QE-R7B-R2-01',what:'an equipment change does not state the novice templates it rebuilt',file:AD,find:"noviceTemplates:next.noviceTemplates??null,contextBefore:next.contextBefore??null},{eventId:review.event.id,asOf:ctx.asOf,action:'SUBSTITUTE'",replace:"contextBefore:next.contextBefore??null},{eventId:review.event.id,asOf:ctx.asOf,action:'SUBSTITUTE'"},
 {id:'M31',blocker:'QE-R7B-R2-03',what:'the set-aside fallback ignores the SKILL_MISMATCH direction (the slot\'s best configuration, higher skill first)',file:RE,find:'const fb=mismatch.length?optionsFor(false,e=>mismatch.every(m=>followsSkillMismatch(m.aside,e,m.inUse))):open;',replace:'const fb=open;'},
 {id:'M32',blocker:'QE-R7B-R2-03',what:'the fallback may rise above the substitute in use while staying below the set-aside configuration',file:RE,find:'&&skillRank(e.skill)<=skillRank((inUse??aside).skill);',replace:';'},
 {id:'M33',blocker:'QE-R7B-R2-03',what:'without a lower option the equipment change proceeds instead of asking',file:AD,find:'gap=skillMismatchGap(ctx,next);if(gap)return gap;',replace:'gap=null;'},
 {id:'M34',blocker:'QE-R7B-R2-03',what:'the SKILL_MISMATCH direction also binds a slot that only held the substitute (false questions)',file:RE,find:'const ownSlot=d=>located(d)||!Array.isArray(d.slots)||!d.slots.some(x=>x?.template===types[index])',replace:'const ownSlot=d=>true'},
 {id:'M35',blocker:'QE-R7B-OBS-04',what:'no event-week rule for a configuration a reason-based substitution placed',file:PR,find:'if(NO_NEW_EXERCISE_PHASES.includes(dayPhase)&&',replace:'if(false&&NO_NEW_EXERCISE_PHASES.includes(dayPhase)&&'},
 {id:'M36',blocker:'QE-R7B-OBS-04',what:'an exercise reported at intake counts as performed in this program',file:PR,find:"typeof e.lastPerformed==='string'&&e.lastPerformed>=sk.c.startDate",replace:"typeof e.lastPerformed==='string'"},
 {id:'M37',blocker:'QE-R7B-OBS-04',what:'any performed configuration may stand in, admissible alternative or not',file:PR,find:'&&admissibleAlternative(X,e,{role:r.role,available,skillOk:x=>familiar.has(x.id)||reached.has(x.id)||skillRank(x.skill)<=maxSkill,auth:sk.repertoire??DEFAULT_REPERTOIRE})',replace:''},
 {id:'M38',blocker:'QE-R7B-OBS-04',what:'a stand-in after a SKILL_MISMATCH ignores the direction of the reason',file:PR,find:"&&(reason!=='SKILL_MISMATCH'||followsSkillMismatch(X,e,current))",replace:''},
 {id:'M39',blocker:'QE-R7B-OBS-04',what:'a substitution whose substitute waits for the end of the event weeks is refused',file:AD,find:'if(has(X.id)||!has(to.id)&&!stands.length)return',replace:'if(has(X.id)||!has(to.id))return'},
 {id:'M40',blocker:'QE-R7B-01 (QE-R7B-R2-04)',what:'a candidate that cannot take every slot of the replaced exercise is still selected',file:AD,find:'if(slipsFrom(ctx,r.proposal,X.id,to.id)){',replace:'if(false){'}
];
const results=[];
for(const m of MUTANTS){
 const path=new URL(m.file,root),original=fs.readFileSync(path),text=original.toString('utf8'),n=text.split(m.find).length-1;
 if(n!==1){results.push({id:m.id,blocker:m.blocker,what:m.what,result:'INVALID',reason:`fragment occurs ${n} times`});console.log(m.id,'INVALID',n);continue;}
 let outcome;
 try{
  fs.writeFileSync(path,text.replace(m.find,m.replace));
  const r=spawnSync(process.execPath,['--test',...T],{cwd:root,encoding:'utf8',timeout:900000});
  const failed=Number((r.stdout.match(/ℹ fail (\d+)/)??[])[1]??'NaN'),passed=Number((r.stdout.match(/ℹ pass (\d+)/)??[])[1]??'NaN');
  outcome={result:failed>0?'KILLED':Number.isFinite(failed)?'SURVIVED':'ERROR',failedTests:failed,passedTests:passed,failing:(r.stdout.match(/^✖ .*$/gm)??[]).filter(l=>!/failing tests/.test(l)).slice(0,4)};
 }finally{fs.writeFileSync(path,original);}
 if(sha(fs.readFileSync(path))!==sha(original))throw new Error('restore failed for '+m.file);
 results.push({id:m.id,blocker:m.blocker,what:m.what,file:m.file,tests:T,...outcome});
 console.log(m.id,outcome.result,m.what);
}
const clean=spawnSync('git',['diff','--quiet','--','src'],{cwd:root}).status===0;
const report={check:'R7B1-MUTATION',mutants:results.length,killed:results.filter(r=>r.result==='KILLED').length,survived:results.filter(r=>r.result==='SURVIVED').map(r=>r.id),equivalent:[],invalid:results.filter(r=>['INVALID','ERROR'].includes(r.result)).map(r=>r.id),sourceRestored:clean,results};
if(process.argv.includes('--write'))fs.writeFileSync(new URL(arg('--out','r7/b1/MUTATION_R7B1.json'),root),JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({mutants:report.mutants,killed:report.killed,survived:report.survived,invalid:report.invalid,sourceRestored:clean}));
