// Module hooks for the portable-host proof: inside CoachingCore/src only, `node:fs` and `node:crypto` resolve to the minimal host shims an
// embedding runtime (JavaScriptCore on iOS) would provide. Everything else (the harness, the test builders) keeps Node's own modules.
const SHIMS={'node:fs':new URL('./host-fs.mjs',import.meta.url).href,'node:crypto':new URL('./host-crypto.mjs',import.meta.url).href};
export async function resolve(specifier,context,next){
 if(SHIMS[specifier]&&/\/CoachingCore\/src\//.test(context.parentURL??''))return {url:SHIMS[specifier],shortCircuit:true};
 return next(specifier,context);
}
