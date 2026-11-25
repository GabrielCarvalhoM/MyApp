// Wall clock shifted by SHIFT_DAYS (category D probe: does any test depend on today's date?). Injected clocks are untouched.
const off=Number(process.env.SHIFT_DAYS||0)*864e5,R=Date;
class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off);}static now(){return R.now()+off;}}
globalThis.Date=D;
