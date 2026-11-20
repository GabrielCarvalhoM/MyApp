// SEC-O1-03: kept-voice growth on one disputed session, FREEZE-6 vs this tree, at three loads: normal (a device, the athlete, an unknown
// source: 3 voices, the most any row holds in the O-1 and SC differentials), elevated (40 disputing reports) and the reproduced abuse (2000,
// each with a 1 KB pad, Security's SEC_O1_R1 shape). Node only, not an iPhone measurement.
//   node --expose-gc audits/v1-core-sc-2026-11-20/bench/voice-load.mjs <FREEZE-6 root> [rounds=3]
import path from 'node:path';import {pathToFileURL,fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),cand=path.resolve(here,'..','..','..'),base=process.argv[2],rounds=Number(process.argv[3]??3);
const load=async root=>(await import(pathToFileURL(path.join(root,'CoachingCore','src','r6-provenance.mjs')).href)).normalizeObservations;
const B=await load(base),C=await load(cand);
const ATH='ath-bench',dx='2026-11-05',U={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'},json=x=>JSON.parse(JSON.stringify(x));
const rep=(id,extra={})=>({athleteId:ATH,sessionId:'sd',eventId:id,observedAt:dx+'T09:00:00Z',reportedAt:dx+'T12:30:00Z',response:U,actual:{completed:true,minutes:40},source:{provider:'MANUAL'},...extra});
const opt=(asOf,prior)=>({athleteId:ATH,asOf,maximumAgeDays:36500,incoming:true,prior:json(prior)}),rec=n=>[...n.accepted,...n.supersededRows];
const dev=rep('D',{reportedAt:dx+'T11:00:00Z',source:{provider:'HEALTHKIT',activityId:'hk-d',quality:'WEARABLE_FULL'},canonicalActivityId:'hk-d'});
const loads={normal:[rep('A',{actual:{completed:true,minutes:70}}),rep('U',{source:{provider:'OTHER',quality:'UNVERIFIED'},actual:{completed:true,minutes:9}})],
 elevated:Array.from({length:40},(_,i)=>rep('e'+i,{source:{provider:'OTHER',quality:'UNVERIFIED'},actual:{completed:true,minutes:5+i%7}})),
 abuse2000:Array.from({length:2000},(_,i)=>rep('sp'+i,{source:{provider:'OTHER',quality:'UNVERIFIED'},actual:{completed:true,minutes:5+i%7,pad:'x'.repeat(1000)}}))};
const out={};
for(const [name,batch] of Object.entries(loads))for(const [k,N] of [['freeze6',B],['candidate',C]]){
 const ld=rec(N([dev],opt(dx+'T13:00:00Z',[]))),ms=[];let r,heap=0;
 for(let i=0;i<rounds;i++){globalThis.gc?.();const h0=process.memoryUsage().heapUsed,t=performance.now();r=rec(N(json(batch),opt(dx+'T15:00:00Z',ld)));ms.push(performance.now()-t);heap=Math.max(heap,process.memoryUsage().heapUsed-h0);}
 const t=performance.now();const again=rec(N([],opt(dx+'T20:00:00Z',r))),reread=performance.now()-t;
 const row=r.find(o=>o.sessionId==='sd'&&o.superseded!==true);
 (out[name]??={})[k]={voices:Object.keys(row.provenance.parts??{}).length,recordBytes:Buffer.byteLength(JSON.stringify(r)),medianMs:+ms.sort((a,b)=>a-b)[Math.floor(ms.length/2)].toFixed(2),rereadMs:+reread.toFixed(2),heapDeltaMB:+(heap/1048576).toFixed(2),conflicted:row.conflicted===true,stableOnReread:JSON.stringify(again)===JSON.stringify(json(rec(N([],opt(dx+'T20:00:00Z',r)))))};
}
console.log(JSON.stringify(out,null,1));
