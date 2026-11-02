// SSCTR CC recheck, probe CC8 (item 4): the r7a-cycle2.test.mjs:111 fixture (an equipment change with dates the plan cannot use, on day 0 of
// week 2, weeks 0-1 never reported, the intake's 50-minute run the only recorded run). Status, validity, question, the run doses of weeks 2-3
// stored and proposed, the strength rows the change names (not applied), on HEAD (R7C-FREEZE-2) and R7C-FREEZE-1, plus the same fixture with
// weeks 0-1 reported as prescribed (nothing credited). Read-only; prints JSON.
import {runtimes,FREEZE_1} from './cc-lib.mjs';
const {rt,cleanup}=await runtimes([['F1',FREEZE_1]]);
const out={check:'SSCTR-CC8-R7A-CYCLE2-111',cases:{}};
for(const [label,R] of Object.entries(rt)){const H=R.H;
 const intake={...H.intake({id:'t7a2-dates',weeks:12,goals:{run:'PERFORMANCE',strength:'STRENGTH'},recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[H.K('back-squat',3,5,80),H.K('db-bench-press',3,8,18,'PER_HAND')],schedule:{runMinutes:50,strengthMinutes:50,longRunMinutes:80}})};
 const p=R.generateProgram(intake,R.opts).program,W=2,from=p.weeks[3].startDate,runs=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='RUN'&&H.live(s)).map(s=>`${s.role}:${s.prescription.durationMinutes}`).join('/');
 const barbell=(P,w)=>P.weeks[w].sessions.filter(H.live).flatMap(s=>s.prescription.exercises??[]).some(e=>e.equipment?.includes('BARBELL'));
 for(const [f,to] of [[from,'soon'],[from,'2026-13-45'],[from,'2026-11-01'],['next week',H.addDays(from,6)]]){
  const r=R.evaluateProgram(p,H.review(p,W,{day:0,kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:f,to}}),R.opts);
  out.cases[`${label} ${f}..${to}`]={status:r.status,validity:r.planValidity?.status,question:r.question?.kind??r.missingInputs??null,reason:String(r.reason??'').slice(0,160),storedW2:runs(p,2),storedW3:runs(p,3),proposedW2:r.proposal?runs(r.proposal,2):null,proposedW3:r.proposal?runs(r.proposal,3):null,barbellWeek3:r.proposal?barbell(r.proposal,3):barbell(p,3)};
 }
}
cleanup();console.log(JSON.stringify(out,null,1));
