const SUBJS=[
  {id:'matematica',n:'Matemática',ic:'🔢',cl:'#BE185D',bg:'#FCE7F3',bd:'#F9A8D4',sh:'#831843'},
  {id:'lengua',n:'Lengua',ic:'📚',cl:'#065F46',bg:'#D1FAE5',bd:'#6EE7B7',sh:'#022C22'},
  {id:'sociales',n:'Cs. Sociales',ic:'🌎',cl:'#1E40AF',bg:'#DBEAFE',bd:'#93C5FD',sh:'#1E3A8A'},
  {id:'naturales',n:'Cs. Naturales',ic:'🌿',cl:'#166534',bg:'#DCFCE7',bd:'#86EFAC',sh:'#14532D'},
  {id:'ingles',n:'Inglés',ic:'⭐',cl:'#C2410C',bg:'#FEF3C7',bd:'#FCD34D',sh:'#7C2D12'},
];
const GRADES=['1°','2°','3°','4°','5°','6°','7°'];
const COURSES=['A','B','C','D','E','F'];
const PROVINCES=['Buenos Aires','Catamarca','Chaco','Chubut','Córdoba','Corrientes','Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja','Mendoza','Misiones','Neuquén','Río Negro','Salta','San Juan','San Luis','Santa Cruz','Santa Fe','Santiago del Estero','Tierra del Fuego','Tucumán','CABA'];
const AVATARS=['🌟','🦋','🐱','🐶','🦊','🐸','🦁','🐼','🌈','🎀','🚀','🎨','🌺','🦄','🐬','🍀'];
const PIN0='1234';
const ET=()=>({matematica:[],lengua:[],sociales:[],naturales:[],ingles:[]});
const newStudent=()=>({id:Date.now(),name:'',grade:'3',course:'A',school:'',province:'Tucumán',avatar:'🌟',age:8,gender:'F',teacher:'',notes:'',stars:0,topics:ET(),tasks:ET(),
  // Datos personales para IA
  pets:'',family:'',neighborhood:'',team:'',favFood:'',favShow:'',hobby:'',extraData:''});

let state={
  view:'welcome',subj:null,topic:null,
  students:[],activeStudent:null,
  topics:ET(),tasks:ET(),stars:0,
  calendar:[],parentPin:PIN0,parentAuthed:false,
  chatMsgs:[],exParsed:[],answers:{},exResults:null,exBatch:0,explanation:'',examPoints:null,currentExamEj:null,usedExercises:[],revealedAnswers:{},exFormat:'completar',mcAnswers:{},vofAnswers:{},exFormatData:[],mcChecked:false,vofChecked:false,exDifficulty:0,
  streak:0,lastStudyDate:'',achievements:[],topicProgress:{},
  quickReview:false,quickItems:[],quickIdx:0,quickAnswers:{},quickResults:null,loadingQuick:false,
  dictItems:[],dictAnswers:{},fonItems:[],fonAnswers:{},engTab:'ej',
  loadingExpl:false,loadingEx:false,loadingDict:false,loadingFon:false,
  resumeResult:'',loadingResume:false,dictFeedback:'',fonFeedback:'',
  verifying:false,feedback:'',recTab:'chistes',recContent:'',loadingRec:false,
  subjTab:'topics',pSubj:'matematica',parentTab:'alumnos',loginErr:false,
  triviaItems:[],triviaAnswers:{},triviaChecked:false,loadingTrivia:false,
  memCards:[],memFlipped:[],memMatched:[],memMoves:0,memWon:false,
  hangWord:'',hangHint:'',hangGuessed:[],hangLoading:false,hangWon:false,hangLost:false,
  printContent:'',loadingPrint:false,
  editingStudent:null,pEditTab:'list',
  sopaGrid:[],sopaWordList:[],sopaFound:[],sopaStart:null,sopaLoading:false,
  cruciGrid:[],cruciClues:{across:[],down:[]},cruciNums:{},cruciAnswers:{},cruciChecked:false,cruciLoading:false,
  dicResult:null,dicHistory:[],loadingDic:false
};

// ── STORAGE ────────────────────────────────────────────
const isCA=()=>{try{return typeof window.storage!=='undefined'&&window.storage!==null;}catch{return false;}};
async function sg(k,d){try{if(isCA()){const r=await window.storage.get(k);return r?JSON.parse(r.value):d;}const v=localStorage.getItem('miAula_'+k);return v?JSON.parse(v):d;}catch{return d;}}
async function ss(k,v){try{if(isCA()){await window.storage.set(k,JSON.stringify(v));return;}localStorage.setItem('miAula_'+k,JSON.stringify(v));}catch{}}
function getApiKey(){return localStorage.getItem('miAula_apikey')||'';}
function saveApiKey(k){if(k)localStorage.setItem('miAula_apikey',k.trim());}

// Hash simple del PIN (no criptográfico, solo evita texto plano visible)
function hashPin(pin){let h=0;for(let i=0;i<pin.length;i++){h=(Math.imul(31,h)+pin.charCodeAt(i))|0;}return'p'+Math.abs(h).toString(36);}
function checkPin(input,stored){return stored.startsWith('p')?hashPin(input)===stored:input===stored;}
function storePin(pin){return hashPin(pin);}

// ── AI ─────────────────────────────────────────────────
async function ai(msgs,sys,mx=1200){
  const key=getApiKey();
  if(!key&&!isCA())return'🔑 Configurá tu API Key en Panel Mamá/Papá → ⚙️ Config.';
  try{
    const h={'Content-Type':'application/json'};
    if(key){h['x-api-key']=key;h['anthropic-version']='2023-06-01';h['anthropic-dangerous-direct-browser-access']='true';}
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:h,body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:mx,system:sys,messages:msgs})});
    const d=await r.json();
    if(d.error)return`❌ Error: ${d.error.message||'Error de API'}`;
    return d.content?.map(b=>b.text||'').join('')||'Error.';
  }catch(e){console.error('AI error:',e);return'❌ Error de conexión.';}
}
async function aiImg(b64,mt,p){
  const key=getApiKey();
  if(!key&&!isCA())return'🔑 Necesitás configurar tu API Key.';
  try{
    const h={'Content-Type':'application/json'};
    if(key){h['x-api-key']=key;h['anthropic-version']='2023-06-01';h['anthropic-dangerous-direct-browser-access']='true';}
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:h,body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:1100,messages:[{role:'user',content:[{type:'image',source:{type:'base64',media_type:mt,data:b64}},{type:'text',text:p}]}]})});
    const d=await r.json();
    if(d.error)return`❌ Error: ${d.error.message||d.error.type||'desconocido'}`;
    return d.content?.map(b=>b.text||'').join('')||'No se pudo analizar.';
  }catch(e){console.error('AI image error:',e);return`❌ Error: ${e.message||'intentá de nuevo'}`;}
}
const f2b=f=>new Promise((o,e)=>{const r=new FileReader();r.onload=()=>o(r.result.split(',')[1]);r.onerror=e;r.readAsDataURL(f);});
const spk=(t,l='en-US',rt=0.58)=>{try{window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang=l;u.rate=rt;window.speechSynthesis.speak(u);}catch{}};
function spkDict(sentence){try{window.speechSynthesis.cancel();const all=[sentence,...sentence.trim().split(/\s+/).filter(w=>w.length>0)];let idx=0;function next(){if(idx>=all.length)return;const u=new SpeechSynthesisUtterance(all[idx]);u.lang='en-US';u.rate=idx===0?0.58:0.45;const isFirst=idx===0;idx++;u.onend=()=>setTimeout(next,isFirst?700:280);window.speechSynthesis.speak(u);}next();}catch{}}
function toggleReveal(i){const el=document.getElementById('rev_'+i);const btn=document.getElementById('revBtn_'+i);if(!el)return;const show=el.style.display!=='block';el.style.display=show?'block':'none';if(btn)btn.textContent=show?'🙈 Ocultar':'👁 Ver posible respuesta';}
function setExFormat(f){state.exFormat=f;state.mcAnswers={};state.vofAnswers={};state.exFormatData=[];state.mcChecked=false;state.vofChecked=false;state.exParsed=[];state.answers={};state.exResults=null;state.revealedAnswers={};state.feedback='';state.exBatch=0;genEx();}
function setMC(i,j){if(!state.mcAnswers)state.mcAnswers={};state.mcAnswers[i]=j;render();}
function checkMC(){const items=state.exFormatData||[];const ok=items.filter((it,i)=>state.mcAnswers[i]===it.correct).length;state.mcChecked=true;if(ok>=Math.ceil(items.length*0.6)){state.stars+=ok;saveStudentData();showCat(state.activeStudent?.name,ok);}render();}
function setVoF(i,v){if(!state.vofAnswers)state.vofAnswers={};state.vofAnswers[i]=v;render();}
function checkVoF(){const items=state.exFormatData||[];const ok=items.filter((it,i)=>state.vofAnswers[i]===it.correct).length;state.vofChecked=true;if(ok>=Math.ceil(items.length*0.6)){state.stars+=ok;saveStudentData();showCat(state.activeStudent?.name,ok);}render();}
const today=()=>new Date().toISOString().split('T')[0];
const fmtD=i=>{try{return new Date(i+'T12:00:00').toLocaleDateString('es-AR');}catch{return i;}};

// Descripción dinámica del alumno para la IA
function gradeStr(){
  const s=state.activeStudent;
  if(!s||!s.name)return'estudiante de primaria argentina';
  const gen=s.gender==='M'?'niño':'niña';
  const teacher=s.teacher||'la maestra';
  const personal=[];
  if(s.pets)personal.push(`mascota: ${s.pets}`);
  if(s.family)personal.push(`familia: ${s.family}`);
  if(s.neighborhood)personal.push(`vive en: ${s.neighborhood}`);
  if(s.team)personal.push(`hincha de: ${s.team}`);
  if(s.favFood)personal.push(`comida favorita: ${s.favFood}`);
  if(s.favShow)personal.push(`le gusta: ${s.favShow}`);
  if(s.hobby)personal.push(`hobby: ${s.hobby}`);
  if(s.extraData)personal.push(s.extraData);
  const personalStr=personal.length>0?` Datos personales para usar en ejemplos: ${personal.join(', ')}.`:'';
  return`${gen} de ${s.age||8} años en ${s.grade||'3'}° grado "${s.course||'A'}" del ${s.school||'colegio'}, ${s.province||'Argentina'}, llamado/a ${s.name}. Sos ${teacher}, su maestra. Hablale siempre directamente por su nombre como su maestra real. Usá sus datos personales para hacer los ejemplos más cercanos y divertidos.${personalStr}${s.notes?` Observaciones: ${s.notes}`:''}`;
}
function getTopics(){return state.topics||ET();}
function getTasks(){return state.tasks||ET();}
async function saveStudentData(){
  if(!state.activeStudent)return;
  const todayStr=today();
  const yest=new Date();yest.setDate(yest.getDate()-1);
  const yStr=yest.toISOString().split('T')[0];
  if(state.lastStudyDate!==todayStr){
    state.streak=state.lastStudyDate===yStr?(state.streak||0)+1:1;
    state.lastStudyDate=todayStr;
  }
  checkAchievements();
  const idx=state.students.findIndex(s=>s.id===state.activeStudent.id);
  if(idx>=0){
    state.students[idx]={...state.students[idx],topics:state.topics,tasks:state.tasks,stars:state.stars,
      streak:state.streak,lastStudyDate:state.lastStudyDate,
      achievements:state.achievements,topicProgress:state.topicProgress||{}};
    state.activeStudent=state.students[idx];
  }
  await ss('edu_students',state.students);
}
async function updateTopics(t){state.topics=t;await saveStudentData();}
async function updateTasks(t){state.tasks=t;await saveStudentData();}
async function updateStars(n){state.stars=n;await saveStudentData();}

// ── CAT MODAL ──────────────────────────────────────────
function showCat(name,earned=0){
  const o=document.getElementById('catOverlay');
  document.getElementById('catName').textContent=`¡Genial, ${name||'campeón/a'}!`;
  const cs=document.getElementById('catStars');
  cs.textContent=earned>0?`⭐ +${earned} ${earned===1?'estrella':'estrellas'}! Total: ${state.stars} ⭐`:`⭐ Total: ${state.stars} estrellas`;
  o.classList.add('show');
  const colors=['#F9A8D4','#FCD34D','#6EE7B7','#93C5FD','#C084FC','#F97316'];
  const box=document.getElementById('catBox');
  document.querySelectorAll('.confetti').forEach(d=>d.remove());
  for(let i=0;i<20;i++){const d=document.createElement('div');d.className='confetti';d.style.cssText=`left:${4+i*5}%;background:${colors[i%colors.length]};animation-duration:${1.2+(i%4)*.25}s;animation-delay:${(i*.1)%1.5}s`;box.appendChild(d);}
}
function hideCat(){document.getElementById('catOverlay').classList.remove('show');}

