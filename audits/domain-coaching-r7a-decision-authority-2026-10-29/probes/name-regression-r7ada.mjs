// Author probe (R7-A DECISION AUTHORITY, Founder request §35): names every regression difference. Inputs: the regression against
// STATE-MODEL-CONSUMER-FREEZE-1 (CoachingCore/r7/decision-authority/REGRESSION_R7ADA.json) and the ablation (probes/runs/ablation.out.json:
// the change whose revert restores the predecessor's output). Every differing case gets the class of its necessary change(s); every dose that
// rose is read against the policy ladders (a lower ladder step whose single field is larger, a quality session withheld, the athlete's own
// familiar task, or the rotation of a projection re-based on earned state). Writes CoachingCore/r7/decision-authority/REGRESSION_R7ADA_NAMED.json.
import fs from 'node:fs';
import path from 'node:path';
const repo=path.resolve(import.meta.dirname,'../../..'),cc=path.join(repo,'CoachingCore');
const reg=JSON.parse(fs.readFileSync(path.join(cc,'r7/decision-authority/REGRESSION_R7ADA.json'),'utf8'));
const abl=JSON.parse(fs.readFileSync(path.join(import.meta.dirname,'runs/ablation.out.json'),'utf8'));
const R=JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8').replace(/^﻿/,'')).operational.run;
const LADDER={THRESHOLD:R.thresholdLadder,TEN_K_SPECIFIC:R.tenKSpecificLadder,HALF_MARATHON_SPECIFIC:R.halfMarathonSpecificLadder};
const CLASSES={
 RUN_VIEW_FROM_EVIDENCE:{contract:'C1, C2 (QE-R7ASC-02 closure; E10 withdrawn)',meaning:'The decision\'s run is the PLAN reading\'s (EarnedRunProgress): weeks the case never reports earn no run progression, so quality and strides unlock, ladder steps and long runs follow executed weeks, not the projection.'},
 GATE_ORDER:{contract:'C3 (QE-R7ASC-03; P4)',meaning:'One verdict per gate key, the most restrictive standing, whatever order roles or rows are read in.'},
 PLAN_READING:{contract:'B1 (QE-R7ASC-04)',meaning:'Every planning consumer of a decision reads the evidence reducer\'s PLAN reading (transitions under the entered week\'s context; open weeks held).'},
 RETURN_WEEK_E7:{contract:'B2 (QE-R7ASC-04)',meaning:'The PLAN reading reads a return\'s own week as the planner\'s review does (E7); the closing review agrees with it and keeps the plan where the predecessor re-planned. Rows identical.'}};
