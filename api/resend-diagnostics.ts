/* eslint-env node */
/* global Buffer */
import { isAllowedRequestOrigin } from '../server/origin.js';
import { getResendClient, getResendEnv } from '../server/resend.js';

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function parseBody(req, fallbackBody) {
  if (fallbackBody) return Promise.resolve(fallbackBody);
  return new Promise(async (resolve, reject) => {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
    } catch (err) {
      reject(err);
    }
  });
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  if (!isAllowedRequestOrigin(req)) {
    return json(res, 403, { ok: false, error: 'Forbidden' });
  }

  const resendEnv = getResendEnv();
  const base = {
    ok: resendEnv.missing.length === 0,
    vercel: {
      env: String(process.env.VERCEL_ENV || '').trim() || null,
      url: String(process.env.VERCEL_URL || '').trim() || null,
      gitCommitRef: String(process.env.VERCEL_GIT_COMMIT_REF || '').trim() || null,
    },
    resend: {
      apiKeyPresent: !!resendEnv.apiKey,
      fromEmailPresent: !!resendEnv.fromEmail,
      ownerEmailPresent: !!resendEnv.ownerEmail,
      missing: resendEnv.missing,
      fromEmailPreview: resendEnv.fromEmail
        ? `${resendEnv.fromEmail.slice(0, 4)}...${resendEnv.fromEmail.slice(-4)}`
        : null,
      ownerEmailPreview: resendEnv.ownerEmail
        ? `${resendEnv.ownerEmail.slice(0, 3)}...${resendEnv.ownerEmail.slice(-8)}`
        : null,
    },
  };

  if (req.method === 'GET') {
    return json(res, 200, {
      ...base,
      note: 'Use POST with {"sendTest":true,"to":"you@example.com"} to attempt a test email.',
    });
  }

  if (resendEnv.missing.length) {
    return json(res, 500, {
      ...base,
      ok: false,
      error: 'Resend is not configured',
    });
  }

  let body;
  try {
    body = await parseBody(req, req.body);
  } catch {
    return json(res, 400, { ok: false, error: 'Invalid JSON' });
  }

  const sendTest = body?.sendTest === true;
  const to = String(body?.to || resendEnv.ownerEmail || '').trim();
  if (!sendTest) {
    return json(res, 400, {
      ...base,
      ok: false,
      error: 'sendTest must be true in POST body',
    });
  }
  if (!to) {
    return json(res, 400, {
      ...base,
      ok: false,
      error: 'Missing destination email. Provide body.to or STUDIO_NOTIFICATION_EMAIL.',
    });
  }

  try {
    const resend = getResendClient(resendEnv.apiKey);
    const result = await resend.emails.send({
      from: resendEnv.fromEmail,
      to,
      subject: 'Spiral Resend diagnostics',
      text: 'This is a diagnostics email from Spiral deployment.',
      html: '<p>This is a diagnostics email from <b>Spiral</b> deployment.</p>',
    });
    return json(res, 200, {
      ...base,
      ok: true,
      sent: true,
      test: {
        to,
        id: result?.data?.id || null,
        error: result?.error || null,
      },
    });
  } catch (e) {
    return json(res, 500, {
      ...base,
      ok: false,
      sent: false,
      error: 'Resend test send failed',
      details: String(e?.message || e),
      name: String(e?.name || ''),
      statusCode: Number(e?.statusCode || 0) || null,
      response: e?.response || null,
    });
  }
}
