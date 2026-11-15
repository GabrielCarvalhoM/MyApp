// Differential of the QRE-RWS-E-01 patch (author's probe, read-only): the frozen candidate (COACHINGCORE-V1-RUN-FORMAT-FREEZE-1) against the patch.
//   node differential.mjs <CoachingCore frozen> <CoachingCore patch> [--json]
// Two layers, neither with a "it follows" classifier:
// A. ANSWERS. The same conforming clients through the composed entry point of both versions, review by review. An answer is either byte for
//    byte the same, or the client is one that diverged. A client may diverge only at a review where both versions were sent the same request
//    and layer B finds a masked row in the records of the patch's answer. After that review the two clients are no longer the same client (a
//    conforming client reports each session as it was prescribed), and what is still checked there is: the engine's answer is the same whenever
//    the engine was sent the same request, and nothing the frozen candidate withholds is delivered by the patch.
// B. SAME RECORDS. For the records of every answer of both clients (the engine's record, the record of formats and report facts, the history
//    record), the pure readers of both versions are run on the same input: the reading of each live run row, its distance facts, its execution,
//    the admission, the history, the exported calibration. They must be identical, except on a MASKED row, which must be exactly this, judged
//    by the FROZEN code: a live run row with no distance, whose frozen word is a reason of the distance, while a report in force for its session
//    is none of the reports it was made of (or the record of reports cannot be read whole). On a masked row the patch withholds, by the
//    reason of the row whole, and nothing else of the row differs. The patch's calibration must be the frozen calibration over the frozen
//    admission with the masked rows handed as a withheld row is (no distance, marked POOR): an oracle that uses no line of the patch.
// C. A TABLE. Every combination of a small grid of rows and report facts built by hand, both versions: the same rule, cell by cell.
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
const [zRoot,pRoot]=process.argv.slice(2),imp=(root,f)=>import(pathToFileURL(path.join(root,f)).href);
const load=async root=>({H:await imp(root,'test/v1rws-helpers.mjs'),RF:await imp(root,'src/v1-run-format.mjs'),RH:await imp(root,'src/v1-run-history.mjs'),C:await imp(root,'src/v1-run-calibration.mjs'),P:await imp(root,'src/r6-provenance.mjs')});
const Z=await load(zRoot),P=await load(pRoot),V=Z.H.VALUES;
const sha=o=>createHash('sha256').update(JSON.stringify(o)??'undefined').digest('hex');
const UNKNOWN={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const TIMES=['17:00','18:00','19:00','20:00','21:00','22:00','23:00'];
const MINE=['runSessions','runFormat','runFormatRecord','runHistoryRecord','runCalibration'],EXT_KEYS=['runFormatRecord','runHistoryRecord','runExpression','runEvidenceRecord','runEvidence'];
const DIST=['SEVERAL_RECORDINGS','CORRECTED_MEASUREMENT','DURATION_REQUIRED','DISTANCE_DISPUTED'],WHOLE=['REPORT_NOT_CARRIED','REPORTS_UNREADABLE'];
const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o),num=(v,lo,hi)=>typeof v==='number'&&Number.isFinite(v)&&v>=lo&&v<=hi;
const without=(o,keys)=>Object.fromEntries(Object.entries(o).filter(([k])=>!keys.includes(k)));

