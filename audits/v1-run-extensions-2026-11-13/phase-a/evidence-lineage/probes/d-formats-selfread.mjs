// Diagnosis probe (read-only): does the entry point ever write a format row its own reader refuses? (Needed before a row labelled as a format
// that cannot be read is made to fail closed, SEC-RWS-D-01: an honest record must never lock itself.)
// Usage: node d-formats-selfread.mjs <CoachingCore dir>
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const root=process.argv[2],imp=f=>import(pathToFileURL(path.join(root,f)).href);
const H=await imp('test/v1rws-helpers.mjs'),RF=await imp('src/v1-run-format.mjs');
const {atSixteen,timeline,raceTen,weekWith}=H;
let rows=0,unreadable=0,reviews=0;
for(const make of [()=>atSixteen(),()=>{const t=timeline(raceTen());t.week(0,()=>({pace:330,rpe:4}));return t;}]){
 const t=make();
 for(let w=1;w<Math.min(t.p.weeks.length,11);w++){const r=t.week(w,weekWith(t,w,null,null));reviews++;
  const fr=RF.readFormatRecord(t.fmt,t.p.athleteId);unreadable+=fr.unreadable.length+(r.runFormat?.unreadableFormats?.length??0);rows=t.fmt.filter(x=>x.fact===RF.RUN_FORMAT_EMITTED).length;
  const round=RF.readFormatRecord(JSON.parse(JSON.stringify(t.fmt)),t.p.athleteId);unreadable+=round.unreadable.length;}
}
console.log(JSON.stringify({reviews,formatRowsInLastRecord:rows,unreadableFormatRowsSeen:unreadable}));
