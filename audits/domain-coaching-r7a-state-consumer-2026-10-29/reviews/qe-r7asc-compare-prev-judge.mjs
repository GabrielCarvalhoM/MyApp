// Compare my re-runs of the earlier judges' probes (this freeze) with the previous QE judge's re-runs on HISTORICAL-PROJECTION-FREEZE-1.
// Byte-identical => the predecessor judge's closure conclusions carry over unchanged. Differences are summarised by their top-level keys.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const mine='C:/Users/carva/AppData/Local/Temp/claude/C--Users-carva-Desktop-myApp-MyApp/613c259c-46c0-4cf2-bfd4-c6e2637d876c/scratchpad/judge-reruns';
const prevJ='C:/Users/carva/Desktop/myApp/MyApp/audits/domain-coaching-r7a-state-model-2026-10-28/reviews/qe-r7asm-runs/judge-reruns';
const prevQ='C:/Users/carva/Desktop/myApp/MyApp/audits/domain-coaching-r7a-state-model-2026-10-28/reviews/qe-r7asm-runs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const out=[];
for(const f of fs.readdirSync(mine).filter(f=>f.endsWith('.out.json'))){
 const name=f.replace(/\.out\.json$/,'');
 let prev=path.join(prevJ,f);if(!fs.existsSync(prev)){const q=path.join(prevQ,name.replace(/^qe-r7asm-/,'')+'.out.json');prev=fs.existsSync(q)?q:null;}
 if(!prev){out.push({name,previousJudgeRun:null});continue;}
 const a=fs.readFileSync(path.join(mine,f)),b=fs.readFileSync(prev);
 let diffKeys=null;if(sha(a)!==sha(b)){try{const A=JSON.parse(a),B=JSON.parse(b);diffKeys=[...new Set([...Object.keys(A),...Object.keys(B)])].filter(k=>JSON.stringify(A[k])!==JSON.stringify(B[k]));}catch{diffKeys=['(not JSON)'];}}
 out.push({name,previousJudgeRun:path.relative('C:/Users/carva/Desktop/myApp/MyApp',prev).split(path.sep).join('/'),identical:sha(a)===sha(b),diffKeys});
}
console.log(JSON.stringify({identical:out.filter(x=>x.identical).map(x=>x.name),different:out.filter(x=>x.identical===false).map(x=>({name:x.name,keys:x.diffKeys})),noPreviousRun:out.filter(x=>!x.previousJudgeRun).map(x=>x.name)},null,1));
