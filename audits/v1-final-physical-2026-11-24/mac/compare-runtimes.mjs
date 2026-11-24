// REPMILE CoachingCore V1 final physical validation (2026-11-24): Node x JavaScriptCore, from the P0RESULT lines the Mac (swift test) and the
// iPhone (xcodebuild) runs printed. For every fixture it lists DIVERGED steps (must be none) and compares the EXPLAINED_LIBM step sets of the Mac's
// JavaScriptCore and the iPhone's (both against the same Node oracle). Usage: node compare-runtimes.mjs <results dir>
import fs from 'node:fs';
import path from 'node:path';
const dir=process.argv[2];if(!dir)throw new Error('usage: node compare-runtimes.mjs <results dir>');
const lines=f=>fs.existsSync(f)?fs.readFileSync(f,'utf8').split('\n').filter(l=>l.startsWith('P0RESULT ')):[];
let unparsed=0;const parse=l=>{const i=l.indexOf(' ',9);try{return [l.slice(9,i),JSON.parse(l.slice(i+1))];}catch{unparsed++;return [null,null];}}; // a line interleaved with XCTest output is counted, not read
const pick=(files,name)=>files.flatMap(lines).map(parse).filter(([n])=>n===name).map(([,v])=>v);
const mac=[path.join(dir,'mac','swift-test-mac.log'),path.join(dir,'mac','swift-boundary-mac.log')];
const dev=fs.readdirSync(path.join(dir,'device')).filter(f=>f.endsWith('.log')).map(f=>path.join(dir,'device',f));
const rows=[];let ok=true;
for(const name of ['boundary-int-memory','boundary-final-memory','boundary-final-native','core-focal']){
 const m=pick(mac,name),d=pick(dev,name);
 const set=v=>JSON.stringify([...(v.explainedLibm??[])].sort());
 const div=[...m,...d].flatMap(v=>v.diverged??[]);if(div.length)ok=false;
 const sameSets=m.length&&d.length&&[...m,...d].every(v=>set(v)===set(m[0]));
 rows.push({fixture:name,macRuns:m.length,deviceRuns:d.length,diverged:div.length,explainedPerRun:[...new Set([...m,...d].map(v=>(v.explainedLibm??[]).length))],
  identicalPerRun:[...new Set([...m,...d].map(v=>v.identical).filter(x=>x!==undefined))],sameExplainedSetMacAndDevice:!!sameSets,digestEqual:[...new Set([...m,...d].map(v=>v.digestEqual))]});
}
const eqM=pick(mac,'equivalence-j5').concat(pick(mac,'equivalence-p16')),eqD=pick(dev,'equivalence-j5').concat(pick(dev,'equivalence-p16'));
const verdicts=a=>a.flat().reduce((o,s)=>(o[s.verdict]=(o[s.verdict]??0)+1,o),{});
rows.push({fixture:'equivalence J5+P16',mac:verdicts(eqM),device:verdicts(eqD)});
if(Object.keys(verdicts(eqD)).includes('DIVERGED')||Object.keys(verdicts(eqM)).includes('DIVERGED'))ok=false;
console.log(JSON.stringify({ok,unparsedLines:unparsed,rows},null,1));process.exit(ok?0:1);
