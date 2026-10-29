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
`);
const CLINICAL_PHRASES=['a cold','common cold','head cold','chest cold','caught a cold','sore throat','shin splints','stress fracture','gave birth','plantar fasciitis','pos parto','dor de garganta','dolor de garganta','me torci','me dolia','me duele'];
const AMBIGUOUS=words(`
 tired exhausted exhaustion fatigue fatigued burnout rundown stressed health healthy personal knee knees ankle ankles hip hips back shoulder shoulders
 foot feet achilles hamstring shin shins calf calves wrist neck cold off
 cansado cansada exausto exausta estresse estressado estressada saude pessoal pessoais joelho tornozelo quadril costas ombro pe panturrilha
 agotado agotada estres estresado estresada salud personales rodilla tobillo cadera espalda hombro gemelo muneca cuello
 fell fall falling tripped queda caida cai caiu caimos tombo tombei tropecei tropece tropezon
`);
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
/**
 * @returns {{status:'CLINICAL'|'NONCLINICAL'|'ASK', basis:string, matched:string[]}}
 */
export function screenInterruptionReason({reason=null,reasonCategory=null,nonclinical=null,clinicalReason=null}={}){
 const category=typeof reasonCategory==='string'?reasonCategory.trim().toUpperCase().replace(/[\s-]+/g,'_'):null;
 if(category&&CLINICAL_CATEGORIES.includes(category))return {status:'CLINICAL',basis:'CLINICAL_CATEGORY',matched:[category]};
 if(clinicalReason===true)return {status:'CLINICAL',basis:'CLINICAL_FLAG',matched:[]};
 const clauses=clausesOf(reason).map(c=>stripNegations(c.split(' ')).join(' ')).filter(Boolean),tokens=clauses.flatMap(c=>c.split(' '));
 const clinical=[...tokens.filter(t=>CLINICAL.has(t)),...clauses.flatMap(c=>hasPhrase(c,CLINICAL_PHRASES))];
 if(clinical.length)return {status:'CLINICAL',basis:'CLINICAL_MENTION',matched:[...new Set(clinical)]};
 const ambiguous=[...tokens.filter(t=>AMBIGUOUS.has(t)||t==='__mid_clause_denial__').map(t=>t==='__mid_clause_denial__'?'denial that depends on its clause (mid-clause without/sem/sin, or a time or contrast condition)':t),...clauses.flatMap(c=>hasPhrase(c,AMBIGUOUS_PHRASES))];
 if(ambiguous.length)return {status:'ASK',basis:'AMBIGUOUS_REASON',matched:[...new Set(ambiguous)]};
 const contradicted=nonclinical===false;
 if(category&&NONCLINICAL_CATEGORIES.includes(category))return contradicted?{status:'ASK',basis:'CONTRADICTORY_FLAGS',matched:[category]}:{status:'NONCLINICAL',basis:'NONCLINICAL_CATEGORY',matched:[category]};
 // Free text can only add a clinical or an ask outcome: without a structured nonclinical category the category is asked.
 const nonclinicalWords=tokens.filter(t=>NONCLINICAL.has(t));
 if(nonclinicalWords.length)return {status:'ASK',basis:contradicted?'CONTRADICTORY_FLAGS':'CATEGORY_REQUIRED',matched:nonclinicalWords};
 if(normalize(reason))return {status:'ASK',basis:'UNRECOGNIZED_REASON',matched:[]};
 return {status:'ASK',basis:'MISSING_REASON',matched:[]};
}
