// QE probe J (two readings of one week; R7-A regression candidate): fitStrengthSession trims sets to fit the athlete's time AFTER
// strengthDose, so a row's `sets` can be below its `exposure.baseSets` with no phase reduction. The plan-time `used` (projection) keeps
// the untrimmed count; the review-time `usedInWeek` reads the trimmed row count against the untrimmed exposure.baseSets. R7-A's
// transition treats sets !== baseSets as a phase-reduced week, so a budget trim blocks the return/regain count and lastExecutedSets.
import {cur,pre,opts,intake,review,obs,rows,fmt,addDays,out} from './qe-lib.mjs';
const tag=process.env.QE_RUNTIME==='pre'?'PRE_R7A':'CURRENT',R=tag==='PRE_R7A'?await pre():cur;
const ia={id:'qe-J',athlete:{exerciseRotationPreference:'FIXED'},schedule:{strengthMinutes:30}};
const g=R.generateProgram(intake({weeks:16,...ia}),opts);let p=g.program,ledger=[];const log=[];
const trimmed=P=>{let n=0;const ex=[];for(let w=0;w<P.weeks.length;w++)for(const {s,e} of rows(P,w))if(e.exposure&&e.sets<e.exposure.baseSets&&e.exposure.phase===P.weeks[w].phase&&['DEVELOPMENT','BUILD','ESTABLISHMENT','NEXT_BLOCK'].includes(e.exposure.phase)){n++;if(ex.length<3)ex.push(fmt(s,e)+` baseSets=${e.exposure.baseSets}`);}return {n,ex};};
const step=(w,extra={},list=null)=>{const r=R.evaluateProgram(p,review(p,w,{observations:list??p.weeks[w].sessions.filter(s=>s.prescription).map(s=>obs(p,s)),actualLedger:ledger,...extra}),opts);log.push(`${w}:${r.status}/${r.action}`);ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;return r;};
for(let w=0;w<4;w++)step(w);
// A moderate (16-day) break in weeks 4-5, reported mid-week 6 (two or more sessions left), then weeks 6-13 executed as prescribed.
step(4,{},[]);step(5,{},[]);
const W=6;step(W,{day:0,hour:'06',kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(p.weeks[W].startDate,-16),endDate:addDays(p.weeks[W].startDate,-1),reasonCategory:'TRAVEL',reason:'Work travel'}},[]);
for(let w=W;w<14;w++)step(w);
const sq=w=>rows(p,w).filter(x=>x.e.id==='back-squat').map(x=>`${x.e.sets}x@${x.e.rir}${x.e.exposure?` base=${x.e.exposure.baseSets} normal=${x.e.exposure.normalSets} kind=${x.e.exposure.kind}`:''}`);
const st=w=>{const e=p.stateTrace[w]?.strength?.exercises?.['back-squat'];return e?{returnStep:e.returnStep??null,setCap:e.setCap??null,setCeiling:e.setCeiling??null,lastExecutedSets:e.lastExecutedSets??null}:null;};
out('J',{runtime:tag,status:g.status,trimmedRowsInUnreducedPhases:trimmed(g.program),log:log.join(' '),backSquatByWeek:Object.fromEntries([...Array(15).keys()].map(w=>[`w${w}`,{rows:sq(w),stateAtStart:st(w)}]))});
// Every exercise: prescribed sets per session and state caps at week start, for a cross-runtime diff.
const all={};for(let w=0;w<15;w++){for(const {s,e} of rows(p,w))(all[e.id]??={})[`w${w}`]=[...((all[e.id]??{})[`w${w}`]??[]),e.sets];for(const [id,e] of Object.entries(p.stateTrace[w]?.strength?.exercises??{})){(all[id]??={});all[id][`cap${w}`]=[e.setCap??null,e.regainCap??null,e.setCeiling??null,e.lastExecutedSets??null].join('/');}}
out('J-allExercises',{runtime:tag,all});
