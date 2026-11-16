// P2: ending signals. (a) an offer stays open, and can be accepted, after a session harder than the cue or an adverse response in its own week;
// (b) an end by a warning-sign screen or a clinical route is not durable: once answered, the revision is in force again.
import {H,P,thresholds,rev,out,formatBandOf,qualityOf,QUALITY} from './base.mjs';
const T0=Date.now();
function inWeekSignal(label,obs){
 const x=thresholds({through:9}),t=x.t,offer=x.looks[9].paceRevision.offer,q=qualityOf(t,9),d=H.dayGap?null:null;
 const qd=Math.round((Date.parse(q.date)-Date.parse(t.day(9,0)))/86400000);
 // The threshold session of week 9 is reported on its own day, harder than the cue (or with an adverse recovery).
 const r1=t.step(9,qd,'WEEKLY_REVIEW',{observations:[H.report(t.p,q,obs)]},'20:00');
 out(label+'.after-signal',{qualityDay:q.date,...rev(r1),offerStillOpen:r1.paceRevision.offer?.offerId===offer.offerId,insight:r1.paceInsights?.domains?.THRESHOLD_CONTROLLED?.state});
 // The next day, the athlete (or the client) accepts the offer of the week.
 const r2=t.step(9,qd+1,'WEEKLY_REVIEW',{paceRevisionResponse:{offerId:offer.offerId,response:'ACCEPT'}},'20:00');
 out(label+'.accept',rev(r2));
 // The rest of week 9 reported as usual (not the threshold session again), then week 10 looked at.
 t.step(9,6,'WEEKLY_REVIEW',{observations:t.p.weeks[9].sessions.filter(H.live).filter(s=>s.id!==q.id).map(s=>H.report(t.p,s,s.sport==='RUN'?QUALITY(9,s):{}))});
 const r3=t.look(10);out(label+'.w10',{...rev(r3),formatBand:formatBandOf(r3,t,10),history:r3.paceRevision.history?.ends});
}
inWeekSignal('P2a.harder',{pace:330,rpe:9,workPace:268,actual:{measurement:'TRACK'}});
inWeekSignal('P2a.adverse',{pace:330,rpe:7,workPace:268,actual:{measurement:'TRACK'},response:{recovery:'ADVERSE'}});
// Control: the same harder session AFTER the acceptance ends it (the author's test shape, within week 9).
{
 const x=thresholds({through:9}),t=x.t,offer=x.looks[9].paceRevision.offer,q=qualityOf(t,9),qd=Math.round((Date.parse(q.date)-Date.parse(t.day(9,0)))/86400000);
 t.step(9,0,'WEEKLY_REVIEW',{paceRevisionResponse:{offerId:offer.offerId,response:'ACCEPT'}},'09:00');
 const r1=t.step(9,qd,'WEEKLY_REVIEW',{observations:[H.report(t.p,q,{pace:330,rpe:9,workPace:268,actual:{measurement:'TRACK'}})]},'20:00');
 out('P2a.control.accept-then-harder',rev(r1));
}
// (b) durability of an end by the screen / a clinical route.
function screen(label,signal){
 const x=thresholds({through:10,answer:(w,look)=>look.paceRevision.offer&&w===9?{offerId:look.paceRevision.offer.offerId,response:'ACCEPT'}:null}),t=x.t;
 out(label+'.w10.before',{...rev(x.looks[10]),formatBand:formatBandOf(x.looks[10],t,10)});
 const r1=signal(t);out(label+'.signal',{engine:r1.status,screen:r1.runFormat?.warningSignScreen?.status,...rev(r1),forecastStatus:r1.runForecast?.status,insights:r1.paceInsights?.status});
 const r2=t.step(10,4,'WEEKLY_REVIEW',{eligibility:H.ELIG(t.day(10,4))},'20:00');
 out(label+'.answered',{engine:r2.status,screen:r2.runFormat?.warningSignScreen?.status,...rev(r2),formatBand:formatBandOf(r2,t,10),ends:r2.paceRevision.history?.ends});
 const r3=t.look(11);out(label+'.w11',{...rev(r3),formatBand:formatBandOf(r3,t,11)});
}
screen('P2b.symptom-stop',t=>{const s=t.p.weeks[10].sessions.find(s=>s.sport==='RUN'&&s.role!=='QUALITY'&&H.live(s));const d=Math.round((Date.parse(s.date)-Date.parse(t.day(10,0)))/86400000);return t.step(10,d,'WEEKLY_REVIEW',{observations:[H.report(t.p,s,{pace:345,rpe:4,completed:false,actual:{minutes:20,stop:{reason:'SYMPTOM'}}})]},'21:00');});
screen('P2b.clinical',t=>t.step(10,2,'WEEKLY_REVIEW',{eligibility:H.ELIG(t.day(10,2),{pain:true})},'20:00'));
out('P2.ms',Date.now()-T0);
