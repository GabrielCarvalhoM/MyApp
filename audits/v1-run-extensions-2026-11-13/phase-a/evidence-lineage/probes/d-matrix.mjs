// Diagnosis matrix (read-only): each scenario is a conforming client of the composed entry point. For each: what the candidate does today
// (the live row, its verdict, the easy band of the week after, the history reference) and what the lineage contract gives (oracle.mjs):
// the reports in force, the ones the live row does not carry, and why the row's distance is withheld from pace readers, or null.
// Usage: node d-matrix.mjs <CoachingCore dir> [EASY|LONG]
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {admission} from './oracle.mjs';
const root=process.argv[2],FAMILY=process.argv[3]??'EASY',imp=f=>import(pathToFileURL(path.join(root,f)).href);
const H=await imp('test/v1rws-helpers.mjs'),RF=await imp('src/v1-run-format.mjs'),RH=await imp('src/v1-run-history.mjs');
const {atSixteen,nativeReport,weekWith,asPrescribed,report,live,VALUES:V,ELIG}=H;
const UNKNOWN={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const plain=(t,s)=>{const o=s.sport==='RUN'?asPrescribed(t,s):{};return o?.eventId?o:report(t.p,s,o??{});};
const band=r=>{const b=r?.runCalibration?.paceBands?.EASY;return b?(b.status==='AVAILABLE'?[b.fastSecondsPerKm,b.slowSecondsPerKm]:b.status):null;};
const TIMES=['17:00','18:00','19:00','20:00','21:00','22:00','23:00'];
function scene(){
 const t=atSixteen();let w,s;
 if(FAMILY==='LONG'){w=1;s=t.long;}else{t.week(1,weekWith(t,1,null,null));t.week(2,weekWith(t,2,null,null));w=3;s=t.runsOf(3,q=>q.role==='EASY').find(q=>t.runs[q.id]?.expression==='NATIVE');}
 const run=t.runs[s.id],km=run.blocks.flatMap(b=>b.steps).find(q=>q.kind==='STEADY').target.metres/1000,min=Math.round(run.estimate.durationMinutes.low);
 const x={t,w,s,run,km,min,first:Math.round(km*0.6*100)/100,second:Math.round(km*0.4*100)/100,speaker:new Map(),sent:[],n:0};
 let rest=t.p.weeks[w].sessions.filter(live).filter(q=>q.id!==s.id).map(q=>plain(t,q));
 x.review=(observations,extra={})=>{for(const o of observations)if(o.sessionId===s.id&&!x.sent.some(q=>q.id===o.eventId))x.sent.push({id:o.eventId,speaker:x.speaker.get(o.eventId)??null,at:x.n});const r=t.step(w,6,'WEEKLY_REVIEW',{observations:[...rest,...observations],...extra},TIMES[x.n++]);rest=[];return r;};
 x.at=()=>`${t.day(w,6)}T${TIMES[x.n].slice(0,2)}:00:00-03:00`.replace(/T(\d\d):00:00/,(m,h)=>`T${String(Number(h)-1).padStart(2,'0')}:30:00`);
 x.app=(actual={},eventId='app-x',cite='TIME',o={})=>{const r={...nativeReport(t,s,{minutes:o.minutes??min,rpe:3,actual,...(o.completed===false?{completed:false}:{})}),eventId};if(cite==='TIME')r.actual.formatHash=run.timeFormatHash;x.speaker.set(eventId,'ATHLETE');return r;};
 x.dev=(actual={},eventId='dev-x',activity='hk-1')=>{x.speaker.set(eventId,'DEVICE:'+activity);return {eventId,athleteId:t.p.athleteId,sessionId:s.id,occurrenceDate:s.date,canonicalActivityId:activity,source:{provider:'HEALTHKIT',activityId:activity,quality:'WEARABLE_FULL'},actual:{completed:true,minutes:min,distanceKm:x.first,measurement:'GPS',gpsQuality:'OK',rpe:3,...actual},response:UNKNOWN};};
 x.corr=(o,of)=>({...o,correctionOf:of,correctedAt:x.at()});
 x.list=()=>[{distanceKm:x.second,measurement:'GPS'}];
 x.whole=()=>({distanceKm:km,measurement:'GPS',gpsQuality:'OK'});
 return x;
}
const shuffled=a=>{const b=[...a];for(let i=b.length-1,seed=7;i>0;i--){seed=(seed*1103515245+12345)%2147483648;const j=seed%(i+1);[b[i],b[j]]=[b[j],b[i]];}return b;};
function read(x){
 const t=x.t,row=t.row(x.s.id),facts=RF.readReportFacts(t.fmt,t.p.athleteId,V),arg={ledger:t.ledger,formatRecord:t.fmt,reports:x.sent,sessionId:x.s.id,athleteId:t.p.athleteId};
 const oracle=row?admission(row,arg,V):null,stored=JSON.parse(JSON.stringify({l:t.ledger,f:t.fmt,r:x.sent})),again=row?admission(stored.l.find(o=>o.eventId===row.eventId&&o.superseded!==true&&!o.fact),{...arg,ledger:shuffled(stored.l),formatRecord:shuffled(stored.f),reports:shuffled(stored.r)},V):null;
 const hist=RH.runHistory({ledger:t.ledger,record:t.hist,athleteId:t.p.athleteId,tz:-180,reportsOf:o=>RF.reportsVerdict(o,facts,V)},V).runs.find(r=>r.sessionId===x.s.id);
 const last=t.results.at(-1),next=t.week(x.w+1,weekWith(t,x.w+1,null,null));
 return {live:row?{id:row.eventId,done:row.actual.completed,km:row.actual.distanceKm??null,min:row.actual.minutes,list:(row.actual.segments??[]).length,merged:row.provenance?.mergedSourceIds??null,conflicted:row.conflicted===true}:null,
  rejected:(last.provenance?.excluded??[]).filter(e=>e.sessionId===x.s.id).map(e=>e.eventId+':'+e.reason),
  today:{verdict:RF.reportsVerdict(row,facts,V),easy:band(next),withheld:(next.runFormat?.paceEvidenceWithheld??[]).filter(q=>q.sessionId===x.s.id).map(q=>q.reason),historyKm:hist?.referenceKm??null,screen:last.runFormat?.warningSignScreen?.status??null},
  contract:{verdict:oracle.verdict,inForce:oracle.inForce,notCarried:oracle.notCarried,replaced:oracle.replaced,weakerReading:oracle.factsOnEveryReportInForce,sameAfterJsonAndShuffle:JSON.stringify(again)===JSON.stringify(oracle)}};
}
const three=(name,a,d,then=()=>{})=>({[name+' | one review']:x=>{x.review([a(x),d(x)]);then(x);},[name+' | app, then import']:x=>{x.review([a(x)]);x.review([d(x)]);then(x);},[name+' | import, then app']:x=>{x.review([d(x)]);x.review([a(x)]);then(x);}});
const lists=x=>x.app({segments:x.list()}),firstFile=x=>x.dev({segments:[]});
const S={
 '01 one source, one whole measurement (control)':x=>x.review([x.app(x.whole(),'app-x','NATIVE')]),
 ...three('02 two complementary files: the app lists the 2nd, the import brings the 1st',lists,firstFile),
 ...three('03 D-01: then the import re-syncs its part (names its own report)',lists,firstFile,x=>x.review([x.corr(x.dev({},'dev-x-v2'),'dev-x')])),
 '04 D-01: the re-sync names the row id (the app\'s report)':x=>{x.review([lists(x)]);x.review([firstFile(x)]);x.review([x.corr(x.dev({},'dev-x-v2'),'app-x')]);},
 '05 D-01: correction of the correction':x=>{x.review([lists(x)]);x.review([firstFile(x)]);x.review([x.corr(x.dev({},'dev-x-v2'),'dev-x')]);x.review([x.corr(x.dev({},'dev-x-v3'),'dev-x-v2')]);},
 '06 D-01: the reports and the re-sync all in one review':x=>x.review([lists(x),firstFile(x),{...x.dev({},'dev-x-v2'),correctionOf:'dev-x',correctedAt:`${x.t.day(x.w,6)}T16:30:00-03:00`}]),
 '07 D-01, then every report sent again (replay)':x=>{const a=lists(x),d=firstFile(x);x.review([a]);x.review([d]);const c=x.corr(x.dev({},'dev-x-v2'),'dev-x');x.review([c]);x.review([a,d,c]);},
 '08 the app corrects itself to one whole measurement; the import of the 1st file stands':x=>{x.review([lists(x)]);x.review([firstFile(x)]);x.review([x.corr(x.app(x.whole(),'app-x-v2','NATIVE'),'app-x')]);},
 '09 the same three reports, the import arriving last':x=>{x.review([lists(x)]);x.review([x.corr(x.app(x.whole(),'app-x-v2','NATIVE'),'app-x')]);x.review([firstFile(x)]);},
 '10 the same facts with no correction: the app says the whole, the import the 1st file':x=>{x.review([x.app(x.whole(),'app-x','NATIVE')]);x.review([firstFile(x)]);},
 '11 the app corrects itself to the whole; the import measured the whole too':x=>{x.review([x.app({distanceKm:x.first,measurement:'GPS',gpsQuality:'OK',segments:x.list()},'app-x','NATIVE')]);x.review([x.dev({distanceKm:x.km})]);x.review([x.corr(x.app(x.whole(),'app-x-v2','NATIVE'),'app-x')]);},
 '12 both sources corrected to the whole (the app, then the re-sync)':x=>{x.review([lists(x)]);x.review([firstFile(x)]);x.review([x.corr(x.app(x.whole(),'app-x-v2','NATIVE'),'app-x')]);x.review([x.corr(x.dev({distanceKm:x.km},'dev-x-v2'),'app-x-v2')]);},
 '13 one speaker: the app lists, then corrects itself to the whole':x=>{x.review([x.app({distanceKm:x.first,measurement:'GPS',gpsQuality:'OK',segments:x.list()},'app-x','NATIVE')]);x.review([x.corr(x.app(x.whole(),'app-x-v2','NATIVE'),'app-x')]);},
 '14 one speaker: the import alone, then its re-sync':x=>{x.review([x.dev({distanceKm:x.km})]);x.review([x.corr(x.dev({distanceKm:x.km},'dev-x-v2'),'dev-x')]);},
 ...three('15 two whole sources that agree',x=>x.app(x.whole(),'app-x','NATIVE'),x=>x.dev({distanceKm:x.km})),
 '16 retraction by the import: its re-sync says the run was not done':x=>{x.review([lists(x)]);x.review([firstFile(x)]);x.review([x.corr(x.dev({completed:false,minutes:0,distanceKm:undefined,rpe:undefined},'dev-x-v2'),'dev-x')]);},
 '17 retraction by the athlete: the app\'s correction says not done':x=>{x.review([lists(x)]);x.review([firstFile(x)]);x.review([x.corr(x.app({},'app-x-v2','TIME',{completed:false,minutes:0}),'app-x')]);},
 '18 conflict: the import first, the app\'s report (other minutes, lists the 2nd file) refused, then the re-sync':x=>{x.review([firstFile(x)]);x.review([x.app({segments:x.list()},'zz-app','TIME',{minutes:x.min+25})]);x.review([x.corr(x.dev({},'dev-x-v2'),'dev-x')]);},
 '19 conflict: the app first (other minutes, lists), the import refused, then the app corrects itself to the whole':x=>{x.review([x.app({segments:x.list()},'app-x','TIME',{minutes:x.min+25})]);x.review([firstFile(x)]);x.review([x.corr(x.app(x.whole(),'app-x-v2','NATIVE'),'app-x')]);},
 '20 a re-sync under another activity id (identity not shown)':x=>{x.review([lists(x)]);x.review([firstFile(x)]);x.review([x.corr(x.dev({},'dev-y','hk-2'),'dev-x')]);},
 '21 symptom stop in the app\'s report, the import says done (conflict), then the import re-syncs':x=>{x.review([x.dev({distanceKm:x.km})]);x.review([{...x.app({},'app-stop','TIME',{completed:false,minutes:30}),actual:{completed:false,minutes:30,stop:{reason:'SYMPTOM'}}}]);x.review([x.corr(x.dev({distanceKm:x.km},'dev-x-v2'),'dev-x')]);},
};
const out={};
for(const [name,send] of Object.entries(S)){try{const x=scene();send(x);out[name]=read(x);}catch(e){out[name]={THREW:String(e?.stack??e).slice(0,500)};}}
console.log(JSON.stringify(out,null,1));
