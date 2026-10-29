// QE probe D2 (hidden unit conversion in the R7-A conflict check): physicalAgrees reads a set load only as a bare number or {unit:'KG'};
// a load in pounds is skipped, so two reports of one session, 80 kg and 100 lb (about 45 kg), "agree" and merge. The better-ranked
// report's exercise list wins; strengthLogs then converts its pounds and the known squat load is replaced by 45.5 kg. The same pair
// written in kilograms (80 vs 45.5) is a conflict.
import {cur,pre,opts,intake,review,obs,out} from './qe-lib.mjs';
const tag=process.env.QE_RUNTIME==='pre'?'PRE_R7A':'CURRENT',R=tag==='PRE_R7A'?await pre():cur;
const p=R.generateProgram(intake({id:'qe-D2',weeks:8,athlete:{exerciseRotationPreference:'FIXED'}}),opts).program;
const all=p.weeks[0].sessions.filter(s=>s.prescription),str=all.find(s=>s.sport==='STRENGTH');
const base=all.map((s,i)=>obs(p,s,{eventId:'qe-d2-'+i}));
const watch=load=>({...obs(p,str,{over:{'back-squat':{load}}}),eventId:'qe-d2-watch-'+load.unit,observedAt:str.date+'T19:30:00Z',source:{provider:'GENERIC_WATCH',activityId:'act-d2-'+load.unit,quality:'WEARABLE_FULL'}});
const run=load=>{const r=R.evaluateProgram(p,review(p,0,{observations:[...base,watch(load)]}),opts);return {conflicts:r.provenance.conflicts.map(c=>c.reason),duplicates:r.provenance.duplicates.map(d=>d.reason),status:`${r.status}/${r.action}`,squatLogKg:r.weekEvidence.rows.find(x=>x.sessionId===str.id)?.logs?.['back-squat']?.load??null,squatStateNextWeek:((r.proposal??p).stateTrace[1].strength.exercises['back-squat']??{}).load};};
out('D2',{runtime:tag,manualReport:'back-squat 3x5 @ 80 kg (planned 80 kg)',watchInPounds_100lb:run({value:100,unit:'LB',convention:'TOTAL'}),watchInKilograms_45_5kg:run({value:45.5,unit:'KG',convention:'TOTAL'})});
