(()=>{
  const $=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const fmt=t=>t?new Date(t).toLocaleString():'—';
  $('adminKey').value=sessionStorage.getItem('sp_admin_key')||'';
  $('loadAnalytics').onclick=async()=>{
    const key=$('adminKey').value.trim(), status=$('analyticsStatus');
    status.style.display='block'; status.textContent='Loading...';
    try{
      const r=await fetch('/.netlify/functions/analytics-summary',{headers:{'X-Admin-Key':key}});
      const data=await r.json();
      if(!r.ok)throw new Error(data.error||('HTTP '+r.status));
      sessionStorage.setItem('sp_admin_key',key);
      $('aVisitors').textContent=data.totals.visitors;
      $('aProjects').textContent=data.totals.projects;
      $('aPunch').textContent=data.totals.punchItems;
      $('aReports').textContent=data.totals.reports;
      $('aPdf').textContent=data.totals.pdfExports;
      $('aFeedback').textContent=data.totals.feedback;
      const rows=data.visitors.map(v=>`<tr><td>${esc(v.testerName||('Anonymous '+v.visitorId.slice(-6)))}</td><td>${esc(v.testerRole||'—')}</td><td>${esc(v.country||'—')}</td><td>${v.sessions}</td><td>${v.createdProjects}</td><td>${v.dailyReports}</td><td>${v.punchItems}</td><td>${v.pdfExports}</td><td>${fmt(v.lastSeen)}</td></tr>`).join('');
      $('visitorTable').innerHTML=`<table><thead><tr><th>Tester</th><th>Role</th><th>Country</th><th>Sessions</th><th>Projects</th><th>Reports</th><th>Punch</th><th>PDF</th><th>Last seen</th></tr></thead><tbody>${rows||'<tr><td colspan="9">No activity yet.</td></tr>'}</tbody></table>`;
      $('eventTotals').innerHTML=Object.entries(data.eventCounts).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="item"><div class="itemtop"><b>${esc(k)}</b><strong>${v}</strong></div></div>`).join('')||'<p class="muted">No events yet.</p>';
      status.textContent=`Updated ${fmt(data.generatedAt)} • ${data.totals.identified} identified testers`;
    }catch(e){
      console.error(e);
      status.textContent=e.message==='unauthorized'?'Wrong admin key.':'Could not load analytics: '+e.message;
    }
  };
})();
