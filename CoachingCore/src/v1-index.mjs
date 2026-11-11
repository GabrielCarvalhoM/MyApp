// CoachingCore V1 (Final Closure, Founder request of 2026-11-11): the V1 entry point. It is the engine the product runs (custody's default): the same
// planner, reviews and safety rules as r6-index.mjs, inside the V1 scope. The scope is applied in the runtime (r6-adaptation.mjs), never only in
// the app:
// - F08 Situation 1 (temporary reduction: windows, rungs, checks, return ladders, speeds, chains) is not offered. A "not 100%" report is still
//   screened (any warning sign routes to the clinical hold), and with every sign answered no the plan is kept with a typed unavailability.
// - A record that holds a temporary-reduction report was not kept by V1: nothing is planned over it (HOLD).
// - A clinical hold stays on the record and only the athlete's readiness declaration releases it, sport by sport (Situation 2). A new plan or an
//   omitted reference never releases it (CF-OBS-1), and a new plan never starts above the return entry after a long pause.
// - Declared breaks and their conservative return (R7-C, R7-D) are the one way a stop is read.
// This module sets the scope option; a caller's own value for it is overwritten. Every other option (an authority, an event extension) is the
// caller's: custody passes none, and an integration must pass none (QRE-V1FC-05). Development and tests pass their development authorities here.
import {generateProgram as generate,evaluateProgram as evaluate,restartProgram as restart,validProgram} from './r6-index.mjs';
import {V1_SCOPE,V1_UNAVAILABLE,WITHHOLDABLE} from './r6-adaptation.mjs';
import {freeze} from './value.mjs';
import {WELLBEING_DECLARED} from './v1-f08.mjs';
export {validProgram,V1_SCOPE,V1_UNAVAILABLE,WITHHOLDABLE};
export const V1_ENGINE='COACHINGCORE-V1-1';
const refused=(status,reason,errors)=>freeze({runtimeVersion:'R6-1',mode:'SHADOW',status,action:status,reason,program:null,proposal:null,applied:false,missingInputs:[],errors});
/** SEC-V1FC-02: V1 plans from the onboarding intake (R6-INTAKE-1) and reviews its own programs (R6-PROGRAM-1) only. The replayed R5 contract and its
 * legacy programs belong to the research entry point: here they are refused with a status, before any planner runs. */
const v1Intake=i=>i?.version==='R6-INTAKE-1',v1Program=p=>p?.version==='R6-PROGRAM-1';
export const generateProgram=(input,options={})=>v1Intake(input)?generate(input,{...options,scope:V1_SCOPE}):refused('INVALID_INPUT','This version plans from the onboarding intake only',['input.version']);
export const evaluateProgram=(program,review,options={})=>v1Program(program)?evaluate(program,review,{...options,scope:V1_SCOPE}):refused('HOLD','This version reviews its own plans only; nothing is decided on another plan',['program.version']);
/** QRE-V1FC-04: a record that holds a temporary-reduction report was not kept by V1; no new plan is made over it (its reviews would all hold). */
const foreign=record=>Array.isArray(record)&&record.some(x=>x?.fact===WELLBEING_DECLARED);
export const restartProgram=(input,options={})=>!v1Intake(input?.intake)?refused('INVALID_INPUT','This version plans from the onboarding intake only',['intake.version']):foreign(input?.record)?refused('HOLD','This record holds a temporary-reduction report, which this version does not plan from: no new plan is made over it',['record.outsideV1Scope']):restart(input,{...options,scope:V1_SCOPE});
