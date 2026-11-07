// QRE R7-D Phase 3.5 recheck (QRE-R7D-PHASE35-CHECK-r2, Q3): a scratch prototype of the smallest fix for QRE3-P35-02 (not the fix of record; the
// instrument owner makes the change). P17's sameBreakNamed compares names literally, so an answer that names the earlier break by its report's event
// id does not end the window of a report that named it by its episodeId (or the reverse). The prototype resolves both names through the separate-break
// row the restatement names (its episode or the event id of its report). Copies the harness folder of a rebuild into a NEW directory and edits it:
//   node qre3-p35-harness-proto.mjs --harness <harness dir> --work <new dir> [--diff-out <file>]
import fs from 'node:fs';
import path from 'node:path';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const harness=arg('--harness'),work=arg('--work'),diffOut=arg('--diff-out');
if(!harness||!work)throw Error('--harness --work');if(fs.existsSync(work))throw Error('--work must be a new directory');
fs.cpSync(harness,work,{recursive:true});
const f=path.join(work,'lib/properties.mjs'),src=fs.readFileSync(f,'utf8');
const from="const sameBreakNamed=(s,t)=>{const n=x=>{const i=x.review?.interruption;return typeof i?.episodeId==='string'&&i.episodeId.trim()!==''?i.episodeId:null;},nt=n(t);return !!nt&&(nt===n(s)||nt===s.review?.event?.id);};";
const to="const sameBreakNamed=(s,t)=>{const n=x=>{const i=x.review?.interruption;return typeof i?.episodeId==='string'&&i.episodeId.trim()!==''?i.episodeId:null;},nt=n(t);if(!nt)return false;if(nt===n(s)||nt===s.review?.event?.id)return true;\n const row=((t.planBefore?.decisions??[]).filter(d=>d.action==='REESTABLISH').at(-1)?.interruption?.separateBreaks??[]).find(b=>b.stop!=='LATEST'&&(b.episode===nt||b.eventId===nt)),names=row?[row.episode,row.eventId]:[];\n return names.includes(n(s))||names.includes(s.review?.event?.id);};";
if(src.split(from).length!==2)throw Error('sameBreakNamed not found exactly once');
fs.writeFileSync(f,src.replace(from,to));
const diff=`--- harness/lib/properties.mjs (33d3181)\n+++ harness/lib/properties.mjs (QRE scratch prototype for QRE3-P35-02; not the fix of record)\n-${from}\n+${to.split('\n').join('\n+')}\n`;
if(diffOut)fs.writeFileSync(diffOut,diff);
console.log(JSON.stringify({work,edited:'lib/properties.mjs'}));
