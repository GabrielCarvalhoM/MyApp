// V1 Run Workout Structure, phase A evidence lineage fix-forward (Founder mission of 2026-11-15; contract EVIDENCE_LINEAGE_CONTRACT.md and
// SSCTR_RWS_LINEAGE_ITEMS.md r2, items L1 to L5). The blocker the independent round on 5289667 named, QRE-RWS-D-01, reproduced as its judge
// found it and closed as a class:
// - A run report stays in force until an applied correction of its own speaker replaces it, and a row goes to a reader of pace, capacity or a
//   race result only when it carries every report in force for its session (L1, L2).
// - The history reference of a run only ever goes down by what the reports in force say (L3: recordings two sources both measured; L4: a
//   report in force the row does not carry, or a dispute inside the row).
// - SEC-RWS-D-01: a row of the record of reports that is no readable format and no readable report fact, whatever it is labelled, fails closed.
// The property asked for is not that the reading is the same in every order of arrival: it is that no order hands a pace reader a row that
// should be withheld. Where a row cannot carry every report, the conservative reading stands.
// Every scenario is a conforming client of the composed entry point unless it says it builds or alters a record. Synthetic athletes only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {F,DEV,FORMATS_OFF,VALUES as V,ELIG,hash,report,timeline,atSixteen,sixteen,nativeReport,weekWith,asPrescribed,live,raceTen} from './v1rws-helpers.mjs';
import {runCalibrationOf as frozenCalibration} from '../src/v1-run-calibration.mjs';
import {readReportFacts,reportsReading,reportsVerdict,reportFactOf,appendReportFacts,appendFormats,readFormatRecord,speakerOf,sourcesOf,executionOf,SPEAKER,RUN_REPORT_RECEIVED,RUN_FORMAT_EMITTED} from '../src/v1-run-format.mjs';
import {distanceFacts,historyReference,PACE_WITHHELD,WHOLE_ROW_WITHHELD} from '../src/v1-run-history.mjs';
import {utcTimestamp} from '../src/r6-provenance.mjs';

const UNKNOWN={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const NOT_CARRIED='REPORT_NOT_CARRIED';
const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o),list=v=>Array.isArray(v)?v:[];
const isReport=r=>r?.fact===RUN_REPORT_RECEIVED;
const plain=(t,s)=>{const o=s.sport==='RUN'?asPrescribed(t,s):{};return o?.eventId?o:report(t.p,s,o??{});};
const edges=cal=>Object.fromEntries(Object.entries(cal.paceBands).map(([k,b])=>[k,[b.status,b.fastSecondsPerKm??null,b.slowSecondsPerKm??null]]));
const withheldOf=(r,id)=>r.runFormat.paceEvidenceWithheld.filter(x=>x.sessionId===id).map(x=>x.reason);
const shuffled=a=>{const b=[...a];for(let i=b.length-1,seed=7;i>0;i--){seed=(seed*1103515245+12345)%2147483648;const j=seed%(i+1);[b[i],b[j]]=[b[j],b[i]];}return b;};

// ---------- the rule, written outside the runtime ----------
// The oracle of the diagnosis (audits/v1-run-extensions-2026-11-13/phase-a/evidence-lineage/probes/oracle.mjs), as the SSCTR decided it. It reads
// the engine's record, the kept distance facts, and `reports`: who sent each report and when, as the harness below saw it sent (never as the
// runtime recorded it). Nothing of the runtime's lineage reader is used here.
const sameSpeaker=(a,b)=>typeof a==='string'&&typeof b==='string'&&a===b&&(a==='ATHLETE'||/^DEVICE:.+/.test(a));
function oracleInForce({ledger,reports,sessionId,athleteId}){
 const rows=list(ledger).filter(o=>isObj(o)&&!o.fact&&o.athleteId===athleteId&&o.sessionId===sessionId);
 const known=new Map();for(const r of list(reports))if(!known.has(r.id)||r.at<known.get(r.id).at)known.set(r.id,r);
 const retiredBy=new Map();for(const o of rows)if(o.superseded===true&&typeof o.supersededBy==='string'){if(!retiredBy.has(o.supersededBy))retiredBy.set(o.supersededBy,[]);retiredBy.get(o.supersededBy).push(o);}
 const lineage=c=>{const seen=new Set(),out=new Set(),stack=[c];while(stack.length){const id=stack.pop();if(seen.has(id))continue;seen.add(id);for(const old of retiredBy.get(id)??[])for(const s of sourcesOf(old)){out.add(s);stack.push(s);}}out.delete(c);return out;};
 const replaced=new Map();
 for(const c of [...retiredBy.keys()].sort()){
  const mine=known.get(c);if(!mine||typeof mine.speaker!=='string')continue;
  const above=lineage(c);
  for(const r of known.values())if(r.id!==c&&sameSpeaker(mine.speaker,r.speaker)&&(above.has(r.id)||r.at<mine.at)&&!replaced.has(r.id))replaced.set(r.id,c);
 }
 return {reports:[...known.keys()].filter(id=>!replaced.has(id)).sort(),replaced:Object.fromEntries([...replaced].sort())};
}
/** The reading of the candidate before this fix-forward: the kept distance facts of the reports the row was made of, in the row's order of reasons. */
function ownFacts(formatRecord,ids,{sessionId,athleteId}){
 const of=new Set(ids);let several=false,corrected=false,untimed=false,shortest=Infinity,longest=-Infinity;
 for(const r of list(formatRecord)){if(!isObj(r)||r.fact!==RUN_REPORT_RECEIVED||r.athleteId!==athleteId||r.sessionId!==sessionId||!isObj(r.report)||!of.has(r.report.reportId))continue;const g=r.report;
  if(g.several)several=true;if(g.corrected)corrected=true;if(g.distanceKm!==null&&!g.timed)untimed=true;for(const k of [g.distanceKm,g.ownKm])if(k!==null){if(k<shortest)shortest=k;if(k>longest)longest=k;}}
 return several?'SEVERAL_RECORDINGS':corrected?'CORRECTED_MEASUREMENT':untimed?'DURATION_REQUIRED':shortest<V.tied.correctionFloorFraction*longest-1e-9?'DISTANCE_DISPUTED':null;
}
function oracle(row,x){
 const f=oracleInForce(x),carried=new Set(sourcesOf(row)),notCarried=f.reports.filter(id=>!carried.has(id)),before=ownFacts(x.formatRecord,[...carried],x);
 return {word:before??(notCarried.length?NOT_CARRIED:null),before,inForce:f.reports,notCarried,replaced:f.replaced};
}

// ---------- the athlete of the judge's probes ----------
const TIMES=['17:00','18:00','19:00','20:00','21:00','22:00','23:00'];
const STATE=['p','ledger','ref','ev','fmt','hist','runs','cal','state','n'];
/** The athlete after the weeks before the run of each family: an easy run of 11 km in week 3 (about 63 minutes), a long run of 16 km in week 1. */
const BASE={};
function baseOf(family){
 if(!BASE[family]){const t=atSixteen();if(family!=='LONG'){t.week(1,weekWith(t,1,null,null));t.week(2,weekWith(t,2,null,null));}BASE[family]=JSON.stringify(Object.fromEntries(STATE.map(k=>[k,t[k]])));}
 // A client that restores what it stored: the plan, the engine's record and the extension's records, through JSON.
 const t=timeline(sixteen());Object.assign(t,JSON.parse(BASE[family]));return t;
}
/**
 * One run, reported by `send(x)` in reviews on the Sunday of its week (the rest of the week goes with the first review). `x.app` is the
 * athlete's report in the app and `x.dev` a device import of one activity; `x.sent` is who sent each report of the run and in which review,
 * as the harness sent it. The week after is then reviewed as prescribed (`x.next`).
 */
function scene(family='EASY'){
 const t=baseOf(family),w=family==='LONG'?1:3,s=family==='LONG'?t.runsOf(1,q=>q.role==='LONG')[0]:t.runsOf(3,q=>q.role==='EASY').find(q=>t.runs[q.id]?.expression==='NATIVE');
 const run=t.runs[s.id],km=run.blocks.flatMap(b=>b.steps).find(q=>q.kind==='STEADY').target.metres/1000,min=Math.round(run.estimate.durationMinutes.low);
 const x={t,w,s,run,km,min,family,first:Math.round(km*0.6*100)/100,second:Math.round(km*0.4*100)/100,speaker:new Map(),sent:[],n:0,answers:[]};
 let rest=t.p.weeks[w].sessions.filter(live).filter(q=>q.id!==s.id).map(q=>plain(t,q));
 x.review=(observations,extra={})=>{for(const o of observations)if(o.sessionId===s.id&&!x.sent.some(q=>q.id===o.eventId))x.sent.push({id:o.eventId,speaker:x.speaker.get(o.eventId)??null,at:x.n});
  const r=t.step(w,6,'WEEKLY_REVIEW',{observations:[...rest,...observations],...extra},TIMES[x.n++]);rest=[];x.answers.push(r);return r;};
 /** An instant between the last review and the next one (half an hour before the next), or the instant of the next one itself. */
 x.at=(same=false)=>`${t.day(w,6)}T${same?TIMES[x.n]:String(Number(TIMES[x.n].slice(0,2))-1).padStart(2,'0')+':30'}:00-03:00`;
 x.app=(actual={},eventId='app-x',cite='TIME',o={})=>{const r={...nativeReport(t,s,{minutes:o.minutes??min,rpe:3,actual,...(o.completed===false?{completed:false}:{})}),eventId};if(cite==='TIME')r.actual.formatHash=run.timeFormatHash;x.speaker.set(eventId,'ATHLETE');return r;};
 x.dev=(actual={},eventId='dev-x',activity='hk-1')=>{x.speaker.set(eventId,activity?'DEVICE:'+activity:null);
  return {eventId,athleteId:t.p.athleteId,sessionId:s.id,occurrenceDate:s.date,...(activity?{canonicalActivityId:activity}:{}),source:{provider:'HEALTHKIT',...(activity?{activityId:activity}:{}),quality:'WEARABLE_FULL'},actual:{completed:true,minutes:min,distanceKm:x.first,measurement:'GPS',gpsQuality:'OK',rpe:3,...actual},response:UNKNOWN};};
 x.corr=(o,of,at=x.at())=>({...o,correctionOf:of,correctedAt:at});
 x.list=()=>[{distanceKm:x.second,measurement:'GPS'}];
 x.whole=()=>({distanceKm:km,measurement:'GPS',gpsQuality:'OK'});
 return x;
}
const frozenOver=(x,r,w,ledger)=>frozenCalibration({program:x.t.p,ledger,evidenceRecord:r.runEvidenceRecord,asOf:utcTimestamp(`${x.t.day(w,6)}T20:00:00-03:00`),weekIndex:w,hold:false,engineStatus:r.status,eligibility:ELIG(x.t.day(w,6))},DEV);
/** What the records hold and what the entry point answers, read after the reports of the run: by the runtime, and by the oracle. */
function read(x){
 const t=x.t,id=x.s.id,athleteId=t.p.athleteId,row=t.row(id),last=t.results.at(-1),exec=last.runSessions[id]?.execution??null;
 const facts=readReportFacts(t.fmt,athleteId,V,t.ledger),lin=facts.inForce(id),want=row?oracle(row,{ledger:t.ledger,formatRecord:t.fmt,reports:x.sent,sessionId:id,athleteId}):null;
 // The same records as a store holds them: through JSON, in another order.
 const stored=JSON.parse(JSON.stringify({l:t.ledger,f:t.fmt})),again=readReportFacts(shuffled(stored.f),athleteId,V,shuffled(stored.l)),twin=stored.l.find(o=>o.eventId===row?.eventId&&o.superseded!==true&&!o.fact);
 const before={ledger:t.ledger,fmt:t.fmt};
 x.next=t.week(x.w+1,weekWith(t,x.w+1,null,null));
 const longAhead=t.runsOf(x.w+2,q=>q.role==='LONG')[0],ahead=longAhead?x.next.runSessions[longAhead.id]:null;
 return {row,exec,rejected:(last.provenance?.excluded??[]).filter(e=>e.sessionId===id).map(e=>e.eventId+':'+e.reason),
  word:withheldOf(x.next,id)[0]??null,reading:row?reportsReading(row,facts,V):null,inForce:[...lin.ids].sort(),replaced:Object.fromEntries([...lin.replaced].sort()),want,
  stable:JSON.stringify([[...again.inForce(id).ids].sort(),row?reportsReading(twin,again,V):null])===JSON.stringify([[...lin.ids].sort(),row?reportsReading(row,facts,V):null]),
  easy:edges(x.next.runCalibration).EASY,bands:edges(x.next.runCalibration),calibration:x.next.runCalibration.hash,frozen:frozenOver(x,x.next,x.w+1,x.next.actualLedger),
  again:F.runCalibrationOf({program:t.p,ledger:JSON.parse(JSON.stringify(x.next.actualLedger)),evidenceRecord:x.next.runEvidenceRecord,asOf:utcTimestamp(`${t.day(x.w+1,6)}T20:00:00-03:00`),weekIndex:x.w+1,hold:false,engineStatus:x.next.status,eligibility:ELIG(t.day(x.w+1,6)),runFormatRecord:JSON.parse(JSON.stringify(x.next.runFormatRecord))},DEV).hash,
  screen:last.runFormat.warningSignScreen.status,before,
  longAhead:ahead?{minutes:longAhead.prescription.durationMinutes,expression:ahead.expression,km:ahead.expression==='NATIVE'?ahead.blocks.flatMap(b=>b.steps).find(q=>q.kind==='STEADY').target.metres/1000:null,why:ahead.unavailable?.native??null,comparable:ahead.dose?.sizing?.sources?.S2??null,ct3:ahead.dose?.checks?.['CT-3']?.max??null}:null};
}
const run=(family,send)=>{const x=scene(family);send(x);return {x,...read(x)};};
const three=(name,a,d,then=()=>{})=>({[name+' | one review']:x=>{x.review([a(x),d(x)]);then(x);},[name+' | the app, then the import']:x=>{x.review([a(x)]);x.review([d(x)]);then(x);},[name+' | the import, then the app']:x=>{x.review([d(x)]);x.review([a(x)]);then(x);}});
const lists=x=>x.app({segments:x.list()}),firstFile=x=>x.dev({segments:[]});

