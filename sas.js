(()=>{
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let lang='en';
let lastText='';

function notice(id,text,error=false){const el=$(id);el.textContent=text;el.style.display='block';el.style.borderColor=error?'#8a3838':''}
function val(id){return $(id).value.trim()}
function lines(s){return String(s||'').split(/\n+/).map(x=>x.trim()).filter(Boolean)}
function bullets(s){return lines(s).map(x=>'<li>'+esc(x.replace(/^[-•*]\s*/,''))+'</li>').join('')}
function section(title,html){return html?'<section><h2>'+esc(title)+'</h2>'+html+'</section>':''}

function buildPreview(){
  const data={
    name:val('cvName'),title:val('cvTitle'),email:val('cvEmail'),phone:val('cvPhone'),
    location:val('cvLocation'),linkedin:val('cvLinkedin'),summary:val('cvSummary'),
    experience:val('cvExperience'),education:val('cvEducation'),certs:val('cvCerts'),skills:val('cvSkills')
  };
  const contact=[data.email,data.phone,data.location,data.linkedin].filter(Boolean).map(esc).join(' • ');
  const exp=lines(data.experience).length?'<ul>'+bullets(data.experience)+'</ul>':'';
  const edu=lines(data.education).length?'<ul>'+bullets(data.education)+'</ul>':'';
  const cert=lines(data.certs).length?'<ul>'+bullets(data.certs)+'</ul>':'';
  const skills=lines(data.skills.replace(/,/g,'\n')).map(x=>'<span class="sas-skill">'+esc(x)+'</span>').join('');
  $('cvPreview').innerHTML=
    '<header><h1>'+esc(data.name||'Your Name')+'</h1><div class="headline">'+esc(data.title||'Professional Title')+'</div>'+
    '<div class="contact">'+(contact||'email • phone • location • LinkedIn')+'</div></header>'+
    section(lang==='ar'?'الملخص المهني':'Professional Summary',data.summary?'<p>'+esc(data.summary)+'</p>':'')+
    section(lang==='ar'?'الخبرة المهنية':'Professional Experience',exp)+
    section(lang==='ar'?'التعليم':'Education',edu)+
    section(lang==='ar'?'الشهادات':'Certifications',cert)+
    section(lang==='ar'?'المهارات':'Core Skills',skills?'<div class="sas-pill-list">'+skills+'</div>':'');
  return data;
}

function sourceText(){
  const fields=['cvName','cvTitle','cvSummary','cvExperience','cvEducation','cvCerts','cvSkills'].map(val).join('\n');
  return (val('importedText')+'\n'+fields).trim();
}
function keywordSet(s){return new Set(String(s||'').toLowerCase().match(/[a-z][a-z0-9+.#/-]{2,}|[\u0600-\u06ff]{3,}/g)||[])}
function runAts(){
  const text=sourceText();
  if(!text){notice('fileStatus','Add CV information or upload a CV first.',true);return}
  let score=100; const checks=[];
  const add=(ok,title,detail,penalty=0)=>{if(!ok)score-=penalty;checks.push({ok,title,detail})};
  const wordCount=text.split(/\s+/).filter(Boolean).length;
  add(wordCount>=250 && wordCount<=1200,'Length',wordCount+' words. '+(wordCount<250?'Too short for most experienced roles.':wordCount>1200?'Consider shortening it.':'Good working range.'),wordCount<250?12:wordCount>1200?8:0);
  add(/@/.test(text),'Email','A visible email helps ATS/contact parsing.',8);
  add(/\+?\d[\d\s()-]{7,}/.test(text),'Phone','A parseable phone number is recommended.',6);
  add(/experience|employment|work history|الخبر|العمل/i.test(text),'Experience section','Use a clear Experience heading.',10);
  add(/education|degree|university|تعليم|جامعة|شهادة جامعية/i.test(text),'Education section','Use a clear Education heading.',7);
  add(/skills|technical skills|core skills|مهارات/i.test(text),'Skills section','Use a clear Skills heading.',8);
  const weird=(text.match(/[★◆■►✓✔➤]/g)||[]).length;
  add(weird<8,'Simple formatting',weird<8?'Low use of decorative symbols.':'Too many decorative symbols can hurt parsing.',8);
  const contactTables=/\|.*\|/.test(text);
  add(!contactTables,'Plain-text structure',contactTables?'Heavy table-like text detected. Keep core information in simple sections.':'Text structure looks readable.',6);
  const jd=val('jobDescription');
  if(jd){
    const cv=keywordSet(text), job=keywordSet(jd);
    const stop=new Set(['the','and','with','for','this','that','from','your','you','are','our','have','will','job','role','work','all','into','who']);
    const keys=[...job].filter(k=>!stop.has(k)&&k.length>3);
    const hits=keys.filter(k=>cv.has(k));
    const ratio=keys.length?hits.length/keys.length:0;
    const match=Math.round(Math.min(100,ratio*170));
    add(match>=45,'Job keyword match','Estimated keyword overlap: '+match+'%. Use relevant wording naturally.',match>=45?0:12);
  } else checks.push({ok:true,title:'Job targeting',detail:'Optional: paste a job description for keyword matching.'});
  score=Math.max(0,Math.min(100,score));
  $('atsScore').textContent=score;
  $('atsResults').innerHTML=checks.map(c=>'<div class="sas-check '+(c.ok?'good':'warn')+'"><b>'+(c.ok?'✓ ':'⚠ ')+esc(c.title)+'</b><span class="muted">'+esc(c.detail)+'</span></div>').join('');
}

async function readPdf(file){
  const pdfjs=await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
  const buf=await file.arrayBuffer();
  const pdf=await pdfjs.getDocument({data:buf}).promise;
  let out='';
  for(let i=1;i<=Math.min(pdf.numPages,20);i++){
    const page=await pdf.getPage(i); const content=await page.getTextContent();
    out+=content.items.map(x=>x.str).join(' ')+'\n';
  }
  return out.trim();
}
async function readDocx(file){
  if(!window.mammoth)throw new Error('DOCX reader did not load.');
  const r=await window.mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});
  return r.value.trim();
}
async function readFile(){
  const file=$('cvFile').files[0];
  if(!file)return notice('fileStatus','Choose a PDF, DOCX or TXT file first.',true);
  notice('fileStatus','Reading '+file.name+' ...');
  try{
    let text='';
    const lower=file.name.toLowerCase();
    if(lower.endsWith('.pdf'))text=await readPdf(file);
    else if(lower.endsWith('.docx'))text=await readDocx(file);
    else text=await file.text();
    if(!text)throw new Error('No readable text was extracted. Scanned image-only PDFs need OCR.');
    lastText=text; $('importedText').value=text;
    notice('fileStatus','CV text extracted ✓ Run ATS Check, or use AI Improve to structure it.');
    runAts();
  }catch(e){notice('fileStatus','Could not read this file: '+e.message,true)}
}

async function aiImprove(){
  const payload={
    imported_text:val('importedText').slice(0,18000),
    target_job:val('jobDescription').slice(0,9000),
    fields:{
      name:val('cvName'),title:val('cvTitle'),email:val('cvEmail'),phone:val('cvPhone'),
      location:val('cvLocation'),linkedin:val('cvLinkedin'),summary:val('cvSummary'),
      experience:val('cvExperience'),education:val('cvEducation'),certifications:val('cvCerts'),skills:val('cvSkills')
    }
  };
  if(!payload.imported_text && !Object.values(payload.fields).some(Boolean))return notice('aiStatus','Add information or upload a CV first.',true);
  notice('aiStatus','AI is reviewing your CV...');
  $('aiImprove').disabled=true;
  try{
    const r=await fetch('/.netlify/functions/cv-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const data=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(data.error||'AI service is not configured yet.');
    const f=data.cv||{};
    if(f.name)$('cvName').value=f.name;
    if(f.title)$('cvTitle').value=f.title;
    if(f.email)$('cvEmail').value=f.email;
    if(f.phone)$('cvPhone').value=f.phone;
    if(f.location)$('cvLocation').value=f.location;
    if(f.linkedin)$('cvLinkedin').value=f.linkedin;
    if(f.summary)$('cvSummary').value=f.summary;
    if(Array.isArray(f.experience))$('cvExperience').value=f.experience.join('\n');
    else if(f.experience)$('cvExperience').value=f.experience;
    if(Array.isArray(f.education))$('cvEducation').value=f.education.join('\n');
    else if(f.education)$('cvEducation').value=f.education;
    if(Array.isArray(f.certifications))$('cvCerts').value=f.certifications.join('\n');
    else if(f.certifications)$('cvCerts').value=f.certifications;
    if(Array.isArray(f.skills))$('cvSkills').value=f.skills.join(', ');
    else if(f.skills)$('cvSkills').value=f.skills;
    buildPreview(); runAts();
    notice('aiStatus','AI improvement completed ✓ Review the content before sending it to employers.');
  }catch(e){notice('aiStatus',e.message,true)}
  finally{$('aiImprove').disabled=false}
}

function copyText(){
  const d=buildPreview();
  const text=[d.name,d.title,[d.email,d.phone,d.location,d.linkedin].filter(Boolean).join(' | '),'','PROFESSIONAL SUMMARY',d.summary,'','EXPERIENCE',d.experience,'','EDUCATION',d.education,'','CERTIFICATIONS',d.certs,'','SKILLS',d.skills].join('\n');
  navigator.clipboard.writeText(text).then(()=>notice('aiStatus','CV text copied ✓')).catch(()=>{});
}
function toggleLang(){
  lang=lang==='en'?'ar':'en'; document.documentElement.lang=lang; document.documentElement.dir=lang==='ar'?'rtl':'ltr';
  $('sasLang').textContent=lang==='en'?'العربية':'English';
  $('heroTitle').textContent=lang==='ar'?'أنشئ سيرة ذاتية احترافية ومتوافقة مع ATS':'Build a professional, ATS-friendly CV';
  $('heroSub').textContent=lang==='ar'?'أنشئ CV من الصفر أو ارفع سيرتك القديمة، افحص قابلية القراءة، حسّنها بالذكاء الاصطناعي وصدّر PDF مرتب.':'Create a CV from scratch or upload your old CV, check readability, improve it with AI, and export a clean PDF.';
  buildPreview();
}

$('readCv').onclick=readFile;
$('clearImported').onclick=()=>{$('importedText').value='';$('cvFile').value='';$('fileStatus').style.display='none'};
$('buildCv').onclick=()=>{buildPreview();runAts()};
$('runAts').onclick=runAts;
$('aiImprove').onclick=aiImprove;
$('printCv').onclick=()=>{buildPreview();window.print()};
$('copyCv').onclick=copyText;
$('sasLang').onclick=toggleLang;
['cvName','cvTitle','cvEmail','cvPhone','cvLocation','cvLinkedin','cvSummary','cvExperience','cvEducation','cvCerts','cvSkills'].forEach(id=>$(id).addEventListener('input',()=>{clearTimeout(window.__sasTimer);window.__sasTimer=setTimeout(buildPreview,250)}));
buildPreview();
})();