// ---------- the clients ----------
function clients(h){
 const {sixteen,raceTen,weekWith,asPrescribed,nativeReport,report,live,ELIG,paced}=h;
 // A timeline that keeps every request it sent, with the plan it was sent for.
 const timeline=(...a)=>{const t=h.timeline(...a);if(!t.p)return t;t.reqs=[];const review=t.review;t.review=(...b)=>{const r=review(...b);t.reqs.push({review:r,program:t.p});return r;};return t;};
 const atSixteen=()=>{const t=timeline(sixteen());t.week(0,paced);t.long=t.runsOf(1,s=>s.role==='LONG')[0];return t;};
 const plain=(t,s)=>{const o=s.sport==='RUN'?asPrescribed(t,s):{};return o?.eventId?o:report(t.p,s,o??{});};
 const weeks=(t,from,to,how=()=>null,extra={})=>{for(let w=from;w<Math.min(to,t.p.weeks.length);w++)t.week(w,s=>{const o=how(t,w,s);return o===null?asPrescribed(t,s):o;},extra);return t;};
 // The clients of the lineage differential (phase-a/evidence-lineage/fix-forward/probes/differential.mjs), unchanged: none is an E-01 client.
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
  // Rows with no distance in the same scene (new here): the athlete's report by time, corrected by the athlete with and without a reason of the distance.
  'N01 no distance: the app by time and a watch with minutes only, merged':x=>x.review([x.app({}),x.dev({distanceKm:undefined,measurement:undefined,gpsQuality:undefined})]),
  'N02 no distance: the app lists a recording, alone':x=>x.review([lists(x)]),
  'E01-easy the app by time, the watch POOR; the app corrects itself, listing a recording':x=>{x.review([x.app({}),x.dev({gpsQuality:'POOR'})]);x.review([x.corr(x.app({segments:x.list()},'app-x-v2'),'app-x')]);},
  'E01-easy the same, the correction declares with a listed failure reason':x=>{x.review([x.app({}),x.dev({gpsQuality:'POOR'})]);x.review([x.corr(x.app({declared:{distanceKm:x.km,reason:'SIGNAL_LOSS'}},'app-x-v2'),'app-x')]);},
  'E01-easy the same, a plain correction (closed by the frozen candidate)':x=>{x.review([x.app({}),x.dev({gpsQuality:'POOR'})]);x.review([x.corr(x.app({},'app-x-v2'),'app-x')]);},
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
 // ---------- the E-01 clients: the harder session of weeks 3 to 6, the athlete's work pace, a watch import, the athlete's correction ----------
 const EXTRA={plain:{},lists:{segments:[{distanceKm:4,measurement:'GPS'}]},declares:{declared:{distanceKm:9,reason:'SIGNAL_LOSS'}},both:{segments:[{distanceKm:4,measurement:'GPS'}],declared:{distanceKm:9,reason:'SIGNAL_LOSS'}}};
 const device=(t,q,actual,id='dev-'+q.id,activity='hk-'+q.id)=>({eventId:id,athleteId:t.p.athleteId,sessionId:q.id,occurrenceDate:q.date,canonicalActivityId:activity,source:{provider:'HEALTHKIT',activityId:activity,quality:'WEARABLE_FULL'},actual:{completed:true,minutes:q.prescription.durationMinutes,...actual},response:UNKNOWN});
 const quality=(how,{order='one',late=false,laps=false,watch={distanceKm:9,measurement:'GPS',gpsQuality:'POOR'},first={},more=null,until=8,pace=255,rpe=7}={})=>()=>{
  const t=atSixteen();t.week(1,weekWith(t,1,null,null));t.week(2,weekWith(t,2,null,null));const pending=[];
  const flush=w=>{if(pending.length)t.step(w,2,'WEEKLY_REVIEW',{observations:pending.splice(0).map(o=>({...o,correctedAt:`${t.day(w,2)}T09:00:00-03:00`}))},'10:00');};
  for(const w of [3,4,5,6]){
   flush(w);
   const q=t.runsOf(w,s=>s.role==='QUALITY')[0],run=t.runs[q.id],rest=t.p.weeks[w].sessions.filter(live).filter(s=>s.id!==q.id).map(s=>plain(t,s)),day=t.day(w,6);
   const said=laps&&run.expression==='NATIVE'?nativeReport(t,q,{rpe,actual:{work:{paceSecondsPerKm:pace}}}):(b=>({...b,actual:{...b.actual,formatHash:run.timeFormatHash}}))(report(t.p,q,{workPace:pace,rpe}));
   const a1={...said,eventId:'app-'+q.id,actual:{...said.actual,...first}},d1=watch?device(t,q,watch):null;
   if(!d1||order==='one')t.step(w,6,'WEEKLY_REVIEW',{observations:[...rest,a1,...(d1?[d1]:[])]},'18:00');
   else if(order==='import listed first')t.step(w,6,'WEEKLY_REVIEW',{observations:[d1,...rest,a1]},'18:00');
   else if(order==='app, then import'){t.step(w,6,'WEEKLY_REVIEW',{observations:[...rest,a1]},'17:00');t.step(w,6,'WEEKLY_REVIEW',{observations:[d1]},'18:00');}
   else{t.step(w,6,'WEEKLY_REVIEW',{observations:[...rest,d1]},'17:00');t.step(w,6,'WEEKLY_REVIEW',{observations:[a1]},'18:00');}
   if(how!==null){const a2={...a1,eventId:a1.eventId+'-v2',actual:{...a1.actual,...EXTRA[how]},correctionOf:a1.eventId,correctedAt:`${day}T19:30:00-03:00`};if(late)pending.push(a2);else t.step(w,6,'WEEKLY_REVIEW',{observations:[a2]},'20:00');}
   if(more)t.step(w,6,'WEEKLY_REVIEW',{observations:[more(t,q)]},'21:00');
  }
  for(let w=7;w<=until;w++){flush(w);t.week(w,weekWith(t,w,null,null));}
  return t;
 };
 const refused=(t,q)=>({...device(t,q,{},`dev-${q.id}-v2`),correctionOf:`dev-${q.id}`,correctedAt:`${q.date}T05:00:00-03:00`}),third=(t,q)=>device(t,q,{minutes:q.prescription.durationMinutes+25},'gar-'+q.id,'gar-'+q.id);
 const resync=(t,q)=>({...device(t,q,{distanceKm:9,measurement:'GPS',gpsQuality:'POOR'},`dev-${q.id}-v2`),correctionOf:`dev-${q.id}`,correctedAt:`${t.day(q.weekIndex,6)}T20:30:00-03:00`});
 const Q={
  'Q00 the watch POOR, merged, no correction (control)':quality(null),
  'Q01 a plain correction (closed by the frozen candidate)':quality('plain'),
  'Q02 E-01: the correction lists a recording':quality('lists'),
  'Q03 E-01: the correction declares with a listed failure reason':quality('declares'),
  'Q04 E-01: the correction lists and declares':quality('both'),
  'Q05 E-01: lists, the import listed first in the review':quality('lists',{order:'import listed first'}),
  'Q06 E-01: lists, the app then the import':quality('lists',{order:'app, then import'}),
  'Q07 E-01: lists, the import then the app':quality('lists',{order:'import, then app'}),
  'Q08 E-01: declares, each correction in the middle of the following week':quality('declares',{late:true,until:9}),
  'Q09 E-01: native sessions by their laps, the correction declares':quality('declares',{laps:true}),
  'Q10 native sessions by their laps, a plain correction':quality('plain',{laps:true}),
  'Q11 native sessions by their laps, merged (control)':quality(null,{laps:true}),
  'Q12 E-01: a merged row with no distance and a correction of the import the engine refuses':quality(null,{watch:{},first:EXTRA.lists,more:refused}),
  'Q13 a merged row with no distance that lists a recording, every report on it':quality(null,{watch:{},first:EXTRA.lists}),
  'Q14 a merged row with no distance and a third report in conflict':quality(null,{watch:{},first:EXTRA.lists,more:third}),
  'Q15 one speaker: the athlete alone corrects, listing':quality('lists',{watch:null}),
  'Q16 one speaker: the athlete alone corrects, declaring':quality('declares',{watch:null}),
  'Q17 the athlete alone, the work pace, no correction':quality(null,{watch:null}),
  'Q18 E-01: the athlete corrects listing, then the import re-syncs':quality('lists',{more:resync}),
  'Q19 E-01: slower than the band at an effort inside the cue (the step down)':quality('lists',{pace:360,rpe:7}),
  'Q20 the watch not flagged (GPS OK), the correction lists':quality('lists',{watch:{distanceKm:9,measurement:'GPS',gpsQuality:'OK'}}),
 };
 Object.assign(out,Q);
 // The latest easy run of week 3 by time; the watch POOR; the athlete corrects, declaring a distance (the sizing source S3 of the week after).
 const easy=(how)=>()=>{
  const t=atSixteen();t.week(1,weekWith(t,1,null,null));t.week(2,weekWith(t,2,null,null));
  const s=t.runsOf(3,q=>q.role==='EASY').at(-1),run=t.runs[s.id],min=Math.round(run.estimate.durationMinutes.low),rest=t.p.weeks[3].sessions.filter(live).filter(q=>q.id!==s.id).map(q=>plain(t,q)),D={declared:{distanceKm:8,reason:'SIGNAL_LOSS'}};
  const app=(actual,eventId='app-x')=>{const r={...nativeReport(t,s,{minutes:min,rpe:3,actual}),eventId};r.actual.formatHash=run.timeFormatHash;return r;};
  if(how==='one speaker')t.step(3,6,'WEEKLY_REVIEW',{observations:[...rest,app(D)]},'18:00');
  else{t.step(3,6,'WEEKLY_REVIEW',{observations:[...rest,app(how==='merged'?D:{}),device(t,s,{minutes:min,distanceKm:8,measurement:'GPS',gpsQuality:'POOR'},'dev-x','hk-1')]},'18:00');
   if(how!=='merged')t.step(3,6,'WEEKLY_REVIEW',{observations:[{...app(how==='declares'?D:{declared:{distanceKm:8}},'app-x-v2'),correctionOf:'app-x',correctedAt:`${t.day(3,6)}T19:30:00-03:00`}]},'20:00');}
  for(const w of [4,5,6])t.week(w,weekWith(t,w,null,null));return t;
 };
 out['Z1 E-01: the latest easy run, corrected with a declaration and a listed failure reason']=easy('declares');
 out['Z2 the latest easy run, corrected with a declaration and no reason (closed by the frozen candidate)']=easy('plain');
 out['Z3 the latest easy run, the declaration and the watch merged']=easy('merged');
 out['Z4 the latest easy run, one speaker declares']=easy('one speaker');
 return out;
}

