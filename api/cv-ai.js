export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const key=process.env.OPENAI_API_KEY;
  if(!key) return res.status(503).json({error:'AI is ready in SAS, but OPENAI_API_KEY is not configured in Vercel yet.'});
  try{
    const body=req.body||{};
    const safe={
      imported_text:String(body.imported_text||'').slice(0,18000),
      target_job:String(body.target_job||'').slice(0,9000),
      fields:body.fields||{}
    };
    const instructions='You are an expert CV writer and ATS optimization assistant. Preserve factual accuracy. Never invent jobs, dates, degrees, certifications, metrics, employers, responsibilities, or contact details. Improve clarity, grammar, achievement-oriented phrasing and ATS readability. If data is missing, leave it empty. Return ONLY valid JSON with keys: name,title,email,phone,location,linkedin,summary,experience,education,certifications,skills. experience, education, certifications and skills must be arrays of concise strings. Tailor wording to the target job when supplied, but do not add skills the candidate did not provide.';
    const r=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},
      body:JSON.stringify({
        model:process.env.OPENAI_MODEL||'gpt-5.6-terra',
        instructions,
        input:'Candidate data:\n'+JSON.stringify(safe),
        reasoning:{effort:'low'},
        max_output_tokens:3500
      })
    });
    const data=await r.json();
    if(!r.ok) return res.status(r.status).json({error:data?.error?.message||'AI request failed'});
    const text=(data.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n').trim();
    const cleaned=text.replace(/^```json\s*/i,'').replace(/```$/,'').trim();
    let cv; try{cv=JSON.parse(cleaned)}catch{return res.status(502).json({error:'AI returned an unreadable draft. Please try again.'})}
    return res.status(200).json({ok:true,cv});
  }catch(e){
    console.error(e);
    return res.status(500).json({error:'AI CV service failed.'});
  }
}