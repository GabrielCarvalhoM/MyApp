// Directed mutation of the QRE-RWS-E-01 patch (author's pass; the judges run their own). Each mutant is one edit of one source file, applied in
// a scratch copy of the code (never in the worktree), and the extension's own tests are run on it. The unmutated copy is run first (the
// control): the scratch copy holds only what these tests need, so the one test that reads the whole repository against the earlier freezes
// (I10, V6) fails there whatever the code is. A mutant is killed only by a test the control passes.
//   node mutation.mjs <CoachingCore to mutate a copy of> <make-copy-of.mjs> <new scratch dir> [workers]
// The scratch dir must not exist; one copy is made per worker inside it. Nothing is deleted.
import fs from 'node:fs';
import path from 'node:path';
import {spawn,execFileSync} from 'node:child_process';
const [src,copier,scratch,workersArg]=process.argv.slice(2),workers=Number(workersArg)||4;
if(!src||!copier||!scratch||!scratch.includes('scratchpad'))throw new Error('usage: <CoachingCore> <make-copy-of.mjs> <new scratch dir> [workers]');
if(fs.existsSync(scratch))throw new Error('the scratch dir exists: choose a new name');
const F='src/v1-run-format.mjs',H='src/v1-run-history.mjs',I='src/v1-run-format-index.mjs';
const OF_ROW=`const ofRow=[reading?.wholeRow,told].find(w=>WHOLE_ROW_WITHHELD.includes(w))??null;`,NO_DISTANCE=`const paceWithheld=!has?ofRow:several?`,WHOLE=`wholeRow=missing?'REPORT_NOT_CARRIED':facts.unreadable.length?'REPORTS_UNREADABLE':null;`,WORD=`:disputed?'DISTANCE_DISPUTED':wholeRow,wholeRow,`;
const MUTANTS=[
 // ---- the reader of the row (v1-run-history.mjs distanceFacts) ----
 ['E01','the frozen line: a row with no distance is withheld by the one word alone (QRE-RWS-E-01 reopened)',H,NO_DISTANCE,`const paceWithheld=!has?(WHOLE_ROW_WITHHELD.includes(told)?told:null):several?`],
 ['E02','a row with no distance is never withheld',H,NO_DISTANCE,`const paceWithheld=!has?null:several?`],
 ['E03','the reason of the row is read from the reading only, never from the word',H,OF_ROW,`const ofRow=[reading?.wholeRow].find(w=>WHOLE_ROW_WITHHELD.includes(w))??null;`],
 ['E04','the reason of the row is read from the word only (the new key is ignored)',H,OF_ROW,`const ofRow=[told].find(w=>WHOLE_ROW_WITHHELD.includes(w))??null;`],
 ['E05','whatever the reading gives as the reason of the row is taken, listed or not',H,OF_ROW,`const ofRow=reading?.wholeRow??([told].find(w=>WHOLE_ROW_WITHHELD.includes(w))??null);`],
 ['E06','a reason of the distance given as the reason of the row withholds a row with no distance',H,OF_ROW,`const ofRow=[reading?.wholeRow,told].find(w=>PACE_WITHHELD.includes(w))??null;`],
 ['E07','on a row with a distance the reason of the row comes first (the word shown changes)',H,`const paceWithheld=!has?ofRow:several?`,`const paceWithheld=!has||ofRow?ofRow:several?`],
 ['E08','on a row with a distance a reading that gives only the reason of the row withholds nothing',H,`:disputed?'DISTANCE_DISPUTED':told??ofRow;`,`:disputed?'DISTANCE_DISPUTED':told;`],
 ['E09','a row with no distance is withheld by any word, a reason of the distance too (legitimate evidence lost)',H,NO_DISTANCE,`const paceWithheld=!has?(ofRow??told):several?`],
 // ---- the reading (v1-run-format.mjs reportsReading) ----
 ['E10','the reading gives no reason of the row apart',F,WORD,`:disputed?'DISTANCE_DISPUTED':wholeRow,wholeRow:null,`],
 ['E11','the reason of the row apart is only the report not carried (an unreadable record is hidden again)',F,WORD,`:disputed?'DISTANCE_DISPUTED':wholeRow,wholeRow:missing?'REPORT_NOT_CARRIED':null,`],
 ['E12','the reason of the row apart is only the unreadable record (a report not carried is hidden again)',F,WORD,`:disputed?'DISTANCE_DISPUTED':wholeRow,wholeRow:facts.unreadable.length?'REPORTS_UNREADABLE':null,`],
 ['E13','the one word names the reason of the row first (the precedence of the word changes)',F,`return {withheld:several?'SEVERAL_RECORDINGS':corrected?'CORRECTED_MEASUREMENT':untimed?'DURATION_REQUIRED':disputed?'DISTANCE_DISPUTED':wholeRow,wholeRow,`,`return {withheld:wholeRow??(several?'SEVERAL_RECORDINGS':corrected?'CORRECTED_MEASUREMENT':untimed?'DURATION_REQUIRED':disputed?'DISTANCE_DISPUTED':null),wholeRow,`],
 ['E14','the unreadable record comes before the report not carried',F,WHOLE,`wholeRow=facts.unreadable.length?'REPORTS_UNREADABLE':missing?'REPORT_NOT_CARRIED':null;`],
 ['E15','the reason of the row apart is given only when the word is not a reason of the distance (the masking again)',F,WORD,`:disputed?'DISTANCE_DISPUTED':wholeRow,wholeRow:several||corrected||untimed||disputed?null:wholeRow,`],
 ['E16','a report not carried is no reason at all',F,WHOLE,`wholeRow=facts.unreadable.length?'REPORTS_UNREADABLE':null;`],
 // ---- the readers that take the reading (v1-run-format-index.mjs): each handed the one word alone ----
 ['E17','the admission is handed the one word alone',I,`  const why=distanceFacts(o.actual,V,{wearable:wearableRow(o),reports:reportsReading(o,facts,V)}).paceWithheld;if(!why)return o;`,`  const why=distanceFacts(o.actual,V,{wearable:wearableRow(o),reports:reportsReading(o,facts,V)?.withheld??null}).paceWithheld;if(!why)return o;`],
 ['E18','the executions and the history are handed the one word alone',I,`reportsOf=o=>reportsReading(o,facts,V),base=`,`reportsOf=o=>reportsReading(o,facts,V)?.withheld??null,base=`],
 ['E19','a withheld row with no distance is handed over unmarked',I,`return {...o,actual:{...without(o.actual,['distanceKm']),gpsQuality:'POOR'}};`,`return 'distanceKm' in o.actual?{...o,actual:{...without(o.actual,['distanceKm']),gpsQuality:'POOR'}}:o;`],
];
for(const [id,,file,find] of MUTANTS)if(fs.readFileSync(path.join(src,file),'utf8').split(find).length!==2)throw new Error(id+': the text to mutate is not found exactly once');
fs.mkdirSync(scratch,{recursive:true});
const dirs=Array.from({length:Math.min(workers,MUTANTS.length)},(_,i)=>path.join(scratch,'w'+i));
for(const d of dirs)execFileSync(process.execPath,[copier,src,src,d],{stdio:'ignore'});
const tests=fs.readdirSync(path.join(src,'test')).filter(f=>/^v1rws-.*\.test\.mjs$/.test(f)).map(f=>'test/'+f);
const run=cwd=>new Promise(resolve=>{let out='';const p=spawn(process.execPath,['--test',...tests],{cwd});p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>out+=d);p.on('close',()=>resolve(out));});
const failing=out=>[...new Set([...out.matchAll(/^✖ (.+?) \(\d/gm)].map(x=>x[1]))];
// The control: the unmutated copy, run alone before any mutant. Its failures are the scratch copy's own and kill nothing.
const control=await run(path.join(dirs[0],'CoachingCore')),known=failing(control),tested=Number(control.match(/^ℹ tests (\d+)/m)?.[1]??-1),passed=Number(control.match(/^ℹ pass (\d+)/m)?.[1]??-1);
const queue=[...MUTANTS],results=[],E01=name=>/E-01/.test(name);
await Promise.all(dirs.map(async d=>{
 const cc=path.join(d,'CoachingCore');
 for(let m;(m=queue.shift());){
  const [id,what,file,find,replace]=m,f=path.join(cc,file),original=fs.readFileSync(path.join(src,file),'utf8');
  fs.writeFileSync(f,original.replace(find,()=>replace));const out=await run(cc);fs.writeFileSync(f,original);
  const n=k=>Number(out.match(new RegExp('^ℹ '+k+' (\\d+)','m'))?.[1]??-1),by=failing(out).filter(name=>!known.includes(name));
  results.push({id,what,file,tests:n('tests'),ran:n('tests')===tested,killed:by.length>0,killedBy:by.length,byTheNewFile:by.filter(E01).length,byEarlierFiles:by.filter(x=>!E01(x)).length,first:by.slice(0,3).map(s=>s.slice(0,110))});
 }
}));
results.sort((a,b)=>a.id<b.id?-1:1);
console.log(JSON.stringify({control:{tests:tested,passed,failsOnlyWhatTheScratchCopyCannotRun:known},mutants:results.length,killed:results.filter(r=>r.killed).length,survived:results.filter(r=>!r.killed).map(r=>r.id),notRun:results.filter(r=>!r.ran).map(r=>r.id),results},null,1));
