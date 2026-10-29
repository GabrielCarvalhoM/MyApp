// QE probes C, D, E, F (canonical input stability, claim 6): duplicates, contradictions and corrections of one session.
// C: an agreeing second report from a better source that logs fewer exercises (or no loads) replaces the whole exercise list.
// D: two same-rank reports that agree on sets and loads but contradict on reps or RIR are merged by arrival order, not quarantined.
// E: a correction that targets the eventId of a merged duplicate is valid in its review but INVALID_CORRECTION_CHAIN once carried.
// F: an exact replay, in a later review, of a report that was merged with a complementary duplicate is quarantined as a conflict.
import {cur,pre,opts,intake,review,obs,addDays,out} from './qe-lib.mjs';
const R=process.env.QE_RUNTIME==='pre'?await pre():cur;
const decisionKey=r=>JSON.stringify({status:r.status,action:r.action,gates:r.gates??null,weeks:r.proposal?r.proposal.weeks.map(w=>w.sessions.map(s=>[s.id,s.status,s.prescription??null])):null,questions:(r.loadQuestions??[]).map(q=>[q.exerciseId,q.reason])});
const p=R.generateProgram(intake({id:'qe-C',weeks:8,athlete:{exerciseRotationPreference:'FIXED'}}),opts).program;
const all=p.weeks[0].sessions.filter(s=>s.prescription),str=all.find(s=>s.sport==='STRENGTH'),run=all.find(s=>s.sport==='RUN'&&s.role==='EASY');
const base=all.map((s,i)=>obs(p,s,{eventId:'qe-c-'+i}));
const at=(o,hhmm)=>({...o,observedAt:o.observedAt.slice(0,10)+'T'+hhmm+':00Z'});
const ev=list=>R.evaluateProgram(p,review(p,0,{observations:list}),opts);
const k0=ev(base),key0=decisionKey(k0),iStr=all.indexOf(str);
const watch=(o,id)=>({...o,eventId:id,source:{provider:'GENERIC_WATCH',activityId:'act-'+id,quality:'WEARABLE_FULL'}});
// C1: the watch recognised only the main squat (same sets, reps, load and RIR as the manual log).
const subset=watch(at(obs(p,str,{only:['back-squat']}),'19:30'),'qe-c-watch-subset');
const c1=ev([...base,subset]);
// C2: the watch logged every exercise with sets and reps but no load.
const noLoad=watch(at(obs(p,str,{over:Object.fromEntries(str.prescription.exercises.map(e=>[e.id,{load:null}]))}),'19:30'),'qe-c-watch-noload');
const c2=ev([...base,noLoad]);
const logsOf=r=>Object.fromEntries(Object.entries(r.weekEvidence.rows.find(x=>x.sessionId===str.id).logs).map(([id,l])=>[id,{load:l.load,reps:l.reps,setsDone:l.setsDone}]));
out('C',{runtime:process.env.QE_RUNTIME==='pre'?'PRE_R7A':'CURRENT',session:str.id,prescribed:str.prescription.exercises.map(e=>e.id),
 baseline:{status:k0.status,action:k0.action,gates:k0.gates,logs:logsOf(k0)},
 withAgreeingSubsetWatchReport:{duplicates:c1.provenance.duplicates,conflicts:c1.provenance.conflicts.length,status:c1.status,action:c1.action,gates:c1.gates,logs:logsOf(c1),decisionUnchanged:decisionKey(c1)===key0},
 withAgreeingNoLoadWatchReport:{duplicates:c2.provenance.duplicates,conflicts:c2.provenance.conflicts.length,status:c2.status,action:c2.action,gates:c2.gates,logs:logsOf(c2),decisionUnchanged:decisionKey(c2)===key0}});
