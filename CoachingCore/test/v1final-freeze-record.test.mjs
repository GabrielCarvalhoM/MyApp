// REPMILE CoachingCore V1 final physical validation: the successor of the RC-1 record test (v1bc-rc-record.test.mjs). On this line the RC-1
// verifier names the two declared amendments, by design. This test checks the final record: RC-1's other files byte-identical, nothing else
// changed since 89796df, the bundle linked from the bound sources, and REPMILE-COACHINGCORE-V1-FINAL-RELEASE-FREEZE holds.
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const script=path.join(path.dirname(fileURLToPath(import.meta.url)),'..','scripts','v1-final-release-freeze.mjs');
test('REPMILE-COACHINGCORE-V1-FINAL-RELEASE-FREEZE: RC-1 preserved but for the two declared amendments; nothing else changed since 89796df; the bundle is the bound sources; the record holds',()=>{
 const r=spawnSync(process.execPath,[script,'--check'],{encoding:'utf8'});
 assert.equal(r.status,0,r.stdout+r.stderr);
 assert.match(r.stdout,/REPMILE-COACHINGCORE-V1-RC-1: 85\/85 of its other bound files byte-identical; 2 declared amendments/);
 assert.match(r.stdout,/nothing else changed in CoachingCore since 89796df/);
 assert.match(r.stdout,/CoachingCore modules equal to the bound sources, 16 assets equal to the bound data files/);
 assert.match(r.stdout,/REPMILE-COACHINGCORE-V1-FINAL-RELEASE-FREEZE: 87\/87 consumed files byte-identical/);
});
