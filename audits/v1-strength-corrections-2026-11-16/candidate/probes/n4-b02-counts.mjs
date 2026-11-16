// V1STR, the focused fix-forward of the plane rule: the author's counts for SSCTR-STR-B-02 (read-only; for the SSCTR ruling, criterion 5).
// Part 1. The SSCTR matrix of `r2-scan-changes.mjs` (672 changes of strength days in a plan in force, goal STRENGTH, DEV against OFF): every
//         upper-body exercise that is new to the plan after the change with the rules and not without them, with its role, loading, first week,
//         phase and dose, the configuration whose row it took over, and how many exercises each timeline brings in after the change.
// Part 2. The control: the frozen engine alone (every boundary off, no change of days), plans as built. A loaded vertical accessory at the
//         first block boundary: what its rotation brings.
// Run from CoachingCore/: node ../audits/v1-strength-corrections-2026-11-16/candidate/probes/n4-b02-counts.mjs [goal] [DEV|PLANE|NO_PLANE]
import {DEV,OFF,only,S,lifter,familiar,EQUIPMENT,timeline,rowsOf,idsOf,configurationOf} from '../../../../CoachingCore/test/v1str-helpers.mjs';
const DAYS={2:[1,4],3:[1,3,5],4:[0,2,4,6],5:[0,1,2,4,6]};
const NAMED={none:[],barbell:['back-squat','bench-press','deadlift','barbell-overhead-press','barbell-row'].map(familiar),press:[familiar('db-overhead-press')],pulldown:[familiar('lat-pulldown')]};
// The rules on in the timeline compared with OFF: every boundary (DEV, the default), the plane rule alone (PLANE), or every rule but it (NO_PLANE).
const goal=process.argv[2]??'STRENGTH',which=process.argv[3]??'DEV',ON={DEV,PLANE:only('PLANE'),NO_PLANE:only('HOLD','UPPER')}[which],count=(o,k)=>{o[k]=(o[k]??0)+1;};
const tally={changes:0,withNewUpper:0,byChange:{},byEquipment:{},byExercise:{},byRole:{},byLoading:{},byPhase:{},byDose:{},firstWeek:{},tookTheRowOf:{},heldBeforeAs:{},newAfterChange:{dev:0,off:0}},examples=[];
for(const eq of ['FULL','BAR','DB','MACHINES','MACH_DB','DB_BANDS'])for(const [nk,known] of Object.entries(NAMED))for(const experience of ['INTERMEDIATE','EXPERIENCED'])for(const [a,b] of [[4,2],[4,3],[3,2],[2,4],[3,4],[2,3],[5,2]])for(const cw of [1,3]){
 const res={};
 for(const [k,opts] of Object.entries({DEV:ON,OFF})){
  const t=timeline(lifter({goal,experience,equipment:EQUIPMENT[eq],days:DAYS[a],known}),{opts});for(let w=0;w<cw;w++)t.week(w);
  const before=new Set(idsOf(t.p)),roles=new Map();for(const x of t.p.templates)for(const r of x.rows)roles.set(r.entry.id,[...(roles.get(r.entry.id)??[]),r.role]);
  t.step(cw,0,'SCHEDULE_CHANGE',{changes:{strengthDays:DAYS[b]}},'06:00');
  res[k]={p:t.p,before,roles,fresh:idsOf({weeks:t.p.weeks.slice(cw)}).filter(id=>!before.has(id))};
 }
 tally.changes++;tally.newAfterChange.dev+=res.DEV.fresh.length;tally.newAfterChange.off+=res.OFF.fresh.length;
 const added=res.DEV.fresh.filter(id=>!res.OFF.fresh.includes(id)&&configurationOf(id).region==='UPPER');
 if(!added.length)continue;
 tally.withNewUpper++;count(tally.byChange,`${a}->${b}`);count(tally.byEquipment,eq);
 for(const id of added){
  const p=res.DEV.p,first=p.weeks.findIndex((_,w)=>w>=cw&&rowsOf(p,w).some(x=>x.e.id===id)),row=rowsOf(p,first).find(x=>x.e.id===id);
  // The row it took over: the upper row of the same session type, pattern and role the week before that is no longer there.
  const gone=rowsOf(p,first-1).filter(x=>x.s.templateType===row.s.templateType&&x.e.pattern===row.e.pattern&&x.e.role===row.e.role&&!rowsOf(p,first).some(y=>y.e.id===x.e.id&&y.s.templateType===x.s.templateType)).map(x=>x.e.id);
  count(tally.byExercise,id);count(tally.byRole,row.e.role);count(tally.byLoading,configurationOf(id).loading);count(tally.byPhase,p.phases.phases[first]);count(tally.byDose,`${row.e.sets}x${row.e.reps}`);count(tally.firstWeek,'w'+first);
  for(const g of gone){count(tally.tookTheRowOf,g);count(tally.heldBeforeAs,`${g}: ${[...new Set(res.DEV.roles.get(g)??['not in the plan'])].join('+')} before the change`);}
  if(examples.length<6)examples.push(`${eq} named=${nk} ${experience} ${a}->${b} at w${cw}: ${id} first w${first} ${p.phases.phases[first]} ${row.e.role} ${row.e.sets}x${row.e.reps} in ${row.s.templateType}, in place of ${gone.join('+')||'?'}; new after the change DEV ${res.DEV.fresh.length} (${res.DEV.fresh}), OFF ${res.OFF.fresh.length} (${res.OFF.fresh})`);
 }
}
console.log(`Part 1, goal ${goal}, rules ${which}: ${tally.changes} changes of strength days; with an upper exercise new to the plan that OFF does not bring: ${tally.withNewUpper}`);
console.log(JSON.stringify(tally,null,1));console.log(examples.join('\n'));
// Part 2: the frozen engine alone.
console.log('Part 2, every boundary off, plans as built (no change of days): the upper ACCESSORY rows, shown when they change');
for(const [name,equipment] of Object.entries({MACHINES_BANDS_PULLUPBAR:['MACHINES','BANDS','PULL_UP_BAR'],MACHINES_BANDS:['MACHINES','BANDS'],FULL:EQUIPMENT.FULL}))for(const days of [3,4]){
 const p=S.generateProgram(lifter({goal,experience:'INTERMEDIATE',equipment,days:DAYS[days]}),OFF).program;
 const acc=w=>rowsOf(p,w).filter(x=>x.e.role==='ACCESSORY'&&configurationOf(x.e.id)?.region==='UPPER').map(x=>`${x.e.id} [${configurationOf(x.e.id).loading}] ${x.e.sets}x${x.e.reps}`).join(', ');
 const line=[];let prev=null;for(let w=0;w<p.weeks.length;w++){const ids=rowsOf(p,w).filter(x=>x.e.role==='ACCESSORY'&&configurationOf(x.e.id)?.region==='UPPER').map(x=>x.e.id).join();if(ids!==prev){line.push(`w${w} ${p.phases.phases[w]}: ${acc(w)}`);prev=ids;}}
 console.log(`${name} ${days} days: ${line.join(' | ')}`);
}
