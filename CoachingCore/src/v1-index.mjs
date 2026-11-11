// CoachingCore V1 (Final Closure, Founder request of 2026-11-11): the V1 entry point. It is the engine the product runs (custody's default): the same
// planner, reviews and safety rules as r6-index.mjs, inside the V1 scope. The scope is applied in the runtime (r6-adaptation.mjs), never only in
// the app:
// - F08 Situation 1 (temporary reduction: windows, rungs, checks, return ladders, speeds, chains) is not offered. A "not 100%" report is still
//   screened (any warning sign routes to the clinical hold), and with every sign answered no the plan is kept with a typed unavailability.
// - A record that holds a temporary-reduction report was not kept by V1: nothing is planned over it (HOLD).
// - A clinical hold stays on the record and only the athlete's readiness declaration releases it, sport by sport (Situation 2). A new plan or an
//   omitted reference never releases it (CF-OBS-1), and a new plan never starts above the return entry after a long pause.
// - Declared breaks and their conservative return (R7-C, R7-D) are the one way a stop is read.
// The option keys below are set by this module; a caller's own value for them is overwritten.
import {generateProgram as generate,evaluateProgram as evaluate,restartProgram as restart,validProgram} from './r6-index.mjs';
import {V1_SCOPE,V1_UNAVAILABLE,WITHHOLDABLE} from './r6-adaptation.mjs';
export {validProgram,V1_SCOPE,V1_UNAVAILABLE,WITHHOLDABLE};
export const V1_ENGINE='COACHINGCORE-V1-1';
export const generateProgram=(input,options={})=>generate(input,{...options,scope:V1_SCOPE});
export const evaluateProgram=(program,review,options={})=>evaluate(program,review,{...options,scope:V1_SCOPE});
export const restartProgram=(input,options={})=>restart(input,{...options,scope:V1_SCOPE});
