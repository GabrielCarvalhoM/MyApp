// R7-C Phase 4, step G: the full CoachingCore suite on HEAD (node --test in CoachingCore), recorded with the commit, the counts and every failing
// test with its first message. Read-only (the suite writes nothing); prints JSON.
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {REPO} from './phase3-lib.mjs';
const head=spawnSync('git',['rev-parse','HEAD'],{cwd:REPO,encoding:'utf8'}).stdout.trim();
const clean=spawnSync('git',['status','--porcelain','--','CoachingCore/src','CoachingCore/test'],{cwd:REPO,encoding:'utf8'}).stdout.trim()==='';
const started=new Date().toISOString(),r=spawnSync(process.execPath,['--test'],{cwd:path.join(REPO,'CoachingCore'),encoding:'utf8',maxBuffer:1<<28}),ended=new Date().toISOString();
const n=k=>Number(r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);
const tail=r.stdout.split('✖ failing tests:')[1]??'',failures=[...tail.matchAll(/^✖ (.+?) \([\d.]+ms\)\n\s+(.+)$/gm)].map(m=>({title:m[1],first:m[2].trim()}));
console.log(JSON.stringify({check:'R7C-P4-FULL-SUITE',command:'node --test (in CoachingCore)',node:process.version,commit:head,srcAndTestClean:clean,started,ended,tests:n('tests'),pass:n('pass'),fail:n('fail'),cancelled:n('cancelled'),skipped:n('skipped'),todo:n('todo'),durationMs:n('duration_ms'),failures},null,1));
