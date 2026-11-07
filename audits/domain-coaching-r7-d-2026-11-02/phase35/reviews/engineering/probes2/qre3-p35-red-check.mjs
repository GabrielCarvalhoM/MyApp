// QRE R7-D Phase 3.5 recheck (QRE-R7D-PHASE35-CHECK-r2, Q1): why T36 is RED on 8e78b8a. On 8e78b8a T36 fails with a TypeError in its `stops` helper
// (the duplicate's return carries no separateBreaks). This probe makes lean copies of a rebuild (8e78b8a with the candidate's test file) in NEW
// directories, applies scratch-only edits to T36 (never to the repository's test), and runs r7d-phase35.test.mjs alone, to show which assertion of each
// T36 shape fails there and with what message:
//   V1: `stops` tolerates a missing separateBreaks (the first assertion then fails on its own message);
//   V2: V1 without (a)'s stops assertion (the view assertion of the QH17 shape);
//   V3: V1 without shape (a) (the QH18 shape's view assertion);
//   V4: V1 with only the controls (each control must pass on 8e78b8a: they pin paths 8e78b8a already had).
//   node qre3-p35-red-check.mjs --root <rebuild> --work <new dir> [--out <file>]
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const root=arg('--root'),work=arg('--work'),outFile=arg('--out');
if(!root||!work)throw Error('--root --work');if(fs.existsSync(work))throw Error('--work must be a new directory');
const LEAN=['CoachingCore/src','CoachingCore/test/r7d-phase35.test.mjs','CoachingCore/r7','CoachingCore/r6/fixtures','CoachingCore/r6/PROGRAM_POLICY_R6.json','CoachingCore/r5/PROGRAM_POLICY_R5.json','CoachingCore/r4/PRESCRIPTION_ENVELOPE_REGISTRY.json','CoachingCore/r3/BOUNDED_POLICY_CANDIDATES_R3.json','CoachingCore/package.json','CoachingCore/POLICY_REGISTRY_RUNTIME_BINDINGS.json','CoachingCore/SHADOW_DECISION_SCHEMA.json','CoachingCore/SHADOW_INPUT_SCHEMA.json','CoachingCore/node_modules',
 // the five review records the program generator checks the bound repertoire against
 'audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json','audits/domain-closure-r3-2026-10-24/reviews/ssctr-records.json','audits/domain-closure-r4-2026-10-25/reviews/ssctr-envelope-review.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'];
const T='CoachingCore/test/r7d-phase35.test.mjs';
const tolerant=['const stops=d=>d.separateBreaks.map(b=>b.stop);','const stops=d=>(d.separateBreaks??[]).map(b=>b.stop);'];
const stopsA=["assert.deepEqual(stops(lastReturn(u.t.p)),['OWN_RETURN','LATEST'],'8e78b8a re-established the trip alone (separateBreaks dropped)');",''];
const shapeA=[" const u=founders('t36u'),n=founders('t36n');const ru=send(u,'t36u',false),rn=send(n,'t36n',true);\n assert.equal(ru.action,'REESTABLISH',ru.reason);assert.equal(rn.action,'REESTABLISH',rn.reason);\n assert.deepEqual(stops(lastReturn(u.t.p)),['OWN_RETURN','LATEST'],'8e78b8a re-established the trip alone (separateBreaks dropped)');\n assert.deepEqual(view(u.t,6),view(n.t,6),'the unnamed re-send equals the named one (8e78b8a: back-squat 2x8@85 against 1x7 ESTABLISH)');\n",''];
const shapeB=[" const fu=flow('t36fu',false),fn=flow('t36fn',true);\n assert.equal(fu.c.action,'REESTABLISH',fu.c.reason);assert.deepEqual(view(fu.x.t,6),view(fn.x.t,6),'8e78b8a confirmed the trip alone (3x10 at week 8)');\n noLaterAsk(fu.x.t,'confirmation by the same dates');\n",''];
const ctlTA=[" const ut=founders('t36t',{report:all});send(ut,'t36t',false);assert.deepEqual(stops(lastReturn(ut.t.p)),['TRAINING_AFTER','LATEST']);\n",''];
//   V5: V4 without the TRAINING_AFTER control (the single-break duplicate and the continuity controls alone).
const VARIANTS={V1:[tolerant],V2:[tolerant,stopsA],V3:[tolerant,shapeA],V4:[tolerant,shapeA,shapeB],V5:[tolerant,shapeA,shapeB,ctlTA]};
const results=[];
for(const [id,edits] of Object.entries(VARIANTS)){
 const dir=path.join(work,id);for(const p of LEAN){const s=path.join(root,p);if(!fs.existsSync(s))continue;const d=path.join(dir,p);fs.mkdirSync(path.dirname(d),{recursive:true});fs.cpSync(s,d,{recursive:true});}
 const f=path.join(dir,T);let src=fs.readFileSync(f,'utf8');const applied=[];
 for(const [a,b] of edits){const n=src.split(a).length-1;applied.push(n);if(n===1)src=src.replace(a,b);}
 fs.writeFileSync(f,src);
 const r=spawnSync(process.execPath,['--test','--test-name-pattern=T36','test/r7d-phase35.test.mjs'],{cwd:path.join(dir,'CoachingCore'),encoding:'utf8',maxBuffer:1<<26});
 const msg=(r.stdout.match(/^ {2}(AssertionError[^\n]*|TypeError[^\n]*)\n((?: {4,}.*\n){0,12})/m)??[])[0]??null;
 results.push({variant:id,editsApplied:applied,pass:Number(r.stdout.match(/ℹ pass (\d+)/)?.[1]??NaN),fail:Number(r.stdout.match(/ℹ fail (\d+)/)?.[1]??NaN),failure:msg?msg.split('\n').slice(0,10).map(s=>s.trim()).filter(Boolean):null});
}
const text=JSON.stringify({probe:'QRE3-P35-RED-CHECK-1',root,work,results},null,1);
if(outFile)fs.writeFileSync(outFile,text+'\n');console.log(text);
