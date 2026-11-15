// Directed mutation of the guards the evidence lineage fix-forward added (author's pass; the judges run their own). Each mutant is one edit of
// one source file, applied in a scratch copy of the code (never in the worktree), and the extension's own tests are run on it. The unmutated
// copy is run first (the control): the scratch copy holds only what these tests need, so the one test that reads the whole repository against
// the earlier freezes (I10, V6) fails there whatever the code is. A mutant is killed only by a test the control passes.
//   node mutation.mjs <CoachingCore to mutate a copy of> <new scratch dir> [workers] [only: a comma list of mutant ids]
// The scratch dir must not exist; one copy is made per worker inside it. Nothing is deleted.
import fs from 'node:fs';
import path from 'node:path';
import {spawn,execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),[src,scratch,workersArg,only]=process.argv.slice(2),workers=Number(workersArg)||4;
if(!src||!scratch||!scratch.includes('scratchpad'))throw new Error('usage: <CoachingCore> <new scratch dir> [workers] [ids]');
if(fs.existsSync(scratch))throw new Error('the scratch dir exists: choose a new name');
const F='src/v1-run-format.mjs',H='src/v1-run-history.mjs',I='src/v1-run-format-index.mjs';
const MUTANTS=[
 // ---- who a report speaks for ----
 ['M01','a named provider with no activity id is read as the athlete',F,`return own(quality)&&own(provider)?SPEAKER.ATHLETE:SPEAKER.UNIDENTIFIED;`,`return own(quality)?SPEAKER.ATHLETE:SPEAKER.UNIDENTIFIED;`],
 ['M02','a wearable source with no activity id is read as the athlete',F,`return own(quality)&&own(provider)?SPEAKER.ATHLETE:SPEAKER.UNIDENTIFIED;`,`return own(provider)?SPEAKER.ATHLETE:SPEAKER.UNIDENTIFIED;`],
 ['M03','an activity id on a report that states a manual source is an identified device',F,`return id!==null&&(quality===''||quality.startsWith('WEARABLE'))?`,`return id!==null?`],
 ['M04','two different activity ids are the first one',F,`x.length>0&&x===ids[0])?ids[0]:null;`,`x.length>0)?ids[0]:null;`],
 ['M05','the raw activity id is the speaker',F,`SPEAKER.DEVICE+hash(id).slice(0,32)`,`SPEAKER.DEVICE+id`],
 ['M06','a device that is not identified replaces its own reports',F,`const identified=s=>s===SPEAKER.ATHLETE||typeof s==='string'&&DEVICE_SPEAKER.test(s);`,`const identified=s=>typeof s==='string';`],
 // ---- the rule of the speaker ----
 ['M07','an applied correction replaces what any speaker said',F,`if(id!==c&&r.speaker===mine.speaker&&(above.has(id)||r.at<mine.at)`,`if(id!==c&&(above.has(id)||r.at<mine.at)`],
 ['M08','only the lineage is replaced, never an earlier report in no row',F,`(above.has(id)||r.at<mine.at)&&!replaced.has(id)`,`above.has(id)&&!replaced.has(id)`],
 ['M09','only an earlier report is replaced, never the lineage',F,`(above.has(id)||r.at<mine.at)&&!replaced.has(id)`,`r.at<mine.at&&!replaced.has(id)`],
 ['M10','a report recorded at the instant of the correction is replaced',F,`(above.has(id)||r.at<mine.at)&&!replaced.has(id)`,`(above.has(id)||r.at<=mine.at)&&!replaced.has(id)`],
 ['M11','a correction replaces itself',F,`if(id!==c&&r.speaker===mine.speaker`,`if(r.speaker===mine.speaker`],
 ['M12','a report the engine\'s record names with no fact is not in force',F,`const ids=new Set(named);let first=Infinity,whole=Infinity;`,`const ids=new Set();let first=Infinity,whole=Infinity;`],
 ['M13','the bound on a session is not applied',F,`if(bounded)for(const c of [...retiredBy.keys()].sort()){`,`for(const c of [...retiredBy.keys()].sort()){`],
 ['M14','a row may name any number of reports this record does not hold',F,`  if(named.size>LINEAGE_MAX)bounded=false;\n`,``],
 ['M15','a row the engine holds as replaced by nothing named is read as replaced',F,`if(o.superseded===true&&typeof o.supersededBy==='string'){const by=retiredBy.get(o.supersededBy)`,`if(typeof o.supersededBy==='string'){const by=retiredBy.get(o.supersededBy)`],
 ['M16','rows of another athlete are read',F,`for(const o of list(ledger)){if(!isObj(o)||o.fact||o.athleteId!==athleteId||typeof o.sessionId!=='string')continue;`,`for(const o of list(ledger)){if(!isObj(o)||o.fact||typeof o.sessionId!=='string')continue;`],
 ['M17','one id under two speakers keeps the first speaker',F,`else{if(g.speaker!==f.speaker)g.speaker=null;if(at<g.at)g.at=at;}`,`else{if(at<g.at)g.at=at;}`],
 ['M18','the stop of a report that was not recorded is a report in force',F,`  if(!f.standing)continue; // only the stop of a report that was itself not recorded\n`,``],
 ['M19','the stop-only fact stands',F,`export const stopOnly=f=>({...f,standing:false,`,`export const stopOnly=f=>({...f,`],
 // ---- the row and its reading ----
 ['M20','a report in force the row does not carry withholds nothing',F,`if(!has.has(id)){missing=true;const g=`,`if(!has.has(id)){const g=`],
 ['M21','past the bound nothing is withheld',F,`if(L&&!L.bounded){missing=true;if(L.wholeKm!==null)outside=L.wholeKm;}`,`if(L&&!L.bounded){if(L.wholeKm!==null)outside=L.wholeKm;}`],
 ['M22','the lineage word comes before the row\'s own reasons',F,`{withheld:several?'SEVERAL_RECORDINGS':corrected?'CORRECTED_MEASUREMENT':untimed?'DURATION_REQUIRED':disputed?'DISTANCE_DISPUTED':missing?'REPORT_NOT_CARRIED':`,`{withheld:missing?'REPORT_NOT_CARRIED':several?'SEVERAL_RECORDINGS':corrected?'CORRECTED_MEASUREMENT':untimed?'DURATION_REQUIRED':disputed?'DISTANCE_DISPUTED':`],
 ['M23','the reading is made without the reports of the row itself',F,` for(const id of carried){\n  const g=facts.of(id,row.sessionId);if(!g)continue;`,` for(const id of []){\n  const g=facts.of(id,row.sessionId);if(!g)continue;`],
 // ---- L3, L4 ----
 ['M24','L4: a report outside the row lowers nothing',F,`if(g&&g.whole<outside)outside=g.whole;}}`,`}}`],
 ['M25','L4: the row\'s own reports always lower the reference',F,`const lowest=Math.min(outside,disputed?own:Infinity);`,`const lowest=Math.min(outside,own);`],
 ['M26','L4: a dispute inside the row lowers nothing',F,`const lowest=Math.min(outside,disputed?own:Infinity);`,`const lowest=outside;`],
 ['M27','L4: a measurement its device flagged is a value',F,`const usable=said.measuredKm!==null&&!said.devicePoor&&!said.implausible&&!said.untimed?said.measuredKm:null`,`const usable=said.measuredKm!==null&&!said.implausible&&!said.untimed?said.measuredKm:null`],
 ['M28','L4: a measurement with no duration is a value',F,`const usable=said.measuredKm!==null&&!said.devicePoor&&!said.implausible&&!said.untimed?said.measuredKm:null`,`const usable=said.measuredKm!==null&&!said.devicePoor&&!said.implausible?said.measuredKm:null`],
 ['M29','L4: a measurement that is a fault is a value',F,`const usable=said.measuredKm!==null&&!said.devicePoor&&!said.implausible&&!said.untimed?said.measuredKm:null`,`const usable=said.measuredKm!==null&&!said.devicePoor&&!said.untimed?said.measuredKm:null`],
 ['M30','L4: of a measurement and the athlete\'s figure, the measurement',F,`whole=usable!==null&&said.ownKm!==null?Math.min(usable,said.ownKm):usable??said.ownKm;`,`whole=usable??said.ownKm;`],
 ['M31','L3: the lister\'s first distance is read on a report that lists nothing',F,`if(f.several&&f.distanceKm!==null&&f.distanceKm<g.first)g.first=f.distanceKm;`,`if(f.distanceKm!==null&&f.distanceKm<g.first)g.first=f.distanceKm;`],
 ['H01','L3 is not applied',H,`said.firstKm!==null&&said.firstKm<f.firstKm?km(f.measuredKm-f.firstKm+said.firstKm):f.measuredKm;`,`false?km(f.measuredKm-f.firstKm+said.firstKm):f.measuredKm;`],
 ['H02','L3 lowers a run that lists no recording',H,`const measured=f.measuredKm!==null&&f.segments>0&&said&&`,`const measured=f.measuredKm!==null&&said&&`],
 ['H03','L3 can raise the reference',H,`said.firstKm!==null&&said.firstKm<f.firstKm?km(`,`said.firstKm!==null?km(`],
 ['H04','L4 is not applied',H,`return own!==null&&said&&said.wholeKm!==null&&said.wholeKm<own?said.wholeKm:own;`,`return own;`],
 ['H05','L4 gives a reference to a run that has none',H,`return own!==null&&said&&said.wholeKm!==null&&said.wholeKm<own?said.wholeKm:own;`,`return said&&said.wholeKm!==null&&(own===null||said.wholeKm<own)?said.wholeKm:own;`],
 ['H06','L4 can raise the reference',H,`return own!==null&&said&&said.wholeKm!==null&&said.wholeKm<own?said.wholeKm:own;`,`return own!==null&&said&&said.wholeKm!==null?said.wholeKm:own;`],
 ['H07','the word of the row whole stands only on a row with a distance',H,`const paceWithheld=!has?(WHOLE_ROW_WITHHELD.includes(told)?told:null):`,`const paceWithheld=!has?null:`],
 ['H08','the new word is no reason',H,`'DISTANCE_DISPUTED','REPORT_NOT_CARRIED','REPORTS_UNREADABLE']);\n/** The reasons that are of the row whole`,`'DISTANCE_DISPUTED','REPORTS_UNREADABLE']);\n/** The reasons that are of the row whole`],
 ['H09','L3 changes the measured distance a completion reads',H,`  firstKm:measuredKm!==null?a.distanceKm:null,said:`,`  firstKm:measuredKm!==null?a.distanceKm:null,measuredKm:measuredKm!==null&&reading&&num(reading.firstKm,0.01)&&reading.firstKm<a.distanceKm?km(measuredKm-a.distanceKm+reading.firstKm):measuredKm,said:`],
 // ---- the record ----
 ['M32','SEC-RWS-D-01: a row labelled as a format is never unreadable',F,`{if(!readableFormat(r,athleteId))unreadable.push(typeof r.eventId==='string'?r.eventId:null);continue;}`,`{continue;}`],
 ['M33','a fact row may carry any speaker',F,`  &&(r.speaker===SPEAKER.UNIDENTIFIED||identified(r.speaker))&&(!r.corrected||r.ownKm!==null)`,`  &&(!r.corrected||r.ownKm!==null)`],
 ['M34','a stop-only fact may carry a distance',F,`&&(r.standing===true||r.standing===false&&r.stop!==null&&r.distanceKm===null&&r.ownKm===null&&r.wholeKm===null&&!r.timed&&!r.several&&!r.corrected)`,`&&typeof r.standing==='boolean'`],
 ['M35','whether a report stands is not checked',F,`&&(r.standing===true||r.standing===false&&r.stop!==null&&r.distanceKm===null&&r.ownKm===null&&r.wholeKm===null&&!r.timed&&!r.several&&!r.corrected)`,``],
 ['M36','the whole-run figure of a fact is not bounded',F,`&&km(r.distanceKm)&&km(r.ownKm)&&km(r.wholeKm)&&typeof r.timed`,`&&km(r.distanceKm)&&km(r.ownKm)&&typeof r.timed`],
 ['M37','a report that states nothing leaves no fact',F,` const usable=said.measuredKm!==null`,` if(!stop&&!measured&&!said.lists&&said.ownKm===null)return null;\n const usable=said.measuredKm!==null`],
 ['M38','a format this module cannot read back is written',F,`if(readableFormat(row,athleteId))added.push(row);else notKept.push(id);`,`added.push(row);`],
 // ---- the entry point ----
 ['I01','the entry point reads the report facts without the engine\'s record',I,`const facts=readReportFacts(formats,athleteId,V,ledger),adm=`,`const facts=readReportFacts(formats,athleteId,V),adm=`],
 ['I02','the exported calibration reads the report facts without the engine\'s record',I,`facts=readReportFacts(runFormatRecord,input.program.athleteId,ext.values,input.ledger);`,`facts=readReportFacts(runFormatRecord,input.program.athleteId,ext.values);`],
 ['I03','a row with no distance is never withheld',I,`  if(!liveRun(o,athleteId))return o;\n  const why=distanceFacts(`,`  if(!liveRun(o,athleteId)||!('distanceKm' in o.actual))return o;\n  const why=distanceFacts(`],
 ['I04','the executions and the history read the word alone',I,`reportsOf=o=>reportsReading(o,facts,V),base=`,`reportsOf=o=>reportsReading(o,facts,V)?.withheld??null,base=`],
 ['I05','the calibration is handed the bare record',I,`  const why=distanceFacts(o.actual,V,{wearable:wearableRow(o),reports:reportsReading(o,facts,V)}).paceWithheld;if(!why)return o;`,`  const why=distanceFacts(o.actual,V,{wearable:wearableRow(o),reports:null}).paceWithheld;if(!why)return o;`],
 ['I06','a withheld row keeps its quality',I,`return {...o,actual:{...without(o.actual,['distanceKm']),gpsQuality:'POOR'}};`,`return {...o,actual:{...without(o.actual,['distanceKm'])}};`],
].filter(m=>!only||only.split(',').includes(m[0]));
for(const [id,,file,find] of MUTANTS)if(fs.readFileSync(path.join(src,file),'utf8').split(find).length!==2)throw new Error(id+': the text to mutate is not found exactly once');
fs.mkdirSync(scratch,{recursive:true});
const dirs=Array.from({length:Math.min(workers,MUTANTS.length)},(_,i)=>path.join(scratch,'w'+i));
for(const d of dirs)execFileSync(process.execPath,[path.join(here,'make-copy-of.mjs'),src,src,d],{stdio:'ignore'});
const tests=fs.readdirSync(path.join(src,'test')).filter(f=>/^v1rws-.*\.test\.mjs$/.test(f)).map(f=>'test/'+f);
const run=cwd=>new Promise(resolve=>{let out='';const p=spawn(process.execPath,['--test',...tests],{cwd});p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>out+=d);p.on('close',()=>resolve(out));});
const failing=out=>[...new Set([...out.matchAll(/^✖ (.+?) \(\d/gm)].map(x=>x[1]))];
// The control: the unmutated copy, run alone before any mutant. Its failures are the scratch copy's own and kill nothing.
const control=await run(path.join(dirs[0],'CoachingCore')),known=failing(control),tested=Number(control.match(/^ℹ tests (\d+)/m)?.[1]??-1);
const queue=[...MUTANTS],results=[];
await Promise.all(dirs.map(async d=>{
 const cc=path.join(d,'CoachingCore');
 for(let m;(m=queue.shift());){
  const [id,what,file,find,replace]=m,f=path.join(cc,file),original=fs.readFileSync(path.join(src,file),'utf8');
  fs.writeFileSync(f,original.replace(find,()=>replace));const out=await run(cc);fs.writeFileSync(f,original);
  const n=k=>Number(out.match(new RegExp('^ℹ '+k+' (\\d+)','m'))?.[1]??-1),by=failing(out).filter(name=>!known.includes(name));
  results.push({id,what,file,tests:n('tests'),ran:n('tests')===tested,killed:by.length>0,killedBy:by.length,first:by.slice(0,3).map(s=>s.slice(0,110))});
 }
}));
results.sort((a,b)=>a.id<b.id?-1:1);
console.log(JSON.stringify({control:{tests:tested,failsOnlyWhatTheScratchCopyCannotRun:known},mutants:results.length,killed:results.filter(r=>r.killed).length,survived:results.filter(r=>!r.killed).map(r=>r.id),notRun:results.filter(r=>!r.ran).map(r=>r.id),results},null,1));
