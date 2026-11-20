// Safety Continuity & Execution Occurrence (Founder mission of 2026-11-20): successors of the frozen assertions this line moves by design
// (audits/v1-core-sc-2026-11-20/SUCCESSOR_LEDGER.json). Each frozen file is unedited: its test is run from a temporary copy with only the
// substitutions listed here, each matched exactly once (the mechanism of v1core-o1-successors.test.mjs). Synthetic athletes only.
// Every move is C-O1-2 (SSCTR_O1_R1 decision A): a head-on dispute keeps every voice since O-1, so when each well-formed voice says the session
// took place it is an occurrence for the restart pause and the last executed day, as a correction in conflict already was (C-F01-1 r2 (ii)); its
// amount still counts for nothing (C-Q08-1). A flag with one voice, a malformed voice, a "not done" voice or an integrity flag shows no occurrence.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {spawnSync} from 'node:child_process';import {fileURLToPath,pathToFileURL} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
/** Runs `pattern` of the frozen `file` with `subs` ([old,new], each found once) and asserts `passes` passing tests and none failing. */
function successor(file,subs,pattern,passes){
 let body=fs.readFileSync(path.join(here,file),'utf8');
 for(const [a,b] of subs){assert.equal(body.split(a).length,2,file+': the frozen text, once: '+a.slice(0,80));body=body.replace(a,b);}
 body=body.replaceAll("from './","from '"+pathToFileURL(here).href+'/').replaceAll("from '../","from '"+pathToFileURL(path.dirname(here)).href+'/');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sc-successor-')),copy=path.join(dir,'successor.test.mjs');fs.writeFileSync(copy,body);
 const env={...process.env};delete env.NODE_TEST_CONTEXT;
 const r=spawnSync(process.execPath,['--test','--test-name-pattern='+pattern,copy],{encoding:'utf8',env,cwd:path.dirname(here)});
 fs.unlinkSync(copy);fs.rmdirSync(dir);
 assert.equal(r.status,0,(r.stdout+r.stderr).slice(-3000));
 assert.match(r.stdout,new RegExp('ℹ pass '+passes+'\\b'));assert.match(r.stdout,/ℹ fail 0\b/);
}

test('successor of v1core-o1-conflict-evidence.test.mjs:146 (C-O1-2): a kept voice is never dose; the head-on dispute whose voices both say it took place is an occurrence for the pause',()=>{
 successor('v1core-o1-conflict-evidence.test.mjs',[[
  " // The pause reads the same as on FREEZE-5 (a direct conflict is not an occurrence), so it errs long, never short.\n assert.deepEqual(pause(l2),pause(rec(N([DEVICE({actual:{completed:true,minutes:40}})],T1)).map(o=>({...o,conflicted:true,provenance:{...o.provenance,conflict:'CONFLICTING_PHYSICAL_OR_RESPONSE_REPORTS'}}))));",
  " // C-O1-2: both voices say the run took place: the pause reads it as the run alone would; a flagged row of one voice still shows none.\n const clean=rec(N([DEVICE({actual:{completed:true,minutes:40}})],T1)),single=clean.map(o=>({...o,conflicted:true,provenance:{...o.provenance,conflict:'CONFLICTING_PHYSICAL_OR_RESPONSE_REPORTS'}}));\n assert.deepEqual(pause(l2),pause(clean));\n assert.notDeepEqual(pause(single),pause(clean));"]],
 'O-1: a kept voice is never dose',1);
});
test('successor of v1core-cf011r2-restart-evidence.test.mjs:108 (A12, C-O1-2): a direct conflict now keeps both voices; both say done: an occurrence, the exposure still bounded at zero',()=>{
 successor('v1core-cf011r2-restart-evidence.test.mjs',[[
  " assert.deepEqual([r.recent,r.pause,r.lastExecuted],[ZERO,null,null]);",
  " assert.deepEqual([r.recent,r.lastExecuted,r.pause?.bySportDays?.RUN],[ZERO,shift(DAY,-3),3],'C-O1-2');"]],
 'A12: the information to resolve',1);
});
test('successor of v1core-cf011r2-restart-evidence.test.mjs:139 (B4-B5, C-O1-2): a "not done" voice is still no execution; a direct conflict whose voices both say done is one',()=>{
 successor('v1core-cf011r2-restart-evidence.test.mjs',[[
  " assert.equal(read([...direct(3),run(13,50)]).pause?.bySportDays?.RUN,13);",
  " assert.deepEqual([read([...direct(3),run(13,50)]).pause?.bySportDays?.RUN,read([...direct(3),run(13,50)]).recent],[3,read([run(13,50)]).recent],'C-O1-2: an occurrence, its 50 or 20 minutes never counted');"]],
 'B4-B5: occurrence itself disputed',1);
});
test('successor of v1core-cf011r2-restart-evidence.test.mjs:151 (B7, C-O1-2): one voice or a malformed one still shows no execution; a head-on flag with two well-formed "done" voices does; an integrity flag does not',()=>{
 successor('v1core-cf011r2-restart-evidence.test.mjs',[[
  " assert.equal(read([other]).lastExecuted,null,'another kind of conflict: occurrence not shown');",
  " assert.deepEqual([read([other]).lastExecuted,read([other]).recent],[shift(DAY,-3),ZERO],'C-O1-2: a head-on dispute, both voices done: an occurrence, its amount not counted');\n for(const conflict of ['EVENT_ID_REUSED_WITH_DIFFERENT_FACTS','ACTIVITY_BOUND_TO_TWO_SESSIONS',undefined])assert.equal(read([{...other,provenance:{...other.provenance,conflict}}]).lastExecuted,null,'an integrity flag, or none named: occurrence not shown ('+conflict+')');"]],
 'B7: what a row must show',1);
});
