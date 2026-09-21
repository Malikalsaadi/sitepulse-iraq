(()=>{
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const uid=()=>Math.random().toString(36).slice(2,9);
let lang='en';
let certifications=[];
let languages=[];
let experiences=[];

const DUTIES={
  piping:[
    'Supervise piping fabrication, erection, installation and field activities in accordance with approved drawings and specifications.',
    'Review P&IDs, piping isometrics, GA drawings, line lists and construction work packs before execution.',
    'Coordinate line checking, punch-list clearance, hydrotesting, flushing, reinstatement and system handover.',
    'Verify valves, piping supports, tie-ins, flange management, bolting and gasket installation.',
    'Plan daily work fronts, manpower allocation, material availability and progress reporting.',
    'Coordinate welding, WPS/WQT, NDT, QA/QC inspections and RFIs with the inspection team.',
    'Ensure PTW, JSA/RA, toolbox talks, SIMOPS controls and site HSE requirements are followed.',
    'Support mechanical completion, pre-commissioning and commissioning walkdowns.'
  ],
  commissioning:[
    'Perform system walkdowns and verify mechanical completion status against P&IDs and approved check sheets.',
    'Coordinate punch-list close-out, reinstatement, flushing, cleaning, leak testing and readiness for commissioning.',
    'Verify valves, equipment, piping, supports and flange joints before energization or startup.',
    'Coordinate with Operations, QA/QC, Electrical and Instrument teams during commissioning activities.',
    'Review commissioning procedures, test packs, handover dossiers and system boundaries.',
    'Troubleshoot mechanical issues during startup and support safe return to service.'
  ],
  welding:[
    'Review WPS, PQR and welder qualifications in accordance with applicable codes and project specifications.',
    'Perform fit-up, visual and final welding inspections and verify weld traceability.',
    'Coordinate and review NDT activities including RT, UT, PT and MT.',
    'Monitor welding consumables, preheat, interpass temperature and repair activities.',
    'Prepare inspection records, RFIs, NCRs, weld maps and quality documentation.'
  ],
  mechanical:[
    'Supervise mechanical installation, inspection, maintenance and commissioning activities.',
    'Perform equipment walkdowns and verify alignment, supports, bolting and mechanical condition.',
    'Coordinate troubleshooting, corrective maintenance and return-to-service activities.',
    'Plan manpower, tools, materials and daily work fronts while maintaining HSE compliance.',
    'Coordinate with Operations, Electrical, Instrument and QA/QC teams for safe execution.'
  ],
  hvac:[
    'Inspect and troubleshoot packaged HVAC units, compressors, fans, belts, filters and refrigeration circuits.',
    'Check operating pressures, temperatures, airflow, superheat and equipment alarms.',
    'Coordinate preventive and corrective maintenance and verify safe restart after intervention.',
    'Inspect mechanical components for vibration, overheating, refrigerant issues and airflow restrictions.',
    'Record findings, maintenance actions and equipment status for handover to Operations.'
  ],
  qaqc:[
    'Implement approved ITPs, project specifications and applicable codes during site inspections.',
    'Raise and close RFIs, punch items, observations and NCRs with complete inspection records.',
    'Review material certificates, calibration records, test reports and turnover documentation.',
    'Coordinate inspections with construction teams, client representatives and third-party inspectors.',
    'Maintain traceability and quality records through construction, testing and handover.'
  ],
  general:[
    'Supervise daily site activities and coordinate manpower, materials and work fronts.',
    'Monitor progress against the approved plan and report constraints, priorities and completed work.',
    'Coordinate with multidisciplinary teams to resolve technical and site issues.',
    'Ensure PTW, risk assessment, toolbox talks and HSE requirements are followed.',
    'Support inspections, punch-list close-out and handover documentation.'
  ]
};

function val(id){return $(id)?.value.trim()||''}
function notice(id,text,error=false){const el=$(id);if(!el)return;el.textContent=text;el.style.display='block';el.style.borderColor=error?'#8a3838':''}
function lines(s){return String(s||'').split(/\n+/).map(x=>x.trim()).filter(Boolean)}
function section(title,html){return html?'<section><h2>'+esc(title)+'</h2>'+html+'</section>':''}
function newExperience(data={}){
  return {
    id:data.id||uid(), role:data.role||'', company:data.company||'', project:data.project||'',
    from:data.from||'', to:data.to||'', current:!!data.current, duties:Array.isArray(data.duties)?data.duties.filter(Boolean):[]
  };
}
experiences=[newExperience()];

function suggestionSet(role){
  const r=String(role||'').toLowerCase();
  if(/piping|pipe|pvv/.test(r))return DUTIES.piping;
  if(/commission|pre.?commission|csu/.test(r))return DUTIES.commissioning;
  if(/weld|welding inspector/.test(r))return DUTIES.welding;
  if(/hvac|air.?condition|refriger/.test(r))return DUTIES.hvac;
  if(/qa.?qc|quality|inspector/.test(r))return DUTIES.qaqc;
  if(/mechanical|technician|maintenance/.test(r))return DUTIES.mechanical;
  return DUTIES.general;
}

function renderExperiences(){
  $('experienceList').innerHTML=experiences.map((e,i)=>{
    const suggestions=suggestionSet(e.role).filter(x=>!e.duties.includes(x)).slice(0,6);
    return '<div class="exp-card" data-eid="'+e.id+'">'+
      '<div class="exp-head"><strong>Experience '+(i+1)+' / الخبرة '+(i+1)+'</strong>'+
      (experiences.length>1?'<button type="button" class="remove-btn" data-action="remove-exp">Remove</button>':'')+'</div>'+
      '<div class="exp-grid">'+
        '<label>Job title / المسمى<input data-field="role" value="'+esc(e.role)+'" placeholder="Piping Supervisor"></label>'+
        '<label>Company / الشركة<input data-field="company" value="'+esc(e.company)+'" placeholder="Company name"></label>'+
        '<label class="full">Project / المشروع<input data-field="project" value="'+esc(e.project)+'" placeholder="Project / Client / Location"></label>'+
        '<label>From / من<input data-field="from" type="month" value="'+esc(e.from)+'"></label>'+
        '<label>To / إلى<input data-field="to" type="month" value="'+esc(e.to)+'" '+(e.current?'disabled':'')+'></label>'+
        '<label class="full"><input data-field="current" type="checkbox" '+(e.current?'checked':'')+' style="width:auto;margin-right:6px"> Present / مستمر حالياً</label>'+
      '</div>'+
      '<div class="exp-duties"><b style="font-size:12px">Duties & achievements / الواجبات والإنجازات</b>'+
        '<div class="duty-list">'+(e.duties.length?e.duties.map((d,di)=>'<div class="duty-row"><span>'+esc(d)+'</span><button type="button" class="remove-btn" data-action="remove-duty" data-duty="'+di+'">×</button></div>').join(''):'<small>No duties added yet.</small>')+'</div>'+
        '<div class="duty-add"><input data-duty-input placeholder="Type a duty and press Enter"><button type="button" data-action="add-duty">Add</button></div>'+
        '<div class="suggestion-title">Suggested duties based on job title / واجبات مقترحة حسب المسمى</div>'+
        '<div class="suggestions">'+suggestions.map((s,si)=>'<button type="button" data-action="suggest-duty" data-suggestion="'+si+'">'+esc(s)+'</button>').join('')+'</div>'+
        '<button type="button" class="secondary" data-action="ai-duties" style="margin-top:10px">✨ AI suggest duties</button>'+
      '</div></div>';
  }).join('');
}

function addCertification(){
  const input=$('certInput'); const text=input.value.trim(); if(!text)return;
  certifications.push(text); input.value=''; renderCerts(); input.focus(); buildPreview();
}
function renderCerts(){
  $('certList').innerHTML=certifications.map((c,i)=>'<div class="sas-entry-row"><input data-cert="'+i+'" value="'+esc(c)+'"><button type="button" class="remove-btn" data-remove-cert="'+i+'">×</button></div>').join('');
}

function addLanguage(){
  const name=val('languageInput'); if(!name)return;
  languages.push({language:name,level:$('languageLevel').value}); $('languageInput').value=''; renderLanguages(); $('languageInput').focus(); buildPreview();
}
function renderLanguages(){
  $('languageList').innerHTML=languages.map((l,i)=>'<div class="sas-entry-row"><div class="exp-grid" style="width:100%"><input data-lang-name="'+i+'" value="'+esc(l.language)+'"><select data-lang-level="'+i+'">'+
    ['Native','Fluent','Professional','Intermediate','Basic'].map(v=>'<option '+(l.level===v?'selected':'')+' value="'+v+'">'+v+'</option>').join('')+
    '</select></div><button type="button" class="remove-btn" data-remove-lang="'+i+'">×</button></div>').join('');
}

function gatherData(){
  return {
    name:val('cvName'),title:val('cvTitle'),email:val('cvEmail'),phone:val('cvPhone'),
    location:val('cvLocation'),linkedin:val('cvLinkedin'),summary:val('cvSummary'),
    experience:experiences.map(e=>({...e,duties:e.duties.filter(Boolean)})).filter(e=>e.role||e.company||e.project||e.duties.length),
    education:lines(val('cvEducation')),
    certifications:certifications.filter(Boolean),
    skills:lines(val('cvSkills').replace(/,/g,'\n')),
    languages:languages.filter(x=>x.language)
  };
}

function experienceHtml(exp){
  return exp.map(e=>{
    const dates=[e.from,e.current?'Present':e.to].filter(Boolean).join(' – ');
    const meta=[e.company,e.project,dates].filter(Boolean).map(esc).join(' • ');
    return '<div class="cv-exp"><div class="cv-exp-top"><h3>'+esc(e.role||'Role')+'</h3><span class="cv-exp-meta">'+esc(dates)+'</span></div>'+
      (meta?'<div class="cv-exp-meta">'+meta+'</div>':'')+
      (e.duties?.length?'<ul>'+e.duties.map(d=>'<li>'+esc(d)+'</li>').join('')+'</ul>':'')+'</div>';
  }).join('');
}

function buildPreview(data=gatherData()){
  const contact=[data.email,data.phone,data.location,data.linkedin].filter(Boolean).map(esc).join(' • ');
  const skills=(data.skills||[]).map(x=>'<span class="sas-skill">'+esc(x)+'</span>').join('');
  const certs=(data.certifications||[]).map(x=>'<li>'+esc(x)+'</li>').join('');
  const education=(data.education||[]).map(x=>'<li>'+esc(x)+'</li>').join('');
  const langs=(data.languages||[]).map(x=>'<div><b>'+esc(x.language)+'</b> — '+esc(x.level||'')+'</div>').join('');
  $('cvPreview').innerHTML=
    '<header><h1>'+esc(data.name||'Your Name')+'</h1><div class="headline">'+esc(data.title||'Professional Title')+'</div>'+
    '<div class="contact">'+(contact||'email • phone • location • LinkedIn')+'</div></header>'+
    section(lang==='ar'?'الملخص المهني':'Professional Summary',data.summary?'<p>'+esc(data.summary)+'</p>':'')+
    section(lang==='ar'?'الخبرة المهنية':'Professional Experience',experienceHtml(data.experience||[]))+
    section(lang==='ar'?'التعليم':'Education',education?'<ul>'+education+'</ul>':'')+
    section(lang==='ar'?'الشهادات':'Certifications',certs?'<ul>'+certs+'</ul>':'')+
    section(lang==='ar'?'المهارات':'Core Skills',skills?'<div class="sas-pill-list">'+skills+'</div>':'')+
    section(lang==='ar'?'اللغات':'Languages',langs?'<div class="lang-list">'+langs+'</div>':'');
  return data;
}

function sourceText(){
  const d=gatherData();
  return [
    val('importedText'),'Professional Summary',d.summary,'Professional Experience',
    ...d.experience.flatMap(e=>[e.role,e.company,e.project,e.from,e.to,...e.duties]),
    'Education',...d.education,'Certifications',...d.certifications,'Skills',...d.skills,
    'Languages',...d.languages.map(x=>x.language+' '+x.level),
    d.email,d.phone,d.location,d.linkedin
  ].filter(Boolean).join('\n');
}

function keywordSet(s){return new Set(String(s||'').toLowerCase().match(/[a-z][a-z0-9+.#/-]{2,}|[\u0600-\u06ff]{3,}/g)||[])}
function runAts(){
  const text=sourceText(); if(!text.trim())return notice('aiStatus','Add CV information first.',true);
  let score=100;const checks=[];const add=(ok,title,detail,penalty=0)=>{if(!ok)score-=penalty;checks.push({ok,title,detail})};
  const words=text.split(/\s+/).filter(Boolean).length;
  add(words>=250&&words<=1400,'Length',words+' words. '+(words<250?'Add more relevant professional detail.':words>1400?'Consider shortening the CV.':'Good working range.'),words<250?12:words>1400?8:0);
  add(/@/.test(text),'Email','Include a visible professional email.',8);
  add(/\+?\d[\d\s()-]{7,}/.test(text),'Phone','Include a parseable phone number.',6);
  const d=gatherData();
  add(d.experience.length>0,'Experience','At least one structured experience entry is recommended.',12);
  add(d.certifications.length>0,'Certifications','Certifications are separated and ATS-readable.',4);
  add(d.skills.length>=5,'Skills','Use a focused technical skills section.',6);
  add(d.languages.length>0,'Languages','Languages are structured clearly.',2);
  const jd=val('jobDescription');
  if(jd){
    const cv=keywordSet(text), job=keywordSet(jd);
    const stop=new Set(['the','and','with','for','this','that','from','your','you','are','our','have','will','job','role','work','all','into','who','requirements','responsibilities']);
    const keys=[...job].filter(k=>!stop.has(k)&&k.length>3);
    const hits=keys.filter(k=>cv.has(k));
    const match=Math.round(Math.min(100,(keys.length?hits.length/keys.length:0)*175));
    add(match>=45,'Job keyword match','Estimated keyword overlap: '+match+'%. AI generation can improve relevant wording without inventing experience.',match>=45?0:12);
  }else checks.push({ok:true,title:'Job targeting',detail:'Paste a job description for keyword targeting.'});
  score=Math.max(0,Math.min(100,score));$('atsScore').textContent=score;
  $('atsResults').innerHTML=checks.map(c=>'<div class="sas-check '+(c.ok?'good':'warn')+'"><b>'+(c.ok?'✓ ':'⚠ ')+esc(c.title)+'</b><span class="muted">'+esc(c.detail)+'</span></div>').join('');
}

async function readPdf(file){
  const pdfjs=await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
  const pdf=await pdfjs.getDocument({data:await file.arrayBuffer()}).promise;let out='';
  for(let i=1;i<=Math.min(pdf.numPages,20);i++){const p=await pdf.getPage(i);const c=await p.getTextContent();out+=c.items.map(x=>x.str).join(' ')+'\n'}
  return out.trim();
}
async function readDocx(file){if(!window.mammoth)throw new Error('DOCX reader did not load.');return (await window.mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()})).value.trim()}
async function readFile(){
  const file=$('cvFile').files[0];if(!file)return notice('fileStatus','Choose a PDF, DOCX or TXT file first.',true);
  notice('fileStatus','Reading '+file.name+' ...');
  try{
    const lower=file.name.toLowerCase();let text=lower.endsWith('.pdf')?await readPdf(file):lower.endsWith('.docx')?await readDocx(file):await file.text();
    if(!text)throw new Error('No readable text was extracted. Image-only PDFs need OCR.');
    $('importedText').value=text;notice('fileStatus','CV text extracted ✓ You can now Generate CV with AI.');
    runAts();
  }catch(e){notice('fileStatus','Could not read this file: '+e.message,true)}
}

function applyAiCv(cv){
  if(cv.name)$('cvName').value=cv.name;if(cv.title)$('cvTitle').value=cv.title;if(cv.email)$('cvEmail').value=cv.email;
  if(cv.phone)$('cvPhone').value=cv.phone;if(cv.location)$('cvLocation').value=cv.location;if(cv.linkedin)$('cvLinkedin').value=cv.linkedin;
  if(cv.summary)$('cvSummary').value=cv.summary;
  if(Array.isArray(cv.education))$('cvEducation').value=cv.education.join('\n');
  if(Array.isArray(cv.skills))$('cvSkills').value=cv.skills.join(', ');
  if(Array.isArray(cv.certifications))certifications=cv.certifications.filter(Boolean);
  if(Array.isArray(cv.languages))languages=cv.languages.map(x=>typeof x==='string'?{language:x,level:''}:x).filter(x=>x.language);
  if(Array.isArray(cv.experience)&&cv.experience.length)experiences=cv.experience.map(x=>newExperience(x));
  renderCerts();renderLanguages();renderExperiences();buildPreview();runAts();
}

async function generateCv(){
  const payload={action:'generate_cv',imported_text:val('importedText').slice(0,18000),target_job:val('jobDescription').slice(0,9000),fields:gatherData()};
  if(!payload.imported_text && !payload.fields.name && !payload.fields.experience.length)return notice('aiStatus','Add your information or upload an old CV first.',true);
  $('generateCv').disabled=true;notice('aiStatus','AI is writing and organizing your professional CV...');
  try{
    const r=await fetch('/api/cv-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'AI service is not configured yet.');
    applyAiCv(data.cv||{});notice('aiStatus','Professional CV generated with AI ✓ Review the wording, then save as PDF.');
  }catch(e){buildPreview();notice('aiStatus',e.message+' A non-AI preview is still available.',true)}
  finally{$('generateCv').disabled=false}
}

async function aiSuggestDuties(eid){
  const e=experiences.find(x=>x.id===eid);if(!e||!e.role)return notice('aiStatus','Enter a job title first.',true);
  notice('aiStatus','AI is suggesting duties for '+e.role+'...');
  try{
    const r=await fetch('/api/cv-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'suggest_duties',role:e.role,company:e.company,project:e.project,existing:e.duties})});
    const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'AI service unavailable.');
    const added=(data.duties||[]).filter(x=>x&&!e.duties.includes(x));e.duties.push(...added);renderExperiences();buildPreview();notice('aiStatus','AI duty suggestions added ✓');
  }catch(err){notice('aiStatus',err.message+' Local duty suggestions are still available above.',true)}
}

function copyText(){
  const d=gatherData();const out=[d.name,d.title,[d.email,d.phone,d.location,d.linkedin].filter(Boolean).join(' | '),'','PROFESSIONAL SUMMARY',d.summary,'','PROFESSIONAL EXPERIENCE'];
  d.experience.forEach(e=>{out.push(e.role,[e.company,e.project,[e.from,e.current?'Present':e.to].filter(Boolean).join(' - ')].filter(Boolean).join(' | '),...e.duties.map(x=>'• '+x),'')});
  out.push('EDUCATION',...d.education,'','CERTIFICATIONS',...d.certifications.map(x=>'• '+x),'','CORE SKILLS',d.skills.join(', '),'','LANGUAGES',...d.languages.map(x=>x.language+' - '+x.level));
  navigator.clipboard.writeText(out.join('\n')).then(()=>notice('aiStatus','CV text copied ✓')).catch(()=>{});
}

$('experienceList').addEventListener('input',e=>{
  const card=e.target.closest('.exp-card');if(!card)return;const exp=experiences.find(x=>x.id===card.dataset.eid);if(!exp)return;
  const f=e.target.dataset.field;if(f&&f!=='current'){exp[f]=e.target.value;if(f==='role')renderExperiences();else buildPreview()}
});
$('experienceList').addEventListener('change',e=>{
  const card=e.target.closest('.exp-card');if(!card)return;const exp=experiences.find(x=>x.id===card.dataset.eid);if(!exp)return;
  if(e.target.dataset.field==='current'){exp.current=e.target.checked;if(exp.current)exp.to='';renderExperiences();buildPreview()}
});
$('experienceList').addEventListener('keydown',e=>{
  if(e.key!=='Enter'||!e.target.matches('[data-duty-input]'))return;e.preventDefault();
  const card=e.target.closest('.exp-card');const exp=experiences.find(x=>x.id===card.dataset.eid);const text=e.target.value.trim();
  if(text){exp.duties.push(text);renderExperiences();buildPreview()}
});
$('experienceList').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;const card=b.closest('.exp-card');if(!card)return;const exp=experiences.find(x=>x.id===card.dataset.eid);if(!exp)return;
  const a=b.dataset.action;
  if(a==='remove-exp'){experiences=experiences.filter(x=>x.id!==exp.id);renderExperiences();buildPreview()}
  if(a==='remove-duty'){exp.duties.splice(Number(b.dataset.duty),1);renderExperiences();buildPreview()}
  if(a==='add-duty'){const input=card.querySelector('[data-duty-input]');const text=input.value.trim();if(text){exp.duties.push(text);renderExperiences();buildPreview()}}
  if(a==='suggest-duty'){const suggestions=suggestionSet(exp.role).filter(x=>!exp.duties.includes(x));const s=suggestions[Number(b.dataset.suggestion)];if(s){exp.duties.push(s);renderExperiences();buildPreview()}}
  if(a==='ai-duties')aiSuggestDuties(exp.id);
});

$('certList').addEventListener('input',e=>{if(e.target.dataset.cert!==undefined){certifications[Number(e.target.dataset.cert)]=e.target.value;buildPreview()}});
$('certList').addEventListener('click',e=>{const b=e.target.closest('[data-remove-cert]');if(!b)return;certifications.splice(Number(b.dataset.removeCert),1);renderCerts();buildPreview()});
$('languageList').addEventListener('input',e=>{if(e.target.dataset.langName!==undefined){languages[Number(e.target.dataset.langName)].language=e.target.value;buildPreview()}});
$('languageList').addEventListener('change',e=>{if(e.target.dataset.langLevel!==undefined){languages[Number(e.target.dataset.langLevel)].level=e.target.value;buildPreview()}});
$('languageList').addEventListener('click',e=>{const b=e.target.closest('[data-remove-lang]');if(!b)return;languages.splice(Number(b.dataset.removeLang),1);renderLanguages();buildPreview()});

$('addExperience').onclick=()=>{experiences.push(newExperience());renderExperiences();setTimeout(()=>$('experienceList').lastElementChild?.querySelector('[data-field="role"]')?.focus(),0)};
$('addCert').onclick=addCertification;$('certInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addCertification()}});
$('addLanguage').onclick=addLanguage;$('languageInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addLanguage()}});
$('readCv').onclick=readFile;$('clearImported').onclick=()=>{$('importedText').value='';$('cvFile').value='';$('fileStatus').style.display='none'};
$('buildCv').onclick=()=>{buildPreview();runAts()};$('generateCv').onclick=generateCv;$('runAts').onclick=runAts;
$('printCv').onclick=()=>{buildPreview();window.print()};$('copyCv').onclick=copyText;
$('sasLang').onclick=()=>{lang=lang==='en'?'ar':'en';document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';$('sasLang').textContent=lang==='en'?'العربية':'English';buildPreview()};
['cvName','cvTitle','cvEmail','cvPhone','cvLocation','cvLinkedin','cvSummary','cvEducation','cvSkills','jobDescription'].forEach(id=>$(id).addEventListener('input',()=>{clearTimeout(window.__sasTimer);window.__sasTimer=setTimeout(buildPreview,180)}));

renderExperiences();renderCerts();renderLanguages();buildPreview();
})();