// QE re-check probe P3 (R7A-QE-r2, FREEZE-2): QE-R7A-12 neighbourhood. The cycle-2 change keeps the planned repetition target on HOLD
// and REGRESS only when the log "confirms the known load" (same value). A known shortfall logged at a lighter load (the athlete backed
// off one or two increments) is adopted as a new known load with the short repetitions. Planned: back squat 3x5 @ 80 kg, goal range [4,6].
// Synthetic data, DEV_TEST_ONLY authority. QE_RUNTIME=pre runs the R6 closure runtime.
import {cur,pre,opts,intake,review,obs,rows,fmt,out} from './qe-lib.mjs';
const tag=process.env.QE_RUNTIME==='pre'?'PRE_R7A':'CURRENT',R=tag==='PRE_R7A'?await pre():cur;
const p=R.generateProgram(intake({id:'qe-rc-P3',weeks:8,athlete:{exerciseRotationPreference:'FIXED'}}),opts).program;
const all=p.weeks[0].sessions.filter(s=>s.prescription),str=all.find(s=>s.sport==='STRENGTH'),sq=str.prescription.exercises.find(e=>e.id==='back-squat');
const set=(kg,reps)=>({load:{value:kg,unit:'KG',convention:'TOTAL'},reps,rir:sq.rir});
const variants={
 plannedLoad_5_3_5:[set(80,5),set(80,3),set(80,5)],
 plannedLoad_3_3_3:[set(80,3),set(80,3),set(80,3)],
 oneIncrementLighter_5_3_5:[set(77.5,5),set(77.5,3),set(77.5,5)],
 oneIncrementLighter_3_3_3:[set(77.5,3),set(77.5,3),set(77.5,3)],
 twoIncrementsLighter_4_4_2:[set(75,4),set(75,4),set(75,2)],
 oneIncrementLighter_asPrescribedReps:[set(77.5,5),set(77.5,5),set(77.5,5)]
};
const res={};
for(const [k,sets] of Object.entries(variants)){
 const list=all.map(s=>{const o=obs(p,s);if(s===str)o.actual.exercises=o.actual.exercises.map(e=>e.id==='back-squat'?{...e,sets}:e);return o;});
 const r=R.evaluateProgram(p,review(p,0,{observations:list}),opts),P=r.proposal??p,st=P.stateTrace[1].strength.exercises['back-squat'];
 res[k]={gate:r.gates?.['back-squat'],decision:`${r.status}/${r.action}`,nextState:{mode:st.mode,load:st.load,reps:st.reps},week1BackSquat:rows(P,1).filter(x=>x.e.id==='back-squat').map(({s,e})=>fmt(s,e)),
  repsBelowGoalRange:rows(P,1).filter(x=>x.e.id==='back-squat').some(x=>x.e.reps<opts.authority.policy.operational.strength.goalDoses.STRENGTH.repRange[0])};
}
out('P3',{runtime:tag,planned:`${sq.sets}x${sq.reps}@${sq.rir} ${sq.load.value} kg`,goalRepRange:opts.authority.policy.operational.strength.goalDoses.STRENGTH.repRange,variants:res});
