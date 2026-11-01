// R7-C Phase 3, step 7: the Phase 2 HISTORY observation. After weeks 2-6 with no run report, historicalStateOf(...).state.run.long is 70 when those
// weeks were never reviewed (NONE) and 65 when they were reviewed empty (EMPTY), while the facts (run.mode, run.achieved, longestContinuous) agree.
// state.run is the evidence reducer's state, the same reducer the decisions plan from (P7). Classification test: every decision kind that starts
// from that state, at week 7, must decide alike on NONE and EMPTY (the metamorphic relation "empty review = no review"): status, question and the
// run and strength prescriptions it leaves in force for weeks 7-9. Read-only; prints JSON.
import {REPO,load} from './phase3-lib.mjs';
const rt=await load(REPO),{H}=rt;
const BASE={id:'r7c-g01',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:H.FULL,knownExercises:[H.K('back-squat',3,5,82.5)]};
const apply=(t,r)=>{t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const decide=(t,w,x={})=>rt.evaluateProgram(t.p,{...H.review(t.p,w,x),actualLedger:t.ledger},rt.opts);
function gap(mode){const t={p:H.program(BASE),ledger:[]};for(let w=0;w<2;w++)H.weekly(t,w);for(let w=2;w<7;w++)if(mode==='EMPTY')apply(t,decide(t,w));return t;}
const at=(t,w)=>rt.historicalStateOf(t.p,{asOf:`${t.p.weeks[w].startDate}T06:00:00Z`,actualLedger:t.ledger},rt.opts);
const rows=(P,w)=>P.weeks[w]?P.weeks[w].sessions.filter(s=>s.prescription&&s.status!=='SKIPPED').map(s=>s.sport==='RUN'?`${s.role}:${s.prescription.durationMinutes}`:`${s.role}:`+s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}:${e.load.mode}:${e.load.value??'-'}`).join(',')).join('/'):null;
const view=(t,r)=>({status:r.status,action:r.action,question:r.question?{kind:r.question.kind,unreported:r.question.unreported}:null,plan:r.status==='ASK'||r.status==='CLINICAL_HUMAN_REQUIRED'?null:[7,8,9].map(k=>rows(r.proposal??t.p,k)),fromWeek:planned(t,r),plannedWeeks:r.proposal?[7,8,9].filter(k=>k>=(planned(t,r)??99)).map(k=>rows(r.proposal,k)):null});
const sameRun=(t,role,minutes)=>{const x=t.p.weeks[7].sessions.find(z=>H.live(z)&&z.sport==='RUN'&&z.role===role);return {eventId:'h-same-'+x.id,athleteId:t.p.athleteId,sessionId:x.id,observedAt:x.date+'T08:00:00Z',actual:{completed:true,minutes},response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}};};
// The weeks a decision plans: from next week for a weekly review at the end of week 7, from this week for a change on its day 0.
const planned=(t,r)=>r.proposal?(r.proposal.decisions.at(-1)?.fromWeek??null):null;
const late=(t,V)=>[2,3,4,5,6].flatMap(w=>t.p.weeks[w].sessions.filter(s=>H.live(s)&&s.sport==='RUN').map(s=>V==='EXEC'?H.obs(t.p,s):{eventId:'h-nd-'+s.id,athleteId:t.p.athleteId,sessionId:s.id,observedAt:`${s.date}T08:00:00Z`,actual:{completed:false},response:{}}));
const KINDS={
 weekly:t=>decide(t,7),
 weeklyExecutedWeek7:t=>decide(t,7,{observations:t.p.weeks[7].sessions.filter(H.live).map(s=>H.obs(t.p,s))}),
 answerExecuted:t=>decide(t,7,{observations:late(t,'EXEC')}),
 answerNotDone:t=>decide(t,7,{observations:late(t,'MISS')}),
 returnLong35:t=>decide(t,7,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:t.p.weeks[2].startDate,endDate:H.addDays(t.p.weeks[2].startDate,34),days:35,reasonCategory:'WORK',reason:'work',nonclinical:true}}),
 returnModerate14:t=>decide(t,7,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:t.p.weeks[5].startDate,endDate:H.addDays(t.p.weeks[5].startDate,13),days:14,reasonCategory:'WORK',reason:'work',nonclinical:true}}),
 returnShort6:t=>decide(t,7,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{days:6,reasonCategory:'WORK',reason:'work',nonclinical:true}}),
 scheduleChange:t=>decide(t,7,{day:0,hour:'07:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}}),
 equipmentChange:t=>decide(t,7,{day:0,hour:'07:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']}}),
 substitution:t=>decide(t,7,{day:0,hour:'07:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'back-squat',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}}),
 goalChange:t=>decide(t,7,{day:0,hour:'07:00:00',kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}}),
 // Identical facts in week 7 on both (explicit minutes; nothing else reported), so no question fires and the next week plans from the reducer state.
 sameFactsEasyOnly:t=>decide(t,7,{observations:[sameRun(t,'EASY',45)]}),
 sameFactsEasyAndLong:t=>decide(t,7,{observations:[sameRun(t,'EASY',45),sameRun(t,'LONG',65)]})
};
const none=gap('NONE'),empty=gap('EMPTY'),hn=at(none,7),he=at(empty,7);
const history={NONE:{facts:hn.run,state:{long:hn.state.run.long,easy:hn.state.run.easy,qualityStep:hn.state.run.qualityStep,easyWeeksDone:hn.state.run.easyWeeksDone??0}},EMPTY:{facts:he.run,state:{long:he.state.run.long,easy:he.state.run.easy,qualityStep:he.state.run.qualityStep,easyWeeksDone:he.state.run.easyWeeksDone??0}},factsEqual:JSON.stringify(hn.run)===JSON.stringify(he.run),storedPlanWeek7:{NONE:rows(none.p,7),EMPTY:rows(empty.p,7)}};
const decisions={};for(const [k,f] of Object.entries(KINDS)){let a,b;try{a=view(none,f(none));}catch(e){a={error:String(e.message).slice(0,200)};}try{b=view(empty,f(empty));}catch(e){b={error:String(e.message).slice(0,200)};}decisions[k]={NONE:a,EMPTY:b,same:JSON.stringify(a)===JSON.stringify(b),samePlannedWeeks:JSON.stringify([a.status,a.question,a.plannedWeeks])===JSON.stringify([b.status,b.question,b.plannedWeeks])};}
console.log(JSON.stringify({check:'R7C-P3-HISTORY-FINDING',history,decisions,allDecisionsAlike:Object.values(decisions).every(d=>d.same),allPlannedWeeksAlike:Object.values(decisions).every(d=>d.samePlannedWeeks)},null,1));
