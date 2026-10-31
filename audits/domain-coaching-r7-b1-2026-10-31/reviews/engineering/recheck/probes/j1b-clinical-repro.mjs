// R7B1-ENG-r1 judge reproduction J1b (clinical screen on the block-choice question path; B0-C06 condition 8, SSCTR D08, R7-A withFactualReplan:
// a clinical route proposes nothing). Strength-NONE novice reviewed through week 4; on day 0 of week 5 (06:00Z) the athlete reports pain with an
// exercise (reason-based substitution) or an illness interruption, with and without a block choice, with and without a correction of week 4.
// Read-only; PROBE_ROOT=<tree> runs it on another runtime.
import {record,guard,done,reviewed,review,evaluateProgram,opts,live,BAD,correctionOf,LABEL} from './lib.mjs';
const NOV={id:'j1b-novice',strengthExperience:'NONE',goals:{run:'REGULAR',strength:'GENERAL'},equipment:['DUMBBELLS','BENCH'],schedule:{strengthDays:[0,2,4,5]},weeks:12};
const t=reviewed(NOV,5),day=t.p.weeks[5].startDate;
const fixes=t.ledger.filter(o=>!o.superseded&&!o.correctionOf&&t.p.weeks[4].sessions.some(s=>s.id===o.sessionId&&s.sport==='STRENGTH')).map(o=>correctionOf(o,structuredClone(o.actual),`${day}T05:00:00Z`,BAD));
const X=t.p.weeks[5].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>day).flatMap(s=>s.prescription.exercises.filter(e=>e.role!=='PRACTICE').map(e=>e.id))[0];
const kinds={substitutionPain:{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true}},returnIllness:{kind:'RETURN_AFTER_PAUSE',interruption:{days:2,reason:'Flu illness',nonclinical:true}}};
const choices={none:null,ladder:[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}],decline:[{offer:'RUN_QUALITY_GRADUATION',decision:'DECLINE'}],unrecognised:[{type:'LADDER_JUMP'}]};
const rows=[];
for(const [kn,kx] of Object.entries(kinds))for(const [cn,ch] of Object.entries(choices))for(const fix of [false,true])guard('J1b','clinical',()=>{
 const r=evaluateProgram(t.p,{...review(t.p,5,{day:0,hour:'06:00:00',...kx,observations:fix?fixes:[],...(ch?{choices:ch}:{})}),actualLedger:t.ledger},opts);
 rows.push({kind:kn,choice:cn,correction:fix,status:r.status,action:r.action,proposal:!!r.proposal,correctionRecorded:(r.actualLedger??[]).some(o=>o.correctionOf),referencePending:r.referenceState?.pending?.status??null,reason:String(r.reason).slice(0,110)});
});
const bypass=rows.filter(x=>x.choice!=='none'&&x.status!=='CLINICAL_HUMAN_REQUIRED');
record('J1b','clinical screen first on the block-choice path',!bypass.length,'a review reporting pain with an exercise or an illness interruption routes CLINICAL_HUMAN_REQUIRED and proposes nothing, whatever block choice it also carries',{label:LABEL,exercise:X,bypassed:bypass.length,withProposal:bypass.filter(x=>x.proposal).length,rows});
done('j1b-clinical-repro');
