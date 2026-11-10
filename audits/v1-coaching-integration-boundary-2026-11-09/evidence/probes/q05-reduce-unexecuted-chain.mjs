// Q05 (cycle recheck): an unexecuted REDUCE window chained with a REST report vs the first report alone (CH-r2: never less conservative than any
// report; C-Q05-5: a REDUCE window with planned sessions and none executed is rest of its days; SSCTR-FF-N1: days without training).
import {timeline,HYBRID,KNOWN,NO,XNO,doneWeek,reviewWeeks,live} from './h.mjs';
const P=t=>{const w=t.p.decisions.at(-1).wellbeing?.plans;return w?Object.entries(w).map(([s,p])=>`${s}:${p.rungs?p.rungs.join(','):p.recipe+'/'+p.holds}(${p.row},${p.days}d,${p.read})`).join(' '):'no plans';};
const wk=(t,k)=>`wk${k} run ${t.p.weeks[k].sessions.filter(s=>s.sport==='RUN'&&live(s)&&!s.optional).map(s=>s.role+':'+s.prescription.durationMinutes).join('/')} str ${t.p.weeks[k].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)&&!s.optional).map(s=>s.prescription.exercises.reduce((a,e)=>a+e.sets,0)+'sets@'+Math.min(...s.prescription.exercises.map(e=>e.rir))).join('/')}`;
for(const speed of ['FASTER','BALANCED','CONSERVATIVE'])for(const chained of [false,true]){
 const t=timeline(KNOWN(4,HYBRID()));reviewWeeks(t,0,1);
 // REDUCE_SUBSTANTIAL 12 days from week-1 Monday (11-16..11-27); nothing executed; week 1 reviewed with its check (all no)
 t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REDUCE_SUBSTANTIAL',days:12,returnSpeed:speed}},'07:00');
 t.step(1,6,'WEEKLY_REVIEW',{observations:[],check:{warningSigns:NO('NEED_REST'),exerciseResponse:XNO('NEED_REST')}},'20:00');
 let r=null;
 // chained: on week-2 Thursday 11-26 (day 10 of the window) UNUSUAL_FATIGUE REST 3 days (11-26..11-28); allowance 14 - 10 = 4
 if(chained)r=t.step(2,3,'NOT_FEELING_100',{observations:[],wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:NO('UNUSUAL_FATIGUE'),intent:'REST',days:3,returnSpeed:speed}},'07:00');
 // the check on week-3 Monday 11-30: every open condition improved (13 days without training through 11-28, 14 through 11-29)
 const signs=chained?{...NO('NEED_REST'),...NO('UNUSUAL_FATIGUE')}:NO('NEED_REST'),imp=chained?{NEED_REST:true,UNUSUAL_FATIGUE:true}:true;
 const c=t.step(3,0,'WELLBEING_CHECK',{check:{warningSigns:signs,improved:imp}},'07:00');
 console.log(`${speed.padEnd(12)} ${chained?'chained REDUCE 12 (none executed) + REST 3':'REDUCE 12 alone (none executed)         '} | ${r?r.status+' '+r.action+' | ':''}${c.status} ${c.action} | ${P(t)} | ${wk(t,3)} | ${wk(t,4)}`);
}
