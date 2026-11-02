// R7-D harness utilities: canonical JSON, SHA-256, dates. No runtime import.
import {createHash} from 'node:crypto';

/** Canonical JSON: object keys sorted by code point, arrays in order, no whitespace. */
export function canonicalJson(v){
 if(v===null||typeof v!=='object')return JSON.stringify(v===undefined?null:v);
 if(Array.isArray(v))return '['+v.map(canonicalJson).join(',')+']';
 const keys=Object.keys(v).filter(k=>v[k]!==undefined).sort((a,b)=>a<b?-1:a>b?1:0);
 return '{'+keys.map(k=>JSON.stringify(k)+':'+canonicalJson(v[k])).join(',')+'}';
}
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
export const digestOf=v=>sha256(canonicalJson(v));
export const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));

export const DAY_MS=864e5;
export const isoDay=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
export const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*DAY_MS).toISOString().slice(0,10);
export const dayGap=(a,b)=>Math.round((Date.parse(b.slice(0,10)+'T00:00:00Z')-Date.parse(a.slice(0,10)+'T00:00:00Z'))/DAY_MS);
/** Local calendar date of an instant at a fixed offset in minutes. */
export const localDate=(iso,offsetMinutes=0)=>new Date(Date.parse(iso)+offsetMinutes*6e4).toISOString().slice(0,10);
export function offsetString(min=0){const s=min<0?'-':'+',a=Math.abs(min);return `${s}${String(Math.floor(a/60)).padStart(2,'0')}:${String(a%60).padStart(2,'0')}`;}
export const hasZone=v=>typeof v==='string'&&/T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/.test(v);

/** Deterministic PRNG (mulberry32) seeded from a hex digest. */
export function prng(seedHex){
 let a=parseInt(String(seedHex).slice(0,8),16)>>>0;
 return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
}
export class CorpusError extends Error{constructor(message,detail={}){super(message);this.name='CorpusError';this.detail=detail;}}
