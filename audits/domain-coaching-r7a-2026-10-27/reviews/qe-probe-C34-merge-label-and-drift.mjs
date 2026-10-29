// QE probe C3/C4 (claim 6; provenance leak and its consequence). C3: the same subset second report, provider label only changed
// ('WEARABLE_WATCH' vs 'SMARTWATCH', no activityId or quality): the label prefix decides whether it outranks the manual report and
// replaces its exercise list. C4: an athlete who logs every session manually while a watch adds an agreeing report that recognises
// only the first exercise: the other exercises are never "performed" for the transition, and after more than 28 days they are
// re-established by effort although they were done every week.
import {cur,opts,intake,review,obs,rows,fmt,out} from './qe-lib.mjs';
const R=cur;
const decisionKey=r=>JSON.stringify({status:r.status,action:r.action,gates:r.gates??null,weeks:r.proposal?r.proposal.weeks.map(w=>w.sessions.map(s=>[s.id,s.status,s.prescription??null])):null});
const p=R.generateProgram(intake({id:'qe-C3',weeks:8,athlete:{exerciseRotationPreference:'FIXED'}}),opts).program;
const all=p.weeks[0].sessions.filter(s=>s.prescription),str=all.find(s=>s.sport==='STRENGTH');
const base=all.map((s,i)=>obs(p,s,{eventId:'qe-c3-'+i}));
const second=provider=>({...obs(p,str,{only:[str.prescription.exercises[0].id]}),eventId:'qe-c3-2nd-'+provider,observedAt:str.date+'T19:30:00Z',source:{provider}});
const ev=list=>R.evaluateProgram(p,review(p,0,{observations:list}),opts);
const k0=decisionKey(ev(base)),a=ev([...base,second('WEARABLE_WATCH')]),b=ev([...base,second('SMARTWATCH')]);
out('C3',{baselineVsWearablePrefix:decisionKey(a)===k0,baselineVsOtherLabel:decisionKey(b)===k0,gatesWearablePrefix:a.gates,gatesOtherLabel:b.gates});
// C4: twelve weeks, every strength session logged manually in full plus a watch report (activityId) of the first exercise only.
let q=R.generateProgram(intake({id:'qe-C4',weeks:12,athlete:{exerciseRotationPreference:'FIXED'}}),opts).program,ledger=[];const log=[];
for(let w=0;w<11;w++){
 const list=q.weeks[w].sessions.filter(s=>s.prescription).flatMap(s=>{const m=obs(q,s);if(s.sport!=='STRENGTH')return [m];return [m,{...obs(q,s,{only:[s.prescription.exercises[0].id]}),eventId:m.eventId+'-watch',observedAt:s.date+'T19:40:00Z',source:{provider:'GENERIC_WATCH',activityId:'act-'+s.id,quality:'WEARABLE_FULL'}}];});
 const r=R.evaluateProgram(q,review(q,w,{observations:list,actualLedger:ledger}),opts);log.push(`${w}:${r.status}/${r.action}`);ledger=r.actualLedger??ledger;if(r.proposal)q=r.proposal;
}
const reest=[];for(let w=0;w<12;w++)for(const {s,e} of rows(q,w))if(['REESTABLISH','UNLOGGED'].includes(e.exposure?.kind))reest.push(fmt(s,e));
out('C4',{log:log.join(' '),rowsReestablishedOrUnloggedAlthoughDoneWeekly:reest.length,examples:reest.slice(0,8),lastPerformedAtWeek6:Object.fromEntries(Object.entries(q.stateTrace[6].strength.exercises).map(([id,e])=>[id,e.lastPerformed??null]))});
