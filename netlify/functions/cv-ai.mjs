export default async (req) => {
  if (req.method !== 'POST') return Response.json({error:'Method not allowed'},{status:405});
  const key=process.env.OPENAI_API_KEY;
  if(!key) return Response.json({error:'AI is ready in SAS, but the server AI key has not been configured yet.'},{status:503});
  try{
    const body=await req.json();
    const safe={
      imported_text:String(body.imported_text||'').slice(0,18000),
      target_job:String(body.target_job||'').slice(0,9000),
      fields:body.fields||{}
    };
    const instructions='You are an expert CV writer and ATS optimization assistant. Preserve factual accuracy. Never invent jobs, dates, degrees, certifications, metrics, employers, responsibilities, or contact details. Improve clarity, grammar, achievement-oriented phrasing and ATS readability. If data is missing, leave it empty. Return ONLY valid JSON with keys: name,title,email,phone,location,linkedin,summary,experience,education,certifications,skills. experience, education, certifications and skills must be arrays of concise strings. Tailor wording to the target job when supplied, but do not add skills the candidate did not provide.';
    const input='Candidate data:\n'+JSON.stringify(safe);
    const r=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json'},
      body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-5.6-terra',instructions,input,reasoning:{effort:'low'},max_output_tokens:3500})
    });
    const data=await r.json();
    if(!r.ok) return Response.json({error:data?.error?.message||'AI request failed'},{status:r.status});
    const text=(data.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n').trim();
    const cleaned=text.replace(/^\`\`\`json\s*/i,'').replace(/\`\`\`$/,'').trim();
    let cv; try{cv=JSON.parse(cleaned)}catch{return Response.json({error:'AI returned an unreadable draft. Please try again.'},{status:502})}
    return Response.json({ok:true,cv});
  }catch(e){
    console.error('cv-ai',e);
    return Response.json({error:'AI CV service failed.'},{status:500});
  }
};