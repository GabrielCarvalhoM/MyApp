// R7AF-QE-r1 scratch: field-level difference between B's start (P30c, equipment full kit on Monday) and the week-6 start A's return stored. Prints only.
import {H,afterA,reportOn,on,addDays,brk,lastR,print,copy} from './qe-r7af-lib.mjs';
const {t:base,d0}=afterA('qaf-p30c');reportOn(base,5,2,'21:00',s=>s.day<3);const stored=base.p.stateTrace[6];
const t=copy(base);H.ev(t,on(t,addDays(d0,7),'06:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],from:addDays(d0,21),to:addDays(d0,24)}}));
const w6AfterX=t.p.stateTrace[6];
H.ev(t,on(t,addDays(d0,10),'06:00',brk(addDays(d0,8),addDays(d0,9))));const e=lastR(t.p).interruption.entry;
const diff=(a,b,p,o)=>{if(JSON.stringify(a)===JSON.stringify(b))return o;if(a&&b&&typeof a==='object'&&typeof b==='object'){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],p+'.'+k,o);}else o.push(`${p}: ${JSON.stringify(a)} | ${JSON.stringify(b)}`);return o;};
print({entryVsStoredByA:diff(stored,e,'',[]),storedVsWeek6AfterX:diff(stored,w6AfterX,'',[])});
