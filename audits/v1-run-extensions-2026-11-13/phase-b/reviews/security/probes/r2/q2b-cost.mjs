// R2 q2b: what the new reader of the record of formats adds to the cost of one review, against the layer below on the same record.
import {H,P,F,VAL,thresholds,out} from './base.mjs';
const work325=(w,s)=>s.role==='QUALITY'?{pace:330,rpe:7,workPace:325,actual:{measurement:'TRACK'}}:{pace:s.role==='LONG'?365:345,rpe:4};
const x=thresholds({opts:H.DEV,through:9,how:work325}),t=x.t,s=t.p.weeks[8].sessions.find(s=>s.sport==='RUN'&&s.role==='QUALITY');
const last=t.fmt.filter(r=>r.fact==='RUN_FORMAT_EMITTED'&&r.sessionId===s.id).at(-1);
const strip=rv=>Object.fromEntries(Object.entries(rv).filter(([k])=>!['paceRevisionRecord','paceRevisionResponse'].includes(k)));
const time=f=>{let best=1e9;for(let i=0;i<2;i++){const a=performance.now();f();best=Math.min(best,performance.now()-a);}return Math.round(best);};
for(const n of [0,5000,20000]){
 // same session, distinct instants: rows the layer below refuses (eventId not its key) and rows it reads (duplicates of its own key)
 const refused=Array.from({length:n},(_,i)=>({...last,recordedAt:new Date(Date.parse(last.recordedAt)-i*1000).toISOString(),eventId:last.eventId+'#'+i}));
 const readable=Array.from({length:n},(_,i)=>({...last,recordedAt:new Date(Date.parse(last.recordedAt)-i*1000).toISOString()}));
 const rv=t.review(9,1,'WEEKLY_REVIEW',{},'08:00');
 const res={};
 for(const [k,rows] of [['refused',refused],['readable',readable]]){
  const fmt=[...t.fmt,...rows];
  res[k]={below:time(()=>F.evaluateProgram(t.p,{...strip(rv),runFormatRecord:fmt},H.DEV)),insightsOff:time(()=>P.evaluateProgram(t.p,{...rv,runFormatRecord:fmt},H.FORECAST_OFF)),insightsOn:time(()=>P.evaluateProgram(t.p,{...rv,runFormatRecord:fmt},H.DEV))};
 }
 out('q2b.rows'+n,res);
}
