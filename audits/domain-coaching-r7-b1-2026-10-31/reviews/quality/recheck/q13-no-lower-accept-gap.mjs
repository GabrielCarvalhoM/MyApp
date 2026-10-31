// R7B1-QUALITY recheck q13 (QR7B1-01 on R7B1-FREEZE-2): every NO_LOWER_SKILL_ALTERNATIVE question of the q05 grid, plus the q04 window path (S3,
// a substitution with a window ahead) and the q12 full-equipment witness, followed through both options:
//  Q  the question: missingInputs are inputs the review reads (changes.acceptGap / substitution.acceptGap); missingEquipment and the text name only
//     equipment the athlete no longer has; the options are exactly the two that act.
//  O1 "Keep the equipment": the athlete does not send the change; the plan is unchanged (no proposal).
//  O2 "Leave the slot out": the same review with acceptGap:true -> a proposal; the equipment is recorded; disclosure accepted:true; in the weeks ahead
//     no exercise needs the lost equipment, the set-aside configuration never returns and nothing above the substitute's skill takes the pattern's
//     place in the affected slot; two later weekly reviews do not ask again and keep that.
import fs from 'node:fs';
import {reviewed,weekly,review,evaluateProgram,opts,live,addDays} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
import {configurationOf,skillRank} from '../../../../../CoachingCore/src/r7b-repertoire.mjs';
const FULL=['BARBELL','RACK','BENCH','DUMBBELLS','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'];
const EQ={DB_BANDS:['DUMBBELLS','BANDS'],DB_BENCH_KB:['DUMBBELLS','BENCH','KETTLEBELL'],DB_BENCH_BANDS:['DUMBBELLS','BENCH','BANDS'],DB_KB_BANDS:['DUMBBELLS','KETTLEBELL','BANDS'],BANDS_AND_BAR:['BANDS','PULL_UP_BAR'],KB_BANDS:['KETTLEBELL','BANDS'],MACHINES_DB:['DUMBBELLS','BENCH','MACHINES'],FULL};
const apply=(t,r)=>{t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const ev=(t,w,x)=>evaluateProgram(t.p,{...review(t.p,w,{day:0,hour:'06:00:00',...x}),actualLedger:t.ledger},opts);
const H=q=>q.toLowerCase().replace(/_/g,' ');
const out={questions:0,checks:0,failures:{},examples:{},accepted:0,laterAsks:0,cases:[]};
const check=(c,ok,d)=>{out.checks++;if(!ok){out.failures[c]=(out.failures[c]??0)+1;(out.examples[c]??=[]).length<5&&out.examples[c].push(d);}};
const strengthRows=(p,from,to)=>p.weeks.slice(from).flatMap(k=>k.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&(!to||s.date<=to)).flatMap(s=>s.prescription.exercises.map(e=>({s,e}))));
// judge one question q (review x on t at week w) with the equipment the athlete has during it (have) and the lost items (lost)
function judge(label,t,w,x,q,{have,lost,window=null,input}){
 const d=q.disclosures?.find(z=>z.id==='NO_LOWER_SKILL_ALTERNATIVE');if(!d)return;out.questions++;const det={label,setAside:d.setAside,substitute:d.substitute,question:q.reason};
 check('Q.inputs',JSON.stringify(q.missingInputs)===JSON.stringify([input]),{...det,missingInputs:q.missingInputs});
 check('Q.equipment',(d.missingEquipment??[]).length>0&&d.missingEquipment.every(m=>lost.map(H).includes(m))&&have.every(hv=>!new RegExp('needs [^,;]*\\b'+H(hv)+'\\b[^,;]*, which is not available').test(q.reason)),{...det,missingEquipment:d.missingEquipment,lost,have});
 check('Q.options',d.options?.length===2&&/^Keep the equipment$/.test(d.options[0])&&/^Leave the .* slot out until the equipment returns$/.test(d.options[1]),{...det,options:d.options});
 check('O1.keep',!q.proposal,{...det});
 const y={...x};if(input==='changes.acceptGap')y.changes={...x.changes,acceptGap:true};else y.substitution={...x.substitution,acceptGap:true};
 const a=ev(t,w,y);const acc=a.disclosures?.find(z=>z.id==='NO_LOWER_SKILL_ALTERNATIVE'&&z.accepted);
 check('O2.recorded',!!a.proposal&&a.status!=='ASK',{...det,status:a.status,reason:a.reason?.slice(0,200)});
 if(!a.proposal)return;out.accepted++;
 check('O2.disclosed',!!acc,{...det,disclosures:(a.disclosures??[]).map(z=>z.id)});
 if(!window)check('O2.equipment',JSON.stringify([...a.proposal.canonical.athlete.equipment].sort())===JSON.stringify([...have].sort()),{...det,equipment:a.proposal.canonical.athlete.equipment});
 const c={p:t.p,ledger:t.ledger};apply(c,a);
 const sub=configurationOf(d.substitute),aside=d.setAside,from=window?window.from:c.p.weeks[w].startDate,to=window?window.to:null;
 const verify=(p,k,tag)=>{for(const {s,e} of strengthRows(p,k,to).filter(z=>z.s.date>=from)){
  check('O2.noLostEquipment',configurationOf(e.id).equipment.every(q=>q==='BODYWEIGHT'||have.includes(q)),{...det,tag,session:s.id,id:e.id});
  check('O2.asideNeverReturns',e.id!==aside,{...det,tag,session:s.id});
  if(configurationOf(e.id).pattern===d.pattern&&e.role===(s.prescription.exercises.find(z=>z.id===e.id)?.role)&&!t.p.weeks[s.weekIndex]?.sessions.find(y=>y.id===s.id)?.prescription?.exercises?.some(z=>z.id===e.id))
   check('O2.noClimb',skillRank(configurationOf(e.id).skill)<=skillRank(sub.skill),{...det,tag,session:s.id,id:e.id,skill:configurationOf(e.id).skill,substituteSkill:sub.skill});}};
 verify(c.p,w+1,'decision');
 for(let k=w;k<Math.min(w+2,c.p.weeks.length-1);k++){let r;try{r=weekly(c,k);}catch(e){check('O2.laterReview',false,{...det,week:k,error:String(e.message).slice(0,160)});break;}
  const again=(r.disclosures??[]).some(z=>z.id==='NO_LOWER_SKILL_ALTERNATIVE'&&!z.accepted)||r.status==='ASK';if(again)out.laterAsks++;
  check('O2.notAskedAgain',!again,{...det,week:k,status:r.status,reason:r.reason?.slice(0,160)});verify(c.p,k+1,'review'+k);}
 if(out.cases.length<60)out.cases.push({...det,missingInputs:q.missingInputs,missingEquipment:d.missingEquipment,options:d.options,accepted:a.status,acceptedDetail:acc?.detail??null});
}
// q05 grid (permanent loss of one item the substitute needs)
for(const [eqName,eq] of Object.entries(EQ))for(const sg of ['GENERAL','STRENGTH','RUNNING_SUPPORT'])for(const days of [[0,4],[0,2,4]])for(const exp of ['NOVICE','INTERMEDIATE']){
 const label=`eq=${eqName} str=${sg} days=${days.length} exp=${exp}`;let t0;
 try{t0=reviewed({id:'q05',equipment:eq,goals:{run:'PERFORMANCE',strength:sg},strengthExperience:exp,rotation:'FIXED',weeks:12,schedule:{strengthDays:days}},3);}catch{continue;}
 const inUse=[...new Set(t0.p.weeks[4].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>e.role!=='PRACTICE').map(e=>e.id)))];
 for(const X of inUse){
  const t={p:t0.p,ledger:t0.ledger};const s=ev(t,3,{day:1,kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH'}});
  if(s.status!=='MODIFY')continue;apply(t,s);try{weekly(t,3);}catch{continue;}
  for(const q of configurationOf(s.substitutions[0].selected).equipment.filter(q=>q!=='BODYWEIGHT')){
   const left=eq.filter(x=>x!==q),x={kind:'EQUIPMENT_CHANGE',changes:{equipment:left}};
   judge(`${label} ${X}->${s.substitutions[0].selected} -${q}`,t,4,x,ev(t,4,x),{have:left,lost:[q],input:'changes.acceptGap'});
   // a dated window too
   const from=t.p.weeks[5].startDate,win={from,to:addDays(from,6)},xw={kind:'EQUIPMENT_CHANGE',changes:{equipment:left,...win}};
   judge(`${label} ${X} window -${q}`,t,4,xw,ev(t,4,xw),{have:left,lost:[q],window:win,input:'changes.acceptGap'});
  }
 }
}
// q04 S3: the window first, then a SKILL_MISMATCH whose substitute needs the window's lost equipment
{const t=reviewed({id:'q04b',equipment:['DUMBBELLS','BANDS'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},3),from=t.p.weeks[5].startDate,win={from,to:addDays(from,6)};
 apply(t,ev(t,3,{day:1,kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS'],...win}}));
 const x={day:2,kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'db-row',reason:'SKILL_MISMATCH'}};
 judge('S3 substitution with window ahead',t,3,x,ev(t,3,x),{have:['DUMBBELLS'],lost:['BANDS'],window:win,input:'substitution.acceptGap'});}
fs.writeFileSync(new URL('./out/q13-no-lower-accept-gap.json',import.meta.url),JSON.stringify(out,null,1));
console.log(JSON.stringify({questions:out.questions,accepted:out.accepted,laterAsks:out.laterAsks,checks:out.checks,failures:out.failures,examples:out.examples},null,1));
