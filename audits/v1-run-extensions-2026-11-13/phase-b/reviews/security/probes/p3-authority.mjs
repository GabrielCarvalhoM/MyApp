// P3: options and authority. The band hook from a caller, development authorities with other values, forged enabling records, the default.
import fs from 'node:fs';
import {H,P,F,RF,thresholds,rev,out,formatBandOf,qualityOf} from './base.mjs';
const T0=Date.now();
const x=thresholds({through:9}),t=x.t,review=t.review(9,1,'WEEKLY_REVIEW',{},'09:00');
const FAST=()=>({status:'AVAILABLE',domain:'THRESHOLD_CONTROLLED',fastSecondsPerKm:200,slowSecondsPerKm:210});
const ctl=P.evaluateProgram(t.p,review,H.DEV_REVISION);
out('P3.control',{fb:formatBandOf(ctl,t,9),fb10:formatBandOf(ctl,t,10),...rev(ctl)});
// (a) a caller's BAND_OF on the composed entry point: as own enumerable key, inherited, non-enumerable, through a Proxy.
const own=P.evaluateProgram(t.p,review,{...H.DEV_REVISION,[F.BAND_OF]:FAST});
const inherited=P.evaluateProgram(t.p,review,Object.assign(Object.create({[F.BAND_OF]:FAST}),H.DEV_REVISION));
const nonEnum=(()=>{const o={...H.DEV_REVISION};Object.defineProperty(o,F.BAND_OF,{value:FAST,enumerable:false});return P.evaluateProgram(t.p,review,o);})();
const proxy=P.evaluateProgram(t.p,review,new Proxy({...H.DEV_REVISION},{get:(o,k)=>k===F.BAND_OF?FAST:o[k]}));
out('P3a.composed',{own:[formatBandOf(own,t,9),formatBandOf(own,t,10)],inherited:formatBandOf(inherited,t,9),nonEnum:formatBandOf(nonEnum,t,9),proxy:formatBandOf(proxy,t,9),sameRunSessions:[own,inherited,nonEnum,proxy].map(r=>H.hash(r.runSessions)===H.hash(ctl.runSessions))});
// (a2) the same hook on the frozen layer below, called directly (it is re-exported, and its own option filter keeps the hook).
const plain=Object.fromEntries(Object.entries(review).filter(([k])=>!['paceRevisionRecord','paceRevisionResponse'].includes(k)));
const below=F.evaluateProgram(t.p,plain,{...H.DEV,[F.BAND_OF]:FAST});
out('P3a2.layer-below-direct',{fb:formatBandOf(below,t,9),exportedFromComposed:P.BAND_OF===F.BAND_OF});
// (b) a development authority of this extension with other values: the revision's step and total raised.
const V=JSON.parse(JSON.stringify(H.VALUES));V.paceInsights.athleteConfirmedRevision.step.maxPerStep=0.3;V.paceInsights.athleteConfirmedRevision.totalMax=0.3;
const OPT={...H.DEV,runForecast:RF.devRunForecast(Object.values(RF.FORECAST_BOUNDARIES),V)};
const y=thresholds({through:10,opts:OPT,answer:(w,look)=>look.paceRevision.offer&&w===9?{offerId:look.paceRevision.offer.offerId,response:'ACCEPT'}:null});
out('P3b.values-from-options',{offerStep:y.looks[9].paceRevision.active?.fraction,w10:rev(y.looks[10]),fb10:formatBandOf(y.looks[10],y.t,10)});
// (c) a forged enabling record passed as options.runForecastRecords (self-declared independent), the lower layers under their dev authorities.
const records={records:Object.values(RF.FORECAST_BOUNDARIES).map(id=>({boundaryId:id,extensionSha256:RF.FORECAST_VALUES_SHA256,independent:true,disposition:'APPROVE',evidenceStatus:'WELL_SUPPORTED',sourceIds:['anything']}))};
const forged=P.evaluateProgram(t.p,review,{...H.DEV,runForecast:undefined,runForecastRecords:records});
out('P3c.forged-records',{boundaries:forged.paceRevision.extension.boundaries,source:forged.paceRevision.extension.source,status:forged.paceRevision.status});
// (d) the default: no options at all, and the record file.
const g=P.generateProgram(H.racePlan());
out('P3d.default',{recordFileExists:fs.existsSync(RF.FORECAST_RECORDS_URL),valuesPinned:RF.FORECAST_VALUES_FILE_SHA256===RF.FORECAST_VALUES_SHA256,forecast:g.runForecast?.status,insights:g.paceInsights?.status,revision:g.paceRevision?.status,reason:g.runForecast?.reason});
const d2=P.evaluateProgram(t.p,review,{});
out('P3d.default-review',{forecast:d2.runForecast?.status,insights:d2.paceInsights?.status,revision:d2.paceRevision?.status,records:d2.paceRevisionRecord?.length});
// (e) the revision boundary named on, the insights not: never on alone.
const lone=P.evaluateProgram(t.p,review,{...H.DEV,runForecast:RF.devRunForecast([RF.FORECAST_BOUNDARIES.REVISION])});
out('P3e.revision-alone',{boundaries:lone.paceRevision.extension.boundaries,status:lone.paceRevision.status,reason:lone.paceRevision.reason});
// (f) values file that is not the pinned bytes under the record path: raceForecastOf refuses other bytes.
out('P3f.other-bytes',{refused:RF.raceForecastOf(Buffer.from(JSON.stringify(V)))===null});
out('P3.ms',Date.now()-T0);
