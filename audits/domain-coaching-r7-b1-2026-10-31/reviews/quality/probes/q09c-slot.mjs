// R7B1-QUALITY q09c: q09 with the role test. A slot of X that does not take the selected exercise: the session already held the selected exercise and,
// after the decision, the selected exercise does not hold X's role there while another, unnamed exercise does (the R2-04 symptom); versus the knock-on
// where the selected exercise moves into X's role and its own former slot takes a fallback. Generated from q09-rotation-slip.mjs.
// outside the event weeks. Grid: equipment x strength goal x days x rotation (EVERY_2_WEEKS, COACH_DECIDES, FIXED), 12-week PERFORMANCE programs;
// week 4 (day 1): a reason-based substitution of every exercise in use (both reasons). For each MODIFY and each session ahead that held X, the
// exercises the session gained must be exactly {selected}; a "slip" is a session that lost X and gained something else (or nothing) because the
// selected exercise was already in it. Strict (the QE-R7B-01 claim): a session that held X and either already held the selected exercise or does not
// prescribe it after the decision. Usage: node q09-rotation-slip.mjs [<root containing CoachingCore>] [label]
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),root=process.argv[2]??path.resolve(HERE,'../../../../..'),label=process.argv[3]??'R7B1';
const imp=rel=>import(pathToFileURL(path.join(root,'CoachingCore',rel)).href);
const H=await imp('r7/b/fixtures/helpers.mjs');
const {reviewed,review,evaluateProgram,opts,live,FULL}=H;
const EQ={FULL,DB_BENCH:['DUMBBELLS','BENCH'],DB_BENCH_BANDS_BAR:['DUMBBELLS','BENCH','BANDS','PULL_UP_BAR'],BANDS_AND_BAR:['BANDS','PULL_UP_BAR'],MACHINES_DB:['DUMBBELLS','BENCH','MACHINES'],DB_BENCH_KB:['DUMBBELLS','BENCH','KETTLEBELL']};
const out={label,decisions:0,modify:0,byRotation:{},examples:[]};
for(const rotation of ['EVERY_2_WEEKS','COACH_DECIDES','FIXED'])for(const [eqName,eq] of Object.entries(EQ))for(const sg of ['GENERAL','STRENGTH','RUNNING_SUPPORT'])for(const days of [[0,4],[0,2,4]]){
 const lab=`rot=${rotation} eq=${eqName} str=${sg} days=${days.length}`;let t;
 try{t=reviewed({id:'q09',equipment:eq,goals:{run:'PERFORMANCE',strength:sg},rotation,weeks:12,schedule:{strengthDays:days}},4);}catch{continue;}
 const R=out.byRotation[rotation]??={decisions:0,modify:0,decisionsWithSlip:0,slipSessions:0,decisionsStrict:0,strictSessions:0,selectedAlreadyThere:0,selectedMissing:0,slotNotTaken:0,decisionsSlotNotTaken:0,knockOn:0};
 const inUse=[...new Set(t.p.weeks[4].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>e.role!=='PRACTICE').map(e=>e.id)))];
 for(const X of inUse)for(const reason of ['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE']){
  const rv=review(t.p,4,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason,...(reason==='SKILL_MISMATCH'?{}:{nonclinicalConfirmed:true})}});
  const r=evaluateProgram(t.p,{...rv,actualLedger:t.ledger},opts);out.decisions++;R.decisions++;if(r.status!=='MODIFY')continue;out.modify++;R.modify++;
  const sel=r.substitutions[0].selected;let slips=[],slotNT=false;
  for(const k of r.proposal.weeks.slice(4))for(const s of k.sessions.filter(s=>s.sport==='STRENGTH'&&s.date>=rv.asOf.slice(0,10))){
   const s0=t.p.weeks[k.index].sessions.find(y=>y.id===s.id);if(!s0||!live(s0)||!s0.prescription.exercises.some(e=>e.id===X&&e.role!=='PRACTICE'))continue;
   const b=new Set(s0.prescription.exercises.map(e=>e.id)),a=live(s)?s.prescription.exercises.map(e=>e.id):[],gained=a.filter(id=>!b.has(id));
   const xRole=s0.prescription.exercises.find(e=>e.id===X).role,selRow=live(s)?s.prescription.exercises.find(e=>e.id===sel):null,notTaken=b.has(sel)&&(!selRow||selRow.role!==xRole||s0.prescription.exercises.find(e=>e.id===sel).role===selRow.role&&selRow.role!==xRole);
   if(b.has(sel)){if(selRow&&selRow.role===xRole&&s0.prescription.exercises.find(e=>e.id===sel).role!==xRole)R.knockOn++;else{R.slotNotTaken++;slotNT=true;if((out.notTakenExamples??=[]).length<10)out.notTakenExamples.push({lab,X,xRole,reason,selected:sel,session:s.id,before:s0.prescription.exercises.map(e=>e.id+':'+e.role),after:live(s)?s.prescription.exercises.map(e=>e.id+':'+e.role):null});}}
   const strict=b.has(sel)||!a.includes(sel);if(strict){R.strictSessions++;if(b.has(sel))R.selectedAlreadyThere++;if(!a.includes(sel))R.selectedMissing++;}
   if(!(gained.length===1&&gained[0]===sel))slips.push({session:s.id,strict,selectedAlreadyThere:b.has(sel),selectedMissing:!a.includes(sel),gained,before:[...b],after:a});
  }
  if(slotNT)R.decisionsSlotNotTaken++;
  if(slips.length){R.decisionsWithSlip++;R.slipSessions+=slips.length;}const st=slips.filter(z=>z.strict);if(st.length){R.decisionsStrict++;if((out.strictExamples??=[]).length<16)out.strictExamples.push({lab,X,reason,selected:sel,first:st[0],count:st.length});}
 }
}
fs.mkdirSync(path.join(HERE,'out'),{recursive:true});
fs.writeFileSync(path.join(HERE,'out',`q09c-slot-${label}.json`),JSON.stringify(out,null,1));
console.log(JSON.stringify({label,decisions:out.decisions,modify:out.modify,byRotation:out.byRotation},null,1));
