// R7A1-QE-r2 scratch (exploration only): why P15's afterReview differs while P16's plain:w3 does not. Prints only.
import {runtime,make,at,obs,line,print} from './qe-a2-lib.mjs';
const RT=await runtime('A1'),H=make(RT);
const ALL=['DUMBBELLS','BENCH','BARBELL','RACK'];
const pick=(P,w)=>Object.fromEntries(['db-calf-raise','db-split-squat'].map(id=>{const e=P.stateTrace[w].strength.exercises[id];return [id,`reps ${e.reps} load ${e.load} tick ${e.loadTick} mode ${e.mode}`];}));
for(const variant of ['P15-like','P16-like']){
 const base=H.start({id:'qa2-p15a'},3);
 const r=H.weekly(base,3);
 const T=H.copy(base),x=H.ev(T,at(T.p,3,6,'22:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:[...ALL,'TREADMILL']}}));
 const w3=base.p.weeks[3].sessions.filter(s=>s.sport==='STRENGTH').map(s=>s.prescription.exercises.filter(e=>/calf|split/.test(e.id)).map(e=>`${s.id}:${e.id} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}${e.load.value??''}`)).flat();
 print({variant,review:r,reviewReason:base.last?.reason,change:x,week3:w3,startBefore:pick(base.p,4),startAfter:pick(T.p,4)});
}
