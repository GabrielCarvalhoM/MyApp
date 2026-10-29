// Author probe (R7-A DECISION AUTHORITY, Founder request §35: every difference has a named cause): attribution of the regression differences by
// ablation. For each case, profile or simulation the regression (CoachingCore/r7/decision-authority/REGRESSION_R7ADA.json) found different from
// STATE-MODEL-CONSUMER-FREEZE-1, the same input runs on copies of the candidate with one of this mission's changes reverted (exact source
// replacements, the bounded-mutation patches); a change is a cause when reverting it alone, or with the changes of its contract, gives the
// predecessor's output (normalized as the regression normalizes). Temporary copies only; prints JSON.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'../../..'),core=path.join(root,'CoachingCore');
const P={
 FACT:[['src/r6-program.mjs',"export const heldKnownLoad=ex=>ex?.mode==='KNOWN'&&Number.isFinite(ex.load);",'export const heldKnownLoad=ex=>!!ex;'],['src/r6-adaptation.mjs','u=heldKnownLoad(state[id])?row0:asEstablishment(row0)','u=row0']],
 REPLAN_ON_CORRECTION:[['src/r6-adaptation.mjs','function viewMovedBy(ctx){','function viewMovedBy(ctx){return false;']],
 PLAN_CONTEXT:[['src/r6-adaptation.mjs','skn=plan?skOf(k):skj','skn=skj']],
 RETURN_WEEK_E7:[['src/r6-adaptation.mjs','const R=plan&&P.since?read(week.sessions,program.stateTrace[j],program.stateTrace[j]?.strength?.entryWeek):C5;','const R=C5;']],
 REBUILD_OWN_VIEW:[['src/r6-adaptation.mjs','const own=fromWeek===ctx.w?{...ctx,program:next,sk,evidence:undefined}:ctx;','const own=ctx;']],
 PLAN_READING:[['src/r6-adaptation.mjs',"ret:returnInForce(ctx.program),reading:'PLAN'","ret:returnInForce(ctx.program),reading:'HISTORY'"]],
 // The predecessor's run view, verbatim (STATE-MODEL-CONSUMER-FREEZE-1 planningBase): history in re-entry, otherwise the projection's targets
 // and counters with history's capability atoms.
 RUN_VIEW_FROM_EVIDENCE:[['src/r6-adaptation.mjs',"const run={...clone(V.run),planned:clone(P.run.planned)},modes=[...new Set([...(V.run.modeHistory??[]),...(P.run.modeHistory??[])])].sort();\n if(modes.length)run.modeHistory=modes;else delete run.modeHistory;","let run;if([V.run.mode,P.run.mode].some(m=>['RETURN','RESTART'].includes(m)))run={...clone(V.run),planned:clone(P.run.planned)};else{run={...clone(P.run),achieved:clone(V.run.achieved)};if('longestContinuous' in V.run)run.longestContinuous=V.run.longestContinuous;else delete run.longestContinuous;}"]],
 // The predecessor's gate resolution, verbatim: last writer for the run, the first non-ADVANCE verdict for a strength exercise.
 GATE_ORDER:[['src/r6-adaptation.mjs','if(!(key in gates)||GATE_ORDER[value]>GATE_ORDER[gates[key]])gates[key]=value;','gates[key]=value;'],['src/r6-adaptation.mjs',"for(const row of ev.rows.filter(x=>x.sport==='STRENGTH'))for(const id of row.exercises){","for(const row of ev.rows.filter(x=>x.sport==='STRENGTH'))for(const id of row.exercises){\n  if(gates[id]&&gates[id]!=='ADVANCE')continue;"]],
 WALKJOG_STEP_RUN:[['src/r6-program.mjs','from=!eventHold&&Number.isInteger(P.walkStep)?Math.min(st.walkStep,P.walkStep):st.walkStep','from=d>0&&Number.isInteger(P.walkStep)?Math.min(st.walkStep,P.walkStep):st.walkStep']],
 WALKJOG_RETURN_CEILING:[['src/r6-adaptation.mjs','run:historicalRun(clone(H.state.run),stepsRun.at(-1)??null)','run:clone(H.state.run)']],
};
// Ablation sets: each change alone, each contract's changes together, the PlanningView as the predecessor read it, every change reverted (ALL),
// and every change but one reverted (ALL_BUT_<change>): a change is necessary to a difference when ALL restores it and ALL_BUT_<change> does not.
const ALL=Object.keys(P);
const SETS={...Object.fromEntries(ALL.map(k=>[k,[k]])),DECISION_CONTEXT:['PLAN_CONTEXT','RETURN_WEEK_E7','REBUILD_OWN_VIEW','PLAN_READING'],PROGRESSION:['RUN_VIEW_FROM_EVIDENCE','GATE_ORDER','PLAN_READING'],VIEW_AS_PREDECESSOR:['RUN_VIEW_FROM_EVIDENCE','PLAN_READING','PLAN_CONTEXT','RETURN_WEEK_E7'],WALK_JOG:['WALKJOG_STEP_RUN','WALKJOG_RETURN_CEILING'],ALL,...Object.fromEntries(ALL.map(k=>['ALL_BUT_'+k,ALL.filter(x=>x!==k)]))};
const reg=JSON.parse(fs.readFileSync(path.join(core,'r7/decision-authority/REGRESSION_R7ADA.json'),'utf8'));
const NOTE=/Not done for more than (\d+) days as of the last review:/g,SKIP=new Set(['facts','exposure','hash','doseKey','entryWeek','inputHashes','digest','adaptations','contextBefore','startBeforeReturn','easedFor','startAuthority','startBeforeReturnAuthority']);
const BREAK_RECORD=['startDate','endDate','startedAt','episode','relation','supersedes','basis','revision','inputHash','stateAt','entry'];
const norm=(x,key)=>Array.isArray(x)?x.map(v=>norm(v)):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).filter(([k])=>!SKIP.has(k)&&!/Hash$|Digest$/.test(k)&&!(key==='interruption'&&BREAK_RECORD.includes(k))).map(([k,v])=>[k,norm(v,k)])):typeof x==='string'?x.replace(NOTE,'Not done for more than $1 days:'):x;
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7ada-abl-')),out={probe:'r7ada-ablation',differences:{}};
const SUPPORT=['scripts/evaluate-holdout-r6.mjs','scripts/simulate-r6.mjs','r6/PROGRAM_POLICY_R6.json','r6/fixtures','r5/PROGRAM_POLICY_R5.json'];
const REVIEWS=['audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json','audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json'];
const build=(name,patches)=>{const base=path.join(tmp,name,'CoachingCore');fs.mkdirSync(base,{recursive:true});fs.cpSync(path.join(core,'src'),path.join(base,'src'),{recursive:true});
 for(const s of SUPPORT)fs.cpSync(path.join(core,s),path.join(base,s),{recursive:true});
 for(const r of REVIEWS){fs.mkdirSync(path.dirname(path.join(tmp,name,r)),{recursive:true});fs.copyFileSync(path.join(root,r),path.join(tmp,name,r));}
 for(const [file,from,to] of patches){const f=path.join(base,file),s=fs.readFileSync(f,'utf8');if(s.split(from).length!==2)throw Error(`${name}: ${file} patch does not apply once`);fs.writeFileSync(f,s.replace(from,to));}
 return base;};
