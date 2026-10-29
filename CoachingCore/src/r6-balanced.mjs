import {clone,hash} from './value.mjs';
import {catalogueEntry} from './r6-catalogue.mjs';
import {byCodePoint} from './r6-provenance.mjs';

export const SEVERITY=['NONE','LOW','MODERATE','HIGH'];
const rank=s=>SEVERITY.indexOf(s??'NONE');
const level=n=>SEVERITY[Math.max(0,Math.min(3,n))];
const max=(a,b)=>rank(a)>=rank(b)?a:b;
const KEY_RUN=['THRESHOLD','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','RACE_TOUCH','LONG','RACE','CRUISE','FASTER','HILLS','EVENT_SPECIFIC'];
/** Mirrors PROGRAM_POLICY_R6.operational.hybrid; callers pass the authority-bound values and a test checks equality. */
export const DEFAULT_HYBRID=Object.freeze({sameSessionGapHours:6,nextDayGapHours:30,twoDayGapHours:54,heavyLowerRepeatGapHours:48,preRaceStrengthGapHours:72,turnHours:Object.freeze({AM:7,PM:18}),backToBackGapHours:1.2,heavyLowerMinimumSets:3,qualityAdjacentToLongForbiddenWhenAlternativeExists:true});
/** Lower-body demand of a strength session from its rows; R5 rows without a catalogue entry use pattern and volume. */
const DEMAND=['NONE','LIGHT','MODERATE','HEAVY'];
const maxDemand=(a,b)=>DEMAND.indexOf(a)>=DEMAND.indexOf(b)?a:b;
export function lowerDemand(p,H=DEFAULT_HYBRID){
 if(p?.modality!=='STRENGTH')return 'NONE';
 let demand='NONE';
 for(const e of p.exercises??[]){
  const entry=catalogueEntry(e.id),pattern=String(e.pattern??entry?.pattern??'').toUpperCase(),lower=['SQUAT','HINGE','LUNGE','CALF'].includes(pattern)||entry?.region==='LOWER';
  if(!lower)continue;
  const external=e.load?.unit==='KG'||e.load?.mode==='KNOWN'&&e.load?.unit!=='BODYWEIGHT'||e.load?.mode==='ESTABLISH'||e.load?.mode==='FROM_LOG';
  const base=entry?.lowerDemand??(external?(['SQUAT','HINGE'].includes(pattern)?'HEAVY':'MODERATE'):'LIGHT');
  const byVolume=base==='HEAVY'&&e.sets<H.heavyLowerMinimumSets?'MODERATE':base==='MODERATE'&&e.sets<2?'LIGHT':base;
  demand=maxDemand(demand,pattern==='CALF'&&byVolume!=='NONE'?'LIGHT':byVolume);
 }
 return demand;
}
export function loadClass(session,H=DEFAULT_HYBRID){
 const p=session.prescription;
 if(p?.modality==='RUN')return {run:KEY_RUN.includes(p.family)?'KEY':p.family==='WALK'?'NONE':'EASY',lower:'NONE'};
 return {run:'NONE',lower:lowerDemand(p,H)};
}
const hourOf=(s,H)=>s.day*24+(Number.isFinite(s.startMinute)?s.startMinute/60:H.turnHours[s.turn]??12)+(s.backToBackOrder??0)*H.backToBackGapHours;
/**
 * Ordinal residual-interference costs between sessions (R6-HYBRID-ARRANGEMENT). Direction and gap matter;
 * nothing is summed or counted into a score. Week wrap compares the last sessions with next week's first.
 * Any run, easy included, shortly before moderate or heavy lower-body work costs strength when strength develops.
 */
