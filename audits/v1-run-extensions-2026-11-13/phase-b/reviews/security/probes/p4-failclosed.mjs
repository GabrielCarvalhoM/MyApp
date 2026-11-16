// P4: fail closed (no number from an answer below that is not ACTIVE; withdrawals), key isolation, echo of input, raw row fields.
import {H,P,F,VAL,thresholds,rev,out,formatBandOf,qualityOf,QUALITY} from './base.mjs';
const T0=Date.now();
const NUMERIC=o=>{const found=[];const walk=(v,p)=>{if(typeof v==='number'&&/Seconds$/.test(p.split('.').at(-1)))found.push(p);else if(v&&typeof v==='object')for(const [k,x] of Object.entries(v))walk(x,p+'.'+k);};walk(o,'');return found;};
// A race plan whose forecast is shown (the author's shape: a tune-up 10K in week 7).
const z=H.timeline(H.racePlan({goalMinutes:48}));for(let w=0;w<12;w++)z.week(w,s=>H.asPrescribed(z,s),w===7?{runEvidence:[H.result('10K',2940,'2027-02-28',{id:'tuneup'})]}:{});
const shown=z.look(12);
out('P4.control',{rf:shown.runForecast.status,reason:shown.runForecast.reason,numbers:NUMERIC(shown.runForecast).length,layer:shown.runFormat.status});
// (a) an answer below that is not ACTIVE: a review earlier than the record.
const early=P.evaluateProgram(z.p,z.review(11,0,'WEEKLY_REVIEW',{},'08:00'),z.opts);
out('P4a.early',{layer:early.runFormat.status,reason:early.runFormat.reason,rf:early.runForecast.status,rfReason:early.runForecast.reason,numbers:[...NUMERIC(early.runForecast),...NUMERIC(early.paceInsights),...NUMERIC(early.paceRevision)],pi:early.paceInsights.status});
// (a2) a review with no instant
const r0=z.review(12,1,'WEEKLY_REVIEW',{},'08:00');const noAt=P.evaluateProgram(z.p,{...r0,asOf:'not-a-time'},z.opts);
out('P4a2.no-instant',{layer:noAt.runFormat.status,rf:noAt.runForecast.status,numbers:NUMERIC(noAt.runForecast).length});
// (b) an unreadable row in the record of run reports: the layer below asks the screen; the forecast is withdrawn.
const bad=P.evaluateProgram(z.p,{...z.review(12,1,'WEEKLY_REVIEW',{},'08:00'),runFormatRecord:[...z.fmt,{fact:'RUN_REPORT_RECEIVED',athleteId:z.p.athleteId,garbage:true}]},z.opts);
out('P4b.unreadable-report',{layer:bad.runFormat.status,screen:bad.runFormat.warningSignScreen?.status,rf:bad.runForecast.status,rfReason:bad.runForecast.reason,numbersInForecast:NUMERIC(bad.runForecast),calEstimate:bad.runCalibration?.estimates?.['10K']?.status,pi:bad.paceInsights.status,piReason:bad.paceInsights.reason});
// (c) a symptom stop this week: the screen; forecast and insights withdrawn.
{const s=z.p.weeks[12].sessions.find(s=>s.sport==='RUN'&&H.live(s)&&s.role!=='QUALITY');const run=z.runs[s.id];
 const obs=run?.expression==='NATIVE'?H.nativeReport(z,s,{minutes:20,completed:false,actual:{stop:{reason:'SYMPTOM'}}}):H.report(z.p,s,{pace:345,rpe:4,completed:false,actual:{minutes:20,stop:{reason:'SYMPTOM'}}});
 const d=Math.round((Date.parse(s.date)-Date.parse(z.day(12,0)))/86400000);const r=P.evaluateProgram(z.p,z.review(12,d,'WEEKLY_REVIEW',{observations:[obs]},'21:00'),z.opts);
 out('P4c.symptom',{layer:r.runFormat.status,screen:r.runFormat.warningSignScreen?.status,rf:r.runForecast.status,rfReason:r.runForecast.reason,numbersInForecast:NUMERIC(r.runForecast),calEstimate:r.runCalibration?.estimates?.['10K']?.status,pi:r.paceInsights.reason});}
