// R7-A.1 mutation check: each mutation reverts one fix in a temporary copy of the current runtime (never in CoachingCore/) and runs the R7-A
// and R7-A.1 tests there. A fix is pinned when at least one test fails under its mutation. The 34 R7-A reverts are kept, re-anchored where
// R7-A.1 moved their code (the anchor string names the file it now lives in); the R7-A.1 reverts follow. Author check, not a gate.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'../../..'),cc=path.join(root,'CoachingCore'),TESTS=['test/r7a-semantic-core.test.mjs','test/r7a-cycle2.test.mjs','test/r7a1-composition.test.mjs','test/r7a1-correction.test.mjs'];
const P='src/r6-program.mjs',A='src/r6-adaptation.mjs',C='src/r6-composition.mjs',V='src/r6-provenance.mjs',I='src/r6-intake.mjs';
const MUTATIONS=[
 // R7-A first cycle.
 ['D53 regain only for a known-load state',P,"else if(on&&kind==='REESTABLISH'){","else if(on&&kind==='REESTABLISH'&&ex.mode==='KNOWN'){"],
 ['D54 re-establishment skips the phase reduction',P,"const sets=Math.min(cap,phasedSets),rir=Math.max(c.rirFloor??-Infinity,phasedRir)","const sets=c.kind==='REESTABLISH'?Math.min(cap,c.basis):Math.min(cap,phasedSets),rir=c.kind==='REESTABLISH'?Math.max(c.rirFloor,c.rirBase):Math.max(c.rirFloor??-Infinity,phasedRir)"],
 ['C17 validation without the phase-dose check',P,"if(Number.isInteger(e.exposure?.phaseBasis)&&e.sets>phaseDose(sk.op,P,e.exposure.phaseBasis,e.rir)[0])bad('sets');","/* removed */"],
 ['R19 the last prescribed exposure decides the week',P,"u=done[0]??list.at(-1),uc=","u=list.at(-1),uc="],
 ['Counts from the first executed exposure (R7-A survivor, QE-R7A-22)',P,"uc=done.at(-1)??list.at(-1)","uc=done[0]??list.at(-1)"],
 ['C11 every exercise in the state decides the entry week',P,"const entryWeek=ss.entryWeek===true||[...inUse].some(id=>ss.exercises[id]?.returnStep===0);","const entryWeek=ss.entryWeek===true||Object.values(ss.exercises).some(e=>e.returnStep===0);"],
 ['C12 a set without reps counts as zero reps',A,"reps=sets.map(x=>x.reps).filter(x=>Number.isFinite(x)&&x>=0),repsKnown=reps.length===sets.length;","reps=sets.map(x=>Number.isFinite(x.reps)?x.reps:0),repsKnown=true;"],
 ['C16 a dated change is applied from next week',A,"if(isoDay(ch.to))return {action:'ASK'","if(false)return {action:'ASK'"],
 ['C18 a race is complete only near its window',A,"minutesOk=s.sport==='STRENGTH'||s.role==='RACE'||","minutesOk=s.sport==='STRENGTH'||"],
 ['C10 the carried record drops superseded facts',A,"actualLedger:[...ledger,...n.supersededRows],","actualLedger:ledger,"],
 ['C10 normalizer forgets carried history',V,"if(carried&&o.superseded===true){","if(false){"],
 ['C09 exercise logs ignored when two reports agree on time',V,"const ex=exerciseFacts(x),ey=exerciseFacts(y);","const ex={},ey={};"],
 ['C07 last record wins',I,"const l=lead(x,e),","const l=e,"],
 // R7-A second cycle (now in the composition module where R7-A.1 moved them).
 ['QE-01 a same-week review ignores the return stored for next week',C,"export const rebasedNext=(program,w)=>{","export const rebasedNext=(program,w)=>null&&{"],
 ['QE-02 a session later the same day is not ahead',C,"return s=>!!s&&(s.date>ctx.asOfLocal||s.date===ctx.asOfLocal&&!reported.has(s.id)&&!(s.turn==='AM'&&pastNoon));","return s=>!!s&&s.date>ctx.asOfLocal;"],
 ['QE-03 an event change never reaches this week',A,"const reachesThisWeek=program.weeks[ctx.w].sessions.some(","const reachesThisWeek=false&&program.weeks[ctx.w].sessions.some("],
 ['QE-04 executed history re-validated against new phases',P,"||history?.has(x.id))continue;",")continue;"],
 ['QE-05 a second report replaces the exercise list',V,"previous.actual=mergeActual(","previous.actual=((p,q)=>q.actual)("],
 ['QE-06 repetitions and reserve not compared per exercise',V,"for(const k of ['reps','rir'])if(Number.isFinite(f[k])","for(const k of [])if(Number.isFinite(f[k])"],
 ['QE-07 a load in pounds is no load',V,"u==='LB'?","u==='__LB'?"],
 ['QE-08 a carried superseded row answers only to its own id',V,"for(const id of [o.eventId,...Object.keys(o.provenance?.inputHashes??{}),...(o.provenance?.mergedSourceIds??[])])if(!byEvent.has(id))byEvent.set(id,row);supersededRows.push(row);continue;}","if(!byEvent.has(o.eventId))byEvent.set(o.eventId,row);supersededRows.push(row);continue;}"],
 ['QE-09 an exact replay compared with the merged row',V,"(sameEvent.provenance?.inputHashes?.[o.eventId]??sameEvent.inputHash)","sameEvent.inputHash"],
 ['QE-10 a move ignores the dose its new date allows',C,"phaseOf(s)===phaseOf(target)&&sameKind(s.date)&&fits(s.date));","phaseOf(s)===phaseOf(target)&&fits(s.date));"],
 ['QE-11 malformed window dates read as a window',A,"for(const k of ['from','to'])if(ch[k]!==undefined&&ch[k]!==null&&!isoDay(ch[k]))invalid.push('changes.'+k);","/* removed */"],
 ['QE-12 logged repetitions replace the target on any gate',P,"ex.reps=progression&&!(advancedGate(k)&&Number.isFinite(log.reps))?ex.reps:log.reps??ex.reps;","ex.reps=log.reps??ex.reps;"],
 ['QE-12 a newly established load keeps the old repetition target',P,"ex.reps=progression&&!(advancedGate(k)&&Number.isFinite(log.reps))?ex.reps:log.reps??ex.reps;","ex.reps=!(advancedGate(k)&&Number.isFinite(log.reps))?ex.reps:log.reps??ex.reps;"],
 ['QE-13 the label breaks a same-date tie',I,"said(a)!==said(b)?(said(a)<said(b)?a:b):",""],
 ['QE-14 the projection reads the untrimmed count',P,"const afterFit=x=>Math.min(phasedOf(x),Number.isInteger(x.fittedSets)?x.fittedSets:x.sets);","const afterFit=x=>Math.min(phasedOf(x),x.sets);"],
 ['R20 the ceiling reads the last exposure, not the largest whole count',P,"ex.lastExecutedSets=Math.max(...whole);","ex.lastExecutedSets=whole.at(-1);"],
 ['QE-14 a fatigue reduction is not a reduction',C,",...(e.exposure?{exposure:{...e.exposure,phasedSets:Math.min(e.exposure.phasedSets??e.sets,Math.max(1,e.sets-1))}}:{})",""],
 ['QE-15 a rebuild forgets the entry week',P,"const entryWeek=ss.entryWeek===true||[...inUse]","const entryWeek=[...inUse]"],
 ['QE-16 a new report can claim to be history',V,"if(!carried){delete o.superseded;delete o.supersededBy;delete o.supersededAt;}\n  if(carried&&o.superseded===true){","if(o.superseded===true){"],
 ['QE-17 the review reads a practice row by its role',C,"practice:e.exposure?.kind==='PRACTICE'||e.role==='PRACTICE'","practice:e.role==='PRACTICE'"],
 ['D55 a fresh exercise in a returning week starts outside the return',P,":returningWeek?{returnInBlock:true,",":false?{returnInBlock:true,"],
 // R7-A.1.
 ['A1 C1 an evening review re-plans a morning session',C,"&&!(s.turn==='AM'&&pastNoon)",""],
 ['A1 C1 a re-plan rewrites history rows',C,"const ahead=aheadOf(ctx),keep=s=>!ahead(s)||!sports.includes(s.sport)","const ahead=aheadOf(ctx),keep=s=>!sports.includes(s.sport)"],
 ['A1 C3 a re-plan of this week forgets the return stored for next week',C,"rebased=fromWeek===w&&!start?rebasedNext(next,w):null","rebased=null"],
 ['A1 C3 a complete week re-planned from the conditional plan',C,"fromWeek===w&&!ctx.ev?.pending&&evidence?evidence(","false?evidence("],
 ['A1 C3 a re-plan from next week holds mid-week',A,"gates?evidenceStart(ctx,program,skn,{gates}):conditionalNext(ctx,skn,ctx.w,weekAsPlanned(ctx,program,ctx.w))","evidenceStart(ctx,program,skn,{gates:gates??{ALL:'HOLD'}})"],
 ['A1 C5 a pre-return session counts in the re-entry’s conditional plan',C,"done={...week,sessions:week.sessions.filter(s=>!before(s))}","done=week"],
 ['A1 C4 recorded adaptations are not applied again',C,"for(const a of [...(next.weeks[i].adaptations??[]),...(carry?[carry]:[])]){","for(const a of [...(carry?[carry]:[])]){"],
 ['A1 C4 adaptations are not recorded',C,"adaptations:[...(x.adaptations??[]),fact]","adaptations:x.adaptations??[]"],
 ['A1 C4 a re-applied adaptation touches kept rows',C,"sk:at(i),w:i,ahead:fresh,","sk:at(i),w:i,ahead,"],
 ['A1 C4 a consumed move is applied again',C,"if(!target||!slot||!env.ahead(slot))return {sessions};","if(!target||!slot)return {sessions};"],
 ['A1 C2 a context change rewrites the weeks before it',C,"  if(s.from<j)out.push({...s,until:j});\n",""],
 ['A1 C2 weeks built under the latest context',P,"history=[...(options.completedRuns??[])],at=i=>sk.at?.(i)??sk;","history=[...(options.completedRuns??[])],at=i=>sk;"],
 ['A1 C2 weeks validated under the latest context',P,"const {cap,goal,plan}=sk,errors=[],at=i=>sk.at?.(i)??sk;","const {cap,goal,plan}=sk,errors=[],at=i=>sk;"],
 ['A1 C2 phases merged where the context starts',C,"apply(s.context,Math.max(s.from,j),j)","apply(s.context,Math.max(s.from,j),Math.max(s.from,j))"],
 ['A1 C2 a goal change applies the latest context’s goals',A,"canonical:x=>({...x,goals:stated(x.goals)})","canonical:x=>({...x,goals:clone(c.goals)})"],
 ['A1 C2 a permanent equipment change from a later date applies now',A,"const permanent=!to&&from<=asOfLocal,","const permanent=!to,"],
 ['A1 C5 the oldest equipment window wins',P,"windows.findLast(x=>","windows.find(x=>"],
 ['A1 C5 a newer return keeps the earlier one’s adaptations',A,".filter(a=>!['RETURN_WAIT','SHORT_RETURN_EASY'].includes(a.kind)),y={...x}",".filter(a=>true),y={...x}"],
 ['A1 C5 a pre-break session moves into the re-entry',C," if(beforeReturn(program,env.returned)(target))return [];\n",""],
 ['A1 C7 two races ahead pass validation',A,"...(races.length>1?['duplicateRace:'+races.map(s=>s.id).join('+')]:[])","...[]"],
 ['A1 D56 a trimmed week raises or ends the caps',P,"const wholeWeek=Number.isInteger(baseOf(uc))?afterFit(uc)===baseOf(uc):unreduced;","const wholeWeek=unreduced;"],
 ['A1 D56 a row written before R7-A reads a trimmed week as whole',P,"const baseOf=x=>Number.isInteger(x.baseSets)?x.baseSets:Number.isInteger(planned[id]?.baseSets)?planned[id].baseSets:null;","const baseOf=x=>Number.isInteger(x.baseSets)?x.baseSets:null;"],
 ['A1 QE-12 a lighter known-load shortfall sets the target',P,"const progression=uLog.mode==='KNOWN'||","const progression="],
 ['A1 QE-05 an agreeing report does not fill unknown fields',V,"if(!readable[k](t[k])&&readable[k](o[k])){if(known(t[k]))t.unreadable={...t.unreadable,[k]:clone(t[k])};t[k]=clone(o[k]);}",""],
 ['A1 QE-05 a full tie decided by arrival order',V,"return byCodePoint(hash(x),hash(y))<=0?filled(x,y):filled(y,x);","return filled(x,y);"],
 ['A1 the planned counts read after the fit',C,"plannedStrengthOf(usedInWeek(week).map(u=>({...u,sets:u.phasedSets??u.sets})))","plannedStrengthOf(usedInWeek(week))"],
 ['A1 QE-02 a short return’s easy slot is not recorded',A,"if(cls==='SHORT')base={...base,","if(false)base={...base,"],
 ['A1 C3 a change from a later week counts only executed runs before it',C,"completedRuns=executedOr(fromWeek);",""],
 ['A1 C5 a permanent equipment change keeps the earlier windows',A,"const kept=before(canonical.equipmentWindows??[]);if(kept.length)canonical.equipmentWindows=kept;else delete canonical.equipmentWindows;",""],
 ['A1 C1 rows of one slot follow the order the change met them',C,".sort((a,b)=>bySlot(a,b)||order(a)-order(b))",".sort(bySlot)"],
 ['A1 C5 a newer return starts from the start an earlier return replaced',A,"prior=program.weeks[pauseWeek]?.startBeforeReturn??program.stateTrace[pauseWeek]??program.stateTrace[0]","prior=program.stateTrace[pauseWeek]??program.stateTrace[0]"],
 ['A1 C5 an event change out of the event window starts next week',A,"return now!==was&&(eventDay(now)||eventDay(was));","return now!==was&&eventDay(now);"],
 ['A1 C4 a move may use a skipped slot',C,"&&s.prescription&&s.status!=='SKIPPED'&&!s.key&&","&&s.prescription&&!s.key&&"],
 ['A1 C4 a later adaptation ignores the earlier ones on what it moves',C,"for(const a of moved.size?program.weeks[w].adaptations??[]:[])","for(const a of [])"],
 ['A1 C4 a later review drops the fatigue signal of the week',A,"||(ctx.program.weeks[ctx.w]?.adaptations??[]).some(a=>a.kind==='SYSTEMIC_SIGNAL')",""],
 ['A1 C4 a waiting session keeps the skip of an earlier adaptation',C,"{...(({status,movedTo,...row})=>row)(s),role:'REST_BY_DESIGN',","{...s,role:'REST_BY_DESIGN',"],
 ['A1 C4 an event conflict skips a day with no session',C,"sessions.map(s=>dates.has(s.date)&&s.prescription&&s.role!=='RACE'&&env.ahead(s)?","sessions.map(s=>dates.has(s.date)&&s.role!=='RACE'&&env.ahead(s)?"],
 ['A1 C2 a dated goal change applies from next week',A,"const statedFrom=isoDay(ch.from)?program.weeks.findIndex((x,i)=>i>ctx.w&&x.startDate>=ch.from):ctx.w+1;","const statedFrom=ctx.w+1;"],
 ['A1 C2 a change from a later week starts from its old start',C,"if(!start&&fromWeek>w+1)start=conditionalNext(ctx,at(fromWeek),fromWeek-1,weekAsPlanned(ctx,next,fromWeek-1,{sports,completedRuns:executedOr(fromWeek-1)}),null);",""],
 ['A2 QE-R7A1-01 a move ignores the equipment of its slot date',C,"&&sameKind(s.date)&&fits(s.date));","&&sameKind(s.date));"],
 ['A2 QE-R7A1-01 the final validation ignores equipment',P,"if((e.equipment??[]).some(q=>!have.has(q)))errors.push(`${x.id}:equipmentUnavailable:${e.id}`);",""],
 ['A2 QE-R7A1-01 an equipment statement with nothing to substitute is not recorded',A,"if(hash(next.canonical)===hash(program.canonical))return {action:'KEEP',","if(true)return {action:'KEEP',"],
 ['A2 QE-R7A1-02 the evidence rule ignores the systemic determination',A,"{systemic:systemicSignal||systemicOf(ctx)}","{systemic:systemicSignal}"],
 ['A2 QE-R7A1-02 confirmations are not recorded on the week',A,"if(Object.keys(confirmations).length)ctx.program=","if(false)ctx.program="],
 ['A2 QE-R7A1-04 fatigue skips the sessions ahead today',C,"if(!(s.prescription&&env.ahead(s)))return s;","if(!(s.date>env.asOfLocal&&s.prescription&&env.ahead(s)))return s;"],
 ['A2 QE-R7A1-04 an unavailable day skips the sessions ahead today',C,"const hit=sessions.filter(s=>dates.has(s.date)&&s.prescription&&env.ahead(s));","const hit=sessions.filter(s=>dates.has(s.date)&&s.date>env.asOfLocal&&s.prescription&&env.ahead(s));"],
 ['A2 QE-R7A1-04 an event conflict skips the sessions ahead today',C,"sessions.map(s=>dates.has(s.date)&&s.prescription&&s.role!=='RACE'&&env.ahead(s)?","sessions.map(s=>dates.has(s.date)&&s.date>env.asOfLocal&&s.prescription&&s.role!=='RACE'&&env.ahead(s)?"],
 ['A2 QE-R7A1-05 an unreadable value counts as known in the merge',V,"readable={load:v=>!!kgOf(v),reps:Number.isFinite,rir:Number.isFinite}","readable={load:known,reps:known,rir:known}"],
 ['A2 D57 the return cap ends on the ending week’s count',P,"ex.setCap>=p.normalSets+(blockSet?1:0)","ex.setCap>=p.normalSets"],
 ['A2 D57 the return cap ends after a week that was not whole',P,"if(!returning&&Number.isInteger(ex.setCap)&&executed&&wholeWeek){ex.setCap=Math.min(Number.isInteger(ex.setCeiling)?ex.setCeiling:Infinity,ex.setCap+1);if(","if(!returning&&Number.isInteger(ex.setCap)){if(executed&&wholeWeek)ex.setCap=Math.min(Number.isInteger(ex.setCeiling)?ex.setCeiling:Infinity,ex.setCap+1);if("],
 ['A2 D58 the easy slot stays in the re-entry week',C,"if(!r.slot){carry=a;continue;}","if(false){carry=a;continue;}"],
 ['A2 D58 a later re-plan makes a second slot easy',C,"q=sessions.find(s=>s.explanation===EASY_SLOT)??sessions.find(","q=sessions.find("],
 ['A2 D58 a skipped quality slot is the easy slot',C,"s.prescription&&s.status!=='SKIPPED'&&ahead(s));return {slot","s.prescription&&ahead(s));return {slot"],
 ['A2 D58 a skipped easy slot does not pass on',C,"let carry=held&&!shortReturnEasy({ahead:()=>false},prior.sessions,held).slot?held:null;","let carry=null;"],
 ['A2 C5 a same-day session past at the return report moves into the re-entry',C,"s.date<ret.day||s.date===ret.day&&!aheadOf({program,asOf:ret.asOf,asOfLocal:ret.day,fullLedger:[]})(s)","s.date<ret.day"]
];
// A surviving mutant is accepted only with a stated reason (searched, not proven equivalent).
const DOCUMENTED={
 'A1 C7 two races ahead pass validation':'A fail-closed guard of the final validation for a state no composition path is known to produce: the class it guards (an event change that leaves the earlier race) is pinned by the QE-R7A-03 test through its cause (mutations of C3/C5 above). Kept as defence in depth; not a behaviour of any known path.'
};
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7a1-mut-')),results=[];
try{
 const copyDir=rel=>fs.cpSync(path.join(cc,rel),path.join(tmp,'CoachingCore',rel),{recursive:true});
 for(const rel of ['src','r6/fixtures'])copyDir(rel);
 fs.mkdirSync(path.join(tmp,'CoachingCore/test'),{recursive:true});
 for(const t of TESTS)fs.copyFileSync(path.join(cc,t),path.join(tmp,'CoachingCore',t));
 fs.copyFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),path.join(tmp,'CoachingCore/r6/PROGRAM_POLICY_R6.json'));
 fs.copyFileSync(path.join(cc,'package.json'),path.join(tmp,'CoachingCore/package.json'));
 const run=()=>{const r=spawnSync(process.execPath,['--test',...TESTS],{cwd:path.join(tmp,'CoachingCore'),encoding:'utf8',maxBuffer:64*1024*1024});const failed=[...r.stdout.matchAll(/^✖ (.+?) \(\d/gm)].map(m=>m[1]).filter(n=>n!=='failing tests:');return {code:r.status,failed:[...new Set(failed)]};};
 const clean=run();if(clean.code!==0)throw Error('The unmutated copy fails: '+clean.failed.join('; '));
 for(const [name,file,from,to] of MUTATIONS){
  const f=path.join(tmp,'CoachingCore',file),orig=fs.readFileSync(f,'utf8');
  if(orig.split(from).length!==2){results.push({mutation:name,file,applied:false,reason:'anchor not found exactly once'});continue;}
  fs.writeFileSync(f,orig.replace(from,()=>to));
  const r=run();fs.writeFileSync(f,orig);
  results.push({mutation:name,file,applied:true,caught:r.code!==0,failingTests:r.failed,...(r.code===0&&DOCUMENTED[name]?{documented:DOCUMENTED[name]}:{})});
 }
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
const out={check:'R7A1-MUTATION-1',runAt:new Date().toISOString(),scope:TESTS.join(' + ')+' against single-fix reverts in a temporary copy',caught:results.filter(r=>r.caught).length,applied:results.filter(r=>r.applied).length,total:results.length,documentedSurvivors:results.filter(r=>r.applied&&!r.caught&&r.documented).length,undocumentedSurvivors:results.filter(r=>r.applied&&!r.caught&&!r.documented).map(r=>r.mutation),notApplied:results.filter(r=>!r.applied).map(r=>r.mutation),results};
fs.writeFileSync(path.join(import.meta.dirname,process.env.MUT_OUT??'mutation-check-r7a1.out.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({caught:out.caught,applied:out.applied,total:out.total,undocumented:out.undocumentedSurvivors,notApplied:out.notApplied}));