export function interferenceCosts(sessions,{wrap=true,hybrid=DEFAULT_HYBRID,athleteSeverity=null,strengthDevelopment=true}={}){
 const H=hybrid,rows=sessions.map(s=>({s,c:loadClass(s,H),h:hourOf(s,H)})),out=[];
 const pairs=[];for(const a of rows)for(const b of rows){if(a===b)continue;let gap=b.h-a.h;if(gap<=0&&wrap)gap+=168;if(gap>0&&gap<=Math.max(H.preRaceStrengthGapHours,H.twoDayGapHours))pairs.push([a,b,gap]);}
 for(const [a,b,gap] of pairs){
  const add=(axis,severity,cause)=>{const learned=athleteSeverity?.[cause];out.push({axis,severity:learned&&rank(learned)>rank(severity)?learned:severity,cause,beforeId:a.s.id??a.s.anchorId,afterId:b.s.id??b.s.anchorId,gapHours:Math.round(gap*10)/10,...(learned&&rank(learned)>rank(severity)?{athleteSpecific:true,populationSeverity:severity}:{})});};
  const sameSession=gap<=H.sameSessionGapHours,sameDay=a.s.day===b.s.day&&gap<24;
  const before=what=>sameSession?`${what} shortly before`:sameDay?`${what} earlier the same day as`:`${what} the day before`;
  if(b.c.run==='KEY'&&b.s.prescription.family==='RACE'&&['MODERATE','HEAVY'].includes(a.c.lower)&&gap<=H.preRaceStrengthGapHours)add('run','HIGH','Lower-body strength within three days before the race');
  else if(b.c.run==='KEY'&&a.c.lower==='HEAVY')gap<=H.nextDayGapHours?add('run','MODERATE',before('Heavy lower-body work')+' a key run'+(sameSession?' (same session)':'')):gap<=H.twoDayGapHours&&add('run','LOW','Heavy lower-body work two days before a key run');
  else if(b.c.run==='KEY'&&a.c.lower==='MODERATE'&&gap<=H.nextDayGapHours)add('run','LOW',before('Moderate lower-body work')+' a key run'+(sameSession?' (same session)':''));
  if(a.c.run==='KEY'&&b.c.lower==='HEAVY')gap<=H.sameSessionGapHours?add('strength','MODERATE','Key run shortly before heavy lower-body work (same-session interference)'):gap<=H.nextDayGapHours&&add('strength','LOW',before('Key run')+' heavy lower-body work');
  else if(a.c.run==='KEY'&&b.c.lower==='MODERATE'&&gap<=H.sameSessionGapHours)add('strength','LOW','Key run shortly before moderate lower-body work');
  else if(a.c.run==='EASY'&&['MODERATE','HEAVY'].includes(b.c.lower)&&sameSession&&strengthDevelopment)add('strength','LOW',`Easy run shortly before ${b.c.lower.toLowerCase()} lower-body work (same session)`);
  if(a.c.run==='KEY'&&b.c.run==='KEY'&&gap<=H.nextDayGapHours&&b.s.prescription.family!=='RACE')add('run','MODERATE','Two key runs within about a day');
  if(a.c.lower==='HEAVY'&&b.c.lower==='HEAVY'&&gap<=H.heavyLowerRepeatGapHours)add('strength','MODERATE','Two heavy lower-body sessions within two days');
 }
 return out;
}
/** H0 session (worst), H1 week (sorted severity list, worst first), H2 block emphasis, H3 goal/event relevance — ordinal, per axis. */
export function horizonCosts(costs,{lead='JOINT',eventPhase=false,strengthDevelopment=false,runDevelopment=false,runRole='PRIMARY',strengthRole='PRIMARY'}={}){
 const worst=axis=>costs.filter(c=>c.axis===axis).reduce((m,c)=>max(m,c.severity),'NONE');
 const list=axis=>costs.filter(c=>c.axis===axis&&c.severity!=='NONE').map(c=>rank(c.severity)).sort((x,y)=>y-x);
 const H0={run:worst('run'),strength:worst('strength')},H1={run:list('run'),strength:list('strength')};
 const shift=(sev,axis)=>{if(sev==='NONE')return 'NONE';let n=rank(sev);if(lead==='RUN'&&axis==='run'||lead==='STRENGTH'&&axis==='strength')n++;if(axis==='run'&&runRole==='MAINTAIN'||axis==='strength'&&strengthRole==='MAINTAIN')n--;return level(Math.max(1,n));};
 const H2={run:shift(H0.run,'run'),strength:shift(H0.strength,'strength')};
 const H3={run:(eventPhase||runDevelopment)&&H0.run!=='NONE'?level(rank(H2.run)+1):H2.run,strength:strengthDevelopment&&!eventPhase&&H0.strength!=='NONE'?level(rank(H2.strength)+1):H2.strength};
 return {H0,H1,H2,H3};
}
const horizons=['H3','H2','H1','H0'];
/** Each horizon value as a worst-first list of ranks; leximax compares lists element by element. */
const asList=x=>Array.isArray(x)?x:[rank(x)];
const lex=(a,b)=>{for(let i=0;i<Math.max(a.length,b.length);i++){const x=a[i]??0,y=b[i]??0;if(x!==y)return x-y;}return 0;};
const noWorse=(a,b)=>{for(let i=0;i<Math.max(a.length,b.length);i++)if((a[i]??0)>(b[i]??0))return false;return true;};
function dominates(a,b){
 let strictly=false;
 for(const axis of ['run','strength']){if(Number(a.preserves[axis])<Number(b.preserves[axis]))return false;if(a.preserves[axis]&&!b.preserves[axis])strictly=true;}
 for(const h of horizons)for(const axis of ['run','strength']){const x=asList(a.horizons[h][axis]),y=asList(b.horizons[h][axis]);if(!noWorse(x,y))return false;if(lex(x,y)<0)strictly=true;}
 return strictly;
}
function jointKey(c,lead){
 const groups=lead==='RUN'?[['run'],['strength']]:lead==='STRENGTH'?[['strength'],['run']]:[['run','strength']];
 const key=[];for(const group of groups)for(const h of horizons)key.push(group.flatMap(axis=>asList(c.horizons[h][axis])).sort((x,y)=>y-x));
 return key;
}
const compareKey=(a,b)=>{for(let i=0;i<Math.max(a.length,b.length);i++){const d=lex(a[i]??[],b[i]??[]);if(d)return d;}return 0;};
/**
 * Balanced/contextual arrangement choice. Never candidate order, a fixed split, alternation or a hidden modality priority.
 * When severity classes are unavailable (authority not current), costs are UNKNOWN and any real trade-off is asked.
 */
