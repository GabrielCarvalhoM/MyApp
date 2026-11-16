// R2 q1: are SEC-RFC-A-08, A-09 and A-11 closed at 0d3015b?
import {H,P,F,thresholds,rev,out} from './base.mjs';
const NUMERIC=o=>{const f=[];const walk=(v,p)=>{if(typeof v==='number'&&/Seconds$/.test(p.split('.').at(-1)))f.push(p);else if(v&&typeof v==='object')for(const [k,x] of Object.entries(v))walk(x,p+'.'+k);};walk(o,'');return f;};
// A-08: the echo of what cannot be read, and the free text of a REVOKE.
{
 const x=thresholds({through:9}),t=x.t,rv=t.review(9,1,'WEEKLY_REVIEW',{},'09:00'),big='A'.repeat(1_000_000);
 const c=P.evaluateProgram(t.p,{...rv,paceRevisionRecord:[{eventId:big}],paceRevisionResponse:{offerId:'q',response:{blob:big}}},H.DEV_REVISION);
 const d=P.evaluateProgram(t.p,{...rv,paceRevisionResponse:{offerId:big,response:'ACCEPT'}},H.DEV_REVISION);
 out('q1.A08.echo',{unreadableEchoLength:c.paceRevision.unreadableResponses?.[0]?.length??null,responseEcho:c.paceRevision.response,longOfferIdEcho:d.paceRevision.response?.offerId===null,carriedBackLength:JSON.stringify(c.paceRevisionRecord).length});
 const y=thresholds({through:10,answer:(w,look)=>look.paceRevision.offer&&w===9?{offerId:look.paceRevision.offer.offerId,response:'ACCEPT'}:null});
 const rr=y.t.step(10,1,'WEEKLY_REVIEW',{paceRevisionResponse:{offerId:'<script>any free text, not an offer id</script>',response:'REVOKE'}},'09:00');
 out('q1.A08.revoke-free-text',{recorded:rr.paceRevision.response,stored:rr.paceRevisionRecord.map(o=>o.response.offerId)});
}
// A-09: the keys on an intake, and on a restart's intake.
{
 const intake=H.racePlan(),keys={paceRevisionRecord:[{junk:true}],paceRevisionResponse:{offerId:'zz',response:'ACCEPT'}};
 const g0=P.generateProgram(intake,H.DEV),g1=P.generateProgram({...intake,...keys},H.DEV);
 out('q1.A09.generate',{sameProgramHash:g0.program?.hash===g1.program?.hash,sameInputHash:g0.inputHash===g1.inputHash,status:[g0.status,g1.status]});
 const t=H.timeline(intake);for(let w=0;w<2;w++)t.week(w,s=>H.asPrescribed(t,s));
 const fresh=H.runner({id:'rf-race',asOf:'2027-01-20',start:'2027-01-25',weeks:8,goal:{kind:'RACE',event:{kind:'10K',date:'2027-03-21'}},anchors:[H.result('10K',3000,'2027-01-01')],athlete:{pause:{weeks:0,reasonCategory:'TRAVEL',nonclinical:true}}});
 const R=i=>P.restartProgram({intake:i,record:t.ledger,referenceState:t.ref,asOf:'2027-01-20T10:00:00-03:00',athleteId:t.p.athleteId,runEvidenceRecord:t.ev,runFormatRecord:t.fmt,runHistoryRecord:t.hist},H.DEV);
 const r0=R(fresh),r1=R({...fresh,...keys});
 out('q1.A09.restart',{status:[r0.status,r1.status],sameProgramHash:(r0.program??r0.proposal)?.hash===(r1.program??r1.proposal)?.hash,sameInputHash:r0.inputHash===r1.inputHash});
}
// A-11: a withdrawal (screen required) repeats no estimate.
{
 const z=H.timeline(H.racePlan({goalMinutes:48}));for(let w=0;w<12;w++)z.week(w,s=>H.asPrescribed(z,s),w===7?{runEvidence:[H.result('10K',2940,'2027-02-28',{id:'tuneup'})]}:{});
 const ok=z.look(12);
 const bad=P.evaluateProgram(z.p,{...z.review(12,1,'WEEKLY_REVIEW',{},'08:00'),runFormatRecord:[...z.fmt,{fact:'RUN_REPORT_RECEIVED',athleteId:z.p.athleteId,garbage:true}]},z.opts);
 const s=z.p.weeks[12].sessions.find(s=>s.sport==='RUN'&&H.live(s)&&s.role!=='QUALITY'),run=z.runs[s.id];
 const obs=run?.expression==='NATIVE'?H.nativeReport(z,s,{minutes:20,completed:false,actual:{stop:{reason:'SYMPTOM'}}}):H.report(z.p,s,{pace:345,rpe:4,completed:false,actual:{minutes:20,stop:{reason:'SYMPTOM'}}});
 const d=Math.round((Date.parse(s.date)-Date.parse(z.day(12,0)))/86400000),sym=P.evaluateProgram(z.p,z.review(12,d,'WEEKLY_REVIEW',{observations:[obs]},'21:00'),z.opts);
 for(const [k,r] of [['control',ok],['unreadable-report',bad],['symptom',sym]])out('q1.A11.'+k,{rf:r.runForecast.status,reason:r.runForecast.reason,withdrawn:r.runForecast.withdrawn??null,screen:r.runFormat.warningSignScreen?.status,numbers:NUMERIC(r.runForecast).length,current:r.runForecast.current??null});
}