// ---------- layer B: both versions of the pure readers on the same records ----------
const liveRun=(o,athleteId)=>isObj(o)&&!o.fact&&o.superseded!==true&&o.athleteId===athleteId&&o.context?.sport==='RUN'&&isObj(o.actual)&&typeof o.sessionId==='string';
const wearable=o=>String(o.provenance?.sourceQuality??'').startsWith('WEARABLE');
const drop=(o,keys)=>o===null?null:without(o,keys);
const handedAsWithheld=o=>({...o,actual:{...without(o.actual,['distanceKm']),gpsQuality:'POOR'}});
function sameRecords(tag,{program,review,answer},found){
 const note=(kind,what)=>found.push({kind,what:`${tag}: ${what}`});
 const ledger=Array.isArray(answer.actualLedger)?answer.actualLedger:Array.isArray(review.actualLedger)?review.actualLedger:[],fmt=Array.isArray(answer.runFormatRecord)?answer.runFormatRecord:[],hist=Array.isArray(answer.runHistoryRecord)?answer.runHistoryRecord:[];
 const plan=Z.H.F.validProgram(answer.proposal)?answer.proposal:program,athleteId=plan.athleteId,tz=plan.timezoneOffsetMinutes??0,sessions=new Map(plan.weeks.flatMap(w=>w.sessions.map(s=>[s.id,s])));
 const fz=Z.RF.readReportFacts(fmt,athleteId,V,ledger),fp=P.RF.readReportFacts(fmt,athleteId,V,ledger),frz=Z.RF.readFormatRecord(fmt,athleteId),frp=P.RF.readFormatRecord(fmt,athleteId);
 const masked=new Map();let rows=0;
 for(const o of ledger){
  if(!liveRun(o,athleteId))continue;rows++;
  const rz=Z.RF.reportsReading(o,fz,V),rp=P.RF.reportsReading(o,fp,V),dz=Z.RH.distanceFacts(o.actual,V,{wearable:wearable(o),reports:rz}),dp=P.RH.distanceFacts(o.actual,V,{wearable:wearable(o),reports:rp});
  // The masked row, judged by the frozen code alone.
  const has=num(o.actual.distanceKm,0.01,V.runFacts.runDistanceKmMax),L=fz.inForce(o.sessionId),carried=new Set(Z.RF.sourcesOf(o)),notCarried=!L.bounded||[...L.ids].some(id=>!carried.has(id));
  const isMasked=!has&&rz&&DIST.includes(rz.withheld)&&(notCarried||fz.unreadable.length>0),want=isMasked?(notCarried?'REPORT_NOT_CARRIED':'REPORTS_UNREADABLE'):dz.paceWithheld;
  if(isMasked)masked.set(o.eventId,want);
  if(sha(drop(rz,[]))!==sha(drop(rp,['wholeRow'])))note('UNEXPECTED',`row ${o.eventId}: the reading differs beyond the new key`);
  if(sha(drop(dz,['paceWithheld']))!==sha(drop(dp,['paceWithheld'])))note('UNEXPECTED',`row ${o.eventId}: the distance facts differ beyond paceWithheld`);
  if(dp.paceWithheld!==want)note('UNEXPECTED',`row ${o.eventId}: paceWithheld ${dz.paceWithheld} (frozen) -> ${dp.paceWithheld} (patch), expected ${want}`);
  if(isMasked&&dz.paceWithheld!==null)note('UNEXPECTED',`row ${o.eventId}: masked, yet the frozen code withheld it (${dz.paceWithheld})`);
  // The execution, read against the format the report cites.
  const s=sessions.get(o.sessionId),cz=typeof o.actual.formatHash==='string'?frz.resolve(o.sessionId,o.actual.formatHash):null,cp=typeof o.actual.formatHash==='string'?frp.resolve(o.sessionId,o.actual.formatHash):null,boutMinutes=s?.prescription?.work?.workMinutes??null;
  let ez,ep;try{ez=Z.RF.executionOf(o,cz,V,{boutMinutes,reports:rz});ep=P.RF.executionOf(o,cp,V,{boutMinutes,reports:rp});}catch(e){note('UNEXPECTED',`row ${o.eventId}: executionOf threw ${String(e).slice(0,120)}`);continue;}
  if(sha(drop(ez,['paceWithheld','paceEvidence']))!==sha(drop(ep,['paceWithheld','paceEvidence'])))note('UNEXPECTED',`row ${o.eventId}: the execution differs beyond pace evidence`);
  if(ep.paceWithheld!==want)note('UNEXPECTED',`row ${o.eventId}: execution.paceWithheld ${ep.paceWithheld}, expected ${want}`);
  if(ez.paceEvidence!==ep.paceEvidence&&!(isMasked&&ez.paceEvidence===true&&ep.paceEvidence===false))note('UNEXPECTED',`row ${o.eventId}: paceEvidence ${ez.paceEvidence} -> ${ep.paceEvidence}`);
  if(isMasked&&ep.paceEvidence===true)note('UNEXPECTED',`row ${o.eventId}: masked and still pace evidence`);
  if(isMasked&&ez.paceEvidence===true)note('MASKED_PACE_EVIDENCE',`row ${o.eventId}: the frozen code read it as pace evidence`);
 }
 // The admission.
 const az=Z.H.F.admitted(ledger,{athleteId,facts:fz},V),ap=P.H.F.admitted(ledger,{athleteId,facts:fp},V),key=w=>w.sessionId+'|'+w.eventId,wz=new Map(az.withheld.map(w=>[key(w),w.reason])),wp=new Map(ap.withheld.map(w=>[key(w),w.reason]));
 for(const [k,reason] of wz)if(wp.get(k)!==reason)note('UNEXPECTED',`admission: ${k} ${reason} (frozen) -> ${wp.get(k)??'delivered'} (patch)`);
 for(const [k,reason] of wp)if(!wz.has(k)){const id=k.split('|')[1];if(masked.get(id)!==reason)note('UNEXPECTED',`admission: ${k} newly withheld as ${reason} and not a masked row`);}
 for(const [id] of masked)if(![...wp.keys()].some(k=>k.endsWith('|'+id)))note('UNEXPECTED',`admission: masked row ${id} is not withheld by the patch`);
 // The history, run by run.
 const hz=Z.RH.runHistory({ledger,record:hist,athleteId,tz,reportsOf:o=>Z.RF.reportsReading(o,fz,V)},V),hp=P.RH.runHistory({ledger,record:hist,athleteId,tz,reportsOf:o=>P.RF.reportsReading(o,fp,V)},V);
 if(sha(hz.runs.map(r=>drop(r,['paceWithheld'])))!==sha(hp.runs.map(r=>drop(r,['paceWithheld'])))||sha(hz.unreadable)!==sha(hp.unreadable))note('UNEXPECTED','the history differs beyond paceWithheld');
 for(const r of hp.runs){const id=r.eventId??null,zr=hz.runs.find(x=>x.id===r.id);if(zr&&zr.paceWithheld!==r.paceWithheld&&!(masked.has(id)&&zr.paceWithheld===null&&r.paceWithheld===masked.get(id)))note('UNEXPECTED',`history: run ${r.id} paceWithheld ${zr.paceWithheld} -> ${r.paceWithheld}`);}
 // The exported calibration of the patch against an oracle that uses no line of it: the frozen calibration over the frozen admission, with
 // the masked rows handed as a withheld row is.
 const asOf=Z.P.utcTimestamp(review.asOf);
 if(asOf){
  const args={program:plan,evidenceRecord:Array.isArray(answer.runEvidenceRecord)?answer.runEvidenceRecord:[],asOf,weekIndex:review.weekIndex,hold:['HOLD','CLINICAL_HUMAN_REQUIRED'].includes(answer.status),engineStatus:answer.status,eligibility:review.eligibility??null};
  let oracle,pz,pp;try{oracle=Z.C.runCalibrationOf({...args,ledger:masked.size?az.ledger.map(o=>isObj(o)&&masked.has(o.eventId)&&liveRun(o,athleteId)?handedAsWithheld(o):o):az.ledger},Z.H.DEV);pz=Z.H.F.runCalibrationOf({...args,ledger,runFormatRecord:fmt},Z.H.DEV);pp=P.H.F.runCalibrationOf({...args,ledger,runFormatRecord:fmt},P.H.DEV);}catch(e){note('UNEXPECTED','a calibration threw: '+String(e).slice(0,160));}
  if(oracle&&pp){
   const h=c=>c.hash??sha(c);
   if(h(pp)!==h(oracle))note('UNEXPECTED',`the patch's exported calibration is not the frozen calibration over the frozen admission with the masked rows withheld`);
   if(!masked.size&&h(pp)!==h(pz))note('UNEXPECTED','no masked row, and the exported calibrations differ');
   if(masked.size&&h(pp)!==h(pz))note('MASKED_MOVED_THE_CALIBRATION',`the frozen exported calibration read ${masked.size} masked row(s) and differs`);
  }
 }
 return {rows,masked:[...masked.keys()]};
}

