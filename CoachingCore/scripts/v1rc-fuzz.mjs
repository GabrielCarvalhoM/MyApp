// CoachingCore V1 Run Calibration Extension: a seeded fuzz of the extended entry point. Random and plausible evidence, session reports and
// declarations run week by week; each timeline mirrors every review on the frozen V1 entry point (test/v1rc-helpers.mjs). It counts internal
// errors of the extension (the fail-closed CALIBRATION_ERROR, or an exception) and timelines whose plan, decisions or record differ from the
// frozen engine's. Both must be zero. Writes nothing.
// Usage: node scripts/v1rc-fuzz.mjs [timelines=250] [fieldValidity=0.9] [plausibleShare=0.8] [seed=20261111]
import {runner,timeline} from '../test/v1rc-helpers.mjs';

const N=Number(process.argv[2]??250),VALID=Number(process.argv[3]??0.9),PLAUSIBLE=Number(process.argv[4]??0.8);
let seed=Number(process.argv[5]??20261111)>>>0;
const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;},pick=a=>a[Math.floor(rnd()*a.length)];
// JSON values only: the engine reads JSON.
const junk=()=>pick([null,undefined,0,-1,1e12,NaN,Infinity,'','x','2026-13-40',true,[],{},[null],{a:1}]);
const val=good=>rnd()<VALID?good():junk();
const dayBefore=n=>new Date(Date.parse('2026-11-07T00:00:00Z')-n*864e5).toISOString().slice(0,10);
/** A result a runner could have: a pace of 4:30 to 7:50 per km, slower over the marathon. */
const plausible=()=>{const d=pick([3,5,10,21.0975,42.195]),pace=270+rnd()*200;return {id:'p'+Math.floor(rnd()*8),kind:pick(['RACE_RESULT','FIELD_TEST','TIME_TRIAL']),date:dayBefore(Math.floor(rnd()*130)),distanceKm:d,seconds:Math.round(d*pace*(d>21.1?1.12:1)),
 measurement:pick(['OFFICIAL','TRACK','GPS','GPS','MANUAL']),rpe:pick([9,9,8,7,null]),tolerated:true,heartRate:rnd()<0.4?{maxBpm:150+Math.round(rnd()*50),sensor:pick(['CHEST_STRAP','OPTICAL'])}:undefined};};
const random=()=>({id:val(()=>'e'+Math.floor(rnd()*6)),kind:val(()=>pick(['RACE_RESULT','FIELD_TEST','TIME_TRIAL','PERSONAL_BEST','LAB_TEST'])),date:val(()=>dayBefore(Math.floor(rnd()*400-30))),distanceKm:val(()=>pick([1,3,5,10,21.0975,30,42.195,60])),seconds:val(()=>Math.round(600+rnd()*20000)),
 measurement:val(()=>pick(['OFFICIAL','TRACK','GPS','MANUAL','TREADMILL'])),rpe:val(()=>Math.round(rnd()*10)),tolerated:val(()=>rnd()<0.8),completed:val(()=>rnd()<0.9),walkBreaks:val(()=>rnd()<0.1),conditions:val(()=>pick([[],['HEAT'],['TRAIL']])),
 protocol:val(()=>pick(['TIME_TRIAL_3K','TIME_TRIAL_5K','OTHER'])),supersedes:val(()=>'e'+Math.floor(rnd()*6)),heartRate:val(()=>({maxBpm:val(()=>120+Math.round(rnd()*110)),sensor:val(()=>pick(['CHEST_STRAP','OPTICAL']))})),
 lab:val(()=>({protocol:val(()=>'p'),source:val(()=>'s'),values:val(()=>[{name:val(()=>'n'),value:val(()=>150),unit:val(()=>'bpm')}])}))});
const ev=()=>rnd()<PLAUSIBLE?plausible():random();
let errors=0,different=0,calibrations=0;const statuses={};
const note=c=>{calibrations++;statuses[c?.status]=(statuses[c?.status]??0)+1;if(c?.reason==='CALIBRATION_ERROR')errors++;};
for(let i=0;i<N;i++){
 const anchors=rnd()<0.1?junk():Array.from({length:Math.floor(rnd()*5)},()=>rnd()<0.85?ev():junk());
 let t;try{t=timeline(runner({id:'fz'+i,anchors,weeks:pick([8,12,16]),runExperience:pick(['NOVICE','INTERMEDIATE','EXPERIENCED','EXPERIENCED']),goal:pick(['PERFORMANCE','REGULAR',{kind:'RACE',event:{kind:'10K',date:'2026-12-27',timeGoalMinutes:50}}])}));}
 catch(e){errors++;console.log('exception at the first plan: '+String(e).slice(0,200));continue;}
 note(t.cal);if(!t.p)continue;
 for(let w=0;w<Math.min(5,t.p.weeks.length-1);w++){
  try{t.week(w,()=>rnd()<0.1?false:({pace:val(()=>300+Math.round(rnd()*200)),workPace:val(()=>250+Math.round(rnd()*150)),rpe:val(()=>Math.round(rnd()*10)),effort:pick(['ON_TARGET','EASIER','HARDER','UNKNOWN']),
    actual:rnd()<0.3?{gpsQuality:junk(),conditions:junk(),work:junk(),heartRate:junk(),measurement:junk(),walkBreaks:junk(),distanceKm:junk()}:{}}),
   {runEvidence:rnd()<0.5?Array.from({length:Math.floor(rnd()*3)},()=>({...ev(),date:rnd()<0.85?t.day(w,Math.floor(rnd()*7)):junk()})):rnd()<0.2?junk():undefined});}
  catch(e){errors++;console.log('exception in a review: '+String(e?.stack??e).slice(0,400));break;}
  note(t.cal);
 }
 if(!t.same)different++;
}
console.log(JSON.stringify({timelines:N,calibrations,internalErrors:errors,timelinesDifferentFromFrozenEngine:different,statuses}));
process.exit(errors||different?1:0);
