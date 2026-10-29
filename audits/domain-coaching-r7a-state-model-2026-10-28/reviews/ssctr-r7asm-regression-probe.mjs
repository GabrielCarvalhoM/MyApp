// SSCTR R7ASM-SSCTR-r1 regression probe (own; prints only). Derived from my ssctr-r7ase-regression-probe.mjs (same comparison logic), retargeted:
// the same inputs as the author's regression (R6 fresh holdout 35, R5 corpus 24, R6 profiles 16, R6 simulations 14) through the byte-exact
// STATE-EVIDENCE-FREEZE-1 copy (state-evidence-freeze-source) and the live tree (HISTORICAL-PROJECTION-FREEZE-1), compared with a NARROWER
// ignore set than the author's: only hashes/digests, per-report input hashes and the start-authority bookkeeping records (startAuthority,
// startBeforeReturnAuthority, interruption.stateAt). Unlike the author's comparison, the return's ENTRY (interruption.entry), the break record's
// dates, `exposure`, `adaptations`, `startBeforeReturn`, `easedFor`, `facts`, `contextBefore` and the re-establishment note are compared.
// Added in this round: a session-level dose tally over every proposal (and every generated program), matched by session id and exercise id, so
// a dose that rose, fell or changed kind is counted once whatever its array index; every risen field is listed with its row on both runtimes.
// The predecessor tree is assembled in the OS temp dir (the runner points it at my scratchpad) as the author's regression does, then removed.
// Read-only runtime use; synthetic data; DEV_TEST_ONLY authority. Usage: node ssctr-r7asm-regression-probe.mjs > out.json
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {createHash} from 'node:crypto';import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'../../..'),sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const snap='audits/domain-coaching-r7a-state-model-2026-10-28/state-evidence-freeze-source',manifest=JSON.parse(fs.readFileSync(path.join(root,snap,'MANIFEST.json'),'utf8'));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ssctr-r7asm-pred-'));const put=(from,to)=>{fs.mkdirSync(path.dirname(path.join(tmp,to)),{recursive:true});fs.copyFileSync(from,path.join(tmp,to));};
const out={probe:'R7ASM-SSCTR-r1-REGRESSION',at:new Date().toISOString(),node:process.version};
try{
 for(const [rel,d] of Object.entries(manifest.files)){if(sha(path.join(root,snap,rel))!==d)throw Error('predecessor copy drift '+rel);put(path.join(root,snap,rel),rel);}
 for(const p of ['CoachingCore/scripts/evaluate-holdout-r6.mjs','CoachingCore/scripts/simulate-r6.mjs','CoachingCore/r5/PROGRAM_POLICY_R5.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json','audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json'])if(!manifest.files[p]&&fs.existsSync(path.join(root,p)))put(path.join(root,p),p);
 const load=(base,rel)=>import(pathToFileURL(path.join(base,rel)).href),rt={};
 for(const [name,base] of [['predecessor',tmp],['stateModel',root]]){
  const ev=await load(base,'CoachingCore/scripts/evaluate-holdout-r6.mjs'),sim=await load(base,'CoachingCore/scripts/simulate-r6.mjs'),idx=await load(base,'CoachingCore/src/r6-index.mjs'),dev=await load(base,'CoachingCore/r6/fixtures/dev-authority.mjs'),prof=await load(base,'CoachingCore/r6/fixtures/profiles.mjs');
  rt[name]={ev:ev.evaluateHoldoutCase,sim:sim.simulateAll,gen:idx.generateProgram,authority:dev.devAuthority(),profiles:{...prof.PROFILES,...prof.EDGE_PROFILES}};
 }
 out.policyHash={predecessor:rt.predecessor.authority.policyHash,stateModel:rt.stateModel.authority.policyHash};
 const SKIP=new Set(['hash','digest','inputHashes','startAuthority','startBeforeReturnAuthority']);
 const norm=(x,key)=>Array.isArray(x)?x.map(v=>norm(v)):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).filter(([k])=>!SKIP.has(k)&&!/Hash$|Digest$/.test(k)&&!(key==='interruption'&&k==='stateAt')).map(([k,v])=>[k,norm(v,k)])):x;
 const diff=(a,b,at='',o=[])=>{if(o.length>=600)return o;if(JSON.stringify(a)===JSON.stringify(b))return o;if(a&&b&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b)){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],at+'/'+k,o);return o;}o.push({path:at,predecessor:JSON.stringify(a)?.slice(0,200)??null,stateModel:JSON.stringify(b)?.slice(0,200)??null});return o;};
 const statusLine=r=>r.steps?.length?r.steps.map(s=>`${s.result.status}/${s.result.action}`).join(' '):r.generation?.status??null;
 // Session-level dose tally: every program a case produces (the generated one, every step's proposal), sessions matched by id.
 const live=s=>s&&s.prescription&&s.status!=='SKIPPED';
 const programsOf=r=>[['generation',r.generation?.program??r.program??null],...(r.steps??[]).map((s,i)=>['step'+i,s.result?.proposal??null])];
 const rowOf=e=>({id:e.id,sets:e.sets,reps:e.reps,rir:e.rir,mode:e.load?.mode??null,value:Number.isFinite(e.load?.value)?e.load.value:null,ceiling:e.load?.ceiling?.value??null,kind:e.exposure?.kind??null,establishment:!!e.establishment});
 const runOf=p=>({family:p.family??null,minutes:p.durationMinutes??null,reps:p.work?.repetitions??null,work:p.work?.workMinutes??null,strides:p.strides?.repetitions??null,calibration:p.calibration?.basis??null,effortDomain:p.effortDomain??null});
 function tally(label,a,b){const t={rose:[],fell:0,kindChanged:[],sessionsOnlyIn:{predecessor:0,stateModel:0},rowsOnlyIn:{predecessor:[],stateModel:[]}};
  const A=new Map(programsOf(a)),B=new Map(programsOf(b));
  for(const [where,pa] of A){const pb=B.get(where);if(!pa||!pb)continue;
   const sa=new Map(pa.weeks.flatMap(w=>w.sessions.filter(live).map(s=>[s.id,{s,w:w.index}]))),sb=new Map(pb.weeks.flatMap(w=>w.sessions.filter(live).map(s=>[s.id,{s,w:w.index}])));
   for(const id of sa.keys())if(!sb.has(id))t.sessionsOnlyIn.predecessor++;for(const id of sb.keys())if(!sa.has(id))t.sessionsOnlyIn.stateModel++;
   for(const [id,{s:x,w}] of sa){const y=sb.get(id)?.s;if(!y)continue;const at=`${label} ${where} week ${w} ${x.date} ${x.sport}/${x.role}`;
    if(x.sport==='STRENGTH'){const ea=new Map((x.prescription.exercises??[]).map(e=>[e.id,rowOf(e)])),eb=new Map((y.prescription.exercises??[]).map(e=>[e.id,rowOf(e)]));
     for(const k of ea.keys())if(!eb.has(k))t.rowsOnlyIn.predecessor.push(at+' '+k);for(const k of eb.keys())if(!ea.has(k))t.rowsOnlyIn.stateModel.push(at+' '+k);
     for(const [k,ra] of ea){const rb=eb.get(k);if(!rb)continue;
      if(ra.mode!==rb.mode||ra.kind!==rb.kind)t.kindChanged.push({at:at+' '+k,predecessor:ra,stateModel:rb});
      for(const f of ['sets','reps','value']){if(!Number.isFinite(ra[f])||!Number.isFinite(rb[f])||ra[f]===rb[f])continue;if(rb[f]>ra[f])t.rose.push({at:at+' '+k,field:f,predecessor:ra,stateModel:rb});else t.fell++;}
      if(Number.isFinite(ra.rir)&&Number.isFinite(rb.rir)&&rb.rir<ra.rir)t.rose.push({at:at+' '+k,field:'rir (less reserve)',predecessor:ra,stateModel:rb});}}
    else if(x.sport==='RUN'){const ra=runOf(x.prescription),rb=runOf(y.prescription);
     if(ra.family!==rb.family||ra.calibration!==rb.calibration||ra.effortDomain!==rb.effortDomain)t.kindChanged.push({at,predecessor:ra,stateModel:rb});
     for(const f of ['minutes','reps','work','strides']){if(!Number.isFinite(ra[f])||!Number.isFinite(rb[f])||ra[f]===rb[f])continue;if(rb[f]>ra[f])t.rose.push({at,field:f,predecessor:ra,stateModel:rb});else t.fell++;}}}}
  return t;}
 // The return entry of every REESTABLISH decision in every step's proposal (sporting atoms only), on both runtimes.
 const entryAtoms=e=>e?{run:Object.fromEntries(Object.entries(e.run??{}).filter(([k])=>['mode','long','easy','quality','qualityStep','returnStep','easyWeeksDone','achieved','longestContinuous'].includes(k))),strength:Object.fromEntries(Object.entries(e.strength?.exercises??{}).map(([id,x])=>[id,Object.fromEntries(['mode','load','reps','sets','loadTick','returnStep','setCeiling','setCap','regainCap','ceiling','lastExecutedSets','lastPerformed'].filter(k=>x[k]!==undefined).map(k=>[k,x[k]]))]))}:null;
 const entriesOf=r=>(r.steps??[]).flatMap((s,i)=>s.result?.action==='REESTABLISH'?[{step:i,entry:entryAtoms(s.result.proposal?.decisions?.filter(d=>d.action==='REESTABLISH').at(-1)?.interruption?.entry)}]:[]);
 // Known-load and from-log rows (a from-log row is lifted at the load last logged) whose repetitions leave the goal's declared range
 // (operational.strength.goalDoses, for the program's current strength goal), per program a case produces.
 const ranges=rt.stateModel.authority.policy.operational.strength.goalDoses;
 const outOfRange=r=>programsOf(r).flatMap(([where,p])=>{if(!p)return [];const range=ranges[p.goal?.strength?.kind]?.repRange;if(!range)return [];
  return p.weeks.flatMap(w=>w.sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>['KNOWN','FROM_LOG'].includes(e.load?.mode)&&Number.isFinite(e.reps)&&(e.reps<range[0]||e.reps>range[1])).map(e=>`${where} week ${w.index} ${s.date} ${e.id} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}${Number.isFinite(e.load.value)?' '+e.load.value:''} (${p.goal.strength.kind} range ${range.join('-')})`)));});
 const corpus=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8')).cases;
 const run=(r,c)=>r.ev(structuredClone(c),{authority:r.authority});
 const against=cases=>cases.map(c=>{const a=run(rt.predecessor,c),b=run(rt.stateModel,c),x=norm(a),y=norm(b),same=JSON.stringify(x)===JSON.stringify(y);
  const ea=entriesOf(a),eb=entriesOf(b),oa=outOfRange(a),ob=outOfRange(b);
  return {caseId:c.caseId,operation:c.operation,identical:same,statusPredecessor:statusLine(a),statusStateModel:statusLine(b),repsOutsideGoalRange:{predecessor:oa.length,stateModel:ob.length,onlyStateModel:ob.filter(z=>!oa.includes(z)).slice(0,20)},...(same?{}:{tally:tally(c.caseId,a,b),returnEntries:{predecessor:ea,stateModel:eb,equal:JSON.stringify(ea)===JSON.stringify(eb)},differences:diff(x,y)})};});
 const h6=against(corpus('CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json')),h5=against(corpus('CoachingCore/r5/holdout/R5_INDEPENDENT_HOLDOUT.json'));
 const profiles=Object.keys(rt.stateModel.profiles).map(k=>{const a=norm(rt.predecessor.gen(structuredClone(rt.predecessor.profiles[k]),{authority:rt.predecessor.authority})),b=norm(rt.stateModel.gen(structuredClone(rt.stateModel.profiles[k]),{authority:rt.stateModel.authority}));return {label:k,identical:JSON.stringify(a)===JSON.stringify(b),...(JSON.stringify(a)===JSON.stringify(b)?{}:{differences:diff(a,b)})};});
 const sa=rt.predecessor.sim({authority:rt.predecessor.authority}),sb=rt.stateModel.sim({authority:rt.stateModel.authority});
 const simulations=sb.map((t,i)=>{const a=norm(sa[i]),b=norm(t),same=JSON.stringify(a)===JSON.stringify(b);return {label:t.id,identical:same,...(same?{}:{differences:diff(a,b)})};});
 const sum=l=>({cases:l.length,identical:l.filter(x=>x.identical).length,different:l.filter(x=>!x.identical).map(x=>x.caseId??x.label),statusChanged:l.filter(x=>x.statusPredecessor!==undefined&&x.statusPredecessor!==x.statusStateModel).map(x=>`${x.caseId}: ${x.statusPredecessor} -> ${x.statusStateModel}`)});
 const all=[...h6,...h5].filter(x=>x.tally);
 Object.assign(out,{ignored:[...SKIP,'*Hash/*Digest','interruption.stateAt'],summary:{r6FreshHoldout:sum(h6),r5Corpus:sum(h5),profiles:sum(profiles),simulations:sum(simulations)},
  doseTally:{rose:all.flatMap(x=>x.tally.rose),fell:all.reduce((n,x)=>n+x.tally.fell,0),kindChanged:all.reduce((n,x)=>n+x.tally.kindChanged.length,0),returnEntriesDiffer:all.filter(x=>!x.returnEntries.equal).map(x=>x.caseId)},
  repsOutsideGoalRange:{predecessor:[...h6,...h5].reduce((n,x)=>n+x.repsOutsideGoalRange.predecessor,0),stateModel:[...h6,...h5].reduce((n,x)=>n+x.repsOutsideGoalRange.stateModel,0),onlyStateModel:[...h6,...h5].flatMap(x=>x.repsOutsideGoalRange.onlyStateModel.map(z=>x.caseId+' '+z))},
  differing:{r6FreshHoldout:h6.filter(x=>!x.identical),r5Corpus:h5.filter(x=>!x.identical),profiles:profiles.filter(x=>!x.identical),simulations:simulations.filter(x=>!x.identical)}});
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
console.log(JSON.stringify(out,null,1));
