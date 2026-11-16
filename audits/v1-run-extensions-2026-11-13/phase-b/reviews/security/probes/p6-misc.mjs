// P6: (a) a review whose weekIndex lags its instant: the answer is recorded and then never counts; (b) cost when the revision is in force
// (the layer below answered twice); (c) revoke then accept the same offer in one week.
import {H,P,F,thresholds,forgeRow,rev,out,formatBandOf} from './base.mjs';
const x=thresholds({through:10}),t=x.t,offer=x.looks[9].paceRevision.offer;
const lag=P.evaluateProgram(t.p,{...t.review(10,2,'WEEKLY_REVIEW',{weekIndex:9},'09:00'),paceRevisionResponse:{offerId:offer.offerId,response:'ACCEPT'}},H.DEV_REVISION);
out('P6a.weekIndex-lags',{engine:lag.status,layer:lag.runFormat.status,week:lag.runFormat.week,...rev(lag),stored:lag.paceRevisionRecord.map(o=>o.recordedAt)});
if(lag.paceRevisionRecord.length){t.rev=lag.paceRevisionRecord;const r=t.look(11);out('P6a.next-week',rev(r));}
// (b) cost with a revision in force (accepted week 9, read in week 10)
const y=thresholds({through:10,answer:(w,look)=>look.paceRevision.offer&&w===9?{offerId:look.paceRevision.offer.offerId,response:'ACCEPT'}:null});
const rv=y.t.review(10,1,'WEEKLY_REVIEW',{},'09:00'),plain=Object.fromEntries(Object.entries(rv).filter(([k])=>!['paceRevisionRecord','paceRevisionResponse'].includes(k)));
const tm=f=>{let best=1e9,r;for(let i=0;i<3;i++){const a=performance.now();r=f();best=Math.min(best,performance.now()-a);}return [Math.round(best),r];};
const [b]=tm(()=>F.evaluateProgram(y.t.p,plain,H.DEV)),[o,ro]=tm(()=>P.evaluateProgram(y.t.p,rv,H.DEV_REVISION)),[n]=tm(()=>P.evaluateProgram(y.t.p,{...rv,paceRevisionRecord:[]},H.DEV_REVISION));
out('P6b.cost-in-force',{belowMs:b,revisionInForceMs:o,revisionOnNothingInForceMs:n,status:ro.paceRevision.status,fb:formatBandOf(ro,y.t,10)});
// (c) a revision in force; an offer of the week open? revoke, then accept that offer, the same week.
const w11=thresholds({through:15,answer:(w,look)=>look.paceRevision.offer&&w===9?{offerId:look.paceRevision.offer.offerId,response:'ACCEPT'}:null});
for(const w of [11,12,13,14,15])out('P6c.week'+w,{...rev(w11.looks[w]),offer:w11.looks[w].paceRevision.offer?.stepFraction??null});
const open=[11,12,13,14,15].find(w=>w11.looks[w].paceRevision.offer&&w11.looks[w].paceRevision.status==='ACTIVE');
if(open!==undefined){
 // rebuild to that week and answer REVOKE then ACCEPT
 const z=thresholds({through:open,answer:(w,look)=>look.paceRevision.offer&&w===9?{offerId:look.paceRevision.offer.offerId,response:'ACCEPT'}:null}),of=z.looks[open].paceRevision.offer;
 const r1=z.t.step(open,1,'WEEKLY_REVIEW',{paceRevisionResponse:{offerId:'r',response:'REVOKE'}},'09:00');out('P6c.revoke',{...rev(r1),offerOpen:r1.paceRevision.offer?.offerId===of.offerId});
 const r2=z.t.step(open,2,'WEEKLY_REVIEW',{paceRevisionResponse:{offerId:of.offerId,response:'ACCEPT'}},'09:00');out('P6c.accept-after-revoke',rev(r2));
}
