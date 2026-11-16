// QRE V1STR R1, probe D (independent judge; read-only): V1X-STRENGTH-EXPOSURE (N3). The oracle is the catalog file (prim, lat) read here.
// Counting rule, executed counts from the engine's own record (conflicts and corrections made through the engine, not hand-flagged rows),
// hostile ledgers, restarts, and "nothing reads it".
// Run from CoachingCore/: node ../audits/v1-strength-corrections-2026-11-16/candidate/reviews/qre/probes/qre-d-exposure.mjs [out.json]
import fs from 'node:fs';
import * as S from '../../../../../../CoachingCore/src/v1-strength-index.mjs';
import {weeklyStrengthExposure,STRENGTH_VALUES} from '../../../../../../CoachingCore/src/v1-strength.mjs';
import {lifter,hybrid,timeline,report,live,hash,EQUIPMENT,FULL,DEV,OFF,only,rowsOf,addDays,ELIG} from '../../../../../../CoachingCore/test/v1str-helpers.mjs';

const CATALOG=JSON.parse(fs.readFileSync(new URL('../../../../../../CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json',import.meta.url),'utf8')),CFG=new Map(CATALOG.strength.configurations.map(e=>[e.id,e]));
const out={cases:{}};const note=(k,v)=>{out.cases[k]=v;console.log(k,JSON.stringify(v).slice(0,900));};
const oracle=rows=>{const o={};for(const e of rows){if(e.role==='PRACTICE')continue;for(const m of CFG.get(e.id).prim)o[m]=(o[m]??0)+e.sets;}return o;};
const strength=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH');

// D-1 Planned counts against the catalog oracle over a population; unilateral rows counted once.
{let n=0,bad=[],uni=0;
 for(const eq of Object.keys(EQUIPMENT))for(const goal of ['GENERAL','HYPERTROPHY','STRENGTH','RUNNING_SUPPORT'])for(const experience of ['NONE','INTERMEDIATE'])for(const days of [[1,4],[0,2,4,6]]){
  const p=S.generateProgram(lifter({goal,experience,equipment:EQUIPMENT[eq],days}),DEV).program;
  for(let w=0;w<p.weeks.length;w++){n++;const x=weeklyStrengthExposure({program:p,weekIndex:w}),rows=rowsOf(p,w).map(r=>r.e);uni+=rows.filter(e=>CFG.get(e.id)?.lat==='UNILATERAL').length;
   if(hash(x.planned.byPrimaryMuscle)!==hash(oracle(rows)))bad.push({eq,goal,experience,w});}
 }
 note('D1 planned vs catalog oracle',{weeks:n,mismatches:bad.length,unilateralRowsSeen:uni,examples:bad.slice(0,3)});}

// D-2 Executed from the engine's own record: a correction (superseded) and a conflicting double report made through reviews.
{
 const t=timeline(lifter({goal:'HYPERTROPHY',experience:'INTERMEDIATE',equipment:FULL}));t.week(0);
 const [s1,s2]=strength(t.p,1);
 // Report s1 as prescribed (event A), then a correction with one set per exercise (event B corrects A), through the engine.
 const A=report(t.p,s1),fewer={...A.actual,exercises:A.actual.exercises.map(e=>({...e,sets:e.sets.slice(0,1)}))};
 const r1=t.step(1,s1.day-(t.p.weeks[1].sessions[0].day??0)>=0?3:3,'WEEKLY_REVIEW',{observations:[A]},'21:00');
 const B={...A,eventId:A.eventId+'-corr',actual:fewer,correctionOf:A.eventId,correctedAt:`${t.day(1,4)}T19:00:00-03:00`};
 const r2=t.step(1,4,'WEEKLY_REVIEW',{observations:[B]},'21:00');
 const ledgerRows=(r2.actualLedger??[]).filter(o=>o.sessionId===s1.id).map(o=>({eventId:o.eventId,superseded:o.superseded??false,conflicted:o.conflicted??false,sets:(o.actual?.exercises??[]).map(e=>e.sets?.length)}));
 note('D2 correction through the engine',{statuses:[r1.status,r2.status],ledgerRows,executed:r2.strengthExposure.executed?.byPrimaryMuscle,expectedIfCorrected:oracle(s1.prescription.exercises.map(e=>({...e,sets:1}))),expectedIfOriginal:oracle(s1.prescription.exercises)});
 // A conflicting second report of s2 (different event id, same session, different actuals, no correction link).
 const C=report(t.p,s2),D={...report(t.p,s2),eventId:C.eventId+'-other',actual:{completed:false}};
 const r3=t.step(1,6,'WEEKLY_REVIEW',{observations:[C,D]},'21:00');
 const rows2=(r3.actualLedger??[]).filter(o=>o.sessionId===s2.id).map(o=>({eventId:o.eventId,superseded:o.superseded??false,conflicted:o.conflicted??false,completed:o.actual?.completed}));
 const ev=(r3.weekEvidence?.rows??[]).find(x=>x.sessionId===s2.id||x.id===s2.id);
 note('D2b conflicting reports through the engine',{status:r3.status,ledgerRows:rows2,engineSessionStatus:ev?.status??null,provenanceConflicts:r3.provenance?.conflicts?.length??null,exposureCountsS2:(r3.strengthExposure.executed?.rows??[]).some(x=>x.sessionId===s2.id),sessionsReported:r3.strengthExposure.executed?.sessionsReported});
}

