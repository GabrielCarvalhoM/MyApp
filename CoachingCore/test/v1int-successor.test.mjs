// V1 CoachingCore Integration Boundary: the successor of the FREEZE-7 preservation test (v1core-sc-freeze.test.mjs), which on this line names
// src/boundary/custody.mjs (bound by COACHINGCORE-V1-FREEZE-1) and this line's added files, by design. This line's verifier: FREEZE-7's 49 bound
// files are byte-identical, custody.mjs is the one declared amendment, nothing else changed in CoachingCore, and V1INT-BOUNDARY-SUCCESSOR-1 holds.
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const script=path.join(path.dirname(fileURLToPath(import.meta.url)),'..','scripts','v1int-boundary-1.mjs');
test('V1INT-BOUNDARY-SUCCESSOR-1: FREEZE-7 preserved (49/49 bound files); only src/boundary/custody.mjs amended since e44d855; the record holds',()=>{
 const r=spawnSync(process.execPath,[script,'--check'],{encoding:'utf8'});
 assert.equal(r.status,0,r.stdout+r.stderr);
 assert.ok(r.stdout.includes('COACHINGCORE-V1-CORE-SAFETY-FREEZE-7: 49/49 bound files byte-identical'));
 assert.match(r.stdout,/CoachingCore\/src\/boundary\/custody\.mjs: amended/);
 assert.match(r.stdout,/nothing else changed in CoachingCore since e44d855/);
});