// ── PDF ────────────────────────────────────────────────
function xpdf(title,subj,expl,parsed){
  const s=state.activeStudent;
  const info=s?`${s.grade}°"${s.course}" · ${s.school} · ${s.province}`:'';
  const h=(parsed||[]).map((p,i)=>`<div class="ex"><b>Ejercicio ${i+1}</b><br>${p.q.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<b>$1</b>')}<br><br><em style="color:green">✅ Respuesta: ${p.a}</em></div>`).join('');
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title><style>body{font-family:Arial;max-width:700px;margin:30px auto;font-size:14px;line-height:1.7;color:#333}h1{color:#5B21B6;border-bottom:3px solid #A855F7;padding-bottom:8px}.box{background:rgba(109,40,217,.2);border-radius:10px;padding:16px;margin:14px 0}.ex{background:rgba(109,40,217,.25);border-left:4px solid #7C3AED;padding:12px;border-radius:8px;margin:10px 0}button{background:#7C3AED;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;margin-top:14px}@media print{button{display:none}}</style></head><body><h1>${title}</h1><p style="color:#7C3AED">${subj} · ${info}</p>${expl?`<div class="box"><h2 style="color:#7C3AED">📖 Explicación</h2>${expl.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<b>$1</b>')}</div>`:''}${h?`<div class="box"><h2 style="color:#7C3AED">✏️ Ejercicios</h2>${h}</div>`:''}<button onclick="window.print()">🖨️ Imprimir</button></body></html>`;
  try{const bl=new Blob([html],{type:'text/html;charset=utf-8'});if(!window.open(URL.createObjectURL(bl),'_blank'))alert('Permitir ventanas emergentes.');}catch{alert('Error.');}
}

// ── SANITIZER (previene XSS en respuestas de IA) ───────
function sanitize(str){
  if(typeof str!=='string')return'';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
// Versión que permite solo negrita y saltos de línea seguros
function safeMd(str){
  return(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
}

// ── RENDER ─────────────────────────────────────────────
function render(){document.getElementById('app').innerHTML=getView();}
function getView(){
  switch(state.view){
    case'welcome':return vWelcome();case'student':return vStudent();
    case'subject':return vSubject();case'topic':return vTopic();
    case'task':return vTask();case'chat':return vChat();
    case'quickReview':return vQuickReview();case'recreo':return vRecreo();
    case'cal':return vCal();case'parent':return vParent();
    default:return vWelcome();
  }
}
function spin(m='Pensando...'){return`<div class="spin-wrap"><div class="spin-emoji">⭐</div><p style="color:#C4B5FD;margin-top:7px;font-weight:700">${m}</p></div>`;}
function rtxt(t){return(t||'').split('\n').filter(l=>l.trim()).map(l=>`<p style="margin-bottom:9px;line-height:1.85;font-size:15px;color:#E9D5FF">${l.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}</p>`).join('');}
function subjTabs(active,fn){return SUBJS.map(s=>`<button class="btn b-sm ${active===s.id?'':'inactive'}" style="${active===s.id?`background:${s.cl};box-shadow:0 3px 0 ${s.sh};color:white`:''}" onclick="${fn}('${s.id}')">${s.ic} ${s.n}</button>`).join('');}
function starsHtml(){return`<div class="stars-bar"><span>⭐</span><span>${state.stars}</span></div>`;}
function parseEx(raw){
  let parts=raw.split(/\n?\[(?:Respuesta|Answer):\s*/i);
  if(parts.length<2)parts=raw.split(/\n(?:Respuesta|Answer):\s*/i);
  const rawA=parts[1]||'';
  const a=rawA.replace(/\][\s\S]*$/,'').replace(/\n[\s\S]*$/,'').trim();
  return{q:parts[0].trim(),a};
}

// ── WELCOME ────────────────────────────────────────────
function vWelcome(){
  const ss=state.students;
  const cards=ss.length?ss.map(s=>`
<div class="stu-card" onclick="selectStudent(${s.id})">
  <span class="stu-avatar">${s.avatar||'🌟'}</span>
  <div class="stu-name">${s.name}</div>
  <div class="stu-info">${s.grade}°"${s.course}" · ${s.school||'Colegio'}</div>
  <div class="stu-info" style="color:#A78BFA">${s.province||''}</div>
  <div class="stu-stars">⭐ ${s.stars||0} estrellas</div>
</div>`).join(''):
`<div style="text-align:center;padding:30px 20px;background:rgba(45,27,105,.4);border-radius:18px;border:2px dashed rgba(139,92,246,.3)">
<div style="font-size:48px;margin-bottom:12px">👨‍👧</div>
<p style="color:#7C3AED;font-weight:700;font-size:15px;margin-bottom:6px">¡Aún no hay alumnos cargados!</p>
<p style="color:#A78BFA;font-size:13px">Entrá al Panel Mamá/Papá para agregar alumnos</p>
</div>`;
  const grid=ss.length?`<div style="display:grid;grid-template-columns:${ss.length===1?'1fr':ss.length===2?'1fr 1fr':'repeat(2,1fr)'};gap:12px;margin-bottom:18px">${cards}</div>`:
  `<div style="margin-bottom:18px">${cards}</div>`;
  return`<div class="page" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;text-align:center;animation:fup .35s ease">
<div style="background:linear-gradient(135deg,#7C3AED,#A855F7,#C084FC);background-size:200%;animation:shi 4s ease infinite;border-radius:28px;padding:26px 36px;margin-bottom:26px;box-shadow:0 10px 40px rgba(109,40,217,.4)">
<div style="font-size:66px;animation:bou 2s infinite;display:block;margin-bottom:8px">🎒</div>
<h1 style="font-family:'Fredoka One';font-size:38px;color:white;margin-bottom:3px">¡Mi Aula!</h1>
<p style="color:rgba(255,255,255,.85);font-size:13px">Seleccioná quién va a estudiar hoy</p>
</div>
<div style="width:100%;max-width:500px">${grid}
<button class="btn b-ind" style="width:100%;border-radius:18px;padding:13px 22px;font-size:14px" onclick="go('parent')">🔐 Panel Mamá/Papá</button>
</div></div>`;}

// ── STUDENT HOME ────────────────────────────────────────
function vStudent(){
  const s=state.activeStudent,td=new Date(),ts=today();
  const i7=new Date(td);i7.setDate(i7.getDate()+7);const i7s=i7.toISOString().split('T')[0];
  const al=(state.calendar||[]).filter(e=>e.date>=ts&&e.date<=i7s).sort((a,b)=>a.date.localeCompare(b.date));
  const alertH=al.length?`<div class="alert-bar"><div style="font-weight:800;font-size:13px;color:white;margin-bottom:4px">⏰ ¡Eventos próximos esta semana!</div>${al.map(e=>`<div style="color:white;font-size:12px;margin-top:2px">📅 ${fmtD(e.date)} — ${e.title}</div>`).join('')}</div>`:'';
  const rows=SUBJS.slice(0,4).map(sub=>{
    const cnt=(state.topics[sub.id]||[]).length;
    const done=(state.topics[sub.id]||[]).filter((_,i)=>state.topicProgress?.[`${sub.id}_${i}`]).length;
    const pct=cnt>0?Math.round(done/cnt*100):0;
    return`<div class="subj-card" style="background:linear-gradient(145deg,${sub.bg},white);border-color:${sub.bd};box-shadow:0 5px 0 ${sub.sh}28" onclick="goSubj('${sub.id}')">
<div style="font-size:34px;margin-bottom:6px">${sub.ic}</div>
<div style="font-family:'Fredoka One';font-size:14px;color:${sub.cl};line-height:1.2">${sub.n}</div>
${cnt>0?`<div style="font-size:10px;color:${sub.cl};margin-top:4px;font-weight:700">${done}/${cnt} temas</div>
<div style="background:rgba(255,255,255,.6);border-radius:50px;height:5px;margin-top:4px;overflow:hidden"><div style="background:${sub.cl};height:100%;width:${pct}%;border-radius:50px;transition:width .6s ease"></div></div>`:''}
</div>`;}).join('');
  const en=SUBJS[4];const ecnt=(state.topics[en.id]||[]).length;
  return`<div class="page"><div class="wrap">
${alertH}
<div class="hdr" style="background:linear-gradient(135deg,#7C3AED,#A855F7,#C084FC);background-size:200%;animation:shi 5s ease infinite;box-shadow:0 8px 28px rgba(109,40,217,.3)">
<div style="font-size:${s?.avatar?'46':'40'}px;margin-bottom:4px">${s?.avatar||'✏️'}</div>
<h1>¡Hola, ${s?.name||''}!</h1>
<p>${td.toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'})}</p>
<div style="font-size:11px;margin-top:4px;opacity:.8">${s?.grade||''}°"${s?.course||''}" · ${s?.school||''}</div>
<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;justify-content:center">
${starsHtml()}
${state.streak>0?`<div style="background:rgba(255,255,255,.2);border-radius:50px;padding:5px 12px;display:inline-flex;align-items:center;gap:5px;font-weight:800;font-size:13px;color:white">🔥 ${state.streak} día${state.streak>1?'s':''}</div>`:''}
</div></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px" class="subj-grid">${rows}</div>
<div class="subj-card" style="background:linear-gradient(145deg,${en.bg},white);border-color:${en.bd};border:2.5px solid ${en.bd};display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:10px;box-shadow:0 5px 0 ${en.sh}28" onclick="goSubj('${en.id}')">
<div style="font-size:28px">${en.ic}</div><div><div style="font-family:'Fredoka One';font-size:18px;color:${en.cl}">${en.n}</div>${ecnt>0?`<div style="font-size:10px;color:${en.cl};font-weight:700">${ecnt} tema${ecnt>1?'s':''}</div>`:''}</div></div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:7px;margin-bottom:14px">
<button class="btn b-ind" style="border-radius:12px;padding:11px 4px;font-size:11px;flex-direction:column;gap:3px" onclick="go('cal')"><span>📅</span><span>Calendario</span></button>
<button class="btn" style="background:linear-gradient(135deg,#8B5CF6,#A855F7);box-shadow:0 5px 0 #4C1D95;color:white;border-radius:12px;padding:11px 4px;font-size:11px;flex-direction:column;gap:3px" onclick="showProg()"><span>📊</span><span>Progreso</span></button>
<button class="btn" style="background:linear-gradient(135deg,#F59E0B,#F97316);box-shadow:0 5px 0 #78350F;color:white;border-radius:12px;padding:11px 4px;font-size:11px;flex-direction:column;gap:3px" onclick="launchQuick()"><span>⚡</span><span>Repaso</span></button>
<button class="btn b-org" style="border-radius:12px;padding:11px 4px;font-size:11px;flex-direction:column;gap:3px" onclick="go('recreo')"><span>🎉</span><span>Recreo</span></button>
</div>
${state.achievements?.length>0?`<div class="card" style="padding:12px 14px;margin-bottom:10px"><div style="font-size:12px;font-weight:800;color:#5B21B6;margin-bottom:7px">🏆 Mis logros</div><div style="display:flex;gap:6px;flex-wrap:wrap">${LOGROS.filter(l=>state.achievements?.includes(l.id)).map(l=>`<div title="${l.name}: ${l.desc}" style="background:rgba(109,40,217,.2);border:1.5px solid rgba(139,92,246,.3);border-radius:50px;padding:4px 10px;font-size:11px;font-weight:700;color:#5B21B6">${l.ic} ${l.name}</div>`).join('')}</div></div>`:''}
<button class="back-btn btn" onclick="go('welcome')">← Cambiar alumno</button>
</div></div>`;}

// ── DICCIONARIO ────────────────────────────────────────
async function buscarDic(word){
  if(!word||!word.trim())return;
  word=word.trim().toLowerCase();
  state.loadingDic=true;state.dicResult=null;render();
  const prompt=`Definí la palabra "${word}" para un ${gradeStr()}.
Respondé SOLO con este JSON exacto (sin texto extra, sin markdown):
{"word":"${word}","type":"sustantivo masculino","def":"definición formal correcta como en el diccionario RAE","simple":"explicación simple y divertida adaptada a la edad del alumno con un ejemplo usando su nombre"}
El campo "type" DEBE contener la clasificación gramatical real de la palabra (ejemplos: "sustantivo femenino", "verbo transitivo", "adjetivo", "adverbio", "preposición", etc.). Nunca dejes "type" vacío.`;
  const r=await ai([{role:'user',content:prompt}],'Respondé SOLO con JSON válido, sin markdown ni texto extra.',600);
  try{
    const parsed=JSON.parse(r.replace(/```json|```/g,'').trim());
    state.dicResult=parsed;
    if(!state.dicHistory.includes(word)){state.dicHistory=[word,...state.dicHistory].slice(0,5);}
  }catch{state.dicResult={word,type:'',def:'No se pudo obtener la definición. Intentá de nuevo.',simple:''};}
  state.loadingDic=false;render();
}

// ── SUBJECT ────────────────────────────────────────────
function vSubject(){
  const s=state.subj,tl=(state.topics[s.id]||[]),kl=(state.tasks[s.id]||[]);
  const showT=state.subjTab!=='tasks';
  const tItems=showT?(tl.length?tl.map((t,i)=>{
    const done=state.topicProgress?.[`${s.id}_${i}`]||0;
    return`<div class="card" style="border-left:5px solid ${s.cl};cursor:pointer;display:flex;justify-content:space-between;align-items:center" onclick="goTopic(${i})">
<div><div style="display:flex;align-items:center;gap:6px">
<div style="font-weight:800;font-size:15px;color:#E9D5FF">${t.title}</div>
${done>0?`<span style="background:rgba(16,185,129,.15);color:#059669;font-size:10px;font-weight:800;padding:2px 7px;border-radius:50px">✅ ${done>1?done+'x practicado':'Practicado'}</span>`:''}
</div><div style="font-size:11px;color:#A78BFA;margin-top:2px">📅 ${t.date}</div></div>
<div style="font-size:18px;color:${s.cl}">→</div></div>`;}).join(''):`<div class="card" style="text-align:center;padding:36px"><div style="font-size:44px">📭</div><p style="color:#7C3AED;font-size:15px;margin-top:10px;font-weight:700">Todavía no hay temas cargados</p></div>`):
  (kl.length?kl.map((t,i)=>`<div class="card" style="border-left:5px solid ${t.isExam?'#EF4444':s.cl};cursor:pointer;display:flex;justify-content:space-between;align-items:center" onclick="goTask(${i})">
<div style="flex:1">
  <div style="display:flex;align-items:center;gap:7px;margin-bottom:3px">
    <div style="font-weight:800;font-size:15px;color:#E9D5FF">${t.title}</div>
    ${t.isExam?`<span style="background:#FEE2E2;color:#DC2626;font-size:10px;font-weight:800;padding:2px 8px;border-radius:50px;flex-shrink:0">❌ Prueba reprobada</span>`:''}
  </div>
  <div style="font-size:11px;color:#A78BFA;margin-top:2px">📅 ${t.date}</div>
  ${t.content?`<div style="font-size:12px;color:#C4B5FD;margin-top:3px;line-height:1.5">${t.content.substring(0,100)}${t.content.length>100?'...':''}</div>`:''}
</div>
<div style="font-size:18px;color:${t.isExam?'#EF4444':s.cl};margin-left:10px">→</div></div>`).join(''):`<div class="card" style="text-align:center;padding:36px"><div style="font-size:44px">📋</div><p style="color:#7C3AED;font-size:15px;margin-top:10px;font-weight:700">No hay tareas cargadas</p></div>`);
  const isLen=s.id==='lengua';
  const showDic=state.subjTab==='diccionario';
  let dicBody='';
  if(showDic){
    const hist=state.dicHistory||[];
    const res=state.dicResult||null;
    const histChips=hist.length?`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">${hist.map(w=>`<button onclick="buscarDic('${w}')" style="background:rgba(6,95,70,.25);border:1px solid rgba(6,95,70,.4);color:#6EE7B7;border-radius:50px;padding:4px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif">${w}</button>`).join('')}</div>`:'';
    const resBlock=state.loadingDic?`<div class="card">${spin('Buscando en el diccionario...')}</div>`:res?`
<div class="card" style="border-top:5px solid ${s.cl}">
  <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:4px">
    <div style="font-size:22px;font-weight:900;color:#E9D5FF">${sanitize(res.word)}</div>
    ${res.type?`<span style="background:rgba(6,95,70,.3);color:#6EE7B7;font-size:11px;font-weight:800;padding:2px 10px;border-radius:50px;border:1px solid rgba(110,231,183,.3);text-transform:uppercase">${sanitize(res.type)}</span>`:''}
  </div>
  <div style="margin-bottom:14px;margin-top:12px">
    <div style="font-size:12px;font-weight:800;color:#A78BFA;margin-bottom:5px">📖 DEFINICIÓN RAE</div>
    <div style="font-size:14px;color:#E9D5FF;line-height:1.75">${safeMd(res.def||'')}</div>
  </div>
  <div style="background:rgba(6,95,70,.15);border-radius:12px;padding:14px;border:1px solid rgba(110,231,183,.2)">
    <div style="font-size:12px;font-weight:800;color:#6EE7B7;margin-bottom:6px">✨ ¿QUÉ SIGNIFICA PARA VOS?</div>
    <div style="font-size:14px;color:#E9D5FF;line-height:1.75">${safeMd(res.simple||'')}</div>
  </div>
  <button onclick="spk('${(res.def||'').replace(/'/g,"\\'").replace(/"/g,'&quot;')}','es-AR',0.75)" style="margin-top:12px;background:rgba(6,95,70,.25);border:1px solid rgba(110,231,183,.3);color:#6EE7B7;border-radius:50px;padding:7px 16px;font-size:13px;font-weight:800;cursor:pointer;font-family:'Nunito',sans-serif">🔊 Escuchar definición</button>
</div>`:'';
    dicBody=`<div class="card">
<div class="ftit" style="color:#6EE7B7;margin-bottom:10px">📖 Diccionario</div>
<div style="display:flex;gap:8px;margin-bottom:10px">
  <input class="inp" id="dicInput" placeholder="Escribí una palabra..." style="margin:0;flex:1" onkeydown="if(event.key==='Enter')buscarDic(document.getElementById('dicInput').value)">
  <button class="btn b-grn" onclick="buscarDic(document.getElementById('dicInput').value)">Buscar</button>
</div>
${histChips}
</div>${resBlock}`;
  }
  return`<div class="page"><div class="wrap">
<button class="back-btn btn" onclick="go('student')">← Volver</button>
<div class="hdr" style="background:linear-gradient(135deg,${s.cl},${s.bd});box-shadow:0 8px 28px ${s.cl}50"><div style="font-size:44px">${s.ic}</div><h1>${s.n}</h1></div>
<div class="tab-row">
<button class="tab btn ${state.subjTab==='topics'?'active':'inactive'}" style="${state.subjTab==='topics'?`background:${s.cl};box-shadow:0 4px 0 ${s.sh};color:white`:''}" onclick="setSubjTab('topics')">📚 Temas</button>
<button class="tab btn ${state.subjTab==='tasks'?'active':'inactive'}" style="${state.subjTab==='tasks'?`background:${s.cl};box-shadow:0 4px 0 ${s.sh};color:white`:''}" onclick="setSubjTab('tasks')">📝 Tareas (${kl.length})</button>
${isLen?`<button class="tab btn ${showDic?'active':'inactive'}" style="${showDic?`background:${s.cl};box-shadow:0 4px 0 ${s.sh};color:white`:''}" onclick="setSubjTab('diccionario')">📖 Diccionario</button>`:''}
</div>${showDic?dicBody:tItems}</div></div>`;}

// ── TOPIC ──────────────────────────────────────────────
function vTopic(){
  const s=state.subj,tp=state.topic,isEn=s.id==='ingles';
  const tab=state.engTab||'ej';
  const tabs=isEn?`<div class="tab-row">${['ej','dict','fon'].map((k,i)=>{const ls=['🏋️ Ejercicios','🎧 Dictado','🔊 Fonética'][i];return`<button class="tab btn ${tab===k?'active':'inactive'}" style="${tab===k?`background:${s.cl};box-shadow:0 4px 0 ${s.sh};color:white`:''}" onclick="setEngTab('${k}')">${ls}</button>`;}).join('')}</div>`:'';
  let content='';
  if(!isEn||tab==='ej'){
    const explBlock=state.loadingExpl?`<div class="card">${spin('Preparando tu clase...')}</div>`:`<div class="card" style="border-top:5px solid ${s.cl}"><div style="display:flex;align-items:center;gap:7px;margin-bottom:12px"><span style="font-size:21px">📖</span><div class="ftit">Explicación</div></div>${rtxt(state.explanation)}</div>`;
    const exItems=state.exParsed.map((ex,i)=>{
      const res=state.exResults;let xc='',rh='';
      if(res&&res[i]!==undefined){
        if(res[i].correct){xc='ex-correct';rh=`<div style="margin-top:10px;background:rgba(16,185,129,.15);border-radius:10px;padding:10px 12px;font-size:13px;color:#6EE7B7;line-height:1.6">✅ <strong>¡Correcto!</strong> ${res[i].explain||'¡Muy bien! 🌟'}</div>`;}
        else{xc='ex-wrong';rh=`<div style="margin-top:10px;background:rgba(239,68,68,.12);border-radius:10px;padding:10px 12px;font-size:13px;color:#FCA5A5;line-height:1.6">❌ <strong>Casi...</strong> ${res[i].explain||''}</div>`;}
      }
      // Limpiar la pregunta — quitar markdown, Respuesta:, referencias a imágenes
      let qRaw=ex.q
        .replace(/\[(?:Respuesta|Answer):[^\]]*\]/gi,'')
        .replace(/(?:Respuesta|Answer):.*$/gim,'')
        .replace(/\(ver imagen\)|según la imagen|de acuerdo a la imagen|observá la imagen|mirá la imagen/gi,'')
        .replace(/^#+\s*/gm,'')
        .replace(/\*\*([^*]+)\*\*/g,'$1')
        .replace(/\*([^*]+)\*/g,'$1')
        .replace(/---+/g,' ')
        .replace(/##/g,'')
        .replace(/\s{2,}/g,' ')
        .trim();
      // Detectar si es solo un título/encabezado — más robusto
      const qClean=qRaw.replace(/\*\*/g,'').replace(/\*/g,'').trim();
      const isTitleOnly=
        qClean.length<50&&!qClean.includes('[__]')&&!qClean.includes('?')&&!qClean.includes('completá')&&!qClean.includes('escribí')&&!qClean.includes('marcá')&&!qClean.includes('uní')
        || /^(ejercicios?\s+de\s+|comprensión\s+|identificación\s+de\s+|actividad\s+|parte\s+\d|punto\s+\d|sección\s+)/i.test(qClean)&&!qClean.includes('[__]')
        || (/[-:]\s*$/.test(qClean)&&qClean.length<80); // termina en : o - (es un encabezado)
      if(isTitleOnly)return'';
      // Separar banco de palabras — buscar en TODO el texto
      const allLines=qRaw.split('\n');
      let mainLines=[],bankLines=[];
      allLines.forEach(l=>{
        if(/banco\s*de\s*palabras|palabras:|elige:|elegí:|opciones:/i.test(l))bankLines.push(l);
        else bankLines.length?bankLines.push(l):mainLines.push(l); // después del banco, todo va al banco
      });
      // Si el banco está mezclado en el texto, separarlo
      let qText=mainLines.join('\n').trim();
      let bankText=bankLines.join(' ').replace(/banco\s*de\s*palabras[:\s]*/i,'').replace(/palabras:[:\s]*/i,'').trim();
      qText=qText.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
      // Normalizar blancos a [__]
      let qNorm=qText.replace(/_{3,}/g,'[__]').replace(/\.{3,}/g,'[__]');
      // Contar y reemplazar [__] con inputs inline
      const totalFields=(qNorm.match(/\[__\]/g)||[]).length;
      let fieldN=0;
      let qHtml=totalFields>0?qNorm.replace(/\[__\]/g,()=>{
        const key=`${i}_${fieldN}`;fieldN++;
        return`<input value="${(state.answers[key]||'').replace(/"/g,'&quot;')}" oninput="setAns('${key}',this.value)" placeholder=" ? " class="inp-pill" style="width:110px;margin:0 5px;vertical-align:middle">`;
      }):qNorm;
      // Campo separado solo cuando no hay [__] en el texto
      let extraInput='';
      if(totalFields===0){
        extraInput=`<input class="inp" value="${(state.answers[i]||'').replace(/"/g,'&quot;')}" placeholder="✍️ Tu respuesta acá..." oninput="setAns(${i},this.value)" style="margin:10px 0 0;font-size:13px">`;
      }
      // Banco de palabras como chips
      let bankHtml='';
      if(bankText){
        const words=bankText.split(/[\-|\/,·•\s]+/).map(w=>w.trim()).filter(w=>w.length>1);
        if(words.length>0)bankHtml=`<div style="margin-top:12px;padding:10px 12px;background:rgba(45,27,105,.35);border-radius:10px;border:1.5px dashed ${s.bd}">
<div style="font-size:11px;font-weight:700;color:${s.cl};margin-bottom:7px;text-transform:uppercase;letter-spacing:.5px">📦 Palabras para usar:</div>
<div style="display:flex;flex-wrap:wrap;gap:7px">${words.map(w=>`<span style="background:rgba(45,27,105,.6);border:1.5px solid rgba(139,92,246,.5);border-radius:20px;padding:4px 12px;font-size:13px;font-weight:700;color:#C4B5FD">${w}</span>`).join('')}</div></div>`;
      }
      const ansBtn=ex.a?`<div style="margin-top:10px"><button id="revBtn_${i}" onclick="toggleReveal(${i})" style="background:rgba(109,40,217,.25);border:1.5px solid rgba(139,92,246,.4);border-radius:20px;padding:5px 14px;font-size:12px;font-weight:700;color:#C4B5FD;cursor:pointer;font-family:'Nunito',sans-serif">👁 Ver posible respuesta</button><div id="rev_${i}" style="display:none;margin-top:7px;background:rgba(109,40,217,.2);border-radius:8px;padding:8px 12px;font-size:13px;color:#A78BFA;font-weight:700;font-style:italic">💡 Posible respuesta: ${ex.a}</div></div>`:'';
      return`<div class="ex-card ${xc}" style="background:rgba(45,27,105,.45);border-color:rgba(139,92,246,.3)">
<div style="font-weight:800;font-size:11px;color:#A78BFA;margin-bottom:8px;letter-spacing:.5px">EJERCICIO ${i+1}</div>
<div style="font-size:14px;line-height:1.9;color:#E9D5FF">${qHtml}</div>
${extraInput}${bankHtml}${ansBtn}${rh}</div>`;}).join('');
    // ── Selector de formato ──
    const exFmt=state.exFormat||'completar';
    const fmtSel=`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
${[['completar','🖊️ Completar'],['multiple','☑️ Múltiple opción'],['vof','✅ V o F']].map(([f,l])=>{const act=exFmt===f;return`<button onclick="setExFormat('${f}')" style="border:none;border-radius:20px;padding:6px 14px;font-size:12px;font-weight:700;font-family:'Nunito',sans-serif;cursor:pointer;background:${act?'linear-gradient(135deg,#7C3AED,#A855F7)':'rgba(109,40,217,.2)'};color:${act?'white':'#C4B5FD'};box-shadow:${act?'0 3px 0 #4C1D95':'none'}">${l}</button>`;}).join('')}
</div>`;
    // ── Contenido según formato ──
    let fmtBody='';
    if(exFmt==='multiple'){
      const mc=state.exFormatData||[];
      const mcCards=mc.map((it,i)=>{const sel=state.mcAnswers[i];return`<div style="background:rgba(45,27,105,.45);border:1.5px solid rgba(139,92,246,.3);border-radius:14px;padding:14px;margin-bottom:10px"><div style="font-weight:800;font-size:11px;color:#A78BFA;margin-bottom:6px">PREGUNTA ${i+1}</div><div style="font-size:14px;color:#E9D5FF;margin-bottom:10px;line-height:1.6">${it.q}</div><div style="display:flex;flex-direction:column;gap:6px">${(it.opts||[]).map((op,j)=>{let bg='rgba(109,40,217,.2)',cl='#C4B5FD',sh='none';if(state.mcChecked){if(j===it.correct){bg='#10B981';cl='white';sh='0 3px 0 #064E3B';}else if(j===sel&&j!==it.correct){bg='#EF4444';cl='white';sh='0 3px 0 #991B1B';}}else if(j===sel){bg='rgba(139,92,246,.5)';cl='white';}return`<button onclick="${state.mcChecked?'void(0)':'setMC('+i+','+j+')'}" style="text-align:left;padding:9px 14px;border-radius:10px;border:1.5px solid rgba(139,92,246,.3);font-weight:700;font-size:13px;font-family:'Nunito',sans-serif;cursor:${state.mcChecked?'default':'pointer'};background:${bg};color:${cl};box-shadow:${sh}">${['A','B','C','D'][j]}) ${op}</button>`;}).join('')}</div></div>`;}).join('');
      const mcScore=mc.filter((it,i)=>state.mcAnswers[i]===it.correct).length;
      const mcScore2=state.mcChecked?`<div style="background:linear-gradient(135deg,rgba(124,58,237,.3),rgba(168,85,247,.3));border-radius:14px;padding:12px;text-align:center;margin-top:6px"><div style="font-family:'Fredoka One';font-size:24px;color:#E9D5FF">🏆 ${mcScore} / ${mc.length}</div><div style="font-size:13px;color:#C4B5FD;margin-top:4px">${mcScore===mc.length?'¡Perfecta! 🌟':mcScore>=Math.ceil(mc.length*.6)?'¡Muy bien! 💪':'¡Buen intento! 😊'}</div></div>`:'';
      const mcBtn=`${mc.length&&!state.mcChecked&&Object.keys(state.mcAnswers).length===mc.length?`<button class="btn b-grn" style="margin-top:6px" onclick="checkMC()">✅ Ver resultados</button>`:''}${mcScore2}<div style="margin-top:8px"><button class="btn b-vio" style="background:linear-gradient(135deg,${s.cl},${s.bd});box-shadow:0 5px 0 ${s.sh}" onclick="moreEx()">🔄 Nuevas preguntas</button></div>`;
      fmtBody=(state.loadingEx?spin('Generando preguntas...'):`${mcCards}${mc.length?mcBtn:''}`);
    } else if(exFmt==='vof'){
      const vof=state.exFormatData||[];
      const vofCards=vof.map((it,i)=>{const sel=state.vofAnswers[i];let vBg='rgba(109,40,217,.2)',vCl='#C4B5FD',fBg='rgba(109,40,217,.2)',fCl='#C4B5FD';if(state.vofChecked){if(it.correct){vBg='#10B981';vCl='white';if(sel===false){fBg='#EF4444';fCl='white';}}else{fBg='#10B981';fCl='white';if(sel===true){vBg='#EF4444';vCl='white';}}}else{if(sel===true){vBg='rgba(139,92,246,.5)';vCl='white';}if(sel===false){fBg='rgba(239,68,68,.35)';fCl='white';}}return`<div style="background:rgba(45,27,105,.45);border:1.5px solid rgba(139,92,246,.3);border-radius:14px;padding:14px;margin-bottom:10px"><div style="font-size:14px;color:#E9D5FF;margin-bottom:10px;line-height:1.6">${i+1}. ${it.stmt}</div><div style="display:flex;gap:8px"><button onclick="${state.vofChecked?'void(0)':'setVoF('+i+',true)'}" style="flex:1;padding:8px;border-radius:10px;border:1.5px solid rgba(16,185,129,.4);font-weight:800;font-size:13px;font-family:'Nunito',sans-serif;cursor:${state.vofChecked?'default':'pointer'};background:${vBg};color:${vCl}">✅ Verdadero</button><button onclick="${state.vofChecked?'void(0)':'setVoF('+i+',false)'}" style="flex:1;padding:8px;border-radius:10px;border:1.5px solid rgba(239,68,68,.4);font-weight:800;font-size:13px;font-family:'Nunito',sans-serif;cursor:${state.vofChecked?'default':'pointer'};background:${fBg};color:${fCl}">❌ Falso</button></div></div>`;}).join('');
      const vofScore=vof.filter((it,i)=>state.vofAnswers[i]===it.correct).length;
      const vofScore2=state.vofChecked?`<div style="background:linear-gradient(135deg,rgba(124,58,237,.3),rgba(168,85,247,.3));border-radius:14px;padding:12px;text-align:center;margin-top:6px"><div style="font-family:'Fredoka One';font-size:24px;color:#E9D5FF">🏆 ${vofScore} / ${vof.length}</div><div style="font-size:13px;color:#C4B5FD;margin-top:4px">${vofScore===vof.length?'¡Perfecta! 🌟':vofScore>=Math.ceil(vof.length*.6)?'¡Muy bien! 💪':'¡Buen intento! 😊'}</div></div>`:'';
      const vofBtn=`${vof.length&&!state.vofChecked&&Object.keys(state.vofAnswers).length===vof.length?`<button class="btn b-grn" style="margin-top:6px" onclick="checkVoF()">✅ Ver resultados</button>`:''}${vofScore2}<div style="margin-top:8px"><button class="btn b-vio" style="background:linear-gradient(135deg,${s.cl},${s.bd});box-shadow:0 5px 0 ${s.sh}" onclick="moreEx()">🔄 Nuevas afirmaciones</button></div>`;
      fmtBody=(state.loadingEx?spin('Generando afirmaciones...'):`${vofCards}${vof.length?vofBtn:''}`);
    }
    // Botón siempre visible una vez que hay ejercicios cargados
    const exBlock=!state.loadingExpl?`<div class="card" style="border-top:5px solid #7C3AED">
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
  <div style="display:flex;align-items:center;gap:7px"><span style="font-size:21px">✏️</span><div class="ftit">Practicamos juntos</div></div>
  ${starsHtml()}
</div>
${fmtSel}
${exFmt==='completar'?`${state.exParsed.length===0&&!state.loadingEx?spin('Preparando ejercicios...'):''}
${exItems}
${state.loadingEx?spin('Más ejercicios...'):`<div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:8px">
  <button class="btn b-vio" style="background:linear-gradient(135deg,${s.cl},${s.bd});box-shadow:0 5px 0 ${s.sh}" onclick="moreEx()">🔄 Más ejercicios</button>
  ${!state.exResults&&state.exParsed.length>0?`<button class="btn b-grn" ${state.verifying?'disabled':''} onclick="verifyAnswers()">${state.verifying?'🔄 Corrigiendo...':'✅ Ver resultados'}</button>`:''}
  ${state.exResults?`<button class="btn b-grn" onclick="moreEx()">➕ Nuevos ejercicios</button>`:''}
</div>`}
${state.feedback?`<div style="background:rgba(16,185,129,.12);border:2px solid #86EFAC;border-radius:12px;padding:12px;margin-top:10px;font-size:14px;font-weight:700;text-align:center">${state.feedback}</div>`:''}`:`${fmtBody}`}
</div>`:'';
    content=explBlock+exBlock;
  }
  if(isEn&&tab==='dict'){content=`<div class="card" style="border-top:5px solid #C2410C"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><div style="display:flex;align-items:center;gap:7px"><span style="font-size:21px">🎧</span><div class="ftit">Dictado</div></div><div style="display:flex;gap:6px"><button class="btn b-red" style="font-size:11px;padding:5px 10px" onclick="moreDict()">➕ Más</button><button class="btn b-red" onclick="genDict()">🔄 Nuevas</button></div></div>${state.loadingDict?spin('Preparando dictado...'):''}${(state.dictItems||[]).map((st,i)=>`<div style="background:rgba(245,158,11,.12);border:1.5px solid #FCD34D;border-radius:11px;padding:10px;margin-bottom:9px"><div style="display:flex;align-items:center;gap:7px;margin-bottom:7px"><button class="btn b-red" onclick="spkDict('${st.replace(/'/g,"\\'").replace(/"/g,'&quot;')}')">🔊 Escuchar</button><span style="font-size:11px;color:#78350F;font-weight:700">Oración ${i+1}</span></div><input class="inp" value="${(state.dictAnswers[i]||'').replace(/"/g,'&quot;')}" placeholder="Escribí lo que oíste..." oninput="setDictAns(${i},this.value)" style="margin:0;font-size:13px"></div>`).join('')}${state.dictItems&&state.dictItems.length&&!state.loadingDict?`<button class="btn b-grn" style="width:100%;margin-top:3px" onclick="verifyDict()">✅ Verificar dictado</button>`:''}${state.dictFeedback?`<div style="background:rgba(16,185,129,.12);border:2px solid #86EFAC;border-radius:12px;padding:12px;margin-top:9px;font-size:13px;line-height:1.7">${state.dictFeedback.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>')}</div>`:''}</div>`;}
  if(isEn&&tab==='fon'){content=`<div class="card" style="border-top:5px solid #C2410C"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><div style="display:flex;align-items:center;gap:7px"><span style="font-size:21px">🔊</span><div class="ftit">Fonética</div></div><div style="display:flex;gap:6px"><button class="btn b-red" style="font-size:11px;padding:5px 10px" onclick="moreFon()">➕ Más</button><button class="btn b-red" onclick="genFon()">🔄 Nuevas</button></div></div><p style="font-size:12px;color:#A78BFA;margin-bottom:10px">🔊 Escuchá la palabra y elegí cómo se escribe.</p>${state.loadingFon?spin('Preparando fonética...'):''}${(state.fonItems||[]).map((it,i)=>`<div style="background:rgba(245,158,11,.12);border:1.5px solid #FCD34D;border-radius:11px;padding:10px;margin-bottom:9px"><div style="display:flex;align-items:center;gap:7px;margin-bottom:7px"><button class="btn b-red" onclick="spk('${it.word}','en-US',0.58)">🔊 Escuchar</button>${it.hint?`<span style="font-size:11px;color:#78350F;font-style:italic">${it.hint}</span>`:''}</div><div style="display:flex;gap:6px;flex-wrap:wrap">${(it.options||[]).map((op,j)=>`<button class="mc-opt" onclick="setFonAns(${i},${j})" style="background:${state.fonAnswers[i]===j?(j===it.correct?'#10B981':'#EF4444'):'rgba(255,255,255,.95)'};color:${state.fonAnswers[i]===j?'white':'#E9D5FF'}">${op}</button>`).join('')}</div></div>`).join('')}${state.fonItems&&state.fonItems.length&&!state.loadingFon?`<button class="btn b-grn" style="width:100%;margin-top:3px" onclick="verifyFon()">✅ Ver resultados</button>`:''}${state.fonFeedback?`<div style="background:rgba(16,185,129,.12);border:2px solid #86EFAC;border-radius:12px;padding:12px;margin-top:9px;font-size:13px;line-height:1.7;white-space:pre-wrap">${state.fonFeedback}</div>`:''}</div>`;}
  const btnsRow=!state.loadingExpl?`<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:3px"><button class="btn" style="background:linear-gradient(135deg,${s.cl},${s.bd});box-shadow:0 5px 0 ${s.sh};border-radius:12px;padding:12px 8px;font-size:13px;color:white;width:100%" onclick="go('chat')">💬 Preguntame</button><button class="btn b-ind" style="border-radius:12px;padding:12px 8px;font-size:13px;width:100%" onclick="togglePdfMenu()">📄 PDF</button></div><div id="pdfMenu" style="display:none;background:rgba(45,27,105,.6);border-radius:12px;box-shadow:0 4px 22px rgba(0,0,0,.15);border:1.5px solid rgba(139,92,246,.25);padding:6px;margin-top:4px">${[['ambos','📖+✏️ Ambas cosas'],['exp','📖 Solo explicación'],['ej','✏️ Solo ejercicios']].map(([k,l])=>`<button onclick="doPdf('${k}')" style="display:block;width:100%;padding:8px 12px;background:none;border:none;cursor:pointer;font-size:12px;font-weight:700;font-family:'Nunito',sans-serif;color:#5B21B6;text-align:left;border-radius:7px">${l}</button>`).join('')}</div>`:'';
  return`<div class="page"><div class="wrap"><button class="back-btn btn" onclick="go('subject')">← Volver</button><div class="hdr" style="background:linear-gradient(135deg,${s.cl},${s.bd});box-shadow:0 6px 18px ${s.cl}40;display:flex;align-items:center;gap:12px;text-align:left"><div style="font-size:38px">${s.ic}</div><div><div style="font-family:'Fredoka One';font-size:20px">${tp.title}</div><div style="font-size:12px;opacity:.82">${s.n}</div></div></div>${tabs}${content}${btnsRow}</div></div>`;}

// ── CHAT ────────────────────────────────────────────────
function vChat(){
  const s=state.subj,tp=state.topic;
  const msgs=state.chatMsgs.map(m=>`<div style="display:flex;justify-content:${m.role==='user'?'flex-end':'flex-start'}"><div class="chat-bubble ${m.role==='user'?'user-bub':'bot-bub'}" style="${m.role==='user'?`background:linear-gradient(135deg,${s.cl},${s.bd})`:''}"> ${m.text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>')}</div></div>`).join('');
  return`<div class="page" style="height:100vh;display:flex;flex-direction:column"><div class="wrap" style="display:flex;flex-direction:column;height:100%;width:100%"><button class="back-btn btn" onclick="go('topic')">← Volver</button><div style="display:flex;align-items:center;gap:9px;margin-bottom:12px;background:linear-gradient(135deg,${s.cl},${s.bd});border-radius:14px;padding:10px 16px;box-shadow:0 5px 0 ${s.sh}"><span style="font-size:24px">${s.ic}</span><div style="font-family:'Fredoka One';font-size:17px;color:white">${tp.title}</div></div><div id="chatMsgs" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:9px;padding-bottom:9px">${msgs}${state.chatLoading?`<div class="chat-bubble bot-bub">💭 Pensando...</div>`:''}</div><div style="display:flex;gap:7px;margin-top:7px;padding-top:7px;border-top:1.5px solid rgba(139,92,246,.15)"><input class="inp" id="chatInp" placeholder="Escribí tu pregunta..." style="margin:0;flex:1;border-radius:50px" onkeydown="if(event.key==='Enter')sendChat()"><button class="btn" style="background:${s.cl};box-shadow:0 4px 0 ${s.sh};padding:10px 15px;border-radius:50px;font-size:17px;color:white" onclick="sendChat()">➤</button></div></div></div>`;}

// ── RECREO ─────────────────────────────────────────────
function vRecreo(){
  const tab=state.recTab||'chistes';
  const TABS=[{id:'chistes',l:'😂'},{id:'adivinanzas',l:'🤔'},{id:'trivia',l:'🎯'},{id:'memoria',l:'🃏'},{id:'ahorcado',l:'🔤'},{id:'sopalet',l:'🔍'},{id:'crucigrama',l:'✏️'}];
  const tStyle=act=>`background:${act?'linear-gradient(135deg,#F59E0B,#F97316)':'rgba(255,255,255,.88)'};box-shadow:0 4px 0 ${act?'#78350F':'rgba(0,0,0,.1)'};color:${act?'white':'#78350F'};border:none;font-family:'Nunito',sans-serif;font-weight:800;font-size:13px;flex:1;padding:9px 4px;border-radius:10px;cursor:pointer`;
  const tabsH=`<div style="display:flex;gap:5px;margin-bottom:13px;flex-wrap:wrap">${TABS.map(t=>`<button style="${tStyle(tab===t.id)}" onclick="setRecTab('${t.id}')">${t.l}</button>`).join('')}</div>`;
  let body='';
  if(tab==='chistes'||tab==='adivinanzas'){body=`<div class="card" style="min-height:180px;border-radius:18px">${state.loadingRec?spin('Preparando algo divertido...'):`<div style="white-space:pre-wrap;line-height:1.85;font-size:15px;color:#E9D5FF">${state.recContent||''}</div>`}</div><button class="btn b-org" style="width:100%;border-radius:14px;margin-top:2px" onclick="genRec()">🔄 ¡Nuevos!</button>`;}
  if(tab==='trivia'){
    const items=state.triviaItems||[];const score=items.filter((it,i)=>state.triviaChecked&&state.triviaAnswers[i]===it.correct).length;
    body=`<div class="card" style="border-top:5px solid #F59E0B"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><div style="font-family:'Fredoka One';font-size:20px;color:#FCD34D">🎯 Trivia</div><button class="btn b-org" style="padding:6px 12px;font-size:12px;border-radius:50px" onclick="genTrivia()">🔄 Nuevas</button></div>${state.loadingTrivia?spin('Preparando preguntas...'):''}${items.map((it,i)=>{const sel=state.triviaAnswers[i];return`<div style="background:rgba(245,158,11,.1);border:1.5px solid #FCD34D;border-radius:12px;padding:12px;margin-bottom:10px"><div style="font-weight:800;font-size:14px;color:#E9D5FF;margin-bottom:8px">${i+1}. ${it.q}</div><div style="display:flex;flex-direction:column;gap:6px">${(it.opts||[]).map((op,j)=>{let bg='rgba(109,40,217,.2)',cl='#C4B5FD',sh='none';if(state.triviaChecked){if(j===it.correct){bg='#10B981';cl='white';sh='#064E3B';}else if(j===sel&&j!==it.correct){bg='#EF4444';cl='white';sh='#991B1B';}}else if(j===sel){bg='#F59E0B';cl='white';sh='#78350F';}return`<button onclick="${state.triviaChecked?'':'setTrivia('+i+','+j+')'}" style="text-align:left;padding:9px 13px;border-radius:9px;border:none;font-weight:700;font-size:13px;font-family:'Nunito',sans-serif;cursor:${state.triviaChecked?'default':'pointer'};background:${bg};color:${cl};box-shadow:0 3px 0 ${sh}">${['A','B','C','D'][j]}) ${op}</button>`;}).join('')}</div></div>`;}).join('')}${items.length&&!state.triviaChecked&&Object.keys(state.triviaAnswers).length===items.length?`<button class="btn b-grn" style="width:100%;margin-top:4px" onclick="checkTrivia()">✅ Ver resultados</button>`:''}${state.triviaChecked?`<div style="background:linear-gradient(135deg,#F59E0B,#F97316);border-radius:14px;padding:14px;text-align:center;margin-top:8px"><div style="font-family:'Fredoka One';font-size:28px;color:white">🏆 ${score} / ${items.length}</div><div style="color:white;font-weight:700;font-size:14px;margin-top:4px">${score===items.length?'¡Perfecta! ¡Sos una crack! 🌟':score>=items.length/2?'¡Muy bien! 💪':'¡Buen intento! 😊'}</div></div>`:''}</div>`;}
  if(tab==='memoria'){
    const cards=state.memCards||[];
    if(!cards.length)body=`<div class="card" style="text-align:center;padding:32px"><div style="font-size:52px;margin-bottom:12px">🃏</div><p style="color:#7C3AED;font-weight:700;font-size:16px;margin-bottom:16px">¡Encontrá todos los pares!</p><button class="btn b-org" style="font-size:15px;padding:13px 28px" onclick="initMem()">🎮 ¡Jugar!</button></div>`;
    else{const grid=cards.map((c,i)=>{const flip=state.memFlipped.includes(i),match=state.memMatched.includes(c.pair),show=flip||match;return`<div onclick="${(!flip&&!match&&state.memFlipped.length<2)?`flipCard(${i})`:'void(0)'}" style="width:70px;height:70px;border-radius:14px;cursor:${(!flip&&!match&&state.memFlipped.length<2)?'pointer':'default'};display:flex;align-items:center;justify-content:center;font-size:30px;border:2.5px solid ${match?'#10B981':flip?'#F59E0B':'rgba(139,92,246,.3)'};background:${match?'#D1FAE5':flip?'#FFFBEB':'linear-gradient(135deg,#EDE9FE,#DDD6FE)'};transition:.2s">${show?c.emoji:'❓'}</div>`;}).join('');
    body=`<div class="card" style="border-top:5px solid #F59E0B"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><div style="font-family:'Fredoka One';font-size:20px;color:#FCD34D">🃏 Memoria</div><div style="display:flex;gap:8px;align-items:center"><span style="font-size:12px;font-weight:800;color:#7C3AED">🔄 ${state.memMoves} movs.</span><button class="btn b-org" style="padding:5px 12px;font-size:11px;border-radius:50px" onclick="initMem()">↺ Nuevo</button></div></div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;justify-items:center">${grid}</div>${state.memWon?`<div style="background:linear-gradient(135deg,#7C3AED,#A855F7);border-radius:14px;padding:14px;text-align:center;margin-top:12px"><div style="font-family:'Fredoka One';font-size:24px;color:white">🎉 ¡Ganaste en ${state.memMoves} movimientos!</div><button class="btn" style="background:rgba(45,27,105,.6);color:#7C3AED;border-radius:50px;padding:9px 20px;font-size:13px;margin-top:8px;box-shadow:none" onclick="initMem()">🔄 De nuevo</button></div>`:''}</div>`;}
  }
  if(tab==='ahorcado'){
    const w=state.hangWord||'',guessed=state.hangGuessed||[],errors=guessed.filter(l=>!w.includes(l)).length,maxErr=6;
    const display=w?w.split('').map(l=>l===' '?'  ':guessed.includes(l)?l:'_').join(' '):'';
    const HANG=['','😐','😟','😰','😱','😵','💀'];
    const alpha='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    body=`<div class="card" style="border-top:5px solid #7C3AED"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><div style="font-family:'Fredoka One';font-size:20px;color:#5B21B6">🔤 Ahorcado</div><button class="btn b-vio" style="padding:6px 12px;font-size:12px;border-radius:50px" onclick="genHang()">🔄 Nueva</button></div>${state.hangLoading?spin('Eligiendo palabra...'):''}${w?`<div style="text-align:center;margin-bottom:14px"><div style="font-size:48px;margin-bottom:4px">${HANG[errors]||'😊'}</div><div style="font-size:11px;font-weight:700;color:${errors>=maxErr?'#EF4444':'#7C3AED'}">${errors}/${maxErr} errores</div><div style="background:rgba(109,40,217,.25);border-radius:10px;padding:10px;margin:10px 0"><div style="font-size:11px;color:#7C3AED;font-weight:700;margin-bottom:4px">💡 Pista: ${state.hangHint}</div><div style="font-family:'Fredoka One';font-size:26px;color:#E9D5FF;letter-spacing:6px">${display}</div></div>${state.hangWon?`<div style="background:linear-gradient(135deg,#059669,#10B981);border-radius:12px;padding:12px;color:white;font-weight:800;font-size:16px">🎉 ¡Adivinaste! Era: ${w}</div>`:''} ${state.hangLost?`<div style="background:linear-gradient(135deg,#EF4444,#DC2626);border-radius:12px;padding:12px;color:white;font-weight:800;font-size:15px">😵 ¡Se acabó! Era: <strong>${w}</strong></div>`:''}${!state.hangWon&&!state.hangLost?`<div style="display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin-top:10px">${alpha.map(l=>{const used=guessed.includes(l.toLowerCase()),wrong=used&&!w.includes(l.toLowerCase()),right=used&&w.includes(l.toLowerCase());return`<button onclick="${used?'void(0)':('guessLetter(\''+l.toLowerCase()+'\')')}" style="width:34px;height:34px;border-radius:8px;border:none;font-weight:800;font-size:13px;font-family:'Nunito',sans-serif;cursor:${used?'default':'pointer'};background:${right?'#10B981':wrong?'#EF4444':'linear-gradient(135deg,#EDE9FE,#DDD6FE)'};color:${used?'white':'#5B21B6'};box-shadow:${used?'none':'0 3px 0 rgba(109,40,217,.2)'}">${l}</button>`;}).join('')}</div>`:''}</div>`:`<div style="text-align:center;padding:20px"><p style="color:#7C3AED;font-size:14px;font-weight:700">Tocá "Nueva" para empezar 👆</p></div>`}</div>`;}
  if(tab==='sopalet'){
    const SZ=10,sg=state.sopaGrid||[],sf=state.sopaFound||[],sw=state.sopaWordList||[],ss=state.sopaStart;
    const fcells=new Set();sw.forEach(w=>{if(sf.includes(w.word))w.cells.forEach(({r,c})=>fcells.add(`${r}_${c}`));});
    const gridH=sg.length?`<div style="display:inline-grid;grid-template-columns:repeat(${SZ},30px);gap:2px;background:rgba(45,27,105,.4);padding:6px;border-radius:10px;border:2px solid rgba(139,92,246,.4)">${sg.flatMap((row,r)=>row.map((lt,c)=>{const isSt=ss&&ss.r===r&&ss.c===c,isF=fcells.has(`${r}_${c}`);return`<div onclick="sopaClick(${r},${c})" style="width:30px;height:30px;display:flex;align-items:center;justify-content:center;background:${isF?'#10B981':isSt?'#F59E0B':'rgba(109,40,217,.25)'};color:${isF||isSt?'white':'#E9D5FF'};font-weight:800;font-size:13px;cursor:pointer;border-radius:5px;font-family:'Fredoka One';border:1px solid rgba(139,92,246,.2);transition:.15s">${lt}</div>`;})).join('')}</div>`:spin('Generando sopa...');
    const wlistH=`<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px">${sw.map(w=>`<span style="background:${sf.includes(w.word)?'rgba(16,185,129,.25)':'rgba(109,40,217,.2)'};border:1.5px solid ${sf.includes(w.word)?'#10B981':'rgba(139,92,246,.4)'};border-radius:20px;padding:4px 12px;font-size:12px;font-weight:700;color:${sf.includes(w.word)?'#6EE7B7':'#C4B5FD'};text-decoration:${sf.includes(w.word)?'line-through':'none'}">${w.word}</span>`).join('')}</div>`;
    const allF=sw.length>0&&sf.length===sw.length;
    body=`<div class="card" style="border-top:5px solid #8B5CF6"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div style="font-family:'Fredoka One';font-size:20px;color:#A78BFA">🔍 Sopa de letras</div><button class="btn b-vio" style="padding:6px 12px;font-size:12px;border-radius:50px" onclick="genSopa()">🔄 Nueva</button></div>${ss?`<div style="font-size:12px;color:#FCD34D;font-weight:700;margin-bottom:8px">✨ Ahora hacé clic en la última letra</div>`:`<div style="font-size:12px;color:#A78BFA;margin-bottom:8px">Tocá la primera letra de una palabra 👇</div>`}${state.sopaLoading?spin('Generando sopa...'):`<div style="overflow-x:auto;text-align:center">${gridH}</div>${wlistH}`}${allF?`<div style="background:linear-gradient(135deg,#7C3AED,#A855F7);border-radius:14px;padding:12px;text-align:center;margin-top:10px"><div style="font-family:'Fredoka One';font-size:22px;color:white">🎉 ¡Encontraste todas las palabras!</div></div>`:''}</div>`;
  }
  if(tab==='crucigrama'){
    const cg=state.cruciGrid||[],cn=state.cruciNums||{},cc=state.cruciClues||{across:[],down:[]};
    const CELL=28;
    const gridH=cg.length?`<div style="display:inline-block;background:#0F0720;padding:4px;border-radius:8px;border:2px solid rgba(139,92,246,.5)">${cg.map((row,r)=>`<div style="display:flex">${row.map((cell,c)=>{if(!cell)return`<div style="width:${CELL}px;height:${CELL}px;background:#0F0720;margin:1px"></div>`;const num=cn[`${r}_${c}`];const key=`${r}_${c}`;const val=(state.cruciAnswers[key]||'').toUpperCase();const chk=state.cruciChecked;let bc=chk?(val===cell.letter?'#10B981':'#EF4444'):'rgba(139,92,246,.5)';let bg=chk?(val===cell.letter?'rgba(16,185,129,.15)':'rgba(239,68,68,.12)'):'rgba(45,27,105,.7)';return`<div style="position:relative;width:${CELL}px;height:${CELL}px;background:${bg};border:1.5px solid ${bc};margin:1px;box-sizing:border-box">${num?`<span style="position:absolute;top:1px;left:2px;font-size:8px;font-weight:800;color:#A78BFA;line-height:1;z-index:1">${num}</span>`:''}${chk?`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Fredoka One';font-size:15px;color:${val===cell.letter?'#6EE7B7':'#FCA5A5'}">${val||'·'}</div>`:`<input maxlength="1" value="${val}" oninput="cruciInput('${key}',this.value)" style="position:absolute;inset:0;width:100%;height:100%;border:none;background:transparent;text-align:center;font-family:'Fredoka One';font-size:15px;color:#E9D5FF;padding-top:${num?'6':'0'}px;text-transform:uppercase;outline:none;cursor:pointer">`}</div>`;}).join('')}</div>`).join('')}</div>`:spin('Generando crucigrama...');
    const clueH=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px"><div><div style="font-weight:800;color:#FCD34D;margin-bottom:6px;font-size:13px">→ HORIZONTAL</div>${(cc.across||[]).map(cl=>`<div style="font-size:11px;color:#C4B5FD;margin-bottom:5px;line-height:1.4"><strong style="color:#E9D5FF">${cl.num}.</strong> ${cl.clue}</div>`).join('')}</div><div><div style="font-weight:800;color:#FCD34D;margin-bottom:6px;font-size:13px">↓ VERTICAL</div>${(cc.down||[]).map(cl=>`<div style="font-size:11px;color:#C4B5FD;margin-bottom:5px;line-height:1.4"><strong style="color:#E9D5FF">${cl.num}.</strong> ${cl.clue}</div>`).join('')}</div></div>`;
    body=`<div class="card" style="border-top:5px solid #8B5CF6"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div style="font-family:'Fredoka One';font-size:20px;color:#A78BFA">✏️ Crucigrama</div><div style="display:flex;gap:6px">${state.cruciChecked?`<button class="btn b-vio" style="padding:5px 10px;font-size:11px;border-radius:50px" onclick="state.cruciChecked=false;render()">✏️ Seguir</button><button class="btn b-vio" style="padding:5px 10px;font-size:11px;border-radius:50px" onclick="genCruci()">🔄 Nuevo</button>`:`<button class="btn b-grn" style="padding:5px 10px;font-size:11px;border-radius:50px" onclick="checkCruci()">✅ Verificar</button><button class="btn b-vio" style="padding:5px 10px;font-size:11px;border-radius:50px" onclick="genCruci()">🔄 Nuevo</button>`}</div></div>${state.cruciLoading?spin('Generando crucigrama...'):`<div style="overflow-x:auto;text-align:center;margin-bottom:4px">${gridH}</div>${clueH}`}</div>`;
  }
  return`<div class="page"><div class="wrap"><button class="back-btn btn" onclick="go('student')">← Volver</button><div class="hdr" style="background:linear-gradient(135deg,#F59E0B,#F97316,#EF4444);background-size:200%;animation:shi 4s ease infinite;box-shadow:0 8px 28px rgba(245,158,11,.4)"><div style="font-size:52px;animation:bou 2s infinite;display:inline-block">🎉</div><h1>¡RECREO!</h1><div style="margin-top:6px">${starsHtml()}</div></div>${tabsH}${body}</div></div>`;}

// ── TASK DETAIL ─────────────────────────────────────────
function vTask(){
  const s=state.subj,tp=state.task;
  const exItems=state.exParsed.map((ex,i)=>{
    const res=state.exResults;let xc='',rh='';
    if(res&&res[i]!==undefined){
      if(res[i].correct){xc='ex-correct';rh=`<div style="margin-top:10px;background:rgba(16,185,129,.15);border-radius:10px;padding:10px 12px;font-size:13px;color:#6EE7B7;line-height:1.6">✅ <strong>¡Correcto!</strong> ${res[i].explain||'¡Muy bien! 🌟'}</div>`;}
      else{xc='ex-wrong';rh=`<div style="margin-top:10px;background:rgba(239,68,68,.12);border-radius:10px;padding:10px 12px;font-size:13px;color:#FCA5A5;line-height:1.6">❌ <strong>Casi...</strong> ${res[i].explain||''}</div>`;}
    }
    let qRaw=ex.q.replace(/\[(?:Respuesta|Answer):[^\]]*\]/gi,'').replace(/(?:Respuesta|Answer):.*$/gim,'').replace(/\(ver imagen\)|según la imagen|de acuerdo a la imagen/gi,'').replace(/^#+\s*/gm,'').replace(/\*\*([^*]+)\*\*/g,'$1').replace(/---+/g,' ').replace(/##/g,'').replace(/\s{2,}/g,' ').trim();
    const qClean=qRaw.replace(/\*\*/g,'').replace(/\*/g,'').trim();
    const isTitleOnly=
      qClean.length<50&&!qClean.includes('[__]')&&!qClean.includes('?')&&!qClean.includes('completá')&&!qClean.includes('escribí')&&!qClean.includes('marcá')&&!qClean.includes('uní')
      || /^(ejercicios?\s+de\s+|comprensión\s+|identificación\s+de\s+|actividad\s+|parte\s+\d|punto\s+\d|sección\s+)/i.test(qClean)&&!qClean.includes('[__]')
      || (/[-:]\s*$/.test(qClean)&&qClean.length<80);
    if(isTitleOnly)return'';
    const allLines=qRaw.split('\n');let mainLines=[],bankLines=[];
    allLines.forEach(l=>{if(/banco\s*de\s*palabras|palabras:|elige:|elegí:|opciones:/i.test(l))bankLines.push(l);else bankLines.length?bankLines.push(l):mainLines.push(l);});
    let qText=mainLines.join('\n').trim().replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
    let bankText=bankLines.join(' ').replace(/banco\s*de\s*palabras[:\s]*/i,'').replace(/palabras:[:\s]*/i,'').trim();
    let qNorm=qText.replace(/_{3,}/g,'[__]').replace(/\.{3,}/g,'[__]');
    const totalFields=(qNorm.match(/\[__\]/g)||[]).length;
    let fieldN=0;
    let qHtml=totalFields>0?qNorm.replace(/\[__\]/g,()=>{
      const key=`${i}_${fieldN}`;fieldN++;
      return`<input value="${(state.answers[key]||'').replace(/"/g,'&quot;')}" oninput="setAns('${key}',this.value)" placeholder=" ? " class="inp-pill" style="width:110px;margin:0 5px;vertical-align:middle">`;
    }):qNorm;
    let extraInput=totalFields===0?`<input class="inp" value="${(state.answers[i]||'').replace(/"/g,'&quot;')}" placeholder="✍️ Tu respuesta acá..." oninput="setAns(${i},this.value)" style="margin:10px 0 0;font-size:13px">`:'';
    let bankHtml='';
    if(bankText){const words=bankText.split(/[\-|\/,·•\s]+/).map(w=>w.trim()).filter(w=>w.length>1);if(words.length>0)bankHtml=`<div style="margin-top:12px;padding:10px 12px;background:rgba(45,27,105,.35);border-radius:10px;border:1.5px dashed ${s.bd}"><div style="font-size:11px;font-weight:700;color:${s.cl};margin-bottom:7px;text-transform:uppercase;letter-spacing:.5px">📦 Palabras para usar:</div><div style="display:flex;flex-wrap:wrap;gap:7px">${words.map(w=>`<span style="background:rgba(45,27,105,.6);border:1.5px solid rgba(139,92,246,.5);border-radius:20px;padding:4px 12px;font-size:13px;font-weight:700;color:#C4B5FD">${w}</span>`).join('')}</div></div>`;}
    const ansBtn2=ex.a?`<div style="margin-top:10px"><button id="revBtn_${i}" onclick="toggleReveal(${i})" style="background:rgba(109,40,217,.25);border:1.5px solid rgba(139,92,246,.4);border-radius:20px;padding:5px 14px;font-size:12px;font-weight:700;color:#C4B5FD;cursor:pointer;font-family:'Nunito',sans-serif">👁 Ver posible respuesta</button><div id="rev_${i}" style="display:none;margin-top:7px;background:rgba(109,40,217,.2);border-radius:8px;padding:8px 12px;font-size:13px;color:#A78BFA;font-weight:700;font-style:italic">💡 Posible respuesta: ${ex.a}</div></div>`:'';
    return`<div class="ex-card ${xc}" style="background:rgba(45,27,105,.45);border-color:rgba(139,92,246,.3)"><div style="font-weight:800;font-size:11px;color:#A78BFA;margin-bottom:8px;letter-spacing:.5px">EJERCICIO ${i+1}</div><div style="font-size:14px;line-height:1.9;color:#E9D5FF">${qHtml}</div>${extraInput}${bankHtml}${ansBtn2}${rh}</div>`;
  }).join('');
  const hasAns=Object.values(state.answers).some(a=>a&&a.trim());
  const isExam=tp.isExam||false;
  const headerColor=isExam?'#DC2626':'linear-gradient(135deg,'+s.cl+','+s.bd+')';
  return`<div class="page"><div class="wrap">
<button class="back-btn btn" onclick="go('subject')">← Volver</button>
<div class="hdr" style="background:${isExam?'linear-gradient(135deg,#DC2626,#EF4444)':'linear-gradient(135deg,'+s.cl+','+s.bd+')'};box-shadow:0 6px 18px ${isExam?'rgba(220,38,38,.3)':s.cl+'40'};display:flex;align-items:center;gap:12px;text-align:left">
  <div style="font-size:38px">${isExam?'📋':'📝'}</div>
  <div>
    <div style="font-family:'Fredoka One';font-size:20px;color:white">${tp.title}</div>
    <div style="font-size:12px;opacity:.82;color:white">${isExam?'❌ Prueba reprobada':'Tarea'} · ${s.n} · ${tp.date}</div>
  </div>
</div>
${isExam?`<div style="background:rgba(239,68,68,.12);border:1.5px solid #FCA5A5;border-radius:14px;padding:14px;margin-bottom:12px">
<div style="font-size:13px;font-weight:800;color:#DC2626;margin-bottom:4px">🎯 Modo recuperación</div>
<div style="font-size:13px;color:#FCA5A5;line-height:1.6">Vamos a practicar cada punto de esta prueba para que la próxima te vaya mejor. ¡Podés lograrlo! 💪</div>
</div>`:''}
${tp.content?`<div class="card" style="border-left:5px solid ${isExam?'#DC2626':s.cl}"><div style="display:flex;align-items:center;gap:7px;margin-bottom:10px"><span style="font-size:18px">📋</span><div style="font-weight:800;font-size:15px;color:#E9D5FF">${isExam?'Contenido de la prueba':'Consigna de la tarea'}</div></div><div style="font-size:14px;color:#C4B5FD;line-height:1.8;white-space:pre-wrap">${tp.content}</div></div>`:''}
<div class="card" style="border-top:5px solid ${isExam?'#DC2626':s.cl}">
  <div style="display:flex;align-items:center;gap:7px;margin-bottom:12px"><span style="font-size:21px">📖</span><div class="ftit">${isExam?'Análisis de la prueba':'Cómo resolver esta tarea'}</div></div>
  ${state.loadingExpl?spin(isExam?'Analizando los puntos de la prueba...':'Analizando la tarea...'):rtxt(state.explanation)}
</div>
${!state.loadingExpl?`<div class="card" style="border-top:5px solid ${isExam?'#DC2626':'#7C3AED'}">
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
  <div style="display:flex;align-items:center;gap:7px"><span style="font-size:21px">✏️</span><div class="ftit">Practicamos juntos</div></div>
  ${starsHtml()}
</div>
${isExam&&state.currentExamEj?`<div style="background:rgba(239,68,68,.12);border:1px solid #FCA5A5;border-radius:10px;padding:8px 12px;margin-bottom:12px;font-size:12px;color:#FCA5A5;font-weight:700">
📌 Practicando ejercicio ${state.currentExamEj.idx+1} de ${state.currentExamEj.total}: ${state.currentExamEj.tipo} sobre <em>${state.currentExamEj.concepto}</em>
</div>`:''}
${state.exParsed.length===0&&!state.loadingEx?spin('Preparando ejercicios...'):''}
${exItems}
${state.loadingEx?spin('Más ejercicios...'):`<div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:8px">
  <button class="btn b-vio" style="background:linear-gradient(135deg,${s.cl},${s.bd});box-shadow:0 5px 0 ${s.sh}" onclick="moreEx()">🔄 Más ejercicios</button>
  ${!state.exResults&&state.exParsed.length>0?`<button class="btn b-grn" ${state.verifying?'disabled':''} onclick="verifyAnswers()">${state.verifying?'🔄 Corrigiendo...':'✅ Ver resultados'}</button>`:''}
  ${state.exResults?`<button class="btn b-grn" onclick="moreEx()">➕ Nuevos ejercicios</button>`:''}
</div>`}
${state.feedback?`<div style="background:rgba(16,185,129,.12);border:2px solid #86EFAC;border-radius:12px;padding:12px;margin-top:10px;font-size:14px;font-weight:700;text-align:center">${state.feedback}</div>`:''}
</div>`:''}
</div></div>`;}

// ── CALENDARIO ─────────────────────────────────────────
function vCal(){
  const td=new Date(),ts=today(),i7=new Date(td);i7.setDate(i7.getDate()+7);const i7s=i7.toISOString().split('T')[0];
  const sm=Object.fromEntries(SUBJS.map(s=>[s.id,s]));
  const cal=[...state.calendar].sort((a,b)=>a.date.localeCompare(b.date));
  const up=cal.filter(e=>e.date>=ts),pa=cal.filter(e=>e.date<ts).reverse();
  const RE=ev=>{const s=ev.subjectId&&sm[ev.subjectId]?sm[ev.subjectId]:{cl:'#7C3AED',bg:'#EDE9FE',bd:'#C4B5FD',ic:'📌',n:'General'};const d=new Date(ev.date+'T12:00:00'),iT=ev.date===ts,iS=ev.date>ts&&ev.date<=i7s;return`<div class="card" style="border-left:5px solid ${s.cl};background:${iT?s.bg:iS?'#FFFBEB':'rgba(255,255,255,.97)'}"><div style="display:flex;justify-content:space-between;gap:10px"><div style="flex:1"><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap">${s.ic}<span style="font-size:11px;font-weight:800;color:${s.cl}">${s.n}</span>${iT?`<span style="background:#7C3AED;color:white;font-size:10px;font-weight:800;padding:2px 7px;border-radius:50px">¡HOY!</span>`:''}${iS?`<span style="background:#F59E0B;color:white;font-size:10px;font-weight:800;padding:2px 7px;border-radius:50px">⏰ Esta semana</span>`:''}</div><div style="font-weight:800;font-size:14px;color:#E9D5FF">${ev.title}</div>${ev.desc?`<div style="font-size:12px;color:#A78BFA;margin-top:2px">${ev.desc}</div>`:''}</div><div style="background:${s.bg};border:1.5px solid ${s.bd};border-radius:11px;padding:6px 9px;text-align:center;min-width:46px;flex-shrink:0"><div style="font-family:'Fredoka One';font-size:22px;color:${s.cl};line-height:1">${d.getDate()}</div><div style="font-size:10px;color:${s.cl};font-weight:800;text-transform:uppercase">${d.toLocaleDateString('es-AR',{month:'short'})}</div></div></div></div>`;};
  return`<div class="page"><div class="wrap"><button class="back-btn btn" onclick="go('student')">← Volver</button><div class="hdr" style="background:linear-gradient(135deg,#6366F1,#7C3AED);box-shadow:0 8px 28px rgba(99,102,241,.35)"><div style="font-size:46px">📅</div><h1>Calendario</h1><p style="text-transform:capitalize">${td.toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p></div>${!cal.length?`<div class="card" style="text-align:center;padding:40px"><div style="font-size:46px">📆</div><p style="color:#7C3AED;font-size:15px;margin-top:10px;font-weight:700">No hay eventos aún</p></div>`:''}${up.length?`<p style="font-family:'Fredoka One';font-size:18px;color:#5B21B6;margin-bottom:10px">📌 Próximas fechas</p>${up.map(RE).join('')}`:''}${pa.length?`<div style="margin-top:15px;opacity:.55"><p style="font-family:'Fredoka One';font-size:14px;color:#7C3AED;margin-bottom:8px">✓ Anteriores</p>${pa.map(RE).join('')}</div>`:''}</div></div>`;}

// ── PARENT ─────────────────────────────────────────────
function vParent(){
  if(!state.parentAuthed)return vParentLogin();
  const tab=state.parentTab||'alumnos';
  const PT=[{id:'alumnos',l:'👥 Alumnos'},{id:'temas',l:'📚 Temas'},{id:'tareas',l:'📝 Tareas'},{id:'cal',l:'📅 Cal.'},{id:'res',l:'📊 Resumen'},{id:'config',l:'⚙️ Config'}];
  const tabs=`<div style="display:flex;gap:5px;margin-bottom:14px;flex-wrap:wrap">${PT.map(t=>`<button class="tab btn ${tab===t.id?'active':'inactive'}" style="${tab===t.id?`background:linear-gradient(135deg,#7C3AED,#6366F1);box-shadow:0 4px 0 #312E81;color:white`:''};font-size:11px;flex:none;padding:7px 10px" onclick="setPTab('${t.id}')">${t.l}</button>`).join('')}</div>`;
  let body='';

  // ── TAB: ALUMNOS ──
  if(tab==='alumnos'){
    const editId=state.editingStudent;
    if(editId!==null){
      const isNew=editId==='new';
      const s=isNew?state._newStudent||newStudent():state.students.find(x=>x.id===editId)||newStudent();
      body=`<div class="card" style="border-left:5px solid #7C3AED">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
<div style="font-family:'Fredoka One';font-size:18px;color:#5B21B6">${isNew?'➕ Nuevo alumno':'✏️ Editar alumno'}</div>
<button class="btn" style="background:none;border:1.5px solid #E9D5FF;color:#7C3AED;border-radius:8px;padding:6px 12px;font-size:12px;box-shadow:none" onclick="cancelEditStudent()">✕ Cancelar</button>
</div>
<div style="margin-bottom:12px">
<div style="font-size:12px;font-weight:700;color:#7C3AED;margin-bottom:6px">Avatar:</div>
<div style="display:flex;gap:6px;flex-wrap:wrap">${AVATARS.map(av=>`<button onclick="setStudentField('avatar','${av}')" style="font-size:26px;background:${(s.avatar||'🌟')===av?'#EDE9FE':'rgba(255,255,255,.8)'};border:2px solid ${(s.avatar||'🌟')===av?'#7C3AED':'rgba(139,92,246,.2)'};border-radius:10px;padding:4px 8px;cursor:pointer">${av}</button>`).join('')}</div>
</div>
<input class="inp" id="sName" value="${s.name||''}" placeholder="Nombre del alumno/a *">
<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px">
<div><div style="font-size:12px;font-weight:700;color:#7C3AED;margin-bottom:4px">Grado:</div>
<select class="sel" id="sGrade">${GRADES.map(g=>`<option value="${g.replace('°','')}" ${(s.grade||'3')===g.replace('°','')?'selected':''}>${g} Grado</option>`).join('')}</select></div>
<div><div style="font-size:12px;font-weight:700;color:#7C3AED;margin-bottom:4px">Curso:</div>
<select class="sel" id="sCourse">${COURSES.map(c=>`<option value="${c}" ${(s.course||'A')===c?'selected':''}>${c}</option>`).join('')}</select></div>
</div>
<input class="inp" id="sSchool" value="${s.school||''}" placeholder="Nombre del colegio">
<div><div style="font-size:12px;font-weight:700;color:#7C3AED;margin-bottom:4px">Provincia:</div>
<select class="sel" id="sProvince">${PROVINCES.map(p=>`<option value="${p}" ${(s.province||'Tucumán')===p?'selected':''}>${p}</option>`).join('')}</select></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px">
<div><div style="font-size:12px;font-weight:700;color:#7C3AED;margin-bottom:4px">Edad:</div>
<input class="inp" id="sAge" type="number" min="5" max="18" value="${s.age||8}" style="margin:0"></div>
<div><div style="font-size:12px;font-weight:700;color:#7C3AED;margin-bottom:4px">Género (para IA):</div>
<select class="sel" id="sGender" style="margin:0"><option value="F" ${(s.gender||'F')==='F'?'selected':''}>Niña</option><option value="M" ${s.gender==='M'?'selected':''}>Niño</option></select></div>
</div>
<input class="inp" id="sTeacher" value="${s.teacher||''}" placeholder="Nombre del/la docente (ej: Silvia)">
<textarea class="inp ta" id="sNotes" placeholder="Observaciones especiales (ej: tiene dificultades en lectura...)">${s.notes||''}</textarea>
<div style="background:linear-gradient(135deg,#F5F0FF,#EDE9FE);border-radius:14px;padding:14px;margin-bottom:10px;border:1.5px solid rgba(139,92,246,.2)">
<div style="font-size:13px;font-weight:800;color:#5B21B6;margin-bottom:10px">🌟 Datos personales (para que los ejercicios sean más divertidos)</div>
<div style="font-size:11px;color:#7C3AED;margin-bottom:10px;font-style:italic">La IA usará estos datos para crear ejemplos personalizados</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
<div><div style="font-size:11px;font-weight:700;color:#7C3AED;margin-bottom:3px">🐾 Mascotas:</div>
<input class="inp" id="sPets" value="${s.pets||''}" placeholder="Ej: Thor el perro" style="margin:0;font-size:12px"></div>
<div><div style="font-size:11px;font-weight:700;color:#7C3AED;margin-bottom:3px">👨‍👩‍👧 Familia:</div>
<input class="inp" id="sFamily" value="${s.family||''}" placeholder="Ej: mamá Laura, papá Diego" style="margin:0;font-size:12px"></div>
<div><div style="font-size:11px;font-weight:700;color:#7C3AED;margin-bottom:3px">🏘️ Barrio/ciudad:</div>
<input class="inp" id="sNeighborhood" value="${s.neighborhood||''}" placeholder="Ej: Yerba Buena" style="margin:0;font-size:12px"></div>
<div><div style="font-size:11px;font-weight:700;color:#7C3AED;margin-bottom:3px">⚽ Club favorito:</div>
<input class="inp" id="sTeam" value="${s.team||''}" placeholder="Ej: Atlético Tucumán" style="margin:0;font-size:12px"></div>
<div><div style="font-size:11px;font-weight:700;color:#7C3AED;margin-bottom:3px">🍕 Comida favorita:</div>
<input class="inp" id="sFavFood" value="${s.favFood||''}" placeholder="Ej: milanesas" style="margin:0;font-size:12px"></div>
<div><div style="font-size:11px;font-weight:700;color:#7C3AED;margin-bottom:3px">📺 Serie/personaje:</div>
<input class="inp" id="sFavShow" value="${s.favShow||''}" placeholder="Ej: Bluey" style="margin:0;font-size:12px"></div>
<div><div style="font-size:11px;font-weight:700;color:#7C3AED;margin-bottom:3px">🎮 Hobby/deporte:</div>
<input class="inp" id="sHobby" value="${s.hobby||''}" placeholder="Ej: natación" style="margin:0;font-size:12px"></div>
<div><div style="font-size:11px;font-weight:700;color:#7C3AED;margin-bottom:3px">✨ Otros datos:</div>
<input class="inp" id="sExtraData" value="${s.extraData||''}" placeholder="Ej: le gusta dibujar" style="margin:0;font-size:12px"></div>
</div></div>
<button class="btn b-vio" style="width:100%;border-radius:12px;padding:12px;font-size:15px" onclick="saveStudentEdit('${isNew?'new':editId}')">💾 Guardar alumno</button>
</div>`;
    } else {
      const canAdd=state.students.length<4;
      body=`<div class="card" style="border-left:5px solid #7C3AED">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
<div style="font-family:'Fredoka One';font-size:18px;color:#5B21B6">👥 Alumnos (${state.students.length}/4)</div>
${canAdd?`<button class="btn b-vio" style="padding:8px 14px;font-size:13px;border-radius:10px" onclick="startNewStudent()">➕ Agregar</button>`:`<span style="font-size:12px;color:#A78BFA;font-weight:700">Máximo 4 alumnos</span>`}
</div>
${state.students.length===0?`<div style="text-align:center;padding:24px;background:rgba(109,40,217,.2);border-radius:14px"><div style="font-size:44px;margin-bottom:10px">👨‍👧</div><p style="color:#7C3AED;font-weight:700">Todavía no hay alumnos</p><p style="color:#A78BFA;font-size:13px;margin-top:4px">Tocá "➕ Agregar" para empezar</p></div>`:
state.students.map(s=>`<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:linear-gradient(135deg,${s.avatar?'#F5F0FF':'#F5F0FF'},white);border-radius:14px;margin-bottom:9px;border:1.5px solid rgba(139,92,246,.2)">
<span style="font-size:36px">${s.avatar||'🌟'}</span>
<div style="flex:1">
<div style="font-weight:800;font-size:16px;color:#E9D5FF">${s.name}</div>
<div style="font-size:12px;color:#7C3AED;font-weight:700">${s.grade}°"${s.course}" · ${s.school||'Colegio'}</div>
<div style="font-size:11px;color:#A78BFA">${s.province||''} · ⭐ ${s.stars||0} estrellas</div>
</div>
<div style="display:flex;flex-direction:column;gap:5px">
<button onclick="editStudent(${s.id})" style="background:linear-gradient(135deg,#6366F1,#7C3AED);color:white;border:none;border-radius:8px;padding:5px 10px;font-size:12px;font-weight:800;cursor:pointer">✏️ Editar</button>
<button onclick="deleteStudent(${s.id})" style="background:none;border:1.5px solid #FCA5A5;color:#EF4444;border-radius:8px;padding:5px 10px;font-size:12px;font-weight:800;cursor:pointer">🗑️</button>
</div></div>`).join('')}
</div>`;}
  }

  // ── TAB: TEMAS ──
  if(tab==='temas'){
    const pStu=state.pStudent||state.students[0]?.id;
    const stu=state.students.find(x=>x.id===pStu)||state.students[0];
    const aS=SUBJS.find(x=>x.id===(state.pSubj||'matematica'))||SUBJS[0];
    const stuTopics=stu?stu.topics[aS.id]||[]:[]; 
    body=`<div class="card" style="border-left:5px solid ${aS.cl}">
<div class="ftit" style="font-size:16px;margin-bottom:10px">📚 Cargar Temas</div>
${state.students.length>1?`<div style="margin-bottom:10px"><div style="font-size:12px;font-weight:700;color:#7C3AED;margin-bottom:5px">Alumno/a:</div><div style="display:flex;gap:6px;flex-wrap:wrap">${state.students.map(s=>`<button class="btn b-sm ${pStu===s.id?'':'inactive'}" style="${pStu===s.id?'background:#7C3AED;box-shadow:0 3px 0 #4C1D95;color:white':''}" onclick="setPStudent(${s.id})">${s.avatar||'🌟'} ${s.name}</button>`).join('')}</div></div>`:''}
<div style="display:flex;gap:5px;margin-bottom:11px;flex-wrap:wrap">${subjTabs(aS.id,'setPSubj')}</div>
<input class="inp" id="topicTitle" placeholder="Título del tema *">
<textarea class="inp ta" id="topicDesc" placeholder="Descripción / contenido (o foto del cuaderno)"></textarea>
<div class="date-row"><label>📅 Fecha:</label><input type="date" class="inp" id="topicDate" value="${today()}"></div>
<div style="display:flex;gap:7px;margin-bottom:11px;flex-wrap:wrap;align-items:center">
<button class="btn" style="background:${aS.cl};box-shadow:0 5px 0 ${aS.sh};border-radius:11px;padding:9px 18px;font-size:13px;color:white" onclick="addTopic()">➕ Agregar</button>
<label style="display:inline-flex"><input type="file" accept="image/*" multiple style="display:none" onchange="photoTopic(this)"><button type="button" class="btn b-vio" style="border-radius:10px;padding:9px 13px;font-size:12px" onclick="this.parentElement.querySelector('input').click()">📷 Foto (1 o más)</button></label>
</div>
<p style="font-weight:800;font-size:13px;color:${aS.cl};margin-bottom:7px">Temas en ${aS.n}${stu?` (${stu.name})`:''}: </p>
${stuTopics.length?stuTopics.map((t,i)=>`<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:9px 12px;background:${aS.bg};border-radius:11px;margin-bottom:6px;border:1.5px solid ${aS.bd}">
<div><div style="font-weight:800;font-size:13px;color:#E9D5FF">${t.title}</div><div style="font-size:11px;color:#A78BFA;margin-top:1px">📅 ${t.date}</div></div>
<button onclick="delTopic('${pStu}','${aS.id}',${i})" style="background:none;border:none;cursor:pointer;font-size:15px;color:#E24B4A;padding:3px 5px">🗑️</button></div>`).join(''):'<p style="color:#A78BFA;font-size:12px">Sin temas...</p>'}
</div>`;}

  // ── TAB: TAREAS ──
  if(tab==='tareas'){
    const pStu=state.pStudent||state.students[0]?.id;
    const stu=state.students.find(x=>x.id===pStu)||state.students[0];
    const aS=SUBJS.find(x=>x.id===(state.pSubj||'matematica'))||SUBJS[0];
    const stuTasks=stu?stu.tasks[aS.id]||[]:[]; 
    body=`<div class="card" style="border-left:5px solid #6366F1">
<div class="ftit" style="font-size:16px;margin-bottom:10px">📝 Cargar Tareas</div>
${state.students.length>1?`<div style="margin-bottom:10px"><div style="font-size:12px;font-weight:700;color:#7C3AED;margin-bottom:5px">Alumno/a:</div><div style="display:flex;gap:6px;flex-wrap:wrap">${state.students.map(s=>`<button class="btn b-sm ${pStu===s.id?'':'inactive'}" style="${pStu===s.id?'background:#7C3AED;box-shadow:0 3px 0 #4C1D95;color:white':''}" onclick="setPStudent(${s.id})">${s.avatar||'🌟'} ${s.name}</button>`).join('')}</div></div>`:''}
<div style="display:flex;gap:5px;margin-bottom:11px;flex-wrap:wrap">${subjTabs(aS.id,'setPSubj')}</div>
<input class="inp" id="taskTitle" placeholder="Título de la tarea *">
<textarea class="inp ta" id="taskDesc" placeholder="Descripción / consigna (o foto del cuaderno)"></textarea>
<div class="date-row"><label>📅 Fecha:</label><input type="date" class="inp" id="taskDate" value="${today()}"></div>
<div style="background:rgba(236,72,153,.1);border:1.5px solid #F9A8D4;border-radius:12px;padding:12px;margin-bottom:11px">
  <div style="font-size:12px;font-weight:700;color:#BE185D;margin-bottom:8px">📋 Tipo de tarea:</div>
  <div style="display:flex;gap:8px;flex-wrap:wrap">
    <label style="display:flex;align-items:center;gap:6px;cursor:pointer;background:rgba(45,27,105,.6);border:1.5px solid #FBCFE8;border-radius:50px;padding:6px 14px">
      <input type="radio" name="taskType" value="tarea" checked onchange="document.getElementById('examNote').style.display='none'" style="accent-color:#BE185D">
      <span style="font-size:13px;font-weight:700;color:#BE185D">📝 Tarea normal</span>
    </label>
    <label style="display:flex;align-items:center;gap:6px;cursor:pointer;background:rgba(45,27,105,.6);border:1.5px solid #FBCFE8;border-radius:50px;padding:6px 14px">
      <input type="radio" name="taskType" value="prueba" onchange="document.getElementById('examNote').style.display='block'" style="accent-color:#BE185D">
      <span style="font-size:13px;font-weight:700;color:#BE185D">❌ Prueba reprobada</span>
    </label>
  </div>
  <div id="examNote" style="display:none;margin-top:8px;font-size:12px;color:#A78BFA;background:rgba(45,27,105,.6);border-radius:8px;padding:8px;border:1px solid #FBCFE8">
    💡 La IA analizará cada punto de la prueba y generará ejercicios de recuperación específicos para cada uno.
  </div>
</div>
<div style="display:flex;gap:7px;margin-bottom:11px;flex-wrap:wrap;align-items:center">
<button class="btn b-ind" style="border-radius:11px;padding:9px 18px;font-size:13px" onclick="addTask()">➕ Agregar tarea</button>
<label style="display:inline-flex"><input type="file" accept="image/*" multiple style="display:none" onchange="photoTask(this)"><button type="button" class="btn b-vio" style="border-radius:10px;padding:9px 13px;font-size:12px" onclick="this.parentElement.querySelector('input').click()">📷 Foto (1 o más)</button></label>
</div>
<p style="font-weight:800;font-size:13px;color:#6366F1;margin-bottom:7px">Tareas en ${aS.n}${stu?` (${stu.name})`:''}: </p>
${stuTasks.length?stuTasks.map(t=>`<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:9px 12px;background:rgba(109,40,217,.25);border-radius:11px;margin-bottom:6px;border:1.5px solid #C4B5FD">
<div><div style="font-weight:800;font-size:13px;color:#E9D5FF">${t.title}</div><div style="font-size:11px;color:#A78BFA;margin-top:1px">📅 ${t.date}</div>${t.content?`<div style="font-size:11px;color:#A78BFA;margin-top:2px">${t.content.substring(0,70)}...</div>`:''}</div>
<button onclick="delTask('${pStu}','${aS.id}',${t.id})" style="background:none;border:none;cursor:pointer;font-size:15px;color:#E24B4A;padding:3px 5px">🗑️</button></div>`).join(''):'<p style="color:#A78BFA;font-size:12px">Sin tareas...</p>'}
</div>`;}

  // ── TAB: CALENDARIO ──
  if(tab==='cal'){
    const sm=Object.fromEntries(SUBJS.map(s=>[s.id,s]));
    body=`<div class="card" style="border-left:5px solid #6366F1">
<div class="ftit" style="font-size:16px;margin-bottom:12px">📅 Eventos</div>
<input type="date" class="inp" id="evDate">
<select class="sel" id="evSubj"><option value="">📌 General</option>${SUBJS.map(s=>`<option value="${s.id}">${s.ic} ${s.n}</option>`).join('')}</select>
<input class="inp" id="evTitle" placeholder="Título *">
<input class="inp" id="evDesc" placeholder="Descripción (opcional)">
<button class="btn b-ind" style="margin-bottom:14px" onclick="addEvent()">📌 Agregar evento</button>
<p style="font-weight:800;font-size:13px;color:#6366F1;margin-bottom:7px">Eventos cargados:</p>
${state.calendar.length?[...state.calendar].sort((a,b)=>a.date.localeCompare(b.date)).map(ev=>{const s=ev.subjectId?sm[ev.subjectId]:null;return`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 11px;background:${s?s.bg:'#EDE9FE'};border-radius:9px;margin-bottom:6px;border:1.5px solid ${s?s.bd:'#C4B5FD'}">
<div><div style="font-weight:800;font-size:12px;color:#E9D5FF">${ev.title}</div><div style="font-size:11px;color:#A78BFA;margin-top:1px">${fmtD(ev.date)}${s?' · '+s.n:''}</div></div>
<button onclick="delEvent(${ev.id})" style="background:none;border:none;cursor:pointer;font-size:15px;color:#E24B4A;padding:3px 5px">🗑️</button></div>`;}).join(''):'<p style="color:#A78BFA;font-size:12px">Sin eventos...</p>'}
</div>`;}

  // ── TAB: RESUMEN ──
  if(tab==='res'){
    const pStu=state.pStudent||state.students[0]?.id;
    body=`<div class="card" style="border-left:5px solid #A855F7">
<div class="ftit" style="font-size:16px;margin-bottom:12px">📊 Resumen / Examen Trimestral</div>
${state.students.length>1?`<div style="margin-bottom:10px"><div style="font-size:12px;font-weight:700;color:#7C3AED;margin-bottom:5px">Alumno/a:</div><div style="display:flex;gap:6px;flex-wrap:wrap">${state.students.map(s=>`<button class="btn b-sm ${pStu===s.id?'':'inactive'}" style="${pStu===s.id?'background:#7C3AED;box-shadow:0 3px 0 #4C1D95;color:white':''}" onclick="setPStudent(${s.id})">${s.avatar||'🌟'} ${s.name}</button>`).join('')}</div></div>`:''}
<select class="sel" id="resSubj"><option value="all">🌟 Todas las materias</option>${SUBJS.map(s=>`<option value="${s.id}">${s.ic} ${s.n}</option>`).join('')}</select>
<div class="date-row"><label>📅 Desde:</label><input type="date" class="inp" id="resFrom"></div>
<div class="date-row"><label>📅 Hasta:</label><input type="date" class="inp" id="resTo"></div>
<p style="font-size:11px;color:#A78BFA;margin-bottom:11px;font-style:italic">💡 Sin fechas: usa todo el período cargado</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
<button class="btn b-vio" style="font-size:12px;padding:11px 6px;width:100%" onclick="genResumen('resumen')">📋 Resumen</button>
<button class="btn b-grn" style="font-size:12px;padding:11px 6px;width:100%;border-radius:11px" onclick="genResumen('examen')">📝 Examen</button>
</div>
${state.loadingResume?spin('Generando...'):''}
${state.resumeResult?`<div style="background:rgba(109,40,217,.2);border:1.5px solid rgba(139,92,246,.3);border-radius:14px;padding:14px;white-space:pre-wrap;line-height:1.7;font-size:12px;color:#E9D5FF;max-height:380px;overflow-y:auto;margin-bottom:9px">${state.resumeResult}</div><button class="btn b-ind" style="font-size:12px" onclick="xpdf('Resumen Trimestral','Todas las materias',state.resumeResult,[])">📄 PDF</button>`:''}
</div>`;}

  // ── TAB: CONFIG ──
  if(tab==='config'){
    const hasKey=!!getApiKey(),inClaude=isCA();
    body=`<div class="card" style="border-left:5px solid #7C3AED">
<div class="ftit" style="font-size:16px;margin-bottom:12px">⚙️ Configuración</div>
<input class="inp" id="cfgPin" type="password" placeholder="Cambiar PIN de mamá/papá (mín. 4 dígitos)">
<button class="btn b-vio" onclick="saveConfig()" style="margin-bottom:16px">💾 Guardar PIN</button>

${!inClaude?`<div style="padding-top:14px;border-top:1.5px solid rgba(139,92,246,.2);margin-top:4px">
<div style="font-weight:800;font-size:14px;color:#7C3AED;margin-bottom:5px">🔑 API Key de Anthropic</div>
<p style="font-size:12px;color:#A78BFA;margin-bottom:8px;line-height:1.6">Necesaria para usar la IA en este archivo. <a href="https://console.anthropic.com" target="_blank" style="color:#7C3AED;font-weight:700">Obtenerla aquí →</a></p>
<div style="display:flex;gap:7px;margin-bottom:6px">
<input class="inp" id="cfgApiKey" type="password" placeholder="sk-ant-api..." style="margin:0;flex:1;font-size:12px">
<button class="btn b-vio" style="padding:10px 14px;font-size:12px;white-space:nowrap;border-radius:11px" onclick="saveApiKey(document.getElementById('cfgApiKey').value);render()">💾</button>
</div>
<p style="font-size:11px;font-weight:700;color:${hasKey?'#059669':'#EF4444'}">${hasKey?'✅ API Key configurada':'❌ Sin API Key'}</p>
<p style="font-size:11px;color:#FCD34D;margin-top:5px;background:rgba(245,158,11,.12);border-radius:7px;padding:6px 9px">⚠️ La API Key es visible en las DevTools del navegador (pestaña Red). No uses esta app en computadoras públicas.</p>
</div>`:''}

<div style="margin-top:16px;padding-top:14px;border-top:1.5px solid rgba(139,92,246,.2)">
<div style="font-weight:800;font-size:14px;color:#7C3AED;margin-bottom:5px">📦 Backup de datos</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px">
<button class="btn" style="background:linear-gradient(135deg,#059669,#10B981);color:white;box-shadow:0 5px 0 #064E3B;border-radius:12px;padding:12px 8px;font-size:13px;width:100%" onclick="exportData()">📤 Exportar</button>
<label style="display:flex"><input type="file" accept=".json" style="display:none" id="importFileInput" onchange="importData(this)"><button type="button" class="btn b-ind" style="border-radius:12px;padding:12px 8px;font-size:13px;width:100%;flex:1" onclick="document.getElementById('importFileInput').click()">📥 Importar</button></label>
</div>
<p style="font-size:11px;color:#A78BFA;margin-top:8px;font-style:italic">💡 Al importar se reemplazarán los datos actuales</p>
</div>
</div>`;}

  return`<div class="page"><div class="wrap"><button class="back-btn btn" onclick="go('welcome')">← Volver</button><div class="hdr" style="background:linear-gradient(135deg,#7C3AED,#A855F7);box-shadow:0 8px 28px rgba(109,40,217,.3)"><h1>🔧 Panel Mamá/Papá</h1></div>${tabs}${body}</div></div>`;}

function vParentLogin(){
  return`<div class="page" style="display:flex;align-items:center;justify-content:center;min-height:100vh"><div class="card" style="max-width:320px;width:100%;text-align:center;padding:32px;border-radius:22px;animation:pop .3s ease"><div style="font-size:50px;margin-bottom:10px">🔐</div><div style="font-family:'Fredoka One';font-size:25px;color:#5B21B6;margin-bottom:5px">Panel Mamá/Papá</div><p style="color:#7C3AED;font-size:13px;margin-bottom:20px">Ingresá tu PIN</p><input class="inp" id="loginPin" type="password" placeholder="PIN (por defecto: 1234)" style="text-align:center;font-size:20px;letter-spacing:5px" onkeydown="if(event.key==='Enter')tryLogin()">${state.loginErr?`<p style="color:#E24B4A;font-size:13px;margin-bottom:6px">PIN incorrecto ❌</p>`:''}<button class="btn b-vio" style="width:100%;border-radius:12px;padding:12px;font-size:15px" onclick="tryLogin()">Entrar</button><button class="back-btn btn" style="justify-content:center;margin-top:12px;margin-bottom:0;width:100%" onclick="go('welcome')">← Volver</button></div></div>`;}

// ── PROGRESS MODAL ─────────────────────────────────────
function showProg(){
  const s=state.activeStudent;
  const html=SUBJS.map(sub=>{const tc=(state.topics[sub.id]||[]).length,tk=(state.tasks[sub.id]||[]).length,pct=Math.min(100,tc*20);return`<div style="margin-bottom:14px;background:rgba(255,255,255,.05);border-radius:12px;padding:10px 12px;border:1px solid rgba(139,92,246,.2)"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><div style="display:flex;align-items:center;gap:6px"><span>${sub.ic}</span><span style="font-weight:800;font-size:13px;color:#E9D5FF">${sub.n}</span></div><span style="font-size:11px;color:#A78BFA;font-weight:700">${tc} tema${tc!==1?'s':''} · ${tk} tarea${tk!==1?'s':''}</span></div><div class="prog-bar"><div class="prog-fill" style="width:${pct}%;background:linear-gradient(135deg,#7C3AED,#C084FC)"></div></div></div>`;}).join('');
  const div=document.createElement('div');div.id='progModal';div.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(10,4,20,.85);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);z-index:8888;display:flex;align-items:center;justify-content:center';
  div.innerHTML=`<div style="background:#1A0A2E;border-radius:24px;padding:24px;max-width:340px;width:90%;box-shadow:0 24px 64px rgba(0,0,0,.7),0 0 0 1px rgba(139,92,246,.4);border:1px solid rgba(139,92,246,.5);animation:pop .3s ease"><div style="font-family:'Fredoka One';font-size:22px;color:#E9D5FF;margin-bottom:4px;text-align:center">📊 Progreso de ${s?.name||''}</div><div style="display:flex;justify-content:center;margin-bottom:16px">${starsHtml()}</div>${html}<button class="btn b-vio" style="width:100%;margin-top:6px" onclick="document.getElementById('progModal').remove()">✅ Cerrar</button></div>`;
  document.body.appendChild(div);}

// ── ACHIEVEMENTS & PROGRESS ────────────────────────────
const LOGROS=[
  {id:'first',ic:'🌟',name:'¡Primera estrella!',desc:'Ganaste tu primera estrella',check:()=>state.stars>=1},
  {id:'stars10',ic:'⭐',name:'10 estrellas',desc:'Acumulaste 10 estrellas',check:()=>state.stars>=10},
  {id:'stars50',ic:'🏆',name:'50 estrellas',desc:'¡50 estrellas! Sos una crack',check:()=>state.stars>=50},
  {id:'streak3',ic:'🔥',name:'3 días seguidos',desc:'Estudiaste 3 días seguidos',check:()=>state.streak>=3},
  {id:'streak7',ic:'💫',name:'Una semana entera',desc:'7 días de racha perfecta',check:()=>state.streak>=7},
  {id:'streak30',ic:'🚀',name:'Un mes de campeón',desc:'30 días de racha increíble',check:()=>state.streak>=30},
  {id:'topics5',ic:'📚',name:'5 temas practicados',desc:'Practicaste 5 temas distintos',check:()=>Object.values(state.topicProgress||{}).length>=5},
  {id:'perfect',ic:'💎',name:'¡Perfecto!',desc:'Completaste un ejercicio perfecto',check:()=>state.achievements?.includes('perfect')},
  {id:'allsubj',ic:'🌈',name:'Todo terreno',desc:'Practicaste todas las materias',check:()=>SUBJS.every(s=>(state.topics[s.id]||[]).some((_,i)=>state.topicProgress?.[`${s.id}_${i}`]))},
];
function checkAchievements(){
  if(!state.achievements)state.achievements=[];
  LOGROS.forEach(l=>{
    if(!state.achievements.includes(l.id)&&l.check()){
      state.achievements.push(l.id);
      showAchievement(l);
    }
  });
}
function showAchievement(logro){
  const d=document.createElement('div');d.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#7C3AED,#A855F7);color:white;padding:14px 22px;border-radius:18px;font-family:Nunito,sans-serif;font-weight:800;font-size:14px;z-index:99999;box-shadow:0 8px 28px rgba(109,40,217,.5);text-align:center;animation:fadeUp .4s ease';
  d.innerHTML=`<div style="font-size:28px;margin-bottom:4px">${logro.ic}</div><div>🏆 ¡Logro desbloqueado!</div><div style="font-size:12px;opacity:.9;margin-top:2px">${logro.name}</div>`;
  document.body.appendChild(d);setTimeout(()=>d.remove(),3500);
}
function markTopicDone(subjId,idx){
  if(!state.topicProgress)state.topicProgress={};
  state.topicProgress[`${subjId}_${idx}`]=(state.topicProgress[`${subjId}_${idx}`]||0)+1;
}

// ── QUICK REVIEW ────────────────────────────────────────
async function startQuickReview(){
  state.quickReview=true;state.quickItems=[];state.quickIdx=0;
  state.quickAnswers={};state.quickResults=null;state.loadingQuick=true;
  // Juntar todos los temas practicados
  const temas=[];
  SUBJS.forEach(s=>{(state.topics[s.id]||[]).forEach((t,i)=>{if(state.topicProgress?.[`${s.id}_${i}`])temas.push({subj:s.n,title:t.title});});});
  if(temas.length===0){
    // Si no hay temas practicados, tomar los cargados
    SUBJS.forEach(s=>{(state.topics[s.id]||[]).forEach(t=>temas.push({subj:s.n,title:t.title}));});
  }
  if(temas.length===0){state.loadingQuick=false;showToast('¡Primero practicá algunos temas!','#F59E0B');return;}
  const sel=temas.sort(()=>Math.random()-.5).slice(0,Math.min(5,temas.length));
  const r=await ai([{role:'user',content:`Temas: ${sel.map(t=>t.title+' ('+t.subj+')').join(', ')}\nCreá 1 pregunta de repaso por cada tema.`}],
  `Maestra ${gradeStr()}. 5 preguntas de repaso rápido, 1 por tema. Cada pregunta en UNA línea con [__] para la respuesta. Formato:\nPregunta X [TEMA]: oración con [__]\n[Respuesta: respuesta]`,700);
  const pts=r.split(/Pregunta\s+\d+/i).map(p=>p.trim()).filter(p=>p.length>5);
  state.quickItems=pts.map(parseEx).filter((_,i)=>i<5);
  state.loadingQuick=false;render();
}
function vQuickReview(){
  const items=state.quickItems;const idx=state.quickIdx;
  if(state.loadingQuick)return`<div class="page"><div class="wrap"><div class="card">${spin('Preparando repaso...')}</div></div></div>`;
  if(!items.length)return`<div class="page"><div class="wrap"><button class="back-btn btn" onclick="go('student')">← Volver</button><div class="card" style="text-align:center;padding:40px"><div style="font-size:44px">📭</div><p style="color:#7C3AED;font-size:15px;margin-top:10px;font-weight:700">¡Primero practicá algunos temas!</p></div></div></div>`;
  if(state.quickResults){
    const ok=state.quickResults.filter(r=>r).length;const total=items.length;
    const pct=Math.round(ok/total*100);
    return`<div class="page"><div class="wrap"><div class="card" style="text-align:center;padding:30px;border-top:5px solid #7C3AED">
<div style="font-size:52px;margin-bottom:12px">${pct===100?'🏆':pct>=60?'🌟':'😊'}</div>
<div style="font-family:'Fredoka One';font-size:28px;color:#5B21B6;margin-bottom:8px">${ok} / ${total}</div>
<div style="font-size:15px;color:#7C3AED;font-weight:700;margin-bottom:20px">${pct===100?'¡Perfecto! ¡Sos una crack!':pct>=60?'¡Muy bien! ¡Seguí así!':'¡Buen intento! Seguí practicando'}</div>
${items.map((it,i)=>`<div style="background:${state.quickResults[i]?'#ECFDF5':'#FEF2F2'};border-radius:10px;padding:10px 14px;margin-bottom:8px;text-align:left;font-size:13px">
<div style="font-weight:700;color:${state.quickResults[i]?'#059669':'#DC2626'};margin-bottom:3px">${state.quickResults[i]?'✅':'❌'} ${it.q.substring(0,60)}...</div>
<div style="color:#A78BFA">Respuesta correcta: <strong>${it.a}</strong></div></div>`).join('')}
<div style="display:flex;gap:8px;margin-top:16px">
<button class="btn b-vio" style="flex:1;border-radius:12px" onclick="startQuickReview()">🔄 Otro repaso</button>
<button class="btn b-ind" style="flex:1;border-radius:12px" onclick="go('student')">🏠 Inicio</button>
</div></div></div></div>`;
  }
  const cur=items[idx];
  const qNorm=cur.q.replace(/_{3,}/g,'[__]').replace(/\.{3,}/g,'[__]');
  const qHtml=qNorm.replace(/\[__\]/g,`<input id="qrInp" value="${(state.quickAnswers[idx]||'').replace(/"/g,'&quot;')}" oninput="state.quickAnswers[${idx}]=this.value" placeholder=" ? " class="inp-pill" style="width:130px;margin:0 5px;vertical-align:middle">`);
  return`<div class="page"><div class="wrap">
<button class="back-btn btn" onclick="go('student')">← Salir</button>
<div class="hdr" style="background:linear-gradient(135deg,#F59E0B,#F97316);box-shadow:0 6px 20px rgba(245,158,11,.4)">
<div style="font-size:28px;margin-bottom:6px">⚡</div>
<h1>Repaso Rápido</h1><p>Pregunta ${idx+1} de ${items.length}</p>
<div style="background:rgba(255,255,255,.25);border-radius:50px;height:6px;margin-top:10px;overflow:hidden"><div style="background:rgba(45,27,105,.6);height:100%;width:${((idx+1)/items.length)*100}%;border-radius:50px;transition:width .4s ease"></div></div>
</div>
<div class="card" style="border-top:5px solid #F59E0B">
<div style="font-size:11px;font-weight:700;color:#FCD34D;margin-bottom:10px;letter-spacing:.5px">PREGUNTA ${idx+1}</div>
<div style="font-size:16px;line-height:1.9;color:#E9D5FF;margin-bottom:14px">${qHtml}</div>
${!cur.q.includes('[__]')&&!qNorm.includes('[__]')?`<input class="inp" id="qrInp2" value="${state.quickAnswers[idx]||''}" placeholder="✍️ Tu respuesta..." oninput="state.quickAnswers[${idx}]=this.value" style="font-size:14px">`:'' }
</div>
<div style="display:flex;gap:8px">
${idx>0?`<button class="btn b-ind" style="flex:1;border-radius:12px;padding:13px" onclick="state.quickIdx--;render()">← Anterior</button>`:''}
${idx<items.length-1?`<button class="btn b-vio" style="flex:1;border-radius:12px;padding:13px" onclick="state.quickIdx++;render()">Siguiente →</button>`:
`<button class="btn b-grn" style="flex:1;border-radius:12px;padding:13px" onclick="checkQuickReview()">✅ Ver resultados</button>`}
</div></div></div>`;
}
function checkQuickReview(){
  const results=state.quickItems.map((it,i)=>{
    const ua=(state.quickAnswers[i]||'').toLowerCase().trim();
    const ca=(it.a||'').toLowerCase().trim();
    return ua.length>0&&(ua===ca||ca.includes(ua)||ua.includes(ca));
  });
  state.quickResults=results;
  const ok=results.filter(r=>r).length;
  if(ok>=Math.ceil(results.length*.6)){state.stars+=ok;saveStudentData();showCat(state.activeStudent?.name,ok);}
  if(ok===results.length&&!state.achievements?.includes('perfect')){
    state.achievements=[...(state.achievements||[]),'perfect'];
    checkAchievements();
  }
  render();
}
function go(v){
  state.view=v;
  if(v==='parent'&&!state.parentAuthed)state.loginErr=false;
  if(v==='chat'&&!state.chatMsgs.length&&state.topic)state.chatMsgs=[{role:'assistant',text:`¡Hola! 😊 Estoy acá para ayudarte con <strong>${state.topic.title}</strong>. ¿Qué parte no entendiste?`}];
  if(v==='recreo'){const t=state.recTab||'chistes';if((t==='chistes'||t==='adivinanzas')&&!state.recContent&&!state.loadingRec)setTimeout(genRec,80);if(t==='trivia'&&!state.triviaItems.length&&!state.loadingTrivia)setTimeout(genTrivia,80);if(t==='ahorcado'&&!state.hangWord&&!state.hangLoading)setTimeout(genHang,80);if(t==='sopalet'&&!state.sopaGrid.length&&!state.sopaLoading)setTimeout(genSopa,80);if(t==='crucigrama'&&!state.cruciGrid.length&&!state.cruciLoading)setTimeout(genCruci,80);}
  render();}

function selectStudent(id){
  const s=state.students.find(x=>x.id===id);if(!s)return;
  state.activeStudent=s;state.topics={...ET(),...s.topics};state.tasks={...ET(),...s.tasks};
  state.stars=s.stars||0;state.streak=s.streak||0;state.lastStudyDate=s.lastStudyDate||'';
  state.achievements=s.achievements||[];state.topicProgress=s.topicProgress||{};
  state.chatMsgs=[];state.exParsed=[];state.answers={};state.exResults=null;state.explanation='';state.feedback='';
  go('student');}

function goSubj(id){state.subj=SUBJS.find(s=>s.id===id);state.subjTab='topics';state.view='subject';render();}

function launchQuick(){state.view='quickReview';state.quickItems=[];state.quickIdx=0;state.quickAnswers={};state.quickResults=null;render();startQuickReview();}

function goTask(i){
  const t=state.tasks[state.subj.id][i];
  state.task=t;state.view='task';
  state.explanation='';state.exParsed=[];state.answers={};state.exBatch=0;
  state.feedback='';state.exResults=null;state.loadingExpl=true;state.loadingEx=false;state.examPoints=null;state.currentExamEj=null;
  render();
  if(t.isExam)loadExamExpl();else loadTaskExpl();}

function goTopic(i){
  state.topic=state.topics[state.subj.id][i];state.view='topic';
  state.explanation='';state.exParsed=[];state.answers={};state.exBatch=0;state.feedback='';state.exResults=null;
  state.usedExercises=[];state.revealedAnswers={};state.exFormat='completar';state.mcAnswers={};state.vofAnswers={};state.exFormatData=[];state.mcChecked=false;state.vofChecked=false;state.exDifficulty=0;
  state.engTab='ej';state.dictItems=[];state.dictAnswers={};state.dictFeedback='';state.fonItems=[];state.fonAnswers={};state.fonFeedback='';
  state.loadingExpl=true;state.loadingEx=false;state.chatMsgs=[];render();loadExpl();}

function setSubjTab(t){state.subjTab=t;render();}
function setEngTab(t){state.engTab=t;if(t==='dict'&&!state.dictItems.length)genDict();if(t==='fon'&&!state.fonItems.length)genFon();render();}
function setPTab(t){state.parentTab=t;render();}
function setPSubj(id){state.pSubj=id;render();}
function setPStudent(id){state.pStudent=id;render();}
function setRecTab(t){state.recTab=t;state.recContent='';if(t==='chistes'||t==='adivinanzas')genRec();if(t==='trivia'){state.triviaItems=[];state.triviaAnswers={};state.triviaChecked=false;genTrivia();}if(t==='ahorcado'&&!state.hangWord)genHang();if(t==='sopalet')genSopa();if(t==='crucigrama')genCruci();render();}
function setAns(i,v){state.answers[i]=v;
  const btn=document.getElementById('verifyBtn');
  if(btn){const hasAns=Object.values(state.answers).some(a=>a&&a.trim());btn.style.display=hasAns&&!state.exResults?'inline-flex':'none';}
}
function getAns(i){
  if(state.answers[i]!==undefined&&state.answers[i]!=='')return state.answers[i];
  const parts=[];let j=0;
  while(state.answers[`${i}_${j}`]!==undefined){parts.push(state.answers[`${i}_${j}`]||'(vacío)');j++;}
  return parts.length?parts.join(' / '):'';
}
function setDictAns(i,v){state.dictAnswers[i]=v;}
function setFonAns(i,j){state.fonAnswers={...state.fonAnswers,[i]:j};render();}
function togglePdfMenu(){const m=document.getElementById('pdfMenu');if(m)m.style.display=m.style.display==='none'?'block':'none';}
function doPdf(w){const m=document.getElementById('pdfMenu');if(m)m.style.display='none';xpdf(state.topic.title,state.subj.n,w==='ej'?'':state.explanation,w==='exp'?[]:state.exParsed);}
function tryLogin(){const p=document.getElementById('loginPin')?.value;if(p&&checkPin(p,state.parentPin)){state.parentAuthed=true;state.loginErr=false;}else state.loginErr=true;render();}

// ── STUDENT MANAGEMENT ─────────────────────────────────
function startNewStudent(){state.editingStudent='new';state._newStudent=newStudent();render();}
function editStudent(id){state.editingStudent=id;render();}
function cancelEditStudent(){state.editingStudent=null;state._newStudent=null;render();}
function setStudentField(f,v){if(state.editingStudent==='new'&&state._newStudent){state._newStudent[f]=v;render();}else if(state.editingStudent){const idx=state.students.findIndex(s=>s.id===state.editingStudent);if(idx>=0){state.students[idx][f]=v;render();}}}

async function saveStudentEdit(editId){
  const n=document.getElementById('sName')?.value?.trim();
  if(!n){alert('El nombre es obligatorio');return;}
  const data={
    name:n,
    grade:document.getElementById('sGrade')?.value||'3',
    course:document.getElementById('sCourse')?.value||'A',
    school:document.getElementById('sSchool')?.value?.trim()||'',
    province:document.getElementById('sProvince')?.value||'Tucumán',
    age:parseInt(document.getElementById('sAge')?.value)||8,
    gender:document.getElementById('sGender')?.value||'F',
    teacher:document.getElementById('sTeacher')?.value?.trim()||'',
    notes:document.getElementById('sNotes')?.value?.trim()||'',
    pets:document.getElementById('sPets')?.value?.trim()||'',
    family:document.getElementById('sFamily')?.value?.trim()||'',
    neighborhood:document.getElementById('sNeighborhood')?.value?.trim()||'',
    team:document.getElementById('sTeam')?.value?.trim()||'',
    favFood:document.getElementById('sFavFood')?.value?.trim()||'',
    favShow:document.getElementById('sFavShow')?.value?.trim()||'',
    hobby:document.getElementById('sHobby')?.value?.trim()||'',
    extraData:document.getElementById('sExtraData')?.value?.trim()||''
  };
  if(editId==='new'){const s={...newStudent(),...data,avatar:state._newStudent?.avatar||'🌟'};state.students.push(s);}
  else{const idx=state.students.findIndex(s=>s.id===parseInt(editId));if(idx>=0)state.students[idx]={...state.students[idx],...data};}
  state.editingStudent=null;state._newStudent=null;
  await ss('edu_students',state.students);render();}

async function deleteStudent(id){
  if(!confirm('¿Eliminar este alumno y todos sus datos?'))return;
  state.students=state.students.filter(s=>s.id!==id);
  if(state.activeStudent?.id===id){state.activeStudent=null;state.topics=ET();state.tasks=ET();state.stars=0;}
  await ss('edu_students',state.students);render();}

// ── TOPICS/TASKS MANAGEMENT ────────────────────────────
async function addTopic(){
  const t=document.getElementById('topicTitle')?.value?.trim();if(!t)return;
  const d=document.getElementById('topicDesc')?.value||'',dt=document.getElementById('topicDate')?.value||today();
  const pStu=state.pStudent||state.students[0]?.id,aS=state.pSubj||'matematica';
  const idx=state.students.findIndex(s=>s.id===pStu);if(idx<0)return;
  if(!state.students[idx].topics)state.students[idx].topics=ET();
  if(!state.students[idx].topics[aS])state.students[idx].topics[aS]=[];
  state.students[idx].topics[aS].push({title:t,photoContent:d.trim(),desc:d.trim().substring(0,120),isoDate:dt,date:fmtD(dt)});
  if(state.activeStudent?.id===pStu){state.activeStudent=state.students[idx];state.topics={...state.topics,...state.students[idx].topics};}
  await ss('edu_students',state.students);render();}

async function delTopic(stuId,subjId,i){
  const idx=state.students.findIndex(s=>s.id===parseInt(stuId));if(idx<0)return;
  state.students[idx].topics[subjId]=state.students[idx].topics[subjId].filter((_,j)=>j!==i);
  if(state.activeStudent?.id===parseInt(stuId)){state.activeStudent=state.students[idx];state.topics={...state.topics,...state.students[idx].topics};}
  await ss('edu_students',state.students);render();}

async function addTask(){
  const t=document.getElementById('taskTitle')?.value?.trim();if(!t)return;
  const c=document.getElementById('taskDesc')?.value||'',dt=document.getElementById('taskDate')?.value||today();
  const isExam=document.querySelector('input[name="taskType"]:checked')?.value==='prueba';
  const pStu=state.pStudent||state.students[0]?.id,aS=state.pSubj||'matematica';
  const idx=state.students.findIndex(s=>s.id===pStu);if(idx<0)return;
  if(!state.students[idx].tasks)state.students[idx].tasks=ET();
  if(!state.students[idx].tasks[aS])state.students[idx].tasks[aS]=[];
  state.students[idx].tasks[aS].push({id:Date.now(),title:t,content:c.trim(),isoDate:dt,date:fmtD(dt),isExam:isExam||false});
  if(state.activeStudent?.id===pStu){state.activeStudent=state.students[idx];state.tasks={...state.tasks,...state.students[idx].tasks};}
  await ss('edu_students',state.students);render();}

async function delTask(stuId,subjId,id){
  const idx=state.students.findIndex(s=>s.id===parseInt(stuId));if(idx<0)return;
  state.students[idx].tasks[subjId]=state.students[idx].tasks[subjId].filter(t=>t.id!==id);
  if(state.activeStudent?.id===parseInt(stuId)){state.activeStudent=state.students[idx];state.tasks={...state.tasks,...state.students[idx].tasks};}
  await ss('edu_students',state.students);render();}

async function addEvent(){const dt=document.getElementById('evDate')?.value;const sj=document.getElementById('evSubj')?.value;const ti=document.getElementById('evTitle')?.value;const ds=document.getElementById('evDesc')?.value||'';if(!dt||!ti?.trim())return;state.calendar.push({id:Date.now(),date:dt,subjectId:sj||null,title:ti.trim(),desc:ds.trim()});await ss('edu_cal',state.calendar);render();}
async function delEvent(id){state.calendar=state.calendar.filter(e=>e.id!==id);await ss('edu_cal',state.calendar);render();}

// Comprime imagen antes de enviar a la API
async function compressImg(file,maxW=1024){
  return new Promise(ok=>{
    const img=new Image(),url=URL.createObjectURL(file);
    img.onload=()=>{
      URL.revokeObjectURL(url);
      const scale=Math.min(1,maxW/Math.max(img.width,img.height));
      const canvas=document.createElement('canvas');
      canvas.width=Math.round(img.width*scale);
      canvas.height=Math.round(img.height*scale);
      canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
      // Calidad más baja para asegurar tamaño pequeño
      const b64=canvas.toDataURL('image/jpeg',0.6).split(',')[1];
      ok({b64,mt:'image/jpeg'});
    };
    img.onerror=()=>{
      // Si falla la carga de imagen, intentar convertir directo
      f2b(file).then(b64=>ok({b64,mt:'image/jpeg'})).catch(()=>ok(null));
    };
    img.src=url;
  });
}

// Analiza múltiples fotos y combina el resultado
async function analyzePhotos(files,prompt){
  const results=[];
  for(let i=0;i<files.length;i++){
    showToast(`🔄 Analizando foto ${i+1} de ${files.length}...`,'#7C3AED');
    try{
      const compressed=await compressImg(files[i]);
      if(!compressed){results.push(`--- Hoja ${i+1} ---\n(No se pudo procesar esta imagen)`);continue;}
      const{b64,mt}=compressed;
      // Verificar tamaño aproximado del base64 (max ~4MB = ~5.5M chars en base64)
      if(b64.length>5000000){
        // Recomprimir más agresivamente
        const{b64:b2}=await compressImg(files[i],600);
        const r=await aiImg(b2,'image/jpeg',`Hoja ${i+1} de ${files.length}. ${prompt}`);
        results.push(`--- Hoja ${i+1} ---\n${r}`);
      } else {
        const r=await aiImg(b64,mt,`Hoja ${i+1} de ${files.length}. ${prompt}`);
        results.push(`--- Hoja ${i+1} ---\n${r}`);
      }
    }catch(e){
      results.push(`--- Hoja ${i+1} ---\n(Error al procesar: ${e.message||'intente con menor resolución'})`);
    }
  }
  return results.join('\n\n');
}

async function photoTopic(inp){
  const files=Array.from(inp.files);if(!files.length)return;inp.value='';
  const msg=files.length>1?`🔄 Analizando ${files.length} fotos...`:'🔄 Analizando la foto...';
  showToast(msg,'#7C3AED');
  const r=await analyzePhotos(files,'Analizá este material escolar de 3er grado Argentina. Extraé tema, conceptos, ejemplos. En español organizado.');
  const fl=r.split('\n').find(l=>l.trim().length>3&&!l.startsWith('---'))||'';
  const tt=document.getElementById('topicTitle');const td2=document.getElementById('topicDesc');
  if(tt&&!tt.value)tt.value=fl.replace(/^[*#\-\s]+/,'').substring(0,60);
  if(td2)td2.value=r;
  showToast(`✅ ${files.length>1?files.length+' fotos analizadas':'Foto analizada'}!`,'#059669');}

async function photoTask(inp){
  const files=Array.from(inp.files);if(!files.length)return;inp.value='';
  const msg=files.length>1?`🔄 Analizando ${files.length} fotos...`:'🔄 Analizando la foto...';
  showToast(msg,'#7C3AED');
  const r=await analyzePhotos(files,'Analizá este cuaderno de 3er grado Argentina. Describí la tarea, consignas y preguntas. En español organizado.');
  const fl=r.split('\n').find(l=>l.trim().length>3&&!l.startsWith('---'))||'';
  const kt=document.getElementById('taskTitle');const kd=document.getElementById('taskDesc');
  if(kt&&!kt.value)kt.value=fl.replace(/^[*#\-\s]+/,'').substring(0,60);
  if(kd)kd.value=r;
  showToast(`✅ ${files.length>1?files.length+' fotos analizadas':'Foto analizada'}!`,'#059669');}

function showToast(msg,color='#7C3AED'){
  document.querySelectorAll('.toast-msg').forEach(t=>t.remove());
  const t=document.createElement('div');t.className='toast-msg';
  t.style.cssText=`position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:${color};color:white;padding:12px 22px;border-radius:50px;font-family:'Nunito',sans-serif;font-weight:800;font-size:14px;z-index:99999;box-shadow:0 4px 18px rgba(0,0,0,.2);transition:.3s`;
  t.textContent=msg;document.body.appendChild(t);
  if(!msg.startsWith('🔄'))setTimeout(()=>t.remove(),3000);}

async function saveConfig(){const p=document.getElementById('cfgPin')?.value;if(p?.length>=4)state.parentPin=storePin(p);await ss('edu_pin',state.parentPin);alert('✅ ¡Guardado!');render();}
async function resetStars(){state.stars=0;await saveStudentData();render();}

// ── EXPLANATION ────────────────────────────────────────
async function loadExpl(){
  const s=state.subj,tp=state.topic;
  const r=await ai([{role:'user',content:`Explicame detalladamente: "${tp.title}"${tp.photoContent?`\n\nMaterial:\n${tp.photoContent}`:tp.desc?`. Contexto: ${tp.desc}`:''}`}],
  `Maestra súper didáctica para ${gradeStr()}. Formato EXACTO:
🎯 **¿QUÉ ES ${tp.title.toUpperCase()}?**
[Analogía cotidiana + 2-3 frases simples]
📊 **ESQUEMA VISUAL:**
[Emojis, flechas →, representación visual del concepto]
✨ **PASO A PASO:**
1️⃣ [paso con ejemplo]
2️⃣ [paso con ejemplo]
3️⃣ [verificación]
🌟 **EJEMPLO COMPLETO RESUELTO:**
[De inicio a fin, explicando cada micro-paso]
💡 **TRUCO PARA RECORDARLO:**
[Rima o regla memorable]
Materia: ${s.n}. Frases cortas. Muchos emojis.`,1400);
  state.explanation=r;state.loadingExpl=false;render();genEx();}

async function loadExamExpl(){
  const s=state.subj,tp=state.task;
  const contenido=tp.content||tp.title;

  // PASO 1 — Extraer ejercicios detectando el TIPO MECÁNICO (cómo responde el alumno)
  const analisisRaw=await ai([{role:'user',content:`Examen de ${s.n}:\n${contenido}`}],
  `Analizá este examen. Para cada ejercicio identificá el TIPO MECÁNICO — es decir, QUÉ HACE el alumno para responder.

TIPOS MECÁNICOS POSIBLES:
- "completar blancos": el alumno escribe palabras en espacios en blanco dentro de oraciones
- "banco de palabras": el alumno elige palabras de un recuadro/lista para completar oraciones  
- "clasificar": el alumno escribe una categoría (P/C, V/F, sustantivo/verbo, etc.) junto a cada palabra
- "verdadero o falso": el alumno escribe V o F para cada afirmación
- "escribir lista": el alumno escribe una lista de palabras o ejemplos
- "identificar y copiar": el alumno busca palabras en una oración y las copia
- "reescribir o transformar": el alumno cambia palabras o reescribe oraciones
- "ordenar": el alumno numera o pone en orden elementos
- "comprensión lectora": SOLO si el ejercicio pide leer un texto Y responder preguntas sobre ESE texto específico

IMPORTANTE: Si el ejercicio tiene oraciones con blancos sobre gramática (sustantivos, verbos, etc.), es "completar blancos", NO "comprensión lectora".

Devolvé SOLO este JSON array, sin texto extra:
[
  {"num":1,"tipo":"banco de palabras","concepto":"tipos de texto","mecanica":"elegir del recuadro LEYENDA/CUENTO/POEMA/NOTICIA para completar"},
  {"num":2,"tipo":"clasificar","concepto":"sustantivos propios y comunes","mecanica":"escribir P o C junto a cada palabra"},
  {"num":3,"tipo":"completar blancos","concepto":"verbos en oraciones","mecanica":"escribir el verbo correcto en el blanco"}
]`,800);

  // Parsear el JSON
  let ejercicios=[];
  try{
    const clean=analisisRaw.replace(/```json|```/g,'').trim();
    ejercicios=JSON.parse(clean);
  }catch{
    // Si falla el JSON, guardar el texto crudo igual
    ejercicios=[];
  }
  state.examPoints=ejercicios.length>0?ejercicios:analisisRaw;

  // PASO 2 — Explicación para el alumno
  const r=await ai([{role:'user',content:`Examen reprobado de ${s.n}: "${tp.title}"\n${contenido}`}],
  `Maestra muy didáctica para ${gradeStr()}. Explicá:
🔍 **LO QUE TOMARON EN EL EXAMEN:**
[Listá cada tipo de ejercicio evaluado]
📊 **QUÉ NECESITÁS REPASAR:**
[Por cada ejercicio, el concepto]
💪 **CÓMO LO VAMOS A PRACTICAR:**
[Plan de recuperación]
Sé alentadora. Emojis. Frases simples.`,1200);

  state.explanation=r;state.loadingExpl=false;render();
  genExamEx();
}

async function genExamEx(){
  state.loadingEx=true;render();
  const s=state.subj,tp=state.task;
  const contenido=tp.content||tp.title;
  const puntos=state.examPoints;

  // Obtener el ejercicio actual del array JSON
  let ejercicios=Array.isArray(puntos)?puntos:[];
  if(ejercicios.length===0){
    // Fallback: reextraer como JSON
    const reext=await ai([{role:'user',content:`Examen:\n${contenido}\n\nDevolvé SOLO JSON array con cada ejercicio:\n[{"num":1,"tipo":"completar frases","concepto":"tipos de texto","mecanica":"completar oraciones"}]`}],
    `SOLO el JSON array, sin texto extra.`,500);
    try{ejercicios=JSON.parse(reext.replace(/```json|```/g,'').trim());}catch{ejercicios=[];}
    if(ejercicios.length>0)state.examPoints=ejercicios;
  }

  const totalEj=Math.max(ejercicios.length,1);
  // idxEj basado en el LOTE ACTUAL (antes de incrementar exBatch)
  const loteActual=Math.floor(state.exBatch/3);
  const idxEj=loteActual%totalEj;
  const ej=ejercicios[idxEj]||{tipo:'completar frases',concepto:'el tema',mecanica:'completar con blancos'};

  const tipo=ej.tipo||'completar frases';
  const concepto=ej.concepto||'el tema';
  const mecanica=ej.mecanica||'completar con [__]';

  // Guardar en state para mostrarlo en el indicador
  state.currentExamEj={idx:idxEj,total:totalEj,tipo,concepto};


  const tipoL=tipo.toLowerCase();
  let plantilla='';
  let prohibicion='NO incluyas ningún texto para leer. Solo el ejercicio directo.';

  if(tipoL.includes('verdadero')||tipoL.includes('falso')||tipoL.includes('v/f')||tipoL.includes('v o f')){
    plantilla=`3 ejercicios de VERDADERO O FALSO sobre ${concepto}.\nCada ejercicio tiene 4 afirmaciones. Al final de cada afirmación va [__] donde se escribe V o F.\nEjemplo:\n"El perro es un sustantivo [__]. El sustantivo nombra personas [__]. Correr es un sustantivo [__]. La mesa es un verbo [__]."`;
    prohibicion='NO pongas textos para leer. Solo afirmaciones directas sobre el concepto.';
  } else if(tipoL.includes('clasif')||tipoL.includes('propio')||tipoL.includes('comun')||tipoL.includes('común')||tipoL.includes('c/p')){
    plantilla=`3 ejercicios de CLASIFICAR sobre ${concepto}.\nCada ejercicio da 4 palabras y el alumno escribe la clasificación en [__].\nEjemplo:\nmesa → [__] / Buenos Aires → [__] / perro → [__] / Valentina → [__]`;
    prohibicion='Solo palabras para clasificar, sin textos para leer.';
  } else if(tipoL.includes('banco')||tipoL.includes('cuadro')||tipoL.includes('recuadro')){
    plantilla=`3 ejercicios de BANCO DE PALABRAS sobre ${concepto}.\nCada ejercicio: primero el banco con 4 palabras, luego 4 oraciones con [__] para completar usando esas palabras.\nEjemplo:\nBanco: LEYENDA - CUENTO - POEMA - NOTICIA\nUna [__] tiene rimas. Una [__] narra hechos reales. Un [__] cuenta el origen de algo. Un [__] tiene personajes inventados.`;
    prohibicion='Poné el banco de palabras bien visible arriba de las oraciones.';
  } else if(tipoL.includes('escrib')||tipoL.includes('ejemplos')||tipoL.includes('lista')||tipoL.includes('nombr')){
    plantilla=`3 ejercicios de ESCRIBIR EJEMPLOS de ${concepto}.\nCada ejercicio pide 4 ejemplos con 4 campos [__] separados.\nEjemplo:\nEscribí 4 sustantivos propios: [__] [__] [__] [__]`;
    prohibicion='Solo pedí que escriban ejemplos. Sin textos para leer.';
  } else if(tipoL.includes('identif')||tipoL.includes('subray')||tipoL.includes('encontr')||tipoL.includes('marcá')){
    plantilla=`3 ejercicios de IDENTIFICAR ${concepto}.\nCada ejercicio da una oración y el alumno identifica y escribe las palabras en campos [__].\nEjemplo:\n"El niño corre y salta en el parque." — Escribí los verbos: [__] [__]`;
    prohibicion='Dá oraciones cortas. El alumno identifica y escribe en [__].';
  } else {
    plantilla=`3 ejercicios de COMPLETAR FRASES sobre ${concepto}.\nCada ejercicio tiene 4 oraciones cortas con [__] donde va la respuesta.\nEjemplo:\nLa [__] es un texto que cuenta el origen de algo. Un [__] tiene rimas. Una [__] informa sobre hechos reales.`;
    prohibicion='Oraciones directas sobre el concepto. Sin textos para leer antes.';
  }

  const r=await ai([{role:'user',content:
    `Tipo de ejercicio: ${tipo}\nConcepto: ${concepto}\nMecánica: ${mecanica}\n\n${plantilla}`}],
  `Maestra ${gradeStr()}.
SEGUÍ EXACTAMENTE la plantilla. ${prohibicion}
IMPORTANTE: NO uses ningún texto de la leyenda, cuento ni historia del examen. Inventá oraciones nuevas sobre el CONCEPTO en abstracto.
Usá [__] para cada campo. Sin markdown. Sin "#" ni "*". Oraciones completas.
La respuesta NO aparece en la consigna.

Formato:
Ejercicio X:
[ejercicio según plantilla con [__]]
[Respuesta: resp1 / resp2 / resp3 / resp4]`,1100);

  const pts=r.split(/Ejercicio\s+\d+:/i).map(p=>p.trim()).filter(p=>p.length>10);
  state.exParsed=[...state.exParsed,...(pts.length>=2?pts:[r]).map(parseEx)];
  state.exBatch+=3;state.loadingEx=false;render();
}

async function loadTaskExpl(){
  const s=state.subj,tp=state.task;
  const consigna=tp.content||tp.title;
  const r=await ai([{role:'user',content:`Esta es una tarea escolar de ${s.n}: "${tp.title}"\n\nConsigna completa: ${consigna}\n\nExplicame cómo resolver esta tarea paso a paso.`}],
  `Maestra súper didáctica para ${gradeStr()}. Analizá la tarea y explicá:
1. Qué se está pidiendo hacer
2. Cómo resolverlo paso a paso con ejemplos
3. Un truco para no equivocarse
Sé muy clara y usa emojis. Frases cortas.`,1200);
  state.explanation=r;state.loadingExpl=false;render();
  // Generar primer ejercicio basado en la tarea
  genTaskEx();
}

async function genTaskEx(){
  state.loadingEx=true;render();
  const tp=state.task,s=state.subj;
  const consigna=tp.content||tp.title;
  const lote=Math.floor(state.exBatch/3)%4;
  const tipos=[
    'igual al de la tarea pero con diferentes ejemplos, con EXACTAMENTE 4 campos [__]',
    'similar a la tarea pero variando el contexto, con 4 campos [__] para completar',
    'que refuerce el concepto de la tarea con 4 campos [__] distintos',
    'de práctica adicional relacionado con la tarea, con 4 campos [__]'
  ];
  const r=await ai([{role:'user',content:`Creá 3 ejercicios de práctica basados en esta tarea escolar:\n\nTarea: ${tp.title}\nConsigna: ${consigna}\n\nTipo para este lote: ${tipos[lote]}`}],
  `Maestra ${gradeStr()}. REGLAS ABSOLUTAS:
1. Usá ÚNICAMENTE [__] para cada campo editable — NUNCA ___ ni ... ni ningún otro formato
2. Cada ejercicio DEBE tener MÍNIMO 4 campos [__]
3. Los ejercicios deben ser similares a la tarea pero con contenido diferente
4. Sin imágenes, sin dibujos, sin nombres propios inventados
5. Texto limpio: sin #, sin *, sin --, sin markdown
6. La respuesta NO aparece en la consigna

Formato:
Ejercicio X:
[ejercicio con mínimo 4 campos [__]]
[Respuesta: resp1 / resp2 / resp3 / resp4]`,1000);
  const pts=r.split(/Ejercicio\s+\d+:/i).map(p=>p.trim()).filter(p=>p.length>10);
  state.exParsed=[...state.exParsed,...(pts.length>=2?pts:[r]).map(parseEx)];
  state.exBatch+=3;state.loadingEx=false;render();
}

async function genEx(){
  state.loadingEx=true;render();
  const isIngles=state.subj.id==='ingles';
  const fmt=state.exFormat||'completar';

  // ── MÚLTIPLE OPCIÓN ──
  const diff=state.exDifficulty||0;
  const diffHintEs=diff===0?'Nivel inicial — preguntas simples y directas.':diff<=2?'Nivel intermedio — preguntas con más contexto y opciones menos obvias.':'Nivel avanzado — preguntas con mayor complejidad conceptual, opciones similares entre sí.';
  const diffHintEn=diff===0?'Beginner level — simple and direct questions.':diff<=2?'Intermediate level — questions with more context, less obvious options.':'Advanced level — conceptually richer questions, similar-looking options to challenge the student.';
  if(fmt==='multiple'){
    const usedHint=(state.usedExercises||[]).length>0?`\n${isIngles?'Avoid repeating':'Evitá repetir'}: ${state.usedExercises.slice(-4).join(' | ')}`:'';
    const p=isIngles?`Create 5 multiple-choice questions STRICTLY about "${state.topic.title}" IN ENGLISH.${usedHint}`
      :`Creá 5 preguntas de múltiple opción sobre "${state.topic.title}" de ${state.subj.n}.${usedHint}`;
    const sys=isIngles?`English teacher for ${gradeStr()}. 5 MC questions in English about "${state.topic.title}". ${diffHintEn} EXACT format:
Q1: [question]
A) opt  B) opt  C) opt  D) opt
[Answer: B]`:`Maestra ${gradeStr()}. 5 preguntas MC sobre "${state.topic.title}". ${diffHintEs} Formato EXACTO:
P1: [pregunta]
A) opción  B) opción  C) opción  D) opción
[Respuesta: B]`;
    const r=await ai([{role:'user',content:p}],sys,700);
    const blocks=r.split(/(?:Q|P)\d+:/i).filter(b=>b.trim().length>5);
    const items=blocks.map(block=>{
      const lines=block.trim().split('\n').map(l=>l.trim()).filter(l=>l);
      const q=lines[0]||'';
      const opts=lines.filter(l=>/^[A-D]\)/i.test(l)).map(l=>l.replace(/^[A-D]\)\s*/i,'').trim());
      const al=lines.find(l=>/\[(?:Respuesta|Answer):\s*[A-D]\]/i.test(l))||'';
      const am=al.match(/\[(?:Respuesta|Answer):\s*([A-D])\]/i);
      const correct=am?'ABCD'.indexOf(am[1].toUpperCase()):0;
      return q&&opts.length>=2?{q,opts,correct}:null;
    }).filter(Boolean);
    items.forEach(it=>{if(it.q)state.usedExercises.push(it.q.substring(0,60));});
    state.exFormatData=items;state.mcAnswers={};state.mcChecked=false;
    state.exBatch+=5;state.loadingEx=false;render();return;
  }

  // ── VERDADERO O FALSO ──
  if(fmt==='vof'){
    const usedHint=(state.usedExercises||[]).length>0?`\n${isIngles?'Avoid repeating':'Evitá repetir'}: ${state.usedExercises.slice(-4).join(' | ')}`:'';
    const p=isIngles?`Create 5 True/False statements STRICTLY about "${state.topic.title}" IN ENGLISH.${usedHint}`
      :`Creá 5 afirmaciones verdaderas o falsas sobre "${state.topic.title}" de ${state.subj.n}. Mezclar V y F.${usedHint}`;
    const sys=isIngles?`English teacher for ${gradeStr()}. 5 True/False statements about "${state.topic.title}". Mix true and false. ${diffHintEn} Format:
1. [statement] [Answer: True]
2. [statement] [Answer: False]`:`Maestra ${gradeStr()}. 5 afirmaciones sobre "${state.topic.title}". Mezclar verdaderas y falsas. ${diffHintEs} Formato:
1. [afirmación] [Respuesta: Verdadero]
2. [afirmación] [Respuesta: Falso]`;
    const r=await ai([{role:'user',content:p}],sys,500);
    const lines=r.split('\n').filter(l=>/^\d+\./.test(l.trim()));
    const items=lines.map(l=>{
      const am=l.match(/\[(?:Respuesta|Answer):\s*(Verdadero|Falso|True|False)\]/i);
      const correct=am?/verdadero|true/i.test(am[1]):true;
      const stmt=l.replace(/^\d+\.\s*/,'').replace(/\[(?:Respuesta|Answer):[^\]]*\]/i,'').trim();
      return stmt.length>3?{stmt,correct}:null;
    }).filter(Boolean).slice(0,5);
    items.forEach(it=>{if(it.stmt)state.usedExercises.push(it.stmt.substring(0,60));});
    state.exFormatData=items;state.vofAnswers={};state.vofChecked=false;
    state.exBatch+=5;state.loadingEx=false;render();return;
  }

  const lote=Math.floor(state.exBatch/3)%4;
  const tiposEs=[
    `COMPLETAR FRASES: 3 oraciones, cada una con EXACTAMENTE 4 campos [__] distribuidos en la oración. Ejemplo: "El [__] y la [__] son sustantivos. En mi [__] hay muchos [__]."`,
    `ESCRIBIR LISTA: pedí 4 ejemplos del concepto. Usá exactamente 4 campos [__]. Ejemplo: "Escribí 4 sustantivos que conozcas: [__] [__] [__] [__]"`,
    `VERDADERO O FALSO: 3 afirmaciones, cada una con [__] al final. Más 1 oración para completar con 2 campos [__]. Total mínimo 5 campos [__].`,
    `COMPLETAR ORACIONES LARGAS: 3 oraciones largas, cada una con 4 campos [__] en distintas partes.`
  ];
  const tiposEn=[
    `FILL IN THE BLANKS: 3 sentences about the topic, each with EXACTLY 4 [__] fields. Example: "The [__] is a [__]. I can see a [__] and a [__]."`,
    `WRITE A LIST: Ask for 4 examples related to the topic. Use exactly 4 [__] fields. Example: "Write 4 words you know: [__] [__] [__] [__]"`,
    `TRUE OR FALSE: 3 statements (True/False), each with [__] at the end. Plus 1 fill-in sentence with 2 [__] fields. Minimum 5 [__] total.`,
    `COMPLETE THE SENTENCES: 3 long sentences about the topic, each with 4 [__] fields in different positions.`
  ];
  const tipos=isIngles?tiposEn:tiposEs;
  if(!state.usedExercises)state.usedExercises=[];
  const usedHint=state.usedExercises.length>0?`\n${isIngles?'AVOID repeating these already-used exercise themes':'EVITÁ repetir estos temas ya usados'}: ${state.usedExercises.slice(-6).join(' | ')}`:'';
  let prompt,sys;
  if(isIngles){
    prompt=`Create 3 exercises STRICTLY about "${state.topic.title}" in English. Type: ${tipos[lote]}${usedHint}`;
    sys=`English teacher for ${gradeStr()}. ${diffHintEn} ABSOLUTE RULES — never break them:
1. Write ALL exercises IN ENGLISH. No Spanish in questions or instructions.
2. ALL exercises MUST be exclusively about "${state.topic.title}". Do NOT switch to another English topic.
3. Use ONLY [__] for blank fields. NEVER use ___ or ... or __ or any other format.
4. Each exercise MUST have MINIMUM 4 [__] fields. Count them before finishing.
5. No images, drawings, or visual references.
6. The answer does NOT appear inside the question text.
7. Clean text: no #, no *, no --, no markdown.

EXACT format (no variations):
Exercise X:
[exercise text in English with minimum 4 [__] fields]
[Answer: answer1 / answer2 / answer3 / answer4]`;
  } else {
    prompt=`Creá 3 ejercicios sobre "${state.topic.title}" de ${state.subj.n}. Tipo: ${tipos[lote]}${usedHint}`;
    sys=`Maestra ${gradeStr()}. ${diffHintEs} REGLAS ABSOLUTAS que no podés violar:
1. Usá ÚNICAMENTE [__] para marcar cada campo editable. NUNCA ___ ni ... ni __ ni ningún otro formato.
2. Cada ejercicio DEBE tener MÍNIMO 4 campos [__]. Contá los [__] antes de terminar.
3. Sin imágenes, sin dibujos, sin referencias visuales.
4. Sin nombres propios inventados (no uses "Juan", "María", etc. a menos que el tema lo requiera).
5. La respuesta NO aparece dentro de la consigna.
6. Texto limpio: sin #, sin *, sin --, sin markdown.

Formato EXACTO (sin variaciones):
Ejercicio X:
[texto del ejercicio con mínimo 4 campos [__]]
[Respuesta: respuesta1 / respuesta2 / respuesta3 / respuesta4]`;
  }
  const r=await ai([{role:'user',content:prompt}],sys,1000);
  const pts=r.split(/(?:Exercise|Ejercicio)\s+\d+:/i).map(p=>p.trim()).filter(p=>p.length>10);
  const parsed=(pts.length>=2?pts:[r]).map(parseEx);
  parsed.forEach(p=>{if(p.q&&p.q.length>10)state.usedExercises.push(p.q.substring(0,60));});
  state.exParsed=[...state.exParsed,...parsed];
  state.exBatch+=3;state.loadingEx=false;render();}

function moreEx(){
  state.exResults=null;state.answers={};state.feedback='';state.revealedAnswers={};state.mcAnswers={};state.vofAnswers={};state.mcChecked=false;state.vofChecked=false;state.exFormatData=[];
  state.exDifficulty=Math.min((state.exDifficulty||0)+1,5);
  state.exParsed=[]; // siempre limpiar los ejercicios anteriores
  if(state.view==='task'&&state.task?.isExam){
    genExamEx(); // exBatch ya avanzó en genExamEx anterior, no resetear
  } else {
    if(state.view==='task')genTaskEx();else genEx();
  }
}

async function verifyAnswers(){
  state.verifying=true;state.feedback='';render();
  const name=state.activeStudent?.name||'el alumno';
  // Corregir CADA ejercicio por separado para evitar confusiones
  const results=[];
  for(let i=0;i<state.exParsed.length;i++){
    const ex=state.exParsed[i];
    const ans=getAns(i)||'(sin responder)';
    const sys=`Maestra correctora para ${gradeStr()}.
Corregí SOLO este ejercicio específico. No inventes contexto de otros ejercicios.

Evaluá únicamente:
1. Si la respuesta tiene sentido en el contexto EXACTO de esta pregunta
2. Si es del tipo gramatical correcto (si aplica)
3. NO evalúes verdadero/falso si el ejercicio no lo pide
4. NO menciones nombres propios que no estén en la pregunta

Devolvé SOLO este JSON (sin texto extra):
{"correct":true,"explain":"frase corta y amigable de por qué está bien"}
o
{"correct":false,"explain":"frase corta explicando qué está mal y cuál sería una respuesta correcta en esta frase"}`;
    const msg=`Ejercicio: ${ex.q}\nRespuesta esperada: ${ex.a}\nRespuesta de ${name}: "${ans}"`;
    const r=await ai([{role:'user',content:msg}],sys,300);
    try{
      const p=JSON.parse(r.replace(/```json|```/g,'').trim());
      results.push({correct:ans!=='(sin responder)'&&(p.correct===true||p.correct==='true'),explain:p.explain||''});
    }catch{
      const ua=ans.toLowerCase().trim(),ca=(ex.a||'').toLowerCase().trim();
      const ok=ua.length>0&&ua!=='(sin responder)'&&(ua===ca||ca.includes(ua)||ua.includes(ca));
      results.push({correct:ok,explain:ok?'¡Muy bien! 🌟':`La respuesta correcta sería: "${ex.a}".`});
    }
  }
  state.exResults=results;state.verifying=false;
  const ok=results.filter(x=>x.correct).length,total=results.length;
  if(ok===total)state.feedback=`🌟 ¡Perfecto, ${name}! ¡Todo correcto! ¡Sos una estrella! ⭐`;
  else if(ok>=Math.ceil(total*0.6))state.feedback=`🎉 ¡Muy bien, ${name}! Acertaste ${ok} de ${total}. ¡Seguí así! 💪`;
  else state.feedback=`😊 ¡Buen intento, ${name}! Acertaste ${ok} de ${total}. Leé las explicaciones y volvé a intentarlo.`;
  if(ok>=Math.ceil(total*0.6)){
    state.stars+=ok;
    // Marcar tema como practicado
    if(state.view==='topic'&&state.subj&&state.topic){
      const idx=state.topics[state.subj.id]?.indexOf(state.topic);
      if(idx>=0)markTopicDone(state.subj.id,idx);
    }
    await saveStudentData();showCat(name,ok);
  }
  render();}

async function genDict(){state.loadingDict=true;state.dictItems=[];state.dictAnswers={};state.dictFeedback='';render();
const r=await ai([{role:'user',content:`5 oraciones en inglés (5-7 palabras) sobre "${state.topic.title}". Una por línea, sin numeración.`}],'English teacher 3rd grade Argentina. Simple sentences.',500);
state.dictItems=r.split('\n').map(l=>l.trim().replace(/^[-*\d.]\s*/,'')).filter(l=>l.length>3&&l.length<100).slice(0,5);state.loadingDict=false;render();}

async function moreDict(){state.loadingDict=true;render();
const r=await ai([{role:'user',content:`5 oraciones NUEVAS en inglés sobre "${state.topic.title}", distintas a: ${state.dictItems.join(' / ')}.`}],'English teacher. Simple sentences.',400);
state.dictItems=[...state.dictItems,...r.split('\n').map(l=>l.trim().replace(/^[-*\d.]\s*/,'')).filter(l=>l.length>3&&l.length<100).slice(0,5)];state.loadingDict=false;render();}

async function verifyDict(){state.loadingDict=true;
const ps=state.dictItems.map((s,i)=>`Original: "${s}" | ${state.activeStudent?.name||'Alumno'}: "${state.dictAnswers[i]||'(vacío)'}"`).join('\n');
const r=await ai([{role:'user',content:ps}],`Maestra inglés ${gradeStr()}. Corregí con emojis. Si mayoría correcta, EMPEZÁ con "EXCELENTE". En español.`,500);
state.dictFeedback=r;state.loadingDict=false;render();
if(/excelente|muy bien/i.test(r)){state.stars+=2;await saveStudentData();showCat(state.activeStudent?.name,2);}}

async function genFon(){state.loadingFon=true;state.fonItems=[];state.fonAnswers={};state.fonFeedback='';render();
const r=await ai([{role:'user',content:`5 palabras inglesas de "${state.topic.title}". JSON SOLO:\n[{"word":"cat","hint":"animal","options":["ket","cat","kat"],"correct":1}]`}],'English teacher. ONLY JSON array.',500);
try{state.fonItems=JSON.parse(r.replace(/```json|```/g,'').trim()).slice(0,5);}catch{state.fonItems=[{word:'hello',hint:'saludo',options:['helo','hello','jello'],correct:1}];}
state.loadingFon=false;render();}

async function moreFon(){state.loadingFon=true;render();
const ex=(state.fonItems||[]).map(it=>it.word).join(', ');
const r=await ai([{role:'user',content:`5 palabras inglesas NUEVAS distintas a: ${ex}. JSON SOLO:\n[{"word":"dog","hint":"animal","options":["dag","dog","dug"],"correct":1}]`}],'English teacher. ONLY JSON array.',500);
try{state.fonItems=[...state.fonItems,...JSON.parse(r.replace(/```json|```/g,'').trim()).slice(0,5)];}catch{}state.loadingFon=false;render();}

function verifyFon(){const ok=state.fonItems.filter((it,i)=>state.fonAnswers[i]===it.correct).length;const pc=Math.round(ok/state.fonItems.length*100);
state.fonFeedback=`✅ ${ok} de ${state.fonItems.length} correctas (${pc}%)\n\n${state.fonItems.map((it,i)=>`• "${it.word}" → correcta: "${it.options[it.correct]}" ${state.fonAnswers[i]===it.correct?'✅':'❌'}`).join('\n')}`;
render();if(pc>=60){state.stars+=2;saveStudentData();showCat(state.activeStudent?.name,2);}}

async function sendChat(){const inp=document.getElementById('chatInp');const t=inp?.value?.trim();if(!t)return;inp.value='';state.chatMsgs.push({role:'user',text:t});state.chatLoading=true;render();
const r=await ai(state.chatMsgs.map(m=>({role:m.role==='assistant'?'assistant':'user',content:m.text.replace(/<[^>]+>/g,'')})),`Maestra MUY paciente para ${gradeStr()}. Ayudás con "${state.topic?.title}" de ${state.subj?.n}. Frases cortas, muchos emojis, alentadora.`);
state.chatMsgs.push({role:'assistant',text:r});state.chatLoading=false;render();
setTimeout(()=>{const c=document.getElementById('chatMsgs');if(c)c.scrollTop=c.scrollHeight;},50);}

async function genRec(){state.loadingRec=true;state.recContent='';render();
const t=state.recTab;
const p={chistes:'3 chistes MUY divertidos para niños de 8 años argentinos. Numerados 1, 2, 3. Muchos emojis.',adivinanzas:'3 adivinanzas para niños de 8 años. Formato:\n🔍 Adivinanza N°X: [pregunta]\n💡 Respuesta: [respuesta]'};
state.recContent=await ai([{role:'user',content:p[t]||p.chistes}],'Animador infantil. Español rioplatense. Muchos emojis.',500);
state.loadingRec=false;render();}

// ── SOPA DE LETRAS ──────────────────────────────────────
function buildSopaGrid(words,SIZE=10){
  const DIRS=[[0,1],[1,0],[1,1],[1,-1]];
  const grid=Array(SIZE).fill(null).map(()=>Array(SIZE).fill(''));
  const placed=[];
  for(const word of words){
    const L=word.split('');let ok=false;
    for(let att=0;att<300&&!ok;att++){
      const d=DIRS[Math.floor(Math.random()*DIRS.length)];
      const r=Math.floor(Math.random()*SIZE),c=Math.floor(Math.random()*SIZE);
      const cells=[];let fits=true;
      for(let i=0;i<L.length;i++){const nr=r+d[0]*i,nc=c+d[1]*i;if(nr<0||nr>=SIZE||nc<0||nc>=SIZE||(grid[nr][nc]!==''&&grid[nr][nc]!==L[i])){fits=false;break;}cells.push({r:nr,c:nc});}
      if(fits){cells.forEach(({r,c},i)=>grid[r][c]=L[i]);placed.push({word,cells});ok=true;}
    }
  }
  const A='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(!grid[r][c])grid[r][c]=A[Math.floor(Math.random()*26)];
  return{grid,placed};
}
async function genSopa(){
  state.sopaLoading=true;state.sopaGrid=[];state.sopaWordList=[];state.sopaFound=[];state.sopaStart=null;render();
  const topic=(state.topic?.title)||'animales';
  const r=await ai([{role:'user',content:`Dame exactamente 8 palabras en español sobre "${topic}". Una por línea, sin tildes, sin números, solo letras, máximo 9 letras cada una.`}],'Solo la lista de palabras, sin explicación ni formato extra.',150);
  const words=r.split('\n').map(w=>w.trim().toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Z]/g,'')).filter(w=>w.length>=3&&w.length<=9).slice(0,8);
  const{grid,placed}=buildSopaGrid(words.length>=3?words:['GATO','PERRO','PATO','VACA'],10);
  state.sopaGrid=grid;state.sopaWordList=placed;state.sopaLoading=false;render();
}
function sopaClick(r,c){
  if(!state.sopaStart){state.sopaStart={r,c};}
  else{
    const{r:r1,c:c1}=state.sopaStart;
    const dr=r-r1,dc=c-c1,len=Math.max(Math.abs(dr),Math.abs(dc));
    if(len>0&&(dr===0||dc===0||Math.abs(dr)===Math.abs(dc))){
      const sr=dr===0?0:(dr>0?1:-1),sc=dc===0?0:(dc>0?1:-1);
      let word='';for(let i=0;i<=len;i++)word+=state.sopaGrid[r1+sr*i][c1+sc*i];
      const rev=word.split('').reverse().join('');
      const match=state.sopaWordList.find(w=>!state.sopaFound.includes(w.word)&&(w.word===word||w.word===rev));
      if(match){state.sopaFound=[...state.sopaFound,match.word];if(state.sopaFound.length===state.sopaWordList.length){state.stars+=5;saveStudentData();showCat(state.activeStudent?.name,5);}}
    }
    state.sopaStart=null;
  }
  render();
}

// ── CRUCIGRAMA ──────────────────────────────────────────
function buildCruci(entries){
  const SIZE=19;
  const grid=Array(SIZE).fill(null).map(()=>Array(SIZE).fill(null));
  const placed=[];
  function canPlace(word,r,c,dir){
    const L=word.length;
    if(dir==='across'){if(c<0||c+L>SIZE||r<0||r>=SIZE)return false;if(c>0&&grid[r][c-1])return false;if(c+L<SIZE&&grid[r][c+L])return false;}
    else{if(r<0||r+L>SIZE||c<0||c>=SIZE)return false;if(r>0&&grid[r-1][c])return false;if(r+L<SIZE&&grid[r+L][c])return false;}
    for(let i=0;i<L;i++){
      const nr=dir==='across'?r:r+i,nc=dir==='across'?c+i:c;
      if(grid[nr][nc]&&grid[nr][nc].letter!==word[i])return false;
      if(!grid[nr][nc]){
        if(dir==='across'){if((nr>0&&grid[nr-1][nc])||(nr<SIZE-1&&grid[nr+1][nc]))return false;}
        else{if((nc>0&&grid[nr][nc-1])||(nc<SIZE-1&&grid[nr][nc+1]))return false;}
      }
    }
    return true;
  }
  function doPlace(word,r,c,dir){for(let i=0;i<word.length;i++){const nr=dir==='across'?r:r+i,nc=dir==='across'?c+i:c;if(!grid[nr][nc])grid[nr][nc]={letter:word[i]};}}
  // Place first word horizontally
  if(entries.length>0){const w=entries[0].word,r=Math.floor(SIZE/2),c=Math.floor((SIZE-w.length)/2);if(canPlace(w,r,c,'across')){doPlace(w,r,c,'across');placed.push({...entries[0],r,c,dir:'across'});}}
  // Place remaining crossing
  for(let wi=1;wi<entries.length;wi++){
    const word=entries[wi].word;let pw=false;
    for(const p of [...placed].reverse()){if(pw)break;
      const dir=p.dir==='across'?'down':'across';
      for(let li=0;li<word.length&&!pw;li++){for(let pi=0;pi<p.word.length&&!pw;pi++){
        if(word[li]===p.word[pi]){
          const nr=dir==='across'?p.r+pi:p.r-li,nc=dir==='across'?p.c-li:p.c+pi;
          if(canPlace(word,nr,nc,dir)){doPlace(word,nr,nc,dir);placed.push({...entries[wi],r:nr,c:nc,dir});pw=true;}
        }
      }}
    }
  }
  // Number cells
  let n=1;const nums={};
  for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
    if(!grid[r][c])continue;
    const sa=(c===0||!grid[r][c-1])&&c+1<SIZE&&grid[r][c+1];
    const sd=(r===0||!grid[r-1]?.[c])&&r+1<SIZE&&grid[r+1]?.[c];
    if(sa||sd)nums[`${r}_${c}`]=n++;
  }
  // Trim
  let mr=SIZE,xr=0,mc=SIZE,xc=0;
  for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(grid[r][c]){mr=Math.min(mr,r);xr=Math.max(xr,r);mc=Math.min(mc,c);xc=Math.max(xc,c);}
  if(mr===SIZE)return{grid:[],clues:{across:[],down:[]},nums:{}};
  const tg=[],tn={};
  for(let r=mr;r<=xr;r++){const row=[];for(let c=mc;c<=xc;c++)row.push(grid[r][c]);tg.push(row);}
  Object.keys(nums).forEach(k=>{const[r,c]=k.split('_').map(Number);tn[`${r-mr}_${c-mc}`]=nums[k];});
  const tp=placed.map(p=>({...p,r:p.r-mr,c:p.c-mc}));
  const ac=[],dn=[];
  tp.forEach(p=>{const num=tn[`${p.r}_${p.c}`];if(!num)return;if(p.dir==='across')ac.push({num,word:p.word,clue:p.clue,r:p.r,c:p.c});else dn.push({num,word:p.word,clue:p.clue,r:p.r,c:p.c});});
  ac.sort((a,b)=>a.num-b.num);dn.sort((a,b)=>a.num-b.num);
  return{grid:tg,clues:{across:ac,down:dn},nums:tn};
}
async function genCruci(){
  state.cruciLoading=true;state.cruciGrid=[];state.cruciClues={across:[],down:[]};state.cruciNums={};state.cruciAnswers={};state.cruciChecked=false;render();
  const topic=(state.topic?.title)||'conocimiento general';
  const r=await ai([{role:'user',content:`Creá 10 entradas para crucigrama sobre "${topic}" para alumnos de ${gradeStr()}. JSON exacto sin markdown:\n[{"word":"GATO","clue":"Animal que maulla"},{"word":"TREN","clue":"Transporte sobre rieles"}]`}],`Maestra ${gradeStr()}. Solo JSON array válido. Palabras sin tildes ni caracteres especiales, entre 3 y 9 letras, vocabulario adecuado para el grado. Las pistas deben ser simples y claras para la edad.`,500);
  let entries=[];
  try{entries=JSON.parse(r.replace(/```json|```/g,'').trim());}catch{entries=[{word:'GATO',clue:'Animal que maulla'},{word:'PERRO',clue:'Amigo fiel'},{word:'CASA',clue:'Lugar donde vivimos'},{word:'ARBOL',clue:'Planta grande con tronco'},{word:'LUNA',clue:'Satélite natural de la Tierra'},{word:'SOL',clue:'Estrella que nos da luz'}];}
  entries=entries.map(e=>({...e,word:(e.word||'').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Z]/g,'')})).filter(e=>e.word.length>=3&&e.word.length<=9).slice(0,10);
  const{grid,clues,nums}=buildCruci(entries);
  state.cruciGrid=grid;state.cruciClues=clues;state.cruciNums=nums;state.cruciLoading=false;render();
}
function cruciInput(key,val){if(!state.cruciAnswers)state.cruciAnswers={};state.cruciAnswers[key]=(val||'').toUpperCase().slice(0,1);}
function checkCruci(){
  state.cruciChecked=true;
  const grid=state.cruciGrid||[];
  const ok=grid.length&&grid.every((row,r)=>row.every((cell,c)=>!cell||(state.cruciAnswers[`${r}_${c}`]||'').toUpperCase()===cell.letter));
  if(ok){state.stars+=5;saveStudentData();showCat(state.activeStudent?.name,5);}
  render();
}
async function genTrivia(){state.loadingTrivia=true;state.triviaItems=[];state.triviaAnswers={};state.triviaChecked=false;render();
const TRIVIA_TEMAS=[['animales salvajes','plantas y flores','océano y peces'],['espacio y planetas','estrellas y cometas','astronomía'],['cuerpo humano','alimentación saludable','los sentidos'],['dinosaurios','animales prehistóricos','fósiles'],['inventos y tecnología','científicos famosos','descubrimientos'],['geografía','países y capitales','ríos y montañas'],['deportes','juegos olímpicos','récords mundiales'],['arte y música','pintores famosos','instrumentos musicales'],['historia','civilizaciones antiguas','personajes históricos'],['curiosidades del mundo','récords raros','datos sorprendentes']];
const temas=TRIVIA_TEMAS[Math.floor(Math.random()*TRIVIA_TEMAS.length)];
const seed=Math.floor(Math.random()*9000)+1000;
const r=await ai([{role:'user',content:`Generá 5 preguntas de trivia DISTINTAS para niños de 8 años sobre estos temas: ${temas.join(', ')}. Semilla de variedad: ${seed}. JSON SOLO:\n[{"q":"¿Cuántas patas tiene una araña?","opts":["4","6","8","10"],"correct":2}]`}],'Return ONLY valid JSON array. Never repeat the same questions.',600);
try{state.triviaItems=JSON.parse(r.replace(/```json|```/g,'').trim()).slice(0,5);}catch{state.triviaItems=[{q:'¿Cuántas patas tiene una araña?',opts:['4','6','8','10'],correct:2}];}
state.loadingTrivia=false;render();}

function setTrivia(i,j){if(state.triviaChecked)return;state.triviaAnswers={...state.triviaAnswers,[i]:j};render();}
async function checkTrivia(){state.triviaChecked=true;render();const score=state.triviaItems.filter((it,i)=>state.triviaAnswers[i]===it.correct).length;if(score>=Math.ceil(state.triviaItems.length*.6)){state.stars+=score;await saveStudentData();showCat(state.activeStudent?.name,score);}}

const MEM_E=['🐱','🐶','🦊','🐸','🦁','🐼','🦋','🐬','🌈','🍕','⭐','🎈'];
function initMem(){const pairs=MEM_E.slice(0,8);const cards=[...pairs,...pairs].map((emoji,i)=>({emoji,pair:pairs.indexOf(emoji),id:i}));for(let i=cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}state.memCards=cards;state.memFlipped=[];state.memMatched=[];state.memMoves=0;state.memWon=false;render();}
function flipCard(i){if(state.memFlipped.length>=2||state.memFlipped.includes(i)||state.memMatched.includes(state.memCards[i].pair))return;state.memFlipped=[...state.memFlipped,i];if(state.memFlipped.length===2){state.memMoves++;const[a,b]=state.memFlipped;if(state.memCards[a].pair===state.memCards[b].pair){state.memMatched=[...state.memMatched,state.memCards[a].pair];state.memFlipped=[];if(state.memMatched.length===8){state.memWon=true;state.stars+=3;saveStudentData();setTimeout(()=>showCat(state.activeStudent?.name,3),300);}render();}else{render();setTimeout(()=>{state.memFlipped=[];render();},1000);}}else render();}

async function genHang(){state.hangLoading=true;state.hangWord='';state.hangHint='';state.hangGuessed=[];state.hangWon=false;state.hangLost=false;render();
const r=await ai([{role:'user',content:'UNA palabra en español para ahorcado, nivel primaria. JSON SOLO:\n{"word":"mariposa","hint":"animal que vuela y tiene alas de colores"}'}],'Return ONLY valid JSON. Palabra simple 4-10 letras sin tildes.',300);
try{const d=JSON.parse(r.replace(/```json|```/g,'').trim());state.hangWord=(d.word||'gato').toLowerCase().replace(/[áéíóú]/g,c=>({á:'a',é:'e',í:'i',ó:'o',ú:'u'}[c]));state.hangHint=d.hint||'Adiviná la palabra';}catch{state.hangWord='dinosaurio';state.hangHint='Animal prehistórico gigante';}
state.hangLoading=false;render();}

function guessLetter(l){if(state.hangWon||state.hangLost||state.hangGuessed.includes(l))return;state.hangGuessed=[...state.hangGuessed,l];const errors=state.hangGuessed.filter(x=>!state.hangWord.includes(x)).length;const won=state.hangWord.split('').every(c=>c===' '||state.hangGuessed.includes(c));if(won){state.hangWon=true;state.stars+=3;saveStudentData();setTimeout(()=>showCat(state.activeStudent?.name,3),300);}if(errors>=6)state.hangLost=true;render();}

async function genPrint(tipo){state.loadingPrint=true;state.printContent='';render();
const prompts={sopalet:'Creá una sopa de letras 8x8 para niños de 8 años. 6 palabras de animales. Mostrá la grilla y la lista de palabras a buscar.',crucigrama:'Mini crucigrama 4 palabras para niños de 8 años. Pistas numeradas y esquema vacío.',colorear:'Escena para colorear para niño de 8 años: jardín mágico con hadas y animales. Colores sugeridos para cada elemento.',laberinto:'Laberinto ASCII 12x12 para niños. # = pared, E = entrada, S = salida. Con solución posible.',unirpuntos:'Unir puntos 1 al 15 para dibujar un animal. Describí el animal y coordenadas en grilla imaginaria.',completar:'8 frases para completar sobre naturaleza para niños de 8 años. Espacio _____ en cada una. Banco de palabras al final.'};
const r=await ai([{role:'user',content:prompts[tipo]}],`Maestra creativa para ${gradeStr()}. Actividad imprimible. Español con emojis.`,900);
state.printContent=r;state.loadingPrint=false;render();}

function printActivity(){const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial;max-width:700px;margin:30px auto;font-size:14px;line-height:1.8}.act{background:rgba(236,72,153,.1);border:2px solid #F9A8D4;border-radius:10px;padding:16px;white-space:pre-wrap}button{background:#EC4899;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;margin-top:14px}@media print{button{display:none}}</style></head><body><h1 style="color:#9D174D">🖨️ Mi actividad para imprimir</h1><div class="act">${state.printContent}</div><button onclick="window.print()">🖨️ Imprimir</button></body></html>`;try{const bl=new Blob([html],{type:'text/html;charset=utf-8'});if(!window.open(URL.createObjectURL(bl),'_blank'))alert('Permitir ventanas emergentes.');}catch{alert('Error.');}}

async function genResumen(tipo){
  state.loadingResume=true;state.resumeResult='';render();
  const pStu=state.pStudent||state.students[0]?.id;
  const stu=state.students.find(s=>s.id===pStu);
  const sv=document.getElementById('resSubj')?.value||'all';
  const rF=document.getElementById('resFrom')?.value||'';
  const rT=document.getElementById('resTo')?.value||'';
  const fil=its=>!rF&&!rT?its:its.filter(it=>{const d=it.isoDate||null;if(!d)return true;if(rF&&d<rF)return false;if(rT&&d>rT)return false;return true;});
  const subs=sv==='all'?SUBJS:SUBJS.filter(s=>s.id===sv);
  const tp=stu?subs.map(s=>`${s.n}: ${fil(stu.topics[s.id]||[]).map(t=>t.title).join(', ')||'Sin temas'}`).join('\n'):'Sin datos';
  const tk=stu?subs.map(s=>`${s.n}: ${fil(stu.tasks[s.id]||[]).map(t=>t.title).join(', ')||'Sin tareas'}`).join('\n'):'Sin datos';
  const rng=rF||rT?` (${rF?fmtD(rF):'inicio'} al ${rT?fmtD(rT):'hoy'})`:'';
  const r=await ai([{role:'user',content:`${tipo==='examen'?'Examen':'Resumen'} trimestral${rng} para ${stu?.name||'alumno'}.\nTemas:\n${tp}\nTareas:\n${tk}`}],
  `Maestra. ${tipo==='examen'?'Examen 6-8 preguntas variadas con respuestas al final.':'Resumen por materia: temas cubiertos, conceptos clave, áreas a repasar.'} Con emojis.`,1500);
  state.resumeResult=r;state.loadingResume=false;render();}

// ── EXPORT / IMPORT ────────────────────────────────────
function exportData(){
  const data={version:2,exportDate:new Date().toISOString(),parentPin:state.parentPin,students:state.students,calendar:state.calendar};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');
  a.href=url;a.download=`miAula_${new Date().toLocaleDateString('es-AR').replace(/\//g,'-')}.json`;
  document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
  const t=document.createElement('div');t.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#059669,#10B981);color:white;padding:12px 24px;border-radius:50px;font-family:Nunito,sans-serif;font-weight:800;font-size:14px;z-index:99999';
  t.textContent='✅ ¡Datos exportados!';document.body.appendChild(t);setTimeout(()=>t.remove(),3000);}

async function importData(inp){const f=inp.files[0];if(!f)return;inp.value='';
  try{const data=JSON.parse(await f.text());
  if(!data.students&&!data.topics){alert('❌ Archivo no válido.');return;}
  const ok=confirm(`¿Importar datos exportados el ${new Date(data.exportDate).toLocaleDateString('es-AR')}?\nEsto reemplazará todos los datos actuales.`);
  if(!ok)return;
  if(data.version===2){state.students=data.students||[];state.calendar=data.calendar||[];state.parentPin=data.parentPin||state.parentPin;}
  else{// compatibilidad v1
    const s={...newStudent(),name:data.studentName||'Alumno',topics:{...ET(),...data.topics},tasks:{...ET(),...data.tasks},stars:data.stars||0};
    state.students=[s];state.calendar=data.calendar||[];state.parentPin=data.parentPin||state.parentPin;}
  state.activeStudent=null;state.topics=ET();state.tasks=ET();state.stars=0;
  await Promise.all([ss('edu_students',state.students),ss('edu_cal',state.calendar),ss('edu_pin',state.parentPin)]);
  render();const t=document.createElement('div');t.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#7C3AED,#A855F7);color:white;padding:12px 24px;border-radius:50px;font-family:Nunito,sans-serif;font-weight:800;font-size:14px;z-index:99999';
  t.textContent='✅ ¡Datos importados!';document.body.appendChild(t);setTimeout(()=>t.remove(),3500);
  }catch{alert('❌ Error al leer el archivo.');}}

// ── INIT ───────────────────────────────────────────────
async function init(){
  const[sts,cl,pp]=await Promise.all([sg('edu_students',[]),sg('edu_cal',[]),sg('edu_pin',PIN0)]);
  // Migración de datos v1 → v2
  if(!sts.length){const[tp,tk,sn,st]=await Promise.all([sg('edu_topics',null),sg('edu_tasks',null),sg('edu_name',''),sg('edu_stars',0)]);
  if(tp&&sn){const s={...newStudent(),name:sn||'Mi alumno',topics:{...ET(),...tp},tasks:{...ET(),...tk},stars:st||0};state.students=[s];await ss('edu_students',state.students);}
  else state.students=[];}
  else state.students=sts;
  state.calendar=cl;state.parentPin=pp;
  render();}
init();


