// QRE V1STR N4 recheck R3, probe I (independent judge; read-only). A digest of plans in force (templates with every row's configuration, role
// and alternatives, and every prescribed row of every week) through changes of days in every direction, equipment loss and regain, and weekly
// reviews through the first block-boundary rotations. Run on the candidate and on a scratch slot holding one mutant: equal digests mean the
// mutant changes nothing on this space (used to classify the mutation survivors).
// Run from CoachingCore/: node ../audits/.../reviews/qre/probes/r3-i-inforce-digest.mjs
import {createHash} from 'node:crypto';
import {lifter,hybrid,timeline,EQUIPMENT,DEV,familiar} from '../../../../../../CoachingCore/test/v1str-helpers.mjs';
const DAYS={1:[3],2:[1,4],3:[1,3,5],4:[0,2,4,6],5:[0,1,2,4,6]};
const BARBELL=['back-squat','bench-press','deadlift','barbell-overhead-press','barbell-row'].map(familiar);
const h=o=>createHash('sha256').update(JSON.stringify(o)).digest('hex').slice(0,16);
const view=p=>({t:[...(p.templates??[]),...(p.noviceTemplates??[])].map(t=>[t.type,t.rows.map(r=>[r.slot,r.entry.id,r.role,r.alternatives])]),w:p.weeks.map(w=>w.sessions.map(s=>[s.id,s.prescription?.exercises?.map(e=>[e.id,e.role,e.sets,e.reps,e.rir,e.load?.mode])]))});
const all=[];let n=0;
for(const goal of ['STRENGTH','HYPERTROPHY','GENERAL','RUNNING_SUPPORT'])for(const [experience,known] of [['INTERMEDIATE',[]],['EXPERIENCED',BARBELL]])for(const eq of ['FULL','MACH_DB','BANDS','BANDS_PULLUP','MACHINES','DB_BANDS','BW','PULLUP'])
 for(const [a,b] of [[2,3],[3,2],[2,4],[4,2],[4,5],[2,2]]){
  const intake=lifter({goal,experience,known,equipment:EQUIPMENT[eq],days:DAYS[a]}),t=timeline(intake);if(!t.p)continue;n++;
  t.weeks(0,0);t.step(1,0,'SCHEDULE_CHANGE',{changes:{strengthDays:DAYS[b]}},'06:00');t.weeks(1,1);t.step(2,0,'EQUIPMENT_CHANGE',{changes:{equipment:['BANDS']}},'06:00');t.weeks(2,2);
  t.step(3,0,'EQUIPMENT_CHANGE',{changes:{equipment:intake.athlete.equipment}},'06:00');t.weeks(3,9);all.push(h(view(t.p)));
 }
console.log(JSON.stringify({sequences:n,digest:h(all)}));
