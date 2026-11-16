// QRE V1STR N4 recheck R3, probe C (independent judge; read-only). Where the rule keeps an anchor through a change of days (2 -> 3: FULL_B is
// in both weeks), the engine's own continuity may also put the anchored vertical into an accessory slot of the new UPPER session, so one
// configuration is held in two roles in a week (one dose state). Does the kept MAIN row's dose (sets x reps x reserve, week by week) stay the
// dose of the same plan without the change of days (the author's claim: 12 of 12 trails)? And what does the accessory row carry?
// Run from CoachingCore/: node ../audits/.../reviews/qre/probes/r3-c-kept-anchor-dose.mjs
import {lifter,hybrid,timeline,EQUIPMENT,DEV,familiar,rowsOf} from '../../../../../../CoachingCore/test/v1str-helpers.mjs';
import {slotsInForce} from '../../../../../../CoachingCore/src/v1-strength.mjs';
const BARBELL=['back-squat','bench-press','deadlift','barbell-overhead-press','barbell-row'].map(familiar);
const rowsFor=(p,id,from,to)=>Array.from({length:to-from},(_,k)=>from+k).map(w=>rowsOf(p,w).filter(x=>x.e.id===id).map(x=>`${x.e.role[0]} ${x.e.sets}x${x.e.reps}r${x.e.rir}`).sort().join(','));
let trails=0,same=0,twoRoles=0;const diffs=[],acc=[];
const CASES=[];
for(const goal of ['STRENGTH','GENERAL','HYPERTROPHY'])for(const eq of ['FULL','MACH_DB','DB_BANDS','MACHINES'])for(const [who,experience,known] of [['INTERMEDIATE','INTERMEDIATE',[]],['EXPERIENCED+barbell','EXPERIENCED',BARBELL]])CASES.push([`${who} ${goal} ${eq}`,days=>lifter({goal,experience,known,equipment:EQUIPMENT[eq],days,weeks:12})]);
for(const eq of ['FULL','MACH_DB','DB_BANDS'])CASES.push([`hybrid ${eq}`,days=>hybrid({equipment:EQUIPMENT[eq],days})]);
for(const [name,make] of CASES)for(const at of [1,3]){
 const base=timeline(make([1,4]));const anchors=slotsInForce(base.p);if(!Object.keys(anchors).length)continue;
 const ch=timeline(make([1,4]));ch.weeks(0,at-1);const r=ch.step(at,0,'SCHEDULE_CHANGE',{changes:{strengthDays:[1,3,5]}},'06:00');ch.weeks(at,9);base.weeks(0,9);
 for(const id of new Set(Object.values(anchors))){
  trails++;const a=rowsFor(base.p,id,at+1,10).map(s=>s.split(',').filter(x=>x.startsWith('M')).join(',')),b=rowsFor(ch.p,id,at+1,10).map(s=>s.split(',').filter(x=>x.startsWith('M')).join(','));
  if(JSON.stringify(a)===JSON.stringify(b))same++;else diffs.push({case:name,at,id,status:r.status,noChange:a,with2to3:b});
  const both=rowsFor(ch.p,id,at+1,10).filter(s=>s.includes('M ')&&s.includes('A '));if(both.length){twoRoles++;acc.push({case:name,at,id,weeks:rowsFor(ch.p,id,at+1,10)});}
 }
}
console.log(JSON.stringify({trails,mainTrailsEqual:same,trailsWithBothRolesInAWeek:twoRoles}));
for(const d of diffs.slice(0,10))console.log('DIFF',JSON.stringify(d));
for(const d of acc.slice(0,6))console.log('BOTH',JSON.stringify(d));
