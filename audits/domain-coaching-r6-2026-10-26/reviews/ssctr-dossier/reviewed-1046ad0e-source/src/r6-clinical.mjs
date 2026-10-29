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
`);
const CLINICAL_PHRASES=['a cold','common cold','head cold','chest cold','caught a cold','sore throat','shin splints','stress fracture','gave birth','plantar fasciitis','pos parto','dor de garganta','dolor de garganta','me torci','me dolia','me duele',
 'heart attack','chest tightness','tight chest','blood pressure','kidney stone','kidney stones','panic attack','panic attacks','food poisoning','wisdom teeth','wisdom tooth','short of breath','shortness of breath','passed out','threw up','glandular fever','heat stroke',
 'pressao alta','ataque de panico','ataques de panico','crise de panico','pedra no rim','calculo renal','intoxicacao alimentar','dente do siso','falta de ar','dor no peito',
 'presion alta','ataque de ansiedad','calculo renal','intoxicacion alimentaria','muela del juicio','muelas del juicio','falta de aire','dolor en el pecho',
 'had a baby','tive um bebe','tuve un bebe','hit by a car','car crash','bike crash','car accident'];
// Body parts are asked about alone; with a damage verb in the same clause they are a clinical mention ("broke my leg", SSCTR QRE-R6-07).
const BODY=words(`
 knee knees ankle ankles hip hips back shoulder shoulders foot feet achilles hamstring shin shins calf calves wrist neck leg legs arm arms finger fingers
 toe toes elbow elbows rib ribs head chest heart lung lungs stomach belly abdomen kidney tooth teeth groin thigh thighs quad quads glute glutes spine
 pelvis jaw tendon tendons ligament ligaments muscle muscles bone bones
 joelho tornozelo quadril costas ombro pe panturrilha perna pernas braco bracos dedo dedos cotovelo costela costelas cabeca peito coracao pulmao
 estomago barriga rim dente dentes virilha coxa coluna pulso punho tendao ligamento musculo osso
 rodilla tobillo cadera espalda hombro gemelo muneca cuello pierna piernas brazo brazos codo costilla costillas cabeza pecho corazon pulmon rinon
 diente dientes muela muelas ingle muslo columna tendon ligamento musculo hueso
`);
const DAMAGE=words(`
 broke broken break breaking snapped cracked quebrei quebrou quebrado quebrada quebrar trinquei trincou rompi rompio roto rota rompe parti partio
`);
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
  if(!at.length||!t.some(x=>BODY.has(x)))continue;
  (at.every(i=>damageNegated(t,i))?negated:clinical).push(t.filter(x=>DAMAGE.has(x)||BODY.has(x)).join(' '));
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
`),...BODY]);
const AMBIGUOUS_PHRASES=['didnt feel well','did not feel well','not feeling well','nao me senti bem','nao me sentia bem','nao estava bem','no me senti bien','no estaba bien','me cai','levei um tombo','tive uma queda','tuve una caida','not feeling','felt off','feeling off','run down','burned out','burnt out','not sure','dont know','nao sei','no se','health reasons','personal reasons','motivos pessoais','motivo pessoal','motivos personales','no me sentia bien'];
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
const clausesOf=t=>String(t??'').split(/[,;:.!?()\[\]\/–—-]+|\s(?:but|however|although|though|mas|porem|porém|entretanto|pero|aunque)\s|\bsin embargo\b/i).map(normalize).filter(Boolean);
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
/**
 * @returns {{status:'CLINICAL'|'NONCLINICAL'|'ASK', basis:string, matched:string[]}}
 */
export function screenInterruptionReason({reason=null,reasonCategory=null,nonclinical=null,clinicalReason=null}={}){
 const category=typeof reasonCategory==='string'?reasonCategory.trim().toUpperCase().replace(/[\s-]+/g,'_'):null;
 if(category&&CLINICAL_CATEGORIES.includes(category))return {status:'CLINICAL',basis:'CLINICAL_CATEGORY',matched:[category]};
 // A clinical flag that means yes in any form routes to a human; one that is neither yes nor no is asked (QRE-R6-06).
 if(isYes(clinicalReason))return {status:'CLINICAL',basis:'CLINICAL_FLAG',matched:[]};
 if(clinicalReason!==null&&clinicalReason!==undefined&&!isNo(clinicalReason))return {status:'ASK',basis:'INVALID_CLINICAL_FLAG',matched:[String(clinicalReason)]};
 const clauses=clausesOf(reason).map(c=>stripNegations(c.split(' ')).join(' ')).filter(Boolean),tokens=clauses.flatMap(c=>c.split(' '));
 const damage=damageMentions(clauses);
 const clinical=[...tokens.filter(t=>CLINICAL.has(t)),...clauses.flatMap(c=>hasPhrase(c,CLINICAL_PHRASES)),...damage.clinical];
 if(clinical.length)return {status:'CLINICAL',basis:'CLINICAL_MENTION',matched:[...new Set(clinical)]};
 const ambiguous=[...tokens.filter(t=>AMBIGUOUS.has(t)||t==='__mid_clause_denial__').map(t=>t==='__mid_clause_denial__'?'denial that depends on its clause (mid-clause without/sem/sin, or a time or contrast condition)':t),...clauses.flatMap(c=>hasPhrase(c,AMBIGUOUS_PHRASES)),...damage.negated.map(m=>'negated damage: '+m)];
 if(ambiguous.length)return {status:'ASK',basis:'AMBIGUOUS_REASON',matched:[...new Set(ambiguous)]};
 const contradicted=nonclinical===false;
 if(category&&NONCLINICAL_CATEGORIES.includes(category))return contradicted?{status:'ASK',basis:'CONTRADICTORY_FLAGS',matched:[category]}:{status:'NONCLINICAL',basis:'NONCLINICAL_CATEGORY',matched:[category]};
 // Free text can only add a clinical or an ask outcome: without a structured nonclinical category the category is asked.
 const nonclinicalWords=tokens.filter(t=>NONCLINICAL.has(t));
 if(nonclinicalWords.length)return {status:'ASK',basis:contradicted?'CONTRADICTORY_FLAGS':'CATEGORY_REQUIRED',matched:nonclinicalWords};
 if(normalize(reason))return {status:'ASK',basis:'UNRECOGNIZED_REASON',matched:[]};
 return {status:'ASK',basis:'MISSING_REASON',matched:[]};
}
