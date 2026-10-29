// P02 (reviewer-owned, Property C on the run, declared boundary E10): outside RETURN/RESTART the PlanningView takes the run's targets and unlock
// permissions from PlanningProjection (planningBase; contract E10). Measure the consequence on IDENTICAL ledgers, the design of the judge's Q11c
// (strength reps, QE-R7ASM-03) and Q4 (restart, QE-R7ASM-02), on the run:
//  (a) EASY runner (default intake): weeks 0-3 trained and reviewed; weeks 4 and 5: nothing executed. U: week 4 not reviewed, week 5 reviewed.
//      R: both reviewed. The decision at week 5's review knows both weeks were empty.
//  (b) WALK_JOG athlete (runExperience NONE): the same.
//  (c) WALK_JOG athlete, LONG (35-day) return (walk/jog has no re-entry mode: the return is a ladder step back): nothing executed in the re-entry
//      week R nor R+1. U: R not reviewed, R+1 reviewed. C: both reviewed.
import * as L from './qe-r7asc-lib.mjs';
const out={probe:'qe-r7asc-P02-run-view-e10',root:L.ROOT_USED};
const runOf=st=>st?{mode:st.mode,walkStep:st.walkStep??null,restart:st.restart??null,easy:st.easy??null,long:st.long??null,walks:st.walks??null,qualityStep:st.qualityStep??null,easyWeeksDone:st.easyWeeksDone??null}:null;
const runRows=(t,w)=>t.p.weeks[w].sessions.filter(s=>L.live(s)&&s.sport==='RUN').map(s=>`${s.role}:${s.prescription.durationMinutes}${s.progression?.dimension?':'+s.progression.dimension+'='+s.progression.value:''}`).join(' ');
const ledgerHash=t=>L.V.hash(t.ledger.filter(o=>!o.superseded).map(o=>({s:o.sessionId,a:o.actual,t:o.observedAt})));
const WJ={athlete:{goals:{run:'REGULAR',strength:'GENERAL'},runExperience:'NONE',strengthExperience:'NOVICE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,strengthDaysPerWeek:0},knownExercises:[]},schedule:{runDays:[1,3,6],strengthDays:[2,5],runMinutes:30,strengthMinutes:30,longRunDay:6,longRunMinutes:30}};
function emptyWeeks(id,o){const res={};for(const cell of ['U','R']){
 const g=L.R.generateProgram(L.intake({id,...o}),L.opts);if(!g.program)return {error:g.status+' '+g.reason};const t={p:g.program,ledger:[]};
 for(let w=0;w<4;w++)L.weekly(t,w);
 if(cell==='R')L.weekly(t,4,()=>false);
 L.weekly(t,5,()=>false);
 res[cell]={ledger:ledgerHash(t),historyRun6:runOf(L.history(t,6,0).state.run),planRun6:runOf(t.p.stateTrace[6].run),rows6:runRows(t,6),rows7:runRows(t,7),lastRowsExecuted3:runRows(t,3)};}
 return {...res,identicalLedgers:res.U.ledger===res.R.ledger,historyEqual:JSON.stringify(res.U.historyRun6)===JSON.stringify(res.R.historyRun6),rowsDiffer:res.U.rows6!==res.R.rows6};}
out.a_easy=emptyWeeks('qe-p02a',{});
out.b_walkjog=emptyWeeks('qe-p02b',WJ);
{const res={};for(const cell of ['U','C']){
 const g=L.R.generateProgram(L.intake({id:'qe-p02c',...WJ}),L.opts),t={p:g.program,ledger:[]};for(let w=0;w<3;w++)L.weekly(t,w);
 const s0=t.p.weeks[3].startDate,end=L.addDays(s0,34),reportDay=L.addDays(end,1),rw=t.p.weeks.findIndex(x=>reportDay>=x.startDate&&reportDay<=L.addDays(x.startDate,6));
 const before=runOf(L.history(t,3,0).state.run);
 L.step(t,L.at(t.p,rw,Math.round((Date.parse(reportDay)-Date.parse(t.p.weeks[rw].startDate))/864e5),'06:00:00',L.brk(s0,end)));
 const d=t.p.decisions.at(-1),R=d.fromWeek;
 if(cell==='C')L.weekly(t,R,()=>false);
 L.weekly(t,R+1,()=>false);
 res[cell]={fromWeek:R,class:d.interruption.class,runBeforeBreak:before,entryRun:runOf(d.interruption.entry.run),ledger:ledgerHash(t),historyRunR2:runOf(L.history(t,R+2,0).state.run),planRunR2:runOf(t.p.stateTrace[R+2].run),rowsR:runRows(t,R),rowsR2:runRows(t,R+2)};}
 out.c_walkjogLongReturn={...res,identicalLedgers:res.U.ledger===res.C.ledger,historyEqual:JSON.stringify(res.U.historyRunR2)===JSON.stringify(res.C.historyRunR2),rowsDiffer:res.U.rowsR2!==res.C.rowsR2};}
console.log(JSON.stringify(out,null,1));
