// R7-D Phase 5: the witness grids of the two Phase 4 judgments, re-run on R7D-FREEZE-5 and on the candidate (QRE-P4-K02: "the witness grid of this
// record re-run"; SSCTR CND-2: "directed tests on F13's shape and the witness").
//  - QRE grid (QRE-R7D-FINAL-HOLDOUT-r1, witness-f13-20261108d w.mjs, w2.mjs, w4.mjs): R7D-F13's athlete silent at five review points; every H1
//    intake whose generated plan has a CONSOLIDATION week c >= 5 in easy running, reviewed silent at the end of week c-1 (and c-2 as control); F25.
//  - SSCTR witness W-D49 (SSCTR-R7D-P4-FINAL-HOLDOUT-r1, witness-d49.mjs): F14's athlete, arm A (break before any strength) and control arm B.
//  - R7D-F13's own three steps (the return and its strength doses).
// The intakes are read, never edited, from the spent Phase 4 holdout (final/ is never evaluated again: no holdout case is evaluated here, only the
// judges' derived timelines). Writes one JSON file (--out, never overwritten).
//   node phase5-witness-grid.mjs --f5 <R7D-FREEZE-5 root> --out <file>
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const AUD=path.resolve(import.meta.dirname,'../..'),REPO=path.resolve(AUD,'../..'),f5=arg('--f5'),outFile=arg('--out');
if(!f5||!outFile)throw Error('--f5 <root> --out <file>');if(fs.existsSync(outFile))throw Error('--out exists');
const {loadRuntime,runCase}=await import(pathToFileURL(path.join(AUD,'harness/lib/client.mjs')).href);
const {evaluateProperties}=await import(pathToFileURL(path.join(AUD,'harness/lib/properties-8.mjs')).href);
const corpusPath=path.join(AUD,'final/R7D_FINAL_HOLDOUT.json'),corpus=JSON.parse(fs.readFileSync(corpusPath,'utf8'));
const ctx={policy:JSON.parse(fs.readFileSync(path.join(REPO,'CoachingCore/r6/PROGRAM_POLICY_R6.json'),'utf8')),catalog:JSON.parse(fs.readFileSync(path.join(REPO,'CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json'),'utf8'))};
const clone=x=>JSON.parse(JSON.stringify(x)),byId=id=>clone(corpus.cases.find(c=>c.caseId===id));
const runs=w=>w?w.sessions.filter(x=>x.sport==='RUN'&&x.prescription&&x.status!=='SKIPPED').map(x=>x.role+':'+x.prescription.durationMinutes):[];
const strength=(p,w)=>(p?.weeks[w]?.sessions??[]).filter(x=>x.sport==='STRENGTH'&&x.prescription).flatMap(x=>x.prescription.exercises.map(e=>`${x.id}:${e.id}:${e.sets}x${e.reps}@rir${e.rir}:${e.exposure?.kind??'-'}`));
async function grid(root){
 const rt=await loadRuntime(path.join(root,'CoachingCore')),rows=[];
 const silent=(id,k)=>{const t=runCase(rt,k),s=t.steps[0];if(!s)return {id,error:t.stopped};const r=s.result,p=evaluateProperties(t,ctx);
  return {id,week:s.weekIndex,nextPhase:s.planBefore.weeks[s.weekIndex+1]?.phase??null,status:r.status,validity:r.planValidity?.status??null,question:r.question?.kind??null,nextBefore:runs(s.planBefore.weeks[s.weekIndex+1]),nextAfter:runs(s.planAfter.weeks[s.weekIndex+1]),P03:p.P03.violations.map(x=>x.issue)};};
 const f13=byId('R7D-F13'),v=(id,fn)=>{const k=clone(f13);k.caseId='W-'+id;k.timeline=[k.timeline[0]];fn(k);return [id,k];};
 for(const [id,k] of [v('F13_AS_IS',k=>{}),v('F13_S1_W6_END',k=>{k.timeline[0].at={week:6,day:6,time:'20:00'};}),v('F13_S1_W5_END',k=>{k.timeline[0].at={week:5,day:6,time:'20:00'};}),v('F13_S1_W7_STRENGTH_REPORTED',k=>{k.timeline[0].observations=[{each:{weeks:[7],sport:'STRENGTH'},completed:true,asPrescribed:true}];}),v('F13_S1_W8_MONDAY',k=>{k.timeline[0].at={week:8,day:0,time:'07:00'};})])rows.push({grid:'QRE_F13_VARIANTS',...silent(id,k)});
 for(const base of corpus.cases){let g;try{g=rt.generateProgram(clone(base.intake));}catch{continue;}if(g.status!=='PROPOSED'||!g.program)continue;
  const P=g.program,c=P.weeks.findIndex((w,i)=>i>=5&&w.phase==='CONSOLIDATION'&&P.stateTrace?.[i]?.run?.mode==='EASY'&&w.sessions.some(s=>s.sport==='RUN'));if(c<0)continue;
  for(const [label,wk] of [['CONSOL',c-1],['CONTROL',c-2]]){const k=clone(base);k.caseId=`W2-${base.caseId}-${label}`;k.timeline=[{stepId:'s1',at:{week:wk,day:6,time:'20:00'},event:{kind:'WEEKLY_REVIEW'}}];rows.push({grid:'QRE_CONSOLIDATION',...silent(k.caseId,k)});}}
 {const k=byId('R7D-F25');k.caseId='W4-R7D-F25';k.timeline=[{stepId:'s1',at:{week:7,day:6,time:'20:00'},event:{kind:'WEEKLY_REVIEW'}}];rows.push({grid:'QRE_F25',...silent(k.caseId,k)});}
 // W-D49, rebuilt from the SSCTR record.
 const f14=byId('R7D-F14'),mk=(id,obs,start)=>({...clone(f14),caseId:id,expectedDomainProperties:[],metamorphicRelations:[],timeline:[{stepId:'s1',at:{week:3,day:6,time:'20:00'},event:{kind:'WEEKLY_REVIEW',interruption:{startDate:start,endDate:'2027-01-08',reasonCategory:'FAMILY',reason:'family visit abroad',nonclinical:true}},observations:obs},{stepId:'s2',at:{week:4,day:6,time:'20:00'},event:{kind:'WEEKLY_REVIEW'},observations:[{each:{weeks:[4],sport:'RUN'},completed:true,asPrescribed:true},{each:{weeks:[4],sport:'STRENGTH'},completed:true,asPrescribed:true}]}]});
 for(const [id,obs,start] of [['W-D49-A',[],'2026-12-14'],['W-D49-B',[{each:{weeks:[0],sport:'RUN'},completed:true,asPrescribed:true},{each:{weeks:[0],sport:'STRENGTH'},completed:true,asPrescribed:true}],'2026-12-21']]){
  const t=runCase(rt,mk(id,obs,start));rows.push({grid:'SSCTR_W_D49',id,s1:t.steps[0]?.result.action??null,week4Entry:strength(t.steps[0]?.planAfter,4),s2:t.steps[1]?.result.status??null,week5Step2:strength(t.steps[1]?.planAfter,5),week6:strength(t.steps[1]?.planAfter,6)});}
 // R7D-F13's own three steps.
 {const t=runCase(rt,byId('R7D-F13'));rows.push({grid:'F13_TIMELINE',id:'R7D-F13',steps:t.steps.map(s=>({step:s.stepId,status:s.result.status,action:s.result.action,validity:s.result.planValidity?.status??null,question:s.result.question?.kind??null,week8:strength(s.planAfter,8),week9:strength(s.planAfter,9),week10:strength(s.planAfter,10),runs8to10:[8,9,10].map(w=>runs(s.planAfter.weeks[w]))}))});}
 return rows;
}
const srcOf=cc=>createHash('sha256').update(JSON.stringify(Object.fromEntries(fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>[f,createHash('sha256').update(fs.readFileSync(path.join(cc,'src',f))).digest('hex')])))).digest('hex');
const before=await grid(f5),after=await grid(REPO);
const asks=rows=>rows.filter(r=>r.grid?.startsWith('QRE')).map(r=>({id:r.id,question:r.question,P03:r.P03}));
const out={probe:'R7D-PHASE5-WITNESS-GRID-1',holdoutIntakesFrom:{path:path.relative(REPO,corpusPath).split(path.sep).join('/'),sha256:createHash('sha256').update(fs.readFileSync(corpusPath)).digest('hex')},
 runtimes:{freeze5:{label:'R7D-FREEZE-5',srcDigest:srcOf(path.join(f5,'CoachingCore'))},candidate:{label:'the working-tree candidate',srcDigest:srcOf(path.join(REPO,'CoachingCore'))}},freeze5:before,candidate:after,
 summary:{qre:{freeze5:{asked:asks(before).filter(r=>r.question==='UNREPORTED_TRAINING').length,p03Failing:asks(before).filter(r=>r.P03.length).map(r=>r.id)},candidate:{asked:asks(after).filter(r=>r.question==='UNREPORTED_TRAINING').length,notAsked:asks(after).filter(r=>r.question!=='UNREPORTED_TRAINING').map(r=>r.id),p03Failing:asks(after).filter(r=>r.P03.length).map(r=>r.id)},rows:asks(after).length},
  wd49:{A:{freeze5:before.find(r=>r.id==='W-D49-A'),candidate:after.find(r=>r.id==='W-D49-A')},controlBSame:JSON.stringify(before.find(r=>r.id==='W-D49-B'))===JSON.stringify(after.find(r=>r.id==='W-D49-B'))}},ran:new Date().toISOString(),node:process.version};
fs.writeFileSync(outFile,JSON.stringify(out,null,1)+'\n',{flag:'wx'});
console.log(JSON.stringify({qre:out.summary.qre,wd49ControlSame:out.summary.wd49.controlBSame},null,1));
