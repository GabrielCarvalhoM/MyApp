// O-1 Conflict Evidence & Safety Policy Closure (Founder mission of 2026-11-19): the successor of the NCC preservation test
// (v1core-ncc-freeze.test.mjs), which on this line names src/r6-provenance.mjs as amended since FREEZE-5 and this line's added files as undeclared,
// by design (its base, e704180, is the line before NCC). This line's verifier: the ten earlier freeze records are the bytes f40fbe1 holds, every file
// FREEZE-1 to -5 bind is the hash they state except src/r6-provenance.mjs (amended here) and src/v1-f08.mjs (amended by FREEZE-4, at its bytes),
// every sporting freeze is the base bytes, and nothing changed since f40fbe1 but that file and the files this line adds.
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const script=path.join(path.dirname(fileURLToPath(import.meta.url)),'..','scripts','v1core-freeze-6.mjs');
test('O-1: the ten earlier freezes are preserved; only src/r6-provenance.mjs amended since f40fbe1',()=>{
 const r=spawnSync(process.execPath,[script,'--preserved'],{encoding:'utf8'});
 assert.equal(r.status,0,r.stdout+r.stderr);
 assert.match(r.stdout,/COACHINGCORE-V1-CORE-SAFETY-FREEZE-1: 46\/47 bound files byte-identical, 1 amended by this line\n/);
 assert.match(r.stdout,/COACHINGCORE-V1-CORE-SAFETY-FREEZE-2: 14\/15 bound files byte-identical, 0 amended by this line, 1 amended by FREEZE-4 \(its bytes\)/);
 assert.match(r.stdout,/COACHINGCORE-V1-CORE-SAFETY-FREEZE-3: 23\/24 bound files byte-identical, 0 amended by this line, 1 amended by FREEZE-4 \(its bytes\)/);
 assert.match(r.stdout,/COACHINGCORE-V1-CORE-SAFETY-FREEZE-4: 39\/40 bound files byte-identical, 1 amended by this line\n/);
 assert.match(r.stdout,/COACHINGCORE-V1-CORE-SAFETY-FREEZE-5: 59\/60 bound files byte-identical, 1 amended by this line\n/);
 for(const s of ['COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-1: 30/30','COACHINGCORE-V1-RUN-FORMAT-FREEZE-2: 98/98','COACHINGCORE-V1-RACE-FORECAST-FREEZE-1: 163/163','COACHINGCORE-V1-STRENGTH-FREEZE-1: 121/121'])
  assert.ok(r.stdout.includes(s+' files the base bytes, 0 amended by this line'),s);
 assert.match(r.stdout,/nothing else changed since f40fbe1/);
});
