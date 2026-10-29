// QE probe R (claim 5): a set without a usable repetition count is unknown. Variants on the main squat of week 0: all sets without reps,
// mixed known and unknown (known ones meeting the target), reps as a string, negative reps, null reps, and a known shortfall. Expected:
// unknown -> HOLD with no regression and no rep or load adoption; a known shortfall -> HOLD (target missed).
import {cur,opts,intake,review,obs,out} from './qe-lib.mjs';
const R=cur;
const p=R.generateProgram(intake({id:'qe-R',weeks:8,athlete:{exerciseRotationPreference:'FIXED'}}),opts).program;
const all=p.weeks[0].sessions.filter(s=>s.prescription),str=all.find(s=>s.sport==='STRENGTH'),sq=str.prescription.exercises.find(e=>e.id==='back-squat');
const withSets=sets=>all.map(s=>{const o=obs(p,s);if(s===str)o.actual.exercises=o.actual.exercises.map(e=>e.id==='back-squat'?{...e,sets}:e);return o;});
const L={value:sq.load.value,unit:'KG',convention:'TOTAL'},set=(reps)=>({load:L,rir:sq.rir,...(reps===undefined?{}:{reps})});
const variants={allUnknown:[set(),set(),set()],mixedKnownMeets:[set(5),set(),set(5)],stringReps:[set('5'),set('5'),set('5')],negativeReps:[set(-1),set(-1),set(-1)],nullReps:[set(null),set(null),set(null)],knownShortfall:[set(5),set(3),set(5)],asPrescribed:[set(5),set(5),set(5)]};
const res={};for(const [k,sets] of Object.entries(variants)){const r=R.evaluateProgram(p,review(p,0,{observations:withSets(sets)}),opts),st=(r.proposal??p).stateTrace[1].strength.exercises['back-squat'];res[k]={gate:r.gates?.['back-squat'],why:(r.reasons??[]).find?.(x=>x.key==='back-squat')?.why??null,log:r.weekEvidence.rows.find(x=>x.sessionId===str.id).logs['back-squat'],nextState:{load:st.load,reps:st.reps,loadTick:st.loadTick}};}
out('R',{planned:`${sq.sets}x${sq.reps}@${sq.rir} ${sq.load.value} kg`,variants:res});
// R2: the known shortfall (one set at 3 reps, gate HOLD = "repeat"): what does next week prescribe? Compared on the pre-R7A runtime.
import {pre,rows,fmt} from './qe-lib.mjs';
for(const [tag,RR] of [['CURRENT',cur],['PRE_R7A',await pre()]]){const pp=RR.generateProgram(intake({id:'qe-R',weeks:8,athlete:{exerciseRotationPreference:'FIXED'}}),opts).program;
 const a=pp.weeks[0].sessions.filter(s=>s.prescription),s0=a.find(s=>s.sport==='STRENGTH');
 const list=a.map(s=>{const o=obs(pp,s);if(s===s0)o.actual.exercises=o.actual.exercises.map(e=>e.id==='back-squat'?{...e,sets:[set(5),set(3),set(5)]}:e);return o;});
 const r=RR.evaluateProgram(pp,review(pp,0,{observations:list}),opts),P1=r.proposal??pp;
 out('R2',{runtime:tag,gate:r.gates?.['back-squat'],goalRepRange:opts.authority.policy.operational.strength.goalDoses.STRENGTH.repRange,week1BackSquat:rows(P1,1).filter(x=>x.e.id==='back-squat').map(({s,e})=>fmt(s,e))});}
