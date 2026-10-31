// Q-R7B probe 13: an accepted ACCESSORY skill-ladder step (B0-C07) and the calendar rotation (B0-C06). The athlete accepts
// band-assisted-pull-up -> pull-up (and db-overhead-press -> barbell-overhead-press) at the week-4 block boundary; reviews continue with
// sessions executed as prescribed. Records, per rotation preference, the configuration in the slot each week, the review actions and any
// disclosure or reason given when the slot changes. Output: out/p13-ladder-reversal.json
import fs from 'node:fs';
import {program,review,obs,live,evaluateProgram,opts} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
const step=(t,w,choices)=>evaluateProgram(t.p,{...review(t.p,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s)),...(choices?{choices}:{})}),actualLedger:t.ledger},opts);
const CASES=[
 {from:'band-assisted-pull-up',to:'pull-up',o:{equipment:['BANDS','PULL_UP_BAR'],goals:{run:'PERFORMANCE',strength:'GENERAL'},strengthExperience:'INTERMEDIATE',schedule:{strengthDays:[0,2,4,5]}}},
 {from:'db-overhead-press',to:'barbell-overhead-press',o:{equipment:['DUMBBELLS','BARBELL','RACK'],goals:{run:'PERFORMANCE',strength:'STRENGTH'},strengthExperience:'INTERMEDIATE',schedule:{strengthDays:[0,2,4,5]}}},
];
const out=[];
for(const c of CASES)for(const rotation of ['COACH_DECIDES','EVERY_6_WEEKS','EVERY_2_WEEKS','FIXED']){
 const t={p:program({id:'p13-'+c.to+'-'+rotation,weeks:16,rotation,...c.o}),ledger:[]};const rec={case:c.from+' -> '+c.to,rotation,accepted:null,weeks:{},events:[]};
 for(let w=0;w<16;w++){
  let r=step(t,w);
  if(w===4){const r2=step(t,w,[{type:'LADDER_STEP',from:c.from,to:c.to}]);rec.acceptStatus=r2.status;if(r2.status!=='ASK'){r=r2;rec.accepted=w;}else rec.acceptReason=r2.reason;}
  if(r.action&&r.action!=='KEEP')rec.events.push({week:w,action:r.action,reason:r.reason?.slice(0,160),disclosures:(r.disclosures??[]).map(d=>d.id)});
  t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;
 }
 for(let w=0;w<16;w++)rec.weeks['w'+w]=t.p.weeks[w].phase+': '+[...new Set(t.p.weeks[w].sessions.filter(live).flatMap(s=>(s.prescription.exercises??[]).filter(e=>e.id===c.from||e.id===c.to).map(e=>e.id+'/'+e.role+(e.load?.mode?'/'+e.load.mode:''))))].join('+');
 rec.selections=t.p.canonical.athlete.strengthSelections??[];rec.ladderReached=t.p.canonical.athlete.ladderReached??[];
 // Any explanation attached to the reverted rows in the final program.
 const reverted=t.p.weeks.slice(9).flatMap(wk=>wk.sessions.filter(live).flatMap(s=>(s.prescription.exercises??[]).filter(e=>e.id===c.from).map(e=>({week:wk.index,instructions:e.instructions,rotation:e.rotation??null,exposure:e.exposure??null,note:e.note??null}))));
 rec.revertedRowSample=reverted[0]??null;
 out.push(rec);
}
fs.writeFileSync(new URL('./out/p13-ladder-reversal.json',import.meta.url),JSON.stringify(out,null,1));
for(const r of out)console.log(r.case,r.rotation,'accepted',r.accepted,'\n  ',Object.entries(r.weeks).map(([w,v])=>w+'='+v.replace(/^[A-Z_]+: /,'')).join(' | '),'\n   events',JSON.stringify(r.events),'\n   sample',JSON.stringify(r.revertedRowSample)?.slice(0,400));
