// V1HR5R regression proof (copied from V1HR5's regression-diff.mjs and narrowed to this correction): the same recorded boundary journeys (the
// int.json and final.json inputs of the final physical validation, and V1HR5's own hr5 journeys) are replayed through the FIRST AMENDMENT's
// engine (a checkout of 4850560) and through this worktree, with the same clock, ids and key, over memory stores; every answer and every stored
// document is compared in full. The only differences allowed:
//   - anything inside a `heartRateFiveZones` value (the five-zone reading is what this correction changes), anywhere;
//   - `hash` of an object that holds `heartRateFiveZones` (the run calibration's own hash covers its body);
//   - `carriedMac` (the boundary's seal over the carried records, which hold the last answer's readings and the profile record);
//   - the added keys `heartRateProfileRecord` and `heartRateProfileDeclared` (an answer's, and the carried records'), and the carried sequence
//     `carried.seq` (QRE-HR5R-06: one more on every carried commit, kept by the anchor).
// `--tz <minutes>` replays every journey with that plan offset in each intake (QRE-HR5R-09: a positive offset), in both engines alike.
// Anything else that differs is a regression and fails this script (exit 1). Synthetic athletes only; nothing here decides training.
//   git worktree add --detach <dir> 4850560 && cp -R CoachingCore/node_modules <dir>/CoachingCore/
//   node audits/v1-hr5-runna-parity-2026-11-25/evidence/regression-diff.mjs --old <dir> [--out <report json>]
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const HERE=path.dirname(fileURLToPath(import.meta.url)),REPO=path.resolve(HERE,'..','..','..');
const arg=k=>{const i=process.argv.indexOf(k);return i>0?process.argv[i+1]:null;};
const OLD=arg('--old');if(!OLD||!fs.existsSync(path.join(OLD,'CoachingCore/src/boundary/integration.mjs'))){console.error('usage: --old <checkout of 4850560>');process.exit(2);}
const mods=async root=>{const u=f=>pathToFileURL(path.join(root,'CoachingCore/src',f)).href;
 return {integration:await import(u('boundary/integration.mjs')),store:await import(u('boundary/store.mjs')),api:await import(u('boundary/api.mjs'))};};
const [A,B]=[await mods(OLD),await mods(REPO)];

/** One recorded journey (the final-driver.js operations) over one module set: every answer and the stored document after each step. */
function run(M,j,key){
 let clock=0,n=0,it=null,api=null;const store=M.store.memoryStore(),m=new Map(),kept=new Map();
 const anchor={get:id=>m.has(id)?{...m.get(id)}:null,set:(id,v)=>m.set(id,{...v}),clear:id=>m.delete(id)};
 const open=()=>{it=M.integration.createIntegration({store,key:j.key??key,clock:()=>clock,anchor,newId:p=>p+'_'+String(++n).padStart(6,'0')});api=M.api.createBoundary({custody:it,now:()=>clock});};
 open();
 return j.steps.map(s=>{clock=s.at;const args=JSON.parse(JSON.stringify(s.args??{})),who=args.athleteId??j.athleteId;
  try{
   if(s.op==='reopen'){open();return {op:s.op};}
   if(s.op.startsWith('raw.')){const raw=store.raw(who);
    if(s.op==='raw.keep')kept.set(who,raw);else if(s.op==='raw.restore')store.setRaw(who,kept.get(who));else if(s.op==='raw.drop')store.remove(who);
    else if(s.op==='raw.tamper'){const i=raw.indexOf(args.find);if(i<0)return {op:s.op,tamperTargetAbsent:true};store.setRaw(who,raw.slice(0,i)+args.replace+raw.slice(i+args.find.length));}
    const now=store.raw(who);return {op:s.op,stored:now===null?null:JSON.parse(now)};}
   // int-driver.js names an integration operation bare (enroll); final-driver.js prefixes it (it.enroll, api.plan).
   const [side,name]=s.op.includes('.')?s.op.split('.'):['it',s.op],target=side==='it'?it:side==='api'?api:null;
   const r=target[name]({actor:{athleteId:j.athleteId},...args}),raw=store.raw(j.athleteId);
   return {op:s.op,answer:JSON.parse(JSON.stringify(r)),stored:raw===null?null:JSON.parse(raw)};
  }catch(e){return {op:s.op,error:e?.constructor?.name??typeof e};}
 });
}
/** Every difference between a frozen value and an amended one, with the allowance that explains it (or none). */
function diff(a,b,at,out,parentHasFive,ctx={}){
 if(a===b)return;
 const ta=Array.isArray(a)?'array':a===null?'null':typeof a,tb=Array.isArray(b)?'array':b===null?'null':typeof b;
 if(ta!==tb||ta!=='object'&&ta!=='array'){out.push({at,allowed:null,old:short(a),new:short(b)});return;}
 if(ta==='array'){if(a.length!==b.length)out.push({at:at+'.length',allowed:null,old:a.length,new:b.length});for(let i=0;i<Math.min(a.length,b.length);i++)diff(a[i],b[i],`${at}[${i}]`,out,false,ctx);return;}
 const hasFive=Object.hasOwn(b,'heartRateFiveZones');
 for(const k of new Set([...Object.keys(a),...Object.keys(b)])){
  const p=at+'.'+k;
  if(!Object.hasOwn(b,k)){out.push({at:p,allowed:null,old:short(a[k]),new:'<absent>'});continue;}
  if(!Object.hasOwn(a,k)){out.push({at:p,allowed:PROFILE_KEYS.includes(k)?'ADDED_HEART_RATE_PROFILE_KEY':k==='seq'&&/\.carried$/.test(at)?'ADDED_CARRIED_SEQUENCE':null,old:'<absent>',new:short(b[k])});continue;}
  if(k==='heartRateFiveZones'){if(JSON.stringify(a[k])!==JSON.stringify(b[k]))out.push({at:p,allowed:'FIVE_ZONE_READING_REVISION_2',old:short(a[k]?.model),new:short(b[k]?.model)});continue;}
  if(k==='hash'&&hasFive&&a[k]!==b[k]){out.push({at:p,allowed:'HASH_OF_A_BODY_WITH_THE_FIVE_ZONES',old:a[k],new:b[k]});continue;}
  if(k==='carriedMac'&&a[k]!==b[k]){out.push({at:p,allowed:'SEAL_OF_THE_CARRIED_READINGS_AND_PROFILE',old:a[k],new:b[k]});continue;}
  diff(a[k],b[k],p,out,hasFive,ctx);
 }
}
const TZ=arg('--tz')===null?null:Number(arg('--tz'));
const PROFILE_KEYS=['heartRateProfileRecord','heartRateProfileDeclared'];
const short=v=>{const s=JSON.stringify(v);return s===undefined?String(v):s.length>160?s.slice(0,160)+'…':s;};

