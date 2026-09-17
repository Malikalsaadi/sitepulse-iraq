(()=>{
  const KEY='sitepulse_v03';
  const getState=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}};
  const list=document.getElementById('dailyList');
  if(!list)return;
  function enhance(){
    const state=getState();
    const reports=(state.daily||[]).slice(0,30);
    [...list.querySelectorAll('.item')].forEach((item,i)=>{
      if(item.dataset.dailyPdfReady==='1')return;
      const r=reports[i]; if(!r)return;
      const top=item.querySelector('.itemtop'); if(!top)return;
      const existingDelete=[...top.children].find(el=>el.tagName==='BUTTON');
      const actions=document.createElement('div'); actions.className='toolbar';
      const pdf=document.createElement('button'); pdf.className='secondary'; pdf.type='button';
      pdf.textContent=document.documentElement.lang==='ar'?'PDF للتقرير':'Daily PDF';
      pdf.onclick=()=>window.open('/daily-report.html?id='+encodeURIComponent(r.id),'_blank','noopener');
      actions.appendChild(pdf);
      if(existingDelete)actions.appendChild(existingDelete);
      top.appendChild(actions);
      item.dataset.dailyPdfReady='1';
    });
  }
  const observer=new MutationObserver(()=>enhance());
  observer.observe(list,{childList:true,subtree:true});
  enhance();
})();
