/**
 * Interruption-reason screen (R6-NONCLINICAL-RETURN): structured category first, then whole-word matching of free text
 * in English, Portuguese and Spanish. Any clinical category or clinical mention routes to a human whatever the
 * nonclinical flags say; ambiguous, unrecognized or missing reasons are asked, and free text alone never confirms a
 * nonclinical break: that needs a structured nonclinical category (the legacy R5 contract's clinicalReason=false is one). Free text is split into clauses at
 * punctuation and at but/mas/pero before matching, so a denial in one clause never hides a mention in the next; a
 * denial ("no pain", "sin dolor", "sem lesão") covers the clinical words it governs and further ones joined only by
 * or/nor (ou/nem, o/ni). Shared by intake, adaptation and the legacy path.
 */
export const NONCLINICAL_CATEGORIES=['TRAVEL','WORK','FAMILY','SCHEDULE','VACATION','WEATHER','EQUIPMENT','MOTIVATION','STUDY','MOVING','OTHER_NONCLINICAL'];
export const CLINICAL_CATEGORIES=['ILLNESS','INJURY','PAIN','MEDICAL','SURGERY','PREGNANCY','POSTPARTUM','CLINICAL'];
const words=s=>new Set(s.trim().split(/\s+/));
const CLINICAL=words(`
 ill illness illnesses sick sickness unwell flu influenza fever feverish covid coronavirus virus viral infection infected pneumonia bronchitis cough coughing
 gastro gastroenteritis vomiting diarrhea diarrhoea migraine asthma injury injuries injured hurt hurts hurting pain pains painful ache aches aching sprain
 sprained strain strained fracture fractured tendinitis tendonitis tendinopathy fasciitis concussion surgery surgical operated hospital hospitalised
 hospitalized doctor physio physiotherapy physiotherapist medical medication medicine antibiotics clinical rehab rehabilitation pregnancy pregnant
 postpartum dizziness dizzy fainted fainting palpitations inflammation inflamed swelling swollen torn tear
 doente doenca adoeci adoecido adoecida gripe gripado gripada gripei febre infeccao bronquite resfriado resfriada tosse lesao lesoes lesionado lesionada
 lesionei machucado machucada machuquei dor dores doeu doendo dolorido dolorida entorse torcao torci tendinite fratura cirurgia operacao operado operada
 internado internada medico medica fisioterapia fisio remedio gravidez gravida posparto tontura desmaio desmaiei inflamacao inflamado inchaco inchado
 enfermo enferma enfermedad enfermedades fiebre tos lesion lesiones lastimado lastimada lastime dolor adolorido adolorida esguince torcedura
 operacion hospitalizado hospitalizada fisioterapeuta medicamento embarazo embarazada mareo mareado mareada desmayo desmaye inflamacion hinchazon
 hinchado hinchada contractura desgarro neumonia bronquitis infectado infectada vomitos diarrea migrana asma malestar herida duele dolia dolio
 lesione lesiono lesionaste lastimo enferme enfermo enfermaste resfrie resfriado operaron internaron accidente accidentado accidentada contusion golpe
 accident acidente acidentado acidentada
 cancer tumor tumour oncology chemo chemotherapy radiotherapy radiation cardiac stroke appendicitis appendix hernia shingles dengue malaria zika
 chikungunya mono mononucleosis diabetes diabetic hypertension depression nausea nauseous nauseated headache headaches stitches stitched sutures
 bleeding bled operation biopsy mri rupture ruptured dislocated dislocation poisoning seizure seizures epilepsy faint arrhythmia anemia anaemia
 diagnosed diagnosis vomit vomited concussed fractures
 quimio quimioterapia radioterapia cardiaco cardiaca infarto avc apendicite hernia herpes mononucleose hipertensao depressao nauseas enjoo enjoada
 enjoado enxaqueca sutura sangramento fraturei fraturou fraturado fraturada luxacao intoxicacao convulsao diagnosticado diagnosticada
 tumor quimioterapia ictus apendicitis mononucleosis hipertension depresion cefalea jaqueca sangrado fractura fracturado fracturada luxacion
 intoxicacion convulsion diagnosticada
 parto atropelado atropelada atropellado atropellada bitten mordida mordido mordedura
 csection cesarean caesarean cesariana cesarea miscarriage miscarried aborto vasectomy vasectomia colonoscopy colonoscopia endoscopy endoscopia lasik endodoncia
`);
const CLINICAL_PHRASES=['a cold','common cold','head cold','chest cold','caught a cold','sore throat','shin splints','stress fracture','gave birth','plantar fasciitis','pos parto','dor de garganta','dolor de garganta','me torci','me dolia','me duele',
 'heart attack','chest tightness','tight chest','blood pressure','kidney stone','kidney stones','panic attack','panic attacks','food poisoning','wisdom teeth','wisdom tooth','short of breath','shortness of breath','passed out','threw up','glandular fever','heat stroke',
 'pressao alta','ataque de panico','ataques de panico','crise de panico','pedra no rim','calculo renal','intoxicacao alimentar','dente do siso','falta de ar','dor no peito',
 'presion alta','ataque de ansiedad','calculo renal','intoxicacion alimentaria','muela del juicio','muelas del juicio','falta de aire','dolor en el pecho',
 'had a baby','tive um bebe','tuve un bebe','hit by a car','car crash','bike crash','car accident',
 'root canal','tratamento de canal'];