// ---------- the acceptance matrix (contract section 5) ----------
// [what is sent, the word that withholds the run from pace readers (null: admitted), the reports in force, the history reference: the whole
//  run ('whole'), the first file ('first') or none (null)]. An entry by family where the engine's own timing differs (contract section 9).
const FIRST=['first','first'],WHOLE=['whole','whole'];
const MATRIX={
 '01 one source, one whole measurement (control)':[x=>x.review([x.app(x.whole(),'app-x','NATIVE')]),null,['app-x'],'whole'],
 ...Object.fromEntries(Object.entries(three('02 two complementary files: the app lists the 2nd, the import brings the 1st',lists,firstFile)).map(([k,f])=>[k,[f,'SEVERAL_RECORDINGS',['app-x','dev-x'],'whole']])),
 ...Object.fromEntries(Object.entries(three('03 D-01: then the import re-syncs its part, naming its own report',lists,firstFile,x=>x.review([x.corr(x.dev({},'dev-x-v2'),'dev-x')]))).map(([k,f])=>[k,[f,NOT_CARRIED,['app-x','dev-x-v2'],'first']])),
 '04 D-01: the re-sync names the id of the row (the app\'s report)':[x=>{x.review([lists(x)]);x.review([firstFile(x)]);x.review([x.corr(x.dev({},'dev-x-v2'),'app-x')]);},NOT_CARRIED,['app-x','dev-x-v2'],'first'],
 '05 D-01: a correction of the correction':[x=>{x.review([lists(x)]);x.review([firstFile(x)]);x.review([x.corr(x.dev({},'dev-x-v2'),'dev-x')]);x.review([x.corr(x.dev({},'dev-x-v3'),'dev-x-v2')]);},NOT_CARRIED,['app-x','dev-x-v3'],'first'],
 '06 D-01: the two reports and the re-sync in one review':[x=>x.review([lists(x),firstFile(x),x.corr(x.dev({},'dev-x-v2'),'dev-x',x.at(true))]),NOT_CARRIED,['app-x','dev-x-v2'],'first'],
 '07 D-01, then every report sent again (replay)':[x=>{const a=lists(x),d=firstFile(x);x.review([a]);x.review([d]);const c=x.corr(x.dev({},'dev-x-v2'),'dev-x');x.review([c]);const n=x.t.fmt.filter(isReport).length;const r=x.review([a,d,c]);x.replay=[x.t.fmt.filter(isReport).length-n,r.provenance.duplicates.filter(q=>['app-x','dev-x','dev-x-v2'].includes(q.eventId)).map(q=>q.reason)];},NOT_CARRIED,['app-x','dev-x-v2'],'first'],
 '08 the app corrects itself to one whole measurement; the import of the 1st file stands':[x=>{x.review([lists(x)]);x.review([firstFile(x)]);x.review([x.corr(x.app(x.whole(),'app-x-v2','NATIVE'),'app-x')]);},NOT_CARRIED,['app-x-v2','dev-x'],'first'],
 '09 the same three reports, the import arriving last':[x=>{x.review([lists(x)]);x.review([x.corr(x.app(x.whole(),'app-x-v2','NATIVE'),'app-x')]);x.review([firstFile(x)]);},'DISTANCE_DISPUTED',['app-x-v2','dev-x'],'first'],
 '10 the same statements with no correction: the app says the whole, the import the 1st file':[x=>{x.review([x.app(x.whole(),'app-x','NATIVE')]);x.review([firstFile(x)]);},'DISTANCE_DISPUTED',['app-x','dev-x'],'first'],
 '11 the app corrects itself to the whole; the import measured the whole too':[x=>{x.review([x.app({distanceKm:x.first,measurement:'GPS',gpsQuality:'OK',segments:x.list()},'app-x','NATIVE')]);x.review([x.dev({distanceKm:x.km})]);x.review([x.corr(x.app(x.whole(),'app-x-v2','NATIVE'),'app-x')]);},NOT_CARRIED,['app-x-v2','dev-x'],'whole'],
 '12 both sources corrected to the whole (the app, then the re-sync)':[x=>{x.review([lists(x)]);x.review([firstFile(x)]);x.review([x.corr(x.app(x.whole(),'app-x-v2','NATIVE'),'app-x')]);x.review([x.corr(x.dev({distanceKm:x.km},'dev-x-v2'),'app-x-v2')]);},NOT_CARRIED,['app-x-v2','dev-x-v2'],'whole'],
 '13 one speaker: the app lists, then corrects itself to the whole':[x=>{x.review([x.app({distanceKm:x.first,measurement:'GPS',gpsQuality:'OK',segments:x.list()},'app-x','NATIVE')]);x.review([x.corr(x.app(x.whole(),'app-x-v2','NATIVE'),'app-x')]);},null,['app-x-v2'],'whole'],
 '14 one speaker: the import alone, then its re-sync':[x=>{x.review([x.dev({distanceKm:x.km})]);x.review([x.corr(x.dev({distanceKm:x.km},'dev-x-v2'),'dev-x')]);},null,['dev-x-v2'],'whole'],
 ...Object.fromEntries(Object.entries(three('15 two whole sources that agree',x=>x.app(x.whole(),'app-x','NATIVE'),x=>x.dev({distanceKm:x.km}))).map(([k,f])=>[k,[f,null,['app-x','dev-x'],'whole']])),
 '16 retraction by the import: its re-sync says the run was not done':[x=>{x.review([lists(x)]);x.review([firstFile(x)]);x.review([x.corr(x.dev({completed:false,minutes:0,distanceKm:undefined,rpe:undefined},'dev-x-v2'),'dev-x')]);},NOT_CARRIED,['app-x','dev-x-v2'],null],
 '17 retraction by the athlete: the app\'s correction says not done':[x=>{x.review([lists(x)]);x.review([firstFile(x)]);x.review([x.corr(x.app({},'app-x-v2','TIME',{completed:false,minutes:0}),'app-x')]);},NOT_CARRIED,['app-x-v2','dev-x'],null],
 '18 conflict: the import first, the app\'s report (other minutes, lists the 2nd file) refused, then the re-sync':[x=>{x.review([firstFile(x)]);x.review([x.app({segments:x.list()},'zz-app','TIME',{minutes:x.min+25})]);x.review([x.corr(x.dev({},'dev-x-v2'),'dev-x')]);},NOT_CARRIED,['dev-x-v2','zz-app'],'first'],
 '19 conflict: the app first (other minutes, lists), the import refused, then the app corrects itself to the whole':[x=>{x.review([x.app({segments:x.list()},'app-x','TIME',{minutes:x.min+25})]);x.review([firstFile(x)]);x.review([x.corr(x.app(x.whole(),'app-x-v2','NATIVE'),'app-x')]);},NOT_CARRIED,['app-x-v2','dev-x'],'first'],
 '20 a re-sync under another activity id':[x=>{x.review([lists(x)]);x.review([firstFile(x)]);x.review([x.corr(x.dev({},'dev-y','hk-2'),'dev-x')]);},NOT_CARRIED,['app-x','dev-x','dev-y'],'first'],
 '21 a symptom stop in the app\'s report, the import says done (conflict), then the import re-syncs':[x=>{x.review([x.dev({distanceKm:x.km})]);x.review([{...x.app({},'app-stop','TIME',{completed:false,minutes:30}),actual:{completed:false,minutes:30,stop:{reason:'SYMPTOM'}}}]);x.review([x.corr(x.dev({distanceKm:x.km},'dev-x-v2'),'dev-x')]);},NOT_CARRIED,{EASY:['app-stop','dev-x','dev-x-v2'],LONG:['app-stop','dev-x-v2']},{EASY:null,LONG:'whole'}],
 '22 a correction the engine refuses (dated before the report it corrects), one speaker':[x=>{x.review([x.app(x.whole(),'app-x','NATIVE')]);x.review([x.corr(x.app(x.whole(),'app-x-v2','NATIVE'),'app-x',`${x.s.date}T05:00:00-03:00`)]);},NOT_CARRIED,['app-x','app-x-v2'],'whole'],
 '23 the same, and then a correction the engine applies: one speaker has the way back':[x=>{x.review([x.app(x.whole(),'app-x','NATIVE')]);x.review([x.corr(x.app(x.whole(),'app-x-v2','NATIVE'),'app-x',`${x.s.date}T05:00:00-03:00`)]);x.review([x.corr(x.app(x.whole(),'app-x-v3','NATIVE'),'app-x')]);},null,['app-x-v3'],'whole'],
 '24 a device with no activity id re-syncs: it is the same speaker as nothing':[x=>{x.review([x.dev({distanceKm:x.km},'dev-x',null)]);x.review([x.corr(x.dev({distanceKm:x.km},'dev-x-v2',null),'dev-x')]);},NOT_CARRIED,['dev-x','dev-x-v2'],'whole'],
 '25 the athlete corrects a run only the import reported':[x=>{x.review([x.dev({distanceKm:x.km})]);x.review([x.corr(x.app(x.whole(),'app-x','NATIVE'),'dev-x')]);},NOT_CARRIED,['app-x','dev-x'],'whole'],
};
const pick=(v,family)=>isObj(v)?v[family]:v;

for(const family of ['EASY','LONG'])test(`lineage matrix, ${family}: the word that withholds each run, the reports in force and the history reference, by the runtime and by the oracle`,()=>{
 const control=run(family,MATRIX['01 one source, one whole measurement (control)'][0]);
 assert.deepEqual([control.x.km,control.x.first,control.x.second],family==='EASY'?[11,6.6,4.4]:[16,9.6,6.4]);
 for(const [name,[send,word,inForce,history]] of Object.entries(MATRIX)){
  const m=run(family,send),id=`${family}; ${name}`,x=m.x,km={whole:x.km,first:x.first}[pick(history,family)]??null;
  // 1. The entry point withholds the run for the reason the contract gives, and the oracle, written outside the runtime, agrees.
  assert.deepEqual([m.word,m.want.word],[word,word],id);
  // 2. The reports in force: as the runtime reads them from the two records, as the oracle reads them from who sent what, and as written here.
  assert.deepEqual([m.inForce,m.want.inForce],[pick(inForce,family),pick(inForce,family)],id+': in force');assert.deepEqual(m.replaced,m.want.replaced,id+': replaced');
  // 3. The lineage only withholds (L1-a): whatever the reading of the row's own reports withheld before, it still withholds, for the same reason.
  if(m.want.before)assert.equal(m.word,m.want.before,id+': what was withheld stays withheld');
  // 4. No reader of pace is handed the run: the easy band is the control's, and with nothing withheld the calibration is the frozen one, byte for byte.
  assert.deepEqual(m.easy,control.easy,id);assert.deepEqual(m.easy,['AVAILABLE',345,420],id);
  if(word===null)assert.equal(m.calibration,m.frozen.hash,id+': nothing withheld, the frozen calibration over the record');
  else{assert.deepEqual(m.bands,control.bands,id+': every band has the edges of the control');if(m.exec)assert.deepEqual([m.exec.paceEvidence===true,m.exec.paceWithheld],[false,word],id);}
  // 5. The history reference (the execution's own extent): the row's, lowered and never raised by the reports in force (L3, L4).
  if(m.exec)assert.equal(m.exec.extentKm,km,id+': history reference');
  // 6. The same reading from the records as a store holds them (through JSON, rows in another order), and by the exported calibration.
  assert.ok(m.stable,id+': the same reading after JSON and in another order');assert.equal(m.again,m.calibration,id+': the exported calibration over the stored records');
  // 7. Nothing of the engine's record is rewritten by the next review, and no report fact is lost or changed.
  const kept=new Map(m.before.ledger.map(o=>[(o.fact??'o')+':'+o.eventId,hash(o)]));for(const o of x.next.actualLedger){const k=(o.fact??'o')+':'+o.eventId;if(kept.has(k))assert.equal(hash(o),kept.get(k),id+': '+k);}
  assert.equal(hash(x.next.runFormatRecord.slice(0,m.before.fmt.length)),hash(m.before.fmt),id+': the record of formats and report facts is append-only');
  if(x.replay)assert.deepEqual(x.replay,[0,['EXACT_REPLAY','EXACT_REPLAY','EXACT_REPLAY']],id+': a replay adds no fact');
 }
});

