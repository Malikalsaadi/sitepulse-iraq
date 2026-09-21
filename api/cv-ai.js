export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const key=process.env.OPENAI_API_KEY;
  if(!key) return res.status(503).json({error:'AI is ready in SAS, but OPENAI_API_KEY is not configured in Vercel yet.'});
  try{
    const body=req.body||{};
    const action=body.action||'generate_cv';
    const headers={Authorization:'Bearer '+key,'Content-Type':'application/json'};
    const model=process.env.OPENAI_MODEL||'gpt-5.6-terra';

    if(action==='suggest_duties'){
      const role=String(body.role||'').slice(0,160);
      const company=String(body.company||'').slice(0,160);
      const project=String(body.project||'').slice(0,240);
      const existing=Array.isArray(body.existing)?body.existing.slice(0,20):[];
      if(!role) return res.status(400).json({error:'Job title is required'});
      const instructions='You are a professional CV writer for engineering, construction, commissioning, QA/QC, maintenance and oil & gas roles. Suggest realistic, ATS-friendly responsibilities for the exact role provided. Never invent employer-specific facts, metrics, achievements, certifications or project scope. Return ONLY a valid JSON object with one key duties containing 6 concise responsibility strings. Avoid duplicating existing duties.';
      const input=JSON.stringify({role,company,project,existing});
      const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers,body:JSON.stringify({model,instructions,input,reasoning:{effort:'low'},max_output_tokens:1200})});
      const data=await r.json();
      if(!r.ok) return res.status(r.status).json({error:data?.error?.message||'AI request failed'});
      const text=(data.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n').trim();
      const cleaned=text.replace(/^\`\`\`json\s*/i,'').replace(/\`\`\`$/,'').trim();
      let parsed;try{parsed=JSON.parse(cleaned)}catch{return res.status(502).json({error:'AI returned unreadable duty suggestions'})}
      return res.status(200).json({ok:true,duties:Array.isArray(parsed.duties)?parsed.duties.slice(0,8):[]});
    }

    const safe={
      imported_text:String(body.imported_text||'').slice(0,18000),
      target_job:String(body.target_job||'').slice(0,9000),
      fields:body.fields||{}
    };
    const instructions='You are an expert professional CV writer and ATS optimization assistant. Build a polished English CV from the candidate information. Preserve factual accuracy: never invent employers, job titles, dates, projects, certifications, education, languages, skills, metrics, equipment, codes or achievements that the candidate did not provide. You may improve grammar, organization, professional vocabulary, action verbs and ATS keyword phrasing when supported by the candidate data. If an old CV is supplied, extract useful factual details from it and merge them with the structured fields. Tailor wording to the target job description when supplied, but do not add unsupported experience. Return ONLY valid JSON with this exact shape: {"name":"","title":"","email":"","phone":"","location":"","linkedin":"","summary":"","experience":[{"role":"","company":"","project":"","from":"","to":"","current":false,"duties":[""]}],"education":[""],"certifications":[""],"skills":[""],"languages":[{"language":"","level":""}]}. Keep duties concise, specific and professional. Prefer 4-7 strong duties per role. Summary should be 3-5 concise lines worth of text and ATS friendly.';
    const r=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',headers,
      body:JSON.stringify({model,instructions,input:'Candidate data:\n'+JSON.stringify(safe),reasoning:{effort:'low'},max_output_tokens:4500})
    });
    const data=await r.json();
    if(!r.ok) return res.status(r.status).json({error:data?.error?.message||'AI request failed'});
    const text=(data.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n').trim();
    const cleaned=text.replace(/^\`\`\`json\s*/i,'').replace(/\`\`\`$/,'').trim();
    let cv;try{cv=JSON.parse(cleaned)}catch{return res.status(502).json({error:'AI returned an unreadable CV draft. Please try again.'})}
    return res.status(200).json({ok:true,cv});
  }catch(e){
    console.error(e);
    return res.status(500).json({error:'AI CV service failed.'});
  }
}