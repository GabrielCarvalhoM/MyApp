// QE probes O, P, Q (minor).
// O: the R7-A history short-cut accepts `superseded: true` on a NEW observation: the fact is neither accepted nor excluded (no reason
//    recorded) and is skipped before the time checks, then carried in the ledger as history.
// P: 'split-squat-bodyweight' is the LUNGE practice exercise (PRACTICE_ID) but its catalogue role is ACCESSORY: the planner marks the
//    practice row practice:true, the review's usedInWeek reads practice from e.role === 'PRACTICE' (false), so the reviewed transition
//    runs the ordinary branch for a practice row (gate, lastExecutedSets) while the projection skips it.
// Q: rotation of the CORE template (two TRUNK slots, five or more strength days): can both slots resolve to the same exercise?
import {cur,opts,intake,review,obs,rows,out} from './qe-lib.mjs';
const R=cur;
// O
const asOf='2026-11-10T21:00:00Z',fact={eventId:'o1',athleteId:'a',sessionId:'s1',observedAt:'2026-11-09T08:00:00Z',actual:{completed:true,minutes:30},response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}};
const n1=R.normalizeObservations([{...fact,superseded:true}],{athleteId:'a',asOf,maximumAgeDays:36500});
const n2=R.normalizeObservations([{...fact,eventId:'o2',observedAt:'2027-05-01T08:00:00Z',superseded:true}],{athleteId:'a',asOf,maximumAgeDays:36500});
const nOk=R.normalizeObservations([fact],{athleteId:'a',asOf,maximumAgeDays:36500});
const O={plainFact:{accepted:nOk.accepted.length,excluded:nOk.excluded.length},sameFactFlaggedSuperseded:{accepted:n1.accepted.length,excluded:n1.excluded.length,supersededRows:n1.supersededRows.length,superseded:n1.superseded.length},futureFactFlaggedSuperseded:{accepted:n2.accepted.length,excluded:n2.excluded.map(x=>x.reason),supersededRows:n2.supersededRows.length}};
// P
const g=R.generateProgram(intake({id:'qe-P',weeks:8,athlete:{goals:{run:'NONE',strength:'GENERAL'},strengthExperience:'NONE',knownExercises:[],equipment:['BODYWEIGHT']},schedule:{runDays:[],strengthDays:[0,2,4],strengthMinutes:30,longRunDay:null}}),opts),p=g.program;
const practiceRows=rows(p,0).filter(x=>x.e.exposure?.kind==='PRACTICE').map(x=>`${x.s.id} ${x.e.id} role=${x.e.role}`);
const r=R.evaluateProgram(p,review(p,0,{observations:p.weeks[0].sessions.filter(s=>s.prescription).map(s=>obs(p,s))}),opts);
const reviewed=(r.proposal??p).stateTrace[1].strength.exercises,projected=p.stateTrace[1].strength.exercises;
const P={practiceRowsWeek0:practiceRows,gatesOnPracticeIds:Object.fromEntries(Object.entries(r.gates??{}).filter(([k])=>practiceRows.some(x=>x.includes(' '+k+' ')))),
 splitSquatBodyweight:{projected:projected['split-squat-bodyweight']??null,reviewed:reviewed['split-squat-bodyweight']??null},sitToStand:{projected:projected['sit-to-stand']??null,reviewed:reviewed['sit-to-stand']??null}};
// Q
let collisions=[];
for(const equipment of [['BODYWEIGHT'],['BODYWEIGHT','BANDS']])for(const days of [[0,1,2,3,4],[0,1,2,3,4,5]]){
 const q=R.generateProgram(intake({id:'qe-Q-'+equipment.length+days.length,weeks:16,athlete:{goals:{run:'NONE',strength:'GENERAL'},strengthExperience:'INTERMEDIATE',knownExercises:[],equipment,strengthPreferences:{rotation:'EVERY_2_WEEKS'}},schedule:{runDays:[],strengthDays:days,strengthMinutes:40,longRunDay:null}}),opts).program;
 if(!q)continue;
 for(const w of q.weeks)for(const s of w.sessions)if(s.sport==='STRENGTH'&&s.prescription){const ids=s.prescription.exercises.map(e=>e.id);const d=ids.filter((x,i)=>ids.indexOf(x)!==i);if(d.length)collisions.push(`${s.id} ${s.role} [${ids.join(',')}]`);}
}
out('OPQ',{O,P,Q:{sessionsWithTheSameExerciseTwice:collisions.length,examples:collisions.slice(0,5)}});
