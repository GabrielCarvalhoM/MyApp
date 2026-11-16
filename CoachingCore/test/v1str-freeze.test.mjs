// V1 Strength Extension: this line's own proof that the earlier freezes are preserved, kept inside the suite (QRE-STR-A-12). The historical test
// that carried these checks (`I10, V6` of v1rws-engine.test.mjs) names the file this extension amends and stops at its first assertion on
// this line; it is not edited and stays green on its own snapshot. What it checked, and what this extension adds, is checked here by this
// line's own verifier: the four earlier freeze records are the pinned bytes, every file they bind is byte-identical, src/r6-adaptation.mjs is
// the bytes COACHINGCORE-V1-RUN-FORMAT-FREEZE-2 authorized, src/r7b-repertoire.mjs is the authorized bytes with the authorized diff from the
// recorded base, and nothing else changed.
// The verifier reads the base from git: in a copy that is not a git checkout this test is skipped, never passed.
// A mutation run of the amended file leaves this file out: any changed byte fails it, which says nothing about behaviour.
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const CC=fileURLToPath(new URL('..',import.meta.url));
test('the four earlier freezes are preserved on this line, and the one amended file is the authorized bytes and diff', t=>{
 const git=spawnSync('git',['rev-parse','--is-inside-work-tree'],{cwd:CC,encoding:'utf8'});
 if(git.status!==0||String(git.stdout).trim()!=='true'){t.skip('not a git checkout: the verifier reads the recorded base from git');return;}
 const r=spawnSync(process.execPath,['scripts/v1str-freeze.mjs','--preserved'],{cwd:CC,encoding:'utf8'}),out=String(r.stdout)+String(r.stderr);
 assert.equal(r.status,0,out);
 for(const line of ['COACHINGCORE-V1-FREEZE-1: 196/196 files byte-identical (2 amended)','COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-1: 30/30 files byte-identical','COACHINGCORE-V1-RUN-FORMAT-FREEZE-2: 98/98 files byte-identical','COACHINGCORE-V1-RACE-FORECAST-FREEZE-1: 163/163 files byte-identical',
  'CoachingCore/src/r6-adaptation.mjs: the bytes COACHINGCORE-V1-RUN-FORMAT-FREEZE-2 authorized','its base is the recorded bytes; it is the authorized bytes; its diff is the authorized one','nothing else changed since 4f0561b'])assert.ok(out.includes(line),`missing: ${line}\n${out}`);
 assert.ok(!/NOT |UNTRACKED|CHANGED/.test(out),out);
});
