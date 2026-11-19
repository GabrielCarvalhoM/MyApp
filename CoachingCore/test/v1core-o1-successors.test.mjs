// O-1 Conflict Evidence (Founder mission of 2026-11-19): successors of the frozen assertions this line moves by design (SSCTR_O1_R1 C-O1-1;
// audits/v1-core-o1-2026-11-19/SUCCESSOR_LEDGER.json). Each frozen file is unedited: its test is run from a temporary copy with only the
// substitutions listed here, each matched exactly once. Synthetic athletes only.
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
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'o1-successor-')),copy=path.join(dir,'successor.test.mjs');fs.writeFileSync(copy,body);
 const env={...process.env};delete env.NODE_TEST_CONTEXT;
 const r=spawnSync(process.execPath,['--test','--test-name-pattern='+pattern,copy],{encoding:'utf8',env,cwd:path.dirname(here)});
 fs.unlinkSync(copy);fs.rmdirSync(dir);
 assert.equal(r.status,0,(r.stdout+r.stderr).slice(-3000));
 assert.match(r.stdout,new RegExp('ℹ pass '+passes+'\\b'));assert.match(r.stdout,/ℹ fail 0\b/);
}

test('successor of v1core-ncc-normalization-consistency.test.mjs:101 (F1): the refused late report is a kept voice of the carried row, so its re-send is a replay; still never admitted',()=>{
 successor('v1core-ncc-normalization-consistency.test.mjs',[[
  "assert.deepEqual(again.excluded.map(e=>e.reason),['IDENTITY_QUARANTINED_BY_CONFLICT'],'by the quarantine the carried conflict keeps (F3)');",
  "assert.deepEqual([again.excluded.map(e=>e.reason),again.duplicates.map(d=>d.eventId+':'+d.reason)],[[],['W:EXACT_REPLAY']],'O-1: a replay of the kept voice; nothing moves');"]],
 'F1: the record rebuilt again and again',1);
});
test('successor of v1core-ncc-normalization-consistency.test.mjs:162-163 (F3): a later plain report of the disputed session is still refused by the quarantine and never merged; it is kept as a voice',()=>{
 successor('v1core-ncc-normalization-consistency.test.mjs',[[
  " assert.deepEqual(held(n).live,held(reread(l2)).live);\n});\ntest('F3: a valid correction resolves",
  " assert.deepEqual(held(n).live.map(o=>({...o,parts:o.parts.filter(p=>p!=='P')})),held(reread(l2)).live,'O-1: the amounts, flags and other voices as before');\n assert.ok(held(n).live.some(o=>o.conflicted&&o.parts.includes('P')),'O-1: P is a voice of the flagged row, never merged');\n});\ntest('F3: a valid correction resolves"]],
 'F3: a later agreeing plain report',1);
});
test('successor of v1core-successor-lineage.test.mjs:205 (NCC successor, scenario 21; O-1 row 19): the matrix passes whole in both families, row 19 reading as rows 08/10',()=>{
 // NCC: scenario 21's EASY expectation is the LONG one. O-1: in row 19 the import's refused report is a kept voice, and the app's correction to the
 // whole agrees with it and merges it: the row reads exactly as the same statements with no correction (row 10), as row 08 already did.
 // Scenario 21 itself now stays CONFLICTED (SSCTR-NCC-01), which this matrix does not read: v1core-o1-conflict-evidence.test.mjs reads it.
 successor('v1core-successor-lineage.test.mjs',[
  ["NOT_CARRIED,{EASY:['app-stop','dev-x','dev-x-v2'],LONG:['app-stop','dev-x-v2']},{EASY:null,LONG:'whole'}]","NOT_CARRIED,['app-stop','dev-x-v2'],'whole']"],
  [" [mkey('08 '),mkey('10 ')],"," [mkey('08 '),mkey('10 ')],[mkey('19 '),mkey('10 ')],"]],
 'SUCCESSOR closure-2 · lineage matrix',2);
});
test('successor of v1core-successor-fix-forward.test.mjs:105 (SSCTR-RWS-B-01): the device measured 30 min, the athlete corrects to 100: the dispute stays in every order and named id; the symptom is not unsaid, the screen as before',()=>{
 successor('v1core-successor-fix-forward.test.mjs',[[
  "[1,'app-fix',false,null,",
  "[1,'app-fix',true,null,"]],
 'SUCCESSOR closure-2 · SSCTR-RWS-B-01',1);
});
