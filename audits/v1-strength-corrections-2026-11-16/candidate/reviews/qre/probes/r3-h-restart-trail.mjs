// QRE V1STR N4 recheck R3, probe H (independent judge; read-only). The restarts of probe B where an asking MAIN slot of the new plan takes a
// configuration the plan before held only as an accessory (all 4 days -> pause -> 2 days): the MAIN rows of that configuration through eight
// weekly reviews after the restart, against the goal's repetition range, and the MAIN rows of the same slot in the same restart without the
// plane rule. Does the MAIN row carry the accessory's dose state (the B-01 harm), or is it re-established at the MAIN dose?
// Run from CoachingCore/: node ../audits/.../reviews/qre/probes/r3-h-restart-trail.mjs
import fs from 'node:fs';
import * as S from '../../../../../../CoachingCore/src/v1-strength-index.mjs';
import {configurationOf} from '../../../../../../CoachingCore/src/r7b-repertoire.mjs';
import {lifter,hybrid,timeline,EQUIPMENT,DEV,only,familiar,rowsOf,addDays,ELIG,report,live} from '../../../../../../CoachingCore/test/v1str-helpers.mjs';
const NOPLANE=only('HOLD','UPPER');
const GOALS=JSON.parse(fs.readFileSync(new URL('../../../../../../CoachingCore/r6/PROGRAM_POLICY_R6.json',import.meta.url),'utf8')).operational.strength.goalDoses;
const BARBELL=['back-squat','bench-press','deadlift','barbell-overhead-press','barbell-row'].map(familiar);
const PROFILES=[];
for(const goal of ['STRENGTH','HYPERTROPHY','GENERAL','RUNNING_SUPPORT'])for(const [who,experience,known] of [['INTERMEDIATE','INTERMEDIATE',[]],['EXPERIENCED+barbell','EXPERIENCED',BARBELL],['NOVICE+known','NOVICE',[familiar('goblet-squat')]]])for(const eq of ['FULL','MACHINES','DB_BANDS','BANDS'])
 PROFILES.push({id:`${who} ${goal} ${eq}`,goal,make:days=>lifter({goal,experience,known,equipment:EQUIPMENT[eq],days})});
for(const eq of ['MACHINES','DB_BANDS'])PROFILES.push({id:`hybrid ${eq}`,goal:'RUNNING_SUPPORT',make:days=>hybrid({equipment:EQUIPMENT[eq],days})});
const slotMap=p=>{const m=new Map();for(const t of p?.templates??[])for(const r of t.rows)m.set(t.type+':'+r.slot,{id:r.entry.id,role:r.role,plane:!!r.planeAlternation});return m;};
const trail=(p,id,to)=>Array.from({length:Math.min(to,p.weeks.length)},(_,w)=>rowsOf(p,w).filter(x=>x.e.id===id&&x.e.role==='MAIN').map(x=>`${x.e.sets}x${x.e.reps}r${x.e.rir}${x.e.load?.mode==='KNOWN'?'@'+x.e.load.value:x.e.load?.mode==='BODYWEIGHT'?'bw':'~'}`).join(','));
const out={cases:0,outsideRange:[],trails:[]};
for(const profile of PROFILES)for(const pause of [1,6]){
 const run=opts=>{const intake=profile.make([0,2,4,6]),t=timeline(intake,{opts});t.weeks(0,2);const before=new Map();for(let w=0;w<3;w++)for(const {e} of rowsOf(t.p,w))before.set(e.id,(before.get(e.id)??new Set()).add(e.role));
  const asOf=addDays(t.p.startDate,22),r=S.restartProgram({intake:{...intake,asOf,startDate:addDays(t.p.startDate,28),schedule:{...intake.schedule,strengthDays:[1,4]},athlete:{...intake.athlete,eligibility:ELIG(asOf),pause:{weeks:pause,reasonCategory:'TRAVEL',nonclinical:true}}},record:t.ledger,referenceState:t.ref},opts);
  if(!r.program)return null;const u=timeline(intake,{opts});u.p=r.program;u.ledger=r.actualLedger??t.ledger;u.ref=r.referenceState??null;u.ev=r.runEvidenceRecord??t.ev;u.fmt=r.runFormatRecord??t.fmt;u.hist=r.runHistoryRecord??t.hist;u.rev=r.paceRevisionRecord??t.rev;u.n=100;u.weeks(0,7);return {before,p0:r.program,p:u.p};};
 const d=run(DEV),n=run(NOPLANE);if(!d||!n)continue;
 const D=slotMap(d.p0),N=slotMap(n.p0);
 for(const [k,x] of D){if(x.role!=='MAIN'||!x.plane)continue;const was=d.before.get(x.id);if(!was||was.has('MAIN'))continue;
  out.cases++;const g=GOALS[profile.goal],[lo,hi]=g.repRange,ext=configurationOf(x.id).loading==='EXTERNAL';
  const tr=trail(d.p,x.id,9),trN=trail(n.p,N.get(k)?.id,9);
  const outside=d.p.weeks.slice(0,9).flatMap((_,w)=>rowsOf(d.p,w).filter(y=>y.e.id===x.id&&y.e.role==='MAIN'&&ext&&(y.e.reps<lo||y.e.reps>hi)).map(y=>w+':'+y.e.sets+'x'+y.e.reps));
  if(outside.length)out.outsideRange.push({label:`${profile.id} pause ${pause}w`,slot:k,id:x.id,outside});
  out.trails.push({label:`${profile.id} pause ${pause}w`,slot:k,id:x.id,heldBefore:[...was],range:[lo,hi],withRule:tr,noPlaneSlot:N.get(k)?.id??null,noPlaneTrail:trN});}
}
console.log(JSON.stringify({cases:out.cases,outsideRange:out.outsideRange.length}));
for(const x of out.trails.slice(0,8))console.log(JSON.stringify(x));
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(out,null,1));
