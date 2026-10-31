// Runs a recheck probe against the runtime bytes of another commit (read-only): `git archive <commit>` of the runtime paths into the OS temp
// directory, then `node <probe> <tempRoot> <label>`; the temp tree is removed afterwards. Usage: node at-commit.mjs <commit> <probe.mjs> <label>
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),REPO=path.resolve(HERE,'../../../../..');
const [commit,probe,label]=process.argv.slice(2);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7b1-eng-judge-')),tar=path.join(tmp,'t.tar'),root=path.join(tmp,'root');fs.mkdirSync(root);
try{
 const paths=['CoachingCore/src','CoachingCore/r5','CoachingCore/r6','CoachingCore/r7/b0','CoachingCore/r7/b/fixtures','audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json'];
 const ar=spawnSync('git',['archive','--format=tar','-o',tar,commit,...paths],{cwd:REPO,encoding:'utf8'});if(ar.status!==0)throw new Error(ar.stderr);
 const tx=spawnSync('tar',['-xf',path.relative(root,tar).replace(/\\/g,'/')],{cwd:root,encoding:'utf8'});if(tx.status!==0)throw new Error(tx.stderr);
 const r=spawnSync(process.execPath,[path.join(HERE,probe),root,label],{cwd:HERE,encoding:'utf8'});
 process.stdout.write(r.stdout);process.stderr.write(r.stderr);
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
