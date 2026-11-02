// P7-X5: the habitual late reporter of the Phase 6 judge's p6-x4, with every run done at F of its minutes (F = 1, 0.8, 0.6). Strength reported on
// its day and each week reviewed on day 6 (21:00); the week's runs reach the record on day 1 of the next week (07:00), after that review (LATE),
// or only Saturday's run is late (LATE_SAT); reference TIMELY: the same sessions reported on their own day. On F3 every LATE review reads HOLD
// either way for shortened runs; on F4 the late reports are unread by their week's review (first recorded after it). Compared per week: the run
// minutes the week holds before its review (what was prescribed), LATE F4 against LATE F3 and against TIMELY F4. Read-only; prints JSON.
import {RUNTIMES,client,live,programs,brief,runsFromDay} from './p7-lib.mjs';
const out={probe:'P7-X5 habitual late reporter with shortened runs',runtimes:Object.keys(RUNTIMES),paths:{},comparison:{}};
const minutes=s=>String(s??'').split('/').filter(Boolean).reduce((a,x)=>a+Number(x.split(':')[1]),0);
const runsOfWeek=(P,w)=>P.weeks[w]?P.weeks[w].sessions.filter(s=>s.sport==='RUN'&&live(s)).map(s=>`${s.role}:${s.prescription.durationMinutes}`).join('/'):null;
for(const [name,R] of Object.entries(RUNTIMES)){
 const H=R.H,PR=programs(H);
 for(const F of [1,0.8,0.6])for(const [prog,o] of Object.entries(PR))for(const mode of ['LATE','TIMELY','LATE_SAT']){
  const t=client(R,H.program(o)),N=t.p.weeks.length,log=[],executed=[];let late=[];
  const rep=s=>s.sport==='RUN'?H.obs(t.p,s,{minutes:Math.max(10,Math.round(s.prescription.durationMinutes*F))}):H.obs(t.p,s);
  const decide=(w,x,label)=>{const r=t.step(w,x);log.push({label,...brief(r)});return r;};
  for(let w=0;w<N;w++){
   const isLate=s=>s.sport==='RUN'&&(mode==='LATE'||mode==='LATE_SAT'&&s.day===6);
   for(let d=0;d<6;d++){
    if(d===1&&late.length){decide(w,{day:1,hour:'07:00:00',observations:late},`w${w} d1 late runs of w${w-1}`);late=[];}
    const ss=t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===d);if(!ss.length)continue;
    const now=ss.filter(s=>!isLate(s)),held=ss.filter(isLate);late.push(...held.map(rep));
    if(now.length)decide(w,{day:d,hour:'21:00:00',observations:now.map(rep)},`w${w} d${d}`);
   }
   const sat=t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6);late.push(...sat.filter(isLate).map(rep));
   executed.push(runsOfWeek(t.p,w));
   decide(w,{day:6,hour:'21:00:00',observations:sat.filter(s=>!isLate(s)).map(rep)},`w${w} review`);
  }
  out.paths[`${name} F=${F} ${prog} ${mode}`]={executed,minutes:executed.map(minutes),recorded:log.filter(x=>x.origin==='RECORDED').map(x=>x.label),notValid:log.filter(x=>x.validity!=='VALID').map(x=>`${x.label} ${x.status} ${x.question??''}`)};
 }
}
const names=Object.keys(RUNTIMES),OLD=names[0],NEW=names[names.length-1];
for(const F of [1,0.8,0.6])for(const prog of ['GEN','R10K']){
 const g=k=>out.paths[k];const lo=g(`${OLD} F=${F} ${prog} LATE`),ln=g(`${NEW} F=${F} ${prog} LATE`),tn=g(`${NEW} F=${F} ${prog} TIMELY`),so=g(`${OLD} F=${F} ${prog} LATE_SAT`),sn=g(`${NEW} F=${F} ${prog} LATE_SAT`);
 out.comparison[`F=${F} ${prog}`]={lateIdenticalOldNew:JSON.stringify(lo.executed)===JSON.stringify(ln.executed),lateSatIdenticalOldNew:JSON.stringify(so.executed)===JSON.stringify(sn.executed),
  weeksNewAboveTimely:ln.minutes.map((m,i)=>m>tn.minutes[i]?`w${i} ${ln.executed[i]} > ${tn.executed[i]}`:null).filter(Boolean),weeksNewAboveOld:ln.minutes.map((m,i)=>m>lo.minutes[i]?`w${i} ${ln.executed[i]} > ${lo.executed[i]}`:null).filter(Boolean),
  weeksNewDifferOld:ln.executed.map((x,i)=>x!==lo.executed[i]?`w${i} ${lo.executed[i]} -> ${x}`:null).filter(Boolean),recordedNew:ln.recorded.length,recordedOld:lo.recorded.length,notValidNew:ln.notValid.length,notValidOld:lo.notValid.length};
}
console.log(JSON.stringify(out,null,1));
