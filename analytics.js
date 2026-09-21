(()=>{
  const VISITOR_KEY='sp_visitor_id', PROFILE_KEY='sp_tester_profile', SOURCE_KEY='sp_source';
  const makeId=prefix=>prefix+'_'+(crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now().toString(36));
  let visitorId=localStorage.getItem(VISITOR_KEY); if(!visitorId){visitorId=makeId('v');localStorage.setItem(VISITOR_KEY,visitorId)}
  let sessionId=sessionStorage.getItem('sp_session_id'); if(!sessionId){sessionId=makeId('s');sessionStorage.setItem('sp_session_id',sessionId)}
  let profile={}; try{profile=JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}')}catch{}
  const params=new URLSearchParams(location.search);
  if(params.get('utm_source')||params.get('ref')) localStorage.setItem(SOURCE_KEY,JSON.stringify({source:(params.get('utm_source')||params.get('ref')||'').slice(0,80),campaign:(params.get('utm_campaign')||'').slice(0,80)}));
  let source={}; try{source=JSON.parse(localStorage.getItem(SOURCE_KEY)||'{}')}catch{}
  const currentLang=()=>document.documentElement.lang||'en';
  const payload=event=>({event,visitorId,sessionId,testerName:profile.name||'',testerRole:profile.role||'',source:source.source||'',campaign:source.campaign||'',lang:currentLang()});
  const SUPABASE_URL='https://pxqhkqgqvixopmxtoarv.supabase.co'; const SUPABASE_KEY='sb_publishable_VgKWgWVH8OxxjL41KFS6pw_wFolkVxW'; const track=event=>{const p=payload(event);return fetch(SUPABASE_URL+'/rest/v1/analytics_events',{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY,'Prefer':'return=minimal'},body:JSON.stringify({event:p.event,visitor_id:p.visitorId,session_id:p.sessionId,tester_name:p.testerName,tester_role:p.testerRole,source:p.source,campaign:p.campaign,lang:p.lang}),keepalive:true}).catch(()=>{})};
  window.sitepulseTrack=track;

  const getState=()=>{try{return JSON.parse(localStorage.getItem('sitepulse_v03')||'{}')}catch{return{}}};
  const watchIncrease=(field,before,event,tries=20)=>{let n=0;const t=setInterval(()=>{const after=(getState()[field]||[]).length;if(after>before){clearInterval(t);track(event)}else if(++n>=tries)clearInterval(t)},250)};

  const addIdentityCard=()=>{
    const dash=document.getElementById('dashboard'); if(!dash||document.getElementById('betaIdentity'))return;
    const card=document.createElement('article'); card.className='card'; card.id='betaIdentity';
    card.innerHTML='<p class="kicker">BETA TESTER</p><h3>Identify yourself (optional) / عرّف نفسك (اختياري)</h3><p class="muted">This helps us understand who is testing SitePulse. Leave blank to stay anonymous. / يساعدنا نعرف من يجرب البرنامج. اتركه فارغاً إذا تريد تبقى مجهول.</p><div class="formgrid"><label>Name / الاسم<input id="testerName" maxlength="80"></label><label>Role / الوظيفة<input id="testerRole" maxlength="80" placeholder="Supervisor / QA-QC / Technician"></label></div><button id="saveTesterIdentity">Save / حفظ</button><small style="margin-top:10px">We track usage events only, not project names, client names, report text, or photos. / نسجل أحداث الاستخدام فقط، مو أسماء المشاريع أو العملاء أو نص التقارير أو الصور.</small>';
    dash.appendChild(card);
    document.getElementById('testerName').value=profile.name||''; document.getElementById('testerRole').value=profile.role||'';
    document.getElementById('saveTesterIdentity').onclick=()=>{profile={name:document.getElementById('testerName').value.trim().slice(0,80),role:document.getElementById('testerRole').value.trim().slice(0,80)};localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));track('tester_identified');alert('Saved / تم الحفظ')};
  };

  const bind=()=>{
    const versionNode=[...document.querySelectorAll('header small')].find(x=>x.textContent.includes('MVP v0.3.3')); if(versionNode)versionNode.innerHTML=versionNode.innerHTML.replace('MVP v0.3.3','MVP v0.3.4');
    addIdentityCard();
    const p=document.getElementById('addProject'); if(p)p.addEventListener('click',()=>watchIncrease('projects',(getState().projects||[]).length,'project_created'),true);
    const d=document.getElementById('saveDaily'); if(d)d.addEventListener('click',()=>watchIncrease('daily',(getState().daily||[]).length,'daily_report_created'),true);
    const i=document.getElementById('addPunch'); if(i)i.addEventListener('click',()=>watchIncrease('punch',(getState().punch||[]).length,'punch_item_created',30),true);
    const pdf=document.getElementById('printReport'); if(pdf)pdf.addEventListener('click',()=>track('pdf_exported'));
    const lang=document.getElementById('langBtn'); if(lang)lang.addEventListener('click',()=>setTimeout(()=>track('language_changed'),50));
    const backup=document.getElementById('backupBtn'); if(backup)backup.addEventListener('click',()=>track('backup_exported'));
    document.querySelectorAll('#nav button').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.view==='feedback')track('feedback_opened')}));
    if(typeof window.setStatus==='function'){
      const original=window.setStatus;
      window.setStatus=(id,status)=>{const state=getState();const before=(state.punch||[]).find(x=>x.id===id)?.status;original(id,status);if(status==='Closed'&&before!=='Closed')track('punch_item_closed')};
    }
    window.addEventListener('sitepulse:feedback-sent',()=>track('feedback_submitted'));
    track('app_open');
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
