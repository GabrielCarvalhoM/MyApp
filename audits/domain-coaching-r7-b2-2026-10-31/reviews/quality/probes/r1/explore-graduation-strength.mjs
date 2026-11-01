// R7B2-QUALITY-r1 exploratory probe (diagnostic): why the strength variants of the GRAD fixture do not graduate at week 3, and whether one
// graduates at a later block boundary (needed for graduation withdrawal x late evidence, since staleReturn reads the strength state only).
// Usage: NOW_ROOT=<worktree> PRED_ROOT=<temp archive of 146ebb8> node explore-graduation-strength.mjs
import {NOW,PRED,write} from './qr1.mjs';
const base={goals:{run:'PERFORMANCE',strength:'GENERAL'},runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35,strengthDaysPerWeek:2},schedule:{strengthDays:[0,4],runMinutes:45},equipment:['DUMBBELLS','BENCH'],weeks:16};
const V={S_GENERAL:base,S_GENERAL_INT:{...base,strengthExperience:'INTERMEDIATE'},S_GENERAL_NONEXP:{...base,strengthExperience:'NONE'},RUN_REGULAR:{...base,goals:{run:'REGULAR',strength:'GENERAL'}},
 S_NONE_REF:{...base,goals:{run:'PERFORMANCE',strength:'NONE'},recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35},schedule:{strengthDays:[],runMinutes:45}}};
function probe(rt,name,o){
 const {program,weekly}=rt.H;let t;try{t={p:program({id:'q-gs-'+name.toLowerCase(),...o}),ledger:[]};}catch(e){return {error:e.message.slice(0,200)};}
 const out={phases:t.p.phases.phases.slice(0,9),modes:t.p.stateTrace.slice(0,9).map(s=>s?.run?.mode??null),boundaries:[]};
 for(let w=0;w<9;w++){const r=weekly(t,w);if(r.action!=='KEEP'||(r.disclosures??[]).length)out.boundaries.push({w,action:r.action,disc:(r.disclosures??[]).map(d=>d.id)});if(t.p.canonical.athlete.runGraduation){out.graduatedAt=w;break;}}
 out.modesAfter=t.p.stateTrace.slice(0,10).map(s=>s?.run?.mode??null);
 return out;
}
const res={};for(const [l,rt] of [['freeze2',PRED],['r7b2',NOW]]){res[l]={};for(const [n,o] of Object.entries(V))res[l][n]=probe(rt,n,o);}
write('explore-graduation-strength',res);for(const k of ['freeze2','r7b2'])for(const [n,v] of Object.entries(res[k]))console.log(k,n,JSON.stringify(v));
