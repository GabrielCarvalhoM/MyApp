// R7A1-QE-r1 P08: D56 "one reading for every representation" on rows really written before R7-A (not stripped copies). The D56 grid's
// re-establishment timeline (two executed weeks, a five-week strength gap, 25-35 minute strength days) is planned and reviewed by the R6
// closure runtime (byte-exact pre-R7A snapshot, rebuilt in the OS temp folder) up to the switch week, then continued on FREEZE-A1, with
// the strength budget raised to 75 minutes. Oracles: (A) a regain or return cap never rises or ends after a week whose last executed
// exposure was trimmed by the time fit (legacy weeks included); (B) no capped exercise is prescribed more than one set above the largest
// count executed since the re-establishment; compared with the same timeline run on FREEZE-A1 throughout.
// Only weeks reviewed by FREEZE-A1 (A), and rows FREEZE-A1 planned (B: weeks after the switch week), are counted (a violation in a week the R6 closure runtime reviewed is that runtime's, not A1's).
// Synthetic data, DEV_TEST_ONLY authority, prints only (the temp copy lives under the OS temp folder).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {ROOT,runtime,addDays,elig,OK,SQUAT,RDL,BENCH,print} from './qe-a2-lib.mjs';
const snap=path.join(ROOT,'audits/domain-coaching-r7a-2026-10-27/pre-r7a-source'),manifest=JSON.parse(fs.readFileSync(path.join(snap,'MANIFEST.json'),'utf8'));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'qe-a1-pre-'));
for(const [rel,digest] of Object.entries(manifest.files)){const b=fs.readFileSync(path.join(snap,rel));if(createHash('sha256').update(b).digest('hex')!==digest)throw Error('snapshot drift '+rel);fs.mkdirSync(path.dirname(path.join(tmp,rel)),{recursive:true});fs.writeFileSync(path.join(tmp,rel),b);}
const L=rel=>import(pathToFileURL(path.join(tmp,'CoachingCore',rel)).href);
const PRE={R:{...(await L('src/r6-index.mjs'))},opts:{authority:(await L('r6/fixtures/dev-authority.mjs')).devAuthority()}},A1=await runtime('A1');
let N=0;
const intake=(id,{goal,known,days,minutes})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:goal},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:days.length},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:known?[SQUAT,RDL,BENCH]:[],exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,4,6],strengthDays:days,runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:minutes,longRunDay:6,longRunMinutes:80}});
const at=(p,w,day,hour,x)=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`qa1-p08-${N++}`,kind:x.kind},eligibility:elig(d),observations:[],...x};};
function obs(p,s){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));return {eventId:`qa1-p08-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};}
const ev=(RT,t,x)=>{const r=RT.R.evaluateProgram(t.p,{...x,actualLedger:t.ledger},RT.opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r.status;};
const weekly=(RT,t,w,keep=()=>true)=>ev(RT,t,at(t.p,w,6,'21:00:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>s.prescription&&s.status!=='SKIPPED'&&keep(s)).map(s=>obs(t.p,s))}));
const rowsOf=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription&&s.status!=='SKIPPED').flatMap(s=>s.prescription.exercises.map(e=>({day:s.day,e})));
const out={probe:'R7A1-QE-P08',switchWeeks:[8,9],timelines:[],summary:{legacyRowsRead:0,A:{pure:0,legacy:0},B:{pure:0,legacy:0},statusNotOk:0,sameAsPure:0}};
for(const goal of ['STRENGTH','HYPERTROPHY'])for(const known of [true,false])for(const days of [[0],[0,3]])for(const minutes of [25,30,35])for(const sw of [8,9]){
 const ia=intake(`qa1-p08-${goal}-${known}-${days.length}-${minutes}`,{goal,known,days,minutes});
 const run=legacy=>{const g=(legacy?PRE:A1).R.generateProgram(ia,(legacy?PRE:A1).opts);const t={p:g.program,ledger:[]},bad=[];if(!t.p)return null;const A=[],B=[],largest={},capped=new Set();let legacyRows=0;
  for(let w=0;w<14;w++){const RT=legacy&&w<sw?PRE:A1;
   if(w>=7){const st=t.p.stateTrace[w].strength.exercises,rows=rowsOf(t.p,w);for(const [id,ex] of Object.entries(st))if(Number.isInteger(ex.regainCap)||Number.isInteger(ex.setCap)||Number.isInteger(ex.returnStep))capped.add(id);
    for(const {e} of rows){if(!e.exposure&&RT===A1)legacyRows++;if((!legacy||w>sw)&&capped.has(e.id)&&Number.isInteger(largest[e.id])&&e.sets>largest[e.id]+1)B.push(`w${w} ${e.id} ${e.sets} > ${largest[e.id]}+1`);}
    const s=weekly(RT,t,w);if(!['MODIFY','KEEP'].includes(s))bad.push(`w${w}:${s}`);if(w===8){const s2=ev(RT,t,at(t.p,w,6,'22:00:00',{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:75}}));if(!['MODIFY','KEEP'].includes(s2))bad.push(`w${w}+:${s2}`);}
    for(const {e} of rows)largest[e.id]=Math.max(largest[e.id]??0,e.sets);
    const next=t.p.stateTrace[w+1].strength.exercises;
    for(const [id,ex] of Object.entries(st)){const mine=rows.filter(x=>x.e.id===id);if(!mine.length)continue;const last=mine.at(-1).e,planned=t.p.stateTrace[w].strength.planned?.[id],base=last.exposure?.baseSets??planned?.baseSets,trimmed=Number.isInteger(base)&&last.sets<base&&(last.exposure?.phasedSets??planned?.sets)===base;
     for(const cap of ['regainCap','setCap'])if(RT===A1&&Number.isInteger(ex[cap])&&trimmed&&!Number.isInteger(ex.returnStep)&&!(Number.isInteger(next[id]?.[cap])&&next[id][cap]<=ex[cap]))A.push(`w${w} ${id} ${cap} ${ex[cap]} -> ${next[id]?.[cap]??'ended'} (row ${last.sets}/${base}${last.exposure?'':' legacy'})`);}
   }else weekly(RT,t,w,s=>!(s.sport==='STRENGTH'&&w>=2&&w<=6));
  }
  return {A,B,bad,legacyRows,P:t.p};};
 const pure=run(false),legacy=run(true);if(!pure||!legacy)continue;
 out.summary.legacyRowsRead+=legacy.legacyRows;out.summary.A.pure+=pure.A.length;out.summary.A.legacy+=legacy.A.length;out.summary.B.pure+=pure.B.length;out.summary.B.legacy+=legacy.B.length;out.summary.statusNotOk+=legacy.bad.length+pure.bad.length;
 const same=JSON.stringify(pure.P.weeks.slice(sw).map(w=>rowsOf(pure.P,w.index).map(x=>x.e.id+':'+x.e.sets)))===JSON.stringify(legacy.P.weeks.slice(sw).map(w=>rowsOf(legacy.P,w.index).map(x=>x.e.id+':'+x.e.sets)));if(same)out.summary.sameAsPure++;
 out.timelines.push({id:ia.athlete.id,switchWeek:sw,legacyRows:legacy.legacyRows,A:{pure:pure.A,legacy:legacy.A},B:{pure:pure.B,legacy:legacy.B},bad:[...pure.bad,...legacy.bad],sameStrengthCountsAfterSwitch:same});
}
out.timelines=out.timelines.filter(x=>x.A.legacy.length||x.B.legacy.length||x.bad.length||!x.sameStrengthCountsAfterSwitch).slice(0,30);
fs.rmSync(tmp,{recursive:true,force:true});
print(out);