// A rose dose, read against the ladders: same family at a lower step, a withheld quality session, an intake-calibrated familiar task, a
// specific phase not yet earned, or an easy run of a projection re-based on earned state.
const step=(f,reps,work)=>(LADDER[f]??[]).findIndex(x=>x.repetitions===reps&&x.workMinutes===work);
function readRose(line){
 const m=line.match(/(RUN\/\w+) (\w+): (\{.*\}) -> (\{.*\})$/);if(!m)return {line,class:'UNREAD'};
 const a=JSON.parse(m[3]),b=JSON.parse(m[4]),sa=step(a.family,a.reps,a.work),sb=step(b.family,b.reps,b.work);
 if(b.calibration==='CURRENT_FAMILIAR_TASK'&&a.calibration!=='CURRENT_FAMILIAR_TASK')return {line,class:'FAMILIAR_TASK',reading:`the athlete's current familiar ${b.family} task (${b.reps}x${b.work}, calibrated on the intake's own session) instead of ${a.family} step ${sa}`};
 if(m[1]==='RUN/QUALITY'&&b.family==='EASY')return {line,class:'QUALITY_WITHHELD',reading:`${a.family} replaced by an easy run: quality not unlocked by executed weeks`};
 if(a.family===b.family&&sa>=0&&sb>=0&&sb<sa)return {line,class:'LOWER_LADDER_STEP',reading:`${a.family} step ${sb} instead of ${sa}; the field "${m[2]}" of the lower step is larger`};
 if(a.family===b.family&&sa>=0&&sb<0)return {line,class:'FAMILIAR_TASK',reading:`the athlete's current familiar ${b.family} task (${b.reps}x${b.work}), off the ladder, instead of step ${sa}`};
 if(a.family!==b.family&&sb<0&&b.family!=='EASY')return {line,class:'FAMILIAR_TASK',reading:`the athlete's current familiar ${b.family} task (${b.reps}x${b.work}) at the intake level instead of ${a.family} step ${sa}`};
 if(a.family!==b.family&&b.family==='THRESHOLD'&&sb>=0)return {line,class:'SPECIFIC_NOT_YET_EARNED',reading:`threshold step ${sb} instead of ${a.family} step ${sa}: the specific ladder needs the executed threshold sessions`};
 if(m[1]==='RUN/EASY'&&a.family==='EASY'&&b.family==='EASY')return {line,class:'PROJECTION_ROTATION',reading:'a projected easy run of a plan re-based on earned state: its rotating easy step falls in another week (no unexecuted week credited)'};
 return {line,class:'UNREAD'};
}
const items=[];
const nameOf=key=>{const v=abl.differences[key];if(!v)return null;const nec=v.necessary??[];return nec.length?nec:v.restoredBy.filter(n=>CLASSES[n]);};
for(const c of reg.r6FreshHoldout.filter(x=>!x.identical)){const key=`R6 ${c.caseId}`,names=nameOf(key)??[];
 items.push({id:key,classes:names,restoredByReverting:abl.differences[key]?.restoredBy??[],statusChanged:c.before!==c.current?`${c.before} -> ${c.current}`:null,error:c.error??null,fell:c.tally?.fell??0,kindChanged:c.tally?.kindChanged?.length??0,rose:(c.tally?.rose??[]).map(readRose)});}
for(const [kind,list,label] of [['PROFILE',reg.profiles,'label'],['SIMULATION',reg.simulations,'label']])for(const x of list.filter(x=>!x.identical)){const key=`${kind} ${x[label]}`;items.push({id:key,classes:nameOf(key)??[],restoredByReverting:abl.differences[key]?.restoredBy??[],differences:x.differences.slice(0,6)});}
const unclassified=items.filter(i=>!i.classes.length||!i.classes.every(n=>CLASSES[n])).map(i=>i.id),unreadRose=items.flatMap(i=>(i.rose??[]).filter(r=>r.class==='UNREAD').map(r=>`${i.id}: ${r.line}`));
const out={revision:'R7ADA-REGRESSION-NAMED-1',source:{regression:'CoachingCore/r7/decision-authority/REGRESSION_R7ADA.json',ablation:'audits/domain-coaching-r7a-decision-authority-2026-10-29/probes/runs/ablation.out.json'},classes:CLASSES,
 summary:reg.summary,items,
 verdict:{differences:items.length,unclassifiedDifferences:unclassified.length,unclassified,roseDoses:items.reduce((n,i)=>n+(i.rose?.length??0),0),roseByClass:items.flatMap(i=>i.rose??[]).reduce((o,r)=>({...o,[r.class]:(o[r.class]??0)+1}),{}),unreadRose,strengthDoseRose:items.flatMap(i=>(i.rose??[]).filter(r=>/STRENGTH\//.test(r.line))).length,
  r6H35:'The fixture\'s week-5 QUALITY fact matches no session: weeks 0-3 are never reported, so QUALITY is not unlocked (RUN_VIEW_FROM_EVIDENCE); the predecessor credited them from the projection. The case ends in a runner error on the candidate, recorded, never dropped.'}};
fs.writeFileSync(path.join(cc,'r7/decision-authority/REGRESSION_R7ADA_NAMED.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify(out.verdict,null,1));
