// SSCTR R7A1-SSCTR-r2: merges the SHARD outputs of ssctr-r7a1-grid.mjs or ssctr-r7a1-recheck-caps.mjs (numeric fields summed, example lists
// concatenated and cut to 12, byExercise/causes maps summed). Usage: node ssctr-r7a1-recheck-merge.mjs out.json shard0.json shard1.json ...
import fs from 'node:fs';
const [outFile,...files]=process.argv.slice(2),parts=files.map(f=>JSON.parse(fs.readFileSync(f,'utf8')));
const merge=(a,b)=>{if(typeof a==='number'&&typeof b==='number')return a+b;if(Array.isArray(a)&&Array.isArray(b))return [...a,...b];if(a&&b&&typeof a==='object'&&typeof b==='object'){const o={};for(const k of new Set([...Object.keys(a),...Object.keys(b)]))o[k]=k in a&&k in b?merge(a[k],b[k]):a[k]??b[k];return o;}return a===b?a:[a,b].flat();};
let m=parts.reduce(merge);
const cut=x=>{if(Array.isArray(x))return x.slice(0,12).map(cut);if(x&&typeof x==='object')return Object.fromEntries(Object.entries(x).map(([k,v])=>[k,k==='skipped'?v:cut(v)]));return x;};
m={...cut(m),shard:`merged ${parts.length}`,files};
fs.writeFileSync(outFile,JSON.stringify(m,null,1)+'\n');
const s=x=>JSON.stringify(x);console.log(s({timelines:m.timelines,skipped:m.skipped?.length,A:m.A&&{capWeeksLastNotWhole:m.A.capWeeksLastNotWhole,riseOrEnd:m.A.riseOrEnd,byCause:m.A.byCause},A2:m.A2&&{capWeeksLastWhole:m.A2.capWeeksLastWhole,held:m.A2.held,heldAtReturnCeiling:m.A2.heldAtReturnCeiling},B:m.B?.violations,C:m.C?.violations,L:m.L&&{weeks:m.L.weeks,ended:m.L.capEndedByHorizon,on:m.L.capStillOnAtHorizon},U:m.U&&{jumps:m.U.jumps,byExercise:m.U.byExercise},coverage:m.coverage}));
