// Differential of the evidence lineage fix-forward (read-only): the same conforming clients sent through the composed entry point of two
// versions of the code (the judged candidate before it, and this one), review by review. What must be identical: the engine's whole answer
// (the plan, the decision, its record, the credit, the load, the holds), every session as it is selected (expression, pattern, blocks, dose),
// every execution as it is read (status, basis, completion, measured distance), the screen, the asks and the format rows of the record.
// What may differ, and only in this direction: a run withheld from pace readers that was not (never the reverse), a history reference that is
// lower (never higher), and what follows from those in the same journey (the calibration made over the admitted record; a later continuous
// run sized from it, and then the report of that run, which a conforming client sends as the run was prescribed). Everything else is reported
// as UNEXPECTED.
//   node differential.mjs <CoachingCore before> <CoachingCore after> [--json]
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
const [before,after]=process.argv.slice(2),imp=(root,f)=>import(pathToFileURL(path.join(root,f)).href);
const H={before:await imp(before,'test/v1rws-helpers.mjs'),after:await imp(after,'test/v1rws-helpers.mjs')};
const sha=o=>createHash('sha256').update(JSON.stringify(o)).digest('hex');
const UNKNOWN={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const TIMES=['17:00','18:00','19:00','20:00','21:00','22:00','23:00'];
const MINE=['runSessions','runFormat','runFormatRecord','runHistoryRecord','runCalibration'];

// ---------- the clients (each returns the answers it got, in order) ----------
function clients(h){
 const {timeline,sixteen,raceTen,atSixteen,weekWith,asPrescribed,nativeReport,report,live,ELIG}=h;
 const plain=(t,s)=>{const o=s.sport==='RUN'?asPrescribed(t,s):{};return o?.eventId?o:report(t.p,s,o??{});};
 const weeks=(t,from,to,how=()=>null,extra={})=>{for(let w=from;w<Math.min(to,t.p.weeks.length);w++)t.week(w,s=>{const o=how(t,w,s);return o===null?asPrescribed(t,s):o;},extra);return t;};
 const scene=family=>{
  const t=atSixteen();let w,s;
  if(family==='LONG'){w=1;s=t.long;}else{t.week(1,weekWith(t,1,null,null));t.week(2,weekWith(t,2,null,null));w=3;s=t.runsOf(3,q=>q.role==='EASY').find(q=>t.runs[q.id]?.expression==='NATIVE');}
  const run=t.runs[s.id],km=run.blocks.flatMap(b=>b.steps).find(q=>q.kind==='STEADY').target.metres/1000,min=Math.round(run.estimate.durationMinutes.low);
  const x={t,w,s,run,km,min,first:Math.round(km*0.6*100)/100,second:Math.round(km*0.4*100)/100,n:0};
  let rest=t.p.weeks[w].sessions.filter(live).filter(q=>q.id!==s.id).map(q=>plain(t,q));
  x.review=(observations,extra={})=>{const r=t.step(w,6,'WEEKLY_REVIEW',{observations:[...rest,...observations],...extra},TIMES[x.n++]);rest=[];return r;};
  x.at=(same=false)=>`${t.day(w,6)}T${same?TIMES[x.n]:String(Number(TIMES[x.n].slice(0,2))-1).padStart(2,'0')+':30'}:00-03:00`;
  x.app=(actual={},eventId='app-x',cite='TIME',o={})=>{const r={...nativeReport(t,s,{minutes:o.minutes??min,rpe:3,actual,...(o.completed===false?{completed:false}:{})}),eventId};if(cite==='TIME')r.actual.formatHash=run.timeFormatHash;return r;};
  x.dev=(actual={},eventId='dev-x',activity='hk-1')=>({eventId,athleteId:t.p.athleteId,sessionId:s.id,occurrenceDate:s.date,...(activity?{canonicalActivityId:activity}:{}),source:{provider:'HEALTHKIT',...(activity?{activityId:activity}:{}),quality:'WEARABLE_FULL'},actual:{completed:true,minutes:min,distanceKm:x.first,measurement:'GPS',gpsQuality:'OK',rpe:3,...actual},response:UNKNOWN});
  x.corr=(o,of,at=x.at())=>({...o,correctionOf:of,correctedAt:at});x.list=()=>[{distanceKm:x.second,measurement:'GPS'}];x.whole=()=>({distanceKm:km,measurement:'GPS',gpsQuality:'OK'});
  x.end=()=>{t.week(w+1,weekWith(t,w+1,null,null));t.week(w+2,weekWith(t,w+2,null,null));return t;};
  return x;
 };
 const lists=x=>x.app({segments:x.list()}),firstFile=x=>x.dev({segments:[]});
 const three=(name,a,d,then=()=>{})=>({[name+' | one review']:x=>{x.review([a(x),d(x)]);then(x);},[name+' | app, then import']:x=>{x.review([a(x)]);x.review([d(x)]);then(x);},[name+' | import, then app']:x=>{x.review([d(x)]);x.review([a(x)]);then(x);}});
 const stop=x=>({...x.app({},'app-stop','TIME',{completed:false,minutes:30}),actual:{completed:false,minutes:30,stop:{reason:'SYMPTOM'}}});
 const SCENES={
  'S01 one source, one whole measurement':x=>x.review([x.app(x.whole(),'app-x','NATIVE')]),
  'S01b one source, by time, no distance':x=>x.review([x.app({},'app-x','TIME')]),
  'S01c the import alone, whole':x=>x.review([x.dev({distanceKm:x.km})]),
  ...three('S02 two complementary files (the import silent on recordings)',lists,x=>x.dev({})),
  ...three('S02b two complementary files (the import sends an empty list)',lists,firstFile),
  ...three('S15 two whole sources that agree',x=>x.app(x.whole(),'app-x','NATIVE'),x=>x.dev({distanceKm:x.km})),
  ...three('S10 the app says the whole, the import the first file (disputed)',x=>x.app(x.whole(),'app-x','NATIVE'),firstFile),
  ...three('S-untimed the import carries no duration',x=>x.app({}),x=>{const o=x.dev({});delete o.actual.minutes;return o;}),
  ...three('S-declared the athlete corrects the watch with a listed reason',x=>x.app({declared:{distanceKm:x.km,reason:'SIGNAL_LOSS'}},'app-x','NATIVE'),x=>x.dev({distanceKm:Math.round(x.km*0.93*100)/100})),
  ...three('S-heat the athlete says HEAT, the import agrees',x=>x.app({distanceKm:x.first,measurement:'GPS',gpsQuality:'OK',conditions:['HEAT']}),x=>x.dev({})),
  ...three('S-overlap both measured the whole, the app lists a further recording',x=>x.app({distanceKm:x.first,measurement:'GPS',segments:x.list()},'app-x','NATIVE'),x=>x.dev({distanceKm:x.km})),
  'S13 one speaker: the app lists, then corrects itself to the whole':x=>{x.review([x.app({distanceKm:x.first,measurement:'GPS',gpsQuality:'OK',segments:x.list()},'app-x','NATIVE')]);x.review([x.corr(x.app(x.whole(),'app-x-v2','NATIVE'),'app-x')]);},
  'S14 one speaker: the import alone, then its re-sync':x=>{x.review([x.dev({distanceKm:x.km})]);x.review([x.corr(x.dev({distanceKm:x.km},'dev-x-v2'),'dev-x')]);},
  'S-stop a symptom stop alone, then the screen answered':x=>{x.review([stop(x)]);x.t.step(x.w+1,0,'WEEKLY_REVIEW',{eligibility:ELIG(`${x.t.day(x.w,6)}T23:30:00-03:00`)});},
  ...three('L03 the import re-syncs its part of a merged row',lists,firstFile,x=>x.review([x.corr(x.dev({},'dev-x-v2'),'dev-x')])),
  'L05 a correction of the correction':x=>{x.review([lists(x)]);x.review([firstFile(x)]);x.review([x.corr(x.dev({},'dev-x-v2'),'dev-x')]);x.review([x.corr(x.dev({},'dev-x-v3'),'dev-x-v2')]);},
  'L08 the app corrects itself to the whole; the import of the 1st file stands':x=>{x.review([lists(x)]);x.review([firstFile(x)]);x.review([x.corr(x.app(x.whole(),'app-x-v2','NATIVE'),'app-x')]);},
  'L09 the same three reports, the import arriving last':x=>{x.review([lists(x)]);x.review([x.corr(x.app(x.whole(),'app-x-v2','NATIVE'),'app-x')]);x.review([firstFile(x)]);},
  'L11 the app corrects itself to the whole; the import measured the whole too':x=>{x.review([x.app({distanceKm:x.first,measurement:'GPS',gpsQuality:'OK',segments:x.list()},'app-x','NATIVE')]);x.review([x.dev({distanceKm:x.km})]);x.review([x.corr(x.app(x.whole(),'app-x-v2','NATIVE'),'app-x')]);},
  'L12 both sources corrected to the whole':x=>{x.review([lists(x)]);x.review([firstFile(x)]);x.review([x.corr(x.app(x.whole(),'app-x-v2','NATIVE'),'app-x')]);x.review([x.corr(x.dev({distanceKm:x.km},'dev-x-v2'),'app-x-v2')]);},
  'L16 retraction by the import':x=>{x.review([lists(x)]);x.review([firstFile(x)]);x.review([x.corr(x.dev({completed:false,minutes:0,distanceKm:undefined,rpe:undefined},'dev-x-v2'),'dev-x')]);},
  'L17 retraction by the athlete':x=>{x.review([lists(x)]);x.review([firstFile(x)]);x.review([x.corr(x.app({},'app-x-v2','TIME',{completed:false,minutes:0}),'app-x')]);},
  'L18 conflict: the import first, the app refused, then the re-sync':x=>{x.review([firstFile(x)]);x.review([x.app({segments:x.list()},'zz-app','TIME',{minutes:x.min+25})]);x.review([x.corr(x.dev({},'dev-x-v2'),'dev-x')]);},
  'L18b conflict with no correction: the import first, the app refused':x=>{x.review([firstFile(x)]);x.review([x.app({segments:x.list()},'zz-app','TIME',{minutes:x.min+25})]);},
  'L19 conflict: the app first, the import refused, then the app corrects itself':x=>{x.review([x.app({segments:x.list()},'app-x','TIME',{minutes:x.min+25})]);x.review([firstFile(x)]);x.review([x.corr(x.app(x.whole(),'app-x-v2','NATIVE'),'app-x')]);},
  'L20 a re-sync under another activity id':x=>{x.review([lists(x)]);x.review([firstFile(x)]);x.review([x.corr(x.dev({},'dev-y','hk-2'),'dev-x')]);},
  'L21 a symptom stop the import contradicts, then the import re-syncs':x=>{x.review([x.dev({distanceKm:x.km})]);x.review([stop(x)]);x.review([x.corr(x.dev({distanceKm:x.km},'dev-x-v2'),'dev-x')]);},
  'L22 a correction the engine refuses, one speaker':x=>{x.review([x.app(x.whole(),'app-x','NATIVE')]);x.review([x.corr(x.app(x.whole(),'app-x-v2','NATIVE'),'app-x',`${x.s.date}T05:00:00-03:00`)]);},
  'L24 a device with no activity id re-syncs':x=>{x.review([x.dev({distanceKm:x.km},'dev-x',null)]);x.review([x.corr(x.dev({distanceKm:x.km},'dev-x-v2',null),'dev-x')]);},
  'L-heat the athlete says HEAT, and the import re-syncs':x=>{x.review([x.app({distanceKm:x.first,measurement:'GPS',gpsQuality:'OK',conditions:['HEAT']})]);x.review([x.dev({})]);x.review([x.corr(x.dev({},'dev-x-v2'),'dev-x')]);},
 };
 const out={
  'P1 the experienced runner, twelve weeks as prescribed':()=>weeks(timeline(sixteen()),0,12),
  'P2 the same, every run by time':()=>weeks(timeline(sixteen()),0,8,()=>null,{runExpression:'TIME'}),
  'P3 a 10 km race plan to the race, measured whole':()=>{const t=timeline(raceTen()),race=t.p.weeks.flatMap(w=>w.sessions).find(s=>s.prescription?.family==='RACE');return weeks(t,0,race.weekIndex+1,(u,w,s)=>s.prescription?.family==='RACE'?{...report(u.p,s,{}),eventId:'race',actual:{completed:true,minutes:50,distanceKm:10,measurement:'GPS',gpsQuality:'OK',rpe:9}}:null);},
  'P4 reports that miss, stop for fatigue and come short':()=>weeks(timeline(sixteen()),0,8,(t,w,s)=>s.role==='EASY'&&w%3===1?false:s.role==='LONG'&&w===2?{...report(t.p,s,{}),eventId:'short-'+s.id,actual:{completed:false,minutes:40,stop:{reason:'FATIGUE'}}}:null),
  'P5 every run also imported by the watch, the two agreeing':()=>{const t=timeline(sixteen());for(let w=0;w<6;w++){t.week(w,s=>asPrescribed(t,s));const imports=t.runsOf(w).filter(s=>t.row(s.id)).map(s=>({eventId:'hk-'+s.id,athleteId:t.p.athleteId,sessionId:s.id,occurrenceDate:s.date,canonicalActivityId:'act-'+s.id,source:{provider:'HEALTHKIT',activityId:'act-'+s.id,quality:'WEARABLE_FULL'},actual:{completed:true,minutes:t.row(s.id).actual.minutes,...(t.row(s.id).actual.distanceKm?{distanceKm:t.row(s.id).actual.distanceKm,measurement:'GPS'}:{})},response:UNKNOWN}));t.step(w,6,'WEEKLY_REVIEW',{observations:imports},'21:00');}return t;},
  'P6 a marathon plan, ten weeks as prescribed':()=>weeks(timeline(sixteen({goal:{kind:'RACE',event:{kind:'MARATHON',date:'2027-03-07'}},weeks:16})),0,10),
 };
 for(const family of ['EASY','LONG'])for(const [name,send] of Object.entries(SCENES))out[`${family} ${name}`]=()=>{const x=scene(family);send(x);return x.end();};
 return out;
}

// ---------- the comparison ----------
const engineOf=r=>sha(Object.fromEntries(Object.entries(r).filter(([k])=>!MINE.includes(k))));
const selectionOf=s=>({expression:s.expression,pattern:s.pattern??null,formatHash:s.formatHash??null,blocks:s.blocks??null,estimate:s.estimate??null,dose:s.dose??null,unavailable:s.unavailable??null,prescribed:s.prescribed??null,provisional:s.provisional??null,instructions:s.instructions??null});
const readingOf=e=>e?{status:e.status,basis:e.basis??null,tier:e.tier??null,flag:e.flag??null,ask:e.ask??null,stop:e.stop??null,completed:e.completed,actualMinutes:e.actualMinutes,measuredKm:e.measuredKm,declaredKm:e.declaredKm,reliability:e.reliability,targetKm:e.targetKm??null,countsForPause:e.countsForPause??null,aboveEstimate:e.aboveEstimate??null,steps:(e.steps??[]).map(s=>({...s,extentFraction:undefined}))}:null;
const stateOf=f=>f?{status:f.status,reason:f.reason??null,week:f.week??null,prescribing:f.prescribing??null,native:f.native??null,time:f.time??null,asks:f.asks??null,offers:f.offers??null,warningSignScreen:f.warningSignScreen??null,pausedContinuous:f.pausedContinuous??null,history:f.history??null,unreadableFormats:f.unreadableFormats??null,unreadableReports:f.unreadableReports??null,notRecorded:f.notRecorded??null}:null;
const formatsOf=rec=>(rec??[]).filter(r=>r?.fact==='RUN_FORMAT_EMITTED');
function compare(name,a,b){
 const found=[],note=(kind,what)=>found.push({kind,what}),moved=new Set();let tainted=false;
 if(a.length!==b.length)note('UNEXPECTED',`answers: ${a.length} before, ${b.length} after`);
 for(let i=0;i<Math.min(a.length,b.length);i++){
  const x=a[i],y=b[i],at=`review ${i+1}`;
  const withheld=r=>new Map((r.runFormat?.paceEvidenceWithheld??[]).map(w=>[w.sessionId+'|'+w.eventId,w.reason]));
  const wa=withheld(x),wb=withheld(y);
  for(const [k,reason] of wa)if(!wb.has(k))note('UNEXPECTED',`${at}: ${k} was withheld (${reason}) and is delivered`);else if(wb.get(k)!==reason)note('UNEXPECTED',`${at}: ${k} withheld as ${reason} before, ${wb.get(k)} after`);
  for(const [k,reason] of wb)if(!wa.has(k)){note('NEWLY_WITHHELD',`${at}: ${k} ${reason}`);tainted=true;}
  const sa=x.runSessions??{},sb=y.runSessions??{};
  for(const id of new Set([...Object.keys(sa),...Object.keys(sb)])){
   const p=sa[id],q=sb[id];if(!p||!q){note(tainted?'FOLLOWS':'UNEXPECTED',`${at}: session ${id} only ${p?'before':'after'}`);continue;}
   const ea=p.execution??null,eb=q.execution??null;
   // A session delivered in another expression after a difference above is reported as it was prescribed: its execution follows.
   if(ea&&eb&&moved.has(id)){if(sha(readingOf(ea))!==sha(readingOf(eb))||ea.extentKm!==eb.extentKm||ea.paceEvidence!==eb.paceEvidence)note('FOLLOWS',`${at}: execution of ${id}, reported as it was prescribed (${p.expression} before, ${q.expression} after)`);}
   else if(ea&&eb){
    if(sha(readingOf(ea))!==sha(readingOf(eb)))note('UNEXPECTED',`${at}: execution of ${id} is read differently`);
    if((ea.extentKm??null)!==(eb.extentKm??null)){if(eb.extentKm!==null&&ea.extentKm!==null&&eb.extentKm<ea.extentKm){note('HISTORY_LOWER',`${at}: ${id} ${ea.extentKm} -> ${eb.extentKm}`);tainted=true;}else note('UNEXPECTED',`${at}: history reference of ${id} ${ea.extentKm} -> ${eb.extentKm}`);}
    if(ea.paceWithheld!==eb.paceWithheld&&!(ea.paceWithheld===null&&eb.paceWithheld!==null))note('UNEXPECTED',`${at}: paceWithheld of ${id} ${ea.paceWithheld} -> ${eb.paceWithheld}`);
    if(ea.paceEvidence!==eb.paceEvidence&&!(ea.paceEvidence===true&&eb.paceEvidence===false&&eb.paceWithheld!==null))note('UNEXPECTED',`${at}: paceEvidence of ${id} ${ea.paceEvidence} -> ${eb.paceEvidence}`);
   }else if(ea||eb)note('UNEXPECTED',`${at}: execution of ${id} only ${ea?'before':'after'}`);
   if(sha(selectionOf(p))!==sha(selectionOf(q))){if(tainted)moved.add(id);note(tainted?'FOLLOWS':'UNEXPECTED',`${at}: session ${id} is ${p.expression}${p.expression!==q.expression?' -> '+q.expression:''}, selected differently`);}
  }
  if(engineOf(x)!==engineOf(y))note(tainted?'FOLLOWS':'UNEXPECTED',`${at}: the engine's answer differs`);
  if(sha(stateOf(x.runFormat))!==sha(stateOf(y.runFormat)))note(tainted?'FOLLOWS':'UNEXPECTED',`${at}: the extension's state differs`);
  if((x.runCalibration?.hash??sha(x.runCalibration))!==(y.runCalibration?.hash??sha(y.runCalibration)))note(tainted?'FOLLOWS':'UNEXPECTED',`${at}: the calibration differs`);
  if(sha(formatsOf(x.runFormatRecord))!==sha(formatsOf(y.runFormatRecord)))note(tainted?'FOLLOWS':'UNEXPECTED',`${at}: the format rows of the record differ`);
  if(sha(x.runHistoryRecord??null)!==sha(y.runHistoryRecord??null))note('UNEXPECTED',`${at}: the history record differs`);
 }
 return found;
}
const A=clients(H.before),B=clients(H.after),report={},totals={clients:0,reviews:0,identical:0,NEWLY_WITHHELD:0,HISTORY_LOWER:0,FOLLOWS:0,UNEXPECTED:0};
for(const name of Object.keys(A)){
 let a,b;try{a=A[name]().results;b=B[name]().results;}catch(e){report[name]=[{kind:'UNEXPECTED',what:'threw: '+String(e?.stack??e).slice(0,300)}];totals.UNEXPECTED++;continue;}
 const found=compare(name,a,b);totals.clients++;totals.reviews+=a.length;if(!found.length)totals.identical++;for(const f of found)totals[f.kind]++;
 if(found.length)report[name]=found;
}
if(process.argv.includes('--json'))console.log(JSON.stringify({totals,report},null,1));
else{console.log(JSON.stringify(totals));for(const [name,found] of Object.entries(report)){console.log('## '+name);for(const f of found)console.log('   '+f.kind.padEnd(15)+f.what);}}
process.exitCode=totals.UNEXPECTED?1:0;
