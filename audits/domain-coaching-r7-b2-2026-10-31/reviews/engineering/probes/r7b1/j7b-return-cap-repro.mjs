// R7B1-ENG-r1 judge reproduction J7b (QE-R7B-05 residual on the return path): week 2 of a strength-NONE athlete whose cap a schedule change
// started, before and after a short nonclinical return reported on day 3 of week 2; the same for an intake-capped athlete. Read-only;
// PROBE_ROOT=<tree> runs it on another runtime.
import {record,guard,done,program,weekly,review,evaluateProgram,opts,live,addDays,apply,A,LABEL} from './lib.mjs';
const NOV={strengthExperience:'NONE',goals:{run:'REGULAR',strength:'GENERAL'},equipment:['DUMBBELLS','BENCH'],weeks:12};
const rows=(p,w)=>p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH').map(s=>`${s.date} ${s.prescription&&s.status!=='SKIPPED'?s.templateType+(s.lighterByDesign?'(lighter)':''):'rest/skipped'}`);
const out={};
for(const [name,o,pre] of [['intake-capped',{...NOV,id:'j7b-intake',schedule:{strengthDays:[0,2,4,5]}},t=>weekly(t,1)],['schedule-capped',{...NOV,id:'j7b-sched',schedule:{strengthDays:[0,4]}},t=>{apply(t,evaluateProgram(t.p,{...review(t.p,1,{day:0,hour:'06:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4,5]}}),actualLedger:t.ledger},opts));weekly(t,1);}]])guard('J7b-'+name,'return cap',()=>{
 const t={p:program(o),ledger:[]};weekly(t,0);pre(t);
 const before=rows(t.p,2),density2=t.p.stateTrace[2].strength.density??null,repDay=addDays(t.p.weeks[2].startDate,3);
 const hist=A.historicalStateOf(t.p,{asOf:`${repDay}T05:00:00Z`,actualLedger:t.ledger},opts);
 const r=evaluateProgram(t.p,{...review(t.p,2,{day:3,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:addDays(repDay,-3),endDate:addDays(repDay,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true}}),actualLedger:t.ledger},opts);
 const d=r.proposal?.decisions.at(-1);
 out[name]={week2BeforeReturn:before,plannerDensityWeek2:density2,historyDensityAtReturn:hist?.state?.strength?.density??null,return:{status:r.status,action:r.action},returnEntryDensity:d?.interruption?.entry?.strength?.density??null,week2AfterReturn:r.proposal?rows(r.proposal,2):null,week3AfterReturn:r.proposal?rows(r.proposal,3):null,proposalDensityWeek2:r.proposal?.stateTrace?.[2]?.strength?.density??null};
});
const s=out['schedule-capped'],i=out['intake-capped'];
const uncappedAhead=x=>(x?.week2AfterReturn??[]).filter(l=>l.slice(0,10)>addDays('2026-11-16',3)).some(l=>/LOWER|UPPER/.test(l));
record('J7b','a return in the capped period keeps the cap a schedule change started',!uncappedAhead(s),'the sessions still ahead in the re-entry week stay capped (CORE, lighter by design), as for an intake-capped athlete',{label:LABEL,intakeCappedUncappedAhead:uncappedAhead(i),scheduleCappedUncappedAhead:uncappedAhead(s),cases:out});
done('j7b-return-cap-repro');
