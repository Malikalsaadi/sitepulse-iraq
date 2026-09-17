import { getStore } from '@netlify/blobs';
import { createHash } from 'node:crypto';

const ADMIN_KEY_SHA256 = '9c661d529237a4a076fc70a396bfbe6e9570f3604033c68f2ddf801f256e61f0';
const json = (data, status=200) => Response.json(data, { status, headers:{'Cache-Control':'no-store'} });
const hash = value => createHash('sha256').update(String(value || ''), 'utf8').digest('hex');

export default async (req) => {
  if (req.method !== 'GET') return new Response('Method not allowed', { status:405 });
  const supplied = req.headers.get('x-admin-key') || '';
  if (hash(supplied) !== ADMIN_KEY_SHA256) return json({ ok:false, error:'unauthorized' }, 401);

  try {
    const store = getStore('sitepulse-analytics');
    const { blobs } = await store.list({ prefix:'events/' });
    const recent = blobs.slice(-5000);
    const records = (await Promise.all(recent.map(b => store.get(b.key, { type:'json' })))).filter(Boolean);
    records.sort((a,b) => String(a.ts).localeCompare(String(b.ts)));

    const eventCounts = {};
    const visitorMap = new Map();
    const daily = {};
    for (const r of records) {
      eventCounts[r.event] = (eventCounts[r.event] || 0) + 1;
      const day = String(r.ts || '').slice(0,10) || 'unknown';
      daily[day] ||= { visitors:new Set(), events:0 };
      daily[day].visitors.add(r.visitorId);
      daily[day].events++;

      let v = visitorMap.get(r.visitorId);
      if (!v) {
        v = { visitorId:r.visitorId, testerName:'', testerRole:'', country:'', source:'', firstSeen:r.ts, lastSeen:r.ts, events:0, sessions:new Set(), counts:{} };
        visitorMap.set(r.visitorId, v);
      }
      v.lastSeen = r.ts;
      v.events++;
      v.sessions.add(r.sessionId);
      v.counts[r.event] = (v.counts[r.event] || 0) + 1;
      if (r.testerName) v.testerName = r.testerName;
      if (r.testerRole) v.testerRole = r.testerRole;
      if (r.country) v.country = r.country;
      if (r.source) v.source = r.source;
    }

    const visitors = [...visitorMap.values()].map(v => ({
      ...v,
      sessions:v.sessions.size,
      createdProjects:v.counts.project_created || 0,
      dailyReports:v.counts.daily_report_created || 0,
      punchItems:v.counts.punch_item_created || 0,
      closedPunch:v.counts.punch_item_closed || 0,
      pdfExports:v.counts.pdf_exported || 0,
      feedback:v.counts.feedback_submitted || 0
    })).sort((a,b) => String(b.lastSeen).localeCompare(String(a.lastSeen)));

    const dailySeries = Object.entries(daily).sort(([a],[b]) => a.localeCompare(b)).map(([date,d]) => ({ date, visitors:d.visitors.size, events:d.events }));
    const identified = visitors.filter(v => v.testerName).length;

    return json({
      ok:true,
      generatedAt:new Date().toISOString(),
      totals:{ visitors:visitors.length, identified, events:records.length, projects:eventCounts.project_created||0, reports:eventCounts.daily_report_created||0, punchItems:eventCounts.punch_item_created||0, pdfExports:eventCounts.pdf_exported||0, feedback:eventCounts.feedback_submitted||0 },
      eventCounts,
      daily:dailySeries,
      visitors
    });
  } catch (err) {
    console.error('analytics-summary', err);
    return json({ ok:false, error:'analytics_failed' }, 500);
  }
};
