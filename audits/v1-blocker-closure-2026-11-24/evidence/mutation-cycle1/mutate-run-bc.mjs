// Copied from audits/v1-blocker-closure-2026-11-24/reviews/qre/probes/mutate-run-bc.mjs (QRE BC R1), with the cycle-1 mutants BC01 and BC02 added to M.
// QRE BC R1 mutation run over the blocker-closure candidate (6e85222): one mutant per new guard, in memory only (./mutate-hook.mjs, no
// file is edited). Tier 1 runs the focal file (test/v1bc-blocker-closure.test.mjs); a tier-1 survivor is re-run against the wider set
// (the five v1int files and the SC/O-1/F08 files) to see whether any existing test pins it.
// Run from a CoachingCore/ copy of 6e85222: node <this> [--only=ID,ID] [--jobs=4]
import {spawn} from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),hook=pathToFileURL(path.join(HERE,'mutate-hook.mjs')).href;
const M=[
 // C-O1-3 (r6-adaptation.mjs kindOf / voicedAdverse)
 ['A1','r6-adaptation.mjs',"[o.response,...Object.values(o.provenance?.parts&&typeof o.provenance.parts==='object'?o.provenance.parts:{}).map(p=>p?.response)]","[o.response]"],
 ['A2','r6-adaptation.mjs',"(r.recovery==='ADVERSE'||r.nextDayFunction==='IMPAIRED'));","(r.recovery==='ADVERSE'));"],
 ['A3','r6-adaptation.mjs',"(r.recovery==='ADVERSE'||r.nextDayFunction==='IMPAIRED'));","(r.nextDayFunction==='IMPAIRED'));"],
 ['A4','r6-adaptation.mjs',"const voicedAdverse=o=>o?.conflicted===true&&[","const voicedAdverse=o=>["],
 ['A5','r6-adaptation.mjs',"const kindOf=o=>voicedAdverse(o)?'ADVERSE':","const kindOf=o=>"],
 // SEC-SC-02 (r6-provenance.mjs partOf; v1-f08.mjs datedVoices/saidAfter)
 ['P1','r6-provenance.mjs',"...(seen?{observedAt:seen}:{})",""],
 ['F1','v1-f08.mjs',"at:typeof p?.observedAt==='string'?p.observedAt:o.observedAt","at:o.observedAt"],
 ['F2','v1-f08.mjs',"Date.parse(v.at??'')>t)","Date.parse(v.at??'')>=t)"],
 ['F3','v1-f08.mjs',"trainedAfter=!!readiness&&rows.some(o=>saidAfter(o,declaredAt,voiced(o)));","trainedAfter=!!readiness&&rows.some(o=>(voiced(o)||stopOnRecord(o))&&Date.parse(o.observedAt??'')>declaredAt);"],
 ['F4','v1-f08.mjs',"(done&&did(v.a)||stopped(v.a))","(stopped(v.a))"],
 ['F4b','v1-f08.mjs',"(done&&did(v.a)||stopped(v.a))","(did(v.a)||stopped(v.a))"],
 // SEC-SC-03 (v1-f08.mjs restart-day stop)
 ['F5','v1-f08.mjs',"if(facts.pause===null&&rows.some(o=>readiness?saidAfter(o,declaredAt,false):stopOnRecord(o)&&dayOfRow(o)===day))facts.pause={weeks:0,bySportDays:clone(byDays)};",""],
 ['F6','v1-f08.mjs',"stopOnRecord(o)&&dayOfRow(o)===day))facts.pause","stopOnRecord(o)))facts.pause"],
 ['F7','v1-f08.mjs',"rows.some(o=>readiness?saidAfter(o,declaredAt,false):","rows.some(o=>readiness?false:"],
 ['F8','v1-f08.mjs',"rows.some(o=>readiness?saidAfter(o,declaredAt,false):","rows.some(o=>readiness?stopOnRecord(o)&&dayOfRow(o)===day:"],
 ['F9','v1-f08.mjs',"facts.pause={weeks:0,bySportDays:clone(byDays)};","facts.pause={weeks:0,bySportDays:clone(byDays),readinessDeclared:true};"],
 // QRE-INT-02 (v1-run-format-index.mjs notDecided)
 ['R1','v1-run-format-index.mjs',"if(notDecided.length&&asOf){","if(false){"],
 ['R2','v1-run-format-index.mjs',"out.has(f.reportId)?(f.stop?stopOnly(f):null):f","out.has(f.reportId)?null:f"],
 ['R3','v1-run-format-index.mjs',"out.has(f.reportId)?(f.stop?stopOnly(f):null):f","f"],
 ['R4','v1-run-format-index.mjs',"list(p.mergedSourceIds).forEach(add);",""],
 ['R5','v1-run-format-index.mjs',"Object.keys(isObj(p.parts)?p.parts:{}).forEach(add);",""],
 ['R6','v1-run-format-index.mjs',"Object.keys(isObj(p.inputHashes)?p.inputHashes:{}).forEach(add);",""],
 ['R7','v1-run-format-index.mjs',"list(base.provenance?.excluded).forEach(x=>add(x?.eventId));",""],
 ['R8','v1-run-format-index.mjs',"if(!isObj(r)||r.fact)continue;add(r.eventId);","if(!isObj(r)||r.fact)continue;"],
 ['R9','v1-run-format-index.mjs',"list(Array.isArray(base.actualLedger)?base.actualLedger:input.actualLedger)","list(input.actualLedger)"],
 ['R10','v1-run-format-index.mjs',"add(r.eventId);const p=isObj(r.provenance)?r.provenance:{};list(p.mergedSourceIds).forEach(add);Object.keys(isObj(p.parts)?p.parts:{}).forEach(add);Object.keys(isObj(p.inputHashes)?p.inputHashes:{}).forEach(add);","add(r.eventId);"],
 ['R11','v1-run-format-index.mjs',"add(r.eventId);const p=isObj(r.provenance)?r.provenance:{};list(p.mergedSourceIds).forEach(add);Object.keys(isObj(p.parts)?p.parts:{}).forEach(add);","const p=isObj(r.provenance)?r.provenance:{};"],
 // SEC-INT-02R (custody.mjs evolves / sameReport)
 ['C1','custody.mjs',"||!sameReport(partsY[k],incoming.get(k))",""],
 ['C2','custody.mjs',"if([...new Set([...Object.keys(pr),...Object.keys(rr)])].some(k=>!RESPONSE_WORDS.includes(k)&&digest(pr[k])!==digest(rr[k])))return false;",""],
 ['C3','custody.mjs',"if(RESPONSE_WORDS.some(k=>(pr[k]??'UNKNOWN')!==(rr[k]??'UNKNOWN')))return false;",""],
 ['C4','custody.mjs',"if(!Object.hasOwn(ra,k)||digest(v)!==digest(ra[k]))return false;}","}"],
 ['C5','custody.mjs',"for(const [k,v] of Object.entries(ra))if(!Object.hasOwn(pa,k)&&!(k==='completionRead'||statesNothing(v)||k==='distanceKm'&&pa.manualDistanceKm===v))return false;",""],
 ['C6','custody.mjs',"if(pa.distanceKm!==undefined||ra.distanceKm!==v)return false;continue;","continue;"],
 ['C7','custody.mjs',"if([ax,...voices].some(a=>a.completed!==ay.completed))return false;",""],
 ['C8','custody.mjs',"CONFLICT_LABELS.includes(py.conflict)","typeof py.conflict==='string'"],
 ['C9','custody.mjs',"else if(ry[k]!==undefined&&ry[k]!=='UNKNOWN'?!added.some(a=>partsY[a]?.response?.[k]===ry[k]):added.some(a=>![undefined,'UNKNOWN'].includes(partsY[a]?.response?.[k])))return false;}","else if(ry[k]!==undefined&&ry[k]!=='UNKNOWN'&&!added.some(a=>partsY[a]?.response?.[k]===ry[k]))return false;}"],
 ['C10','custody.mjs',"const statesNothing=v=>v===undefined||v===null||v===0||","const statesNothing=v=>v===undefined||v===null||"],
 ['C11','custody.mjs',"!(k==='completionRead'||statesNothing(v)","!(statesNothing(v)"],
 // SEC-INT-06 (integration.mjs BEFORE_RECORD_START)
 ['I1','integration.mjs',"if(firstDay&&d&&d<firstDay)return","if(false)return"],
 ['I2','integration.mjs',"if(firstDay&&d&&d<firstDay)return","if(firstDay&&d&&d<=firstDay)return"],
 // SEC-INT-07 (integration.mjs safetyExcess; admission.mjs statesSafetySignal)
 ['I3','integration.mjs',"&&!(statesSafetySignal(o)&&depth<=MAX_CHAIN))","&&!(statesSafetySignal(o)))"],
 ['I4','integration.mjs',"&&!(statesSafetySignal(o)&&depth<=MAX_CHAIN))",")"],
 ['I5','integration.mjs',"&&!(statesSafetySignal(o)&&n<LIMITS.reportsPerDayPerChannel+LIMITS.safetyExcess))",")"],
 ['I6','integration.mjs',"&&n<LIMITS.reportsPerDayPerChannel+LIMITS.safetyExcess",""],
 ['I7','integration.mjs',"for(let n=0;n<=MAX_CHAIN+1&&succ.has(h);n++)","for(let n=0;n<=LIMITS.correctionsPerReport+1&&succ.has(h);n++)"],
 ['I8','integration.mjs',"x?.of&&d<=MAX_CHAIN;","x?.of&&d<=LIMITS.correctionsPerReport;"],
 ['S1','admission.mjs',"return present(a.stop)&&a.stop!==null&&a.stop!==false||","return "],
 ['S2','admission.mjs',"||r.recovery==='ADVERSE'||r.nextDayFunction==='IMPAIRED';};","||r.nextDayFunction==='IMPAIRED';};"],
 ['S3','admission.mjs',"||r.recovery==='ADVERSE'||r.nextDayFunction==='IMPAIRED';};","||r.recovery==='ADVERSE';};"],
 ['S4','admission.mjs',"safetyExcess:3,","safetyExcess:4,"],
 ['S5','admission.mjs',"export const statesSafetySignal=o=>{","export const statesSafetySignal=o=>{return false;"],
 // SSCTR-INT-R2-01, G07, SEC-INT-04 rest (integration.mjs)
 ['I9','integration.mjs',"warningSignScreen:op.loaded?.presentation?.readings?.warningSignScreen??null","warningSignScreen:null"],
 ['I10','integration.mjs',"const screen=op?.name==='eraseHealthFacts'?null:","const screen="],
 ['I11','integration.mjs',"eraseHealthFacts:args=>run(args?.actor,false,","eraseHealthFacts:args=>run(args?.actor,true,"],
 // Coverage of the by-design red tm-5 (v1int-authorship): the assertions after its now-failing line (the device states no screen) and before it
 // (the onboarding screen carried). QRE R2 mutants S04, S05, S03 re-run: killed only by a test green without the mutant.
 ['T1','integration.mjs',"if(Object.keys(rest).some(k=>rest[k]!==undefined))return fail('INVALID_REQUEST'","if(false)return fail('INVALID_REQUEST'"],
 ['T2','integration.mjs',"if(isObj(args.intake.athlete?.eligibility))op.screen=clone(args.intake.athlete.eligibility);return withScreen(custody.enroll(args));","return withScreen(custody.enroll(args));"],
 ['T3','integration.mjs',"const screen=channel===CHANNELS.DEVICE?(seen?seen.screen:op.loaded.screen):null;","const screen=channel===CHANNELS.DEVICE?op.loaded.screen:null;"],
 ["BC01","integration.mjs","    else if(!op.mutating&&['eraseHealthFacts','setConsent'].includes(op.name)&&typeof c.lastAt==='string'&&Date.parse(c.lastAt)>op.at)op.at=Date.parse(c.lastAt);}","}"],
 ["BC02","integration.mjs","a.duplicates.length&&op.loaded?.presentation?.readings&&(","a.duplicates.length&&("],
];
const FOCAL=['test/v1bc-blocker-closure.test.mjs'];
const WIDE=['test/v1int-authorship.test.mjs','test/v1int-custody.test.mjs','test/v1int-journeys.test.mjs','test/v1int-limits.test.mjs','test/v1int-cycle1.test.mjs','test/v1int-successor.test.mjs',
 'test/v1core-sc-safety-continuity.test.mjs','test/v1core-sc-successors.test.mjs','test/v1core-o1-conflict-evidence.test.mjs','test/v1core-o1-successors.test.mjs','test/v1cp-f08.test.mjs','test/v1core-restart.test.mjs','test/v1core-voices.test.mjs'];
