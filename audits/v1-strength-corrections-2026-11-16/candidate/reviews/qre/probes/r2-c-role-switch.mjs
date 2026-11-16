// QRE V1STR recheck R2, probe C (independent judge; read-only): QRE-STR-B-01. A plan in force built on four strength days whose upper accessory
// holds a vertical configuration (heldAs keeps it out of the asking MAIN slot at build). The athlete changes to two days: the template keys
// change, the asking slot FULL_B has no anchor, and the `established` preference of the cycle picks the vertical the plan held only as an
// accessory. The rows of that exercise before and after, with the rule and without the plane rule.
// Run from CoachingCore/: node ../audits/v1-strength-corrections-2026-11-16/candidate/reviews/qre/probes/r2-c-role-switch.mjs
import fs from 'node:fs';
import {lifter,hybrid,timeline,EQUIPMENT,DEV,only,rowsOf,mainsOf,familiar} from '../../../../../../CoachingCore/test/v1str-helpers.mjs';
const POLICY=JSON.parse(fs.readFileSync(new URL('../../../../../../CoachingCore/r6/PROGRAM_POLICY_R6.json',import.meta.url),'utf8')).operational.strength;
const NOPLANE=only('HOLD','UPPER');
const cases=[['INTERMEDIATE HYPERTROPHY MACHINES',lifter({experience:'INTERMEDIATE',goal:'HYPERTROPHY',equipment:EQUIPMENT.MACHINES,days:[0,2,4,6]})],
 ['INTERMEDIATE STRENGTH MACHINES',lifter({experience:'INTERMEDIATE',goal:'STRENGTH',equipment:EQUIPMENT.MACHINES,days:[0,2,4,6]})],
 ['INTERMEDIATE HYPERTROPHY BANDS',lifter({experience:'INTERMEDIATE',goal:'HYPERTROPHY',equipment:EQUIPMENT.BANDS,days:[0,2,4,6]})],
 ['hybrid DB_BANDS',hybrid({equipment:EQUIPMENT.DB_BANDS,days:[0,2,4,6]})]];
for(const [name,intake] of cases){
 const res={goalDose:POLICY.goalDoses[intake.athlete.goals.strength]??null};
 for(const [label,opts] of [['withRule',DEV],['withoutPlaneRule',NOPLANE]]){
  const t=timeline(intake,{opts});if(!t.p){res[label]='no plan';continue;}
  const before=mainsOf(t.p),acc=Object.fromEntries((t.p.templates??[]).flatMap(x=>x.rows.filter(r=>r.role!=='MAIN'&&['PUSH','PULL'].includes(r.pattern)).map(r=>[x.type+':'+r.slot,r.entry.id])));
  t.weeks(0,1);const ch=t.step(2,0,'SCHEDULE_CHANGE',{changes:{strengthDays:[1,4]}},'06:00');t.weeks(2,4);
  const after=mainsOf(t.p),row=(w,id)=>rowsOf(t.p,w).filter(x=>x.e.id===id).map(x=>`${x.e.role} ${x.e.sets}x${x.e.reps} rir${x.e.rir} ${x.e.load?.mode}`);
  const switched=Object.values(after).filter(id=>Object.values(acc).includes(id)&&!Object.values(before).includes(id));
  res[label]={mainsBefore:before,upperAccessoriesBefore:acc,status:ch.status,mainsAfter:after,switchedToMain:switched,trail:Object.fromEntries(switched.map(id=>[id,[0,1,2,3,4,5].map(w=>`w${w}: ${row(w,id).join(' | ')}`)]))};
 }
 console.log(name,JSON.stringify(res,null,1));
}
