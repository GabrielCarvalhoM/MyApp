// Author's mutation check for the round-8 fixes (D47–D49, R11–R13, the author-found restart reset). Each mutation removes one fix,
// runs the round-8 and round-7 regression tests, then restores the source byte for byte. Run from CoachingCore/ only while no judge
// or probe is reading the runtime, and never after FREEZE-2: node ../audits/domain-coaching-r6-2026-10-26/continuation/author-checks/mutation-check-r8.mjs
import fs from 'node:fs';import {execFileSync} from 'node:child_process';
const muts=[
 ['src/r6-program.mjs',"if((rs?.modeHistory??[]).some(m=>(C.historyModes??[]).includes(m)))return 'PROGRAM_HISTORY';",'','D47 history'],
 ['src/r6-program.mjs',"  rs=withModeHistory(sk,rs);\n",'','D47 history kept'],
 ['src/r6-adaptation.mjs',"if(at>=0||item)proposal.negotiation=","if(false)proposal.negotiation=",'D47 proposal item'],
 ['src/r6-program.mjs',"if(continuous>(st.longestContinuous??0))st.longestContinuous=continuous;",'','D47 longest run'],
 ['src/r6-adaptation.mjs',",longestContinuous:0,achieved:{long:null,easy:null,quality:null,strides:0}};","};",'restart reset'],
 ['src/r6-prescription.mjs',"load.mode==='FROM_LOG'&&pending?","load.mode==='FROM_LOG'&&false?",'D48 pending row'],
 ['src/r6-program.mjs',"if(blockEnd){if(executed&&!ex.returnInBlock)","if(blockEnd){if(executed)",'D49 block credit'],
 ['src/r6-program.mjs',"const s1=returnStepSets(op,Number.isInteger(ex.setCeiling)?ex.setCeiling:normal)","const s1=Math.max(1,(ex.sets??(main?g.sets:Math.max(1,g.sets-1)))-1)",'D49 step 2'],
 ['src/r6-program.mjs',"const base=Number.isInteger(ex?.setCap)?Math.min(normal,ex.setCap):normal","const base=normal",'D49 cap'],
 ['src/r6-program.mjs',"[n1,r1]=phased(s1,3)","[n1,r1]=[s1,3]",'D49 phase on step'],
 ['src/r6-program.mjs',"if(executed&&unreduced)ex.setCap=","if(executed)ex.setCap=",'D49 unreduced'],
 ['src/r6-program.mjs',"if(!returning&&executed&&Number.isInteger(p?.sets)&&p.sets===p.baseSets)ex.lastExecutedSets=","if(false)ex.lastExecutedSets=",'D49 last executed'],
 ['src/r6-program.mjs',"if(ceiling!==null)n.setCeiling=ceiling;",'','D49 ceiling'],
 ['src/r6-clinical.mjs'," csection cesarean"," cesarean",'R11 lexicon'],
 ['src/r6-program.mjs',"const easyGate=P.easy||!P.long?'EASY':'LONG';","const easyGate='EASY';",'R12 conversion'],
 ['src/r6-program.mjs',"if(['RESTART','RETURN'].includes(mode)&&['LONG','EASY','QUALITY'].some(k=>roles.has(k)))gates.EASY='ADVANCE';",'','R13 projection'],
];
for(const [f,a,b,label] of muts){
 const orig=fs.readFileSync(f,'utf8');if(orig.split(a).length!==2){console.log(label.padEnd(18),'PATTERN NOT UNIQUE');continue;}
 fs.writeFileSync(f,orig.replace(a,()=>b));
 let out='';try{out=execFileSync(process.execPath,['--test','test/r6-ssctr-r8-fixes.test.mjs','test/r6-ssctr-r7-fixes.test.mjs'],{encoding:'utf8'});}catch(e){out=e.stdout;}
 fs.writeFileSync(f,orig);
 console.log(label.padEnd(18),(out.match(/^✖ .*$/mg)??[]).filter(l=>!l.includes('failing tests')).map(l=>l.slice(2,70)).join(' | ')||'NO FAILURE (test does not catch it)');
}
