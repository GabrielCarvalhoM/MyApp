// R7B2-QUALITY-r1 (session 6) probe library. Builds on ./dual.mjs, a verbatim copy of the Engineering judge's dual-runtime loader
// (sha256 b36b0e49...76fc): NOW = R7B2-FREEZE-1 bytes (NOW_ROOT, the worktree), PRED = R7B1-FREEZE-2 (PRED_ROOT, a temporary git archive of
// 146ebb8 outside the repository). Read-only on both trees; writes only ./out/<probe>.json (through dual.write).
import {NOW,PRED,BAD,correctionOf,apply,snap,diff,write} from './dual.mjs';
export {NOW,PRED,BAD,correctionOf,apply,snap,diff,write};

/** Everything a client or a later review can read from one result, with the proposal's own identity and the dropped disclosures. */
export function full(rt,r){
 const s=snap(rt,r);
 return {...s,proposalAction:r.proposal?.decisions?.at(-1)?.action??null,disclosureIds:(r.disclosures??[]).map(d=>d.id??d.kind??'?'),
  offerIds:(r.offers??[]).map(o=>o.id??o.offer??'?'),questionRaw:r.question??null,programHashInRef:r.referenceState?.programHash??null};
}
const HANDLER_REASON=/^(Pain, injury, illness or a functional limitation with |The interruption reason is clinical or possibly clinical)/;
/**
 * Classifies one FREEZE-2 / R7-B.2 pair.
 * SAME: identical in every compared field.
 * S5_I: contract §5 shape: FREEZE-2 a nonclinical question (ASK) with no proposal -> R7-B.2 the handler's clinical route, no proposal; same ledger.
 * QE01: the QE-R7B2-01 shape: FREEZE-2 a nonclinical question carrying the factual re-plan (REPLAN_FROM_EVIDENCE) -> R7-B.2 the handler's
 *       clinical route, no proposal; same ledger.
 * OTHER: anything else (the reason says why).
 */
export function classify(f2,b2){
 const d=diff(f2,b2);if(!d.length)return {cls:'SAME',why:[]};
 const why=[];
 const b2route=b2.status==='CLINICAL_HUMAN_REQUIRED'&&!b2.proposal&&HANDLER_REASON.test(String(b2.reason))&&b2.pending?.status==='CLINICAL_HUMAN_REQUIRED';
 if(!b2route)why.push('R7-B.2 is not the handler clinical route with no proposal');
 if(f2.status!=='ASK')why.push('FREEZE-2 status '+f2.status+' is not a question');
 if(f2.ledger!==b2.ledger)why.push('actualLedger differs');
 if(f2.status==='CLINICAL_HUMAN_REQUIRED')why.push('FREEZE-2 was already clinical');
 if(why.length)return {cls:'OTHER',why,differs:d};
 if(!f2.proposal)return {cls:'S5_I',why:[],differs:d};
 if(f2.proposalAction==='REPLAN_FROM_EVIDENCE'){
  const extra=f2.disclosureIds.length?['FREEZE-2 also disclosed '+f2.disclosureIds.join('+')]:[];
  return {cls:extra.length?'QE01_WITH_DISCLOSURE':'QE01',why:extra,differs:d};
 }
 return {cls:'OTHER',why:['FREEZE-2 proposal action '+f2.proposalAction],differs:d};
}
/** Numeric dose of a session prescription, per dimension, for an above/below comparison. */
function doseOf(s){
 const p=s?.prescription;if(!p)return null;
 if(p.modality==='STRENGTH')return {kind:'S',ex:Object.fromEntries((p.exercises??[]).map(e=>[e.id,{sets:e.sets,reps:e.reps,load:e.load?.mode==='KNOWN'?e.load.value:null}]))};
 return {kind:'R',minutes:p.durationMinutes??null,family:p.family??null};
}
/** Sessions still ahead of `after` (a local date): where the R7-B.2 plan in force differs from the FREEZE-2 plan in force, and in which direction. */
export function doseDelta(pB2,pF2,after){
 const byId=new Map(pF2.weeks.flatMap(w=>w.sessions.map(s=>[s.id,s]))),rows=[];
 for(const w of pB2.weeks)for(const s of w.sessions){
  if(!(s.date>after))continue;const o=byId.get(s.id);
  if(JSON.stringify(s.prescription??null)===JSON.stringify(o?.prescription??null))continue;
  const a=doseOf(s),b=doseOf(o);let above=false,below=false;
  if(a&&b&&a.kind==='S'&&b.kind==='S')for(const [id,x] of Object.entries(a.ex)){const y=b.ex[id];if(!y){above=true;continue;}
   for(const k of ['sets','reps','load']){if(typeof x[k]==='number'&&typeof y[k]==='number'){if(x[k]>y[k])above=true;if(x[k]<y[k])below=true;}}}
  let family=false;
  if(a&&b&&a.kind==='R'&&b.kind==='R'){if((a.minutes??0)>(b.minutes??0))above=true;if((a.minutes??0)<(b.minutes??0))below=true;family=a.family!==b.family;}
  else if(a&&!b)above=true;else if(!a&&b)below=true;
  rows.push({week:w.index,session:s.id,date:s.date,b2:a,f2:b,b2AboveF2:above,b2BelowF2:below,runFamilyDiffers:family});
 }
 return {differing:rows.length,b2AboveF2:rows.filter(r=>r.b2AboveF2).length,b2BelowF2:rows.filter(r=>r.b2BelowF2).length,runFamilyDiffers:rows.filter(r=>r.runFamilyDiffers).length,rows:rows.slice(0,12)};
}
export const CHOICES={
 none:undefined,
 empty:[],
 ladder:[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}],
 declined:[{offer:'RUN_QUALITY_GRADUATION',decision:'DECLINE'}],
 accepted:[{offer:'RUN_QUALITY_GRADUATION',decision:'ACCEPT'}],
 mainChange:[{type:'MAIN_CHANGE',from:'goblet-squat',to:'db-front-squat',reason:'SKILL_MISMATCH'}],
 unrecognised:[{type:'SOMETHING_ELSE'}],
 nullEntry:[null],
};
/** Runs one scenario function on both runtimes with the same call sequence and pairs its rows. */
export function dual(scenario){
 const a=scenario(PRED),b=scenario(NOW);
 if(a.length!==b.length)throw new Error('row count differs: '+a.length+' vs '+b.length);
 return a.map((x,i)=>{const y=b[i];if(x.name!==y.name)throw new Error('row order differs at '+i);const c=classify(x.snap,y.snap);
  return {name:x.name,group:x.group,signal:x.signal,cls:c.cls,why:c.why,differs:c.differs??[],freeze2:x.snap,r7b2:y.snap,extra:{freeze2:x.extra??null,r7b2:y.extra??null}};});
}
export function counts(rows){
 const by={};for(const r of rows){const g=by[r.group]??={rows:0};g.rows++;g[r.cls]=(g[r.cls]??0)+1;
  if(r.freeze2.proposal)g.freeze2WithProposal=(g.freeze2WithProposal??0)+1;if(r.r7b2.proposal)g.r7b2WithProposal=(g.r7b2WithProposal??0)+1;}
 return by;
}
