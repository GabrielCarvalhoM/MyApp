// V1HR5R neutrality proof of the athlete's heart-rate operations (QRE-HR5R-09): heart rate changes nothing but heart rate. Every recorded boundary
// journey (the int.json and final.json inputs of the final physical validation, V1HR5's hr5 journeys) is replayed through THIS tree twice, over
// memory stores, with the same clock, ids and key: once as recorded, and once with setHeartRateProfile (a maximum and custom limits) injected right
// after the first plan, a change of maximum half way, and eraseHeartRateProfile near the end, each at the record's latest instant. Every
// recorded step's answer and stored document is compared in full. The only differences allowed:
//   - anything inside a `heartRateFiveZones` value, and `hash` of an object that holds one;
//   - `heartRateProfileRecord` (an answer's, the carried records', a pending change's records);
//   - `carriedMac` and `carried.seq` (the seal and sequence move with every carried commit);
//   - `carried.requests.<id>` of an injected request (its idempotency entry).
// Anything else (a plan, a session, a decision, a custody version, a safety screen, a record of the engine) is a regression: exit 1.
//   node audits/v1-hr5-runna-parity-2026-11-25/evidence/hr-neutrality.mjs [--tz <minutes>] [--out <report json>]
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const HERE=path.dirname(fileURLToPath(import.meta.url)),REPO=path.resolve(HERE,'..','..','..');
const arg=k=>{const i=process.argv.indexOf(k);return i>0?process.argv[i+1]:null;};
const TZ=arg('--tz')===null?null:Number(arg('--tz'));
const u=f=>pathToFileURL(path.join(REPO,'CoachingCore/src',f)).href;
const M={integration:await import(u('boundary/integration.mjs')),store:await import(u('boundary/store.mjs')),api:await import(u('boundary/api.mjs'))};
const INJECTED=['hr5r-inject-1','hr5r-inject-2','hr5r-inject-3'];

