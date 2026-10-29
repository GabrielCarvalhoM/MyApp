// QE re-check probe P8 (R7A-QE-r2, FREEZE-2): aheadOf (cycle 2) treats any same-day session without a report as still ahead, whatever
// its time of day. The athlete runs Thursday's 08:00 session as planned; at 21:00 an EVENT_DATE_CHANGE that reaches this week is reviewed
// (A) with that run's report in the same review, or (B) before the report, which arrives on Friday. Same facts, different arrival order.
// Compared: Thursday's prescription in the program, how Friday's report binds, and the weekly review of the week.
// Synthetic data, DEV_TEST_ONLY authority. QE_RUNTIME=pre runs the R6 closure runtime.
import {cur,pre,opts,intake,review,obs,addDays,out,SQUAT,BENCH} from './qe-lib.mjs';
import {hash} from '../../../CoachingCore/src/value.mjs';
const tag=process.env.QE_RUNTIME==='pre'?'PRE_R7A':'CURRENT',R=tag==='PRE_R7A'?await pre():cur;
const START='2026-11-02',ia={id:'qe-rc-P8',weeks:16,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays(START,13*7+6)}},strength:'STRENGTH'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}},schedule:{runDays:[1,3,6],strengthDays:[0,3],longRunDay:6,runMinutes:60,longRunMinutes:100,strengthMinutes:60}};
let p=R.generateProgram(intake(ia),opts).program,ledger=[];
for(let w=0;w<6;w++){const r=R.evaluateProgram(p,review(p,w,{observations:p.weeks[w].sessions.filter(s=>s.prescription).map(s=>obs(p,s)),actualLedger:ledger}),opts);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}
const W=6,wk=p.weeks[W],thu=addDays(wk.startDate,3),newRace=addDays(thu,8);
const early=wk.sessions.filter(s=>s.prescription&&s.day<3).map(s=>obs(p,s));
const thuRun=wk.sessions.find(s=>s.day===3&&s.sport==='RUN'&&s.prescription),thuRunObs=obs(p,thuRun,{eventId:'qe-rc-P8-thu-run'});
const thuStr=wk.sessions.find(s=>s.day===3&&s.sport==='STRENGTH'&&s.prescription),thuStrObs=obs(p,thuStr,{eventId:'qe-rc-P8-thu-str'});
const thuOrig=`${thuRun.role} ${thuRun.prescription.family}:${thuRun.prescription.durationMinutes}`;
const change=(P,obsList,led)=>({...review(P,W,{day:3,kind:'EVENT_DATE_CHANGE',changes:{eventDate:newRace},observations:obsList,actualLedger:led}),asOf:`${thu}T21:00:00Z`});
const line=P=>P.weeks[W].sessions.filter(s=>s.day>=3).map(s=>`d${s.day} ${s.sport} ${s.role}${s.prescription?' '+(s.sport==='STRENGTH'?s.prescription.exercises.map(e=>`${e.id}:${e.sets}x@${e.rir}`).join(','):`${s.prescription.family}:${s.prescription.durationMinutes}`):''}`);
const finish=(P,led,extra=[])=>{const rest=P.weeks[W].sessions.filter(s=>s.prescription&&s.status!=='SKIPPED'&&s.day>3).map(s=>obs(P,s));return R.evaluateProgram(P,review(P,W,{observations:[...extra,...rest],actualLedger:led}),opts);};
// A: the run is reported in the same review as the change.
const a=R.evaluateProgram(p,change(p,[...early,thuRunObs,thuStrObs],ledger),opts),A=a.proposal??p,aw=finish(A,a.actualLedger);
// B: the change first (no report yet), the run reported on Friday 07:00 together with Thursday's strength (or at the weekly review).
const b=R.evaluateProgram(p,change(p,early,ledger),opts),B=b.proposal??p;
const thuRunB=B.weeks[W].sessions.find(s=>s.id===thuRun.id);
const bw=finish(B,b.actualLedger,[{...thuRunObs,reportedAt:`${addDays(thu,1)}T07:00:00Z`},{...thuStrObs,reportedAt:`${addDays(thu,1)}T07:00:00Z`}]);
const row=(r,id)=>r.weekEvidence.rows.find(x=>x.sessionId===id);
const nextRuns=r=>(r.proposal??null)?.weeks[W+1]?.sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>`${s.role}:${s.prescription.family}:${s.prescription.durationMinutes}`)??null;
const strState=(r,P)=>Object.fromEntries(Object.entries((r.proposal??P).stateTrace[W+1].strength.exercises).map(([id,e])=>[id,{load:e.load??null,reps:e.reps??null,sets:e.sets??null,lastExecutedSets:e.lastExecutedSets??null,setCap:e.setCap??null,regainCap:e.regainCap??null,loadTick:e.loadTick??null}]));
const thuStrB=B.weeks[W].sessions.find(s=>s.id===thuStr.id);
out('P8',{thursdayStrengthAsPlannedAndExecuted:thuStr.prescription.exercises.map(e=>e.id+':'+e.sets+'x@'+e.rir).join(','),thursdayStrengthInProgramB:thuStrB.prescription?thuStrB.prescription.exercises.map(e=>e.id+':'+e.sets+'x@'+e.rir).join(','):null,strengthStateNextA:strState(aw,A),strengthStateNextB:strState(bw,B),sameStrengthStateEitherArrival:JSON.stringify(strState(aw,A))===JSON.stringify(strState(bw,B)),runtime:tag,thursdayRunAsPlannedAndExecuted:thuOrig,
 A_reportInSameReview:{change:`${a.status}/${a.action}`,thursdayRunInProgram:line(A)[0],weekly:`${aw.status}/${aw.action}`,thursdayRow:row(aw,thuRun.id)?{status:row(aw,thuRun.id).status,kind:row(aw,thuRun.id).kind,role:row(aw,thuRun.id).role}:null,gates:aw.gates,nextWeekRuns:nextRuns(aw),runStateNext:(aw.proposal??A).stateTrace[W+1].run},
 B_reportArrivesNextMorning:{change:`${b.status}/${b.action}`,thursdayRunInProgram:`${thuRunB.role} ${thuRunB.prescription?thuRunB.prescription.family+':'+thuRunB.prescription.durationMinutes:'-'}`,thursdayRewritten:hash(thuRunB.prescription)!==hash(thuRun.prescription),weekly:`${bw.status}/${bw.action}`,thursdayRow:row(bw,thuRun.id)?{status:row(bw,thuRun.id).status,kind:row(bw,thuRun.id).kind,role:row(bw,thuRun.id).role}:null,gates:bw.gates,nextWeekRuns:nextRuns(bw),runStateNext:(bw.proposal??B).stateTrace[W+1].run},
 sameOutcomeEitherArrival:JSON.stringify(aw.gates)===JSON.stringify(bw.gates)&&JSON.stringify(nextRuns(aw))===JSON.stringify(nextRuns(bw))&&JSON.stringify((aw.proposal??A).stateTrace[W+1].run)===JSON.stringify((bw.proposal??B).stateTrace[W+1].run)});
