// R7B1-ENG-r1 judge probe J6 (QE-R7B-R2-05 recorded as the R18 path): a two-day strength-NONE athlete moves to four days in week 1 (before the
// first block boundary). A decision on day 0 of week 2 must plan week 2 capped whenever every elapsed week received its gating weekly review
// (the R18 contract, "unreported sessions reviewed as missed"); the paths without that review are listed as the R18 path. Read-only.
import {record,guard,done,program,weekly,review,evaluateProgram,opts,live,obs,apply,A,LABEL} from './lib.mjs';
const NOV={strengthExperience:'NONE',goals:{run:'REGULAR',strength:'GENERAL'},equipment:['DUMBBELLS','BENCH'],schedule:{strengthDays:[0,4]},weeks:12};
const types=(p,w)=>p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).map(s=>s.templateType).sort().join(',');
const decide=t=>evaluateProgram(t.p,{...review(t.p,2,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'goblet-squat',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}}),actualLedger:t.ledger},opts);
const change=(t,at={day:0,hour:'06:00:00'})=>apply(t,evaluateProgram(t.p,{...review(t.p,1,{...at,kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4,5]}}),actualLedger:t.ledger},opts));
const midweek=(t,day,list)=>apply(t,evaluateProgram(t.p,{...review(t.p,1,{day,hour:'20:00:00',observations:list.map(s=>obs(t.p,s))}),actualLedger:t.ledger},opts));
const paths={
 'R18:week1-skipped':t=>{change(t);},
 'R18:week1-midweek-review-only':t=>{change(t);midweek(t,3,[]);},
 'R18:week1-partly-reported-unreviewed':t=>{change(t);midweek(t,3,t.p.weeks[1].sessions.filter(s=>live(s)&&s.date<=t.p.weeks[1].sessions.find(x=>live(x)).date));},
 'contract:week1-reviewed-nothing-reported':t=>{change(t);weekly(t,1,{keep:()=>false});},
 'contract:week1-reviewed-partly':t=>{change(t);let i=0;weekly(t,1,{keep:()=>i++%2===0});},
 'contract:week1-reviewed-all':t=>{change(t);weekly(t,1);},
 'contract:change-after-week1-review':t=>{weekly(t,1);change(t,{day:6,hour:'22:00:00'});},
 'other:week1-all-reported-unreviewed':t=>{change(t);midweek(t,6,t.p.weeks[1].sessions.filter(live));},
};
const res={};
for(const [name,make] of Object.entries(paths))guard('J6-'+name,'R2-05',()=>{
 const t={p:program({...NOV,id:'j6-'+name.replace(/[^a-z0-9]/gi,'')}),ledger:[]};weekly(t,0);make(t);
 const d=decide(t),P2=d.proposal??t.p,h=A.historicalStateOf(P2,{asOf:`${t.p.weeks[2].startDate}T06:00:00Z`,actualLedger:d.actualLedger??t.ledger},opts);
 res[name]={status:d.status,week2:types(P2,2),week3:types(P2,3),capped2:/CORE/.test(types(P2,2)),plannerDensity2:P2.stateTrace[2]?.strength?.density??null,historyDensity:h?.state?.strength?.density??null};
});
const contract=Object.entries(res).filter(([k])=>k.startsWith('contract:'));
record('J6','R2-05 occurs only off the R18 contract',contract.length===4&&contract.every(([,v])=>v.capped2),'with every elapsed week reviewed (nothing, part or all reported; change before or after the review), a decision in week 2 plans week 2 capped; the uncapped paths are those without a gating review of week 1 (R18)',{label:LABEL,paths:res});
done('j6-r205-classification');
