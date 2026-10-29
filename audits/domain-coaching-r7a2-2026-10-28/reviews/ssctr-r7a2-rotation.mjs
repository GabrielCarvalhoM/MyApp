// SSCTR R7A2-SSCTR-r1 rotation spot-check (own instrument). Read-only runtime use of the live tree, synthetic data, DEV_TEST_ONLY authority.
// Prints only. Usage: node ssctr-r7a2-rotation.mjs > out.json
// Rotation EVERY_2_WEEKS or EVERY_6_WEEKS; FAMILIAR or KNOWN; three goals; strength Monday and Thursday, 40 minutes. Every week executed and
// reviewed until a week W (2..9) whose sessions before Friday hold a rotated-in exercise (not in the week-start state); then a break from that
// Friday for 14 days (moderate) or 7 days (short). For those exercises: moderate: in the return's start state at the entry step with its
// executed count as the ceiling (ENTRY, CEQ), then E, O, B as in the first-week grid; short: the first exposure after the return at most
// max(executed count, effortGuidedLoad.sets) with RIR >= 3 (S1), and B.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,CC=path.resolve(here,'../../../CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const R=await load('src/r6-index.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs'),opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,conv='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention:conv},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const KNOWN=[K('back-squat',4,5,80),K('barbell-rdl',3,6,90),K('db-bench-press',3,8,18,'PER_HAND')];
let N=0;
const intake=(id,{goal,cls,rot})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:goal},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:cls==='KNOWN'?KNOWN:[],exerciseRotationPreference:rot},
 schedule:{runDays:[1,4,6],strengthDays:[0,3],runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:40,longRunDay:6,longRunMinutes:80}});
const at=(p,w,day,hour,x)=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`ro-${N++}`,kind:x.kind},eligibility:elig(d),observations:[],...x};};
function obs(p,s){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));return {eventId:`ro-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};}
const ev=(t,x)=>{const r=R.evaluateProgram(t.p,{...x,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const weekly=(t,w,keep=()=>true)=>ev(t,at(t.p,w,6,'21:00:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s))}));
const loaded=e=>e.load.mode!=='BODYWEIGHT'&&e.exposure?.kind!=='PRACTICE';
const rowsOf=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises.map(e=>({date:s.date,e})));
const whole=e=>!Number.isInteger(e.exposure?.phasedSets)||e.exposure.phasedSets===e.exposure.baseSets;
const out={probe:'R7A2-SSCTR-r1-ROTATION',runtime:'live tree (check the digest)',cases:0,exercises:0,noRotation:[],tally:{},examples:[]};
const T=(k,n=1)=>{out.tally[k]=(out.tally[k]??0)+n;};
for(const rot of ['EVERY_2_WEEKS','EVERY_6_WEEKS'])for(const cls of ['FAMILIAR','KNOWN'])for(const goal of ['STRENGTH','HYPERTROPHY','RUNNING_SUPPORT'])for(const [len,fam] of [[14,'MODERATE'],[7,'SHORT']]){
 const id=`ro-${rot}-${cls}-${goal}-${len}`,g=R.generateProgram(intake(id,{goal,cls,rot}),opts);if(!g.program){out.noRotation.push(id+':'+g.status);continue;}
 const t={p:g.program,ledger:[]};let W=-1,ids=[];
 for(let w=0;w<10;w++){const st=t.p.stateTrace[w].strength.exercises,bStart=addDays(t.p.weeks[w].startDate,4);
  const fresh=rowsOf(t.p,w).filter(r=>r.date<bStart&&loaded(r.e)&&!st[r.e.id]);if(w>=2&&fresh.length){W=w;ids=[...new Set(fresh.map(r=>r.e.id))];break;}weekly(t,w);}
 if(W<0){out.noRotation.push(id);continue;}
 const bStart=addDays(t.p.weeks[W].startDate,4),bEnd=addDays(bStart,len-1),report=addDays(bEnd,1);
 const ceil={},exec={};for(const {date,e} of rowsOf(t.p,W))if(date<bStart&&ids.includes(e.id)){exec[e.id]=Math.max(exec[e.id]??0,e.sets);if(whole(e))ceil[e.id]=Math.max(ceil[e.id]??0,e.sets);}
 weekly(t,W,s=>s.date<bStart);
 const rw=Math.floor((Date.parse(report)-Date.parse(t.p.startDate))/(7*864e5));for(let w=W+1;w<rw;w++)weekly(t,w,()=>false);
 const r=ev(t,at(t.p,rw,(Date.parse(report)-Date.parse(t.p.weeks[rw].startDate))/864e5,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:len,startDate:bStart,endDate:bEnd,reasonCategory:'TRAVEL',reason:'Work travel'}}));
 if(!/REESTABLISH/.test(r.action??'')){out.noRotation.push(id+':'+r.status);continue;}
 out.cases++;out.exercises+=ids.length;T(fam+'.cases');T(fam+'.exercises',ids.length);
 const D=t.p.decisions.filter(d=>d.action==='REESTABLISH').at(-1),entry=D.interruption.entry.strength.exercises;
 for(const x of ids){const s=entry[x];if(!s){T(fam+'.NOTINSTATE');out.examples.push({id,W,exercise:x,issue:'not in state'});continue;}
  if(fam==='MODERATE'){if(s.returnStep!==0)T('MODERATE.NOENTRY');if((s.setCeiling??null)!==(ceil[x]??null)){T('MODERATE.CEQ');out.examples.push({id,W,exercise:x,setCeiling:s.setCeiling,expected:ceil[x]});}}}
 const blocks=t.p.blocks??[],bi=blocks.findIndex(b=>rw>=b.startWeek&&rw<b.endWeekExclusive),limitWeek=blocks[bi+1]?.endWeekExclusive??16;
 const seen=new Set(),largest={};
 for(let w=rw;w<Math.min(rw+6,15);w++){
  for(const {date,e} of rowsOf(t.p,w)){if(!ids.includes(e.id)||date<report)continue;
   if(!seen.has(e.id)){seen.add(e.id);const k=`${fam}.first.${e.exposure?.kind}`;T(k);
    if(fam==='MODERATE'&&(e.exposure?.kind!=='RETURN_ENTRY'||e.sets>1||e.rir<4)){T('MODERATE.E');out.examples.push({id,W,exercise:e.id,kind:e.exposure?.kind,sets:e.sets,rir:e.rir});}
    if(fam==='SHORT'&&(e.sets>Math.max(exec[e.id],2)||e.rir<3)){T('SHORT.S1');out.examples.push({id,W,exercise:e.id,kind:e.exposure?.kind,sets:e.sets,rir:e.rir,exec:exec[e.id]});}}
   if(fam==='MODERATE'&&w<limitWeek&&Number.isInteger(ceil[e.id])&&e.sets>ceil[e.id]){T('MODERATE.O');out.examples.push({id,W,week:w,exercise:e.id,sets:e.sets,ceiling:ceil[e.id]});}
   if(Number.isInteger(largest[e.id])&&e.sets>largest[e.id]+1){T(fam+'.B');out.examples.push({id,W,week:w,exercise:e.id,sets:e.sets,largest:largest[e.id]});}}
  weekly(t,w,s=>s.date>=report);
  for(const {date,e} of rowsOf(t.p,w))if(date>=report&&ids.includes(e.id))largest[e.id]=Math.max(largest[e.id]??0,e.sets);
 }
}
console.log(JSON.stringify(out,null,1));
