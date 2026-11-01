// R7-C Phase 3, step 3 (companion): the 29 decisions the timeline differential (scripts/regress-r7b2.mjs --base R7B2-FREEZE-1) shows relabelled
// from KEEP/INSTANTIATE_LOGGED_LOADS or ADOPT_LOGGED_LOADS to GATED_NEXT_STEP with the C15 reason, with no prescription differing. Question: is the
// reason's stated cause ("the plan had assumed weeks with no executed evidence") true in those timelines? Three of them are rebuilt here with the
// differential's own intake and steps (return:gen:SHORT, fatigue-missed:gen, the B.2 re-entry week), and at the relabelled review we print the run
// sessions the plan held against those the decision plans, the elapsed run sessions with no execution report, and the declared interruption days.
// Read-only; prints JSON.
import {REPO,load} from './phase3-lib.mjs';
const NOW=await load(REPO),{H}=NOW;
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const intakeOf=({id,weeks=12,goals={run:'PERFORMANCE',strength:'GENERAL'},equipment=['DUMBBELLS','BENCH'],rotation='FIXED'})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks,learningConsent:true,athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals,runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60,strengthDaysPerWeek:2},equipment,knownExercises:[],knownRuns:[],exerciseRotationPreference:rotation},schedule:{runDays:[1,3,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:90}});
const runRows=(p,w)=>p.weeks[w]?.sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED').map(s=>`${s.id}=${s.role}:${s.prescription.durationMinutes}${s.progression?.value!=null?'@'+s.progression.value:''}`)??null;
function at(t,r,w){
 const P=t.p,elapsed=P.weeks.slice(0,w+1).flatMap(x=>x.sessions).filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED'),reported=new Set(t.ledger.map(o=>o.sessionId));
 const returns=P.decisions.filter(d=>d.action==='REESTABLISH').map(d=>({asOf:d.asOf,interruption:d.interruption?{startDate:d.interruption.startDate??null,endDate:d.interruption.endDate??null,days:d.interruption.days??null,class:d.interruption.class??null}:null}));
 return {decision:`${r.status}/${r.action}`,reason:r.reason,gates:r.gates,planNext:runRows(P,w+1),decisionNext:runRows(r.proposal??P,w+1),runSessionsWithoutReport:elapsed.filter(s=>!reported.has(s.id)).map(s=>`${s.id}(${s.date})`),declaredReturns:returns,weeksWithoutAnyRunReport:[...Array(w+1).keys()].filter(k=>!P.weeks[k].sessions.some(s=>s.sport==='RUN'&&reported.has(s.id)))};
}
const apply=(t,r)=>{t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const decide=(t,w,x)=>NOW.evaluateProgram(t.p,{...H.review(t.p,w,x),actualLedger:t.ledger},NOW.opts);
const out={};
// return:gen:SHORT (regress-r7b2.mjs timeline B): weeks 0-4 reviewed, a 5-day nonclinical return reported on day 0 of week 6, then weekly 6-8.
{const t={p:NOW.generateProgram(intakeOf({id:'s-gen',equipment:['DUMBBELLS','BENCH','KETTLEBELL'],weeks:12}),NOW.opts).program,ledger:[]};
 for(let w=0;w<5;w++)H.weekly(t,w);
 const end=H.addDays(t.p.weeks[6].startDate,-1);apply(t,decide(t,6,{day:0,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{reason:'work travel',reasonCategory:'TRAVEL',nonclinical:true,days:5,endDate:end}}));
 const w=6,obs=t.p.weeks[w].sessions.filter(H.live).map(s=>H.obs(t.p,s)),r=decide(t,w,{observations:obs});out['return:gen:SHORT@weekly:6']=at(t,r,w);}
// fatigue-missed:gen: weeks 0-2 reviewed; week 3: local fatigue then a missed strength session, then the weekly review of week 3.
{const t={p:NOW.generateProgram(intakeOf({id:'s-gen',equipment:['DUMBBELLS','BENCH','KETTLEBELL'],weeks:12}),NOW.opts).program,ledger:[]};
 for(let w=0;w<3;w++)H.weekly(t,w);
 const s=t.p.weeks[3].sessions.find(x=>H.live(x)&&x.sport==='STRENGTH');apply(t,decide(t,3,{day:s.day,hour:'06:00:00',kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}}));apply(t,decide(t,3,{day:6,hour:'06:00:00',kind:'MISSED_SESSION',targetSessionId:s.id}));
 const w=3,obs=t.p.weeks[w].sessions.filter(H.live).map(x=>H.obs(t.p,x)),r=decide(t,w,{observations:obs});out['fatigue-missed:gen@weekly:3']=at(t,r,w);}
// B.2 re-entry week, neighbor A:weekly: week 2's day-4 strength session left out of its review, a nonclinical return on day 3 of week 3, then the
// late report alone on day 4, then weekly 3 and 4.
{const t={p:NOW.generateProgram(intakeOf({id:'b2-reentry',equipment:['DUMBBELLS','BENCH'],weeks:12}),NOW.opts).program,ledger:[]};H.weekly(t,0);H.weekly(t,1);
 const late=t.p.weeks[2].sessions.find(s=>H.live(s)&&s.sport==='STRENGTH'&&s.day===4);H.weekly(t,2,{keep:s=>s.id!==late.id});const rep=H.addDays(t.p.weeks[3].startDate,3);
 apply(t,decide(t,3,{day:3,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:t.p.weeks[3].startDate,endDate:H.addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true}}));
 apply(t,decide(t,3,{day:4,hour:'06:00:00',observations:[H.obs(t.p,late)]}));H.weekly(t,3);
 const w=4,obs=t.p.weeks[w].sessions.filter(H.live).map(x=>H.obs(t.p,x)),r=decide(t,w,{observations:obs});out['B2:reentry:A:weekly@weekly:4']=at(t,r,w);}
console.log(JSON.stringify(out,null,1));
