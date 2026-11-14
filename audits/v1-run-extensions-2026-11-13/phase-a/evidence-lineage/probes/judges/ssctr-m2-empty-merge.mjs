// SSCTR r4 probe m2 (read-only): reading 1 on the long run (16 km native). Two sources of one run where the import sends `segments: []`.
// (a) the r3a case: the app sends the second recording (6 km) with no distance, the import the first (10 km) and an empty list;
// (b) an overlap: the watch recorded the whole run (16 km, empty list), the phone app its own 10 km plus a 6 km second file;
// (c) the same overlap with the import sending no list key at all (the path that already existed in 644cd8e).
// What credit, history reference, next long run and CT-3 ceiling each gives, in 644cd8e and the candidate.
const ROOT=process.argv[2];
const H=await import(ROOT+'test/v1rws-helpers.mjs');
const {report,atSixteen,asPrescribed,live,weekWith}=H;
const U={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const device=(t,s,actual,id='hk-long-1')=>({eventId:'dev-'+id,athleteId:t.p.athleteId,sessionId:s.id,occurrenceDate:s.date,canonicalActivityId:id,source:{provider:'HEALTHKIT',activityId:id,quality:'WEARABLE_FULL'},actual,response:U});
const others=(t,w,id)=>t.p.weeks[w].sessions.filter(live).filter(s=>s.id!==id).map(s=>{const o=s.sport==='RUN'?asPrescribed(t,s):{};return o?.eventId?o:report(t.p,s,o??{});});
const out={};
for(const variant of ['r3aEmptyList','overlapEmptyList','overlapNoKey','watchWholeAlone'])for(const order of ['appFirst','devFirst','oneReview']){
 if(variant==='watchWholeAlone'&&order!=='oneReview')continue;
 const t=atSixteen(),s=t.long,run=t.runs[s.id],fh={formatHash:run.formatHash},min=100;let rest=others(t,1,s.id);
 const review=(obs,time)=>{const r=t.step(1,6,'WEEKLY_REVIEW',{observations:[...rest,...obs]},time);rest=[];return r;};
 const app=a=>({...report(t.p,s,{}),eventId:'app-long',actual:{completed:true,minutes:min,rpe:4,...fh,...a}});
 let reps;
 if(variant==='r3aEmptyList')reps=[app({segments:[{distanceKm:6,measurement:'GPS'}]}),device(t,s,{completed:true,minutes:min,distanceKm:10,measurement:'GPS',segments:[],...fh})];
 if(variant==='overlapEmptyList')reps=[app({distanceKm:10,measurement:'GPS',segments:[{distanceKm:6,measurement:'GPS'}]}),device(t,s,{completed:true,minutes:min,distanceKm:16,measurement:'GPS',segments:[],...fh})];
 if(variant==='overlapNoKey')reps=[app({distanceKm:10,measurement:'GPS',segments:[{distanceKm:6,measurement:'GPS'}]}),device(t,s,{completed:true,minutes:min,distanceKm:16,measurement:'GPS',...fh})];
 if(variant==='watchWholeAlone')reps=[device(t,s,{completed:true,minutes:min,distanceKm:16,measurement:'GPS',segments:[],...fh})];
 if(order==='oneReview')review(reps,'20:00');else{const [a,b]=order==='appFirst'?reps:[reps[1],reps[0]];review([a],'18:00');review([b],'21:00');}
 const r=t.results.at(-1),x=r.runSessions[s.id].execution,row=t.row(s.id);
 const w2=t.week(2,weekWith(t,2,null,null));const nextLong=t.runsOf(3,y=>y.role==='LONG')[0],nl=w2.runSessions[nextLong.id];
 const hist=(w2.runHistoryRecord??[]);
 out[variant+'/'+order]={rowKm:row.actual.distanceKm,segs:JSON.stringify(row.actual.segments??null),status:x.status,basis:x.basis,extentKm:x.extentKm,paceEvidence:x.paceEvidence,paceWithheld:x.paceWithheld,
  nextLong:nl.expression==='NATIVE'?{km:nl.blocks.flatMap(b=>b.steps).find(q=>q.kind==='STEADY')?.target?.metres/1000,ct3max:nl.dose?.checks?.['CT-3']?.max??null,minutes:nextLong.prescription?.durationMinutes}:{expression:nl.expression,why:nl.unavailable?.native},easy:w2.runCalibration?.paceBands?.EASY?[w2.runCalibration.paceBands.EASY.fastSecondsPerKm,w2.runCalibration.paceBands.EASY.slowSecondsPerKm]:null,withheld:w2.runFormat.paceEvidenceWithheld.map(y=>y.reason)};
}
console.log(JSON.stringify(out));
