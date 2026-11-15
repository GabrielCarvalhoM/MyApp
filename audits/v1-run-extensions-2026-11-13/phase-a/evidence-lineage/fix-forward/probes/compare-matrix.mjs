import fs from 'node:fs';
const o=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));let bad=0;
for(const [k,v] of Object.entries(o)){
 if(v.THREW){console.log('THREW',k,v.THREW);bad++;continue;}
 const got=v.today.withheld[0]??null,want=v.contract.verdict,live=v.live;
 // the entry point withholds only a live row that has a distance or is not whole; a retraction row has no distance: the word still stands on the row
 const ok=got===want;if(!ok)bad++;
 console.log((ok?'ok  ':'DIFF')+' '+k.slice(0,70).padEnd(70)+' entry='+String(got).padEnd(20)+' oracle='+String(want).padEnd(20)+' easy='+JSON.stringify(v.today.easy)+' hist='+v.today.historyKm+' screen='+(v.today.screen==='REQUIRED'?'REQ':'-')+(live?.conflicted?' CONFLICTED':''));
}
console.log('differences:',bad);
