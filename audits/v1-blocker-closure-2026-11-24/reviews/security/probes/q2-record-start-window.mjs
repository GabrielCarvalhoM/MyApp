// SEC_BC_R1 probe q2 (SEC-INT-06): ways around BEFORE_RECORD_START and the per-day bound for unplanned athlete reports.
// (a) occurrenceDate in the future; (b) occurrenceDate in the window with observedAt before the record began; (c) no date at all;
// (d) the per-day bound with safety signals (8 plain + 3 signal + 1 refused).
// Usage: node q2-record-start-window.mjs <root containing CoachingCore>   (synthetic athlete only)
import {pathToFileURL} from 'node:url';
const root=process.argv[2];if(!root)throw new Error('usage: node q2-record-start-window.mjs <root>');
const {athlete,addDays,at}=await import(pathToFileURL(`${root}/CoachingCore/test/v1int-helpers.mjs`).href);
const code=r=>r.ok?'OK':r.error.code+(r.error.limit?':'+r.error.limit:'');
const bytes=t=>t.store.raw(t.id).length;
const t=athlete({id:'q2'});t.enroll();const run=t.sessions(0).find(s=>s.id==='w0-run-d1');const today=addDays(run.date,1);t.set(today,'20:00');
const {sessionId:_s,occurrenceDate:_o,...free}=t.form(run);
const one=(x,k=0)=>({...free,...x,actual:{completed:true,minutes:30+k,rpe:4}});
const out={};
{const b=bytes(t);let rec=0,ref={};for(let f=1;f<=20;f++){const r=t.weekly(today,Array.from({length:8},(_,k)=>one({occurrenceDate:addDays(today,f)},k)));if(r.ok)rec+=r.recorded.length;else ref[code(r)]=(ref[code(r)]??0)+1;}out.a_future={rec,ref,grew:bytes(t)-b};}
{const r=t.weekly(today,[one({occurrenceDate:today,observedAt:at(addDays(run.date,-40),'07:00')})]);out.b_observedBeforeStart=[code(r),r.recorded?.length];}
{const r=t.weekly(today,[one({})]);out.c_noDate=[code(r),r.recorded?.length];}
{const d=addDays(run.date,2);t.set(d,'21:00');const res=[];for(let k=0;k<12;k++){t.clock+=60e3;const sig=k>=8;const o={...free,occurrenceDate:d,actual:{completed:true,minutes:20+k},response:sig?{...free.response,recovery:'ADVERSE'}:free.response};res.push(code(t.weekly(d,[o])));}out.d_perDay=res.join(',');}
console.log(JSON.stringify(out));
