// ---------- Safety Continuity (appended by compose-sc-differential.mjs; everything above is the O-1 harness, unchanged but for STOPS) ----------
const loadF=r=>import(pathToFileURL(path.join(r,'src/v1-f08.mjs')).href);
const OF=await loadF(oldRoot),NF=await loadF(newRoot);
const READY=NF.readReadiness({declaredRecovered:true,sports:{RUN:{ready:true}},warningSigns:Object.fromEntries(NF.READINESS_SIGNS.map(k=>[k,false]))},{programmed:['RUN']}).value;
const R0=NF.readinessFact({athleteId:ATH},{event:{id:'ready-sc'},readiness:{}},'2026-10-01T08:00:00.000Z',READY,null);
const asOfDay=DAY;
const readyAt=t=>({...R0,declaredAt:t});
const f08View=(F,record,withReady)=>{const r=F.restartIntake({intake:{asOf:asOfDay,athlete:{id:ATH,recent:{runMinutesPerWeek:600,runDaysPerWeek:7}}},record:json(withReady?[typeof withReady==='string'?readyAt(withReady):R0,...record]:record),asOf:asOfDay,screen:()=>({status:'NONCLINICAL'}),athleteId:ATH});
 return {status:r.status,declared:r.facts?.pause?.readinessDeclared===true,pause:r.facts?.pause?{weeks:r.facts.pause.weeks,bySportDays:r.facts.pause.bySportDays}:null,last:r.carried?.priorCapacity?.lastExecutedDay??null,bySport:r.carried?.priorCapacity?.lastExecutedBySport??null,recent:r.intake?.athlete?.recent??null};};
const didA=x=>x?.completed===true||Number(x?.minutes)>0,stoppedA=x=>!!x&&typeof x==='object'&&x.stop!==undefined&&x.stop!==null&&x.stop!==false;
const voicesA=o=>[o.actual,...Object.values(o.provenance?.parts??{}).map(p=>p?.actual)];
const stopAfterReady=(record,at=R0.declaredAt)=>record.some(o=>!o.fact&&voicesA(o).some(stoppedA)&&Date.parse(o.observedAt)>Date.parse(at));
// a declaration placed one hour before the latest-observed row that holds a stop (in force, kept or replaced), so only that session follows it
const justBeforeStop=record=>{const t=record.filter(o=>!o.fact&&voicesA(o).some(stoppedA)).map(o=>Date.parse(o.observedAt)).filter(Number.isFinite).sort((a,b)=>a-b).at(-1);return t===undefined?null:new Date(t-3600e3).toISOString();};
const VOICED=['CORRECTION_CONFLICTS_WITH_A_REPORT_IN_FORCE','CONFLICTING_PHYSICAL_OR_RESPONSE_REPORTS'];
const occursNow=record=>record.some(o=>!o.fact&&o.conflicted===true&&o.superseded!==true&&VOICED.includes(o.provenance?.conflict)&&partsOf(o).length>1&&voicesA(o).every(a=>didA(a)&&typeof a?.completed==='boolean'));
// SEC-O1-02: identities a report refused for integrity quarantined on FREEZE-6 with no row flagged on them (a phantom quarantine).
const phantomOf=(a,prior,batch)=>{// flagged as the record came in: the runtime differs from FREEZE-6 only where an identity was quarantined with no flagged row in force at that moment
 const out=new Set(),flagged=i=>prior.some(p=>p.superseded!==true&&p.conflicted===true&&identity(p)===i);
 for(const e of a.excluded){const o=batch.find(x=>x.eventId===e.eventId&&hash(x)===e.inputHash);if(!o)continue;const i=identity(o);
  // an event id reused: the row holding it is flagged; a phantom here when that row is not one in force on this identity (another session's, or a history row)
  const raises=e.reason==='ACTIVITY_BOUND_TO_TWO_SESSIONS'||o.conflicted===true||e.reason==='EVENT_ID_REUSED_WITH_DIFFERENT_FACTS'&&!a.accepted.some(x=>identity(x)===i&&idsOfRow(x).includes(o.eventId));
  // no flag condition here: where a flagged row was in force at that moment both runtimes act alike, so a difference needs a phantom moment;
  // a flag the record carried can be resolved earlier in the same pass, and the refusal then raises a phantom (QRE-O1-02)
  if(raises)out.add(i);}
 // the quarantine also persists on FREEZE-6 for an identity whose dispute was 'resolved' through it (QRE-O1-02): its later reports, or a correction
 for(const q of a.quarantinedIdentities)if(!flagged(q)&&!a.accepted.some(x=>identity(x)===q&&x.conflicted===true))out.add(q);
 return out;};
