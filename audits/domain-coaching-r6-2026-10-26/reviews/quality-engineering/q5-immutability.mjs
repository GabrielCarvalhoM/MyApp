// QRE probe Q5: immutability. Inputs (unfrozen JSON copies) are never mutated; the official plan state and completed
// work are carried unchanged; no proposal rewrites, removes or adds a session dated on/before the decision's local day;
// past decisions are a prefix of the proposal's decisions. Every review kind on several programs. Real authority.
import {R6,hash,baseIntake,review,obsFor,sessionsOf,write,safe,elig,addDays} from './qlib.mjs';
const OFFICIAL={version:'OFFICIAL-1',weeks:[{index:0,note:'official plan owned elsewhere'}]},COMPLETED=[{sessionId:'legacy-1',minutes:30}];
const programs={
 hybrid:R6.generateProgram(baseIntake({id:'q-im-h',weeks:12,officialPlanState:OFFICIAL,completedWork:COMPLETED})).program,
 event10k:R6.generateProgram(baseIntake({id:'q-im-e',weeks:16,officialPlanState:OFFICIAL,completedWork:COMPLETED,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:'2027-01-24'}},strength:'RUNNING_SUPPORT'}}})).program,
 novice:R6.generateProgram(baseIntake({id:'q-im-n',weeks:8,officialPlanState:OFFICIAL,completedWork:COMPLETED,athlete:{runExperience:'NONE',strengthExperience:'NONE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0},knownExercises:[]},schedule:{runDays:[0,2,4,6],strengthDays:[1,5]}})).program
};
const KINDS={WEEKLY_REVIEW:{},MISSED_SESSION:'target',PARTIAL_SESSION:{},UNDERPERFORMANCE:'target',OVERPERFORMANCE:'target',PROGRESSION_NOT_TOLERATED:'target',PROGRESSION_TOO_EASY:'target',LOCAL_FATIGUE:{signals:{region:'LOWER'}},SYSTEMIC_FATIGUE:{},SCHEDULE_CHANGE:{changes:{runDays:[1,3,5],strengthDays:[0,2],longRunDay:5}},UNAVAILABLE_DAY:'unavail',DOUBLE_CONFLICT:{changes:{runTurn:'PM'}},EQUIPMENT_CHANGE:{changes:{equipment:['BODYWEIGHT','BANDS']}},GOAL_CHANGE:{changes:{goals:{strength:'HYPERTROPHY'}}},EVENT_DATE_CHANGE:'eventdate',RETURN_AFTER_PAUSE:{interruption:{days:14,reasonCategory:'WORK'}},EVENT_WEEK_CONFLICT:'unavail',RECOVERED:{}};
const rows=[],violations=[];
for(const [pname,P] of Object.entries(programs))for(const w of [1,3,Math.min(6,P.weeks.length-2)])for(const day of [0,3,6])for(const [kind,payload] of Object.entries(KINDS)){
 const wk=P.weeks[w],asOfDate=addDays(wk.startDate,day);
 const past=sessionsOf(P).filter(s=>s.prescription&&s.date<=asOfDate&&s.weekIndex===w);
 let extra=typeof payload==='object'?structuredClone(payload):{};
 if(payload==='target'){const t=past.find(s=>s.key)??past[0];if(!t)continue;extra.targetSessionId=t.id;}
 if(payload==='unavail'){extra.changes={unavailableDates:[addDays(wk.startDate,Math.min(6,day+1))]};}
 if(payload==='eventdate'){extra.changes={eventDate:addDays(P.startDate,13*7)};}
 const obs=past.filter((s,i)=>!(kind==='MISSED_SESSION'&&s.id===extra.targetSessionId)).map(s=>obsFor(P,s,{response:kind==='UNDERPERFORMANCE'?'ADVERSE':kind==='OVERPERFORMANCE'?'EASIER':'COMPATIBLE'}));
 const rv=review(P,w,{kind,day,observations:obs,officialPlanState:OFFICIAL,...extra});
 const pJson=JSON.parse(JSON.stringify(P)),rJson=JSON.parse(JSON.stringify(rv)),pBefore=hash(pJson),rBefore=hash(rJson);
 const r=safe(()=>R6.evaluateProgram(pJson,rJson));
 const row={program:pname,week:w,day,kind,threw:!r.ok,error:r.ok?null:r.error};
 if(r.ok){
  const x=r.value,q=x.proposal;row.status=x.status;row.action=x.action;row.hasProposal=!!q;
  const v=[];
  if(hash(pJson)!==pBefore)v.push('programInputMutated');
  if(hash(rJson)!==rBefore)v.push('reviewInputMutated');
  if(hash(x.officialPlanState)!==hash(OFFICIAL)||hash(x.appliedState)!==hash(OFFICIAL)||x.applied!==false)v.push('officialStateChanged');
  if(hash(x.completedWork)!==hash(P.completedWork))v.push('completedWorkChanged');
  if(q){
   if(hash(q.officialPlanState)!==hash(P.officialPlanState))v.push('proposalOfficialChanged');
   if(hash(q.completedWork)!==hash(P.completedWork))v.push('proposalCompletedWorkChanged');
   if(hash(q.decisions.slice(0,P.decisions.length))!==hash(P.decisions))v.push('pastDecisionsChanged');
   const oldMap=new Map(sessionsOf(P).map(s=>[s.id,s]));
   for(const s of sessionsOf(q)){const o=oldMap.get(s.id);
    if(s.date<=asOfDate){
     if(!o)v.push('pastSessionAdded:'+s.id);
     else{if(hash(o.prescription)!==hash(s.prescription))v.push('pastPrescriptionRewritten:'+s.id);if(o.status!==s.status||o.role!==s.role||o.date!==s.date)v.push('pastSessionFieldChanged:'+s.id+':'+o.status+'>'+s.status+':'+o.role+'>'+s.role);}
    }}
   for(const [id,o] of oldMap)if(o.date<=asOfDate&&!sessionsOf(q).some(s=>s.id===id))v.push('pastSessionRemoved:'+id);
   const ids=sessionsOf(q).map(s=>s.id);if(new Set(ids).size!==ids.length)v.push('duplicateSessionIds');
   for(const wk2 of q.weeks)for(const s of wk2.sessions)if(s.date<wk2.startDate||s.date>addDays(wk2.startDate,6))v.push('sessionOutsideItsWeek:'+s.id);
   if(!R6.validProgram(q))v.push('proposalHashInvalid');
  }
  row.violations=v;if(v.length)violations.push(row);
 }else violations.push(row);
 rows.push(row);
}
// Generation must not mutate its input either.
const gi=baseIntake({id:'q-im-gen',weeks:12}),giBefore=hash(gi);R6.generateProgram(gi);const genMutated=hash(gi)!==giBefore;
// Contradiction: MISSED_SESSION naming a session the ledger shows as completed.
const P=programs.hybrid,w=2,wk=P.weeks[w];
const q=sessionsOf(P).find(s=>s.weekIndex===w&&s.role==='QUALITY')??sessionsOf(P).find(s=>s.weekIndex===w&&s.key&&s.sport==='RUN');
const asOfDate=addDays(q.date,1),done=sessionsOf(P).filter(s=>s.weekIndex===w&&s.prescription&&s.date<=asOfDate).map(s=>obsFor(P,s));
const contra=R6.evaluateProgram(P,review(P,w,{kind:'MISSED_SESSION',day:Math.round((Date.parse(asOfDate)-Date.parse(wk.startDate))/864e5),targetSessionId:q.id,observations:done}));
const keyRole=q.role,inWeek=contra.proposal?contra.proposal.weeks[w].sessions.filter(s=>s.role===keyRole&&s.status!=='SKIPPED'&&s.prescription):null;
const contradiction={target:q.id,targetRole:keyRole,ledgerSaysCompleted:contra.weekEvidence.rows.find(r=>r.sessionId===q.id)?.status,status:contra.status,action:contra.action,keyRunsOfThatRoleInWeekAfter:inWeek?inWeek.map(s=>[s.id,s.date,s.status??null,s.moved??null]):null,targetAfter:contra.proposal?contra.proposal.weeks[w].sessions.find(s=>s.id===q.id):null};
const summary={reviews:rows.length,threw:rows.filter(r=>r.threw).length,withProposal:rows.filter(r=>r.hasProposal).length,violations:violations.length,byViolation:Object.fromEntries([...new Set(violations.flatMap(v=>v.violations??['threw']).map(x=>x.split(':')[0]))].map(k=>[k,violations.filter(v=>(v.violations??['threw']).some(x=>x.split(':')[0]===k)).length])),generationInputMutated:genMutated};
write('q5-immutability.out.json',{probe:'Q5-immutability',authorityUsed:'REAL r6Authority()',summary,violations,contradiction,rows});
console.log(JSON.stringify(summary));console.log(JSON.stringify(violations.slice(0,12).map(v=>[v.program,v.week,v.day,v.kind,v.status,v.action,(v.violations??[v.error]).slice(0,4)])));
console.log('CONTRADICTION',JSON.stringify(contradiction));
