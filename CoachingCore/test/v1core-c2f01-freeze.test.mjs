// CORE-C2-F01 (Founder mission of 2026-11-18): the successor of closure-2's preservation test (v1core-freeze.test.mjs), which on this line
// names src/v1-f08.mjs as amended, by design (its base, 16577b6, is the line before closure-2). This line's verifier: the six earlier freeze
// records are the bytes d92aa88 holds, every file COACHINGCORE-V1-CORE-SAFETY-FREEZE-1 binds is the hash it states, and nothing changed since
// d92aa88 but the one amended file and the files this line adds.
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const script=path.join(path.dirname(fileURLToPath(import.meta.url)),'..','scripts','v1core-freeze-2.mjs');
test('CORE-C2-F01: the six earlier freezes are preserved; FREEZE-1 binds 47/47 files unchanged; only src/v1-f08.mjs is amended since d92aa88',()=>{
 const r=spawnSync(process.execPath,[script,'--preserved'],{encoding:'utf8'});
 assert.equal(r.status,0,r.stdout+r.stderr);
 assert.match(r.stdout,/COACHINGCORE-V1-CORE-SAFETY-FREEZE-1: 47\/47 bound files byte-identical/);
 assert.match(r.stdout,/COACHINGCORE-V1-FREEZE-1: \d+\/\d+ files the base bytes, 1 amended by this line/);
});
