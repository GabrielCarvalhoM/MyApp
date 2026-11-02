// P6-M: the judge's own mutants of the recorded-answer re-plan (Engineering review of R7C-FREEZE-3). Usage: node p6-m-mutants.mjs <isolated copy root holding CoachingCore/>
// (a git archive of 08c6db3 with node_modules copied, outside the repository). Applies one mutant at a time to src/r6-adaptation.mjs, runs the five R7-C
// test files and the two pinned state-model files, restores the bytes (checked by SHA-256). Refuses a path inside the worktrees folder.
// Judge's own mutants of the recorded-answer re-plan, applied one at a time to an ISOLATED copy (argv[2]) and restored by bytes; prints JSON.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';import {createHash} from 'node:crypto';
const root=path.resolve(process.argv[2]),core=path.join(root,'CoachingCore'),file=path.join(core,'src/r6-adaptation.mjs');
if(root.toLowerCase().includes('worktrees'))throw Error('refusing to patch a repository path');
const original=fs.readFileSync(file,'utf8'),sha=s=>createHash('sha256').update(s).digest('hex');
const TESTS=['test/r7c-longitudinal.test.mjs','test/r7c-phase4.test.mjs','test/r7c-phase5.test.mjs','test/r7c-phase5-cc.test.mjs','test/r7c-phase6.test.mjs','test/r7asm-state-model.test.mjs','test/r7asc-state-consumer.test.mjs'];
const M=[
 ['J-M1','the window guard removed: a run the stored plan read in the window no longer blocks the re-plan',"if(done.some(h=>dayGap(h.date,start)>0&&dayGap(h.date,start)<=C.windowDays))return false;",""],
 ['J-M2','REGRESS no longer counts as an executed run gate (adverse late facts not detected)',"keys.some(k=>['ADVANCE','EARNED','REGRESS'].includes(g[k]))","keys.some(k=>['ADVANCE','EARNED'].includes(g[k]))"],
 ['J-M3','the return-report exclusion removed',"function answeredOnRecord(ctx){\n if(ctx.kind==='RETURN_AFTER_PAUSE')return false;","function answeredOnRecord(ctx){\n if(false)return false;"],
 ['J-M4','the open-gap early exit removed (the re-plan computed while the window is still unknown)',"if(read.length===record.length||runGapInForce(ctx))return false;","if(read.length===record.length)return false;"],
 ['J-M5','a return-replaced start ignored (startBeforeReturn not read)',"const n=program.weeks[j+1],a=(n.startBeforeReturn?n.startBeforeReturnAuthority:n.startAuthority)?.RUN","const n=program.weeks[j+1],a=n.startAuthority?.RUN"],
 ['J-M6','C9 dropped for the recorded re-plan (elapsed unreported runs of the answer week credited)',"uncredited=answered||overCeiling||recorded?ctx.program","uncredited=answered||overCeiling?ctx.program"],
 ['J-M7','CONDITIONAL_PLAN weeks never count as unread (only reviewed weeks can be unread)',"if(a?.provenance===WEEK_START.CONDITIONAL_PLAN||recorded&&","if(recorded&&"],
 ['J-M8','the recorded re-plan pre-empts the ceiling re-plan for known stops',"const recorded=!moved&&!answered&&!overCeiling&&!ctx.noCeiling&&answeredOnRecord(ctx);\n const origin=moved?'MOVED':answered?'ANSWERED':overCeiling?'CEILING':'RECORDED';","const recorded=!moved&&!answered&&!ctx.noCeiling&&answeredOnRecord(ctx);\n const origin=moved?'MOVED':answered?'ANSWERED':recorded?'RECORDED':'CEILING';"]
];
const run=()=>{const r=spawnSync(process.execPath,['--test','--test-reporter=spec',...TESTS],{cwd:core,encoding:'utf8',maxBuffer:1<<28});r.stdout=(r.stdout??'')+(r.stderr??'');const n=k=>Number((r.stdout.match(new RegExp('ℹ '+k+' ([0-9]+)'))??[])[1]??NaN);return {pass:n('pass'),fail:n('fail'),failing:[...new Set((r.stdout.match(/^✖ .*$/gm)??[]).filter(l=>!/failing tests/.test(l)).map(l=>l.replace(/\s*\(\d[\d.]*ms\)$/,'').slice(2,150)))]};};
const out={copy:root,originalSha256:sha(original),tests:TESTS,baseline:run(),mutants:[]};
for(const [id,rule,from,to] of M){
 const n=original.split(from).length-1;if(n!==1){out.mutants.push({id,rule,result:'INVALID',anchorCount:n});continue;}
 fs.writeFileSync(file,original.replace(from,to));const r=run();fs.writeFileSync(file,original);
 out.mutants.push({id,rule,result:r.fail>0?'KILLED':'SURVIVED',...r});
}
out.restored=sha(fs.readFileSync(file,'utf8'))===out.originalSha256;
console.log(JSON.stringify(out,null,1));