test('QRE-RWS-D-01 reproduced and closed: the import\'s re-sync of its part of a merged row no longer hands the first file over the whole minutes to a pace reader',()=>{
 const control=run('EASY',MATRIX['01 one source, one whole measurement (control)'][0]);
 for(const [name,[send]] of Object.entries(MATRIX).filter(([k])=>/^0[3-7] /.test(k))){
  const m=run('EASY',send);
  // The record, as the judge found it: the frozen engine retired the merged row whole; the row in force is the re-sync alone, 6.6 km in 63 minutes.
  assert.deepEqual([m.row.actual.distanceKm,m.row.actual.minutes,m.row.actual.rpe,m.row.actual.segments??null,m.row.provenance.mergedSourceIds??null,m.row.partial],[6.6,63,3,null,null,false],name);
  assert.ok(m.x.t.ledger.some(o=>o.superseded===true&&o.supersededBy==='dev-x-v2'&&o.provenance.mergedSourceIds?.includes('app-x')&&o.provenance.mergedSourceIds.includes('dev-x')),name+': the merged row is on record, replaced by the re-sync');
  // The defect, still there for a reader of the bare record: 573 s/km widens the frozen easy band.
  assert.deepEqual(edges(m.frozen).EASY,['AVAILABLE',345,575],name+': the bare record moves the frozen calibration (the finding)');
  // Closed: the app's report still stands, the row does not carry it, and the calibration is the control's.
  assert.deepEqual([m.word,m.easy,m.bands],[NOT_CARRIED,['AVAILABLE',345,420],control.bands],name);assert.notEqual(m.calibration,m.frozen.hash,name);
  // The run is what the engine made of it: complete by the row in force, credited as before. Only its pace evidence is withheld.
  assert.deepEqual([m.exec.completed,m.exec.paceWithheld,m.exec.extentKm,m.row.partial],[true,NOT_CARRIED,6.6,false],name);
 }
 // The two other forms of the judge's probe: a distance the two sources dispute, and an import with no duration of its own.
 for(const [what,word,a,d] of [['disputed','DISTANCE_DISPUTED',x=>x.app({distanceKm:x.km,measurement:'GPS'}),x=>x.dev({})],['no duration','DURATION_REQUIRED',x=>x.app({}),x=>{const o=x.dev({});delete o.actual.minutes;return o;}]]){
  const merged=run('EASY',x=>x.review([a(x),d(x)])),after=run('EASY',x=>{x.review([a(x),d(x)]);x.review([x.corr(x.dev({},'dev-x-v2'),'dev-x')]);});
  assert.deepEqual([merged.word,merged.easy,after.word,after.easy,edges(after.frozen).EASY],[word,['AVAILABLE',345,420],NOT_CARRIED,['AVAILABLE',345,420],['AVAILABLE',345,575]],what);
 }
 // A later week reads the same: the run stays withheld, and its row never sizes a later run (S3) or raises the history.
 const late=run('EASY',MATRIX['04 D-01: the re-sync names the id of the row (the app\'s report)'][0]),five=late.x.t.week(5,weekWith(late.x.t,5,null,null)),control5=control.x.t.week(5,weekWith(control.x.t,5,null,null));
 assert.deepEqual([withheldOf(five,late.x.s.id),edges(five.runCalibration)],[[NOT_CARRIED],edges(control5.runCalibration)]);
});

test('a late re-sync, in the middle of the following week, withholds the run from that review on',()=>{
 const x=scene('EASY'),t=x.t;x.review([lists(x)]);x.review([x.dev({},'dev-x')]);
 const merged=t.results.at(-1);assert.deepEqual(withheldOf(merged,x.s.id),['SEVERAL_RECORDINGS']);
 const mid=t.step(4,2,'WEEKLY_REVIEW',{observations:[{...x.dev({},'dev-x-v2'),correctionOf:'dev-x',correctedAt:`${t.day(4,2)}T09:00:00-03:00`}]},'10:00'),row=t.row(x.s.id);
 assert.deepEqual([row.eventId,(mid.provenance.excluded??[]).length,withheldOf(mid,x.s.id),edges(mid.runCalibration).EASY],['dev-x-v2',0,[NOT_CARRIED],['AVAILABLE',345,420]]);
 assert.deepEqual(edges(frozenCalibration({program:t.p,ledger:mid.actualLedger,evidenceRecord:mid.runEvidenceRecord,asOf:utcTimestamp(`${t.day(4,2)}T10:00:00-03:00`),weekIndex:4,hold:false,engineStatus:mid.status,eligibility:ELIG(t.day(4,2))},DEV)).EASY,['AVAILABLE',345,575],'the bare record at that review (the finding)');
 const end=t.week(4,weekWith(t,4,null,null));assert.deepEqual([withheldOf(end,x.s.id),edges(end.runCalibration).EASY],[[NOT_CARRIED],['AVAILABLE',345,420]]);
});

test('what the athlete said that is no distance fact (heat, walk breaks) is not lost with the row: the three orders, and the cost on the athlete who said nothing',()=>{
 // The athlete reports the easy run as one whole measurement, 6.6 km in the whole minutes (a slow run), and says why it is not comparable.
 const slow=(x,said)=>x.app({distanceKm:x.first,measurement:'GPS',gpsQuality:'OK',...said}),same=x=>x.dev({});
 for(const [what,said,mergedEasy] of [['says nothing more (control)',{},['AVAILABLE',345,575]],['says HEAT',{conditions:['HEAT']},['AVAILABLE',345,420]],['says walk breaks',{walkBreaks:true},['AVAILABLE',345,420]]]){
  for(const [name,send] of Object.entries(three(what,x=>slow(x,said),same))){
   const merged=run('EASY',send),after=run('EASY',x=>{send(x);x.review([x.corr(x.dev({},'dev-x-v2'),'dev-x')]);});
   // Merged, the row holds what the athlete said and the frozen calibration reads it as it always did; nothing is withheld.
   assert.deepEqual([merged.word,merged.easy,merged.row.provenance.mergedSourceIds.length],[null,mergedEasy,2],name);
   // After the re-sync the row is the import alone: what the athlete said is on no row. The frozen calibration over the bare record now reads
   // the slow run as an easy observation, whatever the athlete said; the entry point withholds it, enumerating nothing.
   assert.deepEqual([after.row.eventId,after.row.actual.conditions??null,after.row.actual.walkBreaks??null,edges(after.frozen).EASY],['dev-x-v2',null,null,['AVAILABLE',345,575]],name);
   assert.deepEqual([after.word,after.want.word,after.easy,after.inForce],[NOT_CARRIED,NOT_CARRIED,['AVAILABLE',345,420],['app-x','dev-x-v2']],name);
  }
 }
});

test('a race is read only from a row that carries every report in force: through the engine to race week, in the three orders, and on the judge\'s rows',()=>{
 const results=cal=>cal.evidence.filter(e=>String(e.id).startsWith('plan-race:')).map(e=>[e.id,e.distanceKm,e.seconds]);
 const journey=send=>{
  const t=timeline(raceTen()),race=t.p.weeks.flatMap(w=>w.sessions).find(s=>s.prescription?.family==='RACE'),w=race.weekIndex;
  for(let k=0;k<w;k++)t.week(k,weekWith(t,k,null,null));
  const s=t.p.weeks[w].sessions.find(q=>q.prescription?.family==='RACE'),x={t,w,s,n:0};let rest=t.p.weeks[w].sessions.filter(live).filter(q=>q.id!==s.id).map(q=>plain(t,q));
  x.review=obs=>{const r=t.step(w,6,'WEEKLY_REVIEW',{observations:[...rest,...obs]},TIMES[x.n++]);rest=[];return r;};
  x.app=(actual,eventId='app-race')=>({...report(t.p,s,{}),eventId,actual:{completed:true,minutes:50,rpe:9,...actual}});
  x.dev=(actual,eventId='dev-race')=>({eventId,athleteId:t.p.athleteId,sessionId:s.id,occurrenceDate:s.date,canonicalActivityId:'hk-race',source:{provider:'HEALTHKIT',activityId:'hk-race',quality:'WEARABLE_FULL'},actual:{completed:true,minutes:50,distanceKm:6,measurement:'GPS',gpsQuality:'OK',...actual},response:UNKNOWN});
  x.corr=o=>({...o,correctionOf:'dev-race',correctedAt:`${t.day(w,6)}T${String(Number(TIMES[x.n].slice(0,2))-1).padStart(2,'0')}:30:00-03:00`});
  send(x);const r=t.results.at(-1),row=t.row(s.id);
  return {t,s,row,status:r.status,entry:results(r.runCalibration),bare:results(frozenCalibration({program:t.p,ledger:r.actualLedger,evidenceRecord:r.runEvidenceRecord,asOf:utcTimestamp(`${t.day(w,6)}T${TIMES[x.n-1]}:00-03:00`),weekIndex:w,hold:false,engineStatus:r.status,eligibility:ELIG(t.day(w,6))},DEV)),withheld:withheldOf(r,s.id)};
 };
 // Control: the race measured whole by one source is a race result, by the entry point as by the frozen calibration.
 const one=journey(x=>x.review([x.app({distanceKm:10,measurement:'GPS',gpsQuality:'OK'})]));
 assert.equal(one.s.prescription.family,'RACE');assert.deepEqual([one.entry,one.bare,one.withheld],[[['plan-race:app-race',10,3000]],[['plan-race:app-race',10,3000]],[]]);
 const lists=x=>x.app({segments:[{distanceKm:4,measurement:'GPS'}]}),first=x=>x.dev({segments:[]});
 for(const [name,send] of Object.entries(three('a race in two files',lists,first))){
  const merged=journey(send),after=journey(x=>{send(x);x.review([x.corr(x.dev({},'dev-race-v2'))]);});
  // Merged: the row holds the first file over the whole time and the app's list: no race result (closed in the earlier fix-forwards).
  assert.deepEqual([merged.row.actual.distanceKm,merged.row.provenance.mergedSourceIds.length,merged.entry,merged.withheld],[6,2,[],['SEVERAL_RECORDINGS']],name);
  // After the import re-syncs: the row is the re-sync alone. The bare record gives the frozen calibration a 6 km race in 3000 s (the finding,
  // by the engine's own rows of a whole journey); the entry point reads no race result.
  assert.deepEqual([after.row.eventId,after.row.actual.distanceKm,after.bare,after.entry,after.withheld],['dev-race-v2',6,[['plan-race:dev-race-v2',6,3000]],[],[NOT_CARRIED]],name);
 }
 // The judge's rows, as the engine keeps them, by the exported calibration: with no fact of the correction, and with one.
 const p=timeline(raceTen()).p,r=p.weeks.flatMap(w=>w.sessions).find(s=>s.prescription?.family==='RACE'),day=r.date,ctx={sessionId:r.id,sport:'RUN',role:'RACE',family:'RACE',mode:'EASY',weekIndex:r.weekIndex};
 const row=(id,actual,extra={})=>({eventId:id,athleteId:p.athleteId,sessionId:r.id,localDate:day,observedAt:`${day}T15:00:00.000Z`,partial:false,actual:{completed:true,minutes:50,measurement:'GPS',...actual},response:UNKNOWN,provenance:{sourceQuality:'WEARABLE_FULL'},context:ctx,...extra});
 const obs={app:{eventId:'app-race',sessionId:r.id,actual:{completed:true,minutes:50,segments:[{distanceKm:4,measurement:'GPS'}]}},dev:{eventId:'dev-race',sessionId:r.id,source:{activityId:'hk'},actual:{completed:true,minutes:50,distanceKm:6,measurement:'GPS',gpsQuality:'OK'}},v2:{eventId:'dev-race-v2',sessionId:r.id,source:{activityId:'hk'},actual:{completed:true,minutes:50,distanceKm:6,measurement:'GPS',gpsQuality:'OK'}}};
 const kept=appendReportFacts([],[reportFactOf(obs.app,V),reportFactOf(obs.dev,V,{fromDevice:true})],{athleteId:p.athleteId,recordedAt:`${day}T16:00:00.000Z`},V).record,withV2=appendReportFacts(kept,[reportFactOf(obs.v2,V,{fromDevice:true})],{athleteId:p.athleteId,recordedAt:`${day}T18:00:00.000Z`},V).record;
 const mergedRow=row('app-race',{distanceKm:6,gpsQuality:'OK',segments:[{distanceKm:4,measurement:'GPS'}]},{provenance:{sourceQuality:'WEARABLE_FULL',mergedSourceIds:['app-race','dev-race']}}),ledger=[{...mergedRow,superseded:true,supersededBy:'dev-race-v2'},row('dev-race-v2',{distanceKm:6,gpsQuality:'OK'},{correctionOf:'dev-race'})];
 const read=(l,fn,fmt)=>results(fn({program:p,ledger:l,evidenceRecord:[],asOf:`${day}T23:00:00.000Z`,weekIndex:r.weekIndex,engineStatus:'KEEP',eligibility:ELIG(day),...(fmt?{runFormatRecord:fmt}:{})},DEV));
 assert.deepEqual([read([mergedRow],frozenCalibration),read([mergedRow],F.runCalibrationOf,kept),read(ledger,frozenCalibration),read(ledger,F.runCalibrationOf,kept),read(ledger,F.runCalibrationOf,withV2)],[[['plan-race:app-race',6,3000]],[],[['plan-race:dev-race-v2',6,3000]],[],[]]);
 // The control on the same rows: the import alone and its own re-sync (one speaker) is a race result.
 const alone=[{...row('dev-race',{distanceKm:10,gpsQuality:'OK'}),superseded:true,supersededBy:'dev-race-v2'},row('dev-race-v2',{distanceKm:10,gpsQuality:'OK'},{correctionOf:'dev-race'})],ten={...obs.dev,actual:{...obs.dev.actual,distanceKm:10}};
 const aloneFacts=appendReportFacts(appendReportFacts([],[reportFactOf(ten,V,{fromDevice:true})],{athleteId:p.athleteId,recordedAt:`${day}T16:00:00.000Z`},V).record,[reportFactOf({...ten,eventId:'dev-race-v2'},V,{fromDevice:true})],{athleteId:p.athleteId,recordedAt:`${day}T18:00:00.000Z`},V).record;
 assert.deepEqual(read(alone,F.runCalibrationOf,aloneFacts),[['plan-race:dev-race-v2',10,3000]]);
});

