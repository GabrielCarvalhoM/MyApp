// The file host an embedding runtime provides: the bundled assets only (no file system), read by URL path. Bytes come back as a plain object
// with the one method the engine calls on them (toString('utf8')), never a Node Buffer. Every call is counted.
const H=globalThis.__AIF_HOST;
const keyOf=url=>decodeURIComponent((url instanceof URL?url.pathname:new URL(String(url)).pathname)).replace(/^\/([A-Za-z]:)/,'$1').replaceAll('\\','/').toLowerCase();
function readFileSync(url,encoding){
 const k=keyOf(url);H.calls.readFileSync++;const text=H.assets.get(k);
 if(text===undefined){H.misses.push(k);const e=new Error('ENOENT (not bundled): '+k);e.code='ENOENT';throw e;}
 if(encoding==='utf8'||encoding?.encoding==='utf8')return text;
 return {__hostBytes:true,text,toString:enc=>{if(enc!=='utf8'&&enc!==undefined)throw new Error('host bytes: only utf8');return text;}};
}
function existsSync(url){H.calls.existsSync++;return H.assets.has(keyOf(url));}
const unsupported=name=>()=>{H.unsupported.push(name);throw new Error(`host fs: ${name} is not provided`);};
const fs={readFileSync,existsSync,writeFileSync:unsupported('writeFileSync'),statSync:unsupported('statSync'),readdirSync:unsupported('readdirSync'),mkdirSync:unsupported('mkdirSync')};
export default fs;
export {readFileSync,existsSync};
