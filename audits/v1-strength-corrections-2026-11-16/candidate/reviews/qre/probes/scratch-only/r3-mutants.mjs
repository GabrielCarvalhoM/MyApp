// QRE V1STR N4 recheck R3: mutants of the two expressions the fix changed in buildTemplates (r7b-repertoire.mjs lines 300 and 323) and of
// their neighbours (297, 322, 327, 364, 366). Each `old` must occur exactly once in the clean file.
const R='CoachingCore/src/r7b-repertoire.mjs';
const GUARD="if(i%2===1&&(!S.inForce||typeof S.inForce[types[x.ti]+':'+x.si]==='string'))";
const PREF="prefers:list.some(e=>e.id===own)?prefers:()=>false}";
export const MUTANTS=[
 {id:'R3-01',file:R,old:GUARD,new:"if(i%2===1)",what:'in-force guard removed: every second slot asks again in a plan in force (3342a1d asking)'},
 {id:'R3-02',file:R,old:GUARD,new:"if(i%2===1&&(!S.inForce||Object.keys(S.inForce).length>0))",what:'guard reads only "the plan has some anchor"'},
 {id:'R3-03',file:R,old:GUARD,new:"if(i%2===1&&(S.inForce&&typeof S.inForce[types[x.ti]+':'+x.si]==='string'))",what:'a new plan never asks'},
 {id:'R3-04',file:R,old:GUARD,new:"if(i%2===1&&(!S.inForce||typeof S.inForce[x.ti+':'+x.si]==='string'))",what:'anchor looked up by template index, not type (never found)'},
 {id:'R3-05',file:R,old:GUARD,new:"if(i%2===1&&(!S.inForce||typeof S.inForce[types[x.ti]+':'+x.si]!=='string'))",what:'guard inverted: in force only slots without an anchor ask'},
 {id:'R3-06',file:R,old:"if(S?.inForce||!practiceStart)for(",new:"if(!practiceStart)for(",what:'the class consulted in a plan in force (R2-04)'},
 {id:'R3-07',file:R,old:PREF,new:"prefers:list.some(e=>e.id===own)?prefers:prefers}",what:'plane preferred without limit while the own configuration does not fit'},
 {id:'R3-08',file:R,old:PREF,new:"prefers:list.some(e=>e.id===own)?prefers:e=>prefers(e)&&established.includes(e.id)}",what:'3342a1d restored: established preference while own does not fit'},
 {id:'R3-09',file:R,old:PREF,new:"prefers:()=>false}",what:'in force nothing preferred even while own fits (own still first)'},
 {id:'R3-10',file:R,old:PREF,new:"prefers:own!==null?prefers:()=>false}",what:'preference whenever anchored, fitting or not'},
 {id:'R3-11',file:R,old:"own=S.inForce[types[index]+':'+si]??null;",new:"own=null;",what:'anchor never read at selection'},
 {id:'R3-12',file:R,old:"if(!S.inForce)return {own:null,prefers};",new:"if(!S.inForce)return {own:null,prefers:()=>false};",what:'a new plan never prefers the plane'},
 {id:'R3-13',file:R,old:"built:S.inForce?.[types[index]+':'+si]??natural.list[0]?.id??null",new:"built:natural.list[0]?.id??null",what:'anchor drifts to the current pick (A-01 revert)'},
 {id:'R3-14',file:R,old:"&&!(heldAs.get(e.id)??[]).some(r=>r!=='MAIN')",new:"",what:'heldAs ignored (new plan)'},
 {id:'R3-15',file:R,old:"both.forEach((x,i)=>{if(i%2===1&&",new:"both.forEach((x,i)=>{if(i%2===0&&",what:'the first slot asks instead of the second'},
 {id:'R3-16',file:R,old:"...(wantPlane?{planeAlternation:",new:"...(false?{planeAlternation:",what:'no annotation: anchors never recorded'},
 {id:'R3-17',file:R,old:"const planeFor=list=>{if(!wantPlane)return null;",new:"const planeFor=list=>{if(!wantPlane||S.inForce)return null;",what:'in force no plane ordering at all (own not kept)'},
 {id:'R3-18',file:R,old:"typeof S.inForce[types[x.ti]+':'+x.si]==='string'",new:"S.inForce[types[x.ti]+':'+x.si]!==undefined",what:'anchor presence by !== undefined (anchors are strings)'},
 {id:'R3-19',file:R,old:"practiceStart=!['INTERMEDIATE','EXPERIENCED'].includes(experience)&&!knownExercises.length;",new:"practiceStart=false;",what:'practiceStart off (new NONE plans ask)'},
 {id:'R3-20',file:R,old:"list.sort(order(rolePurposes,preferred,{pattern,plane:planeFor(list)}));",new:"list.sort(order(rolePurposes,preferred,{pattern,plane:null}));",what:'the plane ordering removed entirely'},
];
