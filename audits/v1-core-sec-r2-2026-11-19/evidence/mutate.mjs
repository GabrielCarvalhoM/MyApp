// Mutation check of the SEC-R2-03/-04 change. Usage: node mutate.mjs <CoachingCore dir>. Each mutant rewrites one file, runs the new test
// file, then rewrites the original bytes and checks the hash. No deletion.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const cc=process.argv[2],sha=b=>createHash('sha256').update(b).digest('hex');
const M=[
 ['M1 never admit','src/r6-provenance.mjs','  admit?.();\n',''],
 ['M2 no quarantine clause in previous','src/r6-provenance.mjs','dropsIdentity||admit&&quarantined.has(identity)?undefined','dropsIdentity?undefined'],
 ['M3 quarantine gate also on corrections','src/r6-provenance.mjs','if(!admit&&quarantined.has(identity)','if(quarantined.has(identity)'],
 ['M4 stale alias treated as in force','src/r6-provenance.mjs','const live=old.superseded!==true&&accepted.includes(old);','const live=old.superseded!==true;'],
 ['M4b event-id check after admission view','src/r6-provenance.mjs','  const sameEvent=byEvent.get(o.eventId);','  const sameEvent=dropsIdentity&&o.eventId===o.correctionOf?undefined:byEvent.get(o.eventId);'],
 ['M5 previous ignores dropsIdentity','src/r6-provenance.mjs','dropsIdentity||admit&&quarantined.has(identity)?undefined','admit&&quarantined.has(identity)?undefined'],
 ['M6 f08 null===null back','src/v1-f08.mjs','manualAt(o)!==null&&!r.sessionId&&activityOf(r)===null&&manualAt(r)===manualAt(o)','activityOf(r)===activityOf(o)'],
 ['M7 f08 no session guard','src/v1-f08.mjs','manualAt(o)!==null&&!r.sessionId&&','manualAt(o)!==null&&'],
 ['M8 f08 provider ignored','src/v1-f08.mjs',"const manualAt=o=>typeof o?.observedAt==='string'&&o.observedAt?(o.provenance?.provider??'MANUAL')+'@'+o.observedAt:null;","const manualAt=o=>typeof o?.observedAt==='string'&&o.observedAt?o.observedAt:null;"],
];
const tests=(process.env.TESTS??'test/v1core-secr2-correction-integrity.test.mjs').split(',');
for(const [name,file,from,to] of M){
 const f=path.join(cc,file),orig=fs.readFileSync(f),h=sha(orig),s=orig.toString('utf8');
 if(s.split(from).length!==2){console.log(name,'SKIP (pattern count '+(s.split(from).length-1)+')');continue;}
 fs.writeFileSync(f,s.replace(from,to));
 const r=spawnSync(process.execPath,['--test',...tests],{cwd:cc,encoding:'utf8'});
 fs.writeFileSync(f,orig);if(sha(fs.readFileSync(f))!==h)throw new Error('restore failed: '+file);
 const fail=(r.stdout.match(/ℹ fail (\d+)/)||[])[1],killed=[...r.stdout.matchAll(/^✖ (.{0,60})/gm)].map(m=>m[1]).filter((x,i,a)=>a.indexOf(x)===i);
 console.log(name+': '+(Number(fail)>0?'KILLED':'SURVIVED')+' (fail '+fail+')'+(killed.length?' by: '+killed.slice(0,3).join(' | '):''));
}
