// Normalization Consistency: retained vs allocated heap of the normalizer on the bench's corrected history (120 reports, 120 corrections, a third
// refused), base (e704180) vs this tree. `allocated` is heapUsed after 20 runs with no collection between (the bench's measure, garbage included);
// `retained` is heapUsed after a forced collection with the 20 results still held. Usage: node --expose-gc heap-retained.mjs <baseRoot>
import path from 'node:path';import {pathToFileURL} from 'node:url';
const here=path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')),cand=path.resolve(here,'..','..','..'),base=process.argv[2];
const load=r=>import(pathToFileURL(path.join(r,'CoachingCore','src','r6-provenance.mjs')).href).then(m=>m.normalizeObservations);
const N={base:await load(base),candidate:await load(cand)};
const U={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'},day=i=>new Date(Date.parse('2026-09-01T00:00:00Z')+i*864e5).toISOString().slice(0,10);
const rep=(i,extra={})=>({athleteId:'b',sessionId:'s'+i,eventId:'e'+i,observedAt:day(i)+'T09:00:00Z',reportedAt:day(i)+'T12:00:00Z',context:{sport:i%3?'RUN':'STRENGTH',sessionType:'RUN_EASY'},response:U,actual:{completed:true,minutes:40},source:{provider:'MANUAL'},...extra});
const hist=Array.from({length:120},(_,i)=>rep(i)),fixes=Array.from({length:120},(_,i)=>({...rep(i),eventId:i%3===0?'e'+((i+1)%120):'c'+i,correctionOf:'e'+i,correctedAt:day(i)+'T20:00:00Z',reportedAt:day(i)+'T20:00:00Z',actual:{completed:true,minutes:35}}));
const out={};
for(let round=0;round<4;round++)for(const k of round%2?['candidate','base']:['base','candidate']){
 globalThis.gc();const h0=process.memoryUsage().heapUsed,keep=[];
 for(let i=0;i<20;i++)keep.push(N[k]([...hist,...fixes],{athleteId:'b',asOf:'2027-01-01T00:00:00Z',maximumAgeDays:36500}));
 const allocated=(process.memoryUsage().heapUsed-h0)/20/1024;globalThis.gc();const retained=(process.memoryUsage().heapUsed-h0)/20/1024;
 (out[k]??=[]).push({allocatedKiB:Math.round(allocated),retainedKiB:Math.round(retained)});keep.length=0;}
console.log(JSON.stringify(out));
