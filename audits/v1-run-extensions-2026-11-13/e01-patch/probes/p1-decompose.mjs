// E-01 decomposed (author's probe, read-only): the judge's scenario of q5-workpace2 through the entry point, shown piece by piece.
// Usage: node p1-decompose.mjs <CoachingCore> [variant ...]
// For each variant: (1) the raw row the engine keeps, (2) what the reports said and which are in force, (3) what the admission hands a pace
// reader and what it withholds, (4) the calibration produced, (5) what each consumer receives, (6) where the band change comes from.
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const root=process.argv[2],imp=f=>import(pathToFileURL(path.join(root,f)).href);
const H=await imp('test/v1rws-helpers.mjs'),RF=await imp('src/v1-run-format.mjs'),RH=await imp('src/v1-run-history.mjs'),C=await imp('src/v1-run-calibration.mjs');
const F=H.F,V=H.VALUES,UNKNOWN={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const EXTRA={'merged only':null,plain:{},lists:{segments:[{distanceKm:4,measurement:'GPS'}]},declares:{declared:{distanceKm:9,reason:'SIGNAL_LOSS'}},'lists and declares':{segments:[{distanceKm:4,measurement:'GPS'}],declared:{distanceKm:9,reason:'SIGNAL_LOSS'}}};
const edge=(cal,k)=>{const b=cal?.paceBands?.[k];return b?(b.status==='AVAILABLE'?[b.fastSecondsPerKm,b.slowSecondsPerKm]:b.status):null;};
const pick=(o,keys)=>Object.fromEntries(keys.filter(k=>o&&k in o).map(k=>[k,o[k]]));
function go(variant,pace=255,rpe=7){
 const t=H.atSixteen();t.week(1,H.weekWith(t,1,null,null));t.week(2,H.weekWith(t,2,null,null));
 const seen=[];
 for(const w of [3,4,5,6]){
  const qs=t.runsOf(w,s=>s.role==='QUALITY'),rest=t.p.weeks[w].sessions.filter(H.live).filter(s=>!qs.includes(s)).map(s=>{const o=s.sport==='RUN'?H.asPrescribed(t,s):{};return o?.eventId?o:H.report(t.p,s,o??{});});
  const obs=[],corr=[];
  for(const q of qs){
   const run=t.runs[q.id],base=H.report(t.p,q,{workPace:pace,rpe});
   const a1={...base,eventId:'app-'+q.id,actual:{...base.actual,formatHash:run.timeFormatHash}};
   const d1={eventId:'dev-'+q.id,athleteId:t.p.athleteId,sessionId:q.id,occurrenceDate:q.date,canonicalActivityId:'hk-'+q.id,source:{provider:'HEALTHKIT',activityId:'hk-'+q.id,quality:'WEARABLE_FULL'},actual:{completed:true,minutes:q.prescription.durationMinutes,distanceKm:9,measurement:'GPS',gpsQuality:'POOR'},response:UNKNOWN};
   obs.push(a1,d1);
   if(EXTRA[variant])corr.push({...a1,eventId:a1.eventId+'-v2',actual:{...a1.actual,...EXTRA[variant]},correctionOf:a1.eventId,correctedAt:`${t.day(w,6)}T19:30:00-03:00`});
   seen.push(q.id);
  }
  t.step(w,6,'WEEKLY_REVIEW',{observations:[...rest,...obs]},'18:00');
  if(corr.length)t.step(w,6,'WEEKLY_REVIEW',{observations:corr},'20:00');
 }
 const r=t.week(7,H.weekWith(t,7,null,null)),id=seen[0],athleteId=t.p.athleteId;
 // (1) the raw rows of the first quality session
 const rows=r.actualLedger.filter(o=>!o.fact&&o.sessionId===id),live=rows.find(o=>!o.superseded);
 const raw=rows.map(o=>({eventId:o.eventId,superseded:o.superseded===true,supersededBy:o.supersededBy??null,mergedSourceIds:o.provenance?.mergedSourceIds??null,sourceQuality:o.provenance?.sourceQuality??null,actual:pick(o.actual,['completed','minutes','distanceKm','measurement','gpsQuality','work','rpe','segments','declared','manualDistanceKm'])}));
 // (2) what the reports said, which are in force, and the reading of the live row
 const facts=RF.readReportFacts(r.runFormatRecord,athleteId,V,r.actualLedger),L=facts.inForce(id),carried=RF.sourcesOf(live),reading=RF.reportsReading(live,facts,V);
 const said=r.runFormatRecord.filter(x=>x.fact===RF.RUN_REPORT_RECEIVED&&x.sessionId===id).map(x=>pick(x.report,['reportId','speaker','standing','distanceKm','timed','several','corrected','ownKm','wholeKm']));
 const notCarried=[...L.ids].filter(x=>!carried.includes(x)).sort();
 // (3) the admission
 const adm=F.admitted(r.actualLedger,{athleteId,facts},V),handed=adm.ledger.find(o=>o.eventId===live.eventId),df=RH.distanceFacts(live.actual,V,{wearable:String(live.provenance?.sourceQuality??'').startsWith('WEARABLE'),reports:reading});
 const admission={rowHasDistance:typeof live.actual.distanceKm==='number',reading,distanceFactsPaceWithheld:df.paceWithheld,withheldOfTheseSessions:adm.withheld.filter(x=>seen.includes(x.sessionId)),
  handedToPaceReaders:{sameObjectAsTheRecord:handed===live,...pick(handed.actual,['distanceKm','gpsQuality','work','rpe','minutes','segments','declared'])}};
 // (4) the calibration, (6) where the change comes from
 const cal=r.runCalibration,tf=cal.capacity?.trainingFactors??null;
 const args={program:t.p,ledger:r.actualLedger,evidenceRecord:r.runEvidenceRecord,asOf:new Date(Date.parse(`${t.day(7,6)}T20:00:00-03:00`)).toISOString(),weekIndex:7,hold:false,engineStatus:r.status,eligibility:H.ELIG(t.day(7,6))};
 const bare=C.runCalibrationOf(args,H.DEV),exported=F.runCalibrationOf({...args,runFormatRecord:r.runFormatRecord},H.DEV);
 // The same record with the work pace of the live rows of these sessions taken off: what the band is without that one field.
 const noWork=C.runCalibrationOf({...args,ledger:r.actualLedger.map(o=>!o.fact&&!o.superseded&&seen.includes(o.sessionId)?{...o,actual:Object.fromEntries(Object.entries(o.actual).filter(([k])=>k!=='work'))}:o)},H.DEV);
 const calibration={entry:{hash:cal.hash.slice(0,16),THRESHOLD_CONTROLLED:edge(cal,'THRESHOLD_CONTROLLED'),EASY:edge(cal,'EASY'),trainingFactors:tf,capacityStatus:cal.capacity?.status,reference:cal.capacity?.reference??null},
  frozenCalibrationOnTheBareRecord:{hash:bare.hash.slice(0,16),THRESHOLD_CONTROLLED:edge(bare,'THRESHOLD_CONTROLLED')},exportedRunCalibrationOf:{hash:exported.hash.slice(0,16),THRESHOLD_CONTROLLED:edge(exported,'THRESHOLD_CONTROLLED')},
  bareRecordWithoutTheWorkPaceOfTheseRows:{hash:noWork.hash.slice(0,16),THRESHOLD_CONTROLLED:edge(noWork,'THRESHOLD_CONTROLLED')}};
 // (5) the consumers
 const ex=r.runSessions?.[id]?.execution??null,hist=RH.runHistory({ledger:r.actualLedger,record:r.runHistoryRecord,athleteId,tz:t.p.timezoneOffsetMinutes??0,reportsOf:o=>RF.reportsReading(o,facts,V)},V).runs.find(x=>x.sessionId===id);
 const fresh={...H.sixteen({asOf:t.day(8,0),start:t.day(8,1)}),athlete:{...H.sixteen({asOf:t.day(8,0)}).athlete,pause:{nonclinical:true,reasonCategory:'SCHEDULE'}}};
 const restart=F.restartProgram({intake:fresh,record:t.ledger,referenceState:t.ref,asOf:`${t.day(8,0)}T10:00:00-03:00`,athleteId,runEvidenceRecord:t.ev,runFormatRecord:t.fmt,runHistoryRecord:t.hist},H.DEV);
 const consumers={execution:ex?pick(ex,['status','expression','completed','paceEvidence','paceWithheld','reliability','measuredKm','extentKm']):null,runHistory:hist?pick(hist,['paceWithheld','markedPoor','referenceKm','measuredKm']):null,
  paceEvidenceWithheldInTheAnswer:(r.runFormat.paceEvidenceWithheld??[]).filter(x=>seen.includes(x.sessionId)).map(x=>x.reason),
  restart:{status:restart.status,THRESHOLD_CONTROLLED:edge(restart.runCalibration,'THRESHOLD_CONTROLLED'),withheld:(restart.runFormat?.paceEvidenceWithheld??[]).filter(x=>seen.includes(x.sessionId)).map(x=>x.reason)}};
 return {sessions:seen,firstSession:id,raw,reports:{said,inForce:[...L.ids].sort(),liveRowMadeOf:carried,inForceAndNotCarried:notCarried},admission,calibration,consumers};
}
const out={};for(const v of (process.argv.length>3?process.argv.slice(3):Object.keys(EXTRA)))try{out[v]=go(v);}catch(e){out[v]={THREW:String(e.stack).slice(0,600)};}
console.log(JSON.stringify(out,null,1));
