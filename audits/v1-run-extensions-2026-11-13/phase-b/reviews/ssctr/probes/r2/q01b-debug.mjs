const ROOT='C:/Users/carva/Desktop/myApp/MyApp/.claude/worktrees/v1-run-extensions/CoachingCore/';
const H=await import('file:///'+ROOT+'test/v1rfc-helpers.mjs');const {READINESS_SIGNS}=await import('file:///'+ROOT+'src/v1-f08.mjs');
const {DEV,timeline,runner,result,report,asPrescribed,addDays,ELIG,START}=H;
const plain=(t,s)=>{const o=s.sport==='RUN'?asPrescribed(t,s):{};return o?.eventId?o:report(t.p,s,o??{});};
const half=id=>runner({id,asOf:'2027-01-02',start:START,weeks:16,runExperience:'INTERMEDIATE',goal:{kind:'RACE',event:{kind:'10K',date:addDays(START,16*7-1)}},anchors:[result('10K',2880,'2027-01-01')],recent:{runDaysPerWeek:4,runMinutesPerWeek:240,longestRunMinutes:90,strengthDaysPerWeek:1},schedule:{runDays:[0,1,3,6],strengthDays:[2],runMinutes:70,longRunMinutes:120,longRunDay:6}});
const ready={declaredRecovered:true,warningSigns:Object.fromEntries(READINESS_SIGNS.map(k=>[k,false])),sports:{RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}}};
const t=timeline(half('q-hd'),{opts:DEV});for(let w=0;w<4;w++)t.week(w,s=>plain(t,s));
let r=t.step(4,2,'WEEKLY_REVIEW',{eligibility:ELIG(t.day(4,2),{pain:true})});console.log('hold step',r.status,r.runForecast.reason);
r=t.week(4,s=>plain(t,s));console.log('week 5 Sunday',r.status,r.runForecast.reason);
r=t.step(5,2,'READINESS_DECLARATION',{readiness:ready});console.log('readiness',r.status,r.runForecast.reason);
for(let w=5;w<12;w++){r=t.week(w,s=>plain(t,s),w===7?{runEvidence:[result('10K',2850,t.day(7,6),{id:'post'})]}:{});const l=t.look(w+1);console.log('look week',w+2,l.status,l.runForecast.status,l.runForecast.reason??'',l.runForecast.adherence?l.runForecast.adherence.weeks.map(k=>k.week+':'+(k.counted?'c':'-')).join(' '):'',l.runCalibration?.estimates?.['10K']?.status,l.runCalibration?.estimates?.['10K']?.reason??'');}