// ---------- the rule on records built by hand ----------
const A='a',AT=h=>`2026-12-01T${String(h).padStart(2,'0')}:00:00.000Z`;
const said=(eventId,x={})=>({eventId,sessionId:x.sessionId??'s',...(x.source?{source:x.source}:x.device?{source:{provider:'HEALTHKIT',activityId:x.device,quality:'WEARABLE_FULL'}}:{}),actual:{completed:true,minutes:60,distanceKm:10,measurement:'GPS',...(x.actual??{})}});
/** The record of report facts after reports received at given hours: record([10,a1],[11,a2]). */
const record=(...steps)=>steps.reduce((rec,[hour,...os])=>appendReportFacts(rec,os.map(o=>reportFactOf(o,V,{fromDevice:!!o.source})),{athleteId:A,recordedAt:AT(hour)},V).record,[]);
const line=(eventId,x={})=>({eventId,athleteId:A,sessionId:x.sessionId??'s',localDate:'2026-12-01',partial:false,actual:{completed:true,minutes:60,distanceKm:10,measurement:'GPS',...(x.actual??{})},response:UNKNOWN,context:{sport:'RUN',family:'EASY',mode:'EASY',sessionId:x.sessionId??'s'},provenance:{sourceQuality:x.wearable?'WEARABLE_FULL':'MANUAL',...(x.merged?{mergedSourceIds:x.merged}:{})},...(x.by?{superseded:true,supersededBy:x.by}:{})});
const lineage=(rec,ledger)=>{const f=readReportFacts(rec,A,V,ledger).inForce('s');return [[...f.ids].sort(),Object.fromEntries([...f.replaced].sort())];};
const word=(rec,ledger,row=ledger.find(o=>!o.superseded))=>reportsVerdict(row,readReportFacts(rec,A,V,ledger),V);

test('the rule of the speaker: a report is replaced only by an applied correction of its own speaker, and what cannot be shown stays in force',()=>{
 const a1=said('a1'),a2=said('a2'),a3=said('a3'),d1=said('d1',{device:'hk-1'}),d2=said('d2',{device:'hk-1'}),d3=said('d3',{device:'hk-1'});
 // One speaker: the correction replaces what its speaker said before, to the end of the chain.
 assert.deepEqual(lineage(record([10,a1],[11,a2]),[line('a1',{by:'a2'}),line('a2')]),[['a2'],{a1:'a2'}]);
 assert.deepEqual(lineage(record([10,a1],[11,a2],[12,a3]),[line('a1',{by:'a2'}),line('a2',{by:'a3'}),line('a3')]),[['a3'],{a1:'a2',a2:'a3'}]);
 assert.equal(word(record([10,a1],[11,a2]),[line('a1',{by:'a2'}),line('a2')]),null);
 // Two speakers merged, one corrects: only its own reports leave. What the other said stays, on no row, and the row is withheld (V2, V3).
 const merged=line('a1',{merged:['a1','d1'],by:'d2',wearable:true}),facts=record([10,a1,d1],[11,d2]);
 assert.deepEqual(lineage(facts,[merged,line('d2',{wearable:true})]),[['a1','d2'],{d1:'d2'}]);assert.equal(word(facts,[merged,line('d2',{wearable:true})]),NOT_CARRIED);
 assert.deepEqual(lineage(record([10,a1,d1],[11,a2]),[{...merged,supersededBy:'a2'},line('a2')]),[['a2','d1'],{a1:'a2'}]);
 // Both corrected, in either order the engine applied them: each speaker's last word, and the row carries only one of them.
 const both=record([10,a1,d1],[11,a2],[12,d2]);
 assert.deepEqual(lineage(both,[{...merged,supersededBy:'a2'},line('a2',{by:'d2'}),line('d2',{wearable:true})]),[['a2','d2'],{a1:'a2',d1:'d2'}]);
 assert.deepEqual(lineage(record([10,a1,d1],[11,d2],[12,a2]),[merged,line('d2',{by:'a2',wearable:true}),line('a2')]),[['a2','d2'],{a1:'a2',d1:'d2'}]);
 // The reasons the row's own reports give come first: a row whose report lists a further recording says so, with or without a report it does not carry.
 const listing=said('a1',{actual:{distanceKm:undefined,segments:[{distanceKm:4,measurement:'GPS'}]}}),live=line('a1',{merged:['a1','d1'],wearable:true});
 assert.deepEqual([word(record([10,listing,d1]),[live]),word(record([10,listing,d1],[11,a2]),[live]),word(record([10,a1,d1],[11,a2]),[live])],['SEVERAL_RECORDINGS','SEVERAL_RECORDINGS',NOT_CARRIED]);
 // A correction the engine refused (no row names it as what replaced it) replaces nothing, and is itself a report in force.
 assert.deepEqual(lineage(record([10,a1],[11,a2]),[line('a1')]),[['a1','a2'],{}]);assert.equal(word(record([10,a1],[11,a2]),[line('a1')]),NOT_CARRIED);
 // A correction this record holds no fact of replaces nothing; it is named by the engine's record, so it is in force, of no shown speaker.
 assert.deepEqual(lineage(record([10,a1]),[line('a1',{by:'a2'}),line('a2')]),[['a1','a2'],{}]);assert.equal(word(record([10,a1]),[line('a1',{by:'a2'}),line('a2')]),NOT_CARRIED);
 // A report the engine's record names and this record holds no fact of (a record kept before the boundary was on, or one that lost a fact):
 // in force, of no shown speaker, never replaced. Losing lineage evidence only ever leaves more in force (V11).
 assert.deepEqual(lineage(record([11,d2]),[merged,line('d2',{wearable:true})]),[['a1','d1','d2'],{}]);assert.equal(word(record([11,d2]),[merged,line('d2',{wearable:true})]),NOT_CARRIED);
 assert.deepEqual(lineage([],[line('a1',{by:'a2'}),line('a2')]),[['a1','a2'],{}]);assert.equal(word([],[line('a1')]),null,'a row with no fact at all carries all there is');
 // Without the engine's record no correction is shown applied: nothing is replaced.
 assert.deepEqual([[...readReportFacts(facts,A,V).inForce('s').ids].sort(),[...readReportFacts(facts,A,V,null).inForce('s').ids].sort(),reportsVerdict(line('d2'),readReportFacts(facts,A,V),V)],[['a1','d1','d2'],['a1','d1','d2'],NOT_CARRIED]);
 // A row that names a correction and is not held as replaced (no row the engine writes) shows nothing applied.
 assert.deepEqual(lineage(record([10,a1],[11,a2]),[{...line('a1'),supersededBy:'a2'},line('a2')]),[['a1','a2'],{}]);
 // A row the engine's record lost (the replaced one is gone): the correction is not shown applied, and replaces nothing.
 assert.deepEqual(lineage(facts,[line('d2',{wearable:true})]),[['a1','d1','d2'],{}]);
 // Another activity is another speaker; a device that is not identified is the same speaker as nothing, itself included.
 const e2=said('e2',{device:'hk-2'}),u1=said('u1',{source:{provider:'HEALTHKIT',quality:'WEARABLE_FULL'}}),u2=said('u2',{source:{provider:'HEALTHKIT',quality:'WEARABLE_FULL'}});
 assert.deepEqual(lineage(record([10,d1],[11,e2]),[line('d1',{by:'e2',wearable:true}),line('e2',{wearable:true})]),[['d1','e2'],{}]);
 assert.deepEqual(lineage(record([10,u1],[11,u2]),[line('u1',{by:'u2',wearable:true}),line('u2',{wearable:true})]),[['u1','u2'],{}]);
 // The identity of a report is not the identity of its speaker: a correction that names the athlete's report, sent by the device, is the device's.
 assert.deepEqual(lineage(record([10,a1],[11,d2]),[line('a1',{by:'d2'}),line('d2',{wearable:true})]),[['a1','d2'],{}]);
 // One report id under two speakers is of no shown speaker: it replaces nothing and nothing replaces it.
 const twice=record([10,a1],[11,a2],[12,{...said('a2',{device:'hk-1',actual:{distanceKm:9}})}]);
 assert.deepEqual(lineage(twice,[line('a1',{by:'a2'}),line('a2')]),[['a1','a2'],{}]);
 // A report of the same speaker that sits in no row (the engine refused it) leaves with an applied correction recorded after it; one recorded
 // at the same instant as the correction, or later, stays.
 const a0=said('a0'),late=said('a9');
 assert.deepEqual(lineage(record([9,a0],[10,a1],[11,a2]),[line('a1',{by:'a2'}),line('a2')]),[['a2'],{a0:'a2',a1:'a2'}]);
 assert.deepEqual(lineage(record([10,a1],[11,a2,a0]),[line('a1',{by:'a2'}),line('a2')]),[['a0','a2'],{a1:'a2'}]);
 assert.deepEqual(lineage(record([10,a1],[11,a2],[12,late]),[line('a1',{by:'a2'}),line('a2')]),[['a2','a9'],{a1:'a2'}]);
 // A report of another session says nothing of this one, and another athlete's rows are not this athlete's.
 assert.deepEqual(lineage(record([10,a1,said('b1',{sessionId:'other'})]),[line('a1'),line('b1',{sessionId:'other'})]),[['a1'],{}]);
 assert.deepEqual(lineage(record([10,a1],[11,a2]),[{...line('a1',{by:'a2'}),athleteId:'someone-else'},line('a2')]),[['a1','a2'],{}]);
 // A hostile record: rows that replace each other in a circle are walked once; and past the bound on one session nothing is read as replaced.
 assert.deepEqual(lineage(record([10,a1],[11,a2]),[line('a1',{by:'a2'}),line('a2',{by:'a1'})]),[[],{a1:'a2',a2:'a1'}]);
 const many=Array.from({length:70},(_,i)=>said('m'+String(i).padStart(2,'0'))),chain=many.map((o,i)=>line(o.eventId,i<69?{by:many[i+1].eventId}:{})),over=readReportFacts(record(...many.map((o,i)=>[i<10?10:11,o])),A,V,chain).inForce('s');
 assert.deepEqual([over.bounded,over.ids.size,over.replaced.size,reportsVerdict(chain.at(-1),readReportFacts(record(...many.map((o,i)=>[10,o])),A,V,chain),V)],[false,70,0,NOT_CARRIED]);
 const few=many.slice(0,40),short=few.map((o,i)=>line(o.eventId,i<39?{by:few[i+1].eventId}:{})),within=readReportFacts(record(...few.map(o=>[10,o])),A,V,short).inForce('s');
 assert.deepEqual([within.bounded,[...within.ids],within.replaced.size],[true,['m39'],39]);
 const named=n=>readReportFacts(record([10,a1]),A,V,[{...line('a1'),provenance:{mergedSourceIds:['a1',...Array.from({length:n},(_,i)=>'x'+i)]}}]).inForce('s');
 assert.deepEqual([named(64).bounded,named(64).ids.size,named(65).bounded,named(65).ids.size],[true,65,false,66],'a row that names more reports this record does not hold than the bound');
});