const only=process.argv.find(a=>a.startsWith('--only='))?.slice(7).split(','),jobs=Number(process.argv.find(a=>a.startsWith('--jobs='))?.slice(7)??3);
function run(id,file,from,to,files){return new Promise(res=>{
 const mut=Buffer.from(JSON.stringify({file,from,to})).toString('base64');
 const c=spawn(process.execPath,['--import',hook,'--test','--test-skip-pattern=2000',...files],{env:{...process.env,MUT:mut}});let text='';
 c.stdout.on('data',d=>text+=d);c.stderr.on('data',d=>text+=d);
 c.on('close',()=>{const applied=!/MUTANT NOT APPLIED/.test(text),fail=Number((text.match(/ℹ fail (\d+)/)??[])[1]??NaN),pass=Number((text.match(/ℹ pass (\d+)/)??[])[1]??NaN);
  const failing=[...new Set([...text.matchAll(/^✖ (.+?) \(\d/mg)].map(m=>m[1]))].filter(t=>t!=='failing tests:');res({applied,pass,fail,failing});});});}
const out=[],queue=M.filter(([id])=>!only||only.includes(id));
// Baseline: the failing titles of each file set unmutated. A test red without the mutant (by design on this line) never counts as a kill.
const BASE={},noMut=files=>run('none','__none__.mjs','x','x',files);
for(const [k,files] of [['focal',FOCAL],['wide',WIDE]]){const r=await noMut(files);BASE[k]=new Set(r.failing);console.log('baseline',k,'pass',r.pass,'fail',r.fail,JSON.stringify([...BASE[k]]));}
const kills=(r,k)=>r.failing.filter(t=>!BASE[k].has(t));
async function worker(){for(let m=queue.shift();m;m=queue.shift()){const [id,file,from,to]=m;
 let r=await run(id,file,from,to,FOCAL),tier='focal',k=kills(r,'focal');
 if(r.applied&&!k.length){r=await run(id,file,from,to,WIDE);tier='wide';k=kills(r,'wide');}
 const line={id,file,tier,applied:r.applied,pass:r.pass,fail:r.fail,verdict:!r.applied?'NOT_APPLIED':k.length?'KILLED':'SURVIVED',killers:k.slice(0,4)};out.push(line);console.log(JSON.stringify(line));}}
await Promise.all(Array.from({length:jobs},worker));
out.sort((a,b)=>M.findIndex(m=>m[0]===a.id)-M.findIndex(m=>m[0]===b.id));
fs.writeFileSync(path.join(HERE,only?'mutation-bc-out-'+only.join('-')+'.json':'mutation-bc-out.json'),JSON.stringify(out,null,1)+'\n');
