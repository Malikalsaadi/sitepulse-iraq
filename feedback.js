(()=>{
  const analyticsScript=document.createElement('script');
  analyticsScript.src='analytics.js';
  analyticsScript.async=true;
  document.head.appendChild(analyticsScript);

  const form=document.forms['sitepulse-feedback'];if(!form)return;
  const status=document.getElementById('feedbackStatus');
  const SUPABASE_URL='https://pxqhkqgqvixopmxtoarv.supabase.co'; const SUPABASE_KEY='sb_publishable_VgKWgWVH8OxxjL41KFS6pw_wFolkVxW';
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const btn=form.querySelector('button[type="submit"]'),old=btn.textContent;
    btn.disabled=true;btn.textContent='Sending... / جاري الإرسال...';
    if(status){status.textContent='';status.style.display='none'}
    try{
      const data=Object.fromEntries(new FormData(form).entries());
      const res=await fetch(SUPABASE_URL+'/rest/v1/feedback_entries',{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY,'Prefer':'return=minimal'},body:JSON.stringify({name:data.name||null,email:data.email||null,role:data.role||null,feedback_type:data.feedback_type||null,rating:data.rating||null,message:data.message||''})});
      if(!res.ok)throw new Error('HTTP '+res.status);
      form.reset();
      if(status){status.textContent='Feedback sent successfully ✅ / تم إرسال ملاحظتك بنجاح ✅';status.style.display='block'}
      window.dispatchEvent(new CustomEvent('sitepulse:feedback-sent'));
    }catch(err){
      console.error(err);
      if(status){status.textContent='Could not send feedback. Please try again. / تعذر إرسال الملاحظة، حاول مرة ثانية.';status.style.display='block'}
    }finally{btn.disabled=false;btn.textContent=old}
  });
})();
