// R2 q4: with V1X-PACE-REVISION off (forecast and insights on), the R1 revision findings are unreachable; and what turns the revision on.
import {H,P,RF,thresholds,forgeRow,rev,out,formatBandOf} from './base.mjs';
// The R1 scenarios, under the forecast and insights only (H.DEV): a backdated forged ACCEPT, a damaged REVOKE, a junk future row, an in-week accept.
const on=thresholds({through:9});const offer=on.looks[9].paceRevision.offer;
const x=thresholds({opts:H.DEV,through:11}),t=x.t,ids={athleteId:t.p.athleteId,planId:t.p.id};
const ctl=t.look(11,2);
const acc=forgeRow({...ids,offerId:offer.offerId,response:'ACCEPT',recordedAt:'2027-03-09T12:00:00.000Z'}),rvk=forgeRow({...ids,offerId:'x',response:'REVOKE',recordedAt:'2027-03-16T12:00:00.000Z'});
const cases={backdated:[acc],damagedRevoke:[acc,{...rvk,inputHash:'0'.repeat(64)}],junkFuture:[acc,{recordedAt:'2099-01-01T00:00:00.000Z'}]};
for(const [k,rec] of Object.entries(cases)){t.rev=rec;const r=t.look(11,3);out('q4.off.'+k,{...rev(r),formatBand:formatBandOf(r,t,11),sameSessionsAsNoRecord:H.hash(r.runSessions)===H.hash(ctl.runSessions)});}
t.rev=[];const said=t.step(11,3,'WEEKLY_REVIEW',{paceRevisionResponse:{offerId:offer.offerId,response:'ACCEPT'}},'09:00');
out('q4.off.answer',{...rev(said),stored:said.paceRevisionRecord.length});
// What turns it on over these bytes: a record bound to the pinned values hash, whatever else; the same reader as the default file.
const records={records:Object.values(RF.FORECAST_BOUNDARIES).map(id=>({boundaryId:id,extensionSha256:RF.FORECAST_VALUES_SHA256,independent:true,disposition:'APPROVE',evidenceStatus:'WELL_SUPPORTED',sourceIds:['s']}))};
const r=P.evaluateProgram(t.p,t.review(11,4,'WEEKLY_REVIEW',{},'09:00'),{...H.DEV,runForecast:undefined,runForecastRecords:records});
out('q4.record-turns-it-on',{boundaries:r.paceRevision.extension.boundaries,source:r.paceRevision.extension.source,status:r.paceRevision.status,recordsUrl:RF.FORECAST_RECORDS_URL.pathname.split('/').slice(-4).join('/')});
