// Normalization Consistency Closure (Founder mission of 2026-11-19): the successor of SEC-R2-03 + SEC-R2-04's preservation test
// (v1core-secr2-freeze.test.mjs), which on this line names this line's files as undeclared, by design (its base, a6e10d0, is the line before
// SEC-R2). This line's verifier: the nine earlier freeze records are the bytes e704180 holds, every file FREEZE-1 to -4 bind is the hash they state
// except src/r6-provenance.mjs (amended here) and src/v1-f08.mjs (amended by FREEZE-4, at its bytes), and nothing changed since e704180 but that
// file and the files this line adds.
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const script=path.join(path.dirname(fileURLToPath(import.meta.url)),'..','scripts','v1core-freeze-5.mjs');
test('F1/F2/F3: the nine earlier freezes are preserved; only src/r6-provenance.mjs amended since e704180',()=>{
 const r=spawnSync(process.execPath,[script,'--preserved'],{encoding:'utf8'});
 assert.equal(r.status,0,r.stdout+r.stderr);
 assert.match(r.stdout,/COACHINGCORE-V1-CORE-SAFETY-FREEZE-1: 46\/47 bound files byte-identical, 1 amended by this line\n/);
 assert.match(r.stdout,/COACHINGCORE-V1-CORE-SAFETY-FREEZE-2: 14\/15 bound files byte-identical, 0 amended by this line, 1 amended by FREEZE-4 \(its bytes\)/);
 assert.match(r.stdout,/COACHINGCORE-V1-CORE-SAFETY-FREEZE-3: 23\/24 bound files byte-identical, 0 amended by this line, 1 amended by FREEZE-4 \(its bytes\)/);
 assert.match(r.stdout,/COACHINGCORE-V1-CORE-SAFETY-FREEZE-4: 39\/40 bound files byte-identical, 1 amended by this line\n/);
 assert.match(r.stdout,/nothing else changed since e704180/);
});