// (d) the review keys of this extension never reach the layers below: the engine's inputHash and every key below are the same with and without them.
{const x=thresholds({through:9}),t=x.t,rv=t.review(9,1,'WEEKLY_REVIEW',{},'09:00');const rec=[{junk:true,fact:'PACE_REVISION_RESPONSE'}];
 const a=P.evaluateProgram(t.p,{...rv,paceRevisionRecord:[]},H.DEV_REVISION),b=P.evaluateProgram(t.p,{...rv,paceRevisionRecord:rec,paceRevisionResponse:{offerId:'zz',response:'ACCEPT'}},H.DEV_REVISION);
 const below=F.evaluateProgram(t.p,Object.fromEntries(Object.entries(rv).filter(([k])=>!['paceRevisionRecord','paceRevisionResponse'].includes(k))),H.DEV);
 const keysBelow=Object.keys(below),diff=keysBelow.filter(k=>H.hash(a[k])!==H.hash(below[k])),diffB=keysBelow.filter(k=>H.hash(b[k])!==H.hash(below[k]));
 out('P4d.keys',{inputHash:[a.inputHash===below.inputHash,b.inputHash===below.inputHash],differsFromBelowA:diff,differsFromBelowB:diffB,bResponse:b.paceRevision.response,bUnreadable:b.paceRevision.unreadableResponses});
 // generateProgram does not take the keys off (no such key is defined for an intake): what does the engine do with them?
 const intake=H.racePlan(),g0=P.generateProgram(intake,H.DEV),g1=P.generateProgram({...intake,paceRevisionRecord:rec,paceRevisionResponse:{offerId:'zz',response:'ACCEPT'}},H.DEV);
 out('P4d.generate',{status:[g0.status,g1.status],sameProgramHash:g0.program?.hash===g1.program?.hash,sameInputHash:g0.inputHash===g1.inputHash,rec1:g1.paceRevisionRecord?.length,errors:g1.errors});
 // (e) echo: what an unreadable row or an unreadable answer brings back into the answer.
 const big='A'.repeat(1_000_000),c=P.evaluateProgram(t.p,{...rv,paceRevisionRecord:[{eventId:big}],paceRevisionResponse:{offerId:'q',response:{blob:big}}},H.DEV_REVISION);
 out('P4e.echo',{unreadableEchoLength:c.paceRevision.unreadableResponses?.[0]?.length,responseEchoLength:JSON.stringify(c.paceRevision.response?.response??null).length,carriedBack:c.paceRevisionRecord?.length,carriedBackLength:JSON.stringify(c.paceRevisionRecord).length});
 // (e2) a REVOKE's offerId is free text that is stored as it was sent (up to 128 characters), with a revision in force.
 const y=thresholds({through:10,answer:(w,look)=>look.paceRevision.offer&&w===9?{offerId:look.paceRevision.offer.offerId,response:'ACCEPT'}:null});
 const rr=y.t.step(10,1,'WEEKLY_REVIEW',{paceRevisionResponse:{offerId:'<script>any free text, not an offer id</script>',response:'REVOKE'}},'09:00');
 out('P4e2.revoke-free-text',{recorded:rr.paceRevision.response,stored:rr.paceRevisionRecord.map(o=>o.response.offerId)});
 // (f) raw fields of an admitted row: the week an execution is read against is the row's own context.weekIndex.
 const q=qualityOf(t,8),row=t.ledger.find(o=>o.sessionId===q.id&&!o.fact&&!o.superseded);
 const tamper=t.ledger.map(o=>o===row?{...o,context:{...o.context,weekIndex:2}}:o);
 const ok=P.evaluateProgram(t.p,rv,H.DEV_REVISION),tm=P.evaluateProgram(t.p,{...rv,actualLedger:tamper},H.DEV_REVISION);
 const sOf=r=>r.paceInsights?.domains?.THRESHOLD_CONTROLLED?.sessions?.find(s=>s.eventId===row.eventId)?.band??null;
 out('P4f.context-week',{engine:[ok.status,tm.status],layer:tm.runFormat.status,bandControl:sOf(ok),bandTampered:sOf(tm),offer:[ok.paceRevision.offer?.stepFraction,tm.paceRevision.offer?.stepFraction]});
}
out('P4.ms',Date.now()-T0);
