// P1: the record of answers. Forgery (recomputed unkeyed seal), backdating, an unreadable or dropped REVOKE, reordering.
import {H,P,thresholds,forgeRow,rev,out,formatBandOf,QUALITY} from './base.mjs';
const T0=Date.now();
// Control: offer at week 9, nobody answers; weeks 9 and 10 reported; look at week 11.
const ctl=thresholds({through:11});
const offer9=ctl.looks[9].paceRevision.offer;
out('P1.control.w9',{status:ctl.looks[9].paceRevision.status,offerId:offer9?.offerId,effectiveFrom:offer9?.effectiveFrom});
out('P1.control.w11',rev(ctl.looks[11]));
const ids={athleteId:ctl.t.p.athleteId,planId:ctl.t.p.id};
// (a) Backdated acceptance: in week 11 the client adds, by itself, a row dated in week 9 accepting the expired week-9 offer.
{
 const x=thresholds({through:11});
 x.t.rev=[forgeRow({...ids,offerId:offer9.offerId,response:'ACCEPT',recordedAt:'2027-03-09T12:00:00.000Z'})];
 const r=x.t.look(11,2);
 out('P1a.backdated.w11',{...rev(r),formatBand:formatBandOf(r,x.t,11)});
}
// (b) A revision accepted (module path) and revoked (module path), then the REVOKE row is made unreadable / dropped.
const accept=(w,look)=>look.paceRevision.offer&&w===9?{offerId:look.paceRevision.offer.offerId,response:'ACCEPT'}:null;
{
 const y=thresholds({through:11,answer:(w,look)=>accept(w,look)??(w===10?{offerId:'x',response:'REVOKE'}:null)});
 out('P1b.revoked.w11',rev(y.looks[11]));
 const rows=y.t.rev;out('P1b.rows',rows.map(o=>o.response.response+'@'+o.recordedAt));
 // b1: REVOKE row's seal damaged
 y.t.rev=rows.map(o=>o.response.response==='REVOKE'?{...o,inputHash:'0'.repeat(64)}:o);
 const r1=y.t.look(11,2);out('P1b1.revoke-unreadable.w11',{...rev(r1),formatBand:formatBandOf(r1,y.t,11)});
 // b2: REVOKE row dropped (truncation)
 y.t.rev=rows.filter(o=>o.response.response!=='REVOKE');
 const r2=y.t.look(11,3);out('P1b2.revoke-dropped.w11',{...rev(r2),formatBand:formatBandOf(r2,y.t,11)});
 // b3: REVOKE row with an extra key (shape no longer exactly the row keys)
 y.t.rev=rows.map(o=>o.response.response==='REVOKE'?{...o,note:'x'}:o);
 const r3=y.t.look(11,4);out('P1b3.revoke-extra-key.w11',rev(r3));
}
// (c) Reordering: two forged answers to the week-9 offer on the same day; only their order in the array differs.
{
 const at='2027-03-09T12:00:00.000Z',acc=forgeRow({...ids,offerId:offer9.offerId,response:'ACCEPT',recordedAt:at}),dec=forgeRow({...ids,offerId:offer9.offerId,response:'DECLINE',recordedAt:at});
 const a=thresholds({through:11});a.t.rev=[acc,dec];out('P1c.accept-then-decline.w11',rev(a.t.look(11,2)));
 const b=thresholds({through:11});b.t.rev=[dec,acc];out('P1c.decline-then-accept.w11',rev(b.t.look(11,2)));
 // later instant first: DECLINE at 18:00, ACCEPT at 08:00 the same local day, DECLINE listed first
 const dec2=forgeRow({...ids,offerId:offer9.offerId,response:'DECLINE',recordedAt:'2027-03-09T21:00:00.000Z'}),acc2=forgeRow({...ids,offerId:offer9.offerId,response:'ACCEPT',recordedAt:'2027-03-09T11:00:00.000Z'});
 const c=thresholds({through:11});c.t.rev=[dec2,acc2];out('P1c.later-decline-listed-first.w11',rev(c.t.look(11,2)));
}
// (d) A row for another athlete and a row for another plan: never read as an answer.
{
 const d=thresholds({through:11});d.t.rev=[forgeRow({...ids,athleteId:'someone-else',offerId:offer9.offerId,response:'ACCEPT',recordedAt:'2027-03-09T12:00:00.000Z'}),forgeRow({...ids,planId:'other-plan',offerId:offer9.offerId,response:'ACCEPT',recordedAt:'2027-03-09T12:00:00.000Z'})];
 out('P1d.other-athlete-and-plan.w11',rev(d.t.look(11,2)));
}
out('P1.ms',Date.now()-T0);
