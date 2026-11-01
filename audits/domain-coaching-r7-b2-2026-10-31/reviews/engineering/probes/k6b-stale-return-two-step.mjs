// R7B1-ENG-r2 judge reproduction K6b: the late report of pre-break training arrives in one review (recorded with the confirmation question); a
// later review of the same re-entry week reports pain with an exercise and carries nothing else. Read-only; PROBE_ROOT=<tree> for other runtimes.
import {record,guard,done,reviewed,weekly,review,evaluateProgram,opts,live,addDays,obs,apply,LABEL} from './lib.mjs';
const rows=[];
guard('K6b','two-step',()=>{
 const t=reviewed({id:'k6b',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},2);
 const late=t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.day===4);weekly(t,2,{keep:s=>s.id!==late.id});
 const rep=addDays(t.p.weeks[3].startDate,3);
 const ret=apply(t,evaluateProgram(t.p,{...review(t.p,3,{day:3,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:t.p.weeks[3].startDate,endDate:addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true}}),actualLedger:t.ledger},opts));
 const sync=apply(t,evaluateProgram(t.p,{...review(t.p,3,{day:4,hour:'05:00:00',observations:[obs(t.p,late)]}),actualLedger:t.ledger},opts));
 const X=t.p.weeks[3].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>addDays(rep,1)).flatMap(s=>s.prescription.exercises.map(e=>e.id))[0]??t.p.weeks[4].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
 const pain=evaluateProgram(t.p,{...review(t.p,3,{day:4,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations:[]}),actualLedger:t.ledger},opts);
 rows.push({step:'return',status:ret.status,action:ret.action},{step:'late report alone (sync)',status:sync.status,action:sync.action,recorded:(sync.actualLedger??[]).some(o=>o.sessionId===late.id),reason:String(sync.reason).slice(0,120)},{step:'pain report, nothing else',exercise:X,status:pain.status,action:pain.action,proposal:!!pain.proposal,pending:pain.referenceState?.pending?.status??null,reason:String(pain.reason).slice(0,140)});
});
const p=rows.at(-1);
record('K6b','clinical first after a recorded late report in the re-entry week',p?.status==='CLINICAL_HUMAN_REQUIRED','a later review that reports pain with an exercise routes to a human',{label:LABEL,rows});
done('k6b-stale-return-two-step');
