// Engineering review of R7C-FREEZE-4: mutants on an ISOLATED copy (argv[2]: a folder holding CoachingCore/ from git archive a9654c8, never the
// repository). Re-runs the authors' Phase 7 mutants F7-M1..M11 (edit fragments copied verbatim from audits/.../probes/phase7-mutation.mjs) and
// the judge's own J7 mutants. For each: the directed set (the six R7-C files, the two pinned state-model files, r7b2-clinical-precedence), every
// failing test name kept; then the witness pattern of test/r7c-phase7.test.mjs alone (with the count of tests it selected). Bytes restored and
// checked by SHA-256 after each mutant. Prints JSON.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const root=path.resolve(process.argv[2]),core=path.join(root,'CoachingCore');
if(/worktrees[\/]domain-coaching-r7-c/.test(root))throw Error('refusing to mutate the repository');
const AD='src/r6-adaptation.mjs',PV='src/r6-provenance.mjs';
const R7C=['test/r7c-longitudinal.test.mjs','test/r7c-phase4.test.mjs','test/r7c-phase5.test.mjs','test/r7c-phase5-cc.test.mjs','test/r7c-phase6.test.mjs','test/r7c-phase7.test.mjs'];
const SET=[...R7C,'test/r7asm-state-model.test.mjs','test/r7asc-state-consumer.test.mjs','test/r7b2-clinical-precedence.test.mjs'];
const W7=['test/r7c-phase7.test.mjs'],CLOSED="  if(a?.provenance!==WEEK_START.WEEK_EVIDENCE)continue;\n",GATES="const G=Object.entries(program.decisions.find(d=>d.eventId===a.eventId)?.gates??{}).filter(([k])=>Object.values(RUN_GATE_ROLE).includes(k)).map(([,g])=>g);";
const P7=[
 {id:'F7-M1',rule:'visibility inferred from the gate class only (the R7C-FREEZE-3 reading for every report)',edits:[[AD,"  if(at?Date.parse(at)>Date.parse(a.evidenceThrough??a.asOf):(legacy??=legacyUnreadWeeks(ctx)).has(j))out.add(o);","  if((legacy??=legacyUnreadWeeks(ctx)).has(j))out.add(o);"]],tests:R7C,witness:'shortened \\(5\\)'},
 {id:'F7-M2',rule:'HOLD never counts as a review that read a run (a week whose review gave only HOLD run gates is unread)',edits:[[AD,CLOSED,CLOSED+"  {"+GATES+"if(G.length&&G.every(g=>g==='HOLD')){out.add(o);continue;}}\n"]],tests:R7C,witness:'visibility \\(1\\)'},
 {id:'F7-M3',rule:'REGRESS never counts as a review that read a run (a week whose review gave a REGRESS and no executed run gate is unread)',edits:[[AD,CLOSED,CLOSED+"  {"+GATES+"if(G.includes('REGRESS')&&!G.some(g=>['ADVANCE','EARNED'].includes(g))){out.add(o);continue;}}\n"]],tests:R7C,witness:'visibility \\(2\\)'},
 {id:'F7-M4',rule:'temporal visibility ignored: a report recorded after the review counts as present (its observation time stands in for the clock the record first held it at)',edits:[[AD,"const at=utcTimestamp(o.provenance?.firstRecordedAt);","const at=utcTimestamp(o.observedAt);"]],tests:R7C,witness:'visibility \\(3\\)'},
 {id:'F7-M5',rule:'a shortened answer a clinical route recorded is never reconciled (a late report of a run done short stays read)',edits:[[AD,"const unread=unreadRunReports(ctx);if(!unread.size)return false;","const unread=new Set([...unreadRunReports(ctx)].filter(o=>!(o.partial&&o.actual?.completed===true)));if(!unread.size)return false;"]],tests:R7C,witness:'\\(15\\): clinical first'},
 {id:'F7-M6',rule:'a mixed answer a carrier recorded is never reconciled (a closed week holding a report of a run not done keeps its late reports read)',edits:[[AD,"  if(at?Date.parse(at)>Date.parse(a.evidenceThrough??a.asOf):","  if(at?Date.parse(at)>Date.parse(a.evidenceThrough??a.asOf)&&!record.some(x=>x.context?.sport==='RUN'&&x.context.weekIndex===j&&x.actual?.completed===false&&!(Number(x.actual?.minutes)>0)):"]],tests:R7C,witness:'P6-F01 mixed'},
 {id:'F7-M7',rule:'records without first-recorded clocks: REGRESS no longer counts as an executed run in the R7C-FREEZE-3 reading (the Engineering\'s J-M2)',edits:[[AD,"executed=g=>!!g&&keys.some(k=>['ADVANCE','EARNED','REGRESS'].includes(g[k]));","executed=g=>!!g&&keys.some(k=>['ADVANCE','EARNED'].includes(g[k]));"]],tests:R7C,witness:'backward behaviour'},
 {id:'F7-M8',rule:'the clock is taken from the input (a supplied first-recorded clock is trusted)',edits:[[PV,"if(!carried)setFirstRecorded(o,recordArrival?now:null);","if(!carried&&!o.provenance.firstRecordedAt)setFirstRecorded(o,recordArrival?now:null);"]],tests:R7C,witness:'record: '},
 {id:'F7-M9',rule:'one execution keeps the later clock when two agreeing reports merge',edits:[[PV,"setFirstRecorded(previous,firstRecorded(previous,o));","setFirstRecorded(previous,firstRecorded(o));"]],tests:R7C,witness:'record: '},
 {id:'F7-M10',rule:'a correction takes its own clock (not its chain\'s)',edits:[[PV,"setFirstRecorded(o,firstRecorded(o,old,...(quarantined.has(identity)?accepted.filter(x=>x.identity===identity):[])));",""]],tests:R7C,witness:'record: '},
 {id:'F7-M11',rule:'a normalization that records no arrivals keeps the clocks its new rows bring (the learning model holds them)',edits:[[PV,"if(!carried)setFirstRecorded(o,recordArrival?now:null);","if(!carried&&recordArrival)setFirstRecorded(o,now);"]],tests:R7C,witness:'record: '}
];
const CMP="  if(at?Date.parse(at)>Date.parse(a.evidenceThrough??a.asOf):(legacy??=legacyUnreadWeeks(ctx)).has(j))out.add(o);";
const J7=[
 {id:'J7-M1',rule:'tie: a report first recorded at the closing review\'s own clock counts as unread (>= instead of >)',edits:[[AD,CMP,CMP.replace(')>Date.parse(',')>=Date.parse(')]],witness:'visibility \\(1\\)'},
 {id:'J7-M2',rule:'records without clocks: always read (legacy reading dropped)',edits:[[AD,CMP,CMP.replace('(legacy??=legacyUnreadWeeks(ctx)).has(j)','false')]],witness:'backward behaviour'},
 {id:'J7-M3',rule:'records without clocks: always unread',edits:[[AD,CMP,CMP.replace('(legacy??=legacyUnreadWeeks(ctx)).has(j)','true')]],witness:'backward behaviour'},
 {id:'J7-M4',rule:'merge with a clockless (pre-FREEZE-4) row keeps the earliest known clock instead of none',edits:[[PV,"return t.every(Boolean)?t.reduce((a,b)=>Date.parse(a)<=Date.parse(b)?a:b):null;","const k=t.filter(Boolean);return k.length?k.reduce((a,b)=>Date.parse(a)<=Date.parse(b)?a:b):null;"]],witness:'record: '},
 {id:'J7-M5',rule:'EXACT_REPLAY takes the re-send\'s (later) clock',edits:[[PV,"if(accepted.includes(sameEvent))setFirstRecorded(sameEvent,firstRecorded(sameEvent,o));","if(accepted.includes(sameEvent))setFirstRecorded(sameEvent,firstRecorded(o));"]],witness:'record: '},
 {id:'J7-M6',rule:'EXACT_REPLAY never merges clocks (the row processed first keeps its own)',edits:[[PV,"if(accepted.includes(sameEvent))setFirstRecorded(sameEvent,firstRecorded(sameEvent,o));",""]],witness:'record: '},
 {id:'J7-M7',rule:'the stamp is the report\'s own reportedAt when it supplies one (input-derived)',edits:[[PV,"if(!carried)setFirstRecorded(o,recordArrival?now:null);","if(!carried)setFirstRecorded(o,recordArrival?(reported??now):null);"]],witness:'record: '},
 {id:'J7-M8',rule:'per week instead of per report: one unread report makes every run report of its week unread',edits:[[AD," return out;\n}\n/**\n * The R7C-FREEZE-3 reading"," {const W=new Set([...out].map(o=>o.context.weekIndex));for(const o of record)if(o.context?.sport==='RUN'&&W.has(o.context.weekIndex))out.add(o);}\n return out;\n}\n/**\n * The R7C-FREEZE-3 reading"]],witness:'visibility \\(4\\)'},
 {id:'J7-M9',rule:'carried rows are re-stamped with the decision clock (arrival forgotten at every decision)',edits:[[PV,"if(!carried)setFirstRecorded(o,recordArrival?now:null);","if(!carried||recordArrival)setFirstRecorded(o,recordArrival?now:null);"]],witness:'visibility \\(1\\)'},
 {id:'J7-M10',rule:'projected weeks (CONDITIONAL_PLAN) no longer unread',edits:[[AD,"  if(a?.provenance===WEEK_START.CONDITIONAL_PLAN){out.add(o);continue;}\n",""]],witness:'shortened \\(5\\)'},
 {id:'J7-M11',rule:'the closing clock read from the start\'s asOf only (evidenceThrough ignored)',edits:[[AD,CMP,CMP.replace('a.evidenceThrough??a.asOf','a.asOf')]],witness:'shortened \\(5\\)'}
];
const runTests=(files,pattern=null)=>{const r=spawnSync(process.execPath,['--test',...(pattern?['--test-name-pattern',pattern]:[]),...files],{cwd:core,encoding:'utf8',timeout:1800000,maxBuffer:1<<27});const n=k=>Number((r.stdout.match(new RegExp('ℹ '+k+' ([0-9]+)'))??[])[1]??NaN);return {fail:n('fail'),pass:n('pass'),ranNamed:(r.stdout.match(/^[✔✖] .*$/gm)??[]).filter(l=>!/failing tests/.test(l)).length,failing:[...new Set((r.stdout.match(/^✖ .*$/gm)??[]).filter(l=>!/failing tests/.test(l)).map(l=>l.replace(/ \(\d[\d.]*ms\)$/,'')))]};};
const only=process.env.P7M_ONLY?new Set(process.env.P7M_ONLY.split(',')):null;
const baseline=runTests(SET);if(!(baseline.fail===0&&baseline.pass>0))throw Error('baseline '+JSON.stringify(baseline));
function mutate(m){
 const files=[...new Set(m.edits.map(([f])=>f))],orig=Object.fromEntries(files.map(f=>[f,fs.readFileSync(path.join(core,f))])),txt=Object.fromEntries(files.map(f=>[f,orig[f].toString('utf8')]));
 const counts=m.edits.map(([f,a])=>txt[f].split(a).length-1);if(counts.some(n=>n!==1))return {id:m.id,result:'INVALID',counts};
 for(const [f,a,b] of m.edits)txt[f]=txt[f].replace(a,()=>b);
 let o,w=null;try{for(const f of files)fs.writeFileSync(path.join(core,f),txt[f]);o=runTests(SET);if(m.witness)w=runTests(W7,m.witness);}finally{for(const f of files)fs.writeFileSync(path.join(core,f),orig[f]);}
 for(const f of files)if(sha(fs.readFileSync(path.join(core,f)))!==sha(orig[f]))throw Error('restore failed '+f);
 return {id:m.id,rule:m.rule,result:o.fail>0?'KILLED':Number.isFinite(o.fail)?'SURVIVED':'ERROR',failed:o.fail,passed:o.pass,failing:o.failing,witness:m.witness??null,witnessRan:w?.ranNamed??null,witnessFail:w?.fail??null,witnessPass:w?.pass??null,witnessFailing:w?.failing??null};
}
const list=[...P7,...J7].filter(m=>!only||only.has(m.id));
const results=list.map(mutate);
const witnessBaseline=Object.fromEntries([...new Set(list.map(m=>m.witness).filter(Boolean))].map(p=>[p,runTests(W7,p)]));
console.log(JSON.stringify({check:'JUDGE-P7-MUTANTS',root,baseline:{fail:baseline.fail,pass:baseline.pass},witnessBaseline,results},null,1));