const runtime=async base=>{const load=rel=>import(pathToFileURL(path.join(base,rel)).href);const ev=await load('scripts/evaluate-holdout-r6.mjs'),sim=await load('scripts/simulate-r6.mjs'),idx=await load('src/r6-index.mjs'),dev=await load('r6/fixtures/dev-authority.mjs'),prof=await load('r6/fixtures/profiles.mjs');
 return {ev:ev.evaluateHoldoutCase,sim:sim.simulateAll,gen:idx.generateProgram,authority:dev.devAuthority(),profiles:{...prof.PROFILES,...prof.EDGE_PROFILES}};};
try{
 const pred=path.join(root,'audits/domain-coaching-r7a-decision-authority-2026-10-29/state-consumer-freeze-source/CoachingCore'),predBase=path.join(tmp,'pred','CoachingCore');
 fs.mkdirSync(predBase,{recursive:true});fs.cpSync(pred,predBase,{recursive:true});for(const s of ['scripts/evaluate-holdout-r6.mjs','scripts/simulate-r6.mjs','r5/PROGRAM_POLICY_R5.json'])if(!fs.existsSync(path.join(predBase,s)))fs.cpSync(path.join(core,s),path.join(predBase,s),{recursive:true});
 for(const r of REVIEWS){fs.mkdirSync(path.dirname(path.join(tmp,'pred',r)),{recursive:true});fs.copyFileSync(path.join(root,r),path.join(tmp,'pred',r));}
 const rts={pred:await runtime(predBase),candidate:await runtime(build('candidate',[]))};
 for(const [name,keys] of Object.entries(SETS))rts[name]=await runtime(build(name,keys.flatMap(k=>P[k])));
 const corpus=JSON.parse(fs.readFileSync(path.join(core,'r6/holdout/R6_INDEPENDENT_HOLDOUT.json'),'utf8')).cases;
 const caseOut=(rt,c)=>{try{return JSON.stringify(norm(rt.ev(structuredClone(c),{authority:rt.authority})));}catch(e){return 'ERROR '+String(e?.message??e).slice(0,200);}};
 const items=[...reg.r6FreshHoldout.filter(x=>!x.identical).map(x=>({kind:'R6',id:x.caseId,run:rt=>caseOut(rt,corpus.find(c=>c.caseId===x.caseId))})),
  ...reg.profiles.filter(x=>!x.identical).map(x=>({kind:'PROFILE',id:x.label,run:rt=>JSON.stringify(norm(rt.gen(structuredClone(rt.profiles[x.label]),{authority:rt.authority})))})),
  ...reg.simulations.filter(x=>!x.identical).map(x=>({kind:'SIMULATION',id:x.label,run:rt=>JSON.stringify(norm(rt.sim({authority:rt.authority}).find(t=>t.id===x.label)))}))];
 for(const it of items){const want=it.run(rts.pred),cand=it.run(rts.candidate);
  const restores=Object.keys(SETS).filter(n=>it.run(rts[n])===want),changes=Object.keys(SETS).filter(n=>it.run(rts[n])!==cand);
  out.differences[`${it.kind} ${it.id}`]={candidateDiffers:cand!==want,restoredBy:restores,touchedBy:changes};}
 for(const v of Object.values(out.differences))v.necessary=v.restoredBy.includes('ALL')?ALL.filter(k=>!v.restoredBy.includes('ALL_BUT_'+k)):null;
 out.summary={items:items.length,necessaryChanges:Object.entries(out.differences).map(([k,v])=>`${k}: ${v.necessary?v.necessary.join('+'):'not restored by ALL'}`),restoredBySingleChange:Object.entries(out.differences).filter(([,v])=>v.restoredBy.some(n=>P[n])).map(([k,v])=>`${k}: ${v.restoredBy.filter(n=>P[n]).join('+')}`),restoredOnlyByASet:Object.entries(out.differences).filter(([,v])=>!v.restoredBy.some(n=>P[n])&&v.restoredBy.length).map(([k,v])=>`${k}: ${v.restoredBy.join(' | ')}`),notRestored:Object.entries(out.differences).filter(([,v])=>!v.restoredBy.length).map(([k,v])=>`${k} (touched by ${v.touchedBy.join(', ')})`)};
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
console.log(JSON.stringify(out,null,1));
