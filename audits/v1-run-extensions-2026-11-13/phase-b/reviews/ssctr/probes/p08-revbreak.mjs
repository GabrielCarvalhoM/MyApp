// probe 08: an active threshold revision and a declared break of 8 days (V1RC mode stays EASY): does it end at once (A3 endsAtOnce)?
const ROOT='C:/Users/carva/Desktop/myApp/MyApp/.claude/worktrees/v1-run-extensions/';
const PI=await import('file:///'+ROOT+'CoachingCore/src/v1-pace-insights.mjs');
const fs=await import('node:fs');const RC=JSON.parse(fs.readFileSync(ROOT+'CoachingCore/v1/RUN_CALIBRATION_EXTENSION_V1.json','utf8'));const PV=JSON.parse(fs.readFileSync(ROOT+'CoachingCore/v1/RACE_FORECAST_EXTENSION_V1.json','utf8')).paceInsights;
const day=(s,n)=>new Date(Date.parse(s+'T00:00:00Z')+n*864e5).toISOString().slice(0,10),START='2027-01-04';
const weeks=now=>Array.from({length:now+1},(_,i)=>({index:i,startDate:day(START,7*i),phase:'BUILD',mode:'EASY',band:i>=5?{fastSecondsPerKm:300,slowSecondsPerKm:320,derived:true}:{fastSecondsPerKm:310,slowSecondsPerKm:330,derived:true},factor:i>=5?0.045:0,withdrawn:false,referenceId:'R1',withdrawal:null}));
let n=0;const ex=(date,pace,rpe)=>({eventId:'e'+(++n),sessionId:'s'+n,date,recordedOn:date,week:Math.floor((Date.parse(date)-Date.parse(START))/6048e5),secondsPerKm:pace,rpe,admitted:true,completed:true,comparable:true,compatible:true,longBouts:true,measurement:'TRACK',gpsGood:false,totalWorkMinutes:24});
const execs=[ex('2027-02-10',282,7),ex('2027-02-17',288,6),ex('2027-02-24',281,7)];
const run=(now,x={})=>PI.paceRevisionOf({now,weeks:weeks(now),executions:execs,adverse:[],breaks:[],responses:[],raceDate:'2027-05-30',experience:'INTERMEDIATE',asOfDay:day(START,7*now),screenRequired:false,p3Offered:false,scope:'p',...x},PV,RC);
const offer=run(8).offer,acc={offerId:offer.offerId,response:'ACCEPT',date:'2027-03-02'};
const brk=[{from:'2027-03-15',to:'2027-03-22',days:8}];
for(const now of [10,11,12]){const s=run(now,{responses:[acc],breaks:brk});console.log('week',now+1,'status',s.status,'ended',JSON.stringify(s.ended),'fractionOn next week',s.fractionOn(day(START,7*(now+1))));}
