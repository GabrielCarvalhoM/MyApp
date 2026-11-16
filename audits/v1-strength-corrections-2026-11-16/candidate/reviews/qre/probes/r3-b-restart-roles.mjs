// QRE V1STR N4 recheck R3, probe B (independent judge; read-only, writes nothing but its own JSON when given a path).
// Restarts: a plan built and run under all the rules, then a new plan from the record after a pause (restartProgram), on the same or other
// strength days. A restart builds a NEW plan, so the plane rule asks as for a new plan (unchanged by the fix). Question: does an asking MAIN
// slot of the restarted plan take a configuration the plan before held only in another role (its logged dose is an accessory's), where the
// same restart without the plane rule (plan built, run and restarted under HOLD+UPPER) does not? And the first MAIN dose of such a row.
// Run from CoachingCore/: node ../audits/.../reviews/qre/probes/r3-b-restart-roles.mjs <shard> <shards> [out.json]
import fs from 'node:fs';
import * as S from '../../../../../../CoachingCore/src/v1-strength-index.mjs';
import {configurationOf} from '../../../../../../CoachingCore/src/r7b-repertoire.mjs';
import {lifter,hybrid,timeline,EQUIPMENT,DEV,only,familiar,rowsOf,addDays,ELIG} from '../../../../../../CoachingCore/test/v1str-helpers.mjs';
const NOPLANE=only('HOLD','UPPER'),[shard,shards,outPath]=[Number(process.argv[2]??0),Number(process.argv[3]??1),process.argv[4]];let job=0;
const GOALS=JSON.parse(fs.readFileSync(new URL('../../../../../../CoachingCore/r6/PROGRAM_POLICY_R6.json',import.meta.url),'utf8')).operational.strength.goalDoses;
const DAYS={2:[1,4],3:[1,3,5],4:[0,2,4,6],5:[0,1,2,4,6]};
const BARBELL=['back-squat','bench-press','deadlift','barbell-overhead-press','barbell-row'].map(familiar);
const PROFILES=[];
for(const goal of ['STRENGTH','HYPERTROPHY','GENERAL','RUNNING_SUPPORT'])for(const [who,experience,known] of [['INTERMEDIATE','INTERMEDIATE',[]],['EXPERIENCED+barbell','EXPERIENCED',BARBELL],['NOVICE+known','NOVICE',[familiar('goblet-squat')]]])for(const eq of ['FULL','MACH_DB','BANDS','MACHINES','DB_BANDS'])
 PROFILES.push({id:`${who} ${goal} ${eq}`,goal,make:days=>lifter({goal,experience,known,equipment:EQUIPMENT[eq],days})});
for(const eq of ['FULL','MACH_DB','BANDS','MACHINES','DB_BANDS'])PROFILES.push({id:`hybrid ${eq}`,goal:'RUNNING_SUPPORT',make:days=>hybrid({equipment:EQUIPMENT[eq],days})});
const rolesIn=(p,toWeek)=>{const m=new Map();for(let w=0;w<toWeek;w++)for(const {e} of rowsOf(p,w))m.set(e.id,(m.get(e.id)??new Set()).add(e.role));return m;};
const slotMap=p=>{const m=new Map();for(const t of p?.templates??[])for(const r of t.rows)m.set(t.type+':'+r.slot,{id:r.entry.id,role:r.role,plane:r.planeAlternation??null});return m;};
const firstMainRows=(p,id)=>{for(let w=0;w<p.weeks.length;w++){const r=rowsOf(p,w).filter(x=>x.e.id===id&&x.e.role==='MAIN');if(r.length)return {week:w,rows:r.map(x=>`${x.e.sets}x${x.e.reps} rir${x.e.rir} ${x.e.load?.mode}${Number.isFinite(x.e.load?.value)?' '+x.e.load.value:''}`)};}return null;};
const lastAccessoryRows=(p,id,toWeek)=>{for(let w=toWeek-1;w>=0;w--){const r=rowsOf(p,w).filter(x=>x.e.id===id);if(r.length)return {week:w,rows:r.map(x=>`${x.e.role} ${x.e.sets}x${x.e.reps} rir${x.e.rir} ${x.e.load?.mode}`)};}return null;};
const res={restarts:0,notGenerated:0,statusDiffers:[],askingFromOtherRole:[],anyMainFromOtherRoleByRule:[],asksInRestarted:{}};
for(const profile of PROFILES)for(const a of [2,4])for(const b of [2,3,4])for(const pause of [1,6]){if((job++)%shards!==shard)continue;
 const out={};
 for(const [label,opts] of [['dev',DEV],['noPlane',NOPLANE]]){
  const intake=profile.make(DAYS[a]),t=timeline(intake,{opts});if(!t.p){out[label]=null;continue;}t.weeks(0,2);
  const asOf=addDays(t.p.startDate,22),r=S.restartProgram({intake:{...intake,asOf,startDate:addDays(t.p.startDate,28),schedule:{...intake.schedule,strengthDays:DAYS[b]},athlete:{...intake.athlete,eligibility:ELIG(asOf),pause:{weeks:pause,reasonCategory:'TRAVEL',nonclinical:true}}},record:t.ledger,referenceState:t.ref},opts);
  out[label]={status:r.status,before:rolesIn(t.p,3),p:r.program??null,prev:t.p};
 }
 if(!out.dev||!out.noPlane){res.notGenerated++;continue;}
 res.restarts++;const label=`${profile.id} ${a}d -> pause ${pause}w -> ${b}d`;
 if(out.dev.status!==out.noPlane.status)res.statusDiffers.push({label,dev:out.dev.status,noPlane:out.noPlane.status});
 if(!out.dev.p)continue;
 const D=slotMap(out.dev.p),N=slotMap(out.noPlane.p),asks=[...D].filter(([,x])=>x.plane).length;res.asksInRestarted[asks]=(res.asksInRestarted[asks]??0)+1;
 for(const [k,x] of D){if(x.role!=='MAIN')continue;const was=out.dev.before.get(x.id);if(!was||was.has('MAIN'))continue;
  const item={label,slot:k,id:x.id,heldBefore:[...was],asks:!!x.plane,noPlaneSlot:N.get(k)?.id??null,goalRange:GOALS[profile.goal]?.repRange??null,lastBefore:lastAccessoryRows(out.dev.prev,x.id,3),firstMainAfter:firstMainRows(out.dev.p,x.id)};
  if(x.plane)res.askingFromOtherRole.push(item);
  if(N.get(k)?.id!==x.id)res.anyMainFromOtherRoleByRule.push(item);}
}
console.log(JSON.stringify({restarts:res.restarts,notGenerated:res.notGenerated,statusDiffers:res.statusDiffers.length,askingFromOtherRole:res.askingFromOtherRole.length,anyMainFromOtherRoleByRule:res.anyMainFromOtherRoleByRule.length,asksInRestarted:res.asksInRestarted}));
for(const x of res.anyMainFromOtherRoleByRule.slice(0,12))console.log(JSON.stringify(x));
if(outPath)fs.writeFileSync(outPath,JSON.stringify(res,null,1));
