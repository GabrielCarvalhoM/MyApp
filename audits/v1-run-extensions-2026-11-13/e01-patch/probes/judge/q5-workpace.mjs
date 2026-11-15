// QRE R5: the whole-row reasons on a row with no distance (author's reading 1), when the row's own reports also state a distance-only reason.
// Unit level (the author's own fixture, varied) and through the entry point (a quality session with a work pace). Usage: node q5-workpace.mjs <CoachingCore>
import {load,UNKNOWN,sha} from './lib.mjs';
const L=await load(process.argv[2]),{RF,RH,F,H,V,C}=L;
const out={unit:{},entry:{}};
// ---- unit: the author's fixture of the whole-row test, the correction varied
const A='a',AT=h=>`2026-12-01T${String(h).padStart(2,'0')}:00:00.000Z`;
const said=(eventId,x={})=>({eventId,sessionId:'s',...(x.device?{source:{provider:'HEALTHKIT',activityId:x.device,quality:'WEARABLE_FULL'}}:{}),actual:{completed:true,minutes:60,distanceKm:10,measurement:'GPS',...(x.actual??{})}});
const record=(...steps)=>steps.reduce((rec,[hour,...os])=>RF.appendReportFacts(rec,os.map(o=>RF.reportFactOf(o,V,{fromDevice:!!o.source})),{athleteId:A,recordedAt:AT(hour)},V).record,[]);
const line=(eventId,x={})=>({eventId,athleteId:A,sessionId:'s',localDate:'2026-12-01',partial:false,actual:{completed:true,minutes:60,distanceKm:10,measurement:'GPS',...(x.actual??{})},response:UNKNOWN,context:{sport:'RUN',family:'THRESHOLD',mode:'EASY',sessionId:'s'},provenance:{sourceQuality:x.wearable?'WEARABLE_FULL':'MANUAL',...(x.merged?{mergedSourceIds:x.merged}:{})},...(x.by?{superseded:true,supersededBy:x.by}:{})});
const work={minutes:45,distanceKm:undefined,work:{paceSecondsPerKm:270},rpe:7};
for(const [name,extra] of [['plain correction',{}],['correction lists a further recording',{segments:[{distanceKm:4,measurement:'GPS'}]}],['correction declares with a failure reason',{declared:{distanceKm:9,reason:'SIGNAL_LOSS'}}]]){
 if(typeof RF.reportsReading!=='function'&&name!=='plain correction'){}
 const a1=said('a1',{actual:work}),d1=said('d1',{device:'hk-1',actual:{minutes:45,distanceKm:9,gpsQuality:'POOR'}}),a2=said('a2',{actual:{...work,...extra}});
 const ledger=[line('a1',{merged:['a1','d1'],by:'a2',wearable:true,actual:{minutes:45,distanceKm:9,gpsQuality:'POOR',work:{paceSecondsPerKm:270},rpe:7}}),line('a2',{actual:{...work,...extra}})];
 const facts=RF.readReportFacts(record([10,a1,d1],[11,a2]),A,V,ledger),adm=F.admitted(ledger,{athleteId:A,facts},V),handed=adm.ledger.find(o=>o.eventId==='a2');
 out.unit[name]={inForce:facts.inForce?[...facts.inForce('s').ids].sort():null,reading:RF.reportsReading?RF.reportsReading(ledger[1],facts,V):RF.reportsVerdict(ledger[1],facts,V),withheld:adm.withheld,handedGps:handed.actual.gpsQuality??null,work:handed.actual.work};
}
// ---- entry point: a quality session in week 3, the athlete's work pace, the watch flags POOR, then the athlete corrects their own report
function go(variant){
 const t=H.atSixteen();t.week(1,H.weekWith(t,1,null,null));t.week(2,H.weekWith(t,2,null,null));
 const q=t.runsOf(3,s=>s.role==='QUALITY')[0],run=t.runs[q.id];
 let rest=t.p.weeks[3].sessions.filter(H.live).filter(s=>s.id!==q.id).map(s=>{const o=s.sport==='RUN'?H.asPrescribed(t,s):{};return o?.eventId?o:H.report(t.p,s,o??{});});
 const mins=q.prescription.durationMinutes,base=H.report(t.p,q,{workPace:270,rpe:7});
 const a1={...base,eventId:'app-q',actual:{...base.actual,formatHash:run.timeFormatHash}};
 const d1={eventId:'dev-q',athleteId:t.p.athleteId,sessionId:q.id,occurrenceDate:q.date,canonicalActivityId:'hk-q',source:{provider:'HEALTHKIT',activityId:'hk-q',quality:'WEARABLE_FULL'},actual:{completed:true,minutes:mins,distanceKm:9,measurement:'GPS',gpsQuality:'POOR'},response:UNKNOWN};
 const day=t.day(3,6);
 t.step(3,6,'WEEKLY_REVIEW',{observations:[...rest,a1,d1]},'18:00');
 if(variant!=='merged only'){const extra=variant==='correction lists a recording'?{segments:[{distanceKm:4,measurement:'GPS'}]}:variant==='correction declares a failure'?{declared:{distanceKm:9,reason:'SIGNAL_LOSS'}}:{};
  const a2={...a1,eventId:'app-q-v2',actual:{...a1.actual,...extra},correctionOf:'app-q',correctedAt:`${day}T19:30:00-03:00`};t.step(3,6,'WEEKLY_REVIEW',{observations:[a2]},'20:00');}
 const row=t.row(q.id),r=t.week(4,H.weekWith(t,4,null,null));
 const bare=C.runCalibrationOf({program:t.p,ledger:r.actualLedger,evidenceRecord:r.runEvidenceRecord,asOf:new Date(Date.parse(`${t.day(4,6)}T20:00:00-03:00`)).toISOString(),weekIndex:4,hold:false,engineStatus:r.status,eligibility:H.ELIG(t.day(4,6))},H.DEV);
 const bands=cal=>Object.fromEntries(Object.entries(cal?.paceBands??{}).map(([k,b])=>[k,b.status==='AVAILABLE'?[b.fastSecondsPerKm,b.slowSecondsPerKm,b.basis??null]:b.status]));
 return {row:{id:row.eventId,km:row.actual.distanceKm??null,gps:row.actual.gpsQuality??null,work:row.actual.work??null,merged:row.provenance?.mergedSourceIds??null,segs:row.actual.segments??null},
  withheld:(r.runFormat.paceEvidenceWithheld??[]).filter(x=>x.sessionId===q.id),entry:{hash:r.runCalibration.hash,bands:bands(r.runCalibration)},bare:{hash:bare.hash,bands:bands(bare)},entryEqualsBare:r.runCalibration.hash===bare.hash};
}
for(const v of ['merged only','plain correction','correction lists a recording','correction declares a failure'])try{out.entry[v]=go(v);}catch(e){out.entry[v]={THREW:String(e.stack).slice(0,400)};}
console.log(JSON.stringify(out,null,1));
