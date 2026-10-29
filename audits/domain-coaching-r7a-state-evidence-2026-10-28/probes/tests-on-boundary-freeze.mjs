// COACHING CORE — STATE EVIDENCE MODEL: this mission's new tests on a byte-exact R7A-BOUNDARY-FINAL-FREEZE copy (boundary-freeze-source, rebuilt in a
// temporary folder with the live node_modules linked). Records the test file's SHA-256 and the node --test output in
// r7ase-tests.on-boundary-freeze.out.txt next to this file; writes nothing else. Usage: node tests-on-boundary-freeze.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const here=import.meta.dirname,root=path.resolve(here,'../../..'),snap=path.join(here,'..','boundary-freeze-source'),manifest=JSON.parse(fs.readFileSync(path.join(snap,'MANIFEST.json'),'utf8'));
const TEST='CoachingCore/test/r7ase-state-evidence.test.mjs',testSha=createHash('sha256').update(fs.readFileSync(path.join(root,TEST))).digest('hex');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7ase-tests-bf-'));
try{
 for(const [rel,digest] of Object.entries(manifest.files)){const b=fs.readFileSync(path.join(snap,rel));if(createHash('sha256').update(b).digest('hex')!==digest)throw Error('Snapshot drift: '+rel);fs.mkdirSync(path.dirname(path.join(tmp,rel)),{recursive:true});fs.writeFileSync(path.join(tmp,rel),b);}
 fs.copyFileSync(path.join(root,TEST),path.join(tmp,TEST));fs.symlinkSync(path.join(root,'CoachingCore/node_modules'),path.join(tmp,'CoachingCore/node_modules'),'junction');
 const r=spawnSync(process.execPath,['--test',TEST.replace('CoachingCore/','')],{cwd:path.join(tmp,'CoachingCore'),encoding:'utf8',maxBuffer:64*1024*1024});
 const text=`# ${TEST} on R7A-BOUNDARY-FINAL-FREEZE (${manifest.freeze.sourceDigest})\n# test file sha256 ${testSha}\n# node ${process.version}, exit ${r.status}, ${new Date().toISOString()}\n${r.stdout}`;
 fs.writeFileSync(path.join(here,'r7ase-tests.on-boundary-freeze.out.txt'),text);
 console.log(JSON.stringify({testSha256:testSha,exit:r.status,tests:r.stdout.match(/ℹ tests (\d+)/)?.[1],fail:r.stdout.match(/ℹ fail (\d+)/)?.[1]}));
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
