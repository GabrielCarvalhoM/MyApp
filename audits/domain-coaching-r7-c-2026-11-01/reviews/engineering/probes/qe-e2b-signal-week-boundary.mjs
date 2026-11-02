// QE probe E2b: a reactive signal held at the end of week b (question unanswered that week), then the first decision of week b+1 is a plain review that
// answers. The held signal must not act in week b+1 ("a week's signal acts on that week only"). Run on the freeze, and (QE_CC) on the QM-2 mutant copy
// to show the heldSignal week guard is reachable (QM-2 is not equivalent).
// Read-only. node audits/domain-coaching-r7-c-2026-11-01/reviews/engineering/probes/qe-e2b-signal-week-boundary.mjs
import {GEN,fork,step,copy,brief,RUNTIME_ROOT,runSessions,notDone} from './qe-lib.mjs';
const {B,facts}=fork(GEN,{g:0,b:7,mode:'RV',V:'MISS'}),t=copy(B);
const held=step(t,7,{day:6,hour:'22:00:00',kind:'SYSTEMIC_FATIGUE'});
// The answer covers every run up to week 8 (weeks 0-7 not done), so week 8's window is known.
const r=step(t,8,{day:0,hour:'07:00:00',observations:[...facts,...runSessions(t.p,7,8).map(s=>notDone(t.p,s))]});
console.log(JSON.stringify({probe:'QE-E2b held signal at a week boundary',runtime:RUNTIME_ROOT,held:{...brief(held),signal:held.referenceState?.pending?.signal?{kind:held.referenceState.pending.signal.kind,weekIndex:held.referenceState.pending.signal.weekIndex}:null},answerNextWeek:brief(r),replayedAcrossWeek:/re-evaluated with the answer/.test(r.reason??'')},null,1));
