(()=>{
  const KEY='sitepulse_v03';
  const getState=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const list=document.getElementById('dailyList');
  const dailySection=document.getElementById('daily');
  if(!list||!dailySection)return;

  function projectName(state,id){return (state.projects||[]).find(p=>p.id===id)?.name||'Project'}

  function ensureToolbar(){
    let bar=document.getElementById('dailyPdfToolbar');
    if(bar)return bar;
    const card=list.closest('.card');
    if(!card)return null;
    bar=document.createElement('div');
    bar.id='dailyPdfToolbar';
    bar.className='toolbar';
    bar.style.margin='10px 0 14px';
    bar.innerHTML='<select id="dailyPdfSelect" style="min-width:220px"></select><button id="dailyPdfOpen" type="button">Print Daily PDF / طباعة PDF</button>';
    card.insertBefore(bar,list);
    document.getElementById('dailyPdfOpen').onclick=()=>{
      const id=document.getElementById('dailyPdfSelect').value;
      if(!id)return alert('Save a daily report first / احفظ تقرير يومي أولاً');
      window.open('/daily-report.html?id='+encodeURIComponent(id),'_blank','noopener');
      if(window.sitepulseTrack)window.sitepulseTrack('daily_pdf_opened');
    };
    return bar;
  }

  function refreshToolbar(){
    ensureToolbar();
    const select=document.getElementById('dailyPdfSelect');
    const btn=document.getElementById('dailyPdfOpen');
    if(!select||!btn)return;
    const state=getState();
    const reports=state.daily||[];
    const current=select.value;
    select.innerHTML=reports.length?reports.map(r=>`<option value="${esc(r.id)}">${esc(r.date||'')} • ${esc(projectName(state,r.projectId))} • ${esc(r.prepared||'')}</option>`).join(''):'<option value="">No saved daily reports / لا توجد تقارير محفوظة</option>';
    if(reports.some(r=>r.id===current))select.value=current;
    btn.disabled=!reports.length;
  }

  function enhanceItems(){
    const state=getState();
    const reports=(state.daily||[]).slice(0,30);
    [...list.querySelectorAll('.item')].forEach((item,i)=>{
      const r=reports[i]; if(!r)return;
      if(item.querySelector('[data-daily-pdf-button]'))return;
      const top=item.querySelector('.itemtop'); if(!top)return;
      const actions=document.createElement('div');
      actions.className='toolbar';
      const pdf=document.createElement('button');
      pdf.className='secondary'; pdf.type='button'; pdf.dataset.dailyPdfButton='1';
      pdf.textContent=document.documentElement.lang==='ar'?'طباعة PDF':'Daily PDF';
      pdf.onclick=()=>{
        window.open('/daily-report.html?id='+encodeURIComponent(r.id),'_blank','noopener');
        if(window.sitepulseTrack)window.sitepulseTrack('daily_pdf_opened');
      };
      actions.appendChild(pdf);
      const del=[...top.children].find(el=>el.tagName==='BUTTON');
      if(del)actions.appendChild(del);
      top.appendChild(actions);
    });
  }

  function refresh(){refreshToolbar();enhanceItems()}
  const observer=new MutationObserver(()=>setTimeout(refresh,0));
  observer.observe(list,{childList:true,subtree:true});
  window.addEventListener('storage',refresh);
  setTimeout(refresh,0);
})();
