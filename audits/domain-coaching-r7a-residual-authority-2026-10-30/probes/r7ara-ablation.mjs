// Author probe (R7-A RESIDUAL AUTHORITY, Founder request §27: every difference has a named cause): attribution by ablation. Every output the
// comparison (probes/COMPARISON_R7ARA.json) found different from its predecessor reference, and every regression case that differs
// (CoachingCore/r7/residual-authority/REGRESSION_R7ARA.json), runs again on copies of the candidate with one root cause reverted:
// - A5: the factual re-plan before dispatch removed and the weekly review's own mid-week re-plan restored (the predecessor's dispatch, verbatim);
// - E1: the run a return reads is the predecessor's (only a walk/jog step capped at the step last run, W2);
// - ALL: both. A root cause is named when reverting it gives the predecessor's output. Attribution is staged, so each item runs only as often as
//   it needs: E1 first, then A5, then both together (a difference no single revert restores, but both do, needs both).
// Probes that read the live tree are run from a mirror of their folder next to the ablated tree; the others get the tree by their environment.
// Jobs run CONC at a time (default 4). Temporary copies only; prints JSON.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,repo=path.resolve(here,'../../..'),core=path.join(repo,'CoachingCore'),sha=b=>createHash('sha256').update(b).digest('hex');
const predA=fs.readFileSync(path.join(here,'..','decision-authority-freeze-source/CoachingCore/src/r6-adaptation.mjs'),'utf8'),END='\n const {gates,reasons}=weeklyGates(program,sk,w,ev,ledger,asOf,{systemic,base:ctx.base});';
const a3=predA.slice(predA.indexOf(' if(ev.pending){\n  // Evidence about an earlier week'),predA.indexOf(END));
const curA=fs.readFileSync(path.join(core,'src/r6-adaptation.mjs'),'utf8'),midweek=curA.slice(curA.indexOf(' // Mid-week the week continues as planned'),curA.indexOf(END));
const P={
 A5:[['src/r6-adaptation.mjs','const factual=factualReplan(ctx);','const factual=null;'],['src/r6-adaptation.mjs',midweek,a3]],
 E1:[['src/r6-adaptation.mjs',"const run=historicalRun(clone(H.state.run),ran,{stateOf:k=>at(k)?.state?.run??null,easyStepMinutes:ctx.sk.op.run.easyStepMinutes,undo:m=>!cls||cls==='SHORT'||m==='WALK_JOG'});","const run=H.state.run.mode==='WALK_JOG'?historicalRun(clone(H.state.run),ran.filter(x=>x.dimension==='WALK_JOG_STEP')):clone(H.state.run);"]],
};
const SETS={A5:['A5'],E1:['E1'],ALL:['A5','E1']},STAGES=['E1','A5','ALL'];
const cmp=JSON.parse(fs.readFileSync(path.join(here,'COMPARISON_R7ARA.json'),'utf8')),ev=JSON.parse(fs.readFileSync(path.join(here,'EVIDENCE_RUNS_R7ARA.json'),'utf8'));
const DA='audits/domain-coaching-r7a-decision-authority-2026-10-29/probes/';
// An error's stack frames name the tree's path and are cut at a fixed length (R6-H35's expected error), so only the message is compared.
const DROP=new Set(['root','runtime','ROOT','rootUsed','tree','TREE','generatedAt','ranAt','node','seconds','durationMs','elapsedMs','at']);
const strip=b=>{if(!b)return null;try{const f=x=>Array.isArray(x)?x.map(f):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).filter(([k])=>!DROP.has(k)).map(([k,v])=>[k,f(v)])):typeof x==='string'?x.replace(/\n {4}at [\s\S]*$/,'').replace(/[A-Za-z]:\/Users\/[^"]*?MyApp\//g,'').replace(/\/home\/user\/MyApp\//g,'').replace(/[^"]*?\/r7ara-abl-[A-Za-z0-9]+\/abl-[A-Z0-9]+\//g,'').replace(/audits\/domain-coaching-r7a-residual-authority-2026-10-30\/decision-authority-freeze-source\/CoachingCore/g,'<TREE>').replace(/^CoachingCore$/,'<TREE>'):x;return JSON.stringify(f(JSON.parse(b.toString())));}catch{return null;}};
const tmp=fs.mkdtempSync(path.join(process.env.TMPDIR??os.tmpdir(),'r7ara-abl-')),out={probe:'r7ara-ablation',patches:Object.fromEntries(Object.entries(P).map(([k,v])=>[k,v.map(([f,from,to])=>({file:f,fromSha256:sha(from),toSha256:sha(to)}))])),stages:STAGES,jobs:{},regression:{}};
const build=name=>{const base=path.join(tmp,'abl-'+name);fs.mkdirSync(base,{recursive:true});fs.cpSync(core,path.join(base,'CoachingCore'),{recursive:true,filter:s=>!s.includes(`${path.sep}node_modules`)&&!s.includes(`${path.sep}r7${path.sep}residual-authority`)});
 for(const [file,from,to] of SETS[name].flatMap(k=>P[k])){const f=path.join(base,'CoachingCore',file),s=fs.readFileSync(f,'utf8');if(s.split(from).length!==2)throw Error(`${name}: ${file} patch does not apply once`);fs.writeFileSync(f,s.replace(from,to));}
 for(const s of POLICY_REVIEWS){fs.mkdirSync(path.dirname(path.join(base,s)),{recursive:true});fs.copyFileSync(path.join(repo,s),path.join(base,s));}
 return base;};
// A probe run from a mirror needs its whole mission folder (snapshots and inputs it reads next to itself) and the mission folder of every
// audit module it imports, transitively (shared libraries of earlier reviews).
const IMPORT=/(?:\bfrom\s*|\bimport\s*\(\s*)['"](\.{1,2}\/[^'"]+)['"]/g,missionOf=rel=>rel.split(path.sep).slice(0,2).join(path.sep);
const mirrorFor=(base,rel,seen=new Set())=>{if(seen.has(rel))return;seen.add(rel);const m=missionOf(rel),to=path.join(base,m);
 if(!fs.existsSync(to))fs.cpSync(path.join(repo,m),to,{recursive:true,filter:s=>!s.includes(`${path.sep}node_modules`)});
 if(!rel.endsWith('.mjs'))return;
 for(const [,spec] of fs.readFileSync(path.join(repo,rel),'utf8').matchAll(IMPORT)){const t=path.relative(repo,path.resolve(path.dirname(path.join(repo,rel)),spec));if(t.startsWith('audits'+path.sep))mirrorFor(base,t,seen);}};
const POLICY_REVIEWS=['audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json','audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json'];
const trees=Object.fromEntries(Object.keys(SETS).map(n=>[n,build(n)]));
const runJob=(r,base)=>new Promise(res=>{const treeEnv=['QE_ROOT','SSCTR_CC','R7ADA_ROOT'].find(k=>k in r.env);let script=path.join(repo,r.script),cwd=path.join(repo,r.cwd);const env={...process.env,...r.env};
 if(treeEnv)env[treeEnv]=path.join(base,'CoachingCore');
 else{mirrorFor(base,r.script);if(r.cwd!=='.')mirrorFor(base,r.cwd);script=path.join(base,r.script);cwd=path.join(base,r.cwd);if('R7A_PROBE_OUT' in env)env.R7A_PROBE_OUT=path.join(tmp,'r12-'+path.basename(base)+'-'+Math.random().toString(36).slice(2)+'.json');}
 const p=spawn(process.execPath,[script],{cwd,env}),o=[];p.stdout.on('data',d=>o.push(d));p.stderr.on('data',()=>{});p.on('close',code=>res({exit:code,out:Buffer.concat(o)}));});
const pool=async(tasks,n=Number(process.env.CONC??4))=>{const q=[...tasks];await Promise.all(Array.from({length:n},async()=>{while(q.length)await q.shift()();}));};
const referenceOf=(group,name)=>group==='kit'?path.join(repo,DA,'kit-final',name+'.out.json'):group==='judges'?path.join(repo,DA,'judges',name+'.out.json'):path.join(repo,ev.runs.find(x=>x.group===group&&x.name===name+'.pred').output);
try{
 const only=process.env.ONLY?new Set(process.env.ONLY.split(',')):null; // ONLY=group/name,... narrows a diagnostic run
 const items=Object.entries(cmp.groups).flatMap(([g,l])=>l.filter(x=>x.verdict==='DIFFERENT'&&(!only||only.has(`${g}/${x.name}`))).map(x=>{const r=ev.runs.find(y=>y.group===g&&y.name===(['kit','judges'].includes(g)?x.name:x.name+'.cand'));
  return {key:`${g}/${x.name}`,r,want:strip(fs.readFileSync(referenceOf(g,x.name))),cand:strip(fs.readFileSync(path.join(repo,r.output))),runs:{}};}));
 for(const stage of STAGES){const open=items.filter(it=>!Object.values(it.runs).some(v=>v.restoresPredecessor));
  await pool(open.map(it=>async()=>{const x=await runJob(it.r,trees[stage]),s=strip(x.out);it.runs[stage]={exit:x.exit,restoresPredecessor:s===it.want,sameAsCandidate:s===it.cand};}));}
 for(const it of items)out.jobs[it.key]={restoredBy:Object.keys(it.runs).filter(n=>it.runs[n].restoresPredecessor),touchedBy:Object.keys(it.runs).filter(n=>!it.runs[n].sameAsCandidate),runs:it.runs};
 // The regression cases that differ, on the ablated runtimes (normalized as the regression normalizes them).
 const reg=JSON.parse(fs.readFileSync(path.join(core,'r7/residual-authority/REGRESSION_R7ARA.json'),'utf8'));
 const NOTE=/Not done for more than (\d+) days as of the last review:/g,SKIP=new Set(['facts','exposure','hash','doseKey','entryWeek','inputHashes','digest','adaptations','contextBefore','startBeforeReturn','easedFor','startAuthority','startBeforeReturnAuthority']);
 const BREAK_RECORD=['startDate','endDate','startedAt','episode','relation','supersedes','basis','revision','inputHash','stateAt','entry'];
 const norm=(x,key)=>Array.isArray(x)?x.map(v=>norm(v)):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).filter(([k])=>!SKIP.has(k)&&!/Hash$|Digest$/.test(k)&&!(key==='interruption'&&BREAK_RECORD.includes(k))).map(([k,v])=>[k,norm(v,k)])):typeof x==='string'?x.replace(NOTE,'Not done for more than $1 days:'):x;
 const differing=[...reg.r6FreshHoldout.filter(x=>!x.identical).map(x=>({kind:'R6',id:x.caseId,file:'r6/holdout/R6_INDEPENDENT_HOLDOUT.json'})),...reg.r5Corpus.filter(x=>!x.identical).map(x=>({kind:'R5',id:x.caseId,file:'r5/holdout/R5_INDEPENDENT_HOLDOUT.json'})),...reg.profiles.filter(x=>!x.identical).map(x=>({kind:'PROFILE',id:x.label})),...reg.simulations.filter(x=>!x.identical).map(x=>({kind:'SIMULATION',id:x.label}))];
 if(differing.length){
  const predCopy=path.join(tmp,'pred');fs.cpSync(path.join(here,'..','decision-authority-freeze-source'),predCopy,{recursive:true});
  const extra=['CoachingCore/scripts/evaluate-holdout-r6.mjs','CoachingCore/scripts/simulate-r6.mjs','CoachingCore/r5/PROGRAM_POLICY_R5.json','CoachingCore/r5/holdout/R5_INDEPENDENT_HOLDOUT.json','CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'];
  for(const s of extra)if(!fs.existsSync(path.join(predCopy,s))){fs.mkdirSync(path.dirname(path.join(predCopy,s)),{recursive:true});fs.copyFileSync(path.join(repo,s),path.join(predCopy,s));}
  const runtime=async base=>{const load=rel=>import(pathToFileURL(path.join(base,'CoachingCore',rel)).href);const e=await load('scripts/evaluate-holdout-r6.mjs'),sim=await load('scripts/simulate-r6.mjs'),idx=await load('src/r6-index.mjs'),dev=await load('r6/fixtures/dev-authority.mjs'),prof=await load('r6/fixtures/profiles.mjs');return {ev:e.evaluateHoldoutCase,sim:sim.simulateAll,gen:idx.generateProgram,authority:dev.devAuthority(),profiles:{...prof.PROFILES,...prof.EDGE_PROFILES}};};
  const rts={pred:await runtime(predCopy),candidate:await runtime(repo)};for(const [n,base] of Object.entries(trees))rts[n]=await runtime(base);
  const corpora={};const caseOf=(file,id)=>(corpora[file]??=JSON.parse(fs.readFileSync(path.join(core,file),'utf8')).cases).find(c=>c.caseId===id);
  const one=(rt,it)=>{try{return JSON.stringify(norm(it.kind==='PROFILE'?rt.gen(structuredClone(rt.profiles[it.id]),{authority:rt.authority}):it.kind==='SIMULATION'?rt.sim({authority:rt.authority}).find(t=>t.id===it.id):rt.ev(structuredClone(caseOf(it.file,it.id)),{authority:rt.authority})));}catch(e){return 'ERROR '+String(e?.message??e).slice(0,200);}};
  for(const it of differing){const want=one(rts.pred,it),cand=one(rts.candidate,it),restoredBy=[];for(const stage of STAGES){if(one(rts[stage],it)===want){restoredBy.push(stage);break;}}
   out.regression[`${it.kind} ${it.id}`]={candidateDiffers:cand!==want,restoredBy};}
 }
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
const all={...out.jobs,...out.regression};
out.summary={items:Object.keys(all).length,byCause:Object.fromEntries(STAGES.map(k=>[k,Object.entries(all).filter(([,v])=>v.restoredBy.includes(k)).map(([n])=>n)])),notRestored:Object.entries(all).filter(([,v])=>!v.restoredBy.length).map(([n,v])=>`${n} (touched by ${(v.touchedBy??[]).join(', ')||'none'})`)};
console.log(JSON.stringify(out,null,1));
