// Safety Continuity & Execution Occurrence Closure (Founder mission of 2026-11-20): the successor of the O-1 preservation test
// (v1core-o1-freeze.test.mjs), which on this line names src/v1-f08.mjs and this line's added files, by design (its base, f40fbe1, is the line before
// O-1). This line's verifier: the eleven earlier freeze records are the bytes 48e428f holds, every file FREEZE-1 to -6 bind is the hash they state
// except src/r6-provenance.mjs and src/v1-f08.mjs (amended here), every sporting freeze is the base bytes, and nothing changed since 48e428f but those
// two files and the files this line adds.
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const script=path.join(path.dirname(fileURLToPath(import.meta.url)),'..','scripts','v1core-freeze-7.mjs');
test('Safety Continuity: the eleven earlier freezes are preserved; only src/r6-provenance.mjs and src/v1-f08.mjs amended since 48e428f',()=>{
 const r=spawnSync(process.execPath,[script,'--preserved'],{encoding:'utf8'});
 assert.equal(r.status,0,r.stdout+r.stderr);
 for(const s of ['FREEZE-1: 46/47 bound files byte-identical, 1 amended by this line\n','FREEZE-2: 14/15 bound files byte-identical, 1 amended by this line\n','FREEZE-3: 23/24 bound files byte-identical, 1 amended by this line\n',
  'FREEZE-4: 38/40 bound files byte-identical, 2 amended by this line\n','FREEZE-5: 59/60 bound files byte-identical, 1 amended by this line\n','FREEZE-6: 59/60 bound files byte-identical, 1 amended by this line\n'])
  assert.ok(r.stdout.includes('COACHINGCORE-V1-CORE-SAFETY-'+s),s);
 for(const s of ['COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-1: 30/30','COACHINGCORE-V1-RUN-FORMAT-FREEZE-2: 98/98','COACHINGCORE-V1-RACE-FORECAST-FREEZE-1: 163/163','COACHINGCORE-V1-STRENGTH-FREEZE-1: 121/121'])
  assert.ok(r.stdout.includes(s+' files the base bytes, 0 amended by this line'),s);
 assert.match(r.stdout,/nothing else changed since 48e428f/);
});
