(()=>{
  const SUPABASE_URL='https://pxqhkqgqvixopmxtoarv.supabase.co';
  const SUPABASE_KEY='sb_publishable_VgKWgWVH8OxxjL41KFS6pw_wFolkVxW';
  const LOCAL_KEY='sitepulse_v03';
  if(!window.supabase){console.error('Supabase SDK not loaded');return}
  const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  window.sitepulseSupabase=sb;
  const dash=document.getElementById('dashboard');
  if(!dash)return;
  const card=document.createElement('article');
  card.className='card'; card.id='cloudAccountCard'; card.style.marginTop='16px'; dash.appendChild(card);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const getLocal=()=>{try{return JSON.parse(localStorage.getItem(LOCAL_KEY)||'{}')}catch{return{}}};
  const msg=(text,type='')=>{const el=document.getElementById('cloudMsg');if(!el)return;el.textContent=text;el.style.display='block';el.style.borderColor=type==='error'?'#b84a4a':''};
  let session=null, workspace=null, membership=null;

  async function loadWorkspace(){
    workspace=null; membership=null;
    if(!session?.user)return;
    const mres=await sb.from('workspace_members').select('workspace_id,role').eq('user_id',session.user.id).limit(1).maybeSingle();
    if(mres.error){console.error(mres.error);return}
    if(!mres.data)return;
    membership=mres.data;
    const wres=await sb.from('workspaces').select('*').eq('id',membership.workspace_id).single();
    if(wres.error){console.error(wres.error);return}
    workspace=wres.data;
  }

  function render(){
    const email=session?.user?.email||'';
    if(!session){
      card.innerHTML=
        '<p class="kicker">SITEPULSE CLOUD • v0.4 ALPHA</p>'+
        '<h2>Cloud account / الحساب السحابي</h2>'+
        '<p class="muted">Sign in to start syncing SitePulse across devices. / سجل دخولك حتى نبدأ المزامنة بين الأجهزة.</p>'+
        '<div class="formgrid">'+
        '<label>Full name / الاسم<input id="cloudName" autocomplete="name"></label>'+
        '<label>Email / الإيميل<input id="cloudEmail" type="email" autocomplete="email"></label>'+
        '<label>Password / كلمة المرور<input id="cloudPassword" type="password" minlength="6" autocomplete="current-password"></label>'+
        '</div><div class="toolbar"><button id="cloudSignIn">Sign in / دخول</button>'+
        '<button id="cloudSignUp" class="secondary">Create account / إنشاء حساب</button></div>'+
        '<p id="cloudMsg" class="notice" style="display:none;margin-top:12px"></p>';
      document.getElementById('cloudSignIn').onclick=signIn;
      document.getElementById('cloudSignUp').onclick=signUp;
      return;
    }
    if(!workspace){
      card.innerHTML=
        '<p class="kicker">SITEPULSE CLOUD • v0.4 ALPHA</p><h2>Welcome / أهلاً</h2>'+
        '<p class="muted">Signed in as '+esc(email)+'</p>'+
        '<div class="formgrid"><label class="full">Company / Workspace name<input id="workspaceName" placeholder="Your company or team name"></label></div>'+
        '<div class="toolbar"><button id="createWorkspace">Create workspace / إنشاء مساحة عمل</button>'+
        '<button id="cloudSignOut" class="secondary">Sign out / خروج</button></div>'+
        '<p id="cloudMsg" class="notice" style="display:none;margin-top:12px"></p>';
      document.getElementById('createWorkspace').onclick=createWorkspace;
      document.getElementById('cloudSignOut').onclick=signOut;
      return;
    }
    const imported=!!workspace.legacy_import_completed_at;
    card.innerHTML=
      '<p class="kicker">SITEPULSE CLOUD • CONNECTED</p><h2>'+esc(workspace.name)+'</h2>'+
      '<p class="muted">'+esc(email)+' • '+esc(membership?.role||'member')+'</p>'+
      '<div class="stats" style="margin-top:12px">'+
      '<article><strong>✓</strong><span>Authentication</span></article>'+
      '<article><strong>✓</strong><span>Workspace</span></article>'+
      '<article><strong>'+(imported?'✓':'—')+'</strong><span>Local import</span></article></div>'+
      '<p class="notice">Cloud foundation is active. Existing screens still use local data while full live sync is being connected. / الأساس السحابي شغال، والواجهات الحالية تبقى محلية مؤقتاً إلى أن نكمل الربط المباشر.</p>'+
      '<div class="toolbar"><button id="cloudImport" '+(imported?'disabled':'')+'>'+
      (imported?'Local data imported / تم النقل':'Import this device data / نقل بيانات هذا الجهاز')+
      '</button><button id="cloudSignOut" class="secondary">Sign out / خروج</button></div>'+
      '<p id="cloudMsg" class="notice" style="display:none;margin-top:12px"></p>';
    document.getElementById('cloudSignOut').onclick=signOut;
    if(!imported)document.getElementById('cloudImport').onclick=importLocal;
  }

  async function refresh(){
    const result=await sb.auth.getSession();
    session=result.data.session;
    await loadWorkspace();
    render();
  }
  async function signUp(){
    const email=document.getElementById('cloudEmail').value.trim();
    const password=document.getElementById('cloudPassword').value;
    const full_name=document.getElementById('cloudName').value.trim();
    if(!email||password.length<6)return msg('Enter a valid email and password of at least 6 characters.','error');
    msg('Creating account...');
    const res=await sb.auth.signUp({email,password,options:{data:{full_name}}});
    if(res.error)return msg(res.error.message,'error');
    if(!res.data.session)msg('Account created. Check your email to confirm it, then sign in. / تم إنشاء الحساب، تأكد من الإيميل وبعدها سجل دخول.');
    else await refresh();
  }
  async function signIn(){
    const email=document.getElementById('cloudEmail').value.trim();
    const password=document.getElementById('cloudPassword').value;
    if(!email||!password)return msg('Enter email and password.','error');
    msg('Signing in...');
    const res=await sb.auth.signInWithPassword({email,password});
    if(res.error)return msg(res.error.message,'error');
    await refresh();
  }
  async function signOut(){await sb.auth.signOut();session=null;workspace=null;membership=null;render()}
  async function createWorkspace(){
    const name=document.getElementById('workspaceName').value.trim();
    if(!name)return msg('Enter a workspace name.','error');
    msg('Creating workspace...');
    const res=await sb.rpc('create_workspace',{workspace_name:name});
    if(res.error)return msg(res.error.message,'error');
    await refresh();
  }

  async function importLocal(){
    if(!session?.user||!workspace)return;
    const local=getLocal(), projects=Array.isArray(local.projects)?local.projects:[],
      daily=Array.isArray(local.daily)?local.daily:[], punch=Array.isArray(local.punch)?local.punch:[];
    if(!projects.length&&!daily.length&&!punch.length)return msg('No local SitePulse data found on this device. / ماكو بيانات محلية بهذا الجهاز.','error');

    const check=await sb.from('projects').select('id',{count:'exact',head:true}).eq('workspace_id',workspace.id);
    if(check.error)return msg(check.error.message,'error');
    if((check.count||0)>0)return msg('Cloud workspace already has project data, so import was stopped to prevent duplicates.','error');

    const btn=document.getElementById('cloudImport'); btn.disabled=true;
    msg('Importing local data to cloud... / جاري نقل البيانات للسحابة...');
    try{
      const userId=session.user.id, map={};
      for(const p of projects){
        const res=await sb.from('projects').insert({
          workspace_id:workspace.id,name:p.name||'Untitled project',client:p.client||null,
          location:p.location||null,project_code:p.code||null,notes:p.notes||null,created_by:userId
        }).select('id').single();
        if(res.error)throw res.error; map[p.id]=res.data.id;
      }
      for(const r of daily){
        if(!map[r.projectId])continue;
        const res=await sb.from('daily_reports').insert({
          workspace_id:workspace.id,project_id:map[r.projectId],
          report_date:r.date||new Date().toISOString().slice(0,10),shift:r.shift==='Night'?'Night':'Day',
          prepared_by:r.prepared||null,manpower:r.manpower===''||r.manpower==null?null:Number(r.manpower),
          equipment:r.equipment||null,work_completed:r.work||null,materials_deliveries:r.materials||null,
          issues_delays:r.issues||null,safety_ptw:r.safety||null,inspection_qaqc:r.inspection||null,
          next_plan:r.next||null,created_by:userId
        });
        if(res.error)throw res.error;
      }
      for(const x of punch){
        if(!map[x.projectId])continue;
        const res=await sb.from('punch_items').insert({
          workspace_id:workspace.id,project_id:map[x.projectId],
          status:['Open','In Progress','Closed'].includes(x.status)?x.status:'Open',
          priority:['Low','Medium','High'].includes(x.priority)?x.priority:'Medium',
          discipline:x.category||null,area_location:x.area||null,assigned_to:x.assigned||null,
          issue_description:x.desc||'Punch item',action_required:x.action||null,photo_url:null,created_by:userId
        });
        if(res.error)throw res.error;
      }
      const company=local.company||{};
      const upd=await sb.from('workspaces').update({
        company_name:company.name||null,prepared_default:company.prepared||null,
        logo_data:company.logo||null,legacy_import_completed_at:new Date().toISOString()
      }).eq('id',workspace.id);
      if(upd.error)throw upd.error;
      await loadWorkspace(); render();
      setTimeout(()=>msg('Import completed ✓ Projects, daily reports and punch items are now in the cloud. Punch photos stay local for this first migration.'),0);
    }catch(err){
      console.error(err); btn.disabled=false; msg('Import stopped: '+(err.message||'Unknown error'),'error');
    }
  }
  sb.auth.onAuthStateChange(()=>setTimeout(refresh,0));
  refresh();
})();