// Author probe (R7-A RESIDUAL AUTHORITY, Founder request §27): the direction of every named difference. For each output the comparison found
// different from its predecessor reference (probes/COMPARISON_R7ARA.json), the doses that differ, in two shapes:
// - a list of rows (row strings such as "EASY:40=40" or "2027-01-03 LONG LONG 45", or row objects with a role and minutes), compared as a whole,
//   per kind of session: walk/jog, continuous easy running (restart, return, easy or long: one kind, so more minutes of it is a rise), quality.
//   A kind rises when it has more sessions, more minutes in all, or a longer session. A rise that only moves sessions down in kind is a step down
//   (KIND_STEPPED_DOWN), not a rise: walk/jog that rises where continuous running fell (a walk/jog session of 28 minutes, 20 of them jogging, for a
//   25-minute continuous run, F4-X); or a kind whose extra sessions and minutes are no more than the higher kinds lost, and whose longest session is
//   no longer than one the predecessor prescribed in it or a higher kind (a quality session run easy at lower doses). Walks are no running dose;
// - any other dose value (a state's long or easy minutes, a step, a load, a set count): a value that rose is a rise unless the state it belongs
//   to stepped down in kind with it (KIND_STEPPED_DOWN), or it is a probe's LATE reading that now equals its EARLY reading (LATE_EQUALS_EARLY: the
//   correction applied before the decision, QE-R7ADA-01).
// Every rise left is listed; the freeze refuses one. Writes probes/DIRECTION_R7ARA.json (DRY=1: prints only); prints its summary.
import fs from 'node:fs';
import path from 'node:path';
const here=import.meta.dirname,repo=path.resolve(here,'../../..'),DA='audits/domain-coaching-r7a-decision-authority-2026-10-29/probes/';
const cmp=JSON.parse(fs.readFileSync(path.join(here,'COMPARISON_R7ARA.json'),'utf8')),ev=JSON.parse(fs.readFileSync(path.join(here,'EVIDENCE_RUNS_R7ARA.json'),'utf8'));
const ref=(g,n)=>g==='kit'?path.join(repo,DA,'kit-final',n+'.out.json'):g==='judges'?path.join(repo,DA,'judges',n+'.out.json'):path.join(repo,ev.runs.find(x=>x.group===g&&x.name===n+'.pred').output);
const cand=(g,n)=>path.join(repo,ev.runs.find(x=>x.group===g&&x.name===(['kit','judges'].includes(g)?n:n+'.cand')).output);
const DOSE=new Set(['long','easy','walkStep','restart','returnStep','minutes','durationMinutes','jogMinutes','runningMinutes','runningSessions','load','sets','value','qualityStep','specificStep','step']);
const KIND=['role','dim','dimension','mode'];
const CLASS={WALK:0,WALK_JOG:1,WALK_JOG_STEP:1,RESTART:2,RESTART_MINUTES:2,RETURN:2,RETURN_STEP:2,EASY:2,LONG:2,EASY_MINUTES:2,LONG_MINUTES:2,QUALITY:3,THRESHOLD:3,THRESHOLD_STEP:3,SPECIFIC:3,SPECIFIC_STEP:3};
const NAME={1:'walk/jog',2:'continuous',3:'quality'};
// A session's or state's kind: the lowest class its kind fields name (an eased quality slot, role EASY on a quality dimension, runs easy).
const classOf=o=>{const v=o&&typeof o==='object'?KIND.map(k=>CLASS[o[k]]).filter(Number.isFinite):[];return v.length?Math.min(...v):null;};
// A row string's session: its first role keyword and the first number after it.
const TOKEN=/\b(LONG|EASY|WALK_JOG|QUALITY|RESTART|RETURN|WALK|THRESHOLD|SPECIFIC)\b[^0-9\n|,"]{0,24}?(\d+(?:\.\d+)?)/;
const rowOf=x=>{if(typeof x==='string'){const m=x.match(TOKEN);return m?{c:CLASS[m[1]],min:Number(m[2])}:null;}
 if(x&&typeof x==='object'){const min=x.minutes??x.durationMinutes,c=classOf(x);return Number.isFinite(min)&&c!==null?{c,min}:null;}return null;};
const rowsOf=a=>Array.isArray(a)&&a.length&&a.every(x=>rowOf(x))?a.map(rowOf):null;
const tally=rows=>Object.fromEntries([1,2,3].map(c=>{const m=rows.filter(r=>r.c===c).map(r=>r.min);return [c,{n:m.length,sum:m.reduce((s,v)=>s+v,0),max:m.length?Math.max(...m):0}];}));
const get=(o,p)=>p.reduce((x,k)=>x?.[k],o);
const out={revision:'R7ARA-DIRECTION-1',generatedAt:new Date().toISOString(),sourceDigest:cmp.sourceDigest,items:{},unexplainedRises:[]};
for(const [g,list] of Object.entries(cmp.groups))for(const x of list.filter(x=>x.verdict==='DIFFERENT')){
 const A=JSON.parse(fs.readFileSync(cand(g,x.name),'utf8')),B=JSON.parse(fs.readFileSync(ref(g,x.name),'utf8'));
 const it={rose:0,fell:0,explained:{KIND_STEPPED_DOWN:0,LATE_EQUALS_EARLY:0},rises:[],explainedRises:[]},why=(r,txt)=>{it.explained[r]++;it.explainedRises.push(`${r} ${txt}`);};
 const rows=(ra,rb,p)=>{const ta=tally(ra),tb=tally(rb),up=c=>['n','sum','max'].filter(k=>ta[c][k]>tb[c][k]),down=c=>['n','sum','max'].some(k=>ta[c][k]<tb[c][k]);
  if([1,2,3].some(down))it.fell++;
  const ups=[1,2,3].filter(c=>up(c).length);if(!ups.length)return;it.rose++;const txt=`${p.join('.')}: ${[1,2,3].map(c=>`${NAME[c]} ${tb[c].n}/${tb[c].sum}/${tb[c].max} -> ${ta[c].n}/${ta[c].sum}/${ta[c].max}`).join('; ')}`;
  const lost=(c,k)=>[1,2,3].filter(h=>h>c).reduce((n,h)=>n+tb[h][k]-ta[h][k],0),moved=c=>lost(c,'n')>=ta[c].n-tb[c].n&&lost(c,'sum')>=ta[c].sum-tb[c].sum&&ta[c].max<=Math.max(...[1,2,3].filter(h=>h>=c).map(h=>tb[h].max));
  if(ups.every(c=>c===1)&&ta[2].n<tb[2].n||ups.every(moved))return why('KIND_STEPPED_DOWN',txt);
  it.rises.push(`${p.join('.')}: ${ups.map(c=>`${NAME[c]} ${up(c).map(k=>`${k} ${tb[c][k]} -> ${ta[c][k]}`).join(', ')}`).join('; ')}`);};
 const leaf=(p,from,to,pa,pb)=>{
  const i=p.indexOf('LATE'),txt=`${p.join('.')}: ${from} -> ${to}`;if(i>=0&&JSON.stringify(get(A,[...p.slice(0,i),'EARLY',...p.slice(i+1)]))===JSON.stringify(get(A,p)))return why('LATE_EQUALS_EARLY',txt);
  const a=classOf(pa),b=classOf(pb);if(a!==null&&b!==null&&a<b)return why('KIND_STEPPED_DOWN',txt+` (${pb[KIND.find(k=>k in pb)]} -> ${pa[KIND.find(k=>k in pa)]})`);
  it.rises.push(`${p.join('.')}: ${from} -> ${to}`);};
 const walk=(a,b,p,pa,pb)=>{
  if(JSON.stringify(a)===JSON.stringify(b))return;
  const ra=rowsOf(a),rb=rowsOf(b);if(ra&&rb)return rows(ra,rb,p);
  if(typeof a==='number'&&typeof b==='number'){if(DOSE.has(p.at(-1))){if(a>b){it.rose++;leaf(p,b,a,pa,pb);}else it.fell++;}return;}
  if(a&&b&&typeof a==='object'&&typeof b==='object')for(const k of new Set([...Object.keys(a),...Object.keys(b)]))walk(a[k],b[k],[...p,k],a,b);};
 walk(A,B,[],null,null);
 out.items[`${g}/${x.name}`]=it;for(const r of it.rises)out.unexplainedRises.push(`${g}/${x.name} ${r}`);
}
const sum=f=>Object.values(out.items).reduce((n,v)=>n+f(v),0);
out.summary={items:Object.keys(out.items).length,rose:sum(v=>v.rose),fell:sum(v=>v.fell),explained:{KIND_STEPPED_DOWN:sum(v=>v.explained.KIND_STEPPED_DOWN),LATE_EQUALS_EARLY:sum(v=>v.explained.LATE_EQUALS_EARLY)},
 unexplainedRises:out.unexplainedRises.length,byItem:Object.fromEntries(Object.entries(out.items).filter(([,v])=>v.rises.length).map(([k,v])=>[k,v.rises.length]))};
if(!process.env.DRY)fs.writeFileSync(path.join(here,'DIRECTION_R7ARA.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({summary:out.summary,unexplained:out.unexplainedRises.slice(0,30),...(process.env.DRY?{explained:Object.entries(out.items).flatMap(([k,v])=>v.explainedRises.map(r=>k+' '+r))}:{})},null,1));