test('who a report speaks for is a closed form, set from its own source fields when it is received',()=>{
 const hex=s=>/^DEVICE:[0-9a-f]{32}$/.test(s),of=o=>speakerOf({eventId:'e',sessionId:'s',actual:{completed:true},...o});
 assert.deepEqual([of({}),of({source:{}}),of({source:{provider:'MANUAL'}}),of({source:{quality:'SELF_REPORT'}}),of({provider:'manual'}),of({source:null}),speakerOf(null)],Array(7).fill(SPEAKER.ATHLETE));
 const dev=of({source:{provider:'HEALTHKIT',activityId:'hk-1',quality:'WEARABLE_FULL'}});
 assert.ok(hex(dev)&&!dev.includes('hk-1'),'a fixed derivative of the activity id, never the id');
 assert.deepEqual([of({canonicalActivityId:'hk-1'}),of({source:{activityId:'hk-1'},canonicalActivityId:'hk-1'}),of({source:{activityId:'hk-1',quality:'WEARABLE_PARTIAL'}})],[dev,dev,dev],'the same activity is the same speaker, however it is named');
 assert.ok(hex(of({canonicalActivityId:'hk-2'}))&&of({canonicalActivityId:'hk-2'})!==dev);
 // Not identified enough: a wearable source with no activity id, a named provider with none, two different ids, an id that is no text or is
 // empty, an id on a report that states a manual source, a source quality that cannot be read.
 assert.deepEqual([of({source:{quality:'WEARABLE_FULL'}}),of({source:{provider:'HEALTHKIT'}}),of({provider:'GARMIN'}),of({source:{activityId:'hk-1'},canonicalActivityId:'hk-2'}),of({canonicalActivityId:7}),of({canonicalActivityId:''}),of({source:{activityId:'hk-1',quality:'MANUAL'}}),of({source:{activityId:'hk-1',quality:7}}),of({source:{quality:7}})],Array(9).fill(SPEAKER.UNIDENTIFIED));
 // It is on the fact from the reception on, under its seal: the entry point records it for every report, the one that states nothing as well.
 const x=scene('EASY');x.review([x.app({},'app-x','TIME'),x.dev({distanceKm:x.km})]);
 const rows=x.t.fmt.filter(r=>isReport(r)&&r.sessionId===x.s.id).map(r=>[r.report.reportId,r.report.speaker,r.report.standing,r.report.distanceKm,r.report.wholeKm]);
 assert.deepEqual(rows,[['app-x','ATHLETE',true,null,null],['dev-x',speakerOf(x.dev({})),true,11,11]]);
 assert.equal(x.t.fmt.filter(isReport).length,x.t.ledger.filter(o=>!o.fact&&o.context?.sport==='RUN').reduce((n,o)=>n+sourcesOf(o).length,0),'one fact for each run report the record was made of');
 const fact=x.t.fmt.find(r=>isReport(r)&&r.report.reportId==='app-x'),swap=row=>x.t.fmt.map(r=>r===fact?row:r),unreadable=rec=>readReportFacts(rec,x.t.p.athleteId,V,x.t.ledger).unreadable.length;
 assert.deepEqual([unreadable(x.t.fmt),unreadable(swap({...fact,report:{...fact.report,speaker:speakerOf(x.dev({}))}})),unreadable(swap({...fact,report:{...fact.report,standing:false}}))],[0,1,1],'a speaker changed after the reception breaks the seal');
});

test('L3 and L4: the reports in force only ever lower a run\'s history reference, and never give one to a run that has none',()=>{
 const ref=(actual,reading,wearable=true)=>historyReference(distanceFacts({completed:true,minutes:100,measurement:'GPS',...actual},V,{wearable,reports:reading}));
 const lister=said('app',{actual:{minutes:100,distanceKm:10,segments:[{distanceKm:6,measurement:'GPS'}]}}),watch=said('dev',{device:'hk-1',actual:{minutes:100,distanceKm:16}});
 const merged=line('app',{merged:['app','dev'],wearable:true,actual:{minutes:100,distanceKm:16,segments:[{distanceKm:6,measurement:'GPS'}]}}),facts=record([10,lister,watch]),reading=reportsReading(merged,readReportFacts(facts,A,V,[merged]),V);
 // L3: two sources measured the whole run and one lists a further recording: the list is added to the smaller first distance, 10 + 6.
 assert.deepEqual([reading.withheld,reading.firstKm,ref(merged.actual,null),ref(merged.actual,reading)],['SEVERAL_RECORDINGS',10,22,16]);
 // L3 alone, where nothing disputes (15 km and 16 km agree within what a device reads, so L4 says nothing): 16 + 1 would count the listed
 // kilometre twice; the list is added to the lister's own 15.
 const near=line('app',{merged:['app','dev'],wearable:true,actual:{minutes:100,distanceKm:16,segments:[{distanceKm:1,measurement:'GPS'}]}}),nr=reportsReading(near,readReportFacts(record([10,said('app',{actual:{minutes:100,distanceKm:15,segments:[{distanceKm:1,measurement:'GPS'}]}}),watch]),A,V,[near]),V);
 assert.deepEqual([nr.withheld,nr.firstKm,nr.wholeKm,ref(near.actual,null),ref(near.actual,nr),ref({distanceKm:16,segments:[{distanceKm:6,measurement:'GPS'}]},{withheld:null,firstKm:10,wholeKm:null})],['SEVERAL_RECORDINGS',15,null,17,16,16]);
 // The measured distance a completion reads is the row's own, untouched (L3-a), and the word alone lowers nothing.
 assert.deepEqual([distanceFacts(merged.actual,V,{wearable:true,reports:reading}).measuredKm,distanceFacts(merged.actual,V,{wearable:true}).measuredKm,ref(merged.actual,'SEVERAL_RECORDINGS')],[22,22,22]);
 // Two complementary files (the lister states no distance of its own) stay the sum; a lister whose own first distance is the larger changes nothing.
 const r3a=record([10,said('app',{actual:{minutes:100,distanceKm:undefined,segments:[{distanceKm:6,measurement:'GPS'}]}}),said('dev',{device:'hk-1',actual:{minutes:100,distanceKm:10}})]),two=line('app',{merged:['app','dev'],wearable:true,actual:{minutes:100,distanceKm:10,segments:[{distanceKm:6,measurement:'GPS'}]}});
 assert.deepEqual([reportsReading(two,readReportFacts(r3a,A,V,[two]),V).firstKm,ref(two.actual,reportsReading(two,readReportFacts(r3a,A,V,[two]),V))],[null,16]);
 assert.equal(ref({distanceKm:10,segments:[{distanceKm:6,measurement:'GPS'}]},{withheld:null,firstKm:12,wholeKm:null}),16);
 // L3-b, L4-b: no reference is created. A measurement the device flagged, alone, gives none, whatever the reports say.
 assert.deepEqual([ref({distanceKm:10,gpsQuality:'POOR'},{withheld:null,firstKm:5,wholeKm:4}),ref({},{withheld:NOT_CARRIED,firstKm:5,wholeKm:4}),ref({distanceKm:10},{withheld:null,firstKm:5,wholeKm:null})],[null,null,10]);
 // L4: a report in force the row does not carry lowers the reference to what it states for the whole run; a larger figure is ignored.
 assert.deepEqual([ref({distanceKm:11},{withheld:NOT_CARRIED,firstKm:null,wholeKm:6.6}),ref({distanceKm:11},{withheld:NOT_CARRIED,firstKm:null,wholeKm:12}),ref({distanceKm:11,declared:{distanceKm:9}},{withheld:null,firstKm:null,wholeKm:9.5})],[6.6,11,9]);
 // What a report states for the whole run (L4-a, L4-c): its usable measurement with its own list, the athlete's figure, both the smaller;
 // never a listed recording alone, a measurement its device flagged, one no duration lets be checked, or a fault.
 const whole=(actual,o={})=>reportFactOf({eventId:'e',sessionId:'s',actual:{completed:true,minutes:60,...actual}},V,o).wholeKm;
 assert.deepEqual([whole({distanceKm:10,measurement:'GPS'}),whole({distanceKm:6,measurement:'GPS',segments:[{distanceKm:4,measurement:'GPS'}]}),whole({segments:[{distanceKm:4,measurement:'GPS'}]}),whole({declared:{distanceKm:11}}),whole({manualDistanceKm:9}),whole({distanceKm:10,measurement:'GPS',declared:{distanceKm:11,reason:'SIGNAL_LOSS'}}),whole({distanceKm:12,measurement:'GPS',declared:{distanceKm:11}}),
  whole({distanceKm:10,measurement:'GPS',gpsQuality:'POOR'}),whole({distanceKm:10,measurement:'GPS',gpsQuality:'POOR',declared:{distanceKm:11}}),whole({distanceKm:10,measurement:'GPS',minutes:undefined}),whole({distanceKm:40,measurement:'GPS'}),whole({})],
  [10,10,null,11,9,10,11,null,11,null,null,null]);
 // A dispute inside the row: the smaller of what its own reports state for the whole run, whichever figure the engine kept.
 const big=line('p',{merged:['p','w'],wearable:true,actual:{distanceKm:11}}),disputed=record([10,said('p',{actual:{distanceKm:6.6}}),said('w',{device:'hk-1',actual:{distanceKm:11}})]),dr=reportsReading(big,readReportFacts(disputed,A,V,[big]),V);
 assert.deepEqual([dr.withheld,dr.wholeKm,ref(big.actual,dr),ref(big.actual,null)],['DISTANCE_DISPUTED',6.6,6.6,11]);
 // Reports that agree lower nothing: the row reads as it did.
 const agree=record([10,said('p',{actual:{distanceKm:10.4}}),said('w',{device:'hk-1',actual:{distanceKm:11}})]),ar=reportsReading(big,readReportFacts(agree,A,V,[big]),V);
 assert.deepEqual([ar.withheld,ar.wholeKm,ref(big.actual,ar)],[null,null,11]);
});

