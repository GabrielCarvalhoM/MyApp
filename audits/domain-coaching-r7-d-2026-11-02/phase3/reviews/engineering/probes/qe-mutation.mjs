// QE engineering check R7-D Phase 3 (independent judge): adversarial mutants on the six changed source files, beyond the author's six
// "reintroduce the defect" mutants. Each mutant is applied to a scratch copy of the candidate runtime (never the repository), the directed
// file is run; a survivor of the directed file is then run against the whole suite.
//   node qe-mutation.mjs --runtime <root holding CoachingCore (a scratch copy)> --out <file> [--full]
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
// The scratch runtime must hold every review record the suite reads (R3, R4, R5, R6 and B0 records at their relative paths), so that the
// unmutated suite is fully green there; `--only QM10,QM16` reruns a subset.
const cc=path.join(path.resolve(arg('--runtime')),'CoachingCore'),out=arg('--out'),full=process.argv.includes('--full'),only=arg('--only')?.split(',')??null;
const M=[
 {id:'QM01',file:'src/r6-provenance.mjs',what:'DX-01 keep-precision path taken for every carried row (EXACT rows relabelled DAY)',from:"const t=carried&&o.provenance?.timePrecision==='DAY'&&isoDay(o.localDate)",to:"const t=carried&&isoDay(o.localDate)"},
 {id:'QM02',file:'src/r6-provenance.mjs',what:'DX-01: carried day rows skip the report-before-observation screen',from:"if(reported&&(t.precision==='EXACT'?Date.parse(reported)<Date.parse(t.at):localDate(reported,timezoneOffsetMinutes)<t.day))",to:"if(reported&&!carried&&(t.precision==='EXACT'?Date.parse(reported)<Date.parse(t.at):localDate(reported,timezoneOffsetMinutes)<t.day))"},
 {id:'QM03',file:'src/r6-adaptation.mjs',what:'DX-02: every kind that declares a break is decided as a return (event change dropped silently)',from:"const kind=kind0==='WEEKLY_REVIEW'&&declaresBreak(review)?'RETURN_AFTER_PAUSE':kind0;",to:"const kind=declaresBreak(review)?'RETURN_AFTER_PAUSE':kind0;"},
 {id:'QM04',file:'src/r6-adaptation.mjs',what:'DX-02: other kinds are not screened clinically for the declared break',from:"return kind==='RETURN_AFTER_PAUSE'||declaresBreak(review)?interruptionScreen",to:"return kind==='RETURN_AFTER_PAUSE'?interruptionScreen"},
 {id:'QM05',file:'src/r6-adaptation.mjs',what:'DX-02: an empty interruption object declares a break',from:"return !!i&&typeof i==='object'&&!Array.isArray(i)&&Object.keys(i).length>0;",to:"return !!i&&typeof i==='object'&&!Array.isArray(i);"},
 {id:'QM06',file:'src/r6-adaptation.mjs',what:'DX-02: breakCarrierAsk removed (another kind applies its own change over the break)',from:"const decide=c=>(kind!=='RETURN_AFTER_PAUSE'&&declaresBreak(review)&&breakCarrierAsk(kind))||",to:"const decide=c=>"},
 {id:'QM07',file:'src/r6-adaptation.mjs',what:'F04: only an adverse recovery survives confounding (impaired next day masked)',from:"const adverseBeyondConfounding=o=>o.response?.recovery==='ADVERSE'||o.response?.nextDayFunction==='IMPAIRED';",to:"const adverseBeyondConfounding=o=>o.response?.recovery==='ADVERSE';"},
 {id:'QM08',file:'src/r6-adaptation.mjs',what:'F04: confounded with an adverse signal read as CONFLICTING instead of ADVERSE',from:"o.confounded?(adverseBeyondConfounding(o)?'ADVERSE':'CONFOUNDED')",to:"o.confounded?(adverseBeyondConfounding(o)?'CONFLICTING':'CONFOUNDED')"},
 {id:'QM09',file:'src/r6-program.mjs',what:'F03-B P2: a machine step is offered in a phase that holds the load',from:"if(ex.mode==='KNOWN'&&ex.convention==='MACHINE_STACK'&&ex.stepDue&&!hold)",to:"if(ex.mode==='KNOWN'&&ex.convention==='MACHINE_STACK'&&ex.stepDue)"},
 {id:'QM10',file:'src/r6-program.mjs',what:'F03-B P3: no ceiling cap on a heavier machine value',from:"  if(cap!==null&&log.load>cap+1e-9)return {adopted:true,value:cap,capped:true,reason:'LOGGED_LOAD_ABOVE_CEILING_CAPPED',planned};\n",to:"\n"},
 {id:'QM11',file:'src/r6-program.mjs',what:'F03-B P3: ADVANCE criterion not required for a heavier machine value',from:"  if(advanced===false)return {adopted:false,reason:'LOGGED_LOAD_ABOVE_PLAN_TARGET_NOT_MET',planned};\n  const cap=",to:"  const cap="},
 {id:'QM12',file:'src/r6-program.mjs',what:'F03-B P3: a second equal log at another exposure does not verify',from:"if(log.confirmed===true||same(log.earlier)||same(ex?.pendingSetting))",to:"if(log.confirmed===true||same(ex?.pendingSetting))"},
 {id:'QM13',file:'src/r6-program.mjs',what:'F03-B P3: a pending setting logged again later does not verify',from:"if(log.confirmed===true||same(log.earlier)||same(ex?.pendingSetting))",to:"if(log.confirmed===true||same(log.earlier))"},
 {id:'QM14',file:'src/r6-program.mjs',what:'F03-B P5: REGRESS ignores the previous adopted setting (repetitions only)',from:"if(Number.isFinite(ex.previousLoad)&&ex.previousLoad<ex.load-1e-9)ex.load=ex.previousLoad;else ex.reps=",to:"ex.reps="},
 {id:'QM15',file:'src/r6-program.mjs',what:'F03-B P5: REGRESS computes R minus 1 kg when no previous setting',from:"if(Number.isFinite(ex.previousLoad)&&ex.previousLoad<ex.load-1e-9)ex.load=ex.previousLoad;else ex.reps=Math.max(lo,(ex.reps??lo)-S.repStep);",to:"if(Number.isFinite(ex.previousLoad)&&ex.previousLoad<ex.load-1e-9)ex.load=ex.previousLoad;else ex.load=ex.load-1;"},
 {id:'QM16',file:'src/r6-program.mjs',what:'F03-B P4: a step logged at R does not hold the fallback repetitions',from:"    if(uLog.nextSetting&&Number.isFinite(before)&&Math.abs(adoption.value-before)<1e-9&&Number.isInteger(uLog.nextSetting.fallbackReps))ex.reps=uLog.nextSetting.fallbackReps;\n",to:"\n"},
 {id:'QM17',file:'src/r6-program.mjs',what:'F03-B: a pending heavier setting is not kept (no question re-offer state)',from:"  else if(adoption?.pending&&adoption.machineStep)ex.pendingSetting=log.load;",to:"  else if(adoption?.pending&&adoption.machineStep){}"},
 {id:'QM18',file:'src/r6-program.mjs',what:'F03-B: re-establishment keeps previousLoad/stepDue/pendingSetting',from:"const reEstablish=(ex,u)=>{const c0=Number.isInteger(u.baseSets)?u.baseSets:u.sets;delete ex.previousLoad;delete ex.stepDue;delete ex.pendingSetting;",to:"const reEstablish=(ex,u)=>{const c0=Number.isInteger(u.baseSets)?u.baseSets:u.sets;"},
 {id:'QM19',file:'src/r6-program.mjs',what:'F03-B: a return keeps previousLoad/stepDue/pendingSetting',from:"delete n.previousLoad;delete n.stepDue;delete n.pendingSetting;",to:""},
 {id:'QM20',file:'src/r6-program.mjs',what:'F03-B P2/P6: LOAD mode offers the step at every tick (cadence ignored)',from:"if(k==='EARNED'||ex.loadTick%2===0){ex.stepDue={reps:ex.reps,heldReps:ex.reps};ex.loadTick=0;}else delete ex.stepDue;",to:"ex.stepDue={reps:ex.reps,heldReps:ex.reps};ex.loadTick=0;"},
 {id:'QM21',file:'src/r7b-repertoire.mjs',what:'I-1: MACHINE_STACK increment read as 1 kg again (tolerance, agreement)',from:":convention==='MACHINE_STACK'?0:(S?.smallestIncrement?.[convention]??0);",to:":(S?.smallestIncrement?.[convention]??0);"},
 {id:'QM22',file:'src/r6-prescription.mjs',what:'F03-B: the step row states R as its value (a number on a numberless row)',from:"{mode,unit:LOAD_UNITS[c]??'KG',convention:c,...(rule?{rule}:{}),...(next?{nextSetting:next}:{})}",to:"{mode,unit:LOAD_UNITS[c]??'KG',convention:c,...(rule?{rule}:{}),...(next?{nextSetting:next,value:next.aboveKg}:{})}"},
 {id:'QM23',file:'src/r6-composition.mjs',what:'F03-B: the week record of a step row drops nextSetting',from:",...(e.load.nextSetting?{nextSetting:{...e.load.nextSetting}}:{})})));}",to:"})));}"},
 {id:'QM24',file:'src/r6-program.mjs',what:'F03-B: the used record of a step row drops nextSetting',from:",date,...(dose.nextSetting?{nextSetting:clone(dose.nextSetting)}:{})});",to:",date});"}
];
const run=args=>{const r=spawnSync(process.execPath,['--test',...args],{cwd:cc,encoding:'utf8',maxBuffer:1<<27,timeout:1800000});return {status:r.status,pass:Number(r.stdout.match(/ℹ pass (\d+)/)?.[1]??NaN),fail:Number(r.stdout.match(/ℹ fail (\d+)/)?.[1]??NaN),failed:[...new Set([...r.stdout.matchAll(/^✖ ([^\n]*?) \(\d/gm)].map(m=>m[1]))]};};
const base=run(['test/r7d-phase3.test.mjs']);
const results=[];
for(const m of M.filter(x=>!only||only.includes(x.id))){
 const f=path.join(cc,m.file),src=fs.readFileSync(f,'utf8'),n=src.split(m.from).length-1;
 if(n!==1){results.push({...m,applied:false,occurrences:n});continue;}
 fs.writeFileSync(f,src.replace(m.from,m.to));
 let directed,suite=null;
 try{directed=run(['test/r7d-phase3.test.mjs']);if(full&&directed.fail===0)suite=run([]);}finally{fs.writeFileSync(f,src);}
 const killed=directed.fail>0||(suite?suite.fail>0:false);
 results.push({id:m.id,file:m.file,what:m.what,applied:true,directed:{fail:directed.fail,failed:directed.failed.filter(x=>x.startsWith('R7-D'))},suite:suite?{pass:suite.pass,fail:suite.fail,failed:suite.failed.slice(0,8)}:null,killed});
 console.error(m.id,killed?'KILLED':'SURVIVED',directed.fail,suite?suite.fail:'');
}
const report={probe:'QE-R7D-P3-MUTATION-1',baseline:base,mutants:results,summary:{mutants:results.length,applied:results.filter(r=>r.applied).length,killed:results.filter(r=>r.killed).length,survived:results.filter(r=>r.applied&&!r.killed).map(r=>r.id),notApplied:results.filter(r=>!r.applied).map(r=>r.id)}};
fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify(report.summary));
