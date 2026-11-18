// V1 Core Safety & Lifecycle closure-2: this line's own proof that the earlier freezes are preserved (the successor of the three historical
// preservation tests that name a file this line amends: v1rc-calibration "V1RC COACHINGCORE-V1-FREEZE-1 is preserved", v1rws-engine "I10, V6"
// and v1str-freeze "the four earlier freezes are preserved"; each stays unedited and green on its own snapshot). The verifier reads the base
// from git: in a copy that is not a git checkout this test is skipped, never passed.
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const CC=fileURLToPath(new URL('..',import.meta.url));
test('the five earlier freezes are preserved on this line; the files it amends are declared and nothing else changed since the base', t=>{
 const git=spawnSync('git',['rev-parse','--is-inside-work-tree'],{cwd:CC,encoding:'utf8'});
 if(git.status!==0||String(git.stdout).trim()!=='true'){t.skip('not a git checkout: the verifier reads the base from git');return;}
 const r=spawnSync(process.execPath,['scripts/v1core-freeze.mjs','--preserved'],{cwd:CC,encoding:'utf8'}),out=String(r.stdout)+String(r.stderr);
 assert.equal(r.status,0,out);
 for(const line of ['COACHINGCORE-V1-FREEZE-1: 190/198 files the base bytes, 8 amended by this line','COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-1: 30/30 files the base bytes',
  'COACHINGCORE-V1-RUN-FORMAT-FREEZE-2: 97/98 files the base bytes, 1 amended by this line','COACHINGCORE-V1-RACE-FORECAST-FREEZE-1: 163/163 files the base bytes',
  'COACHINGCORE-V1-STRENGTH-FREEZE-1: 121/121 files the base bytes','nothing else changed since 16577b6','no untracked file in src, v1, test or scripts'])assert.ok(out.includes(line),`missing: ${line}\n${out}`);
 assert.ok(!/NOT |UNTRACKED|CHANGED/.test(out),out);
});
