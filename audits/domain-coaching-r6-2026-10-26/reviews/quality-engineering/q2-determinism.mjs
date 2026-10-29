// QRE probe Q2: determinism. Same input -> same hash, in-process and across fresh processes, process timezones and ICU
// collation locales (the runtime sorts with String.prototype.localeCompare, whose default is locale-dependent).
// Child mode: node q2-determinism.mjs child <locale|default>  -> prints hashes as JSON.
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const mode=process.argv[2],locale=process.argv[3];
if(mode==='child'&&locale&&locale!=='default'){const lc=String.prototype.localeCompare;String.prototype.localeCompare=function(b,_l,o){return lc.call(this,b,locale,o);};}
const {R6,hash,baseIntake,review,obsFor,sessionsOf,write,simulateProgram}=await import('./qlib.mjs');
const {PROFILES,EDGE_PROFILES}=await import('../../../../CoachingCore/r6/fixtures/profiles.mjs');
const {TRAJECTORIES}=await import('../../../../CoachingCore/r6/fixtures/trajectories.mjs');

function corpus(){
 const inputs={...PROFILES,...EDGE_PROFILES,
  Q_EQUIPMENT_MIX:baseIntake({id:'q-mix',weeks:16,athlete:{equipment:['KETTLEBELL','BANDS','MACHINES','PULL_UP_BAR','DUMBBELLS','BENCH'],strengthPreferences:{rotation:'EVERY_2_WEEKS',emphasis:['PULL','HINGE']},knownExercises:[]},schedule:{strengthDays:[0,2,4],runDays:[1,3,5,6]}}),
  Q_SHARED:baseIntake({id:'q-shared',athlete:{},schedule:{runDays:[1,3,5],strengthDays:[1,3],runTurn:'PM',strengthTurn:'PM',longRunDay:5}})};
 const out={};
 for(const [k,v] of Object.entries(inputs)){const r=R6.generateProgram(v);out['gen:'+k]=hash({status:r.status,program:r.program,negotiation:r.negotiation,trace:r.trace??null});}
 // Evaluations with observations whose observedAt ties (exercise the eventId localeCompare tie-break).
 const p=R6.generateProgram(inputs.Q_SHARED).program;
 const w0=sessionsOf(p).filter(s=>s.weekIndex===0&&s.prescription);
 const obs=w0.map((s,i)=>obsFor(p,s,{eventId:['Zeta-1','alpha-2','Älpha-3','z-4','ch-5','y-6'][i%6]+'-'+s.id,observedAt:s.date+'T12:00:00Z'}));
 const r=R6.evaluateProgram(p,review(p,0,{observations:obs}));out['eval:Q_SHARED_w0']=hash({status:r.status,proposal:r.proposal,ledger:r.actualLedger,model:r.updatedModel});
 for(const t of TRAJECTORIES.slice(0,6)){const s=simulateProgram(t.input,t.script);out['sim:'+t.id]=hash({final:s.finalProgram,decisions:s.decisions});}
 return out;
}
if(mode==='child'){process.stdout.write(JSON.stringify(corpus()));process.exit(0);}

const a=corpus(),b=corpus();
const inProcessStable=Object.keys(a).every(k=>a[k]===b[k]);
const run=(env,loc='default')=>{const r=spawnSync(process.execPath,[import.meta.filename,'child',loc],{env:{...process.env,...env},encoding:'utf8',maxBuffer:64*1024*1024});if(r.status!==0)return {error:r.stderr.slice(0,2000)};return JSON.parse(r.stdout);};
const variants={freshUTC:run({TZ:'UTC'}),freshSaoPaulo:run({TZ:'America/Sao_Paulo'}),freshKiritimati:run({TZ:'Pacific/Kiritimati'}),freshHonolulu:run({TZ:'Pacific/Honolulu'}),collation_et:run({},'et'),collation_lt:run({},'lt'),collation_sv:run({},'sv'),collation_tr:run({},'tr')};
const diff={};for(const [name,v] of Object.entries(variants)){diff[name]=v.error?{error:v.error}:Object.keys(a).filter(k=>a[k]!==v[k]);}
// Source scan for wall clock, randomness and environment access in R6 runtime files.
const src=path.resolve(import.meta.dirname,'../../../../CoachingCore/src');
const scan={};for(const f of fs.readdirSync(src).filter(f=>/^r6-.*\.mjs$|^value\.mjs$/.test(f))){const t=fs.readFileSync(path.join(src,f),'utf8');const hits=[...t.matchAll(/Date\.now|new Date\(\)|Math\.random|randomUUID|randomBytes|performance\.now|hrtime|process\.env|toLocale\w*|localeCompare|getTimezoneOffset|\.get(?:Hours|Date|Day|Month|FullYear)\(/g)].map(m=>m[0]);if(hits.length)scan[f]=hits;}
const clockOrRandom=Object.entries(scan).flatMap(([f,h])=>h.filter(x=>!/localeCompare/.test(x)).map(x=>f+':'+x));
const out={probe:'Q2-determinism',authorityUsed:'REAL r6Authority()',cases:Object.keys(a).length,inProcessStable,variantDiffs:diff,sourceScan:scan,clockOrRandom,pass:inProcessStable&&clockOrRandom.length===0&&Object.values(diff).every(d=>Array.isArray(d)&&d.length===0)};
write('q2-determinism.out.json',out);
console.log(JSON.stringify({cases:out.cases,inProcessStable,clockOrRandom,diff},null,1));
