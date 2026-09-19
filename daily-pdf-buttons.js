(()=>{
  const KEY='sitepulse_v03';
  const getState=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}};
  const list=document.getElementById('dailyList');
  if(!list)return;

  function openPdf(id){
    window.open('/daily-report.html?id='+encodeURIComponent(id),'_blank','noopener');
  }

  function enhance(){
    const state=getState();
    const reports=(state.daily||[]).slice(0,30);
    const items=[...list.querySelectorAll('.item')];

    items.forEach((item,i)=>{
      const r=reports[i];
      if(!r)return;

      let row=item.querySelector('[data-daily-pdf-row]');
      if(!row){
        row=document.createElement('div');
        row.dataset.dailyPdfRow='1';
        row.style.marginTop='10px';
        row.style.paddingTop='10px';
        row.style.borderTop='1px solid var(--line)';
        row.style.display='flex';
        row.style.gap='8px';
        row.style.alignItems='center';

        const pdf=document.createElement('button');
        pdf.type='button';
        pdf.dataset.dailyPdfButton='1';
        pdf.textContent=document.documentElement.lang==='ar'?'PDF':'PDF';
        pdf.style.background='var(--accent)';
        pdf.style.color='#06120b';
        pdf.style.fontWeight='900';
        pdf.style.minWidth='110px';
        pdf.style.padding='11px 18px';
        pdf.style.borderRadius='10px';
        pdf.onclick=()=>openPdf(r.id);

        const hint=document.createElement('small');
        hint.dataset.dailyPdfHint='1';
        hint.textContent=document.documentElement.lang==='ar'?'فتح التقرير وحفظه PDF':'Open report and save as PDF';

        row.appendChild(pdf);
        row.appendChild(hint);
        item.appendChild(row);
      }else{
        const pdf=row.querySelector('[data-daily-pdf-button]');
        const hint=row.querySelector('[data-daily-pdf-hint]');
        if(pdf)pdf.onclick=()=>openPdf(r.id);
        if(hint)hint.textContent=document.documentElement.lang==='ar'?'فتح التقرير وحفظه PDF':'Open report and save as PDF';
      }
    });
  }

  const observer=new MutationObserver(enhance);
  observer.observe(list,{childList:true});
  document.getElementById('langBtn')?.addEventListener('click',()=>setTimeout(enhance,100));
  enhance();
  setInterval(enhance,1200);
})();
