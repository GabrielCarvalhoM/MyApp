// C-F01-1 r2 (Founder mission of 2026-11-18): the successor of CORE-C2-F01's preservation test (v1core-c2f01-freeze.test.mjs), which on this
// line names this line's files as undeclared, by design (its base, d92aa88, is the line before CORE-C2-F01). This line's verifier: the seven
// earlier freeze records are the bytes 4b6e1ea holds, every file FREEZE-1 and FREEZE-2 bind is the hash they state except the one amended file,
// and nothing changed since 4b6e1ea but that file and the files this line adds.
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const script=path.join(path.dirname(fileURLToPath(import.meta.url)),'..','scripts','v1core-freeze-3.mjs');
test('C-F01-1 r2: the seven earlier freezes are preserved; FREEZE-1 47/47, FREEZE-2 all but src/v1-f08.mjs; only that file amended since 4b6e1ea',()=>{
 const r=spawnSync(process.execPath,[script,'--preserved'],{encoding:'utf8'});
 assert.equal(r.status,0,r.stdout+r.stderr);
 assert.match(r.stdout,/COACHINGCORE-V1-CORE-SAFETY-FREEZE-1: 47\/47 bound files byte-identical, 0 amended/);
 assert.match(r.stdout,/COACHINGCORE-V1-CORE-SAFETY-FREEZE-2: 14\/15 bound files byte-identical, 1 amended by this line/);
 assert.match(r.stdout,/COACHINGCORE-V1-FREEZE-1: \d+\/\d+ files the base bytes, 1 amended by this line/);
});
