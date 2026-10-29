import fs from 'node:fs';
const [a,b,limit='40']=process.argv.slice(2);const A=JSON.parse(fs.readFileSync(a,'utf8')),B=JSON.parse(fs.readFileSync(b,'utf8'));const out=[];
const walk=(x,y,p)=>{if(out.length>=Number(limit))return;if(JSON.stringify(x)===JSON.stringify(y))return;if(x&&y&&typeof x==='object'&&typeof y==='object'&&Array.isArray(x)===Array.isArray(y)){for(const k of new Set([...Object.keys(x),...Object.keys(y)]))walk(x[k],y[k],p+'.'+k);return;}out.push(`${p}: PREV=${JSON.stringify(y)?.slice(0,140)} | NOW=${JSON.stringify(x)?.slice(0,140)}`);};
walk(A,B,'$');console.log(out.join('\n'));
