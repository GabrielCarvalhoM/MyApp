import fs from 'node:fs';
const o=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
for(const [k,v] of Object.entries(o)){
 if(v.THREW){console.log('## '+k+'\n   THREW '+v.THREW);continue;}
 const l=v.live;
 console.log('## '+k);
 console.log('   live '+(l?`${l.id} done=${l.done} km=${l.km} min=${l.min} list=${l.list} merged=${JSON.stringify(l.merged)}${l.conflicted?' CONFLICTED':''}`:'none')+(v.rejected.length?' | rejected '+v.rejected.join(','):''));
 console.log('   today    '+String(v.today.verdict).padEnd(22)+' easy '+JSON.stringify(v.today.easy)+' withheld '+JSON.stringify(v.today.withheld)+' hist '+v.today.historyKm+' screen '+v.today.screen);
 console.log('   contract '+String(v.contract.verdict).padEnd(22)+' in force '+JSON.stringify(v.contract.inForce)+' not carried '+JSON.stringify(v.contract.notCarried)+' replaced '+JSON.stringify(v.contract.replaced)+(v.contract.sameAfterJsonAndShuffle?'':' !! NOT STABLE'));
 console.log('   weaker reading (kept distance facts on every report in force): '+v.contract.weakerReading);
}