// ---------- layer A: the answers ----------
const engineOf=r=>sha(without(r,MINE)),engineRequest=q=>sha({review:without(q.review,EXT_KEYS),program:q.program}),fullRequest=q=>sha(q);
const withheldOf=r=>new Map((r.runFormat?.paceEvidenceWithheld??[]).map(w=>[w.sessionId+'|'+w.eventId,w.reason]));
function answers(name,a,b,found){
 const note=(kind,what)=>found.push({kind,what});let diverged=null,identical=0,rows=0;
 if(a.results.length!==b.results.length){note('UNEXPECTED',`answers: ${a.results.length} frozen, ${b.results.length} patch`);}
 for(let i=0;i<Math.min(a.results.length,b.results.length);i++){
  const x=a.results[i],y=b.results[i],at=`review ${i+1}`,same=sha(x)===sha(y);
  const bz=[],bp=[],mz=sameRecords(at+' (frozen client)',{program:a.reqs[i].program,review:a.reqs[i].review,answer:x},bz),mp=sameRecords(at+' (patch client)',{program:b.reqs[i].program,review:b.reqs[i].review,answer:y},bp);
  found.push(...bz,...(same?[]:bp));rows+=mz.rows+(same?0:mp.rows);
  if(same){identical++;if(mp.masked.length)note('MASKED_ROW_NOT_YET_READ',`${at}: masked row(s) ${mp.masked.join(', ')} in the records, the answer the same`);continue;}
  if(engineRequest(a.reqs[i])===engineRequest(b.reqs[i])&&engineOf(x)!==engineOf(y))note('UNEXPECTED',`${at}: the same request to the engine, another answer of the engine`);
  const wa=withheldOf(x),wb=withheldOf(y);
  for(const [k,reason] of wa)if(Array.isArray(y.actualLedger)&&y.actualLedger.some(o=>o.eventId===k.split('|')[1]&&o.superseded!==true)&&wb.get(k)!==reason)note('UNEXPECTED',`${at}: ${k} withheld (${reason}) by the frozen candidate, ${wb.get(k)??'delivered'} by the patch`);
  if(diverged===null){
   diverged=i;
   // The first answer that differs: the same request, and a masked row in its records.
   if(fullRequest(a.reqs[i])!==fullRequest(b.reqs[i]))note('UNEXPECTED',`${at}: the first answer that differs was sent another request`);
   if(!mp.masked.length)note('UNEXPECTED',`${at}: the first answer that differs holds no masked row`);
   const newly=[...wb].filter(([k])=>!wa.has(k));
   for(const [k,reason] of newly)if(mp.masked.includes(k.split('|')[1])&&WHOLE.includes(reason))note('NEWLY_WITHHELD',`${at}: ${k} ${reason}`);else note('UNEXPECTED',`${at}: ${k} newly withheld (${reason}) and not a masked row`);
   const cal=r=>r.runCalibration?.hash??sha(r.runCalibration);
   note('FIRST_DIVERGENCE',`${at}: calibration ${cal(x)===cal(y)?'the same':'differs'}; sessions ${sha(x.runSessions)===sha(y.runSessions)?'the same':'differ'}; state ${sha(without(x.runFormat??{},['paceEvidenceWithheld']))===sha(without(y.runFormat??{},['paceEvidenceWithheld']))?'the same but for the withheld list':'differs'}`);
   // What may differ in that answer besides the withheld list and the calibration: the screen, the asks, the offers, the pause, the history never.
   const st=f=>f?{status:f.status,reason:f.reason??null,week:f.week??null,prescribing:f.prescribing??null,asks:f.asks??null,offers:f.offers??null,warningSignScreen:f.warningSignScreen??null,pausedContinuous:f.pausedContinuous??null,history:f.history??null,unreadableFormats:f.unreadableFormats??null,unreadableReports:f.unreadableReports??null,notRecorded:f.notRecorded??null}:null;
   if(sha(st(x.runFormat))!==sha(st(y.runFormat)))note('UNEXPECTED',`${at}: the screen, the asks, the offers, the pause or the history differ`);
   if(sha(x.runHistoryRecord??null)!==sha(y.runHistoryRecord??null))note('UNEXPECTED',`${at}: the history record differs`);
   if(engineOf(x)!==engineOf(y))note('UNEXPECTED',`${at}: the engine's answer differs`);
   // Each session of that answer: its reading is the same but for pace evidence; its selection is the same unless the band it is paced by differs.
   const sa=x.runSessions??{},sb=y.runSessions??{},band=(r,id)=>sha([r.runCalibration?.sessions?.[id]?.pace??null,r.runCalibration?.paceBands?.RECOVERY??null,r.runCalibration?.nextWeek?.paceBands?.RECOVERY??null,r.runCalibration?.estimates?.MARATHON??null,r.runCalibration?.nextWeek?.estimates?.MARATHON??null]);
   for(const id of new Set([...Object.keys(sa),...Object.keys(sb)])){
    const p=sa[id],q=sb[id];if(!p||!q){note('UNEXPECTED',`${at}: session ${id} only ${p?'frozen':'patch'}`);continue;}
    const sel=s=>without(s,['execution']),read=e=>e?without(e,['paceWithheld','paceEvidence']):null,shown=s=>s.expression+'/'+s.pattern+(s.expression==='NATIVE'?' '+(s.blocks.flatMap(k=>k.steps).find(k=>k.kind==='STEADY'&&k.target.type==='DISTANCE')?.target.metres/1000)+' km':'')+' '+(s.planning?.minutes??s.dose?.planningMinutes??'')+' sources '+JSON.stringify(s.dose?.sizing?.sources??null)+(s.unavailable?.native?' ('+s.unavailable.native+')':'');
    if(sha(read(p.execution))!==sha(read(q.execution)))note('UNEXPECTED',`${at}: execution of ${id} is read differently`);
    if(sha(sel(p))!==sha(sel(q))){const sizing=sha(p.dose?.sizing?.sources??null)!==sha(q.dose?.sizing?.sources??null);
     if(band(x,id)!==band(y,id))note('SELECTION_BY_THE_BAND',`${at}: ${id} ${p.expression}/${p.pattern} -> ${q.expression}/${q.pattern}`);
     else if(sizing||p.expression!==q.expression&&['EASY','LONG'].includes(p.family))note('SELECTION_BY_THE_SIZING_SOURCE',`${at}: ${id} ${shown(p)} -> ${shown(q)}`);
     else note('UNEXPECTED',`${at}: session ${id} selected differently with the same band and sizing`);}
   }
  }else note('AFTER_THE_DIVERGENCE',`${at}: differs`);
 }
 return {diverged,identical,rows};
}

