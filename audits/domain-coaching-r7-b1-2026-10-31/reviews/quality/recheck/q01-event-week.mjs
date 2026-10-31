// R7B1-QUALITY q01: the NO_NEW_EXERCISE_IN_EVENT_WEEKS decision output against the plan it proposes (read-only; public entry points + skeletonOf/dayPhaseOf).
// Grid: event (10K/16w, HALF/16w, 10K/12w ending at POST_EVENT) x equipment x strength goal x strength days x rotation. Decision points: last SPECIFIC
// week, TAPER, RACE_WEEK, POST_EVENT (day 0, 06:00). For every exercise in use x both reasons, each MODIFY is checked:
//  C1 no exercise new to the event weeks of the plan that this program never performed;  C2 disclosure lists exactly the stand-ins / omitted sessions /
//  weeks the sessions carry (eventStandIns), stand-in rows exist with the note;  C3 startsAfterEvent and the detail text match the weeks after POST_EVENT;
//  C4 every session ahead that held X: X gone; non-event -> selected; event -> stand-in listed or session listed as omitted (or selected if performed);
//  C5 no duplicate exercise in a session;  C6 a stand-in row is not heavier than the heaviest load logged for it;  C7 rest-by-design from stand-ins is
//  listed in omittedSessions and was a prescribed session before;  C8 decision reason/substitutions agree with the disclosure;  C9 projected rows in
//  later event weeks of a never-performed selected exercise while the disclosure says it starts after the post-event week.
// Usage: node q01-event-week.mjs <shard 0..2>
import fs from 'node:fs';
import {reviewed,weekly,review,evaluateProgram,opts,live,FULL} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
import {skeletonOf,dayPhaseOf} from '../../../../../CoachingCore/src/r6-program.mjs';
import {r6Authority} from '../../../../../CoachingCore/src/r6-authority.mjs';
const auth=r6Authority(opts),EVENT=['TAPER','RACE_WEEK','POST_EVENT'];
const shard=Number(process.argv[2]??0);
const EVENTS=[['10K16',{kind:'10K',date:'2027-01-24'},16],['HM16',{kind:'HALF_MARATHON',date:'2027-01-31'},16],['10K12',{kind:'10K',date:'2027-01-17'},12]];
const EQ={DB_BENCH_KB:['DUMBBELLS','BENCH','KETTLEBELL'],FULL,BANDS_AND_BAR:['BANDS','PULL_UP_BAR'],BODYWEIGHT:[],MACHINES_DB:['DUMBBELLS','BENCH','MACHINES'],KB:['KETTLEBELL']};
const [evName,event,weeks]=EVENTS[shard];
const out={shard:evName,programs:0,decisions:0,modify:0,status:{},reached:{disclosure:0,withStandIns:0,withOmitted:0,restByDesignFromStandIns:0,startsAfterFalse:0,skillMismatchWithStandIn:0,preferenceWithStandIn:0},checks:0,failures:{},examples:{},errors:[]};
const fail=(c,detail)=>{out.failures[c]=(out.failures[c]??0)+1;(out.examples[c]??=[]).length<6&&out.examples[c].push(detail);};
const check=(c,ok,detail)=>{out.checks++;if(!ok)fail(c,detail);};
const phaseOf=p=>{const sk=skeletonOf(p,auth);return (w,s)=>dayPhaseOf(sk.at(w)??sk,w,s.day);};
const performedIds=t=>{const byId=new Map(t.p.weeks.flatMap(w=>w.sessions.map(s=>[s.id,s])));return new Set(t.ledger.filter(o=>!o.superseded&&o.actual?.completed).flatMap(o=>(o.actual.exercises??byId.get(o.sessionId)?.prescription?.exercises??[]).map(e=>e.id)));};
const maxLogged=t=>{const m=new Map();for(const o of t.ledger)if(!o.superseded&&o.actual?.completed)for(const e of o.actual.exercises??[])for(const s of e.sets??[])if(s.load?.unit==='KG')m.set(e.id,Math.max(m.get(e.id)??0,s.load.value));return m;};
const ahead=(s,asOf)=>s.date>=asOf.slice(0,10);
for(const [eqName,equipment] of Object.entries(EQ))for(const sg of ['GENERAL','STRENGTH','RUNNING_SUPPORT'])for(const days of [[0,4],[0,2,4]])for(const rotation of ['FIXED','EVERY_2_WEEKS']){
 const label=`${evName} eq=${eqName} str=${sg} days=${days.length} rot=${rotation}`;
 let t;try{t=reviewed({id:'q01',goals:{run:'RACE',strength:sg},event,weeks,equipment,recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6],strengthDays:days,longRunMinutes:evName==='HM16'?120:90},rotation},0);}catch(e){out.errors.push({label,error:String(e.message).slice(0,160)});continue;}
 out.programs++;
 const ph=t.p.phases.phases,taper=ph.indexOf('TAPER'),post=ph.indexOf('POST_EVENT');if(taper<0||post<0){out.errors.push({label,phases:ph.join(',')});continue;}
 const points=new Set([taper-1,taper,ph.indexOf('RACE_WEEK'),post]);
 try{
 for(let w=0;w<=post;w++){
  if(points.has(w)){
   const performed=performedIds(t),logged=maxLogged(t),P0=phaseOf(t.p);
   const inUse=[...new Set(t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>e.role!=='PRACTICE').map(e=>e.id)))];
   const evIds0=new Set(t.p.weeks.slice(w).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&EVENT.includes(P0(x.index,s))).flatMap(s=>s.prescription.exercises.map(e=>e.id))));
   for(const X of inUse)for(const reason of ['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE']){
    const rv=review(t.p,w,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason,...(reason==='SKILL_MISMATCH'?{}:{nonclinicalConfirmed:true})}});
    const r=evaluateProgram(t.p,{...rv,actualLedger:t.ledger},opts);out.decisions++;out.status[r.status]=(out.status[r.status]??0)+1;
    if(r.status!=='MODIFY')continue;out.modify++;
    const x={label,week:w,phase:ph[w],X,reason},sel=r.substitutions[0].selected,p=r.proposal,P=phaseOf(p),d=r.disclosures?.find(z=>z.id==='NO_NEW_EXERCISE_IN_EVENT_WEEKS'&&z.exerciseId===X),info=(r.disclosures??[]).filter(z=>z.id==='NO_NEW_EXERCISE_IN_EVENT_WEEKS'&&z.informational);
    x.sel=sel;
    const sessAhead=p.weeks.slice(w).flatMap(k=>k.sessions.filter(s=>s.sport==='STRENGTH'&&ahead(s,rv.asOf)).map(s=>({k:k.index,s,phase:P(k.index,s)})));
    const earlier=s1=>new Set(sessAhead.filter(({s})=>live(s)&&s.date<s1.date).flatMap(({s})=>s.prescription.exercises.map(e=>e.id)));
    let projectedCount=0;
    // C1
    for(const {k,s,phase} of sessAhead)if(live(s)&&EVENT.includes(phase))for(const e of s.prescription.exercises)if(!evIds0.has(e.id)&&!performed.has(e.id)){
     if(earlier(s).has(e.id)){projectedCount++;continue;}// a conditional projection: planned in an earlier session ahead of this proposal (counted)
     check('C1',false,{...x,k,session:s.id,id:e.id});}
    // C2
    const stands=sessAhead.flatMap(({k,s})=>(s.eventStandIns??[]).filter(g=>g.setAside===X&&g.selected===sel).map(g=>({...g,k,s})));
    if(stands.length){out.reached.disclosure+=d?1:0;
     check('C2',!!d,{...x,note:'eventStandIns without disclosure'});
     if(d){const si=[...new Set(stands.map(g=>g.inEventWeeks).filter(Boolean))].sort(),om=[...new Set(stands.filter(g=>!g.inEventWeeks).map(g=>g.s.id))].sort(),wk=[...new Set(stands.map(g=>g.k))].sort((a,b)=>a-b);
      check('C2',JSON.stringify(si)===JSON.stringify([...d.standIns].sort()),{...x,disclosed:d.standIns,actual:si});
      check('C2',JSON.stringify(om)===JSON.stringify([...d.omittedSessions].sort()),{...x,disclosed:d.omittedSessions,actual:om});
      check('C2',JSON.stringify(wk)===JSON.stringify(d.weeks),{...x,disclosed:d.weeks,actual:wk});
      if(si.length){out.reached.withStandIns++;out.reached[reason==='SKILL_MISMATCH'?'skillMismatchWithStandIn':'preferenceWithStandIn']++;}if(om.length)out.reached.withOmitted++;
      for(const g of stands.filter(g=>g.inEventWeeks)){const row=g.s.prescription?.exercises.find(e=>e.id===g.inEventWeeks);check('C2',!!row&&(row.instructions??[]).some(i=>i.includes('stands in for '+X)),{...x,session:g.s.id,standIn:g.inEventWeeks,note:'stand-in row missing or without its note'});
       if(row&&row.load?.mode==='KNOWN'&&Number.isFinite(row.load.value))check('C6',row.load.value<=(logged.get(row.id)??Infinity),{...x,session:g.s.id,id:row.id,planned:row.load.value,maxLogged:logged.get(row.id)});}
      // C3
      const afterWeeks=p.weeks.slice(post+1),selAfter=afterWeeks.flatMap(k=>k.sessions.filter(live).flatMap(s=>(s.prescription.exercises??[]).filter(e=>e.id===sel)));
      const startsAfter=r.substitutions[0].eventWeeks?.startsAfterEvent;
      check('C3',startsAfter===(selAfter.length>0),{...x,startsAfter,selAfter:selAfter.length,weeksAfter:afterWeeks.length});
      check('C3',/(beyond|after) this program/.test(d.detail)===!startsAfter,{...x,detail:d.detail});
      check('C3o',startsAfter?/after the post-event week/.test(d.options[1]):/this program ends with the post-event week/.test(d.options[1]),{...x,option:d.options[1]});
      if(!startsAfter){out.reached.startsAfterFalse++;check('C3',afterWeeks.length===0,{...x,note:'not started after the event although weeks remain',weeksAfter:afterWeeks.length});}
      if(selAfter.length)check('C3',['FIRST_ESTABLISH','BODYWEIGHT','REESTABLISH'].includes(selAfter[0].exposure?.kind),{...x,first:selAfter[0].exposure?.kind});
      // C8
      check('C8',JSON.stringify(r.substitutions[0].eventWeeks?.standIns)===JSON.stringify(d.standIns)&&JSON.stringify(r.substitutions[0].eventWeeks?.omittedSessions)===JSON.stringify(d.omittedSessions)&&/starts after the post-event week/.test(r.reason),{...x});
      // C9
      const projected=sessAhead.filter(({s,phase})=>live(s)&&EVENT.includes(phase)&&s.prescription.exercises.some(e=>e.id===sel)).map(({s})=>s.id);
      check('C9',projected.length===0||performed.has(sel)||projected.every(id=>earlier(sessAhead.find(z=>z.s.id===id).s).has(sel)),{...x,note:'the disclosure says the selected exercise starts after the post-event week; the proposal prescribes it in event weeks',sessions:projected});
     }
    }else check('C2',!d,{...x,note:'disclosure without eventStandIns'});
    out.projectedRows=(out.projectedRows??0)+projectedCount;
    // C10 (recheck): every eventStandIns entry new in this proposal is disclosed
    {const sig=g=>g.slot+':'+g.selected+':'+(g.inEventWeeks??'');for(const {s} of sessAhead){const s0=t.p.weeks[s.weekIndex]?.sessions.find(y=>y.id===s.id),was=new Set((s0?.eventStandIns??[]).map(sig));for(const g of (s.eventStandIns??[]).filter(g=>!was.has(sig(g)))){const own=d&&g.setAside===X&&g.selected===sel;const inInfo=info.some(z=>z.slots?.some(v=>v.sessionId===s.id&&v.selected===g.selected&&(v.inEventWeeks??null)===(g.inEventWeeks??null)));out.reached.knockOnDisclosed=(out.reached.knockOnDisclosed??0)+(inInfo?1:0);check('C10',own||inInfo,{...x,session:s.id,entry:g});}}}
    // C4, C5, C7
    for(const {k,s,phase} of sessAhead){
     const s0=t.p.weeks[k].sessions.find(y=>y.id===s.id),had=!!s0&&live(s0)&&s0.prescription.exercises.some(e=>e.id===X&&e.role!=='PRACTICE');
     if(live(s)){const ids=s.prescription.exercises.map(e=>e.id);check('C5',new Set(ids).size===ids.length,{...x,session:s.id,ids});}
     if(s.role==='REST_BY_DESIGN'&&s.eventStandIns?.length){out.reached.restByDesignFromStandIns++;check('C7',!!s0&&live(s0)&&(d?.omittedSessions??[]).includes(s.id),{...x,session:s.id,before:s0?.role,explanation:s.explanation});(out.examples.restByDesign??=[]).length<4&&out.examples.restByDesign.push({...x,session:s.id,explanation:s.explanation,before:s0?.prescription?.exercises.map(e=>e.id+':'+e.role),standIns:s.eventStandIns});}
     if(!had)continue;
     const ids=live(s)?s.prescription.exercises.map(e=>e.id):[];
     check('C4',!ids.includes(X),{...x,session:s.id,note:'X still prescribed'});
     if(!EVENT.includes(phase)){if(live(s))check('C4',ids.includes(sel),{...x,session:s.id,phase,ids,note:'selected not prescribed where X was'});}
     else{const ok=((performed.has(sel)||earlier(s).has(sel))&&ids.includes(sel))||(d&&(d.omittedSessions.includes(s.id)||d.standIns.some(i=>ids.includes(i))));
      const xRole=s0.prescription.exercises.find(e=>e.id===X).role;
      if(xRole==='MAIN'||phase==='TAPER')check('C4',!!ok,{...x,session:s.id,phase,ids,note:'event-week slot of X neither stand-in, omitted-and-disclosed nor performed selected',disclosure:d?{standIns:d.standIns,omitted:d.omittedSessions}:null});}
    }
   }
  }
  weekly(t,w);
 }
 }catch(e){out.errors.push({label,error:String(e.stack).slice(0,300)});}
}
fs.mkdirSync(new URL('./out/',import.meta.url),{recursive:true});
fs.writeFileSync(new URL(`./out/q01-event-week-${evName}.json`,import.meta.url),JSON.stringify(out,null,1));
console.log(JSON.stringify({shard:evName,programs:out.programs,decisions:out.decisions,modify:out.modify,status:out.status,reached:out.reached,checks:out.checks,failures:out.failures,errors:out.errors.length}));