test('L3-d: two sources that both measured a long run whole, one listing a further recording: the same dose and expression of the next long run, the ceiling at 18.084',()=>{
 const device=(t,s,actual)=>({eventId:'dev-hk-long-1',athleteId:t.p.athleteId,sessionId:s.id,occurrenceDate:s.date,canonicalActivityId:'hk-long-1',source:{provider:'HEALTHKIT',activityId:'hk-long-1',quality:'WEARABLE_FULL'},actual,response:UNKNOWN});
 const grid=(variant,order)=>{
  const t=baseOf('LONG'),s=t.runsOf(1,q=>q.role==='LONG')[0],fh={formatHash:t.runs[s.id].formatHash};let rest=t.p.weeks[1].sessions.filter(live).filter(q=>q.id!==s.id).map(q=>plain(t,q));
  const review=(obs,time)=>{const r=t.step(1,6,'WEEKLY_REVIEW',{observations:[...rest,...obs]},time);rest=[];return r;},app=a=>({...report(t.p,s,{}),eventId:'app-long',actual:{completed:true,minutes:100,rpe:4,...fh,...a}});
  const reps={r3aEmptyList:[app({segments:[{distanceKm:6,measurement:'GPS'}]}),device(t,s,{completed:true,minutes:100,distanceKm:10,measurement:'GPS',segments:[],...fh})],
   overlapEmptyList:[app({distanceKm:10,measurement:'GPS',segments:[{distanceKm:6,measurement:'GPS'}]}),device(t,s,{completed:true,minutes:100,distanceKm:16,measurement:'GPS',segments:[],...fh})],
   overlapNoKey:[app({distanceKm:10,measurement:'GPS',segments:[{distanceKm:6,measurement:'GPS'}]}),device(t,s,{completed:true,minutes:100,distanceKm:16,measurement:'GPS',...fh})],
   watchWholeAlone:[device(t,s,{completed:true,minutes:100,distanceKm:16,measurement:'GPS',segments:[],...fh})]}[variant];
  if(order==='oneReview'||reps.length<2)review(reps,'20:00');else{const [a,b]=order==='appFirst'?reps:[reps[1],reps[0]];review([a],'18:00');review([b],'21:00');}
  const x=t.results.at(-1).runSessions[s.id].execution,row=t.row(s.id),w2=t.week(2,weekWith(t,2,null,null)),next=t.runsOf(3,y=>y.role==='LONG')[0],nl=w2.runSessions[next.id];
  return [row.actual.distanceKm,x.status,x.basis,x.measuredKm,x.completed,x.extentKm,x.paceWithheld,next.prescription.durationMinutes,nl.expression,nl.blocks.flatMap(b=>b.steps).find(q=>q.kind==='STEADY').target.metres/1000,nl.dose.checks['CT-3'].max,edges(w2.runCalibration).EASY];
 };
 const next=[100,'NATIVE',16,18.084,['AVAILABLE',345,420]];
 assert.deepEqual(grid('watchWholeAlone','oneReview'),[16,'DISTANCE','MEASURED',16,true,16,null,...next]);
 for(const order of ['appFirst','devFirst','oneReview']){
  assert.deepEqual(grid('r3aEmptyList',order),[10,'DISTANCE','MEASURED',16,true,16,'SEVERAL_RECORDINGS',...next],'two complementary files stay the sum; '+order);
  // The overlap: the completion still reads the engine's row as it did (22 km measured, the target met, the credit unchanged: L3-a); the history
  // reference is 16, no more 22, so the ceiling of the next long run is the one of the watch alone (18.084, no more 24.2).
  for(const variant of ['overlapEmptyList','overlapNoKey'])assert.deepEqual(grid(variant,order),[16,'DISTANCE','MEASURED',22,true,16,'SEVERAL_RECORDINGS',...next],variant+'; '+order);
 }
});

test('L4-e: the history reference and the next long run after a correction or a conflict between two sources, on an easy run and on a long run',()=>{
 const names=Object.keys(MATRIX).filter(k=>/^(03 .*one review$|(08|09|10|18|19) )/.test(k));assert.equal(names.length,6);
 // The same statements in the three arrival orders (08, 09, 10) give the same reference: the smaller of the two figures in force.
 for(const family of ['EASY','LONG']){
  const control=run(family,MATRIX['01 one source, one whole measurement (control)'][0]),got=Object.fromEntries(names.map(k=>[k.slice(0,2),run(family,MATRIX[k][0])])),first=control.x.first;
  assert.deepEqual(names.map(k=>got[k.slice(0,2)].exec.extentKm),Array(6).fill(first),family);
  assert.deepEqual([got['08'].exec.extentKm,got['09'].exec.extentKm,got['10'].exec.extentKm,got['08'].longAhead,got['09'].longAhead],[first,first,first,got['10'].longAhead,got['10'].longAhead],family+': the three orders of the same statements');
  for(const k of names){
   const m=got[k.slice(0,2)],id=`${family}; ${k}`;
   // The dose of the next long run is the engine's, unchanged; only its expression can move, and only to a shorter distance or to time.
   assert.equal(m.longAhead.minutes,control.longAhead.minutes,id+': the same dose');
   assert.ok(m.longAhead.expression==='TIME'||m.longAhead.km<=control.longAhead.km,id+': never a longer distance');
   if(m.longAhead.expression==='NATIVE')assert.ok(m.longAhead.ct3<=control.longAhead.ct3,id+': never a higher ceiling');
  }
  // An easy run is not the long run the next one is sized from: the next long run is the control's. A long run is: its reference is the smaller
  // figure in force, so the next long run is sized from a slower run or goes by time, at the same dose.
  if(family==='EASY')for(const k of names)assert.deepEqual(got[k.slice(0,2)].longAhead,control.longAhead,k);
  else assert.deepEqual([control.longAhead.expression,control.longAhead.km,names.map(k=>[got[k.slice(0,2)].longAhead.expression,got[k.slice(0,2)].longAhead.km,got[k.slice(0,2)].longAhead.why])],['NATIVE',16,Array(6).fill(got['10'].longAhead.expression==='NATIVE'?['NATIVE',got['10'].longAhead.km,null]:['TIME',null,got['10'].longAhead.why])]);
 }
});

test('the whole row is withheld, not only its distance: a row with a work pace and no distance of its own is no comparable harder session either',()=>{
 // A quality session: the athlete reports its work pace; the watch import of the same session flags its GPS. Merged, the row is not comparable.
 // The athlete then corrects their own report: the row in force is the correction alone, with a work pace, no distance and no flag.
 const work={minutes:45,distanceKm:undefined,work:{paceSecondsPerKm:270},rpe:7},a1=said('a1',{actual:work}),d1=said('d1',{device:'hk-1',actual:{minutes:45,distanceKm:9,gpsQuality:'POOR'}}),a2=said('a2',{actual:work});
 const rowOf=(id,x)=>({...line(id,x),context:{sport:'RUN',family:'THRESHOLD',mode:'EASY',sessionId:'s'}});
 const ledger=[rowOf('a1',{merged:['a1','d1'],by:'a2',wearable:true,actual:{minutes:45,distanceKm:9,gpsQuality:'POOR',work:{paceSecondsPerKm:270},rpe:7}}),rowOf('a2',{actual:work})],facts=readReportFacts(record([10,a1,d1],[11,a2]),A,V,ledger);
 const live=ledger[1],adm=F.admitted(ledger,{athleteId:A,facts},V),handed=adm.ledger.find(o=>o.eventId==='a2');
 assert.deepEqual(['distanceKm' in live.actual&&live.actual.distanceKm!==undefined,reportsVerdict(live,facts,V),adm.withheld,handed.actual.gpsQuality,handed.actual.work],[false,NOT_CARRIED,[{sessionId:'s',eventId:'a2',reason:NOT_CARRIED}],'POOR',{paceSecondsPerKm:270}]);
 assert.deepEqual([distanceFacts(live.actual,V,{reports:reportsReading(live,facts,V)}).paceWithheld,distanceFacts(live.actual,V,{reports:'REPORTS_UNREADABLE'}).paceWithheld,distanceFacts(live.actual,V,{reports:'SEVERAL_RECORDINGS'}).paceWithheld,distanceFacts(live.actual,V,{}).paceWithheld],[NOT_CARRIED,'REPORTS_UNREADABLE',null,null]);
 // The record the caller keeps is not rewritten, and a row that carries every report is handed over as it is.
 assert.equal(hash(ledger[1]),hash(rowOf('a2',{actual:work})));
 const alone=[rowOf('a1',{by:'a2',actual:work}),rowOf('a2',{actual:work})],one=F.admitted(alone,{athleteId:A,facts:readReportFacts(record([10,a1],[11,a2]),A,V,alone)},V);
 assert.deepEqual([one.withheld,one.ledger===alone],[[],true]);
 // Laps of a native session read under it are no pace evidence: the execution says so, with the reason.
 const t=atSixteen();for(const w of [1,2,3])t.week(w,weekWith(t,w,null,null));
 const q=t.runsOf(4,s=>s.role==='QUALITY').find(s=>t.runs[s.id]?.expression==='NATIVE'),laps=nativeReport(t,q,{rpe:7}),qrow={eventId:'q',sessionId:q.id,partial:false,provenance:{sourceQuality:'MANUAL'},actual:laps.actual};
 const boutMinutes=q.prescription.work.workMinutes,exec=reports=>executionOf(qrow,t.runs[q.id],V,{boutMinutes,reports});
 assert.deepEqual([exec(null).basis,exec(null).paceEvidence,exec({withheld:NOT_CARRIED,firstKm:null,wholeKm:null}).paceEvidence,exec({withheld:NOT_CARRIED,firstKm:null,wholeKm:null}).paceWithheld,exec({withheld:NOT_CARRIED,firstKm:null,wholeKm:null}).status],['LAP',boutMinutes>=V.tied.calibrationBoutMinutesMin,false,NOT_CARRIED,'DISTANCE']);
 assert.deepEqual([[...WHOLE_ROW_WITHHELD],PACE_WITHHELD.indexOf(NOT_CARRIED)],[[NOT_CARRIED,'REPORTS_UNREADABLE'],4]);
});

test('a stop for a symptom is outside the lineage rule: no merge, conflict or correction removes it, and the screen is asked the same before and after',()=>{
 for(const family of ['EASY','LONG']){
  const stop=x=>({...x.app({},'app-stop','TIME',{completed:false,minutes:30}),actual:{completed:false,minutes:30,stop:{reason:'SYMPTOM'}}}),screens=x=>x.answers.map(r=>[r.runFormat.warningSignScreen.status,r.runFormat.warningSignScreen.sessionIds??null,r.runFormat.native]);
  const REQ=x=>['REQUIRED',[x.s.id],0];
  // The import says done, the app's report says stopped (the engine refuses one of them), then the import re-syncs.
  const conflict=run(family,MATRIX['21 a symptom stop in the app\'s report, the import says done (conflict), then the import re-syncs'][0]);
  assert.deepEqual(screens(conflict.x).slice(1),[REQ(conflict.x),REQ(conflict.x)],family);assert.equal(conflict.word,NOT_CARRIED,family);
  // The athlete reports the stop alone, then corrects their own report to a run done whole: the row in force says done, the earlier report is
  // replaced by its own speaker (nothing is withheld), and the stop still asks for the screen until it is answered after it.
  const own=run(family,x=>{x.review([stop(x)]);x.review([x.corr(x.app(x.whole(),'app-x-v2','NATIVE'),'app-stop')]);});
  assert.deepEqual([screens(own.x),own.inForce,own.word,own.row.actual.completed],[[REQ(own.x),REQ(own.x)],['app-x-v2'],null,true],family);
  // The import corrects a row made of the athlete's stop and its own report, as far as the engine merged them (a stop and a run done disagree:
  // the engine refuses the second). Whatever it did, the screen is asked in every answer from the stop on.
  const three=run(family,x=>{x.review([stop(x)]);x.review([x.dev({distanceKm:x.km})]);x.review([x.corr(x.dev({distanceKm:x.km},'dev-x-v2'),'app-stop')]);});
  assert.deepEqual(screens(three.x),[REQ(three.x),REQ(three.x),REQ(three.x)],family);assert.ok(three.inForce.includes('app-stop'),family+': the athlete\'s report still stands');
  // And it is answered as before: the screen dated after the stop, read by a later review, clears it; the lineage changes nothing of that.
  const t=conflict.x.t,cleared=t.step(conflict.x.w+2,0,'WEEKLY_REVIEW',{eligibility:ELIG(`${t.day(conflict.x.w+1,6)}T21:00:00-03:00`)});
  assert.equal(cleared.runFormat.warningSignScreen.status,'NOT_RAISED_BY_THIS_EXTENSION',family);assert.deepEqual(withheldOf(cleared,conflict.x.s.id),[NOT_CARRIED],family+': the run stays out of pace evidence');
 }
});