// Body parts are asked about alone; with a damage verb in the same clause they are a clinical mention ("broke my leg", SSCTR QRE-R6-07).
const BODY=words(`
 knee knees ankle ankles hip hips back shoulder shoulders foot feet achilles hamstring shin shins calf calves wrist neck leg legs arm arms finger fingers
 toe toes elbow elbows rib ribs head chest heart lung lungs stomach belly abdomen kidney tooth teeth groin thigh thighs quad quads glute glutes spine
 pelvis jaw tendon tendons ligament ligaments muscle muscles bone bones
 joelho tornozelo quadril costas ombro pe panturrilha perna pernas braco bracos dedo dedos cotovelo costela costelas cabeca peito coracao pulmao
 estomago barriga rim dente dentes virilha coxa coluna pulso punho tendao ligamento musculo osso
 rodilla tobillo cadera espalda hombro gemelo muneca cuello pierna piernas brazo brazos codo costilla costillas cabeza pecho corazon pulmon rinon
 diente dientes muela muelas ingle muslo columna tendon ligamento musculo hueso
 hand hands thumb nose eye eyes face mao maos polegar nariz olho olhos rosto mano manos pulgar ojo ojos
`);
const DAMAGE=words(`
 broke broken break breaking snapped cracked quebrei quebrou quebrado quebrada quebrar trinquei trincou rompi rompio roto rota rompe parti partio
 burned burnt cut queimei queimou cortei cortou queme corte
`);
// V1CP A1 (QRE-P5H-F01, SSCTR-P5H-O01; holdout shapes R7D-H20, H32): a body word used in a non-body sense is not a body mention. "back" as an
// adverb ("back on Wednesday", "got back from the trip", "back home"), the idioms "on my feet" and "em pé / de pé / a pé", "head to/out/home…"
// and "on the other hand" / "by hand". A body word after a possessive or a body adjective ("my back", "lower back") is always the body.
const BODY_DETERMINERS=new Set(['my','the','lower','upper','mid','middle','your','his','her','our','their','sore','bad','stiff','tight','achy','aching','hurt','hurting','painful']);
const BACK_PREV=new Set(['came','come','comes','coming','got','get','gets','getting','went','go','goes','going','gone','flew','fly','flies','flying','drove','drive','drives','driving','travel','travels','traveled','travelled','traveling','travelling','be','been','being','was','were','is','are','am','im','way','head','headed','heading','walked','walk','walking','moved','move','moving','bounce','bounced','welcome','just','arrived','arrive','returned','return','returning','brought','bring','sent']);
const BACK_NEXT=new Set(['from','home','to','at','in','on','into','after','again','by','soon','today','tomorrow','tonight','monday','tuesday','wednesday','thursday','friday','saturday','sunday','next','this','later','now']);
const IDIOM_POSSESSIVES=new Set(['my','our','your','his','her','their']);
const HEAD_NEXT=new Set(['to','out','home','off','back','over','up','down','straight','north','south','east','west','into']);
function nonBodyUse(t,i){
 const w=t[i],prev=t[i-1],next=t[i+1];
 if(w==='back'){if(prev==='to'&&t[i-2]==='back')return true;if(BODY_DETERMINERS.has(prev))return false;return BACK_PREV.has(prev)||BACK_NEXT.has(next);}
 if(w==='feet')return t[i-2]==='on'&&IDIOM_POSSESSIVES.has(prev);
 if(w==='pe')return ['em','de','a'].includes(prev);
 if(w==='head')return HEAD_NEXT.has(next);
 if(w==='hand'||w==='hands')return prev==='by'||prev==='other'&&t[i-2]==='the'&&t[i-3]==='on';
 return false;
}
/** Whether token i is a body word used for the body. */
const bodyAt=(t,i)=>BODY.has(t[i])&&!nonBodyUse(t,i);
// V1CP A1 (holdout shape R7D-H07): who a clause is about. SELF: a first-person singular marker (I, me, myself, eu, mim, comigo, yo, conmigo, a
// first-person verb form) or a first-person possessive with a body part ("my knee", "meu joelho", "mi rodilla"). OTHER: another person named by a
// relation or a third-person pronoun or possessive ("my mother", "her operation", "minha mãe", "mi hijo"). SHARED: a first-person plural with no
// one else named ("we", "nosotros"). NONE: no subject is stated (the athlete's own report, as before). SELF wins over every other marker, so a
// clause that mixes the athlete and someone else ("my son had the flu and I caught it") stays the athlete's.
const SELF_MARKERS=new Set(['i','im','ive','id','me','myself','eu','mim','comigo','yo','conmigo','tive','tenho','estou','estive','fiquei','senti','sinto','fui','sou','tuve','tengo','estoy','estuve','quede','siento','soy','adoeci','machuquei','torci','lesionei','gripei','desmaiei','fraturei','quebrei','operei','lastime','lesione','enferme','resfrie','desmaye','rompi','cai','cortei','queimei','tropecei','escorreguei','peguei','contagie']);
const FIRST_POSSESSIVES=new Set(['my','meu','minha','meus','minhas','mi','mis']);
const OTHER_PEOPLE=words(`
 mother mothers mom moms mum mums mommy father fathers dad dads daddy parent parents son sons daughter daughters kid kids child children
 wife wifes wives husband husbands partner partners boyfriend girlfriend fiance fiancee sister sisters brother brothers
 grandmother grandmothers grandma grandmas grandfather grandfathers grandpa grandpas grandparents aunt aunts uncle uncles cousin cousins niece
 nephew friend friends colleague colleagues coworker coworkers boss family inlaws he she they him them his her hers their theirs
 mae maes pai pais filho filhos filha filhas filhinho filhinha crianca criancas esposa marido namorado namorada noivo noiva irma irmas
 irmao irmaos avo avos tia tias tio tios prima primas primo primos sobrinha sobrinho amigo amiga amigos amigas colega colegas chefe
 familia sogra sogro companheiro companheira ela ele elas eles dela dele delas deles
 madre madres mama papa padre padres hijo hijos hija hijas nino nina ninos ninas esposo novio novia hermana hermanas hermano hermanos abuela
 abuelo abuelos tio tia companero companera jefe suegra suegro pareja ella ellos ellas su sus
`);
const SHARED_MARKERS=new Set(['we','us','our','ours','ourselves','nosotros','nosotras','nuestra','nuestro','nuestras','nuestros','nossa','nosso','nossas','nossos']);
// A baby is someone else only when a possessive names whose it is ("my baby", "our baby", "minha bebê"): "had a baby" with no subject stays the
// athlete's own clinical mention (SSCTR R7: "Had a baby" is clinical).
const BABY=new Set(['baby','babies','bebe','bebes']),BABY_OWNERS=new Set(['my','our','his','her','their','your','minha','meu','nossa','nosso','sua','seu','mi','mis','nuestra','nuestro','su','sus']);
// Animals are never someone else: an animal is named as the source of an injury ("dog bite", "mordedura de perro"), so it never moves a clinical
// word away from the athlete (SSCTR R7).
// Someone named as the agent or the source of what happened to the athlete ("bitten by a dog", "caught it from my son", "mordido pelo cachorro")
// does not make the clause about them (SSCTR R7: "Bitten by a dog" is clinical).
const AGENT=new Set(['by','from','por','pelo','pela','pelos','pelas']);
const agentAt=(t,i)=>AGENT.has(t[i-1])||AGENT.has(t[i-2])&&(BABY_OWNERS.has(t[i-1])||['a','an','the','o','a','um','uma','el','la','un','una'].includes(t[i-1]));
const otherAt=(t,i)=>(OTHER_PEOPLE.has(t[i])||BABY.has(t[i])&&BABY_OWNERS.has(t[i-1]))&&!agentAt(t,i);
function attribution(t){
 if(t.some(x=>SELF_MARKERS.has(x)))return 'SELF';
 for(let i=0;i<t.length;i++)if(FIRST_POSSESSIVES.has(t[i])&&!otherAt(t,i+1)&&(bodyAt(t,i+1)||bodyAt(t,i+2)&&!otherAt(t,i+2)))return 'SELF';
 if(t.some((x,i)=>otherAt(t,i)))return 'OTHER';
 if(t.some(x=>SHARED_MARKERS.has(x)))return 'SHARED';
 return 'NONE';
}
// Negated damage ("No broken bones", "Didn't break my leg", "nenhum osso quebrado") is asked about, not named clinical (SSCTR R7).
// Only a local negation counts: the nearest word before the damage verb, past articles, possessives, clitics, auxiliaries and
// body parts, must be a negation, so "couldn't run because I broke my leg" stays clinical.
const DAMAGE_SKIP=new Set(['a','an','the','my','any','me','se','te','la','el','lo','o','os','as','um','uma','meu','minha','meus','minhas','mi','mis','un','una','was','were','is','are','been','be','got','get','foi','foram','esta','estava','estavam','fue','fueron','estaba','estaban']);
const NEGATED_AUX=new Set(['havent','hasnt','hadnt','isnt','arent']);
const damageNegated=(t,i)=>{let j=i-1;while(j>=0&&(DAMAGE_SKIP.has(t[j])||BODY.has(t[j])))j--;return j>=0&&(NEGATORS.has(t[j])||INABILITY.has(t[j])||NEGATION_HEADS.has(t[j])||NEGATED_AUX.has(t[j]));};
/** Damage verb plus body part in one clause: a clinical mention, or an ambiguity when every damage verb in it is negated. */
function damageMentions(clauses){
 const clinical=[],negated=[];
 for(const c of clauses){
  const t=c.split(' '),at=t.map((x,i)=>DAMAGE.has(x)?i:-1).filter(i=>i>=0);
  // V1CP A1: only a body word used for the body counts ("came back with a broken ankle": the ankle, never "back").
  if(!at.length||!t.some((x,i)=>bodyAt(t,i)))continue;
  (at.every(i=>damageNegated(t,i))?negated:clinical).push(t.filter((x,i)=>DAMAGE.has(x)||bodyAt(t,i)).join(' '));
 }
 return {clinical,negated};
}
const AMBIGUOUS=new Set([...words(`
 tired exhausted exhaustion fatigue fatigued burnout rundown stressed health healthy personal cold off sore soreness cramp cramps cramping anxiety
 panic allergy allergic treatment therapy procedure vaccine vaccination injection blood
 cansado cansada exausto exausta estresse estressado estressada saude pessoal pessoais caimbra caimbras ansiedade alergia tratamento terapia
 vacina sangue dolorido
 agotado agotada estres estresado estresada salud personales calambre calambres ansiedad tratamiento terapia vacuna sangre
 fell fall falling tripped queda caida cai caiu caimos tombo tombei tropecei tropece tropezon
 baby bebe crash crashed collision bite slipped escorreguei escorregou resbale resbalo
 maternity maternidade maternidad newborn recemnascido breastfeeding amamentando amamentacao lactancia amamantando
 assault assaulted mugged beaten agredido agredida agressao agresion assaltado asaltado stung sting picada picadura ferroada bruise bruised bruising hematoma
`),...BODY]);
const AMBIGUOUS_PHRASES=['didnt feel well','did not feel well','not feeling well','nao me senti bem','nao me sentia bem','nao estava bem','no me senti bien','no estaba bien','me cai','levei um tombo','tive uma queda','tuve una caida','not feeling','felt off','feeling off','run down','burned out','burnt out','not sure','dont know','nao sei','no se','health reasons','personal reasons','motivos pessoais','motivo pessoal','motivos personales','no me sentia bien','recien nacido'];
const NONCLINICAL=words(`
 travel travelling traveling travelled traveled trip trips vacation vacations holiday holidays work job busy deadline deadlines schedule family kids
 children child wedding moving move moved exams exam study studying school university weather rain snow heat storm motivation time business conference
 visit visiting guests gym closed equipment
 viagem viajando viajei ferias trabalho ocupado ocupada prazo prazos familia filhos filho filha casamento mudanca provas prova estudo estudos faculdade
 chuva calor frio tempo academia fechada
 viaje viajes vacaciones trabajo plazo plazos hijos hijo hija boda mudanza examenes estudios universidad lluvia nieve gimnasio cerrado
`);
const NEGATORS=new Set(['no','not','without','never','nor','sem','nao','nenhum','nenhuma','nunca','nem','sin','ningun','ninguna','ni','nothing','nada']);
// Prepositional denials count only at the start of their clause ("sem dor, só trabalho"); mid-clause they are asked about (SSCTR D40).
const PREPOSITIONAL=new Set(['without','sem','sin']);
// A negated perception or possession verb denies what follows: "didn't feel any pain", "não senti dor", "no tuve dolor".
const NEGATION_HEADS=new Set(['not','no','never','didnt','dont','doesnt','nao','nunca','jamais','jamas']);
// A time or contrast condition in the same clause can turn a denial into an affirmation ("didn't feel any pain until I ran"): ask (SSCTR D41).
const CONDITIONS=new Set(['until','till','before','after','except','unless','ate','antes','depois','exceto','salvo','hasta','despues','excepto']);
const CONDITION_PHRASES=['only when','so quando','solo cuando'];
const conditional=tokens=>tokens.some(x=>CONDITIONS.has(x))||CONDITION_PHRASES.some(p=>(' '+tokens.join(' ')+' ').includes(' '+p+' '));
const DENIAL_VERBS=new Set(['feel','felt','have','had','get','got','notice','noticed','experience','experienced','sentir','senti','sentia','sinto','tive','tinha','tenho','ter','notei','tener','tuve','tenia','tengo','note','sinti']);
// Negation or inability that is not itself a denial of a clinical word: after one, "without pain" affirms pain ("couldn't run without pain").
const INABILITY=new Set(['not','no','never','nor','cannot','cant','couldnt','couldn','wasnt','werent','didnt','dont','doesnt','wouldnt','unable','impossible','nao','nunca','jamais','nem','impossivel','jamas','ni','imposible','nadie','nada']);
const FILLERS=new Set(['any','signs','sign','symptoms','symptom','of','reason','reasons','issue','issues','problem','problems','sinais','sinal','sintomas','sintoma','de','qualquer','motivo','motivos','problema','problemas','senales','senal','sintomas','ningun','alguna','algun']);
// Inside a clause a denial extends only across or/nor, never across and, so "no pain and injured knee" still names an injury.
const DISJUNCTIONS=new Set(['or','nor','ou','nem','o','ni']);
const normalize=t=>String(t??'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim();
/** Clauses: punctuation, dashes, slashes and contrastive conjunctions start a new clause. */
// Hyphenated compounds that the clause split would cut in two are joined first (SSCTR R11: C-section, recém-nascido).
// V1CP A1: the contraction "I'll" is "I will"; with its apostrophe removed it would be the clinical word "ill".
const joinCompounds=t=>String(t??'').replace(/\bi\s*['’]\s*ll\b/gi,'i will').replace(/\bc\s*-?\s*section/gi,'csection').replace(/rec[eé]m\s*-?\s*nascid[oa]s?/gi,'recemnascido');
const clausesOf=t=>joinCompounds(t).split(/[,;:.!?()\[\]\/–—-]+|\s(?:but|however|although|though|mas|porem|porém|entretanto|pero|aunque)\s|\bsin embargo\b/i).map(normalize).filter(Boolean);
/** Removes explicitly denied clinical words inside one clause. A denial is honoured only while no earlier unconsumed
 * negation or inability word in the clause makes it an affirmation; it then absorbs further clinical words joined by
 * or/nor. A without/sem/sin denial counts only at the start of its clause, and no denial counts in a clause with a time or
 * contrast condition (until, before, except...); both leave an ambiguity marker and the screen asks. */
const governs=(tokens,j)=>{while(j<tokens.length&&FILLERS.has(tokens[j]))j++;return {j,clinical:j<tokens.length&&(CLINICAL.has(tokens[j])||['clinical','medical','clinico','clinica','medico','medica'].includes(tokens[j]))};};
const consume=(tokens,j)=>{j++;for(;;){while(j<tokens.length&&FILLERS.has(tokens[j]))j++;if(j+1<tokens.length&&DISJUNCTIONS.has(tokens[j])){let k=j+1;while(k<tokens.length&&FILLERS.has(tokens[k]))k++;if(k<tokens.length&&CLINICAL.has(tokens[k])){j=k+1;continue;}}return j;}};
function stripNegations(tokens){
 const out=[];let negated=false;const conditioned=conditional(tokens);
 for(let i=0;i<tokens.length;i++){
  const t=tokens[i];
  if(t==='pain'&&tokens[i+1]==='free'&&!negated){i++;continue;}
  if(NEGATION_HEADS.has(t)&&DENIAL_VERBS.has(tokens[i+1])){
   const g=governs(tokens,i+2);
   if(g.clinical&&!negated){if(conditioned)out.push('__mid_clause_denial__');i=consume(tokens,g.j)-1;continue;}
  }
  if(!NEGATORS.has(t)){if(INABILITY.has(t))negated=true;out.push(t);continue;}
  const g=governs(tokens,i+1);
  if(!g.clinical||negated){if(!g.clinical)negated=true;out.push(t);continue;}
  if(PREPOSITIONAL.has(t)&&i>0||conditioned)out.push('__mid_clause_denial__');
  i=consume(tokens,g.j)-1;
 }
 return out;
}
const hasPhrase=(text,list)=>list.filter(p=>(' '+text+' ').includes(' '+p+' '));
const flagWord=v=>typeof v==='string'?v.trim().normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase():v;
/** A flag that means yes in any form: true, 1, yes, y, sim, si or sí, trimmed and case-insensitive (QRE-R6-06, SSCTR R6). */
export const isYes=v=>{const f=flagWord(v);return f===true||f===1||['TRUE','YES','Y','SIM','SI','1'].includes(f);};
/** A flag that means no in any form: false, 0, no, n, não or nao. */
export const isNo=v=>{const f=flagWord(v);return f===false||f===0||['FALSE','NO','N','NAO','0'].includes(f);};
const categoryOf=v=>typeof v==='string'?v.trim().toUpperCase().replace(/[\s-]+/g,'_'):null;
/**
 * V1CP A1 (QRE-P5H-F01): the inputs the screen's question needs, and only those, so that answering it is its exit. A break with a structured
 * nonclinical category whose free text is ambiguous (or about someone else) needs one yes/no confirmation (`clinicalReason`); with no category
 * both are asked in one question; a missing or unrecognized reason needs the category, as before (`changed` false: callers keep their text).
 */
export function reasonQuestion(screen,{reasonCategory=null}={},prefix='interruption.'){
 const category=categoryOf(reasonCategory),structured=!!category&&NONCLINICAL_CATEGORIES.includes(category),cat=prefix+'reasonCategory',confirm=prefix+'clinicalReason';
 const own='your own pain, injury, illness or a medical reason';
 if(screen?.basis==='AMBIGUOUS_REASON')return structured?{changed:true,missingInputs:[confirm],text:`say whether this break involved ${own} (yes or no)`}:{changed:true,missingInputs:[cat,confirm],text:`say what interrupted training (for example travel, work or family) and whether it involved ${own} (yes or no)`};
 if(screen?.basis==='CONTRADICTORY_FLAGS')return {changed:true,missingInputs:[...(structured?[]:[cat]),prefix+'nonclinical'],text:'the break is marked as not nonclinical although what was given describes a nonclinical reason: correct the mark'+(structured?'':' and say what interrupted training')};
 if(screen?.basis==='INVALID_CLINICAL_FLAG')return {changed:true,missingInputs:[confirm],text:`answer yes or no: did this break involve ${own}`};
 return {changed:false,missingInputs:[cat],text:'say what interrupted training (for example travel, work, family, illness or injury)'};
}
/**
 * @returns {{status:'CLINICAL'|'NONCLINICAL'|'ASK', basis:string, matched:string[]}}
 */
export function screenInterruptionReason({reason=null,reasonCategory=null,nonclinical=null,clinicalReason=null}={}){
 const category=categoryOf(reasonCategory);
 if(category&&CLINICAL_CATEGORIES.includes(category))return {status:'CLINICAL',basis:'CLINICAL_CATEGORY',matched:[category]};
 // A clinical flag that means yes in any form routes to a human; one that is neither yes nor no is asked (QRE-R6-06).
 if(isYes(clinicalReason))return {status:'CLINICAL',basis:'CLINICAL_FLAG',matched:[]};
 if(clinicalReason!==null&&clinicalReason!==undefined&&!isNo(clinicalReason))return {status:'ASK',basis:'INVALID_CLINICAL_FLAG',matched:[String(clinicalReason)]};
 // V1CP A1: each clause keeps who it is about (attribution, read on its words before denials are removed).
 const parts=clausesOf(reason).map(c=>({who:attribution(c.split(' ')),text:stripNegations(c.split(' ')).join(' ')})).filter(p=>p.text),clauses=parts.map(p=>p.text),tokens=clauses.flatMap(c=>c.split(' '));
 const own=parts.filter(p=>p.who==='SELF'||p.who==='NONE'),others=parts.filter(p=>p.who==='OTHER'||p.who==='SHARED');
 const mentions=list=>{const c=list.map(p=>p.text),t=c.flatMap(x=>x.split(' '));return [...t.filter(x=>CLINICAL.has(x)),...c.flatMap(x=>hasPhrase(x,CLINICAL_PHRASES)),...damageMentions(c).clinical];};
 const clinical=mentions(own);
 if(clinical.length)return {status:'CLINICAL',basis:'CLINICAL_MENTION',matched:[...new Set(clinical)]};
 // A clinical word in a clause about someone else, or shared with others ("we"), is never the athlete's clinical mention: it is asked once.
 const aboutOthers=others.flatMap(p=>mentions([p]).map(m=>(p.who==='OTHER'?'about someone else: ':'shared with others: ')+m));
 const ambiguousWord=(t,i)=>t[i]==='__mid_clause_denial__'||AMBIGUOUS.has(t[i])&&(!BODY.has(t[i])||bodyAt(t,i));
 const ambiguous=[...aboutOthers,...clauses.flatMap(c=>{const t=c.split(' ');return t.filter((x,i)=>ambiguousWord(t,i));}).map(t=>t==='__mid_clause_denial__'?'denial that depends on its clause (mid-clause without/sem/sin, or a time or contrast condition)':t),...clauses.flatMap(c=>hasPhrase(c,AMBIGUOUS_PHRASES)),...damageMentions(clauses).negated.map(m=>'negated damage: '+m)];
 // V1CP A1 (QRE-P5H-F01): the athlete's explicit answer to the screen's question, that the break involved no pain, injury, illness or medical
 // reason of their own (clinicalReason no), resolves an ambiguity when the break has a structured nonclinical category. It never resolves a
 // clinical category, flag or mention of the athlete's own (handled above), and without a category the category is still asked (reasonScreen).
 if(ambiguous.length)return category&&NONCLINICAL_CATEGORIES.includes(category)&&nonclinical!==false&&isNo(clinicalReason)?{status:'NONCLINICAL',basis:'NONCLINICAL_CATEGORY_CONFIRMED',matched:[category]}:{status:'ASK',basis:'AMBIGUOUS_REASON',matched:[...new Set(ambiguous)]};
 const contradicted=nonclinical===false;
 if(category&&NONCLINICAL_CATEGORIES.includes(category))return contradicted?{status:'ASK',basis:'CONTRADICTORY_FLAGS',matched:[category]}:{status:'NONCLINICAL',basis:'NONCLINICAL_CATEGORY',matched:[category]};
 // Free text can only add a clinical or an ask outcome: without a structured nonclinical category the category is asked.
 const nonclinicalWords=tokens.filter(t=>NONCLINICAL.has(t));
 if(nonclinicalWords.length)return {status:'ASK',basis:contradicted?'CONTRADICTORY_FLAGS':'CATEGORY_REQUIRED',matched:nonclinicalWords};
 if(normalize(reason))return {status:'ASK',basis:'UNRECOGNIZED_REASON',matched:[]};
 return {status:'ASK',basis:'MISSING_REASON',matched:[]};
}
