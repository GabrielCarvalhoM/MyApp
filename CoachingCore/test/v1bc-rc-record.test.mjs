// REPMILE V1 CoachingCore blocker closure: the successor of the V1INT boundary-record test (v1int-successor.test.mjs) and, through it, of the
// FREEZE-7 preservation test. On this line both name the seven declared amendments, by design. This line's verifier checks the rest:
// - FREEZE-7's and V1INT's other files are byte-identical;
// - nothing else changed since ee256ae;
// - REPMILE-COACHINGCORE-V1-RC-1 holds.
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const script=path.join(path.dirname(fileURLToPath(import.meta.url)),'..','scripts','v1-rc-1.mjs');
test('REPMILE-COACHINGCORE-V1-RC-1: FREEZE-7 and V1INT preserved but for the seven declared amendments; nothing else changed since ee256ae; the record holds',()=>{
 const r=spawnSync(process.execPath,[script,'--check'],{encoding:'utf8'});
 assert.equal(r.status,0,r.stdout+r.stderr);
 assert.match(r.stdout,/COACHINGCORE-V1-CORE-SAFETY-FREEZE-7: 47\/47 of its other bound files byte-identical; 2 declared amendments/);
 assert.match(r.stdout,/V1INT-BOUNDARY-SUCCESSOR-1: \d+\/\d+ of its other files byte-identical; 3 declared amendments/);
 assert.match(r.stdout,/nothing else changed in CoachingCore since ee256ae/);
 assert.match(r.stdout,/REPMILE-COACHINGCORE-V1-RC-1: \d+\/\d+ consumed files byte-identical/);
});
