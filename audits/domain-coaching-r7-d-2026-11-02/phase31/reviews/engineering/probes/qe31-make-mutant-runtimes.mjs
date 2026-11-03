// R7-D Phase 3.1 engineering check: builds one scratch runtime per mutant (CoachingCore without test/ and artifacts/, plus the records the
// runtime reads) so qe31-instruments.mjs can ask whether the final-gate instruments (P17, RESTATE_DECLARED_BREAK, P03/P10, carriers) notice them.
// The author's six (phase31/probes/phase31-mutation.mjs, same from/to text) and the directed-test survivors of qe31-mutation.mjs.
//   node qe31-make-mutant-runtimes.mjs --root <dir holding CoachingCore and audits records> --out <empty scratch dir>
import fs from 'node:fs';
import path from 'node:path';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const root=path.resolve(arg('--root')),outDir=path.resolve(arg('--out'));
const M={
 'P31-M1':["if(!statesBreak(review)||carried.some(r=>r.eventId===review.event.id))return null;","if(!statesBreak(review)||carried.some(r=>r.eventId===review.event.id)||!['WEEKLY_REVIEW','RETURN_AFTER_PAUSE'].includes(KIND_ALIASES[review.event.kind]??review.event.kind))return null;"],
 'P31-M2':["const retained=asOf&&!declaresBreak(input)?retainedBreak(program,carried,asOf):null,","const retained=asOf&&!declaresBreak(input)&&input?.referenceState?retainedBreak(program,carried,asOf):null,"],
 'P31-M3':["...clone(carried),...(declared?[declared]:[])],","...clone(carried),...(declared&&!clinicalRoute(kind,review)?[declared]:[])],"],
 'P31-M4':["(kind!=='RETURN_AFTER_PAUSE'&&declaresBreak(review)&&breakCarrierAsk(kind,recordedOn))","(kind!=='RETURN_AFTER_PAUSE'&&declaresBreak(review)&&!declared&&breakCarrierAsk(kind,recordedOn))"],
 'P31-M5':["return latest&&!program.decisions.some(d=>d.action==='REESTABLISH'&&Date.parse(d.asOf)>=Date.parse(latest.declaredAt))?latest:null;","return latest;"],
 'P31-M6':["const latest=rows.reduce((m,r)=>!m||Date.parse(r.declaredAt)>=Date.parse(m.declaredAt)?r:m,null);","const latest=rows.reduce((m,r)=>!m||Date.parse(r.declaredAt)<Date.parse(m.declaredAt)?r:m,null);"],
 'QM31-02':["unknown is neither clearance nor illness',keep({missingInputs:missing}));","unknown is neither clearance nor illness',{missingInputs:missing});"],
 'QM31-04':["(guard.status==='HOLD'?x=>x:keep)","(x=>x)"],
 'QM31-07':["actualLedger:[...clone(input.actualLedger??[]),declared]","actualLedger:[declared]"],
 'QM31-11':["&&r.inputHash===hash(r.interruption));",");"]
};
const skip=new Set(['test','artifacts']);
for(const [id,[from,to]] of Object.entries(M)){
 const dst=path.join(outDir,id,'CoachingCore');fs.mkdirSync(dst,{recursive:true});
 for(const e of fs.readdirSync(path.join(root,'CoachingCore')))if(!skip.has(e))fs.cpSync(path.join(root,'CoachingCore',e),path.join(dst,e),{recursive:true});
 for(const rec of ['audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json']){fs.mkdirSync(path.dirname(path.join(outDir,id,rec)),{recursive:true});fs.copyFileSync(path.join(root,rec),path.join(outDir,id,rec));}
 const f=path.join(dst,'src/r6-adaptation.mjs'),src=fs.readFileSync(f,'utf8'),n=src.split(from).length-1;
 if(n!==1)throw Error(id+': anchor occurs '+n+' times');
 fs.writeFileSync(f,src.replace(from,to));
 console.log(id,'built');
}
