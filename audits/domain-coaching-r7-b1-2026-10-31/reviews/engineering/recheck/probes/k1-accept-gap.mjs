// R7B1-ENG-r2 judge probe K1 (the cycle's no-lower-skill question, acceptGap; regressions and state transitions). Read-only; PROBE_ROOT=<tree> runs
// it on another runtime.
// - K1a single gap: the question names only the missing equipment and acts; confirming records the change with the slot left out, disclosed;
//   later reviews never climb and never ask again; the history is untouched; when the equipment comes back the substitute returns;
// - K1b two gaps from one lost item: everything the confirmation leaves out is disclosed (each slot, or the decision's omitted list);
// - K1c a dated window: the slot is left out only in the window, and the substitute returns after it;
// - K1d the substitution path (a window ahead): the substitution asks with substitution.acceptGap, and confirming applies it with the gap disclosed.
import {record,guard,done,reviewed,weekly,review,evaluateProgram,opts,live,addDays,FULL,apply,A,R,LABEL} from './lib.mjs';
const pulls=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>e.pattern==='PULL').map(e=>`${s.id}:${e.id}(${e.role[0]})`));
const climb=id=>{const out=new Set(),todo=[id];while(todo.length)for(const n of R.ladderNext(todo.pop()))if(!out.has(n)){out.add(n);todo.push(n);}return out;};
const F={K1a:[],K1b:[],K1c:[],K1d:[]},info={};
const sub=(t,w,id,reason='SKILL_MISMATCH',x={},day=1)=>evaluateProgram(t.p,{...review(t.p,w,{day,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:id,reason,...x}}),actualLedger:t.ledger},opts);
const eq=(t,w,changes,day=0)=>evaluateProgram(t.p,{...review(t.p,w,{day,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes}),actualLedger:t.ledger},opts);
// K1a
guard('K1a','single gap',()=>{
 const t=reviewed({id:'k1-row',equipment:['DUMBBELLS','BANDS'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},3);
 const s=apply(t,sub(t,3,'db-row'));if(s.substitutions?.[0]?.selected!=='band-row'){F.K1a.push({note:'setup',s:s.status});return;}
 weekly(t,3);
 const ask=eq(t,4,{equipment:['DUMBBELLS']});const d=(ask.disclosures??[]).find(x=>x.id==='NO_LOWER_SKILL_ALTERNATIVE');
 const histBefore=A.historicalStateOf(t.p,{asOf:`${t.p.weeks[4].startDate}T05:00:00Z`,actualLedger:t.ledger},opts);
 const ok=t2=>t2.status==='MODIFY';
 const acc=apply(t,eq(t,4,{equipment:['DUMBBELLS'],acceptGap:true}));const dd=(acc.disclosures??[]).find(x=>x.id==='NO_LOWER_SKILL_ALTERNATIVE');
 const histAfter=A.historicalStateOf(t.p,{asOf:`${t.p.weeks[4].startDate}T05:00:00Z`,actualLedger:t.ledger},opts);
 const steps=[];const above=climb('db-row');
 for(let w=4;w<8;w++){const r=weekly(t,w,{o:()=>({kg:()=>12})});const p=pulls(t.p,w+1);steps.push({reviewed:w,status:r.status,pullsNext:p});if(r.status==='ASK')F.K1a.push({week:w,note:'asked again after the confirmation',reason:String(r.reason).slice(0,160)});if(p.some(x=>above.has(x.split(':')[1].split('(')[0])||x.includes(':db-row(')))F.K1a.push({week:w+1,pulls:p,note:'climbs or the set-aside exercise returns'});}
 const back=apply(t,eq(t,8,{equipment:['DUMBBELLS','BANDS']}));
 info.K1a={ask:{status:ask.status,missingInputs:ask.missingInputs,options:d?.options,missingEquipment:d?.missingEquipment,reason:String(ask.reason).slice(0,220)},accept:{status:acc.status,action:acc.action,disclosure:dd?{accepted:dd.accepted,informational:dd.informational,detail:dd.detail}:null,omittedRecord:acc.proposal?.decisions.at(-1)?.omitted??null,pullsWeek4:pulls(t.p,4)},historyUnchanged:JSON.stringify(histBefore)===JSON.stringify(histAfter),steps,equipmentBack:{status:back.status,action:back.action,pullsWeek9:pulls(t.p,9)}};
 if(ask.status!=='ASK'||JSON.stringify(ask.missingInputs)!=='["changes.acceptGap"]'||JSON.stringify(d?.missingEquipment)!=='["bands"]')F.K1a.push({note:'question',info:info.K1a.ask});
 if(!ok(acc)||!dd?.accepted)F.K1a.push({note:'confirmation not applied or not disclosed',status:acc.status});
 if(JSON.stringify(histBefore)!==JSON.stringify(histAfter))F.K1a.push({note:'the confirmation changed history'});
 if(!pulls(t.p,9).some(x=>x.includes(':band-row(')))F.K1a.push({note:'the substitute does not return with the equipment',pulls:pulls(t.p,9)});
});
// K1b two gaps from one lost item (bands): db-row -> band-row (MAIN), then one-arm-db-row -> band-face-pull (ACCESSORY), then the bands go.
guard('K1b','two gaps',()=>{
 const t=reviewed({id:'k1-two',equipment:FULL,goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12,schedule:{strengthDays:[0,2,4]}},3);
 const s1=apply(t,sub(t,3,'db-row',undefined,{},1)),s2=apply(t,sub(t,3,'one-arm-db-row',undefined,{},2));
 info.K1b={subs:[s1.status+':'+(s1.substitutions?.[0]?.selected??''),s2.status+':'+(s2.substitutions?.[0]?.selected??'')],pullsBefore:pulls(t.p,4)};
 if(s1.status!=='MODIFY'||s2.status!=='MODIFY'){F.K1b.push({note:'setup',info:info.K1b});return;}
 weekly(t,3);
 const noBands=FULL.filter(q=>q!=='BANDS'),ask=eq(t,4,{equipment:noBands}),acc=eq(t,4,{equipment:noBands,acceptGap:true});
 const gaps=(acc.disclosures??[]).filter(x=>x.id==='NO_LOWER_SKILL_ALTERNATIVE');
 const before=new Set(pulls(t.p,4)),after=acc.proposal?pulls(acc.proposal,4):[];
 const lost=[...before].filter(x=>!after.some(y=>y.split(':')[0]===x.split(':')[0]&&y.endsWith(x.slice(-3))));
 info.K1b={...info.K1b,ask:{status:ask.status,disclosures:(ask.disclosures??[]).map(x=>x.id+':'+(x.setAside??'')),reason:String(ask.reason).slice(0,200)},accept:{status:acc.status,gapDisclosures:gaps.map(x=>x.setAside+'>'+x.substitute),omittedRecord:acc.proposal?.decisions.at(-1)?.omitted??null,pullsAfter:after},slotsLeftOut:lost};
 const disclosedAside=new Set(gaps.map(x=>x.setAside)),omittedIds=new Set((acc.proposal?.decisions.at(-1)?.omitted??[]).map(o=>o.exerciseId));
 // every pull slot left out must be named by a gap disclosure or the decision's omitted record
 for(const x of lost){const id=x.split(':')[1].split('(')[0];if(!disclosedAside.has(R.configurationOf(id)?.id)&&!omittedIds.has(id)&&![...disclosedAside].some(a=>t.p.canonical.athlete.strengthSelections.some(s=>s.from===a&&s.to===id)))F.K1b.push({slot:x,note:'a slot left out by the confirmation is not disclosed',gapDisclosures:gaps.map(g=>g.setAside+'>'+g.substitute)});}
});
// K1c window
guard('K1c','window',()=>{
 const t=reviewed({id:'k1-win',equipment:['DUMBBELLS','BANDS'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},3);
 apply(t,sub(t,3,'db-row'));weekly(t,3);
 const from=t.p.weeks[5].startDate,to=addDays(from,6),ask=eq(t,4,{equipment:['DUMBBELLS'],from,to}),acc=apply(t,eq(t,4,{equipment:['DUMBBELLS'],from,to,acceptGap:true}));
 info.K1c={ask:{status:ask.status,missingInputs:ask.missingInputs},accept:{status:acc.status},week4:pulls(t.p,4),week5:pulls(t.p,5),week6:pulls(t.p,6)};
 if(ask.status!=='ASK'||acc.status!=='MODIFY'||pulls(t.p,5).length||!pulls(t.p,6).some(x=>x.includes(':band-row(')))F.K1c.push(info.K1c);
 weekly(t,4);if(pulls(t.p,5).length||!pulls(t.p,6).some(x=>x.includes(':band-row(')))F.K1c.push({afterReview:{week5:pulls(t.p,5),week6:pulls(t.p,6)}});
});
// K1d the substitution path: a window without bands is recorded first, then db-row SKILL_MISMATCH (-> band-row) creates the gap in the window.
guard('K1d','substitution path',()=>{
 const t=reviewed({id:'k1-subwin',equipment:['DUMBBELLS','BANDS'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},3);
 const from=t.p.weeks[6].startDate,to=addDays(from,6);apply(t,eq(t,3,{equipment:['DUMBBELLS'],from,to},1));
 const ask=sub(t,3,'db-row',undefined,{},2),acc=apply(t,sub(t,3,'db-row',undefined,{acceptGap:true},2));
 info.K1d={ask:{status:ask.status,missingInputs:ask.missingInputs,disclosures:(ask.disclosures??[]).map(x=>x.id)},accept:{status:acc.status,selected:acc.substitutions?.[0]?.selected??null,disclosures:(acc.disclosures??[]).map(x=>x.id+(x.accepted?'(accepted)':''))},week5:pulls(t.p,5),week6:pulls(t.p,6),week7:pulls(t.p,7)};
 if(ask.status!=='ASK'||JSON.stringify(ask.missingInputs)!=='["substitution.acceptGap"]'||acc.status!=='MODIFY'||pulls(t.p,6).length||!pulls(t.p,7).some(x=>x.includes(':band-row(')))F.K1d.push(info.K1d);
});
for(const k of ['K1a','K1b','K1c','K1d'])record(k,'acceptGap',!F[k].length,{K1a:'one gap: the question acts; confirmed, the slot is left out and disclosed; no climb, no new question, history untouched; the substitute returns with the equipment',K1b:'every slot a confirmation leaves out is disclosed',K1c:'a window: left out only in the window',K1d:'the substitution path asks with substitution.acceptGap and applies when confirmed'}[k],{label:LABEL,failures:F[k],info:info[k]??null});
done('k1-accept-gap');
