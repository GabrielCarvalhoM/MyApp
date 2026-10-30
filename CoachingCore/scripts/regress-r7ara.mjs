// COACHING CORE — RESIDUAL AUTHORITY CLOSURE regression (adapted from regress-r7ada.mjs): the same inputs through the R7A-DECISION-AUTHORITY-FREEZE-1 runtime (the predecessor,
// audits/domain-coaching-r7a-residual-authority-2026-10-30/decision-authority-freeze-source), the STATE-EVIDENCE-FREEZE-1 runtime (the last freeze on
// which the SSCTR accepted D53 and D56–D59, audits/domain-coaching-r7a-state-model-2026-10-28/state-evidence-freeze-source; informational) and the
// current runtime, each rebuilt in a temporary folder, then a semantic comparison. Inputs: the R6 fresh holdout (35) and the R5 corpus (24), both
// REGRESSION / challenge reuse and never generalization evidence; the R6 development profiles; the R6 simulation trajectories. Ignored as
// byte-level only, as in the state model consumer closure: rows' `exposure`, hashes and digests, the re-establishment note's "as of the last
// review", the recorded entry-week flag, per-report input hashes, a week's recorded `adaptations` and `startBeforeReturn`, the program's
// `contextBefore`, the break record a return keeps, the eased slot's break, the authority each week records for its start, and the executed
// doses history keeps (`facts`). A case that throws on one runtime is recorded with its error, never dropped. Every program a differing case
// produces is tallied session by session (a dose that rose, fell or changed kind, matched by session and exercise id), so each rise is listed.
// Writes CoachingCore/r7/residual-authority/REGRESSION_R7ARA.json only; never touches earlier evidence.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'../..');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const baseline=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root,'audits/domain-coaching-r7a-residual-authority-2026-10-30/BASELINE.json'),'utf8')).entries.map(e=>[e.path,e.sha256]));
const support=['CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json','CoachingCore/r5/holdout/R5_INDEPENDENT_HOLDOUT.json','CoachingCore/scripts/evaluate-holdout-r6.mjs','CoachingCore/scripts/simulate-r6.mjs','CoachingCore/r5/PROGRAM_POLICY_R5.json','CoachingCore/r6/PROGRAM_POLICY_R6.json','CoachingCore/r6/fixtures/profiles.mjs','CoachingCore/r6/fixtures/trajectories.mjs','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'];
const inputs={};for(const p of support){const s=sha(path.join(root,p));if(baseline[p]&&s!==baseline[p])throw Error('Input changed since the residual authority baseline: '+p);inputs[p]={sha256:s,boundByBaseline:!!baseline[p]};}
const SNAPS={priorFreeze:'audits/domain-coaching-r7a-residual-authority-2026-10-30/decision-authority-freeze-source',approvedFreeze:'audits/domain-coaching-r7a-state-model-2026-10-28/state-evidence-freeze-source'};
const tmps=[];
try{
 const trees={};
 for(const [name,snap] of Object.entries(SNAPS)){
  const manifest=JSON.parse(fs.readFileSync(path.join(root,snap,'MANIFEST.json'),'utf8')),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7ara-'+name+'-'));tmps.push(tmp);
  const put=(from,to)=>{fs.mkdirSync(path.dirname(path.join(tmp,to)),{recursive:true});fs.copyFileSync(from,path.join(tmp,to));};
  for(const [rel,digest] of Object.entries(manifest.files)){if(sha(path.join(root,snap,rel))!==digest)throw Error(name+' snapshot drift: '+rel);put(path.join(root,snap,rel),rel);}
  for(const p of ['CoachingCore/scripts/evaluate-holdout-r6.mjs','CoachingCore/scripts/simulate-r6.mjs','CoachingCore/r5/PROGRAM_POLICY_R5.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'])if(!manifest.files[p])put(path.join(root,p),p);
  trees[name]={base:tmp,sourceDigest:manifest.freeze.sourceDigest,revision:manifest.freeze.revision};
 }
 trees.current={base:root};
 const load=(base,rel)=>import(pathToFileURL(path.join(base,rel)).href),runtimes={};
 for(const [name,{base}] of Object.entries(trees)){
  const ev=await load(base,'CoachingCore/scripts/evaluate-holdout-r6.mjs'),sim=await load(base,'CoachingCore/scripts/simulate-r6.mjs'),idx=await load(base,'CoachingCore/src/r6-index.mjs'),dev=await load(base,'CoachingCore/r6/fixtures/dev-authority.mjs'),prof=await load(base,'CoachingCore/r6/fixtures/profiles.mjs');
  runtimes[name]={evaluateHoldoutCase:ev.evaluateHoldoutCase,simulateAll:sim.simulateAll,generateProgram:idx.generateProgram,authority:dev.devAuthority(),profiles:{...prof.PROFILES,...prof.EDGE_PROFILES}};
 }
 const NOTE=/Not done for more than (\d+) days as of the last review:/g,SKIP=new Set(['facts','exposure','hash','doseKey','entryWeek','inputHashes','digest','adaptations','contextBefore','startBeforeReturn','easedFor','startAuthority','startBeforeReturnAuthority']);
 const BREAK_RECORD=['startDate','endDate','startedAt','episode','relation','supersedes','basis','revision','inputHash','stateAt','entry'];
 const norm=(x,key)=>Array.isArray(x)?x.map(v=>norm(v)):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).filter(([k])=>!SKIP.has(k)&&!/Hash$|Digest$/.test(k)&&!(key==='interruption'&&BREAK_RECORD.includes(k))).map(([k,v])=>[k,norm(v,k)])):typeof x==='string'?x.replace(NOTE,'Not done for more than $1 days:'):x;
 const diff=(a,b,at='',out=[])=>{if(out.length>=24)return out;if(JSON.stringify(a)===JSON.stringify(b))return out;if(a&&b&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b)){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],at+'/'+k,out);return out;}out.push({path:at,before:JSON.stringify(a)?.slice(0,160)??null,current:JSON.stringify(b)?.slice(0,160)??null});return out;};
 const statusLine=r=>r.error?'ERROR':r.steps?.length?r.steps.map(s=>`${s.result.status}/${s.result.action}`).join(' '):r.generation?.status??null;
 // Session-level dose tally over every program a case produces (the generated one and every step's proposal), sessions matched by id.
 const live=s=>s&&s.prescription&&s.status!=='SKIPPED';
 const programsOf=r=>[['generation',r.generation?.program??r.program??null],...(r.steps??[]).map((s,i)=>['step'+i,s.result?.proposal??null])];
 const rowOf=e=>({id:e.id,sets:e.sets,reps:e.reps,rir:e.rir,mode:e.load?.mode??null,value:Number.isFinite(e.load?.value)?e.load.value:null});
 const runOf=p=>({family:p.family??null,minutes:p.durationMinutes??null,reps:p.work?.repetitions??null,work:p.work?.workMinutes??null,strides:p.strides?.repetitions??null,calibration:p.calibration?.basis??null});
 function tally(a,b){const t={rose:[],fell:0,kindChanged:[],sessionsOnlyIn:{before:0,current:0}};const A=new Map(programsOf(a)),B=new Map(programsOf(b));
  for(const [where,pa] of A){const pb=B.get(where);if(!pa||!pb)continue;
   const sa=new Map(pa.weeks.flatMap(w=>w.sessions.filter(live).map(s=>[s.id,{s,w:w.index}]))),sb=new Map(pb.weeks.flatMap(w=>w.sessions.filter(live).map(s=>[s.id,{s,w:w.index}])));
   for(const id of sa.keys())if(!sb.has(id))t.sessionsOnlyIn.before++;for(const id of sb.keys())if(!sa.has(id))t.sessionsOnlyIn.current++;
   for(const [id,{s:x,w}] of sa){const y=sb.get(id)?.s;if(!y)continue;const at=`${where} week ${w} ${x.date} ${x.sport}/${x.role}`;
    if(x.sport==='STRENGTH'){const eb=new Map((y.prescription.exercises??[]).map(e=>[e.id,rowOf(e)]));for(const e of x.prescription.exercises??[]){const ra=rowOf(e),rb=eb.get(e.id);if(!rb)continue;
      if(ra.mode!==rb.mode)t.kindChanged.push(`${at} ${e.id}: ${ra.mode}${ra.value??''} -> ${rb.mode}${rb.value??''}`);
      for(const f of ['sets','reps','value']){if(!Number.isFinite(ra[f])||!Number.isFinite(rb[f])||ra[f]===rb[f])continue;if(rb[f]>ra[f])t.rose.push(`${at} ${e.id} ${f}: ${ra.sets}x${ra.reps}@${ra.rir} ${ra.mode}${ra.value??''} -> ${rb.sets}x${rb.reps}@${rb.rir} ${rb.mode}${rb.value??''}`);else t.fell++;}
      if(Number.isFinite(ra.rir)&&Number.isFinite(rb.rir)&&rb.rir<ra.rir)t.rose.push(`${at} ${e.id} rir: ${ra.rir} -> ${rb.rir}`);}}
    else{const ra=runOf(x.prescription),rb=runOf(y.prescription);if(ra.family!==rb.family)t.kindChanged.push(`${at}: ${ra.family} -> ${rb.family}`);
     for(const f of ['minutes','reps','work','strides']){if(!Number.isFinite(ra[f])||!Number.isFinite(rb[f])||ra[f]===rb[f])continue;if(rb[f]>ra[f])t.rose.push(`${at} ${f}: ${JSON.stringify(ra)} -> ${JSON.stringify(rb)}`);else t.fell++;}}}}
  return t;}
 const corpus=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8')).cases;
 const caseRun=(rt,c)=>{try{return rt.evaluateHoldoutCase(structuredClone(c),{authority:rt.authority});}catch(e){return {error:String(e?.message??e).slice(0,400),steps:[]};}};
 // One comparison per reference runtime: the predecessor (the required regression) and the SSCTR-approved freeze (informational).
 const compare=ref=>{
  const against=(label,fn)=>{const a=norm(fn(runtimes[ref])),b=norm(fn(runtimes.current)),same=JSON.stringify(a)===JSON.stringify(b);return {label,identical:same,...(same?{}:{differences:diff(a,b)})};};
  const corpusAgainst=cases=>cases.map(c=>{const a=caseRun(runtimes[ref],c),b=caseRun(runtimes.current,c),x=norm(a),y=norm(b),same=JSON.stringify(x)===JSON.stringify(y);
   return {caseId:c.caseId,operation:c.operation,identical:same,before:statusLine(a),current:statusLine(b),...(a.error||b.error?{error:{before:a.error??null,current:b.error??null}}:{}),...(same?{}:{tally:tally(a,b),differences:diff(x,y)})};});
  const count=list=>({cases:list.length,identical:list.filter(x=>x.identical).length,different:list.filter(x=>!x.identical).map(x=>x.caseId??x.label),statusChanged:list.filter(x=>x.before!==undefined&&x.before!==x.current).map(x=>`${x.caseId}: ${x.before} -> ${x.current}`),errors:list.filter(x=>x.error).map(x=>x.caseId),doseRose:list.filter(x=>x.tally?.rose?.length).map(x=>`${x.caseId} (${x.tally.rose.length})`)});
  const h6=corpusAgainst(corpus('CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json')),h5=corpusAgainst(corpus('CoachingCore/r5/holdout/R5_INDEPENDENT_HOLDOUT.json'));
  const profiles=Object.keys(runtimes.current.profiles).map(k=>against(k,rt=>rt.generateProgram(structuredClone(rt.profiles[k]),{authority:rt.authority})));
  const simsRef=runtimes[ref].simulateAll({authority:runtimes[ref].authority}),simsCur=runtimes.current.simulateAll({authority:runtimes.current.authority});
  const simulations=simsCur.map((t,i)=>{const a=norm(simsRef[i]),b=norm(t),same=JSON.stringify(a)===JSON.stringify(b);return {label:t.id,identical:same,...(same?{}:{differences:diff(a,b)})};});
  return {summary:{r6FreshHoldout:count(h6),r5Corpus:count(h5),profiles:count(profiles),simulations:count(simulations)},r6FreshHoldout:h6,r5Corpus:h5,profiles,simulations};
 };
 const prior=compare('priorFreeze'),approved=compare('approvedFreeze');
 const out={revision:'R7ARA-REGRESSION-1',generatedAt:new Date().toISOString(),classification:'REGRESSION / CHALLENGE REUSE; not generalization evidence',authority:'DEV_TEST_ONLY devAuthority() bound to the current policy hash',
  runtimes:{priorFreeze:{snapshot:SNAPS.priorFreeze,revision:trees.priorFreeze.revision,sourceDigest:trees.priorFreeze.sourceDigest},approvedFreeze:{snapshot:SNAPS.approvedFreeze,revision:trees.approvedFreeze.revision,sourceDigest:trees.approvedFreeze.sourceDigest,role:'informational: the last freeze the SSCTR accepted for D53 and D56-D59'},current:{sources:Object.fromEntries(fs.readdirSync(path.join(root,'CoachingCore/src')).filter(f=>f.startsWith('r6-')).sort().map(f=>['CoachingCore/src/'+f,sha(path.join(root,'CoachingCore/src',f))]))}},
  inputs,ignoredAsByteLevel:[...SKIP,'*Hash, *Digest','re-establishment note wording "as of the last review"','interruption.'+BREAK_RECORD.join('|')],
  summary:prior.summary,againstApprovedFreeze:{summary:approved.summary,r6FreshHoldout:approved.r6FreshHoldout.map(({caseId,identical,before,current})=>({caseId,identical,before,current}))},r6FreshHoldout:prior.r6FreshHoldout,r5Corpus:prior.r5Corpus,profiles:prior.profiles,simulations:prior.simulations};
 fs.mkdirSync(path.join(root,'CoachingCore/r7/residual-authority'),{recursive:true});
 fs.writeFileSync(path.join(root,'CoachingCore/r7/residual-authority/REGRESSION_R7ARA.json'),JSON.stringify(out,null,1)+'\n');
 console.log(JSON.stringify({againstPriorFreeze:out.summary,againstApprovedFreeze:out.againstApprovedFreeze.summary},null,1));
}finally{for(const t of tmps)fs.rmSync(t,{recursive:true,force:true});}
