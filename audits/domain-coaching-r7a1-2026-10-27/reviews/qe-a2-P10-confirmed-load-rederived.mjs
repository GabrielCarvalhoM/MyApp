// R7A1-QE-r1 P10: C3 "the start of next week follows one rule": the evidence rule other handlers apply once the week is complete
// (evidenceStart) reads the *current* review's load confirmations (SSCTR D45), which are not stored. A weekly review that adopts first
// logged loads because the athlete confirmed them, then a change later that evening which re-plans next week from the week's evidence
// (equipment, schedule or goal change, with no confirmations of its own): does next week keep the confirmed loads, or do they go back to
// "choose by effort, confirm the load"? Oracle: next week's strength state for the confirmed exercises equals the weekly review's.
// Synthetic data, DEV_TEST_ONLY authority, prints only.
import {runtime,make,line,at,obs,print} from './qe-a2-lib.mjs';
const out={probe:'R7A1-QE-P10',cases:{}};
for(const tag of ['A1','F2']){
 const RT=await runtime(tag),H=make(RT),{R,opts}=RT,w=0;
 const t=H.start({id:'qa1-p10',schedule:{runDays:[1,3,6],strengthDays:[2,5],longRunDay:6}},0);
 const est=t.p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises.filter(e=>e.load.mode==='ESTABLISH').map(e=>e.id));
 const ids=[...new Set(est)],reports=t.p.weeks[w].sessions.filter(s=>s.prescription).map(s=>obs(t.p,s));
 const conf=ids.map(id=>({exerciseId:id,value:20,unit:'KG',convention:t.p.weeks[w].sessions.flatMap(s=>s.prescription?.exercises??[]).find(e=>e.id===id).load.convention}));
 const reviewed={p:t.p,ledger:[]},r=R.evaluateProgram(reviewed.p,{...at(reviewed.p,w,6,'21:00',{kind:'WEEKLY_REVIEW',observations:reports,loadConfirmations:conf}),actualLedger:[]},opts);reviewed.ledger=r.actualLedger;if(r.proposal)reviewed.p=r.proposal;
 const st=P=>Object.fromEntries(ids.map(id=>{const e=P.stateTrace[w+1].strength.exercises[id];return [id,e?`${e.mode} load=${e.load} pending=${e.pendingLoad??'-'}`:'none'];}));
 const C={establishedByEffort:ids,review:{status:r.status+'/'+r.action,next:st(reviewed.p),questions:(r.loadQuestions??[]).map(q=>q.exerciseId+':'+q.reason)}};
 for(const [k,x] of Object.entries({EQUIPMENT_ADD:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK','KETTLEBELL']}},EQUIPMENT_SWAP:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']}},SCHEDULE_NEXT:{kind:'SCHEDULE_CHANGE',changes:{runDays:[0,3,6],longRunDay:6}},GOAL_NEXT:{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}}})){
  const T=H.copy(reviewed),l=H.ev(T,at(T.p,w,6,'22:00',x));const now=st(T.p);C[k]={log:l,next:now,confirmedKept:JSON.stringify(now)===JSON.stringify(C.review.next),nextWeekRows:line(T.p,w+1).filter(r=>r.includes('STRENGTH'))};
 }
 C.reviewNextWeekRows=line(reviewed.p,w+1).filter(r=>r.includes('STRENGTH'));
 out.cases[tag]=C;
}
print(out);
