// QRE V1STR N4 recheck R3, probe G (independent judge; read-only). New plans are unchanged by the fix: run this file in a clone of 3342a1d (or
// 76b8448, same code) and in one of 5f7f6f6 and compare the printed digests. Every first plan (generateProgram) and every new plan from the
// record after a pause (restartProgram) with all the rules on (development authority), digested without the values hash (it is the one byte
// that changed in the values file) and without the program hash and the binding that carry it.
// Run from CoachingCore/: node ../audits/.../reviews/qre/probes/r3-g-new-plan-identity.mjs
import {createHash} from 'node:crypto';
import * as S from '../../../../../../CoachingCore/src/v1-strength-index.mjs';
import {lifter,hybrid,timeline,EQUIPMENT,DEV,familiar,addDays,ELIG} from '../../../../../../CoachingCore/test/v1str-helpers.mjs';
const SHAS=/06d4731de7cf748adf53ff4b88bdffcfe14200ee69c9d8cd1d86257c0d749b33|15a51f55e847ad01d683912d50319629ead68a1cfa00d3c69c5061b3e596850f/g;
const digest=o=>createHash('sha256').update(JSON.stringify(o,(k,v)=>k==='hash'||k==='inputHash'||k==='programHash'?undefined:v).replace(SHAS,'VALUES_SHA')).digest('hex').slice(0,16);
const BARBELL=['back-squat','bench-press','deadlift','barbell-overhead-press','barbell-row'].map(familiar);
const DAYS={1:[3],2:[1,4],3:[1,3,5],4:[0,2,4,6],5:[0,1,2,4,6]};
const gen=[],res=[];
for(const goal of ['STRENGTH','HYPERTROPHY','GENERAL','RUNNING_SUPPORT'])for(const [experience,known] of [['NONE',[]],['NOVICE',[]],['NOVICE',[familiar('goblet-squat')]],['INTERMEDIATE',[]],['EXPERIENCED',BARBELL]])
 for(const eq of ['FULL','MACH_DB','DB_BENCH','DB','KB','BANDS','BANDS_PULLUP','PULLUP','BW','MACHINES','DB_BANDS','BAR'])for(const d of [1,2,3,4,5])for(const minutes of [30,60]){
  const r=S.generateProgram(lifter({goal,experience,known,equipment:EQUIPMENT[eq],days:DAYS[d],minutes}),DEV);gen.push(digest({status:r.status,program:r.program,ext:r.strengthExtension}));}
for(const eq of ['FULL','MACH_DB','DB_BANDS','BANDS_PULLUP'])for(const d of [2,3,4]){const r=S.generateProgram(hybrid({equipment:EQUIPMENT[eq],days:DAYS[d]}),DEV);gen.push(digest({status:r.status,program:r.program,ext:r.strengthExtension}));}
for(const [experience,known] of [['INTERMEDIATE',[]],['EXPERIENCED',BARBELL],['NONE',[]]])for(const eq of ['FULL','MACH_DB','BANDS'])for(const [a,b] of [[2,2],[4,2],[2,4]])for(const pause of [1,6]){
 const intake=lifter({goal:'STRENGTH',experience,known,equipment:EQUIPMENT[eq],days:DAYS[a]}),t=timeline(intake);t.weeks(0,2);const asOf=addDays(t.p.startDate,22);
 const r=S.restartProgram({intake:{...intake,asOf,startDate:addDays(t.p.startDate,28),schedule:{...intake.schedule,strengthDays:DAYS[b]},athlete:{...intake.athlete,eligibility:ELIG(asOf),pause:{weeks:pause,reasonCategory:'TRAVEL',nonclinical:true}}},record:t.ledger,referenceState:t.ref},DEV);
 res.push(digest({status:r.status,program:r.program,ext:r.strengthExtension}));}
console.log(JSON.stringify({firstPlans:gen.length,firstPlansDigest:digest(gen),restarts:res.length,restartsDigest:digest(res)}));
