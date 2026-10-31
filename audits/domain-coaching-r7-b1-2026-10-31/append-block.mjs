// R7-B.1 insert-only append (CURRENT_MISSION.md, MISSION_LEDGER.md): appends one block after the existing bytes, with LF line endings, and
// proves the previous bytes are an unchanged prefix of the result. Usage: node append-block.mjs <file relative to the repo> <block file>
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const repo=path.resolve(import.meta.dirname,'../..'),[rel,blockFile]=process.argv.slice(2);
const target=path.join(repo,rel),before=fs.readFileSync(target),block=fs.readFileSync(blockFile,'utf8').replace(/\r\n/g,'\n').replace(/\n+$/,'')+'\n';
if(!before.length||before[before.length-1]!==0x0a)throw new Error(rel+' does not end with a line feed');
const marker=block.split('\n')[0];if(before.toString('utf8').includes(marker))throw new Error('block marker already present: '+marker);
const after=Buffer.concat([before,Buffer.from('\n'+block,'utf8')]);fs.writeFileSync(target,after);
const check=fs.readFileSync(target);if(!check.subarray(0,before.length).equals(before))throw new Error('prefix changed');
const sha=b=>createHash('sha256').update(b).digest('hex');
console.log(JSON.stringify({file:rel,beforeBytes:before.length,afterBytes:check.length,prefixSha256:sha(before),afterSha256:sha(check),marker}));
