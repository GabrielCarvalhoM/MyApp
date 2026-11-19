// O-1 (QRE-O1-01): the mutants of the O-1 runtime, each applied to its own copy of src/r6-provenance.mjs in a new scratch extract of this tree,
// and the focal file run against it. Usage: node mutate-o1.mjs <scratch parent>. Read-only for the repository; no deletion anywhere.
import fs from 'node:fs';import path from 'node:path';import {execFileSync,spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(here,'..','..','..'),CC=path.join(ROOT,'CoachingCore'),parent=process.argv[2];
if(!parent||!fs.existsSync(parent))throw new Error('usage: node mutate-o1.mjs <existing scratch parent>');
const SRC=fs.readFileSync(path.join(CC,'src','r6-provenance.mjs'),'utf8');
const MUTANTS={
 'M1 no head-on keepVoice':["quarantined.add(identity);keepVoice(previous,o,source,activityId);","quarantined.add(identity);"],
 'M2 no speaker rule':["const mine=heldBefore?speakerOf(o.provenance):null;","const mine=null;"],
 'M3 no voicesOf fallback':["const voicesOf=holder??(heldBefore?","const voicesOf=holder??(false?"],
 'M4 keepVoice without the input hash':["row.provenance.parts[o.eventId]=partOf(o);row.provenance.inputHashes={...(row.provenance.inputHashes??{}),[o.eventId]:hash({...source,athleteId})};","row.provenance.parts[o.eventId]=partOf(o);"],
 'M5 no keepVoice on the quarantine path':["if(disputed&&(!boundTo||boundTo.identity===identity))keepVoice(disputed,o,source,activityId);",""],
 'M6 borrowed-activity guard removed':["if(disputed&&(!boundTo||boundTo.identity===identity))keepVoice","if(disputed)keepVoice"],
 'M7 keepVoice does not index the event':["byEvent.set(o.eventId,row);if(activityId&&!byActivity.has(activityId))byActivity.set(activityId,row);\n };","if(activityId&&!byActivity.has(activityId))byActivity.set(activityId,row);\n };"],
 'M8 keepVoice does not bind the activity':["byEvent.set(o.eventId,row);if(activityId&&!byActivity.has(activityId))byActivity.set(activityId,row);\n };","byEvent.set(o.eventId,row);\n };"],
 'M9 fallback for known speakers only (24ca2ae)':["const voicesOf=holder??(heldBefore?","const voicesOf=holder??(mine?"],
};
const dir=fs.mkdtempSync(path.join(parent,'o1-mutants-')),tar=path.join(dir,'tree.tar');
execFileSync('git',['archive','-o',tar,'HEAD','CoachingCore'],{cwd:ROOT});execFileSync('tar',['-xf','tree.tar'],{cwd:dir});
const X=path.join(dir,'CoachingCore');fs.mkdirSync(path.join(X,'node_modules'),{recursive:true});fs.cpSync(path.join(CC,'node_modules','ajv'),path.join(X,'node_modules','ajv'),{recursive:true});
for(const d of fs.readdirSync(path.join(CC,'node_modules')))if(!fs.existsSync(path.join(X,'node_modules',d)))fs.cpSync(path.join(CC,'node_modules',d),path.join(X,'node_modules',d),{recursive:true});
for(const f of ['v1core-o1-conflict-evidence.test.mjs'])fs.copyFileSync(path.join(CC,'test',f),path.join(X,'test',f));
const target=path.join(X,'src','r6-provenance.mjs'),run=()=>{const env={...process.env};delete env.NODE_TEST_CONTEXT;const r=spawnSync(process.execPath,['--test','--test-reporter=tap','test/v1core-o1-conflict-evidence.test.mjs'],{cwd:X,encoding:'utf8',env});
 return {pass:Number(/# pass (\d+)/.exec(r.stdout)?.[1]),fail:Number(/# fail (\d+)/.exec(r.stdout)?.[1]),failing:[...r.stdout.matchAll(/^not ok \d+ - (.*)$/gm)].map(m=>m[1].slice(0,90))};};
fs.writeFileSync(target,SRC);const control=run();console.log('control',JSON.stringify(control));
let survived=0;
for(const [name,[a,b]] of Object.entries(MUTANTS)){if(SRC.split(a).length!==2)throw new Error(name+': the mutated text, once');fs.writeFileSync(target,SRC.replace(a,b));const r=run();if(!r.fail)survived++;console.log((r.fail?'KILLED  ':'SURVIVED')+' '+name+': '+r.fail+' failing'+(r.fail?' ('+r.failing.join(' | ')+')':''));}
fs.writeFileSync(target,SRC);
console.log(`${Object.keys(MUTANTS).length-survived}/${Object.keys(MUTANTS).length} killed by the focal file alone; control ${control.pass}/${control.pass+control.fail}`);
process.exitCode=survived||control.fail?1:0;
