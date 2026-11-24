// QRE mutation hook: applies one in-memory source replacement to one module at load time (no file is edited).
// env MUT = base64 JSON {file, from, to}: `file` is the basename of the module; `from` must occur exactly once in its source.
import {registerHooks} from 'node:module';
const spec=process.env.MUT?JSON.parse(Buffer.from(process.env.MUT,'base64').toString('utf8')):null;
if(spec)registerHooks({load(url,context,nextLoad){
 const r=nextLoad(url,context);
 if(!url.endsWith('/'+spec.file))return r;
 const src=typeof r.source==='string'?r.source:Buffer.from(r.source).toString('utf8');
 const n=src.split(spec.from).length-1;if(n!==1)throw new Error(`MUTANT NOT APPLIED: ${n} occurrences in ${spec.file}`);
 return {...r,source:src.replace(spec.from,()=>spec.to),shortCircuit:true};
}});
