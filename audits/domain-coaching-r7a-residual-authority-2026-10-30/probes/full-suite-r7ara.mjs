// Author probe (R7-A RESIDUAL AUTHORITY, Founder request §27): the full CoachingCore suite once, on the live tree, as one recorded run of the
// evidence round. Prints the totals and every failing test as JSON; writes nothing.
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const cc=path.resolve(import.meta.dirname,'../../../CoachingCore');
const r=spawnSync(process.execPath,['--test','--test-reporter=tap'],{cwd:cc,encoding:'utf8',maxBuffer:512*1024*1024});
const n=k=>Number(r.stdout.match(new RegExp('^# '+k+' (\\d+)','m'))?.[1]??NaN),failing=[...r.stdout.matchAll(/^\s*not ok \d+ - (.+)$/gm)].map(m=>m[1].trim()).filter(x=>!/\.test\.mjs$/.test(x));
console.log(JSON.stringify({probe:'full-suite-r7ara',node:process.version,exit:r.status,tests:n('tests'),pass:n('pass'),fail:n('fail'),failing},null,1));
process.exitCode=r.status===0&&n('fail')===0?0:1;