// D-3 Hostile or odd ledgers, straight into the function (it must neither throw nor impute).
{
 const p=S.generateProgram(lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.DB}),DEV).program,s=strength(p,1)[0],base=report(p,s),row=x=>({...base,localDate:s.date,...x});
 const count=(ledger,label)=>{try{const x=weeklyStrengthExposure({program:p,weekIndex:1,ledger}).executed;return {label,sessionsReported:x.sessionsReported,byPrimaryMuscle:x.byPrimaryMuscle,notCounted:x.notCounted.length};}catch(e){return {label,THROW:e.message};}};
 const ex=base.actual.exercises,first=ex[0].id,big=Array.from({length:200000},()=>({reps:8}));
 const cases=[
  count(null,'ledger null'),count('x','ledger string'),count([null,1,'a',[],{}],'junk rows'),
  count([row({actual:{completed:true,exercises:[{id:first,sets:[{reps:'8'},{reps:NaN},{reps:Infinity},{reps:-3},{reps:0},{reps:8.5},{}]}]}})],'odd reps: only 8.5 counts'),
  count([row({actual:{completed:true,exercises:[{id:first,sets:big}]}})],'200000 logged sets'),
  count([row({actual:{completed:true,exercises:[{id:first,sets:[{reps:8}]},{id:first,sets:[{reps:8}]}]}})],'the same exercise logged twice'),
  count([row({actual:{completed:true,exercises:[{id:'__proto__',sets:[{reps:8}]},{id:'constructor',sets:[{reps:8}]}]}})],'prototype names'),
  count([row({athleteId:undefined})],'no athleteId on the row'),
  count([row({}),row({localDate:'2099-01-01'})],'latest row dated outside the week'),
  count([row({}),row({actual:{completed:false}})],'latest row: not done'),
  count([row({localDate:undefined})],'no localDate'),
  count([row({localDate:s.date+'T23:59:00Z'})],'localDate with a time'),
 ];
 note('D3 hostile ledgers',cases);
 const t0=Date.now();weeklyStrengthExposure({program:p,weekIndex:1,ledger:Array.from({length:100000},(_,i)=>row({eventId:'e'+i}))});note('D3b 100000-row ledger ms',Date.now()-t0);
 // Odd weekIndex values
 note('D3c weekIndex',[-1,1.5,'1',null,999].map(w=>weeklyStrengthExposure({program:p,weekIndex:w}).status));
 // A program whose week has a session with a non-catalog exercise and a row without sets
 const q=JSON.parse(JSON.stringify(p));q.weeks[1].sessions.find(x=>x.id===s.id).prescription.exercises.push({id:'zercher-squat',sets:3,role:'MAIN'},{id:'goblet-squat',sets:'3',role:'MAIN'});
 note('D3d odd prescription rows',weeklyStrengthExposure({program:q,weekIndex:1}).planned.notCounted);
}

// D-4 Restart: does a new plan reuse session ids of the old one, and can old reports land in the new plan's weeks?
{
 const intake=lifter({experience:'INTERMEDIATE',equipment:EQUIPMENT.DB});const t=timeline(intake);t.weeks(0,2);
 const asOf=addDays(t.p.startDate,22),again={intake:{...intake,asOf,startDate:addDays(t.p.startDate,28),athlete:{...intake.athlete,eligibility:ELIG(asOf),pause:{weeks:1,reasonCategory:'TRAVEL',nonclinical:true}}},record:t.ledger,referenceState:t.ref};
 const r=S.restartProgram(again,DEV),oldIds=new Set(t.p.weeks.flatMap(w=>w.sessions.map(s=>s.id))),newIds=r.program?r.program.weeks.flatMap(w=>w.sessions.map(s=>s.id)):[];
 const shared=newIds.filter(id=>oldIds.has(id));
 // Feed the old ledger to the new plan's week 0 with dates moved into it (a client that re-sends the old record): what is counted?
 const x=r.program?weeklyStrengthExposure({program:r.program,weekIndex:0,ledger:t.ledger}).executed:null;
 note('D4 restart ids',{status:r.status,sharedSessionIds:shared.length,exampleOld:[...oldIds].slice(0,2),exampleNew:newIds.slice(0,2),oldLedgerCountedInNewWeek0:x?.sessionsReported??null});
}

// D-5 Nothing reads it: answers with EXPOSURE on and off are identical but for the key, over reviews with logged sets, a missed week, a fatigue
// report and a substitution; and the exposure never changes when the engine's input is the same.
{
 let compared=0,same=0;
 for(const intake of [lifter({goal:'HYPERTROPHY',experience:'INTERMEDIATE'}),hybrid({}),lifter({experience:'NONE',equipment:EQUIPMENT.BW,days:[1,3,5]})]){
  const a=timeline(intake,{opts:only('HOLD','UPPER','PLANE')}),b=timeline(intake,{opts:DEV});
  // The two keys of this extension apart: strengthExposure, and the boundaries map of strengthExtension (which says EXPOSURE on or off).
  const strip=r=>{const {strengthExposure:_e,strengthExtension:se,...rest}=r;const {boundaries:_b,...ext}=se??{};return {...rest,ext};};
  for(let w=0;w<5;w++){const how=s=>w===2&&s.sport==='STRENGTH'?false:{};const x=a.week(w,how),y=b.week(w,how);compared++;if(hash(strip(x))===hash(strip(y)))same++;}
  const lf=e=>e.step(5,0,'LOCAL_FATIGUE',{signals:{region:'LOWER'}},'06:00');const x=lf(a),y=lf(b);compared++;if(hash(strip(x))===hash(strip(y)))same++;
 }
 note('D5 nothing reads the exposure',{compared,identicalButTheKey:same});
}
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(out,null,1));
