// SEC-R2-03 + SEC-R2-04 (Founder mission of 2026-11-19): the successor of C-F01-1 r2's preservation test (v1core-cf011r2-freeze.test.mjs), which
// on this line names this line's files as undeclared, by design (its base, 4b6e1ea, is the line before C-F01-1 r2). This line's verifier: the
// eight earlier freeze records are the bytes a6e10d0 holds, every file FREEZE-1, -2 and -3 bind is the hash they state except the two amended
// files, and nothing changed since a6e10d0 but those files and the files this line adds.
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const script=path.join(path.dirname(fileURLToPath(import.meta.url)),'..','scripts','v1core-freeze-4.mjs');
test('SEC-R2-03/-04: the eight earlier freezes are preserved; only src/r6-provenance.mjs and src/v1-f08.mjs amended since a6e10d0',()=>{
 const r=spawnSync(process.execPath,[script,'--preserved'],{encoding:'utf8'});
 assert.equal(r.status,0,r.stdout+r.stderr);
 assert.match(r.stdout,/COACHINGCORE-V1-CORE-SAFETY-FREEZE-1: 46\/47 bound files byte-identical, 1 amended by this line/);
 assert.match(r.stdout,/COACHINGCORE-V1-CORE-SAFETY-FREEZE-2: 14\/15 bound files byte-identical, 1 amended by this line/);
 assert.match(r.stdout,/COACHINGCORE-V1-CORE-SAFETY-FREEZE-3: 23\/24 bound files byte-identical, 1 amended by this line/);
 assert.match(r.stdout,/nothing else changed since a6e10d0/);
});
