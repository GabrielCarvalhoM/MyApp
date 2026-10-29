// QE re-check probe P2 (R7A-QE-r2, FREEZE-2): the return-day boundary (QE-R7A-02) in the SHORT class. returnAfterPause now treats a
// same-day session without a report as ahead (aheadOf) for the re-plan, but its SHORT rule "the first run back is easy" still selects
// the first QUALITY with s.date > asOfLocal. Same interruption facts reported the evening before (Wednesday 21:00) and on the morning of
// the quality day (Thursday 05:00, quality run at 08:00, unreported). MODERATE control on the same morning.
// Synthetic data, DEV_TEST_ONLY authority. QE_RUNTIME=pre runs the R6 closure runtime.
import {cur,pre,opts,intake,review,obs,addDays,out} from './qe-lib.mjs';
const tag=process.env.QE_RUNTIME==='pre'?'PRE_R7A':'CURRENT',R=tag==='PRE_R7A'?await pre():cur;
const res={runtime:tag};
for(const cls of ['SHORT','MODERATE']){
 let p=R.generateProgram(intake({id:'qe-rc-P2-'+cls,weeks:12,athlete:{exerciseRotationPreference:'FIXED'}}),opts).program,ledger=[];
 const W=5;
 for(let w=0;w<W;w++){const list=w<W-(cls==='SHORT'?0:2)?p.weeks[w].sessions.filter(s=>s.prescription).map(s=>obs(p,s)):[];const r=R.evaluateProgram(p,review(p,w,{observations:list,actualLedger:ledger}),opts);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}
 const s0=p.weeks[W].startDate,wed=addDays(s0,2),thu=addDays(s0,3),days=cls==='SHORT'?5:16;
 // Interruption ends on Wednesday (day 2) in both reports; only the clock of the report differs.
 const i={days,startDate:addDays(wed,-(days-1)),endDate:wed,reasonCategory:'TRAVEL',reason:'Work travel'};
 const done=p.weeks[W].sessions.filter(s=>s.prescription&&s.date<addDays(s0,-0)&&false);
 const before=p.weeks[W].sessions.filter(s=>s.day>=3).map(s=>`d${s.day} ${s.turn} ${s.sport} ${s.role}${s.prescription?.durationMinutes?':'+s.prescription.durationMinutes:''}`);
 const mk=(asOf)=>({...review(p,W,{day:2,kind:'RETURN_AFTER_PAUSE',interruption:i,observations:[],actualLedger:ledger}),asOf,eligibility:{status:'NONCLINICAL_CONFIRMED',assessedAt:wed,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false}});
 const line=P=>P.weeks[W].sessions.filter(s=>s.day>=3&&s.sport==='RUN').map(s=>`d${s.day} ${s.role}${s.prescription?':'+s.prescription.family+':'+s.prescription.durationMinutes:''}`);
 const a=R.evaluateProgram(p,mk(`${wed}T21:00:00Z`),opts),b=R.evaluateProgram(p,{...mk(`${thu}T05:00:00Z`),weekIndex:W},opts);
 const A=a.proposal??p,B=b.proposal??p;
 res[cls]={plannedFromThursday:before,
  reportedWednesday21:{decision:`${a.status}/${a.action}`,fromWeek:A.decisions.at(-1)?.fromWeek,reason:a.reason,runsFromThursday:line(A)},
  reportedThursday05:{decision:`${b.status}/${b.action}`,fromWeek:B.decisions.at(-1)?.fromWeek,reason:b.reason,runsFromThursday:line(B)},
  firstRunBackIsQualityOnThursdayMorningReport:line(B)[0]?.includes('QUALITY')??null,
  sameRunsEitherClock:JSON.stringify(line(A))===JSON.stringify(line(B))};
}
out('P2',res);
