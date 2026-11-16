// P7: one unreadable row with a future instant in the record of answers: the revision stays in force and the athlete's REVOKE is refused.
import {H,P,thresholds,rev,out,formatBandOf} from './base.mjs';
const y=thresholds({through:10,answer:(w,look)=>look.paceRevision.offer&&w===9?{offerId:look.paceRevision.offer.offerId,response:'ACCEPT'}:null}),t=y.t;
out('P7.before',rev(y.looks[10]));
t.rev=[...t.rev,{recordedAt:'2099-01-01T00:00:00.000Z'}];
const r=t.step(10,1,'WEEKLY_REVIEW',{paceRevisionResponse:{offerId:'any',response:'REVOKE'}},'09:00');
out('P7.revoke-refused',{layer:r.runFormat.status,...rev(r),formatBand:formatBandOf(r,t,10),formatBand11:formatBandOf(r,t,11)});
// the same REVOKE without the junk row
const z=thresholds({through:10,answer:(w,look)=>look.paceRevision.offer&&w===9?{offerId:look.paceRevision.offer.offerId,response:'ACCEPT'}:null});
const ok=z.t.step(10,1,'WEEKLY_REVIEW',{paceRevisionResponse:{offerId:'any',response:'REVOKE'}},'09:00');
out('P7.control-revoke',{...rev(ok),formatBand11:formatBandOf(ok,z.t,11)});
