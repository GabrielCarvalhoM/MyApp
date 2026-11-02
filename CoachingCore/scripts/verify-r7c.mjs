// R7-C freeze verifier (node scripts/verify-r7c.mjs [--suite] [--write]): read-only check of R7C-FREEZE-1 (CoachingCore/r7/c/RUNTIME_FREEZE_R7C_1.json).
// - files: every bound file's SHA-256 now equals the record, and equals the file at the record's commit (git show);
// - digests: the source and manifest digests recompute;
// - inputs: the policy, catalog, B0 records, human queue, product/ and canon/ are unchanged since the R7-B.2 closure; CURRENT_MISSION.md and
//   MISSION_LEDGER.md are append-only since then;
// - evidence: the bound evidence manifest and mutation outputs still have their recorded SHA-256;
// - with --suite, the suite re-runs and must match the record (count, zero failures).
// Prints JSON. Writes nothing unless given --write, which writes only CoachingCore/r7/c/VERIFICATION_R7C_1.json.
// --revision 2 checks R7C-FREEZE-2 (RUNTIME_FREEZE_R7C_2.json) the same way, plus its predecessor record and reviews by SHA-256; --write then
// writes only CoachingCore/r7/c/VERIFICATION_R7C_2.json.
// --revision 3 checks R7C-FREEZE-3 (RUNTIME_FREEZE_R7C_3.json) the same way, plus its predecessor record (R7C-FREEZE-2) and rechecks by SHA-256,
// every Phase 6 mutant killed, the recorder-independence output (0 of 160 cells failing, recomputed from the bound output), the differential
// against R7C-FREEZE-2 (no differing scenario, recomputed) and the r4 condition record; --write then writes only VERIFICATION_R7C_3.json.
// --revision 4 checks R7C-FREEZE-4 (RUNTIME_FREEZE_R7C_4.json) the same way, plus its predecessor record (R7C-FREEZE-3) and reviews by SHA-256, every
// Phase 6 and Phase 7 mutant killed (each Phase 7 one by its own witness), and, recomputed from the bound outputs, QE-R7C-10's recorder
// independence (original 160, shortened 280, SSCTR mixed scope 768 and CC2 1,200 with 0 failing; trajectories with no stale valid plan and no
// full-dose or shortened failure), the differential against R7C-FREEZE-3 (only the declared family differing, never beyond the timely facts),
// history (no violation) and the r5 condition record; --write then writes only VERIFICATION_R7C_4.json.
// Earlier revisions are superseded, not edited: once later bytes change their bound files, their files-current check fails by design.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hash} from '../src/value.mjs';
const N=(()=>{const i=process.argv.indexOf('--revision');return i>=0?process.argv[i+1]:'1';})();if(!['1','2','3','4'].includes(N))throw Error('--revision 1|2|3|4');
const cc=path.resolve(import.meta.dirname,'..'),repo=path.resolve(cc,'..');
const rec=JSON.parse(fs.readFileSync(path.join(cc,`r7/c/RUNTIME_FREEZE_R7C_${N}.json`),'utf8')),checks=[];
const check=(id,ok,detail=null)=>checks.push({id,result:ok?'PASS':'FAIL',...(detail?{detail}:{})});
const shaRepo=p=>fs.existsSync(path.join(repo,p))?createHash('sha256').update(fs.readFileSync(path.join(repo,p))).digest('hex'):null;
const shaAt=(rev,p)=>{const r=spawnSync('git',['show',`${rev}:${p}`],{cwd:repo,encoding:'buffer',maxBuffer:1<<28});return r.status===0?createHash('sha256').update(r.stdout).digest('hex'):null;};
const now=Object.entries(rec.files).filter(([p,s])=>shaRepo(p)!==s).map(([p])=>p);check('files-current',!now.length,now.length?now.slice(0,10):null);
const atCommit=Object.entries(rec.files).filter(([p,s])=>shaAt(rec.commit,p)!==s).map(([p])=>p);check('files-at-commit',!atCommit.length,atCommit.length?atCommit.slice(0,10):null);
check('source-digest',hash(Object.fromEntries(Object.entries(rec.files).filter(([p])=>p.startsWith('CoachingCore/src/'))))===rec.sourceDigest);
check('manifest-digest',hash(rec.files)===rec.manifestDigest);
check('inputs-unchanged',spawnSync('git',['diff','--quiet',rec.unchangedSince.commit,'--',...rec.unchangedSince.paths],{cwd:repo}).status===0);
for(const f of rec.appendOnly){const base=spawnSync('git',['show',`${rec.unchangedSince.commit}:${f}`],{cwd:repo,encoding:'buffer'}).stdout,cur=fs.readFileSync(path.join(repo,f));check('append-only:'+f,base.length>0&&cur.subarray(0,base.length).equals(base));}
check('semantic-disposition',shaRepo(rec.semanticDisposition.path)===rec.semanticDisposition.sha256&&rec.semanticDisposition.disposition==='ACCEPT_R7C_UNKNOWN_SEMANTICS');
check('binding-conditions',['C2','C3','C7','C8','C9'].every(id=>rec.bindingConditions?.some(c=>c.id===id&&c.text)));
check('evidence-manifest',shaRepo(rec.evidence.manifest.path)===rec.evidence.manifest.sha256);
check('evidence-mutation',shaRepo(rec.evidence.mutation.path)===rec.evidence.mutation.sha256);
if(rec.correctionCycle||rec.phase6||rec.phase7){check('predecessor-record',shaRepo(rec.predecessor.record)===rec.predecessor.sha256);for(const [k,r] of Object.entries((rec.phase7??rec.phase6??rec.correctionCycle).predecessorReviews))check('predecessor-review:'+k,shaRepo(r.path)===r.sha256);check('correction-cycle-mutants',rec.evidence.mutation.correctionCycle?.killed===rec.evidence.mutation.correctionCycle?.mutants&&rec.evidence.mutation.correctionCycle.mutants>0);}
if(rec.phase6){
 const P=rec.evidence.mutation.phase6QE07;check('phase6-mutants',P?.mutants>0&&P.killed===P.mutants);
 const R=rec.evidence.recorderIndependence,ri=shaRepo(R.output)===R.sha256?JSON.parse(fs.readFileSync(path.join(repo,R.output),'utf8')).summary?.F2:null;
 check('recorder-independence',!!ri&&ri.cells===160&&ri.RIfail===0&&R.cells===160&&R.failures===0,ri?{cells:ri.cells,failures:ri.RIfail}:{output:'missing or changed'});
 const D=rec.evidence.differentialVsFreeze2,df=shaRepo(D.output)===D.sha256?JSON.parse(fs.readFileSync(path.join(repo,D.output),'utf8')):null;
 check('differential-vs-freeze-2',!!df&&df.differing.length===0&&df.generationFailures===0&&df.scenarios===D.scenarios);
 check('condition-updates',shaRepo(rec.phase6.conditionUpdates.path)===rec.phase6.conditionUpdates.sha256);
}
if(rec.phase7){
 const P6=rec.evidence.mutation.phase6QE07,P7=rec.evidence.mutation.phase7QE10;
 check('phase6-mutants',P6?.mutants>0&&P6.killed===P6.mutants);
 check('phase7-mutants-own-witness',P7?.mutants>0&&P7.killed===P7.mutants&&P7.killedByOwnWitness===P7.mutants,P7?{mutants:P7.mutants,killed:P7.killed,byOwnWitness:P7.killedByOwnWitness}:null);
 const R=rec.evidence.recorderIndependence,read=x=>shaRepo(x.output)===x.sha256?JSON.parse(fs.readFileSync(path.join(repo,x.output),'utf8')):null;
 const ri=read(R.original)?.summary?.F2,sh=read(R.shortened)?.summary?.F4,tr=read(R.trajectories)?.summary?.F4,ms=read(R.mixedScopeP6F01),cc2=read(R.cc2)?.grid?.HEAD;
 check('recorder-independence-160',!!ri&&ri.cells===160&&ri.RIfail===0,ri?{cells:ri.cells,failures:ri.RIfail}:{output:'missing or changed'});
 check('recorder-independence-shortened-280',!!sh&&sh.cells===280&&sh.fail===0&&sh.staleValid===0,sh?{cells:sh.cells,failures:sh.fail}:{output:'missing or changed'});
 check('recorder-independence-trajectories',!!tr&&tr.trajectories===1536&&tr.staleValid===0&&!['EXEC','MIXED','ADVERSE','EASYONLY','PARTIAL','SHORT'].some(V=>tr.byV?.[V]),tr?{trajectories:tr.trajectories,staleValid:tr.staleValid,failingByAnswer:tr.byV}:{output:'missing or changed'});
 const notD=ms?Object.values(ms.byV).reduce((n,v)=>n+v.notD,0):null,cells=ms?Object.values(ms.byV).reduce((n,v)=>n+v.cells,0):null;
 check('p6-f01-mixed-scope-768',cells===768&&notD===0,{cells,recorderDependent:notD});
 check('ssctr-cc2-1200',!!cc2&&cc2.cells===1200&&cc2.validNotD===0,cc2?{cells:cc2.cells,validNotD:cc2.validNotD}:{output:'missing or changed'});
 const D=rec.evidence.differentialVsFreeze3,df=read(D);
 check('differential-vs-freeze-3',!!df&&df.generationFailures===0&&df.unexpectedDiffering.length===0&&df.beyondTimely.length===0&&df.scenarios===D.scenarios,df?{scenarios:df.scenarios,differing:df.differing.length,unexpected:df.unexpectedDiffering.length}:{output:'missing or changed'});
 const Hs=read(rec.evidence.history);check('history',!!Hs&&Hs.checked>0&&Hs.violations.length===0&&Hs.unsupported===0,Hs?{checked:Hs.checked}:{output:'missing or changed'});
 check('condition-updates',shaRepo(rec.phase7.conditionUpdates.path)===rec.phase7.conditionUpdates.sha256);
}
if(process.argv.includes('--suite')){const r=spawnSync(process.execPath,['--test'],{cwd:cc,encoding:'utf8',maxBuffer:1<<28,timeout:1800000}),n=k=>Number(r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))?.[1]??NaN);check('suite',n('tests')===rec.tests.count&&n('fail')===0&&n('pass')===rec.tests.count,{tests:n('tests'),pass:n('pass'),fail:n('fail')});}
const report={check:`R7C-FREEZE-${N}-VERIFICATION`,revision:rec.revision,commit:rec.commit,ran:new Date().toISOString(),checks,result:checks.every(c=>c.result==='PASS')?'PASS':'FAIL'};
if(process.argv.includes('--write'))fs.writeFileSync(path.join(cc,`r7/c/VERIFICATION_R7C_${N}.json`),JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify(report,null,1));
