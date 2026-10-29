// QRE probe Q5b: contradictory MISSED_SESSION for a session the completed-work ledger shows as executed. Real authority.
import {R6,baseIntake,review,obsFor,sessionsOf,write,addDays} from './qlib.mjs';
const P=R6.generateProgram(baseIntake({id:'q-im-e',weeks:16,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:'2027-01-24'}},strength:'RUNNING_SUPPORT'}}})).program;
const out={probe:'Q5b-missed-but-completed',authorityUsed:'REAL r6Authority()',cases:[]};
for(const w of [1,2,3,4,5,6])for(const day of [0,1,2,3]){
 const wk=P.weeks[w],asOfDate=addDays(wk.startDate,day);
 for(const t of sessionsOf(P).filter(s=>s.weekIndex===w&&s.key&&s.prescription&&s.date<=asOfDate)){
  const obs=sessionsOf(P).filter(s=>s.weekIndex===w&&s.prescription&&s.date<=asOfDate).map(s=>obsFor(P,s));
  const r=R6.evaluateProgram(P,review(P,w,{kind:'MISSED_SESSION',day,targetSessionId:t.id,observations:obs}));
  if(r.action!=='MOVE')continue;
  const week=r.proposal.weeks[w];const moved=week.sessions.find(s=>s.moved?.from===t.id);
  out.cases.push({week:w,day,target:t.id,targetRole:t.role,ledgerStatus:r.weekEvidence.rows.find(x=>x.sessionId===t.id)?.status,action:r.action,status:r.status,movedTo:moved?{id:moved.id,date:moved.date,role:moved.role,sport:moved.sport}:null,sameSportKeySessionsExecutedPlusPlanned:week.sessions.filter(s=>s.sport===t.sport&&s.role===t.role&&s.prescription).map(s=>[s.id,s.date,s.status])});
 }
}
write('q5b-missed-but-completed.out.json',out);console.log(JSON.stringify(out.cases.slice(0,6),null,0),out.cases.length);