// D: same sets and loads, contradictory reps (squat planned 5: 3 vs 5) or RIR (0 vs 3), two manual-rank reports, both arrival orders.
const variant=(o,id,hh,over)=>({...at(obs(p,str,{over}),hh),eventId:id,source:{provider:'PHONE_APP'}});
const dOrder=(first,second)=>{const list=[...base.filter((_,i)=>i!==iStr),first,second];const r=ev(list);return {conflicts:r.provenance.conflicts.length,duplicates:r.provenance.duplicates.map(d=>d.reason),gateSquat:r.gates?.['back-squat']??null,squatLog:logsOf(r)['back-squat'],key:decisionKey(r)};};
const reps3=h=>variant(null,'qe-d-reps3-'+h,h,{'back-squat':{reps:3}}),reps5=h=>variant(null,'qe-d-reps5-'+h,h,{'back-squat':{reps:5}});
const d1=dOrder(reps3('18'),reps5('20')),d2=dOrder(reps5('18'),reps3('20'));
const rir0=h=>variant(null,'qe-d-rir0-'+h,h,{'back-squat':{rir:0}}),rir3=h=>variant(null,'qe-d-rir3-'+h,h,{'back-squat':{rir:3}});
const d3=dOrder(rir0('18'),rir3('20')),d4=dOrder(rir3('18'),rir0('20'));
out('D',{reps:{threeArrivesFirst:{...d1,key:undefined},fiveArrivesFirst:{...d2,key:undefined},sameDecisionEitherOrder:d1.key===d2.key},rir:{zeroArrivesFirst:{...d3,key:undefined},threeArrivesFirst:{...d4,key:undefined},sameDecisionEitherOrder:d3.key===d4.key}});
// E: manual run report M, the watch's agreeing report W (merged into M), then the athlete corrects the watch's record (correctionOf W).
const day6=addDays(p.weeks[0].startDate,6);
const M={eventId:'qe-e-M',athleteId:p.athleteId,sessionId:run.id,observedAt:run.date+'T08:00:00Z',actual:{completed:true,minutes:run.prescription.durationMinutes},response:{...obs(p,run).response}};
const Wt={...M,eventId:'qe-e-W',observedAt:run.date+'T08:05:00Z',source:{provider:'GENERIC_WATCH',activityId:'act-e',quality:'WEARABLE_FULL'},actual:{completed:true,minutes:run.prescription.durationMinutes+1}};
const C={...M,eventId:'qe-e-C',correctionOf:'qe-e-W',correctedAt:run.date+'T12:00:00Z',actual:{completed:true,minutes:run.prescription.durationMinutes+20}};
const n=(list,prior,asOf)=>R.normalizeObservations?R.normalizeObservations(list,{athleteId:p.athleteId,asOf,maximumAgeDays:36500,prior}):cur.normalizeObservations(list,{athleteId:p.athleteId,asOf,maximumAgeDays:36500,prior});
const live=x=>x.accepted.filter(o=>o.sessionId===run.id).map(o=>[o.eventId,o.actual.minutes]);
const carry=x=>[...x.accepted,...(x.supersededRows??[])];
const n1=cur.normalizeObservations([M,Wt,C],{athleteId:p.athleteId,asOf:day6+'T21:00:00Z',maximumAgeDays:36500});
const n2=cur.normalizeObservations([],{athleteId:p.athleteId,asOf:addDays(day6,1)+'T21:00:00Z',maximumAgeDays:36500,prior:carry(n1)});
// End to end: review of week 0 (all three facts), then a review of week 1 carrying the ledger.
const e1=R.evaluateProgram(p,review(p,0,{observations:[...base.filter((_,i)=>all[i]!==run),M,Wt,C]}),opts),P1=e1.proposal??p;
const e2=R.evaluateProgram(P1,review(P1,1,{observations:[],actualLedger:e1.actualLedger}),opts);
const liveL=r=>r.actualLedger.filter(o=>o.sessionId===run.id&&!o.superseded).map(o=>[o.eventId,o.actual.minutes]);
out('E',{normalize:{firstReview:{live:live(n1),superseded:n1.superseded,duplicates:n1.duplicates.map(d=>[d.eventId,d.mergedInto]),excluded:n1.excluded.map(x=>[x.eventId,x.reason])},carriedReview:{live:live(n2),excluded:n2.excluded.map(x=>[x.eventId,x.reason])},idempotent:JSON.stringify(live(n1))===JSON.stringify(live(n2))},
 endToEnd:{week0Review:{live:liveL(e1)},week1Review:{live:liveL(e2),excluded:e2.provenance.excluded.map(x=>[x.eventId,x.reason])}}});
// F: review 1 (day 6, 20:00) merges M and W; review 2 the same evening re-sends M exactly as the client stored it (a sync retry).
const f1=R.evaluateProgram(p,{...review(p,0,{observations:[...base.filter((_,i)=>all[i]!==run),M,Wt]}),asOf:day6+'T20:00:00Z'},opts);
const f2a=R.evaluateProgram(p,review(p,0,{observations:[],actualLedger:f1.actualLedger}),opts);
const f2b=R.evaluateProgram(p,review(p,0,{observations:[structuredClone(M)],actualLedger:f1.actualLedger}),opts);
const rowOf=r=>r.weekEvidence.rows.find(x=>x.sessionId===run.id);
out('F',{review1:{duplicates:f1.provenance.duplicates.map(d=>[d.eventId,d.mergedInto,d.reason]),runRow:rowOf(f1).status},
 review2WithoutReplay:{conflicts:f2a.provenance.conflicts,runRow:rowOf(f2a).status,status:f2a.status,action:f2a.action},
 review2WithExactReplayOfM:{conflicts:f2b.provenance.conflicts,excluded:f2b.provenance.excluded.map(x=>[x.eventId,x.reason]),runRow:rowOf(f2b).status,status:f2b.status,action:f2b.action,gates:f2b.gates},
 replayChangesDecision:decisionKey(f2a)!==decisionKey(f2b)});
