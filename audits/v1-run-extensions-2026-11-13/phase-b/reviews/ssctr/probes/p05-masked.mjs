// SSCTR-RFC review r1, probe 05: SSCTR-RWS-F-01 on my own athlete (half-marathon plan): a row the run formats mask (the athlete's correction
// by time, with no distance, after a device import flagged POOR) never votes and is still adherence; the raw row still carries a fast work pace.
const ROOT='C:/Users/carva/Desktop/myApp/MyApp/.claude/worktrees/v1-run-extensions/CoachingCore/';
const H=await import('file:///'+ROOT+'test/v1rfc-helpers.mjs');
const {DEV,timeline,runner,result,report,asPrescribed,addDays,START,live}=H;
const UNKNOWN={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
let fails=0,checks=0;const ok=(c,m)=>{checks++;if(!c){fails++;console.log('FAIL',m);}};
const intake=runner({id:'m-half',asOf:'2027-01-02',start:START,weeks:16,runExperience:'INTERMEDIATE',goal:{kind:'RACE',event:{kind:'HALF_MARATHON',date:addDays(START,16*7-1)}},anchors:[result('10K',2880,'2027-01-01')],recent:{runDaysPerWeek:4,runMinutesPerWeek:240,longestRunMinutes:90,strengthDaysPerWeek:1},schedule:{runDays:[0,1,3,6],strengthDays:[2],runMinutes:70,longRunMinutes:120,longRunDay:6}});
const plain=(t,s)=>{const o=s.sport==='RUN'?asPrescribed(t,s):{};return o?.eventId?o:report(t.p,s,o??{});};
function go(mask){
 const t=timeline(intake,{opts:DEV});for(let w=0;w<2;w++)t.week(w,s=>asPrescribed(t,s));
 const seen=[];
 for(const w of [2,3,4,5]){
  const q=t.runsOf(w,s=>s.role==='QUALITY')[0];if(!q||q.prescription.family!=='THRESHOLD'){t.week(w,s=>asPrescribed(t,s));continue;}
  const others=t.p.weeks[w].sessions.filter(live).filter(s=>s.id!==q.id).map(s=>plain(t,s)),said=report(t.p,q,{workPace:262,rpe:6});
  const a1={...said,eventId:'mine-app-'+q.id,actual:{...said.actual,formatHash:t.runs[q.id].timeFormatHash,measurement:'TRACK'}};
  const dev=mask?{eventId:'mine-dev-'+q.id,athleteId:t.p.athleteId,sessionId:q.id,occurrenceDate:q.date,canonicalActivityId:'hk2-'+q.id,source:{provider:'HEALTHKIT',activityId:'hk2-'+q.id,quality:'WEARABLE_FULL'},actual:{completed:true,minutes:q.prescription.durationMinutes,distanceKm:11,measurement:'GPS',gpsQuality:'POOR'},response:UNKNOWN}:null;
  t.step(w,6,'WEEKLY_REVIEW',{observations:[...others,a1,...(dev?[dev]:[])]},'17:00');
  if(mask)t.step(w,6,'WEEKLY_REVIEW',{observations:[{...a1,eventId:a1.eventId+'-fix',actual:{...a1.actual,declared:{distanceKm:8.5,reason:'SIGNAL_LOSS'}},correctionOf:a1.eventId,correctedAt:`${t.day(w,6)}T18:30:00-03:00`}]},'19:00');
  seen.push(q.id);
 }
 return {t,seen,r:t.look(6)};
}
const clean=go(false),masked=go(true);
const thr=x=>x.r.paceInsights.domains.THRESHOLD_CONTROLLED;
console.log('threshold sessions seen',clean.seen.length,'| clean',thr(clean).state,thr(clean).votes,thr(clean).action,'| masked',thr(masked).state,thr(masked).votes,JSON.stringify(thr(masked).excluded.map(x=>[x.reason,x.withheld])));
ok(clean.seen.length>=3&&thr(clean).votes===clean.seen.length,'clean sessions vote');
ok(thr(masked).votes===0,'masked rows never vote');
for(const id of masked.seen){const row=masked.t.row(id),e=masked.r.runSessions[id].execution;
 ok(e.paceWithheld!==null||masked.r.runFormat.paceEvidenceWithheld.some(x=>x.sessionId===id),'masked row withheld by the run formats');
 console.log('  row',row.eventId,'distanceKm' in row.actual,'raw work',JSON.stringify(row.actual.work),'exec',e.status,e.completed,'paceEvidence',e.paceEvidence,'withheld',e.paceWithheld);}
const credits=x=>x.r.runForecast.adherence.weeks.flatMap(k=>k.credits??[]).filter(c=>x.seen.includes(c.sessionId)).map(c=>c.c+':'+c.rule);
console.log('credits masked',credits(masked).join(' '));
ok(credits(masked).every(c=>c.startsWith('1:')),'masked completed sessions are adherence 1');
ok(masked.r.runForecast.inputDigest!==undefined,'forecast computed');
console.log(`p05: ${checks-fails}/${checks} checks hold`);
