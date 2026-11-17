// The crypto host an embedding runtime provides: SHA-256 only, over UTF-8 text or host bytes, hex digest (on iOS: CryptoKit SHA256 through
// one host function). HMAC and the rest are refused: the engine must not need them (custody's HMAC is a separate, custody-side host need).
const H=globalThis.__AIF_HOST;
export function createHash(alg){
 if(alg!=='sha256'){H.unsupported.push('createHash:'+alg);throw new Error('host crypto: only sha256');}
 const parts=[];
 const h={update(d){parts.push(typeof d==='string'?d:d?.__hostBytes?d.text:(()=>{H.unsupported.push('update:'+typeof d);throw new Error('host crypto: text or host bytes only');})());return h;},
  digest(enc){if(enc!=='hex'){H.unsupported.push('digest:'+enc);throw new Error('host crypto: hex only');}H.calls.sha256++;const text=parts.join('');H.calls.sha256Chars+=text.length;return H.sha256(text);}};
 return h;
}
const unsupported=name=>()=>{H.unsupported.push(name);throw new Error(`host crypto: ${name} is not provided`);};
export const createHmac=unsupported('createHmac'),timingSafeEqual=unsupported('timingSafeEqual'),randomUUID=unsupported('randomUUID');
export default {createHash,createHmac,timingSafeEqual,randomUUID};