function run(j,key,inject){
 let clock=0,n=0,it=null,api=null;const store=M.store.memoryStore(),m=new Map(),kept=new Map();
 const anchor={get:id=>m.has(id)?{...m.get(id)}:null,set:(id,v)=>m.set(id,{...v}),clear:id=>m.delete(id)};
 const open=()=>{it=M.integration.createIntegration({store,key:j.key??key,clock:()=>clock,anchor,newId:p=>p+'_'+String(++n).padStart(6,'0')});api=M.api.createBoundary({custody:it,now:()=>clock});};
 open();const actor={athleteId:j.athleteId},out=[],injected=[];let planned=false;
 const version=()=>{const o=it.read({actor});return o.ok?o.doc.version:null;};
 // Each injected write runs at the record's own latest instant (carried.lastAt): a write at a later clock would move that instant, as any write
 // does, which is no heart-rate effect; the recorded steps then run at their own clocks as recorded.
 const hr=(rid,f)=>{const v=version();if(v===null)return;const keep=clock,raw=store.raw(j.athleteId),last=raw?JSON.parse(raw).carried?.lastAt:null;if(last)clock=Date.parse(last);
  const r=f(v,rid);clock=keep;injected.push({rid,code:r.ok===false?r.error.code:'OK'});};
 const half=Math.floor(j.steps.length/2),late=Math.max(half+1,j.steps.length-2),queue=[];let windowOpen=false;
 // A write injected after a raw.keep would make a later raw.restore of that kept blob a real rollback of it (RECORD_ROLLED_BACK, QRE-HR5R-06,
 // proved by its own test): after the first raw.keep of a journey no write is injected (the ones left are counted as not injected).
 const drain=()=>{while(!windowOpen&&queue.length)queue.shift()();};
 j.steps.forEach((s,k)=>{
  if(inject&&k===half&&planned)queue.push(()=>hr(INJECTED[1],(v,rid)=>it.setHeartRateProfile({actor,clientRequestId:rid,expectedVersion:v,heartRateProfile:{maxHeartRateBpm:188}})));
  if(inject&&k===late&&planned)queue.push(()=>hr(INJECTED[2],(v,rid)=>it.eraseHeartRateProfile({actor,clientRequestId:rid,expectedVersion:v})));
  drain();
  clock=s.at;const args=JSON.parse(JSON.stringify(s.args??{})),who=args.athleteId??j.athleteId;let rec;
  try{
   if(s.op==='reopen'){open();rec={op:s.op};}
   else if(s.op.startsWith('raw.')){const raw=store.raw(who);
    if(s.op==='raw.keep'){kept.set(who,raw);windowOpen=true;}else if(s.op==='raw.restore')store.setRaw(who,kept.get(who));else if(s.op==='raw.drop')store.remove(who);
    else if(s.op==='raw.tamper'){const i=raw.indexOf(args.find);if(i<0)rec={op:s.op,tamperTargetAbsent:true};else store.setRaw(who,raw.slice(0,i)+args.replace+raw.slice(i+args.find.length));}
    rec??={op:s.op,stored:store.raw(who)===null?null:JSON.parse(store.raw(who))};}
   else{const [side,name]=s.op.includes('.')?s.op.split('.'):['it',s.op],target=side==='it'?it:api;
    const r=target[name]({actor,...args}),raw=store.raw(j.athleteId);rec={op:s.op,answer:JSON.parse(JSON.stringify(r)),stored:raw===null?null:JSON.parse(raw)};
    if(!planned&&/enroll|onboard/.test(s.op)&&r.ok!==false&&r.status==='PROPOSED'){planned=true;
     if(inject)queue.push(()=>hr(INJECTED[0],(v,rid)=>it.setHeartRateProfile({actor,clientRequestId:rid,expectedVersion:v,heartRateProfile:{maxHeartRateBpm:201,zoneUpperBpm:[125,150,170,185]}})));drain();}}
  }catch(e){rec={op:s.op,error:e?.constructor?.name??typeof e};}
  out.push(rec);
 });
 for(const _ of queue)injected.push({rid:null,code:'NOT_INJECTED_AFTER_A_RAW_KEEP'});
 return {steps:out,injected};
}
const short=v=>{const s=JSON.stringify(v);return s===undefined?String(v):s.length>160?s.slice(0,160)+'…':s;};
function diff(a,b,at,out){
 if(a===b)return;
 const ta=Array.isArray(a)?'array':a===null?'null':typeof a,tb=Array.isArray(b)?'array':b===null?'null':typeof b;
 if(ta!==tb||ta!=='object'&&ta!=='array'){out.push({at,allowed:null,old:short(a),new:short(b)});return;}
 if(ta==='array'){if(a.length!==b.length)out.push({at:at+'.length',allowed:null,old:a.length,new:b.length});for(let i=0;i<Math.min(a.length,b.length);i++)diff(a[i],b[i],`${at}[${i}]`,out);return;}
 const five=Object.hasOwn(a,'heartRateFiveZones')||Object.hasOwn(b,'heartRateFiveZones');
 for(const k of new Set([...Object.keys(a),...Object.keys(b)])){
  const p=at+'.'+k,eq=JSON.stringify(a[k])===JSON.stringify(b[k]);if(eq)continue;
  if(k==='heartRateFiveZones'){out.push({at:p,allowed:'FIVE_ZONE_READING'});continue;}
  if(k==='heartRateProfileRecord'){out.push({at:p,allowed:'PROFILE_RECORD'});continue;}
  if(k==='hash'&&five){out.push({at:p,allowed:'HASH_OF_A_BODY_WITH_THE_FIVE_ZONES'});continue;}
  if(k==='carriedMac'){out.push({at:p,allowed:'CARRIED_SEAL'});continue;}
  if(k==='seq'&&/\.carried$/.test(at)){out.push({at:p,allowed:'CARRIED_SEQUENCE'});continue;}
  if(/\.carried\.requests$/.test(at)&&INJECTED.includes(k)&&!Object.hasOwn(a,k)){out.push({at:p,allowed:'INJECTED_REQUEST_ENTRY'});continue;}
  if(!Object.hasOwn(a,k)||!Object.hasOwn(b,k)){out.push({at:p,allowed:null,old:Object.hasOwn(a,k)?short(a[k]):'<absent>',new:Object.hasOwn(b,k)?short(b[k]):'<absent>'});continue;}
  diff(a[k],b[k],p,out);
 }
}
const fixtures=[['int','audits/v1-aif-p0-jsc-2026-11-17/ios/Tests/P0HostTests/Fixtures/int.json'],['final','audits/v1-aif-p0-jsc-2026-11-17/ios/Tests/P0HostTests/Fixtures/final.json'],['hr5','audits/v1-five-zone-heart-rate-2026-11-25/native/ios/Tests/P0HostTests/Fixtures/hr5.json']];
const report={tz:TZ,fixtures:[],allowed:{},injected:{},skipped:[],unexplained:[]};
for(const [name,file] of fixtures){
 const fx=JSON.parse(fs.readFileSync(path.join(REPO,file),'utf8')),input=JSON.parse(fx.inputJSON??JSON.stringify(fx));
 if(TZ!==null)for(const j of input.journeys)for(const st of j.steps)if(st.args?.intake&&typeof st.args.intake==='object')st.args.intake.timezoneOffsetMinutes=TZ;
 let steps=0,differing=0;
 for(const j of input.journeys){
  const A=run(j,input.key,false),B=run(j,input.key,true);
  for(const x of B.injected)report.injected[x.code]=(report.injected[x.code]??0)+1;
  let window=false;
  for(let k=0;k<A.steps.length;k++){steps++;const a=A.steps[k],b=B.steps[k];
   if(a.error||b.error){report.unexplained.push({at:`${name}/${j.name}#${k}`,allowed:null,new:'step threw '+(a.error??b.error)});continue;}
   // A tamper whose target is in the heart-rate reading of one run only is not comparable until its restore (as in regression-diff.mjs).
   if(!!a.tamperTargetAbsent!==!!b.tamperTargetAbsent)window=true;
   if(window){if(a.op==='raw.restore')window=false;else{report.skipped.push(`${name}/${j.name}#${k}`);continue;}}
   const out=[];diff(a,b,`${name}/${j.name}#${k}`,out);if(out.length)differing++;
   for(const d of out){if(d.allowed)report.allowed[d.allowed]=(report.allowed[d.allowed]??0)+1;else report.unexplained.push(d);}
  }
 }
 report.fixtures.push({name,journeys:input.journeys.length,steps,stepsWithADifference:differing});
}
report.verdict=report.unexplained.length?'REGRESSION':'HEART_RATE_ONLY';
if(arg('--out'))fs.writeFileSync(path.resolve(arg('--out')),JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({tz:TZ,fixtures:report.fixtures,injected:report.injected,allowed:report.allowed,skipped:report.skipped.length,unexplained:report.unexplained.length,verdict:report.verdict}));
if(report.unexplained.length){for(const d of report.unexplained.slice(0,15))console.error(JSON.stringify(d));process.exit(1);}