test('SEC-RWS-D-01 closed: a row of the record of reports that is no readable format and no readable fact fails closed, whatever it is labelled',()=>{
 // The conflict of the Security probe: the import first (done), then the app's report with a symptom stop, refused: the stop is only a fact.
 const make=()=>{const t=atSixteen(),s=t.long,device={eventId:'dev-1',athleteId:t.p.athleteId,sessionId:s.id,occurrenceDate:s.date,source:{provider:'HEALTHKIT',activityId:'hk-long-1',quality:'WEARABLE_FULL'},canonicalActivityId:'hk-long-1',actual:{completed:true,minutes:30,distanceKm:5,measurement:'GPS'}};
  t.step(1,6,'WEEKLY_REVIEW',{observations:[device]},'18:00');t.week(1,q=>q.id===s.id?{...report(t.p,s,{}),eventId:'app-stop',actual:{completed:false,minutes:30,stop:{reason:'SYMPTOM'}}}:asPrescribed(t,q));return {t,s};};
 const next=(t,fmt,eligibility)=>{t.fmt=fmt;return t.step(2,6,'WEEKLY_REVIEW',{observations:t.p.weeks[2].sessions.filter(live).map(s=>plain(t,s)),eligibility});};
 const answer=r=>[r.runFormat.warningSignScreen.status,r.runFormat.warningSignScreen.reason??null,r.runFormat.native,r.runFormat.unreadableReports.length>0,[...new Set(r.runFormat.paceEvidenceWithheld.map(x=>x.reason))].sort()];
 const control=make(),kept=next(control.t,control.t.fmt,ELIG(control.t.day(1,6)));
 assert.deepEqual(answer(kept),['REQUIRED','RUN_STOPPED_FOR_A_SYMPTOM',0,false,[NOT_CARRIED]],'the record as kept: the stop asks for the screen, and the import\'s row does not carry the app\'s report');
 // A record that cannot be read whole: the screen is asked, nothing native is delivered and every run row is withheld. Where the stop fact is
 // itself still readable the screen is named by it (the athlete's own word) and the conflict's row by the report it does not carry.
 const FAILS=['REQUIRED','RUN_REPORT_UNREADABLE',0,true,['REPORTS_UNREADABLE']],STOP_READ=['REQUIRED','RUN_STOPPED_FOR_A_SYMPTOM',0,true,['REPORTS_UNREADABLE',NOT_CARRIED]];
 const STOP_STILL_READ=['a format row altered (its blocks changed)','a format row of another athlete','a row of an unknown kind'];
 const VARIANTS={
  'every fact relabelled as a format row (the finding: before, the screen was not asked and 8 native sessions came back)':f=>f.map(r=>isReport(r)?{...r,fact:RUN_FORMAT_EMITTED}:r),
  'only the stop fact relabelled':f=>f.map(r=>isReport(r)&&r.report.stop?{...r,fact:RUN_FORMAT_EMITTED}:r),
  'the facts gone and a row labelled as a format in their place':f=>f.filter(r=>!isReport(r)).concat([{fact:RUN_FORMAT_EMITTED,eventId:'junk'}]),
  'a format row altered (its blocks changed)':f=>{const i=f.findIndex(r=>r.fact===RUN_FORMAT_EMITTED);return f.map((r,k)=>k===i?{...r,format:{...r.format,blocks:[]}}:r);},
  'a format row of another athlete':f=>{const i=f.findIndex(r=>r.fact===RUN_FORMAT_EMITTED);return f.map((r,k)=>k===i?{...r,athleteId:'someone-else'}:r);},
  'a row of an unknown kind':f=>f.concat([{fact:'SOMETHING_ELSE',eventId:'x'}]),
  'a fact of the form kept before this fix-forward (no speaker)':f=>f.map(r=>{if(!isReport(r)||!r.report.stop)return r;const {speaker,standing,wholeKm,...old}=r.report;return {...r,report:old,eventId:`report|${old.reportId}|${hash(old).slice(0,16)}`,inputHash:hash({athleteId:r.athleteId,recordedAt:r.recordedAt,report:old})};})};
 for(const [name,alter] of Object.entries(VARIANTS)){
  const {t,s}=make(),fmt=alter(t.fmt.map(r=>JSON.parse(JSON.stringify(r)))),r=next(t,fmt,ELIG(t.day(1,6)));
  assert.deepEqual(answer(r),STOP_STILL_READ.includes(name)?STOP_READ:FAILS,name);assert.ok(Object.values(r.runSessions).filter(x=>!x.past).every(x=>x.expression==='TIME'),name+': every run session by time');
  // Every run row is withheld from pace readers, the one with no distance as well; and a screen answered after it does not clear a row nobody can read.
  const runs=r.actualLedger.filter(o=>!o.fact&&!o.superseded&&o.context?.sport==='RUN');assert.equal(r.runFormat.paceEvidenceWithheld.length,runs.length,name);
  const {t:u}=make(),later=next(u,alter(u.fmt.map(x=>JSON.parse(JSON.stringify(x)))),{...ELIG(u.day(2,6)),assessedAt:`${u.day(2,6)}T19:00:00-03:00`});
  assert.deepEqual(answer(later),STOP_STILL_READ.includes(name)?['REQUIRED','RUN_REPORT_UNREADABLE',0,true,['REPORTS_UNREADABLE',NOT_CARRIED]]:FAILS,name+': the screen answered after the stop clears the stop, never a row nobody can read');
  // The row is carried forward as it was sent (append-only), and the next answer says the same.
  assert.equal(hash(r.runFormatRecord.slice(0,fmt.length)),hash(fmt),name);
 }
 // Told apart from data that is not there: a deleted fact is still what only the custody's keyed chain can tell (the declared limit).
 const gone=make(),deleted=next(gone.t,gone.t.fmt.filter(r=>!isReport(r)),ELIG(gone.t.day(1,6)));assert.deepEqual([deleted.runFormat.warningSignScreen.status,deleted.runFormat.unreadableReports],['NOT_RAISED_BY_THIS_EXTENSION',[]]);
});

test('an honest record never locks itself: no review writes a row its own reader refuses, on many journeys, and a format that cannot be read back is not kept',()=>{
 const whole=t=>{const fr=readFormatRecord(t.fmt,t.p.athleteId),facts=readReportFacts(t.fmt,t.p.athleteId,V,t.ledger),stored=JSON.parse(JSON.stringify(t.fmt));
  return [fr.unreadable.length,facts.unreadable.length,readReportFacts(stored,t.p.athleteId,V,t.ledger).unreadable.length,t.state?.unreadableReports?.length??0,t.state?.formatsNotKept?.length??0];};
 let reviews=0,formats=0,facts=0;const seen=t=>{assert.deepEqual(whole(t),[0,0,0,0,0],`review ${reviews}`);reviews++;};
 const JOURNEYS=[
  ['the experienced runner, as prescribed',sixteen,12,()=>null],
  ['the same, by time',sixteen,8,()=>null,{runExpression:'TIME'}],
  ['a 10 km race plan to race week',raceTen,12,()=>null],
  ['an experienced runner with a marathon ahead',x=>sixteen({goal:{kind:'RACE',event:{kind:'MARATHON',date:'2027-03-07'}},weeks:16,...x}),10,()=>null],
  ['reports that miss, stop and come short',sixteen,8,(t,w,s)=>s.role==='EASY'&&w%3===1?false:s.role==='LONG'&&w===2?{...report(t.p,s,{}),eventId:'short-'+s.id,actual:{completed:false,minutes:40,stop:{reason:'FATIGUE'}}}:null],
  ['every run in two sources, the import corrected each week',sixteen,6,()=>null,{},true]];
 for(const [name,intake,weeks,how,extra={},twoSources=false] of JOURNEYS){
  const t=timeline(intake());assert.ok(t.p,name);seen(t);
  for(let w=0;w<Math.min(weeks,t.p.weeks.length);w++){
   t.week(w,s=>{const o=how(t,w,s);return o===null?asPrescribed(t,s):o;},extra);seen(t);
   if(twoSources){
    const runs=t.runsOf(w).filter(s=>t.row(s.id)),imports=runs.map(s=>({eventId:'hk-'+s.id,athleteId:t.p.athleteId,sessionId:s.id,occurrenceDate:s.date,canonicalActivityId:'act-'+s.id,source:{provider:'HEALTHKIT',activityId:'act-'+s.id,quality:'WEARABLE_FULL'},actual:{completed:true,minutes:t.row(s.id).actual.minutes,...(t.row(s.id).actual.distanceKm?{distanceKm:t.row(s.id).actual.distanceKm,measurement:'GPS'}:{})},response:UNKNOWN}));
    t.step(w,6,'WEEKLY_REVIEW',{observations:imports},'21:00');seen(t);
    t.step(w,6,'WEEKLY_REVIEW',{observations:imports.map(o=>({...o,eventId:o.eventId+'-v2',correctionOf:o.eventId,correctedAt:`${t.day(w,6)}T21:30:00-03:00`}))},'22:00');seen(t);
   }
  }
  // A new plan from the stored records keeps them readable, and so does the first review of it.
  const i=intake({asOf:t.day(weeks,0),start:t.day(weeks,1)}),g=F.restartProgram({intake:{...i,athlete:{...i.athlete,pause:{nonclinical:true,reasonCategory:'SCHEDULE'}}},record:t.ledger,referenceState:t.ref,asOf:`${t.day(weeks,0)}T10:00:00-03:00`,athleteId:t.p.athleteId,runEvidenceRecord:t.ev,runFormatRecord:JSON.parse(JSON.stringify(t.fmt)),runHistoryRecord:t.hist},DEV);
  if(g.program){assert.deepEqual([readFormatRecord(g.runFormatRecord,g.program.athleteId).unreadable,readReportFacts(g.runFormatRecord,g.program.athleteId,V,g.restart?.carriedRecord??t.ledger).unreadable,g.runFormat.unreadableReports],[[],[],[]],name+': restart');reviews++;}
  formats+=t.fmt.filter(r=>r.fact===RUN_FORMAT_EMITTED).length;facts+=t.fmt.filter(isReport).length;
 }
 assert.ok(reviews>=70&&formats>=300&&facts>=150,`${reviews} reviews, ${formats} format rows, ${facts} report facts, none unreadable`);
 // A session whose format this module could not read back (here: a step of no duration) is not written and is named; the readable one is kept.
 const t=atSixteen(),good=Object.values(t.runs).find(s=>!s.past),bad={...good,sessionId:'w9-run-d9',blocks:[{repeat:1,steps:[{kind:'STEADY',target:{type:'TIME',seconds:0}}]}]},out=appendFormats([],[good,bad],{athleteId:'a',recordedAt:AT(10)});
 assert.deepEqual([out.added.length,out.notKept.length,out.record.length,readFormatRecord(out.record,'a').unreadable,readReportFacts(out.record,'a',V).unreadable],[1,1,1,[],[]]);
});

test('the reading is the same from stored records, on a rebuilt history, after a restart, and with the boundary off nothing is changed',()=>{
 const m=run('EASY',MATRIX['03 D-01: then the import re-syncs its part, naming its own report | the app, then the import'][0]),x=m.x,t=x.t,id=x.s.id;
 // The historical state of the record is the engine's own, read with the same completion reader: the lineage is no part of it.
 const state=(ledger,fmt)=>{const h=F.historicalStateOf(t.p,{asOf:x.next.runFormat.asOf,actualLedger:ledger,runFormatRecord:fmt},DEV);return hash({run:h.run,strength:h.strength,state:h.state,week:h.week});};
 assert.equal(state(t.ledger,t.fmt),state(JSON.parse(JSON.stringify(t.ledger)),JSON.parse(JSON.stringify(t.fmt))));assert.equal(state(t.ledger,t.fmt),state(t.ledger,t.fmt.filter(r=>!isReport(r))),'the report facts are no part of the engine\'s state');
 // The calibration of the week the run was reported in, made again from the record at that instant: withheld then as now.
 const earlier=F.runCalibrationOf({program:t.p,ledger:t.ledger,evidenceRecord:t.ev,asOf:x.answers.at(-1).runFormat.asOf,weekIndex:x.w,hold:false,engineStatus:'KEEP',eligibility:ELIG(t.day(x.w,6)),runFormatRecord:t.fmt},DEV);
 assert.deepEqual(edges(earlier).EASY,['AVAILABLE',345,420]);
 // A new plan from the stored records: the run is still withheld, and so it is at the first review of the new plan.
 const fresh={...sixteen({asOf:t.day(6,0),start:t.day(6,1)}),athlete:{...sixteen({asOf:t.day(6,0)}).athlete,pause:{nonclinical:true,reasonCategory:'SCHEDULE'}}};
 const again=u=>{const stored=JSON.parse(JSON.stringify({ledger:u.ledger,fmt:u.fmt,ev:u.ev,hist:u.hist,ref:u.ref}));return F.restartProgram({intake:fresh,record:stored.ledger,referenceState:stored.ref,asOf:`${t.day(6,0)}T10:00:00-03:00`,athleteId:u.p.athleteId,runEvidenceRecord:stored.ev,runFormatRecord:stored.fmt,runHistoryRecord:stored.hist},DEV);};
 const g=again(t),c=again(run('EASY',MATRIX['01 one source, one whole measurement (control)'][0]).x.t);
 assert.deepEqual([g.status,c.status,withheldOf(g,id),withheldOf(c,id),edges(g.runCalibration)],['PROPOSED','PROPOSED',[NOT_CARRIED],[],edges(c.runCalibration)],'every band of the new plan has the edges of the new plan of the control');
 // A record that lost lineage evidence withholds more, never less (V11): without the report facts of the correction, or without the replaced row.
 const facts=rec=>readReportFacts(rec,t.p.athleteId,V,t.ledger),row=t.row(id);
 assert.deepEqual([reportsVerdict(row,facts(t.fmt),V),reportsVerdict(row,facts(t.fmt.filter(r=>!(isReport(r)&&r.report.reportId==='dev-x-v2'))),V),reportsVerdict(row,readReportFacts(t.fmt,t.p.athleteId,V,t.ledger.filter(o=>!o.superseded)),V),reportsVerdict(row,facts(t.fmt.filter(r=>!(isReport(r)&&r.report.reportId==='dev-x'))),V)],[NOT_CARRIED,NOT_CARRIED,NOT_CARRIED,NOT_CARRIED]);
 // The declared limit: a record that lost the fact of the app's report and still shows the import as the only speaker of the merged row would
 // read as one speaker. Here the engine's record still names the app's report, so it stays in force; what a client that rewrites both records
 // can hide is the custody's to close.
 assert.equal(reportsVerdict(row,facts(t.fmt.filter(r=>!(isReport(r)&&r.report.reportId==='app-x'))),V),NOT_CARRIED,'the engine\'s record still names the report');
 // With the boundary off every added key is inert and nothing is recorded: the record of formats is returned as it was sent.
 const off=F.evaluateProgram(t.p,{...t.review(x.w+2,6,'WEEKLY_REVIEW',{observations:[]})},FORMATS_OFF);
 assert.deepEqual([off.runFormat.status,hash(off.runFormatRecord)],['DISABLED',hash(t.fmt)]);
});

