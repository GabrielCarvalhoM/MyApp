// REPMILE CoachingCore V1 final physical validation (2026-11-24): HMAC-SHA256 vectors from Node's own crypto, for the device host's CryptoKit
// HMAC<SHA256> (NativeBoundaryTests.testHmacVectors). Texts cover what the boundary seals: ASCII, Portuguese accents, astral characters, an
// empty text, a text past the hash block, a key past the block, and a canonical custody envelope prefix. The key is a synthetic reference.
//   node audits/v1-final-physical-2026-11-24/mac/hmac-oracle.mjs  -> audits/v1-aif-p0-jsc-2026-11-17/ios/Tests/P0HostTests/Fixtures/hmac.json
import fs from 'node:fs';
import path from 'node:path';
import {createHmac,timingSafeEqual} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),REPO=path.resolve(HERE,'..','..','..');
const OUT=path.join(REPO,'audits','v1-aif-p0-jsc-2026-11-17','ios','Tests','P0HostTests','Fixtures','hmac.json');
const keys=['v1int-device-run-synthetic-key','v1final-device-run-synthetic-key','k'.repeat(64),'chave-sintética-ção-'+'x'.repeat(70)];
const texts=['','a','V1CIB-CUSTODY-1|doc|{"athleteId":"fa","version":1}','Sessão concluída: corrida leve, recuperação adversa — próxima função comprometida',
 'emoji 🏃‍♀️🏋️ and CJK 走る 跑步','\u0000\u0001\u007f control','x'.repeat(63),'y'.repeat(64),'z'.repeat(65),{repeat:'w',count:1<<20}];
const textOf=t=>typeof t==='string'?t:t.repeat.repeat(t.count);
const vectors=[];for(const key of keys)for(const text of texts)vectors.push({key,...(typeof text==='string'?{text}:{repeat:text.repeat,count:text.count}),hex:createHmac('sha256',key).update(textOf(text)).digest('hex')});
const eq=[['abc','abc'],['abc','abd'],['','']].map(([a,b])=>({a,b,equal:timingSafeEqual(Buffer.from(a),Buffer.from(b))}));
fs.writeFileSync(OUT,JSON.stringify({vectors,constantTimeEqual:eq},null,1)+'\n');
console.log(JSON.stringify({ok:true,out:path.relative(REPO,OUT).replaceAll('\\','/'),vectors:vectors.length}));