// ---------- layer C: the table ----------
function table(found){
 const A='a',AT=h=>`2026-12-01T${String(h).padStart(2,'0')}:00:00.000Z`,note=(kind,what)=>found.push({kind,what});let cells=0,differ=0;
 const rec=(M,steps)=>steps.reduce((r,[hour,...os])=>M.RF.appendReportFacts(r,os.map(o=>M.RF.reportFactOf(o,V,{fromDevice:!!o.source})),{athleteId:A,recordedAt:AT(hour)},V).record,[]);
 const OWN=[{},{segments:[{distanceKm:4,measurement:'GPS'}]},{declared:{distanceKm:9,reason:'SIGNAL_LOSS'}},{declared:{distanceKm:9}},{manualDistanceKm:5,declared:{distanceKm:9}},{segments:[{distanceKm:4,measurement:'GPS'}],declared:{distanceKm:9,reason:'SIGNAL_LOSS'}}];
 const DISTANCE=[{},{distanceKm:9,measurement:'GPS'},{distanceKm:9,measurement:'GPS',gpsQuality:'POOR'},{distanceKm:9}],WORK=[{},{work:{paceSecondsPerKm:270},rpe:7}],MIN=[{minutes:45},{}];
 // Who else spoke: nobody; a device report on the row (merged); a device report in force and not on the row; a record that cannot be read whole.
 for(const own of OWN)for(const dist of DISTANCE)for(const work of WORK)for(const min of MIN)for(const other of ['none','merged','not carried','unreadable','not carried and unreadable']){
  cells++;
  const actual={completed:true,...min,...dist,...work,...own},a1={eventId:'a1',sessionId:'s',actual},d1={eventId:'d1',sessionId:'s',source:{provider:'HEALTHKIT',activityId:'hk-1',quality:'WEARABLE_FULL'},actual:{completed:true,minutes:45,distanceKm:9,measurement:'GPS',gpsQuality:'POOR'}};
  const row={eventId:'a1',athleteId:A,sessionId:'s',localDate:'2026-12-01',partial:false,actual,response:UNKNOWN,context:{sport:'RUN',family:'THRESHOLD',mode:'EASY',sessionId:'s'},provenance:{sourceQuality:'MANUAL',...(other==='merged'?{mergedSourceIds:['a1','d1']}:{})}};
  const steps=[[10,a1,...(other==='merged'||other.startsWith('not carried')?[d1]:[])]],bad=other.includes('unreadable')?[{fact:'RUN_REPORT_RECEIVED',eventId:'x',athleteId:A}]:[];
  const out=M=>{const facts=M.RF.readReportFacts([...rec(M,steps),...bad],A,V,[row]),reading=M.RF.reportsReading(row,facts,V),adm=M.H.F.admitted([row],{athleteId:A,facts},V);return {word:reading.withheld,paceWithheld:M.RH.distanceFacts(actual,V,{reports:reading}).paceWithheld,withheld:adm.withheld.map(w=>w.reason),handed:adm.ledger[0].actual};};
  const z=out(Z),p=out(P),has=num(actual.distanceKm,0.01,V.runFacts.runDistanceKmMax),notCarried=other.startsWith('not carried'),unreadable=other.includes('unreadable'),masked=!has&&DIST.includes(z.word)&&(notCarried||unreadable);
  if(z.word!==p.word)note('UNEXPECTED',`table: the word differs (${z.word} -> ${p.word}) for ${JSON.stringify({own,dist,work,min,other})}`);
  if(sha(z)===sha(p)){if(masked)note('UNEXPECTED',`table: a masked cell reads the same: ${JSON.stringify({own,dist,work,min,other})}`);continue;}
  differ++;
  const want=notCarried?'REPORT_NOT_CARRIED':'REPORTS_UNREADABLE';
  if(!masked||z.paceWithheld!==null||p.paceWithheld!==want||sha(p.withheld)!==sha([want])||p.handed.gpsQuality!=='POOR'||'distanceKm' in p.handed||sha(p.handed.work??null)!==sha(actual.work??null))note('UNEXPECTED',`table: a cell differs and is not the masked row withheld whole: ${JSON.stringify({own,dist,work,min,other,z,p})}`);
 }
 return {cells,differ};
}

