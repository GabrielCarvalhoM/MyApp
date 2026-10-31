// Probe batch R: R7-A invariants on the new R7-B states (HOLD, released != executed, D52 establishment, E1 return ceiling). Read-only.
import {record,guard,done,program,reviewed,weekly,review,evaluateProgram,opts,FULL,rows,runs,live,obs,strengthIds,qualityRuns,evalAt,apply,summary} from './lib.mjs';

const GRAD={id:'r-grad',goals:{run:'PERFORMANCE',strength:'NONE'},runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35},schedule:{strengthDays:[],runMinutes:45},weeks:16};
// R1 HOLD after graduation: nothing executed for four weeks -> the threshold ladder stays at step 0 and no run dimension rises.
guard('R1','R7-A HOLD on the graduation path',()=>{
 const t=reviewed(GRAD,3);weekly(t,3);
 const q0=qualityRuns(t.p,4)[0]?.progression?.value,long4=runs(t.p,4).find(s=>s.role==='LONG')?.prescription.durationMinutes;
 for(let w=4;w<8;w++)weekly(t,w,{keep:()=>false});
 const steps=[8,9,10,11].map(w=>qualityRuns(t.p,w)[0]?.progression?.value??null),longs=[8,9,10,11].map(w=>runs(t.p,w).find(s=>s.role==='LONG')?.prescription.durationMinutes??null);
 record('R1','R7-A HOLD on the graduation path',(steps[0]===null||steps[0]<=q0)&&(longs[0]===null||longs[0]<=long4),
  'with no executed week after the introduction, the week the last review gated (week 8) raises no quality step and no long run (HOLD; released is not executed); weeks 9+ are the conditional projection',{introductionStep:q0,long4,stepsAfterMissedWeeks:steps,longsAfterMissedWeeks:longs});
});
// R4 D52: a ladder step accepted and never executed, then a return: the new configuration is an establishment, never a known or transferred load.
guard('R4','R7-A D52 / E1 on the ladder path',()=>{
 const t=reviewed({id:'r-ladder',equipment:FULL,goals:{run:'PERFORMANCE',strength:'STRENGTH'},rotation:'COACH_DECIDES',weeks:16},4);
 apply(t,evalAt(t,4,{observations:t.p.weeks[4].sessions.filter(live).map(s=>obs(t.p,s)),choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'back-squat'}]}));
 weekly(t,5,{keep:s=>s.sport!=='STRENGTH'});
 const ret=evalAt(t,6,{day:6,kind:'RETURN_AFTER_PAUSE',interruption:{days:18,reasonCategory:'TRAVEL',nonclinical:true}});
 const P2=ret.proposal,from=P2?.decisions?.at(-1)?.fromWeek??7;
 const bs=P2?P2.weeks.slice(from,from+3).flatMap(w=>rows(P2,w.index)).filter(x=>x.e.id==='back-squat').map(x=>({w:x.s.weekIndex??x.s.id,mode:x.e.load.mode,value:x.e.load.value??null,sets:x.e.sets})):[];
 record('R4','R7-A D52 / E1 on the ladder path',ret.status!=='UNSUPPORTED'&&bs.every(r=>r.mode!=='KNOWN'&&r.value===null),
  'a configuration reached by a ladder step but never executed is established by effort after a return (no known or transferred load)',{returnDecision:summary(ret),backSquatRows:bs.slice(0,4),historyHasBackSquat:!!P2?.stateTrace?.[from]?.strength?.exercises?.['back-squat']});
});
// R5 substitution: the new configuration's first exposure is an establishment (nothing converted), whatever the old load was.
guard('R5','R7-A no load transfer on substitution',()=>{
 const t=reviewed({id:'r-sub',equipment:['DUMBBELLS','BENCH','KETTLEBELL'],goals:{run:'PERFORMANCE',strength:'GENERAL'},knownExercises:[{id:'goblet-squat',sets:3,reps:8,load:{value:24,unit:'KG',convention:'SINGLE_IMPLEMENT'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'}],rotation:'FIXED',weeks:12},3);
 const r=evalAt(t,3,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'goblet-squat',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}});
 const sel=r.substitutions?.[0]?.selected,P2=r.proposal,day=t.p.weeks[3].startDate,first=P2?P2.weeks.slice(3).flatMap(w=>rows(P2,w.index)).filter(x=>x.s.date>day&&x.e.pattern==='SQUAT'&&x.e.role==='MAIN')[0]:null;
 record('R5','R7-A no load transfer on substitution',r.status==='MODIFY'&&first&&first.e.id!=='goblet-squat'&&first.e.load.mode!=='KNOWN',
  'the first exposure of the configuration that replaces a known 24 kg goblet squat is effort-guided (no kilogram carried over)',{decision:{...summary(r),selected:sel},firstSquatRowAhead:first?{session:first.s.id,date:first.s.date,id:first.e.id,mode:first.e.load.mode,value:first.e.load.value??null}:null});
});
done('r-regression');
