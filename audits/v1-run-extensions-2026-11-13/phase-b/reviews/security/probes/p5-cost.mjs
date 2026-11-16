// P5: cost of one review, with the revision on and off, by week of the plan and by size of the record of answers.
import {H,P,F,thresholds,forgeRow,rev,out} from './base.mjs';
const x=thresholds({through:15}),t=x.t,ids={athleteId:t.p.athleteId,planId:t.p.id};
const time=(f,n=3)=>{const ms=[];let r;for(let i=0;i<n;i++){const a=performance.now();r=f();ms.push(performance.now()-a);}return {ms:Math.round(Math.min(...ms)),r};};
for(const w of [3,9,15]){
 const rv=t.review(w,6,'WEEKLY_REVIEW',{weekIndex:w},'21:00');
 const plain=Object.fromEntries(Object.entries(rv).filter(([k])=>!['paceRevisionRecord','paceRevisionResponse'].includes(k)));
 const below=time(()=>F.evaluateProgram(t.p,plain,H.DEV)),off=time(()=>P.evaluateProgram(t.p,rv,H.FORECAST_OFF)),fi=time(()=>P.evaluateProgram(t.p,rv,H.DEV)),on=time(()=>P.evaluateProgram(t.p,rv,H.DEV_REVISION));
 // a forged answer dated in week 0 makes the revision read from week 0
 const early=[forgeRow({...ids,offerId:'f'.repeat(64),response:'ACCEPT',recordedAt:'2027-01-05T12:00:00.000Z'})];
 const on0=time(()=>P.evaluateProgram(t.p,{...rv,paceRevisionRecord:early},H.DEV_REVISION));
 out('P5.week'+w,{belowMs:below.ms,forecastOffMs:off.ms,forecastAndInsightsMs:fi.ms,revisionOnMs:on.ms,revisionFromWeek0Ms:on0.ms,ledger:t.ledger.length,fmt:t.fmt.length,status:on.r.paceRevision.status});
}
const rv=t.review(15,6,'WEEKLY_REVIEW',{weekIndex:15},'21:00');
for(const n of [1000,10000,50000]){
 const readable=Array.from({length:n},(_,i)=>forgeRow({...ids,offerId:'o'+i,response:'DECLINE',recordedAt:'2027-01-05T12:00:00.000Z'}));
 const unreadable=Array.from({length:n},(_,i)=>({eventId:'u'+i}));
 const a=time(()=>P.evaluateProgram(t.p,{...rv,paceRevisionRecord:readable},H.DEV_REVISION),1),b=time(()=>P.evaluateProgram(t.p,{...rv,paceRevisionRecord:unreadable},H.DEV_REVISION),1);
 const c=time(()=>P.evaluateProgram(t.p,{...rv,paceRevisionRecord:readable},H.DEV),1);
 out('P5.records'+n,{readableMs:a.ms,unreadableMs:b.ms,revisionOffReadableMs:c.ms,ignored:a.r.paceRevision.history?.ignored?.length,unreadableListed:b.r.paceRevision.unreadableResponses?.length,returned:a.r.paceRevisionRecord.length});
}