const fixtures=[
 ['int',path.join(REPO,'audits/v1-aif-p0-jsc-2026-11-17/ios/Tests/P0HostTests/Fixtures/int.json')],
 ['final',path.join(REPO,'audits/v1-aif-p0-jsc-2026-11-17/ios/Tests/P0HostTests/Fixtures/final.json')],
 ['hr5',path.join(REPO,'audits/v1-five-zone-heart-rate-2026-11-25/native/ios/Tests/P0HostTests/Fixtures/hr5.json')],
];
const report={old:OLD===REPO?'(same tree)':path.basename(OLD),tz:TZ,fixtures:[],allowed:{},skipped:[],unexplained:[]};
for(const [name,file] of fixtures){
 const fx=JSON.parse(fs.readFileSync(file,'utf8')),input=JSON.parse(fx.inputJSON??JSON.stringify(fx));
 if(TZ!==null)for(const j of input.journeys)for(const st of j.steps)if(st.args?.intake&&typeof st.args.intake==='object')st.args.intake.timezoneOffsetMinutes=TZ;
 let steps=0,differing=0,withFive=0,errors=0,skipped=0;
 for(const j of input.journeys){
  const ra=run(A,j,input.key),rb=run(B,j,input.key);let openAt=null;
  // A step that throws in either engine proves nothing about the answer: the harness itself is then wrong, and fails.
  for(const [k,x] of [...ra.entries(),...rb.entries()])if(x.error){errors++;report.unexplained.push({at:`${name}/${j.name}#${k}`,allowed:null,old:'harness',new:'step threw '+x.error});}
  // A tamper of the NEW reading (its target string exists only in the amended document) has nothing to tamper in the frozen one: the steps
  // from it to the next raw.restore are not comparable and are counted as skipped, never passed; the journey is compared again after it.
  let window=false;
  for(let k=0;k<Math.max(ra.length,rb.length);k++){steps++;
   // V1HR5R: a tamper of a revision-1 value (absent from the revision-2 document) is as incomparable as one of a new value: either side.
   if(!!ra[k]?.tamperTargetAbsent!==!!rb[k]?.tamperTargetAbsent){window=true;openAt=k;}
   if(window){if((rb[k]?.op??ra[k]?.op)==='raw.restore'){window=false;openAt=null;}else{skipped++;report.skipped.push(`${name}/${j.name}#${k}:${rb[k]?.op}`);continue;}}
   const out=[],addsFive=JSON.stringify(rb[k]?.stored??null).includes('"heartRateFiveZones"')&&!JSON.stringify(ra[k]?.stored??null).includes('"heartRateFiveZones"');
   diff(ra[k],rb[k],`${name}/${j.name}#${k}`,out,false,{storedAddsFive:addsFive});
   if(out.length)differing++;if(out.some(d=>d.allowed==='FIVE_ZONE_READING_REVISION_2'))withFive++;
   for(const d of out){if(d.allowed)report.allowed[d.allowed]=(report.allowed[d.allowed]??0)+1;else report.unexplained.push(d);}}
  // QRE-HR5-09: a tamper window never closed by a restore would skip the rest of the journey silently: it is a harness failure instead.
  if(window)report.unexplained.push({at:`${name}/${j.name}#${openAt}`,allowed:null,old:'harness',new:'tamper window never closed by raw.restore'});
 }
 report.fixtures.push({name,journeys:input.journeys.length,steps,stepsWithADifference:differing,stepsWhoseFiveZoneReadingChanged:withFive,stepsThatThrew:errors,stepsSkippedTamperOfTheNewReading:skipped});
}
report.verdict=report.unexplained.length?'REGRESSION':'FIVE_ZONE_READING_AND_PROFILE_ONLY';
const text=JSON.stringify(report,null,1)+'\n';
if(arg('--out'))fs.writeFileSync(path.resolve(arg('--out')),text);
console.log(JSON.stringify({fixtures:report.fixtures,allowed:report.allowed,unexplained:report.unexplained.length,verdict:report.verdict}));
if(report.unexplained.length){for(const d of report.unexplained.slice(0,20))console.error(JSON.stringify(d));process.exit(1);}