export function chooseBalanced(candidates,{lead='JOINT',temporaryPreference=null,athleteEvidence=null,currentId=null,severityAuthority=true,context={},hybrid=DEFAULT_HYBRID,athleteSeverity=null}={}){
 const rows=(candidates??[]).map(original=>{
  const c=clone(original),costs=severityAuthority?interferenceCosts(c.sessions??[],{wrap:c.wrap!==false,hybrid,athleteSeverity,strengthDevelopment:context.strengthRole!=='MAINTAIN'}):[];
  return {...c,costs,horizons:severityAuthority?horizonCosts(costs,{lead,...context}):{H0:{run:'NONE',strength:'NONE'},H1:{run:0,strength:0},H2:{run:'NONE',strength:'NONE'},H3:{run:'NONE',strength:'NONE'}},preserves:{run:c.preservesRun!==false,strength:c.preservesStrength!==false},signature:c.signature??hash((c.sessions??[]).map(s=>[s.id??s.anchorId??s.role,s.day,s.turn??s.startMinute,s.backToBackOrder??0,s.prescription]))};
 });
 const feasible=rows.filter(c=>c.admissible!==false);
 const pareto=feasible.filter(c=>!feasible.some(o=>o!==c&&dominates(o,c)));
 const bySignature=new Map();for(const c of pareto)if(!bySignature.has(c.signature))bySignature.set(c.signature,c);
 let pool=[...bySignature.values()],selected=null,reason='No feasible complete candidate',askRequired=false,basis=null;
 if(pool.length===1){selected=pool[0];basis='PARETO';reason='Only Pareto candidate: no other feasible arrangement preserves at least as much essential stimulus with no higher cost at any horizon';}
 else if(pool.length>1){
  const keys=pool.map(c=>({c,key:jointKey(c,lead)})),best=keys.reduce((m,x)=>compareKey(x.key,m)<0?x.key:m,keys[0].key),winners=keys.filter(x=>compareKey(x.key,best)===0).map(x=>x.c);
  const identicalCosts=winners.every(w=>hash(w.horizons)===hash(winners[0].horizons)&&hash(w.preserves)===hash(winners[0].preserves));
  if(winners.length===1&&severityAuthority){selected=winners[0];basis='LOWEST_WORST_CASE_JOINT_HARM';reason=`Lowest worst-case joint harm (${lead==='JOINT'?'both goals weighted equally':lead.toLowerCase()+' leads in this phase'}); the remaining cost is disclosed and the athlete may choose otherwise`;}
  else{
   const evidenceWinner=athleteEvidence?.preferredId&&athleteEvidence.confidence==='STRONG'?winners.find(c=>c.id===athleteEvidence.preferredId):null;
   const preferred=temporaryPreference?winners.filter(c=>c.costs.every(x=>x.axis!==temporaryPreference.toLowerCase()||x.severity==='NONE')):[];
   const narrowed=preferred.length?preferred:winners,current=narrowed.find(c=>c.id===currentId);
   const sameCosts=narrowed.every(w=>hash(w.horizons)===hash(narrowed[0].horizons)&&hash(w.preserves)===hash(narrowed[0].preserves));
   // Equal options: least change, then the athlete's own template order and earliest quality day; options differing only in
   // back-to-back order are disclosed as either order. No candidate identifier decides.
   const layout=x=>hash((x.sessions??[]).map(s=>[s.sport,s.role,s.day,s.templateIndex??null]).sort((p,q)=>byCodePoint(p,q)));
   const permKey=x=>(x.sessions??[]).filter(q=>q.sport==='STRENGTH').sort((p,q)=>p.day-q.day).map(q=>q.templateIndex??0).join(',');
   const canonical=list=>{const sorted=[...list].sort((a,b)=>(a.changeCost??0)-(b.changeCost??0)||byCodePoint(permKey(a),permKey(b))||(a.quality??-1)-(b.quality??-1)||byCodePoint(layout(a),layout(b))||byCodePoint(a.signature,b.signature));const first=sorted[0],twins=sorted.filter(x=>layout(x)===layout(first));return twins.length>1?{...first,orderFlexible:true}:first;};
   if(evidenceWinner){selected=evidenceWinner;basis='ATHLETE_EVIDENCE';reason='Repeated comparable athlete evidence distinguishes otherwise equal-harm arrangements (association, not causation)';}
   else if(preferred.length&&(preferred.length===1||sameCosts&&severityAuthority)){selected=preferred.length===1?preferred[0]:current??canonical(preferred);basis='TEMPORARY_PREFERENCE';reason='Explicit temporary preference resolves an otherwise incomparable trade-off'+(preferred.length>1?'; remaining options inside the preference carry identical costs':'');}
   else if(current&&(identicalCosts||sameCosts)){selected=current;basis='KEEP_CURRENT';reason='Current arrangement is among the equal-harm options; keeping it avoids unnecessary change';}
   else if(current&&!preferred.length&&identicalCosts){selected=current;basis='KEEP_CURRENT';reason='Current arrangement is among the equal-harm options; keeping it avoids unnecessary change';}
   else if(identicalCosts&&severityAuthority){const decided=winners.length<pool.length,pruned=pareto.length<feasible.length;selected=canonical(winners);basis=decided?'LOWEST_WORST_CASE_JOINT_HARM':pruned?'PARETO_THEN_EQUIVALENT':'EQUIVALENT_NO_TRADE_OFF';reason=(decided?`Lowest worst-case joint harm (${lead==='JOINT'?'both goals weighted equally':lead.toLowerCase()+' leads in this phase'}); `:pruned?'Dominated arrangements removed (no lower cost at any horizon and higher at one); ':'')+'the remaining candidates carry identical costs at every horizon, so there is no trade-off to resolve'+(selected.orderFlexible?': the order on shared shifts is either':'; a canonical choice is made, not a preference');}
   else{askRequired=true;basis='GENUINE_TRADE_OFF';reason=severityAuthority?'Equal worst-case joint harm with opposing costs: a genuine trade-off that needs the athlete’s temporary preference':'Arrangement severity authority is unavailable; the trade-off between Pareto candidates cannot be compared and is asked';}
  }
 }
 const loser=c=>c.admissible===false?(c.reasons??['Inadmissible']).join('; '):!pareto.includes(c)?'Dominated: another feasible arrangement is no worse at every horizon and better at one':askRequired?'Unresolved trade-off; awaiting preference':'Higher worst-case joint harm or equivalent alternative not selected';
 return {selected:selected??null,reason,basis,askRequired,question:askRequired?{id:'TEMPORARY_TRADE_OFF_PREFERENCE',options:pool.map(c=>({id:c.id,costs:c.costs.filter(x=>x.severity!=='NONE')})),prompt:'Which session should stay freshest this block?'}:null,paretoIds:pareto.map(c=>c.id),tiedIds:askRequired?pool.map(c=>c.id):[],counterfactuals:rows.map(c=>({id:c.id,admissible:c.admissible!==false,preserves:c.preserves,costs:c.costs,horizons:c.horizons,selected:c.id===selected?.id,reason:c.id===selected?.id?reason:loser(c)}))};
}