const A=clients(Z.H),B=clients(P.H),report={},totals={clients:0,reviews:0,identicalAnswers:0,clientsIdentical:0,clientsDiverged:0,rowsRead:0,UNEXPECTED:0},kinds={};
for(const name of Object.keys(A)){
 let a,b;try{a=A[name]();b=B[name]();}catch(e){report[name]=[{kind:'UNEXPECTED',what:'threw: '+String(e?.stack??e).slice(0,400)}];totals.UNEXPECTED++;continue;}
 const found=[],r=answers(name,a,b,found);totals.clients++;totals.reviews+=a.results.length;totals.identicalAnswers+=r.identical;totals.rowsRead+=r.rows;if(r.diverged===null)totals.clientsIdentical++;else totals.clientsDiverged++;
 for(const f of found){kinds[f.kind]=(kinds[f.kind]??0)+1;if(f.kind==='UNEXPECTED')totals.UNEXPECTED++;}
 if(found.length)report[name]=found;
}
const tfound=[],t=table(tfound);for(const f of tfound){kinds[f.kind]=(kinds[f.kind]??0)+1;if(f.kind==='UNEXPECTED')totals.UNEXPECTED++;}if(tfound.length)report['(table)']=tfound;
const summary={totals,kinds,table:t};
if(process.argv.includes('--json'))console.log(JSON.stringify({...summary,report},null,1));
else{console.log(JSON.stringify(summary));for(const [name,found] of Object.entries(report)){console.log('## '+name);const by={};for(const f of found)(by[f.kind]??=[]).push(f.what);for(const [k,v] of Object.entries(by)){console.log('   '+k+' x'+v.length);for(const w of v.slice(0,k==='UNEXPECTED'?12:k.startsWith('SELECTION')?8:3))console.log('      '+w);}}}
process.exitCode=totals.UNEXPECTED?1:0;
