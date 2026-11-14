// QRE-R4 probe: the D-01 path on a race (no effort needed): a race in two files merged (app lists the 2nd file, device imports the 1st over the
// whole time), then the device's re-sync corrects its part. Rows as the engine keeps them; facts as this entry point keeps them.
import {pathToFileURL} from 'node:url';import path from 'node:path';
const root=process.argv[2];const imp=f=>import(pathToFileURL(path.join(root,f)).href);
const H=await imp('test/v1rws-helpers.mjs'),RF=await imp('src/v1-run-format.mjs'),C=await imp('src/v1-run-calibration.mjs');
const {timeline,raceTen,ELIG,DEV,F,VALUES}=H;
const UNKNOWN={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const p=timeline(raceTen()).p,race=p.weeks.flatMap(w=>w.sessions).find(s=>s.prescription?.family==='RACE'),day=race.date;
const ctx={sessionId:race.id,sport:'RUN',role:'RACE',family:'RACE',mode:'EASY',weekIndex:race.weekIndex};
const row=(id,actual,extra={})=>({eventId:id,athleteId:p.athleteId,sessionId:race.id,localDate:day,observedAt:`${day}T15:00:00.000Z`,partial:false,actual:{completed:true,minutes:50,measurement:'GPS',...actual},response:UNKNOWN,provenance:{sourceQuality:'WEARABLE_FULL'},context:ctx,...extra});
const appObs={eventId:'app-race',sessionId:race.id,actual:{completed:true,minutes:50,segments:[{distanceKm:4,measurement:'GPS'}]}};
const devObs={eventId:'dev-race',sessionId:race.id,source:{activityId:'hk'},actual:{completed:true,minutes:50,distanceKm:6,measurement:'GPS',gpsQuality:'OK'}};
const facts=RF.appendReportFacts([],[RF.reportFactOf(appObs,VALUES),RF.reportFactOf(devObs,VALUES,{fromDevice:true})].filter(Boolean),{athleteId:p.athleteId,recordedAt:`${day}T16:00:00.000Z`},VALUES).record;
const merged=row('app-race',{distanceKm:6,gpsQuality:'OK',segments:[{distanceKm:4,measurement:'GPS'}]},{provenance:{sourceQuality:'WEARABLE_FULL',mergedSourceIds:['app-race','dev-race']}});
const corr=row('dev-race-v2',{distanceKm:6,gpsQuality:'OK'},{correctionOf:'dev-race'});
const results=(ledger,fn,fmt)=>fn({program:p,ledger,evidenceRecord:[],asOf:`${day}T23:00:00.000Z`,weekIndex:race.weekIndex,engineStatus:'KEEP',eligibility:ELIG(day),...(fmt?{runFormatRecord:fmt}:{})},DEV).evidence.filter(e=>String(e.id).startsWith('plan-race:')).map(e=>[e.id,e.distanceKm,e.seconds]);
console.log(JSON.stringify({
 merged:{frozen:results([merged],C.runCalibrationOf),entry:results([merged],F.runCalibrationOf,facts)},
 afterDeviceCorrection:{frozen:results([{...merged,superseded:true,supersededBy:'dev-race-v2'},corr],C.runCalibrationOf),entry:results([{...merged,superseded:true,supersededBy:'dev-race-v2'},corr],F.runCalibrationOf,facts)},
 factsKept:facts.map(r=>[r.report.reportId,r.report.several,r.report.distanceKm])}));