const diffIds=(a,b,batch)=>{const ids=new Set([...a.accepted,...a.supersededRows,...b.accepted,...b.supersededRows].map(identity)),rowsOf=(n,i)=>canon([...n.accepted,...n.supersededRows].filter(o=>identity(o)===i).map(o=>canon([doseRow(o),partsOf(o).sort()])).sort());
 const out=new Set([...ids].filter(i=>rowsOf(a,i)!==rowsOf(b,i)));
 const ex=n=>new Map(n.excluded.map(e=>[e.eventId+'|'+e.inputHash,e.reason]));const ea=ex(a),eb=ex(b);
 for(const k of new Set([...ea.keys(),...eb.keys()]))if(ea.get(k)!==eb.get(k)){const [id,h]=k.split('|');const o=[...a.excluded,...b.excluded].find(e=>e.eventId===id&&e.inputHash===h);const src=o&&batch.find(x=>x.eventId===o.eventId&&hash(x)===o.inputHash);out.add(src?identity(src):'?'+id);}
 return out;};
const SC={cases:0,passes:0,normalizer:{identical:0,classes:{},credit:{gained:0,lost:0}},f08:{same:0,classes:{},invariants:{declaredWhereOldAsked:0,recentDiffers:0,declaredOverStop:0,lastMovedWithoutOccurrence:0}},candidate:{lostInForce:0,orphans:0,doubleIdentity:0,doubleActivity:0,rereadUnstable:0,roundTripUnstable:0,nondeterministic:0},o1Invariants:{voiceLost:0,integrityVoiceKept:0,unmergedVoiceOnCleanRow:0},size:{base:{recordBytes:0,maxRowBytes:0,maxParts:0},candidate:{recordBytes:0,maxRowBytes:0,maxParts:0}},stopsGenerated:0};
const scSamples=[];
for(let c=0;c<N;c++){
 SC.cases++;const {passes}=gen();let prior=[];
 for(const [p,batch] of passes.entries()){
  if(!batch.length)continue;SC.passes++;SC.stopsGenerated+=batch.filter(o=>stoppedA(o.actual)).length;
  const o={athleteId:ATH,asOf:DAY+'T0'+(p+1)+':00:00Z',maximumAgeDays:36500,incoming:true};
  const a=OLD(json(batch),{...o,prior:json(prior)}),b=NEW(json(batch),{...o,prior:json(prior)}),b2=NEW(json(batch),{...o,prior:json(prior)});
  for(const [k,n] of [['base',a],['candidate',b]]){const r=rec(n);SC.size[k].recordBytes+=Buffer.byteLength(JSON.stringify(r));for(const x of r){SC.size[k].maxRowBytes=Math.max(SC.size[k].maxRowBytes,Buffer.byteLength(JSON.stringify(x)));SC.size[k].maxParts=Math.max(SC.size[k].maxParts,partsOf(x).length);}}
  if(canon(b)!==canon(b2))SC.candidate.nondeterministic++;
  SC.candidate.lostInForce+=lostOf(b,prior).length;if(orphansOf(b).length)SC.candidate.orphans++;if(doubleId(b))SC.candidate.doubleIdentity++;if(doubleAct(b))SC.candidate.doubleActivity++;
  const asOf2=DAY+'T0'+(p+1)+':30:00Z',rb=rereadOf(NEW,b,asOf2),rbt=rereadOf(NEW,json(b),asOf2);
  if(!stableOf(b,rb))SC.candidate.rereadUnstable++;if(canon(rb)!==canon(rbt))SC.candidate.roundTripUnstable++;
  {const v=o1Invariants(b,prior,batch);for(const k of Object.keys(v))SC.o1Invariants[k]+=v[k];}
  // the normalizer: FREEZE-6 vs the candidate on the same input
  let nk='IDENTICAL';
  if(canon(a)===canon(b))SC.normalizer.identical++;
  else{const ph=phantomOf(a,prior,batch),d=diffIds(a,b,batch);const qa=new Set(a.quarantinedIdentities),extra=b.quarantinedIdentities.filter(q=>!qa.has(q)),x0=sorted(a),y0=sorted(b);x0.quarantinedIdentities=y0.quarantinedIdentities=[];
   nk=d.size&&[...d].every(i=>ph.has(i))?(canon(doseView(a))===canon(doseView(b))?'PHANTOM_VOICES':'PHANTOM_QUARANTINE'):!d.size&&extra.length&&extra.every(q=>ph.has(q))&&b.quarantinedIdentities.every(q=>qa.has(q)||extra.includes(q))&&canon(x0)===canon(y0)?'PHANTOM_LISTED':canon(sorted(a))===canon(sorted(b))?'ORDER_ONLY':'UNEXPLAINED';
   if(nk==='PHANTOM_QUARANTINE'){const clean=n=>new Set(n.accepted.filter(o=>!o.conflicted).map(identity)),ca=clean(a),cb=clean(b);const g=[...cb].filter(i=>!ca.has(i));SC.normalizer.credit.gained+=g.length;if(g.length&&process.env.GAINED)scSamples.push({kind:'gained',ids:g,prior:prior.map(sm),batch:batch.map(sm),old:{acc:a.accepted.map(o=>sm(o)+(o.conflicted?'!':'')+'{'+partsOf(o)+'}'),exc:a.excluded.map(e=>e.eventId+':'+e.reason)},new:{acc:b.accepted.map(o=>sm(o)+(o.conflicted?'!':'')+'{'+partsOf(o)+'}'),exc:b.excluded.map(e=>e.eventId+':'+e.reason)}});SC.normalizer.credit.lost+=[...ca].filter(i=>!cb.has(i)).length;}
   SC.normalizer.classes[nk]=(SC.normalizer.classes[nk]??0)+1;if(nk==='UNEXPLAINED'&&scSamples.length<5)scSamples.push({kind:'normalizer',raw:process.env.RAW?{prior,batch,o}:undefined,prior:prior.map(sm),batch:batch.map(sm),diff:[...d],phantom:[...ph],old:{acc:a.accepted.map(o=>sm(o)+(o.conflicted?'!':'')+'{'+partsOf(o)+'}'),exc:a.excluded.map(e=>e.eventId+':'+e.reason),q:a.quarantinedIdentities},new:{acc:b.accepted.map(o=>sm(o)+(o.conflicted?'!':'')+'{'+partsOf(o)+'}'),exc:b.excluded.map(e=>e.eventId+':'+e.reason),q:b.quarantinedIdentities}});}
  // f08: FREEZE-6's f08 vs the candidate's on the same record (the candidate's), with an early readiness declaration and with none
  const r=rec(b);
  for(const withReady of [true,false,justBeforeStop(r)].filter(v=>v!==null)){
   const x=f08View(OF,r,withReady),y=f08View(NF,r,withReady);
   if(canon(x)===canon(y)){SC.f08.same++;continue;}
   const inv=SC.f08.invariants;
   if(!x.declared&&y.declared)inv.declaredWhereOldAsked++;
   if(canon(x.recent)!==canon(y.recent))inv.recentDiffers++;
   const at=typeof withReady==='string'?withReady:R0.declaredAt;
   if(withReady&&y.declared&&stopAfterReady(r,at))inv.declaredOverStop++;
   const lastMoved=canon([x.last,x.bySport,x.pause?.bySportDays])!==canon([y.last,y.bySport,y.pause?.bySportDays]);
   if(lastMoved&&!occursNow(r))inv.lastMovedWithoutOccurrence++;
   const ks=[];if(x.declared&&!y.declared)ks.push(stopAfterReady(r,at)?'STOP_ON_RECORD':'ASK_UNEXPLAINED');
   if(lastMoved)ks.push(occursNow(r)?'OCCURRENCE':'OCCURRENCE_UNEXPLAINED');
   const rest=canon({...x,declared:0,pause:x.pause?{...x.pause,bySportDays:0,weeks:0}:null,last:0,bySport:0})!==canon({...y,declared:0,pause:y.pause?{...y.pause,bySportDays:0,weeks:0}:null,last:0,bySport:0});
   if(rest&&!(x.pause===null)!==(y.pause===null))ks.push('OTHER');else if(rest)ks.push(x.pause===null||y.pause===null?(occursNow(r)?'OCCURRENCE':'OCCURRENCE_UNEXPLAINED'):'OTHER');
   const k=(typeof withReady==='string'?'beforeStop:':withReady?'ready:':'noReady:')+([...new Set(ks)].sort().join('+')||'OTHER');SC.f08.classes[k]=(SC.f08.classes[k]??0)+1;
   if(/UNEXPLAINED|OTHER/.test(k)&&scSamples.length<10)scSamples.push({kind:'f08:'+k,x,y,record:r.map(sm)});
  }
  prior=r;
 }
}
const bad=SC.normalizer.classes.UNEXPLAINED??0,f08bad=Object.entries(SC.f08.classes).filter(([k])=>/UNEXPLAINED|OTHER/.test(k)).reduce((n,[,v])=>n+v,0);
SC.verdict={unexplainedNormalizer:bad,unexplainedF08:f08bad,invariantsNonZero:Object.entries({...SC.candidate,...SC.o1Invariants,...SC.f08.invariants}).filter(([,v])=>v).map(([k])=>k)};
console.log('SC '+JSON.stringify(SC,null,1));
for(const x of scSamples.slice(0,Number(process.env.SHOW??0)))console.log(JSON.stringify(x).slice(0,3000));
if(process.env.RAW)fs.writeFileSync(process.env.RAW,JSON.stringify(scSamples));
if(process.env.SC_OUT)fs.writeFileSync(process.env.SC_OUT,JSON.stringify(SC,null,1)+'\n');
process.exitCode=bad||f08bad||SC.verdict.invariantsNonZero.length?1:0;
