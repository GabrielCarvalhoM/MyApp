// V1 Strength Extension: trunk work under a tight time per strength session (SSCTR-STR-A-04a, A-06; SI-V1-SSCTR-SQ-1 c3). The engine's time fit
// leaves accessory rows out before a MAIN row loses a set, as it always did; these tests say what the rules add to that, and pin it.
import test from 'node:test';
import assert from 'node:assert/strict';
import {S,OFF,only,HOLDS,lifter,hybrid,strengthSessions,EQUIPMENT} from './v1str-helpers.mjs';

const POPULATION=[];
for(const minutes of [30,40,45])for(const eq of ['FULL','DB_BANDS','MACH_DB','BANDS','BW','DB'])for(const goal of ['RUNNING_SUPPORT','HYPERTROPHY','STRENGTH','GENERAL'])for(const days of [[1,4],[1,3,5],[0,2,4,6]])for(const experience of ['NONE','INTERMEDIATE'])
 POPULATION.push({name:`${minutes} min ${eq} ${goal} ${days.length}d ${experience}`,intake:lifter({goal,experience,equipment:EQUIPMENT[eq],days,minutes})});
for(const minutes of [30,40,45])for(const eq of ['FULL','DB_BANDS','BANDS','BW'])for(const days of [[2,5],[0,2,4]])POPULATION.push({name:`hybrid ${minutes} min ${eq} ${days.length}d`,intake:hybrid({equipment:EQUIPMENT[eq],days,minutes})});
const cache=new Map(),plan=(x,name,opts)=>{const k=x.name+'|'+name;if(!cache.has(k)){const r=S.generateProgram(x.intake,opts);assert.ok(r.program,`${x.name}: ${r.status}`);cache.set(k,r.program);}return cache.get(k);};
const trunkOf=s=>s.prescription.exercises.filter(e=>e.pattern==='TRUNK');
const weekTrunk=(p,w)=>strengthSessions(p,w).reduce((n,s)=>n+trunkOf(s).length,0);
/** Week by week against the plan without the rule: the weeks with fewer trunk rows, those left with none, and every session that lost one. */
function against(name,opts){
 let fewer=0,none=0;const lost=[];
 for(const x of POPULATION){const a=plan(x,'OFF',OFF),b=plan(x,name,opts);
  for(let w=0;w<a.weeks.length;w++){const was=weekTrunk(a,w),is=weekTrunk(b,w);if(is>=was)continue;fewer++;if(is===0)none++;
   for(const s of strengthSessions(a,w)){const t=strengthSessions(b,w).find(q=>q.id===s.id),before=trunkOf(s),after=t?trunkOf(t):[];if(after.length<before.length)lost.push({plan:x.name,week:w,session:s.id,before:before.map(e=>e.id),after:after.map(e=>e.id)});}}}
 return {fewer,none,lost};
}

test('SSCTR-STR-A-04a the upper-body rules cost no trunk row under a tight session time: with the plane rule or the loading rule alone, no week holds fewer trunk rows than without it', ()=>{
 assert.equal(POPULATION.length,456);
 for(const name of ['PLANE','UPPER']){const r=against(name,only(name));assert.deepEqual({fewer:r.fewer,none:r.none},{fewer:0,none:0},`${name}: ${JSON.stringify(r.lost.slice(0,3))}`);}
});
test('SSCTR-STR-A-04a the hold rule\'s known limitation, pinned: the weeks that lose a trunk row under a tight session time, and in every one of them the row that fitted before was a plank in repetitions', ()=>{
 const r=against('HOLD',only('HOLD'));
 for(const x of r.lost)assert.ok(x.before.some(id=>HOLDS.includes(id)),`a trunk row that was not a hold was lost: ${JSON.stringify(x)}`);
 // The count is pinned so that it cannot grow unseen. It is not a target: a change of this number is a change of what the athlete is prescribed.
 assert.deepEqual({weeksWithFewerTrunkRows:r.fewer,weeksLeftWithNoTrunkRow:r.none},PINNED,JSON.stringify({fewer:r.fewer,none:r.none}));
 // The control: the frozen engine itself leaves weeks of these plans with no trunk row (pre-existing, SSCTR-STR-A-11).
 let without=0;for(const x of POPULATION){const a=plan(x,'OFF',OFF);for(let w=0;w<a.weeks.length;w++)if(strengthSessions(a,w).length&&weekTrunk(a,w)===0&&!['RACE_WEEK','POST_EVENT'].includes(a.phases.phases[w]))without++;}
 assert.ok(without>1000,String(without));
});
const PINNED={weeksWithFewerTrunkRows:85,weeksLeftWithNoTrunkRow:32};
