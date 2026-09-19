import { getStore } from '@netlify/blobs';

const ALLOWED = new Set([
  'app_open','project_created','daily_report_created','punch_item_created',
  'punch_item_closed','pdf_exported','language_changed','backup_exported',
  'feedback_opened','feedback_submitted','tester_identified','daily_pdf_opened','email_prepared'
]);

const clean = (v, max=80) => typeof v === 'string' ? v.trim().slice(0,max) : '';

export default async (req, context) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  try {
    const body = await req.json();
    const event = clean(body.event, 40);
    const visitorId = clean(body.visitorId, 64);
    const sessionId = clean(body.sessionId, 64);
    if (!ALLOWED.has(event) || !visitorId || !sessionId) {
      return Response.json({ ok:false, error:'invalid_event' }, { status:400 });
    }

    const record = {
      event,
      visitorId,
      sessionId,
      ts: new Date().toISOString(),
      testerName: clean(body.testerName, 80),
      testerRole: clean(body.testerRole, 80),
      source: clean(body.source, 80),
      campaign: clean(body.campaign, 80),
      lang: clean(body.lang, 8),
      country: clean(context?.geo?.country?.code || '', 8)
    };

    const store = getStore('sitepulse-analytics');
    const key = `events/${Date.now()}-${crypto.randomUUID()}`;
    await store.setJSON(key, record);
    return Response.json({ ok:true });
  } catch (err) {
    console.error('analytics-event', err);
    return Response.json({ ok:false }, { status:500 });
  }
};