test('cost: the lineage is read in one pass over the two records, and a hostile session is bounded',()=>{
 // Many sessions, each with a merged row, a re-sync and a correction of it: 4 000 sessions, 16 000 report facts, 12 000 rows.
 const n=4000,recs=[],ledger=[];
 for(let i=0;i<n;i++){const sessionId='s'+i,a=said('a'+i,{sessionId}),d=said('d'+i,{sessionId,device:'hk-'+i}),d2=said('e'+i,{sessionId,device:'hk-'+i}),d3=said('f'+i,{sessionId,device:'hk-'+i});
  recs.push([10,a,d],[11,d2],[12,d3]);ledger.push(line('a'+i,{sessionId,merged:['a'+i,'d'+i],by:'e'+i}),line('e'+i,{sessionId,by:'f'+i}),line('f'+i,{sessionId}));}
 const big=recs.reduce((rec,[hour,...os])=>{rec.push(...appendReportFacts([],os.map(o=>reportFactOf(o,V,{fromDevice:!!o.source})),{athleteId:A,recordedAt:AT(hour)},V).record);return rec;},[]);
 assert.equal(big.length,4*n);let started=Date.now();
 const facts=readReportFacts(big,A,V,ledger),adm=F.admitted(ledger,{athleteId:A,facts},V),ms=Date.now()-started;
 assert.deepEqual([adm.withheld.length,adm.withheld.every(x=>x.reason===NOT_CARRIED),[...facts.inForce('s7').ids].sort()],[n,true,['a7','f7']]);assert.ok(ms<6000,`read in ${ms} ms`);
 // One session with 3 000 reports that each correct the one before, and a row that names 3 000 reports: nothing is walked past the bound.
 const k=3000,chain=Array.from({length:k},(_,i)=>said('c'+String(i).padStart(4,'0'))),rows=chain.map((o,i)=>line(o.eventId,i<k-1?{by:chain[i+1].eventId}:{merged:chain.map(q=>q.eventId)})),flood=chain.reduce((rec,o,i)=>{rec.push(...appendReportFacts([],[reportFactOf(o,V)],{athleteId:A,recordedAt:AT(i%24)},V).record);return rec;},[]);
 started=Date.now();const hostile=readReportFacts(flood,A,V,rows),h=hostile.inForce('s'),all=F.admitted(rows,{athleteId:A,facts:hostile},V);const ms2=Date.now()-started;
 assert.deepEqual([h.bounded,h.replaced.size,h.ids.size,all.withheld.map(x=>x.reason)],[false,0,k,[NOT_CARRIED]]);assert.ok(ms2<6000,`read in ${ms2} ms`);
});

test('an answer that delivers no session reads the lineage as every other: a queued review, earlier than the record, that brings the import\'s re-sync',()=>{
 // Sunday of week 3. 17:00: the week, with the easy run in two reports (merged). 22:00: a report that cites a format nobody holds declares a
 // stop (an ASK; the stop is kept under 22:00). Then the review of 20:00, queued offline, arrives with the import's re-sync of its part.
 const x=scene('EASY'),t=x.t;x.review([lists(x),firstFile(x)]);const other=t.runsOf(4)[0];
 t.take(F.evaluateProgram(t.p,t.review(3,6,'WEEKLY_REVIEW',{observations:[{...report(t.p,other,{}),eventId:'unk',actual:{completed:false,minutes:20,formatHash:'f'.repeat(64),stop:{reason:'FATIGUE'}}}]},'22:00'),DEV));
 const before=t.fmt,review=t.review(3,6,'WEEKLY_REVIEW',{observations:[x.corr(x.dev({},'dev-x-v2'),'dev-x',`${t.day(3,6)}T19:30:00-03:00`)]},'20:00'),queued=t.take(F.evaluateProgram(t.p,review,DEV)),row=t.row(x.s.id);
 assert.deepEqual([['KEEP','MODIFY'].includes(queued.status),queued.runFormat.status,queued.runFormat.reason,queued.runSessions,row.eventId],[true,'NOT_APPLICABLE','REVIEW_BEFORE_THE_RECORD',{},'dev-x-v2'],'the engine accepted the review and applied the correction; the extension delivers nothing');
 // The answer itself withholds the run, and the calibration it carries is the one over the record as admitted (the frozen calibration, with the
 // arguments v1-run-index.mjs gives it for this answer, over the admitted record).
 const args=ledger=>({program:t.p,ledger,evidenceRecord:queued.runEvidenceRecord,asOf:utcTimestamp(review.asOf),weekIndex:3,hold:false,engineStatus:queued.status,eligibility:review.eligibility});
 const handed=F.admitted(queued.actualLedger,{athleteId:t.p.athleteId,facts:readReportFacts(queued.runFormatRecord,t.p.athleteId,V,queued.actualLedger)},V);
 assert.deepEqual([queued.runFormat.paceEvidenceWithheld.filter(w=>w.sessionId===x.s.id).map(w=>w.reason),handed.withheld.filter(w=>w.sessionId===x.s.id).map(w=>w.reason),queued.runCalibration.hash],[[NOT_CARRIED],[NOT_CARRIED],frozenCalibration(args(handed.ledger),DEV).hash]);
 assert.notEqual(queued.runCalibration.hash,frozenCalibration(args(queued.actualLedger),DEV).hash,'and not the one over the bare record');
 // What its report states is kept with the row the engine keeps of it (one fact, under the instant the engine accepted), and no format is added.
 assert.deepEqual(t.fmt.slice(before.length).map(r=>[r.fact,r.recordedAt,r.report.reportId,r.report.standing]),[[RUN_REPORT_RECEIVED,utcTimestamp(review.asOf),'dev-x-v2',true]]);
 // The week after: the bare record widens the frozen easy band (the finding); the entry point's is the control's.
 const end=t.week(4,weekWith(t,4,null,null));assert.deepEqual([withheldOf(end,x.s.id),edges(end.runCalibration).EASY,edges(frozenOver(x,end,4,end.actualLedger)).EASY],[[NOT_CARRIED],['AVAILABLE',345,420],['AVAILABLE',345,575]]);
});

// ---------- what this extension does not close (stated, and pinned so that nobody reads it as closed) ----------
test('HARD GATE OF A REAL INTEGRATION, NOT MET HERE (engine finding E-1, SSCTR item L5): a device re-sync still erases the athlete\'s answers from the frozen engine\'s row',()=>{
 // The athlete reports an easy run as done, harder than it should be, with an adverse recovery. The import of the same run merges. The import
 // then re-syncs as a correction: the frozen engine replaces the whole row, and the row in force holds the import's answers, which are none.
 const go=correct=>{
  const t=timeline(sixteen());t.week(0,()=>({pace:340,rpe:4}));
  const s=t.runsOf(1,q=>q.role==='EASY')[0],min=s.prescription.durationMinutes;let rest=t.p.weeks[1].sessions.filter(live).filter(q=>q.id!==s.id).map(q=>report(t.p,q,q.sport==='RUN'?{pace:340,rpe:4}:{}));
  const review=(obs,time)=>{const r=t.step(1,6,'WEEKLY_REVIEW',{observations:[...rest,...obs]},time);rest=[];return r;};
  const dev=id=>({eventId:id,athleteId:t.p.athleteId,sessionId:s.id,occurrenceDate:s.date,canonicalActivityId:'hk-1',source:{provider:'HEALTHKIT',activityId:'hk-1',quality:'WEARABLE_FULL'},actual:{completed:true,minutes:min},response:UNKNOWN});
  review([{...report(t.p,s,{rpe:6,response:{effort:'HARDER',recovery:'ADVERSE'}}),eventId:'app-x'},dev('dev-x')],'19:00');
  if(correct)review([{...dev('dev-x-v2'),correctionOf:'dev-x',correctedAt:`${t.day(1,6)}T20:30:00-03:00`}],'21:00');
  const r=t.results.at(-1),row=t.row(s.id);
  return {t,s,r,row,engine:[row.eventId,row.response.recovery,row.response.effort,r.weekEvidence.adverseSessions]};
 };
 const merged=go(false),after=go(true);
 assert.deepEqual(merged.engine,['app-x','ADVERSE','HARDER',1]);
 // The finding, unchanged by this fix-forward (the engine is frozen and is not edited here): the adverse session is no longer counted.
 assert.deepEqual(after.engine,['dev-x-v2','UNKNOWN','UNKNOWN',0],'E-1 stands: the engine\'s row lost the athlete\'s answers');
 // What this extension does about it, and all it does: the athlete's report is still in force, the row does not carry it, and the run is
 // withheld from pace readers. It gives the engine nothing back: an integration must show, by result, that this re-sync never erases the
 // athlete's answers in the engine's record, or ask the Founder for a controlled change of the engine.
 const facts=readReportFacts(after.t.fmt,after.t.p.athleteId,V,after.t.ledger);
 assert.deepEqual([[...facts.inForce(after.s.id).ids].sort(),reportsVerdict(after.row,facts,V),withheldOf(after.r,after.s.id),after.r.runFormat.status],[['app-x','dev-x-v2'],NOT_CARRIED,[NOT_CARRIED],'ACTIVE']);
});

test('the limit of the rule of the speaker, stated: one report that carries the athlete\'s statements under a device activity id is that activity speaking (integration: I-2, I-4)',()=>{
 // The data contract lets the app send one observation for a session done with a linked activity: the device's measurement and what the
 // athlete added (here: a second recording). That is one report, of one speaker, the activity. Its re-sync replaces it whole (the same
 // speaker): if the re-sync does not say again what the athlete added, nothing in the Core can tell it was said. Whoever sends a correction
 // must say again all its speaker says of the run (I-4), and an athlete's edit is never sent under a device activity id (I-2).
 const both=x=>x.dev({segments:x.list()},'one-x'),merged=run('EASY',x=>x.review([both(x)]));
 assert.deepEqual([merged.word,merged.easy,merged.inForce],['SEVERAL_RECORDINGS',['AVAILABLE',345,420],['one-x']]);
 const again=run('EASY',x=>{x.review([both(x)]);x.review([x.corr(x.dev({segments:x.list()},'one-x-v2'),'one-x')]);});
 assert.deepEqual([again.word,again.easy,again.inForce],['SEVERAL_RECORDINGS',['AVAILABLE',345,420],['one-x-v2']],'a re-sync that says it again keeps it');
 const dropped=run('EASY',x=>{x.review([both(x)]);x.review([x.corr(x.dev({},'one-x-v2'),'one-x')]);});
 assert.deepEqual([dropped.word,dropped.want.word,dropped.easy,dropped.inForce],[null,null,['AVAILABLE',345,575],['one-x-v2']],'the limit: a re-sync that drops it is one speaker replacing its own report, by the runtime and by the oracle alike');
});
