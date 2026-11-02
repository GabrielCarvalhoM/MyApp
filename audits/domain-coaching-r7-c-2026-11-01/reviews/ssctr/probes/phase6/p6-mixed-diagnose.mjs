// SSCTR Phase 6 recheck, probe P6-MD: why a MIXED answer recorded by a handler clinical route is still not applied after clearance (CC2 re-run on
// R7C-FREEZE-3: 18 VALID cells keep the stored doses). Extracts the R7C-FREEZE-3 bytes (08c6db3) into a temporary directory outside the
// repository and, in that copy only, logs answeredOnRecord / unreadRunWeeks; CoachingCore/ in the worktree is not touched. Replays: GEN b=7 g=0 RV,
// the answer MIXED_ALT (every other gap run not done, as CC2) and MIXED_LONG (long runs done, the rest not done, as test/r7c-phase6), recorded by
// a substitution with pain on day 2 of week 7, cleared (no clinical reference state), then a plain decision on day 3. Read-only; prints JSON.
import fs from 'node:fs';
import path from 'node:path';
import {extract,load,kit} from '../cc/cc-lib.mjs';
const F3='08c6db352d102e2b33ed7e834cff980248b90299';
const x=extract(F3),file=path.join(x.root,'CoachingCore/src/r6-adaptation.mjs');
let src=fs.readFileSync(file,'utf8');
const patch=(a,b)=>{if(src.split(a).length!==2)throw Error('anchor not unique: '+a.slice(0,60));src=src.replace(a,b);};
patch("const unread=unreadRunWeeks(ctx);if(!unread.size)return false;","const unread=unreadRunWeeks(ctx);const __e={w:ctx.w,kind:ctx.kind,noCeiling:!!ctx.noCeiling,unread:[...unread]};(globalThis.__p6=globalThis.__p6??[]).push(__e);if(!unread.size)return false;");
patch("if(read.length===record.length||runGapInForce(ctx))return false;","__e.readLen=read.length;__e.recLen=record.length;__e.gapNow=!!runGapInForce(ctx);if(read.length===record.length||__e.gapNow)return false;");
patch("if(done.some(h=>dayGap(h.date,start)>0&&dayGap(h.date,start)<=C.windowDays))return false;","__e.doneInWindow=done.filter(h=>dayGap(h.date,start)>0&&dayGap(h.date,start)<=C.windowDays).map(h=>h.date+(h.minutes!==undefined?':'+h.minutes:''));if(__e.doneInWindow.length)return false;");
patch("return !!runGapInForce(unknown);","__e.gapUnknown=!!runGapInForce(unknown);return __e.gapUnknown;");
patch("if(a?.provenance===WEEK_START.CONDITIONAL_PLAN||recorded&&!executed(recorded)&&executed(E(j+1).gates))out.add(j);","(globalThis.__p6w=globalThis.__p6w??[]).push({w,j,prov:a?.provenance??null,recorded:recorded??null,now:a?.provenance===WEEK_START.WEEK_EVIDENCE?E(j+1).gates:null});if(a?.provenance===WEEK_START.CONDITIONAL_PLAN||recorded&&!executed(recorded)&&executed(E(j+1).gates))out.add(j);");
fs.writeFileSync(file,src);
const R=await load(x.root),K=kit(R),H=K.H;
const GEN={id:'ssctr-p6-md-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:H.FULL,knownExercises:[H.K('back-squat',3,5,82.5)]};
const out={check:'SSCTR-P6-MIXED-DIAGNOSE',bytes:F3,cases:{}};
for(const V of ['MIXED_ALT','MIXED_LONG']){
 const b=7,g=0,t={p:H.program(GEN),ledger:[],ref:null};
 for(let w=g;w<b-1;w++)K.step(t,w,{observations:K.strengthOf(t.p,w)});
 K.step(t,b-1,{observations:K.strengthOf(t.p,b-1)});
 const runs=K.runSessions(t.p,g,b),facts=runs.map((s,i)=>(V==='MIXED_ALT'?i%2:s.role!=='LONG')?K.notDone(t.p,s):H.obs(t.p,s));
 const pattern=runs.map((s,i)=>`w${s.weekIndex??Math.floor(i/3)}:${s.role}:${(V==='MIXED_ALT'?i%2:s.role!=='LONG')?'not':'done'}`);
 const X=t.p.weeks[b].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH'&&s.date>=K.day(t.p,b,2)).flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
 const c=K.step(t,b,{day:2,hour:'07:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations:facts});
 t.ref=null;globalThis.__p6=[];globalThis.__p6w=[];
 const r=K.step(t,b,{day:3,hour:'07:00:00'});
 out.cases[V]={pattern,carrier:{status:c.status,proposal:!!c.proposal},decision:{status:r.status,action:r.action,validity:r.planValidity?.status,reason:String(r.reason??'').slice(0,200)},runsFromDay3:K.runsOf(r.proposal??t.p,b,3),answeredOnRecord:globalThis.__p6,weeks:globalThis.__p6w.filter(z=>z.w===b)};
}
x.cleanup();
console.log(JSON.stringify(out,null,1));
