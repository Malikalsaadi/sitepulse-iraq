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

function updateDutySuggestions(exp,card){
  const box=card?.querySelector('.suggestions'); if(!box)return;
  const suggestions=suggestionSet(exp.role).filter(x=>!exp.duties.includes(x)).slice(0,6);
  box.innerHTML=suggestions.map((s,si)=>'<button type="button" data-action="suggest-duty" data-suggestion="'+si+'">'+esc(s)+'</button>').join('');
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

let atsTimer=null;
function scheduleAts(){
  clearTimeout(atsTimer);
  atsTimer=setTimeout(runAts,180);
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
  scheduleAts();
  return data;
}

function structuredCvText(d=gatherData()){
  return [
    d.name,d.title,d.email,d.phone,d.location,d.linkedin,
    'Professional Summary',d.summary,
    'Professional Experience',
    ...d.experience.flatMap(e=>[e.role,e.company,e.project,e.from,e.current?'Present':e.to,...e.duties]),
    'Education',...d.education,
    'Certifications',...d.certifications,
    'Skills',...d.skills,
    'Languages',...d.languages.map(x=>x.language+' '+x.level)
  ].filter(Boolean).join('\n');
}

function sourceText(){
  const d=gatherData();
  const structured=structuredCvText(d).trim();
  const hasStructured=!!(d.name||d.title||d.summary||d.experience.length||d.education.length||d.certifications.length||d.skills.length||d.languages.length);
  return hasStructured?structured:val('importedText');
}

function keywordSet(s){return new Set(String(s||'').toLowerCase().match(/[a-z][a-z0-9+.#/-]{2,}|[\u0600-\u06ff]{3,}/g)||[])}
function runAts(){
  const d=gatherData();
  const imported=val('importedText').trim();
  const structured=structuredCvText(d).trim();
  const hasStructured=!!(
    d.name||d.title||d.summary||d.experience.length||d.education.length||
    d.certifications.length||d.skills.length||d.languages.length
  );
  const text=(hasStructured?structured:imported).trim();

  if(!text){
    $('atsScore').textContent='—';
    $('atsResults').innerHTML='<p class="muted">Start filling the CV or upload an old CV to see a live ATS score.</p>';
    return;
  }

  let score=0;
  const checks=[];
  const add=(earned,max,title,detail)=>{
    const safe=Math.max(0,Math.min(max,earned));
    score+=safe;
    checks.push({ok:safe>=max*.7,title,detail,points:Math.round(safe)+'/'+max});
  };

  const words=text.split(/\s+/).filter(Boolean).length;
  const lower=text.toLowerCase();

  if(!hasStructured){
    const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim();
    const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
    const unique=(arr)=>[...new Set(arr.map(x=>norm(x)).filter(Boolean))];

    const emailMatches=text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig)||[];
    const phoneMatches=text.match(/\+?\d[\d\s().-]{7,}\d/g)||[];
    const linkedinMatches=text.match(/linkedin\.com\/in\/[A-Za-z0-9_-]+/ig)||[];
    const locationHit=/\b(basra|baghdad|iraq|dubai|abu dhabi|doha|qatar|kuwait|saudi|riyadh|oman|muscat|البصرة|بغداد|العراق)\b/i.test(text);
    let contact=0;
    contact+=emailMatches.length?3.5:0;
    contact+=phoneMatches.length?3:0;
    contact+=locationHit?1.5:0;
    contact+=linkedinMatches.length?2:0;
    add(contact,10,'Contact details',
      Math.round(contact*10)/10+'/10 from email, phone, location and LinkedIn readability.');

    const top=text.slice(0,1400);
    const rolePattern=/\b(supervisor|engineer|inspector|technician|coordinator|manager|specialist|foreman|lead|mechanical|piping|welding|commissioning|qa\/?qc|quality|planner|construction|maintenance)\b/gi;
    const topRoleHits=unique(top.match(rolePattern)||[]).length;
    const titlePts=clamp(topRoleHits*1.7,0,5);
    add(titlePts,5,'Professional title',
      topRoleHits+' distinct role/title keyword(s) detected near the top of the CV.');

    const summaryHeading=/\b(professional summary|summary|profile|career objective|objective|about me)\b/i.test(text);
    const summaryStart=text.search(/\b(professional summary|summary|profile|career objective|objective|about me)\b/i);
    let summaryChunk=summaryStart>=0?text.slice(summaryStart,summaryStart+1600):text.slice(0,1400);
    const summaryWords=summaryChunk.split(/\s+/).filter(Boolean).length;
    let summaryPts=summaryHeading?3:0;
    summaryPts+=clamp(summaryWords/10,0,7);
    if(summaryWords>140)summaryPts-=clamp((summaryWords-140)/35,0,2);
    add(summaryPts,10,'Professional summary',
      (summaryHeading?'Summary/Profile heading found. ':'No dedicated Summary/Profile heading. ')+summaryWords+' nearby words detected.');

    const expHeading=/\b(work experience|professional experience|employment history|experience)\b/i.test(text);
    const dateHits=unique(text.match(/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{4}\b|\b20\d{2}\b/gi)||[]).length;
    const roleHits=unique(text.match(/\b(supervisor|engineer|inspector|technician|coordinator|manager|foreman|lead|specialist)\b/gi)||[]).length;
    const companyMarkers=(text.match(/\b(company|co\.|ltd|llc|spa|s\.p\.a|contractor|client|project)\b/gi)||[]).length;
    let expPts=(expHeading?4:0)
      +clamp(dateHits*0.8,0,6)
      +clamp(roleHits*1.1,0,5)
      +clamp(companyMarkers*0.45,0,5);
    add(expPts,20,'Experience structure',
      dateHits+' distinct date reference(s), '+roleHits+' role title(s), '+companyMarkers+' company/project marker(s).');

    const actionPattern=/\b(supervised|supervise|coordinated|coordinate|inspected|inspect|reviewed|review|performed|perform|managed|manage|led|lead|monitored|monitor|verified|verify|planned|plan|implemented|implement|maintained|maintain|supported|support|troubleshot|troubleshoot|prepared|prepare|ensured|ensure|conducted|conduct|executed|execute|developed|develop|controlled|control|organized|organize|assessed|assess|installed|install|tested|test)\b/gi;
    const actionMatches=text.match(actionPattern)||[];
    const actionUnique=unique(actionMatches).length;
    const bulletLike=(text.match(/[•●▪■►✓✔➤\-]\s+/g)||[]).length;
    const quantified=(text.match(/\b\d+(?:\.\d+)?\s?(?:%|percent|hours?|days?|weeks?|months?|years?|km|m|mm|inch|inches|bar|psi|items?|systems?|lines?|people|manpower|workers?|projects?)\b/gi)||[]).length;
    const dutyPts=
      clamp(actionMatches.length*0.22,0,5)
      +clamp(actionUnique*0.6,0,4)
      +clamp(bulletLike*0.16,0,3)
      +clamp(quantified*0.75,0,3);
    add(dutyPts,15,'Duties & achievements',
      actionMatches.length+' action-verb occurrence(s), '+bulletLike+' bullet marker(s), '+quantified+' quantified result/detail(s).');

    const skillsHeading=/\b(technical skills|core skills|skills|competencies|expertise)\b/i.test(text);
    const techPattern=/\b(piping|commissioning|pre-commissioning|welding|ndt|asme|api|qa\/?qc|hydrotest|hydrotesting|flange|ptw|hse|autocad|mechanical|inspection|construction|maintenance|hvac|rt|ut|pt|mt|wps|pqr|rfi|ncr|itp|turnover|reinstatement|flushing|walkdown|p&id|isometric|simops|jha|jsa)\b/gi;
    const techUnique=unique(text.match(techPattern)||[]);
    let skillsPts=(skillsHeading?2.5:0)+clamp(techUnique.length*0.62,0,7.5);
    add(skillsPts,10,'Technical skills',
      techUnique.length+' distinct technical keyword(s)'+(skillsHeading?' with a dedicated Skills section.':'; add a Skills heading for clearer ATS parsing.'));

    const educationHeading=/\b(education|academic|university|college|bachelor|b\.sc|degree|diploma)\b/i.test(text);
    const certHeading=/\b(certification|certifications|certificate|cswip|asnt|osha|nebosh|api\s*\d|pmp|iosh)\b/i.test(text);
    const degreeHits=unique(text.match(/\b(bachelor|master|degree|diploma|b\.sc|m\.sc|university|college)\b/gi)||[]).length;
    const certHits=unique(text.match(/\b(cswip|asnt|osha|nebosh|pmp|iosh|api\s*\d{3}|level\s*(?:ii|2|iii|3))\b/gi)||[]).length;
    let backgroundPts=(educationHeading?2:0)+clamp(degreeHits*0.8,0,2)+(certHeading?2:0)+clamp(certHits*0.7,0,2);
    add(backgroundPts,8,'Education & certifications',
      degreeHits+' education keyword(s) and '+certHits+' certification keyword(s) detected.');

    const langHeading=/\b(languages|language)\b/i.test(text);
    const langUnique=unique(text.match(/\b(english|arabic|french|german|spanish|turkish|persian|kurdish|العربية|الانجليزية|الإنجليزية)\b/gi)||[]).length;
    const languagePts=clamp((langHeading?1.5:0)+langUnique*1.25,0,4);
    add(languagePts,4,'Languages',
      langUnique+' language(s) recognized'+(langHeading?' in/with a Languages section.':'.'));

    let lengthPts=0;
    if(words<100)lengthPts=words/100*2;
    else if(words<220)lengthPts=2+(words-100)/120*4;
    else if(words<=850)lengthPts=6+Math.min(2,(words-220)/315);
    else if(words<=1200)lengthPts=8-(words-850)/350*2;
    else if(words<=1600)lengthPts=6-(words-1200)/400*3;
    else lengthPts=2;
    add(lengthPts,8,'CV length',words+' words detected. The score changes gradually rather than by fixed buckets.');

    const linesList=text.split(/\n+/).map(x=>norm(x)).filter(x=>x.length>35);
    const duplicateCount=linesList.length-unique(linesList).length;
    let qualityPenalty=clamp(duplicateCount*0.6,0,4);

    const jd=val('jobDescription');
    if(jd){
      const cv=keywordSet(text),job=keywordSet(jd);
      const stop=new Set(['the','and','with','for','this','that','from','your','you','are','our','have','will','job','role','work','all','into','who','requirements','responsibilities','experience','skills']);
      const keys=[...job].filter(k=>!stop.has(k)&&k.length>3);
      const hits=keys.filter(k=>cv.has(k));
      const match=keys.length?hits.length/keys.length:0;
      const keywordPts=clamp(match*16,0,10);
      add(keywordPts,10,'Target-job keywords',
        'Estimated unique keyword overlap with the job description: '+Math.round(match*100)+'%.');
    }else{
      add(4,10,'Target-job keywords','No job description supplied. Add one to earn up to 10 targeted-keyword points.');
    }

    if(qualityPenalty>0){
      score-=qualityPenalty;
      checks.push({ok:false,title:'Duplicate content',detail:duplicateCount+' repeated long line(s) detected; repetition reduces ATS clarity.',points:'-'+Math.round(qualityPenalty)});
    }
  } else {
    const dutyList=d.experience.flatMap(e=>e.duties||[]);
    const uniqueDuties=new Set(dutyList.map(x=>x.toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g,' ').trim()));
    const actionVerb=/^(supervis|coordinat|inspect|review|perform|manage|lead|monitor|verify|plan|implement|maintain|support|troubleshoot|prepare|ensure|conduct|execute|develop|control|organize|assess)/i;
    const strongDuties=dutyList.filter(x=>x.split(/\s+/).length>=7 && actionVerb.test(x.trim())).length;

    let contact=0;
    if(d.email && /@/.test(d.email))contact+=4;
    if(d.phone && /\+?\d[\d\s()-]{7,}/.test(d.phone))contact+=4;
    if(d.location)contact+=2;
    add(contact,10,'Contact details',contact===10?'Email, phone and location are complete.':'Complete email, phone and location for stronger parsing.');

    add(d.title?5:0,5,'Professional title',d.title?'Clear professional title detected.':'Add a clear target professional title.');

    const summaryWords=d.summary.split(/\s+/).filter(Boolean).length;
    let summaryPts=0;
    if(summaryWords>=25)summaryPts=5;
    if(summaryWords>=40&&summaryWords<=120)summaryPts=10;
    else if(summaryWords>120)summaryPts=7;
    add(summaryPts,10,'Professional summary',summaryWords?summaryWords+' words in the summary. Aim for roughly 40–120 focused words.':'Add a concise professional summary.');

    let expPts=0;
    if(d.experience.length)expPts+=6;
    if(d.experience.length){
      const completeness=d.experience.map(e=>{
        let p=0;
        if(e.role)p+=1;
        if(e.company)p+=1;
        if(e.project)p+=.5;
        if(e.from&&(e.to||e.current))p+=1;
        if((e.duties||[]).length>=3)p+=1.5;
        return p/5;
      });
      expPts+=Math.round((completeness.reduce((a,b)=>a+b,0)/completeness.length)*14);
    }
    add(expPts,20,'Experience structure',d.experience.length?d.experience.length+' structured role(s). Include title, company, dates and at least 3 duties per role.':'Add at least one structured experience entry.');

    let dutyPts=0;
    if(dutyList.length>=3)dutyPts=5;
    if(dutyList.length>=6)dutyPts=9;
    if(dutyList.length>=10)dutyPts=11;
    dutyPts+=Math.round((dutyList.length?strongDuties/dutyList.length:0)*4);
    if(uniqueDuties.size<dutyList.length&&dutyList.length)dutyPts=Math.max(0,dutyPts-2);
    add(dutyPts,15,'Duties quality',dutyList.length?dutyList.length+' duties; '+strongDuties+' use strong action-led professional phrasing.':'Add concise responsibility/achievement bullets.');

    add(Math.min(10,Math.round(d.skills.length*1.25)),10,'Technical skills',d.skills.length+' skill(s). Around 8–12 relevant skills is a strong range.');

    let backgroundPts=0;
    if(d.education.length)backgroundPts+=4;
    if(d.certifications.length)backgroundPts+=4;
    add(backgroundPts,8,'Education & certifications',(d.education.length?'Education included. ':'Add education. ')+(d.certifications.length?'Certifications included.':'Add relevant certifications if applicable.'));

    add(d.languages.length?4:0,4,'Languages',d.languages.length?d.languages.length+' language(s) listed with proficiency.':'Add languages and proficiency levels.');

    let lengthPts=0;
    if(words>=250&&words<=1000)lengthPts=8;
    else if(words>=180&&words<250)lengthPts=5;
    else if(words>1000&&words<=1400)lengthPts=5;
    else if(words>=100&&words<180)lengthPts=3;
    add(lengthPts,8,'CV length',words+' words in the current CV content.');

    const jd=val('jobDescription');
    if(jd){
      const cv=keywordSet(text),job=keywordSet(jd);
      const stop=new Set(['the','and','with','for','this','that','from','your','you','are','our','have','will','job','role','work','all','into','who','requirements','responsibilities','experience','skills']);
      const keys=[...job].filter(k=>!stop.has(k)&&k.length>3);
      const hits=keys.filter(k=>cv.has(k));
      const match=keys.length?hits.length/keys.length:0;
      add(Math.round(Math.min(10,match*18)),10,'Target-job keywords','Estimated relevant keyword overlap: '+Math.round(match*100)+'%. Use only keywords supported by your real experience.');
    }else{
      add(5,10,'Target-job keywords','No job description supplied. Paste one to unlock the full 10 points for job targeting.');
    }
  }

  score=Math.max(0,Math.min(100,Math.round(score)));
  $('atsScore').textContent=score;
  const sourceLabel=hasStructured?'Builder CV':'Uploaded CV';
  $('atsResults').innerHTML='<div class="sas-check good"><b>Scoring source</b><span class="muted">'+sourceLabel+' • live score</span></div>'+checks.map(c=>'<div class="sas-check '+(c.ok?'good':'warn')+'"><b>'+(c.ok?'✓ ':'⚠ ')+esc(c.title)+' <span style="float:right">'+esc(c.points)+'</span></b><span class="muted">'+esc(c.detail)+'</span></div>').join('');
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
  const f=e.target.dataset.field;
  if(f&&f!=='current'){
    exp[f]=e.target.value;
    if(f==='role')updateDutySuggestions(exp,card);
    buildPreview();
  }
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
['cvName','cvTitle','cvEmail','cvPhone','cvLocation','cvLinkedin','cvSummary','cvEducation','cvSkills','jobDescription','importedText'].forEach(id=>$(id).addEventListener('input',()=>{clearTimeout(window.__sasTimer);window.__sasTimer=setTimeout(buildPreview,180)}));

renderExperiences();renderCerts();renderLanguages();buildPreview();
})();