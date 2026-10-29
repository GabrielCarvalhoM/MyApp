// Q6 (reviewer-owned) metamorphic: PlanningProjection perturbed, HistoricalState must not move. On several program states, every value of every
// stored start stateTrace[k], k>=1, is rewritten (loads +10, ticks 5, reps +3, sets +2, lastPerformed 2099-01-01, return steps, caps, run
// targets, achieved peaks, longest continuous run, modes), keeping only the declared channels: the prescription summary `planned` and the week
// starts' provenance. The program hash is recomputed so the program stays valid. historicalStateOf (record without superseded rows) is compared
// at every week start and mid-week cut, plus the internal reducer through a what-if return's entry.
import * as L from './qe-r7asm-lib.mjs';
const out={probe:'qe-r7asm-Q6-perturb-projection',root:L.ROOT_USED,states:[]};
const perturbEx=e=>{const x={...e};if(Number.isFinite(x.load))x.load+=10;x.loadTick=5;if(Number.isFinite(x.reps))x.reps+=3;x.sets=(Number.isInteger(x.sets)?x.sets:3)+2;x.lastPerformed='2099-01-01';x.lastExecutedSets=9;x.blocksDone=7;x.setCap=1;x.setCeiling=9;x.regainCap=1;x.priorSets=9;x.returnStep=1;x.ceiling=99;x.pendingLoad=77;x.unlogged=true;x.source='PERTURBED';x.mode=x.mode==='KNOWN'?'FROM_LOG':'KNOWN';return x;};
const perturbRun=r=>({...r,mode:r.mode==='EASY'?'RESTART':'EASY',restart:55,easy:(r.easy??30)+30,long:(r.long??30)+30,walkStep:5,walks:3,qualityStep:6,specificStep:4,easyWeeksDone:9,qualityDone:9,stridesDone:9,longestContinuous:999,achieved:{long:999,easy:999,quality:{family:'X',work:{}},strides:9},returnStep:1});
function perturbed(p){const q=structuredClone(p);for(let k=1;k<q.stateTrace.length;k++){const st=q.stateTrace[k];const planned={run:st.run.planned,strength:st.strength.planned};
 st.run=perturbRun(st.run);st.run.planned=planned.run;st.strength={...st.strength,exercises:Object.fromEntries(Object.entries(st.strength.exercises).map(([id,e])=>[id,perturbEx(e)])),devCount:99,completedBlocks:9,entryWeek:!st.strength.entryWeek,planned:planned.strength};
 st.strength.exercises['qe-phantom']={status:'ESTABLISHED',mode:'KNOWN',load:50,convention:'TOTAL',reps:5,sets:3,rir:2,loadTick:1,lastPerformed:'2026-11-01',source:'PERTURBED'};}
 delete q.hash;q.hash=L.PG.programHash(q);return q;}
const cuts=t=>t.p.weeks.slice(1,Math.min(t.p.weeks.length,t.p.decisions.length?Math.min(16,1+Math.max(...t.p.decisions.map(d=>t.p.weeks.findIndex(w=>d.asOf.slice(0,10)>=w.startDate&&d.asOf.slice(0,10)<=L.addDays(w.startDate,6))))+2):3)).flatMap(w=>[`${w.startDate}T06:00:00Z`,`${L.addDays(w.startDate,3)}T12:00:00Z`]);
const states={
 P40:()=>{const t=L.start('qe-q6a',2);L.perDay(t,2,s=>!L.SAT(s));L.weekly(t,3,s=>!L.SAT(s));return t;},
 P51:()=>{const t=L.start('qe-q6b',5);L.perDay(t,5,s=>!L.SAT(s));L.perDay(t,6,s=>!L.SAT(s));return t;},
 shortReturn:()=>{const t=L.start('qe-q6c',3);const d=t.p.weeks[3].startDate;L.step(t,L.at(t.p,3,3,'06:00:00',L.brk(L.addDays(d,1),L.addDays(d,2))));L.perDay(t,3,s=>s.day>3);L.weekly(t,4,s=>!L.SAT(s));return t;},
 moderateReturn:()=>{const t=L.start('qe-q6d',3);const d=t.p.weeks[3].startDate;L.step(t,L.at(t.p,6,0,'06:00:00',L.brk(d,L.addDays(d,20))));L.weekly(t,6,s=>s.sport==='RUN');return t;},
 longReturn:()=>{const t=L.start('qe-q6e',3);const d=t.p.weeks[3].startDate;L.step(t,L.at(t.p,8,0,'06:00:00',L.brk(d,L.addDays(d,34))));L.weekly(t,9,()=>true);return t;},
 correctedAndConflicted:()=>{const t=L.start('qe-q6f',3);const sat=t.p.weeks[3].sessions.find(L.SAT),first=L.obs(t.p,sat);L.step(t,L.at(t.p,3,5,'21:00:00',{observations:[first]}));L.step(t,L.at(t.p,3,6,'21:00:00',{observations:[{...L.obs(t.p,sat),eventId:first.eventId+'-fix',observedAt:first.observedAt,correctionOf:first.eventId,correctedAt:`${L.addDays(t.p.weeks[3].startDate,6)}T20:00:00Z`,actual:{completed:false,minutes:0}}]}));return t;},
};
for(const [name,mk] of Object.entries(states)){
 const t=mk(),q=perturbed(t.p),clean=t.ledger.filter(o=>!o.superseded),diffs=[];
 if(!L.R.validProgram(q))throw Error('perturbed program invalid');
 for(const asOf of cuts(t)){const a=L.A.historicalStateOf(t.p,{asOf,actualLedger:clean},L.opts),b=L.A.historicalStateOf(q,{asOf,actualLedger:clean},L.opts);if(L.V.hash(a)!==L.V.hash(b))diffs.push({asOf,a:L.V.hash(a).slice(0,12),b:L.V.hash(b).slice(0,12),phantomInHistory:!!b?.strength?.exercises?.['qe-phantom']});}
 // internal reducer through a what-if return on the last week reached (its interruption.stateAt/entry come from stateAtBreak, the reducer)
 const lastW=Math.min(t.p.weeks.length-2,Math.max(...t.p.decisions.map(d=>d.fromWeek??0),3)+1),d0=t.p.weeks[lastW].startDate;
 const ret=p=>{const r=L.R.evaluateProgram(p,{...L.at(p,lastW,4,'06:00:00',L.brk(L.addDays(d0,1),L.addDays(d0,3))),actualLedger:t.ledger},L.opts);const x=r.proposal?.decisions.at(-1)?.interruption;return {status:r.status,stateAt:x?L.V.hash(x.stateAt):null,entry:x?L.V.hash(x.entry):null};};
 const ra=ret(t.p),rb=ret(q);
 out.states.push({state:name,cutsChecked:cuts(t).length,historicalStateOfDiffs:diffs,whatIfReturn:{original:ra,perturbed:rb,stateAtEqual:ra.stateAt===rb.stateAt,entryEqual:ra.entry===rb.entry}});
}
out.allInvariant=out.states.every(s=>!s.historicalStateOfDiffs.length&&s.whatIfReturn.stateAtEqual&&s.whatIfReturn.entryEqual);
console.log(JSON.stringify(out,null,1));
