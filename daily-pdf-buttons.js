(()=>{
  const KEY='sitepulse_v03';
  const getState=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}};
  const list=document.getElementById('dailyList');
  if(!list)return;

  function openPdf(id){
    window.open('/daily-report.html?id='+encodeURIComponent(id),'_blank','noopener');
    if(window.sitepulseTrack)window.sitepulseTrack('daily_pdf_opened');
  }

  function enhanceItems(){
    const state=getState();
    const reports=(state.daily||[]).slice(0,30);

    [...list.querySelectorAll('.item')].forEach((item,i)=>{
      const r=reports[i];
      if(!r)return;

      const oldTopButton=item.querySelector('[data-daily-pdf-button]');
      if(oldTopButton)oldTopButton.closest('.toolbar')?.remove();

      let row=item.querySelector('[data-daily-pdf-row]');
      if(!row){
        row=document.createElement('div');
        row.dataset.dailyPdfRow='1';
        row.style.marginTop='12px';
        row.style.paddingTop='12px';
        row.style.borderTop='1px solid var(--line)';

        const pdf=document.createElement('button');
        pdf.type='button';
        pdf.dataset.dailyPdfUnder='1';
        pdf.style.width='100%';
        pdf.style.display='block';
        pdf.style.padding='12px 16px';
        pdf.textContent=document.documentElement.lang==='ar'?'PDF • فتح وطباعة التقرير':'PDF • Open / Print report';
        pdf.onclick=()=>openPdf(r.id);

        row.appendChild(pdf);
        item.appendChild(row);
      }else{
        const pdf=row.querySelector('button');
        if(pdf){
          pdf.textContent=document.documentElement.lang==='ar'?'PDF • فتح وطباعة التقرير':'PDF • Open / Print report';
          pdf.onclick=()=>openPdf(r.id);
        }
      }
    });
  }

  function removeOldToolbar(){
    document.getElementById('dailyPdfToolbar')?.remove();
  }

  function refresh(){
    removeOldToolbar();
    enhanceItems();
  }

  const observer=new MutationObserver(()=>setTimeout(refresh,0));
  observer.observe(list,{childList:true,subtree:true});
  window.addEventListener('storage',refresh);
  document.getElementById('langBtn')?.addEventListener('click',()=>setTimeout(refresh,100));
  setTimeout(refresh,0);
})();
